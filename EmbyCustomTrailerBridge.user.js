// ==UserScript==
// @name         Emby Custom Trailer Bridge
// @namespace    emby-custom-trailer
// @version      0.1.2
// @description  Privileged request bridge for EmbyNativeTrailer MGStage trailer lookup.
// @author       ZiPenOk
// @license      MIT
// @icon         https://emby.media/favicon.ico
// @match        http://10.10.10.80:8097/web/*
// @match        http://10.10.10.80:8097/*
// @match        http://10.10.10.80:8096/web/*
// @match        http://10.10.10.80:8096/*
// @match        https://emby.*/*
// @match        https://emby.*/web/*
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      mgstage.com
// @connect      www.mgstage.com
// @run-at       document-start
// @homepageURL  https://github.com/ZiPenOk/scripts
// @supportURL   https://github.com/ZiPenOk/scripts/issues
// @downloadURL  https://github.com/ZiPenOk/scripts/raw/refs/heads/main/EmbyCustomTrailerBridge.user.js
// @updateURL    https://github.com/ZiPenOk/scripts/raw/refs/heads/main/EmbyCustomTrailerBridge.user.js
// ==/UserScript==

(function () {
    "use strict";

    const BRIDGE_KEY = "CustomTrailerBridge";
    const ALLOWED_HOSTS = new Set(["mgstage.com", "www.mgstage.com"]);
    const MGSTAGE_COOKIE = "adc=1; coc=1; mgs_agef=1";

    function isAllowedUrl(url) {
        try {
            const parsed = new URL(url);
            return parsed.protocol === "https:" && ALLOWED_HOSTS.has(parsed.hostname.toLowerCase());
        } catch (err) {
            return false;
        }
    }

    function buildHeaders(url, options, profile) {
        const headers = Object.assign({}, options?.headers || {});
        const parsed = new URL(url);

        if (parsed.hostname.toLowerCase().endsWith("mgstage.com")) {
            delete headers.Cookie;
            delete headers.cookie;
            if (profile === "browser") {
                headers["User-Agent"] = headers["User-Agent"] ||
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
            }
            headers["Accept-Language"] = headers["Accept-Language"] ||
                headers["accept-language"] ||
                "ja-JP,ja;q=0.9,en;q=0.8";
        }

        return headers;
    }

    function sendRequest(url, options, profile) {
        return new Promise((resolve) => {
            const headers = buildHeaders(url, options, profile);
            GM_xmlhttpRequest({
                method: options?.method || "GET",
                url,
                anonymous: false,
                cookie: MGSTAGE_COOKIE,
                headers,
                data: options?.body,
                timeout: options?.timeout || 15000,
                onload: (res) => {
                    resolve({
                        ok: res.status >= 200 && res.status < 400,
                        status: res.status,
                        profile,
                        responseHeaders: res.responseHeaders || "",
                        responseText: res.responseText || "",
                        finalUrl: res.finalUrl || url
                    });
                },
                onerror: (err) => {
                    resolve({
                        ok: false,
                        status: 0,
                        profile,
                        responseHeaders: "",
                        responseText: "",
                        finalUrl: url,
                        error: err?.error || err?.message || "GM_xmlhttpRequest error"
                    });
                },
                ontimeout: () => {
                    resolve({
                        ok: false,
                        status: 0,
                        profile,
                        responseHeaders: "",
                        responseText: "",
                        finalUrl: url,
                        error: "GM_xmlhttpRequest timeout"
                    });
                }
            });
        });
    }

    async function requestText(url, options) {
        if (!isAllowedUrl(url)) {
            return {
                ok: false,
                status: 0,
                responseText: "",
                finalUrl: url,
                error: "Blocked by CustomTrailerBridge allowlist"
            };
        }

        const profiles = ["browser", "plain"];
        let lastResult = null;
        for (const profile of profiles) {
            lastResult = await sendRequest(url, options, profile);
            if (lastResult.ok || lastResult.status !== 403) return lastResult;
        }
        return lastResult;
    }

    const api = Object.freeze({
        requestText,
        version: "0.1.2"
    });

    const pageWindow = typeof unsafeWindow === "undefined" ? window : unsafeWindow;

    Object.defineProperty(pageWindow, BRIDGE_KEY, {
        value: api,
        configurable: false,
        enumerable: false,
        writable: false
    });

    pageWindow.dispatchEvent(new CustomEvent("CustomTrailerBridgeReady", {
        detail: { version: api.version }
    }));

    console.log("[CustomTrailerBridge] Ready", api.version);
})();
