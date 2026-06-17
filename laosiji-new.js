// ==UserScript==
// @name         JAV老司机-新
// @namespace    https://github.com/ZiPenOk/scripts
// @version      2.5.6
// @description  JavBus / JavDB / javlibrary 磁力搜索与番号助手，集成 115 离线 匹配、番号复制、站点跳转、多源预览图、预告片播放、缓存管理和统一设置面板, 支持在 JavBus、JavDB、JavLibrary 等站点显示磁力表，并在 Sukebei、169bbs、SupJav、Emby、JavBus、JavDB、JavLibrary、Javrate、Sehuatang、HJD2048、MissAV 等页面提供番号跳转、预览图和预告片入口。
// @author       ZiPenOk
// @icon         https://img.sh1nyan.fun/file/1778560196416_laosiji.png

// @match        *://*.javlibrary.com/*
// @match        *://javlibrary.com/*
// @match        *://*.javbus.com/*
// @match        *://javbus.com/*
// @include      *://*javdb*.com/*

// @match        *://sukebei.nyaa.si/*
// @match        *://169bbs.com/*
// @match        *://supjav.com/*
// @match        *://javrate.com/*
// @match        *://www.javrate.com/*
// @match        *://sehuatang.net/*
// @match        *://hjd2048.com/2048/*
// @match        *://jable.tv/*
// @include      /^[^:]*?:\/\/missav\.[^/]*?\/.*?$/
// @include      /^[^:]*?:\/\/emby\.[^/]*?\/web\/index\.html.*?$/
// @include      /^[^:]*?:\/\/10\.[^/]*?:[^/]*?\/web\/index\.html.*?$/

// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_notification
// @grant        GM_setClipboard
// @grant        GM_registerMenuCommand
// @grant        GM_download
// @grant        GM_info
// @connect      *
// @license      GPL-3.0
// @homepageURL  https://github.com/ZiPenOk/scripts
// @supportURL   https://github.com/ZiPenOk/scripts/issues
// @downloadURL  https://github.com/ZiPenOk/scripts/raw/refs/heads/main/laosiji-new.js
// @updateURL    https://github.com/ZiPenOk/scripts/raw/refs/heads/main/laosiji-new.js
// ==/UserScript==

