// ==UserScript==
// @name         YouTube Speed + CDN (Status Bar)
// @namespace    https://github.com/ZiPenOk/scripts
// @version      1.0.2
// @description  在 YouTube 视频播放器的右下角工具栏，实时显示当前的视频下载速度以及提供视频流的服务器（CDN）所在的国家或地区。
// @author       wya (ZiPenOk 修复)
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @match        https://music.youtube.com/*
// @match        https://youtu.be/*
// @run-at       document-start
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @connect      dns.google
// @connect      cloudflare-dns.com
// @connect      dns.quad9.net
// @connect      ipapi.co
// @connect      ipwho.is
// @connect      ip-api.com
// @connect      ipwhois.app
// @connect      ipinfo.io
// @downloadURL  https://github.com/ZiPenOk/scripts/raw/refs/heads/main/youtube_tool.js
// @updateURL    https://github.com/ZiPenOk/scripts/raw/refs/heads/main/youtube_tool.js
// ==/UserScript==

(() => {
  "use strict";

  const SPEED_ID = "yt-speed-mbs-widget";
  const CDN_ID = "yt-cdn-cc-widget";
  const UPDATE_MS = 1000;
  const ROUTE_POLL_MS = 400;
  const GEO_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
  const HOST_CACHE_TTL_MS = 10 * 60 * 1000;
  const DEBUG = new URL(location.href).searchParams.get("yt_speed_debug") === "1";

  const DEFAULTS = {
    showSpeed: true,
    showCdn: true,
    countryLang: "zh",
    probeLevel: "balanced",
    diagMode: false,
    geoToken: ""
  };

  const LAST_RESOLVE = new Map();
  let SETTINGS = { ...DEFAULTS };
  let settingsLoaded = false;
  let lastSpeedText = "0.00 MB/s";
  let lastGoodAt = 0;
  let pageScriptInjected = false;
  let active = false;
  let lastRouteKey = "";
  let lastCdnText = "...";
  let lastCdnOk = "";
  let cdnState = {};
  let resolveQueue = Promise.resolve();

  const COUNTRY_ZH = {
    JP: "日本",
    US: "美国",
    DE: "德国",
    SG: "新加坡",
    HK: "香港",
    TW: "台湾",
    KR: "韩国",
    GB: "英国",
    FR: "法国",
    NL: "荷兰",
    CA: "加拿大",
    AU: "澳大利亚",
    IN: "印度",
    BR: "巴西",
    MX: "墨西哥",
    ES: "西班牙",
    IT: "意大利",
    SE: "瑞典",
    NO: "挪威",
    FI: "芬兰",
    DK: "丹麦",
    PL: "波兰",
    TR: "土耳其",
    RU: "俄罗斯",
    UA: "乌克兰",
    ID: "印度尼西亚",
    TH: "泰国",
    VN: "越南",
    PH: "菲律宾",
    MY: "马来西亚",
    AR: "阿根廷",
    CL: "智利",
    ZA: "南非",
    AE: "阿联酋",
    SA: "沙特",
    IL: "以色列"
  };

  function log(...args) {
    if (DEBUG) console.log("[YT Speed+CDN]", ...args);
  }

  function $(sel, root = document) {
    try {
      return root.querySelector(sel);
    } catch {
      return null;
    }
  }

  function gmGet(key, fallback) {
    try {
      const value = GM_getValue(key);
      return value === undefined ? fallback : value;
    } catch {
      return fallback;
    }
  }

  function gmSet(key, value) {
    try {
      GM_setValue(key, value);
    } catch {}
  }

  function gmDelete(key) {
    try {
      GM_deleteValue(key);
    } catch {}
  }

  function loadSettings() {
    SETTINGS = { ...DEFAULTS, ...(gmGet("settings", {}) || {}) };
    settingsLoaded = true;
  }

  function saveSettings(patch) {
    SETTINGS = { ...DEFAULTS, ...SETTINGS, ...patch };
    gmSet("settings", SETTINGS);
    ensureWidgetsMounted();
    renderCdnState(cdnState);
  }

  function resetSettings() {
    SETTINGS = { ...DEFAULTS };
    gmSet("settings", SETTINGS);
    ensureWidgetsMounted();
    renderCdnState(cdnState);
  }

  function countryCodeToZh(code) {
    const c = (code || "").toString().trim().toUpperCase();
    return COUNTRY_ZH[c] || c || "未知";
  }

  function isTargetRoute() {
    const path = location.pathname || "";
    return path === "/watch" || path.startsWith("/shorts");
  }

  function playerRoot() {
    return document.getElementById("movie_player")
      || $("ytd-player #movie_player")
      || $("#movie_player");
  }

  function getRightControls() {
    return $(".ytp-right-controls");
  }

  function findMountPoint() {
    const right = getRightControls();
    if (right) return { el: right, mode: "controls" };

    const controls = $(".ytp-chrome-controls") || $(".ytp-chrome-bottom");
    if (controls) return { el: controls, mode: "controls-fallback" };

    const pr = playerRoot();
    if (pr) return { el: pr, mode: "overlay" };

    return null;
  }

  function createBaseWidget(id, label, text) {
    const el = document.createElement("span");
    el.id = id;
    el.textContent = text;
    el.setAttribute("aria-label", label);
    el.style.cssText = `
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      line-height: 1;
      color: #fff;
      user-select: none;
      pointer-events: none;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      box-sizing: border-box;
      text-shadow: none;
    `;
    return el;
  }

  function createSpeedWidget(mode) {
    const el = createBaseWidget(SPEED_ID, "Connection speed (MB/s)", lastSpeedText);

    if (mode === "controls" || mode === "controls-fallback") {
      el.style.height = "100%";
      el.style.marginRight = "6px";
      el.style.padding = "0 4px";
    } else {
      el.style.position = "absolute";
      el.style.right = "12px";
      el.style.bottom = "54px";
      el.style.zIndex = "999999";
      el.style.padding = "0";
      el.style.textShadow = "0 1px 2px rgba(0,0,0,0.6)";
    }

    return el;
  }

  function createCdnWidget(mode) {
    const el = createBaseWidget(CDN_ID, "YouTube CDN country code", lastCdnText);
    el.style.background = "transparent";
    el.style.minWidth = "44px";
    el.style.textAlign = "right";

    if (mode === "controls" || mode === "controls-fallback") {
      el.style.height = "100%";
      el.style.marginRight = "6px";
      el.style.padding = "0";
    } else {
      el.style.position = "absolute";
      el.style.right = "92px";
      el.style.bottom = "54px";
      el.style.zIndex = "999999";
      el.style.padding = "0";
      el.style.textShadow = "0 1px 2px rgba(0,0,0,0.6)";
    }

    return el;
  }

  function ensureWidgetsMounted() {
    if (!active) return { speed: null, cdn: null };

    const mp = findMountPoint();
    if (!mp) return { speed: null, cdn: null };

    let speed = document.getElementById(SPEED_ID);
    let cdn = document.getElementById(CDN_ID);

    if (!SETTINGS.showSpeed && speed) {
      speed.remove();
      speed = null;
    }
    if (!SETTINGS.showCdn && cdn) {
      cdn.remove();
      cdn = null;
    }

    if (SETTINGS.showSpeed && !speed) {
      speed = createSpeedWidget(mp.mode);
      mp.el.insertBefore(speed, mp.el.firstElementChild || mp.el.firstChild);
      log("speed widget mounted:", mp.mode);
    }

    if (SETTINGS.showCdn && !cdn) {
      cdn = createCdnWidget(mp.mode);
      mp.el.insertBefore(cdn, mp.el.firstElementChild || mp.el.firstChild);
      log("cdn widget mounted:", mp.mode);
    }

    const right = getRightControls();
    if (right) {
      const first = right.firstElementChild;

      if (SETTINGS.showSpeed && speed) {
        if (speed.parentElement !== right) right.insertBefore(speed, first);
        else if (first !== speed) right.insertBefore(speed, first);
      }

      if (SETTINGS.showCdn && cdn) {
        const anchor = SETTINGS.showSpeed && speed ? speed.nextSibling : right.firstElementChild;
        if (cdn.parentElement !== right) right.insertBefore(cdn, anchor);
        else if (SETTINGS.showSpeed && speed) {
          if (cdn.previousSibling !== speed) right.insertBefore(cdn, speed.nextSibling);
        } else if (right.firstElementChild !== cdn) {
          right.insertBefore(cdn, right.firstElementChild);
        }
      }
    }

    return { speed, cdn };
  }

  function removeWidgets() {
    document.getElementById(SPEED_ID)?.remove();
    document.getElementById(CDN_ID)?.remove();
  }

  function setSpeedText(text) {
    if (!SETTINGS.showSpeed) return;
    lastSpeedText = text;
    const w = document.getElementById(SPEED_ID) || ensureWidgetsMounted().speed;
    if (w && w.textContent !== text) w.textContent = text;
  }

  function setCdnText(text, isOk = false) {
    if (!SETTINGS.showCdn) return;
    lastCdnText = text;
    if (isOk) lastCdnOk = text;
    const w = document.getElementById(CDN_ID) || ensureWidgetsMounted().cdn;
    if (w && w.textContent !== text) w.textContent = text;
    if (w) w.style.opacity = isOk ? "1" : "0.9";
  }

  function renderCdnState(state = {}) {
    cdnState = state;
    const status = state.status || "";

    if (status === "ok") {
      const code = (state.countryCode || "??").toString().trim().toUpperCase();
      const display = SETTINGS.countryLang === "zh" ? countryCodeToZh(code || "??") : (code || "??");
      setCdnText(display, true);
      return;
    }

    if (!SETTINGS.diagMode) {
      if (lastCdnOk) setCdnText(lastCdnOk, true);
      else setCdnText("...", false);
      return;
    }

    if (status === "dns" || status === "resolving" || status === "doh_failed") {
      setCdnText("DNS", false);
      return;
    }
    if (status === "geo" || status === "geo_failed") {
      setCdnText("GEO", false);
      return;
    }
    if (status === "unknown") {
      setCdnText("UNK", false);
      return;
    }
    setCdnText("...", false);
  }

  function withTimeout(ms) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), ms);
    return { signal: ac.signal, cancel: () => clearTimeout(timer) };
  }

  function gmRequestJson(url, options = {}) {
    return new Promise((resolve, reject) => {
      if (typeof GM_xmlhttpRequest !== "function") {
        reject(new Error("GM_xmlhttpRequest is unavailable"));
        return;
      }

      let finished = false;
      const timeout = options.timeout || 3000;
      const timer = setTimeout(() => {
        if (finished) return;
        finished = true;
        reject(new Error("request timeout"));
      }, timeout + 250);

      try {
        GM_xmlhttpRequest({
          method: "GET",
          url,
          headers: options.headers || {},
          timeout,
          responseType: "json",
          onload: (resp) => {
            if (finished) return;
            finished = true;
            clearTimeout(timer);
            if (resp.status < 200 || resp.status >= 300) {
              reject(new Error(`HTTP ${resp.status}`));
              return;
            }

            if (resp.response && typeof resp.response === "object") {
              resolve(resp.response);
              return;
            }

            try {
              resolve(JSON.parse(resp.responseText || "null"));
            } catch (error) {
              reject(error);
            }
          },
          ontimeout: () => {
            if (finished) return;
            finished = true;
            clearTimeout(timer);
            reject(new Error("request timeout"));
          },
          onerror: () => {
            if (finished) return;
            finished = true;
            clearTimeout(timer);
            reject(new Error("request failed"));
          }
        });
      } catch (error) {
        if (!finished) {
          finished = true;
          clearTimeout(timer);
        }
        reject(error);
      }
    });
  }

  async function dohResolve(host, ttlMs) {
    if (!host) return "";
    const key = `host_${host}`;
    const cached = gmGet(key, null);
    if (cached && Date.now() - cached.ts < (ttlMs ?? HOST_CACHE_TTL_MS)) return cached.ip || "";

    const providers = [
      {
        name: "google",
        url: `https://dns.google/resolve?name=${encodeURIComponent(host)}&type=A`,
        headers: {},
        parse: (data) => {
          const ans = Array.isArray(data?.Answer) ? data.Answer : [];
          const a = ans.find((x) => x?.type === 1 && typeof x?.data === "string");
          return a?.data || "";
        }
      },
      {
        name: "cloudflare",
        url: `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=A`,
        headers: { accept: "application/dns-json" },
        parse: (data) => {
          const ans = Array.isArray(data?.Answer) ? data.Answer : [];
          const a = ans.find((x) => x?.type === 1 && typeof x?.data === "string");
          return a?.data || "";
        }
      },
      {
        name: "quad9",
        url: `https://dns.quad9.net/dns-query?name=${encodeURIComponent(host)}&type=A`,
        headers: { accept: "application/dns-json" },
        parse: (data) => {
          const ans = Array.isArray(data?.Answer) ? data.Answer : [];
          const a = ans.find((x) => x?.type === 1 && typeof x?.data === "string");
          return a?.data || "";
        }
      }
    ];

    for (const provider of providers) {
      try {
        const data = await gmRequestJson(provider.url, { headers: provider.headers, timeout: 2500 });
        const ip = provider.parse(data);
        if (ip) {
          gmSet(key, { ts: Date.now(), ip, provider: provider.name });
          return ip;
        }
      } catch {}
    }

    return "";
  }

  async function geoLookup(ip, ttlMs) {
    if (!ip) return null;
    const key = `geo_${ip}`;
    const cached = gmGet(key, null);
    if (cached && Date.now() - cached.ts < (ttlMs ?? GEO_CACHE_TTL_MS)) return cached.data;

    const token = (SETTINGS.geoToken || "").trim();
    const providers = [];
    if (token) {
      providers.push({
        name: "ipinfo",
        url: `https://ipinfo.io/${encodeURIComponent(ip)}/json?token=${encodeURIComponent(token)}`,
        parse: (data) => ({ countryName: data?.country || "", countryCode: data?.country || "" })
      });
    }

    providers.push(
      {
        name: "ipapi",
        url: `https://ipapi.co/${encodeURIComponent(ip)}/json/`,
        parse: (data) => ({ countryName: data?.country_name || "", countryCode: data?.country || "" })
      },
      {
        name: "ipwho",
        url: `https://ipwho.is/${encodeURIComponent(ip)}`,
        parse: (data) => ({ countryName: data?.country || "", countryCode: data?.country_code || "" })
      },
      {
        name: "ip-api",
        url: `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode`,
        parse: (data) => data?.status === "success"
          ? { countryName: data?.country || "", countryCode: data?.countryCode || "" }
          : { countryName: "", countryCode: "" }
      },
      {
        name: "ipwhois",
        url: `https://ipwhois.app/json/${encodeURIComponent(ip)}`,
        parse: (data) => data?.success !== false
          ? { countryName: data?.country || "", countryCode: data?.country_code || "" }
          : { countryName: "", countryCode: "" }
      }
    );

    for (const provider of providers) {
      try {
        const data = await gmRequestJson(provider.url, { timeout: 3000 });
        const out = provider.parse(data);
        if (out?.countryName) {
          const result = { ...out, provider: provider.name };
          gmSet(key, { ts: Date.now(), data: result });
          return result;
        }
      } catch {}
    }

    return null;
  }

  function hostFromUrl(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  }

  async function resolvePipeline(url) {
    const host = hostFromUrl(url);
    if (!host || !host.includes("googlevideo.com")) return;

    const level = SETTINGS.probeLevel || "balanced";
    const cooldownMs = level === "low" ? 1500 : level === "high" ? 250 : 600;
    const hostTtlMs = level === "low" ? 10 * 60 * 1000 : level === "high" ? 30 * 1000 : 5 * 60 * 1000;
    const geoTtlMs = level === "low" ? 24 * 60 * 60 * 1000 : level === "high" ? 30 * 60 * 1000 : 6 * 60 * 60 * 1000;
    const last = LAST_RESOLVE.get("page");
    const now = Date.now();
    if (last && last.host === host && now - last.ts < cooldownMs) return;
    LAST_RESOLVE.set("page", { host, ts: now });

    renderCdnState({ status: "resolving", host, lastUrl: url, ts: now });

    const ip = await dohResolve(host, hostTtlMs);
    if (!ip) {
      renderCdnState({ status: "doh_failed", host, lastIp: "", countryName: "", countryCode: "", ts: Date.now() });
      return;
    }

    renderCdnState({ status: "geo", host, lastIp: ip, countryName: "", countryCode: "", ts: Date.now() });
    const geo = await geoLookup(ip, geoTtlMs);
    if (!geo?.countryName) {
      renderCdnState({ status: "geo_failed", host, lastIp: ip, countryName: "", countryCode: "", ts: Date.now() });
      return;
    }

    const hostCache = gmGet(`host_${host}`, null);
    renderCdnState({
      status: "ok",
      host,
      lastIp: ip,
      countryName: geo.countryName,
      countryCode: geo.countryCode,
      dohProvider: hostCache?.provider || "",
      geoProvider: geo.provider || "",
      ts: Date.now()
    });
  }

  function queueResolve(url) {
    resolveQueue = resolveQueue
      .catch(() => {})
      .then(() => resolvePipeline(url))
      .catch((error) => log("resolve failed:", error));
  }

  function injectPageScriptOnce() {
    if (pageScriptInjected) return;
    const target = document.documentElement || document.head;
    if (!target) return;

    const code = `(() => {
  if (window.__ytSpeedCdnUserscriptInstalled) return;
  window.__ytSpeedCdnUserscriptInstalled = true;

  const UPDATE_MS = 1000;
  const shouldReport = (u) => typeof u === "string" && u.includes("googlevideo.com") && u.includes("/videoplayback");
  const report = (u) => {
    try { window.postMessage({ source: "YT_CDN_OVERLAY", type: "VIDEOPLAYBACK_URL", url: u }, "*"); } catch {}
  };

  try {
    const origFetch = window.fetch;
    window.fetch = function(input, init) {
      try {
        const url = typeof input === "string" ? input : input && input.url;
        if (shouldReport(url)) report(url);
      } catch {}
      return origFetch.apply(this, arguments);
    };
  } catch {}

  try {
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
      try { if (shouldReport(url)) report(url); } catch {}
      return origOpen.apply(this, arguments);
    };
  } catch {}

  function getPlayer() {
    return document.getElementById("movie_player")
      || document.querySelector("ytd-player #movie_player")
      || document.querySelector("#movie_player");
  }

  function parseNumber(x) {
    if (x == null) return null;
    const s = String(x);
    const m = s.match(/(\\d[\\d,]*)(?:\\.(\\d+))?/);
    if (!m) return null;
    const cleaned = (m[1] + (m[2] ? "." + m[2] : "")).replace(/,/g, "");
    const num = Number.parseFloat(cleaned);
    return Number.isFinite(num) ? num : null;
  }

  function parseKbpsFromText(text) {
    if (!text) return null;
    const lines = String(text).split(/\\r?\\n/);
    const keyRe = /(Connection Speed|连接速度)/i;

    for (const line of lines) {
      if (!keyRe.test(line)) continue;
      const m1 = line.match(/(\\d[\\d,.]*)\\s*Kbps/i);
      if (m1) return parseNumber(m1[1]);
      const m2 = line.match(/(\\d[\\d,.]*)/);
      if (m2) return parseNumber(m2[1]);
    }

    const m = String(text).match(/(?:Connection Speed|连接速度)\\s*[:：]?\\s*(\\d[\\d,.]*)\\s*Kbps/i);
    if (m) return parseNumber(m[1]);
    return null;
  }

  function readKbpsFromStatsObject(stats) {
    if (!stats || typeof stats !== "object") return null;

    const direct = [
      stats.bandwidth_kbps,
      stats.bandwidthKbps,
      stats.connection_speed_kbps,
      stats.connectionSpeedKbps,
      stats.connection_speed,
      stats.connectionSpeed,
      stats.bandwidth
    ];

    for (const c of direct) {
      const n = parseNumber(c);
      if (n != null) return n;
    }

    for (const [k, v] of Object.entries(stats)) {
      const key = String(k).toLowerCase();
      if (key.includes("bandwidth") && (key.includes("kbps") || key.includes("kb"))) {
        const n = parseNumber(v);
        if (n != null) return n;
      }
      if ((key.includes("connection") || key.includes("conn")) && key.includes("speed")) {
        const n = parseNumber(v);
        if (n != null) return n;
      }
      if (typeof v === "string" && (v.includes("Connection Speed") || v.includes("连接速度"))) {
        const n = parseKbpsFromText(v);
        if (n != null) return n;
      }
    }

    return null;
  }

  function readKbpsFromDomPanelIfPresent() {
    const panel = document.querySelector(".html5-video-info-panel")
      || document.querySelector(".html5-video-info-panel-content")
      || document.querySelector("[class*='video-info-panel']");
    if (!panel) return null;
    return parseKbpsFromText(panel.textContent || "");
  }

  function readBandwidthKbps() {
    const player = getPlayer();
    if (!player) return { kbps: null, reason: "no movie_player" };

    if (typeof player.getStatsForNerds === "function") {
      try {
        const stats0 = player.getStatsForNerds(0);
        if (typeof stats0 === "string") {
          const n = parseKbpsFromText(stats0);
          if (n != null) return { kbps: n, meta: "stats:string(0)" };
        } else {
          const n = readKbpsFromStatsObject(stats0);
          if (n != null) return { kbps: n, meta: "stats:object(0)" };
        }
      } catch {}

      try {
        const stats = player.getStatsForNerds();
        if (typeof stats === "string") {
          const n = parseKbpsFromText(stats);
          if (n != null) return { kbps: n, meta: "stats:string" };
        } else {
          const n = readKbpsFromStatsObject(stats);
          if (n != null) return { kbps: n, meta: "stats:object" };
        }
      } catch {}
    }

    if (typeof player.getDebugText === "function") {
      try {
        const n = parseKbpsFromText(player.getDebugText());
        if (n != null) return { kbps: n, meta: "getDebugText" };
      } catch {}
    }

    const n3 = readKbpsFromDomPanelIfPresent();
    if (n3 != null) return { kbps: n3, meta: "dom:panel" };
    return { kbps: null, reason: "no bandwidth field found" };
  }

  function tick() {
    const res = readBandwidthKbps();
    window.postMessage({ type: "YT_SPEED_KBPS", ...res }, "*");
  }

  setInterval(tick, UPDATE_MS);
  tick();
})();`;

    const script = document.createElement("script");
    // --- 核心修复代码开始 ---
    // 检查浏览器是否支持并启用了 Trusted Types
    if (window.trustedTypes && window.trustedTypes.createPolicy) {
      // 创建一个临时的可信策略
      const policy = window.trustedTypes.createPolicy("yt-speed-fix", {
        createScript: (s) => s
      });
      script.textContent = policy.createScript(code);
    } else {
      // 如果环境没限制，走老路子
      script.textContent = code;
    }
    // --- 核心修复代码结束 ---
    target.appendChild(script);
    script.remove();
    pageScriptInjected = true;
    log("page script injected");
  }

  function onPageMessage(event) {
    if (event.source !== unsafeWindow && event.source !== window) return;
    const data = event.data;

    if (data && data.type === "YT_SPEED_KBPS") {
      if (!active) return;
      const kbps = typeof data.kbps === "number" ? data.kbps : null;

      if (kbps == null || !Number.isFinite(kbps) || kbps <= 0) {
        if (Date.now() - lastGoodAt < 10_000) setSpeedText(lastSpeedText);
        else setSpeedText("N/A MB/s");
        if (DEBUG && data.reason) log("no kbps:", data.reason);
        return;
      }

      const mbps = kbps / 8 / 1024;
      lastGoodAt = Date.now();
      setSpeedText(`${mbps.toFixed(2)} MB/s`);
      return;
    }

    if (data && data.source === "YT_CDN_OVERLAY" && data.type === "VIDEOPLAYBACK_URL") {
      if (!active || !SETTINGS.showCdn) return;
      const url = data.url;
      if (typeof url !== "string") return;

      let host = "";
      try {
        host = new URL(url).hostname || "";
      } catch {}

      const now = Date.now();
      const lastHost = unsafeWindow.__ytCdnLastHost || "";
      const lastAt = unsafeWindow.__ytCdnLastAt || 0;
      const hostChanged = host && host !== lastHost;
      const level = SETTINGS.probeLevel || "balanced";
      const throttleMs = level === "low" ? 1500 : level === "high" ? 250 : 600;
      if (!hostChanged && now - lastAt < throttleMs) return;

      unsafeWindow.__ytCdnLastHost = host;
      unsafeWindow.__ytCdnLastAt = now;
      queueResolve(url);
    }
  }

  async function onRouteChange() {
    if (!settingsLoaded) loadSettings();
    active = isTargetRoute();
    lastGoodAt = 0;

    if (!active) {
      removeWidgets();
      log("route not target, widgets removed");
      return;
    }

    ensureWidgetsMounted();
    injectPageScriptOnce();
    renderCdnState(cdnState);
    log("route target, init");
  }

  function clearDnsCache() {
    let count = 0;
    try {
      for (const key of GM_listValues()) {
        if (key.startsWith("host_") || key.startsWith("geo_")) {
          gmDelete(key);
          count += 1;
        }
      }
    } catch {}
    LAST_RESOLVE.clear();
    cdnState = {};
    lastCdnOk = "";
    renderCdnState({});
    alert(`已清理 DNS/Geo 缓存：${count} 项`);
  }

  function registerMenus() {
    if (typeof GM_registerMenuCommand !== "function") return;

    GM_registerMenuCommand(`${SETTINGS.showSpeed ? "隐藏" : "显示"}网速`, () => {
      saveSettings({ showSpeed: !SETTINGS.showSpeed });
      location.reload();
    });

    GM_registerMenuCommand(`${SETTINGS.showCdn ? "隐藏" : "显示"} CDN 国家`, () => {
      saveSettings({ showCdn: !SETTINGS.showCdn });
      location.reload();
    });

    GM_registerMenuCommand(`国家显示语言：${SETTINGS.countryLang === "zh" ? "中文" : "英文代码"}`, () => {
      saveSettings({ countryLang: SETTINGS.countryLang === "zh" ? "en" : "zh" });
      renderCdnState(cdnState);
    });

    GM_registerMenuCommand(`重新探测冷却频率：${SETTINGS.probeLevel}`, () => {
      const input = prompt("请输入 low / balanced / high", SETTINGS.probeLevel);
      const value = (input || "").trim();
      if (!["low", "balanced", "high"].includes(value)) return;
      saveSettings({ probeLevel: value });
    });

    GM_registerMenuCommand(`${SETTINGS.diagMode ? "关闭" : "开启"}诊断模式`, () => {
      saveSettings({ diagMode: !SETTINGS.diagMode });
      renderCdnState(cdnState);
      location.reload();
    });

    GM_registerMenuCommand("设置 GeoIP Token", () => {
      const value = prompt("请输入 ipinfo.io token，留空表示使用公共 API", SETTINGS.geoToken || "");
      if (value == null) return;
      saveSettings({ geoToken: value.trim() });
      clearDnsCache();
    });

    GM_registerMenuCommand("清理 DNS/Geo 缓存", clearDnsCache);

    GM_registerMenuCommand("恢复默认设置", () => {
      resetSettings();
      location.reload();
    });
  }

  function boot() {
    loadSettings();
    registerMenus();
    window.addEventListener("message", onPageMessage);
    injectPageScriptOnce();

    setInterval(() => {
      const routeKey = `${location.pathname || ""}|${location.search || ""}`;
      if (routeKey !== lastRouteKey) {
        lastRouteKey = routeKey;
        onRouteChange();
      }
    }, ROUTE_POLL_MS);

    setInterval(() => {
      if (!active) return;
      ensureWidgetsMounted();
      injectPageScriptOnce();
    }, UPDATE_MS);

    lastRouteKey = `${location.pathname || ""}|${location.search || ""}`;
    onRouteChange();
  }

  if (document.documentElement) {
    boot();
  } else {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  }
})();
