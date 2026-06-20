// ==UserScript==
// @name         JAV老司机-新
// @namespace    https://github.com/ZiPenOk/scripts
// @version      2.6.2.2
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
    const e = "2.6.2.2", t = 86, n = 20, a = {
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
        get titleTranslate() {
            return GM_getValue("title_translate_enabled", !0);
        },
        get listOpenNewTab() {
            return GM_getValue("list_open_new_tab_enabled", !1);
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
        set titleTranslate(e) {
            GM_setValue("title_translate_enabled", !!e);
        },
        set listOpenNewTab(e) {
            GM_setValue("list_open_new_tab_enabled", !!e);
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
    }, i = (() => {
        const e = {
            min: 2,
            max: 10
        }, t = {
            javbus: {
                getter: () => a.javbusCardColumns,
                setter: e => {
                    a.javbusCardColumns = e;
                },
                selector: ".javbus-card-grid",
                host: /(?:^|\.)javbus\.com$/i
            },
            javdb: {
                getter: () => a.javdbCardColumns,
                setter: e => {
                    a.javdbCardColumns = e;
                },
                selector: ".javdb-card-grid",
                host: /javdb/i
            },
            javlib: {
                getter: () => a.javlibCardColumns,
                setter: e => {
                    a.javlibCardColumns = e;
                },
                selector: ".javlib-card-grid",
                host: /(javlibrary|javlib|r86m|s87n)/i
            }
        };
        function n(t) {
            return Math.min(e.max, Math.max(e.min, parseInt(t, 10) || 5));
        }
        function i(e) {
            return t[e] ? n(t[e].getter()) : 5;
        }
        return {
            LIMITS: e,
            clamp: n,
            get: i,
            set: function(e, a) {
                t[e] && t[e].setter(n(a));
            },
            apply: function(e, a = i(e)) {
                const r = t[e];
                r && document.querySelectorAll(r.selector).forEach(e => {
                    e.style.setProperty("--jav-card-columns", String(n(a)));
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
                getter: () => a.javbusPageZoom,
                setter: e => {
                    a.javbusPageZoom = e;
                },
                selector: "body > div.container-fluid, body > div.container",
                host: /(?:^|\.)javbus\.com$/i
            },
            javdb: {
                getter: () => a.javdbPageZoom,
                setter: e => {
                    a.javdbPageZoom = e;
                },
                selector: "body > section > div",
                host: /javdb/i
            },
            javlib: {
                getter: () => a.javlibPageZoom,
                setter: e => {
                    a.javlibPageZoom = e;
                },
                selector: "#content",
                host: /(javlibrary|javlib|r86m|s87n)/i
            }
        };
        function n(t) {
            return Math.min(e.max, Math.max(e.min, parseInt(t, 10) || 100));
        }
        function i(e) {
            return t[e] ? n(t[e].getter()) : 100;
        }
        function r(e, a = i(e)) {
            const r = t[e];
            if (!r) return;
            const o = `${n(a)}%`;
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
            document.querySelectorAll(r.selector).forEach(e => {
                e && (e.style.setProperty("zoom", "1"), e.style.setProperty("width", o, "important"), 
                e.style.setProperty("max-width", "none", "important"), e.style.setProperty("margin-left", "auto", "important"), 
                e.style.setProperty("margin-right", "auto", "important"), e.style.setProperty("box-sizing", "border-box", "important"));
            }), "javbus" === e && function(e = location.href) {
                try {
                    const t = new URL(e, location.href).pathname.replace(/\/+$/, "");
                    return /^\/(?:[a-z]{2}\/)?(?:uncensored\/)?actresses(?:\/\d+)?$/i.test(t);
                } catch (e) {
                    return !1;
                }
            }() && function() {
                const e = document.querySelector("#waterfall");
                if (!e || !e.querySelector(".avatar-box")) return;
                e.style.removeProperty("width"), e.style.setProperty("max-width", "100%", "important"), 
                e.style.setProperty("margin-left", "auto", "important"), e.style.setProperty("margin-right", "auto", "important");
                const t = () => {
                    const t = window.jQuery || window.$;
                    try {
                        const n = t && t(e);
                        n?.masonry && (n.masonry({
                            itemSelector: ".item",
                            isFitWidth: !0
                        }), [ "reloadItems", "reload", "layout" ].forEach(e => {
                            try {
                                n.masonry(e);
                            } catch (e) {}
                        }));
                    } catch (e) {}
                    window.dispatchEvent(new Event("resize"));
                };
                requestAnimationFrame(t), setTimeout(t, 160);
            }();
        }
        function o() {
            const e = location.hostname;
            return Object.entries(t).find(([, t]) => t.host.test(e))?.[0] || "";
        }
        return {
            LIMITS: e,
            clamp: n,
            get: i,
            set: function(e, a) {
                t[e] && t[e].setter(n(a));
            },
            apply: r,
            applyCurrent: function() {
                const e = o();
                e && r(e);
            },
            detectCurrentSite: o
        };
    })(), o = (() => {
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
        }, n = {
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
        function i(t) {
            return Math.min(e.max, Math.max(e.min, parseInt(t, 10) || 100));
        }
        function r() {
            const e = location.hostname;
            return Object.entries(n).find(([, t]) => t.host.test(e) && t.detail())?.[0] || "";
        }
        function o() {
            const e = a.detailFlex;
            return e && "object" == typeof e ? e : {};
        }
        function s(e) {
            const n = o(), a = t[e] || t.javbus, r = n[e] || {};
            return {
                cover: i(r.cover ?? a.cover),
                info: i(r.info ?? a.info),
                magnet: i(r.magnet ?? a.magnet)
            };
        }
        function l(e) {
            return (i(e) / 100).toFixed(2).replace(/\.?0+$/, "");
        }
        function c(e = r()) {
            return !(!e || !a.magnetTable) && !!document.querySelector(".jav-nong-slot");
        }
        return {
            LIMITS: e,
            DEFAULTS: t,
            clamp: i,
            detectCurrentSite: r,
            get: s,
            set: function(e, r, l) {
                if (!n[e] || !t[e] || !t[e].hasOwnProperty(r)) return;
                const c = o();
                c[e] = {
                    ...s(e),
                    [r]: i(l)
                }, a.detailFlex = c;
            },
            apply: function(e = r()) {
                const t = n[e];
                if (!t) return;
                const a = t.root();
                if (!a) return;
                const i = s(e);
                a.style.setProperty(t.vars.cover, l(i.cover)), a.style.setProperty(t.vars.info, l(i.info)), 
                c(e) && a.style.setProperty(t.vars.magnet, l(i.magnet));
            },
            hasMagnet: c,
            hasLayout: function(e = r()) {
                const t = n[e];
                return !!t?.root?.();
            },
            defaultCss: function(e = r()) {
                const n = t[e] || t.javbus;
                return {
                    cover: l(n.cover),
                    info: l(n.info),
                    magnet: l(n.magnet)
                };
            }
        };
    })(), s = (...e) => console.log("[老司机]", ...e), l = {
        version: e,
        cfg: a,
        log: s,
        notify: p,
        parseHTML: m,
        gmFetch: u,
        expose: (e, t) => (window[e] = t, t)
    };
    l.expose("__LAOSIJI_CORE__", l);
    const c = [ {
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
    l.expose("__LAOSIJI_VIDEO_ENGINES__", c);
    const d = {
        on: (e, t, n, a) => e && "function" == typeof n ? (e.addEventListener(t, n, a), 
        e) : null,
        click(e, t, n) {
            return this.on(e, "click", t, n);
        },
        bindCheckbox(e, t, n) {
            return e ? (e.checked = !!t, this.on(e, "change", () => n?.(e.checked, e)), e) : null;
        },
        bindRange(e, t, n, a, i) {
            if (!e) return null;
            const r = "function" == typeof a ? a : e => String(e);
            return e.value = String(n), t && (t.textContent = r(n)), this.on(e, "input", () => {
                const n = e.value;
                t && (t.textContent = r(n)), i?.(n, e);
            }), e;
        },
        setSelectValue(e, t, n = "") {
            if (!e) return "";
            const a = [ ...e.options ], i = a.some(e => e.value === t) ? t : n;
            return i && a.some(e => e.value === i) ? e.value = i : a.length && (e.selectedIndex = 0), 
            e.value;
        },
        clearSessionByPrefixes(e) {
            let t = 0;
            return Object.keys(sessionStorage).forEach(n => {
                e.some(e => n.startsWith(e)) && (sessionStorage.removeItem(n), t += 1);
            }), t;
        }
    };
    function p(e, t, n) {
        GM_notification({
            title: e,
            text: t,
            onclick: () => n && window.open(n)
        });
    }
    function m(e) {
        return (new DOMParser).parseFromString(e, "text/html");
    }
    function u(e, t = {}) {
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
    function h(e) {
        if (!e) return "";
        if ((e = e.trim().toUpperCase()).match(/-[^0]/)) return e;
        if (e.match(/^[0-9_-]+$/)) return e;
        const t = e.match(/^([A-Z]+[-_]?)(\d+)$/);
        return t ? t[1].replace(/[-_]$/, "") + "-" + t[2] : e;
    }
    function v(e, t, n = null, a = !1) {
        if (!e || !t) return;
        const i = h(t);
        (e.parentElement || e).querySelectorAll(".jav-avid-copy").forEach(e => e.remove()), 
        n?.style.setProperty("display", "none", "important");
        const r = document.createElement("button");
        r.type = "button", r.className = "jav-avid-copy", r.textContent = "复制番号", r.title = `复制番号：${i}`, 
        r.style.cssText = "display:inline-block;margin-left:8px;padding:2px 8px;font-size:12px;background:#e8f4fd;border:1px solid #90c5e8;border-radius:4px;cursor:pointer;color:#1a6fa8;vertical-align:middle;white-space:nowrap;", 
        r.addEventListener("click", e => {
            e.preventDefault(), e.stopPropagation(), GM_setClipboard(i), r.textContent = "已复制", 
            setTimeout(() => {
                r.textContent = "复制番号";
            }, 900);
        }), a ? e.appendChild(r) : e.after(r);
    }
    l.expose("__LAOSIJI_UI__", d);
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
        } ], n = [ "BTDigg", "Taocili", "Google", "Bing", "DuckGo" ], i = {
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
        }, r = e => String(e || "").trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
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
                const l = s.querySelector("#sp-default-engine"), p = s.querySelector("#sp-engine-picker"), m = s.querySelector("#sp-engine-domain"), u = s.querySelector("#sp-jump-engine"), h = s.querySelector("#sp-video-engine"), v = s.querySelector("#sp-magnet-table"), g = s.querySelector("#sp-clear-preview-cache"), b = s.querySelector("#sp-clear-trailer-cache"), f = s.querySelector("#sp-pan115-player"), x = {
                    nyaa: s.querySelector("#sp-btn-nyaa"),
                    javbus: s.querySelector("#sp-btn-javbus"),
                    javdb: s.querySelector("#sp-btn-javdb"),
                    missav: s.querySelector("#sp-btn-missav"),
                    fanza: s.querySelector("#sp-btn-fanza"),
                    search: s.querySelector("#sp-btn-search"),
                    trailer: s.querySelector("#sp-btn-trailer"),
                    preview: s.querySelector("#sp-btn-preview")
                }, y = s.querySelector("#sp-clear-cache"), w = s.querySelector("#sp-cache-feedback"), j = s.querySelector("#sp-thumb-order"), _ = Object.fromEntries(t.map(e => [ e.key, a[e.key] ]));
                let k = GM_getValue("thumb_source_order", [ "javfree", "projectjav", "javstore" ]);
                Object.keys(i).forEach(e => {
                    k.includes(e) || k.push(e);
                }), k = k.filter(e => i[e]);
                const S = () => {
                    const e = l.value || a.defaultEngine;
                    l.innerHTML = "", t.forEach(e => {
                        const t = _[e.key], n = document.createElement("option");
                        n.value = t, n.textContent = `${e.label} (${t})`, l.appendChild(n);
                    }), l.value = [ ...l.options ].some(t => t.value === e) ? e : a.defaultEngine, [ ...l.options ].some(e => e.value === l.value) || (l.selectedIndex = 0);
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
                    _[p.value] = r(m.value), S();
                }), n.forEach((e, t) => {
                    const n = document.createElement("option");
                    n.value = String(t), n.textContent = e, u.appendChild(n);
                }), c.forEach(e => {
                    const t = document.createElement("option");
                    t.value = e.key, t.textContent = e.label, h.appendChild(t);
                }), u.value = String(GM_getValue("default_search_engine", 2)), d.setSelectValue(h, a.defaultVideoEngine, "missav"), 
                f && (f.value = "115master" === a.pan115Player ? "115master" : "official"), v.checked = a.magnetTable, 
                x.nyaa.checked = a.btnShowNyaa, x.javbus.checked = a.btnShowJavbus, x.javdb.checked = a.btnShowJavdb, 
                x.missav.checked = a.btnShowMissav, x.fanza.checked = a.btnShowFanza, x.search.checked = a.btnShowSearch, 
                x.trailer.checked = a.btnShowTrailer, x.preview.checked = a.btnShowPreview;
                const E = () => {
                    j.innerHTML = "", k.forEach((e, t) => {
                        const n = i[e], a = document.createElement("div");
                        a.className = "sp-order-item", a.dataset.src = e, a.innerHTML = `\n                        <div><div class="sp-order-name">${n.label}</div></div>\n                        <span class="sp-dot" style="background:${n.color}"></span>\n                        <div class="sp-order-actions">\n                            <button class="sp-order-btn" type="button" data-dir="-1" title="上移" ${0 === t ? "disabled" : ""}>↑</button>\n                            <button class="sp-order-btn" type="button" data-dir="1" title="下移" ${t === k.length - 1 ? "disabled" : ""}>↓</button>\n                        </div>`, 
                        j.appendChild(a);
                    });
                };
                j.addEventListener("click", e => {
                    const t = e.target.closest(".sp-order-btn");
                    if (!t) return;
                    const n = t.closest(".sp-order-item"), a = k.indexOf(n?.dataset.src), i = a + parseInt(t.dataset.dir, 10);
                    a < 0 || i < 0 || i >= k.length || ([k[a], k[i]] = [ k[i], k[a] ], E());
                });
                const q = (e, t, n) => {
                    e && (e.classList.remove("is-done"), e.classList.add("is-clearing"), setTimeout(() => {
                        e.classList.remove("is-clearing"), e.classList.add("is-done"), w.textContent = n ? `${t} ${n} 项` : `${t}无缓存`, 
                        setTimeout(() => e.classList.remove("is-done"), 900), setTimeout(() => {
                            w.textContent = "";
                        }, 1800);
                    }, 260));
                };
                g.addEventListener("click", () => {
                    const e = d.clearSessionByPrefixes([ "thumb_cache_" ]);
                    q(g, "预览图已清理", e);
                }), b.addEventListener("click", () => {
                    const e = d.clearSessionByPrefixes([ "trailer_cache_" ]);
                    q(b, "预告片已清理", e);
                }), y.addEventListener("click", () => {
                    const e = d.clearSessionByPrefixes([ "thumb_cache_", "trailer_cache_", "pan115_cache_" ]);
                    w.textContent = e ? `已清空 ${e} 项` : "无缓存", setTimeout(() => {
                        w.textContent = "";
                    }, 1800);
                }), p.value = "javdbSearchUrl", C(), S(), E();
                const A = () => o.remove();
                s.querySelector(".sp-close").addEventListener("click", A), s.querySelector(".sp-btn-cancel").addEventListener("click", A), 
                s.querySelector(".sp-btn-save").addEventListener("click", () => {
                    const e = () => JSON.stringify({
                        domains: t.map(e => a[e.key]),
                        defaultEngine: a.defaultEngine,
                        defaultSearchEngine: GM_getValue("default_search_engine", 2),
                        defaultVideoEngine: a.defaultVideoEngine,
                        columns: {
                            javbus: a.javbusCardColumns,
                            javdb: a.javdbCardColumns,
                            javlib: a.javlibCardColumns
                        },
                        magnetTable: a.magnetTable,
                        infiniteScroll: a.infiniteScroll,
                        buttons: {
                            nyaa: a.btnShowNyaa,
                            javbus: a.btnShowJavbus,
                            javdb: a.btnShowJavdb,
                            missav: a.btnShowMissav,
                            fanza: a.btnShowFanza,
                            search: a.btnShowSearch,
                            trailer: a.btnShowTrailer,
                            preview: a.btnShowPreview
                        },
                        thumbOrder: GM_getValue("thumb_source_order", [ "javfree", "projectjav", "javstore" ])
                    }), n = e(), i = a.pan115Player, o = "115master" === f?.value ? "115master" : "official";
                    t.forEach(e => {
                        a[e.key] = r(_[e.key]);
                    }), a.defaultEngine = l.value, GM_setValue("default_search_engine", parseInt(u.value, 10) || 0), 
                    a.defaultVideoEngine = h.value || "missav", a.pan115Player = o, a.magnetTable = v.checked, 
                    a.btnShowNyaa = x.nyaa.checked, a.btnShowJavbus = x.javbus.checked, a.btnShowJavdb = x.javdb.checked, 
                    a.btnShowMissav = x.missav.checked, a.btnShowFanza = x.fanza.checked, a.btnShowSearch = x.search.checked, 
                    a.btnShowTrailer = x.trailer.checked, a.btnShowPreview = x.preview.checked, GM_setValue("thumb_source_order", k);
                    const s = i !== o, c = n !== e();
                    A(), c ? location.reload() : s && se.syncPan115(a.btnShowPan115);
                });
            }
        };
    })();
    l.expose("__LAOSIJI_OPEN_SETTINGS__", () => g.open()), GM_registerMenuCommand("⚙️ 老司机设置", () => g.open());
    const b = (() => {
        const e = {
            javbus: "JavBus",
            javdb: "JavDB",
            javlib: "JavLibrary"
        };
        return {
            open: function(t = null) {
                document.getElementById("jav-quick-settings-popover")?.remove(), "1" !== document.documentElement.dataset.laosijiQuickSettingsStyle && (document.documentElement.dataset.laosijiQuickSettingsStyle = "1", 
                GM_addStyle("\n                #jav-quick-settings-popover {\n                    position: fixed;\n                    z-index: 10000030;\n                    width: 286px;\n                    padding: 10px;\n                    border: 1px solid rgba(203,213,225,.85);\n                    border-radius: 10px;\n                    background: rgba(255,255,255,.985);\n                    color: #0f172a;\n                    box-shadow: 0 12px 28px rgba(15,23,42,.16);\n                    backdrop-filter: blur(6px);\n                    font-family: -apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif;\n                    box-sizing: border-box;\n                }\n                #jav-quick-settings-popover * { box-sizing: border-box; }\n                #jav-quick-settings-popover .qs-head {\n                    display: flex;\n                    align-items: center;\n                    justify-content: space-between;\n                    gap: 10px;\n                    margin-bottom: 8px;\n                }\n                #jav-quick-settings-popover .qs-title {\n                    font-size: 13px;\n                    font-weight: 800;\n                    color: #1e293b;\n                }\n                #jav-quick-settings-popover .qs-site {\n                    margin-top: 1px;\n                    font-size: 11px;\n                    font-weight: 650;\n                    color: #64748b;\n                }\n                #jav-quick-settings-popover .qs-close {\n                    width: 24px;\n                    height: 24px;\n                    border: 1px solid #cbd5e1;\n                    border-radius: 6px;\n                    background: #fff;\n                    color: #64748b;\n                    cursor: pointer;\n                    line-height: 1;\n                    font-size: 14px;\n                }\n                #jav-quick-settings-popover .qs-close:hover { color: #1d4ed8; border-color: #93c5fd; background: #eff6ff; }\n                #jav-quick-settings-popover .qs-row {\n                    display: grid;\n                    grid-template-columns: 72px 1fr 42px;\n                    align-items: center;\n                    gap: 9px;\n                    padding: 4px 0;\n                    border: 0;\n                    border-radius: 0;\n                    background: transparent;\n                }\n                #jav-quick-settings-popover .qs-row + .qs-row { margin-top: 4px; }\n                #jav-quick-settings-popover .qs-detail-flex {\n                    display: none;\n                    margin-top: 8px;\n                    padding-top: 7px;\n                    border-top: 1px solid #e2e8f0;\n                }\n                #jav-quick-settings-popover .qs-detail-flex.is-visible { display: block; }\n                #jav-quick-settings-popover .qs-section-title {\n                    margin-bottom: 3px;\n                    font-size: 12px;\n                    font-weight: 850;\n                    color: #1e293b;\n                }\n                #jav-quick-settings-popover .qs-row.is-disabled {\n                    opacity: .48;\n                }\n                #jav-quick-settings-popover .qs-row.is-disabled .qs-range {\n                    cursor: not-allowed;\n                    background: #e2e8f0;\n                }\n                #jav-quick-settings-popover .qs-row.is-disabled .qs-range::-webkit-slider-thumb {\n                    background: #94a3b8;\n                    cursor: not-allowed;\n                }\n                #jav-quick-settings-popover .qs-row.is-disabled .qs-range::-moz-range-thumb {\n                    background: #94a3b8;\n                    cursor: not-allowed;\n                }\n                #jav-quick-settings-popover .qs-switch-grid {\n                    display: grid;\n                    grid-template-columns: 1fr;\n                    gap: 6px;\n                    margin-top: 6px;\n                }\n                #jav-quick-settings-popover .qs-switch-row {\n                    display: flex;\n                    align-items: center;\n                    justify-content: space-between;\n                    gap: 8px;\n                    padding: 0;\n                    border: 0;\n                    border-radius: 0;\n                    background: transparent;\n                }\n                #jav-quick-settings-popover .qs-name {\n                    font-size: 12px;\n                    font-weight: 750;\n                    color: #334155;\n                    white-space: nowrap;\n                }\n                #jav-quick-settings-popover .qs-value {\n                    display: grid;\n                    place-items: center;\n                    min-width: 34px;\n                    height: 22px;\n                    border-radius: 999px;\n                    background: #fff;\n                    color: #1d4ed8;\n                    font-size: 12px;\n                    font-weight: 800;\n                    border: 1px solid #dbeafe;\n                }\n                #jav-quick-settings-popover .qs-range {\n                    -webkit-appearance: none;\n                    appearance: none;\n                    width: 100%;\n                    height: 5px;\n                    border-radius: 999px;\n                    background: linear-gradient(90deg,#93c5fd 0%,#dbeafe 100%);\n                    outline: none;\n                }\n                #jav-quick-settings-popover .qs-range::-webkit-slider-thumb {\n                    -webkit-appearance: none;\n                    appearance: none;\n                    width: 16px;\n                    height: 16px;\n                    border-radius: 50%;\n                    border: 2px solid #fff;\n                    background: #2563eb;\n                    box-shadow: 0 3px 8px rgba(37,99,235,.22);\n                    cursor: pointer;\n                }\n                #jav-quick-settings-popover .qs-range::-moz-range-thumb {\n                    width: 16px;\n                    height: 16px;\n                    border: none;\n                    border-radius: 50%;\n                    background: #2563eb;\n                    box-shadow: 0 3px 8px rgba(37,99,235,.22);\n                    cursor: pointer;\n                }\n                #jav-quick-settings-popover .qs-toggle {\n                    position: relative;\n                    display: inline-block;\n                    width: 36px;\n                    height: 20px;\n                    flex: 0 0 auto;\n                }\n                #jav-quick-settings-popover .qs-toggle input {\n                    opacity: 0;\n                    width: 0;\n                    height: 0;\n                }\n                #jav-quick-settings-popover .qs-toggle-track {\n                    position: absolute;\n                    inset: 0;\n                    border-radius: 999px;\n                    background: #cbd5e1;\n                    cursor: pointer;\n                    transition: background .18s;\n                }\n                #jav-quick-settings-popover .qs-toggle-track::before {\n                    content: '';\n                    position: absolute;\n                    width: 14px;\n                    height: 14px;\n                    left: 3px;\n                    top: 3px;\n                    border-radius: 50%;\n                    background: #fff;\n                    box-shadow: 0 1px 3px rgba(15,23,42,.22);\n                    transition: transform .18s;\n                }\n                #jav-quick-settings-popover .qs-toggle input:checked + .qs-toggle-track {\n                    background: #2563eb;\n                }\n                #jav-quick-settings-popover .qs-toggle input:checked + .qs-toggle-track::before {\n                    transform: translateX(14px);\n                }\n                #jav-quick-settings-popover .qs-footer {\n                    display: flex;\n                    justify-content: flex-end;\n                    gap: 8px;\n                    margin-top: 8px;\n                    padding-top: 8px;\n                    border-top: 1px solid #e2e8f0;\n                }\n                #jav-quick-settings-popover .qs-more {\n                    height: 28px;\n                    padding: 0 12px;\n                    border: 1px solid #c7d2fe;\n                    border-radius: 7px;\n                    background: #eef2ff;\n                    color: #4338ca;\n                    font-size: 11px;\n                    font-weight: 800;\n                    cursor: pointer;\n                }\n                #jav-quick-settings-popover .qs-more:hover { background: #e0e7ff; border-color: #a5b4fc; }\n            "));
                const n = i.detectCurrentSite() || r.detectCurrentSite();
                if (!n) return void g.open();
                const s = document.createElement("div");
                s.id = "jav-quick-settings-popover", s.innerHTML = `\n                <div class="qs-head">\n                    <div>\n                        <div class="qs-title">快捷设置</div>\n                        <div class="qs-site">${e[n] || "当前站点"}</div>\n                    </div>\n                    <button class="qs-close" type="button" title="关闭">×</button>\n                </div>\n                <div class="qs-row">\n                    <div class="qs-name">卡片列数</div>\n                    <input class="qs-range" id="qs-columns" type="range" min="2" max="10" step="1">\n                    <span class="qs-value" id="qs-columns-value">5</span>\n                </div>\n                <div class="qs-row">\n                    <div class="qs-name">页面宽度</div>\n                    <input class="qs-range" id="qs-zoom" type="range" min="60" max="100" step="1">\n                    <span class="qs-value" id="qs-zoom-value">100%</span>\n                </div>\n                <div class="qs-detail-flex" id="qs-detail-flex">\n                    <div class="qs-section-title">详情比例</div>\n                    <div class="qs-row" data-detail-flex-row="cover">\n                        <div class="qs-name">封面</div>\n                        <input class="qs-range" id="qs-detail-cover" type="range" min="50" max="200" step="5">\n                        <span class="qs-value" id="qs-detail-cover-value">1.0</span>\n                    </div>\n                    <div class="qs-row" data-detail-flex-row="info">\n                        <div class="qs-name">信息</div>\n                        <input class="qs-range" id="qs-detail-info" type="range" min="50" max="200" step="5">\n                        <span class="qs-value" id="qs-detail-info-value">1.0</span>\n                    </div>\n                    <div class="qs-row" data-detail-flex-row="magnet">\n                        <div class="qs-name">磁力</div>\n                        <input class="qs-range" id="qs-detail-magnet" type="range" min="50" max="200" step="5">\n                        <span class="qs-value" id="qs-detail-magnet-value">关闭</span>\n                    </div>\n                </div>\n                <div class="qs-switch-grid">\n                    <div class="qs-switch-row">\n                        <div class="qs-name">115匹配</div>\n                        <label class="qs-toggle">\n                            <input id="qs-pan115" type="checkbox">\n                            <span class="qs-toggle-track"></span>\n                        </label>\n                    </div>\n                    <div class="qs-switch-row">\n                        <div class="qs-name">瀑布流</div>\n                        <label class="qs-toggle">\n                            <input id="qs-infinite-scroll" type="checkbox">\n                            <span class="qs-toggle-track"></span>\n                        </label>\n                    </div>\n                    <div class="qs-switch-row">\n                        <div class="qs-name">翻译标题</div>\n                        <label class="qs-toggle">\n                            <input id="qs-title-translate" type="checkbox">\n                            <span class="qs-toggle-track"></span>\n                        </label>\n                    </div>\n                    <div class="qs-switch-row">\n                        <div class="qs-name">新标签打开页面</div>\n                        <label class="qs-toggle">\n                            <input id="qs-list-open-new-tab" type="checkbox">\n                            <span class="qs-toggle-track"></span>\n                        </label>\n                    </div>\n                    <div class="qs-switch-row">\n                        <div class="qs-name">快捷预览图</div>\n                        <label class="qs-toggle">\n                            <input id="qs-list-preview" type="checkbox">\n                            <span class="qs-toggle-track"></span>\n                        </label>\n                    </div>\n                    <div class="qs-switch-row">\n                        <div class="qs-name">预览图直显</div>\n                        <label class="qs-toggle">\n                            <input id="qs-detail-preview-inline" type="checkbox">\n                            <span class="qs-toggle-track"></span>\n                        </label>\n                    </div>\n                </div>\n                <div class="qs-footer">\n                    <button class="qs-more" type="button">更多设置</button>\n                </div>\n            `, 
                document.body.appendChild(s);
                const l = () => s.remove(), c = s.querySelector("#qs-columns"), p = s.querySelector("#qs-columns-value"), m = s.querySelector("#qs-zoom"), u = s.querySelector("#qs-zoom-value"), h = s.querySelector("#qs-pan115"), v = s.querySelector("#qs-infinite-scroll"), b = s.querySelector("#qs-list-preview"), f = s.querySelector("#qs-detail-preview-inline"), x = s.querySelector("#qs-title-translate"), y = s.querySelector("#qs-list-open-new-tab"), w = o.detectCurrentSite(), j = s.querySelector("#qs-detail-flex"), _ = {
                    cover: s.querySelector("#qs-detail-cover"),
                    info: s.querySelector("#qs-detail-info"),
                    magnet: s.querySelector("#qs-detail-magnet")
                }, k = {
                    cover: s.querySelector("#qs-detail-cover-value"),
                    info: s.querySelector("#qs-detail-info-value"),
                    magnet: s.querySelector("#qs-detail-magnet-value")
                }, S = e => (o.clamp(e) / 100).toFixed(2).replace(/\.?0+$/, ""), C = () => {
                    const e = w && o.hasMagnet(w), t = s.querySelector('[data-detail-flex-row="magnet"]');
                    return t && t.classList.toggle("is-disabled", !e), _.magnet && (_.magnet.disabled = !e), 
                    k.magnet && !e && (k.magnet.textContent = a.magnetTable ? "未渲染" : "关闭"), e;
                };
                if (d.bindRange(c, p, i.get(n), e => String(i.clamp(e)), e => {
                    const t = i.clamp(e);
                    i.set(n, t), i.apply(n, t);
                }), d.bindRange(m, u, r.get(n), e => `${r.clamp(e)}%`, e => {
                    const t = r.clamp(e);
                    r.set(n, t), r.apply(n, t);
                }), w && o.hasLayout(w)) {
                    const e = o.get(w);
                    j?.classList.add("is-visible"), Object.entries(_).forEach(([t, n]) => {
                        const a = k[t];
                        n && a && d.bindRange(n, a, e[t], S, e => {
                            if (!("magnet" !== t || C())) return;
                            const n = o.clamp(e);
                            a.textContent = S(n), o.set(w, t, n), o.apply(w);
                        });
                    }), C();
                }
                d.bindCheckbox(h, a.btnShowPan115, e => {
                    a.btnShowPan115 = e, se.syncPan115(e);
                }), d.bindCheckbox(v, a.infiniteScroll, e => {
                    a.infiniteScroll = e, se.syncInfiniteScroll(e);
                }), d.bindCheckbox(b, a.listPreviewQuick, e => {
                    a.listPreviewQuick = e, se.syncListPreview();
                }), d.bindCheckbox(f, a.detailPreviewInline, e => {
                    a.detailPreviewInline = e, se.syncDetailPreview();
                }), d.bindCheckbox(x, a.titleTranslate, e => {
                    a.titleTranslate = e, se.syncTitleTranslate();
                }), d.bindCheckbox(y, a.listOpenNewTab, e => {
                    a.listOpenNewTab = e, se.syncListOpenNewTab();
                }), d.click(s.querySelector(".qs-close"), l), d.click(s.querySelector(".qs-more"), () => {
                    l(), g.open();
                }), s.addEventListener("click", e => e.stopPropagation()), setTimeout(() => {
                    const e = t => {
                        s.contains(t.target) || (l(), document.removeEventListener("click", e, !0));
                    };
                    document.addEventListener("click", e, !0);
                }, 0), function(e, t) {
                    const n = t?.getBoundingClientRect?.(), a = e.offsetWidth || 286, i = e.offsetHeight || 150;
                    let r = n ? n.right - a : window.innerWidth - a - 18, o = n ? n.bottom + 8 : 64;
                    r = Math.max(10, Math.min(r, window.innerWidth - a - 10)), o = Math.max(10, Math.min(o, window.innerHeight - i - 10)), 
                    e.style.left = `${r}px`, e.style.top = `${o}px`;
                }(s, t);
            }
        };
    })();
    l.expose("__LAOSIJI_OPEN_QUICK_SETTINGS__", e => b.open(e));
    const f = (() => {
        const e = {
            getAll: () => ({
                [a.javdbSearchUrl]: v,
                [a.ciligouUrl]: x,
                [a.btdigUrl]: y,
                [a.btsearchUrl]: _,
                [a.sukebeiUrl]: k,
                [a.sokittyUrl]: S
            }),
            getCurrent() {
                const e = this.getAll(), t = a.defaultEngine;
                return e[t] ? {
                    key: t,
                    fn: e[t]
                } : {
                    key: Object.keys(e)[0],
                    fn: Object.values(e)[0]
                };
            }
        }, t = "https://jdforrepam.com/api", n = "71cf27bb3c0bcdf207b64abecddc970098c7421ee7203b9cdae54478478a199e7d5a6e1a57691123c1a931c057842fb73ba3b3c83bcd69c17ccf174081e3d8aa";
        let i = {
            ts: 0,
            sign: ""
        };
        function r(e) {
            const t = (new TextEncoder).encode(e), n = t.length, a = 1 + (n + 8 >> 6), i = new Uint32Array(16 * a), r = [], o = [ 7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21 ];
            for (let e = 0; e < 64; e++) r[e] = Math.floor(2 ** 32 * Math.abs(Math.sin(e + 1)));
            for (let e = 0; e < n; e++) i[e >> 2] |= t[e] << (e % 4 << 3);
            i[n >> 2] |= 128 << (n % 4 << 3), i[16 * a - 2] = 8 * n;
            let [s, l, c, d] = [ 1732584193, 4023233417, 2562383102, 271733878 ];
            for (let e = 0; e < a; e++) {
                const t = i.slice(16 * e, 16 * (e + 1));
                let [n, a, p, m] = [ s, l, c, d ];
                for (let e = 0; e < 64; e++) {
                    const i = Math.floor(e / 16), s = [ e, (5 * e + 1) % 16, (3 * e + 5) % 16, 7 * e % 16 ][i], l = n + [ a & p | ~a & m, m & a | ~m & p, a ^ p ^ m, p ^ (a | ~m) ][i] + r[e] + t[s] | 0, c = o[i << 2 | e % 4], d = m;
                    m = p, p = a, a = a + (l << c | l >>> 32 - c) | 0, n = d;
                }
                s = s + n | 0, l = l + a | 0, c = c + p | 0, d = d + m | 0;
            }
            return [ s, l, c, d ].map(e => new Uint32Array([ e ])).map(e => new Uint8Array(e.buffer)).map(e => Array.from(e, e => e.toString(16).padStart(2, "0")).join("")).join("");
        }
        function o() {
            const e = Math.floor(Date.now() / 1e3);
            return i.sign && e - i.ts <= 20 || (i = {
                ts: e,
                sign: `${e}.lpw6vgqzsp.${r(`${e}${n}`)}`
            }), i.sign;
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
        function d(e) {
            return String(e || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
        }
        async function h(e, {limit: n = 5, fallbackFirst: a = !1} = {}) {
            const i = {
                accept: "application/json",
                jdSignature: o()
            }, r = new URLSearchParams({
                q: e,
                page: "1",
                type: "movie",
                limit: String(n),
                movie_type: "all",
                from_recent: "false",
                movie_filter_by: "all",
                movie_sort_by: "relevance"
            }), s = await u(`${t}/v2/search?${r.toString()}`, {
                headers: i,
                timeout: 2e4
            });
            if (!s.loadstuts || s.status < 200 || s.status >= 400) return null;
            const c = l(s.responseText), p = Array.isArray(c?.data?.movies) ? c.data.movies : [], m = d(e);
            return p.find(e => {
                const t = d(e?.number);
                return t && t === m;
            }) || (a ? p[0] : null) || null;
        }
        async function v(e) {
            const n = "https://" + a.javdbSearchUrl, i = await h(e, {
                limit: 5,
                fallbackFirst: !0
            });
            if (!i?.id) return {
                url: n,
                data: []
            };
            const r = `${n}/v/${i.id}`, s = `${t}/v1/movies/${encodeURIComponent(i.id)}/magnets`, d = await u(s, {
                headers: {
                    accept: "application/json",
                    jdSignature: o()
                }
            });
            if (!d.loadstuts || d.status < 200 || d.status >= 400) return {
                url: r,
                data: []
            };
            const p = l(d.responseText), m = (Array.isArray(p?.data?.magnets) ? p.data.magnets : []).map(t => {
                const n = String(t?.hash || "").trim();
                if (!n) return null;
                return {
                    title: [ String(t?.name || i.number || e).trim(), t?.cnsub ? "-CH" : "", t?.hd ? "HD" : "", t?.files_count ? `${t.files_count} files` : "", t?.created_at || "" ].filter(Boolean).join(" "),
                    maglink: `magnet:?xt=urn:btih:${n}`,
                    size: c(t?.size),
                    src: r,
                    cnsub: Boolean(t?.cnsub),
                    hd: Boolean(t?.hd)
                };
            }).filter(Boolean);
            return {
                url: r,
                data: m
            };
        }
        function g() {
            return localStorage.getItem("jhs_appAuthorization") || localStorage.getItem("javdb_appAuthorization") || GM_getValue("javdb_app_authorization", "");
        }
        async function b(e, n = {}, a = {}) {
            const i = new URLSearchParams(n).toString(), r = `${t}${e}${i ? `?${i}` : ""}`, s = await u(r, {
                headers: {
                    accept: "application/json",
                    "accept-language": "zh-TW",
                    "user-agent": "Dart/3.5 (dart:io)",
                    jdSignature: o(),
                    ...a
                },
                timeout: 2e4
            });
            if (!s.loadstuts || s.status < 200 || s.status >= 400) throw new Error(`JavDB API 请求失败: HTTP ${s.status || 0}`);
            const c = l(s.responseText);
            if (!c) throw new Error("JavDB API 返回异常");
            return c;
        }
        const f = {
            token: g,
            async top250({category: e = "all", year: t = "", page: n = 1, limit: a = 50} = {}) {
                const i = {
                    start_rank: 1,
                    ignore_watched: "false",
                    page: n,
                    limit: a
                };
                return e && "all" !== e ? (i.type = "video_type", i.type_value = e, t && (i.year = t)) : t ? (i.type = "year", 
                i.type_value = t) : (i.type = "all", i.type_value = ""), b("/v1/movies/top", i, function() {
                    const e = g();
                    return e ? {
                        authorization: /^bearer\s+/i.test(e) ? e : `Bearer ${e}`
                    } : {};
                }());
            },
            async fc2({period: e = "daily", page: t = 1, limit: n = 40} = {}) {
                const a = await b("/v1/rankings", {
                    period: e,
                    type: "3"
                });
                if (1 !== a.success) return a;
                const i = Array.isArray(a?.data?.movies) ? a.data.movies : [], r = (Math.max(1, parseInt(t, 10) || 1) - 1) * n, o = i.slice(r, r + n);
                return {
                    success: 1,
                    data: {
                        movies: o,
                        total: o.length
                    }
                };
            },
            async playback({period: e = "daily", filterBy: t = "high_score", page: n = 1, limit: a = 40} = {}) {
                const i = await b("/v1/rankings/playback", {
                    period: e,
                    filter_by: t
                });
                if (1 !== i.success) return i;
                const r = Array.isArray(i?.data?.movies) ? i.data.movies : [], o = (Math.max(1, parseInt(n, 10) || 1) - 1) * a;
                return {
                    success: 1,
                    data: {
                        movies: r.slice(o, o + a),
                        total: r.length
                    }
                };
            },
            movieDetail: async e => b(`/v4/movies/${encodeURIComponent(e)}`),
            searchMovieByNumber: async (e, t = {}) => h(e, t),
            movieMagnets: async e => b(`/v1/movies/${encodeURIComponent(e)}/magnets`),
            movieReviews: async (e, {page: t = 1, limit: n = 20, sortBy: a = "hotly"} = {}) => b(`/v1/movies/${encodeURIComponent(e)}/reviews`, {
                page: t,
                limit: n,
                sort_by: a
            }),
            relatedLists: async (e, {page: t = 1, limit: n = 20} = {}) => b("/v1/lists/related", {
                movie_id: e,
                page: t,
                limit: n
            })
        };
        async function x(e) {
            const t = "https://" + a.ciligouUrl, n = btoa(unescape(encodeURIComponent(e))).replace(/=+$/, ""), i = `${t}/search?word=${n}`, r = await u(i, {
                headers: {
                    Referer: t + "/",
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
                }
            });
            if (!r.loadstuts) return {
                url: i,
                data: []
            };
            const o = m(r.responseText), s = [];
            return o.querySelectorAll("#Search_list_wrapper li").forEach(e => {
                const n = e.querySelector("a.SearchListTitle_result_title");
                if (!n) return;
                const a = n.getAttribute("href") || "", i = a.split("/").pop();
                if (!i) return;
                const r = `magnet:?xt=urn:btih:${i}`, o = t + a, l = n.textContent.trim(), c = (e.querySelector(".Search_list_info")?.textContent || "").match(/文件大小：([^\s]+)/), d = c ? c[1] : "";
                s.push({
                    title: l,
                    maglink: r,
                    size: d,
                    src: o
                });
            }), {
                url: i,
                data: s
            };
        }
        async function y(e) {
            const t = "https://" + a.btdigUrl, n = await u(`${t}/search?q=${e}`);
            if (!n.loadstuts) return {
                url: t,
                data: []
            };
            const i = [ ...m(n.responseText).querySelectorAll("div.one_result") ].map(e => ({
                title: e.querySelector(".torrent_name a")?.textContent?.trim() || "",
                maglink: e.querySelector(".fa.fa-magnet a")?.href || "",
                size: e.querySelector(".torrent_size")?.textContent?.trim() || "",
                src: e.querySelector(".torrent_name a")?.href || ""
            }));
            return {
                url: n.finalUrl || t,
                data: i
            };
        }
        function w(e, t, n, a) {
            const i = function(e) {
                const t = String(e || "").trim();
                if (!t) return "";
                if (!/[<&]/.test(t)) return t.replace(/\s+/g, " ");
                const n = m(`<body>${t}</body>`);
                return (n.body?.textContent || t.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
            }(e?.name), r = String(e?.hash || "").replace(/^magnet:\?xt=urn:btih:/i, "").replace(/[^a-z0-9]/gi, "");
            if (!/^[a-f0-9]{32,40}$/i.test(r)) return null;
            const o = `magnet:?xt=urn:btih:${r}`;
            return {
                title: i || o,
                maglink: o,
                size: C(e?.size),
                src: e?.id ? `${t}/torrent/${encodeURIComponent(e.id)}?keyword=${encodeURIComponent(a)}` : n
            };
        }
        function j(e, t) {
            const n = Math.floor(Date.now() / 1e3).toString(), a = function(e = 8) {
                const t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                let n = "";
                for (let a = 0; a < e; a++) n += t.charAt(Math.floor(62 * Math.random()));
                return n;
            }(), i = [ `timestamp=${n}`, `nonce=${a}` ];
            Object.keys(e).forEach(t => i.push(`${t}=${e[t]}`));
            return {
                Accept: "application/json, text/plain, */*",
                Referer: t,
                "x-timestamp": n,
                "x-nonce": a,
                "x-sign": r(`${i.sort().join("&")}&key=long2ice`).toUpperCase()
            };
        }
        async function _(e) {
            const t = "https://" + a.btsearchUrl, n = `${t}/search?keyword=${encodeURIComponent(e)}`, i = {
                keyword: e,
                limit: "10",
                offset: "0",
                mode: "",
                time: "",
                sort: "size",
                sort_type: "desc",
                size: ""
            }, r = `${t}/api/search?${new URLSearchParams(i).toString()}`, o = await u(r, {
                headers: j(i, n)
            });
            if (!o.loadstuts || o.status < 200 || o.status >= 400) return {
                url: n,
                data: []
            };
            const s = function(e) {
                return Array.isArray(e?.data) ? e.data : Array.isArray(e?.data?.data) ? e.data.data : [];
            }(l(o.responseText)).map(a => w(a, t, n, e)).filter(Boolean);
            return {
                url: n,
                data: s
            };
        }
        async function k(e) {
            const t = "https://" + a.sukebeiUrl, n = await u(`${t}/?f=0&c=0_0&q=${e}`);
            if (!n.loadstuts) return {
                url: t,
                data: []
            };
            const i = [ ...m(n.responseText).querySelectorAll("tr.default, tr.success") ].map(e => ({
                title: e.querySelector("td:nth-child(2)>a:nth-child(1)")?.title || "",
                maglink: e.querySelector("td:nth-child(3)>a:last-child")?.href || "",
                size: e.querySelector("td:nth-child(4)")?.textContent?.trim() || "",
                src: t + (e.querySelector("td:nth-child(2)>a:nth-child(1)")?.getAttribute("href") || "")
            }));
            return {
                url: n.finalUrl || t,
                data: i
            };
        }
        async function S(e) {
            const t = "https://" + a.sokittyUrl, n = `${t}/search?key=${encodeURIComponent(e)}`, i = await u(n, {
                headers: {
                    Referer: t + "/"
                }
            });
            if (!i.loadstuts) return {
                url: n,
                data: []
            };
            const r = m(i.responseText), o = e => e.toUpperCase().replace(/[-_\s]/g, ""), s = o(e), l = [];
            return r.querySelectorAll(".panel.search-panel").forEach(e => {
                const n = e.querySelector("h3.panel-title > a.list-title");
                if (!n) return;
                const a = n.getAttribute("href") || "";
                if (!a.startsWith("/bt/")) return;
                const i = a.replace("/bt/", "");
                if (!i) return;
                const r = n.textContent.trim();
                if (!o(r).includes(s)) return;
                const c = `magnet:?xt=urn:btih:${i}`, d = t + a, p = e.querySelector(".panel-footer .info-item")?.textContent?.trim() || "";
                l.push({
                    title: r,
                    maglink: c,
                    size: p,
                    src: d
                });
            }), {
                url: n,
                data: l
            };
        }
        function C(e) {
            const t = Number(e) || 0;
            if (!t) return "-";
            const n = [ "B", "KB", "MB", "GB", "TB" ];
            let a = t, i = 0;
            for (;a >= 1024 && i < n.length - 1; ) a /= 1024, i += 1;
            return `${a.toFixed(i >= 3 ? 2 : 1)} ${n[i]}`;
        }
        function E(e, t) {
            document.querySelector(".whatslink-overlay")?.remove();
            const n = Array.isArray(e?.screenshots) ? e.screenshots.map(e => e?.screenshot).filter(Boolean) : [];
            let a = 0;
            const i = function(e) {
                const t = String(e?.file_type || e?.type || "").toUpperCase();
                return t.includes("FOLDER") ? "文件夹" : t.includes("FILE") ? "文件" : "-";
            }(e), r = document.createElement("div");
            r.className = "whatslink-overlay";
            const o = document.createElement("section");
            o.className = "whatslink-modal" + (n.length ? "" : " no-shots"), o.innerHTML = `\n                <div class="whatslink-viewer">\n                    <div class="whatslink-stage">\n                        <button class="whatslink-nav whatslink-prev" type="button">‹</button>\n                        <img class="whatslink-hero" alt="截图预览">\n                        <button class="whatslink-nav whatslink-next" type="button">›</button>\n                        <div class="whatslink-counter"></div>\n                        <div class="whatslink-empty">\n                            <div class="whatslink-empty-icon">?</div>\n                            <div class="whatslink-empty-title">暂无截图</div>\n                            <p class="whatslink-empty-text">WhatsLink 已返回资源基础信息，但没有可展示的截图。可以通过名称、大小和文件数量先做基础判断。</p>\n                        </div>\n                    </div>\n                    <div class="whatslink-thumbs"></div>\n                </div>\n                <aside class="whatslink-info">\n                    <div class="whatslink-head">\n                        <div>\n                            <div class="whatslink-kicker">磁力验车</div>\n                            <h2 class="whatslink-title"></h2>\n                            <span class="whatslink-tag"></span>\n                        </div>\n                        <button class="whatslink-close" type="button">×</button>\n                    </div>\n                    <div class="whatslink-meta">\n                        <div class="whatslink-metric"><b>${C(e?.size)}</b><span>资源大小</span></div>\n                        <div class="whatslink-metric"><b>${e?.count ?? "-"}</b><span>文件数量</span></div>\n                        <div class="whatslink-metric"><b>${i}</b><span>资源结构</span></div>\n                        <div class="whatslink-metric"><b>${n.length}</b><span>截图数量</span></div>\n                        <div class="whatslink-metric"><b>${e?.error ? "异常" : "无错误"}</b><span>接口状态</span></div>\n                    </div>\n                    <div class="whatslink-section">\n                        <h3>磁力链接</h3>\n                        <div class="whatslink-magnet"></div>\n                    </div>\n                    <div class="whatslink-summary">\n                        <div class="whatslink-summary-card"><strong>验车结论</strong><p>${n.length ? "WhatsLink 已返回截图，优先用左侧大图确认内容是否匹配番号。" : "当前没有截图，建议结合资源名称、大小和文件数量判断。"}</p></div>\n                    </div>\n                </aside>`, 
            r.appendChild(o), document.body.appendChild(r), o.querySelector(".whatslink-title").textContent = e?.name || "未知资源", 
            o.querySelector(".whatslink-tag").textContent = i, o.querySelector(".whatslink-magnet").textContent = t;
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
            const p = () => r.remove();
            o.querySelector(".whatslink-close").addEventListener("click", p), r.addEventListener("click", e => {
                e.target === r && p();
            }), d();
        }
        function q(t) {
            const n = document.createElement("table");
            n.id = "jav-nong-table", n.dataset.avid = t;
            const i = document.createElement("tr");
            i.className = "nong-head-row";
            const r = document.createElement("th");
            r.style.textAlign = "left";
            const o = e.getAll(), s = a.defaultEngine, l = document.createElement("select");
            l.style.cssText = "height:22px;font-size:12px;border:1px solid #cbd5e1;border-radius:6px;padding:1px 22px 1px 6px;min-width:84px;background:#fff;color:#172033;font-weight:650;";
            const c = {
                [a.javdbSearchUrl]: "JavDB",
                [a.ciligouUrl]: "CiliGou",
                [a.btdigUrl]: "BtDig",
                [a.btsearchUrl]: "BTSearch",
                [a.sukebeiUrl]: "Sukebei",
                [a.sokittyUrl]: "SoKitty"
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
                L(n, t, l.value), requestAnimationFrame(d);
            }), r.appendChild(l), i.appendChild(r), [ "大小", "操作", "115" ].forEach(e => {
                const t = document.createElement("th");
                t.textContent = e, "115" === e && (t.className = "nong-115-head"), i.appendChild(t);
            }), n.appendChild(i);
            const p = document.createElement("tr"), m = document.createElement("td");
            m.colSpan = 4, m.id = "jav-nong-notice";
            const u = document.createTextNode("Loading…"), h = document.createElement("a");
            return h.id = "jav-nong-refresh", h.href = "#", h.textContent = "🔄 刷新", h.title = "网络加载失败，点击重试", 
            h.addEventListener("click", e => {
                e.preventDefault(), L(n, t, l.value);
            }), m.appendChild(u), m.appendChild(h), p.appendChild(m), n.appendChild(p), n;
        }
        function A(e, t, n) {
            const i = e => {
                if (!e) return 0;
                const t = e.replace(/,/g, "").match(/([\d.]+)\s*(GiB|MiB|KiB|GB|MB|KB|B)?/i);
                if (!t) return 0;
                return parseFloat(t[1]) * ({
                    GIB: 1073741824,
                    MIB: 1048576,
                    KIB: 1024,
                    GB: 1073741824,
                    MB: 1048576,
                    KB: 1024,
                    B: 1
                }[(t[2] || "B").toUpperCase()] || 1);
            };
            t = [ ...t ].sort((e, t) => i(t.size) - i(e.size));
            const r = e.querySelector("#jav-nong-notice");
            if (r && r.parentElement.remove(), !t.length) {
                const t = document.createElement("tr"), i = document.createElement("td");
                i.colSpan = 4, i.innerHTML = `无搜索结果 <a href="${n}" target="_blank" style="color:red">前往查看</a>`;
                const r = document.createElement("a");
                return r.href = "#", r.textContent = " 🔄 刷新", r.style.cssText = "margin-left:8px;color:#e74c3c;font-weight:bold;cursor:pointer;", 
                r.addEventListener("click", t => {
                    t.preventDefault();
                    const n = e.querySelector("select")?.value || a.defaultEngine;
                    L(e, e.dataset.avid || "", n);
                }), i.appendChild(r), t.appendChild(i), void e.appendChild(t);
            }
            t.forEach(t => {
                const n = document.createElement("tr");
                n.setAttribute("data-maglink", t.maglink);
                const a = document.createElement("td"), i = document.createElement("span");
                i.className = "nong-magnet-name", i.title = t.title;
                const r = /[\u4e00-\u9fff]/.test(t.title), o = /[\u3040-\u309f\u30a0-\u30ff]/.test(t.title), s = /(?:[^A-Za-z]|^)FHDC(?:[^A-Za-z]|$)/i.test(t.title) || /[-_]CH?(?:[^A-Za-z]|$)/.test(t.title) || /中字/.test(t.title) || /中文/.test(t.title) || /自提/.test(t.title) || /征用/.test(t.title) || r && !o, l = /(?:[^A-Za-z0-9]|^)4K(?:UHD)?(?:[^A-Za-z0-9]|$)/i.test(t.title);
                if (s) {
                    const e = document.createElement("span");
                    e.textContent = "[中字]", e.style.cssText = "display:inline-block;margin-right:5px;padding:1px 5px;font-size:11px;font-weight:800;color:#fff;background:#16a34a;border-radius:4px;vertical-align:middle;flex-shrink:0;box-shadow:0 0 0 1px rgba(22,163,74,.18);", 
                    i.appendChild(e), i.style.background = "linear-gradient(90deg,#dcfce7 0%,#f0fdf4 55%,#fff 100%)", 
                    i.style.borderLeft = "4px solid #16a34a", i.style.paddingLeft = "5px";
                }
                if (l) {
                    const e = document.createElement("span");
                    e.textContent = "[4K]", e.style.cssText = "display:inline-block;margin-right:5px;padding:1px 5px;font-size:11px;font-weight:800;color:#fff;background:#2563eb;border-radius:4px;vertical-align:middle;flex-shrink:0;box-shadow:0 0 0 1px rgba(37,99,235,.18);", 
                    i.insertBefore(e, i.firstChild), s || (i.style.background = "linear-gradient(90deg,#dbeafe 0%,#eff6ff 55%,#fff 100%)", 
                    i.style.borderLeft = "4px solid #2563eb", i.style.paddingLeft = "5px");
                }
                const c = document.createElement("a");
                c.href = t.src || t.maglink, c.target = "_blank", c.textContent = t.title, i.appendChild(c), 
                a.appendChild(i), n.appendChild(a);
                const d = document.createElement("td");
                d.style.whiteSpace = "nowrap", d.textContent = t.size, n.appendChild(d);
                const m = document.createElement("td");
                m.style.whiteSpace = "nowrap";
                const h = document.createElement("a"), v = t.maglink.substring(0, 60), g = e => {
                    if (!e) return null;
                    const t = [ /FC2[-\s_]?(?:PPV)?[-\s_]?(\d{6,9})/i, /([A-Z]{2,15})-(\d{2,10})(?:-(\d+))?/i, /([A-Z]{2,15})-([A-Z]{0,2}\d{2,10})/i, /^[A-Z0-9]+[-_](\d{6}[-_]\d{2,3})/i, /(\d{6}[-_]\d{2,3})[-_][A-Z0-9]+$/i, /(?<!\w)(\d{6}[-_]\d{2,3})(?!\w)/, /([A-Z]{1,2})(\d{3,4})/i ];
                    for (const n of t) {
                        const t = e.match(n);
                        if (t) return t[0].toUpperCase();
                    }
                    return null;
                }, b = g(t.title) || g(t.maglink), f = v + (b ? `&dn=${encodeURIComponent(b)}` : "");
                h.href = v, h.title = v, h.className = "nong-copy", h.textContent = "复制", h.addEventListener("click", e => {
                    e.preventDefault(), GM_setClipboard(f), h.textContent = "✓", setTimeout(() => {
                        h.textContent = "复制";
                    }, 1e3);
                }), m.appendChild(h);
                const x = document.createElement("a");
                x.href = "#", x.className = "nong-check", x.textContent = "验车", x.addEventListener("click", e => {
                    e.preventDefault(), async function(e) {
                        document.querySelector(".whatslink-overlay")?.remove();
                        const t = document.createElement("div");
                        t.className = "whatslink-overlay", t.innerHTML = '<div class="whatslink-modal no-shots"><div class="whatslink-loading">正在验车...</div></div>', 
                        document.body.appendChild(t);
                        try {
                            const n = `https://whatslink.info/api/v1/link?url=${encodeURIComponent(e)}`, a = await u(n, {
                                timeout: 2e4
                            });
                            if (!a.loadstuts) throw new Error("WhatsLink 请求失败");
                            const i = JSON.parse(a.responseText || "{}");
                            t.remove(), E(i, e);
                        } catch (n) {
                            t.remove(), E({
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
                }), m.appendChild(x), n.appendChild(m);
                const y = document.createElement("td");
                y.className = "nong-115-cell";
                const w = document.createElement("a");
                w.href = "#", w.className = "nong-offline-115", w.textContent = "115", w.addEventListener("click", e => {
                    e.preventDefault(), async function(e) {
                        e = e.substring(0, 60);
                        const t = await u(`http://115.com/?ct=offline&ac=space&_=${Date.now()}`);
                        if (!t.loadstuts) return void p("115 错误", "无法获取token，请检查115是否已登录", "http://115.com/?mode=login");
                        if (t.responseText.includes("html")) return void p("115 未登录", "请先登录115账户后再离线下载", "http://115.com/?mode=login");
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
                                    n.state ? p("115 离线成功", "任务已添加", "http://115.com/?tab=offline&mode=wangpan") : p("115 离线失败", "911" === n.errcode ? "账号使用异常，请手工验证" : n.error_msg || "未知错误", "http://115.com/?tab=offline&mode=wangpan"), 
                                    t();
                                }
                            });
                        });
                    }(t.maglink);
                }), y.appendChild(w), n.appendChild(y), e.appendChild(n);
            });
        }
        async function L(t, n, a) {
            [ ...t.querySelectorAll("tr:not(.nong-head-row)") ].forEach(e => e.remove());
            const i = document.createElement("tr"), r = document.createElement("td");
            r.colSpan = 4, r.id = "jav-nong-notice";
            const o = document.createTextNode("Loading…"), l = t.querySelector("#jav-nong-refresh") || document.createElement("a");
            l.id = "jav-nong-refresh", l.href = "#", l.textContent = "🔄 刷新", l.style.cssText = "display:none;margin-left:8px;color:#e74c3c;font-weight:bold;cursor:pointer;", 
            l.onclick = e => {
                e.preventDefault(), L(t, n, a);
            }, r.appendChild(o), r.appendChild(l), i.appendChild(r), t.appendChild(i);
            let c = !1;
            const d = setTimeout(() => {
                c = !0, o.textContent = "加载超时 ", l.style.display = "inline";
            }, 8e3);
            try {
                const i = e.getAll(), r = i[a] || Object.values(i)[0], {url: o, data: s} = await r(n);
                if (clearTimeout(d), c) return;
                A(t, s, o);
            } catch (e) {
                clearTimeout(d), s("磁力搜索出错:", e), o.textContent = "搜索出错 ", l.style.display = "inline";
            }
        }
        return GM_addStyle('\n            .jav-nong-wrapper {\n                overflow-x: auto !important;\n                overflow-y: hidden !important;\n                scrollbar-width: thin;\n            }\n            #jav-nong-table {\n                width: 100%;\n                min-width: 320px;\n                table-layout: fixed;\n                margin: 8px 0; color: #666;\n                font-size: 13px; text-align: center;\n                background: #f2f2f2; border-collapse: collapse;\n                max-width: 100%;\n            }\n            #jav-nong-table th, #jav-nong-table td {\n                text-align: center; height: 30px;\n                background: #fff; padding: 0 6px;\n                border: 1px solid #efefef;\n                overflow: hidden;\n                text-overflow: ellipsis;\n                white-space: nowrap;\n            }\n            #jav-nong-table th:nth-child(2), #jav-nong-table td:nth-child(2) { width: 74px; }\n            #jav-nong-table th:nth-child(3), #jav-nong-table td:nth-child(3) { width: 74px; }\n            #jav-nong-table th:nth-child(4), #jav-nong-table td:nth-child(4) { width: 48px; }\n            #jav-nong-table:has(td.mag-laosiji-ready-cell) th:nth-child(3),\n            #jav-nong-table:has(td.mag-laosiji-ready-cell) td:nth-child(3) {\n                width: 104px;\n            }\n            #jav-nong-table td.mag-laosiji-ready-cell {\n                overflow: visible;\n            }\n            #jav-nong-table td:first-child {\n                text-align: left;\n            }\n            #jav-nong-table .nong-head-row th { background: #f8f8f8; font-weight: 600; }\n            #jav-nong-table .nong-magnet-name {\n                display: flex;\n                align-items: center;\n                gap: 4px;\n                min-width: 0;\n                width: 100%;\n                max-width: 100%;\n                white-space: nowrap;\n                overflow: hidden;\n                text-overflow: ellipsis;\n            }\n            #jav-nong-table .nong-magnet-name > a {\n                flex: 1 1 auto;\n                min-width: 0;\n                display: block;\n                overflow: hidden;\n                text-overflow: ellipsis;\n                white-space: nowrap;\n            }\n            .nong-copy { color: #08c !important; cursor: pointer; }\n            .nong-check { color: #be185d !important; cursor: pointer; margin-left: 8px; }\n            .nong-offline-115 { color: rgb(0,180,30) !important; cursor: pointer; }\n            .nong-offline-115:hover { color: red !important; }\n            .whatslink-overlay { position: fixed; inset: 0; z-index: 10000040; display: flex; align-items: center; justify-content: center; padding: 22px; background: rgba(15,23,42,.66); backdrop-filter: blur(8px); }\n            .whatslink-modal { width: min(1100px,96vw); max-height: 90vh; display: grid; grid-template-columns: 1.55fr .75fr; background: #f5f7fb; border: 1px solid rgba(203,213,225,.9); border-radius: 12px; overflow: hidden; box-shadow: 0 30px 80px rgba(2,8,23,.38); font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }\n            .whatslink-modal.no-shots { grid-template-columns: 1.1fr .9fr; }\n            .whatslink-viewer { min-width: 0; display: grid; grid-template-rows: minmax(430px,1fr) auto; gap: 10px; padding: 14px; background: radial-gradient(circle at 20% 0%,#fff1f8 0,transparent 34%),#eef3f8; }\n            .whatslink-stage { position: relative; min-height: 470px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid #dde7f2; border-radius: 12px; background: #111827; box-shadow: 0 18px 36px rgba(15,23,42,.16); }\n            .whatslink-stage img { width: 100%; height: 100%; max-height: 68vh; object-fit: contain; border-radius: 10px; }\n            .whatslink-modal.no-shots .whatslink-viewer { grid-template-rows: minmax(430px,1fr); background: linear-gradient(135deg,#f8fafc,#eef2ff); }\n            .whatslink-modal.no-shots .whatslink-stage { background: linear-gradient(145deg,#fff,#f1f5f9); border-style: dashed; box-shadow: inset 0 0 0 1px rgba(255,255,255,.8),0 18px 36px rgba(15,23,42,.08); }\n            .whatslink-modal.no-shots .whatslink-stage img, .whatslink-modal.no-shots .whatslink-nav, .whatslink-modal.no-shots .whatslink-counter, .whatslink-modal.no-shots .whatslink-thumbs { display: none; }\n            .whatslink-empty { display: none; width: min(420px,72%); text-align: center; color: #475569; }\n            .whatslink-modal.no-shots .whatslink-empty { display: block; }\n            .whatslink-empty-icon { width: 62px; height: 62px; margin: 0 auto 15px; display: grid; place-items: center; border-radius: 18px; background: linear-gradient(135deg,#fce7f3,#e0e7ff); color: #be185d; font-size: 27px; box-shadow: 0 12px 26px rgba(190,24,93,.16); }\n            .whatslink-empty-title { font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 7px; }\n            .whatslink-empty-text { margin: 0; font-size: 13px; line-height: 1.6; }\n            .whatslink-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 38px; height: 52px; border: 0; border-radius: 8px; background: rgba(255,255,255,.14); color: #fff; font-size: 28px; cursor: pointer; }\n            .whatslink-nav:hover { background: rgba(255,255,255,.24); }\n            .whatslink-prev { left: 12px; } .whatslink-next { right: 12px; }\n            .whatslink-counter { position: absolute; right: 14px; bottom: 12px; color: #e2e8f0; font-size: 12px; text-shadow: 0 1px 6px rgba(0,0,0,.6); }\n            .whatslink-thumbs { display: grid; grid-template-columns: repeat(5,1fr); gap: 7px; padding: 0; background: transparent; }\n            .whatslink-thumb { border: 2px solid #e2e8f0; border-radius: 9px; padding: 0; overflow: hidden; background: #fff; cursor: pointer; aspect-ratio: 16 / 9; box-shadow: 0 6px 14px rgba(15,23,42,.08); }\n            .whatslink-thumb.active { border-color: #db2777; box-shadow: 0 8px 18px rgba(219,39,119,.22); }\n            .whatslink-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }\n            .whatslink-info { min-width: 0; padding: 14px; background: #f8fafc; overflow: auto; color: #172033; }\n            .whatslink-head { position: sticky; top: 0; z-index: 2; margin: -14px -14px 12px; padding: 13px 14px; background: rgba(248,250,252,.94); border-bottom: 1px solid #e2e8f0; backdrop-filter: blur(10px); display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }\n            .whatslink-kicker { color: #db2777; font-size: 12px; font-weight: 800; margin-bottom: 5px; }\n            .whatslink-title { margin: 0; font-size: 21px; line-height: 1.18; color: #111827; word-break: break-word; }\n            .whatslink-close { width: 32px; height: 32px; border: 0; border-radius: 8px; color: #64748b; background: transparent; cursor: pointer; font-size: 25px; line-height: 1; }\n            .whatslink-tag { display: inline-flex; align-items: center; min-height: 22px; padding: 0 8px; margin-top: 8px; border-radius: 999px; background: #ecfdf5; color: #047857; font-size: 12px; font-weight: 700; }\n            .whatslink-meta { display: grid; grid-template-columns: 1fr; gap: 7px; margin: 10px 0 12px; }\n            .whatslink-metric { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 10px; border: 1px solid #e2e8f0; border-radius: 11px; background: #fff; box-shadow: 0 8px 20px rgba(15,23,42,.06); }\n            .whatslink-metric b { color: #172033; font-size: 13px; order: 2; }\n            .whatslink-metric span { color: #64748b; font-size: 12px; order: 1; }\n            .whatslink-section, .whatslink-summary-card { border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; padding: 10px; box-shadow: 0 8px 20px rgba(15,23,42,.06); }\n            .whatslink-section h3 { margin: 0 0 8px; color: #be185d; font-size: 12px; }\n            .whatslink-magnet { word-break: break-all; max-height: 86px; overflow: auto; padding: 9px; border-radius: 8px; background: #f6f8fb; color: #334155; font-family: ui-monospace,SFMono-Regular,Consolas,monospace; font-size: 12px; }\n            .whatslink-summary { display: grid; gap: 8px; margin-top: 10px; }\n            .whatslink-summary-card strong { display: block; margin-bottom: 4px; color: #111827; font-size: 12px; }\n            .whatslink-summary-card p { margin: 0; color: #64748b; font-size: 11px; line-height: 1.45; }\n            .whatslink-loading { padding: 28px; text-align: center; color: #475569; font-size: 14px; }\n            #jav-nong-notice {\n                padding: 8px 0;\n            }\n            .nong-magnet-name {\n                max-width: 320px; white-space: nowrap;\n                overflow: hidden; text-overflow: ellipsis;\n                display: flex; align-items: center; text-align: left;\n            }\n            #jav-nong-refresh {\n                display: none; margin-left: 8px;\n                color: #e74c3c; font-weight: bold; cursor: pointer;\n            }\n        '), 
        {
            createMagnetWidget: function(e) {
                const t = document.createElement("div");
                t.className = "jav-nong-wrapper", t.style.cssText = "\n                display: inline-block;\n                width: min(560px, 100%);\n                max-width: 100%;\n                box-sizing: border-box;\n                padding: 12px 12px 10px;\n                background: #fafafa;\n                border: 1px solid #ebebeb;\n                border-radius: 6px;\n                overflow: hidden;\n            ";
                const n = document.createElement("div");
                n.style.cssText = "margin-bottom:10px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;";
                const i = document.createElement("span");
                i.style.cssText = "color:#0066cc;font-size:14px;font-weight:600;", i.textContent = "🔥 磁力搜索", 
                n.appendChild(i), t.appendChild(n);
                const r = q(e);
                return t.appendChild(r), L(r, e, a.defaultEngine), t;
            },
            javdbApi: f
        };
    })(), x = {
        match: () => location.hostname.includes("javbus"),
        isActorIndexPage(e = location.href) {
            try {
                const t = new URL(e, location.href).pathname.replace(/\/+$/, "");
                return /^\/(?:[a-z]{2}\/)?(?:uncensored\/)?actresses(?:\/\d+)?$/i.test(t);
            } catch (e) {
                return !1;
            }
        },
        getVid: () => h((document.querySelector('meta[name="keywords"]')?.content || "").split(",")[0].trim()),
        isDetailPage: () => !!document.querySelector(".row.movie") && !document.querySelector("#waterfall div.item"),
        initPage(e) {
            if (document.querySelector(".ad-box")?.remove(), this._insertTopSettingsButton(), 
            setTimeout(() => this._insertTopSettingsButton(), 500), this.isActorIndexPage()) return;
            if (document.querySelector("#waterfall div.item")) return void this._initListPage();
            this._insertCopyButton(e);
            const t = o.defaultCss("javbus");
            GM_addStyle(`\n                .container { max-width: 100% !important; width: 100% !important;\n                    padding-left: 20px !important; padding-right: 20px !important; }\n                .row.movie { display: flex !important; gap: 20px !important;\n                    align-items: flex-start !important; flex-wrap: nowrap !important; margin: 0 !important; }\n                .row.movie { --javbus-cover-flex: ${t.cover}; --javbus-info-flex: ${t.info}; --javbus-magnet-flex: ${t.magnet}; }\n                .col-md-9.screencap { flex: var(--javbus-cover-flex) 1 0 !important; min-width: 0 !important;\n                    width: auto !important; float: none !important; padding: 0 !important; }\n                .col-md-3.info { flex: var(--javbus-info-flex) 1 0 !important; min-width: 0 !important;\n                    width: auto !important; float: none !important;\n                    overflow: hidden !important; word-break: break-word !important; }\n                .jav-nong-slot { flex: var(--javbus-magnet-flex) 1 0 !important; min-width: 0 !important; align-self: flex-start !important; overflow: hidden !important; }\n                .jav-nong-wrapper { width: 560px; max-width: 100%; }\n                .screencap img { width: 100%; max-width: 100%; }\n                .footer { padding: 20px 0; }\n                #mag-submit-show,\n                #mag-submit-show + div.movie:has(#magnet-table),\n                div.movie:has(> #magnet-table) {\n                    display: none !important;\n                }\n            `), 
            this._hideNativeMagnetBlocks(), setTimeout(() => this._hideNativeMagnetBlocks(), 900), 
            this._insertMagnet(e), this._replaceRecommendWithJavdbReviews(e), setTimeout(() => this._replaceRecommendWithJavdbReviews(e), 900);
        },
        _hideNativeMagnetBlocks() {
            const e = document.querySelector("#mag-submit-show"), t = e?.nextElementSibling;
            e?.remove(), t?.matches?.("div.movie") && t.querySelector?.("#magnet-table") && t.remove(), 
            document.querySelectorAll("#magnet-table").forEach(e => {
                const t = e.closest("div.movie");
                t && !t.classList.contains("row") && t.remove();
            });
        },
        _insertTopSettingsButton() {
            const e = document.querySelector("#navbar");
            if (!e || e.querySelector(".javbus-top-settings-nav")) return;
            const t = [ ...e.querySelectorAll(":scope > ul.nav.navbar-nav.navbar-right") ].find(e => e.querySelector(".glyphicon-magnet") || /\u5df2\u6709\u78c1\u529b/.test(e.textContent || "")), n = document.createElement("ul");
            n.className = "nav navbar-nav navbar-right javbus-top-settings-nav", n.innerHTML = '\n                <li>\n                    <a href="javascript:void(0)" class="javbus-top-settings-btn" title="打开老司机设置">\n                        <span class="glyphicon glyphicon-cog" style="font-size:12px;"></span>\n                        <span class="hidden-md hidden-sm">老司机设置</span>\n                    </a>\n                </li>\n            ', 
            n.querySelector(".javbus-top-settings-btn")?.addEventListener("click", e => {
                e.preventDefault(), e.stopPropagation(), b.open(e.currentTarget);
            }), t ? t.insertAdjacentElement("afterend", n) : e.appendChild(n), "1" !== document.documentElement.dataset.laosijiJavbusTopSettingsStyle && (document.documentElement.dataset.laosijiJavbusTopSettingsStyle = "1", 
            GM_addStyle("\n                #navbar .javbus-top-settings-btn {\n                    color: #2563eb !important;\n                    font-weight: 700 !important;\n                }\n                #navbar .javbus-top-settings-btn:hover {\n                    color: #1d4ed8 !important;\n                    background: rgba(37, 99, 235, .08) !important;\n                }\n            "));
        },
        _insertCopyButton(e) {
            const t = document.querySelector("div[class='col-md-3 info']");
            if (!t || !e) return;
            v([ ...t.querySelectorAll("p, h3, span") ].find(t => t.textContent.trim().toUpperCase().includes(h(e))) || t.querySelector("h3"), e, null, !0);
        },
        _insertMagnet(e) {
            if (!a.magnetTable) return;
            const t = document.querySelector("div[class='col-md-3 info']");
            if (!t) return;
            document.querySelectorAll(".jav-nong-slot").forEach(e => e.remove());
            const n = f.createMagnetWidget(e), i = document.createElement("div");
            i.className = "jav-nong-slot", i.style.overflow = "hidden", i.appendChild(n), t.after(i);
        },
        _ensureJavdbReviewsStyle() {
            y._ensureApiMovieTabStyle?.(), "1" !== document.documentElement.dataset.laosijiJavbusJavdbReviewsStyle && (document.documentElement.dataset.laosijiJavbusJavdbReviewsStyle = "1", 
            GM_addStyle("\n                .javbus-javdb-reviews {\n                    margin: 18px 0 24px !important;\n                    border: 1px solid #e5e7eb !important;\n                    border-radius: 6px !important;\n                    background: #fff !important;\n                    overflow: hidden !important;\n                    box-shadow: 0 1px 2px rgba(15, 23, 42, .04) !important;\n                }\n                .javbus-javdb-reviews-head {\n                    display: flex !important;\n                    align-items: center !important;\n                    justify-content: space-between !important;\n                    gap: 12px !important;\n                    padding: 10px 12px !important;\n                    border-bottom: 1px solid #e5e7eb !important;\n                    background: #f8fafc !important;\n                    color: #1f2937 !important;\n                    font-size: 15px !important;\n                    font-weight: 800 !important;\n                }\n                .javbus-javdb-reviews-head a {\n                    color: #2563eb !important;\n                    font-size: 12px !important;\n                    font-weight: 800 !important;\n                    text-decoration: none !important;\n                }\n                .javbus-javdb-reviews-badge {\n                    display: inline-flex !important;\n                    align-items: center !important;\n                    height: 20px !important;\n                    margin-left: 8px !important;\n                    padding: 0 7px !important;\n                    border: 1px solid #bfdbfe !important;\n                    border-radius: 999px !important;\n                    background: #eff6ff !important;\n                    color: #1d4ed8 !important;\n                    font-size: 11px !important;\n                    line-height: 1 !important;\n                    vertical-align: middle !important;\n                }\n                .javbus-javdb-reviews-body .message,\n                .javbus-javdb-reviews-body .message-body {\n                    margin: 0 !important;\n                    border: 0 !important;\n                    background: transparent !important;\n                    padding: 0 !important;\n                }\n                .javbus-javdb-reviews-footer {\n                    padding: 10px 0 12px !important;\n                    background: #fff !important;\n                }\n            "));
        },
        _findRecommendHeading: () => [ ...document.querySelectorAll("h4") ].find(e => {
            const t = (e.textContent || "").trim();
            return !!/推薦|推荐/.test(t) && (e.querySelector("#urad2") || /bootstr\s*\(\s*1\s*\)/i.test(e.innerHTML || "") || /^推薦|^推荐/.test(t));
        }),
        _isRecommendContainer(e) {
            if (!e || 1 !== e.nodeType) return !1;
            const t = `${e.id || ""} ${e.className || ""}`;
            return !/sample/i.test(t) && (/waterfall|recommend|related|masonry/i.test(t) || !!e.querySelector?.(".movie-box, .item, .masonry-brick"));
        },
        _replaceRecommendWithJavdbReviews(e) {
            if (!e) return;
            const t = document.querySelector(".javbus-javdb-reviews");
            if (t) {
                this._bindJavbusReviewLoadMore(t);
                const e = t.nextElementSibling;
                return void (this._isRecommendContainer(e) && e.remove());
            }
            const n = this._findRecommendHeading();
            if (!n) return;
            this._ensureJavdbReviewsStyle();
            const a = n.nextElementSibling, i = document.createElement("section");
            i.className = "javbus-javdb-reviews", i.dataset.avid = e, i.innerHTML = `\n                <div class="javbus-javdb-reviews-head">\n                    <span>JavDB 短评<span class="javbus-javdb-reviews-badge" title="此区块已由 JAV 老司机脚本替换">老司机</span></span>\n                    <a class="javbus-javdb-reviews-link" href="https://javdb.com/search?q=${encodeURIComponent(e)}" target="_blank" rel="noopener noreferrer">JavDB</a>\n                </div>\n                <div class="javbus-javdb-reviews-body">\n                    <div class="javdb-api-tab-loading">正在读取短评...</div>\n                </div>\n            `, 
            n.replaceWith(i), this._isRecommendContainer(a) && a.remove(), this._bindJavbusReviewLoadMore(i), 
            this._loadJavdbReviewsForJavbus(e, i);
        },
        _renderJavbusReviewFooter: (e, t) => `<div class="javdb-api-tab-footer javbus-javdb-reviews-footer">${e ? `<button type="button" class="javdb-api-tab-load-more javbus-javdb-reviews-load-more" data-shown-count="${t}" data-load-limit="20">加载更多短评</button>` : '<div class="javdb-api-tab-end">已加载全部短评</div>'}</div>`,
        _renderJavbusReviews(e, t = 0, a = !1) {
            const i = Array.isArray(e) ? e.slice(0, n) : [];
            return `<article class="message video-panel"><div class="message-body"><div class="javdb-api-tab-items">${i.length ? y._renderApiReviewItems(i, t, n) : '<div class="javdb-api-tab-empty">暂无短评</div>'}</div>${this._renderJavbusReviewFooter(a, t + i.length)}</div></article>`;
        },
        _bindJavbusReviewLoadMore(e) {
            e && "1" !== e.dataset.reviewsLoadMoreBound && (e.dataset.reviewsLoadMoreBound = "1", 
            e.addEventListener("click", t => {
                const n = t.target?.closest?.(".javbus-javdb-reviews-load-more");
                n && e.contains(n) && (t.preventDefault(), t.stopPropagation(), t.stopImmediatePropagation?.(), 
                this._loadMoreJavdbReviewsForJavbus(e, n));
            }, !0));
        },
        async _loadJavdbReviewsForJavbus(e, t) {
            const n = t?.querySelector(".javbus-javdb-reviews-body");
            if (n) try {
                const a = await f.javdbApi.searchMovieByNumber(e, {
                    limit: 5
                });
                if (!a?.id) return void (n.innerHTML = `<div class="javdb-api-tab-empty">JavDB 未找到 ${y._escapeHtml(e)} 的短评</div>`);
                const i = t.querySelector(".javbus-javdb-reviews-link");
                i && (i.href = `https://javdb.com/v/${encodeURIComponent(a.id)}`), t.dataset.movieId = a.id;
                const r = await f.javdbApi.movieReviews(a.id, {
                    page: 1,
                    limit: 7
                }), o = Array.isArray(r?.data?.reviews) ? r.data.reviews : [], s = o.slice(0, 6);
                n.innerHTML = s.length ? this._renderJavbusReviews(s, 0, o.length > 6) : '<div class="javdb-api-tab-empty">暂无短评</div>';
            } catch (e) {
                console.warn("[老司机] JavBus JavDB 短评读取失败:", e), n.innerHTML = `<div class="javdb-api-tab-error">${y._escapeHtml(e.message || "短评读取失败")}</div>`;
            }
        },
        async _loadMoreJavdbReviewsForJavbus(e, t) {
            const a = e?.dataset?.movieId || "", i = e?.querySelector(".javbus-javdb-reviews-body");
            if (!a || !i || !t) return;
            const r = i.querySelectorAll(".javdb-api-review").length, o = Math.max(1, parseInt(t.dataset.loadLimit, 10) || n), s = t.textContent;
            t.textContent = "加载中...", t.disabled = !0;
            try {
                const e = await f.javdbApi.movieReviews(a, {
                    page: 1,
                    limit: r + o + 1
                }), t = Array.isArray(e?.data?.reviews) ? e.data.reviews : [], n = t.slice(r, r + o), s = i.querySelector(".javdb-api-tab-items"), l = i.querySelector(".javbus-javdb-reviews-footer");
                if (!n.length) return void (l && (l.outerHTML = this._renderJavbusReviewFooter(!1, r)));
                s?.insertAdjacentHTML("beforeend", y._renderApiReviewItems(n, r, o));
                const c = r + n.length, d = t.length > c;
                l && (l.outerHTML = this._renderJavbusReviewFooter(d, c));
            } catch (e) {
                return console.warn("[老司机] JavBus JavDB 更多短评读取失败:", e), t.textContent = "加载失败，点击重试", 
                void (t.disabled = !1);
            }
            t.textContent = s, t.disabled = !1;
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
            if ("1" === e.dataset.laosijiGridCard) return void q.attach(e);
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
            const i = e.querySelector(".photo-info");
            i?.classList.add("jav-card-title", "javbus-card-title");
            const r = i?.querySelector(":scope > span") || i;
            if (r && !r.querySelector(":scope > .video-title")) {
                const e = Array.from(r.childNodes), t = [];
                for (const n of e) {
                    if (n.nodeType === Node.ELEMENT_NODE) {
                        if (n.matches("br, .item-tag, date, .jav-pan115-badge")) break;
                        t.push(n);
                        continue;
                    }
                    n.nodeType === Node.TEXT_NODE && (n.textContent.trim() || t.length) && t.push(n);
                }
                if (t.some(e => (e.textContent || "").trim())) {
                    const e = document.createElement("span");
                    for (e.className = "video-title javbus-card-headline", r.insertBefore(e, t[0]), 
                    t.forEach(t => e.appendChild(t)); e.nextSibling?.nodeType === Node.TEXT_NODE && !e.nextSibling.textContent.trim(); ) e.nextSibling.remove();
                    e.nextSibling?.nodeType === Node.ELEMENT_NODE && e.nextSibling.matches("br") && e.nextSibling.remove();
                }
            }
            const o = i?.querySelector("date");
            o && "1" !== o.dataset.laosijiCode && (o.dataset.laosijiCode = "1", o.classList.add("javbus-card-code")), 
            q.attach(e);
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
            i.apply("javbus"), e.querySelectorAll(":scope > .item").forEach(e => this._decorateCard(e)), 
            t && GM_addStyle("\n                    .jav-card-grid {\n                        --jav-card-title-size: 15px;\n                        --jav-card-title-line-height: 1.5;\n                        --jav-card-title-lines: 2;\n                        display: grid !important;\n                        grid-template-columns: repeat(var(--jav-card-columns, 5), minmax(0, 1fr)) !important;\n                        gap: 14px !important;\n                        align-items: stretch !important;\n                        width: 100% !important;\n                        height: auto !important;\n                        box-sizing: border-box !important;\n                    }\n                    .jav-card {\n                        position: static !important;\n                        float: none !important;\n                        display: block !important;\n                        width: auto !important;\n                        height: 100% !important;\n                        max-height: none !important;\n                        min-width: 0 !important;\n                        margin: 0 !important;\n                        padding: 0 !important;\n                        box-sizing: border-box !important;\n                        text-align: left !important;\n                        background: #fff !important;\n                        border: 1px solid #e5e7eb !important;\n                        border-radius: 6px !important;\n                        overflow: hidden !important;\n                        box-shadow: 0 1px 4px rgba(15, 23, 42, .08) !important;\n                        transform: translateZ(0) !important;\n                        transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease !important;\n                        will-change: transform !important;\n                    }\n                    .jav-card:hover {\n                        border-color: rgba(37, 99, 235, .35) !important;\n                        box-shadow: 0 10px 24px rgba(15, 23, 42, .16) !important;\n                        transform: translateY(-4px) scale(1.018) !important;\n                        z-index: 2 !important;\n                    }\n                    .jav-card-link {\n                        display: flex !important;\n                        flex-direction: column !important;\n                        height: 100% !important;\n                        max-height: none !important;\n                        overflow: hidden !important;\n                        color: #2563eb !important;\n                        text-decoration: none !important;\n                    }\n                    .jav-card-link:visited { color: #7c3aed !important; }\n                    .jav-card-cover {\n                        display: block !important;\n                        width: 100% !important;\n                        height: auto !important;\n                        aspect-ratio: 800 / 538 !important;\n                        overflow: hidden !important;\n                        background: #f8fafc !important;\n                        border-bottom: 1px solid #f1f5f9 !important;\n                        margin: 0 !important;\n                    }\n                    .jav-card-image {\n                        display: block !important;\n                        width: 100% !important;\n                        height: 100% !important;\n                        max-height: none !important;\n                        object-fit: cover !important;\n                        object-position: center center !important;\n                        background: #f8fafc !important;\n                        border: 0 !important;\n                        transition: opacity .18s ease !important;\n                    }\n                    .jav-card-title {\n                        display: block !important;\n                        width: 100% !important;\n                        max-width: none !important;\n                        height: auto !important;\n                        max-height: none !important;\n                        box-sizing: border-box !important;\n                        flex: 1 1 auto !important;\n                        min-height: 0 !important;\n                        margin: 0 !important;\n                        padding: 7px 8px 9px !important;\n                        overflow: visible !important;\n                        color: inherit !important;\n                        font-size: var(--jav-card-title-size, 15px) !important;\n                        line-height: var(--jav-card-title-line-height, 1.5) !important;\n                        text-align: left !important;\n                        white-space: normal !important;\n                        word-break: break-word !important;\n                    }\n                    .javbus-card-grid {\n                        position: static !important;\n                        --jav-card-columns: 5;\n                        box-sizing: border-box !important;\n                    }\n                    #waterfall.javbus-card-grid {\n                        display: grid !important;\n                        grid-template-columns: repeat(var(--jav-card-columns, 5), minmax(0, 1fr)) !important;\n                        gap: 14px !important;\n                        align-items: stretch !important;\n                        min-height: 0 !important;\n                    }\n                    body .container-fluid {\n                        padding-left: 28px !important;\n                        padding-right: 28px !important;\n                        box-sizing: border-box !important;\n                    }\n                    #waterfall.javbus-card-grid > .item,\n                    .javbus-card-grid .item.javbus-grid-card {\n                        position: static !important;\n                        width: auto !important;\n                        float: none !important;\n                        margin: 0 !important;\n                        top: auto !important;\n                        left: auto !important;\n                    }\n                    .javbus-card-grid .item .jav-card-link.javbus-card-link {\n                        width: 100% !important;\n                        min-width: 0 !important;\n                        margin: 0 !important;\n                        padding: 0 !important;\n                        background: #fff !important;\n                        box-shadow: none !important;\n                        border-radius: 0 !important;\n                        overflow: hidden !important;\n                    }\n                    .javbus-card-grid .item .javbus-cover-frame.photo-frame {\n                        margin: 0 !important;\n                        height: auto !important;\n                    }\n                    .javbus-card-grid .item .javbus-card-image {\n                        height: 100% !important;\n                        margin: 0 !important;\n                    }\n                    .javbus-card-title > span {\n                        display: block !important;\n                    }\n                    .javbus-card-title .video-title {\n                        display: -webkit-box !important;\n                        -webkit-box-orient: vertical !important;\n                        -webkit-line-clamp: var(--jav-card-title-lines, 2) !important;\n                        line-clamp: var(--jav-card-title-lines, 2) !important;\n                        height: calc(var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 2) * 1em) !important;\n                        max-height: calc(var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 2) * 1em) !important;\n                        min-height: calc(var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 2) * 1em) !important;\n                        overflow: hidden !important;\n                        text-overflow: ellipsis !important;\n                        white-space: normal !important;\n                        word-break: break-word !important;\n                        color: inherit !important;\n                        font-size: var(--jav-card-title-size, 15px) !important;\n                        line-height: var(--jav-card-title-line-height, 1.5) !important;\n                        margin-bottom: 6px !important;\n                    }\n                    .javbus-card-grid .item .javbus-card-title .jav-pan115-badge {\n                        display: inline-flex !important;\n                        width: auto !important;\n                        max-width: max-content !important;\n                        float: none !important;\n                        vertical-align: middle !important;\n                        margin: 0 6px 4px 0 !important;\n                    }\n                    .javbus-card-title .item-tag {\n                        margin: 6px 0 4px !important;\n                    }\n                    .javbus-card-title date {\n                        color: #94a3b8 !important;\n                        font-size: 12px !important;\n                    }\n                    .javbus-card-title date.javbus-card-code {\n                        display: inline-block !important;\n                        color: inherit !important;\n                        font-size: 15px !important;\n                        font-weight: 800 !important;\n                        margin-top: 2px !important;\n                    }\n                    @media (max-width: 1100px) {\n                        .javbus-card-grid { --jav-card-columns: 4; }\n                    }\n                    @media (max-width: 820px) {\n                        .javbus-card-grid { --jav-card-columns: 3; }\n                    }\n                    @media (max-width: 560px) {\n                        .javbus-card-grid { --jav-card-columns: 2; gap: 10px !important; }\n                    }\n                "), 
            setTimeout(() => {
                se.refreshListPage();
            }, 0), setTimeout(() => {
                this._flattenWaterfall(), e.querySelectorAll(":scope > .item").forEach(e => this._decorateCard(e)), 
                se.syncListPreview();
            }, 450);
        }
    }, y = {
        match: () => location.hostname.includes("javdb"),
        getVid() {
            const e = document.querySelector("a.button.is-white.copy-to-clipboard");
            return h(e?.dataset?.clipboardText || "");
        },
        initPage(e) {
            document.querySelector(".app-desktop-banner")?.remove(), this._dismissOver18Modal(), 
            this._insertTopSettingsButton(), this._installApiRankingShell(), this._hideScriptFc2AdvancedSearchBox(), 
            this._initPaginationJump(), this._redirectCurrentApiRankingEntry() || (this._getApiRankingShellMode() ? this._initApiRankingShellPage().catch(e => console.warn("[老司机] JavDB API 榜单渲染失败:", e)) : this._getApiDetailShellMode() ? this._initApiDetailShellPage().catch(e => console.warn("[老司机] JavDB API 详情渲染失败:", e)) : location.pathname.startsWith("/v/") ? (this._insertCopyButton(e), 
            this._hideDownloadCorrectionBlock(), GM_addStyle('\n                .container { max-width: 100% !important; }\n                .movie-panel-info { overflow: hidden; word-break: break-word; }\n                .movie-panel-info .panel-block { flex-wrap: wrap; }\n                .movie-panel-info .value { overflow: hidden; word-break: break-word; }\n                .review-buttons > .panel-block:has(a[href="#magnet-links"]),\n                .review-buttons > .panel-block:has(a[href*="/corrections/new"]) { display: none !important; }\n            '), 
            this._ensureDetailLayout(), this._insertMagnet(e), this._initApiMovieTabs()) : this._initListPage());
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
        _getCurrentMovieId() {
            const e = location.pathname.match(/^\/v\/([^/?#]+)/);
            if (e) return decodeURIComponent(e[1]);
            const t = (document.querySelector('.review-tab[data-url*="/v/"], .list-tab[data-url*="/v/"]')?.dataset?.url || "").match(/\/v\/([^/]+)/);
            return t ? decodeURIComponent(t[1]) : this._getApiDetailShellMode()?.movieId || "";
        },
        _formatApiDate(e) {
            const t = String(e || "");
            return t ? t.includes("T") ? t.slice(0, 10) : t : "";
        },
        _formatApiSize(e) {
            const t = Number(e);
            return !Number.isFinite(t) || t <= 0 ? "" : t >= 1024 ? `${(t / 1024).toFixed(t >= 10240 ? 1 : 2)}GB` : `${Math.round(t)}MB`;
        },
        _renderApiLinkedText(e) {
            const t = String(e || "");
            let n = "", a = 0;
            return t.replace(/((?:magnet:\?|ed2k:\/\/|https?:\/\/)[^\s"'<>]+)/gi, (e, i, r) => {
                n += this._escapeHtml(t.slice(a, r));
                const o = this._escapeHtml(e);
                return n += `<a class="a-primary" href="${o}" target="_blank" rel="noopener noreferrer">${o}</a>`, 
                a = r + e.length, e;
            }), n += this._escapeHtml(t.slice(a)), n.replace(/\n/g, "<br>");
        },
        _renderApiStars(e) {
            const t = Math.max(0, Math.min(5, parseInt(e, 10) || 0));
            return `<span class="score-stars">${Array.from({
                length: 5
            }, (e, n) => `<i class="icon-star${n < t ? "" : " gray"}"></i>`).join("")}</span>`;
        },
        _ensureApiMovieTabStyle() {
            "1" !== document.documentElement.dataset.laosijiJavdbApiMovieTabStyle && (document.documentElement.dataset.laosijiJavdbApiMovieTabStyle = "1", 
            GM_addStyle("\n                #tabs-container[data-laosiji-api-movie-tabs] .top-meta { display: none !important; }\n                .javdb-api-tab-loading,\n                .javdb-api-tab-empty,\n                .javdb-api-tab-error,\n                .javdb-api-tab-end {\n                    padding: 12px 14px !important;\n                    color: #64748b !important;\n                    font-size: 13px !important;\n                    font-weight: 700 !important;\n                }\n                .javdb-api-tab-error { color: #be123c !important; }\n                .javdb-api-review,\n                .javdb-api-related {\n                    margin: 0 !important;\n                    padding: 11px 12px !important;\n                    border-bottom: 1px solid #edf2f7 !important;\n                    background: #fff !important;\n                    word-break: break-word !important;\n                }\n                .javdb-api-review-head,\n                .javdb-api-related-head {\n                    display: flex !important;\n                    align-items: center !important;\n                    justify-content: space-between !important;\n                    gap: 10px !important;\n                    flex-wrap: wrap !important;\n                    color: #334155 !important;\n                    font-size: 13px !important;\n                }\n                .javdb-api-review-content,\n                .javdb-api-related-desc {\n                    margin-top: 7px !important;\n                    color: #1f2937 !important;\n                    font-size: 13px !important;\n                    line-height: 1.65 !important;\n                    white-space: normal !important;\n                }\n                .javdb-api-related-meta {\n                    display: flex !important;\n                    gap: 10px !important;\n                    flex-wrap: wrap !important;\n                    margin-top: 7px !important;\n                    color: #64748b !important;\n                    font-size: 12px !important;\n                }\n                .javdb-api-tab-footer { padding: 10px 0 0 !important; }\n                .javdb-api-tab-load-more {\n                    width: 100% !important;\n                    min-height: 34px !important;\n                    border: 1px solid #bfdbfe !important;\n                    border-radius: 6px !important;\n                    background: #eff6ff !important;\n                    color: #1d4ed8 !important;\n                    font-size: 13px !important;\n                    font-weight: 800 !important;\n                    cursor: pointer !important;\n                }\n                .javdb-api-tab-badge-item {\n                    display: flex !important;\n                    align-items: center !important;\n                    margin-left: 4px !important;\n                    pointer-events: auto !important;\n                }\n                .javdb-api-tab-badge {\n                    margin-left: 0 !important;\n                    align-self: center !important;\n                    display: inline-flex !important;\n                    align-items: center !important;\n                    height: 20px !important;\n                    padding: 0 7px !important;\n                    border: 1px solid #bfdbfe !important;\n                    border-radius: 999px !important;\n                    background: #eff6ff !important;\n                    color: #1d4ed8 !important;\n                    font-size: 11px !important;\n                    font-weight: 850 !important;\n                    line-height: 1 !important;\n                    white-space: nowrap !important;\n                }\n            "));
        },
        _ensureApiMovieTabBadge() {
            const e = document.querySelector(".tabs.no-bottom");
            if (!e) return;
            let t = e.querySelector(".javdb-api-tab-badge");
            t || (t = document.createElement("span"), t.className = "javdb-api-tab-badge"), 
            t.textContent = "老司机", t.title = "此区块已由 JAV 老司机脚本替换";
            let n = e.querySelector(".javdb-api-tab-badge-item");
            n || (n = document.createElement("li"), n.className = "javdb-api-tab-badge-item"), 
            n.contains(t) || n.appendChild(t);
            const a = document.querySelector('[data-movie-tab-target="listTab"]');
            a?.parentElement ? n.parentElement === a.parentElement && n.previousElementSibling === a || a.insertAdjacentElement("afterend", n) : e.contains(n) || e.appendChild(n);
        },
        _renderApiTabLoading(e = "读取中...") {
            return `<article class="message video-panel"><div class="message-body"><div class="javdb-api-tab-loading">${this._escapeHtml(e)}</div></div></article>`;
        },
        _renderApiTabError(e) {
            return `<article class="message video-panel"><div class="message-body"><div class="javdb-api-tab-error">${this._escapeHtml(e || "读取失败")}</div></div></article>`;
        },
        _renderApiTabFooter(e, t, n, a, i, r = 20, o = 0, s = r) {
            return `<div class="javdb-api-tab-footer">${n ? `<button type="button" class="javdb-api-tab-load-more" data-laosiji-api-load-tab="${e}" data-next-page="${t}" data-page-size="${r}" data-shown-count="${o}" data-load-limit="${s}">${this._escapeHtml(i)}</button>` : `<div class="javdb-api-tab-end">${this._escapeHtml(a)}</div>`}</div>`;
        },
        _renderApiMagnetRows(e) {
            const t = Array.isArray(e) ? e : [];
            return t.length ? t.map((e, t) => {
                const n = String(e?.hash || "").trim();
                if (!n) return "";
                const a = String(e?.name || n).trim(), i = `magnet:?xt=urn:btih:${n}&dn=${encodeURIComponent(`[javdb.com]${a}`)}`, r = [ this._formatApiSize(e?.size), Number(e?.files_count || 0) > 0 ? `${e.files_count}個文件` : "" ].filter(Boolean).join(", "), o = [ e?.hd ? '<span class="tag is-primary is-small is-light">高清</span>' : "", e?.cnsub ? '<span class="tag is-warning is-small is-light">字幕</span>' : "" ].filter(Boolean).join(""), s = e?.pikpak_url ? `<a class="button is-info is-small" href="${this._escapeHtml(e.pikpak_url)}" target="_blank" rel="noopener noreferrer">&nbsp;下載&nbsp;</a>` : "";
                return `\n                    <div class="item columns is-desktop ${t % 2 == 0 ? "odd" : ""}">\n                        <div class="magnet-name column is-four-fifths">\n                            <a href="${this._escapeHtml(i)}" title="右鍵點擊並選擇「複製鏈接地址」">\n                                <span class="name">${this._escapeHtml(a)}</span>\n                                ${r ? `<br><span class="meta">${this._escapeHtml(r)}</span>` : ""}\n                                ${o ? `<br><div class="tags">${o}</div>` : ""}\n                            </a>\n                        </div>\n                        <div class="buttons column">\n                            <button class="button is-info is-small copy-to-clipboard" data-clipboard-text="${this._escapeHtml(i)}" type="button">&nbsp;複製&nbsp;</button>\n                            ${s}\n                        </div>\n                        <div class="date column"><span class="time">${this._escapeHtml(this._formatApiDate(e?.created_at))}</span></div>\n                    </div>\n                `;
            }).filter(Boolean).join("") : '<div class="javdb-api-tab-empty">暂无磁力信息</div>';
        },
        _renderApiMagnets(e) {
            return `<article class="message video-panel"><div class="message-body"><div id="magnets-content" class="magnet-links" data-laosiji-api-source="1">${this._renderApiMagnetRows(e)}</div></div></article>`;
        },
        _renderApiReviewItems(e, t = 0, a = 20) {
            const i = Math.max(1, parseInt(a, 10) || n);
            return (Array.isArray(e) ? e.slice(0, i) : []).map((e, n) => `\n                <div class="javdb-api-review">\n                    <div class="javdb-api-review-head">\n                        <span><strong>#${t + n + 1}</strong> ${this._escapeHtml(e?.username || "匿名")}</span>\n                        <span>${this._renderApiStars(e?.score)} ${this._escapeHtml(this._formatApiDate(e?.created_at))} ${Number(e?.likes_count || 0) ? ` · 點讚:${this._escapeHtml(e.likes_count)}` : ""}</span>\n                    </div>\n                    <div class="javdb-api-review-content">${this._renderApiLinkedText(e?.content || "")}</div>\n                </div>\n            `).join("");
        },
        _renderApiReviews(e, t, a) {
            const i = Array.isArray(e) ? e.slice(0, a) : [];
            return `<article class="message video-panel"><div class="message-body"><div class="javdb-api-tab-items">${i.length ? this._renderApiReviewItems(i, (t - 1) * a, a) : '<div class="javdb-api-tab-empty">暂无短评</div>'}</div>${this._renderApiTabFooter("reviews", t + 1, i.length >= a, "已加载全部短评", "加载更多短评", a, i.length, n)}</div></article>`;
        },
        _renderApiRelatedItems(e, t = 0) {
            return (Array.isArray(e) ? e : []).map((e, n) => {
                const a = `/lists/${encodeURIComponent(e?.id || "")}`;
                return `\n                    <div class="javdb-api-related">\n                        <div class="javdb-api-related-head">\n                            <span><strong>#${t + n + 1}</strong> <a href="${this._escapeHtml(a)}" target="_blank" rel="noopener noreferrer">${this._escapeHtml(e?.name || "未命名清單")}</a></span>\n                            <span>${this._escapeHtml(this._formatApiDate(e?.created_at))}</span>\n                        </div>\n                        ${e?.description ? `<div class="javdb-api-related-desc">${this._renderApiLinkedText(e.description)}</div>` : ""}\n                        <div class="javdb-api-related-meta">\n                            <span>影片:${this._escapeHtml(e?.movies_count ?? "-")}</span>\n                            <span>收藏:${this._escapeHtml(e?.collections_count ?? "-")}</span>\n                            <span>浏览:${this._escapeHtml(e?.views_count ?? "-")}</span>\n                        </div>\n                    </div>\n                `;
            }).join("");
        },
        _renderApiRelatedLists(e, t, n) {
            const a = Array.isArray(e) ? e : [];
            return `<article class="message video-panel"><div class="message-body"><div class="javdb-api-tab-items">${a.length ? this._renderApiRelatedItems(a, (t - 1) * n) : '<div class="javdb-api-tab-empty">暂无相关清单</div>'}</div>${this._renderApiTabFooter("lists", t + 1, a.length >= n, "已加载全部清单", "加载更多清单")}</div></article>`;
        },
        _setApiMovieTab(e) {
            const t = {
                magnets: document.querySelector('[data-movie-tab-target="magnetTab"]'),
                reviews: document.querySelector('[data-movie-tab-target="reviewTab"]'),
                lists: document.querySelector('[data-movie-tab-target="listTab"]')
            }, n = {
                magnets: document.getElementById("magnets"),
                reviews: document.getElementById("reviews"),
                lists: document.getElementById("lists")
            };
            Object.entries(t).forEach(([t, n]) => n?.classList.toggle("is-active", t === e)), 
            Object.entries(n).forEach(([t, n]) => {
                n && (n.style.display = t === e ? "" : "none");
            });
        },
        _updateApiTabFooter(e, t, a, i, r, o) {
            const s = e?.querySelector(".javdb-api-tab-footer");
            if (!s) return;
            const l = "reviews" === t ? n : 20, c = "reviews" === t ? e.querySelectorAll(".javdb-api-review").length : 0;
            s.outerHTML = this._renderApiTabFooter(t, a, i, r, o, l, c, l);
        },
        async _loadApiMovieTab(e, t, a = 1, i = !1, r = null, o = null, s = null) {
            const l = document.getElementById("magnets" === t ? "magnets" : t);
            if (!l || !e) return;
            const c = "reviews" === t && i ? Math.max(0, parseInt(o, 10) || l.querySelectorAll(".javdb-api-review").length || 0) : 0, d = i ? Math.max(1, parseInt(s, 10) || n) : 6, p = "reviews" === t ? c + d : 20;
            i || (l.innerHTML = this._renderApiTabLoading("magnets" === t ? "正在读取磁力..." : "reviews" === t ? "正在读取短评..." : "正在读取相关清单..."));
            try {
                if ("magnets" === t) {
                    const t = await f.javdbApi.movieMagnets(e), n = Array.isArray(t?.data?.magnets) ? t.data.magnets : [];
                    return l.innerHTML = this._renderApiMagnets(n), void (l.dataset.laosijiApiLoaded = "1");
                }
                if ("reviews" === t) {
                    const t = await f.javdbApi.movieReviews(e, {
                        page: 1,
                        limit: p
                    }), n = Array.isArray(t?.data?.reviews) ? t.data.reviews : [], r = i ? n.slice(c, c + d) : n.slice(0, 6);
                    return i ? (l.querySelector(".javdb-api-tab-items")?.insertAdjacentHTML("beforeend", this._renderApiReviewItems(r, c, d)), 
                    this._updateApiTabFooter(l, "reviews", a + 1, n.length >= p && r.length > 0, "已加载全部短评", "加载更多短评")) : l.innerHTML = this._renderApiReviews(r, a, 6), 
                    void (l.dataset.laosijiApiLoaded = "1");
                }
                if ("lists" === t) {
                    const t = await f.javdbApi.relatedLists(e, {
                        page: a,
                        limit: p
                    }), n = Array.isArray(t?.data?.lists) ? t.data.lists : [];
                    i ? (l.querySelector(".javdb-api-tab-items")?.insertAdjacentHTML("beforeend", this._renderApiRelatedItems(n, (a - 1) * p)), 
                    this._updateApiTabFooter(l, "lists", a + 1, n.length >= p, "已加载全部清单", "加载更多清单")) : l.innerHTML = this._renderApiRelatedLists(n, a, p), 
                    l.dataset.laosijiApiLoaded = "1";
                }
            } catch (e) {
                console.warn("[老司机] JavDB API tab 读取失败:", t, e), i ? this._updateApiTabFooter(l, t, a, !0, "", "加载失败，点击重试") : l.innerHTML = this._renderApiTabError(e.message || "读取失败");
            }
        },
        _initApiMovieTabs() {
            const e = this._getCurrentMovieId(), t = document.getElementById("tabs-container"), n = document.getElementById("magnets"), a = document.getElementById("reviews"), i = document.getElementById("lists");
            if (!(e && t && n && a && i)) return;
            if (t.dataset.laosijiApiMovieTabs === e) return;
            t.dataset.laosijiApiMovieTabs = e, this._ensureApiMovieTabStyle(), this._ensureApiMovieTabBadge();
            const r = {
                magnets: document.querySelector('[data-movie-tab-target="magnetTab"] a'),
                reviews: document.querySelector('[data-movie-tab-target="reviewTab"] a'),
                lists: document.querySelector('[data-movie-tab-target="listTab"] a')
            };
            Object.entries(r).forEach(([e, t]) => {
                t && (t.dataset.laosijiApiTab = e, t.removeAttribute("data-action"), t.removeAttribute("data-url"));
            });
            const o = t.closest(".columns") || t;
            o.addEventListener("click", n => {
                if (n.target?.closest?.(".javdb-api-tab-badge-item")) return n.preventDefault(), 
                void n.stopImmediatePropagation();
                const a = n.target?.closest?.(".copy-to-clipboard[data-clipboard-text]");
                if (a && t.contains(a)) {
                    n.preventDefault(), n.stopImmediatePropagation(), GM_setClipboard(a.dataset.clipboardText || "");
                    const e = a.textContent;
                    return a.textContent = "已複製", void setTimeout(() => {
                        a.textContent = e;
                    }, 900);
                }
                const i = n.target?.closest?.(".javdb-api-tab-load-more[data-laosiji-api-load-tab]");
                if (i && t.contains(i)) {
                    n.preventDefault(), n.stopImmediatePropagation();
                    const t = i.dataset.laosijiApiLoadTab, a = parseInt(i.dataset.nextPage || "2", 10) || 2, r = parseInt(i.dataset.pageSize || "", 10) || null, o = parseInt(i.dataset.shownCount || "", 10) || null, s = parseInt(i.dataset.loadLimit || "", 10) || null;
                    return i.textContent = "加载中...", i.disabled = !0, void this._loadApiMovieTab(e, t, a, !0, r, o, s);
                }
                const r = n.target?.closest?.("[data-laosiji-api-tab]");
                if (!r || !o.contains(r)) return;
                n.preventDefault(), n.stopImmediatePropagation();
                const s = r.dataset.laosijiApiTab;
                this._setApiMovieTab(s);
                const l = document.getElementById("magnets" === s ? "magnets" : s);
                l && "1" !== l.dataset.laosijiApiLoaded && this._loadApiMovieTab(e, s);
            }, !0), this._setApiMovieTab("reviews"), this._loadApiMovieTab(e, "reviews").catch(e => console.warn("[老司机] JavDB API 短评读取失败:", e));
        },
        _ensurePaginationJumpStyle() {
            "1" !== document.documentElement.dataset.laosijiJavdbPaginationJumpStyle && (document.documentElement.dataset.laosijiJavdbPaginationJumpStyle = "1", 
            GM_addStyle("\n                .javdb-pagination-jump {\n                    display: flex !important;\n                    align-items: center !important;\n                    gap: .25rem !important;\n                    margin: 0 !important;\n                    flex-wrap: nowrap !important;\n                }\n                .pagination-list .javdb-pagination-jump-item {\n                    display: list-item !important;\n                    margin-left: .25rem !important;\n                }\n                .javdb-pagination-jump .pagination-link {\n                    margin: 0 !important;\n                }\n                .javdb-pagination-jump input.pagination-link {\n                    width: 4.5em !important;\n                    min-width: 4.5em !important;\n                    text-align: center !important;\n                    box-shadow: none !important;\n                    appearance: textfield !important;\n                }\n                .javdb-pagination-jump input.pagination-link::-webkit-outer-spin-button,\n                .javdb-pagination-jump input.pagination-link::-webkit-inner-spin-button {\n                    -webkit-appearance: none !important;\n                    margin: 0 !important;\n                }\n                .javdb-pagination-jump button.pagination-link {\n                    cursor: pointer !important;\n                    font-weight: 400 !important;\n                }\n                @media (max-width: 640px) {\n                    .pagination-list .javdb-pagination-jump-item {\n                        flex-basis: 100% !important;\n                        margin-left: .25rem !important;\n                    }\n                }\n            "));
        },
        _paginationCurrentPage(e) {
            const t = new URLSearchParams(location.search), n = parseInt(t.get("page") || "1", 10);
            if (Number.isFinite(n) && n > 0) return n;
            const a = parseInt(e?.querySelector(".pagination-link.is-current")?.textContent?.trim() || "1", 10);
            return Number.isFinite(a) && a > 0 ? a : 1;
        },
        _paginationPageUrl(e) {
            const t = new URL(location.href);
            return e <= 1 ? t.searchParams.delete("page") : t.searchParams.set("page", String(e)), 
            t.href;
        },
        _initPaginationJump(e = document) {
            const t = [ ...e.querySelectorAll?.("nav.pagination") || [] ];
            t.length && (this._ensurePaginationJumpStyle(), t.forEach(e => {
                if (e.querySelector(".javdb-pagination-jump")) return;
                const t = e.querySelector(".pagination-list"), n = document.createElement(t ? "li" : "div");
                n.className = t ? "javdb-pagination-jump-item" : "javdb-pagination-jump-item pagination-link";
                const a = document.createElement("form");
                a.className = "javdb-pagination-jump", a.innerHTML = `\n                    <input class="pagination-link" type="number" min="1" step="1" inputmode="numeric" aria-label="跳转页码" placeholder="页码" value="${this._escapeHtml(this._paginationCurrentPage(e))}">\n                    <button class="pagination-link" type="submit">跳转</button>\n                `, 
                a.addEventListener("submit", e => {
                    e.preventDefault();
                    const t = a.querySelector("input"), n = Math.max(1, parseInt(t?.value || "1", 10) || 1);
                    location.href = this._paginationPageUrl(n);
                }), n.appendChild(a), (t || e).appendChild(n);
            }));
        },
        _apiRankingShellUrl(e, t = {}) {
            const n = new URLSearchParams;
            return n.set("laosiji_rank", e), "top" === e ? (n.set("lsj_category", t.category || "all"), 
            t.year && n.set("lsj_year", t.year)) : "playback" === e ? (n.set("lsj_period", t.period || "daily"), 
            n.set("lsj_filter_by", t.filterBy || "high_score")) : n.set("lsj_period", t.period || "daily"), 
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
                if ("/advanced_search" === n && /^(top|fc2|playback)$/.test(a.get("laosiji_rank") || "")) return `${t.pathname}${t.search}`;
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
                if ("/rankings/playback" === n) return this._apiRankingShellUrl("playback", {
                    period: a.get("p") || a.get("period") || "daily",
                    filterBy: a.get("filter_by") || "high_score",
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
            if (!e) return !1;
            return "/advanced_search" !== location.pathname.replace(/\/+$/, "") && (location.replace(e), 
            !0);
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
            if (!/^(top|fc2|playback)$/.test(t)) return null;
            const n = e.get("lsj_type") || "", a = e.get("lsj_type_value") || "";
            let i = e.get("lsj_category") || "", r = e.get("lsj_year") || "";
            return i || "video_type" !== n || (i = a), r || "year" !== n || (r = a), i || (i = "all"), 
            {
                mode: t,
                params: e,
                page: Math.max(1, parseInt(e.get("lsj_page") || "1", 10) || 1),
                category: i,
                year: r,
                period: e.get("lsj_period") || "daily",
                filterBy: e.get("lsj_filter_by") || "high_score"
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
                return `\n                    <div class="javdb-api-shell-toolbar-group"><span class="javdb-api-shell-toolbar-label">分类</span>${t}</div>\n                    <div class="javdb-api-shell-toolbar-group"><span class="javdb-api-shell-toolbar-label">年份</span>${`<a class="${!e.year ? "is-active" : ""}" href="${this._apiRankingShellUrl("top", {
                    category: e.category,
                    year: "",
                    page: 1
                })}">全部年份</a>`}${Array.from({
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
            const t = [ [ "daily", "日榜" ], [ "weekly", "周榜" ], [ "monthly", "月榜" ] ].map(([t, n]) => `<a class="${e.period === t ? "is-active" : ""}" href="${this._apiRankingShellUrl(e.mode, {
                period: t,
                filterBy: e.filterBy,
                page: 1
            })}">${n}</a>`).join("");
            if ("playback" !== e.mode) return t;
            return `\n                <div class="javdb-api-shell-toolbar-group"><span class="javdb-api-shell-toolbar-label">周期</span>${t}</div>\n                <div class="javdb-api-shell-toolbar-group"><span class="javdb-api-shell-toolbar-label">排序</span>${[ [ "high_score", "高评分" ] ].map(([t, n]) => `<a class="${e.filterBy === t ? "is-active" : ""}" href="${this._apiRankingShellUrl("playback", {
                period: e.period,
                filterBy: t,
                page: 1
            })}">${n}</a>`).join("")}</div>\n            `;
        },
        _renderApiRankingPagination(e, t) {
            const n = e.page, a = t => "top" === e.mode ? this._apiRankingShellUrl("top", {
                category: e.category,
                year: e.year,
                page: t
            }) : "playback" === e.mode ? this._apiRankingShellUrl("playback", {
                period: e.period,
                filterBy: e.filterBy,
                page: t
            }) : this._apiRankingShellUrl("fc2", {
                period: e.period,
                page: t
            }), i = "top" === e.mode ? [ 1, 2, 3, 4, 5 ].map(e => `<a class="${e === n ? "is-active" : ""}" href="${a(e)}">${e}</a>`).join("") : `<span>第 ${n} 页</span>`;
            return `\n                <div class="javdb-api-shell-pagination">\n                    ${n > 1 ? `<a href="${a(n - 1)}">上一页</a>` : ""}\n                    ${i}\n                    ${t ? `<a href="${a(n + 1)}">下一页</a>` : ""}\n                </div>\n            `;
        },
        _renderApiRankingMovies(e) {
            return e.map(e => {
                const t = e?.movie || e, n = t?.origin_title || t?.title || "", a = t?.score ? `<span class="value">${this._escapeHtml(t.score)}分${t?.watched_count ? `, 由${this._escapeHtml(t.watched_count)}人評價` : ""}</span>` : "", i = [ t?.has_cnsub ? '<span class="tag is-warning">中文字幕</span>' : "", Number(t?.magnets_count || 0) > 0 ? '<span class="tag is-success">含磁鏈</span>' : "", Number(t?.magnets_count || 0) <= 0 ? '<span class="tag">無磁鏈</span>' : "", t?.new_magnets ? '<span class="tag is-info">今日新種</span>' : "" ].filter(Boolean).join(""), r = /^FC2[-_]/i.test(String(t?.number || "")) ? this._apiDetailShellUrl(t?.id || "") : `/v/${this._escapeHtml(t?.id || "")}`;
                return `\n                    <div class="item" data-javdb-api-shell-item="1">\n                        <a href="${this._escapeHtml(r)}" class="box" title="${this._escapeHtml(n)}">\n                            <div class="cover ">\n                                <img loading="lazy" src="${this._escapeHtml((o = t?.cover_url || t?.thumb_url || "", 
                String(o || "").replace(/https:\/\/.*?\/rhe951l4q/g, "https://c0.jdbstatic.com")))}" alt="">\n                            </div>\n                            <div class="video-title"><strong>${this._escapeHtml(t?.number || "")}</strong> ${this._escapeHtml(n)}</div>\n                            <div class="score">${a}</div>\n                            <div class="meta">${this._escapeHtml(t?.release_date || "")}</div>\n                            <div class="tags has-addons">${i}</div>\n                        </a>\n                    </div>\n                `;
                var o;
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
                const a = n(e?.large_url || e?.url || e?.thumb_url || ""), i = n(e?.thumb_url || e?.large_url || e?.url || "");
                return a && i ? `\n                    <a class="tile-item" href="${this._escapeHtml(a)}" data-fancybox="gallery" data-caption="预览图 ${t + 1}">\n                        <img src="${this._escapeHtml(i)}" loading="lazy" alt="预览图 ${t + 1}">\n                    </a>` : "";
            }).filter(Boolean).join("");
            return a ? `\n                <div class="columns javdb-api-detail-preview-columns">\n                    <div class="column">\n                        <article class="message video-panel">\n                            <div class="message-body">\n                                <div class="tile-images preview-images">${a}</div>\n                            </div>\n                        </article>\n                    </div>\n                </div>` : "";
        },
        _renderApiDetailPage(e) {
            const t = String(e?.number || ""), n = e?.origin_title || e?.title || "", a = (Array.isArray(e?.actors) ? e.actors : []).map(e => e?.name || e).filter(Boolean), i = String(e?.cover_url || e?.thumb_url || "" || "").replace(/https:\/\/.*?\/rhe951l4q/g, "https://c0.jdbstatic.com");
            return `\n                <div class="video-detail javdb-api-detail" data-javdb-api-detail="1">\n                    <h2 class="title is-4 javdb-api-detail-title">\n                        <strong>${this._escapeHtml(t)} </strong>\n                        <strong class="current-title">${this._escapeHtml(n)}</strong>\n                    </h2>\n                    <div class="video-meta-panel">\n                        <div class="columns is-desktop">\n                            <div class="column column-video-cover">\n                                <a data-fancybox="gallery" href="${this._escapeHtml(i)}">\n                                    <img src="${this._escapeHtml(i)}" class="video-cover" alt="${this._escapeHtml(n)}">\n                                </a>\n                            </div>\n                            <div class="column">\n                                <nav class="panel movie-panel-info">\n                                    <div class="panel-block first-block"><strong>番號:</strong>&nbsp;<span class="value">${this._escapeHtml(t)}</span>&nbsp;<a class="button is-white copy-to-clipboard" title="複製番號" data-clipboard-text="${this._escapeHtml(t)}"><span class="icon is-small"><i class="icon-copy"></i></span></a></div>\n                                    ${this._renderApiDetailField("標題", n)}\n                                    ${this._renderApiDetailField("日期", e?.release_date)}\n                                    ${this._renderApiDetailField("時長", e?.duration ? `${e.duration} 分鐘` : "")}\n                                    ${this._renderApiDetailField("評分", e?.score ? `${e.score} / ${e?.watched_count || 0} 人` : "")}\n                                    ${this._renderApiDetailField("片商", e?.maker_name || e?.publisher_name)}\n                                    ${this._renderApiDetailField("系列", e?.series_name)}\n                                    ${this._renderApiDetailField("導演", e?.director_name)}\n                                    ${this._renderApiDetailField("演員", a)}\n                                    ${this._renderApiDetailTags(e?.tags)}\n                                </nav>\n                            </div>\n                        </div>\n                    </div>\n                    ${this._renderApiDetailImages(e?.preview_images)}\n                </div>\n            `;
        },
        async _initApiDetailShellPage() {
            const e = this._getApiDetailShellMode();
            if (!e) return !1;
            const t = document.querySelector("body > section > div, .section .container");
            if (!t) return !1;
            this._ensureApiDetailShellStyle(), t.innerHTML = '<div class="javdb-api-shell-status">正在加载 API 详情...</div>';
            const n = t.querySelector(".javdb-api-shell-status");
            try {
                const n = await f.javdbApi.movieDetail(e.movieId);
                if (1 !== n.success) throw new Error(n.message || n.action || "JavDB API 请求失败");
                const a = n?.data?.movie;
                if (!a?.number) throw new Error("没有查询到详情数据");
                t.innerHTML = this._renderApiDetailPage(a);
                const i = h(a.number);
                return this._insertCopyButton(i), this._ensureDetailLayout(), this._insertMagnet(i), 
                r.apply("javdb"), o.apply(), se.refresh({
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
            const n = "top" === e.mode ? "Top250" : "playback" === e.mode ? "热播" : "FC2 排行榜";
            t.innerHTML = `\n                <div class="javdb-api-shell">\n                    <div class="javdb-api-shell-head">\n                        <div class="javdb-api-shell-title">${n}</div>\n                    </div>\n                    <div class="javdb-api-shell-toolbar">${this._renderApiRankingToolbar(e)}</div>\n                    <div class="javdb-api-shell-status">正在加载 API 数据...</div>\n                    <div class="movie-list h cols-4 vcols-8"></div>\n                    <div class="javdb-api-shell-pagination-wrap"></div>\n                </div>\n            `;
            const a = t.querySelector(".javdb-api-shell-status"), i = t.querySelector(".movie-list"), o = t.querySelector(".javdb-api-shell-pagination-wrap");
            try {
                let t;
                if ("top" === e.mode) {
                    if (!f.javdbApi.token()) return a.classList.add("is-error"), a.textContent = "Top250 API 需要 JavDB App token。本地未找到 jhs_appAuthorization / javdb_appAuthorization / javdb_app_authorization。", 
                    !0;
                    t = await f.javdbApi.top250({
                        category: e.category,
                        year: e.year,
                        page: e.page,
                        limit: 50
                    });
                } else t = "playback" === e.mode ? await f.javdbApi.playback({
                    period: e.period,
                    filterBy: e.filterBy,
                    page: e.page,
                    limit: 40
                }) : await f.javdbApi.fc2({
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
                r.apply("javdb"), se.refreshListPage(), !0;
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
            i.apply("javdb"), n.forEach(e => this._decorateCard(e)), this._rewriteFc2DetailLinks(e), 
            t && GM_addStyle("\n                    .jav-card-grid {\n                        --jav-card-title-size: 15px;\n                        --jav-card-title-line-height: 1.5;\n                        --jav-card-title-lines: 2;\n                        display: grid !important;\n                        grid-template-columns: repeat(var(--jav-card-columns, 5), minmax(0, 1fr)) !important;\n                        gap: 14px !important;\n                        align-items: stretch !important;\n                        width: 100% !important;\n                        box-sizing: border-box !important;\n                    }\n                    .jav-card {\n                        float: none !important;\n                        display: block !important;\n                        width: auto !important;\n                        height: 100% !important;\n                        max-height: none !important;\n                        min-width: 0 !important;\n                        margin: 0 !important;\n                        padding: 0 !important;\n                        box-sizing: border-box !important;\n                        text-align: left !important;\n                        background: #fff !important;\n                        border: 1px solid #e5e7eb !important;\n                        border-radius: 6px !important;\n                        overflow: hidden !important;\n                        box-shadow: 0 1px 4px rgba(15, 23, 42, .08) !important;\n                        transform: translateZ(0) !important;\n                        transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease !important;\n                        will-change: transform !important;\n                    }\n                    .jav-card:hover {\n                        border-color: rgba(37, 99, 235, .35) !important;\n                        box-shadow: 0 10px 24px rgba(15, 23, 42, .16) !important;\n                        transform: translateY(-4px) scale(1.018) !important;\n                        z-index: 2 !important;\n                    }\n                    .jav-card-link {\n                        display: flex !important;\n                        flex-direction: column !important;\n                        height: 100% !important;\n                        max-height: none !important;\n                        overflow: hidden !important;\n                        color: #2563eb !important;\n                        text-decoration: none !important;\n                    }\n                    .jav-card-link:visited {\n                        color: #7c3aed !important;\n                    }\n                    .jav-card-cover {\n                        display: block !important;\n                        width: 100% !important;\n                        height: auto !important;\n                        aspect-ratio: 800 / 538 !important;\n                        overflow: hidden !important;\n                        background: #f8fafc !important;\n                        border-bottom: 1px solid #f1f5f9 !important;\n                    }\n                    .jav-card-image {\n                        display: block !important;\n                        width: 100% !important;\n                        height: 100% !important;\n                        max-height: none !important;\n                        object-fit: cover !important;\n                        object-position: center center !important;\n                        background: #f8fafc !important;\n                        border: 0 !important;\n                    }\n                    .jav-card-title {\n                        display: block !important;\n                        width: 100% !important;\n                        max-width: none !important;\n                        height: calc((var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 2) * 1em) + 16px) !important;\n                        max-height: calc((var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 2) * 1em) + 16px) !important;\n                        box-sizing: border-box !important;\n                        flex: 0 0 auto !important;\n                        min-height: calc((var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 2) * 1em) + 16px) !important;\n                        margin: 0 !important;\n                        padding: 7px 8px 9px !important;\n                        overflow: hidden !important;\n                        color: inherit !important;\n                        font-size: var(--jav-card-title-size, 15px) !important;\n                        line-height: var(--jav-card-title-line-height, 1.5) !important;\n                        text-align: left !important;\n                        white-space: normal !important;\n                        word-break: break-word !important;\n                    }\n                    .javdb-card-headline {\n                        display: -webkit-box !important;\n                        -webkit-box-orient: vertical !important;\n                        -webkit-line-clamp: var(--jav-card-title-lines, 2) !important;\n                        line-clamp: var(--jav-card-title-lines, 2) !important;\n                        max-height: calc(var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 2) * 1em) !important;\n                        overflow: hidden !important;\n                        text-overflow: ellipsis !important;\n                        white-space: normal !important;\n                        word-break: break-word !important;\n                    }\n                    .jav-card-title strong {\n                        color: inherit !important;\n                        font-size: 16px !important;\n                        font-weight: 800 !important;\n                    }\n                    .javdb-card-grid {\n                        --jav-card-columns: 5;\n                    }\n                    .javdb-card-grid .item.javdb-grid-card {\n                        position: static !important;\n                        width: auto !important;\n                        float: none !important;\n                        margin: 0 !important;\n                    }\n                    .javdb-card-grid .item .javdb-card-link.box {\n                        width: 100% !important;\n                        min-width: 0 !important;\n                        margin: 0 !important;\n                        padding: 0 !important;\n                        background: #fff !important;\n                        box-shadow: none !important;\n                        border-radius: 0 !important;\n                        overflow: hidden !important;\n                    }\n                    .javdb-card-grid .item .javdb-cover-frame.cover {\n                        margin: 0 !important;\n                        height: auto !important;\n                    }\n                    .javdb-card-grid .item .javdb-card-image {\n                        height: 100% !important;\n                        margin: 0 !important;\n                    }\n                    .javdb-card-grid .item .javdb-card-title .jav-pan115-badge {\n                        display: inline-flex !important;\n                        width: auto !important;\n                        max-width: max-content !important;\n                        float: none !important;\n                        vertical-align: middle !important;\n                        margin: 0 6px 4px 0 !important;\n                    }\n                    .javdb-card-score,\n                    .javdb-card-meta,\n                    .javdb-card-tags {\n                        padding-left: 8px !important;\n                        padding-right: 8px !important;\n                    }\n                    .javdb-card-score {\n                        margin-top: 2px !important;\n                        color: #64748b !important;\n                        font-size: 12px !important;\n                        line-height: 1.45 !important;\n                    }\n                    .javdb-card-score .value {\n                        color: inherit !important;\n                        font-size: inherit !important;\n                    }\n                    .javdb-card-meta {\n                        margin-top: 4px !important;\n                        color: #94a3b8 !important;\n                        font-size: 12px !important;\n                        line-height: 1.45 !important;\n                    }\n                    .javdb-card-tags {\n                        display: flex !important;\n                        flex-wrap: wrap !important;\n                        gap: 6px !important;\n                        margin-top: auto !important;\n                        padding-top: 8px !important;\n                        padding-bottom: 10px !important;\n                    }\n                    .javdb-card-tags .tag {\n                        margin: 0 !important;\n                    }\n                    @media (max-width: 1100px) {\n                        .javdb-card-grid { --jav-card-columns: 4; }\n                    }\n                    @media (max-width: 820px) {\n                        .javdb-card-grid { --jav-card-columns: 3; }\n                    }\n                    @media (max-width: 560px) {\n                        .javdb-card-grid { --jav-card-columns: 2; gap: 10px !important; }\n                    }\n                "), 
            setTimeout(() => {
                se.refreshListPage();
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
            const i = e.querySelector(".video-title");
            if (i?.classList.add("jav-card-title", "javdb-card-title"), i && !i.querySelector(".javdb-card-headline")) {
                const e = document.createElement("span");
                for (e.className = "javdb-card-headline"; i.firstChild; ) e.appendChild(i.firstChild);
                i.appendChild(e);
            }
            const r = e.querySelector(".score");
            r?.classList.add("javdb-card-score");
            const o = e.querySelector(".meta");
            o?.classList.add("javdb-card-meta");
            const s = e.querySelector(".tags");
            s?.classList.add("javdb-card-tags"), q.attach(e);
        },
        _insertTopSettingsButton() {
            const e = document.querySelector("#navbar-menu-user .navbar-end");
            if (!e || e.querySelector(".javdb-top-settings-btn")) return;
            const t = document.createElement("a");
            t.href = "javascript:void(0)", t.className = "navbar-item javdb-top-settings-btn", 
            t.textContent = "老司机设置", t.title = "打开老司机设置", t.addEventListener("click", e => {
                e.preventDefault(), e.stopPropagation(), b.open(e.currentTarget);
            });
            const n = e.querySelector('a[href="/users/profile"]')?.closest(".navbar-item.has-dropdown");
            e.insertBefore(t, n || null), "1" !== document.documentElement.dataset.laosijiJavdbTopSettingsStyle && (document.documentElement.dataset.laosijiJavdbTopSettingsStyle = "1", 
            GM_addStyle("\n                #navbar-menu-user .javdb-top-settings-btn {\n                    color: #2563eb !important;\n                    font-weight: 700 !important;\n                }\n                #navbar-menu-user .javdb-top-settings-btn:hover {\n                    color: #1d4ed8 !important;\n                    background: rgba(37, 99, 235, .08) !important;\n                }\n            "));
        },
        _insertCopyButton(e) {
            const t = document.querySelector(".movie-panel-info");
            if (!t || !e) return;
            const n = t.querySelector(".copy-to-clipboard, [data-clipboard-text]");
            v(n?.closest(".panel-block")?.querySelector(".value") || [ ...t.querySelectorAll(".panel-block .value") ].find(t => t.textContent.trim().toUpperCase().includes(h(e))), e, n);
        },
        _ensureDetailLayout() {
            const e = document.querySelector(".column.column-video-cover"), t = document.querySelector(".movie-panel-info");
            if (!e || !t) return null;
            const n = t.closest(".column") || t, a = e.closest(".jav-flex-container"), i = a || e.parentElement;
            if (!i) return null;
            let r = a || i.querySelector(":scope > .jav-flex-container");
            if (r) {
                if (e.parentElement !== r && r.insertBefore(e, r.firstChild), n.parentElement !== r) {
                    const e = r.querySelector(":scope > .jav-nong-slot");
                    r.insertBefore(n, e || null);
                }
            } else r = document.createElement("div"), r.className = "jav-flex-container", r.appendChild(e), 
            r.appendChild(n), i.appendChild(r);
            r.style.setProperty("display", "flex", "important"), r.style.setProperty("gap", "20px", "important"), 
            r.style.setProperty("align-items", "flex-start", "important"), r.style.setProperty("width", "100%", "important"), 
            r.style.setProperty("margin-top", "16px", "important");
            const s = o.defaultCss("javdb");
            r.style.setProperty("--javdb-cover-flex", r.style.getPropertyValue("--javdb-cover-flex") || s.cover), 
            r.style.setProperty("--javdb-info-flex", r.style.getPropertyValue("--javdb-info-flex") || s.info), 
            r.style.setProperty("--javdb-magnet-flex", r.style.getPropertyValue("--javdb-magnet-flex") || s.magnet), 
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
            c.style.setProperty("max-width", "100%", "important")), r;
        },
        _insertMagnet(e) {
            if (!a.magnetTable) return;
            document.querySelectorAll(".jav-nong-slot").forEach(e => e.remove());
            const t = this._ensureDetailLayout();
            if (!t) return;
            const n = document.createElement("div");
            n.className = "jav-nong-slot", n.style.setProperty("flex", "var(--javdb-magnet-flex) 1 0", "important"), 
            n.style.setProperty("min-width", "0", "important"), n.style.setProperty("align-self", "flex-start", "important"), 
            n.style.setProperty("overflow", "hidden", "important");
            const i = f.createMagnetWidget(e);
            n.appendChild(i), t.appendChild(n);
        }
    }, w = {
        match: () => /(javlibrary|javlib|r86m|s87n)/i.test(location.hostname),
        isDetailPage: () => !!document.querySelector("#video_id .text") && !!document.querySelector('meta[name="keywords"]'),
        isHomePage() {
            return document.body?.classList.contains("main") && !this.isDetailPage() && !!document.querySelector("#rightcolumn > .videothumblist .videos");
        },
        getVid() {
            const e = document.querySelector("#video_id .text");
            if (e?.textContent?.trim()) return h(e.textContent.trim());
            const t = document.title.match(/([A-Z0-9]+-\d+)/i);
            return t ? t[1].toUpperCase() : "";
        },
        initPage(e) {
            if (this._insertTopSettingsButton(), !this.isDetailPage()) return this._initListPage(), 
            void (this.isHomePage() && this._initHomePage());
            e && (document.querySelector(".socialmedia")?.remove(), this._insertCopyButton(e), 
            GM_addStyle("\n                #leftmenu { display: none; }\n                #rightcolumn { margin: 0 !important; width: 100% !important; float: none !important; }\n                #content { padding-top: 0; width: 100%; margin: 0 !important; }\n                #video_title h3.post-title.text,\n                #video_title h3.post-title.text a {\n                    font-size: 20px !important;\n                    line-height: 1.45 !important;\n                }\n                #video_jacket img { max-width: 100%; height: auto; }\n                #video_info { text-align: left; font: 14px Arial; overflow: hidden; word-break: break-word; margin: 0 !important; width: 100% !important; float: none !important; }\n                #video_info .item,\n                #video_info table,\n                #video_info tr,\n                #video_info td,\n                #video_info .header,\n                #video_info .text {\n                    text-align: left !important;\n                }\n                #video_info table {\n                    margin-left: 0 !important;\n                    margin-right: auto !important;\n                }\n                #video_info .jav-jump-btn-group {\n                    justify-content: flex-start !important;\n                }\n                #video_reviews,\n                #video_comments,\n                #video_review_edit,\n                #video_comment_edit {\n                    width: 100% !important;\n                    max-width: 100% !important;\n                    box-sizing: border-box !important;\n                    overflow-x: hidden !important;\n                }\n                #video_reviews .comment,\n                #video_comments .comment {\n                    width: 100% !important;\n                    max-width: 100% !important;\n                    table-layout: fixed !important;\n                    box-sizing: border-box !important;\n                }\n                #video_reviews .comment td,\n                #video_comments .comment td {\n                    box-sizing: border-box !important;\n                    vertical-align: top !important;\n                }\n                #video_reviews .comment td.info,\n                #video_comments .comment td.info {\n                    width: 132px !important;\n                }\n                #video_reviews .comment td.scores,\n                #video_comments .comment td.scores {\n                    width: 92px !important;\n                }\n                #video_reviews .comment td.t,\n                #video_comments .comment td.t {\n                    width: auto !important;\n                    min-width: 0 !important;\n                    overflow: hidden !important;\n                }\n                #video_reviews .comment td.t .text,\n                #video_comments .comment td.t .text,\n                #video_reviews .comment td.t textarea,\n                #video_comments .comment td.t textarea {\n                    width: auto !important;\n                    max-width: 100% !important;\n                    box-sizing: border-box !important;\n                    white-space: normal !important;\n                    word-break: break-word !important;\n                    overflow-wrap: anywhere !important;\n                }\n                .jav-nong-slot .jav-nong-wrapper { width: 560px; max-width: 100%; margin-top: 16px; }\n            "), 
            this._ensureDetailLayout(), this._insertMagnet(e));
        },
        _initListPage() {
            const e = document.querySelector(".videothumblist .videos");
            if (!e) return;
            const t = "1" !== e.dataset.laosijiGrid, n = [ ...e.querySelectorAll(':scope > .video:not([data-laosiji-grid-card="1"])') ];
            (n.length || t) && (e.dataset.laosijiGrid = "1", e.classList.add("jav-card-grid", "javlib-card-grid"), 
            i.apply("javlib"), n.forEach(e => {
                e.dataset.laosijiGridCard = "1", e.classList.add("jav-card", "javlib-grid-card");
                const t = e.querySelector(":scope > a[href]:not(.emby-javlibrary-list-badge)");
                t?.classList.add("jav-card-link", "javlib-card-link"), t && !t.querySelector(".jav-pan115-badge") && (delete t.dataset.pan115Checked, 
                delete t.dataset.pan115HasBadge);
                const n = e.querySelector(".id"), a = e.querySelector(".title");
                if (a?.classList.add("jav-card-title", "javlib-card-title"), n && a && !a.querySelector(".javlib-card-headline")) {
                    const e = n.textContent.trim(), t = a.textContent.trim();
                    a.textContent = "";
                    const i = document.createElement("span");
                    i.className = "javlib-card-code-row";
                    const r = document.createElement("strong");
                    r.className = "javlib-card-code", r.textContent = e, i.appendChild(r);
                    const o = document.createElement("span");
                    o.className = "javlib-card-headline", o.textContent = t;
                    const s = document.createElement("span");
                    s.className = "javlib-card-footer", a.appendChild(i), a.appendChild(o), a.appendChild(s), 
                    a.dataset.laosijiCodeMerged = "1";
                }
                const i = e.querySelector("img[src]");
                if (!i) return;
                const r = i.getAttribute("src") || "", o = r.replace(/ps\.jpg(?:([?#].*)?)$/i, "pl.jpg$1");
                if (o !== r && "1" !== i.dataset.laosijiCoverPreloaded && "1" !== i.dataset.laosijiCoverLoading) {
                    i.dataset.laosijiCoverLoading = "1";
                    const e = new Image;
                    e.onload = () => {
                        i.dataset.laosijiCoverPreloaded = "1", delete i.dataset.laosijiCoverLoading, i.classList.add("javlib-cover-swapping"), 
                        setTimeout(() => {
                            i.src = o, i.setAttribute("src", o), requestAnimationFrame(() => {
                                i.classList.remove("javlib-cover-swapping");
                            });
                        }, 90);
                    }, e.onerror = () => {
                        i.dataset.laosijiCoverPreloaded = "1", delete i.dataset.laosijiCoverLoading;
                    }, e.src = o;
                }
                if (i.removeAttribute("width"), i.removeAttribute("height"), i.classList.add("jav-card-image", "javlib-card-image"), 
                i.closest(".javlib-cover-frame")) i.closest(".javlib-cover-frame")?.classList.add("jav-card-cover"); else {
                    const e = document.createElement("div");
                    e.className = "jav-card-cover javlib-cover-frame", i.parentNode.insertBefore(e, i), 
                    e.appendChild(i);
                }
            }), t && GM_addStyle("\n                    .jav-card-grid {\n                        --jav-card-title-size: 15px;\n                        --jav-card-title-line-height: 1.5;\n                        --jav-card-title-lines: 2;\n                        display: grid !important;\n                        grid-template-columns: repeat(var(--jav-card-columns, 5), minmax(0, 1fr)) !important;\n                        gap: 14px !important;\n                        align-items: stretch !important;\n                        width: 100% !important;\n                        box-sizing: border-box !important;\n                    }\n                    .jav-card {\n                        float: none !important;\n                        display: block !important;\n                        width: auto !important;\n                        height: 100% !important;\n                        max-height: none !important;\n                        min-width: 0 !important;\n                        margin: 0 !important;\n                        padding: 0 !important;\n                        box-sizing: border-box !important;\n                        text-align: left !important;\n                        background: #fff !important;\n                        border: 1px solid #e5e7eb !important;\n                        border-radius: 6px !important;\n                        overflow: hidden !important;\n                        box-shadow: 0 1px 4px rgba(15, 23, 42, .08) !important;\n                        transform: translateZ(0) !important;\n                        transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease !important;\n                        will-change: transform !important;\n                    }\n                    .jav-card:hover {\n                        border-color: rgba(37, 99, 235, .35) !important;\n                        box-shadow: 0 10px 24px rgba(15, 23, 42, .16) !important;\n                        transform: translateY(-4px) scale(1.018) !important;\n                        z-index: 2 !important;\n                    }\n                    .jav-card-link {\n                        display: flex !important;\n                        flex-direction: column !important;\n                        height: 100% !important;\n                        max-height: none !important;\n                        overflow: hidden !important;\n                        color: #2563eb !important;\n                        text-decoration: none !important;\n                    }\n                    .jav-card-link:visited {\n                        color: #7c3aed !important;\n                    }\n                    .javlib-card-link:visited .jav-card-title {\n                        background: #fbf7ff !important;\n                    }\n                    .javlib-card-link:visited .javlib-card-code {\n                        background: #f3e8ff !important;\n                    }\n                    .jav-card-cover {\n                        display: block !important;\n                        width: 100% !important;\n                        height: auto !important;\n                        aspect-ratio: 800 / 538 !important;\n                        overflow: hidden !important;\n                        background: #f8fafc !important;\n                        border-bottom: 1px solid #f1f5f9 !important;\n                    }\n                    .jav-card-image {\n                        display: block !important;\n                        width: 100% !important;\n                        height: 100% !important;\n                        max-height: none !important;\n                        object-fit: cover !important;\n                        object-position: center center !important;\n                        background: #f8fafc !important;\n                        border: 0 !important;\n                        transition: opacity .18s ease !important;\n                    }\n                    .javlib-cover-swapping {\n                        opacity: .42 !important;\n                    }\n                    .jav-card-title {\n                        --javlib-title-line-height: 22px;\n                        display: flex !important;\n                        flex-direction: column !important;\n                        gap: 6px !important;\n                        width: 100% !important;\n                        max-width: none !important;\n                        height: calc((var(--javlib-title-line-height) * var(--jav-card-title-lines, 2)) + 54px) !important;\n                        max-height: calc((var(--javlib-title-line-height) * var(--jav-card-title-lines, 2)) + 54px) !important;\n                        box-sizing: border-box !important;\n                        flex: 0 0 auto !important;\n                        min-height: calc((var(--javlib-title-line-height) * var(--jav-card-title-lines, 2)) + 54px) !important;\n                        margin: 0 !important;\n                        padding: 9px 10px 10px !important;\n                        overflow: hidden !important;\n                        text-overflow: ellipsis !important;\n                        color: inherit !important;\n                        font-size: var(--jav-card-title-size, 15px) !important;\n                        line-height: var(--javlib-title-line-height) !important;\n                        text-align: left !important;\n                        white-space: normal !important;\n                        word-break: break-word !important;\n                    }\n                    .jav-card-title:has(.javlib-card-footer > *) {\n                        height: calc((var(--javlib-title-line-height) * var(--jav-card-title-lines, 2)) + 82px) !important;\n                        max-height: calc((var(--javlib-title-line-height) * var(--jav-card-title-lines, 2)) + 82px) !important;\n                        min-height: calc((var(--javlib-title-line-height) * var(--jav-card-title-lines, 2)) + 82px) !important;\n                    }\n                    .javlib-card-code-row {\n                        display: flex !important;\n                        align-items: center !important;\n                        flex: 0 0 22px !important;\n                        height: 22px !important;\n                        max-height: 22px !important;\n                        min-height: 22px !important;\n                        overflow: hidden !important;\n                    }\n                    .javlib-card-headline {\n                        display: -webkit-box !important;\n                        -webkit-box-orient: vertical !important;\n                        -webkit-line-clamp: var(--jav-card-title-lines, 2) !important;\n                        line-clamp: var(--jav-card-title-lines, 2) !important;\n                        height: calc(var(--javlib-title-line-height) * var(--jav-card-title-lines, 2)) !important;\n                        max-height: calc(var(--javlib-title-line-height) * var(--jav-card-title-lines, 2)) !important;\n                        min-height: calc(var(--javlib-title-line-height) * var(--jav-card-title-lines, 2)) !important;\n                        overflow: hidden !important;\n                        text-overflow: ellipsis !important;\n                        white-space: normal !important;\n                        word-break: break-word !important;\n                        color: inherit !important;\n                        flex: 0 0 calc(var(--javlib-title-line-height) * var(--jav-card-title-lines, 2)) !important;\n                        line-height: var(--javlib-title-line-height) !important;\n                    }\n                    .javlib-card-code {\n                        display: inline-flex !important;\n                        align-items: center !important;\n                        max-width: 100% !important;\n                        padding: 2px 7px !important;\n                        border-radius: 999px !important;\n                        background: #eef2ff !important;\n                        color: inherit !important;\n                        font-size: 14px !important;\n                        line-height: 1.35 !important;\n                        font-weight: 800 !important;\n                        letter-spacing: 0 !important;\n                        overflow: hidden !important;\n                        text-overflow: ellipsis !important;\n                        white-space: nowrap !important;\n                    }\n                    .javlib-card-footer {\n                        display: none !important;\n                        align-items: center !important;\n                        gap: 6px !important;\n                        min-height: 0 !important;\n                        margin-top: auto !important;\n                        overflow: hidden !important;\n                    }\n                    .javlib-card-footer:not(:empty) {\n                        display: flex !important;\n                        flex: 0 0 22px !important;\n                        height: 22px !important;\n                        max-height: 22px !important;\n                        min-height: 22px !important;\n                    }\n                    .videothumblist { width: 100% !important; }\n                    .videothumblist .videos.javlib-card-grid {\n                        --jav-card-columns: 5;\n                    }\n                    .videothumblist .video.javlib-grid-card .id {\n                        display: none !important;\n                    }\n                    .videothumblist .video.javlib-grid-card .toolbar {\n                        display: none !important;\n                    }\n                    @media (max-width: 1100px) {\n                        .videothumblist .videos.javlib-card-grid { --jav-card-columns: 4; }\n                    }\n                    @media (max-width: 820px) {\n                        .videothumblist .videos.javlib-card-grid { --jav-card-columns: 3; }\n                    }\n                    @media (max-width: 560px) {\n                        .videothumblist .videos.javlib-card-grid { --jav-card-columns: 2; gap: 10px !important; }\n                    }\n                "), 
            setTimeout(() => {
                se.refreshListDecorations();
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
                e.preventDefault(), e.stopPropagation(), b.open(e.currentTarget);
            });
            const n = e.querySelector('a[href*="myaccount.php"]'), a = document.createTextNode(" | ");
            n ? n.after(a, t) : e.append(a, t), "1" !== document.documentElement.dataset.laosijiJavlibTopSettingsStyle && (document.documentElement.dataset.laosijiJavlibTopSettingsStyle = "1", 
            GM_addStyle("\n                #topmenu .menutext .javlib-top-settings-btn,\n                .menutext .javlib-top-settings-btn {\n                    color: #2563eb !important;\n                    font-weight: 700 !important;\n                    text-decoration: none !important;\n                }\n                #topmenu .menutext .javlib-top-settings-btn:hover,\n                .menutext .javlib-top-settings-btn:hover {\n                    color: #1d4ed8 !important;\n                    text-decoration: underline !important;\n                }\n            "));
        },
        _insertCopyButton(e) {
            v(document.querySelector("#video_id .text"), e);
        },
        _ensureDetailLayout() {
            const e = document.getElementById("video_jacket_info");
            if (!e) return null;
            const t = e.querySelector("tr");
            if (!t) return null;
            e.style.setProperty("width", "100%", "important"), e.style.setProperty("display", "block", "important"), 
            t.style.setProperty("display", "flex", "important"), t.style.setProperty("gap", "20px", "important"), 
            t.style.setProperty("align-items", "flex-start", "important"), t.style.setProperty("width", "100%", "important");
            const n = o.defaultCss("javlib");
            t.style.setProperty("--javlib-cover-flex", t.style.getPropertyValue("--javlib-cover-flex") || n.cover), 
            t.style.setProperty("--javlib-info-flex", t.style.getPropertyValue("--javlib-info-flex") || n.info), 
            t.style.setProperty("--javlib-magnet-flex", t.style.getPropertyValue("--javlib-magnet-flex") || n.magnet);
            const a = t.querySelectorAll("td");
            a[0] && (a[0].style.setProperty("flex", "var(--javlib-cover-flex) 1 0", "important"), 
            a[0].style.setProperty("min-width", "0", "important"), a[0].style.setProperty("vertical-align", "top", "important")), 
            a[1] && (a[1].style.setProperty("flex", "var(--javlib-info-flex) 1 0", "important"), 
            a[1].style.setProperty("min-width", "0", "important"), a[1].style.setProperty("vertical-align", "top", "important"), 
            a[1].style.setProperty("overflow", "hidden", "important"), a[1].style.setProperty("word-break", "break-word", "important"));
            const i = document.getElementById("video_jacket_img");
            return i && (i.removeAttribute("width"), i.removeAttribute("height"), i.style.setProperty("width", "100%", "important"), 
            i.style.setProperty("height", "auto", "important"), i.style.setProperty("max-width", "100%", "important")), 
            t;
        },
        _insertMagnet(e) {
            if (!a.magnetTable) return;
            document.querySelectorAll(".jav-nong-slot").forEach(e => e.remove());
            const t = this._ensureDetailLayout();
            if (!t) return;
            const n = document.createElement("td");
            n.className = "jav-nong-slot javlib-nong-slot", n.style.cssText = "flex:var(--javlib-magnet-flex) 1 0;min-width:0;vertical-align:top;align-self:flex-start;";
            const i = document.createElement("div");
            i.style.cssText = "display:inline-block;";
            const r = f.createMagnetWidget(e);
            i.appendChild(r), n.appendChild(i), t.appendChild(n);
        }
    }, j = {
        list: [ x, y, w ],
        javdbGuardsReady: !1,
        current() {
            return this.list.find(e => e.match()) || null;
        },
        isDetailPage: () => function() {
            if (/javbus\.com/i.test(location.hostname)) return /^\/(?:[a-z]{2}\/)?(?:[A-Z]{2,15}-?\d{2,10}(?:-\d{1,3})?|[A-Z]{2,10}\d{3,6}|FC2(?:-PPV)?-\d{6,9})\/?$/i.test(location.pathname);
            return Y.some(e => e.match(window.location.href));
        }(),
        getListCards: (e = document) => [ ...e.querySelectorAll(".javbus-card-grid > .item, .javdb-card-grid > .item, .videothumblist .videos.javlib-card-grid > .video") ],
        getCardCover: e => e?.querySelector(".jav-card-cover") || null,
        getCardCode(e) {
            if (!e) return "";
            const t = e.querySelector(".javbus-card-code, .javlib-card-code, .id, [data-code]")?.textContent?.trim();
            if (t) {
                const e = C.extractCode(t) || C.normalizeCode(t);
                if (e) return e;
            }
            const n = [ e.querySelector(".javdb-card-headline")?.textContent, e.querySelector(".javlib-card-headline")?.textContent, e.querySelector(".javbus-card-headline")?.textContent, e.querySelector(".video-title")?.textContent, e.querySelector(".title")?.textContent, e.querySelector("a[title]")?.getAttribute("title"), e.textContent ].filter(Boolean).join(" ");
            return C.extractCode(n) || "";
        },
        getInfiniteScrollContainer: (e, t = document) => "javbus" === e ? t === document ? x._getGridContainer() : t.querySelector("#waterfall") : "javdb" === e ? t.querySelector(".movie-list") || t.querySelector(".movies") || t.querySelector(".grid") : null,
        getInfiniteScrollConfig(e = document, t = location.href) {
            if (x.match()) {
                if (x.isActorIndexPage(t)) return null;
                const n = this.getInfiniteScrollContainer("javbus", e), a = e.querySelector("a#next[href]");
                return n && a ? {
                    site: "javbus",
                    container: n,
                    nextUrl: new URL(a.getAttribute("href"), t).href,
                    itemSelector: "#waterfall > .item",
                    paginationSelector: ".pagination"
                } : null;
            }
            if (y.match()) {
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
            "javbus" === e && x._decorateCard?.(t), "javdb" === e && y._decorateCard?.(t), q.attach(t);
        },
        reflowInfiniteScroll(e, t) {
            if ("javbus" === e) {
                const e = this.getInfiniteScrollContainer("javbus") || t;
                return e?.querySelectorAll(":scope > .item").forEach(e => x._decorateCard?.(e)), 
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
            const n = [ e.getAttribute("title"), e.getAttribute("aria-label"), e.textContent, t ].filter(Boolean).join(" "), a = C.extractCode(n), i = P.extractCode(n, a);
            if (!a || !i) return null;
            const r = (e.textContent || e.getAttribute("title") || "").trim(), o = r.length > 0;
            if (!o) return null;
            const s = /\/v\/\w+/i.test(t) || /(?:^|\/|\.)jav\w+\.html(?:[?#].*)?$/i.test(t) || /\/videos\/[a-z0-9-]+\/?/i.test(t) || /\/(?:[a-z]{2,15}-\d{2,10}|fc2[-_]?ppv[-_]?\d{6,9})\/?$/i.test(t) || /\/(?:[a-z]{2,15}\d{3,6})\/?$/i.test(t) || /(?:movie|video|detail|view|jav)/i.test(t), l = !!e.closest(".movie-list, .movies, .grid, #waterfall, .movie-box, .box, .thumbnail, .video-list, .video-list-row, .section-container, .videothumblist");
            return (s || l) && (!o || C.extractCode(r) || s) ? {
                anchor: e,
                code: i
            } : null;
        },
        collectPan115ListTargets() {
            if (this.isDetailPage()) return [];
            const e = /supjav\.com/.test(location.hostname), t = new Set, n = [];
            /(javlibrary|javlib|r86m|s87n)/i.test(location.hostname) && document.querySelectorAll(".videothumblist .video > a[href]:not(.emby-javlibrary-list-badge)").forEach(e => {
                if (t.has(e) || "1" === e.dataset.pan115Checked) return;
                if (e.closest(".emby-btn, .emby-badge, .emby-button-group, .emby-javlibrary-list-badge")) return;
                const a = e.closest(".video"), i = [ a?.querySelector(".id")?.textContent, a?.querySelector(".title")?.textContent, e.getAttribute("title"), e.href ].filter(Boolean).join(" "), r = C.extractCode(i), o = P.extractCode(i, r);
                r && o && (t.add(e), n.push({
                    anchor: e,
                    code: o
                }));
            });
            const a = [ ...e ? [ ".post h3 a[href]" ] : [], ".movie-list a[href]", ".videothumblist .video > a[href]:not(.emby-javlibrary-list-badge)", ".movies a[href]", ".grid a[href]", ".item a[href]", ".video-title a[href]", "a.movie-box[href]", "a.box[href]", 'a[href*="/v/"]', "a[title][href]" ];
            return document.querySelectorAll(a.join(",")).forEach(a => {
                if (t.has(a) || "1" === a.dataset.pan115Checked) return;
                if (e && !a.matches(".post h3 a[href]")) return;
                t.add(a);
                const i = this.findPan115TitleAnchor(a);
                i && n.push(i);
            }), n;
        },
        insertPan115ListBadge(e, t, n) {
            if (!P.enabled() || !t?.pickcode || !e || "1" === e.dataset.pan115HasBadge) return;
            if (e.matches?.(".emby-javlibrary-list-badge") || e.closest?.(".emby-btn, .emby-badge, .emby-button-group, .emby-javlibrary-list-badge")) return;
            const a = e.querySelector(".title, .video-title");
            if (a) {
                const i = H(t, n, !1), r = a.querySelector(".javlib-card-headline");
                if (r) {
                    const t = a.querySelector(".javlib-card-footer");
                    return t ? t.insertBefore(i, t.firstChild) : r.insertAdjacentElement("afterend", i), 
                    void (e.dataset.pan115HasBadge = "1");
                }
                const o = a.querySelector(".javdb-card-headline");
                return o ? (o.insertBefore(i, o.firstChild), void (e.dataset.pan115HasBadge = "1")) : (a.insertBefore(i, a.firstChild), 
                void (e.dataset.pan115HasBadge = "1"));
            }
            const i = this.findPan115TitleTextNode(e);
            if (i?.parentNode && e.contains(i.parentNode)) {
                const e = H(t, n, !1);
                i.parentNode.insertBefore(e, i);
            } else {
                const a = H(t, n, !0);
                e.parentNode?.insertBefore(a, e);
            }
            e.dataset.pan115HasBadge = "1";
        },
        getDetailFeatureSite: () => Y.find(e => e.match(window.location.href)) || null,
        getDetailCode() {
            const e = this.getDetailFeatureSite();
            if (!e) return "";
            const t = "emby" === e.id ? ee() : document.querySelector(e.titleSelector || ""), n = t?.textContent || document.title || "";
            return C.extractCode(n) || "";
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
        getJumpSite: (e = window.location.href) => Y.find(t => t.match(e)) || null,
        getJumpTitleElement: e => e ? "emby" === e.id ? ee() : document.querySelector(e.titleSelector) : null,
        getEmbyInsertAnchor: e => e?.closest(".itemPrimaryNameContainer, .nameContainer, .detailPageWrapperContainer .infoWrapper") || e,
        getEmbyRenderKey(e) {
            const t = location.hash || "";
            return `${t.match(/item\?id=([^&]+)/i)?.[1] || new URLSearchParams(t.split("?")[1] || "").get("id") || ""}::${(e?.textContent || "").trim()}`;
        },
        isEmbyPage: (e = window.location.href) => !!Y.find(e => "emby" === e.id)?.match(e),
        setupJavDbGuards() {
            if (this.javdbGuardsReady || !y.match()) return;
            this.javdbGuardsReady = !0, y._dismissOver18Modal(), y._hideDownloadCorrectionBlock();
            new MutationObserver(() => {
                y._dismissOver18Modal(), y._hideDownloadCorrectionBlock();
            }).observe(document.documentElement, {
                childList: !0,
                subtree: !0
            }), window.addEventListener("popstate", () => setTimeout(() => {
                y._dismissOver18Modal(), y._hideDownloadCorrectionBlock();
            }, 0)), window.addEventListener("hashchange", () => setTimeout(() => {
                y._dismissOver18Modal(), y._hideDownloadCorrectionBlock();
            }, 0));
        },
        initCurrent() {
            const e = this.current();
            if (!e) return;
            const t = e.getVid();
            s("匹配站点:", e.constructor?.name || "未知", "| 番号:", t), e.initPage(t), r.applyCurrent(), 
            o.apply();
        }
    }, _ = (() => {
        const e = "laosijiListNewTab";
        function t() {
            if (j.isDetailPage()) return [];
            if (x.match() && x.isActorIndexPage()) return [];
            let e = [];
            if (x.match() ? e = [ "#waterfall.javbus-card-grid > .item > a.movie-box[href]", ".javbus-card-grid .javbus-card-link[href]" ] : y.match() ? e = [ ".javdb-card-grid > .item > a.box[href]", ".movie-list.javdb-card-grid > .item > a.box[href]", ".movies.javdb-card-grid > .item > a.box[href]", ".grid.javdb-card-grid > .item > a.box[href]" ] : w.match() && (e = [ ".videothumblist .videos.javlib-card-grid > .video > a[href]:not(.emby-javlibrary-list-badge)" ]), 
            !e.length) return [];
            const t = new Set;
            return e.flatMap(e => [ ...document.querySelectorAll(e) ]).filter(e => !(t.has(e) || !function(e) {
                const t = e?.getAttribute?.("href") || "";
                if (!t || /^(?:javascript:|#|magnet:|mailto:|tel:)/i.test(t)) return !1;
                try {
                    const e = new URL(t, location.href);
                    return /^https?:$/i.test(e.protocol);
                } catch (e) {
                    return !1;
                }
            }(e)) && (t.add(e), !0));
        }
        function n(t) {
            !function(t) {
                "1" !== t.dataset[e] && (t.dataset[e] = "1", t.dataset.laosijiHadTarget = t.hasAttribute("target") ? "1" : "0", 
                t.dataset.laosijiHadRel = t.hasAttribute("rel") ? "1" : "0", t.dataset.laosijiOriginalTarget = t.getAttribute("target") || "", 
                t.dataset.laosijiOriginalRel = t.getAttribute("rel") || "");
            }(t);
            const n = new Set((t.getAttribute("rel") || "").split(/\s+/).filter(Boolean));
            n.add("noopener"), n.add("noreferrer"), t.setAttribute("target", "_blank"), t.setAttribute("rel", [ ...n ].join(" "));
        }
        function i(t = new Set) {
            document.querySelectorAll('a[data-laosiji-list-new-tab="1"]').forEach(n => {
                t.has(n) || function(t) {
                    "1" === t.dataset[e] && ("1" === t.dataset.laosijiHadTarget ? t.setAttribute("target", t.dataset.laosijiOriginalTarget || "") : t.removeAttribute("target"), 
                    "1" === t.dataset.laosijiHadRel ? t.setAttribute("rel", t.dataset.laosijiOriginalRel || "") : t.removeAttribute("rel"), 
                    delete t.dataset[e], delete t.dataset.laosijiHadTarget, delete t.dataset.laosijiHadRel, 
                    delete t.dataset.laosijiOriginalTarget, delete t.dataset.laosijiOriginalRel);
                }(n);
            });
        }
        return {
            sync: function() {
                if (!a.listOpenNewTab) return void i();
                const e = t(), r = new Set(e);
                e.forEach(n), i(r);
            },
            clear: () => i()
        };
    })();
    l.expose("__LAOSIJI_LIST_OPEN_NEW_TAB__", _);
    const k = (() => {
        let e = null;
        function t(e, t, n, a) {
            const i = document.createElement("button");
            return i.type = "button", i.className = `jav-stills-arrow ${t}`, i.textContent = e, 
            i.setAttribute("aria-label", a < 0 ? "向左滚动剧照" : "向右滚动剧照"), i.addEventListener("click", e => {
                e.preventDefault(), e.stopPropagation(), function(e, t) {
                    const n = Math.max(0, e.scrollWidth - e.clientWidth);
                    if (n <= 1) return;
                    t > 0 && e.scrollLeft >= n - 8 ? e.scrollTo({
                        left: 0,
                        behavior: "smooth"
                    }) : t < 0 && e.scrollLeft <= 8 ? e.scrollTo({
                        left: n,
                        behavior: "smooth"
                    }) : e.scrollBy({
                        left: t * Math.max(220, .72 * e.clientWidth),
                        behavior: "smooth"
                    });
                }(n, a);
            }), i;
        }
        function n(e) {
            try {
                return new URL(e, location.href).href;
            } catch {
                return "";
            }
        }
        function a(e) {
            const t = String(e || "").split("#")[0].split("?")[0];
            return /\.(?:jpe?g|png|webp|gif|bmp)$/i.test(t);
        }
        function i(t) {
            "1" !== t.dataset.laosijiStillsViewerBound && (t.dataset.laosijiStillsViewerBound = "1", 
            t.addEventListener("click", i => {
                const r = i.target?.closest?.("a[href]");
                if (!r || !t.contains(r)) return;
                const o = function(e) {
                    return [ ...e.querySelectorAll(":scope > a[href]") ].map(e => {
                        const t = e.getAttribute("href") || "";
                        if (!t || t.startsWith("#") || /^javascript:/i.test(t)) return null;
                        const i = e.querySelector("img[src]");
                        if (!i) return null;
                        const r = n(t), o = n(i.currentSrc || i.src || i.getAttribute("src") || "");
                        if (!r || !a(r) && !a(o)) return null;
                        const s = e.getAttribute("data-caption") || i.getAttribute("title") || i.getAttribute("alt") || "";
                        return {
                            anchor: e,
                            url: r,
                            title: s.trim()
                        };
                    }).filter(Boolean);
                }(t), s = o.findIndex(e => e.anchor === r);
                s < 0 || (i.preventDefault(), i.stopPropagation(), i.stopImmediatePropagation?.(), 
                function(t, n = 0) {
                    if (!t.length) return;
                    e?.();
                    const a = document.documentElement.style.overflow, i = document.body.style.overflow;
                    document.documentElement.style.overflow = "hidden", document.body.style.overflow = "hidden";
                    let r = n;
                    const o = document.createElement("div");
                    o.className = "jav-stills-viewer";
                    const s = document.createElement("div");
                    s.className = "jav-stills-viewer-top";
                    const l = document.createElement("div");
                    l.className = "jav-stills-viewer-count";
                    const c = document.createElement("button");
                    c.type = "button", c.className = "jav-stills-viewer-close", c.textContent = "×", 
                    c.setAttribute("aria-label", "关闭剧照预览"), s.append(l, c);
                    const d = document.createElement("div");
                    d.className = "jav-stills-viewer-body";
                    const p = document.createElement("img");
                    p.className = "jav-stills-viewer-img", d.appendChild(p);
                    const m = document.createElement("button");
                    m.type = "button", m.className = "jav-stills-viewer-nav jav-stills-viewer-prev", 
                    m.textContent = "‹", m.setAttribute("aria-label", "上一张剧照");
                    const u = document.createElement("button");
                    u.type = "button", u.className = "jav-stills-viewer-nav jav-stills-viewer-next", 
                    u.textContent = "›", u.setAttribute("aria-label", "下一张剧照");
                    const h = document.createElement("div");
                    h.className = "jav-stills-viewer-caption";
                    const v = e => {
                        r = (e + t.length) % t.length;
                        const n = t[r];
                        p.classList.remove("is-zoomed"), p.src = n.url, p.alt = n.title || `剧照 ${r + 1}`, 
                        l.textContent = `${r + 1} / ${t.length}`, h.textContent = n.title || "";
                    }, g = (t = null) => {
                        t && (t.preventDefault(), t.stopPropagation(), t.stopImmediatePropagation?.()), 
                        o.remove(), document.documentElement.style.overflow = a, document.body.style.overflow = i, 
                        document.removeEventListener("keydown", b, !0), e === g && (e = null);
                    }, b = e => {
                        "Escape" !== e.key ? "ArrowLeft" !== e.key && "ArrowRight" !== e.key || (e.preventDefault(), 
                        e.stopPropagation(), e.stopImmediatePropagation?.(), v(r + ("ArrowRight" === e.key ? 1 : -1))) : g(e);
                    };
                    c.addEventListener("click", g, !0), m.addEventListener("click", e => {
                        e.preventDefault(), e.stopPropagation(), e.stopImmediatePropagation?.(), v(r - 1);
                    }, !0), u.addEventListener("click", e => {
                        e.preventDefault(), e.stopPropagation(), e.stopImmediatePropagation?.(), v(r + 1);
                    }, !0), p.addEventListener("click", e => {
                        e.preventDefault(), e.stopPropagation(), e.stopImmediatePropagation?.(), p.classList.toggle("is-zoomed");
                    }, !0), o.addEventListener("click", e => {
                        e.target !== o && e.target !== d || g(e);
                    }, !0), document.addEventListener("keydown", b, !0), o.append(s, d, m, u, h), document.body.appendChild(o), 
                    e = g, v(r);
                }(o, s));
            }, !0));
        }
        return {
            sync: function() {
                const e = function() {
                    if (x.match()) {
                        const e = document.querySelector("#sample-waterfall");
                        if (!e?.querySelector("a, img")) return null;
                        const t = e.previousElementSibling?.matches?.("h4") ? e.previousElementSibling : null;
                        return {
                            site: "javbus",
                            container: e,
                            heading: t
                        };
                    }
                    if (y.match()) {
                        const e = document.querySelector(".tile-images.preview-images");
                        return e?.querySelector("a, img, video") ? {
                            site: "javdb",
                            container: e,
                            heading: null
                        } : null;
                    }
                    if (w.match()) {
                        const e = document.querySelector(".previewthumbs");
                        return e?.querySelector("a, img") ? {
                            site: "javlib",
                            container: e,
                            heading: null
                        } : null;
                    }
                    return null;
                }();
                if (!e?.container) return;
                if ("1" !== document.documentElement.dataset.laosijiStillsGalleryStyle && (document.documentElement.dataset.laosijiStillsGalleryStyle = "1", 
                GM_addStyle('\n                .jav-stills-shell {\n                    position: relative !important;\n                    width: 100% !important;\n                    inline-size: 100% !important;\n                    max-width: 100% !important;\n                    min-width: 0 !important;\n                    box-sizing: border-box !important;\n                    margin: 16px 0 18px !important;\n                    padding: 12px 44px !important;\n                    border: 1px solid #d9e2ec !important;\n                    border-radius: 8px !important;\n                    background: #ffffff !important;\n                    box-shadow: 0 8px 18px rgba(15, 23, 42, .06) !important;\n                    overflow: hidden !important;\n                }\n                .jav-stills-stage {\n                    position: relative !important;\n                    width: 100% !important;\n                    max-width: 100% !important;\n                    min-width: 0 !important;\n                    box-sizing: border-box !important;\n                    overflow: hidden !important;\n                }\n                .jav-stills-rail {\n                    display: flex !important;\n                    flex-wrap: nowrap !important;\n                    align-items: stretch !important;\n                    gap: 10px !important;\n                    width: 100% !important;\n                    inline-size: 100% !important;\n                    max-width: 100% !important;\n                    min-width: 0 !important;\n                    box-sizing: border-box !important;\n                    margin: 0 !important;\n                    padding: 2px 0 10px !important;\n                    overflow-x: auto !important;\n                    overflow-y: hidden !important;\n                    scroll-behavior: smooth !important;\n                    overscroll-behavior-inline: contain !important;\n                    scrollbar-width: thin !important;\n                    scrollbar-color: rgba(100, 116, 139, .44) transparent !important;\n                }\n                .jav-stills-rail::-webkit-scrollbar { height: 8px !important; }\n                .jav-stills-rail::-webkit-scrollbar-thumb {\n                    border-radius: 999px !important;\n                    background: rgba(100, 116, 139, .36) !important;\n                }\n                .jav-stills-rail::-webkit-scrollbar-track { background: transparent !important; }\n                .jav-stills-arrow {\n                    position: absolute !important;\n                    top: 50% !important;\n                    z-index: 3 !important;\n                    display: grid !important;\n                    place-items: center !important;\n                    width: 34px !important;\n                    height: 42px !important;\n                    border: 1px solid rgba(148, 163, 184, .42) !important;\n                    border-radius: 8px !important;\n                    background: rgba(255, 255, 255, .92) !important;\n                    color: #172033 !important;\n                    font-size: 24px !important;\n                    line-height: 1 !important;\n                    font-weight: 800 !important;\n                    cursor: pointer !important;\n                    transform: translateY(-50%) !important;\n                    box-shadow: 0 8px 18px rgba(15, 23, 42, .14) !important;\n                    transition: transform .18s ease, background .18s ease, border-color .18s ease !important;\n                    touch-action: manipulation !important;\n                }\n                .jav-stills-arrow:hover {\n                    background: #ffffff !important;\n                    border-color: rgba(37, 99, 235, .45) !important;\n                    transform: translateY(-50%) scale(1.04) !important;\n                }\n                .jav-stills-arrow-prev { left: 8px !important; }\n                .jav-stills-arrow-next { right: 8px !important; }\n                .jav-stills-rail > a,\n                .jav-stills-rail > .tile-item,\n                .jav-stills-rail > .preview-video-container {\n                    flex: 0 0 auto !important;\n                    display: block !important;\n                    position: relative !important;\n                    width: 172px !important;\n                    height: 104px !important;\n                    margin: 0 !important;\n                    padding: 0 !important;\n                    border: 1px solid rgba(148, 163, 184, .28) !important;\n                    border-radius: 8px !important;\n                    background: #e2e8f0 !important;\n                    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .45) !important;\n                    overflow: hidden !important;\n                    box-sizing: border-box !important;\n                    text-decoration: none !important;\n                }\n                .jav-stills-rail img {\n                    display: block !important;\n                    width: 100% !important;\n                    height: 100% !important;\n                    max-width: none !important;\n                    object-fit: cover !important;\n                    object-position: center !important;\n                    border: 0 !important;\n                }\n                .jav-stills-rail .photo-frame {\n                    width: 100% !important;\n                    height: 100% !important;\n                    margin: 0 !important;\n                    padding: 0 !important;\n                    box-sizing: border-box !important;\n                    overflow: hidden !important;\n                }\n                .jav-stills-rail > video,\n                .jav-stills-rail video[style*="display:none"],\n                .jav-stills-rail video[style*="display: none"] {\n                    display: none !important;\n                    flex: 0 0 auto !important;\n                }\n                .jav-stills-javdb .preview-video-container span {\n                    position: absolute !important;\n                    left: 8px !important;\n                    bottom: 7px !important;\n                    z-index: 2 !important;\n                    padding: 3px 7px !important;\n                    border-radius: 6px !important;\n                    background: rgba(15, 23, 42, .68) !important;\n                    color: #ffffff !important;\n                    font-size: 11px !important;\n                    line-height: 1 !important;\n                    font-weight: 800 !important;\n                }\n                .jav-stills-javlib .jav-stills-rail > a {\n                    width: 150px !important;\n                    height: 100px !important;\n                }\n                .javdb-stills-column-clean,\n                .javdb-stills-panel-clean,\n                .javdb-stills-panel-clean > .message-body,\n                .javdb-stills-body-clean {\n                    width: 100% !important;\n                    max-width: 100% !important;\n                    min-width: 0 !important;\n                    box-sizing: border-box !important;\n                    padding: 0 !important;\n                    border: 0 !important;\n                    background: transparent !important;\n                    box-shadow: none !important;\n                }\n                .javdb-stills-column-clean {\n                    flex: 1 1 0 !important;\n                    overflow: hidden !important;\n                    padding-left: .75rem !important;\n                    padding-right: .75rem !important;\n                }\n                .javdb-stills-panel-clean {\n                    margin: 16px 0 18px !important;\n                }\n                .jav-stills-javdb {\n                    width: auto !important;\n                    max-width: min(100%, calc(100vw - 34px)) !important;\n                    max-inline-size: min(100%, calc(100vw - 34px)) !important;\n                }\n                .javdb-stills-panel-clean .jav-stills-shell {\n                    margin: 0 !important;\n                }\n                .jav-stills-viewer {\n                    position: fixed !important;\n                    inset: 0 !important;\n                    z-index: 2147483647 !important;\n                    display: grid !important;\n                    grid-template-rows: auto minmax(0, 1fr) auto !important;\n                    background: rgba(8, 13, 25, .9) !important;\n                    backdrop-filter: blur(5px) !important;\n                    color: #ffffff !important;\n                    cursor: zoom-out !important;\n                }\n                .jav-stills-viewer-top {\n                    display: flex !important;\n                    align-items: center !important;\n                    justify-content: space-between !important;\n                    gap: 12px !important;\n                    min-height: 54px !important;\n                    padding: 12px 16px !important;\n                    box-sizing: border-box !important;\n                    pointer-events: none !important;\n                }\n                .jav-stills-viewer-count {\n                    min-width: 64px !important;\n                    padding: 6px 10px !important;\n                    border-radius: 8px !important;\n                    background: rgba(15, 23, 42, .72) !important;\n                    color: #e5edf8 !important;\n                    font-size: 13px !important;\n                    font-weight: 800 !important;\n                    text-align: center !important;\n                    pointer-events: auto !important;\n                }\n                .jav-stills-viewer-close,\n                .jav-stills-viewer-nav {\n                    display: grid !important;\n                    place-items: center !important;\n                    border: 1px solid rgba(226, 232, 240, .22) !important;\n                    background: rgba(15, 23, 42, .72) !important;\n                    color: #ffffff !important;\n                    cursor: pointer !important;\n                    box-shadow: 0 12px 26px rgba(0, 0, 0, .24) !important;\n                    touch-action: manipulation !important;\n                }\n                .jav-stills-viewer-close {\n                    width: 38px !important;\n                    height: 38px !important;\n                    border-radius: 10px !important;\n                    font-size: 24px !important;\n                    line-height: 1 !important;\n                    pointer-events: auto !important;\n                }\n                .jav-stills-viewer-close:hover,\n                .jav-stills-viewer-nav:hover {\n                    background: rgba(30, 41, 59, .88) !important;\n                    border-color: rgba(255, 255, 255, .36) !important;\n                }\n                .jav-stills-viewer-body {\n                    position: relative !important;\n                    display: grid !important;\n                    place-items: center !important;\n                    min-width: 0 !important;\n                    min-height: 0 !important;\n                    padding: 0 68px !important;\n                    box-sizing: border-box !important;\n                    overflow: auto !important;\n                }\n                .jav-stills-viewer-img {\n                    display: block !important;\n                    max-width: 100% !important;\n                    max-height: calc(100vh - 118px) !important;\n                    width: auto !important;\n                    height: auto !important;\n                    object-fit: contain !important;\n                    border-radius: 6px !important;\n                    background: #111827 !important;\n                    box-shadow: 0 18px 46px rgba(0, 0, 0, .45) !important;\n                    cursor: zoom-in !important;\n                }\n                .jav-stills-viewer-img.is-zoomed {\n                    max-width: none !important;\n                    max-height: none !important;\n                    cursor: zoom-out !important;\n                }\n                .jav-stills-viewer-nav {\n                    position: fixed !important;\n                    top: 50% !important;\n                    z-index: 2147483647 !important;\n                    width: 44px !important;\n                    height: 58px !important;\n                    border-radius: 12px !important;\n                    font-size: 30px !important;\n                    line-height: 1 !important;\n                    transform: translateY(-50%) !important;\n                }\n                .jav-stills-viewer-prev { left: 18px !important; }\n                .jav-stills-viewer-next { right: 18px !important; }\n                .jav-stills-viewer-caption {\n                    min-height: 42px !important;\n                    padding: 9px 18px 16px !important;\n                    box-sizing: border-box !important;\n                    color: rgba(226, 232, 240, .86) !important;\n                    font-size: 13px !important;\n                    line-height: 1.45 !important;\n                    text-align: center !important;\n                    pointer-events: none !important;\n                }\n                @media (max-width: 720px) {\n                    .jav-stills-shell {\n                        padding: 10px 40px !important;\n                    }\n                    .jav-stills-rail > a,\n                    .jav-stills-rail > .tile-item,\n                    .jav-stills-rail > .preview-video-container {\n                        width: 150px !important;\n                        height: 92px !important;\n                    }\n                    .jav-stills-javlib .jav-stills-rail > a {\n                        width: 138px !important;\n                        height: 92px !important;\n                    }\n                    .jav-stills-viewer-body {\n                        padding: 0 52px !important;\n                    }\n                    .jav-stills-viewer-nav {\n                        width: 38px !important;\n                        height: 52px !important;\n                    }\n                    .jav-stills-viewer-prev { left: 8px !important; }\n                    .jav-stills-viewer-next { right: 8px !important; }\n                }\n            ')), 
                function(e) {
                    "javdb" === e.site && (e.container.closest(".column")?.classList.add("javdb-stills-column-clean"), 
                    e.container.closest(".message.video-panel, article.message")?.classList.add("javdb-stills-panel-clean"), 
                    e.container.closest(".message-body")?.classList.add("javdb-stills-body-clean"));
                }(e), i(e.container), e.container.closest(".jav-stills-shell")) return;
                const n = document.createElement("div");
                n.className = `jav-stills-shell jav-stills-${e.site}`, n.dataset.laosijiStills = "1";
                const a = document.createElement("div");
                a.className = "jav-stills-stage", e.container.classList.add("jav-stills-rail", `jav-stills-rail-${e.site}`), 
                e.container.dataset.laosijiStillsRail = "1";
                const r = e.heading || e.container;
                r.parentNode?.insertBefore(n, r), e.heading && (e.heading.dataset.laosijiStillsHidden = "1", 
                e.heading.style.display = "none"), a.append(t("‹", "jav-stills-arrow-prev", e.container, -1), e.container, t("›", "jav-stills-arrow-next", e.container, 1)), 
                n.append(a);
            }
        };
    })();
    function S() {
        j.initCurrent();
    }
    l.expose("__LAOSIJI_SITE_MANAGER__", j), l.expose("__LAOSIJI_SITE_JAVBUS__", x), 
    l.expose("__LAOSIJI_SITE_JAVDB__", y), l.expose("__LAOSIJI_SITE_JAVLIB__", w), l.expose("__LAOSIJI_STILLS_GALLERY__", k), 
    GM_addStyle('\n        .preview-overlay {\n            position: fixed;\n            inset: 0;\n            background: rgba(0,0,0,0.85);\n            z-index: 2147483647;\n            display: flex;\n            overflow: auto;\n            cursor: zoom-out;\n            backdrop-filter: blur(5px);\n        }\n        .preview-img {\n            border-radius: 4px;\n            margin: auto;\n            cursor: zoom-in;\n            max-width: 95vw;\n            max-height: 95vh;\n            object-fit: contain;\n            display: block;\n            box-shadow: 0 0 20px rgba(0,0,0,0.5);\n        }\n        .preview-img.zoomed {\n            max-width: none;\n            max-height: none;\n            cursor: zoom-out;\n        }\n        a:focus:not(:focus-visible),\n        button:focus:not(:focus-visible),\n        [role="button"]:focus:not(:focus-visible),\n        input[type="button"]:focus:not(:focus-visible),\n        input[type="submit"]:focus:not(:focus-visible) {\n            outline: none !important;\n        }\n\n        .jav-jump-btn-group {\n            margin-top: 8px;\n            margin-bottom: 4px;\n            display: flex;\n            flex-wrap: wrap;\n            gap: 8px;\n            align-items: center;\n        }\n\n\n        .emby-fix {\n            width: 100% !important;\n            flex-basis: 100% !important;\n            clear: both !important;\n            margin-top: 8px !important;\n            margin-bottom: 4px !important;\n        }\n\n        .mini-switch {\n            width: 40px;\n            height: 20px;\n            appearance: none;\n            background: #e0e0e0;\n            border-radius: 20px;\n            position: relative;\n            cursor: pointer;\n            outline: none;\n            transition: background 0.2s;\n        }\n        .mini-switch:checked {\n            background: #4CAF50;\n        }\n        .mini-switch::before {\n            content: \'\';\n            position: absolute;\n            width: 16px;\n            height: 16px;\n            border-radius: 50%;\n            background: white;\n            top: 2px;\n            left: 2px;\n            transition: left 0.2s;\n        }\n        .mini-switch:checked::before {\n            left: calc(100% - 18px);\n        }\n\n        @keyframes btnSlideIn {\n            from {\n                opacity: 0;\n                transform: translateX(-10px);\n            }\n            to {\n                opacity: 1;\n                transform: translateX(0);\n            }\n        }\n\n        .jav-jump-btn-group a {\n            transition: background .16s ease, border-color .16s ease, box-shadow .16s ease, transform .16s ease;\n            animation: btnSlideIn 0.3s ease-out;\n        }\n\n        .jav-jump-btn-group a:hover {\n            background: var(--jav-btn-hover-bg, #f8fafc) !important;\n            transform: translateY(-1px) !important;\n            filter: none !important;\n            box-shadow: 0 5px 14px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.76) !important;\n            text-decoration: none !important;\n        }\n\n        @keyframes menuFadeIn {\n            from {\n                opacity: 0;\n                transform: translateY(-10px);\n            }\n            to {\n                opacity: 1;\n                transform: translateY(0);\n            }\n        }\n\n        .search-menu {\n            position: relative;\n            display: inline-block;\n            border-radius: 4px;\n        }\n        .search-main-btn {\n            padding-right: 28px !important;\n        }\n        .search-toggle-btn {\n            position: absolute;\n            right: 4px;\n            top: 50%;\n            transform: translateY(-50%);\n            width: 16px;\n            height: 16px;\n            padding: 0 !important;\n            margin: 0 !important;\n            display: inline-flex !important;\n            align-items: center;\n            justify-content: center;\n            flex-shrink: 0;\n            font-size: 10px !important;\n            line-height: 1;\n            opacity: 1;\n            background: color-mix(in srgb, var(--jav-btn-accent, #64748b) 18%, #ffffff) !important;\n            color: inherit !important;\n            border: 1px solid color-mix(in srgb, var(--jav-btn-accent, #64748b) 26%, #ffffff) !important;\n            border-radius: 999px !important;\n            box-shadow: 0 1px 2px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.7) !important;\n            cursor: pointer;\n        }\n        .search-toggle-btn:hover { filter: none; background: color-mix(in srgb, var(--jav-btn-accent, #64748b) 26%, #ffffff) !important; }\n        .search-toggle-btn .search-arrow { display: inline-block; transform: translateY(-1px); pointer-events: none; }\n        .search-submenu {\n            position: absolute;\n            top: calc(100% + 4px);\n            left: 0;\n            display: none;\n            flex-direction: column;\n            gap: 4px;\n            padding: 4px;\n            background: rgba(255,255,255,0.95);\n            border-radius: 6px;\n            box-shadow: 0 4px 12px rgba(0,0,0,0.2);\n            z-index: 10000;\n            min-width: 120px;\n            backdrop-filter: blur(5px);\n        }\n        .search-submenu.is-open { display: flex; }\n        .search-submenu a { transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important; }\n        .search-submenu a:hover { transform: translateX(5px) scale(1.02); filter: brightness(1.1); }\n        .jav-pan115-badge {\n            display: inline-flex;\n            align-items: center;\n            justify-content: center;\n            min-width: 58px;\n            height: 22px !important;\n            padding: 0 7px;\n            margin-right: 6px;\n            position: static !important;\n            top: auto !important;\n            transform: none !important;\n            border-radius: 6px;\n            background: #bbf7d0;\n            border: 1px solid #22c55e;\n            color: #065f46;\n            font-size: 12px !important;\n            font-weight: 800;\n            line-height: 22px !important;\n            text-decoration: none;\n            box-sizing: border-box;\n            vertical-align: middle;\n            box-shadow: inset 0 1px 0 rgba(255,255,255,0.72);\n        }\n        .jav-pan115-badge:hover {\n            background: #86efac;\n            color: #064e3b;\n            text-decoration: none;\n            box-shadow: 0 4px 12px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.76);\n        }\n        span.jav-pan115-badge {\n            cursor: pointer;\n        }\n        .jav-infinite-sentinel {\n            width: 100%;\n            padding: 14px 0;\n            color: #64748b;\n            font-size: 13px;\n            font-weight: 700;\n            text-align: center;\n            clear: both;\n        }\n        .jav-infinite-sentinel.is-loading { color: #2563eb; }\n        .jav-infinite-sentinel.is-done { color: #94a3b8; }\n        .jav-infinite-sentinel.is-error { color: #dc2626; cursor: pointer; }\n\n        .preview-toolbar {\n            position: fixed;\n            top: 20px;\n            right: 20px;\n            display: flex;\n            gap: 8px;\n            z-index: 2147483648;\n            background: rgba(30, 30, 30, 0.75);\n            backdrop-filter: blur(10px);\n            padding: 6px 12px;\n            border-radius: 30px;\n            border: 1px solid rgba(255, 255, 255, 0.08);\n            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);\n        }\n\n        .preview-btn {\n            border: none;\n            color: #eee;\n            font-size: 13px;\n            font-weight: 450;\n            cursor: pointer;\n            padding: 6px 14px;\n            border-radius: 24px;\n            transition: all 0.2s ease;\n            display: inline-flex;\n            align-items: center;\n            gap: 6px;\n            background: rgba(100, 100, 120, 0.3);\n            border: 1px solid rgba(255, 255, 255, 0.05);\n            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\n            letter-spacing: 0.2px;\n        }\n\n        .preview-btn:hover {\n            background: rgba(140, 140, 160, 0.4);\n            transform: translateY(-2px);\n            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);\n        }\n\n        .preview-btn.javfree.active {\n            background: #2ecc71;\n            color: white;\n            border-color: rgba(255, 255, 255, 0.3);\n            box-shadow: 0 0 16px rgba(46, 204, 113, 0.6);\n            font-weight: 500;\n        }\n\n        .preview-btn.javstore.active {\n            background: #e74c3c;\n            color: white;\n            border-color: rgba(255, 255, 255, 0.3);\n            box-shadow: 0 0 16px rgba(231, 76, 60, 0.6);\n            font-weight: 500;\n        }\n\n        .preview-btn.action {\n            background: rgba(100, 100, 120, 0.3);\n        }\n        .preview-btn.action:hover {\n            background: rgba(140, 140, 160, 0.5);\n        }\n\n        .preview-btn:active {\n            transform: translateY(0);\n            box-shadow: 0 2px 4px rgba(0,0,0,0.15);\n        }\n\n        .trailer-overlay {\n            position: fixed;\n            inset: 0;\n            z-index: 2147483647;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            padding: 34px;\n            background:\n                radial-gradient(circle at 50% 18%, rgba(56, 189, 248, 0.16), transparent 32%),\n                linear-gradient(180deg, rgba(5, 7, 12, 0.88), rgba(0, 0, 0, 0.96));\n            backdrop-filter: blur(16px) saturate(0.85);\n            cursor: default;\n        }\n        .trailer-modal {\n            width: min(1120px, 94vw);\n            max-height: 92vh;\n            display: flex;\n            flex-direction: column;\n            overflow: hidden;\n            color: #f8fafc;\n            background: #05070c;\n            border: 1px solid rgba(255, 255, 255, 0.12);\n            border-radius: 8px;\n            box-shadow:\n                0 30px 80px rgba(0, 0, 0, 0.68),\n                0 0 0 1px rgba(255, 255, 255, 0.04) inset;\n            cursor: default;\n            animation: trailerFadeIn .18s ease-out;\n        }\n        @keyframes trailerFadeIn {\n            from { opacity: 0; transform: translateY(14px) scale(.985); }\n            to { opacity: 1; transform: translateY(0) scale(1); }\n        }\n        .trailer-header {\n            position: absolute;\n            top: 0;\n            left: 0;\n            right: 0;\n            z-index: 4;\n            display: flex;\n            align-items: center;\n            justify-content: space-between;\n            gap: 16px;\n            padding: 16px 18px 34px;\n            background: linear-gradient(180deg, rgba(0, 0, 0, 0.66), rgba(0, 0, 0, 0));\n            border: 0;\n            pointer-events: none;\n            opacity: 1;\n            transition: opacity .18s ease, transform .18s ease;\n        }\n        .trailer-title {\n            min-width: 0;\n            display: flex;\n            align-items: center;\n            gap: 10px;\n            font: 700 15px/1.3 Arial, "Microsoft YaHei", sans-serif;\n            pointer-events: auto;\n        }\n        .trailer-code {\n            overflow: hidden;\n            text-overflow: ellipsis;\n            white-space: nowrap;\n            letter-spacing: .4px;\n        }\n        .trailer-source {\n            flex-shrink: 0;\n            padding: 3px 9px;\n            border-radius: 999px;\n            color: rgba(255, 255, 255, 0.82);\n            background: rgba(255, 255, 255, 0.12);\n            border: 1px solid rgba(255, 255, 255, 0.18);\n            font-size: 12px;\n            font-weight: 500;\n            backdrop-filter: blur(12px);\n        }\n        .jav-player-close {\n            width: 34px;\n            height: 34px;\n            border: 0;\n            border-radius: 50%;\n            color: #fff;\n            background: rgba(255, 255, 255, 0.14);\n            cursor: pointer;\n            font-size: 18px;\n            line-height: 34px;\n            pointer-events: auto;\n            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.22);\n            transition: transform .15s ease, background .15s ease, box-shadow .15s ease;\n        }\n        .jav-player-close:hover {\n            transform: scale(1.08);\n            background: rgba(248, 113, 113, 0.34);\n            box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);\n        }\n        .trailer-screen {\n            position: relative;\n            aspect-ratio: 16 / 9;\n            width: 100%;\n            max-height: 82vh;\n            overflow: hidden;\n            background:\n                radial-gradient(circle at center, rgba(31, 41, 55, .75), #000 62%),\n                #000;\n        }\n        .trailer-screen:fullscreen {\n            width: 100vw;\n            height: 100vh;\n            max-height: none;\n            aspect-ratio: auto;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            background: #000;\n        }\n        .trailer-screen:-webkit-full-screen {\n            width: 100vw;\n            height: 100vh;\n            max-height: none;\n            aspect-ratio: auto;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            background: #000;\n        }\n        .trailer-screen::before {\n            content: "";\n            position: absolute;\n            inset: 0;\n            z-index: 1;\n            pointer-events: none;\n            background:\n                linear-gradient(180deg, rgba(0, 0, 0, 0.52), rgba(0, 0, 0, 0) 30%),\n                linear-gradient(0deg, rgba(0, 0, 0, 0.62), rgba(0, 0, 0, 0) 36%);\n        }\n        .trailer-screen.is-iframe::before {\n            display: none;\n        }\n        .trailer-screen video,\n        .trailer-screen iframe {\n            position: absolute;\n            inset: 0;\n            width: 100%;\n            height: 100%;\n            display: block;\n            border: 0;\n            background: #000;\n            object-fit: contain;\n        }\n        .trailer-volume-indicator {\n            position: absolute;\n            top: 62px;\n            right: 26px;\n            z-index: 5;\n            color: #f8fafc;\n            font: 750 24px/1 Arial, "Microsoft YaHei", sans-serif;\n            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.82);\n            opacity: 0;\n            pointer-events: none;\n            transition: opacity .14s ease;\n        }\n        .trailer-volume-indicator.is-visible {\n            opacity: 1;\n        }\n        .trailer-quality-bar {\n            display: flex;\n            align-items: center;\n            gap: 8px;\n            padding: 0;\n            background: transparent;\n            border: none;\n            border-radius: 0;\n            backdrop-filter: none;\n        }\n        .trailer-quality-select {\n            min-width: 78px;\n            max-width: 140px;\n            height: 30px;\n            padding: 0 10px;\n            border-radius: 999px;\n            border: 1px solid rgba(255, 255, 255, 0.16);\n            background: rgba(255, 255, 255, 0.12);\n            color: #f8fafc;\n            outline: none;\n            font-size: 12px;\n            line-height: 28px;\n            text-align: center;\n            text-align-last: center;\n            appearance: none;\n            cursor: pointer;\n        }\n        .trailer-quality-select option {\n            background: #0b1020;\n            color: #f8fafc;\n        }\n        .trailer-footer {\n            position: absolute;\n            left: 16px;\n            right: 16px;\n            bottom: 16px;\n            z-index: 4;\n            display: flex;\n            align-items: center;\n            justify-content: space-between;\n            gap: 10px;\n            padding: 9px 10px;\n            color: rgba(255, 255, 255, 0.78);\n            background: rgba(10, 14, 22, 0.62);\n            border: 1px solid rgba(255, 255, 255, 0.16);\n            border-radius: 8px;\n            box-shadow: 0 18px 40px rgba(0, 0, 0, 0.32);\n            backdrop-filter: blur(16px) saturate(1.08);\n            font: 12px/1.4 Arial, "Microsoft YaHei", sans-serif;\n            opacity: 1;\n            transform: translateY(0);\n            transition: opacity .18s ease, transform .18s ease;\n        }\n        .trailer-screen.is-controls-hidden {\n            cursor: none;\n        }\n        .trailer-screen.is-controls-hidden .trailer-header {\n            opacity: 0;\n            transform: translateY(-8px);\n            pointer-events: none;\n        }\n        .trailer-screen.is-controls-hidden .trailer-footer {\n            opacity: 0;\n            transform: translateY(10px);\n            pointer-events: none;\n        }\n        .trailer-control-left,\n        .trailer-control-right {\n            display: flex;\n            align-items: center;\n            gap: 9px;\n            min-width: 0;\n        }\n        .trailer-control-left {\n            flex: 1 1 auto;\n        }\n        .trailer-control-right {\n            flex: 0 0 auto;\n        }\n        .trailer-control-btn {\n            width: 30px;\n            height: 30px;\n            display: inline-flex;\n            align-items: center;\n            justify-content: center;\n            flex: 0 0 auto;\n            padding: 0;\n            border: 0;\n            border-radius: 999px;\n            color: #fff;\n            background: rgba(255, 255, 255, 0.14);\n            cursor: pointer;\n            font: 700 13px/1 Arial, "Microsoft YaHei", sans-serif;\n            transition: background .15s ease, transform .15s ease;\n        }\n        .trailer-control-btn:hover {\n            background: rgba(255, 255, 255, 0.24);\n            transform: translateY(-1px);\n        }\n        .trailer-volume-wrap {\n            position: relative;\n            display: inline-flex;\n            flex: 0 0 auto;\n            align-items: center;\n            justify-content: center;\n        }\n        .trailer-volume-wrap::before {\n            content: "";\n            position: absolute;\n            left: 50%;\n            bottom: 100%;\n            width: 46px;\n            height: 14px;\n            transform: translateX(-50%);\n        }\n        .trailer-volume-popover {\n            position: absolute;\n            left: 50%;\n            bottom: calc(100% + 8px);\n            width: 34px;\n            height: 118px;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            padding: 10px 0;\n            border-radius: 999px;\n            background: rgba(10, 14, 22, 0.76);\n            border: 1px solid rgba(255, 255, 255, 0.16);\n            box-shadow: 0 14px 32px rgba(0, 0, 0, 0.34);\n            backdrop-filter: blur(16px) saturate(1.08);\n            opacity: 0;\n            pointer-events: none;\n            transform: translate(-50%, 6px);\n            transition: opacity .15s ease, transform .15s ease;\n        }\n        .trailer-volume-wrap:hover .trailer-volume-popover {\n            opacity: 1;\n            pointer-events: auto;\n            transform: translate(-50%, 0);\n        }\n        .trailer-volume-rail {\n            position: absolute;\n            left: 50%;\n            top: 14px;\n            bottom: 14px;\n            width: 4px;\n            transform: translateX(-50%);\n            border-radius: 999px;\n            background: rgba(255, 255, 255, 0.32);\n            pointer-events: none;\n        }\n        .trailer-volume-fill {\n            position: absolute;\n            left: 0;\n            right: 0;\n            bottom: 0;\n            height: var(--volume-percent, 35%);\n            border-radius: 999px;\n            background: #38bdf8;\n        }\n        .trailer-volume-thumb {\n            position: absolute;\n            left: 50%;\n            bottom: var(--volume-percent, 35%);\n            width: 16px;\n            height: 16px;\n            transform: translate(-50%, 50%);\n            border-radius: 50%;\n            background: #38bdf8;\n            border: 2px solid rgba(255, 255, 255, 0.92);\n            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.38);\n        }\n        .trailer-volume-slider {\n            position: absolute;\n            top: 8px;\n            bottom: 8px;\n            left: 50%;\n            width: 16px;\n            height: calc(100% - 16px);\n            margin: 0;\n            transform: translateX(-50%);\n            appearance: none;\n            -webkit-appearance: none;\n            writing-mode: vertical-lr;\n            direction: rtl;\n            background: transparent;\n            cursor: pointer;\n        }\n        .trailer-volume-slider::-webkit-slider-runnable-track {\n            width: 100%;\n            height: 100%;\n            background: transparent;\n        }\n        .trailer-volume-slider::-moz-range-track {\n            width: 100%;\n            height: 100%;\n            background: transparent;\n        }\n        .trailer-volume-slider::-webkit-slider-thumb {\n            -webkit-appearance: none;\n            width: 24px;\n            height: 16px;\n            background: transparent;\n            border: 0;\n            box-shadow: none;\n        }\n        .trailer-volume-slider::-moz-range-thumb {\n            width: 24px;\n            height: 16px;\n            background: transparent;\n            border: 0;\n            box-shadow: none;\n        }\n        .trailer-time {\n            flex: 0 0 auto;\n            min-width: 36px;\n            color: rgba(255, 255, 255, 0.78);\n            font: 11px/1.3 Arial, "Microsoft YaHei", sans-serif;\n            white-space: nowrap;\n            text-align: center;\n        }\n        .trailer-progress {\n            flex: 1 1 160px;\n            min-width: 120px;\n            height: 4px;\n            margin: 0;\n            border-radius: 999px;\n            accent-color: #38bdf8;\n            cursor: pointer;\n        }\n        .jav-jump-toast {\n            position: fixed;\n            left: 50%;\n            top: 72px;\n            z-index: 2147483647;\n            display: flex;\n            align-items: flex-start;\n            gap: 12px;\n            width: min(420px, calc(100vw - 32px));\n            padding: 14px 16px;\n            color: #f8fafc;\n            background: rgba(15, 23, 42, 0.94);\n            border: 1px solid rgba(148, 163, 184, 0.28);\n            border-left: 4px solid #38bdf8;\n            border-radius: 12px;\n            box-shadow:\n                0 18px 44px rgba(0, 0, 0, 0.34),\n                0 0 0 1px rgba(255, 255, 255, 0.04) inset;\n            backdrop-filter: blur(14px) saturate(1.1);\n            font-family: Arial, "Microsoft YaHei", sans-serif;\n            transform: translate(-50%, -12px);\n            opacity: 0;\n            pointer-events: none;\n            transition: opacity .18s ease, transform .18s ease;\n        }\n        .jav-jump-toast.show {\n            opacity: 1;\n            transform: translate(-50%, 0);\n        }\n        .jav-jump-toast.hide {\n            opacity: 0;\n            transform: translate(-50%, -12px);\n        }\n        .jav-jump-toast-icon {\n            flex: 0 0 auto;\n            width: 24px;\n            height: 24px;\n            border-radius: 999px;\n            color: #082f49;\n            background: #7dd3fc;\n            font-size: 16px;\n            font-weight: 800;\n            line-height: 24px;\n            text-align: center;\n        }\n        .jav-jump-toast-title {\n            margin: 0 0 4px;\n            font-size: 14px;\n            font-weight: 700;\n            line-height: 1.35;\n        }\n        .jav-jump-toast-message {\n            margin: 0;\n            color: #cbd5e1;\n            font-size: 13px;\n            line-height: 1.45;\n        }\n        @media (max-width: 720px) {\n            .trailer-overlay { padding: 12px; }\n            .trailer-modal { width: 100%; border-radius: 8px; }\n            .trailer-header { padding: 12px 12px 30px; }\n            .trailer-title { gap: 7px; font-size: 13px; }\n            .trailer-source { max-width: 42vw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n            .trailer-footer {\n                left: 8px;\n                right: 8px;\n                bottom: 8px;\n                flex-direction: column;\n                align-items: stretch;\n                gap: 7px;\n                padding: 8px;\n            }\n            .trailer-control-left,\n            .trailer-control-right {\n                width: 100%;\n                justify-content: center;\n            }\n            .trailer-progress { min-width: 80px; }\n            .jav-jump-toast {\n                top: 18px;\n                width: calc(100vw - 24px);\n                padding: 13px 14px;\n            }\n        }\n    ');
    const C = {
        normalizeCode(e) {
            const t = String(e || "").trim();
            if (!t) return "";
            const n = t.replace(/\s+/g, "-").replace(/^FC2[-_]?PPV[-_]?/i, "FC2-").toUpperCase(), a = n.match(/(\d{6})[-_](\d{2,3})/);
            if (a) {
                const e = a[0].includes("_") ? "_" : "-";
                return `${a[1]}${e}${a[2]}`;
            }
            const i = n.match(/^([A-Z]{2,10})(\d{3,6})$/);
            if (i) {
                const e = i[2].replace(/^0+(?=\d{3})/, "");
                return `${i[1]}-${e}`;
            }
            const r = n.match(/^([A-Z0-9]{2,15}[-_]\d{2,9})/);
            return r ? r[1] : n;
        },
        extractCode(e, t = {}) {
            if (!e) return null;
            const n = String(e).match(/(?:(PACOPACOMAMA|PACO|10MUSUME|10MU|1PONDO|CARIBBEANCOM|CARIB|HEYZO)[-_\s]*)?(\d{6})([-_])(\d{2,3})/i);
            if (n) {
                const e = C.normalizeCode(`${n[2]}${n[3]}${n[4]}`);
                return t.keepUncensoredSource && n[1] ? `${n[1].toUpperCase()}_${e}` : e;
            }
            const a = [ {
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
            for (let t = 0; t < a.length; t++) {
                const {regex: n, type: r} = a[t], o = e.match(n);
                if (o) {
                    if ("alphanum" === r) return C.normalizeCode(o[0].trim());
                    if ("standard" === r) {
                        const e = o[1].toUpperCase();
                        if (i.includes(e)) continue;
                        return C.normalizeCode(o[3] ? `${e}-${o[2]}-${o[3]}` : `${e}-${o[2]}`);
                    }
                    if ("fc2" === r) return C.normalizeCode(`FC2-PPV-${o[1]}`);
                    if ("numeric" === r) return "_" === o[2] ? C.normalizeCode(`${o[1]}_${o[3]}`) : C.normalizeCode(`${o[1]}-${o[3]}`);
                    if ("compactStandard" === r) {
                        const e = o[1].toUpperCase();
                        if (i.includes(e)) continue;
                        const t = o[2].replace(/^0+(?=\d{3})/, "");
                        return C.normalizeCode(`${e}-${t}`);
                    }
                    if ("compact" === r) return C.normalizeCode(o[0].toUpperCase());
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
            const a = C.hexToRgb(e), i = C.hexToRgb(t), r = e => Math.round(a[e] * n + i[e] * (1 - n));
            return `rgb(${r("r")}, ${r("g")}, ${r("b")})`;
        },
        getModernBtnStyle(e) {
            const t = e || "#64748b", n = C.mixColor(t, "#ffffff", .1), a = C.mixColor(t, "#dbe3ef", .28), i = C.mixColor(t, "#111827", .72);
            return [ "height:30px", "padding:0 11px", `--jav-btn-accent:${t}`, `--jav-btn-hover-bg:${C.mixColor(t, "#ffffff", .16)}`, `background:${n}`, `color:${i}`, `border:1px solid ${a}`, "border-radius:7px", "font-size:13px", "font-weight:700", "line-height:1", "cursor:pointer", "text-decoration:none", "display:inline-flex", "align-items:center", "justify-content:center", "gap:6px", "white-space:nowrap", "box-shadow:inset 0 1px 0 rgba(255,255,255,0.7)", "box-sizing:border-box" ].join(";");
        },
        createLinkBtn(e, t, n) {
            const a = document.createElement("a");
            return a.textContent = e, a.href = n || "#", n && (a.target = "_blank"), a.rel = "noopener noreferrer", 
            a.style.cssText = C.getModernBtnStyle(t), a;
        },
        createJumpLinkBtn(e, t, n) {
            const a = C.createLinkBtn(e, t, n);
            return a.addEventListener("click", e => {
                e.stopImmediatePropagation();
            }, !0), a;
        },
        createBtn(e, t, n, a = !1) {
            const i = document.createElement("a");
            return i.textContent = e, i.style.cssText = C.getModernBtnStyle(t), a ? i.addEventListener("click", e => {
                e.preventDefault(), e.stopPropagation(), n();
            }, !0) : i.onclick = e => {
                e.preventDefault(), n();
            }, i;
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
            const i = document.createElement("div");
            i.className = "jav-jump-toast-icon", i.textContent = "!";
            const r = document.createElement("div"), o = document.createElement("p");
            o.className = "jav-jump-toast-title", o.textContent = e;
            const s = document.createElement("p");
            s.className = "jav-jump-toast-message", s.textContent = t, r.appendChild(o), t && r.appendChild(s), 
            a.appendChild(i), a.appendChild(r), document.body.appendChild(a), requestAnimationFrame(() => a.classList.add("show")), 
            setTimeout(() => {
                a.classList.remove("show"), a.classList.add("hide"), setTimeout(() => a.remove(), 220);
            }, n);
        },
        showOverlay(e, t, n = null) {
            const a = document.documentElement.style.overflow, i = document.body.style.overflow;
            document.documentElement.style.overflow = "hidden", document.body.style.overflow = "hidden";
            const r = document.createElement("div");
            r.className = "preview-overlay";
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
                const i = document.createElement("button");
                return i.className = `preview-btn ${n}`, i.innerHTML = `${t} ${e}`, i.onclick = a, 
                i;
            }, p = e => {
                m.classList.toggle("active", "javfree" === e), u.classList.toggle("active", "projectjav" === e), 
                h.classList.toggle("active", "javstore" === e);
            }, m = d("javfree", "🟢", "javfree", async e => {
                e.stopPropagation();
                const n = await E.javfree(t);
                n ? (l(n, "javfree"), p("javfree")) : alert("javfree 未找到预览图");
            }), u = d("projectjav", "🟡", "javstore", async e => {
                e.stopPropagation();
                const n = await E.projectjav(t);
                n ? (l(n, "projectjav"), p("projectjav")) : alert("projectjav 未找到预览图");
            }), h = d("javstore", "🔴", "javstore", async e => {
                e.stopPropagation();
                const n = await E.javstore(t);
                n ? (l(n, "javstore"), p("javstore")) : alert("javstore 未找到预览图");
            }), v = d("新窗口", "🌐", "action", e => {
                e.stopPropagation(), window.open(o.src);
            }), g = d("下载", "⬇️", "action", e => {
                e.stopPropagation(), GM_download(o.src, `${t}.jpg`);
            });
            "javfree" === n ? m.classList.add("active") : "projectjav" === n ? u.classList.add("active") : "javstore" === n && h.classList.add("active"), 
            c.appendChild(m), c.appendChild(u), c.appendChild(h), c.appendChild(v), c.appendChild(g), 
            r.appendChild(o);
            const b = () => {
                r.parentNode && (r.remove(), c.remove(), document.documentElement.style.overflow = a, 
                document.body.style.overflow = i, s && (URL.revokeObjectURL(s), s = null));
            };
            r.onclick = b;
            const f = e => {
                "Escape" === e.key && (b(), document.removeEventListener("keydown", f));
            };
            document.addEventListener("keydown", f), document.body.appendChild(r), document.body.appendChild(c);
        },
        showTrailerOverlay({code: e, url: t, type: n = "video", source: a = "预告片", qualities: i = null, quality: r = null, urls: o = null}) {
            document.querySelector(".trailer-overlay")?.remove();
            const s = "iframe" === n, l = document.documentElement.style.overflow, c = document.body.style.overflow;
            document.documentElement.style.overflow = "hidden", document.body.style.overflow = "hidden";
            const d = document.createElement("div");
            d.className = "trailer-overlay";
            const p = document.createElement("div");
            p.className = "trailer-modal", p.onclick = e => e.stopPropagation();
            const m = document.createElement("div");
            m.className = "trailer-header";
            const u = document.createElement("div");
            u.className = "trailer-title", u.innerHTML = `\n                <span>🎞️</span>\n                <span class="trailer-code">${e}</span>\n                <span class="trailer-source">${a}</span>\n            `;
            const h = document.createElement("button");
            h.className = "jav-player-close", h.type = "button", h.textContent = "×", m.appendChild(u), 
            m.appendChild(h);
            const v = document.createElement("div");
            v.className = "trailer-screen", s && v.classList.add("is-iframe");
            const g = document.createElement("div");
            g.className = "trailer-volume-indicator";
            const b = document.createElement("button");
            b.className = "trailer-control-btn", b.type = "button", b.textContent = "⏸", b.title = "播放/暂停";
            const f = document.createElement("button");
            f.className = "trailer-control-btn", f.type = "button", f.textContent = "🔊", f.title = "静音/取消静音";
            const x = document.createElement("div");
            x.className = "trailer-volume-wrap";
            const y = document.createElement("div");
            y.className = "trailer-volume-popover";
            const w = document.createElement("div");
            w.className = "trailer-volume-rail";
            const j = document.createElement("div");
            j.className = "trailer-volume-fill";
            const _ = document.createElement("div");
            _.className = "trailer-volume-thumb";
            const k = document.createElement("input");
            k.className = "trailer-volume-slider", k.type = "range", k.min = "0", k.max = "100", 
            k.step = "1", k.value = "35", k.title = "音量", w.appendChild(j), w.appendChild(_), 
            y.appendChild(w), y.appendChild(k), x.appendChild(f), x.appendChild(y);
            const S = document.createElement("span");
            S.className = "trailer-time", S.textContent = "00:00";
            const C = document.createElement("span");
            C.className = "trailer-time", C.textContent = "00:00";
            const E = document.createElement("input");
            E.className = "trailer-progress", E.type = "range", E.min = "0", E.max = "1000", 
            E.step = "1", E.value = "0", E.title = "播放进度";
            const q = document.createElement("button");
            q.className = "trailer-control-btn", q.type = "button", q.textContent = "⛶", q.title = "全屏";
            let A = null, L = t, $ = r, M = null, P = null, T = !1;
            const I = Array.isArray(o) ? [ ...new Set(o.filter(Boolean)) ] : [ t ].filter(Boolean);
            let z = Math.max(0, I.indexOf(t));
            const R = {
                href: L
            }, N = `trailer_playback_${String(e || "").trim().toUpperCase()}_${String(t || "").slice(0, 160)}`, B = (e = A?.currentTime || 0, t = N) => {
                if (!Number.isFinite(e) || e < 3) return;
                const n = Number(A?.duration || 0);
                Number.isFinite(n) && n > 0 && n - e < 3 ? sessionStorage.removeItem(t) : sessionStorage.setItem(t, String(Math.floor(e)));
            }, U = (e = N) => {
                if (!A || "1" === A.dataset.playbackRestored) return;
                const t = ((e = N) => {
                    const t = Number(sessionStorage.getItem(e) || 0);
                    return Number.isFinite(t) && t > 0 ? t : 0;
                })(e);
                if (!t) return;
                const n = Number(A.duration || 0);
                Number.isFinite(n) && n > 0 && t < n - 3 && (A.currentTime = t, A.dataset.playbackRestored = "1", 
                J());
            }, D = e => {
                if (!Number.isFinite(e) || e < 0) return "00:00";
                const t = Math.floor(e), n = Math.floor(t / 3600), a = Math.floor(t % 3600 / 60), i = t % 60;
                return n ? `${n}:${String(a).padStart(2, "0")}:${String(i).padStart(2, "0")}` : `${String(a).padStart(2, "0")}:${String(i).padStart(2, "0")}`;
            }, J = () => {
                A && (b.textContent = A.paused ? "▶" : "⏸", f.textContent = A.muted || A.volume <= 0 ? "🔇" : "🔊", 
                k.value = String(Math.round(100 * (A.muted ? 0 : A.volume))), w.style.setProperty("--volume-percent", `${k.value}%`), 
                S.textContent = D(A.currentTime || 0), C.textContent = D(A.duration || 0), !T && Number.isFinite(A.duration) && A.duration > 0 && (E.value = String(Math.round((A.currentTime || 0) / A.duration * 1e3))));
            }, G = () => {
                A && (g.textContent = `${Math.round(100 * A.volume)}%`, g.classList.add("is-visible"), 
                clearTimeout(M), M = setTimeout(() => {
                    g.classList.remove("is-visible");
                }, 820));
            }, O = () => {
                v.classList.remove("is-controls-hidden"), clearTimeout(P), A && !A.paused && (P = setTimeout(() => {
                    Q.matches(":hover") || document.activeElement === k || v.classList.add("is-controls-hidden");
                }, 2e3));
            }, H = () => {
                clearTimeout(P), A && !A.paused ? P = setTimeout(() => {
                    v.classList.add("is-controls-hidden");
                }, 2e3) : v.classList.remove("is-controls-hidden");
            }, F = () => {
                document.fullscreenElement ? document.exitFullscreen?.() : v.requestFullscreen?.();
            }, V = /\.m3u8(?:[?#].*)?$/i.test(t), K = () => class {
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
                            const i = "arraybuffer" === e.responseType ? t.response : t.responseText || "";
                            n.onSuccess?.({
                                data: i,
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
            }, W = e => {
                e && (A.src = e);
            }, Z = e => {
                e && (/\.m3u8(?:[?#].*)?$/i.test(e) ? (e => {
                    if (!e) return;
                    if (!(window.Hls && window.Hls.isSupported && window.Hls.isSupported())) return void (A.src = e);
                    const t = new window.Hls({
                        enableWorker: !1,
                        lowLatencyMode: !0,
                        loader: K(),
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
                        t.startLoad(0), A.play().catch(() => {});
                    }), t.on(window.Hls.Events.ERROR, (n, a) => {
                        if (a?.fatal) {
                            if (a.type === window.Hls.ErrorTypes.NETWORK_ERROR && z < I.length - 1) {
                                z += 1;
                                const e = I[z];
                                return L = e, R.href = e, t.loadSource(e), void t.startLoad(0);
                            }
                            if (z >= I.length - 1) {
                                try {
                                    t.destroy();
                                } catch {}
                                A._hls = null, A.src = e, A.load?.(), A.play().catch(() => {});
                            }
                        }
                    }), t.loadSource(e), t.attachMedia(A), A._hls = t;
                })(e) : W(e));
            };
            if (s) {
                const e = document.createElement("iframe");
                e.src = t, e.allow = "autoplay; fullscreen; picture-in-picture; encrypted-media", 
                e.allowFullscreen = !0, v.appendChild(e);
            } else {
                A = document.createElement("video"), A.controls = !1, A.autoplay = !0, A.loop = !0, 
                A.playsInline = !0;
                const e = Number(GM_getValue("trailer_volume", .35)), n = GM_getValue("trailer_muted", !1);
                A.volume = Number.isFinite(e) ? Math.min(1, Math.max(0, e)) : .35, A.muted = Boolean(n), 
                (e => {
                    if (V && !window.Hls) {
                        const t = document.createElement("script");
                        t.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js", t.async = !0, 
                        t.onload = () => Z(e), t.onerror = () => W(e), document.head.appendChild(t);
                    } else Z(e);
                    if (V) {
                        const t = e;
                        setTimeout(() => {
                            if (A && A.isConnected && A.readyState < 2 && !A.error) {
                                try {
                                    A._hls && (A._hls.destroy(), A._hls = null);
                                } catch {}
                                A.src = t, A.play().catch(() => {});
                            }
                        }, 2500);
                    }
                })(I[z] || t), A.preload = "auto", A.addEventListener("volumechange", () => {
                    GM_setValue("trailer_volume", A.volume), GM_setValue("trailer_muted", A.muted), 
                    J();
                }), A.addEventListener("play", () => {
                    J(), H();
                }), A.addEventListener("pause", () => {
                    J(), v.classList.remove("is-controls-hidden"), clearTimeout(P);
                }), A.addEventListener("timeupdate", () => {
                    J(), B();
                }), A.addEventListener("durationchange", () => {
                    J(), U();
                }), A.addEventListener("loadedmetadata", () => {
                    J(), U();
                }), A.addEventListener("ended", () => ((e = N) => sessionStorage.removeItem(e))()), 
                A.addEventListener("error", () => {
                    z >= I.length - 1 || (z += 1, L = I[z], R.href = L, A._hls && (A._hls.destroy(), 
                    A._hls = null), Z(L), A.load?.(), A.play().catch(() => {}));
                }), v.appendChild(A), v.appendChild(g), b.addEventListener("click", e => {
                    e.preventDefault(), e.stopPropagation(), A && (A.paused ? A.play().catch(() => {}) : A.pause(), 
                    J());
                }), f.addEventListener("click", e => {
                    e.preventDefault(), e.stopPropagation(), A && (A.muted = !A.muted, !A.muted && A.volume <= 0 && (A.volume = .35), 
                    G(), J());
                }), k.addEventListener("input", e => {
                    if (e.stopPropagation(), !A) return;
                    v.classList.remove("is-controls-hidden"), clearTimeout(P);
                    const t = Math.min(1, Math.max(0, Number(k.value) / 100));
                    A.volume = t, A.muted = t <= 0, G(), J();
                }), k.addEventListener("change", H), A.addEventListener("click", e => {
                    e.preventDefault(), A.paused ? A.play().catch(() => {}) : A.pause(), J();
                }), E.addEventListener("input", () => {
                    if (T = !0, !A || !Number.isFinite(A.duration) || A.duration <= 0) return;
                    const e = Number(E.value) / 1e3 * A.duration;
                    S.textContent = D(e);
                }), E.addEventListener("change", () => {
                    A && Number.isFinite(A.duration) && A.duration > 0 && (A.currentTime = Number(E.value) / 1e3 * A.duration, 
                    B(A.currentTime)), T = !1, J();
                }), q.addEventListener("click", e => {
                    e.preventDefault(), e.stopPropagation(), q.blur(), F();
                }), setTimeout(() => {
                    A.play().catch(() => {}), J(), H();
                }, 120);
            }
            const Y = document.createElement("div"), X = i && "object" == typeof i ? i : null;
            if (!s && X && Object.keys(X).length > 1) {
                const e = [ "4k", "hhb", "hmb", "mhb", "mmb", "dm", "sm" ], t = {
                    "4k": "4K",
                    hhb: "1080P",
                    hmb: "720P",
                    mhb: "576P",
                    mmb: "432P"
                }, n = Object.keys(X).filter(e => X[e]).sort((t, n) => e.indexOf(t) - e.indexOf(n));
                Y.className = "trailer-quality-bar";
                const a = document.createElement("select");
                a.className = "trailer-quality-select";
                const i = e => {
                    $ = e, L = X[e], a.value = e;
                };
                n.forEach(e => {
                    const n = document.createElement("option");
                    n.value = e, n.textContent = t[e] || e, a.appendChild(n);
                }), a.addEventListener("change", async () => {
                    const e = a.value;
                    if (!A || !X[e] || $ === e) return;
                    const t = A.currentTime || 0, n = !A.paused;
                    B(t), A.src = X[e], A.dataset.playbackRestored = "1", z = Math.max(0, I.indexOf(X[e])), 
                    A.load(), A.currentTime = t, i(e), R.href = L, n && await A.play().catch(() => {});
                }), Y.appendChild(a), i($ && X[$] ? $ : n[0]);
            }
            const Q = document.createElement("div");
            Q.className = "trailer-footer";
            const ee = document.createElement("div");
            ee.className = "trailer-control-left", s || (ee.appendChild(b), ee.appendChild(x), 
            ee.appendChild(S), ee.appendChild(E), ee.appendChild(C));
            const te = document.createElement("div");
            te.className = "trailer-control-right", te.appendChild(Y), Q.appendChild(ee), te.appendChild(q), 
            Q.appendChild(te), p.appendChild(v), v.appendChild(m), s || v.appendChild(Q), d.appendChild(p), 
            s || (v.addEventListener("mousemove", O), v.addEventListener("mouseenter", O), v.addEventListener("mouseleave", () => {
                A && !A.paused && v.classList.add("is-controls-hidden");
            }), Q.addEventListener("mouseenter", () => {
                v.classList.remove("is-controls-hidden"), clearTimeout(P);
            }), Q.addEventListener("mouseleave", H));
            const ne = (e = null) => {
                e && (e.preventDefault(), e.stopPropagation(), e.stopImmediatePropagation?.());
                const t = d.querySelector("video");
                t && (B(t.currentTime || 0), t.pause(), t.removeAttribute("src"), t.load()), d.remove(), 
                document.documentElement.style.overflow = l, document.body.style.overflow = c, window.removeEventListener("pointerdown", ae, !0), 
                window.removeEventListener("mousedown", ae, !0), window.removeEventListener("click", ae, !0), 
                document.removeEventListener("keydown", ie, !0), clearTimeout(M), clearTimeout(P);
            }, ae = e => {
                if (!d.contains(e.target)) return;
                (e.target === d || e.target.closest(".jav-player-close")) && ("click" !== e.type ? (e.stopPropagation(), 
                e.stopImmediatePropagation?.()) : ne(e));
            }, ie = e => {
                if ("Escape" === e.key) return void ne();
                if (s) return;
                const t = e.key;
                if ([ " ", "Spacebar", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown" ].includes(t) && (e.preventDefault(), 
                e.stopPropagation(), e.stopImmediatePropagation?.()), "Enter" === t) return F(), 
                void O();
                if (A) if (" " === t || "Spacebar" === t) A.paused ? A.play().catch(() => {}) : A.pause(), 
                J(), O(); else if ("ArrowLeft" === t) A.currentTime = Math.max(0, (A.currentTime || 0) - 2); else if ("ArrowRight" === t) {
                    const e = (A.currentTime || 0) + 2;
                    A.currentTime = Number.isFinite(A.duration) ? Math.min(A.duration, e) : e;
                } else if ("ArrowUp" === t || "ArrowDown" === t) {
                    const e = "ArrowUp" === t ? .05 : -.05;
                    A.volume = Math.min(1, Math.max(0, Math.round(100 * (A.volume + e)) / 100)), A.volume > 0 && (A.muted = !1), 
                    G();
                }
            };
            h.addEventListener("click", ne, !0), d.addEventListener("click", e => {
                e.target === d && ne(e);
            }, !0), window.addEventListener("pointerdown", ae, !0), window.addEventListener("mousedown", ae, !0), 
            window.addEventListener("click", ae, !0), document.addEventListener("keydown", ie, !0), 
            document.body.appendChild(d);
        },
        getJavBusUrl(e) {
            const t = e.toLowerCase();
            return /^\d{6}[-_\s]\d{3}$/.test(e) || t.startsWith("heyzo") || t.startsWith("carib") || t.startsWith("1pondo") || t.startsWith("tokyo") || t.startsWith("cat") || t.startsWith("paco") || t.startsWith("10mu") || t.startsWith("muram") || t.startsWith("gach") || t.startsWith("real") || t.startsWith("juku") || t.startsWith("aka") || t.startsWith("s-cute") || t.startsWith("n_") || /^n\d{4}$/.test(t) || t.startsWith("k_") || /^k\d{4}$/.test(t) ? `https://www.javbus.com/uncensored/search/${encodeURIComponent(e)}&type=1` : `https://www.javbus.com/search/${encodeURIComponent(e)}&type=&parent=ce`;
        }
    }, E = {
        sources: [ "javfree", "projectjav", "javstore" ],
        cacheKey: e => `thumb_cache_v3_${e}`,
        lookupCode(e) {
            const t = String(e || "").trim(), n = t.match(/^(?:FC2[-_\s]?(?:PPV[-_\s]?)?)?(\d{6,9})$/i);
            return n ? n[1] : t;
        },
        sourceOrder() {
            const e = $.getSourceOrder(), t = Array.isArray(e) ? e : [], n = new Set;
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
            const a = e?.querySelector("title")?.textContent || "", i = [ ...e?.querySelectorAll("h1,h2,h3,.entry-title,.movie-title,.post-title") || [] ].map(e => e.textContent || "").join(" "), r = (e?.body?.textContent || "").slice(0, 5e3);
            return this.isCodeMatched([ t, a, i, r ].join(" "), n);
        },
        normalizePreviewUrl(e, t = "") {
            if (!e) return "";
            return (/^https?:\/\//i.test(e) ? e : t ? new URL(e, t).href : e).replace(/^http:/, "https:");
        },
        isJavfreePreviewImage(e, t) {
            const n = String(e || "").split("?")[0], a = this.lookupCode(t), i = /^\d{6,9}$/.test(a), r = i ? new RegExp(`${a}_\\d+\\.(?:jpe?g|png|webp)$`, "i") : null;
            return this.isCodeMatched(n, t) && (/-(?:1080p|demosaic)\.(?:jpe?g|png|webp)$/i.test(n) || i && r.test(n));
        },
        selectJavfreePreviewUrl(e, t, n) {
            const a = [ ...e.querySelectorAll("p > img[src]") ].map(e => this.normalizePreviewUrl(e.getAttribute("src") || e.src || "", t)).filter(e => this.isJavfreePreviewImage(e, n));
            return a.find(e => /-1080p\./i.test(e)) || a.find(e => /-demosaic\./i.test(e)) || a.find(e => /_1\.(?:jpe?g|png|webp)$/i.test(e)) || "";
        },
        async javfree(e) {
            e = this.lookupCode(e);
            const t = this.cacheKey(e), n = $.getPreviewCacheEnabled();
            if (n) {
                const e = sessionStorage.getItem(t);
                if (e) return e;
            }
            try {
                const a = await C.request(`https://javfree.me/search/${e}`), i = (new DOMParser).parseFromString(a, "text/html"), r = [ ...i.querySelectorAll(".entry-title>a") ].find(t => this.isCodeMatched([ t.href, t.textContent ].join(" "), e))?.href;
                if (!r) return null;
                const o = await C.request(r), s = (new DOMParser).parseFromString(o, "text/html");
                if (!this.isDetailMatched(s, r, e)) return null;
                const l = this.selectJavfreePreviewUrl(s, r, e);
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
                const n = `https://javstore.net/search?q=${encodeURIComponent(e)}`, a = await C.request(n), i = (new DOMParser).parseFromString(a, "text/html").querySelectorAll('a[href*="/"]'), r = [];
                for (const e of i) {
                    const a = e.getAttribute("href");
                    if (!a) continue;
                    if (a.startsWith("http") && !a.includes("javstore.net")) continue;
                    const i = new URL(a, n);
                    if (!/javstore\.net$/i.test(i.hostname)) continue;
                    if (/^\/search(?:[/?#]|$)/i.test(i.pathname)) continue;
                    const o = i.href, s = decodeURIComponent(i.pathname.split("/").pop() || "").toLowerCase().replace(/-/g, "");
                    (/\.html$/i.test(i.pathname) || /^\/\d+[-/]/.test(i.pathname)) && s.includes(t) && !r.includes(o) && (r.push(o), 
                    console.log(`javstore: 候选链接 [${r.length}]: ${o}`));
                }
                if (0 === r.length) return console.warn("javstore: 未找到匹配的详情页"), null;
                for (const t of r) {
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
                const n = await C.request(e), a = (new DOMParser).parseFromString(n, "text/html");
                if (!this.isDetailMatched(a, e, t)) return console.warn("javstore: 详情页番号不匹配，跳过", e), 
                null;
                for (const t of a.querySelectorAll("a")) if (t.textContent.includes("CLICK HERE")) {
                    const n = t.href || t.getAttribute("href") || "";
                    if (n) return this.normalizePreviewUrl(n, e);
                }
                const i = a.querySelector('img[src*="_s.jpg"]');
                if (i) {
                    let t = i.getAttribute("src") || "";
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
                const a = await t(n), i = a.responseText || "", r = a.finalUrl || n, o = (new DOMParser).parseFromString(i, "text/html");
                let s = /\/movie\//i.test(new URL(r).pathname) ? r : "";
                if (!s) {
                    const e = [ ...o.querySelectorAll('a[href*="/movie/"]') ];
                    console.log(`[projectjav] /movie/ 链接数: ${e.length}`), e.slice(0, 5).forEach(e => console.log("  ", e.getAttribute("href")));
                    const t = e[0]?.getAttribute("href") || "";
                    if (!t) return console.warn("[projectjav] 无结果，页面标题:", o.title), console.warn("[projectjav] 页面前800字符:", i.slice(0, 800)), 
                    null;
                    s = t.startsWith("http") ? t : `https://projectjav.com${t}`;
                }
                console.log("[projectjav] 详情页:", s);
                const l = r === s ? a : await t(s), c = l.responseText || "", d = l.finalUrl || s, p = (new DOMParser).parseFromString(c, "text/html"), m = [ ...p.querySelectorAll('.col-md-12.thumbnail a[data-featherlight="image"], .thumbnail a[data-featherlight="image"]') ].find(t => this.isCodeMatched([ t.outerHTML, t.closest(".thumbnail")?.outerHTML, d ].join(" "), e));
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
            const t = $.getPreviewCacheEnabled(), n = this.cacheKey(e);
            if (t) {
                const e = sessionStorage.getItem(n);
                if (e) return {
                    url: e,
                    source: null
                };
            }
            let a = null, i = null;
            for (const t of this.sourceOrder()) {
                if (a = await this.fetchFromSource(t, e), a) {
                    i = t;
                    break;
                }
                console.log(`${t} 无结果，尝试下一个来源`);
            }
            return console.log("预览图最终结果:", a ? `有图 (${i})` : "无图"), a && t && sessionStorage.setItem(n, a), 
            {
                url: a,
                source: i
            };
        },
        async show(e) {
            const t = await this.get(e);
            t.url ? C.showOverlay(t.url, e, t.source) : alert("未找到预览图");
        }
    }, q = (() => {
        let e = !1;
        function t() {
            return GM_getValue("list_preview_quick_enabled", !0);
        }
        function n(e) {
            if (!e) return;
            const n = j.getCardCover(e);
            if (!n) return;
            const a = n.querySelector(".jav-list-preview-btn");
            if (!t()) return void a?.remove();
            const i = j.getCardCode(e);
            if (!i) return void a?.remove();
            if (a) return a.dataset.code = i, void (a.title = `预览图 ${i}`);
            const r = document.createElement("span");
            r.className = "jav-list-preview-btn", r.dataset.code = i, r.setAttribute("role", "button"), 
            r.tabIndex = 0, r.title = `预览图 ${i}`, r.innerHTML = '<span class="jav-list-preview-icon" aria-hidden="true"></span>';
            const o = async t => {
                if (t.preventDefault(), t.stopPropagation(), t.stopImmediatePropagation?.(), "1" === r.dataset.loading) return;
                const n = r.dataset.code || j.getCardCode(e);
                if (n) {
                    r.dataset.loading = "1", r.style.pointerEvents = "none", r.style.opacity = ".72";
                    try {
                        await E.show(n);
                    } finally {
                        delete r.dataset.loading, r.style.pointerEvents = "", r.style.opacity = "";
                    }
                }
            };
            r.addEventListener("click", o, !0), r.addEventListener("keydown", e => {
                "Enter" !== e.key && " " !== e.key || o(e);
            }, !0), n.appendChild(r);
        }
        function a() {
            document.querySelectorAll(".jav-list-preview-btn").forEach(e => e.remove());
        }
        return {
            sync: function() {
                j.isDetailPage() ? a() : (e || (e = !0, GM_addStyle("\n                .jav-card-cover {\n                    position: relative !important;\n                }\n                .jav-list-preview-btn {\n                    position: absolute;\n                    right: 8px;\n                    bottom: 8px;\n                    z-index: 3;\n                    width: 32px;\n                    height: 32px;\n                    display: inline-flex;\n                    align-items: center;\n                    justify-content: center;\n                    border: 1px solid rgba(255,255,255,.28);\n                    border-radius: 999px;\n                    background: rgba(15,23,42,.56);\n                    color: #fff;\n                    backdrop-filter: blur(8px);\n                    box-shadow: 0 4px 12px rgba(0,0,0,.24);\n                    cursor: pointer;\n                    user-select: none;\n                    transition: transform .16s ease, background .16s ease, border-color .16s ease, box-shadow .16s ease;\n                }\n                .jav-list-preview-btn:hover {\n                    transform: translateY(-1px) scale(1.04);\n                    background: rgba(37,99,235,.78);\n                    border-color: rgba(255,255,255,.42);\n                    box-shadow: 0 8px 18px rgba(15,23,42,.28);\n                }\n                .jav-list-preview-btn:active {\n                    transform: scale(.96);\n                }\n                .jav-list-preview-btn:focus-visible {\n                    outline: 2px solid rgba(191,219,254,.95);\n                    outline-offset: 2px;\n                }\n                .jav-list-preview-icon {\n                    width: 16px;\n                    height: 16px;\n                    display: block;\n                    background-repeat: no-repeat;\n                    background-position: center;\n                    background-size: contain;\n                    background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z'/%3E%3Ccircle cx='12' cy='12' r='2.9'/%3E%3C/svg%3E\");\n                    opacity: .96;\n                }\n            ")), 
                t() ? j.getListCards().forEach(n) : a());
            },
            removeAll: a,
            attach: n
        };
    })();
    l.expose("__LAOSIJI_LIST_PREVIEW__", q);
    const A = (() => {
        let e = !1, t = 0, n = {
            code: "",
            status: ""
        };
        function a() {
            j.clearDetailPreviewInline();
        }
        return {
            sync: async function() {
                if (!GM_getValue("detail_preview_inline_enabled", !0) || !j.isDetailPage()) return t++, 
                a(), void (n = {
                    code: "",
                    status: ""
                });
                e || (e = !0, GM_addStyle("\n                .jav-nong-slot.has-detail-preview-inline {\n                    display: flex !important;\n                    align-items: flex-start !important;\n                    gap: 12px !important;\n                    overflow: visible !important;\n                }\n                .jav-detail-preview-standalone {\n                    display: flex !important;\n                    align-items: flex-start !important;\n                    gap: 12px !important;\n                    min-width: 0 !important;\n                    align-self: flex-start !important;\n                    overflow: visible !important;\n                }\n                .row.movie > .jav-detail-preview-standalone {\n                    flex: 0 0 180px !important;\n                }\n                .jav-flex-container > .jav-detail-preview-standalone {\n                    flex: 0 0 180px !important;\n                }\n                #video_jacket_info tr > .jav-detail-preview-standalone {\n                    flex: 0 0 180px !important;\n                    min-width: 160px !important;\n                    vertical-align: top !important;\n                }\n                .javlib-nong-slot.has-detail-preview-inline {\n                    width: 100% !important;\n                }\n                .jav-nong-slot.has-detail-preview-inline .jav-nong-wrapper {\n                    flex: 1 1 auto !important;\n                    min-width: 0 !important;\n                }\n                .javlib-nong-slot.has-detail-preview-inline > div:not(.jav-detail-preview-wrap) {\n                    flex: 1 1 0 !important;\n                    min-width: 0 !important;\n                    display: block !important;\n                }\n                .javlib-nong-slot.has-detail-preview-inline > .jav-detail-preview-wrap {\n                    flex: 0 0 180px !important;\n                    width: 180px !important;\n                    max-width: 180px !important;\n                    min-width: 160px !important;\n                    height: 480px !important;\n                    max-height: 480px !important;\n                    overflow: hidden !important;\n                    display: block !important;\n                }\n                .jav-detail-preview-wrap {\n                    flex: 0 0 180px;\n                    width: 180px;\n                    max-width: 180px;\n                    min-width: 150px;\n                    align-self: flex-start;\n                    position: relative;\n                    box-sizing: border-box;\n                    overflow: hidden;\n                }\n                .jav-detail-preview-inline {\n                    display: block;\n                    width: 100%;\n                    height: auto;\n                    max-width: 100%;\n                    max-height: 480px;\n                    object-fit: contain;\n                    border-radius: 6px;\n                    cursor: zoom-in;\n                }\n                .javlib-nong-slot.has-detail-preview-inline .jav-detail-preview-inline {\n                    width: 100% !important;\n                    height: 100% !important;\n                    max-width: 100% !important;\n                    max-height: 100% !important;\n                    object-fit: contain !important;\n                }\n                .jav-detail-preview-loading {\n                    position: absolute;\n                    inset: 0;\n                    display: grid;\n                    place-items: center;\n                    color: #475569;\n                    font-size: 12px;\n                    font-weight: 700;\n                    white-space: nowrap;\n                    pointer-events: none;\n                }\n                @media (max-width: 900px) {\n                    .jav-nong-slot.has-detail-preview-inline {\n                        flex-wrap: wrap !important;\n                    }\n                    .jav-detail-preview-standalone {\n                        flex-basis: 100% !important;\n                    }\n                    .jav-detail-preview-wrap {\n                        flex-basis: 100%;\n                        width: 100%;\n                        max-width: 100%;\n                    }\n                    .jav-detail-preview-inline {\n                        max-width: 100%;\n                        max-height: 480px;\n                        margin: 0 auto;\n                    }\n                    .javlib-nong-slot.has-detail-preview-inline > .jav-detail-preview-wrap {\n                        flex-basis: 100% !important;\n                        width: 100% !important;\n                        max-width: 100% !important;\n                        height: 480px !important;\n                        max-height: 480px !important;\n                    }\n                }\n            "));
                const i = j.getDetailCode();
                if (!i) return t++, a(), void (n = {
                    code: "",
                    status: ""
                });
                if (n.code === i && "missing" === n.status) return;
                const r = document.querySelector(".jav-detail-preview-wrap");
                if (r?.dataset.code === i && "loaded" === r.dataset.state) return;
                if (r?.dataset.code === i && "loading" === r.dataset.state) return;
                const o = ++t;
                n = {
                    code: i,
                    status: "loading"
                }, r && r.dataset.code !== i && r.remove();
                const s = j.getDetailPreviewTarget();
                if (!s) return;
                s.standalone || s.slot.classList.add("has-detail-preview-inline");
                let l = document.querySelector(".jav-detail-preview-wrap");
                if (l) l.dataset.code = i, l.dataset.state = "loading", l.innerHTML = '<span class="jav-detail-preview-loading">预览图加载中...</span>'; else {
                    l = document.createElement("div"), l.className = "jav-detail-preview-wrap", l.dataset.code = i, 
                    l.dataset.state = "loading";
                    const e = document.createElement("span");
                    e.className = "jav-detail-preview-loading", e.textContent = "预览图加载中...", l.appendChild(e), 
                    s.anchor?.parentElement === s.slot ? s.slot.insertBefore(l, s.anchor) : s.slot.insertBefore(l, s.slot.firstChild);
                }
                const c = await E.get(i);
                if (o !== t || !l.isConnected) return;
                if (!c?.url) return l.remove(), s.standalone || s.slot.classList.remove("has-detail-preview-inline"), 
                void (n = {
                    code: i,
                    status: "missing"
                });
                n = {
                    code: i,
                    status: "loaded"
                }, l.dataset.state = "loaded", l.innerHTML = "";
                const d = document.createElement("img");
                d.className = "jav-detail-preview-inline", d.dataset.code = i, d.src = c.url, d.alt = i, 
                d.loading = "lazy", d.title = "点击查看预览图", d.addEventListener("click", e => {
                    e.preventDefault(), e.stopPropagation(), C.showOverlay(c.url, i, c.source);
                }), l.appendChild(d);
            },
            remove: a
        };
    })();
    l.expose("__LAOSIJI_DETAIL_PREVIEW_INLINE__", A);
    const L = {
        normalize: e => C.normalizeCode(e),
        cacheKey(e) {
            return `trailer_cache_v10_${this.normalize(e)}`;
        },
        debug(...e) {
            console.log("[TrailerResolver]", ...e);
        },
        resolverChain() {
            return [ "fromJavxyCcCd" ].map(e => ({
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
            }), C.showTrailerOverlay({
                code: this.normalize(e),
                url: t.url,
                type: t.type || "video",
                source: t.source || "预告片",
                qualities: t.qualities,
                quality: t.quality,
                urls: t.urls
            })) : (this.debug("最终未找到可用视频源", {
                code: this.normalize(e)
            }), C.showToast("未找到可用的视频源。", "节点不可用，请将DMM域名分流到日本ip", 3e3));
        },
        async get(e) {
            const t = String(e || "").trim(), n = this.normalize(e), a = $.getTrailerCacheEnabled();
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
                const i = e.name || "anonymous";
                try {
                    this.debug("尝试来源", i);
                    const r = await e.fn.call(this, n, t);
                    if (r?.url) return this.debug("来源命中", i, {
                        source: r.source,
                        type: r.type || "video",
                        url: r.url,
                        qualities: r.qualities ? Object.keys(r.qualities) : []
                    }), a && sessionStorage.setItem(this.cacheKey(n), JSON.stringify(r)), r;
                    this.debug("来源无结果", i);
                } catch (e) {
                    console.warn(`[TrailerResolver] 来源异常: ${i}`, e);
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
        javxyToken: () => [ 118, 119, 112, 71, 97, 110, 28, 84, 124, 65, 76, 102, 65, 16, 77, 109, 64, 82, 85, 83, 67, 92, 125, 108, 83, 65, 124, 107, 84, 104, 71, 84, 17, 124, 118, 125, 104, 8, 125, 96, 112, 103, 29, 18, 82, 83, 87, 84 ].map(e => String.fromCharCode(37 ^ e)).join(""),
        result: (e, t, n = "video", a = {}) => ({
            url: e,
            source: t,
            type: n,
            ...a
        }),
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
            const a = [ {
                host: "javxy.cc.cd",
                label: "Javxy"
            }, {
                host: "worker.javxy.cc.cd",
                label: "Javxy Worker"
            } ];
            for (const e of a) {
                const t = `https://${e.host}/trailers/${encodeURIComponent(n)}?client=laosiji-new`;
                this.debug("Javxy 请求 API", {
                    query: n,
                    apiUrl: t,
                    endpoint: e.label
                });
                const a = await this.request(t, {
                    timeout: 15e3,
                    headers: {
                        Accept: "application/json,text/plain,*/*",
                        "X-Javxy-Token": this.javxyToken()
                    }
                });
                if (!a) {
                    this.debug("Javxy API 网络失败，尝试下一个节点", {
                        endpoint: e.label
                    });
                    continue;
                }
                if (a.status >= 500 || 0 === a.status) {
                    this.debug("Javxy API 服务异常，尝试下一个节点", {
                        endpoint: e.label,
                        status: a.status
                    });
                    continue;
                }
                if (a.status < 200 || a.status >= 400) return this.debug("Javxy API 无结果，停止查询", {
                    endpoint: e.label,
                    status: a.status
                }), null;
                if (!a.responseText) return this.debug("Javxy API 响应为空，停止查询", {
                    endpoint: e.label,
                    status: a.status
                }), null;
                let i;
                try {
                    i = JSON.parse(a.responseText);
                } catch {
                    this.debug("Javxy JSON 解析失败，尝试下一个节点", {
                        endpoint: e.label
                    });
                    continue;
                }
                const r = String(i?.trailer || "").trim();
                if (!r) return this.debug("Javxy 无 trailer 字段，停止查询", {
                    endpoint: e.label,
                    keys: Object.keys(i || {})
                }), null;
                const o = i?.qualities && "object" == typeof i.qualities ? i.qualities : {}, s = i?.quality && o[i.quality] ? i.quality : this.selectHighestQuality(o), l = this.javxySourceLabels[i?.source] || `Javxy | ${i?.source || "dmm"}`, c = "javxy.cc.cd" === e.host ? l : `${l} | Worker`;
                this.debug("Javxy 返回结果", {
                    endpoint: e.label,
                    source: i?.source,
                    quality: s,
                    qualities: Object.keys(o)
                });
                const d = String(i?.type || "").trim() || "video";
                return this.result(o[s] || r, c, d, {
                    qualities: o,
                    quality: s,
                    urls: Array.isArray(i?.urls) && i.urls.length ? i.urls : this.sortQualityKeys(o).map(e => o[e])
                });
            }
            return null;
        }
    }, $ = {
        getPreviewCacheEnabled: () => !0,
        getTrailerCacheEnabled: () => !0,
        getDefaultSearchEngine() {
            const e = GM_getValue("default_search_engine", 2);
            return M[e] || M[0];
        },
        getDefaultVideoEngine: () => GM_getValue("default_video_engine", "missav"),
        getVideoEngines: () => c,
        getSourceOrder: () => GM_getValue("thumb_source_order", [ "javfree", "projectjav", "javstore" ])
    }, M = [ {
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
    } ], P = {
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
            const i = String(e || "").match(new RegExp(`\\b(${n})[-_\\s]*(\\d{6})([-_])(\\d{2,3})\\b`, "i"));
            if (i) {
                const e = i[1].toUpperCase(), t = "_" === i[3] ? "_" : "-";
                return `${i[2]}${t}${i[4]}-${e}`;
            }
            return t || C.extractCode(e);
        },
        searchKeyword: e => String(e || "").trim().toLowerCase().replace(/^fc2-/, ""),
        searchVariants(e) {
            const t = this.normalizeKeepSeparator(e), n = [ t ], a = t.match(/^(\d{3})([A-Z]{2,10})-(\d{2,6})$/);
            a && Object.values(this.mgstagePrefixMap).includes(`${a[1]}${a[2]}`) && n.push(`${a[2]}-${a[3]}`);
            const i = t.match(/^([A-Z]{2,10})-(\d{2,6})$/);
            i && this.mgstagePrefixMap[i[1]] && n.push(`${this.mgstagePrefixMap[i[1]]}-${i[2]}`);
            const r = this.uncensoredParts(t);
            return r && (n.push(`${r.date}${r.sep}${r.num}`), r.source && this.sourceGroup(r.source).forEach(e => {
                n.push(`${r.date}${r.sep}${r.num}-${e}`), n.push(`${e}-${r.date}${r.sep}${r.num}`);
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
                if (!1 === (e?.state ?? e?.success)) {
                    throw new Error(String(e?.error || e?.message || e?.errno || "115查询失败"));
                }
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
    function T(e, t, n, a = null) {
        let i = null;
        const r = () => {
            i && (clearTimeout(i), i = null);
        }, o = () => {
            r(), n.classList.remove("is-open");
        }, s = () => {
            r(), n.classList.contains("is-open") && (i = setTimeout(o, 1e3));
        };
        t.addEventListener("click", t => {
            t.preventDefault(), t.stopPropagation();
            const a = !n.classList.contains("is-open");
            !function(e = null) {
                document.querySelectorAll(".search-submenu.is-open").forEach(t => {
                    t !== e && t.classList.remove("is-open");
                });
            }(n), r(), n.classList.toggle("is-open", a), a && !e.matches(":hover") && s();
        }), e.addEventListener("mouseenter", r), e.addEventListener("mouseleave", s), a && a.addEventListener("click", o), 
        n.addEventListener("click", e => {
            e.target.closest("a") && o();
        }), document.addEventListener("click", t => {
            e.contains(t.target) || o();
        });
    }
    function I(e, t, n = !1) {
        if (!GM_getValue("btn_show_nyaa", !0)) return;
        if (/sukebei\.nyaa/i.test(location.hostname)) return;
        const a = C.createJumpLinkBtn("🔍 Sukebei", "#17a2b8", `https://sukebei.nyaa.si/?f=0&c=0_0&q=${encodeURIComponent(e)}`);
        t.appendChild(a);
    }
    function z(e, t, n = !1) {
        if (!GM_getValue("btn_show_javbus", !0)) return;
        if (/javbus\.com/i.test(location.hostname)) return;
        const a = C.getJavBusUrl(e), i = C.createJumpLinkBtn("🎬 JavBus", "#007bff", a);
        t.appendChild(i);
    }
    function R(e, t, n = !1) {
        if (!GM_getValue("btn_show_javdb", !0)) return;
        if (/javdb\.com/i.test(location.hostname)) return;
        const a = C.createJumpLinkBtn("📀 JavDB", "#6f42c1", `https://javdb.com/search?q=${encodeURIComponent(e)}`);
        t.appendChild(a);
    }
    function N(e, t, n = !1) {
        const a = GM_getValue("btn_show_missav", !0);
        if (!a) return;
        const i = e.toLowerCase(), r = i.replace(/-/g, ""), o = {
            missav: `https://missav.ws/${i}`,
            jable: `https://jable.tv/videos/${i}/`,
            "123av": `https://123av.com/zh/v/${i}`,
            javday: `https://javday.app/videos/${r}/`,
            supjav: `https://supjav.com/zh/?s=${encodeURIComponent(e)}`,
            javrate: `https://www.javrate.com/search/${encodeURIComponent(i)}`
        }, s = new Set([ ...a ? [ "missav", "jable", "123av", "javday", "supjav", "javrate" ] : [] ]), l = $.getVideoEngines().filter(e => s.has(e.key) && !e.host.test(location.hostname)).map(e => ({
            ...e,
            url: o[e.key]
        })).filter(e => e.url);
        if (!l.length) return;
        const c = $.getDefaultVideoEngine(), d = l.find(e => e.key === c) || l[0], p = l.filter(e => e !== d), m = e => C.createJumpLinkBtn(`🎬 ${e.label}`, e.color, e.url);
        if (!p.length) return void t.appendChild(m(d));
        const u = document.createElement("div");
        u.className = "search-menu missav-menu", u.style.setProperty("--jav-btn-accent", d.color);
        const h = m(d);
        h.classList.add("search-main-btn"), u.appendChild(h);
        const v = document.createElement("button");
        v.type = "button", v.className = "search-toggle-btn", v.title = "展开同类站点", v.innerHTML = '<span class="search-arrow">▼</span>', 
        u.appendChild(v);
        const g = document.createElement("div");
        g.className = "search-submenu", p.forEach(e => {
            const t = m(e);
            t.style.margin = "2px 0", t.style.width = "100%", t.style.textAlign = "left", g.appendChild(t);
        }), u.appendChild(g), T(u, v, g, h), t.appendChild(u);
    }
    function B(e, t, n = !1) {
        if (!GM_getValue("btn_show_fanza", !0)) return;
        const a = C.createBtn("▶ FANZA", "#c0392b", () => {
            window.open(`https://www.dmm.co.jp/mono/-/search/=/searchstr=${encodeURIComponent(e)}/`);
        }, n);
        t.appendChild(a);
    }
    function U(e, t, n = !1) {
        if (!GM_getValue("btn_show_trailer", !0)) return;
        const a = C.createBtn("🎞️ 预告片", "#111827", async () => {
            const t = a.textContent;
            a.textContent = "🎞️ 解析中...", a.style.pointerEvents = "none", a.style.opacity = "0.72";
            try {
                await L.show(e);
            } finally {
                a.textContent = t, a.style.pointerEvents = "", a.style.opacity = "";
            }
        }, n);
        a.classList.add("jav-trailer-btn"), t.appendChild(a);
    }
    function D(e, t, n = !1) {
        if (!GM_getValue("btn_show_preview", !0)) return;
        const a = C.createBtn("🖼️ 预览图", "#28a745", async () => {
            await E.show(e);
        }, n);
        a.classList.add("jav-preview-btn"), t.appendChild(a);
    }
    function J(e, t, n = !1) {
        if (!P.enabled() || !e || !t) return;
        const a = P.normalizeKeepSeparator(e);
        if (!a || t.dataset.pan115PlayCode === a) return;
        t.dataset.pan115PlayCode = a;
        const i = document.createComment("pan115-play"), r = t.querySelector(".jav-trailer-btn, .jav-preview-btn, .jav-settings-btn");
        t.insertBefore(i, r || null), P.searchCached(a).then(e => {
            const t = e?.pickcode;
            if (!P.enabled() || !t || !i.parentNode) return;
            const n = C.createJumpLinkBtn("115播放", "#00a85a", P.playUrl(t));
            n.classList.add("jav-pan115-play-btn"), n.dataset.pickcode = t, n.title = e.name || `115播放：${a}`, 
            i.parentNode.insertBefore(n, i);
        }).catch(e => {
            console.warn("[老司机] 115自动查询失败:", e);
        }).finally(() => {
            i.remove();
        });
    }
    function G(e, t, n = !1) {
        if (!GM_getValue("btn_show_search", !0)) return;
        const a = $.getDefaultSearchEngine(), i = document.createElement("div");
        i.className = "search-menu", i.style.setProperty("--jav-btn-accent", a.color);
        const r = C.createBtn(`🔍 ${a.name}`, a.color, () => {
            window.open(a.url(e));
        }, n);
        r.classList.add("search-main-btn"), i.appendChild(r);
        const o = document.createElement("button");
        o.type = "button", o.className = "search-toggle-btn", o.title = "展开搜索引擎", o.innerHTML = '<span class="search-arrow">▼</span>', 
        i.appendChild(o);
        const s = document.createElement("div");
        s.className = "search-submenu", M.forEach(t => {
            if (t.name === a.name) return;
            const i = C.createBtn(`🔍 ${t.name}`, t.color, () => {
                window.open(t.url(e)), s.classList.remove("is-open");
            }, n);
            i.style.margin = "2px 0", i.style.width = "100%", i.style.textAlign = "left", s.appendChild(i);
        }), i.appendChild(s), T(i, o, s, r), t.appendChild(i);
    }
    function O(e, t = !1) {
        if (!e || e.querySelector(".jav-settings-btn")) return;
        const n = C.createBtn("⚙️ 设置", "#475569", () => {
            g.open();
        }, t);
        n.classList.add("jav-settings-btn"), n.title = "打开老司机设置", e.appendChild(n);
    }
    function H(e, t, n = !0) {
        const a = P.playUrl(e.pickcode), i = document.createElement(n ? "a" : "span");
        if (i.className = "jav-pan115-badge", i.textContent = "115匹配", i.title = e.name || `115播放：${P.normalizeKeepSeparator(t)}`, 
        i.dataset.pickcode = e.pickcode, n) i.href = a, i.target = "_blank", i.rel = "noopener noreferrer", 
        i.addEventListener("click", e => {
            e.stopImmediatePropagation();
        }, !0); else {
            i.setAttribute("role", "link"), i.tabIndex = 0;
            const e = e => {
                e.preventDefault(), e.stopImmediatePropagation(), window.open(P.playUrl(i.dataset.pickcode), "_blank", "noopener,noreferrer");
            };
            i.addEventListener("click", e, !0), i.addEventListener("keydown", t => {
                "Enter" !== t.key && " " !== t.key || e(t);
            }, !0);
        }
        return i;
    }
    let F = !1;
    async function V() {
        if (!P.enabled() || F || j.isDetailPage()) return;
        F = !0;
        const e = j.collectPan115ListTargets().slice(0, 36);
        try {
            e.forEach(({anchor: e}) => {
                e.dataset.pan115Checked = "1";
            }), await Promise.all(e.map(async ({anchor: e, code: t}) => {
                try {
                    const n = await P.searchCached(t);
                    j.insertPan115ListBadge(e, n, t);
                } catch (e) {
                    console.warn("[老司机] 115列表单项查询失败:", e);
                }
            }));
        } catch (e) {
            console.warn("[老司机] 115列表自动查询失败:", e);
        } finally {
            F = !1, P.enabled() && j.collectPan115ListTargets().length && oe();
        }
    }
    function K() {
        document.querySelectorAll(".jav-pan115-badge[data-pickcode], .jav-pan115-play-btn[data-pickcode]").forEach(e => {
            const t = P.playUrl(e.dataset.pickcode);
            "A" === e.tagName && (e.href = t);
        }), j.isDetailPage() ? ae.render() : oe();
    }
    function W(e = P.enabled()) {
        if (!e) return clearTimeout(re), document.querySelectorAll(".jav-pan115-badge, .jav-pan115-play-btn").forEach(e => e.remove()), 
        document.querySelectorAll("[data-pan115-checked], [data-pan115-has-badge]").forEach(e => {
            delete e.dataset.pan115Checked, delete e.dataset.pan115HasBadge;
        }), void document.querySelectorAll("[data-pan115-play-code]").forEach(e => {
            delete e.dataset.pan115PlayCode;
        });
        setTimeout(K, 0);
    }
    function Z(e) {
        const t = document.createElement("span");
        t.className = "jav-jump-line-break", t.style.cssText = "flex-basis:100%;height:0;padding:0;margin:0;", 
        e.appendChild(t);
    }
    l.expose("__LAOSIJI_SYNC_PAN115__", W);
    const Y = [ {
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
        match: e => /(javlibrary|javlib|r86m|s87n)/i.test(e) && /\/cn\/jav\w+\.html/i.test(e),
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
    l.expose("__LAOSIJI_JUMP_SITES__", Y);
    const X = (() => {
        let e = !1;
        function t(e) {
            const t = String(e || "").replace(/\s+/g, " ").trim(), n = C.extractCode(t);
            return n && t.replace(new RegExp(`^\\s*${a = n, String(a || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "i"), "").trim() || t;
            var a;
        }
        async function n(e) {
            const t = function(e) {
                return `title_translate_pa_v1_${encodeURIComponent(String(e || "").slice(0, 180))}`;
            }(e), n = sessionStorage.getItem(t);
            if (n) return n;
            const a = "https://translate-pa.googleapis.com/v1/translate?" + new URLSearchParams({
                "params.client": "gtx",
                dataTypes: "TRANSLATION",
                key: "AIzaSyDLEeFI5OtFBwYBIoK_jj5m32rZK5CkCXA",
                "query.sourceLanguage": "ja",
                "query.targetLanguage": "zh-CN",
                "query.text": e
            }).toString(), i = await u(a, {
                timeout: 15e3
            });
            if (!i.loadstuts || i.status < 200 || i.status >= 400) throw new Error(`HTTP ${i.status || 0}`);
            const r = JSON.parse(i.responseText || "{}"), o = String(r.translation || "").trim();
            if (!o) throw new Error("empty translation");
            return sessionStorage.setItem(t, o), o;
        }
        function i() {
            document.querySelectorAll(".jav-title-translation").forEach(e => e.remove());
        }
        return {
            sync: async function() {
                if (!a.titleTranslate) return void i();
                const r = function() {
                    const e = j.getJumpSite();
                    if (!e || ![ "javdb", "javbus", "javlibrary" ].includes(e.id)) return null;
                    if ("javdb" === e.id) {
                        const t = document.querySelector("strong.current-title, .current-title");
                        if (!t) return null;
                        const n = t.textContent.trim();
                        return {
                            site: e.id,
                            text: n,
                            anchor: t.closest("h2") || t
                        };
                    }
                    if ("javbus" === e.id) {
                        const n = document.querySelector('h3[data-enhanced="1"]') || j.getJumpTitleElement(e);
                        return n ? {
                            site: e.id,
                            text: t(n.textContent),
                            anchor: n
                        } : null;
                    }
                    const n = document.querySelector("#video_title .post-title.text a, #video_title .post-title.text, .post-title a, .post-title");
                    return n ? {
                        site: e.id,
                        text: t(n.textContent),
                        anchor: n.closest("h3") || n
                    } : null;
                }();
                if (!r?.text || !r.anchor) return void i();
                e || (e = !0, GM_addStyle("\n                .jav-title-translation {\n                    margin: 6px 0 8px !important;\n                    padding: 7px 10px !important;\n                    border-left: 3px solid #60a5fa !important;\n                    background: #eff6ff !important;\n                    color: #1e3a8a !important;\n                    font-size: 20px !important;\n                    font-weight: 700 !important;\n                    line-height: 1.5 !important;\n                    word-break: break-word !important;\n                    border-radius: 0 6px 6px 0 !important;\n                }\n                .jav-title-translation.is-loading {\n                    color: #64748b !important;\n                    background: #f8fafc !important;\n                    border-left-color: #cbd5e1 !important;\n                }\n                .jav-title-translation.is-error {\n                    color: #be123c !important;\n                    background: #fff1f2 !important;\n                    border-left-color: #fb7185 !important;\n                }\n                #video_title .jav-title-translation {\n                    margin-right: 72px !important;\n                }\n            "));
                let o = Array.from(r.anchor.parentNode?.children || []).find(e => e.classList?.contains("jav-title-translation"));
                o || (o = document.createElement("div"), o.className = "jav-title-translation is-loading", 
                r.anchor.insertAdjacentElement("afterend", o));
                const s = `${r.site}:${r.text}`;
                if (o.dataset.translateId !== s || "loaded" !== o.dataset.state) {
                    o.dataset.translateId = s, o.dataset.state = "loading", o.className = "jav-title-translation is-loading", 
                    o.textContent = "翻译标题中...";
                    try {
                        const e = await n(r.text);
                        if (!a.titleTranslate || o.dataset.translateId !== s) return;
                        o.dataset.state = "loaded", o.className = "jav-title-translation", o.textContent = e;
                    } catch (e) {
                        if (o.dataset.translateId !== s) return;
                        o.dataset.state = "error", o.className = "jav-title-translation is-error", o.textContent = "翻译标题失败", 
                        console.warn("[老司机] 翻译标题失败:", e);
                    }
                }
            },
            clear: i
        };
    })();
    function Q(e) {
        if (!e) return !1;
        if (e.closest('.hide, [hidden], [aria-hidden="true"]')) return !1;
        const t = e.getClientRects();
        if (!t || 0 === t.length) return !1;
        const n = window.getComputedStyle(e);
        return "none" !== n.display && "hidden" !== n.visibility;
    }
    function ee() {
        const e = Array.from(document.querySelectorAll('h1, h2, h3.itemName, .itemName-primary, .pageTitle, .nameContainer h3, [class*="itemName"]'));
        let t = null;
        for (const n of e) {
            const e = (n.textContent || "").trim();
            if (e && (Q(n) && (t || (t = n), C.extractCode(e)))) return n;
        }
        return t;
    }
    function te() {
        const e = j.getJumpSite();
        if (!e) return;
        let t = j.getJumpTitleElement(e);
        if (!t) return;
        if ("emby" === e.id && !C.extractCode(t.textContent || "")) return;
        const n = document.querySelector('.jav-jump-btn-group[data-laosiji-jump="1"]');
        if ("emby" === e.id) {
            const e = j.getEmbyRenderKey(t), a = n?.dataset.embyRenderKey || "";
            if (n) {
                if ((!a || a === e) && n.isConnected) {
                    const e = j.getEmbyInsertAnchor(t);
                    return void (e.nextElementSibling !== n && e.insertAdjacentElement("afterend", n));
                }
                n.remove();
            }
            delete t.dataset.enhanced;
        }
        if (n && "emby" !== e.id) {
            const a = C.extractCode(t.textContent), i = P.extractCode(t.textContent, a);
            return i && J(i, n), O(n), void ne(e, t, n);
        }
        if ("1" === t.dataset.enhanced) return;
        t.dataset.enhanced = "1";
        const a = t.textContent, i = C.extractCode(a);
        if (!i) return;
        const r = C.extractCode(a, {
            keepUncensoredSource: !0
        }) || i, o = document.createElement("div");
        if (o.className = "jav-jump-btn-group", o.dataset.laosijiJump = "1", "javlibrary" === e.id) I(i, o), 
        z(i, o), R(i, o), N(i, o), B(i, o), G(i, o), Z(o), J(P.extractCode(a, i), o), U(r, o), 
        D(i, o), O(o), o.querySelectorAll("a").forEach(e => {
            let t = e.getAttribute("style") || "";
            t = t.replace(/background:\s*([^;]+);/g, "background: $1 !important;"), t = t.replace(/color:\s*([^;]+);/g, "color: $1 !important;"), 
            e.setAttribute("style", t);
        }), ne(e, t, o); else if ("missav" === e.id) {
            I(i, o), z(i, o), R(i, o), N(i, o);
            const n = $.getDefaultSearchEngine(), s = document.createElement("div");
            s.className = "search-menu", s.style.setProperty("--jav-btn-accent", n.color);
            const l = C.createLinkBtn(`🔍 ${n.name}`, n.color, n.url(i));
            l.classList.add("search-main-btn"), s.appendChild(l);
            const c = document.createElement("button");
            c.type = "button", c.className = "search-toggle-btn", c.title = "展开搜索引擎", c.innerHTML = '<span class="search-arrow">▼</span>', 
            s.appendChild(c);
            const d = document.createElement("div");
            d.className = "search-submenu", M.forEach(e => {
                if (e.name === n.name) return;
                const t = C.createLinkBtn(`🔍 ${e.name}`, e.color, e.url(i));
                t.style.margin = "2px 0", d.appendChild(t);
            }), s.appendChild(d), T(s, c, d, l), o.appendChild(s), J(P.extractCode(a, i), o), 
            U(r, o), D(i, o), O(o), o.style.cssText = "\n                margin: 10px 0 6px 0;\n                display: flex;\n                flex-wrap: wrap;\n                gap: 8px;\n                align-items: center;\n                position: relative;\n                z-index: 9999;\n            ", 
            ne(e, t, o);
        } else I(i, o), z(i, o), R(i, o), N(i, o), B(i, o), G(i, o), [ "javbus", "javdb", "supjav", "jable" ].includes(e.id) && Z(o), 
        J(P.extractCode(a, i), o), U(r, o), D(i, o), O(o), "emby" === e.id ? (o.classList.add("emby-fix"), 
        o.dataset.embyRenderKey = j.getEmbyRenderKey(t), j.getEmbyInsertAnchor(t).insertAdjacentElement("afterend", o)) : ne(e, t, o);
    }
    function ne(e, t, n) {
        if ("supjav" === e.id) return n.style.marginTop = "8px", void (n.parentElement === t.parentElement && n.previousElementSibling === t || t.insertAdjacentElement("afterend", n));
        if ("jable" === e.id) return n.style.marginTop = "8px", n.style.display = "flex", 
        n.style.flexWrap = "wrap", void (n.parentElement !== t && t.appendChild(n));
        const a = function(e) {
            return "javdb" === e.id ? document.querySelector(".movie-panel-info") : "javbus" === e.id ? document.querySelector(".container .info") : "javlibrary" === e.id ? document.querySelector("#video_info") : null;
        }(e);
        a ? (!function(e) {
            const t = [ e, e.closest("td"), e.closest("tr"), e.closest("#video_jacket_info"), e.closest(".movie-panel-info"), e.closest(".container .info"), e.closest(".col-md-3.info"), e.closest(".jav-flex-container"), e.closest(".row.movie"), e.closest(".video-info"), e.closest(".info-header") ];
            [ ...new Set(t.filter(Boolean)) ].forEach(e => {
                e.style.setProperty("overflow", "visible", "important"), e.style.setProperty("overflow-x", "visible", "important"), 
                e.style.setProperty("overflow-y", "visible", "important");
            });
        }(a), "javlibrary" === e.id ? (n.parentElement !== a || n.nextElementSibling) && a.appendChild(n) : n.parentElement !== a && a.appendChild(n)) : n.parentElement === t.parentElement && n.previousElementSibling === t || t.insertAdjacentElement("afterend", n);
    }
    l.expose("__LAOSIJI_TITLE_TRANSLATE__", X);
    const ae = {
        render: te,
        refresh: te
    };
    l.expose("__LAOSIJI_JUMP_BUTTONS__", ae);
    const ie = {
        cachePrefix: "laosiji_infinite_v1_",
        maxSnapshotItems: 240,
        snapshotTimer: null,
        enabled: () => GM_getValue("infinite_scroll_enabled", !1),
        state: null,
        init() {
            if (!this.enabled() || j.isDetailPage() || this.state) return;
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
        getConfig: (e = document, t = location.href) => j.getInfiniteScrollConfig(e, t),
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
            let i = 0;
            return t.items.forEach(t => {
                const r = document.createElement("template");
                r.innerHTML = t;
                const o = r.content.firstElementChild, s = this.itemKey(o);
                o && s && !n.has(s) && (n.add(s), o.dataset.laosijiInfiniteItem = "1", j.decorateInfiniteScrollItem(e.site, o), 
                a.appendChild(o), i += 1);
            }), !!i && (e.container.appendChild(a), t.items.forEach(t => {
                const n = document.createElement("template");
                n.innerHTML = t;
                const a = n.content.firstElementChild, i = this.itemKey(a);
                i && e.seen.add(i);
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
            const a = j.getInfiniteScrollContainer(this.state.site);
            a && (n = this.state.container = a);
            let i = 0;
            return t.forEach(e => {
                try {
                    const t = this.itemKey(e);
                    if (t && this.state.seen.has(t)) return;
                    t && this.state.seen.add(t), e.dataset.laosijiInfiniteItem = "1";
                    const a = document.adoptNode(e);
                    n.appendChild(a), j.decorateInfiniteScrollItem(this.state.site, a), i += 1;
                } catch (e) {
                    console.warn("[老司机] 追加单项失败:", e);
                }
            }), i;
        },
        async loadNext() {
            if (this.state && !this.state.loading && !this.state.done && this.state.nextUrl) {
                this.state.loading = !0, this.setStatus("正在加载下一页...", "is-loading");
                try {
                    const e = this.state.nextUrl, t = await this.fetchDoc(e);
                    if (!this.state) return;
                    const n = this.appendItems(t), a = this.getConfig(t, e);
                    if (!this.state) return;
                    this.state.nextUrl = a?.nextUrl || "", this.hidePagination(), this.reflow(), se.refreshListDecorations(), 
                    this.saveSnapshot(), setTimeout(() => {
                        se.refreshListPage();
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
                this.state.container = j.reflowInfiniteScroll(this.state.site, this.state.container);
            } catch (e) {
                console.warn("[老司机] 瀑布流重排失败:", e);
            }
            window.dispatchEvent(new Event("resize"));
        }
    };
    l.expose("__LAOSIJI_INFINITE_SCROLL__", ie);
    let re = null;
    function oe() {
        P.enabled() && !j.isDetailPage() && (clearTimeout(re), re = setTimeout(V, 300));
    }
    l.expose("__LAOSIJI_SCHEDULE_PAN115__", oe), l.expose("__LAOSIJI_RENDER_BUTTONS__", () => ae.render());
    const se = {
        refresh(e = {}) {
            const {jump: t = !0, listPreview: n = !0, detailPreview: a = !0, pan115: i = !0, infiniteScroll: r = !0, titleTranslate: o = !0, listOpenNewTab: s = !0, stillsGallery: l = !0} = e;
            t && ae.render(), n && q.sync(), s && _.sync(), a && A.sync(), l && k.sync(), i && oe(), 
            r && ie.init(), o && X.sync();
        },
        refreshListPage() {
            this.refresh({
                detailPreview: !1,
                infiniteScroll: !1
            });
        },
        refreshListDecorations() {
            q.sync(), _.sync(), oe();
        },
        syncPan115(e = P.enabled()) {
            W(e);
        },
        syncInfiniteScroll(e = a.infiniteScroll) {
            e ? ie.init() : ie.destroy();
        },
        syncListPreview() {
            q.sync();
        },
        syncDetailPreview() {
            A.sync();
        },
        syncTitleTranslate() {
            X.sync();
        },
        syncListOpenNewTab() {
            _.sync();
        }
    };
    l.expose("__LAOSIJI_RUNTIME__", se);
    let le = null;
    const ce = new MutationObserver(() => {
        clearTimeout(le), le = setTimeout(() => {
            se.refresh();
        }, 120);
    });
    let de = location.href;
    let pe = [];
    function me() {
        pe.forEach(e => clearTimeout(e)), pe = [];
    }
    function ue() {
        me();
        [ 0, 80, 200, 400, 700, 1100, 1700, 2500, 3500, 5e3, 6500 ].forEach(e => {
            pe.push(setTimeout(() => {
                ae.render(), function() {
                    const e = document.querySelector('.jav-jump-btn-group[data-laosiji-jump="1"]');
                    return !(!e || !e.isConnected);
                }() && me();
            }, e));
        });
    }
    function he() {
        if (location.href === de) return;
        de = location.href;
        j.isEmbyPage() ? (j.isEmbyPage() && (document.querySelectorAll('.jav-jump-btn-group[data-laosiji-jump="1"]').forEach(e => e.remove()), 
        document.querySelectorAll('h1[data-enhanced="1"]').forEach(e => delete e.dataset.enhanced)), 
        ue()) : ae.render();
    }
    const ve = {
        started: !1,
        observerReady: !1,
        navigationReady: !1,
        initRuntimeObserver() {
            this.observerReady || (this.observerReady = !0, document.body && ce.observe(document.body, {
                childList: !0,
                subtree: !0
            }));
        },
        initNavigationHooks() {
            this.navigationReady || (this.navigationReady = !0, window.addEventListener("scroll", () => ie.scheduleSnapshotSave(), {
                passive: !0
            }), window.addEventListener("pagehide", () => ie.saveSnapshot()), window.addEventListener("beforeunload", () => ie.saveSnapshot()), 
            window.addEventListener("pageshow", e => {
                e.persisted && setTimeout(() => ie.init(), 0);
            }), window.addEventListener("hashchange", he), window.addEventListener("popstate", he), 
            function() {
                const e = e => {
                    const t = history[e];
                    "function" == typeof t && (history[e] = function() {
                        const e = t.apply(this, arguments);
                        return setTimeout(he, 0), e;
                    });
                };
                e("pushState"), e("replaceState");
            }());
        },
        init() {
            this.started || (this.started = !0, this.initRuntimeObserver(), this.initNavigationHooks(), 
            j.setupJavDbGuards(), location.hostname.includes("javdb") && location.pathname.startsWith("/v/") ? setTimeout(S, 600) : S(), 
            j.isEmbyPage() ? (ue(), se.refresh({
                jump: !1
            })) : se.refresh());
        }
    };
    l.expose("__LAOSIJI_APP__", ve), ve.init();
}();