!function() {
    "use strict";
    const e = "2.5.6", t = 86, n = {
        get javdbSearchUrl() {
            return GM_getValue("cfg_javdb_search_url", "javdb.com");
        },
        get ciligouUrl() {
            return GM_getValue("cfg_ciligou_url", "clg55.top");
        },
        get btdigUrl() {
            return GM_getValue("cfg_btdig_url", "btdig.com");
        },
        get btsearchUrl() {
            return GM_getValue("cfg_btsearch_url", "btsearch.love");
        },
        get sukebeiUrl() {
            return GM_getValue("cfg_sukebei_url", "sukebei.nyaa.si");
        },
        get sokittyUrl() {
            return GM_getValue("cfg_sokitty_url", "w1.sokitty.me");
        },
        get defaultEngine() {
            return GM_getValue("cfg_default_engine", "sukebei.nyaa.si");
        },
        get defaultVideoEngine() {
            return GM_getValue("default_video_engine", "missav");
        },
        get pan115Player() {
            return GM_getValue("pan115_player_mode", "official");
        },
        get javbusCardColumns() {
            return Math.min(10, Math.max(2, parseInt(GM_getValue("cfg_javbus_card_columns", 5), 10) || 5));
        },
        get javdbCardColumns() {
            return Math.min(10, Math.max(2, parseInt(GM_getValue("cfg_javdb_card_columns", 5), 10) || 5));
        },
        get javlibCardColumns() {
            return Math.min(10, Math.max(2, parseInt(GM_getValue("cfg_javlib_card_columns", 5), 10) || 5));
        },
        get javbusPageZoom() {
            return Math.min(100, Math.max(60, parseInt(GM_getValue("cfg_javbus_page_zoom", t), 10) || t));
        },
        get javdbPageZoom() {
            return Math.min(100, Math.max(60, parseInt(GM_getValue("cfg_javdb_page_zoom", t), 10) || t));
        },
        get javlibPageZoom() {
            return Math.min(100, Math.max(60, parseInt(GM_getValue("cfg_javlib_page_zoom", t), 10) || t));
        },
        get listPreviewQuick() {
            return GM_getValue("list_preview_quick_enabled", !0);
        },
        get detailPreviewInline() {
            return GM_getValue("detail_preview_inline_enabled", !0);
        },
        get thumbSourceOrder() {
            return GM_getValue("thumb_source_order", [ "javfree", "projectjav", "javstore" ]);
        },
        get detailFlex() {
            return GM_getValue("detail_flex_settings", {});
        },
        set javdbSearchUrl(e) {
            GM_setValue("cfg_javdb_search_url", e);
        },
        set ciligouUrl(e) {
            GM_setValue("cfg_ciligou_url", e);
        },
        set btdigUrl(e) {
            GM_setValue("cfg_btdig_url", e);
        },
        set btsearchUrl(e) {
            GM_setValue("cfg_btsearch_url", e);
        },
        set sukebeiUrl(e) {
            GM_setValue("cfg_sukebei_url", e);
        },
        set sokittyUrl(e) {
            GM_setValue("cfg_sokitty_url", e);
        },
        set defaultEngine(e) {
            GM_setValue("cfg_default_engine", e);
        },
        set defaultVideoEngine(e) {
            GM_setValue("default_video_engine", e);
        },
        set pan115Player(e) {
            GM_setValue("pan115_player_mode", e);
        },
        set javbusCardColumns(e) {
            GM_setValue("cfg_javbus_card_columns", Math.min(10, Math.max(2, parseInt(e, 10) || 5)));
        },
        set javdbCardColumns(e) {
            GM_setValue("cfg_javdb_card_columns", Math.min(10, Math.max(2, parseInt(e, 10) || 5)));
        },
        set javlibCardColumns(e) {
            GM_setValue("cfg_javlib_card_columns", Math.min(10, Math.max(2, parseInt(e, 10) || 5)));
        },
        set javbusPageZoom(e) {
            GM_setValue("cfg_javbus_page_zoom", Math.min(100, Math.max(60, parseInt(e, 10) || 100)));
        },
        set javdbPageZoom(e) {
            GM_setValue("cfg_javdb_page_zoom", Math.min(100, Math.max(60, parseInt(e, 10) || 100)));
        },
        set javlibPageZoom(e) {
            GM_setValue("cfg_javlib_page_zoom", Math.min(100, Math.max(60, parseInt(e, 10) || 100)));
        },
        set listPreviewQuick(e) {
            GM_setValue("list_preview_quick_enabled", !!e);
        },
        set detailPreviewInline(e) {
            GM_setValue("detail_preview_inline_enabled", !!e);
        },
        set thumbSourceOrder(e) {
            GM_setValue("thumb_source_order", e);
        },
        set detailFlex(e) {
            GM_setValue("detail_flex_settings", e || {});
        },
        get btnShowNyaa() {
            return GM_getValue("btn_show_nyaa", !0);
        },
        get btnShowJavbus() {
            return GM_getValue("btn_show_javbus", !0);
        },
        get btnShowJavdb() {
            return GM_getValue("btn_show_javdb", !0);
        },
        get btnShowMissav() {
            return GM_getValue("btn_show_missav", !0);
        },
        get btnShowFanza() {
            return GM_getValue("btn_show_fanza", !0);
        },
        get btnShowSearch() {
            return GM_getValue("btn_show_search", !0);
        },
        get btnShowTrailer() {
            return GM_getValue("btn_show_trailer", !0);
        },
        get btnShowPreview() {
            return GM_getValue("btn_show_preview", !0);
        },
        get btnShowPan115() {
            return GM_getValue("btn_show_pan115", !1);
        },
        get magnetTable() {
            return GM_getValue("magnet_table_enabled", !0);
        },
        get infiniteScroll() {
            return GM_getValue("infinite_scroll_enabled", !1);
        },
        set btnShowNyaa(e) {
            GM_setValue("btn_show_nyaa", e);
        },
        set btnShowJavbus(e) {
            GM_setValue("btn_show_javbus", e);
        },
        set btnShowJavdb(e) {
            GM_setValue("btn_show_javdb", e);
        },
        set btnShowMissav(e) {
            GM_setValue("btn_show_missav", e);
        },
        set btnShowFanza(e) {
            GM_setValue("btn_show_fanza", e);
        },
        set btnShowSearch(e) {
            GM_setValue("btn_show_search", e);
        },
        set btnShowTrailer(e) {
            GM_setValue("btn_show_trailer", e);
        },
        set btnShowPreview(e) {
            GM_setValue("btn_show_preview", e);
        },
        set btnShowPan115(e) {
            GM_setValue("btn_show_pan115", e);
        },
        set magnetTable(e) {
            GM_setValue("magnet_table_enabled", e);
        },
        set infiniteScroll(e) {
            GM_setValue("infinite_scroll_enabled", e);
        }
    }, a = (() => {
        const e = {
            min: 2,
            max: 10
        }, t = {
            javbus: {
                getter: () => n.javbusCardColumns,
                setter: e => {
                    n.javbusCardColumns = e;
                },
                selector: ".javbus-card-grid",
                host: /(?:^|\.)javbus\.com$/i
            },
            javdb: {
                getter: () => n.javdbCardColumns,
                setter: e => {
                    n.javdbCardColumns = e;
                },
                selector: ".javdb-card-grid",
                host: /javdb/i
            },
            javlib: {
                getter: () => n.javlibCardColumns,
                setter: e => {
                    n.javlibCardColumns = e;
                },
                selector: ".javlib-card-grid",
                host: /(javlibrary|javlib|r86m|s87n)/i
            }
        };
        function a(t) {
            return Math.min(e.max, Math.max(e.min, parseInt(t, 10) || 5));
        }
        function r(e) {
            return t[e] ? a(t[e].getter()) : 5;
        }
        return {
            LIMITS: e,
            clamp: a,
            get: r,
            set: function(e, n) {
                t[e] && t[e].setter(a(n));
            },
            apply: function(e, n = r(e)) {
                const i = t[e];
                i && document.querySelectorAll(i.selector).forEach(e => {
                    e.style.setProperty("--jav-card-columns", String(a(n)));
                });
            },
            detectCurrentSite: function() {
                const e = location.hostname;
                return Object.entries(t).find(([, t]) => t.host.test(e))?.[0] || "";
            }
        };
    })(), r = (() => {
        const e = {
            min: 60,
            max: 100
        }, t = {
            javbus: {
                getter: () => n.javbusPageZoom,
                setter: e => {
                    n.javbusPageZoom = e;
                },
                selector: "body > div.container-fluid, body > div.container",
                host: /(?:^|\.)javbus\.com$/i
            },
            javdb: {
                getter: () => n.javdbPageZoom,
                setter: e => {
                    n.javdbPageZoom = e;
                },
                selector: "body > section > div",
                host: /javdb/i
            },
            javlib: {
                getter: () => n.javlibPageZoom,
                setter: e => {
                    n.javlibPageZoom = e;
                },
                selector: "#content",
                host: /(javlibrary|javlib|r86m|s87n)/i
            }
        };
        function a(t) {
            return Math.min(e.max, Math.max(e.min, parseInt(t, 10) || 100));
        }
        function r(e) {
            return t[e] ? a(t[e].getter()) : 100;
        }
        function i(e, n = r(e)) {
            const i = t[e];
            if (!i) return;
            const o = `${a(n)}%`;
            if ("javlib" === e) {
                const e = document.querySelector("#content");
                return e && (e.style.setProperty("zoom", "1"), e.style.setProperty("width", o, "important"), 
                e.style.setProperty("max-width", "none", "important"), e.style.setProperty("margin-left", "auto", "important"), 
                e.style.setProperty("margin-right", "auto", "important"), e.style.setProperty("box-sizing", "border-box", "important"), 
                e.style.setProperty("padding-left", "12px", "important"), e.style.setProperty("padding-right", "12px", "important"), 
                e.style.setProperty("min-width", "0", "important"), e.style.setProperty("overflow", "visible", "important")), 
                document.documentElement?.style.setProperty("background", "#fff", "important"), 
                document.body?.style.setProperty("background", "#fff", "important"), document.querySelectorAll("#page, #content, #rightcolumn").forEach(e => {
                    e?.style.setProperty("background", "#fff", "important"), e?.style.setProperty("box-sizing", "border-box", "important"), 
                    e?.style.setProperty("max-width", "100%", "important"), e?.style.setProperty("overflow", "visible", "important");
                }), void document.querySelectorAll("#rightcolumn > .videothumblist, #rightcolumn > .videothumblist .videos").forEach(e => {
                    e.style.setProperty("box-sizing", "border-box", "important"), e.style.setProperty("max-width", "100%", "important");
                });
            }
            document.querySelectorAll(i.selector).forEach(e => {
                e && (e.style.setProperty("zoom", "1"), e.style.setProperty("width", o, "important"), 
                e.style.setProperty("max-width", "none", "important"), e.style.setProperty("margin-left", "auto", "important"), 
                e.style.setProperty("margin-right", "auto", "important"), e.style.setProperty("box-sizing", "border-box", "important"));
            });
        }
        function o() {
            const e = location.hostname;
            return Object.entries(t).find(([, t]) => t.host.test(e))?.[0] || "";
        }
        return {
            LIMITS: e,
            clamp: a,
            get: r,
            set: function(e, n) {
                t[e] && t[e].setter(a(n));
            },
            apply: i,
            applyCurrent: function() {
                const e = o();
                e && i(e);
            },
            detectCurrentSite: o
        };
    })(), i = (() => {
        const e = {
            min: 50,
            max: 200
        }, t = {
            javbus: {
                cover: 95,
                info: 80,
                magnet: 100
            },
            javdb: {
                cover: 135,
                info: 105,
                magnet: 125
            },
            javlib: {
                cover: 100,
                info: 85,
                magnet: 100
            }
        }, a = {
            javbus: {
                host: /(?:^|\.)javbus\.com$/i,
                detail: () => !!document.querySelector(".row.movie") && !document.querySelector("#waterfall div.item"),
                root: () => document.querySelector(".row.movie"),
                vars: {
                    cover: "--javbus-cover-flex",
                    info: "--javbus-info-flex",
                    magnet: "--javbus-magnet-flex"
                }
            },
            javdb: {
                host: /javdb/i,
                detail: () => /\/v\//i.test(location.pathname),
                root: () => document.querySelector(".jav-flex-container"),
                vars: {
                    cover: "--javdb-cover-flex",
                    info: "--javdb-info-flex",
                    magnet: "--javdb-magnet-flex"
                }
            },
            javlib: {
                host: /(javlibrary|javlib|r86m|s87n)/i,
                detail: () => !!document.querySelector("#video_jacket_info #video_info, #video_id .text"),
                root: () => document.querySelector("#video_jacket_info tr"),
                vars: {
                    cover: "--javlib-cover-flex",
                    info: "--javlib-info-flex",
                    magnet: "--javlib-magnet-flex"
                }
            }
        };
        function r(t) {
            return Math.min(e.max, Math.max(e.min, parseInt(t, 10) || 100));
        }
        function i() {
            const e = location.hostname;
            return Object.entries(a).find(([, t]) => t.host.test(e) && t.detail())?.[0] || "";
        }
        function o() {
            const e = n.detailFlex;
            return e && "object" == typeof e ? e : {};
        }
        function s(e) {
            const n = o(), a = t[e] || t.javbus, i = n[e] || {};
            return {
                cover: r(i.cover ?? a.cover),
                info: r(i.info ?? a.info),
                magnet: r(i.magnet ?? a.magnet)
            };
        }
        function l(e) {
            return (r(e) / 100).toFixed(2).replace(/\.?0+$/, "");
        }
        function c(e = i()) {
            return !(!e || !n.magnetTable || !document.querySelector(".jav-nong-slot"));
        }
        return {
            LIMITS: e,
            DEFAULTS: t,
            clamp: r,
            detectCurrentSite: i,
            get: s,
            set: function(e, i, l) {
                if (!a[e] || !t[e] || !t[e].hasOwnProperty(i)) return;
                const c = o();
                c[e] = {
                    ...s(e),
                    [i]: r(l)
                }, n.detailFlex = c;
            },
            apply: function(e = i()) {
                const t = a[e];
                if (!t) return;
                const n = t.root();
                if (!n) return;
                const r = s(e);
                n.style.setProperty(t.vars.cover, l(r.cover)), n.style.setProperty(t.vars.info, l(r.info)), 
                c(e) && n.style.setProperty(t.vars.magnet, l(r.magnet));
            },
            hasMagnet: c,
            hasLayout: function(e = i()) {
                const t = a[e];
                return !!t?.root?.();
            },
            defaultCss: function(e = i()) {
                const n = t[e] || t.javbus;
                return {
                    cover: l(n.cover),
                    info: l(n.info),
                    magnet: l(n.magnet)
                };
            }
        };
    })(), o = (...e) => console.log("[老司机]", ...e), s = {
        version: e,
        cfg: n,
        log: o,
        notify: d,
        parseHTML: p,
        gmFetch: m,
        expose: (e, t) => (window[e] = t, t)
    };
    s.expose("__LAOSIJI_CORE__", s);
    const l = [ {
        key: "missav",
        label: "MissAV",
        host: /missav\.(com|ai|ws)/i,
        color: "#ec4899"
    }, {
        key: "jable",
        label: "Jable",
        host: /jable\.tv/i,
        color: "#f97316"
    }, {
        key: "123av",
        label: "123AV",
        host: /123av\.com/i,
        color: "#10b981"
    }, {
        key: "javday",
        label: "JavDay",
        host: /javday\.app/i,
        color: "#0ea5e9"
    }, {
        key: "supjav",
        label: "SupJav",
        host: /supjav\.com/i,
        color: "#ef4444"
    }, {
        key: "javrate",
        label: "JavRate",
        host: /javrate\.com/i,
        color: "#8b5cf6"
    } ];
    s.expose("__LAOSIJI_VIDEO_ENGINES__", l);
    const c = {
        on: (e, t, n, a) => e && "function" == typeof n ? (e.addEventListener(t, n, a), 
        e) : null,
        click(e, t, n) {
            return this.on(e, "click", t, n);
        },
        bindCheckbox(e, t, n) {
            return e ? (e.checked = !!t, this.on(e, "change", () => n?.(e.checked, e)), e) : null;
        },
        bindRange(e, t, n, a, r) {
            if (!e) return null;
            const i = "function" == typeof a ? a : e => String(e);
            return e.value = String(n), t && (t.textContent = i(n)), this.on(e, "input", () => {
                const n = e.value;
                t && (t.textContent = i(n)), r?.(n, e);
            }), e;
        },
        setSelectValue(e, t, n = "") {
            if (!e) return "";
            const a = [ ...e.options ], r = a.some(e => e.value === t) ? t : n;
            return r && a.some(e => e.value === r) ? e.value = r : a.length && (e.selectedIndex = 0), 
            e.value;
        },
        clearSessionByPrefixes(e) {
            let t = 0;
            return Object.keys(sessionStorage).forEach(n => {
                e.some(e => n.startsWith(e)) && (sessionStorage.removeItem(n), t += 1);
            }), t;
        }
    };
    function d(e, t, n) {
        GM_notification({
            title: e,
            text: t,
            onclick: () => n && window.open(n)
        });
    }
    function p(e) {
        return (new DOMParser).parseFromString(e, "text/html");
    }
    function m(e, t = {}) {
        return new Promise((n, a) => {
            GM_xmlhttpRequest({
                method: "GET",
                timeout: 2e4,
                ...t,
                url: e,
                onload(e) {
                    e.loadstuts = !0, n(e);
                },
                onerror(e) {
                    e.loadstuts = !1, n(e);
                },
                onabort(e) {
                    e.loadstuts = !1, n(e);
                },
                ontimeout(t) {
                    t.loadstuts = !1, t.finalUrl = e, n(t);
                }
            });
        });
    }
    function u(e) {
        if (!e) return "";
        if ((e = e.trim().toUpperCase()).match(/-[^0]/)) return e;
        if (e.match(/^[0-9_-]+$/)) return e;
        const t = e.match(/^([A-Z]+[-_]?)(\d+)$/);
        return t ? t[1].replace(/[-_]$/, "") + "-" + t[2] : e;
    }
    function h(e, t, n = null, a = !1) {
        if (!e || !t) return;
        const r = u(t);
        (e.parentElement || e).querySelectorAll(".jav-avid-copy").forEach(e => e.remove()), 
        n?.style.setProperty("display", "none", "important");
        const i = document.createElement("button");
        i.type = "button", i.className = "jav-avid-copy", i.textContent = "复制番号", i.title = `复制番号：${r}`, 
        i.style.cssText = "display:inline-block;margin-left:8px;padding:2px 8px;font-size:12px;background:#e8f4fd;border:1px solid #90c5e8;border-radius:4px;cursor:pointer;color:#1a6fa8;vertical-align:middle;white-space:nowrap;", 
        i.addEventListener("click", e => {
            e.preventDefault(), e.stopPropagation(), GM_setClipboard(r), i.textContent = "已复制", 
            setTimeout(() => {
                i.textContent = "复制番号";
            }, 900);
        }), a ? e.appendChild(i) : e.after(i);
    }
    s.expose("__LAOSIJI_UI__", c);
    const g = (() => {
        const t = [ {
            key: "javdbSearchUrl",
            label: "JavDB",
            placeholder: "javdb.com"
        }, {
            key: "ciligouUrl",
            label: "CiliGou",
            placeholder: "clg55.top"
        }, {
            key: "btdigUrl",
            label: "BtDig",
            placeholder: "btdig.com"
        }, {
            key: "btsearchUrl",
            label: "BTSearch",
            placeholder: "btsearch.love"
        }, {
            key: "sukebeiUrl",
            label: "Sukebei",
            placeholder: "sukebei.nyaa.si"
        }, {
            key: "sokittyUrl",
            label: "SoKitty",
            placeholder: "w1.sokitty.me"
        } ], a = [ "BTDigg", "Taocili", "Google", "Bing", "DuckGo" ], r = {
            javfree: {
                label: "javfree.me",
                color: "#16a34a"
            },
            projectjav: {
                label: "projectjav.com",
                color: "#ca8a04"
            },
            javstore: {
                label: "javstore.net",
                color: "#dc2626"
            }
        }, i = e => String(e || "").trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
        return {
            open: function() {
                document.getElementById("jav-settings-overlay")?.remove(), GM_addStyle("\n                #jav-settings-overlay { position:fixed; inset:0; z-index:10000020; background:rgba(15,23,42,.62); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(7px); font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif; }\n                #jav-settings-panel { width:min(800px,94vw); max-height:88vh; background:linear-gradient(180deg,#f8fbff 0%,#f6f3ff 46%,#fff7ed 100%); color:#111827; border:1px solid rgba(148,163,184,.38); border-radius:16px; box-shadow:0 26px 76px rgba(15,23,42,.36); display:flex; flex-direction:column; overflow:hidden; }\n                #jav-settings-panel * { box-sizing:border-box; }\n                #jav-settings-panel .sp-header { padding:18px 22px; background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 54%,#7c2d12 100%); border-bottom:1px solid rgba(255,255,255,.12); display:flex; align-items:center; justify-content:space-between; }\n                #jav-settings-panel .sp-title { font-size:18px; font-weight:750; color:#fff; }\n                #jav-settings-panel .sp-close { width:32px; height:32px; border:1px solid rgba(255,255,255,.24); border-radius:8px; background:rgba(255,255,255,.1); color:#fff; cursor:pointer; font-size:18px; line-height:1; }\n                #jav-settings-panel .sp-close:hover { background:rgba(255,255,255,.18); }\n                #jav-settings-panel .sp-body { padding:18px 22px; overflow:auto; display:grid; gap:14px; }\n                #jav-settings-panel .sp-card { position:relative; background:rgba(255,255,255,.92); border:1px solid rgba(203,213,225,.88); border-radius:10px; padding:15px; box-shadow:0 10px 24px rgba(15,23,42,.06); overflow:hidden; }\n                #jav-settings-panel .sp-card::before { content:''; position:absolute; left:0; top:0; width:4px; height:100%; background:#2563eb; }\n                #jav-settings-panel .sp-card-magnet::before { background:#16a34a; }\n                #jav-settings-panel .sp-card-defaults::before { background:#2563eb; }\n                #jav-settings-panel .sp-card-features::before { background:#00a85a; }\n                #jav-settings-panel .sp-card-order::before { background:#dc2626; }\n                #jav-settings-panel .sp-card-title { font-size:13px; font-weight:750; color:#1e293b; margin-bottom:12px; }\n                #jav-settings-panel .sp-card-jump::before { background:#6366f1; }\n                #jav-settings-panel .sp-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px 12px; }\n                #jav-settings-panel .sp-feature-order-row { display:grid; grid-template-columns:2fr 1fr; gap:14px; align-items:stretch; }\n                #jav-settings-panel .sp-feature-order-row > .sp-card { height:100%; }\n                #jav-settings-panel .sp-feature-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }\n                #jav-settings-panel .sp-feature-item { display:flex; align-items:center; justify-content:space-between; gap:10px; min-width:0; padding:10px 11px; border:1px solid #e2e8f0; border-radius:8px; background:linear-gradient(180deg,#fff 0%,#f8fafc 100%); }\n                #jav-settings-panel .sp-feature-item:has(#sp-magnet-table) { order:1; grid-column:1; }\n                #jav-settings-panel .sp-feature-item:has(#sp-clear-preview-cache) { order:2; grid-column:1; }\n                #jav-settings-panel .sp-feature-item:has(#sp-clear-trailer-cache) { order:2; grid-column:2; }\n                #jav-settings-panel .sp-feature-item .sp-desc { margin-top:2px; font-size:11px; }\n                #jav-settings-panel .sp-feature-select { order:1; grid-column:2; display:grid; grid-template-columns:1fr 64px; align-items:center; gap:10px; min-width:0; padding:10px 11px; border:1px solid #e2e8f0; border-radius:8px; background:linear-gradient(180deg,#fff 0%,#f8fafc 100%); }\n                #jav-settings-panel .sp-feature-select .sp-select { height:28px; padding:3px 2px 3px 4px; font-size:12px; text-align:left; }\n                #jav-settings-panel .sp-cache-clean { background:linear-gradient(135deg,#fff 0%,#f8fbff 58%,#f0f9ff 100%); }\n                #jav-settings-panel .sp-cache-clear-btn { position:relative; width:34px; height:34px; flex:0 0 auto; display:grid; place-items:center; border:1px solid #bae6fd; border-radius:10px; background:linear-gradient(180deg,#f0f9ff,#fff); color:#0284c7; cursor:pointer; overflow:hidden; transition:transform .16s, border-color .16s, background .16s, color .16s, box-shadow .16s; }\n                #jav-settings-panel .sp-cache-clear-btn::after { content:''; position:absolute; inset:-8px; border-radius:inherit; background:radial-gradient(circle,rgba(14,165,233,.22),transparent 62%); opacity:0; transform:scale(.45); transition:opacity .22s, transform .22s; }\n                #jav-settings-panel .sp-cache-clear-btn:hover { transform:translateY(-1px); border-color:#38bdf8; color:#0369a1; box-shadow:0 8px 18px rgba(14,165,233,.18); }\n                #jav-settings-panel .sp-cache-clear-btn:active { transform:translateY(0) scale(.96); }\n                #jav-settings-panel .sp-cache-clear-btn.is-clearing::after { opacity:1; transform:scale(1); }\n                #jav-settings-panel .sp-cache-clear-btn.is-done { border-color:#86efac; background:linear-gradient(180deg,#ecfdf5,#fff); color:#15803d; }\n                #jav-settings-panel .sp-cache-clear-icon { position:relative; z-index:1; display:inline-block; font-size:15px; line-height:1; }\n                #jav-settings-panel .sp-cache-clear-btn.is-clearing .sp-cache-clear-icon { animation:spCacheSpin .48s ease; }\n                @keyframes spCacheSpin { to { transform:rotate(360deg); } }\n                #jav-settings-panel .sp-field { display:flex; flex-direction:column; gap:6px; min-width:0; }\n                #jav-settings-panel .sp-label { font-size:12px; font-weight:650; color:#475569; }\n                #jav-settings-panel .sp-input, #jav-settings-panel .sp-select { width:100%; min-width:0; height:34px; padding:6px 9px; border:1px solid #cbd5e1; border-radius:8px; background:#fff; color:#0f172a; font-size:13px; outline:none; }\n                #jav-settings-panel .sp-input:focus, #jav-settings-panel .sp-select:focus { border-color:#2563eb; box-shadow:0 0 0 3px rgba(37,99,235,.13); }\n                #jav-settings-panel .sp-engine-row { display:grid; grid-template-columns:170px 1fr; gap:10px; align-items:end; }\n                #jav-settings-panel .sp-cache-actions { display:flex; align-items:center; gap:8px; margin-right:auto; }\n                #jav-settings-panel .sp-cache-feedback { min-width:64px; color:#059669; font-size:12px; font-weight:650; }\n                #jav-settings-panel .sp-footer-links { display:flex; align-items:center; gap:8px; margin-right:4px; }\n                #jav-settings-panel .sp-footer-link { color:#475569; font-size:12px; font-weight:700; text-decoration:none; padding:6px 8px; border-radius:7px; }\n                #jav-settings-panel .sp-footer-link:hover { color:#1d4ed8; background:#eff6ff; }\n                #jav-settings-panel .sp-footer-sep { width:1px; height:16px; background:#cbd5e1; }\n                #jav-settings-panel .sp-desc { font-size:12px; color:#64748b; line-height:1.45; }\n                #jav-settings-panel .sp-toggle { position:relative; display:inline-block; width:42px; height:24px; flex:0 0 auto; }\n                #jav-settings-panel .sp-toggle input { opacity:0; width:0; height:0; }\n                #jav-settings-panel .sp-toggle-track { position:absolute; inset:0; border-radius:999px; background:#cbd5e1; cursor:pointer; transition:background .18s; }\n                #jav-settings-panel .sp-toggle-track::before { content:''; position:absolute; width:18px; height:18px; left:3px; top:3px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(15,23,42,.25); transition:transform .18s; }\n                #jav-settings-panel .sp-toggle input:checked + .sp-toggle-track { background:#2563eb; }\n                #jav-settings-panel .sp-toggle input:checked + .sp-toggle-track::before { transform:translateX(18px); }\n                #jav-settings-panel .sp-order-list { display:flex; flex-direction:column; gap:8px; }\n                #jav-settings-panel .sp-order-item { display:grid; grid-template-columns:1fr auto auto; gap:10px; align-items:center; padding:10px 11px; border:1px solid #e2e8f0; border-radius:8px; background:linear-gradient(90deg,#fff 0%,#f8fafc 100%); user-select:none; }\n                #jav-settings-panel .sp-order-name { font-size:13px; font-weight:700; color:#1e293b; }\n                #jav-settings-panel .sp-dot { width:9px; height:9px; border-radius:50%; }\n                #jav-settings-panel .sp-order-actions { display:flex; gap:5px; }\n                #jav-settings-panel .sp-order-btn { width:28px; height:28px; border:1px solid #cbd5e1; border-radius:7px; background:#fff; color:#334155; cursor:pointer; font-size:14px; line-height:1; }\n                #jav-settings-panel .sp-order-btn:hover:not(:disabled) { border-color:#2563eb; color:#1d4ed8; background:#eff6ff; }\n                #jav-settings-panel .sp-order-btn:disabled { opacity:.36; cursor:not-allowed; }\n                #jav-settings-panel .sp-footer { padding:14px 22px; background:rgba(255,255,255,.92); border-top:1px solid rgba(203,213,225,.86); display:flex; align-items:center; justify-content:flex-end; gap:10px; }\n                #jav-settings-panel .sp-btn { height:34px; padding:0 16px; border-radius:8px; border:1px solid transparent; font-size:13px; font-weight:700; cursor:pointer; }\n                #jav-settings-panel .sp-btn-cancel { background:#fff; color:#475569; border-color:#cbd5e1; }\n                #jav-settings-panel .sp-btn-clear { background:#fff7ed; color:#9a3412; border-color:#fed7aa; }\n                #jav-settings-panel .sp-btn-clear:hover { background:#ffedd5; }\n                #jav-settings-panel .sp-btn-save { background:linear-gradient(135deg,#2563eb,#7c3aed); color:white; box-shadow:0 8px 20px rgba(79,70,229,.25); }\n                @media (max-width: 640px) { #jav-settings-panel .sp-grid, #jav-settings-panel .sp-engine-row, #jav-settings-panel .sp-feature-grid, #jav-settings-panel .sp-feature-order-row { grid-template-columns:1fr; } #jav-settings-panel .sp-feature-item { grid-column:auto !important; } #jav-settings-panel .sp-cache-actions { margin-right:0; } #jav-settings-panel .sp-footer { flex-wrap:wrap; } }\n            ");
                const o = document.createElement("div");
                o.id = "jav-settings-overlay", o.addEventListener("click", e => {
                    e.target === o && o.remove();
                });
                const s = document.createElement("div");
                s.id = "jav-settings-panel", s.innerHTML = `\n                <div class="sp-header">\n                    <div>\n                        <div class="sp-title">老司机设置</div>\n                    </div>\n                    <button class="sp-close" type="button" title="关闭">×</button>\n                </div>\n                <div class="sp-body">\n                    <section class="sp-card sp-card-magnet">\n                        <div class="sp-card-title">磁力搜索</div>\n                        <div class="sp-grid">\n                            <label class="sp-field"><span class="sp-label">默认磁力引擎</span><select class="sp-select" id="sp-default-engine"></select></label>\n                            <div class="sp-engine-row">\n                                <label class="sp-field"><span class="sp-label">编辑引擎</span><select class="sp-select" id="sp-engine-picker"></select></label>\n                                <label class="sp-field"><span class="sp-label">域名</span><input class="sp-input" id="sp-engine-domain"></label>\n                            </div>\n                        </div>\n                    </section>\n                    <section class="sp-card sp-card-defaults">\n                        <div class="sp-card-title">默认组跳转入口</div>\n                        <div class="sp-grid">\n                            <label class="sp-field"><span class="sp-label">默认搜索入口</span><select class="sp-select" id="sp-jump-engine"></select></label>\n                            <label class="sp-field"><span class="sp-label">默认视频入口</span><select class="sp-select" id="sp-video-engine"></select></label>\n                        </div>\n                    </section>\n                    <div class="sp-feature-order-row">\n                        <section class="sp-card sp-card-features">\n                            <div class="sp-card-title">功能项开关</div>\n                            <div class="sp-feature-grid">\n                                <div class="sp-feature-item">\n                                    <div><div class="sp-label">磁力引擎</div></div>\n                                    <label class="sp-toggle"><input id="sp-magnet-table" type="checkbox"><span class="sp-toggle-track"></span></label>\n                                </div>\n                                <div class="sp-feature-item sp-cache-clean">\n                                    <div><div class="sp-label">预览图缓存</div><div class="sp-desc">清理本页会话缓存</div></div>\n                                    <button class="sp-cache-clear-btn" id="sp-clear-preview-cache" type="button" title="清理预览图缓存"><span class="sp-cache-clear-icon">↻</span></button>\n                                </div>\n                                <div class="sp-feature-item sp-cache-clean">\n                                    <div><div class="sp-label">预告片缓存</div><div class="sp-desc">清理解析结果缓存</div></div>\n                                    <button class="sp-cache-clear-btn" id="sp-clear-trailer-cache" type="button" title="清理预告片缓存"><span class="sp-cache-clear-icon">↻</span></button>\n                                </div>\n                                <label class="sp-feature-select">\n                                    <div><div class="sp-label">115播放器</div></div>\n                                    <select class="sp-select" id="sp-pan115-player">\n                                        <option value="official">官方</option>\n                                        <option value="115master">Master</option>\n                                    </select>\n                                </label>\n                            </div>\n                        </section>\n                        <section class="sp-card sp-card-order">\n                            <div class="sp-card-title">预览图来源顺序</div>\n                            <div class="sp-order-list" id="sp-thumb-order"></div>\n                        </section>\n                    </div>\n                    <section class="sp-card sp-card-jump" style="--card-color:#6366f1;">\n                        <style>\n                            #jav-settings-panel .sp-chip-group{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;}\n                            #jav-settings-panel .sp-chip input{display:none;}\n                            #jav-settings-panel .sp-chip-label{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:999px;border:0.5px solid var(--color-border-secondary,#cbd5e1);background:var(--color-background-secondary,#f8fafc);color:var(--color-text-secondary,#64748b);font-size:12px;font-weight:500;cursor:pointer;transition:all .15s;user-select:none;}\n                            #jav-settings-panel .sp-chip input:checked + .sp-chip-label{border-color:#6366f1;background:#eef2ff;color:#4338ca;}\n                            #jav-settings-panel .sp-chip-label:hover{border-color:#a5b4fc;background:#f0f4ff;color:#4338ca;}\n                            #jav-settings-panel .sp-chip-dot{width:6px;height:6px;border-radius:50%;background:currentColor;opacity:0.6;flex:0 0 auto;}\n                        </style>\n                        <div class="sp-card-title">跳转按钮控制</div>\n                        <div class="sp-chip-group">\n                            <label class="sp-chip"><input id="sp-btn-nyaa" type="checkbox"><span class="sp-chip-label"><span class="sp-chip-dot"></span>Sukebei</span></label>\n                            <label class="sp-chip"><input id="sp-btn-javbus" type="checkbox"><span class="sp-chip-label"><span class="sp-chip-dot"></span>JavBus</span></label>\n                            <label class="sp-chip"><input id="sp-btn-javdb" type="checkbox"><span class="sp-chip-label"><span class="sp-chip-dot"></span>JavDB</span></label>\n                            <label class="sp-chip"><input id="sp-btn-missav" type="checkbox"><span class="sp-chip-label"><span class="sp-chip-dot"></span>视频组</span></label>\n                            <label class="sp-chip"><input id="sp-btn-fanza" type="checkbox"><span class="sp-chip-label"><span class="sp-chip-dot"></span>FANZA</span></label>\n                            <label class="sp-chip"><input id="sp-btn-search" type="checkbox"><span class="sp-chip-label"><span class="sp-chip-dot"></span>搜索组</span></label>\n                            <label class="sp-chip"><input id="sp-btn-trailer" type="checkbox"><span class="sp-chip-label"><span class="sp-chip-dot"></span>预告片</span></label>\n                            <label class="sp-chip"><input id="sp-btn-preview" type="checkbox"><span class="sp-chip-label"><span class="sp-chip-dot"></span>预览图</span></label>\n                        </div>\n                    </section>\n                </div>\n                <div class="sp-footer">\n                    <div class="sp-cache-actions">\n                        <div class="sp-footer-links">\n                            <a class="sp-footer-link" href="https://github.com/ZiPenOk/scripts" target="_blank" rel="noopener noreferrer">Github</a>\n                            <span class="sp-footer-sep"></span>\n                            <a class="sp-footer-link" href="https://sleazyfork.org/zh-CN/scripts/576375-jav%E8%80%81%E5%8F%B8%E6%9C%BA-%E6%96%B0/feedback" target="_blank" rel="noopener noreferrer">反馈</a>\n                            <span class="sp-footer-sep"></span>\n                            <span class="sp-footer-link" style="cursor:default;color:#94a3b8;">v${e}</span>\n                        </div>\n                        <button class="sp-btn sp-btn-clear" id="sp-clear-cache" type="button">清空缓存</button>\n                        <span class="sp-cache-feedback" id="sp-cache-feedback"></span>\n                    </div>\n                    <button class="sp-btn sp-btn-cancel" type="button">取消</button>\n                    <button class="sp-btn sp-btn-save" type="button">保存设置</button>\n                </div>\n            `, 
                o.appendChild(s), document.body.appendChild(o);
                const d = s.querySelector("#sp-default-engine"), p = s.querySelector("#sp-engine-picker"), m = s.querySelector("#sp-engine-domain"), u = s.querySelector("#sp-jump-engine"), h = s.querySelector("#sp-video-engine"), g = s.querySelector("#sp-magnet-table"), v = s.querySelector("#sp-clear-preview-cache"), b = s.querySelector("#sp-clear-trailer-cache"), f = s.querySelector("#sp-pan115-player"), x = {
                    nyaa: s.querySelector("#sp-btn-nyaa"),
                    javbus: s.querySelector("#sp-btn-javbus"),
                    javdb: s.querySelector("#sp-btn-javdb"),
                    missav: s.querySelector("#sp-btn-missav"),
                    fanza: s.querySelector("#sp-btn-fanza"),
                    search: s.querySelector("#sp-btn-search"),
                    trailer: s.querySelector("#sp-btn-trailer"),
                    preview: s.querySelector("#sp-btn-preview")
                }, y = s.querySelector("#sp-clear-cache"), w = s.querySelector("#sp-cache-feedback"), j = s.querySelector("#sp-thumb-order"), _ = Object.fromEntries(t.map(e => [ e.key, n[e.key] ]));
                let k = GM_getValue("thumb_source_order", [ "javfree", "projectjav", "javstore" ]);
                Object.keys(r).forEach(e => {
                    k.includes(e) || k.push(e);
                }), k = k.filter(e => r[e]);
                const S = () => {
                    const e = d.value || n.defaultEngine;
                    d.innerHTML = "", t.forEach(e => {
                        const t = _[e.key], n = document.createElement("option");
                        n.value = t, n.textContent = `${e.label} (${t})`, d.appendChild(n);
                    }), d.value = [ ...d.options ].some(t => t.value === e) ? e : n.defaultEngine, [ ...d.options ].some(e => e.value === d.value) || (d.selectedIndex = 0);
                };
                t.forEach(e => {
                    const t = document.createElement("option");
                    t.value = e.key, t.textContent = e.label, p.appendChild(t);
                });
                const C = () => {
                    const e = t.find(e => e.key === p.value);
                    m.value = _[p.value] || "", m.placeholder = e?.placeholder || "";
                };
                p.addEventListener("change", C), m.addEventListener("input", () => {
                    _[p.value] = i(m.value), S();
                }), a.forEach((e, t) => {
                    const n = document.createElement("option");
                    n.value = String(t), n.textContent = e, u.appendChild(n);
                }), l.forEach(e => {
                    const t = document.createElement("option");
                    t.value = e.key, t.textContent = e.label, h.appendChild(t);
                }), u.value = String(GM_getValue("default_search_engine", 2)), c.setSelectValue(h, n.defaultVideoEngine, "missav"), 
                f && (f.value = "115master" === n.pan115Player ? "115master" : "official"), g.checked = n.magnetTable, 
                x.nyaa.checked = n.btnShowNyaa, x.javbus.checked = n.btnShowJavbus, x.javdb.checked = n.btnShowJavdb, 
                x.missav.checked = n.btnShowMissav, x.fanza.checked = n.btnShowFanza, x.search.checked = n.btnShowSearch, 
                x.trailer.checked = n.btnShowTrailer, x.preview.checked = n.btnShowPreview;
                const E = () => {
                    j.innerHTML = "", k.forEach((e, t) => {
                        const n = r[e], a = document.createElement("div");
                        a.className = "sp-order-item", a.dataset.src = e, a.innerHTML = `\n                        <div><div class="sp-order-name">${n.label}</div></div>\n                        <span class="sp-dot" style="background:${n.color}"></span>\n                        <div class="sp-order-actions">\n                            <button class="sp-order-btn" type="button" data-dir="-1" title="上移" ${0 === t ? "disabled" : ""}>↑</button>\n                            <button class="sp-order-btn" type="button" data-dir="1" title="下移" ${t === k.length - 1 ? "disabled" : ""}>↓</button>\n                        </div>`, 
                        j.appendChild(a);
                    });
                };
                j.addEventListener("click", e => {
                    const t = e.target.closest(".sp-order-btn");
                    if (!t) return;
                    const n = t.closest(".sp-order-item"), a = k.indexOf(n?.dataset.src), r = a + parseInt(t.dataset.dir, 10);
                    a < 0 || r < 0 || r >= k.length || ([k[a], k[r]] = [ k[r], k[a] ], E());
                });
                const q = (e, t, n) => {
                    e && (e.classList.remove("is-done"), e.classList.add("is-clearing"), setTimeout(() => {
                        e.classList.remove("is-clearing"), e.classList.add("is-done"), w.textContent = n ? `${t} ${n} 项` : `${t}无缓存`, 
                        setTimeout(() => e.classList.remove("is-done"), 900), setTimeout(() => {
                            w.textContent = "";
                        }, 1800);
                    }, 260));
                };
                v.addEventListener("click", () => {
                    const e = c.clearSessionByPrefixes([ "thumb_cache_" ]);
                    q(v, "预览图已清理", e);
                }), b.addEventListener("click", () => {
                    const e = c.clearSessionByPrefixes([ "trailer_cache_" ]);
                    q(b, "预告片已清理", e);
                }), y.addEventListener("click", () => {
                    const e = c.clearSessionByPrefixes([ "thumb_cache_", "trailer_cache_", "pan115_cache_" ]);
                    w.textContent = e ? `已清空 ${e} 项` : "无缓存", setTimeout(() => {
                        w.textContent = "";
                    }, 1800);
                }), p.value = "javdbSearchUrl", C(), S(), E();
                const A = () => o.remove();
                s.querySelector(".sp-close").addEventListener("click", A), s.querySelector(".sp-btn-cancel").addEventListener("click", A), 
                s.querySelector(".sp-btn-save").addEventListener("click", () => {
                    const e = () => JSON.stringify({
                        domains: t.map(e => n[e.key]),
                        defaultEngine: n.defaultEngine,
                        defaultSearchEngine: GM_getValue("default_search_engine", 2),
                        defaultVideoEngine: n.defaultVideoEngine,
                        columns: {
                            javbus: n.javbusCardColumns,
                            javdb: n.javdbCardColumns,
                            javlib: n.javlibCardColumns
                        },
                        magnetTable: n.magnetTable,
                        infiniteScroll: n.infiniteScroll,
                        buttons: {
                            nyaa: n.btnShowNyaa,
                            javbus: n.btnShowJavbus,
                            javdb: n.btnShowJavdb,
                            missav: n.btnShowMissav,
                            fanza: n.btnShowFanza,
                            search: n.btnShowSearch,
                            trailer: n.btnShowTrailer,
                            preview: n.btnShowPreview
                        },
                        thumbOrder: GM_getValue("thumb_source_order", [ "javfree", "projectjav", "javstore" ])
                    }), a = e(), r = n.pan115Player, o = "115master" === f?.value ? "115master" : "official";
                    t.forEach(e => {
                        n[e.key] = i(_[e.key]);
                    }), n.defaultEngine = d.value, GM_setValue("default_search_engine", parseInt(u.value, 10) || 0), 
                    n.defaultVideoEngine = h.value || "missav", n.pan115Player = o, n.magnetTable = g.checked, 
                    n.btnShowNyaa = x.nyaa.checked, n.btnShowJavbus = x.javbus.checked, n.btnShowJavdb = x.javdb.checked, 
                    n.btnShowMissav = x.missav.checked, n.btnShowFanza = x.fanza.checked, n.btnShowSearch = x.search.checked, 
                    n.btnShowTrailer = x.trailer.checked, n.btnShowPreview = x.preview.checked, GM_setValue("thumb_source_order", k);
                    const s = r !== o, l = a !== e();
                    A(), l ? location.reload() : s && ae.syncPan115(n.btnShowPan115);
                });
            }
        };
    })();
    s.expose("__LAOSIJI_OPEN_SETTINGS__", () => g.open()), GM_registerMenuCommand("⚙️ 老司机设置", () => g.open());
    const v = (() => {
        const e = {
            javbus: "JavBus",
            javdb: "JavDB",
            javlib: "JavLibrary"
        };
        return {
            open: function(t = null) {
                document.getElementById("jav-quick-settings-popover")?.remove(), "1" !== document.documentElement.dataset.laosijiQuickSettingsStyle && (document.documentElement.dataset.laosijiQuickSettingsStyle = "1", 
                GM_addStyle("\n                #jav-quick-settings-popover {\n                    position: fixed;\n                    z-index: 10000030;\n                    width: 286px;\n                    padding: 10px;\n                    border: 1px solid rgba(203,213,225,.85);\n                    border-radius: 10px;\n                    background: rgba(255,255,255,.985);\n                    color: #0f172a;\n                    box-shadow: 0 12px 28px rgba(15,23,42,.16);\n                    backdrop-filter: blur(6px);\n                    font-family: -apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif;\n                    box-sizing: border-box;\n                }\n                #jav-quick-settings-popover * { box-sizing: border-box; }\n                #jav-quick-settings-popover .qs-head {\n                    display: flex;\n                    align-items: center;\n                    justify-content: space-between;\n                    gap: 10px;\n                    margin-bottom: 8px;\n                }\n                #jav-quick-settings-popover .qs-title {\n                    font-size: 13px;\n                    font-weight: 800;\n                    color: #1e293b;\n                }\n                #jav-quick-settings-popover .qs-site {\n                    margin-top: 1px;\n                    font-size: 11px;\n                    font-weight: 650;\n                    color: #64748b;\n                }\n                #jav-quick-settings-popover .qs-close {\n                    width: 24px;\n                    height: 24px;\n                    border: 1px solid #cbd5e1;\n                    border-radius: 6px;\n                    background: #fff;\n                    color: #64748b;\n                    cursor: pointer;\n                    line-height: 1;\n                    font-size: 14px;\n                }\n                #jav-quick-settings-popover .qs-close:hover { color: #1d4ed8; border-color: #93c5fd; background: #eff6ff; }\n                #jav-quick-settings-popover .qs-row {\n                    display: grid;\n                    grid-template-columns: 72px 1fr 42px;\n                    align-items: center;\n                    gap: 9px;\n                    padding: 4px 0;\n                    border: 0;\n                    border-radius: 0;\n                    background: transparent;\n                }\n                #jav-quick-settings-popover .qs-row + .qs-row { margin-top: 4px; }\n                #jav-quick-settings-popover .qs-detail-flex {\n                    display: none;\n                    margin-top: 8px;\n                    padding-top: 7px;\n                    border-top: 1px solid #e2e8f0;\n                }\n                #jav-quick-settings-popover .qs-detail-flex.is-visible { display: block; }\n                #jav-quick-settings-popover .qs-section-title {\n                    margin-bottom: 3px;\n                    font-size: 12px;\n                    font-weight: 850;\n                    color: #1e293b;\n                }\n                #jav-quick-settings-popover .qs-row.is-disabled {\n                    opacity: .48;\n                }\n                #jav-quick-settings-popover .qs-row.is-disabled .qs-range {\n                    cursor: not-allowed;\n                    background: #e2e8f0;\n                }\n                #jav-quick-settings-popover .qs-row.is-disabled .qs-range::-webkit-slider-thumb {\n                    background: #94a3b8;\n                    cursor: not-allowed;\n                }\n                #jav-quick-settings-popover .qs-row.is-disabled .qs-range::-moz-range-thumb {\n                    background: #94a3b8;\n                    cursor: not-allowed;\n                }\n                #jav-quick-settings-popover .qs-switch-grid {\n                    display: grid;\n                    grid-template-columns: 1fr;\n                    gap: 6px;\n                    margin-top: 6px;\n                }\n                #jav-quick-settings-popover .qs-switch-row {\n                    display: flex;\n                    align-items: center;\n                    justify-content: space-between;\n                    gap: 8px;\n                    padding: 0;\n                    border: 0;\n                    border-radius: 0;\n                    background: transparent;\n                }\n                #jav-quick-settings-popover .qs-name {\n                    font-size: 12px;\n                    font-weight: 750;\n                    color: #334155;\n                    white-space: nowrap;\n                }\n                #jav-quick-settings-popover .qs-value {\n                    display: grid;\n                    place-items: center;\n                    min-width: 34px;\n                    height: 22px;\n                    border-radius: 999px;\n                    background: #fff;\n                    color: #1d4ed8;\n                    font-size: 12px;\n                    font-weight: 800;\n                    border: 1px solid #dbeafe;\n                }\n                #jav-quick-settings-popover .qs-range {\n                    -webkit-appearance: none;\n                    appearance: none;\n                    width: 100%;\n                    height: 5px;\n                    border-radius: 999px;\n                    background: linear-gradient(90deg,#93c5fd 0%,#dbeafe 100%);\n                    outline: none;\n                }\n                #jav-quick-settings-popover .qs-range::-webkit-slider-thumb {\n                    -webkit-appearance: none;\n                    appearance: none;\n                    width: 16px;\n                    height: 16px;\n                    border-radius: 50%;\n                    border: 2px solid #fff;\n                    background: #2563eb;\n                    box-shadow: 0 3px 8px rgba(37,99,235,.22);\n                    cursor: pointer;\n                }\n                #jav-quick-settings-popover .qs-range::-moz-range-thumb {\n                    width: 16px;\n                    height: 16px;\n                    border: none;\n                    border-radius: 50%;\n                    background: #2563eb;\n                    box-shadow: 0 3px 8px rgba(37,99,235,.22);\n                    cursor: pointer;\n                }\n                #jav-quick-settings-popover .qs-toggle {\n                    position: relative;\n                    display: inline-block;\n                    width: 36px;\n                    height: 20px;\n                    flex: 0 0 auto;\n                }\n                #jav-quick-settings-popover .qs-toggle input {\n                    opacity: 0;\n                    width: 0;\n                    height: 0;\n                }\n                #jav-quick-settings-popover .qs-toggle-track {\n                    position: absolute;\n                    inset: 0;\n                    border-radius: 999px;\n                    background: #cbd5e1;\n                    cursor: pointer;\n                    transition: background .18s;\n                }\n                #jav-quick-settings-popover .qs-toggle-track::before {\n                    content: '';\n                    position: absolute;\n                    width: 14px;\n                    height: 14px;\n                    left: 3px;\n                    top: 3px;\n                    border-radius: 50%;\n                    background: #fff;\n                    box-shadow: 0 1px 3px rgba(15,23,42,.22);\n                    transition: transform .18s;\n                }\n                #jav-quick-settings-popover .qs-toggle input:checked + .qs-toggle-track {\n                    background: #2563eb;\n                }\n                #jav-quick-settings-popover .qs-toggle input:checked + .qs-toggle-track::before {\n                    transform: translateX(14px);\n                }\n                #jav-quick-settings-popover .qs-footer {\n                    display: flex;\n                    justify-content: flex-end;\n                    gap: 8px;\n                    margin-top: 8px;\n                    padding-top: 8px;\n                    border-top: 1px solid #e2e8f0;\n                }\n                #jav-quick-settings-popover .qs-more {\n                    height: 28px;\n                    padding: 0 12px;\n                    border: 1px solid #c7d2fe;\n                    border-radius: 7px;\n                    background: #eef2ff;\n                    color: #4338ca;\n                    font-size: 11px;\n                    font-weight: 800;\n                    cursor: pointer;\n                }\n                #jav-quick-settings-popover .qs-more:hover { background: #e0e7ff; border-color: #a5b4fc; }\n            "));
                const o = a.detectCurrentSite() || r.detectCurrentSite();
                if (!o) return void g.open();
                const s = document.createElement("div");
                s.id = "jav-quick-settings-popover", s.innerHTML = `\n                <div class="qs-head">\n                    <div>\n                        <div class="qs-title">快捷设置</div>\n                        <div class="qs-site">${e[o] || "当前站点"}</div>\n                    </div>\n                    <button class="qs-close" type="button" title="关闭">×</button>\n                </div>\n                <div class="qs-row">\n                    <div class="qs-name">卡片列数</div>\n                    <input class="qs-range" id="qs-columns" type="range" min="2" max="10" step="1">\n                    <span class="qs-value" id="qs-columns-value">5</span>\n                </div>\n                <div class="qs-row">\n                    <div class="qs-name">页面宽度</div>\n                    <input class="qs-range" id="qs-zoom" type="range" min="60" max="100" step="1">\n                    <span class="qs-value" id="qs-zoom-value">100%</span>\n                </div>\n                <div class="qs-detail-flex" id="qs-detail-flex">\n                    <div class="qs-section-title">详情比例</div>\n                    <div class="qs-row" data-detail-flex-row="cover">\n                        <div class="qs-name">封面</div>\n                        <input class="qs-range" id="qs-detail-cover" type="range" min="50" max="200" step="5">\n                        <span class="qs-value" id="qs-detail-cover-value">1.0</span>\n                    </div>\n                    <div class="qs-row" data-detail-flex-row="info">\n                        <div class="qs-name">信息</div>\n                        <input class="qs-range" id="qs-detail-info" type="range" min="50" max="200" step="5">\n                        <span class="qs-value" id="qs-detail-info-value">1.0</span>\n                    </div>\n                    <div class="qs-row" data-detail-flex-row="magnet">\n                        <div class="qs-name">磁力</div>\n                        <input class="qs-range" id="qs-detail-magnet" type="range" min="50" max="200" step="5">\n                        <span class="qs-value" id="qs-detail-magnet-value">关闭</span>\n                    </div>\n                </div>\n                <div class="qs-switch-grid">\n                    <div class="qs-switch-row">\n                        <div class="qs-name">115匹配</div>\n                        <label class="qs-toggle">\n                            <input id="qs-pan115" type="checkbox">\n                            <span class="qs-toggle-track"></span>\n                        </label>\n                    </div>\n                    <div class="qs-switch-row">\n                        <div class="qs-name">瀑布流</div>\n                        <label class="qs-toggle">\n                            <input id="qs-infinite-scroll" type="checkbox">\n                            <span class="qs-toggle-track"></span>\n                        </label>\n                    </div>\n                    <div class="qs-switch-row">\n                        <div class="qs-name">快捷预览图</div>\n                        <label class="qs-toggle">\n                            <input id="qs-list-preview" type="checkbox">\n                            <span class="qs-toggle-track"></span>\n                        </label>\n                    </div>\n                    <div class="qs-switch-row">\n                        <div class="qs-name">预览图直显</div>\n                        <label class="qs-toggle">\n                            <input id="qs-detail-preview-inline" type="checkbox">\n                            <span class="qs-toggle-track"></span>\n                        </label>\n                    </div>\n                </div>\n                <div class="qs-footer">\n                    <button class="qs-more" type="button">更多设置</button>\n                </div>\n            `, 
                document.body.appendChild(s);
                const l = () => s.remove(), d = s.querySelector("#qs-columns"), p = s.querySelector("#qs-columns-value"), m = s.querySelector("#qs-zoom"), u = s.querySelector("#qs-zoom-value"), h = s.querySelector("#qs-pan115"), v = s.querySelector("#qs-infinite-scroll"), b = s.querySelector("#qs-list-preview"), f = s.querySelector("#qs-detail-preview-inline"), x = i.detectCurrentSite(), y = s.querySelector("#qs-detail-flex"), w = {
                    cover: s.querySelector("#qs-detail-cover"),
                    info: s.querySelector("#qs-detail-info"),
                    magnet: s.querySelector("#qs-detail-magnet")
                }, j = {
                    cover: s.querySelector("#qs-detail-cover-value"),
                    info: s.querySelector("#qs-detail-info-value"),
                    magnet: s.querySelector("#qs-detail-magnet-value")
                }, _ = e => (i.clamp(e) / 100).toFixed(2).replace(/\.?0+$/, ""), k = () => {
                    const e = x && i.hasMagnet(x), t = s.querySelector('[data-detail-flex-row="magnet"]');
                    return t && t.classList.toggle("is-disabled", !e), w.magnet && (w.magnet.disabled = !e), 
                    j.magnet && !e && (j.magnet.textContent = n.magnetTable ? "未渲染" : "关闭"), e;
                };
                if (c.bindRange(d, p, a.get(o), e => String(a.clamp(e)), e => {
                    const t = a.clamp(e);
                    a.set(o, t), a.apply(o, t);
                }), c.bindRange(m, u, r.get(o), e => `${r.clamp(e)}%`, e => {
                    const t = r.clamp(e);
                    r.set(o, t), r.apply(o, t);
                }), x && i.hasLayout(x)) {
                    const e = i.get(x);
                    y?.classList.add("is-visible"), Object.entries(w).forEach(([t, n]) => {
                        const a = j[t];
                        n && a && c.bindRange(n, a, e[t], _, e => {
                            if ("magnet" === t && !k()) return;
                            const n = i.clamp(e);
                            a.textContent = _(n), i.set(x, t, n), i.apply(x);
                        });
                    }), k();
                }
                c.bindCheckbox(h, n.btnShowPan115, e => {
                    n.btnShowPan115 = e, ae.syncPan115(e);
                }), c.bindCheckbox(v, n.infiniteScroll, e => {
                    n.infiniteScroll = e, ae.syncInfiniteScroll(e);
                }), c.bindCheckbox(b, n.listPreviewQuick, e => {
                    n.listPreviewQuick = e, ae.syncListPreview();
                }), c.bindCheckbox(f, n.detailPreviewInline, e => {
                    n.detailPreviewInline = e, ae.syncDetailPreview();
                }), c.click(s.querySelector(".qs-close"), l), c.click(s.querySelector(".qs-more"), () => {
                    l(), g.open();
                }), s.addEventListener("click", e => e.stopPropagation()), setTimeout(() => {
                    const e = t => {
                        s.contains(t.target) || (l(), document.removeEventListener("click", e, !0));
                    };
                    document.addEventListener("click", e, !0);
                }, 0), function(e, t) {
                    const n = t?.getBoundingClientRect?.(), a = e.offsetWidth || 286, r = e.offsetHeight || 150;
                    let i = n ? n.right - a : window.innerWidth - a - 18, o = n ? n.bottom + 8 : 64;
                    i = Math.max(10, Math.min(i, window.innerWidth - a - 10)), o = Math.max(10, Math.min(o, window.innerHeight - r - 10)), 
                    e.style.left = `${i}px`, e.style.top = `${o}px`;
                }(s, t);
            }
        };
    })();
    s.expose("__LAOSIJI_OPEN_QUICK_SETTINGS__", e => v.open(e));
    const b = (() => {
        const e = {
            getAll: () => ({
                [n.javdbSearchUrl]: u,
                [n.ciligouUrl]: b,
                [n.btdigUrl]: f,
                [n.btsearchUrl]: y,
                [n.sukebeiUrl]: w,
                [n.sokittyUrl]: j
            }),
            getCurrent() {
                const e = this.getAll(), t = n.defaultEngine;
                return e[t] ? {
                    key: t,
                    fn: e[t]
                } : {
                    key: Object.keys(e)[0],
                    fn: Object.values(e)[0]
                };
            }
        }, t = "https://jdforrepam.com/api", a = "71cf27bb3c0bcdf207b64abecddc970098c7421ee7203b9cdae54478478a199e7d5a6e1a57691123c1a931c057842fb73ba3b3c83bcd69c17ccf174081e3d8aa";
        let r = {
            ts: 0,
            sign: ""
        };
        function i(e) {
            const t = (new TextEncoder).encode(e), n = t.length, a = 1 + (n + 8 >> 6), r = new Uint32Array(16 * a), i = [], o = [ 7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21 ];
            for (let e = 0; e < 64; e++) i[e] = Math.floor(2 ** 32 * Math.abs(Math.sin(e + 1)));
            for (let e = 0; e < n; e++) r[e >> 2] |= t[e] << (e % 4 << 3);
            r[n >> 2] |= 128 << (n % 4 << 3), r[16 * a - 2] = 8 * n;
            let [s, l, c, d] = [ 1732584193, 4023233417, 2562383102, 271733878 ];
            for (let e = 0; e < a; e++) {
                const t = r.slice(16 * e, 16 * (e + 1));
                let [n, a, p, m] = [ s, l, c, d ];
                for (let e = 0; e < 64; e++) {
                    const r = Math.floor(e / 16), s = [ e, (5 * e + 1) % 16, (3 * e + 5) % 16, 7 * e % 16 ][r], l = n + [ a & p | ~a & m, m & a | ~m & p, a ^ p ^ m, p ^ (a | ~m) ][r] + i[e] + t[s] | 0, c = o[r << 2 | e % 4], d = m;
                    m = p, p = a, a = a + (l << c | l >>> 32 - c) | 0, n = d;
                }
                s = s + n | 0, l = l + a | 0, c = c + p | 0, d = d + m | 0;
            }
            return [ s, l, c, d ].map(e => new Uint32Array([ e ])).map(e => new Uint8Array(e.buffer)).map(e => Array.from(e, e => e.toString(16).padStart(2, "0")).join("")).join("");
        }
        function s() {
            const e = Math.floor(Date.now() / 1e3);
            return r.sign && e - r.ts <= 20 || (r = {
                ts: e,
                sign: `${e}.lpw6vgqzsp.${i(`${e}${a}`)}`
            }), r.sign;
        }
        function l(e) {
            try {
                return JSON.parse(e || "{}");
            } catch {
                return null;
            }
        }
        function c(e) {
            const t = Number(e);
            return !Number.isFinite(t) || t <= 0 ? "" : t >= 1024 ? `${(t / 1024).toFixed(t >= 10240 ? 1 : 2)} GB` : `${Math.round(t)} MB`;
        }
        async function u(e) {
            const a = "https://" + n.javdbSearchUrl, r = {
                accept: "application/json",
                jdSignature: s()
            }, i = new URLSearchParams({
                q: e,
                page: "1",
                type: "movie",
                limit: "5",
                movie_type: "all",
                from_recent: "false",
                movie_filter_by: "all",
                movie_sort_by: "relevance"
            }), o = `${t}/v2/search?${i.toString()}`, d = await m(o, {
                headers: r
            });
            if (!d.loadstuts || d.status < 200 || d.status >= 400) return {
                url: a,
                data: []
            };
            const p = l(d.responseText), u = Array.isArray(p?.data?.movies) ? p.data.movies : [], h = String(e || "").toUpperCase().replace(/[^A-Z0-9]/g, ""), g = u.find(e => {
                const t = String(e?.number || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
                return t && t === h;
            }) || u[0];
            if (!g?.id) return {
                url: a,
                data: []
            };
            const v = `${a}/v/${g.id}`, b = `${t}/v1/movies/${encodeURIComponent(g.id)}/magnets`, f = await m(b, {
                headers: {
                    ...r,
                    jdSignature: s()
                }
            });
            if (!f.loadstuts || f.status < 200 || f.status >= 400) return {
                url: v,
                data: []
            };
            const x = l(f.responseText), y = (Array.isArray(x?.data?.magnets) ? x.data.magnets : []).map(t => {
                const n = String(t?.hash || "").trim();
                return n ? {
                    title: [ String(t?.name || g.number || e).trim(), t?.cnsub ? "-CH" : "", t?.hd ? "HD" : "", t?.files_count ? `${t.files_count} files` : "", t?.created_at || "" ].filter(Boolean).join(" "),
                    maglink: `magnet:?xt=urn:btih:${n}`,
                    size: c(t?.size),
                    src: v,
                    cnsub: Boolean(t?.cnsub),
                    hd: Boolean(t?.hd)
                } : null;
            }).filter(Boolean);
            return {
                url: v,
                data: y
            };
        }
        function h() {
            return localStorage.getItem("jhs_appAuthorization") || localStorage.getItem("javdb_appAuthorization") || GM_getValue("javdb_app_authorization", "");
        }
        async function g(e, n = {}, a = {}) {
            const r = new URLSearchParams(n).toString(), i = `${t}${e}${r ? `?${r}` : ""}`, o = await m(i, {
                headers: {
                    accept: "application/json",
                    "accept-language": "zh-TW",
                    "user-agent": "Dart/3.5 (dart:io)",
                    jdSignature: s(),
                    ...a
                },
                timeout: 2e4
            });
            if (!o.loadstuts || o.status < 200 || o.status >= 400) throw new Error(`JavDB API 请求失败: HTTP ${o.status || 0}`);
            const c = l(o.responseText);
            if (!c) throw new Error("JavDB API 返回异常");
            return c;
        }
        const v = {
            token: h,
            async top250({category: e = "all", year: t = "", page: n = 1, limit: a = 50} = {}) {
                const r = {
                    start_rank: 1,
                    ignore_watched: "false",
                    page: n,
                    limit: a
                };
                return e && "all" !== e ? (r.type = "video_type", r.type_value = e, t && (r.year = t)) : t ? (r.type = "year", 
                r.type_value = t) : (r.type = "all", r.type_value = ""), g("/v1/movies/top", r, function() {
                    const e = h();
                    return e ? {
                        authorization: /^bearer\s+/i.test(e) ? e : `Bearer ${e}`
                    } : {};
                }());
            },
            async fc2({period: e = "daily", page: t = 1, limit: n = 40} = {}) {
                const a = await g("/v1/rankings", {
                    period: e,
                    type: "3"
                });
                if (1 !== a.success) return a;
                const r = Array.isArray(a?.data?.movies) ? a.data.movies : [], i = (Math.max(1, parseInt(t, 10) || 1) - 1) * n, o = r.slice(i, i + n);
                return {
                    success: 1,
                    data: {
                        movies: o,
                        total: o.length
                    }
                };
            },
            movieDetail: async e => g(`/v4/movies/${encodeURIComponent(e)}`)
        };
        async function b(e) {
            const t = "https://" + n.ciligouUrl, a = btoa(unescape(encodeURIComponent(e))).replace(/=+$/, ""), r = `${t}/search?word=${a}`, i = await m(r, {
                headers: {
                    Referer: t + "/",
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
                }
            });
            if (!i.loadstuts) return {
                url: r,
                data: []
            };
            const o = p(i.responseText), s = [];
            return o.querySelectorAll("#Search_list_wrapper li").forEach(e => {
                const n = e.querySelector("a.SearchListTitle_result_title");
                if (!n) return;
                const a = n.getAttribute("href") || "", r = a.split("/").pop();
                if (!r) return;
                const i = `magnet:?xt=urn:btih:${r}`, o = t + a, l = n.textContent.trim(), c = (e.querySelector(".Search_list_info")?.textContent || "").match(/文件大小：([^\s]+)/), d = c ? c[1] : "";
                s.push({
                    title: l,
                    maglink: i,
                    size: d,
                    src: o
                });
            }), {
                url: r,
                data: s
            };
        }
        async function f(e) {
            const t = "https://" + n.btdigUrl, a = await m(`${t}/search?q=${e}`);
            if (!a.loadstuts) return {
                url: t,
                data: []
            };
            const r = [ ...p(a.responseText).querySelectorAll("div.one_result") ].map(e => ({
                title: e.querySelector(".torrent_name a")?.textContent?.trim() || "",
                maglink: e.querySelector(".fa.fa-magnet a")?.href || "",
                size: e.querySelector(".torrent_size")?.textContent?.trim() || "",
                src: e.querySelector(".torrent_name a")?.href || ""
            }));
            return {
                url: a.finalUrl || t,
                data: r
            };
        }
        function x(e, t) {
            const n = Math.floor(Date.now() / 1e3).toString(), a = function(e = 8) {
                let t = "";
                for (let n = 0; n < e; n++) t += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(62 * Math.random()));
                return t;
            }(), r = [ `timestamp=${n}`, `nonce=${a}` ];
            return Object.keys(e).forEach(t => r.push(`${t}=${e[t]}`)), {
                Accept: "application/json, text/plain, */*",
                Referer: t,
                "x-timestamp": n,
                "x-nonce": a,
                "x-sign": i(`${r.sort().join("&")}&key=long2ice`).toUpperCase()
            };
        }
        async function y(e) {
            const t = "https://" + n.btsearchUrl, a = `${t}/search?keyword=${encodeURIComponent(e)}`, r = {
                keyword: e,
                limit: "10",
                offset: "0",
                mode: "",
                time: "",
                sort: "size",
                sort_type: "desc",
                size: ""
            }, i = `${t}/api/search?${new URLSearchParams(r).toString()}`, o = await m(i, {
                headers: x(r, a)
            });
            if (!o.loadstuts || o.status < 200 || o.status >= 400) return {
                url: a,
                data: []
            };
            const s = (c = l(o.responseText), Array.isArray(c?.data) ? c.data : Array.isArray(c?.data?.data) ? c.data.data : []).map(n => function(e, t, n, a) {
                const r = function(e) {
                    const t = String(e || "").trim();
                    if (!t) return "";
                    if (!/[<&]/.test(t)) return t.replace(/\s+/g, " ");
                    const n = p(`<body>${t}</body>`);
                    return (n.body?.textContent || t.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
                }(e?.name), i = String(e?.hash || "").replace(/^magnet:\?xt=urn:btih:/i, "").replace(/[^a-z0-9]/gi, "");
                if (!/^[a-f0-9]{32,40}$/i.test(i)) return null;
                const o = `magnet:?xt=urn:btih:${i}`;
                return {
                    title: r || o,
                    maglink: o,
                    size: _(e?.size),
                    src: e?.id ? `${t}/torrent/${encodeURIComponent(e.id)}?keyword=${encodeURIComponent(a)}` : n
                };
            }(n, t, a, e)).filter(Boolean);
            var c;
            return {
                url: a,
                data: s
            };
        }
        async function w(e) {
            const t = "https://" + n.sukebeiUrl, a = await m(`${t}/?f=0&c=0_0&q=${e}`);
            if (!a.loadstuts) return {
                url: t,
                data: []
            };
            const r = [ ...p(a.responseText).querySelectorAll("tr.default, tr.success") ].map(e => ({
                title: e.querySelector("td:nth-child(2)>a:nth-child(1)")?.title || "",
                maglink: e.querySelector("td:nth-child(3)>a:last-child")?.href || "",
                size: e.querySelector("td:nth-child(4)")?.textContent?.trim() || "",
                src: t + (e.querySelector("td:nth-child(2)>a:nth-child(1)")?.getAttribute("href") || "")
            }));
            return {
                url: a.finalUrl || t,
                data: r
            };
        }
        async function j(e) {
            const t = "https://" + n.sokittyUrl, a = `${t}/search?key=${encodeURIComponent(e)}`, r = await m(a, {
                headers: {
                    Referer: t + "/"
                }
            });
            if (!r.loadstuts) return {
                url: a,
                data: []
            };
            const i = p(r.responseText), o = e => e.toUpperCase().replace(/[-_\s]/g, ""), s = o(e), l = [];
            return i.querySelectorAll(".panel.search-panel").forEach(e => {
                const n = e.querySelector("h3.panel-title > a.list-title");
                if (!n) return;
                const a = n.getAttribute("href") || "";
                if (!a.startsWith("/bt/")) return;
                const r = a.replace("/bt/", "");
                if (!r) return;
                const i = n.textContent.trim();
                if (!o(i).includes(s)) return;
                const c = `magnet:?xt=urn:btih:${r}`, d = t + a, p = e.querySelector(".panel-footer .info-item")?.textContent?.trim() || "";
                l.push({
                    title: i,
                    maglink: c,
                    size: p,
                    src: d
                });
            }), {
                url: a,
                data: l
            };
        }
        function _(e) {
            const t = Number(e) || 0;
            if (!t) return "-";
            const n = [ "B", "KB", "MB", "GB", "TB" ];
            let a = t, r = 0;
            for (;a >= 1024 && r < n.length - 1; ) a /= 1024, r += 1;
            return `${a.toFixed(r >= 3 ? 2 : 1)} ${n[r]}`;
        }
        function k(e, t) {
            document.querySelector(".whatslink-overlay")?.remove();
            const n = Array.isArray(e?.screenshots) ? e.screenshots.map(e => e?.screenshot).filter(Boolean) : [];
            let a = 0;
            const r = function(e) {
                const t = String(e?.file_type || e?.type || "").toUpperCase();
                return t.includes("FOLDER") ? "文件夹" : t.includes("FILE") ? "文件" : "-";
            }(e), i = document.createElement("div");
            i.className = "whatslink-overlay";
            const o = document.createElement("section");
            o.className = "whatslink-modal" + (n.length ? "" : " no-shots"), o.innerHTML = `\n                <div class="whatslink-viewer">\n                    <div class="whatslink-stage">\n                        <button class="whatslink-nav whatslink-prev" type="button">‹</button>\n                        <img class="whatslink-hero" alt="截图预览">\n                        <button class="whatslink-nav whatslink-next" type="button">›</button>\n                        <div class="whatslink-counter"></div>\n                        <div class="whatslink-empty">\n                            <div class="whatslink-empty-icon">?</div>\n                            <div class="whatslink-empty-title">暂无截图</div>\n                            <p class="whatslink-empty-text">WhatsLink 已返回资源基础信息，但没有可展示的截图。可以通过名称、大小和文件数量先做基础判断。</p>\n                        </div>\n                    </div>\n                    <div class="whatslink-thumbs"></div>\n                </div>\n                <aside class="whatslink-info">\n                    <div class="whatslink-head">\n                        <div>\n                            <div class="whatslink-kicker">磁力验车</div>\n                            <h2 class="whatslink-title"></h2>\n                            <span class="whatslink-tag"></span>\n                        </div>\n                        <button class="whatslink-close" type="button">×</button>\n                    </div>\n                    <div class="whatslink-meta">\n                        <div class="whatslink-metric"><b>${_(e?.size)}</b><span>资源大小</span></div>\n                        <div class="whatslink-metric"><b>${e?.count ?? "-"}</b><span>文件数量</span></div>\n                        <div class="whatslink-metric"><b>${r}</b><span>资源结构</span></div>\n                        <div class="whatslink-metric"><b>${n.length}</b><span>截图数量</span></div>\n                        <div class="whatslink-metric"><b>${e?.error ? "异常" : "无错误"}</b><span>接口状态</span></div>\n                    </div>\n                    <div class="whatslink-section">\n                        <h3>磁力链接</h3>\n                        <div class="whatslink-magnet"></div>\n                    </div>\n                    <div class="whatslink-summary">\n                        <div class="whatslink-summary-card"><strong>验车结论</strong><p>${n.length ? "WhatsLink 已返回截图，优先用左侧大图确认内容是否匹配番号。" : "当前没有截图，建议结合资源名称、大小和文件数量判断。"}</p></div>\n                    </div>\n                </aside>`, 
            i.appendChild(o), document.body.appendChild(i), o.querySelector(".whatslink-title").textContent = e?.name || "未知资源", 
            o.querySelector(".whatslink-tag").textContent = r, o.querySelector(".whatslink-magnet").textContent = t;
            const s = o.querySelector(".whatslink-hero"), l = o.querySelector(".whatslink-thumbs"), c = o.querySelector(".whatslink-counter"), d = () => {
                n.length && (s.src = n[a], c.textContent = `${a + 1} / ${n.length}`, [ ...l.children ].forEach((e, t) => e.classList.toggle("active", t === a)));
            };
            n.forEach((e, t) => {
                const n = document.createElement("button");
                n.type = "button", n.className = "whatslink-thumb", n.innerHTML = `<img src="${e}" alt="截图 ${t + 1}">`, 
                n.addEventListener("click", () => {
                    a = t, d();
                }), l.appendChild(n);
            }), o.querySelector(".whatslink-prev").addEventListener("click", () => {
                n.length && (a = (a + n.length - 1) % n.length, d());
            }), o.querySelector(".whatslink-next").addEventListener("click", () => {
                n.length && (a = (a + 1) % n.length, d());
            });
            const p = () => i.remove();
            o.querySelector(".whatslink-close").addEventListener("click", p), i.addEventListener("click", e => {
                e.target === i && p();
            }), d();
        }
        async function S(t, a, r) {
            [ ...t.querySelectorAll("tr:not(.nong-head-row)") ].forEach(e => e.remove());
            const i = document.createElement("tr"), s = document.createElement("td");
            s.colSpan = 4, s.id = "jav-nong-notice";
            const l = document.createTextNode("Loading…"), c = t.querySelector("#jav-nong-refresh") || document.createElement("a");
            c.id = "jav-nong-refresh", c.href = "#", c.textContent = "🔄 刷新", c.style.cssText = "display:none;margin-left:8px;color:#e74c3c;font-weight:bold;cursor:pointer;", 
            c.onclick = e => {
                e.preventDefault(), S(t, a, r);
            }, s.appendChild(l), s.appendChild(c), i.appendChild(s), t.appendChild(i);
            let p = !1;
            const u = setTimeout(() => {
                p = !0, l.textContent = "加载超时 ", c.style.display = "inline";
            }, 8e3);
            try {
                const i = e.getAll(), o = i[r] || Object.values(i)[0], {url: s, data: l} = await o(a);
                if (clearTimeout(u), p) return;
                !function(e, t, a) {
                    const r = e => {
                        if (!e) return 0;
                        const t = e.replace(/,/g, "").match(/([\d.]+)\s*(GiB|MiB|KiB|GB|MB|KB|B)?/i);
                        return t ? parseFloat(t[1]) * ({
                            GIB: 1073741824,
                            MIB: 1048576,
                            KIB: 1024,
                            GB: 1073741824,
                            MB: 1048576,
                            KB: 1024,
                            B: 1
                        }[(t[2] || "B").toUpperCase()] || 1) : 0;
                    };
                    t = [ ...t ].sort((e, t) => r(t.size) - r(e.size));
                    const i = e.querySelector("#jav-nong-notice");
                    if (i && i.parentElement.remove(), !t.length) {
                        const t = document.createElement("tr"), r = document.createElement("td");
                        r.colSpan = 4, r.innerHTML = `无搜索结果 <a href="${a}" target="_blank" style="color:red">前往查看</a>`;
                        const i = document.createElement("a");
                        return i.href = "#", i.textContent = " 🔄 刷新", i.style.cssText = "margin-left:8px;color:#e74c3c;font-weight:bold;cursor:pointer;", 
                        i.addEventListener("click", t => {
                            t.preventDefault();
                            const a = e.querySelector("select")?.value || n.defaultEngine;
                            S(e, e.dataset.avid || "", a);
                        }), r.appendChild(i), t.appendChild(r), void e.appendChild(t);
                    }
                    t.forEach(t => {
                        const n = document.createElement("tr");
                        n.setAttribute("data-maglink", t.maglink);
                        const a = document.createElement("td"), r = document.createElement("span");
                        r.className = "nong-magnet-name", r.title = t.title;
                        const i = /[\u4e00-\u9fff]/.test(t.title), o = /[\u3040-\u309f\u30a0-\u30ff]/.test(t.title), s = /(?:[^A-Za-z]|^)FHDC(?:[^A-Za-z]|$)/i.test(t.title) || /[-_]CH?(?:[^A-Za-z]|$)/.test(t.title) || /中字/.test(t.title) || /中文/.test(t.title) || /自提/.test(t.title) || /征用/.test(t.title) || i && !o, l = /(?:[^A-Za-z0-9]|^)4K(?:UHD)?(?:[^A-Za-z0-9]|$)/i.test(t.title);
                        if (s) {
                            const e = document.createElement("span");
                            e.textContent = "[中字]", e.style.cssText = "display:inline-block;margin-right:5px;padding:1px 5px;font-size:11px;font-weight:800;color:#fff;background:#16a34a;border-radius:4px;vertical-align:middle;flex-shrink:0;box-shadow:0 0 0 1px rgba(22,163,74,.18);", 
                            r.appendChild(e), r.style.background = "linear-gradient(90deg,#dcfce7 0%,#f0fdf4 55%,#fff 100%)", 
                            r.style.borderLeft = "4px solid #16a34a", r.style.paddingLeft = "5px";
                        }
                        if (l) {
                            const e = document.createElement("span");
                            e.textContent = "[4K]", e.style.cssText = "display:inline-block;margin-right:5px;padding:1px 5px;font-size:11px;font-weight:800;color:#fff;background:#2563eb;border-radius:4px;vertical-align:middle;flex-shrink:0;box-shadow:0 0 0 1px rgba(37,99,235,.18);", 
                            r.insertBefore(e, r.firstChild), s || (r.style.background = "linear-gradient(90deg,#dbeafe 0%,#eff6ff 55%,#fff 100%)", 
                            r.style.borderLeft = "4px solid #2563eb", r.style.paddingLeft = "5px");
                        }
                        const c = document.createElement("a");
                        c.href = t.src || t.maglink, c.target = "_blank", c.textContent = t.title, r.appendChild(c), 
                        a.appendChild(r), n.appendChild(a);
                        const p = document.createElement("td");
                        p.style.whiteSpace = "nowrap", p.textContent = t.size, n.appendChild(p);
                        const u = document.createElement("td");
                        u.style.whiteSpace = "nowrap";
                        const h = document.createElement("a"), g = t.maglink.substring(0, 60), v = e => {
                            if (!e) return null;
                            const t = [ /FC2[-\s_]?(?:PPV)?[-\s_]?(\d{6,9})/i, /([A-Z]{2,15})-(\d{2,10})(?:-(\d+))?/i, /([A-Z]{2,15})-([A-Z]{0,2}\d{2,10})/i, /^[A-Z0-9]+[-_](\d{6}[-_]\d{2,3})/i, /(\d{6}[-_]\d{2,3})[-_][A-Z0-9]+$/i, /(?<!\w)(\d{6}[-_]\d{2,3})(?!\w)/, /([A-Z]{1,2})(\d{3,4})/i ];
                            for (const n of t) {
                                const t = e.match(n);
                                if (t) return t[0].toUpperCase();
                            }
                            return null;
                        }, b = v(t.title) || v(t.maglink), f = g + (b ? `&dn=${encodeURIComponent(b)}` : "");
                        h.href = g, h.title = g, h.className = "nong-copy", h.textContent = "复制", h.addEventListener("click", e => {
                            e.preventDefault(), GM_setClipboard(f), h.textContent = "✓", setTimeout(() => {
                                h.textContent = "复制";
                            }, 1e3);
                        }), u.appendChild(h);
                        const x = document.createElement("a");
                        x.href = "#", x.className = "nong-check", x.textContent = "验车", x.addEventListener("click", e => {
                            e.preventDefault(), async function(e) {
                                document.querySelector(".whatslink-overlay")?.remove();
                                const t = document.createElement("div");
                                t.className = "whatslink-overlay", t.innerHTML = '<div class="whatslink-modal no-shots"><div class="whatslink-loading">正在验车...</div></div>', 
                                document.body.appendChild(t);
                                try {
                                    const n = `https://whatslink.info/api/v1/link?url=${encodeURIComponent(e)}`, a = await m(n, {
                                        timeout: 2e4
                                    });
                                    if (!a.loadstuts) throw new Error("WhatsLink 请求失败");
                                    const r = JSON.parse(a.responseText || "{}");
                                    t.remove(), k(r, e);
                                } catch (n) {
                                    t.remove(), k({
                                        error: n.message || "查询失败",
                                        name: "查询失败",
                                        type: "-",
                                        file_type: "-",
                                        size: 0,
                                        count: "-",
                                        screenshots: []
                                    }, e);
                                }
                            }(t.maglink);
                        }), u.appendChild(x), n.appendChild(u);
                        const y = document.createElement("td");
                        y.className = "nong-115-cell";
                        const w = document.createElement("a");
                        w.href = "#", w.className = "nong-offline-115", w.textContent = "115", w.addEventListener("click", e => {
                            e.preventDefault(), async function(e) {
                                e = e.substring(0, 60);
                                const t = await m(`http://115.com/?ct=offline&ac=space&_=${Date.now()}`);
                                if (!t.loadstuts) return void d("115 错误", "无法获取token，请检查115是否已登录", "http://115.com/?mode=login");
                                if (t.responseText.includes("html")) return void d("115 未登录", "请先登录115账户后再离线下载", "http://115.com/?mode=login");
                                const n = JSON.parse(t.responseText), a = GM_getValue("jav_115_uid", "");
                                new Promise(t => {
                                    GM_xmlhttpRequest({
                                        method: "POST",
                                        url: "http://115.com/web/lixian/?ct=lixian&ac=add_task_url",
                                        headers: {
                                            "Content-Type": "application/x-www-form-urlencoded"
                                        },
                                        data: `url=${encodeURIComponent(e)}&uid=${a}&sign=${n.sign}&time=${n.time}`,
                                        onload(e) {
                                            const n = JSON.parse(e.responseText);
                                            n.state ? d("115 离线成功", "任务已添加", "http://115.com/?tab=offline&mode=wangpan") : d("115 离线失败", "911" === n.errcode ? "账号使用异常，请手工验证" : n.error_msg || "未知错误", "http://115.com/?tab=offline&mode=wangpan"), 
                                            t();
                                        }
                                    });
                                });
                            }(t.maglink);
                        }), y.appendChild(w), n.appendChild(y), e.appendChild(n);
                    });
                }(t, l, s);
            } catch (e) {
                clearTimeout(u), o("磁力搜索出错:", e), l.textContent = "搜索出错 ", c.style.display = "inline";
            }
        }
        return GM_addStyle('\n            .jav-nong-wrapper {\n                overflow-x: auto !important;\n                overflow-y: hidden !important;\n                scrollbar-width: thin;\n            }\n            #jav-nong-table {\n                width: 100%;\n                min-width: 320px;\n                table-layout: fixed;\n                margin: 8px 0; color: #666;\n                font-size: 13px; text-align: center;\n                background: #f2f2f2; border-collapse: collapse;\n                max-width: 100%;\n            }\n            #jav-nong-table th, #jav-nong-table td {\n                text-align: center; height: 30px;\n                background: #fff; padding: 0 6px;\n                border: 1px solid #efefef;\n                overflow: hidden;\n                text-overflow: ellipsis;\n                white-space: nowrap;\n            }\n            #jav-nong-table th:nth-child(2), #jav-nong-table td:nth-child(2) { width: 74px; }\n            #jav-nong-table th:nth-child(3), #jav-nong-table td:nth-child(3) { width: 74px; }\n            #jav-nong-table th:nth-child(4), #jav-nong-table td:nth-child(4) { width: 48px; }\n            #jav-nong-table:has(td.mag-laosiji-ready-cell) th:nth-child(3),\n            #jav-nong-table:has(td.mag-laosiji-ready-cell) td:nth-child(3) {\n                width: 104px;\n            }\n            #jav-nong-table td.mag-laosiji-ready-cell {\n                overflow: visible;\n            }\n            #jav-nong-table td:first-child {\n                text-align: left;\n            }\n            #jav-nong-table .nong-head-row th { background: #f8f8f8; font-weight: 600; }\n            #jav-nong-table .nong-magnet-name {\n                display: flex;\n                align-items: center;\n                gap: 4px;\n                min-width: 0;\n                width: 100%;\n                max-width: 100%;\n                white-space: nowrap;\n                overflow: hidden;\n                text-overflow: ellipsis;\n            }\n            #jav-nong-table .nong-magnet-name > a {\n                flex: 1 1 auto;\n                min-width: 0;\n                display: block;\n                overflow: hidden;\n                text-overflow: ellipsis;\n                white-space: nowrap;\n            }\n            .nong-copy { color: #08c !important; cursor: pointer; }\n            .nong-check { color: #be185d !important; cursor: pointer; margin-left: 8px; }\n            .nong-offline-115 { color: rgb(0,180,30) !important; cursor: pointer; }\n            .nong-offline-115:hover { color: red !important; }\n            .whatslink-overlay { position: fixed; inset: 0; z-index: 10000040; display: flex; align-items: center; justify-content: center; padding: 22px; background: rgba(15,23,42,.66); backdrop-filter: blur(8px); }\n            .whatslink-modal { width: min(1100px,96vw); max-height: 90vh; display: grid; grid-template-columns: 1.55fr .75fr; background: #f5f7fb; border: 1px solid rgba(203,213,225,.9); border-radius: 12px; overflow: hidden; box-shadow: 0 30px 80px rgba(2,8,23,.38); font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }\n            .whatslink-modal.no-shots { grid-template-columns: 1.1fr .9fr; }\n            .whatslink-viewer { min-width: 0; display: grid; grid-template-rows: minmax(430px,1fr) auto; gap: 10px; padding: 14px; background: radial-gradient(circle at 20% 0%,#fff1f8 0,transparent 34%),#eef3f8; }\n            .whatslink-stage { position: relative; min-height: 470px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid #dde7f2; border-radius: 12px; background: #111827; box-shadow: 0 18px 36px rgba(15,23,42,.16); }\n            .whatslink-stage img { width: 100%; height: 100%; max-height: 68vh; object-fit: contain; border-radius: 10px; }\n            .whatslink-modal.no-shots .whatslink-viewer { grid-template-rows: minmax(430px,1fr); background: linear-gradient(135deg,#f8fafc,#eef2ff); }\n            .whatslink-modal.no-shots .whatslink-stage { background: linear-gradient(145deg,#fff,#f1f5f9); border-style: dashed; box-shadow: inset 0 0 0 1px rgba(255,255,255,.8),0 18px 36px rgba(15,23,42,.08); }\n            .whatslink-modal.no-shots .whatslink-stage img, .whatslink-modal.no-shots .whatslink-nav, .whatslink-modal.no-shots .whatslink-counter, .whatslink-modal.no-shots .whatslink-thumbs { display: none; }\n            .whatslink-empty { display: none; width: min(420px,72%); text-align: center; color: #475569; }\n            .whatslink-modal.no-shots .whatslink-empty { display: block; }\n            .whatslink-empty-icon { width: 62px; height: 62px; margin: 0 auto 15px; display: grid; place-items: center; border-radius: 18px; background: linear-gradient(135deg,#fce7f3,#e0e7ff); color: #be185d; font-size: 27px; box-shadow: 0 12px 26px rgba(190,24,93,.16); }\n            .whatslink-empty-title { font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 7px; }\n            .whatslink-empty-text { margin: 0; font-size: 13px; line-height: 1.6; }\n            .whatslink-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 38px; height: 52px; border: 0; border-radius: 8px; background: rgba(255,255,255,.14); color: #fff; font-size: 28px; cursor: pointer; }\n            .whatslink-nav:hover { background: rgba(255,255,255,.24); }\n            .whatslink-prev { left: 12px; } .whatslink-next { right: 12px; }\n            .whatslink-counter { position: absolute; right: 14px; bottom: 12px; color: #e2e8f0; font-size: 12px; text-shadow: 0 1px 6px rgba(0,0,0,.6); }\n            .whatslink-thumbs { display: grid; grid-template-columns: repeat(5,1fr); gap: 7px; padding: 0; background: transparent; }\n            .whatslink-thumb { border: 2px solid #e2e8f0; border-radius: 9px; padding: 0; overflow: hidden; background: #fff; cursor: pointer; aspect-ratio: 16 / 9; box-shadow: 0 6px 14px rgba(15,23,42,.08); }\n            .whatslink-thumb.active { border-color: #db2777; box-shadow: 0 8px 18px rgba(219,39,119,.22); }\n            .whatslink-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }\n            .whatslink-info { min-width: 0; padding: 14px; background: #f8fafc; overflow: auto; color: #172033; }\n            .whatslink-head { position: sticky; top: 0; z-index: 2; margin: -14px -14px 12px; padding: 13px 14px; background: rgba(248,250,252,.94); border-bottom: 1px solid #e2e8f0; backdrop-filter: blur(10px); display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }\n            .whatslink-kicker { color: #db2777; font-size: 12px; font-weight: 800; margin-bottom: 5px; }\n            .whatslink-title { margin: 0; font-size: 21px; line-height: 1.18; color: #111827; word-break: break-word; }\n            .whatslink-close { width: 32px; height: 32px; border: 0; border-radius: 8px; color: #64748b; background: transparent; cursor: pointer; font-size: 25px; line-height: 1; }\n            .whatslink-tag { display: inline-flex; align-items: center; min-height: 22px; padding: 0 8px; margin-top: 8px; border-radius: 999px; background: #ecfdf5; color: #047857; font-size: 12px; font-weight: 700; }\n            .whatslink-meta { display: grid; grid-template-columns: 1fr; gap: 7px; margin: 10px 0 12px; }\n            .whatslink-metric { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 10px; border: 1px solid #e2e8f0; border-radius: 11px; background: #fff; box-shadow: 0 8px 20px rgba(15,23,42,.06); }\n            .whatslink-metric b { color: #172033; font-size: 13px; order: 2; }\n            .whatslink-metric span { color: #64748b; font-size: 12px; order: 1; }\n            .whatslink-section, .whatslink-summary-card { border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; padding: 10px; box-shadow: 0 8px 20px rgba(15,23,42,.06); }\n            .whatslink-section h3 { margin: 0 0 8px; color: #be185d; font-size: 12px; }\n            .whatslink-magnet { word-break: break-all; max-height: 86px; overflow: auto; padding: 9px; border-radius: 8px; background: #f6f8fb; color: #334155; font-family: ui-monospace,SFMono-Regular,Consolas,monospace; font-size: 12px; }\n            .whatslink-summary { display: grid; gap: 8px; margin-top: 10px; }\n            .whatslink-summary-card strong { display: block; margin-bottom: 4px; color: #111827; font-size: 12px; }\n            .whatslink-summary-card p { margin: 0; color: #64748b; font-size: 11px; line-height: 1.45; }\n            .whatslink-loading { padding: 28px; text-align: center; color: #475569; font-size: 14px; }\n            #jav-nong-notice {\n                padding: 8px 0;\n            }\n            .nong-magnet-name {\n                max-width: 320px; white-space: nowrap;\n                overflow: hidden; text-overflow: ellipsis;\n                display: flex; align-items: center; text-align: left;\n            }\n            #jav-nong-refresh {\n                display: none; margin-left: 8px;\n                color: #e74c3c; font-weight: bold; cursor: pointer;\n            }\n        '), 
        {
            createMagnetWidget: function(t) {
                const a = document.createElement("div");
                a.className = "jav-nong-wrapper", a.style.cssText = "\n                display: inline-block;\n                width: min(560px, 100%);\n                max-width: 100%;\n                box-sizing: border-box;\n                padding: 12px 12px 10px;\n                background: #fafafa;\n                border: 1px solid #ebebeb;\n                border-radius: 6px;\n                overflow: hidden;\n            ";
                const r = document.createElement("div");
                r.style.cssText = "margin-bottom:10px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;";
                const i = document.createElement("span");
                i.style.cssText = "color:#0066cc;font-size:14px;font-weight:600;", i.textContent = "🔥 磁力搜索", 
                r.appendChild(i), a.appendChild(r);
                const o = function(t) {
                    const a = document.createElement("table");
                    a.id = "jav-nong-table", a.dataset.avid = t;
                    const r = document.createElement("tr");
                    r.className = "nong-head-row";
                    const i = document.createElement("th");
                    i.style.textAlign = "left";
                    const o = e.getAll(), s = n.defaultEngine, l = document.createElement("select");
                    l.style.cssText = "height:22px;font-size:12px;border:1px solid #cbd5e1;border-radius:6px;padding:1px 22px 1px 6px;min-width:84px;background:#fff;color:#172033;font-weight:650;";
                    const c = {
                        [n.javdbSearchUrl]: "JavDB",
                        [n.ciligouUrl]: "CiliGou",
                        [n.btdigUrl]: "BtDig",
                        [n.btsearchUrl]: "BTSearch",
                        [n.sukebeiUrl]: "Sukebei",
                        [n.sokittyUrl]: "SoKitty"
                    };
                    Object.keys(o).forEach(e => {
                        const t = document.createElement("option");
                        t.value = e, t.textContent = c[e] || e, e === s && (t.selected = !0), l.appendChild(t);
                    });
                    const d = () => {
                        l.style.width = "";
                        const e = l.offsetWidth;
                        l.style.width = Math.max(e, 80) + "px";
                    };
                    requestAnimationFrame(d), l.addEventListener("change", () => {
                        S(a, t, l.value), requestAnimationFrame(d);
                    }), i.appendChild(l), r.appendChild(i), [ "大小", "操作", "115" ].forEach(e => {
                        const t = document.createElement("th");
                        t.textContent = e, "115" === e && (t.className = "nong-115-head"), r.appendChild(t);
                    }), a.appendChild(r);
                    const p = document.createElement("tr"), m = document.createElement("td");
                    m.colSpan = 4, m.id = "jav-nong-notice";
                    const u = document.createTextNode("Loading…"), h = document.createElement("a");
                    return h.id = "jav-nong-refresh", h.href = "#", h.textContent = "🔄 刷新", h.title = "网络加载失败，点击重试", 
                    h.addEventListener("click", e => {
                        e.preventDefault(), S(a, t, l.value);
                    }), m.appendChild(u), m.appendChild(h), p.appendChild(m), a.appendChild(p), a;
                }(t);
                return a.appendChild(o), S(o, t, n.defaultEngine), a;
            },
            javdbApi: v
        };
    })(), f = {
        match: () => location.hostname.includes("javbus"),
        getVid: () => u((document.querySelector('meta[name="keywords"]')?.content || "").split(",")[0].trim()),
        isDetailPage: () => !!document.querySelector(".row.movie") && !document.querySelector("#waterfall div.item"),
        initPage(e) {
            if (document.querySelector(".ad-box")?.remove(), this._insertTopSettingsButton(), 
            setTimeout(() => this._insertTopSettingsButton(), 500), document.querySelector("#waterfall div.item")) return void this._initListPage();
            this._insertCopyButton(e);
            const t = i.defaultCss("javbus");
            GM_addStyle(`\n                .container { max-width: 100% !important; width: 100% !important;\n                    padding-left: 20px !important; padding-right: 20px !important; }\n                .row.movie { display: flex !important; gap: 20px !important;\n                    align-items: flex-start !important; flex-wrap: nowrap !important; margin: 0 !important; }\n                .row.movie { --javbus-cover-flex: ${t.cover}; --javbus-info-flex: ${t.info}; --javbus-magnet-flex: ${t.magnet}; }\n                .col-md-9.screencap { flex: var(--javbus-cover-flex) 1 0 !important; min-width: 0 !important;\n                    width: auto !important; float: none !important; padding: 0 !important; }\n                .col-md-3.info { flex: var(--javbus-info-flex) 1 0 !important; min-width: 0 !important;\n                    width: auto !important; float: none !important;\n                    overflow: hidden !important; word-break: break-word !important; }\n                .jav-nong-slot { flex: var(--javbus-magnet-flex) 1 0 !important; min-width: 0 !important; align-self: flex-start !important; overflow: hidden !important; }\n                .jav-nong-wrapper { width: 560px; max-width: 100%; }\n                .screencap img { width: 100%; max-width: 100%; }\n                .footer { padding: 20px 0; }\n            `), 
            this._insertMagnet(e);
        },
        _insertTopSettingsButton() {
            const e = document.querySelector("#navbar");
            if (!e || e.querySelector(".javbus-top-settings-nav")) return;
            const t = [ ...e.querySelectorAll(":scope > ul.nav.navbar-nav.navbar-right") ].find(e => e.querySelector(".glyphicon-magnet") || /\u5df2\u6709\u78c1\u529b/.test(e.textContent || "")), n = document.createElement("ul");
            n.className = "nav navbar-nav navbar-right javbus-top-settings-nav", n.innerHTML = '\n                <li>\n                    <a href="javascript:void(0)" class="javbus-top-settings-btn" title="打开老司机设置">\n                        <span class="glyphicon glyphicon-cog" style="font-size:12px;"></span>\n                        <span class="hidden-md hidden-sm">老司机设置</span>\n                    </a>\n                </li>\n            ', 
            n.querySelector(".javbus-top-settings-btn")?.addEventListener("click", e => {
                e.preventDefault(), e.stopPropagation(), v.open(e.currentTarget);
            }), t ? t.insertAdjacentElement("afterend", n) : e.appendChild(n), "1" !== document.documentElement.dataset.laosijiJavbusTopSettingsStyle && (document.documentElement.dataset.laosijiJavbusTopSettingsStyle = "1", 
            GM_addStyle("\n                #navbar .javbus-top-settings-btn {\n                    color: #2563eb !important;\n                    font-weight: 700 !important;\n                }\n                #navbar .javbus-top-settings-btn:hover {\n                    color: #1d4ed8 !important;\n                    background: rgba(37, 99, 235, .08) !important;\n                }\n            "));
        },
        _insertCopyButton(e) {
            const t = document.querySelector("div[class='col-md-3 info']");
            t && e && h([ ...t.querySelectorAll("p, h3, span") ].find(t => t.textContent.trim().toUpperCase().includes(u(e))) || t.querySelector("h3"), e, null, !0);
        },
        _insertMagnet(e) {
            if (!n.magnetTable) return;
            const t = document.querySelector("div[class='col-md-3 info']");
            if (!t) return;
            document.querySelectorAll(".jav-nong-slot").forEach(e => e.remove());
            const a = b.createMagnetWidget(e), r = document.createElement("div");
            r.className = "jav-nong-slot", r.style.overflow = "hidden", r.appendChild(a), t.after(r);
        },
        _destroyMasonry(e) {
            try {
                const t = window.jQuery || window.$;
                t && t(e).masonry && t(e).masonry("destroy");
            } catch (e) {}
        },
        _swapCover(e) {
            const t = e.getAttribute("src") || "";
            if (!/\/(imgs|pics)\/(thumb|thumbs)\//i.test(t)) return;
            if ("1" === e.dataset.laosijiCoverSwapped) return;
            let n = t.replace(/\/(imgs|pics)\/(thumb|thumbs)\//i, "/$1/cover/");
            /nopic\.jpg/i.test(t) || (n = n.replace(/(\.jpg|\.jpeg|\.png)(?:([?#].*)?)$/i, "_b$1$2")), 
            n !== t && (e.dataset.laosijiCoverSwapped = "1", e.dataset.laosijiThumbSrc = t, 
            e.addEventListener("error", function t() {
                e.removeEventListener("error", t), e.dataset.laosijiThumbSrc && (e.src = e.dataset.laosijiThumbSrc);
            }), e.src = n, e.setAttribute("src", n));
        },
        _decorateCard(e) {
            if (!e) return;
            if ("1" === e.dataset.laosijiGridCard) return void S.attach(e);
            e.dataset.laosijiGridCard = "1", e.classList.add("jav-card", "javbus-grid-card"), 
            e.style.removeProperty("position"), e.style.removeProperty("top"), e.style.removeProperty("left"), 
            e.style.removeProperty("width");
            const t = e.querySelector(":scope > a.movie-box[href]") || e.querySelector("a.movie-box[href]");
            t?.classList.add("jav-card-link", "javbus-card-link");
            const n = e.querySelector(".photo-frame");
            n?.classList.add("jav-card-cover", "javbus-cover-frame");
            const a = n?.querySelector("img[src]") || e.querySelector("img[src]");
            a && (a.removeAttribute("width"), a.removeAttribute("height"), a.classList.add("jav-card-image", "javbus-card-image"), 
            this._swapCover(a));
            const r = e.querySelector(".photo-info");
            r?.classList.add("jav-card-title", "javbus-card-title");
            const i = r?.querySelector(":scope > span") || r;
            if (i && !i.querySelector(":scope > .video-title")) {
                const e = Array.from(i.childNodes), t = [];
                for (const n of e) if (n.nodeType !== Node.ELEMENT_NODE) n.nodeType === Node.TEXT_NODE && (n.textContent.trim() || t.length) && t.push(n); else {
                    if (n.matches("br, .item-tag, date, .jav-pan115-badge")) break;
                    t.push(n);
                }
                if (t.some(e => (e.textContent || "").trim())) {
                    const e = document.createElement("span");
                    for (e.className = "video-title javbus-card-headline", i.insertBefore(e, t[0]), 
                    t.forEach(t => e.appendChild(t)); e.nextSibling?.nodeType === Node.TEXT_NODE && !e.nextSibling.textContent.trim(); ) e.nextSibling.remove();
                    e.nextSibling?.nodeType === Node.ELEMENT_NODE && e.nextSibling.matches("br") && e.nextSibling.remove();
                }
            }
            const o = r?.querySelector("date");
            o && "1" !== o.dataset.laosijiCode && (o.dataset.laosijiCode = "1", o.classList.add("javbus-card-code")), 
            S.attach(e);
        },
        _flattenWaterfall() {
            document.querySelectorAll('[id="waterfall"]').forEach(e => {
                e.querySelectorAll(":scope > #waterfall, :scope > .masonry").forEach(t => {
                    for (;t.firstChild; ) e.insertBefore(t.firstChild, t);
                    t.remove();
                }), e.classList.remove("masonry"), e.style.setProperty("position", "static", "important"), 
                e.style.setProperty("height", "auto", "important"), e.style.setProperty("width", "auto", "important"), 
                e.querySelectorAll(":scope > .item").forEach(e => {
                    e.style.removeProperty("position"), e.style.removeProperty("top"), e.style.removeProperty("left"), 
                    e.style.removeProperty("width");
                });
            });
        },
        _getGridContainer: () => document.querySelector("#waterfall.jav-card-grid") || document.querySelector("#waterfall"),
        _initListPage() {
            this._flattenWaterfall();
            const e = this._getGridContainer();
            if (!e) return;
            this._destroyMasonry(e), e.classList.remove("masonry"), e.style.setProperty("position", "static", "important"), 
            e.style.setProperty("height", "auto", "important"), e.style.setProperty("width", "auto", "important");
            const t = "1" !== e.dataset.laosijiGrid;
            t && (e.dataset.laosijiGrid = "1", e.classList.add("jav-card-grid", "javbus-card-grid")), 
            a.apply("javbus"), e.querySelectorAll(":scope > .item").forEach(e => this._decorateCard(e)), 
            t && GM_addStyle("\n                    .jav-card-grid {\n                        --jav-card-title-size: 15px;\n                        --jav-card-title-line-height: 1.5;\n                        --jav-card-title-lines: 3;\n                        display: grid !important;\n                        grid-template-columns: repeat(var(--jav-card-columns, 5), minmax(0, 1fr)) !important;\n                        gap: 14px !important;\n                        align-items: stretch !important;\n                        width: 100% !important;\n                        height: auto !important;\n                        box-sizing: border-box !important;\n                    }\n                    .jav-card {\n                        position: static !important;\n                        float: none !important;\n                        display: block !important;\n                        width: auto !important;\n                        height: 100% !important;\n                        max-height: none !important;\n                        min-width: 0 !important;\n                        margin: 0 !important;\n                        padding: 0 !important;\n                        box-sizing: border-box !important;\n                        text-align: left !important;\n                        background: #fff !important;\n                        border: 1px solid #e5e7eb !important;\n                        border-radius: 6px !important;\n                        overflow: hidden !important;\n                        box-shadow: 0 1px 4px rgba(15, 23, 42, .08) !important;\n                        transform: translateZ(0) !important;\n                        transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease !important;\n                        will-change: transform !important;\n                    }\n                    .jav-card:hover {\n                        border-color: rgba(37, 99, 235, .35) !important;\n                        box-shadow: 0 10px 24px rgba(15, 23, 42, .16) !important;\n                        transform: translateY(-4px) scale(1.018) !important;\n                        z-index: 2 !important;\n                    }\n                    .jav-card-link {\n                        display: flex !important;\n                        flex-direction: column !important;\n                        height: 100% !important;\n                        max-height: none !important;\n                        overflow: hidden !important;\n                        color: #2563eb !important;\n                        text-decoration: none !important;\n                    }\n                    .jav-card-link:visited { color: #7c3aed !important; }\n                    .jav-card-cover {\n                        display: block !important;\n                        width: 100% !important;\n                        height: auto !important;\n                        aspect-ratio: 800 / 538 !important;\n                        overflow: hidden !important;\n                        background: #f8fafc !important;\n                        border-bottom: 1px solid #f1f5f9 !important;\n                        margin: 0 !important;\n                    }\n                    .jav-card-image {\n                        display: block !important;\n                        width: 100% !important;\n                        height: 100% !important;\n                        max-height: none !important;\n                        object-fit: cover !important;\n                        object-position: center center !important;\n                        background: #f8fafc !important;\n                        border: 0 !important;\n                    }\n                    .jav-card-title {\n                        display: block !important;\n                        width: 100% !important;\n                        max-width: none !important;\n                        height: auto !important;\n                        max-height: none !important;\n                        box-sizing: border-box !important;\n                        flex: 1 1 auto !important;\n                        min-height: 0 !important;\n                        margin: 0 !important;\n                        padding: 7px 8px 9px !important;\n                        overflow: visible !important;\n                        color: inherit !important;\n                        font-size: var(--jav-card-title-size, 15px) !important;\n                        line-height: var(--jav-card-title-line-height, 1.5) !important;\n                        text-align: left !important;\n                        white-space: normal !important;\n                        word-break: break-word !important;\n                    }\n                    .javbus-card-grid {\n                        position: static !important;\n                        --jav-card-columns: 5;\n                        box-sizing: border-box !important;\n                    }\n                    #waterfall.javbus-card-grid {\n                        display: grid !important;\n                        grid-template-columns: repeat(var(--jav-card-columns, 5), minmax(0, 1fr)) !important;\n                        gap: 14px !important;\n                        align-items: stretch !important;\n                        min-height: 0 !important;\n                    }\n                    body .container-fluid {\n                        padding-left: 28px !important;\n                        padding-right: 28px !important;\n                        box-sizing: border-box !important;\n                    }\n                    #waterfall.javbus-card-grid > .item,\n                    .javbus-card-grid .item.javbus-grid-card {\n                        position: static !important;\n                        width: auto !important;\n                        float: none !important;\n                        margin: 0 !important;\n                        top: auto !important;\n                        left: auto !important;\n                    }\n                    .javbus-card-grid .item .jav-card-link.javbus-card-link {\n                        width: 100% !important;\n                        min-width: 0 !important;\n                        margin: 0 !important;\n                        padding: 0 !important;\n                        background: #fff !important;\n                        box-shadow: none !important;\n                        border-radius: 0 !important;\n                        overflow: hidden !important;\n                    }\n                    .javbus-card-grid .item .javbus-cover-frame.photo-frame {\n                        margin: 0 !important;\n                        height: auto !important;\n                    }\n                    .javbus-card-grid .item .javbus-card-image {\n                        height: 100% !important;\n                        margin: 0 !important;\n                    }\n                    .javbus-card-title > span {\n                        display: block !important;\n                    }\n                    .javbus-card-title .video-title {\n                        display: -webkit-box !important;\n                        -webkit-box-orient: vertical !important;\n                        -webkit-line-clamp: var(--jav-card-title-lines, 3) !important;\n                        line-clamp: var(--jav-card-title-lines, 3) !important;\n                        height: calc(var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 3) * 1em) !important;\n                        max-height: calc(var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 3) * 1em) !important;\n                        min-height: calc(var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 3) * 1em) !important;\n                        overflow: hidden !important;\n                        text-overflow: ellipsis !important;\n                        white-space: normal !important;\n                        word-break: break-word !important;\n                        color: inherit !important;\n                        font-size: var(--jav-card-title-size, 15px) !important;\n                        line-height: var(--jav-card-title-line-height, 1.5) !important;\n                        margin-bottom: 6px !important;\n                    }\n                    .javbus-card-grid .item .javbus-card-title .jav-pan115-badge {\n                        display: inline-flex !important;\n                        width: auto !important;\n                        max-width: max-content !important;\n                        float: none !important;\n                        vertical-align: middle !important;\n                        margin: 0 6px 4px 0 !important;\n                    }\n                    .javbus-card-title .item-tag {\n                        margin: 6px 0 4px !important;\n                    }\n                    .javbus-card-title date {\n                        color: #94a3b8 !important;\n                        font-size: 12px !important;\n                    }\n                    .javbus-card-title date.javbus-card-code {\n                        display: inline-block !important;\n                        color: inherit !important;\n                        font-size: 15px !important;\n                        font-weight: 800 !important;\n                        margin-top: 2px !important;\n                    }\n                    @media (max-width: 1100px) {\n                        .javbus-card-grid { --jav-card-columns: 4; }\n                    }\n                    @media (max-width: 820px) {\n                        .javbus-card-grid { --jav-card-columns: 3; }\n                    }\n                    @media (max-width: 560px) {\n                        .javbus-card-grid { --jav-card-columns: 2; gap: 10px !important; }\n                    }\n                "), 
            setTimeout(() => {
                ae.refreshListPage();
            }, 0), setTimeout(() => {
                this._flattenWaterfall(), e.querySelectorAll(":scope > .item").forEach(e => this._decorateCard(e)), 
                ae.syncListPreview();
            }, 450);
        }
    }, x = {
        match: () => location.hostname.includes("javdb"),
        getVid() {
            const e = document.querySelector("a.button.is-white.copy-to-clipboard");
            return u(e?.dataset?.clipboardText || "");
        },
        initPage(e) {
            document.querySelector(".app-desktop-banner")?.remove(), this._dismissOver18Modal(), 
            this._insertTopSettingsButton(), this._installApiRankingShell(), this._hideScriptFc2AdvancedSearchBox(), 
            this._redirectCurrentApiRankingEntry() || (this._getApiRankingShellMode() ? this._initApiRankingShellPage().catch(e => console.warn("[老司机] JavDB API 榜单渲染失败:", e)) : this._getApiDetailShellMode() ? this._initApiDetailShellPage().catch(e => console.warn("[老司机] JavDB API 详情渲染失败:", e)) : location.pathname.startsWith("/v/") ? (this._insertCopyButton(e), 
            this._hideDownloadCorrectionBlock(), GM_addStyle('\n                .container { max-width: 100% !important; }\n                .movie-panel-info { overflow: hidden; word-break: break-word; }\n                .movie-panel-info .panel-block { flex-wrap: wrap; }\n                .movie-panel-info .value { overflow: hidden; word-break: break-word; }\n                .review-buttons > .panel-block:has(a[href="#magnet-links"]),\n                .review-buttons > .panel-block:has(a[href*="/corrections/new"]) { display: none !important; }\n            '), 
            this._ensureDetailLayout(), this._insertMagnet(e)) : this._initListPage());
        },
        _hideDownloadCorrectionBlock() {
            document.querySelectorAll(".review-buttons > .panel-block").forEach(e => {
                e.querySelector('a[href="#magnet-links"], a[href*="/corrections/new"]') && e.remove();
            });
        },
        _dismissOver18Modal() {
            if (!this.match()) return;
            const e = document.querySelector(".modal.is-active.over18-modal");
            if (!e) return;
            const t = e.querySelector('a.button.is-success[href*="/over18?respond=1"]'), n = t?.getAttribute("href") || "";
            n && "1" !== sessionStorage.getItem("javdb_over18_confirming") && (sessionStorage.setItem("javdb_over18_confirming", "1"), 
            GM_xmlhttpRequest({
                method: "GET",
                url: new URL(n, location.origin).href,
                onload: () => sessionStorage.removeItem("javdb_over18_confirming"),
                onerror: () => sessionStorage.removeItem("javdb_over18_confirming"),
                ontimeout: () => sessionStorage.removeItem("javdb_over18_confirming")
            })), e.remove(), document.documentElement.classList.remove("is-clipped"), document.body.classList.remove("is-clipped");
        },
        _escapeHtml: e => String(e ?? "").replace(/[&<>"']/g, e => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[e])),
        _apiRankingShellUrl(e, t = {}) {
            const n = new URLSearchParams;
            return n.set("laosiji_rank", e), "top" === e ? (n.set("lsj_category", t.category || "all"), 
            t.year && n.set("lsj_year", t.year)) : n.set("lsj_period", t.period || "daily"), 
            t.page && t.page > 1 && n.set("lsj_page", String(t.page)), `/advanced_search?${n.toString()}`;
        },
        _apiDetailShellUrl(e) {
            const t = String(e || "").trim();
            return t ? `/advanced_search?laosiji_detail=fc2&movie_id=${encodeURIComponent(t)}` : "";
        },
        _getApiDetailShellMode() {
            if ("/advanced_search" !== location.pathname.replace(/\/+$/, "")) return null;
            const e = new URLSearchParams(location.search);
            if ("fc2" !== e.get("laosiji_detail")) return null;
            const t = e.get("movie_id") || "";
            return t ? {
                movieId: t
            } : null;
        },
        _apiTopTypeFromRankingParams(e) {
            const t = e.get("t") || "";
            return /^y\d{4}$/i.test(t) ? {
                category: "all",
                year: t.slice(1)
            } : t ? {
                category: t,
                year: ""
            } : {
                category: "all",
                year: ""
            };
        },
        _apiRankingShellUrlFromHref(e) {
            try {
                const t = new URL(e, location.href);
                if (!/javdb/i.test(t.hostname)) return "";
                const n = t.pathname.replace(/\/+$/, ""), a = new URLSearchParams(t.search);
                if ("/advanced_search" === n && /^(top|fc2)$/.test(a.get("laosiji_rank") || "")) return `${t.pathname}${t.search}`;
                if ("/rankings/top" === n) {
                    const e = this._apiTopTypeFromRankingParams(a);
                    return this._apiRankingShellUrl("top", {
                        category: e.category,
                        year: e.year,
                        page: parseInt(a.get("page") || "1", 10) || 1
                    });
                }
                if ("/rankings/movies" === n && "fc2" === a.get("t")) return this._apiRankingShellUrl("fc2", {
                    period: a.get("p") || "daily",
                    page: parseInt(a.get("page") || "1", 10) || 1
                });
                if ("/fc2" === n || "/tags/fc2" === n) return "/advanced_search?type=3&score_min=0&d=1&laosiji_fc2=1";
            } catch {}
            return "";
        },
        _movieIdFromJavdbHref(e) {
            try {
                const t = new URL(e, location.href);
                if (!/javdb/i.test(t.hostname)) return "";
                const n = t.pathname.match(/^\/v\/([^/?#]+)/);
                return n ? decodeURIComponent(n[1]) : "";
            } catch {}
            return "";
        },
        _isFc2ListContext() {
            const e = location.pathname.replace(/\/+$/, ""), t = new URLSearchParams(location.search);
            if ("/advanced_search" === e && "3" === t.get("type")) return !0;
            const n = this._getApiRankingShellMode();
            return "fc2" === n?.mode;
        },
        _isScriptFc2AdvancedSearch() {
            if ("/advanced_search" !== location.pathname.replace(/\/+$/, "")) return !1;
            const e = new URLSearchParams(location.search);
            return "3" === e.get("type") && "1" === e.get("laosiji_fc2");
        },
        _hideScriptFc2AdvancedSearchBox() {
            this._isScriptFc2AdvancedSearch() && (document.documentElement.dataset.laosijiFc2AdvancedSearch = "1", 
            "1" !== document.documentElement.dataset.laosijiFc2AdvancedSearchStyle && (document.documentElement.dataset.laosijiFc2AdvancedSearchStyle = "1", 
            GM_addStyle('\n                html[data-laosiji-fc2-advanced-search="1"] h2.section-title,\n                html[data-laosiji-fc2-advanced-search="1"] .section .container > .box,\n                html[data-laosiji-fc2-advanced-search="1"] body > section > div > .box {\n                    display: none !important;\n                }\n            ')));
        },
        _fc2DetailShellUrlFromLink(e) {
            const t = this._movieIdFromJavdbHref(e?.getAttribute?.("href") || e?.href || "");
            if (!t) return "";
            const n = e.closest?.(".item, .movie-list .item, .box")?.textContent || e.textContent || "";
            return this._isFc2ListContext() || /FC2[-_]/i.test(n) ? this._apiDetailShellUrl(t) : "";
        },
        _rewriteFc2DetailLinks(e = document) {
            e.querySelectorAll?.('a[href*="/v/"]').forEach(e => {
                const t = this._fc2DetailShellUrlFromLink(e);
                t && (e.dataset.laosijiFc2DetailShell = "1", e.href = t);
            });
        },
        _redirectCurrentApiRankingEntry() {
            const e = this._apiRankingShellUrlFromHref(location.href);
            return !!e && ("/advanced_search" !== location.pathname.replace(/\/+$/, "") && (location.replace(e), 
            !0));
        },
        _rewriteApiRankingLinks(e = document) {
            e.querySelectorAll?.("a[href]").forEach(e => {
                const t = this._apiRankingShellUrlFromHref(e.getAttribute("href"));
                t && (e.dataset.laosijiApiRankingShell = "1", e.href = t);
            }), this._rewriteFc2DetailLinks(e);
        },
        _installApiRankingShell() {
            "1" !== document.documentElement.dataset.laosijiJavdbApiShell ? (document.documentElement.dataset.laosijiJavdbApiShell = "1", 
            document.addEventListener("click", e => {
                const t = e.target?.closest?.("a[href]");
                if (!t || e.defaultPrevented) return;
                const n = this._fc2DetailShellUrlFromLink(t);
                if (n) {
                    if (t.href = n, 0 !== e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || "_blank" === t.target) return;
                    return e.preventDefault(), e.stopPropagation(), void (location.href = n);
                }
                const a = this._apiRankingShellUrlFromHref(t.href);
                a && (t.href = a, 0 !== e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || "_blank" === t.target || (e.preventDefault(), 
                e.stopPropagation(), location.href = a));
            }, !0), this._rewriteApiRankingLinks(), setTimeout(() => this._rewriteApiRankingLinks(), 500), 
            setTimeout(() => this._rewriteApiRankingLinks(), 1500), document.body && new MutationObserver(() => this._rewriteApiRankingLinks()).observe(document.body, {
                childList: !0,
                subtree: !0
            })) : this._rewriteApiRankingLinks();
        },
        _getApiRankingShellMode() {
            if ("/advanced_search" !== location.pathname.replace(/\/+$/, "")) return null;
            const e = new URLSearchParams(location.search), t = e.get("laosiji_rank") || "";
            if (!/^(top|fc2)$/.test(t)) return null;
            const n = e.get("lsj_type") || "", a = e.get("lsj_type_value") || "";
            let r = e.get("lsj_category") || "", i = e.get("lsj_year") || "";
            return r || "video_type" !== n || (r = a), i || "year" !== n || (i = a), r || (r = "all"), 
            {
                mode: t,
                params: e,
                page: Math.max(1, parseInt(e.get("lsj_page") || "1", 10) || 1),
                category: r,
                year: i,
                period: e.get("lsj_period") || "daily"
            };
        },
        _ensureApiRankingShellStyle() {
            "1" !== document.documentElement.dataset.laosijiJavdbApiShellStyle && (document.documentElement.dataset.laosijiJavdbApiShellStyle = "1", 
            GM_addStyle("\n                .javdb-api-shell { margin-top: 10px !important; }\n                .javdb-api-shell-head {\n                    display: flex !important;\n                    align-items: center !important;\n                    justify-content: space-between !important;\n                    gap: 12px !important;\n                    margin: 8px 0 12px !important;\n                    flex-wrap: wrap !important;\n                }\n                .javdb-api-shell-title {\n                    font-size: 18px !important;\n                    font-weight: 850 !important;\n                    color: #1e293b !important;\n                }\n                .javdb-api-shell-toolbar,\n                .javdb-api-shell-pagination {\n                    display: flex !important;\n                    align-items: center !important;\n                    gap: 7px !important;\n                    flex-wrap: wrap !important;\n                }\n                .javdb-api-shell-toolbar { margin: 8px 0 12px !important; }\n                .javdb-api-shell-pagination { justify-content: center !important; margin: 16px 0 8px !important; }\n                .javdb-api-shell-toolbar-group {\n                    display: flex !important;\n                    align-items: center !important;\n                    gap: 7px !important;\n                    flex-wrap: wrap !important;\n                    width: 100% !important;\n                }\n                .javdb-api-shell-toolbar-label {\n                    color: #64748b !important;\n                    font-size: 12px !important;\n                    font-weight: 850 !important;\n                    min-width: 34px !important;\n                }\n                .javdb-api-shell-toolbar a,\n                .javdb-api-shell-pagination a,\n                .javdb-api-shell-pagination span {\n                    display: inline-flex !important;\n                    align-items: center !important;\n                    justify-content: center !important;\n                    min-height: 30px !important;\n                    padding: 5px 12px !important;\n                    border: 1px solid #dbe3ef !important;\n                    border-radius: 7px !important;\n                    background: #fff !important;\n                    color: #334155 !important;\n                    font-size: 12px !important;\n                    font-weight: 800 !important;\n                    text-decoration: none !important;\n                }\n                .javdb-api-shell-toolbar a.is-active,\n                .javdb-api-shell-pagination a.is-active {\n                    border-color: #60a5fa !important;\n                    background: #eff6ff !important;\n                    color: #1d4ed8 !important;\n                }\n                .javdb-api-shell-status {\n                    margin: 10px 0 !important;\n                    padding: 10px 12px !important;\n                    border: 1px solid #e2e8f0 !important;\n                    border-radius: 8px !important;\n                    background: #f8fafc !important;\n                    color: #475569 !important;\n                    font-size: 13px !important;\n                    font-weight: 700 !important;\n                }\n                .javdb-api-shell-status.is-error {\n                    border-color: #fecaca !important;\n                    background: #fff1f2 !important;\n                    color: #be123c !important;\n                }\n            "));
        },
        _renderApiRankingToolbar(e) {
            if ("top" === e.mode) {
                const t = [ [ "all", "全部" ], [ "0", "有码" ], [ "1", "无码" ], [ "2", "欧美" ], [ "3", "FC2" ] ].map(([t, n]) => `<a class="${e.category === t ? "is-active" : ""}" href="${this._apiRankingShellUrl("top", {
                    category: t,
                    year: e.year,
                    page: 1
                })}">${n}</a>`).join(""), n = (new Date).getFullYear();
                return `\n                    <div class="javdb-api-shell-toolbar-group"><span class="javdb-api-shell-toolbar-label">分类</span>${t}</div>\n                    <div class="javdb-api-shell-toolbar-group"><span class="javdb-api-shell-toolbar-label">年份</span><a class="${e.year ? "" : "is-active"}" href="${this._apiRankingShellUrl("top", {
                    category: e.category,
                    year: "",
                    page: 1
                })}">全部年份</a>${Array.from({
                    length: Math.max(0, n - 2008 + 1)
                }, (e, t) => n - t).map(t => {
                    const n = String(t);
                    return `<a class="${e.year === n ? "is-active" : ""}" href="${this._apiRankingShellUrl("top", {
                        category: e.category,
                        year: n,
                        page: 1
                    })}">${n}</a>`;
                }).join("")}</div>\n                `;
            }
            return [ [ "daily", "日榜" ], [ "weekly", "周榜" ], [ "monthly", "月榜" ] ].map(([t, n]) => `<a class="${e.period === t ? "is-active" : ""}" href="${this._apiRankingShellUrl("fc2", {
                period: t,
                page: 1
            })}">${n}</a>`).join("");
        },
        _renderApiRankingPagination(e, t) {
            const n = e.page, a = t => "top" === e.mode ? this._apiRankingShellUrl("top", {
                category: e.category,
                year: e.year,
                page: t
            }) : this._apiRankingShellUrl("fc2", {
                period: e.period,
                page: t
            }), r = "top" === e.mode ? [ 1, 2, 3, 4, 5 ].map(e => `<a class="${e === n ? "is-active" : ""}" href="${a(e)}">${e}</a>`).join("") : `<span>第 ${n} 页</span>`;
            return `\n                <div class="javdb-api-shell-pagination">\n                    ${n > 1 ? `<a href="${a(n - 1)}">上一页</a>` : ""}\n                    ${r}\n                    ${t ? `<a href="${a(n + 1)}">下一页</a>` : ""}\n                </div>\n            `;
        },
        _renderApiRankingMovies(e) {
            return e.map(e => {
                const t = e?.origin_title || e?.title || "", n = e?.score ? `<span class="value">${this._escapeHtml(e.score)}分${e?.watched_count ? `, 由${this._escapeHtml(e.watched_count)}人評價` : ""}</span>` : "", a = [ e?.has_cnsub ? '<span class="tag is-warning">中文字幕</span>' : "", Number(e?.magnets_count || 0) > 0 ? '<span class="tag is-success">含磁鏈</span>' : "", Number(e?.magnets_count || 0) <= 0 ? '<span class="tag">無磁鏈</span>' : "", e?.new_magnets ? '<span class="tag is-info">今日新種</span>' : "" ].filter(Boolean).join(""), r = /^FC2[-_]/i.test(String(e?.number || "")) ? this._apiDetailShellUrl(e?.id || "") : `/v/${this._escapeHtml(e?.id || "")}`;
                return `\n                    <div class="item" data-javdb-api-shell-item="1">\n                        <a href="${this._escapeHtml(r)}" class="box" title="${this._escapeHtml(t)}">\n                            <div class="cover ">\n                                <img loading="lazy" src="${this._escapeHtml((i = e?.cover_url || e?.thumb_url || "", 
                String(i || "").replace(/https:\/\/.*?\/rhe951l4q/g, "https://c0.jdbstatic.com")))}" alt="">\n                            </div>\n                            <div class="video-title"><strong>${this._escapeHtml(e?.number || "")}</strong> ${this._escapeHtml(t)}</div>\n                            <div class="score">${n}</div>\n                            <div class="meta">${this._escapeHtml(e?.release_date || "")}</div>\n                            <div class="tags has-addons">${a}</div>\n                        </a>\n                    </div>\n                `;
                var i;
            }).join("");
        },
        _ensureApiDetailShellStyle() {
            "1" !== document.documentElement.dataset.laosijiJavdbApiDetailStyle && (document.documentElement.dataset.laosijiJavdbApiDetailStyle = "1", 
            GM_addStyle("\n                .javdb-api-detail .movie-panel-info .value.tags {\n                    display: inline-flex !important;\n                    flex-wrap: wrap !important;\n                    gap: 4px !important;\n                }\n            "));
        },
        _renderApiDetailField(e, t) {
            const n = Array.isArray(t) ? t.filter(Boolean).join(" / ") : String(t || "");
            return n ? `<div class="panel-block"><strong>${this._escapeHtml(e)}:</strong>&nbsp;<span class="value">${this._escapeHtml(n)}</span></div>` : "";
        },
        _renderApiDetailTags(e) {
            const t = Array.isArray(e) ? e : [];
            if (!t.length) return "";
            const n = t.map(e => {
                const t = e?.name || e?.title || e;
                return t ? `<span class="tag">${this._escapeHtml(t)}</span>` : "";
            }).filter(Boolean).join("");
            return n ? `<div class="panel-block"><strong>標籤:</strong>&nbsp;<span class="value tags">${n}</span></div>` : "";
        },
        _renderApiDetailImages(e) {
            const t = Array.isArray(e) ? e : [], n = e => String(e || "").replace(/https:\/\/.*?\/rhe951l4q/g, "https://c0.jdbstatic.com"), a = t.map((e, t) => {
                const a = n(e?.large_url || e?.url || e?.thumb_url || ""), r = n(e?.thumb_url || e?.large_url || e?.url || "");
                return a && r ? `\n                    <a class="tile-item" href="${this._escapeHtml(a)}" data-fancybox="gallery" data-caption="预览图 ${t + 1}">\n                        <img src="${this._escapeHtml(r)}" loading="lazy" alt="预览图 ${t + 1}">\n                    </a>` : "";
            }).filter(Boolean).join("");
            return a ? `\n                <div class="columns javdb-api-detail-preview-columns">\n                    <div class="column">\n                        <article class="message video-panel">\n                            <div class="message-body">\n                                <div class="tile-images preview-images">${a}</div>\n                            </div>\n                        </article>\n                    </div>\n                </div>` : "";
        },
        _renderApiDetailPage(e) {
            const t = String(e?.number || ""), n = e?.origin_title || e?.title || "", a = (Array.isArray(e?.actors) ? e.actors : []).map(e => e?.name || e).filter(Boolean), r = String(e?.cover_url || e?.thumb_url || "").replace(/https:\/\/.*?\/rhe951l4q/g, "https://c0.jdbstatic.com");
            return `\n                <div class="video-detail javdb-api-detail" data-javdb-api-detail="1">\n                    <h2 class="title is-4 javdb-api-detail-title">\n                        <strong>${this._escapeHtml(t)} </strong>\n                        <strong class="current-title">${this._escapeHtml(n)}</strong>\n                    </h2>\n                    <div class="video-meta-panel">\n                        <div class="columns is-desktop">\n                            <div class="column column-video-cover">\n                                <a data-fancybox="gallery" href="${this._escapeHtml(r)}">\n                                    <img src="${this._escapeHtml(r)}" class="video-cover" alt="${this._escapeHtml(n)}">\n                                </a>\n                            </div>\n                            <div class="column">\n                                <nav class="panel movie-panel-info">\n                                    <div class="panel-block first-block"><strong>番號:</strong>&nbsp;<span class="value">${this._escapeHtml(t)}</span>&nbsp;<a class="button is-white copy-to-clipboard" title="複製番號" data-clipboard-text="${this._escapeHtml(t)}"><span class="icon is-small"><i class="icon-copy"></i></span></a></div>\n                                    ${this._renderApiDetailField("標題", n)}\n                                    ${this._renderApiDetailField("日期", e?.release_date)}\n                                    ${this._renderApiDetailField("時長", e?.duration ? `${e.duration} 分鐘` : "")}\n                                    ${this._renderApiDetailField("評分", e?.score ? `${e.score} / ${e?.watched_count || 0} 人` : "")}\n                                    ${this._renderApiDetailField("片商", e?.maker_name || e?.publisher_name)}\n                                    ${this._renderApiDetailField("系列", e?.series_name)}\n                                    ${this._renderApiDetailField("導演", e?.director_name)}\n                                    ${this._renderApiDetailField("演員", a)}\n                                    ${this._renderApiDetailTags(e?.tags)}\n                                </nav>\n                            </div>\n                        </div>\n                    </div>\n                    ${this._renderApiDetailImages(e?.preview_images)}\n                </div>\n            `;
        },
        async _initApiDetailShellPage() {
            const e = this._getApiDetailShellMode();
            if (!e) return !1;
            const t = document.querySelector("body > section > div, .section .container");
            if (!t) return !1;
            this._ensureApiDetailShellStyle(), t.innerHTML = '<div class="javdb-api-shell-status">正在加载 API 详情...</div>';
            const n = t.querySelector(".javdb-api-shell-status");
            try {
                const n = await b.javdbApi.movieDetail(e.movieId);
                if (1 !== n.success) throw new Error(n.message || n.action || "JavDB API 请求失败");
                const a = n?.data?.movie;
                if (!a?.number) throw new Error("没有查询到详情数据");
                t.innerHTML = this._renderApiDetailPage(a);
                const o = u(a.number);
                return this._insertCopyButton(o), this._ensureDetailLayout(), this._insertMagnet(o), 
                r.apply("javdb"), i.apply(), ae.refresh({
                    detailPreview: !0,
                    infiniteScroll: !1
                }), !0;
            } catch (e) {
                return console.warn("[老司机] JavDB API 详情请求失败:", e), n.classList.add("is-error"), 
                n.textContent = e.message || "JavDB API 详情请求失败", !0;
            }
        },
        async _initApiRankingShellPage() {
            const e = this._getApiRankingShellMode();
            if (!e) return !1;
            const t = document.querySelector("body > section > div, .section .container");
            if (!t) return !1;
            this._ensureApiRankingShellStyle();
            const n = "top" === e.mode ? "Top250" : "FC2 排行榜";
            t.innerHTML = `\n                <div class="javdb-api-shell">\n                    <div class="javdb-api-shell-head">\n                        <div class="javdb-api-shell-title">${n}</div>\n                    </div>\n                    <div class="javdb-api-shell-toolbar">${this._renderApiRankingToolbar(e)}</div>\n                    <div class="javdb-api-shell-status">正在加载 API 数据...</div>\n                    <div class="movie-list h cols-4 vcols-8"></div>\n                    <div class="javdb-api-shell-pagination-wrap"></div>\n                </div>\n            `;
            const a = t.querySelector(".javdb-api-shell-status"), i = t.querySelector(".movie-list"), o = t.querySelector(".javdb-api-shell-pagination-wrap");
            try {
                let t;
                if ("top" === e.mode) {
                    if (!b.javdbApi.token()) return a.classList.add("is-error"), a.textContent = "Top250 API 需要 JavDB App token。本地未找到 jhs_appAuthorization / javdb_appAuthorization / javdb_app_authorization。", 
                    !0;
                    t = await b.javdbApi.top250({
                        category: e.category,
                        year: e.year,
                        page: e.page,
                        limit: 50
                    });
                } else t = await b.javdbApi.fc2({
                    period: e.period,
                    page: e.page,
                    limit: 40
                });
                if (1 !== t.success) throw new Error(t.message || t.action || "JavDB API 请求失败");
                const n = Array.isArray(t?.data?.movies) ? t.data.movies : [];
                if (!n.length) return a.textContent = "没有查询到数据。", !0;
                const s = Number(t?.data?.total || 0);
                i.innerHTML = this._renderApiRankingMovies(n), a.textContent = s ? `已加载 ${n.length} 条数据，共 ${s} 条匹配` : `已加载 ${n.length} 条数据`;
                const l = "top" === e.mode ? e.page < 5 : s ? 40 * e.page < s : n.length >= 40;
                return o.innerHTML = this._renderApiRankingPagination(e, l), this._initListPage(), 
                r.apply("javdb"), ae.refreshListPage(), !0;
            } catch (e) {
                return console.warn("[老司机] JavDB API 榜单请求失败:", e), a.classList.add("is-error"), 
                a.textContent = e.message || "JavDB API 请求失败", !0;
            }
        },
        _initListPage() {
            const e = document.querySelector(".movie-list, .movies, .grid");
            if (!e) return;
            const t = "1" !== e.dataset.laosijiGrid, n = [ ...e.querySelectorAll(':scope > .item:not([data-laosiji-grid-card="1"])') ];
            (n.length || t) && (e.dataset.laosijiGrid = "1", e.classList.add("jav-card-grid", "javdb-card-grid"), 
            a.apply("javdb"), n.forEach(e => this._decorateCard(e)), this._rewriteFc2DetailLinks(e), 
            t && GM_addStyle("\n                    .jav-card-grid {\n                        --jav-card-title-size: 15px;\n                        --jav-card-title-line-height: 1.5;\n                        --jav-card-title-lines: 3;\n                        display: grid !important;\n                        grid-template-columns: repeat(var(--jav-card-columns, 5), minmax(0, 1fr)) !important;\n                        gap: 14px !important;\n                        align-items: stretch !important;\n                        width: 100% !important;\n                        box-sizing: border-box !important;\n                    }\n                    .jav-card {\n                        float: none !important;\n                        display: block !important;\n                        width: auto !important;\n                        height: 100% !important;\n                        max-height: none !important;\n                        min-width: 0 !important;\n                        margin: 0 !important;\n                        padding: 0 !important;\n                        box-sizing: border-box !important;\n                        text-align: left !important;\n                        background: #fff !important;\n                        border: 1px solid #e5e7eb !important;\n                        border-radius: 6px !important;\n                        overflow: hidden !important;\n                        box-shadow: 0 1px 4px rgba(15, 23, 42, .08) !important;\n                        transform: translateZ(0) !important;\n                        transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease !important;\n                        will-change: transform !important;\n                    }\n                    .jav-card:hover {\n                        border-color: rgba(37, 99, 235, .35) !important;\n                        box-shadow: 0 10px 24px rgba(15, 23, 42, .16) !important;\n                        transform: translateY(-4px) scale(1.018) !important;\n                        z-index: 2 !important;\n                    }\n                    .jav-card-link {\n                        display: flex !important;\n                        flex-direction: column !important;\n                        height: 100% !important;\n                        max-height: none !important;\n                        overflow: hidden !important;\n                        color: #2563eb !important;\n                        text-decoration: none !important;\n                    }\n                    .jav-card-link:visited {\n                        color: #7c3aed !important;\n                    }\n                    .jav-card-cover {\n                        display: block !important;\n                        width: 100% !important;\n                        height: auto !important;\n                        aspect-ratio: 800 / 538 !important;\n                        overflow: hidden !important;\n                        background: #f8fafc !important;\n                        border-bottom: 1px solid #f1f5f9 !important;\n                    }\n                    .jav-card-image {\n                        display: block !important;\n                        width: 100% !important;\n                        height: 100% !important;\n                        max-height: none !important;\n                        object-fit: cover !important;\n                        object-position: center center !important;\n                        background: #f8fafc !important;\n                        border: 0 !important;\n                    }\n                    .jav-card-title {\n                        display: block !important;\n                        width: 100% !important;\n                        max-width: none !important;\n                        height: calc((var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 3) * 1em) + 16px) !important;\n                        max-height: calc((var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 3) * 1em) + 16px) !important;\n                        box-sizing: border-box !important;\n                        flex: 0 0 auto !important;\n                        min-height: calc((var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 3) * 1em) + 16px) !important;\n                        margin: 0 !important;\n                        padding: 7px 8px 9px !important;\n                        overflow: hidden !important;\n                        color: inherit !important;\n                        font-size: var(--jav-card-title-size, 15px) !important;\n                        line-height: var(--jav-card-title-line-height, 1.5) !important;\n                        text-align: left !important;\n                        white-space: normal !important;\n                        word-break: break-word !important;\n                    }\n                    .javdb-card-headline {\n                        display: -webkit-box !important;\n                        -webkit-box-orient: vertical !important;\n                        -webkit-line-clamp: var(--jav-card-title-lines, 3) !important;\n                        line-clamp: var(--jav-card-title-lines, 3) !important;\n                        max-height: calc(var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 3) * 1em) !important;\n                        overflow: hidden !important;\n                        text-overflow: ellipsis !important;\n                        white-space: normal !important;\n                        word-break: break-word !important;\n                    }\n                    .jav-card-title strong {\n                        color: inherit !important;\n                        font-size: 16px !important;\n                        font-weight: 800 !important;\n                    }\n                    .javdb-card-grid {\n                        --jav-card-columns: 5;\n                    }\n                    .javdb-card-grid .item.javdb-grid-card {\n                        position: static !important;\n                        width: auto !important;\n                        float: none !important;\n                        margin: 0 !important;\n                    }\n                    .javdb-card-grid .item .javdb-card-link.box {\n                        width: 100% !important;\n                        min-width: 0 !important;\n                        margin: 0 !important;\n                        padding: 0 !important;\n                        background: #fff !important;\n                        box-shadow: none !important;\n                        border-radius: 0 !important;\n                        overflow: hidden !important;\n                    }\n                    .javdb-card-grid .item .javdb-cover-frame.cover {\n                        margin: 0 !important;\n                        height: auto !important;\n                    }\n                    .javdb-card-grid .item .javdb-card-image {\n                        height: 100% !important;\n                        margin: 0 !important;\n                    }\n                    .javdb-card-grid .item .javdb-card-title .jav-pan115-badge {\n                        display: inline-flex !important;\n                        width: auto !important;\n                        max-width: max-content !important;\n                        float: none !important;\n                        vertical-align: middle !important;\n                        margin: 0 6px 4px 0 !important;\n                    }\n                    .javdb-card-score,\n                    .javdb-card-meta,\n                    .javdb-card-tags {\n                        padding-left: 8px !important;\n                        padding-right: 8px !important;\n                    }\n                    .javdb-card-score {\n                        margin-top: 2px !important;\n                        color: #64748b !important;\n                        font-size: 12px !important;\n                        line-height: 1.45 !important;\n                    }\n                    .javdb-card-score .value {\n                        color: inherit !important;\n                        font-size: inherit !important;\n                    }\n                    .javdb-card-meta {\n                        margin-top: 4px !important;\n                        color: #94a3b8 !important;\n                        font-size: 12px !important;\n                        line-height: 1.45 !important;\n                    }\n                    .javdb-card-tags {\n                        display: flex !important;\n                        flex-wrap: wrap !important;\n                        gap: 6px !important;\n                        margin-top: auto !important;\n                        padding-top: 8px !important;\n                        padding-bottom: 10px !important;\n                    }\n                    .javdb-card-tags .tag {\n                        margin: 0 !important;\n                    }\n                    @media (max-width: 1100px) {\n                        .javdb-card-grid { --jav-card-columns: 4; }\n                    }\n                    @media (max-width: 820px) {\n                        .javdb-card-grid { --jav-card-columns: 3; }\n                    }\n                    @media (max-width: 560px) {\n                        .javdb-card-grid { --jav-card-columns: 2; gap: 10px !important; }\n                    }\n                "), 
            setTimeout(() => {
                ae.refreshListPage();
            }, 0));
        },
        _decorateCard(e) {
            if (!e) return;
            "1" !== e.dataset.laosijiGridCard && (e.dataset.laosijiGridCard = "1", e.classList.add("jav-card", "javdb-grid-card"));
            const t = e.querySelector(":scope > a.box[href], :scope > a[href].box, a.box[href]");
            t?.classList.add("jav-card-link", "javdb-card-link"), t && !t.querySelector(".jav-pan115-badge") && (delete t.dataset.pan115Checked, 
            delete t.dataset.pan115HasBadge);
            const n = e.querySelector(".cover");
            n?.classList.add("jav-card-cover", "javdb-cover-frame");
            const a = n?.querySelector("img[src]") || e.querySelector("img[src]");
            a && (a.removeAttribute("width"), a.removeAttribute("height"), a.classList.add("jav-card-image", "javdb-card-image"));
            const r = e.querySelector(".video-title");
            if (r?.classList.add("jav-card-title", "javdb-card-title"), r && !r.querySelector(".javdb-card-headline")) {
                const e = document.createElement("span");
                for (e.className = "javdb-card-headline"; r.firstChild; ) e.appendChild(r.firstChild);
                r.appendChild(e);
            }
            const i = e.querySelector(".score");
            i?.classList.add("javdb-card-score");
            const o = e.querySelector(".meta");
            o?.classList.add("javdb-card-meta");
            const s = e.querySelector(".tags");
            s?.classList.add("javdb-card-tags"), S.attach(e);
        },
        _insertTopSettingsButton() {
            const e = document.querySelector("#navbar-menu-user .navbar-end");
            if (!e || e.querySelector(".javdb-top-settings-btn")) return;
            const t = document.createElement("a");
            t.href = "javascript:void(0)", t.className = "navbar-item javdb-top-settings-btn", 
            t.textContent = "老司机设置", t.title = "打开老司机设置", t.addEventListener("click", e => {
                e.preventDefault(), e.stopPropagation(), v.open(e.currentTarget);
            });
            const n = e.querySelector('a[href="/users/profile"]')?.closest(".navbar-item.has-dropdown");
            e.insertBefore(t, n || null), "1" !== document.documentElement.dataset.laosijiJavdbTopSettingsStyle && (document.documentElement.dataset.laosijiJavdbTopSettingsStyle = "1", 
            GM_addStyle("\n                #navbar-menu-user .javdb-top-settings-btn {\n                    color: #2563eb !important;\n                    font-weight: 700 !important;\n                }\n                #navbar-menu-user .javdb-top-settings-btn:hover {\n                    color: #1d4ed8 !important;\n                    background: rgba(37, 99, 235, .08) !important;\n                }\n            "));
        },
        _insertCopyButton(e) {
            const t = document.querySelector(".movie-panel-info");
            if (!t || !e) return;
            const n = t.querySelector(".copy-to-clipboard, [data-clipboard-text]");
            h(n?.closest(".panel-block")?.querySelector(".value") || [ ...t.querySelectorAll(".panel-block .value") ].find(t => t.textContent.trim().toUpperCase().includes(u(e))), e, n);
        },
        _ensureDetailLayout() {
            const e = document.querySelector(".column.column-video-cover"), t = document.querySelector(".movie-panel-info");
            if (!e || !t) return null;
            const n = t.closest(".column") || t, a = e.closest(".jav-flex-container"), r = a || e.parentElement;
            if (!r) return null;
            let o = a || r.querySelector(":scope > .jav-flex-container");
            if (o) {
                if (e.parentElement !== o && o.insertBefore(e, o.firstChild), n.parentElement !== o) {
                    const e = o.querySelector(":scope > .jav-nong-slot");
                    o.insertBefore(n, e || null);
                }
            } else o = document.createElement("div"), o.className = "jav-flex-container", o.appendChild(e), 
            o.appendChild(n), r.appendChild(o);
            o.style.setProperty("display", "flex", "important"), o.style.setProperty("gap", "20px", "important"), 
            o.style.setProperty("align-items", "flex-start", "important"), o.style.setProperty("width", "100%", "important"), 
            o.style.setProperty("margin-top", "16px", "important");
            const s = i.defaultCss("javdb");
            o.style.setProperty("--javdb-cover-flex", o.style.getPropertyValue("--javdb-cover-flex") || s.cover), 
            o.style.setProperty("--javdb-info-flex", o.style.getPropertyValue("--javdb-info-flex") || s.info), 
            o.style.setProperty("--javdb-magnet-flex", o.style.getPropertyValue("--javdb-magnet-flex") || s.magnet), 
            e.style.setProperty("flex", "var(--javdb-cover-flex) 1 0", "important"), e.style.setProperty("width", "auto", "important"), 
            e.style.setProperty("max-width", "none", "important"), e.style.setProperty("min-width", "0", "important"), 
            n.style.setProperty("flex", "var(--javdb-info-flex) 1 0", "important"), n.style.setProperty("width", "auto", "important"), 
            n.style.setProperty("max-width", "none", "important"), n.style.setProperty("min-width", "0", "important"), 
            n.style.setProperty("overflow", "hidden", "important"), n.style.setProperty("word-break", "break-word", "important"), 
            t.style.setProperty("width", "100%", "important"), t.style.setProperty("max-width", "100%", "important"), 
            t.style.setProperty("box-sizing", "border-box", "important");
            const l = e.querySelector(".cover, .box");
            l && (l.style.setProperty("width", "100%", "important"), l.style.setProperty("max-width", "100%", "important"), 
            l.style.setProperty("box-sizing", "border-box", "important"));
            const c = e.querySelector("img");
            return c && (c.style.setProperty("width", "100%", "important"), c.style.setProperty("height", "auto", "important"), 
            c.style.setProperty("max-width", "100%", "important")), o;
        },
        _insertMagnet(e) {
            if (!n.magnetTable) return;
            document.querySelectorAll(".jav-nong-slot").forEach(e => e.remove());
            const t = this._ensureDetailLayout();
            if (!t) return;
            const a = document.createElement("div");
            a.className = "jav-nong-slot", a.style.setProperty("flex", "var(--javdb-magnet-flex) 1 0", "important"), 
            a.style.setProperty("min-width", "0", "important"), a.style.setProperty("align-self", "flex-start", "important"), 
            a.style.setProperty("overflow", "hidden", "important");
            const r = b.createMagnetWidget(e);
            a.appendChild(r), t.appendChild(a);
        }
    }, y = {
        match: () => /(javlibrary|javlib|r86m|s87n)/i.test(location.hostname),
        isDetailPage: () => !!document.querySelector("#video_id .text") && !!document.querySelector('meta[name="keywords"]'),
        isHomePage() {
            return document.body?.classList.contains("main") && !this.isDetailPage() && !!document.querySelector("#rightcolumn > .videothumblist .videos");
        },
        getVid() {
            const e = document.querySelector("#video_id .text");
            if (e?.textContent?.trim()) return u(e.textContent.trim());
            const t = document.title.match(/([A-Z0-9]+-\d+)/i);
            return t ? t[1].toUpperCase() : "";
        },
        initPage(e) {
            if (this._insertTopSettingsButton(), !this.isDetailPage()) return this._initListPage(), 
            void (this.isHomePage() && this._initHomePage());
            e && (document.querySelector(".socialmedia")?.remove(), this._insertCopyButton(e), 
            GM_addStyle("\n                #leftmenu { display: none; }\n                #rightcolumn { margin: 0 !important; width: 100% !important; float: none !important; }\n                #content { padding-top: 0; width: 100%; margin: 0 !important; }\n                #video_jacket img { max-width: 100%; height: auto; }\n                #video_info { text-align: left; font: 14px Arial; overflow: hidden; word-break: break-word; margin: 0 !important; width: 100% !important; float: none !important; }\n                #video_info .item,\n                #video_info table,\n                #video_info tr,\n                #video_info td,\n                #video_info .header,\n                #video_info .text {\n                    text-align: left !important;\n                }\n                #video_info table {\n                    margin-left: 0 !important;\n                    margin-right: auto !important;\n                }\n                #video_info .jav-jump-btn-group {\n                    justify-content: flex-start !important;\n                }\n                #video_reviews,\n                #video_comments,\n                #video_review_edit,\n                #video_comment_edit {\n                    width: 100% !important;\n                    max-width: 100% !important;\n                    box-sizing: border-box !important;\n                    overflow-x: hidden !important;\n                }\n                #video_reviews .comment,\n                #video_comments .comment {\n                    width: 100% !important;\n                    max-width: 100% !important;\n                    table-layout: fixed !important;\n                    box-sizing: border-box !important;\n                }\n                #video_reviews .comment td,\n                #video_comments .comment td {\n                    box-sizing: border-box !important;\n                    vertical-align: top !important;\n                }\n                #video_reviews .comment td.info,\n                #video_comments .comment td.info {\n                    width: 132px !important;\n                }\n                #video_reviews .comment td.scores,\n                #video_comments .comment td.scores {\n                    width: 92px !important;\n                }\n                #video_reviews .comment td.t,\n                #video_comments .comment td.t {\n                    width: auto !important;\n                    min-width: 0 !important;\n                    overflow: hidden !important;\n                }\n                #video_reviews .comment td.t .text,\n                #video_comments .comment td.t .text,\n                #video_reviews .comment td.t textarea,\n                #video_comments .comment td.t textarea {\n                    width: auto !important;\n                    max-width: 100% !important;\n                    box-sizing: border-box !important;\n                    white-space: normal !important;\n                    word-break: break-word !important;\n                    overflow-wrap: anywhere !important;\n                }\n                .jav-nong-slot .jav-nong-wrapper { width: 560px; max-width: 100%; margin-top: 16px; }\n            "), 
            this._ensureDetailLayout(), this._insertMagnet(e));
        },
        _initListPage() {
            const e = document.querySelector(".videothumblist .videos");
            if (!e) return;
            const t = "1" !== e.dataset.laosijiGrid, n = [ ...e.querySelectorAll(':scope > .video:not([data-laosiji-grid-card="1"])') ];
            (n.length || t) && (e.dataset.laosijiGrid = "1", e.classList.add("jav-card-grid", "javlib-card-grid"), 
            a.apply("javlib"), n.forEach(e => {
                e.dataset.laosijiGridCard = "1", e.classList.add("jav-card", "javlib-grid-card");
                const t = e.querySelector(":scope > a[href]:not(.emby-javlibrary-list-badge)");
                t?.classList.add("jav-card-link", "javlib-card-link"), t && !t.querySelector(".jav-pan115-badge") && (delete t.dataset.pan115Checked, 
                delete t.dataset.pan115HasBadge);
                const n = e.querySelector(".id"), a = e.querySelector(".title");
                if (a?.classList.add("jav-card-title", "javlib-card-title"), n && a && !a.querySelector(".javlib-card-headline")) {
                    const e = n.textContent.trim(), t = a.textContent.trim();
                    a.textContent = "";
                    const r = document.createElement("span");
                    r.className = "javlib-card-headline";
                    const i = document.createElement("strong");
                    i.className = "javlib-card-code", i.textContent = e, r.appendChild(i), r.appendChild(document.createTextNode(` ${t}`)), 
                    a.appendChild(r), a.dataset.laosijiCodeMerged = "1";
                }
                const r = e.querySelector("img[src]");
                if (!r) return;
                const i = r.getAttribute("src") || "", o = i.replace(/ps\.jpg(?:([?#].*)?)$/i, "pl.jpg$1");
                if (o !== i && (r.src = o, r.setAttribute("src", o)), r.removeAttribute("width"), 
                r.removeAttribute("height"), r.classList.add("jav-card-image", "javlib-card-image"), 
                r.closest(".javlib-cover-frame")) r.closest(".javlib-cover-frame")?.classList.add("jav-card-cover"); else {
                    const e = document.createElement("div");
                    e.className = "jav-card-cover javlib-cover-frame", r.parentNode.insertBefore(e, r), 
                    e.appendChild(r);
                }
            }), t && GM_addStyle("\n                    .jav-card-grid {\n                        --jav-card-title-size: 15px;\n                        --jav-card-title-line-height: 1.5;\n                        --jav-card-title-lines: 3;\n                        display: grid !important;\n                        grid-template-columns: repeat(var(--jav-card-columns, 5), minmax(0, 1fr)) !important;\n                        gap: 14px !important;\n                        align-items: stretch !important;\n                        width: 100% !important;\n                        box-sizing: border-box !important;\n                    }\n                    .jav-card {\n                        float: none !important;\n                        display: block !important;\n                        width: auto !important;\n                        height: 100% !important;\n                        max-height: none !important;\n                        min-width: 0 !important;\n                        margin: 0 !important;\n                        padding: 0 !important;\n                        box-sizing: border-box !important;\n                        text-align: left !important;\n                        background: #fff !important;\n                        border: 1px solid #e5e7eb !important;\n                        border-radius: 6px !important;\n                        overflow: hidden !important;\n                        box-shadow: 0 1px 4px rgba(15, 23, 42, .08) !important;\n                        transform: translateZ(0) !important;\n                        transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease !important;\n                        will-change: transform !important;\n                    }\n                    .jav-card:hover {\n                        border-color: rgba(37, 99, 235, .35) !important;\n                        box-shadow: 0 10px 24px rgba(15, 23, 42, .16) !important;\n                        transform: translateY(-4px) scale(1.018) !important;\n                        z-index: 2 !important;\n                    }\n                    .jav-card-link {\n                        display: flex !important;\n                        flex-direction: column !important;\n                        height: 100% !important;\n                        max-height: none !important;\n                        overflow: hidden !important;\n                        color: #2563eb !important;\n                        text-decoration: none !important;\n                    }\n                    .jav-card-link:visited {\n                        color: #7c3aed !important;\n                    }\n                    .jav-card-cover {\n                        display: block !important;\n                        width: 100% !important;\n                        height: auto !important;\n                        aspect-ratio: 800 / 538 !important;\n                        overflow: hidden !important;\n                        background: #f8fafc !important;\n                        border-bottom: 1px solid #f1f5f9 !important;\n                    }\n                    .jav-card-image {\n                        display: block !important;\n                        width: 100% !important;\n                        height: 100% !important;\n                        max-height: none !important;\n                        object-fit: cover !important;\n                        object-position: center center !important;\n                        background: #f8fafc !important;\n                        border: 0 !important;\n                    }\n                    .jav-card-title {\n                        display: block !important;\n                        width: 100% !important;\n                        max-width: none !important;\n                        height: calc((var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 3) * 1em) + 16px) !important;\n                        max-height: calc((var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 3) * 1em) + 16px) !important;\n                        box-sizing: border-box !important;\n                        flex: 1 1 auto !important;\n                        min-height: calc((var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 3) * 1em) + 16px) !important;\n                        margin: 0 !important;\n                        padding: 7px 8px 9px !important;\n                        overflow: hidden !important;\n                        text-overflow: ellipsis !important;\n                        color: inherit !important;\n                        font-size: var(--jav-card-title-size, 15px) !important;\n                        line-height: var(--jav-card-title-line-height, 1.5) !important;\n                        text-align: left !important;\n                        white-space: normal !important;\n                        word-break: break-word !important;\n                    }\n                    .javlib-card-headline {\n                        display: -webkit-box !important;\n                        -webkit-box-orient: vertical !important;\n                        -webkit-line-clamp: var(--jav-card-title-lines, 3) !important;\n                        line-clamp: var(--jav-card-title-lines, 3) !important;\n                        max-height: calc(var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 3) * 1em) !important;\n                        overflow: hidden !important;\n                        text-overflow: ellipsis !important;\n                        white-space: normal !important;\n                        word-break: break-word !important;\n                    }\n                    .jav-card-title strong {\n                        color: inherit !important;\n                        font-size: 16px !important;\n                        font-weight: 800 !important;\n                    }\n                    .videothumblist { width: 100% !important; }\n                    .videothumblist .videos.javlib-card-grid {\n                        --jav-card-columns: 5;\n                    }\n                    .videothumblist .video.javlib-grid-card .id {\n                        display: none !important;\n                    }\n                    .videothumblist .video.javlib-grid-card .toolbar {\n                        display: none !important;\n                    }\n                    @media (max-width: 1100px) {\n                        .videothumblist .videos.javlib-card-grid { --jav-card-columns: 4; }\n                    }\n                    @media (max-width: 820px) {\n                        .videothumblist .videos.javlib-card-grid { --jav-card-columns: 3; }\n                    }\n                    @media (max-width: 560px) {\n                        .videothumblist .videos.javlib-card-grid { --jav-card-columns: 2; gap: 10px !important; }\n                    }\n                "), 
            setTimeout(() => {
                ae.refreshListDecorations();
            }, 0));
        },
        _initHomePage() {
            if ("1" === document.body.dataset.laosijiJavlibHome) return;
            document.body.dataset.laosijiJavlibHome = "1", document.body.classList.add("javlib-home-page");
            const e = document.querySelector("#rightcolumn");
            e?.querySelectorAll(":scope > .titlebox, :scope > table.about").forEach(e => {
                e.style.setProperty("display", "none", "important");
            }), GM_addStyle("\n                body.javlib-home-page #rightcolumn > .videothumblist {\n                    height: auto !important;\n                    max-height: none !important;\n                    overflow: visible !important;\n                }\n            ");
        },
        _insertTopSettingsButton() {
            const e = document.querySelector("#topmenu .menutext, .menutext");
            if (!e || e.querySelector(".javlib-top-settings-btn")) return;
            const t = document.createElement("a");
            t.href = "javascript:void(0)", t.className = "javlib-top-settings-btn", t.textContent = "老司机设置", 
            t.title = "打开老司机设置", t.addEventListener("click", e => {
                e.preventDefault(), e.stopPropagation(), v.open(e.currentTarget);
            });
            const n = e.querySelector('a[href*="myaccount.php"]'), a = document.createTextNode(" | ");
            n ? n.after(a, t) : e.append(a, t), "1" !== document.documentElement.dataset.laosijiJavlibTopSettingsStyle && (document.documentElement.dataset.laosijiJavlibTopSettingsStyle = "1", 
            GM_addStyle("\n                #topmenu .menutext .javlib-top-settings-btn,\n                .menutext .javlib-top-settings-btn {\n                    color: #2563eb !important;\n                    font-weight: 700 !important;\n                    text-decoration: none !important;\n                }\n                #topmenu .menutext .javlib-top-settings-btn:hover,\n                .menutext .javlib-top-settings-btn:hover {\n                    color: #1d4ed8 !important;\n                    text-decoration: underline !important;\n                }\n            "));
        },
        _insertCopyButton(e) {
            h(document.querySelector("#video_id .text"), e);
        },
        _ensureDetailLayout() {
            const e = document.getElementById("video_jacket_info");
            if (!e) return null;
            const t = e.querySelector("tr");
            if (!t) return null;
            e.style.setProperty("width", "100%", "important"), e.style.setProperty("display", "block", "important"), 
            t.style.setProperty("display", "flex", "important"), t.style.setProperty("gap", "20px", "important"), 
            t.style.setProperty("align-items", "flex-start", "important"), t.style.setProperty("width", "100%", "important");
            const n = i.defaultCss("javlib");
            t.style.setProperty("--javlib-cover-flex", t.style.getPropertyValue("--javlib-cover-flex") || n.cover), 
            t.style.setProperty("--javlib-info-flex", t.style.getPropertyValue("--javlib-info-flex") || n.info), 
            t.style.setProperty("--javlib-magnet-flex", t.style.getPropertyValue("--javlib-magnet-flex") || n.magnet);
            const a = t.querySelectorAll("td");
            a[0] && (a[0].style.setProperty("flex", "var(--javlib-cover-flex) 1 0", "important"), 
            a[0].style.setProperty("min-width", "0", "important"), a[0].style.setProperty("vertical-align", "top", "important")), 
            a[1] && (a[1].style.setProperty("flex", "var(--javlib-info-flex) 1 0", "important"), 
            a[1].style.setProperty("min-width", "0", "important"), a[1].style.setProperty("vertical-align", "top", "important"), 
            a[1].style.setProperty("overflow", "hidden", "important"), a[1].style.setProperty("word-break", "break-word", "important"));
            const r = document.getElementById("video_jacket_img");
            return r && (r.removeAttribute("width"), r.removeAttribute("height"), r.style.setProperty("width", "100%", "important"), 
            r.style.setProperty("height", "auto", "important"), r.style.setProperty("max-width", "100%", "important")), 
            t;
        },
        _insertMagnet(e) {
            if (!n.magnetTable) return;
            document.querySelectorAll(".jav-nong-slot").forEach(e => e.remove());
            const t = this._ensureDetailLayout();
            if (!t) return;
            const a = document.createElement("td");
            a.className = "jav-nong-slot javlib-nong-slot", a.style.cssText = "flex:var(--javlib-magnet-flex) 1 0;min-width:0;vertical-align:top;align-self:flex-start;";
            const r = document.createElement("div");
            r.style.cssText = "display:inline-block;";
            const i = b.createMagnetWidget(e);
            r.appendChild(i), a.appendChild(r), t.appendChild(a);
        }
    }, w = {
        list: [ f, x, y ],
        javdbGuardsReady: !1,
        current() {
            return this.list.find(e => e.match()) || null;
        },
        isDetailPage: () => /javbus\.com/i.test(location.hostname) ? /^\/(?:[a-z]{2}\/)?(?:[A-Z]{2,15}-?\d{2,10}(?:-\d{1,3})?|[A-Z]{2,10}\d{3,6}|FC2(?:-PPV)?-\d{6,9})\/?$/i.test(location.pathname) : K.some(e => e.match(window.location.href)),
        getListCards: (e = document) => [ ...e.querySelectorAll(".javbus-card-grid > .item, .javdb-card-grid > .item, .videothumblist .videos.javlib-card-grid > .video") ],
        getCardCover: e => e?.querySelector(".jav-card-cover") || null,
        getCardCode(e) {
            if (!e) return "";
            const t = e.querySelector(".javbus-card-code, .javlib-card-code, .id, [data-code]")?.textContent?.trim();
            if (t) {
                const e = _.extractCode(t) || _.normalizeCode(t);
                if (e) return e;
            }
            const n = [ e.querySelector(".javdb-card-headline")?.textContent, e.querySelector(".javlib-card-headline")?.textContent, e.querySelector(".javbus-card-headline")?.textContent, e.querySelector(".video-title")?.textContent, e.querySelector(".title")?.textContent, e.querySelector("a[title]")?.getAttribute("title"), e.textContent ].filter(Boolean).join(" ");
            return _.extractCode(n) || "";
        },
        getInfiniteScrollContainer: (e, t = document) => "javbus" === e ? t === document ? f._getGridContainer() : t.querySelector("#waterfall") : "javdb" === e ? t.querySelector(".movie-list") || t.querySelector(".movies") || t.querySelector(".grid") : null,
        getInfiniteScrollConfig(e = document, t = location.href) {
            if (f.match()) {
                const n = this.getInfiniteScrollContainer("javbus", e), a = e.querySelector("a#next[href]");
                return n && a ? {
                    site: "javbus",
                    container: n,
                    nextUrl: new URL(a.getAttribute("href"), t).href,
                    itemSelector: "#waterfall > .item",
                    paginationSelector: ".pagination"
                } : null;
            }
            if (x.match()) {
                const n = this.getInfiniteScrollContainer("javdb", e), a = e.querySelector('a.pagination-next[rel="next"][href], a[rel="next"].pagination-link[href]');
                return n && a ? {
                    site: "javdb",
                    container: n,
                    nextUrl: new URL(a.getAttribute("href"), t).href,
                    itemSelector: ".movie-list .item, .movies .item, .grid .item",
                    paginationSelector: "nav.pagination"
                } : null;
            }
            return null;
        },
        decorateInfiniteScrollItem(e, t) {
            "javbus" === e && f._decorateCard?.(t), "javdb" === e && x._decorateCard?.(t), S.attach(t);
        },
        reflowInfiniteScroll(e, t) {
            if ("javbus" === e) {
                const e = this.getInfiniteScrollContainer("javbus") || t;
                return e?.querySelectorAll(":scope > .item").forEach(e => f._decorateCard?.(e)), 
                e || t;
            }
            const n = window.jQuery || window.$;
            return n && n(t).masonry && (n(t).masonry("reloadItems"), n(t).masonry("layout")), 
            t;
        },
        findPan115TitleTextNode(e) {
            const t = e.querySelector('.video-title, .title, [class*="title"], h1, h2, h3, h4, h5, p') || e;
            return document.createTreeWalker(t, NodeFilter.SHOW_TEXT, {
                acceptNode: e => e.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
            }).nextNode();
        },
        findPan115TitleAnchor(e) {
            if (!e || e.closest(".jav-jump-btn-group, .jav-pan115-badge")) return null;
            if (e.closest(".emby-btn, .emby-badge, .emby-button-group, .emby-javlibrary-list-badge")) return null;
            const t = e.getAttribute("href") || "";
            if (/^(?:magnet:|javascript:|#)/i.test(t)) return null;
            const n = [ e.getAttribute("title"), e.getAttribute("aria-label"), e.textContent, t ].filter(Boolean).join(" "), a = _.extractCode(n), r = M.extractCode(n, a);
            if (!a || !r) return null;
            const i = (e.textContent || e.getAttribute("title") || "").trim(), o = i.length > 0;
            if (!o) return null;
            const s = /\/v\/\w+/i.test(t) || /(?:^|\/|\.)jav\w+\.html(?:[?#].*)?$/i.test(t) || /\/videos\/[a-z0-9-]+\/?/i.test(t) || /\/(?:[a-z]{2,15}-\d{2,10}|fc2[-_]?ppv[-_]?\d{6,9})\/?$/i.test(t) || /\/(?:[a-z]{2,15}\d{3,6})\/?$/i.test(t) || /(?:movie|video|detail|view|jav)/i.test(t), l = !!e.closest(".movie-list, .movies, .grid, #waterfall, .movie-box, .box, .thumbnail, .video-list, .video-list-row, .section-container, .videothumblist");
            return !s && !l || o && !_.extractCode(i) && !s ? null : {
                anchor: e,
                code: r
            };
        },
        collectPan115ListTargets() {
            if (this.isDetailPage()) return [];
            const e = /supjav\.com/.test(location.hostname), t = new Set, n = [];
            /(javlibrary|javlib|r86m|s87n)/i.test(location.hostname) && document.querySelectorAll(".videothumblist .video > a[href]:not(.emby-javlibrary-list-badge)").forEach(e => {
                if (t.has(e) || "1" === e.dataset.pan115Checked) return;
                if (e.closest(".emby-btn, .emby-badge, .emby-button-group, .emby-javlibrary-list-badge")) return;
                const a = e.closest(".video"), r = [ a?.querySelector(".id")?.textContent, a?.querySelector(".title")?.textContent, e.getAttribute("title"), e.href ].filter(Boolean).join(" "), i = _.extractCode(r), o = M.extractCode(r, i);
                i && o && (t.add(e), n.push({
                    anchor: e,
                    code: o
                }));
            });
            const a = [ ...e ? [ ".post h3 a[href]" ] : [], ".movie-list a[href]", ".videothumblist .video > a[href]:not(.emby-javlibrary-list-badge)", ".movies a[href]", ".grid a[href]", ".item a[href]", ".video-title a[href]", "a.movie-box[href]", "a.box[href]", 'a[href*="/v/"]', "a[title][href]" ];
            return document.querySelectorAll(a.join(",")).forEach(a => {
                if (t.has(a) || "1" === a.dataset.pan115Checked) return;
                if (e && !a.matches(".post h3 a[href]")) return;
                t.add(a);
                const r = this.findPan115TitleAnchor(a);
                r && n.push(r);
            }), n;
        },
        insertPan115ListBadge(e, t, n) {
            if (!M.enabled() || !t?.pickcode || !e || "1" === e.dataset.pan115HasBadge) return;
            if (e.matches?.(".emby-javlibrary-list-badge") || e.closest?.(".emby-btn, .emby-badge, .emby-button-group, .emby-javlibrary-list-badge")) return;
            const a = e.querySelector(".title, .video-title");
            if (a) {
                const r = B(t, n, !1), i = a.querySelector(".javlib-card-headline");
                if (i) return i.insertBefore(r, i.firstChild), void (e.dataset.pan115HasBadge = "1");
                const o = a.querySelector(".javdb-card-headline");
                return o ? (o.insertBefore(r, o.firstChild), void (e.dataset.pan115HasBadge = "1")) : (a.insertBefore(r, a.firstChild), 
                void (e.dataset.pan115HasBadge = "1"));
            }
            const r = this.findPan115TitleTextNode(e);
            if (r?.parentNode && e.contains(r.parentNode)) {
                const e = B(t, n, !1);
                r.parentNode.insertBefore(e, r);
            } else {
                const a = B(t, n, !0);
                e.parentNode?.insertBefore(a, e);
            }
            e.dataset.pan115HasBadge = "1";
        },
        getDetailFeatureSite: () => K.find(e => e.match(window.location.href)) || null,
        getDetailCode() {
            const e = this.getDetailFeatureSite();
            if (!e) return "";
            const t = "emby" === e.id ? W() : document.querySelector(e.titleSelector || ""), n = t?.textContent || document.title || "";
            return _.extractCode(n) || "";
        },
        getDetailLayoutSite() {
            const e = location.hostname;
            return /(?:^|\.)javbus\.com$/i.test(e) && document.querySelector(".row.movie") ? "javbus" : /javdb/i.test(e) && document.querySelector(".jav-flex-container, .column.column-video-cover") ? "javdb" : /(javlibrary|javlib|r86m|s87n)/i.test(e) && document.querySelector("#video_jacket_info tr") ? "javlib" : "";
        },
        getMagnetSlot: () => document.querySelector(".jav-nong-slot"),
        createDetailPreviewStandaloneSlot() {
            const e = this.getDetailLayoutSite(), t = document.createElement("javlib" === e ? "td" : "div");
            if (t.className = "jav-detail-preview-standalone" + (e ? ` jav-detail-preview-standalone-${e}` : ""), 
            "javbus" === e) {
                const e = document.querySelector(".row.movie"), n = e?.querySelector(".col-md-3.info");
                return e && n ? (n.insertAdjacentElement("afterend", t), t) : null;
            }
            if ("javdb" === e) {
                const e = document.querySelector(".jav-flex-container"), n = e?.querySelector(".movie-panel-info")?.closest(".column") || e?.querySelector(".movie-panel-info");
                return e && n ? (n.insertAdjacentElement("afterend", t), t) : null;
            }
            if ("javlib" === e) {
                const e = document.querySelector("#video_jacket_info tr"), n = e?.querySelector("#video_info")?.closest("td");
                return e && n ? (n.insertAdjacentElement("afterend", t), t) : null;
            }
            return null;
        },
        getDetailPreviewTarget() {
            const e = this.getMagnetSlot();
            if (e) {
                document.querySelectorAll(".jav-detail-preview-standalone").forEach(e => e.remove());
                let t = e.querySelector(".jav-nong-wrapper");
                for (;t?.parentElement && t.parentElement !== e; ) t = t.parentElement;
                return {
                    slot: e,
                    anchor: t
                };
            }
            let t = document.querySelector(".jav-detail-preview-standalone");
            return t || (t = this.createDetailPreviewStandaloneSlot()), t ? {
                slot: t,
                anchor: null,
                standalone: !0
            } : null;
        },
        clearDetailPreviewInline() {
            document.querySelectorAll(".jav-detail-preview-wrap").forEach(e => e.remove()), 
            document.querySelectorAll(".jav-detail-preview-standalone").forEach(e => e.remove()), 
            document.querySelectorAll(".jav-nong-slot.has-detail-preview-inline").forEach(e => {
                e.classList.remove("has-detail-preview-inline");
            });
        },
        getJumpSite: (e = window.location.href) => K.find(t => t.match(e)) || null,
        getJumpTitleElement: e => e ? "emby" === e.id ? W() : document.querySelector(e.titleSelector) : null,
        getEmbyInsertAnchor: e => e?.closest(".itemPrimaryNameContainer, .nameContainer, .detailPageWrapperContainer .infoWrapper") || e,
        getEmbyRenderKey(e) {
            const t = location.hash || "";
            return `${t.match(/item\?id=([^&]+)/i)?.[1] || new URLSearchParams(t.split("?")[1] || "").get("id") || ""}::${(e?.textContent || "").trim()}`;
        },
        isEmbyPage: (e = window.location.href) => !!K.find(e => "emby" === e.id)?.match(e),
        setupJavDbGuards() {
            !this.javdbGuardsReady && x.match() && (this.javdbGuardsReady = !0, x._dismissOver18Modal(), 
            x._hideDownloadCorrectionBlock(), new MutationObserver(() => {
                x._dismissOver18Modal(), x._hideDownloadCorrectionBlock();
            }).observe(document.documentElement, {
                childList: !0,
                subtree: !0
            }), window.addEventListener("popstate", () => setTimeout(() => {
                x._dismissOver18Modal(), x._hideDownloadCorrectionBlock();
            }, 0)), window.addEventListener("hashchange", () => setTimeout(() => {
                x._dismissOver18Modal(), x._hideDownloadCorrectionBlock();
            }, 0)));
        },
        initCurrent() {
            const e = this.current();
            if (!e) return;
            const t = e.getVid();
            o("匹配站点:", e.constructor?.name || "未知", "| 番号:", t), e.initPage(t), r.applyCurrent(), 
            i.apply();
        }
    };
    function j() {
        w.initCurrent();
    }
    s.expose("__LAOSIJI_SITE_MANAGER__", w), s.expose("__LAOSIJI_SITE_JAVBUS__", f), 
    s.expose("__LAOSIJI_SITE_JAVDB__", x), s.expose("__LAOSIJI_SITE_JAVLIB__", y), GM_addStyle('\n        .preview-overlay {\n            position: fixed;\n            inset: 0;\n            background: rgba(0,0,0,0.85);\n            z-index: 2147483647;\n            display: flex;\n            overflow: auto;\n            cursor: zoom-out;\n            backdrop-filter: blur(5px);\n        }\n        .preview-img {\n            border-radius: 4px;\n            margin: auto;\n            cursor: zoom-in;\n            max-width: 95vw;\n            max-height: 95vh;\n            object-fit: contain;\n            display: block;\n            box-shadow: 0 0 20px rgba(0,0,0,0.5);\n        }\n        .preview-img.zoomed {\n            max-width: none;\n            max-height: none;\n            cursor: zoom-out;\n        }\n        a:focus:not(:focus-visible),\n        button:focus:not(:focus-visible),\n        [role="button"]:focus:not(:focus-visible),\n        input[type="button"]:focus:not(:focus-visible),\n        input[type="submit"]:focus:not(:focus-visible) {\n            outline: none !important;\n        }\n\n        .jav-jump-btn-group {\n            margin-top: 8px;\n            margin-bottom: 4px;\n            display: flex;\n            flex-wrap: wrap;\n            gap: 8px;\n            align-items: center;\n        }\n\n\n        .emby-fix {\n            width: 100% !important;\n            flex-basis: 100% !important;\n            clear: both !important;\n            margin-top: 8px !important;\n            margin-bottom: 4px !important;\n        }\n\n        .mini-switch {\n            width: 40px;\n            height: 20px;\n            appearance: none;\n            background: #e0e0e0;\n            border-radius: 20px;\n            position: relative;\n            cursor: pointer;\n            outline: none;\n            transition: background 0.2s;\n        }\n        .mini-switch:checked {\n            background: #4CAF50;\n        }\n        .mini-switch::before {\n            content: \'\';\n            position: absolute;\n            width: 16px;\n            height: 16px;\n            border-radius: 50%;\n            background: white;\n            top: 2px;\n            left: 2px;\n            transition: left 0.2s;\n        }\n        .mini-switch:checked::before {\n            left: calc(100% - 18px);\n        }\n\n        @keyframes btnSlideIn {\n            from {\n                opacity: 0;\n                transform: translateX(-10px);\n            }\n            to {\n                opacity: 1;\n                transform: translateX(0);\n            }\n        }\n\n        .jav-jump-btn-group a {\n            transition: background .16s ease, border-color .16s ease, box-shadow .16s ease, transform .16s ease;\n            animation: btnSlideIn 0.3s ease-out;\n        }\n\n        .jav-jump-btn-group a:hover {\n            background: var(--jav-btn-hover-bg, #f8fafc) !important;\n            transform: translateY(-1px) !important;\n            filter: none !important;\n            box-shadow: 0 5px 14px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.76) !important;\n            text-decoration: none !important;\n        }\n\n        @keyframes menuFadeIn {\n            from {\n                opacity: 0;\n                transform: translateY(-10px);\n            }\n            to {\n                opacity: 1;\n                transform: translateY(0);\n            }\n        }\n\n        .search-menu {\n            position: relative;\n            display: inline-block;\n            border-radius: 4px;\n        }\n        .search-main-btn {\n            padding-right: 28px !important;\n        }\n        .search-toggle-btn {\n            position: absolute;\n            right: 4px;\n            top: 50%;\n            transform: translateY(-50%);\n            width: 16px;\n            height: 16px;\n            padding: 0 !important;\n            margin: 0 !important;\n            display: inline-flex !important;\n            align-items: center;\n            justify-content: center;\n            flex-shrink: 0;\n            font-size: 10px !important;\n            line-height: 1;\n            opacity: 1;\n            background: color-mix(in srgb, var(--jav-btn-accent, #64748b) 18%, #ffffff) !important;\n            color: inherit !important;\n            border: 1px solid color-mix(in srgb, var(--jav-btn-accent, #64748b) 26%, #ffffff) !important;\n            border-radius: 999px !important;\n            box-shadow: 0 1px 2px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.7) !important;\n            cursor: pointer;\n        }\n        .search-toggle-btn:hover { filter: none; background: color-mix(in srgb, var(--jav-btn-accent, #64748b) 26%, #ffffff) !important; }\n        .search-toggle-btn .search-arrow { display: inline-block; transform: translateY(-1px); pointer-events: none; }\n        .search-submenu {\n            position: absolute;\n            top: calc(100% + 4px);\n            left: 0;\n            display: none;\n            flex-direction: column;\n            gap: 4px;\n            padding: 4px;\n            background: rgba(255,255,255,0.95);\n            border-radius: 6px;\n            box-shadow: 0 4px 12px rgba(0,0,0,0.2);\n            z-index: 10000;\n            min-width: 120px;\n            backdrop-filter: blur(5px);\n        }\n        .search-submenu.is-open { display: flex; }\n        .search-submenu a { transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important; }\n        .search-submenu a:hover { transform: translateX(5px) scale(1.02); filter: brightness(1.1); }\n        .jav-pan115-badge {\n            display: inline-flex;\n            align-items: center;\n            justify-content: center;\n            min-width: 58px;\n            height: 22px !important;\n            padding: 0 7px;\n            margin-right: 6px;\n            position: static !important;\n            top: auto !important;\n            transform: none !important;\n            border-radius: 6px;\n            background: #bbf7d0;\n            border: 1px solid #22c55e;\n            color: #065f46;\n            font-size: 12px !important;\n            font-weight: 800;\n            line-height: 22px !important;\n            text-decoration: none;\n            box-sizing: border-box;\n            vertical-align: middle;\n            box-shadow: inset 0 1px 0 rgba(255,255,255,0.72);\n        }\n        .jav-pan115-badge:hover {\n            background: #86efac;\n            color: #064e3b;\n            text-decoration: none;\n            box-shadow: 0 4px 12px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.76);\n        }\n        span.jav-pan115-badge {\n            cursor: pointer;\n        }\n        .jav-infinite-sentinel {\n            width: 100%;\n            padding: 14px 0;\n            color: #64748b;\n            font-size: 13px;\n            font-weight: 700;\n            text-align: center;\n            clear: both;\n        }\n        .jav-infinite-sentinel.is-loading { color: #2563eb; }\n        .jav-infinite-sentinel.is-done { color: #94a3b8; }\n        .jav-infinite-sentinel.is-error { color: #dc2626; cursor: pointer; }\n\n        .preview-toolbar {\n            position: fixed;\n            top: 20px;\n            right: 20px;\n            display: flex;\n            gap: 8px;\n            z-index: 2147483648;\n            background: rgba(30, 30, 30, 0.75);\n            backdrop-filter: blur(10px);\n            padding: 6px 12px;\n            border-radius: 30px;\n            border: 1px solid rgba(255, 255, 255, 0.08);\n            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);\n        }\n\n        .preview-btn {\n            border: none;\n            color: #eee;\n            font-size: 13px;\n            font-weight: 450;\n            cursor: pointer;\n            padding: 6px 14px;\n            border-radius: 24px;\n            transition: all 0.2s ease;\n            display: inline-flex;\n            align-items: center;\n            gap: 6px;\n            background: rgba(100, 100, 120, 0.3);\n            border: 1px solid rgba(255, 255, 255, 0.05);\n            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n            letter-spacing: 0.2px;\n        }\n\n        .preview-btn:hover {\n            background: rgba(140, 140, 160, 0.4);\n            transform: translateY(-2px);\n            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);\n        }\n\n        .preview-btn.javfree.active {\n            background: #2ecc71;\n            color: white;\n            border-color: rgba(255, 255, 255, 0.3);\n            box-shadow: 0 0 16px rgba(46, 204, 113, 0.6);\n            font-weight: 500;\n        }\n\n        .preview-btn.javstore.active {\n            background: #e74c3c;\n            color: white;\n            border-color: rgba(255, 255, 255, 0.3);\n            box-shadow: 0 0 16px rgba(231, 76, 60, 0.6);\n            font-weight: 500;\n        }\n\n        .preview-btn.action {\n            background: rgba(100, 100, 120, 0.3);\n        }\n        .preview-btn.action:hover {\n            background: rgba(140, 140, 160, 0.5);\n        }\n\n        .preview-btn:active {\n            transform: translateY(0);\n            box-shadow: 0 2px 4px rgba(0,0,0,0.15);\n        }\n\n        .trailer-overlay {\n            position: fixed;\n            inset: 0;\n            z-index: 2147483647;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            padding: 34px;\n            background:\n                radial-gradient(circle at 50% 18%, rgba(56, 189, 248, 0.16), transparent 32%),\n                linear-gradient(180deg, rgba(5, 7, 12, 0.88), rgba(0, 0, 0, 0.96));\n            backdrop-filter: blur(16px) saturate(0.85);\n            cursor: default;\n        }\n        .trailer-modal {\n            width: min(1120px, 94vw);\n            max-height: 92vh;\n            display: flex;\n            flex-direction: column;\n            overflow: hidden;\n            color: #f8fafc;\n            background: #05070c;\n            border: 1px solid rgba(255, 255, 255, 0.12);\n            border-radius: 8px;\n            box-shadow:\n                0 30px 80px rgba(0, 0, 0, 0.68),\n                0 0 0 1px rgba(255, 255, 255, 0.04) inset;\n            cursor: default;\n            animation: trailerFadeIn .18s ease-out;\n        }\n        @keyframes trailerFadeIn {\n            from { opacity: 0; transform: translateY(14px) scale(.985); }\n            to { opacity: 1; transform: translateY(0) scale(1); }\n        }\n        .trailer-header {\n            position: absolute;\n            top: 0;\n            left: 0;\n            right: 0;\n            z-index: 4;\n            display: flex;\n            align-items: center;\n            justify-content: space-between;\n            gap: 16px;\n            padding: 16px 18px 34px;\n            background: linear-gradient(180deg, rgba(0, 0, 0, 0.66), rgba(0, 0, 0, 0));\n            border: 0;\n            pointer-events: none;\n            opacity: 1;\n            transition: opacity .18s ease, transform .18s ease;\n        }\n        .trailer-title {\n            min-width: 0;\n            display: flex;\n            align-items: center;\n            gap: 10px;\n            font: 700 15px/1.3 Arial, "Microsoft YaHei", sans-serif;\n            pointer-events: auto;\n        }\n        .trailer-code {\n            overflow: hidden;\n            text-overflow: ellipsis;\n            white-space: nowrap;\n            letter-spacing: .4px;\n        }\n        .trailer-source {\n            flex-shrink: 0;\n            padding: 3px 9px;\n            border-radius: 999px;\n            color: rgba(255, 255, 255, 0.82);\n            background: rgba(255, 255, 255, 0.12);\n            border: 1px solid rgba(255, 255, 255, 0.18);\n            font-size: 12px;\n            font-weight: 500;\n            backdrop-filter: blur(12px);\n        }\n        .jav-player-close {\n            width: 34px;\n            height: 34px;\n            border: 0;\n            border-radius: 50%;\n            color: #fff;\n            background: rgba(255, 255, 255, 0.14);\n            cursor: pointer;\n            font-size: 18px;\n            line-height: 34px;\n            pointer-events: auto;\n            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.22);\n            transition: transform .15s ease, background .15s ease, box-shadow .15s ease;\n        }\n        .jav-player-close:hover {\n            transform: scale(1.08);\n            background: rgba(248, 113, 113, 0.34);\n            box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);\n        }\n        .trailer-screen {\n            position: relative;\n            aspect-ratio: 16 / 9;\n            width: 100%;\n            max-height: 82vh;\n            overflow: hidden;\n            background:\n                radial-gradient(circle at center, rgba(31, 41, 55, .75), #000 62%),\n                #000;\n        }\n        .trailer-screen:fullscreen {\n            width: 100vw;\n            height: 100vh;\n            max-height: none;\n            aspect-ratio: auto;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            background: #000;\n        }\n        .trailer-screen:-webkit-full-screen {\n            width: 100vw;\n            height: 100vh;\n            max-height: none;\n            aspect-ratio: auto;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            background: #000;\n        }\n        .trailer-screen::before {\n            content: "";\n            position: absolute;\n            inset: 0;\n            z-index: 1;\n            pointer-events: none;\n            background:\n                linear-gradient(180deg, rgba(0, 0, 0, 0.52), rgba(0, 0, 0, 0) 30%),\n                linear-gradient(0deg, rgba(0, 0, 0, 0.62), rgba(0, 0, 0, 0) 36%);\n        }\n        .trailer-screen video,\n        .trailer-screen iframe {\n            position: absolute;\n            inset: 0;\n            width: 100%;\n            height: 100%;\n            display: block;\n            border: 0;\n            background: #000;\n            object-fit: contain;\n        }\n        .trailer-volume-indicator {\n            position: absolute;\n            top: 62px;\n            right: 26px;\n            z-index: 5;\n            color: #f8fafc;\n            font: 750 24px/1 Arial, "Microsoft YaHei", sans-serif;\n            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.82);\n            opacity: 0;\n            pointer-events: none;\n            transition: opacity .14s ease;\n        }\n        .trailer-volume-indicator.is-visible {\n            opacity: 1;\n        }\n        .trailer-quality-bar {\n            display: flex;\n            align-items: center;\n            gap: 8px;\n            padding: 0;\n            background: transparent;\n            border: none;\n            border-radius: 0;\n            backdrop-filter: none;\n        }\n        .trailer-quality-select {\n            min-width: 78px;\n            max-width: 140px;\n            height: 30px;\n            padding: 0 10px;\n            border-radius: 999px;\n            border: 1px solid rgba(255, 255, 255, 0.16);\n            background: rgba(255, 255, 255, 0.12);\n            color: #f8fafc;\n            outline: none;\n            font-size: 12px;\n            line-height: 28px;\n            text-align: center;\n            text-align-last: center;\n            appearance: none;\n            cursor: pointer;\n        }\n        .trailer-quality-select option {\n            background: #0b1020;\n            color: #f8fafc;\n        }\n        .trailer-footer {\n            position: absolute;\n            left: 16px;\n            right: 16px;\n            bottom: 16px;\n            z-index: 4;\n            display: flex;\n            align-items: center;\n            justify-content: space-between;\n            gap: 10px;\n            padding: 9px 10px;\n            color: rgba(255, 255, 255, 0.78);\n            background: rgba(10, 14, 22, 0.62);\n            border: 1px solid rgba(255, 255, 255, 0.16);\n            border-radius: 8px;\n            box-shadow: 0 18px 40px rgba(0, 0, 0, 0.32);\n            backdrop-filter: blur(16px) saturate(1.08);\n            font: 12px/1.4 Arial, "Microsoft YaHei", sans-serif;\n            opacity: 1;\n            transform: translateY(0);\n            transition: opacity .18s ease, transform .18s ease;\n        }\n        .trailer-screen.is-controls-hidden {\n            cursor: none;\n        }\n        .trailer-screen.is-controls-hidden .trailer-header {\n            opacity: 0;\n            transform: translateY(-8px);\n            pointer-events: none;\n        }\n        .trailer-screen.is-controls-hidden .trailer-footer {\n            opacity: 0;\n            transform: translateY(10px);\n            pointer-events: none;\n        }\n        .trailer-control-left,\n        .trailer-control-right {\n            display: flex;\n            align-items: center;\n            gap: 9px;\n            min-width: 0;\n        }\n        .trailer-control-left {\n            flex: 1 1 auto;\n        }\n        .trailer-control-right {\n            flex: 0 0 auto;\n        }\n        .trailer-control-btn {\n            width: 30px;\n            height: 30px;\n            display: inline-flex;\n            align-items: center;\n            justify-content: center;\n            flex: 0 0 auto;\n            padding: 0;\n            border: 0;\n            border-radius: 999px;\n            color: #fff;\n            background: rgba(255, 255, 255, 0.14);\n            cursor: pointer;\n            font: 700 13px/1 Arial, "Microsoft YaHei", sans-serif;\n            transition: background .15s ease, transform .15s ease;\n        }\n        .trailer-control-btn:hover {\n            background: rgba(255, 255, 255, 0.24);\n            transform: translateY(-1px);\n        }\n        .trailer-volume-wrap {\n            position: relative;\n            display: inline-flex;\n            flex: 0 0 auto;\n            align-items: center;\n            justify-content: center;\n        }\n        .trailer-volume-wrap::before {\n            content: "";\n            position: absolute;\n            left: 50%;\n            bottom: 100%;\n            width: 46px;\n            height: 14px;\n            transform: translateX(-50%);\n        }\n        .trailer-volume-popover {\n            position: absolute;\n            left: 50%;\n            bottom: calc(100% + 8px);\n            width: 34px;\n            height: 118px;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            padding: 10px 0;\n            border-radius: 999px;\n            background: rgba(10, 14, 22, 0.76);\n            border: 1px solid rgba(255, 255, 255, 0.16);\n            box-shadow: 0 14px 32px rgba(0, 0, 0, 0.34);\n            backdrop-filter: blur(16px) saturate(1.08);\n            opacity: 0;\n            pointer-events: none;\n            transform: translate(-50%, 6px);\n            transition: opacity .15s ease, transform .15s ease;\n        }\n        .trailer-volume-wrap:hover .trailer-volume-popover {\n            opacity: 1;\n            pointer-events: auto;\n            transform: translate(-50%, 0);\n        }\n        .trailer-volume-rail {\n            position: absolute;\n            left: 50%;\n            top: 14px;\n            bottom: 14px;\n            width: 4px;\n            transform: translateX(-50%);\n            border-radius: 999px;\n            background: rgba(255, 255, 255, 0.32);\n            pointer-events: none;\n        }\n        .trailer-volume-fill {\n            position: absolute;\n            left: 0;\n            right: 0;\n            bottom: 0;\n            height: var(--volume-percent, 35%);\n            border-radius: 999px;\n            background: #38bdf8;\n        }\n        .trailer-volume-thumb {\n            position: absolute;\n            left: 50%;\n            bottom: var(--volume-percent, 35%);\n            width: 16px;\n            height: 16px;\n            transform: translate(-50%, 50%);\n            border-radius: 50%;\n            background: #38bdf8;\n            border: 2px solid rgba(255, 255, 255, 0.92);\n            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.38);\n        }\n        .trailer-volume-slider {\n            position: absolute;\n            top: 8px;\n            bottom: 8px;\n            left: 50%;\n            width: 16px;\n            height: calc(100% - 16px);\n            margin: 0;\n            transform: translateX(-50%);\n            appearance: none;\n            -webkit-appearance: none;\n            writing-mode: vertical-lr;\n            direction: rtl;\n            background: transparent;\n            cursor: pointer;\n        }\n        .trailer-volume-slider::-webkit-slider-runnable-track {\n            width: 100%;\n            height: 100%;\n            background: transparent;\n        }\n        .trailer-volume-slider::-moz-range-track {\n            width: 100%;\n            height: 100%;\n            background: transparent;\n        }\n        .trailer-volume-slider::-webkit-slider-thumb {\n            -webkit-appearance: none;\n            width: 24px;\n            height: 16px;\n            background: transparent;\n            border: 0;\n            box-shadow: none;\n        }\n        .trailer-volume-slider::-moz-range-thumb {\n            width: 24px;\n            height: 16px;\n            background: transparent;\n            border: 0;\n            box-shadow: none;\n        }\n        .trailer-time {\n            flex: 0 0 auto;\n            min-width: 36px;\n            color: rgba(255, 255, 255, 0.78);\n            font: 11px/1.3 Arial, "Microsoft YaHei", sans-serif;\n            white-space: nowrap;\n            text-align: center;\n        }\n        .trailer-progress {\n            flex: 1 1 160px;\n            min-width: 120px;\n            height: 4px;\n            margin: 0;\n            border-radius: 999px;\n            accent-color: #38bdf8;\n            cursor: pointer;\n        }\n        .jav-jump-toast {\n            position: fixed;\n            left: 50%;\n            top: 72px;\n            z-index: 2147483647;\n            display: flex;\n            align-items: flex-start;\n            gap: 12px;\n            width: min(420px, calc(100vw - 32px));\n            padding: 14px 16px;\n            color: #f8fafc;\n            background: rgba(15, 23, 42, 0.94);\n            border: 1px solid rgba(148, 163, 184, 0.28);\n            border-left: 4px solid #38bdf8;\n            border-radius: 12px;\n            box-shadow:\n                0 18px 44px rgba(0, 0, 0, 0.34),\n                0 0 0 1px rgba(255, 255, 255, 0.04) inset;\n            backdrop-filter: blur(14px) saturate(1.1);\n            font-family: Arial, "Microsoft YaHei", sans-serif;\n            transform: translate(-50%, -12px);\n            opacity: 0;\n            pointer-events: none;\n            transition: opacity .18s ease, transform .18s ease;\n        }\n        .jav-jump-toast.show {\n            opacity: 1;\n            transform: translate(-50%, 0);\n        }\n        .jav-jump-toast.hide {\n            opacity: 0;\n            transform: translate(-50%, -12px);\n        }\n        .jav-jump-toast-icon {\n            flex: 0 0 auto;\n            width: 24px;\n            height: 24px;\n            border-radius: 999px;\n            color: #082f49;\n            background: #7dd3fc;\n            font-size: 16px;\n            font-weight: 800;\n            line-height: 24px;\n            text-align: center;\n        }\n        .jav-jump-toast-title {\n            margin: 0 0 4px;\n            font-size: 14px;\n            font-weight: 700;\n            line-height: 1.35;\n        }\n        .jav-jump-toast-message {\n            margin: 0;\n            color: #cbd5e1;\n            font-size: 13px;\n            line-height: 1.45;\n        }\n        @media (max-width: 720px) {\n            .trailer-overlay { padding: 12px; }\n            .trailer-modal { width: 100%; border-radius: 8px; }\n            .trailer-header { padding: 12px 12px 30px; }\n            .trailer-title { gap: 7px; font-size: 13px; }\n            .trailer-source { max-width: 42vw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n            .trailer-footer {\n                left: 8px;\n                right: 8px;\n                bottom: 8px;\n                flex-direction: column;\n                align-items: stretch;\n                gap: 7px;\n                padding: 8px;\n            }\n            .trailer-control-left,\n            .trailer-control-right {\n                width: 100%;\n                justify-content: center;\n            }\n            .trailer-progress { min-width: 80px; }\n            .jav-jump-toast {\n                top: 18px;\n                width: calc(100vw - 24px);\n                padding: 13px 14px;\n            }\n        }\n    ');
    const _ = {
        normalizeCode(e) {
            const t = String(e || "").trim();
            if (!t) return "";
            const n = t.replace(/\s+/g, "-").replace(/^FC2[-_]?PPV[-_]?/i, "FC2-").toUpperCase(), a = n.match(/(\d{6})[-_](\d{2,3})/);
            if (a) {
                const e = a[0].includes("_") ? "_" : "-";
                return `${a[1]}${e}${a[2]}`;
            }
            const r = n.match(/^([A-Z]{2,10})(\d{3,6})$/);
            if (r) {
                const e = r[2].replace(/^0+(?=\d{3})/, "");
                return `${r[1]}-${e}`;
            }
            const i = n.match(/^([A-Z0-9]{2,15}[-_]\d{2,9})/);
            return i ? i[1] : n;
        },
        extractCode(e, t = {}) {
            if (!e) return null;
            const n = String(e).match(/\b(\d{3}[A-Z]{2,10})[-_\s](\d{2,6})\b/i);
            if (n) return _.normalizeCode(`${n[1]}-${n[2]}`);
            const a = String(e).match(/(?:(PACOPACOMAMA|PACO|10MUSUME|10MU|1PONDO|CARIBBEANCOM|CARIB|HEYZO)[-_\s]*)?(\d{6})([-_])(\d{2,3})/i);
            if (a) {
                const e = _.normalizeCode(`${a[2]}${a[3]}${a[4]}`);
                return t.keepUncensoredSource && a[1] ? `${a[1].toUpperCase()}_${e}` : e;
            }
            const r = [ {
                regex: /([A-Z]{2,15})[-_\s]([A-Z]{1,2}\d{2,10})/i,
                type: "alphanum"
            }, {
                regex: /FC2[-\s_]?(?:PPV)?[-\s_]?(\d{6,9})/i,
                type: "fc2"
            }, {
                regex: /([A-Z]{2,15})[-_\s](\d{2,10})(?:[-_](\d{1,3}))?/i,
                type: "standard"
            }, {
                regex: /(\d{6})([-_\s]?)(\d{2,3})/,
                type: "numeric"
            }, {
                regex: /\b([A-Z]{2,10})(\d{3,6})\b/i,
                type: "compactStandard"
            }, {
                regex: /([A-Z]{1,2})(\d{3,4})/i,
                type: "compact"
            } ], i = [ "FULLHD", "H264", "H265", "1080P", "720P", "PART", "DISC", "10BIT" ];
            for (let t = 0; t < r.length; t++) {
                const {regex: n, type: a} = r[t], o = e.match(n);
                if (o) {
                    if ("alphanum" === a) return _.normalizeCode(o[0].trim());
                    if ("standard" === a) {
                        const e = o[1].toUpperCase();
                        if (i.includes(e)) continue;
                        return _.normalizeCode(o[3] ? `${e}-${o[2]}-${o[3]}` : `${e}-${o[2]}`);
                    }
                    if ("fc2" === a) return _.normalizeCode(`FC2-PPV-${o[1]}`);
                    if ("numeric" === a) return "_" === o[2] ? _.normalizeCode(`${o[1]}_${o[3]}`) : _.normalizeCode(`${o[1]}-${o[3]}`);
                    if ("compactStandard" === a) {
                        const e = o[1].toUpperCase();
                        if (i.includes(e)) continue;
                        const t = o[2].replace(/^0+(?=\d{3})/, "");
                        return _.normalizeCode(`${e}-${t}`);
                    }
                    if ("compact" === a) return _.normalizeCode(o[0].toUpperCase());
                }
            }
            return null;
        },
        hexToRgb(e) {
            const t = String(e || "").trim().replace(/^#/, "");
            if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(t)) return {
                r: 100,
                g: 116,
                b: 139
            };
            const n = 3 === t.length ? t.split("").map(e => e + e).join("") : t;
            return {
                r: parseInt(n.slice(0, 2), 16),
                g: parseInt(n.slice(2, 4), 16),
                b: parseInt(n.slice(4, 6), 16)
            };
        },
        mixColor(e, t = "#ffffff", n = .12) {
            const a = _.hexToRgb(e), r = _.hexToRgb(t), i = e => Math.round(a[e] * n + r[e] * (1 - n));
            return `rgb(${i("r")}, ${i("g")}, ${i("b")})`;
        },
        getModernBtnStyle(e) {
            const t = e || "#64748b", n = _.mixColor(t, "#ffffff", .1), a = _.mixColor(t, "#dbe3ef", .28), r = _.mixColor(t, "#111827", .72);
            return [ "height:30px", "padding:0 11px", `--jav-btn-accent:${t}`, `--jav-btn-hover-bg:${_.mixColor(t, "#ffffff", .16)}`, `background:${n}`, `color:${r}`, `border:1px solid ${a}`, "border-radius:7px", "font-size:13px", "font-weight:700", "line-height:1", "cursor:pointer", "text-decoration:none", "display:inline-flex", "align-items:center", "justify-content:center", "gap:6px", "white-space:nowrap", "box-shadow:inset 0 1px 0 rgba(255,255,255,0.7)", "box-sizing:border-box" ].join(";");
        },
        createLinkBtn(e, t, n) {
            const a = document.createElement("a");
            return a.textContent = e, a.href = n || "#", n && (a.target = "_blank"), a.rel = "noopener noreferrer", 
            a.style.cssText = _.getModernBtnStyle(t), a;
        },
        createJumpLinkBtn(e, t, n) {
            const a = _.createLinkBtn(e, t, n);
            return a.addEventListener("click", e => {
                e.stopImmediatePropagation();
            }, !0), a;
        },
        createBtn(e, t, n, a = !1) {
            const r = document.createElement("a");
            return r.textContent = e, r.style.cssText = _.getModernBtnStyle(t), a ? r.addEventListener("click", e => {
                e.preventDefault(), e.stopPropagation(), n();
            }, !0) : r.onclick = e => {
                e.preventDefault(), n();
            }, r;
        },
        request: e => new Promise(t => {
            GM_xmlhttpRequest({
                method: "GET",
                url: e,
                timeout: 3e4,
                onload: e => t(e.responseText)
            });
        }),
        showToast(e, t = "", n = 2e3) {
            document.querySelector(".jav-jump-toast")?.remove();
            const a = document.createElement("div");
            a.className = "jav-jump-toast";
            const r = document.createElement("div");
            r.className = "jav-jump-toast-icon", r.textContent = "!";
            const i = document.createElement("div"), o = document.createElement("p");
            o.className = "jav-jump-toast-title", o.textContent = e;
            const s = document.createElement("p");
            s.className = "jav-jump-toast-message", s.textContent = t, i.appendChild(o), t && i.appendChild(s), 
            a.appendChild(r), a.appendChild(i), document.body.appendChild(a), requestAnimationFrame(() => a.classList.add("show")), 
            setTimeout(() => {
                a.classList.remove("show"), a.classList.add("hide"), setTimeout(() => a.remove(), 220);
            }, n);
        },
        showOverlay(e, t, n = null) {
            const a = document.documentElement.style.overflow, r = document.body.style.overflow;
            document.documentElement.style.overflow = "hidden", document.body.style.overflow = "hidden";
            const i = document.createElement("div");
            i.className = "preview-overlay";
            const o = document.createElement("img");
            o.className = "preview-img zoomed", o.onclick = e => {
                e.stopPropagation(), o.classList.toggle("zoomed");
            };
            let s = null;
            const l = (e, t) => {
                s && (URL.revokeObjectURL(s), s = null), "projectjav" === t ? (o.src = "", GM_xmlhttpRequest({
                    method: "GET",
                    url: e,
                    responseType: "blob",
                    headers: {
                        Referer: "https://projectjav.com/",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                    },
                    onload: e => {
                        e.response && (s = URL.createObjectURL(e.response), o.src = s);
                    },
                    onerror: () => {
                        o.src = e;
                    }
                })) : o.src = e;
            };
            l(e, n);
            const c = document.createElement("div");
            c.className = "preview-toolbar", c.style.cssText = "\n                position: fixed;\n                top: 20px;\n                right: 20px;\n                display: flex;\n                gap: 12px;\n                z-index: 2147483648;\n            ";
            const d = (e, t, n, a) => {
                const r = document.createElement("button");
                return r.className = `preview-btn ${n}`, r.innerHTML = `${t} ${e}`, r.onclick = a, 
                r;
            }, p = e => {
                m.classList.toggle("active", "javfree" === e), u.classList.toggle("active", "projectjav" === e), 
                h.classList.toggle("active", "javstore" === e);
            }, m = d("javfree", "🟢", "javfree", async e => {
                e.stopPropagation();
                const n = await k.javfree(t);
                n ? (l(n, "javfree"), p("javfree")) : alert("javfree 未找到预览图");
            }), u = d("projectjav", "🟡", "javstore", async e => {
                e.stopPropagation();
                const n = await k.projectjav(t);
                n ? (l(n, "projectjav"), p("projectjav")) : alert("projectjav 未找到预览图");
            }), h = d("javstore", "🔴", "javstore", async e => {
                e.stopPropagation();
                const n = await k.javstore(t);
                n ? (l(n, "javstore"), p("javstore")) : alert("javstore 未找到预览图");
            }), g = d("新窗口", "🌐", "action", e => {
                e.stopPropagation(), window.open(o.src);
            }), v = d("下载", "⬇️", "action", e => {
                e.stopPropagation(), GM_download(o.src, `${t}.jpg`);
            });
            "javfree" === n ? m.classList.add("active") : "projectjav" === n ? u.classList.add("active") : "javstore" === n && h.classList.add("active"), 
            c.appendChild(m), c.appendChild(u), c.appendChild(h), c.appendChild(g), c.appendChild(v), 
            i.appendChild(o);
            const b = () => {
                i.parentNode && (i.remove(), c.remove(), document.documentElement.style.overflow = a, 
                document.body.style.overflow = r, s && (URL.revokeObjectURL(s), s = null));
            };
            i.onclick = b;
            const f = e => {
                "Escape" === e.key && (b(), document.removeEventListener("keydown", f));
            };
            document.addEventListener("keydown", f), document.body.appendChild(i), document.body.appendChild(c);
        },
        showTrailerOverlay({code: e, url: t, type: n = "video", source: a = "预告片", qualities: r = null, quality: i = null, urls: o = null}) {
            document.querySelector(".trailer-overlay")?.remove();
            const s = document.documentElement.style.overflow, l = document.body.style.overflow;
            document.documentElement.style.overflow = "hidden", document.body.style.overflow = "hidden";
            const c = document.createElement("div");
            c.className = "trailer-overlay";
            const d = document.createElement("div");
            d.className = "trailer-modal", d.onclick = e => e.stopPropagation();
            const p = document.createElement("div");
            p.className = "trailer-header";
            const m = document.createElement("div");
            m.className = "trailer-title", m.innerHTML = `\n                <span>🎞️</span>\n                <span class="trailer-code">${e}</span>\n                <span class="trailer-source">${a}</span>\n            `;
            const u = document.createElement("button");
            u.className = "jav-player-close", u.type = "button", u.textContent = "×", p.appendChild(m), 
            p.appendChild(u);
            const h = document.createElement("div");
            h.className = "trailer-screen";
            const g = document.createElement("div");
            g.className = "trailer-volume-indicator";
            const v = document.createElement("button");
            v.className = "trailer-control-btn", v.type = "button", v.textContent = "⏸", v.title = "播放/暂停";
            const b = document.createElement("button");
            b.className = "trailer-control-btn", b.type = "button", b.textContent = "🔊", b.title = "静音/取消静音";
            const f = document.createElement("div");
            f.className = "trailer-volume-wrap";
            const x = document.createElement("div");
            x.className = "trailer-volume-popover";
            const y = document.createElement("div");
            y.className = "trailer-volume-rail";
            const w = document.createElement("div");
            w.className = "trailer-volume-fill";
            const j = document.createElement("div");
            j.className = "trailer-volume-thumb";
            const _ = document.createElement("input");
            _.className = "trailer-volume-slider", _.type = "range", _.min = "0", _.max = "100", 
            _.step = "1", _.value = "35", _.title = "音量", y.appendChild(w), y.appendChild(j), 
            x.appendChild(y), x.appendChild(_), f.appendChild(b), f.appendChild(x);
            const k = document.createElement("span");
            k.className = "trailer-time", k.textContent = "00:00";
            const S = document.createElement("span");
            S.className = "trailer-time", S.textContent = "00:00";
            const C = document.createElement("input");
            C.className = "trailer-progress", C.type = "range", C.min = "0", C.max = "1000", 
            C.step = "1", C.value = "0", C.title = "播放进度";
            const E = document.createElement("button");
            E.className = "trailer-control-btn", E.type = "button", E.textContent = "⛶", E.title = "全屏";
            let q = null, A = t, M = i, P = null, L = null, $ = !1;
            const T = Array.isArray(o) ? [ ...new Set(o.filter(Boolean)) ] : [ t ].filter(Boolean);
            let z = Math.max(0, T.indexOf(t));
            const I = {
                href: A
            }, U = `trailer_playback_${String(e || "").trim().toUpperCase()}_${String(t || "").slice(0, 160)}`, N = (e = q?.currentTime || 0, t = U) => {
                if (!Number.isFinite(e) || e < 3) return;
                const n = Number(q?.duration || 0);
                Number.isFinite(n) && n > 0 && n - e < 3 ? sessionStorage.removeItem(t) : sessionStorage.setItem(t, String(Math.floor(e)));
            }, R = (e = U) => {
                if (!q || "1" === q.dataset.playbackRestored) return;
                const t = ((e = U) => {
                    const t = Number(sessionStorage.getItem(e) || 0);
                    return Number.isFinite(t) && t > 0 ? t : 0;
                })(e);
                if (!t) return;
                const n = Number(q.duration || 0);
                Number.isFinite(n) && n > 0 && t < n - 3 && (q.currentTime = t, q.dataset.playbackRestored = "1", 
                G());
            }, D = e => {
                if (!Number.isFinite(e) || e < 0) return "00:00";
                const t = Math.floor(e), n = Math.floor(t / 3600), a = Math.floor(t % 3600 / 60), r = t % 60;
                return n ? `${n}:${String(a).padStart(2, "0")}:${String(r).padStart(2, "0")}` : `${String(a).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
            }, G = () => {
                q && (v.textContent = q.paused ? "▶" : "⏸", b.textContent = q.muted || q.volume <= 0 ? "🔇" : "🔊", 
                _.value = String(Math.round(100 * (q.muted ? 0 : q.volume))), y.style.setProperty("--volume-percent", `${_.value}%`), 
                k.textContent = D(q.currentTime || 0), S.textContent = D(q.duration || 0), !$ && Number.isFinite(q.duration) && q.duration > 0 && (C.value = String(Math.round((q.currentTime || 0) / q.duration * 1e3))));
            }, B = () => {
                q && (g.textContent = `${Math.round(100 * q.volume)}%`, g.classList.add("is-visible"), 
                clearTimeout(P), P = setTimeout(() => {
                    g.classList.remove("is-visible");
                }, 820));
            }, O = () => {
                h.classList.remove("is-controls-hidden"), clearTimeout(L), q && !q.paused && (L = setTimeout(() => {
                    X.matches(":hover") || document.activeElement === _ || h.classList.add("is-controls-hidden");
                }, 2e3));
            }, H = () => {
                clearTimeout(L), q && !q.paused ? L = setTimeout(() => {
                    h.classList.add("is-controls-hidden");
                }, 2e3) : h.classList.remove("is-controls-hidden");
            }, J = () => {
                document.fullscreenElement ? document.exitFullscreen?.() : h.requestFullscreen?.();
            }, F = /\.m3u8(?:[?#].*)?$/i.test(t), V = () => class {
                constructor(e) {
                    this.config = e, this.context = null, this.callbacks = null, this.loader = null;
                }
                destroy() {
                    this.abort();
                }
                abort() {
                    this.loader?.abort?.(), this.loader = null;
                }
                load(e, t, n) {
                    this.context = e, this.callbacks = n;
                    const a = e.url;
                    this.loader = GM_xmlhttpRequest({
                        method: "GET",
                        url: a,
                        responseType: "arraybuffer" === e.responseType ? "arraybuffer" : "text",
                        timeout: t?.timeout || 2e4,
                        onload: t => {
                            const r = "arraybuffer" === e.responseType ? t.response : t.responseText || "";
                            n.onSuccess?.({
                                data: r,
                                url: t.finalUrl || a
                            }, {
                                trequest: Date.now(),
                                tfirst: Date.now(),
                                tload: Date.now()
                            }, e);
                        },
                        onerror: () => n.onError?.({
                            code: 0,
                            text: "network error"
                        }, e, null),
                        ontimeout: () => n.onTimeout?.(Date.now(), e, null)
                    });
                }
            }, K = e => {
                e && (q.src = e);
            }, Z = e => {
                e && (/\.m3u8(?:[?#].*)?$/i.test(e) ? (e => {
                    if (!e) return;
                    if (!(window.Hls && window.Hls.isSupported && window.Hls.isSupported())) return void (q.src = e);
                    const t = new window.Hls({
                        enableWorker: !1,
                        lowLatencyMode: !0,
                        loader: V(),
                        autoStartLoad: !0,
                        startPosition: 0,
                        capLevelToPlayerSize: !0,
                        testBandwidth: !1,
                        preferManagedMediaSource: !1,
                        maxBufferLength: 6,
                        maxMaxBufferLength: 12,
                        backBufferLength: 30,
                        maxBufferHole: .5,
                        nudgeOffset: .1,
                        manifestLoadingMaxRetry: 2,
                        levelLoadingMaxRetry: 2,
                        fragLoadingMaxRetry: 2,
                        manifestLoadingTimeOut: 12e3,
                        levelLoadingTimeOut: 12e3,
                        fragLoadingTimeOut: 12e3,
                        abrEwmaFastLive: 3,
                        abrEwmaSlowLive: 9
                    });
                    t.on(window.Hls.Events.MANIFEST_PARSED, () => {
                        t.startLoad(0), q.play().catch(() => {});
                    }), t.on(window.Hls.Events.ERROR, (n, a) => {
                        if (a?.fatal) {
                            if (a.type === window.Hls.ErrorTypes.NETWORK_ERROR && z < T.length - 1) {
                                z += 1;
                                const e = T[z];
                                return A = e, I.href = e, t.loadSource(e), void t.startLoad(0);
                            }
                            if (z >= T.length - 1) {
                                try {
                                    t.destroy();
                                } catch {}
                                q._hls = null, q.src = e, q.load?.(), q.play().catch(() => {});
                            }
                        }
                    }), t.loadSource(e), t.attachMedia(q), q._hls = t;
                })(e) : K(e));
            };
            if ("iframe" === n) {
                const e = document.createElement("iframe");
                e.src = t, e.allow = "autoplay; fullscreen; picture-in-picture; encrypted-media", 
                h.appendChild(e);
            } else {
                q = document.createElement("video"), q.controls = !1, q.autoplay = !0, q.loop = !0, 
                q.playsInline = !0;
                const e = Number(GM_getValue("trailer_volume", .35)), n = GM_getValue("trailer_muted", !1);
                q.volume = Number.isFinite(e) ? Math.min(1, Math.max(0, e)) : .35, q.muted = Boolean(n), 
                (e => {
                    if (F && !window.Hls) {
                        const t = document.createElement("script");
                        t.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js", t.async = !0, 
                        t.onload = () => Z(e), t.onerror = () => K(e), document.head.appendChild(t);
                    } else Z(e);
                    if (F) {
                        const t = e;
                        setTimeout(() => {
                            if (q && q.isConnected && q.readyState < 2 && !q.error) {
                                try {
                                    q._hls && (q._hls.destroy(), q._hls = null);
                                } catch {}
                                q.src = t, q.play().catch(() => {});
                            }
                        }, 2500);
                    }
                })(T[z] || t), q.preload = "auto", q.addEventListener("volumechange", () => {
                    GM_setValue("trailer_volume", q.volume), GM_setValue("trailer_muted", q.muted), 
                    G();
                }), q.addEventListener("play", () => {
                    G(), H();
                }), q.addEventListener("pause", () => {
                    G(), h.classList.remove("is-controls-hidden"), clearTimeout(L);
                }), q.addEventListener("timeupdate", () => {
                    G(), N();
                }), q.addEventListener("durationchange", () => {
                    G(), R();
                }), q.addEventListener("loadedmetadata", () => {
                    G(), R();
                }), q.addEventListener("ended", () => ((e = U) => sessionStorage.removeItem(e))()), 
                q.addEventListener("error", () => {
                    z >= T.length - 1 || (z += 1, A = T[z], I.href = A, q._hls && (q._hls.destroy(), 
                    q._hls = null), Z(A), q.load?.(), q.play().catch(() => {}));
                }), h.appendChild(q), h.appendChild(g), v.addEventListener("click", e => {
                    e.preventDefault(), e.stopPropagation(), q && (q.paused ? q.play().catch(() => {}) : q.pause(), 
                    G());
                }), b.addEventListener("click", e => {
                    e.preventDefault(), e.stopPropagation(), q && (q.muted = !q.muted, !q.muted && q.volume <= 0 && (q.volume = .35), 
                    B(), G());
                }), _.addEventListener("input", e => {
                    if (e.stopPropagation(), !q) return;
                    h.classList.remove("is-controls-hidden"), clearTimeout(L);
                    const t = Math.min(1, Math.max(0, Number(_.value) / 100));
                    q.volume = t, q.muted = t <= 0, B(), G();
                }), _.addEventListener("change", H), q.addEventListener("click", e => {
                    e.preventDefault(), q.paused ? q.play().catch(() => {}) : q.pause(), G();
                }), C.addEventListener("input", () => {
                    if ($ = !0, !q || !Number.isFinite(q.duration) || q.duration <= 0) return;
                    const e = Number(C.value) / 1e3 * q.duration;
                    k.textContent = D(e);
                }), C.addEventListener("change", () => {
                    q && Number.isFinite(q.duration) && q.duration > 0 && (q.currentTime = Number(C.value) / 1e3 * q.duration, 
                    N(q.currentTime)), $ = !1, G();
                }), E.addEventListener("click", e => {
                    e.preventDefault(), e.stopPropagation(), E.blur(), J();
                }), setTimeout(() => {
                    q.play().catch(() => {}), G(), H();
                }, 120);
            }
            const W = document.createElement("div"), Y = r && "object" == typeof r ? r : null;
            if ("iframe" !== n && Y && Object.keys(Y).length > 1) {
                const e = [ "4k", "hhb", "hmb", "mhb", "mmb", "dm", "sm" ], t = {
                    "4k": "4K",
                    hhb: "1080P",
                    hmb: "720P",
                    mhb: "576P",
                    mmb: "432P"
                }, n = Object.keys(Y).filter(e => Y[e]).sort((t, n) => e.indexOf(t) - e.indexOf(n));
                W.className = "trailer-quality-bar";
                const a = document.createElement("select");
                a.className = "trailer-quality-select";
                const r = e => {
                    M = e, A = Y[e], a.value = e;
                };
                n.forEach(e => {
                    const n = document.createElement("option");
                    n.value = e, n.textContent = t[e] || e, a.appendChild(n);
                }), a.addEventListener("change", async () => {
                    const e = a.value;
                    if (!q || !Y[e] || M === e) return;
                    const t = q.currentTime || 0, n = !q.paused;
                    N(t), q.src = Y[e], q.dataset.playbackRestored = "1", z = Math.max(0, T.indexOf(Y[e])), 
                    q.load(), q.currentTime = t, r(e), I.href = A, n && await q.play().catch(() => {});
                }), W.appendChild(a), r(M && Y[M] ? M : n[0]);
            }
            const X = document.createElement("div");
            X.className = "trailer-footer";
            const Q = document.createElement("div");
            Q.className = "trailer-control-left", "iframe" !== n && (Q.appendChild(v), Q.appendChild(f), 
            Q.appendChild(k), Q.appendChild(C), Q.appendChild(S));
            const ee = document.createElement("div");
            ee.className = "trailer-control-right", ee.appendChild(W), X.appendChild(Q), ee.appendChild(E), 
            X.appendChild(ee), d.appendChild(h), h.appendChild(p), h.appendChild(X), c.appendChild(d), 
            h.addEventListener("mousemove", O), h.addEventListener("mouseenter", O), h.addEventListener("mouseleave", () => {
                q && !q.paused && h.classList.add("is-controls-hidden");
            }), X.addEventListener("mouseenter", () => {
                h.classList.remove("is-controls-hidden"), clearTimeout(L);
            }), X.addEventListener("mouseleave", H);
            const te = (e = null) => {
                e && (e.preventDefault(), e.stopPropagation(), e.stopImmediatePropagation?.());
                const t = c.querySelector("video");
                t && (N(t.currentTime || 0), t.pause(), t.removeAttribute("src"), t.load()), c.remove(), 
                document.documentElement.style.overflow = s, document.body.style.overflow = l, window.removeEventListener("pointerdown", ne, !0), 
                window.removeEventListener("mousedown", ne, !0), window.removeEventListener("click", ne, !0), 
                document.removeEventListener("keydown", ae, !0), clearTimeout(P), clearTimeout(L);
            }, ne = e => {
                c.contains(e.target) && (e.target === c || e.target.closest(".jav-player-close")) && ("click" !== e.type ? (e.stopPropagation(), 
                e.stopImmediatePropagation?.()) : te(e));
            }, ae = e => {
                if ("Escape" === e.key) return void te();
                const t = e.key;
                if ([ " ", "Spacebar", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown" ].includes(t) && (e.preventDefault(), 
                e.stopPropagation(), e.stopImmediatePropagation?.()), "Enter" === t) return J(), 
                void O();
                if (q && "iframe" !== n) if (" " === t || "Spacebar" === t) q.paused ? q.play().catch(() => {}) : q.pause(), 
                G(), O(); else if ("ArrowLeft" === t) q.currentTime = Math.max(0, (q.currentTime || 0) - 2); else if ("ArrowRight" === t) {
                    const e = (q.currentTime || 0) + 2;
                    q.currentTime = Number.isFinite(q.duration) ? Math.min(q.duration, e) : e;
                } else if ("ArrowUp" === t || "ArrowDown" === t) {
                    const e = "ArrowUp" === t ? .05 : -.05;
                    q.volume = Math.min(1, Math.max(0, Math.round(100 * (q.volume + e)) / 100)), q.volume > 0 && (q.muted = !1), 
                    B();
                }
            };
            u.addEventListener("click", te, !0), c.addEventListener("click", e => {
                e.target === c && te(e);
            }, !0), window.addEventListener("pointerdown", ne, !0), window.addEventListener("mousedown", ne, !0), 
            window.addEventListener("click", ne, !0), document.addEventListener("keydown", ae, !0), 
            document.body.appendChild(c);
        },
        getJavBusUrl(e) {
            const t = e.toLowerCase();
            return /^\d{6}[-_\s]\d{3}$/.test(e) || t.startsWith("heyzo") || t.startsWith("carib") || t.startsWith("1pondo") || t.startsWith("tokyo") || t.startsWith("cat") || t.startsWith("paco") || t.startsWith("10mu") || t.startsWith("muram") || t.startsWith("gach") || t.startsWith("real") || t.startsWith("juku") || t.startsWith("aka") || t.startsWith("s-cute") || t.startsWith("n_") || /^n\d{4}$/.test(t) || t.startsWith("k_") || /^k\d{4}$/.test(t) ? `https://www.javbus.com/uncensored/search/${encodeURIComponent(e)}&type=1` : `https://www.javbus.com/search/${encodeURIComponent(e)}&type=&parent=ce`;
        }
    }, k = {
        sources: [ "javfree", "projectjav", "javstore" ],
        cacheKey: e => `thumb_cache_v3_${e}`,
        lookupCode(e) {
            const t = String(e || "").trim(), n = t.match(/^(?:FC2[-_\s]?(?:PPV[-_\s]?)?)?(\d{6,9})$/i);
            return n ? n[1] : t;
        },
        sourceOrder() {
            const e = q.getSourceOrder(), t = Array.isArray(e) ? e : [], n = new Set;
            return [ ...t, ...this.sources ].filter(e => !n.has(e) && "function" == typeof this[e] && (n.add(e), 
            !0));
        },
        async fetchFromSource(e, t) {
            try {
                return await this[e](this.lookupCode(t));
            } catch (t) {
                return console.warn(`Thumbnail[${e}] 异常:`, t.message), null;
            }
        },
        normalizeForCompare: e => String(e || "").toLowerCase().replace(/[^a-z0-9]/g, ""),
        isCodeMatched(e, t) {
            const n = this.normalizeForCompare(e), a = this.normalizeForCompare(t);
            return !!a && n.includes(a);
        },
        isDetailMatched(e, t, n) {
            const a = e?.querySelector("title")?.textContent || "", r = [ ...e?.querySelectorAll("h1,h2,h3,.entry-title,.movie-title,.post-title") || [] ].map(e => e.textContent || "").join(" "), i = (e?.body?.textContent || "").slice(0, 5e3);
            return this.isCodeMatched([ t, a, r, i ].join(" "), n);
        },
        normalizePreviewUrl: (e, t = "") => e ? (/^https?:\/\//i.test(e) ? e : t ? new URL(e, t).href : e).replace(/^http:/, "https:") : "",
        isJavfreePreviewImage(e, t) {
            const n = String(e || "").split("?")[0], a = this.lookupCode(t), r = /^\d{6,9}$/.test(a), i = r ? new RegExp(`${a}_\\d+\\.(?:jpe?g|png|webp)$`, "i") : null;
            return this.isCodeMatched(n, t) && (/-(?:1080p|demosaic)\.(?:jpe?g|png|webp)$/i.test(n) || r && i.test(n));
        },
        selectJavfreePreviewUrl(e, t, n) {
            const a = [ ...e.querySelectorAll("p > img[src]") ].map(e => this.normalizePreviewUrl(e.getAttribute("src") || e.src || "", t)).filter(e => this.isJavfreePreviewImage(e, n));
            return a.find(e => /-1080p\./i.test(e)) || a.find(e => /-demosaic\./i.test(e)) || a.find(e => /_1\.(?:jpe?g|png|webp)$/i.test(e)) || "";
        },
        async javfree(e) {
            e = this.lookupCode(e);
            const t = this.cacheKey(e), n = q.getPreviewCacheEnabled();
            if (n) {
                const e = sessionStorage.getItem(t);
                if (e) return e;
            }
            try {
                const a = await _.request(`https://javfree.me/search/${e}`), r = (new DOMParser).parseFromString(a, "text/html"), i = [ ...r.querySelectorAll(".entry-title>a") ].find(t => this.isCodeMatched([ t.href, t.textContent ].join(" "), e))?.href;
                if (!i) return null;
                const o = await _.request(i), s = (new DOMParser).parseFromString(o, "text/html");
                if (!this.isDetailMatched(s, i, e)) return null;
                const l = this.selectJavfreePreviewUrl(s, i, e);
                return l && n ? (sessionStorage.setItem(t, l), l) : l || null;
            } catch {
                return null;
            }
        },
        async javstore(e) {
            e = this.lookupCode(e);
            try {
                const t = e.replace(/^fc2-?/i, "").replace(/-/g, "").toLowerCase();
                console.log(`javstore: searching for code=${e}, normalized=${t}`);
                const n = `https://javstore.net/search?q=${encodeURIComponent(e)}`, a = await _.request(n), r = (new DOMParser).parseFromString(a, "text/html").querySelectorAll('a[href*="/"]'), i = [];
                for (const e of r) {
                    const a = e.getAttribute("href");
                    if (!a) continue;
                    if (a.startsWith("http") && !a.includes("javstore.net")) continue;
                    const r = new URL(a, n);
                    if (!/javstore\.net$/i.test(r.hostname)) continue;
                    if (/^\/search(?:[/?#]|$)/i.test(r.pathname)) continue;
                    const o = r.href, s = decodeURIComponent(r.pathname.split("/").pop() || "").toLowerCase().replace(/-/g, "");
                    (/\.html$/i.test(r.pathname) || /^\/\d+[-/]/.test(r.pathname)) && s.includes(t) && !i.includes(o) && (i.push(o), 
                    console.log(`javstore: 候选链接 [${i.length}]: ${o}`));
                }
                if (0 === i.length) return console.warn("javstore: 未找到匹配的详情页"), null;
                for (const t of i) {
                    console.log(`javstore: 尝试详情页: ${t}`);
                    const n = await this._extractImgFromDetail(t, e);
                    if (n) return console.log(`javstore: 找到预览图: ${n}`), n;
                    console.log("javstore: 该页无预览图，尝试下一个");
                }
                return console.warn("javstore: 所有候选页均无预览图"), null;
            } catch (e) {
                return console.warn("javstore 获取失败", e), null;
            }
        },
        async _extractImgFromDetail(e, t) {
            try {
                const n = await _.request(e), a = (new DOMParser).parseFromString(n, "text/html");
                if (!this.isDetailMatched(a, e, t)) return console.warn("javstore: 详情页番号不匹配，跳过", e), 
                null;
                for (const t of a.querySelectorAll("a")) if (t.textContent.includes("CLICK HERE")) {
                    const n = t.href || t.getAttribute("href") || "";
                    if (n) return this.normalizePreviewUrl(n, e);
                }
                const r = a.querySelector('img[src*="_s.jpg"]');
                if (r) {
                    let t = r.getAttribute("src") || "";
                    return t.startsWith("http") || (t = new URL(t, e).href), this.normalizePreviewUrl(t.replace(/_s\.jpg$/, "_l.jpg"), e);
                }
                return null;
            } catch (t) {
                return console.warn("javstore: 详情页请求失败", e, t.message), null;
            }
        },
        async projectjav(e) {
            e = this.lookupCode(e);
            try {
                const t = e => new Promise((t, n) => {
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: e,
                        timeout: 2e4,
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8"
                        },
                        onload: a => {
                            console.log(`[projectjav] ${e} → HTTP ${a.status}, final=${a.finalUrl || e}, 长度 ${a.responseText?.length}`), 
                            a.status >= 200 && a.status < 400 ? t(a) : n(new Error(`HTTP ${a.status}`));
                        },
                        onerror: e => {
                            console.warn("[projectjav] 网络错误", e), n(new Error("请求失败"));
                        },
                        ontimeout: () => {
                            console.warn("[projectjav] 请求超时"), n(new Error("请求超时"));
                        }
                    });
                }), n = `https://projectjav.com/?searchTerm=${encodeURIComponent(e)}`;
                console.log("[projectjav] 搜索页:", n);
                const a = await t(n), r = a.responseText || "", i = a.finalUrl || n, o = (new DOMParser).parseFromString(r, "text/html");
                let s = /\/movie\//i.test(new URL(i).pathname) ? i : "";
                if (!s) {
                    const e = [ ...o.querySelectorAll('a[href*="/movie/"]') ];
                    console.log(`[projectjav] /movie/ 链接数: ${e.length}`), e.slice(0, 5).forEach(e => console.log("  ", e.getAttribute("href")));
                    const t = e[0]?.getAttribute("href") || "";
                    if (!t) return console.warn("[projectjav] 无结果，页面标题:", o.title), console.warn("[projectjav] 页面前800字符:", r.slice(0, 800)), 
                    null;
                    s = t.startsWith("http") ? t : `https://projectjav.com${t}`;
                }
                console.log("[projectjav] 详情页:", s);
                const l = i === s ? a : await t(s), c = l.responseText || "", d = l.finalUrl || s, p = (new DOMParser).parseFromString(c, "text/html"), m = [ ...p.querySelectorAll('.col-md-12.thumbnail a[data-featherlight="image"], .thumbnail a[data-featherlight="image"]') ].find(t => this.isCodeMatched([ t.outerHTML, t.closest(".thumbnail")?.outerHTML, d ].join(" "), e));
                if (console.log("[projectjav] screenshotLink matched:", !!m, "href:", m?.getAttribute("href")), 
                m) {
                    const e = m.querySelector("img"), t = m.getAttribute("href") || "";
                    if (t) return this.normalizePreviewUrl(t, d);
                    if (e) {
                        const t = (e.getAttribute("src") || "").replace(/\?.*$/, "");
                        if (t) return this.normalizePreviewUrl(t, d);
                    }
                }
                return console.warn("[projectjav] 详情页未找到图片，页面标题:", p.title), null;
            } catch (e) {
                return console.warn("[projectjav] 异常:", e.message), null;
            }
        },
        async get(e) {
            const t = q.getPreviewCacheEnabled(), n = this.cacheKey(e);
            if (t) {
                const e = sessionStorage.getItem(n);
                if (e) return {
                    url: e,
                    source: null
                };
            }
            let a = null, r = null;
            for (const t of this.sourceOrder()) {
                if (a = await this.fetchFromSource(t, e), a) {
                    r = t;
                    break;
                }
                console.log(`${t} 无结果，尝试下一个来源`);
            }
            return console.log("预览图最终结果:", a ? `有图 (${r})` : "无图"), a && t && sessionStorage.setItem(n, a), 
            {
                url: a,
                source: r
            };
        },
        async show(e) {
            const t = await this.get(e);
            t.url ? _.showOverlay(t.url, e, t.source) : alert("未找到预览图");
        }
    }, S = (() => {
        let e = !1;
        function t() {
            return GM_getValue("list_preview_quick_enabled", !0);
        }
        function n(e) {
            if (!e) return;
            const n = w.getCardCover(e);
            if (!n) return;
            const a = n.querySelector(".jav-list-preview-btn");
            if (!t()) return void a?.remove();
            const r = w.getCardCode(e);
            if (!r) return void a?.remove();
            if (a) return a.dataset.code = r, void (a.title = `预览图 ${r}`);
            const i = document.createElement("span");
            i.className = "jav-list-preview-btn", i.dataset.code = r, i.setAttribute("role", "button"), 
            i.tabIndex = 0, i.title = `预览图 ${r}`, i.innerHTML = '<span class="jav-list-preview-icon" aria-hidden="true"></span>';
            const o = async t => {
                if (t.preventDefault(), t.stopPropagation(), t.stopImmediatePropagation?.(), "1" === i.dataset.loading) return;
                const n = i.dataset.code || w.getCardCode(e);
                if (n) {
                    i.dataset.loading = "1", i.style.pointerEvents = "none", i.style.opacity = ".72";
                    try {
                        await k.show(n);
                    } finally {
                        delete i.dataset.loading, i.style.pointerEvents = "", i.style.opacity = "";
                    }
                }
            };
            i.addEventListener("click", o, !0), i.addEventListener("keydown", e => {
                "Enter" !== e.key && " " !== e.key || o(e);
            }, !0), n.appendChild(i);
        }
        function a() {
            document.querySelectorAll(".jav-list-preview-btn").forEach(e => e.remove());
        }
        return {
            sync: function() {
                w.isDetailPage() ? a() : (e || (e = !0, GM_addStyle("\n                .jav-card-cover {\n                    position: relative !important;\n                }\n                .jav-list-preview-btn {\n                    position: absolute;\n                    right: 8px;\n                    bottom: 8px;\n                    z-index: 3;\n                    width: 32px;\n                    height: 32px;\n                    display: inline-flex;\n                    align-items: center;\n                    justify-content: center;\n                    border: 1px solid rgba(255,255,255,.28);\n                    border-radius: 999px;\n                    background: rgba(15,23,42,.56);\n                    color: #fff;\n                    backdrop-filter: blur(8px);\n                    box-shadow: 0 4px 12px rgba(0,0,0,.24);\n                    cursor: pointer;\n                    user-select: none;\n                    transition: transform .16s ease, background .16s ease, border-color .16s ease, box-shadow .16s ease;\n                }\n                .jav-list-preview-btn:hover {\n                    transform: translateY(-1px) scale(1.04);\n                    background: rgba(37,99,235,.78);\n                    border-color: rgba(255,255,255,.42);\n                    box-shadow: 0 8px 18px rgba(15,23,42,.28);\n                }\n                .jav-list-preview-btn:active {\n                    transform: scale(.96);\n                }\n                .jav-list-preview-btn:focus-visible {\n                    outline: 2px solid rgba(191,219,254,.95);\n                    outline-offset: 2px;\n                }\n                .jav-list-preview-icon {\n                    width: 16px;\n                    height: 16px;\n                    display: block;\n                    background-repeat: no-repeat;\n                    background-position: center;\n                    background-size: contain;\n                    background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z'/%3E%3Ccircle cx='12' cy='12' r='2.9'/%3E%3C/svg%3E\");\n                    opacity: .96;\n                }\n            ")), 
                t() ? w.getListCards().forEach(n) : a());
            },
            removeAll: a,
            attach: n
        };
    })();
    s.expose("__LAOSIJI_LIST_PREVIEW__", S);
    const C = (() => {
        let e = !1, t = 0, n = {
            code: "",
            status: ""
        };
        function a() {
            w.clearDetailPreviewInline();
        }
        return {
            sync: async function() {
                if (!GM_getValue("detail_preview_inline_enabled", !0) || !w.isDetailPage()) return t++, 
                a(), void (n = {
                    code: "",
                    status: ""
                });
                e || (e = !0, GM_addStyle("\n                .jav-nong-slot.has-detail-preview-inline {\n                    display: flex !important;\n                    align-items: flex-start !important;\n                    gap: 12px !important;\n                    overflow: visible !important;\n                }\n                .jav-detail-preview-standalone {\n                    display: flex !important;\n                    align-items: flex-start !important;\n                    gap: 12px !important;\n                    min-width: 0 !important;\n                    align-self: flex-start !important;\n                    overflow: visible !important;\n                }\n                .row.movie > .jav-detail-preview-standalone {\n                    flex: 0 0 180px !important;\n                }\n                .jav-flex-container > .jav-detail-preview-standalone {\n                    flex: 0 0 180px !important;\n                }\n                #video_jacket_info tr > .jav-detail-preview-standalone {\n                    flex: 0 0 180px !important;\n                    min-width: 160px !important;\n                    vertical-align: top !important;\n                }\n                .javlib-nong-slot.has-detail-preview-inline {\n                    width: 100% !important;\n                }\n                .jav-nong-slot.has-detail-preview-inline .jav-nong-wrapper {\n                    flex: 1 1 auto !important;\n                    min-width: 0 !important;\n                }\n                .javlib-nong-slot.has-detail-preview-inline > div:not(.jav-detail-preview-wrap) {\n                    flex: 1 1 0 !important;\n                    min-width: 0 !important;\n                    display: block !important;\n                }\n                .javlib-nong-slot.has-detail-preview-inline > .jav-detail-preview-wrap {\n                    flex: 0 0 180px !important;\n                    width: 180px !important;\n                    max-width: 180px !important;\n                    min-width: 160px !important;\n                    height: 480px !important;\n                    max-height: 480px !important;\n                    overflow: hidden !important;\n                    display: block !important;\n                }\n                .jav-detail-preview-wrap {\n                    flex: 0 0 180px;\n                    width: 180px;\n                    max-width: 180px;\n                    min-width: 150px;\n                    align-self: flex-start;\n                    position: relative;\n                    box-sizing: border-box;\n                    overflow: hidden;\n                }\n                .jav-detail-preview-inline {\n                    display: block;\n                    width: 100%;\n                    height: auto;\n                    max-width: 100%;\n                    max-height: 480px;\n                    object-fit: contain;\n                    border-radius: 6px;\n                    cursor: zoom-in;\n                }\n                .javlib-nong-slot.has-detail-preview-inline .jav-detail-preview-inline {\n                    width: 100% !important;\n                    height: 100% !important;\n                    max-width: 100% !important;\n                    max-height: 100% !important;\n                    object-fit: contain !important;\n                }\n                .jav-detail-preview-loading {\n                    position: absolute;\n                    inset: 0;\n                    display: grid;\n                    place-items: center;\n                    color: #475569;\n                    font-size: 12px;\n                    font-weight: 700;\n                    white-space: nowrap;\n                    pointer-events: none;\n                }\n                @media (max-width: 900px) {\n                    .jav-nong-slot.has-detail-preview-inline {\n                        flex-wrap: wrap !important;\n                    }\n                    .jav-detail-preview-standalone {\n                        flex-basis: 100% !important;\n                    }\n                    .jav-detail-preview-wrap {\n                        flex-basis: 100%;\n                        width: 100%;\n                        max-width: 100%;\n                    }\n                    .jav-detail-preview-inline {\n                        max-width: 100%;\n                        max-height: 480px;\n                        margin: 0 auto;\n                    }\n                    .javlib-nong-slot.has-detail-preview-inline > .jav-detail-preview-wrap {\n                        flex-basis: 100% !important;\n                        width: 100% !important;\n                        max-width: 100% !important;\n                        height: 480px !important;\n                        max-height: 480px !important;\n                    }\n                }\n            "));
                const r = w.getDetailCode();
                if (!r) return t++, a(), void (n = {
                    code: "",
                    status: ""
                });
                if (n.code === r && "missing" === n.status) return;
                const i = document.querySelector(".jav-detail-preview-wrap");
                if (i?.dataset.code === r && "loaded" === i.dataset.state) return;
                if (i?.dataset.code === r && "loading" === i.dataset.state) return;
                const o = ++t;
                n = {
                    code: r,
                    status: "loading"
                }, i && i.dataset.code !== r && i.remove();
                const s = w.getDetailPreviewTarget();
                if (!s) return;
                s.standalone || s.slot.classList.add("has-detail-preview-inline");
                let l = document.querySelector(".jav-detail-preview-wrap");
                if (l) l.dataset.code = r, l.dataset.state = "loading", l.innerHTML = '<span class="jav-detail-preview-loading">预览图加载中...</span>'; else {
                    l = document.createElement("div"), l.className = "jav-detail-preview-wrap", l.dataset.code = r, 
                    l.dataset.state = "loading";
                    const e = document.createElement("span");
                    e.className = "jav-detail-preview-loading", e.textContent = "预览图加载中...", l.appendChild(e), 
                    s.anchor?.parentElement === s.slot ? s.slot.insertBefore(l, s.anchor) : s.slot.insertBefore(l, s.slot.firstChild);
                }
                const c = await k.get(r);
                if (o !== t || !l.isConnected) return;
                if (!c?.url) return l.remove(), s.standalone || s.slot.classList.remove("has-detail-preview-inline"), 
                void (n = {
                    code: r,
                    status: "missing"
                });
                n = {
                    code: r,
                    status: "loaded"
                }, l.dataset.state = "loaded", l.innerHTML = "";
                const d = document.createElement("img");
                d.className = "jav-detail-preview-inline", d.dataset.code = r, d.src = c.url, d.alt = r, 
                d.loading = "lazy", d.title = "点击查看预览图", d.addEventListener("click", e => {
                    e.preventDefault(), e.stopPropagation(), _.showOverlay(c.url, r, c.source);
                }), l.appendChild(d);
            },
            remove: a
        };
    })();
    s.expose("__LAOSIJI_DETAIL_PREVIEW_INLINE__", C);
    const E = {
        normalize: e => _.normalizeCode(e),
        normalizeForCompare: e => String(e || "").toLowerCase().replace(/[^a-z0-9]/g, ""),
        cacheKey(e) {
            return `trailer_cache_v9_${this.normalize(e)}`;
        },
        debug(...e) {
            console.log("[TrailerResolver]", ...e);
        },
        resolverChain() {
            return [ "fromFc2Hub", "fromMgstage", "fromJavxyCcCd", "fromMgstageRetail" ].map(e => ({
                name: e,
                fn: this[e]
            })).filter(e => "function" == typeof e.fn);
        },
        async show(e) {
            const t = await this.get(e);
            t?.url ? (this.debug("打开播放器", {
                code: this.normalize(e),
                source: t.source,
                type: t.type || "video",
                url: t.url
            }), _.showTrailerOverlay({
                code: this.normalize(e),
                url: t.url,
                type: t.type || "video",
                source: t.source || "预告片",
                qualities: t.qualities,
                quality: t.quality,
                urls: t.urls
            })) : (this.debug("最终未找到可用视频源", {
                code: this.normalize(e)
            }), _.showToast("未找到可用的视频源。", "节点不可用，请将DMM域名分流到日本ip", 3e3));
        },
        async get(e) {
            const t = String(e || "").trim(), n = this.normalize(e), a = q.getTrailerCacheEnabled();
            if (this.debug("开始查询", {
                rawCode: t,
                normalized: n,
                cacheEnabled: a
            }), a) {
                const e = sessionStorage.getItem(this.cacheKey(n));
                if (e) {
                    try {
                        const t = JSON.parse(e);
                        if (t?.url) return this.debug("缓存命中", {
                            source: t.source,
                            url: t.url
                        }), t;
                    } catch {}
                    this.debug("缓存无效，已移除"), sessionStorage.removeItem(this.cacheKey(n));
                }
            }
            for (const e of this.resolverChain()) {
                const r = e.name || "anonymous";
                try {
                    this.debug("尝试来源", r);
                    const i = await e.fn.call(this, n, t);
                    if (i?.url) return this.debug("来源命中", r, {
                        source: i.source,
                        type: i.type || "video",
                        url: i.url,
                        qualities: i.qualities ? Object.keys(i.qualities) : []
                    }), a && sessionStorage.setItem(this.cacheKey(n), JSON.stringify(i)), i;
                    this.debug("来源无结果", r);
                } catch (e) {
                    console.warn(`[TrailerResolver] 来源异常: ${r}`, e);
                }
            }
            return null;
        },
        request: (e, t = {}) => new Promise(n => {
            GM_xmlhttpRequest({
                method: t.method || "GET",
                url: e,
                data: t.data,
                headers: t.headers || {},
                timeout: t.timeout || 15e3,
                onload: e => n(e),
                onerror: () => n(null),
                ontimeout: () => n(null)
            });
        }),
        async head(e) {
            const t = await this.request(e, {
                method: "HEAD",
                timeout: 5e3
            });
            return t && t.status >= 200 && t.status < 400 ? t.finalUrl || e : null;
        },
        result: (e, t, n = "video", a = {}) => ({
            url: e,
            source: t,
            type: n,
            ...a
        }),
        mgstagePrefixMap: {
            LUXU: "259LUXU",
            MIUM: "300MIUM",
            GANA: "200GANA",
            SIRO: "SIRO",
            DCV: "277DCV",
            JNT: "390JNT",
            JAC: "390JAC",
            HHH: "451HHH",
            HLM: "436HLM",
            SYS: "332SYS",
            NAMA: "332NAMA",
            HEN: "353HEN",
            ARA: "261ARA",
            FCT: "326FCT",
            ERK: "420ERK",
            STH: "420STH",
            MLA: "476MLA",
            MMC: "812MMC",
            OERO: "892OERO",
            HOI: "420HOI"
        },
        normalizeMgstageCode(e) {
            const t = String(e || "").toUpperCase().replace(/\s+/g, "-").match(/\b((?:\d{3})?[A-Z]{2,10})[-_](\d{2,6})\b/);
            if (!t) return "";
            const n = this.mgstagePrefixMap[t[1]] || t[1];
            return Object.values(this.mgstagePrefixMap).includes(n) ? `${n}-${t[2]}` : "";
        },
        mgstageSampleToMp4(e) {
            const t = String(e || "").replace(/\\\//g, "/").replace(/&amp;/g, "&").trim();
            return t ? t.split("?")[0].replace(/\.ism\/request$/i, ".mp4") : "";
        },
        mgstageHeaders: (e = "https://www.mgstage.com/") => ({
            "accept-language": "ja-JP,ja;q=0.9,en;q=0.8",
            Cookie: "adc=1; coc=1",
            Referer: e
        }),
        normalizeMgstageGenericCode(e) {
            const t = String(e || "").toUpperCase().replace(/\s+/g, "-").match(/\b((?:\d{3})?[A-Z]{2,15})[-_](\d{2,9})\b/);
            return !t || /^FC2$/i.test(t[1]) ? "" : `${t[1]}-${t[2]}`;
        },
        async fetchMgstageProductTrailer(e, t = "MGStage 素人") {
            const n = `https://www.mgstage.com/product/product_detail/${e}/?agef=1`;
            this.debug("MGStage 请求详情页", {
                code: e,
                detailUrl: n
            });
            const a = this.mgstageHeaders(), r = await this.request(n, {
                timeout: 15e3,
                headers: a
            });
            if (!r?.responseText || r.status < 200 || r.status >= 400) return this.debug("MGStage 详情页失败", {
                status: r?.status,
                finalUrl: r?.finalUrl || n
            }), null;
            if (!this.normalizeForCompare(r.responseText).includes(this.normalizeForCompare(e))) return this.debug("MGStage 详情页未匹配当前番号", {
                code: e,
                finalUrl: r?.finalUrl || n
            }), null;
            const i = r.responseText.match(/sampleplayer\.html\/([0-9a-f-]{36})/i)?.[1] || r.responseText.match(/[?&]pid=([0-9a-f-]{36})/i)?.[1];
            if (!i) return this.debug("MGStage 未找到 pid"), null;
            const o = `https://www.mgstage.com/sampleplayer/sampleRespons.php?pid=${encodeURIComponent(i)}`;
            this.debug("MGStage 请求 sample API", {
                pid: i,
                apiUrl: o
            });
            const s = await this.request(o, {
                timeout: 15e3,
                headers: {
                    ...a,
                    Accept: "application/json,text/plain,*/*",
                    Referer: n
                }
            });
            if (!s?.responseText || s.status < 200 || s.status >= 400) return this.debug("MGStage sample API 失败", {
                status: s?.status
            }), null;
            let l = "";
            try {
                l = JSON.parse(s.responseText)?.url || "";
            } catch {
                l = s.responseText.match(/"url"\s*:\s*"([^"]+)"/i)?.[1] || "";
            }
            const c = this.mgstageSampleToMp4(l);
            if (!/\.mp4(?:[?#]|$)/i.test(c)) return this.debug("MGStage sample URL 未能转换为 mp4", {
                sampleUrl: l,
                mp4Url: c
            }), null;
            const d = await this.head(c);
            return this.debug("MGStage mp4 检测", {
                mp4Url: c,
                finalUrl: d || null
            }), this.result(d || c, t, "video", {
                sourceName: "MGStage",
                sourceLabel: t,
                sourceTag: "MGStage",
                trailerSource: "MGStage"
            });
        },
        async fromMgstage(e, t = "") {
            const n = this.normalizeMgstageCode(t) || this.normalizeMgstageCode(e);
            return n ? this.fetchMgstageProductTrailer(n, "MGStage 素人") : (this.debug("MGStage 跳过：番号不在支持前缀内", {
                id: e,
                rawCode: t
            }), null);
        },
        async fromMgstageRetail(e, t = "") {
            const n = [ this.normalizeMgstageGenericCode(t), this.normalizeMgstageGenericCode(e) ].filter(Boolean), a = [ ...new Set(n) ];
            if (!a.length) return this.debug("MGStage 動画跳过：番号格式不适用", {
                id: e,
                rawCode: t
            }), null;
            for (const e of a) {
                this.debug("MGStage 動画直连尝试", {
                    code: e
                });
                const t = await this.fetchMgstageProductTrailer(e, "MGStage 動画");
                if (t?.url) return t;
            }
            return null;
        },
        qualityOptions: [ {
            quality: "4k",
            text: "4K"
        }, {
            quality: "hhb",
            text: "1080p"
        }, {
            quality: "1080p",
            text: "1080p"
        }, {
            quality: "hmb",
            text: "720p"
        }, {
            quality: "720p",
            text: "720p"
        }, {
            quality: "mhb",
            text: "576p"
        }, {
            quality: "540p",
            text: "540p"
        }, {
            quality: "mmb",
            text: "432p"
        }, {
            quality: "480p",
            text: "480p"
        }, {
            quality: "396p",
            text: "396p"
        }, {
            quality: "360p",
            text: "360p"
        }, {
            quality: "240p",
            text: "240p"
        } ],
        selectHighestQuality(e) {
            return this.sortQualityKeys(e)[0] || null;
        },
        sortQualityKeys(e) {
            const t = new Map(this.qualityOptions.map((e, t) => [ e.quality, t ]));
            return Object.keys(e || {}).filter(t => e[t]).sort((e, n) => (t.get(e) ?? -1) - (t.get(n) ?? -1));
        },
        javxySourceLabels: {
            DMM: "Javxy | dmm",
            HEYZO: "Javxy | Heyzo",
            PACO: "Javxy | Paco",
            "10MU": "Javxy | 10mu",
            Caribbean: "Javxy | 加勒比",
            "1Pondo": "Javxy | 一本道"
        },
        async fromJavxyCcCd(e, t = "") {
            const n = String(e || t || "").trim();
            if (!n) return this.debug("Javxy 跳过：查询词为空"), null;
            const a = `https://javxy.cc.cd/trailers/${encodeURIComponent(n)}?client=laosiji-new`;
            this.debug("Javxy 请求 API", {
                query: n,
                apiUrl: a
            });
            const r = await this.request(a, {
                timeout: 15e3,
                headers: {
                    Accept: "application/json,text/plain,*/*"
                }
            });
            if (!r?.responseText || r.status < 200 || r.status >= 400) return this.debug("Javxy API 失败", {
                status: r?.status
            }), null;
            let i;
            try {
                i = JSON.parse(r.responseText);
            } catch {
                return this.debug("Javxy JSON 解析失败"), null;
            }
            const o = String(i?.trailer || "").trim();
            if (!o) return this.debug("Javxy 无 trailer 字段", {
                keys: Object.keys(i || {})
            }), null;
            const s = i?.qualities && "object" == typeof i.qualities ? i.qualities : {}, l = i?.quality && s[i.quality] ? i.quality : this.selectHighestQuality(s), c = this.javxySourceLabels[i?.source] || `Javxy | ${i?.source || "dmm"}`;
            return this.debug("Javxy 返回结果", {
                source: i?.source,
                quality: l,
                qualities: Object.keys(s)
            }), this.result(s[l] || o, c, "video", {
                qualities: s,
                quality: l,
                urls: Array.isArray(i?.urls) && i.urls.length ? i.urls : this.sortQualityKeys(s).map(e => s[e])
            });
        },
        async fromFc2Hub(e, t) {
            if (!/FC2/i.test(t || e)) return null;
            const n = (t || "").match(/(\d{6,9})/) || e.match(/(\d{6,9})/);
            if (!n) return null;
            const a = n[1], r = `https://adult.contents.fc2.com/embed/${a}`, i = await this.request(r, {
                timeout: 15e3
            });
            if (!i?.responseText) return null;
            const o = i.responseText.match(/push\(\['ae',\s*'([a-f0-9]{32})'\]/);
            if (!o) return null;
            const s = o[1], l = `https://adult.contents.fc2.com/api/v2/videos/${a}/sample?key=00000000000000000000000000000000`, c = await this.request(l, {
                timeout: 15e3,
                headers: {
                    "X-FC2-Contents-Access-Token": s
                }
            });
            if (!c?.responseText) return null;
            let d;
            try {
                d = JSON.parse(c.responseText);
            } catch {
                return null;
            }
            return d.path ? this.result(d.path, "FC2Hub 预告", "mp4") : null;
        }
    }, q = {
        getPreviewCacheEnabled: () => !0,
        getTrailerCacheEnabled: () => !0,
        getDefaultSearchEngine() {
            const e = GM_getValue("default_search_engine", 2);
            return A[e] || A[0];
        },
        getDefaultVideoEngine: () => GM_getValue("default_video_engine", "missav"),
        getVideoEngines: () => l,
        getSourceOrder: () => GM_getValue("thumb_source_order", [ "javfree", "projectjav", "javstore" ])
    }, A = [ {
        name: "BTDigg",
        color: "#F60",
        url: e => `https://btdig.com/search?q=${e}`
    }, {
        name: "Taocili",
        color: "#DE5833",
        url: e => `https://taocili.com/search?q=${e}`
    }, {
        name: "Google",
        color: "#4285F4",
        url: e => `https://www.google.com/search?q=${e}`
    }, {
        name: "Bing",
        color: "#008373",
        url: e => `https://www.bing.com/search?q=${e}`
    }, {
        name: "DuckGo",
        color: "#DE5833",
        url: e => `https://duckduckgo.com/?q=${e}`
    } ], M = {
        api: "https://webapi.115.com/files/search",
        videoExts: new Set([ "mp4", "mkv", "avi", "wmv", "mov", "m4v", "ts", "flv", "rmvb", "webm" ]),
        pending: new Map,
        cachePrefix: "pan115_cache_v5_",
        mgstagePrefixMap: {
            LUXU: "259LUXU",
            MIUM: "300MIUM",
            GANA: "200GANA",
            SIRO: "SIRO",
            DCV: "277DCV",
            JNT: "390JNT",
            JAC: "390JAC",
            HHH: "451HHH",
            HLM: "436HLM",
            SYS: "332SYS",
            NAMA: "332NAMA",
            HEN: "353HEN",
            ARA: "261ARA",
            FCT: "326FCT",
            ERK: "420ERK",
            STH: "420STH",
            MLA: "476MLA",
            MMC: "812MMC",
            OERO: "892OERO"
        },
        sourceAliases: {
            PACO: [ "PACO", "PACOPACOMAMA" ],
            PACOPACOMAMA: [ "PACO", "PACOPACOMAMA" ],
            "10MU": [ "10MU", "10MUSUME" ],
            "10MUSUME": [ "10MU", "10MUSUME" ],
            "1PON": [ "1PON", "1PONDO" ],
            "1PONDO": [ "1PON", "1PONDO" ],
            CARIB: [ "CARIB", "CARIBBEANCOM" ],
            CARIBBEANCOM: [ "CARIB", "CARIBBEANCOM" ],
            HEYZO: [ "HEYZO" ]
        },
        enabled: () => GM_getValue("btn_show_pan115", !1),
        normalizeCode: e => String(e || "").trim().toUpperCase().replace(/[_\s]+/g, "-"),
        normalizeKeepSeparator: e => String(e || "").trim().toUpperCase().replace(/\s+/g, "-"),
        playUrl(e) {
            const t = encodeURIComponent(e);
            return "115master" === GM_getValue("pan115_player_mode", "official") ? `https://115.com/web/lixian/master/video/?pick_code=${t}` : `https://115vod.com/?pickcode=${t}&share_id=0`;
        },
        cacheKey(e) {
            return `${this.cachePrefix}${this.normalizeKeepSeparator(e)}`;
        },
        getCached(e) {
            try {
                const t = sessionStorage.getItem(this.cacheKey(e));
                if (!t) return;
                return JSON.parse(t);
            } catch {
                return;
            }
        },
        setCached(e, t) {
            try {
                sessionStorage.setItem(this.cacheKey(e), JSON.stringify(t || null));
            } catch {}
        },
        sourcePattern() {
            return Object.keys(this.sourceAliases).sort((e, t) => t.length - e.length).join("|");
        },
        sourceGroup(e) {
            return this.sourceAliases[String(e || "").toUpperCase()] || [ String(e || "").toUpperCase() ].filter(Boolean);
        },
        uncensoredParts(e) {
            const t = this.normalizeKeepSeparator(e).match(/^(\d{6})([-_])(\d{2,3})(?:[-_]([A-Z0-9]+))?$/);
            return t ? {
                date: t[1],
                sep: t[2],
                num: t[3],
                source: t[4] || ""
            } : null;
        },
        uncensoredDigitKey(e) {
            const t = this.uncensoredParts(e);
            return t ? `${t.date}${t.sep}${t.num}` : "";
        },
        extractCode(e, t = "") {
            const n = this.sourcePattern(), a = String(e || "").match(new RegExp(`\\b(\\d{6})([-_])(\\d{2,3})[-_\\s]*(${n})\\b`, "i"));
            if (a) {
                const e = a[4].toUpperCase(), t = "_" === a[2] ? "_" : "-";
                return `${a[1]}${t}${a[3]}-${e}`;
            }
            const r = String(e || "").match(new RegExp(`\\b(${n})[-_\\s]*(\\d{6})([-_])(\\d{2,3})\\b`, "i"));
            if (r) {
                const e = r[1].toUpperCase(), t = "_" === r[3] ? "_" : "-";
                return `${r[2]}${t}${r[4]}-${e}`;
            }
            return t || _.extractCode(e);
        },
        searchKeyword: e => String(e || "").trim().toLowerCase().replace(/^fc2-/, ""),
        searchVariants(e) {
            const t = this.normalizeKeepSeparator(e), n = [ t ], a = t.match(/^(\d{3})([A-Z]{2,10})-(\d{2,6})$/);
            a && Object.values(this.mgstagePrefixMap).includes(`${a[1]}${a[2]}`) && n.push(`${a[2]}-${a[3]}`);
            const r = t.match(/^([A-Z]{2,10})-(\d{2,6})$/);
            r && this.mgstagePrefixMap[r[1]] && n.push(`${this.mgstagePrefixMap[r[1]]}-${r[2]}`);
            const i = this.uncensoredParts(t);
            return i && (n.push(`${i.date}${i.sep}${i.num}`), i.source && this.sourceGroup(i.source).forEach(e => {
                n.push(`${i.date}${i.sep}${i.num}-${e}`), n.push(`${e}-${i.date}${i.sep}${i.num}`);
            })), [ ...new Set(n.filter(Boolean)) ];
        },
        codeRegex(e) {
            if (this.uncensoredDigitKey(e)) {
                const t = this.uncensoredParts(e), n = "_" === t.sep ? "_" : "-";
                return new RegExp(`(^|[^0-9])${t.date}${n}${t.num}([^0-9]|$)`, "i");
            }
            const t = [];
            return this.searchVariants(e).forEach(e => {
                const n = this.normalizeCode(e);
                if (!n) return;
                const a = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/[-_]/g, "[-_\\s]?");
                t.push(a, n.replace(/[-_]/g, ""));
            }), new RegExp(`(?:${[ ...new Set(t) ].join("|")})`, "i");
        },
        isVideoName(e) {
            const t = String(e || "").split(".").pop().toLowerCase();
            return this.videoExts.has(t);
        },
        flattenFiles: e => ([ e?.data, e?.data?.list, e?.data?.files, e?.data?.items, e?.files, e?.list ].find(Array.isArray) || []).map(e => ({
            name: e.n || e.name || e.file_name || e.filename || e.title || "",
            pickcode: e.pc || e.pickcode || e.pick_code || e.pickCode || e.pick || "",
            raw: e
        })).filter(e => e.name),
        async requestSearch(e) {
            const t = new URLSearchParams({
                search_value: e,
                limit: "30",
                offset: "0"
            });
            return new Promise((e, n) => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: `${this.api}?${t}`,
                    timeout: 15e3,
                    anonymous: !1,
                    headers: {
                        Accept: "application/json, text/plain, */*"
                    },
                    onload: t => {
                        try {
                            e(JSON.parse(t.responseText));
                        } catch (e) {
                            n(new Error("115返回不是JSON，可能未登录"));
                        }
                    },
                    onerror: () => n(new Error("115请求失败")),
                    ontimeout: () => n(new Error("115请求超时"))
                });
            });
        },
        async search(e) {
            const t = this.codeRegex(e), n = new Set;
            for (const a of this.searchVariants(e).map(e => this.searchKeyword(e))) {
                const e = await this.requestSearch(a);
                if (!1 === (e?.state ?? e?.success)) throw new Error(String(e?.error || e?.message || e?.errno || "115查询失败"));
                for (const a of this.flattenFiles(e)) {
                    const e = a.pickcode || a.name;
                    if (!n.has(e) && (n.add(e), t.test(a.name) && this.isVideoName(a.name))) return a;
                }
            }
            return null;
        },
        async searchCached(e) {
            const t = this.normalizeKeepSeparator(e);
            if (!t) return null;
            const n = this.getCached(t);
            if (void 0 !== n) return n;
            if (this.pending.has(t)) return this.pending.get(t);
            const a = this.search(t).then(e => (this.setCached(t, e || null), e || null)).finally(() => this.pending.delete(t));
            return this.pending.set(t, a), a;
        }
    };
    function P(e, t, n, a = null) {
        let r = null;
        const i = () => {
            r && (clearTimeout(r), r = null);
        }, o = () => {
            i(), n.classList.remove("is-open");
        }, s = () => {
            i(), n.classList.contains("is-open") && (r = setTimeout(o, 1e3));
        };
        t.addEventListener("click", t => {
            t.preventDefault(), t.stopPropagation();
            const a = !n.classList.contains("is-open");
            !function(e = null) {
                document.querySelectorAll(".search-submenu.is-open").forEach(t => {
                    t !== e && t.classList.remove("is-open");
                });
            }(n), i(), n.classList.toggle("is-open", a), a && !e.matches(":hover") && s();
        }), e.addEventListener("mouseenter", i), e.addEventListener("mouseleave", s), a && a.addEventListener("click", o), 
        n.addEventListener("click", e => {
            e.target.closest("a") && o();
        }), document.addEventListener("click", t => {
            e.contains(t.target) || o();
        });
    }
    function L(e, t, n = !1) {
        if (!GM_getValue("btn_show_nyaa", !0)) return;
        if (/sukebei\.nyaa/i.test(location.hostname)) return;
        const a = _.createJumpLinkBtn("🔍 Sukebei", "#17a2b8", `https://sukebei.nyaa.si/?f=0&c=0_0&q=${encodeURIComponent(e)}`);
        t.appendChild(a);
    }
    function $(e, t, n = !1) {
        if (!GM_getValue("btn_show_javbus", !0)) return;
        if (/javbus\.com/i.test(location.hostname)) return;
        const a = _.getJavBusUrl(e), r = _.createJumpLinkBtn("🎬 JavBus", "#007bff", a);
        t.appendChild(r);
    }
    function T(e, t, n = !1) {
        if (!GM_getValue("btn_show_javdb", !0)) return;
        if (/javdb\.com/i.test(location.hostname)) return;
        const a = _.createJumpLinkBtn("📀 JavDB", "#6f42c1", `https://javdb.com/search?q=${encodeURIComponent(e)}`);
        t.appendChild(a);
    }
    function z(e, t, n = !1) {
        const a = GM_getValue("btn_show_missav", !0);
        if (!a) return;
        const r = e.toLowerCase(), i = r.replace(/-/g, ""), o = {
            missav: `https://missav.ws/${r}`,
            jable: `https://jable.tv/videos/${r}/`,
            "123av": `https://123av.com/zh/v/${r}`,
            javday: `https://javday.app/videos/${i}/`,
            supjav: `https://supjav.com/zh/?s=${encodeURIComponent(e)}`,
            javrate: `https://www.javrate.com/search/${encodeURIComponent(r)}`
        }, s = new Set([ ...a ? [ "missav", "jable", "123av", "javday", "supjav", "javrate" ] : [] ]), l = q.getVideoEngines().filter(e => s.has(e.key) && !e.host.test(location.hostname)).map(e => ({
            ...e,
            url: o[e.key]
        })).filter(e => e.url);
        if (!l.length) return;
        const c = q.getDefaultVideoEngine(), d = l.find(e => e.key === c) || l[0], p = l.filter(e => e !== d), m = e => _.createJumpLinkBtn(`🎬 ${e.label}`, e.color, e.url);
        if (!p.length) return void t.appendChild(m(d));
        const u = document.createElement("div");
        u.className = "search-menu missav-menu", u.style.setProperty("--jav-btn-accent", d.color);
        const h = m(d);
        h.classList.add("search-main-btn"), u.appendChild(h);
        const g = document.createElement("button");
        g.type = "button", g.className = "search-toggle-btn", g.title = "展开同类站点", g.innerHTML = '<span class="search-arrow">▼</span>', 
        u.appendChild(g);
        const v = document.createElement("div");
        v.className = "search-submenu", p.forEach(e => {
            const t = m(e);
            t.style.margin = "2px 0", t.style.width = "100%", t.style.textAlign = "left", v.appendChild(t);
        }), u.appendChild(v), P(u, g, v, h), t.appendChild(u);
    }
    function I(e, t, n = !1) {
        if (!GM_getValue("btn_show_fanza", !0)) return;
        const a = _.createBtn("▶ FANZA", "#c0392b", () => {
            window.open(`https://www.dmm.co.jp/mono/-/search/=/searchstr=${encodeURIComponent(e)}/`);
        }, n);
        t.appendChild(a);
    }
    function U(e, t, n = !1) {
        if (!GM_getValue("btn_show_trailer", !0)) return;
        const a = _.createBtn("🎞️ 预告片", "#111827", async () => {
            const t = a.textContent;
            a.textContent = "🎞️ 解析中...", a.style.pointerEvents = "none", a.style.opacity = "0.72";
            try {
                await E.show(e);
            } finally {
                a.textContent = t, a.style.pointerEvents = "", a.style.opacity = "";
            }
        }, n);
        a.classList.add("jav-trailer-btn"), t.appendChild(a);
    }
    function N(e, t, n = !1) {
        if (!GM_getValue("btn_show_preview", !0)) return;
        const a = _.createBtn("🖼️ 预览图", "#28a745", async () => {
            await k.show(e);
        }, n);
        a.classList.add("jav-preview-btn"), t.appendChild(a);
    }
    function R(e, t, n = !1) {
        if (!M.enabled() || !e || !t) return;
        const a = M.normalizeKeepSeparator(e);
        if (!a || t.dataset.pan115PlayCode === a) return;
        t.dataset.pan115PlayCode = a;
        const r = document.createComment("pan115-play"), i = t.querySelector(".jav-trailer-btn, .jav-preview-btn, .jav-settings-btn");
        t.insertBefore(r, i || null), M.searchCached(a).then(e => {
            const t = e?.pickcode;
            if (!M.enabled() || !t || !r.parentNode) return;
            const n = _.createJumpLinkBtn("115播放", "#00a85a", M.playUrl(t));
            n.classList.add("jav-pan115-play-btn"), n.dataset.pickcode = t, n.title = e.name || `115播放：${a}`, 
            r.parentNode.insertBefore(n, r);
        }).catch(e => {
            console.warn("[老司机] 115自动查询失败:", e);
        }).finally(() => {
            r.remove();
        });
    }
    function D(e, t, n = !1) {
        if (!GM_getValue("btn_show_search", !0)) return;
        const a = q.getDefaultSearchEngine(), r = document.createElement("div");
        r.className = "search-menu", r.style.setProperty("--jav-btn-accent", a.color);
        const i = _.createBtn(`🔍 ${a.name}`, a.color, () => {
            window.open(a.url(e));
        }, n);
        i.classList.add("search-main-btn"), r.appendChild(i);
        const o = document.createElement("button");
        o.type = "button", o.className = "search-toggle-btn", o.title = "展开搜索引擎", o.innerHTML = '<span class="search-arrow">▼</span>', 
        r.appendChild(o);
        const s = document.createElement("div");
        s.className = "search-submenu", A.forEach(t => {
            if (t.name === a.name) return;
            const r = _.createBtn(`🔍 ${t.name}`, t.color, () => {
                window.open(t.url(e)), s.classList.remove("is-open");
            }, n);
            r.style.margin = "2px 0", r.style.width = "100%", r.style.textAlign = "left", s.appendChild(r);
        }), r.appendChild(s), P(r, o, s, i), t.appendChild(r);
    }
    function G(e, t = !1) {
        if (!e || e.querySelector(".jav-settings-btn")) return;
        const n = _.createBtn("⚙️ 设置", "#475569", () => {
            g.open();
        }, t);
        n.classList.add("jav-settings-btn"), n.title = "打开老司机设置", e.appendChild(n);
    }
    function B(e, t, n = !0) {
        const a = M.playUrl(e.pickcode), r = document.createElement(n ? "a" : "span");
        if (r.className = "jav-pan115-badge", r.textContent = "115匹配", r.title = e.name || `115播放：${M.normalizeKeepSeparator(t)}`, 
        r.dataset.pickcode = e.pickcode, n) r.href = a, r.target = "_blank", r.rel = "noopener noreferrer", 
        r.addEventListener("click", e => {
            e.stopImmediatePropagation();
        }, !0); else {
            r.setAttribute("role", "link"), r.tabIndex = 0;
            const e = e => {
                e.preventDefault(), e.stopImmediatePropagation(), window.open(M.playUrl(r.dataset.pickcode), "_blank", "noopener,noreferrer");
            };
            r.addEventListener("click", e, !0), r.addEventListener("keydown", t => {
                "Enter" !== t.key && " " !== t.key || e(t);
            }, !0);
        }
        return r;
    }
    let O = !1;
    async function H() {
        if (!M.enabled() || O || w.isDetailPage()) return;
        O = !0;
        const e = w.collectPan115ListTargets().slice(0, 36);
        try {
            e.forEach(({anchor: e}) => {
                e.dataset.pan115Checked = "1";
            }), await Promise.all(e.map(async ({anchor: e, code: t}) => {
                try {
                    const n = await M.searchCached(t);
                    w.insertPan115ListBadge(e, n, t);
                } catch (e) {
                    console.warn("[老司机] 115列表单项查询失败:", e);
                }
            }));
        } catch (e) {
            console.warn("[老司机] 115列表自动查询失败:", e);
        } finally {
            O = !1, M.enabled() && w.collectPan115ListTargets().length && ne();
        }
    }
    function J() {
        document.querySelectorAll(".jav-pan115-badge[data-pickcode], .jav-pan115-play-btn[data-pickcode]").forEach(e => {
            const t = M.playUrl(e.dataset.pickcode);
            "A" === e.tagName && (e.href = t);
        }), w.isDetailPage() ? Q.render() : ne();
    }
    function F(e = M.enabled()) {
        if (!e) return clearTimeout(te), document.querySelectorAll(".jav-pan115-badge, .jav-pan115-play-btn").forEach(e => e.remove()), 
        document.querySelectorAll("[data-pan115-checked], [data-pan115-has-badge]").forEach(e => {
            delete e.dataset.pan115Checked, delete e.dataset.pan115HasBadge;
        }), void document.querySelectorAll("[data-pan115-play-code]").forEach(e => {
            delete e.dataset.pan115PlayCode;
        });
        setTimeout(J, 0);
    }
    function V(e) {
        const t = document.createElement("span");
        t.className = "jav-jump-line-break", t.style.cssText = "flex-basis:100%;height:0;padding:0;margin:0;", 
        e.appendChild(t);
    }
    s.expose("__LAOSIJI_SYNC_PAN115__", F);
    const K = [ {
        id: "sukebei",
        name: "Sukebei",
        match: e => /nyaa\.si/.test(e) && e.includes("/view/"),
        titleSelector: ".panel-title"
    }, {
        id: "169bbs",
        name: "169bbs",
        match: e => /169bbs\.(com|net|org)/.test(e) && e.includes("mod=viewthread"),
        titleSelector: "#thread_subject, h1"
    }, {
        id: "supjav",
        name: "SupJav",
        match: e => /supjav\.com/.test(e) && /\/\d+\.html$/.test(e),
        titleSelector: ".clearfix.post-meta > h2"
    }, {
        id: "emby",
        name: "Emby",
        match: e => {
            try {
                const t = new URL(e);
                return !!/\/web\/index\.html/.test(t.pathname) && (/emby|jellyfin/i.test(t.hostname) || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(t.hostname));
            } catch {
                return !1;
            }
        },
        titleSelector: "h1"
    }, {
        id: "javbus",
        name: "JavBus",
        match: e => /javbus\.com/.test(e) && !/search|genre|actresses|uncensored|forum|page|series|studio|label|director|star/.test(e),
        titleSelector: "h3"
    }, {
        id: "javdb",
        name: "JavDB",
        match: e => /javdb\d*\.com/.test(e) && (/\/v\/\w+/.test(e) || /[?&]laosiji_detail=fc2\b/.test(e)),
        titleSelector: "h2.title, .javdb-api-detail-title"
    }, {
        id: "javlibrary",
        name: "JAVLibrary",
        match: e => /javlibrary\.com/.test(e) && /\/cn\/jav\w+\.html/.test(e),
        titleSelector: ".post-title"
    }, {
        id: "javrate",
        name: "Javrate",
        match: e => /javrate\.com/.test(e) && /\/movie\/detail\//i.test(e),
        titleSelector: "h1"
    }, {
        id: "sehuatang",
        name: "Sehuatang",
        match: e => /sehuatang\.(net|org|com)/.test(e) && e.includes("mod=viewthread"),
        titleSelector: "#thread_subject, h1"
    }, {
        id: "hjd2048",
        name: "HJD2048",
        match: e => /hjd2048\.com/.test(e) && /\/2048\//.test(e),
        titleSelector: "h1#subject_tpc, h1"
    }, {
        id: "missav",
        name: "MissAV",
        match: e => {
            if (!/missav\.(ws|com)/.test(e)) return !1;
            const t = new URL(e).pathname;
            return !/^\/$|\/search|\/tags|\/actresses|\/genres/.test(t) && /\/[a-z]{2,10}-\d+/i.test(t);
        },
        titleSelector: 'h1[class*="text-nord6"], h1'
    }, {
        id: "jable",
        name: "Jable",
        match: e => /jable\.tv/.test(e) && /\/videos\/[a-z0-9-]+\/?/i.test(new URL(e).pathname),
        titleSelector: ".header-left > h4"
    } ];
    function Z(e) {
        if (!e) return !1;
        if (e.closest('.hide, [hidden], [aria-hidden="true"]')) return !1;
        const t = e.getClientRects();
        if (!t || 0 === t.length) return !1;
        const n = window.getComputedStyle(e);
        return "none" !== n.display && "hidden" !== n.visibility;
    }
    function W() {
        const e = Array.from(document.querySelectorAll('h1, h2, h3.itemName, .itemName-primary, .pageTitle, .nameContainer h3, [class*="itemName"]'));
        let t = null;
        for (const n of e) {
            const e = (n.textContent || "").trim();
            if (e && Z(n) && (t || (t = n), _.extractCode(e))) return n;
        }
        return t;
    }
    function Y() {
        const e = w.getJumpSite();
        if (!e) return;
        let t = w.getJumpTitleElement(e);
        if (!t) return;
        if ("emby" === e.id && !_.extractCode(t.textContent || "")) return;
        const n = document.querySelector('.jav-jump-btn-group[data-laosiji-jump="1"]');
        if ("emby" === e.id) {
            const e = w.getEmbyRenderKey(t), a = n?.dataset.embyRenderKey || "";
            if (n) {
                if ((!a || a === e) && n.isConnected) {
                    const e = w.getEmbyInsertAnchor(t);
                    return void (e.nextElementSibling !== n && e.insertAdjacentElement("afterend", n));
                }
                n.remove();
            }
            delete t.dataset.enhanced;
        }
        if (n && "emby" !== e.id) {
            const a = _.extractCode(t.textContent), r = M.extractCode(t.textContent, a);
            return r && R(r, n), G(n), void X(e, t, n);
        }
        if ("1" === t.dataset.enhanced) return;
        t.dataset.enhanced = "1";
        const a = t.textContent, r = _.extractCode(a);
        if (!r) return;
        const i = _.extractCode(a, {
            keepUncensoredSource: !0
        }) || r, o = document.createElement("div");
        if (o.className = "jav-jump-btn-group", o.dataset.laosijiJump = "1", "javlibrary" === e.id) L(r, o), 
        $(r, o), T(r, o), z(r, o), I(r, o), D(r, o), V(o), R(M.extractCode(a, r), o), U(i, o), 
        N(r, o), G(o), o.querySelectorAll("a").forEach(e => {
            let t = e.getAttribute("style") || "";
            t = t.replace(/background:\s*([^;]+);/g, "background: $1 !important;"), t = t.replace(/color:\s*([^;]+);/g, "color: $1 !important;"), 
            e.setAttribute("style", t);
        }), X(e, t, o); else if ("missav" === e.id) {
            L(r, o), $(r, o), T(r, o), z(r, o);
            const n = q.getDefaultSearchEngine(), s = document.createElement("div");
            s.className = "search-menu", s.style.setProperty("--jav-btn-accent", n.color);
            const l = _.createLinkBtn(`🔍 ${n.name}`, n.color, n.url(r));
            l.classList.add("search-main-btn"), s.appendChild(l);
            const c = document.createElement("button");
            c.type = "button", c.className = "search-toggle-btn", c.title = "展开搜索引擎", c.innerHTML = '<span class="search-arrow">▼</span>', 
            s.appendChild(c);
            const d = document.createElement("div");
            d.className = "search-submenu", A.forEach(e => {
                if (e.name === n.name) return;
                const t = _.createLinkBtn(`🔍 ${e.name}`, e.color, e.url(r));
                t.style.margin = "2px 0", d.appendChild(t);
            }), s.appendChild(d), P(s, c, d, l), o.appendChild(s), R(M.extractCode(a, r), o), 
            U(i, o), N(r, o), G(o), o.style.cssText = "\n                margin: 10px 0 6px 0;\n                display: flex;\n                flex-wrap: wrap;\n                gap: 8px;\n                align-items: center;\n                position: relative;\n                z-index: 9999;\n            ", 
            X(e, t, o);
        } else L(r, o), $(r, o), T(r, o), z(r, o), I(r, o), D(r, o), [ "javbus", "javdb", "supjav", "jable" ].includes(e.id) && V(o), 
        R(M.extractCode(a, r), o), U(i, o), N(r, o), G(o), "emby" === e.id ? (o.classList.add("emby-fix"), 
        o.dataset.embyRenderKey = w.getEmbyRenderKey(t), w.getEmbyInsertAnchor(t).insertAdjacentElement("afterend", o)) : X(e, t, o);
    }
    function X(e, t, n) {
        if ("supjav" === e.id) return n.style.marginTop = "8px", void (n.parentElement === t.parentElement && n.previousElementSibling === t || t.insertAdjacentElement("afterend", n));
        if ("jable" === e.id) return n.style.marginTop = "8px", n.style.display = "flex", 
        n.style.flexWrap = "wrap", void (n.parentElement !== t && t.appendChild(n));
        const a = function(e) {
            return "javdb" === e.id ? document.querySelector(".movie-panel-info") : "javbus" === e.id ? document.querySelector(".container .info") : "javlibrary" === e.id ? document.querySelector("#video_info") : null;
        }(e);
        a ? (function(e) {
            const t = [ e, e.closest("td"), e.closest("tr"), e.closest("#video_jacket_info"), e.closest(".movie-panel-info"), e.closest(".container .info"), e.closest(".col-md-3.info"), e.closest(".jav-flex-container"), e.closest(".row.movie"), e.closest(".video-info"), e.closest(".info-header") ];
            [ ...new Set(t.filter(Boolean)) ].forEach(e => {
                e.style.setProperty("overflow", "visible", "important"), e.style.setProperty("overflow-x", "visible", "important"), 
                e.style.setProperty("overflow-y", "visible", "important");
            });
        }(a), "javlibrary" === e.id ? (n.parentElement !== a || n.nextElementSibling) && a.appendChild(n) : n.parentElement !== a && a.appendChild(n)) : n.parentElement === t.parentElement && n.previousElementSibling === t || t.insertAdjacentElement("afterend", n);
    }
    s.expose("__LAOSIJI_JUMP_SITES__", K);
    const Q = {
        render: Y,
        refresh: Y
    };
    s.expose("__LAOSIJI_JUMP_BUTTONS__", Q);
    const ee = {
        cachePrefix: "laosiji_infinite_v1_",
        maxSnapshotItems: 240,
        snapshotTimer: null,
        enabled: () => GM_getValue("infinite_scroll_enabled", !1),
        state: null,
        init() {
            if (!this.enabled() || w.isDetailPage() || this.state) return;
            const e = this.getConfig();
            e?.container && e.nextUrl && (this.state = {
                ...e,
                loading: !1,
                done: !1,
                seen: new Set([ ...e.container.querySelectorAll("a[href]") ].map(e => e.href))
            }, this.restoreSnapshot(this.state), this.hidePagination(), this.createSentinel(), 
            this.observe(), this.restoreScroll());
        },
        destroy() {
            this.rememberScroll(), this.saveSnapshot(), clearTimeout(this.snapshotTimer), this.snapshotTimer = null, 
            this.state?.observer && this.state.observer.disconnect(), this.state = null, document.querySelectorAll(".jav-infinite-sentinel").forEach(e => e.remove()), 
            document.querySelectorAll("#next, .pagination, nav.pagination").forEach(e => {
                e.style.display = "";
            });
        },
        getConfig: (e = document, t = location.href) => w.getInfiniteScrollConfig(e, t),
        cacheKey(e = this.state) {
            if (!e?.site) return "";
            const t = new URL(location.href);
            return t.hash = "", `${this.cachePrefix}${e.site}_${t.href}`;
        },
        readSnapshot(e = this.state) {
            const t = this.cacheKey(e);
            if (!t) return null;
            try {
                const n = JSON.parse(sessionStorage.getItem(t) || "null");
                return n && n.site === e.site ? n : null;
            } catch {
                return sessionStorage.removeItem(t), null;
            }
        },
        itemKey(e) {
            const t = e?.querySelector?.("a[href]")?.getAttribute("href") || "";
            return t ? new URL(t, location.href).href : (e?.textContent || "").trim().slice(0, 80);
        },
        restoreSnapshot(e) {
            const t = this.readSnapshot(e);
            if (!t?.items?.length) return !1;
            const n = new Set([ ...e.container.querySelectorAll(e.itemSelector) ].map(e => this.itemKey(e)).filter(Boolean)), a = document.createDocumentFragment();
            let r = 0;
            return t.items.forEach(t => {
                const i = document.createElement("template");
                i.innerHTML = t;
                const o = i.content.firstElementChild, s = this.itemKey(o);
                o && s && !n.has(s) && (n.add(s), o.dataset.laosijiInfiniteItem = "1", w.decorateInfiniteScrollItem(e.site, o), 
                a.appendChild(o), r += 1);
            }), !!r && (e.container.appendChild(a), t.items.forEach(t => {
                const n = document.createElement("template");
                n.innerHTML = t;
                const a = n.content.firstElementChild, r = this.itemKey(a);
                r && e.seen.add(r);
            }), t.nextUrl && (e.nextUrl = t.nextUrl), e.restoredScrollY = Number(t.scrollY) || 0, 
            this.hidePagination(), !0);
        },
        saveSnapshot() {
            if (!this.state?.container) return;
            const e = this.cacheKey();
            if (!e) return;
            const t = [ ...this.state.container.querySelectorAll(this.state.itemSelector) ].filter(e => "1" === e.dataset.laosijiInfiniteItem).slice(-this.maxSnapshotItems).map(e => e.outerHTML), n = {
                site: this.state.site,
                nextUrl: this.state.nextUrl || "",
                done: !!this.state.done,
                scrollY: window.scrollY || 0,
                items: t,
                savedAt: Date.now()
            };
            try {
                sessionStorage.setItem(e, JSON.stringify(n));
            } catch (e) {
                console.warn("[老司机] 瀑布流快照保存失败:", e);
            }
        },
        scheduleSnapshotSave() {
            this.state && (clearTimeout(this.snapshotTimer), this.snapshotTimer = setTimeout(() => this.saveSnapshot(), 180));
        },
        rememberScroll() {
            const e = this.readSnapshot();
            if (e) {
                e.scrollY = window.scrollY || 0, e.savedAt = Date.now();
                try {
                    sessionStorage.setItem(this.cacheKey(), JSON.stringify(e));
                } catch {}
            }
        },
        restoreScroll() {
            const e = Number(this.state?.restoredScrollY) || 0;
            e <= 0 || (setTimeout(() => window.scrollTo(window.scrollX || 0, e), 0), setTimeout(() => window.scrollTo(window.scrollX || 0, e), 120));
        },
        createSentinel() {
            const e = document.createElement("div");
            e.className = "jav-infinite-sentinel", e.textContent = "继续滚动加载下一页", e.addEventListener("click", () => {
                e.classList.contains("is-error") && this.loadNext();
            }), this.state.sentinel = e, this.state.container.insertAdjacentElement("afterend", e);
        },
        observe() {
            this.state.observer = new IntersectionObserver(e => {
                e.some(e => e.isIntersecting) && this.loadNext();
            }, {
                rootMargin: "900px 0px"
            }), this.state.observer.observe(this.state.sentinel);
        },
        hidePagination() {
            document.querySelectorAll("#next, .pagination, nav.pagination").forEach(e => {
                e.style.display = "none";
            });
        },
        setStatus(e, t = "") {
            const n = this.state?.sentinel;
            n && (n.className = `jav-infinite-sentinel ${t}`.trim(), n.textContent = e);
        },
        async fetchDoc(e) {
            const t = await new Promise((t, n) => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: e,
                    timeout: 2e4,
                    onload: t,
                    onerror: () => n(new Error("加载失败")),
                    ontimeout: () => n(new Error("加载超时"))
                });
            });
            return (new DOMParser).parseFromString(t.responseText, "text/html");
        },
        appendItems(e) {
            const t = [ ...e.querySelectorAll(this.state.itemSelector) ];
            let n = this.state.container;
            const a = w.getInfiniteScrollContainer(this.state.site);
            a && (n = this.state.container = a);
            let r = 0;
            return t.forEach(e => {
                try {
                    const t = this.itemKey(e);
                    if (t && this.state.seen.has(t)) return;
                    t && this.state.seen.add(t), e.dataset.laosijiInfiniteItem = "1";
                    const a = document.adoptNode(e);
                    n.appendChild(a), w.decorateInfiniteScrollItem(this.state.site, a), r += 1;
                } catch (e) {
                    console.warn("[老司机] 追加单项失败:", e);
                }
            }), r;
        },
        async loadNext() {
            if (this.state && !this.state.loading && !this.state.done && this.state.nextUrl) {
                this.state.loading = !0, this.setStatus("正在加载下一页...", "is-loading");
                try {
                    const e = this.state.nextUrl, t = await this.fetchDoc(e);
                    if (!this.state) return;
                    const n = this.appendItems(t), a = this.getConfig(t, e);
                    if (!this.state) return;
                    this.state.nextUrl = a?.nextUrl || "", this.hidePagination(), this.reflow(), ae.refreshListDecorations(), 
                    this.saveSnapshot(), setTimeout(() => {
                        ae.refreshListPage();
                    }, 80), n && this.state.nextUrl ? this.setStatus("继续滚动加载下一页") : (this.state.done = !0, 
                    this.state.observer?.disconnect(), this.setStatus("已经到底了", "is-done"), this.saveSnapshot());
                } catch (e) {
                    console.warn("[老司机] 瀑布流加载失败:", e), this.setStatus("加载失败，点击重试", "is-error");
                } finally {
                    this.state && (this.state.loading = !1);
                }
            }
        },
        reflow() {
            try {
                this.state.container = w.reflowInfiniteScroll(this.state.site, this.state.container);
            } catch (e) {
                console.warn("[老司机] 瀑布流重排失败:", e);
            }
            window.dispatchEvent(new Event("resize"));
        }
    };
    s.expose("__LAOSIJI_INFINITE_SCROLL__", ee);
    let te = null;
    function ne() {
        M.enabled() && !w.isDetailPage() && (clearTimeout(te), te = setTimeout(H, 300));
    }
    s.expose("__LAOSIJI_SCHEDULE_PAN115__", ne), s.expose("__LAOSIJI_RENDER_BUTTONS__", () => Q.render());
    const ae = {
        refresh(e = {}) {
            const {jump: t = !0, listPreview: n = !0, detailPreview: a = !0, pan115: r = !0, infiniteScroll: i = !0} = e;
            t && Q.render(), n && S.sync(), a && C.sync(), r && ne(), i && ee.init();
        },
        refreshListPage() {
            this.refresh({
                detailPreview: !1,
                infiniteScroll: !1
            });
        },
        refreshListDecorations() {
            S.sync(), ne();
        },
        syncPan115(e = M.enabled()) {
            F(e);
        },
        syncInfiniteScroll(e = n.infiniteScroll) {
            e ? ee.init() : ee.destroy();
        },
        syncListPreview() {
            S.sync();
        },
        syncDetailPreview() {
            C.sync();
        }
    };
    s.expose("__LAOSIJI_RUNTIME__", ae);
    let re = null;
    const ie = new MutationObserver(() => {
        clearTimeout(re), re = setTimeout(() => {
            ae.refresh();
        }, 120);
    });
    let oe = location.href, se = [];
    function le() {
        se.forEach(e => clearTimeout(e)), se = [];
    }
    function ce() {
        le(), [ 0, 80, 200, 400, 700, 1100, 1700, 2500, 3500, 5e3, 6500 ].forEach(e => {
            se.push(setTimeout(() => {
                Q.render(), function() {
                    const e = document.querySelector('.jav-jump-btn-group[data-laosiji-jump="1"]');
                    return !(!e || !e.isConnected);
                }() && le();
            }, e));
        });
    }
    function de() {
        location.href !== oe && (oe = location.href, w.isEmbyPage() ? (w.isEmbyPage() && (document.querySelectorAll('.jav-jump-btn-group[data-laosiji-jump="1"]').forEach(e => e.remove()), 
        document.querySelectorAll('h1[data-enhanced="1"]').forEach(e => delete e.dataset.enhanced)), 
        ce()) : Q.render());
    }
    const pe = {
        started: !1,
        observerReady: !1,
        navigationReady: !1,
        initRuntimeObserver() {
            this.observerReady || (this.observerReady = !0, document.body && ie.observe(document.body, {
                childList: !0,
                subtree: !0
            }));
        },
        initNavigationHooks() {
            this.navigationReady || (this.navigationReady = !0, window.addEventListener("scroll", () => ee.scheduleSnapshotSave(), {
                passive: !0
            }), window.addEventListener("pagehide", () => ee.saveSnapshot()), window.addEventListener("beforeunload", () => ee.saveSnapshot()), 
            window.addEventListener("pageshow", e => {
                e.persisted && setTimeout(() => ee.init(), 0);
            }), window.addEventListener("hashchange", de), window.addEventListener("popstate", de), 
            function() {
                const e = e => {
                    const t = history[e];
                    "function" == typeof t && (history[e] = function() {
                        const e = t.apply(this, arguments);
                        return setTimeout(de, 0), e;
                    });
                };
                e("pushState"), e("replaceState");
            }());
        },
        init() {
            this.started || (this.started = !0, this.initRuntimeObserver(), this.initNavigationHooks(), 
            w.setupJavDbGuards(), location.hostname.includes("javdb") && location.pathname.startsWith("/v/") ? setTimeout(j, 600) : j(), 
            w.isEmbyPage() ? (ce(), ae.refresh({
                jump: !1
            })) : ae.refresh());
        }
    };
    s.expose("__LAOSIJI_APP__", pe), pe.init();
}();
