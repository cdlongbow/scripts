// ==UserScript==
// @name         JAV老司机-新
// @namespace    https://github.com/ZiPenOk/scripts
// @version      2.5.4
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

(function () {
    'use strict';
    const SCRIPT_VERSION = '2.5.4';

    const CFG = {
        get javdbSearchUrl()   { return GM_getValue('cfg_javdb_search_url',  'javdb.com'); },
        get ciligouUrl()       { return GM_getValue('cfg_ciligou_url',       'clg55.top'); },
        get btdigUrl()         { return GM_getValue('cfg_btdig_url',         'btdig.com'); },
        get btsearchUrl()      { return GM_getValue('cfg_btsearch_url',      'btsearch.love'); },
        get sukebeiUrl()       { return GM_getValue('cfg_sukebei_url',       'sukebei.nyaa.si'); },
        get sokittyUrl()       { return GM_getValue('cfg_sokitty_url',       'w1.sokitty.me'); },

        get defaultEngine()    { return GM_getValue('cfg_default_engine', 'sukebei.nyaa.si'); },
        get defaultVideoEngine() { return GM_getValue('default_video_engine', 'missav'); },
        get pan115Player() { return GM_getValue('pan115_player_mode', 'official'); },
        get javbusCardColumns() { return Math.min(10, Math.max(2, parseInt(GM_getValue('cfg_javbus_card_columns', 5), 10) || 5)); },
        get javdbCardColumns()  { return Math.min(10, Math.max(2, parseInt(GM_getValue('cfg_javdb_card_columns', 5), 10) || 5)); },
        get javlibCardColumns() { return Math.min(10, Math.max(2, parseInt(GM_getValue('cfg_javlib_card_columns', 5), 10) || 5)); },
        get javbusPageZoom() { return Math.min(100, Math.max(60, parseInt(GM_getValue('cfg_javbus_page_zoom', 86), 10) || 86)); },
        get javdbPageZoom()  { return Math.min(100, Math.max(60, parseInt(GM_getValue('cfg_javdb_page_zoom', 88), 10) || 88)); },
        get javlibPageZoom() { return Math.min(100, Math.max(60, parseInt(GM_getValue('cfg_javlib_page_zoom', 86), 10) || 86)); },
        get listPreviewQuick() { return GM_getValue('list_preview_quick_enabled', true); },
        get detailPreviewInline() { return GM_getValue('detail_preview_inline_enabled', true); },
        get thumbSourceOrder() { return GM_getValue('thumb_source_order', ['javfree', 'projectjav', 'javstore']); },
        get detailFlex() { return GM_getValue('detail_flex_settings', {}); },

        set javdbSearchUrl(v)   { GM_setValue('cfg_javdb_search_url', v); },
        set ciligouUrl(v)       { GM_setValue('cfg_ciligou_url', v); },
        set btdigUrl(v)         { GM_setValue('cfg_btdig_url', v); },
        set btsearchUrl(v)      { GM_setValue('cfg_btsearch_url', v); },
        set sukebeiUrl(v)       { GM_setValue('cfg_sukebei_url', v); },
        set sokittyUrl(v)       { GM_setValue('cfg_sokitty_url', v); },
        set defaultEngine(v)    { GM_setValue('cfg_default_engine', v); },
        set defaultVideoEngine(v) { GM_setValue('default_video_engine', v); },
        set pan115Player(v) { GM_setValue('pan115_player_mode', v); },
        set javbusCardColumns(v) { GM_setValue('cfg_javbus_card_columns', Math.min(10, Math.max(2, parseInt(v, 10) || 5))); },
        set javdbCardColumns(v)  { GM_setValue('cfg_javdb_card_columns', Math.min(10, Math.max(2, parseInt(v, 10) || 5))); },
        set javlibCardColumns(v) { GM_setValue('cfg_javlib_card_columns', Math.min(10, Math.max(2, parseInt(v, 10) || 5))); },
        set javbusPageZoom(v) { GM_setValue('cfg_javbus_page_zoom', Math.min(100, Math.max(60, parseInt(v, 10) || 100))); },
        set javdbPageZoom(v)  { GM_setValue('cfg_javdb_page_zoom', Math.min(100, Math.max(60, parseInt(v, 10) || 100))); },
        set javlibPageZoom(v) { GM_setValue('cfg_javlib_page_zoom', Math.min(100, Math.max(60, parseInt(v, 10) || 100))); },
        set listPreviewQuick(v) { GM_setValue('list_preview_quick_enabled', !!v); },
        set detailPreviewInline(v) { GM_setValue('detail_preview_inline_enabled', !!v); },
        set thumbSourceOrder(v) { GM_setValue('thumb_source_order', v); },
        set detailFlex(v) { GM_setValue('detail_flex_settings', v || {}); },

        get btnShowNyaa()    { return GM_getValue('btn_show_nyaa',    true); },
        get btnShowJavbus()  { return GM_getValue('btn_show_javbus',  true); },
        get btnShowJavdb()   { return GM_getValue('btn_show_javdb',   true); },
        get btnShowMissav()  { return GM_getValue('btn_show_missav',  true); },
        get btnShowFanza()   { return GM_getValue('btn_show_fanza',   true); },
        get btnShowSearch()  { return GM_getValue('btn_show_search',  true); },
        get btnShowTrailer() { return GM_getValue('btn_show_trailer', true); },
        get btnShowPreview() { return GM_getValue('btn_show_preview', true); },
        get btnShowPan115()  { return GM_getValue('btn_show_pan115',  false); },
        get magnetTable()    { return GM_getValue('magnet_table_enabled', true); },
        get infiniteScroll() { return GM_getValue('infinite_scroll_enabled', false); },

        set btnShowNyaa(v)    { GM_setValue('btn_show_nyaa',    v); },
        set btnShowJavbus(v)  { GM_setValue('btn_show_javbus',  v); },
        set btnShowJavdb(v)   { GM_setValue('btn_show_javdb',   v); },
        set btnShowMissav(v)  { GM_setValue('btn_show_missav',  v); },
        set btnShowFanza(v)   { GM_setValue('btn_show_fanza',   v); },
        set btnShowSearch(v)  { GM_setValue('btn_show_search',  v); },
        set btnShowTrailer(v) { GM_setValue('btn_show_trailer', v); },
        set btnShowPreview(v) { GM_setValue('btn_show_preview', v); },
        set btnShowPan115(v)  { GM_setValue('btn_show_pan115',  v); },
        set magnetTable(v)    { GM_setValue('magnet_table_enabled', v); },
        set infiniteScroll(v) { GM_setValue('infinite_scroll_enabled', v); },
    };

    const CardColumns = (() => {
        const LIMITS = { min: 2, max: 10 };
        const SITE_META = {
            javbus: { getter: () => CFG.javbusCardColumns, setter: v => { CFG.javbusCardColumns = v; }, selector: '.javbus-card-grid', host: /(?:^|\.)javbus\.com$/i },
            javdb:  { getter: () => CFG.javdbCardColumns,  setter: v => { CFG.javdbCardColumns = v; },  selector: '.javdb-card-grid',  host: /javdb/i },
            javlib: { getter: () => CFG.javlibCardColumns, setter: v => { CFG.javlibCardColumns = v; }, selector: '.javlib-card-grid', host: /(javlibrary|javlib|r86m|s87n)/i },
        };

        function clamp(value) {
            return Math.min(LIMITS.max, Math.max(LIMITS.min, parseInt(value, 10) || 5));
        }

        function get(siteId) {
            return SITE_META[siteId] ? clamp(SITE_META[siteId].getter()) : 5;
        }

        function set(siteId, value) {
            if (!SITE_META[siteId]) return;
            SITE_META[siteId].setter(clamp(value));
        }

        function apply(siteId, value = get(siteId)) {
            const meta = SITE_META[siteId];
            if (!meta) return;
            document.querySelectorAll(meta.selector).forEach(el => {
                el.style.setProperty('--jav-card-columns', String(clamp(value)));
            });
        }

        function detectCurrentSite() {
            const host = location.hostname;
            return Object.entries(SITE_META).find(([, meta]) => meta.host.test(host))?.[0] || '';
        }

        function applyCurrent() {
            const current = detectCurrentSite();
            if (current) apply(current);
        }

        return { LIMITS, clamp, get, set, apply, applyCurrent, detectCurrentSite };
    })();

    const PageZoom = (() => {
        const LIMITS = { min: 60, max: 100 };
        const SITE_META = {
            javbus: { getter: () => CFG.javbusPageZoom, setter: v => { CFG.javbusPageZoom = v; }, selector: 'body > div.container-fluid, body > div.container', host: /(?:^|\.)javbus\.com$/i },
            javdb:  { getter: () => CFG.javdbPageZoom,  setter: v => { CFG.javdbPageZoom = v; },  selector: 'body > section > div',     host: /javdb/i },
            javlib: { getter: () => CFG.javlibPageZoom, setter: v => { CFG.javlibPageZoom = v; }, selector: '#content',                 host: /(javlibrary|javlib|r86m|s87n)/i },
        };

        function clamp(value) {
            return Math.min(LIMITS.max, Math.max(LIMITS.min, parseInt(value, 10) || 100));
        }

        function get(siteId) {
            return SITE_META[siteId] ? clamp(SITE_META[siteId].getter()) : 100;
        }

        function set(siteId, value) {
            if (!SITE_META[siteId]) return;
            SITE_META[siteId].setter(clamp(value));
        }

        function apply(siteId, value = get(siteId)) {
            const meta = SITE_META[siteId];
            if (!meta) return;
            const zoomValue = clamp(value);
            const widthValue = `${zoomValue}%`;
            if (siteId === 'javlib') {
                const content = document.querySelector('#content');
                if (content) {
                    content.style.setProperty('zoom', '1');
                    content.style.setProperty('width', widthValue, 'important');
                    content.style.setProperty('max-width', 'none', 'important');
                    content.style.setProperty('margin-left', 'auto', 'important');
                    content.style.setProperty('margin-right', 'auto', 'important');
                    content.style.setProperty('box-sizing', 'border-box', 'important');
                    content.style.setProperty('padding-left', '12px', 'important');
                    content.style.setProperty('padding-right', '12px', 'important');
                    content.style.setProperty('min-width', '0', 'important');
                    content.style.setProperty('overflow', 'visible', 'important');
                }
                document.documentElement?.style.setProperty('background', '#fff', 'important');
                document.body?.style.setProperty('background', '#fff', 'important');
                document.querySelectorAll('#page, #content, #rightcolumn').forEach(el => {
                    el?.style.setProperty('background', '#fff', 'important');
                    el?.style.setProperty('box-sizing', 'border-box', 'important');
                    el?.style.setProperty('max-width', '100%', 'important');
                    el?.style.setProperty('overflow', 'visible', 'important');
                });
                document.querySelectorAll('#rightcolumn > .videothumblist, #rightcolumn > .videothumblist .videos').forEach(el => {
                    el.style.setProperty('box-sizing', 'border-box', 'important');
                    el.style.setProperty('max-width', '100%', 'important');
                });
                return;
            }
            document.querySelectorAll(meta.selector).forEach(el => {
                if (!el) return;
                el.style.setProperty('zoom', '1');
                el.style.setProperty('width', widthValue, 'important');
                el.style.setProperty('max-width', 'none', 'important');
                el.style.setProperty('margin-left', 'auto', 'important');
                el.style.setProperty('margin-right', 'auto', 'important');
                el.style.setProperty('box-sizing', 'border-box', 'important');
            });
        }

        function detectCurrentSite() {
            const host = location.hostname;
            return Object.entries(SITE_META).find(([, meta]) => meta.host.test(host))?.[0] || '';
        }

        function applyCurrent() {
            const current = detectCurrentSite();
            if (current) apply(current);
        }

        return { LIMITS, clamp, get, set, apply, applyCurrent, detectCurrentSite };
    })();

    const DetailFlex = (() => {
        const LIMITS = { min: 50, max: 200 };
        const DEFAULTS = {
            javbus: { cover: 100, info: 75,  magnet: 120 },
            javdb:  { cover: 160, info: 105, magnet: 150 },
            javlib: { cover: 100, info: 85,  magnet: 100 },
        };
        const META = {
            javbus: {
                host: /(?:^|\.)javbus\.com$/i,
                detail: () => !!document.querySelector('.row.movie') && !document.querySelector('#waterfall div.item'),
                root: () => document.querySelector('.row.movie'),
                vars: { cover: '--javbus-cover-flex', info: '--javbus-info-flex', magnet: '--javbus-magnet-flex' },
            },
            javdb: {
                host: /javdb/i,
                detail: () => /\/v\//i.test(location.pathname),
                root: () => document.querySelector('.jav-flex-container'),
                vars: { cover: '--javdb-cover-flex', info: '--javdb-info-flex', magnet: '--javdb-magnet-flex' },
            },
            javlib: {
                host: /(javlibrary|javlib|r86m|s87n)/i,
                detail: () => !!document.querySelector('#video_jacket_info #video_info, #video_id .text'),
                root: () => document.querySelector('#video_jacket_info tr'),
                vars: { cover: '--javlib-cover-flex', info: '--javlib-info-flex', magnet: '--javlib-magnet-flex' },
            },
        };

        function clamp(value) {
            return Math.min(LIMITS.max, Math.max(LIMITS.min, parseInt(value, 10) || 100));
        }

        function detectCurrentSite() {
            const host = location.hostname;
            return Object.entries(META).find(([, meta]) => meta.host.test(host) && meta.detail())?.[0] || '';
        }

        function getAll() {
            const saved = CFG.detailFlex;
            return saved && typeof saved === 'object' ? saved : {};
        }

        function get(siteId) {
            const all = getAll();
            const defaults = DEFAULTS[siteId] || DEFAULTS.javbus;
            const saved = all[siteId] || {};
            return {
                cover: clamp(saved.cover ?? defaults.cover),
                info: clamp(saved.info ?? defaults.info),
                magnet: clamp(saved.magnet ?? defaults.magnet),
            };
        }

        function set(siteId, key, value) {
            if (!META[siteId] || !DEFAULTS[siteId] || !DEFAULTS[siteId].hasOwnProperty(key)) return;
            const all = getAll();
            all[siteId] = { ...get(siteId), [key]: clamp(value) };
            CFG.detailFlex = all;
        }

        function toFlex(value) {
            return (clamp(value) / 100).toFixed(2).replace(/\.?0+$/, '');
        }

        function hasMagnet(siteId = detectCurrentSite()) {
            if (!siteId || !CFG.magnetTable) return false;
            return !!document.querySelector('.jav-nong-slot');
        }

        function hasLayout(siteId = detectCurrentSite()) {
            const meta = META[siteId];
            return !!meta?.root?.();
        }

        function apply(siteId = detectCurrentSite()) {
            const meta = META[siteId];
            if (!meta) return;
            const root = meta.root();
            if (!root) return;
            const values = get(siteId);
            root.style.setProperty(meta.vars.cover, toFlex(values.cover));
            root.style.setProperty(meta.vars.info, toFlex(values.info));
            if (hasMagnet(siteId)) {
                root.style.setProperty(meta.vars.magnet, toFlex(values.magnet));
            }
        }

        function reset(siteId = detectCurrentSite()) {
            if (!DEFAULTS[siteId]) return;
            const all = getAll();
            delete all[siteId];
            CFG.detailFlex = all;
            apply(siteId);
        }

        return { LIMITS, DEFAULTS, clamp, detectCurrentSite, get, set, apply, hasMagnet, hasLayout, reset };
    })();

    const log = (...args) => console.log('[老司机]', ...args);

    const VIDEO_ENGINES = [
        { key: 'missav', label: 'MissAV', host: /missav\.(com|ai|ws)/i, color: '#ec4899' },
        { key: 'jable',  label: 'Jable',  host: /jable\.tv/i, color: '#f97316' },
        { key: '123av',  label: '123AV',  host: /123av\.com/i, color: '#10b981' },
        { key: 'javday', label: 'JavDay', host: /javday\.app/i, color: '#0ea5e9' },
        { key: 'supjav', label: 'SupJav', host: /supjav\.com/i, color: '#ef4444' },
        { key: 'javrate', label: 'JavRate', host: /javrate\.com/i, color: '#8b5cf6' },
    ];
    window.__LAOSIJI_VIDEO_ENGINES__ = VIDEO_ENGINES;

    function notify(title, text, url) {
        GM_notification({ title, text, onclick: () => url && window.open(url) });
    }

    function parseHTML(str) {
        return new DOMParser().parseFromString(str, 'text/html');
    }

    function gmFetch(url, opts = {}) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                timeout: 20000,
                ...opts,
                url,
                onload(r) {
                    r.loadstuts = true;
                    resolve(r);
                },
                onerror(r)   { r.loadstuts = false; resolve(r); },
                onabort(r)   { r.loadstuts = false; resolve(r); },
                ontimeout(r) { r.loadstuts = false; r.finalUrl = url; resolve(r); },
            });
        });
    }

    function normalizeAvid(raw) {
        if (!raw) return '';
        raw = raw.trim().toUpperCase();
        if (raw.match(/-[^0]/)) return raw;
        if (raw.match(/^[0-9_-]+$/)) return raw;
        const m = raw.match(/^([A-Z]+[-_]?)(\d+)$/);
        if (m) return m[1].replace(/[-_]$/, '') + '-' + m[2];
        return raw;
    }

    function insertAvidCopyBtn(anchor, avid, nativeCopyBtn = null, append = false) {
        if (!anchor || !avid) return;
        const code = normalizeAvid(avid);
        const parent = anchor.parentElement || anchor;
        parent.querySelectorAll('.jav-avid-copy').forEach(btn => btn.remove());
        nativeCopyBtn?.style.setProperty('display', 'none', 'important');

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'jav-avid-copy';
        btn.textContent = '复制番号';
        btn.title = `复制番号：${code}`;
        btn.style.cssText = 'display:inline-block;margin-left:8px;padding:2px 8px;font-size:12px;background:#e8f4fd;border:1px solid #90c5e8;border-radius:4px;cursor:pointer;color:#1a6fa8;vertical-align:middle;white-space:nowrap;';
        btn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            GM_setClipboard(code);
            btn.textContent = '已复制';
            setTimeout(() => { btn.textContent = '复制番号'; }, 900);
        });
        if (append) anchor.appendChild(btn);
        else anchor.after(btn);
    }

    const SettingsPanel = (() => {
        const MAGNET_ENGINES = [
            { key: 'javdbSearchUrl',  label: 'JavDB',        placeholder: 'javdb.com' },
            { key: 'ciligouUrl',      label: 'CiliGou',      placeholder: 'clg55.top' },
            { key: 'btdigUrl',        label: 'BtDig',        placeholder: 'btdig.com' },
            { key: 'btsearchUrl',     label: 'BTSearch',     placeholder: 'btsearch.love' },
            { key: 'sukebeiUrl',      label: 'Sukebei',      placeholder: 'sukebei.nyaa.si' },
            { key: 'sokittyUrl',      label: 'SoKitty',      placeholder: 'w1.sokitty.me' },
        ];
        const JUMP_SEARCH_ENGINES = ['BTDigg', 'Taocili', 'Google', 'Bing', 'DuckGo'];
        const THUMB_META = {
            javfree:    { label: 'javfree.me',     color: '#16a34a' },
            projectjav: { label: 'projectjav.com', color: '#ca8a04' },
            javstore:   { label: 'javstore.net',   color: '#dc2626' },
        };
        const stripProtocol = value => String(value || '').trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');

        function open() {
            document.getElementById('jav-settings-overlay')?.remove();

            GM_addStyle(`
                #jav-settings-overlay { position:fixed; inset:0; z-index:10000020; background:rgba(15,23,42,.62); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(7px); font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
                #jav-settings-panel { width:min(800px,94vw); max-height:88vh; background:linear-gradient(180deg,#f8fbff 0%,#f6f3ff 46%,#fff7ed 100%); color:#111827; border:1px solid rgba(148,163,184,.38); border-radius:16px; box-shadow:0 26px 76px rgba(15,23,42,.36); display:flex; flex-direction:column; overflow:hidden; }
                #jav-settings-panel * { box-sizing:border-box; }
                #jav-settings-panel .sp-header { padding:18px 22px; background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 54%,#7c2d12 100%); border-bottom:1px solid rgba(255,255,255,.12); display:flex; align-items:center; justify-content:space-between; }
                #jav-settings-panel .sp-title { font-size:18px; font-weight:750; color:#fff; }
                #jav-settings-panel .sp-close { width:32px; height:32px; border:1px solid rgba(255,255,255,.24); border-radius:8px; background:rgba(255,255,255,.1); color:#fff; cursor:pointer; font-size:18px; line-height:1; }
                #jav-settings-panel .sp-close:hover { background:rgba(255,255,255,.18); }
                #jav-settings-panel .sp-body { padding:18px 22px; overflow:auto; display:grid; gap:14px; }
                #jav-settings-panel .sp-card { position:relative; background:rgba(255,255,255,.92); border:1px solid rgba(203,213,225,.88); border-radius:10px; padding:15px; box-shadow:0 10px 24px rgba(15,23,42,.06); overflow:hidden; }
                #jav-settings-panel .sp-card::before { content:''; position:absolute; left:0; top:0; width:4px; height:100%; background:#2563eb; }
                #jav-settings-panel .sp-card-magnet::before { background:#16a34a; }
                #jav-settings-panel .sp-card-defaults::before { background:#2563eb; }
                #jav-settings-panel .sp-card-features::before { background:#00a85a; }
                #jav-settings-panel .sp-card-order::before { background:#dc2626; }
                #jav-settings-panel .sp-card-title { font-size:13px; font-weight:750; color:#1e293b; margin-bottom:12px; }
                #jav-settings-panel .sp-card-jump::before { background:#6366f1; }
                #jav-settings-panel .sp-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px 12px; }
                #jav-settings-panel .sp-feature-order-row { display:grid; grid-template-columns:2fr 1fr; gap:14px; align-items:stretch; }
                #jav-settings-panel .sp-feature-order-row > .sp-card { height:100%; }
                #jav-settings-panel .sp-feature-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
                #jav-settings-panel .sp-feature-item { display:flex; align-items:center; justify-content:space-between; gap:10px; min-width:0; padding:10px 11px; border:1px solid #e2e8f0; border-radius:8px; background:linear-gradient(180deg,#fff 0%,#f8fafc 100%); }
                #jav-settings-panel .sp-feature-item:has(#sp-magnet-table) { order:1; grid-column:1; }
                #jav-settings-panel .sp-feature-item:has(#sp-clear-preview-cache) { order:2; grid-column:1; }
                #jav-settings-panel .sp-feature-item:has(#sp-clear-trailer-cache) { order:2; grid-column:2; }
                #jav-settings-panel .sp-feature-item .sp-desc { margin-top:2px; font-size:11px; }
                #jav-settings-panel .sp-feature-select { order:1; grid-column:2; display:grid; grid-template-columns:1fr 64px; align-items:center; gap:10px; min-width:0; padding:10px 11px; border:1px solid #e2e8f0; border-radius:8px; background:linear-gradient(180deg,#fff 0%,#f8fafc 100%); }
                #jav-settings-panel .sp-feature-select .sp-select { height:28px; padding:3px 2px 3px 4px; font-size:12px; text-align:left; }
                #jav-settings-panel .sp-cache-clean { background:linear-gradient(135deg,#fff 0%,#f8fbff 58%,#f0f9ff 100%); }
                #jav-settings-panel .sp-cache-clear-btn { position:relative; width:34px; height:34px; flex:0 0 auto; display:grid; place-items:center; border:1px solid #bae6fd; border-radius:10px; background:linear-gradient(180deg,#f0f9ff,#fff); color:#0284c7; cursor:pointer; overflow:hidden; transition:transform .16s, border-color .16s, background .16s, color .16s, box-shadow .16s; }
                #jav-settings-panel .sp-cache-clear-btn::after { content:''; position:absolute; inset:-8px; border-radius:inherit; background:radial-gradient(circle,rgba(14,165,233,.22),transparent 62%); opacity:0; transform:scale(.45); transition:opacity .22s, transform .22s; }
                #jav-settings-panel .sp-cache-clear-btn:hover { transform:translateY(-1px); border-color:#38bdf8; color:#0369a1; box-shadow:0 8px 18px rgba(14,165,233,.18); }
                #jav-settings-panel .sp-cache-clear-btn:active { transform:translateY(0) scale(.96); }
                #jav-settings-panel .sp-cache-clear-btn.is-clearing::after { opacity:1; transform:scale(1); }
                #jav-settings-panel .sp-cache-clear-btn.is-done { border-color:#86efac; background:linear-gradient(180deg,#ecfdf5,#fff); color:#15803d; }
                #jav-settings-panel .sp-cache-clear-icon { position:relative; z-index:1; display:inline-block; font-size:15px; line-height:1; }
                #jav-settings-panel .sp-cache-clear-btn.is-clearing .sp-cache-clear-icon { animation:spCacheSpin .48s ease; }
                @keyframes spCacheSpin { to { transform:rotate(360deg); } }
                #jav-settings-panel .sp-field { display:flex; flex-direction:column; gap:6px; min-width:0; }
                #jav-settings-panel .sp-label { font-size:12px; font-weight:650; color:#475569; }
                #jav-settings-panel .sp-input, #jav-settings-panel .sp-select { width:100%; min-width:0; height:34px; padding:6px 9px; border:1px solid #cbd5e1; border-radius:8px; background:#fff; color:#0f172a; font-size:13px; outline:none; }
                #jav-settings-panel .sp-input:focus, #jav-settings-panel .sp-select:focus { border-color:#2563eb; box-shadow:0 0 0 3px rgba(37,99,235,.13); }
                #jav-settings-panel .sp-engine-row { display:grid; grid-template-columns:170px 1fr; gap:10px; align-items:end; }
                #jav-settings-panel .sp-cache-actions { display:flex; align-items:center; gap:8px; margin-right:auto; }
                #jav-settings-panel .sp-cache-feedback { min-width:64px; color:#059669; font-size:12px; font-weight:650; }
                #jav-settings-panel .sp-footer-links { display:flex; align-items:center; gap:8px; margin-right:4px; }
                #jav-settings-panel .sp-footer-link { color:#475569; font-size:12px; font-weight:700; text-decoration:none; padding:6px 8px; border-radius:7px; }
                #jav-settings-panel .sp-footer-link:hover { color:#1d4ed8; background:#eff6ff; }
                #jav-settings-panel .sp-footer-sep { width:1px; height:16px; background:#cbd5e1; }
                #jav-settings-panel .sp-desc { font-size:12px; color:#64748b; line-height:1.45; }
                #jav-settings-panel .sp-toggle { position:relative; display:inline-block; width:42px; height:24px; flex:0 0 auto; }
                #jav-settings-panel .sp-toggle input { opacity:0; width:0; height:0; }
                #jav-settings-panel .sp-toggle-track { position:absolute; inset:0; border-radius:999px; background:#cbd5e1; cursor:pointer; transition:background .18s; }
                #jav-settings-panel .sp-toggle-track::before { content:''; position:absolute; width:18px; height:18px; left:3px; top:3px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(15,23,42,.25); transition:transform .18s; }
                #jav-settings-panel .sp-toggle input:checked + .sp-toggle-track { background:#2563eb; }
                #jav-settings-panel .sp-toggle input:checked + .sp-toggle-track::before { transform:translateX(18px); }
                #jav-settings-panel .sp-order-list { display:flex; flex-direction:column; gap:8px; }
                #jav-settings-panel .sp-order-item { display:grid; grid-template-columns:1fr auto auto; gap:10px; align-items:center; padding:10px 11px; border:1px solid #e2e8f0; border-radius:8px; background:linear-gradient(90deg,#fff 0%,#f8fafc 100%); user-select:none; }
                #jav-settings-panel .sp-order-name { font-size:13px; font-weight:700; color:#1e293b; }
                #jav-settings-panel .sp-dot { width:9px; height:9px; border-radius:50%; }
                #jav-settings-panel .sp-order-actions { display:flex; gap:5px; }
                #jav-settings-panel .sp-order-btn { width:28px; height:28px; border:1px solid #cbd5e1; border-radius:7px; background:#fff; color:#334155; cursor:pointer; font-size:14px; line-height:1; }
                #jav-settings-panel .sp-order-btn:hover:not(:disabled) { border-color:#2563eb; color:#1d4ed8; background:#eff6ff; }
                #jav-settings-panel .sp-order-btn:disabled { opacity:.36; cursor:not-allowed; }
                #jav-settings-panel .sp-footer { padding:14px 22px; background:rgba(255,255,255,.92); border-top:1px solid rgba(203,213,225,.86); display:flex; align-items:center; justify-content:flex-end; gap:10px; }
                #jav-settings-panel .sp-btn { height:34px; padding:0 16px; border-radius:8px; border:1px solid transparent; font-size:13px; font-weight:700; cursor:pointer; }
                #jav-settings-panel .sp-btn-cancel { background:#fff; color:#475569; border-color:#cbd5e1; }
                #jav-settings-panel .sp-btn-clear { background:#fff7ed; color:#9a3412; border-color:#fed7aa; }
                #jav-settings-panel .sp-btn-clear:hover { background:#ffedd5; }
                #jav-settings-panel .sp-btn-save { background:linear-gradient(135deg,#2563eb,#7c3aed); color:white; box-shadow:0 8px 20px rgba(79,70,229,.25); }
                @media (max-width: 640px) { #jav-settings-panel .sp-grid, #jav-settings-panel .sp-engine-row, #jav-settings-panel .sp-feature-grid, #jav-settings-panel .sp-feature-order-row { grid-template-columns:1fr; } #jav-settings-panel .sp-feature-item { grid-column:auto !important; } #jav-settings-panel .sp-cache-actions { margin-right:0; } #jav-settings-panel .sp-footer { flex-wrap:wrap; } }
            `);

            const overlay = document.createElement('div');
            overlay.id = 'jav-settings-overlay';
            overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

            const panel = document.createElement('div');
            panel.id = 'jav-settings-panel';
            panel.innerHTML = `
                <div class="sp-header">
                    <div>
                        <div class="sp-title">老司机设置</div>
                    </div>
                    <button class="sp-close" type="button" title="关闭">×</button>
                </div>
                <div class="sp-body">
                    <section class="sp-card sp-card-magnet">
                        <div class="sp-card-title">磁力搜索</div>
                        <div class="sp-grid">
                            <label class="sp-field"><span class="sp-label">默认磁力引擎</span><select class="sp-select" id="sp-default-engine"></select></label>
                            <div class="sp-engine-row">
                                <label class="sp-field"><span class="sp-label">编辑引擎</span><select class="sp-select" id="sp-engine-picker"></select></label>
                                <label class="sp-field"><span class="sp-label">域名</span><input class="sp-input" id="sp-engine-domain"></label>
                            </div>
                        </div>
                    </section>
                    <section class="sp-card sp-card-defaults">
                        <div class="sp-card-title">默认组跳转入口</div>
                        <div class="sp-grid">
                            <label class="sp-field"><span class="sp-label">默认搜索入口</span><select class="sp-select" id="sp-jump-engine"></select></label>
                            <label class="sp-field"><span class="sp-label">默认视频入口</span><select class="sp-select" id="sp-video-engine"></select></label>
                        </div>
                    </section>
                    <div class="sp-feature-order-row">
                        <section class="sp-card sp-card-features">
                            <div class="sp-card-title">功能项开关</div>
                            <div class="sp-feature-grid">
                                <div class="sp-feature-item">
                                    <div><div class="sp-label">磁力引擎</div></div>
                                    <label class="sp-toggle"><input id="sp-magnet-table" type="checkbox"><span class="sp-toggle-track"></span></label>
                                </div>
                                <div class="sp-feature-item sp-cache-clean">
                                    <div><div class="sp-label">预览图缓存</div><div class="sp-desc">清理本页会话缓存</div></div>
                                    <button class="sp-cache-clear-btn" id="sp-clear-preview-cache" type="button" title="清理预览图缓存"><span class="sp-cache-clear-icon">↻</span></button>
                                </div>
                                <div class="sp-feature-item sp-cache-clean">
                                    <div><div class="sp-label">预告片缓存</div><div class="sp-desc">清理解析结果缓存</div></div>
                                    <button class="sp-cache-clear-btn" id="sp-clear-trailer-cache" type="button" title="清理预告片缓存"><span class="sp-cache-clear-icon">↻</span></button>
                                </div>
                                <label class="sp-feature-select">
                                    <div><div class="sp-label">115播放器</div></div>
                                    <select class="sp-select" id="sp-pan115-player">
                                        <option value="official">官方</option>
                                        <option value="115master">Master</option>
                                    </select>
                                </label>
                            </div>
                        </section>
                        <section class="sp-card sp-card-order">
                            <div class="sp-card-title">预览图来源顺序</div>
                            <div class="sp-order-list" id="sp-thumb-order"></div>
                        </section>
                    </div>
                    <section class="sp-card sp-card-jump" style="--card-color:#6366f1;">
                        <style>
                            #jav-settings-panel .sp-chip-group{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;}
                            #jav-settings-panel .sp-chip input{display:none;}
                            #jav-settings-panel .sp-chip-label{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:999px;border:0.5px solid var(--color-border-secondary,#cbd5e1);background:var(--color-background-secondary,#f8fafc);color:var(--color-text-secondary,#64748b);font-size:12px;font-weight:500;cursor:pointer;transition:all .15s;user-select:none;}
                            #jav-settings-panel .sp-chip input:checked + .sp-chip-label{border-color:#6366f1;background:#eef2ff;color:#4338ca;}
                            #jav-settings-panel .sp-chip-label:hover{border-color:#a5b4fc;background:#f0f4ff;color:#4338ca;}
                            #jav-settings-panel .sp-chip-dot{width:6px;height:6px;border-radius:50%;background:currentColor;opacity:0.6;flex:0 0 auto;}
                        </style>
                        <div class="sp-card-title">跳转按钮控制</div>
                        <div class="sp-chip-group">
                            <label class="sp-chip"><input id="sp-btn-nyaa" type="checkbox"><span class="sp-chip-label"><span class="sp-chip-dot"></span>Sukebei</span></label>
                            <label class="sp-chip"><input id="sp-btn-javbus" type="checkbox"><span class="sp-chip-label"><span class="sp-chip-dot"></span>JavBus</span></label>
                            <label class="sp-chip"><input id="sp-btn-javdb" type="checkbox"><span class="sp-chip-label"><span class="sp-chip-dot"></span>JavDB</span></label>
                            <label class="sp-chip"><input id="sp-btn-missav" type="checkbox"><span class="sp-chip-label"><span class="sp-chip-dot"></span>视频组</span></label>
                            <label class="sp-chip"><input id="sp-btn-fanza" type="checkbox"><span class="sp-chip-label"><span class="sp-chip-dot"></span>FANZA</span></label>
                            <label class="sp-chip"><input id="sp-btn-search" type="checkbox"><span class="sp-chip-label"><span class="sp-chip-dot"></span>搜索组</span></label>
                            <label class="sp-chip"><input id="sp-btn-trailer" type="checkbox"><span class="sp-chip-label"><span class="sp-chip-dot"></span>预告片</span></label>
                            <label class="sp-chip"><input id="sp-btn-preview" type="checkbox"><span class="sp-chip-label"><span class="sp-chip-dot"></span>预览图</span></label>
                        </div>
                    </section>
                </div>
                <div class="sp-footer">
                    <div class="sp-cache-actions">
                        <div class="sp-footer-links">
                            <a class="sp-footer-link" href="https://github.com/ZiPenOk/scripts" target="_blank" rel="noopener noreferrer">Github</a>
                            <span class="sp-footer-sep"></span>
                            <a class="sp-footer-link" href="https://sleazyfork.org/zh-CN/scripts/576375-jav%E8%80%81%E5%8F%B8%E6%9C%BA-%E6%96%B0/feedback" target="_blank" rel="noopener noreferrer">反馈</a>
                            <span class="sp-footer-sep"></span>
                            <span class="sp-footer-link" style="cursor:default;color:#94a3b8;">v${SCRIPT_VERSION}</span>
                        </div>
                        <button class="sp-btn sp-btn-clear" id="sp-clear-cache" type="button">清空缓存</button>
                        <span class="sp-cache-feedback" id="sp-cache-feedback"></span>
                    </div>
                    <button class="sp-btn sp-btn-cancel" type="button">取消</button>
                    <button class="sp-btn sp-btn-save" type="button">保存设置</button>
                </div>
            `;

            overlay.appendChild(panel);
            document.body.appendChild(overlay);

            const defaultSelect = panel.querySelector('#sp-default-engine');
            const picker = panel.querySelector('#sp-engine-picker');
            const domainInput = panel.querySelector('#sp-engine-domain');
            const jumpEngineSelect = panel.querySelector('#sp-jump-engine');
            const videoEngineSelect = panel.querySelector('#sp-video-engine');
            const magnetTableCheckbox = panel.querySelector('#sp-magnet-table');
            const clearPreviewCacheBtn = panel.querySelector('#sp-clear-preview-cache');
            const clearTrailerCacheBtn = panel.querySelector('#sp-clear-trailer-cache');
            const pan115PlayerSelect = panel.querySelector('#sp-pan115-player');
            const btnToggles = {
                nyaa:    panel.querySelector('#sp-btn-nyaa'),
                javbus:  panel.querySelector('#sp-btn-javbus'),
                javdb:   panel.querySelector('#sp-btn-javdb'),
                missav:  panel.querySelector('#sp-btn-missav'),
                fanza:   panel.querySelector('#sp-btn-fanza'),
                search:  panel.querySelector('#sp-btn-search'),
                trailer: panel.querySelector('#sp-btn-trailer'),
                preview: panel.querySelector('#sp-btn-preview'),
            };
            const clearCacheBtn = panel.querySelector('#sp-clear-cache');
            const cacheFeedback = panel.querySelector('#sp-cache-feedback');
            const orderList = panel.querySelector('#sp-thumb-order');
            const domainDraft = Object.fromEntries(MAGNET_ENGINES.map(item => [item.key, CFG[item.key]]));
            let currentOrder = GM_getValue('thumb_source_order', ['javfree', 'projectjav', 'javstore']);
            Object.keys(THUMB_META).forEach(src => { if (!currentOrder.includes(src)) currentOrder.push(src); });
            currentOrder = currentOrder.filter(src => THUMB_META[src]);

            const syncDefaultOptions = () => {
                const current = defaultSelect.value || CFG.defaultEngine;
                defaultSelect.innerHTML = '';
                MAGNET_ENGINES.forEach(item => {
                    const value = domainDraft[item.key];
                    const opt = document.createElement('option');
                    opt.value = value;
                    opt.textContent = `${item.label} (${value})`;
                    defaultSelect.appendChild(opt);
                });
                defaultSelect.value = [...defaultSelect.options].some(opt => opt.value === current) ? current : CFG.defaultEngine;
                if (![...defaultSelect.options].some(opt => opt.value === defaultSelect.value)) defaultSelect.selectedIndex = 0;
            };
            MAGNET_ENGINES.forEach(item => {
                const opt = document.createElement('option');
                opt.value = item.key;
                opt.textContent = item.label;
                picker.appendChild(opt);
            });
            const loadPickedDomain = () => {
                const meta = MAGNET_ENGINES.find(item => item.key === picker.value);
                domainInput.value = domainDraft[picker.value] || '';
                domainInput.placeholder = meta?.placeholder || '';
            };
            picker.addEventListener('change', loadPickedDomain);
            domainInput.addEventListener('input', () => {
                domainDraft[picker.value] = stripProtocol(domainInput.value);
                syncDefaultOptions();
            });

            JUMP_SEARCH_ENGINES.forEach((name, index) => {
                const opt = document.createElement('option');
                opt.value = String(index);
                opt.textContent = name;
                jumpEngineSelect.appendChild(opt);
            });
            VIDEO_ENGINES.forEach(item => {
                const opt = document.createElement('option');
                opt.value = item.key;
                opt.textContent = item.label;
                videoEngineSelect.appendChild(opt);
            });
            jumpEngineSelect.value = String(GM_getValue('default_search_engine', 2));
            videoEngineSelect.value = CFG.defaultVideoEngine;
            if (![...videoEngineSelect.options].some(opt => opt.value === videoEngineSelect.value)) videoEngineSelect.value = 'missav';
            if (pan115PlayerSelect) pan115PlayerSelect.value = CFG.pan115Player === '115master' ? '115master' : 'official';
            magnetTableCheckbox.checked = CFG.magnetTable;
            btnToggles.nyaa.checked    = CFG.btnShowNyaa;
            btnToggles.javbus.checked  = CFG.btnShowJavbus;
            btnToggles.javdb.checked   = CFG.btnShowJavdb;
            btnToggles.missav.checked  = CFG.btnShowMissav;
            btnToggles.fanza.checked   = CFG.btnShowFanza;
            btnToggles.search.checked  = CFG.btnShowSearch;
            btnToggles.trailer.checked = CFG.btnShowTrailer;
            btnToggles.preview.checked = CFG.btnShowPreview;

            const renderOrder = () => {
                orderList.innerHTML = '';
                currentOrder.forEach((src, index) => {
                    const meta = THUMB_META[src];
                    const item = document.createElement('div');
                    item.className = 'sp-order-item';
                    item.dataset.src = src;
                    item.innerHTML = `
                        <div><div class="sp-order-name">${meta.label}</div></div>
                        <span class="sp-dot" style="background:${meta.color}"></span>
                        <div class="sp-order-actions">
                            <button class="sp-order-btn" type="button" data-dir="-1" title="上移" ${index === 0 ? 'disabled' : ''}>↑</button>
                            <button class="sp-order-btn" type="button" data-dir="1" title="下移" ${index === currentOrder.length - 1 ? 'disabled' : ''}>↓</button>
                        </div>`;
                    orderList.appendChild(item);
                });
            };
            orderList.addEventListener('click', e => {
                const btn = e.target.closest('.sp-order-btn');
                if (!btn) return;
                const item = btn.closest('.sp-order-item');
                const from = currentOrder.indexOf(item?.dataset.src);
                const to = from + parseInt(btn.dataset.dir, 10);
                if (from < 0 || to < 0 || to >= currentOrder.length) return;
                [currentOrder[from], currentOrder[to]] = [currentOrder[to], currentOrder[from]];
                renderOrder();
            });
            const clearCacheByPrefixes = (prefixes) => {
                let count = 0;
                Object.keys(sessionStorage).forEach(key => {
                    if (prefixes.some(prefix => key.startsWith(prefix))) {
                        sessionStorage.removeItem(key);
                        count += 1;
                    }
                });
                return count;
            };
            const flashCacheButton = (btn, label, count) => {
                if (!btn) return;
                btn.classList.remove('is-done');
                btn.classList.add('is-clearing');
                setTimeout(() => {
                    btn.classList.remove('is-clearing');
                    btn.classList.add('is-done');
                    cacheFeedback.textContent = count ? `${label} ${count} 项` : `${label}无缓存`;
                    setTimeout(() => btn.classList.remove('is-done'), 900);
                    setTimeout(() => { cacheFeedback.textContent = ''; }, 1800);
                }, 260);
            };
            clearPreviewCacheBtn.addEventListener('click', () => {
                const count = clearCacheByPrefixes(['thumb_cache_']);
                flashCacheButton(clearPreviewCacheBtn, '预览图已清理', count);
            });
            clearTrailerCacheBtn.addEventListener('click', () => {
                const count = clearCacheByPrefixes(['trailer_cache_']);
                flashCacheButton(clearTrailerCacheBtn, '预告片已清理', count);
            });
            clearCacheBtn.addEventListener('click', () => {
                const count = clearCacheByPrefixes(['thumb_cache_', 'trailer_cache_', 'pan115_cache_']);
                cacheFeedback.textContent = count ? `已清空 ${count} 项` : '无缓存';
                setTimeout(() => { cacheFeedback.textContent = ''; }, 1800);
            });

            picker.value = 'javdbSearchUrl';
            loadPickedDomain();
            syncDefaultOptions();
            renderOrder();

            const closePanel = () => overlay.remove();
            panel.querySelector('.sp-close').addEventListener('click', closePanel);
            panel.querySelector('.sp-btn-cancel').addEventListener('click', closePanel);
            panel.querySelector('.sp-btn-save').addEventListener('click', () => {
                const snapshotNonPan115 = () => JSON.stringify({
                    domains: MAGNET_ENGINES.map(item => CFG[item.key]),
                    defaultEngine: CFG.defaultEngine,
                    defaultSearchEngine: GM_getValue('default_search_engine', 2),
                    defaultVideoEngine: CFG.defaultVideoEngine,
                    columns: {
                        javbus: CFG.javbusCardColumns,
                        javdb: CFG.javdbCardColumns,
                        javlib: CFG.javlibCardColumns,
                    },
                    magnetTable: CFG.magnetTable,
                    infiniteScroll: CFG.infiniteScroll,
                    buttons: {
                        nyaa: CFG.btnShowNyaa,
                        javbus: CFG.btnShowJavbus,
                        javdb: CFG.btnShowJavdb,
                        missav: CFG.btnShowMissav,
                        fanza: CFG.btnShowFanza,
                        search: CFG.btnShowSearch,
                        trailer: CFG.btnShowTrailer,
                        preview: CFG.btnShowPreview,
                    },
                    thumbOrder: GM_getValue('thumb_source_order', ['javfree', 'projectjav', 'javstore']),
                });
                const beforeNonPan115 = snapshotNonPan115();
                const beforePan115Player = CFG.pan115Player;
                const nextPan115Player = pan115PlayerSelect?.value === '115master' ? '115master' : 'official';
                MAGNET_ENGINES.forEach(item => { CFG[item.key] = stripProtocol(domainDraft[item.key]); });
                CFG.defaultEngine = defaultSelect.value;
                GM_setValue('default_search_engine', parseInt(jumpEngineSelect.value, 10) || 0);
                CFG.defaultVideoEngine = videoEngineSelect.value || 'missav';
                CFG.pan115Player = nextPan115Player;
                CFG.magnetTable = magnetTableCheckbox.checked;
                CFG.btnShowNyaa    = btnToggles.nyaa.checked;
                CFG.btnShowJavbus  = btnToggles.javbus.checked;
                CFG.btnShowJavdb   = btnToggles.javdb.checked;
                CFG.btnShowMissav  = btnToggles.missav.checked;
                CFG.btnShowFanza   = btnToggles.fanza.checked;
                CFG.btnShowSearch  = btnToggles.search.checked;
                CFG.btnShowTrailer = btnToggles.trailer.checked;
                CFG.btnShowPreview = btnToggles.preview.checked;
                GM_setValue('thumb_source_order', currentOrder);
                const pan115Changed = beforePan115Player !== nextPan115Player;
                const nonPan115Changed = beforeNonPan115 !== snapshotNonPan115();
                closePanel();
                if (nonPan115Changed) {
                    location.reload();
                    return;
                }
                if (pan115Changed && typeof window.__LAOSIJI_SYNC_PAN115__ === 'function') {
                    window.__LAOSIJI_SYNC_PAN115__(CFG.btnShowPan115);
                }
            });
        }

        return { open };
    })();
    window.__LAOSIJI_OPEN_SETTINGS__ = () => SettingsPanel.open();
    GM_registerMenuCommand('⚙️ 老司机设置', window.__LAOSIJI_OPEN_SETTINGS__);

    const QuickSettingsPanel = (() => {
        const siteLabelMap = { javbus: 'JavBus', javdb: 'JavDB', javlib: 'JavLibrary' };

        function getCurrentSite() {
            return CardColumns.detectCurrentSite() || PageZoom.detectCurrentSite();
        }

        function ensureStyle() {
            if (document.documentElement.dataset.laosijiQuickSettingsStyle === '1') return;
            document.documentElement.dataset.laosijiQuickSettingsStyle = '1';
            GM_addStyle(`
                #jav-quick-settings-popover {
                    position: fixed;
                    z-index: 10000030;
                    width: 286px;
                    padding: 10px;
                    border: 1px solid rgba(203,213,225,.85);
                    border-radius: 10px;
                    background: rgba(255,255,255,.985);
                    color: #0f172a;
                    box-shadow: 0 12px 28px rgba(15,23,42,.16);
                    backdrop-filter: blur(6px);
                    font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
                    box-sizing: border-box;
                }
                #jav-quick-settings-popover * { box-sizing: border-box; }
                #jav-quick-settings-popover .qs-head {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    margin-bottom: 8px;
                }
                #jav-quick-settings-popover .qs-title {
                    font-size: 13px;
                    font-weight: 800;
                    color: #1e293b;
                }
                #jav-quick-settings-popover .qs-site {
                    margin-top: 1px;
                    font-size: 11px;
                    font-weight: 650;
                    color: #64748b;
                }
                #jav-quick-settings-popover .qs-close {
                    width: 24px;
                    height: 24px;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    background: #fff;
                    color: #64748b;
                    cursor: pointer;
                    line-height: 1;
                    font-size: 14px;
                }
                #jav-quick-settings-popover .qs-close:hover { color: #1d4ed8; border-color: #93c5fd; background: #eff6ff; }
                #jav-quick-settings-popover .qs-row {
                    display: grid;
                    grid-template-columns: 72px 1fr 42px;
                    align-items: center;
                    gap: 9px;
                    padding: 4px 0;
                    border: 0;
                    border-radius: 0;
                    background: transparent;
                }
                #jav-quick-settings-popover .qs-row + .qs-row { margin-top: 4px; }
                #jav-quick-settings-popover .qs-detail-flex {
                    display: none;
                    margin-top: 8px;
                    padding-top: 7px;
                    border-top: 1px solid #e2e8f0;
                }
                #jav-quick-settings-popover .qs-detail-flex.is-visible { display: block; }
                #jav-quick-settings-popover .qs-section-title {
                    margin-bottom: 3px;
                    font-size: 12px;
                    font-weight: 850;
                    color: #1e293b;
                }
                #jav-quick-settings-popover .qs-row.is-disabled {
                    opacity: .48;
                }
                #jav-quick-settings-popover .qs-row.is-disabled .qs-range {
                    cursor: not-allowed;
                    background: #e2e8f0;
                }
                #jav-quick-settings-popover .qs-row.is-disabled .qs-range::-webkit-slider-thumb {
                    background: #94a3b8;
                    cursor: not-allowed;
                }
                #jav-quick-settings-popover .qs-row.is-disabled .qs-range::-moz-range-thumb {
                    background: #94a3b8;
                    cursor: not-allowed;
                }
                #jav-quick-settings-popover .qs-switch-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 6px;
                    margin-top: 6px;
                }
                #jav-quick-settings-popover .qs-switch-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                    padding: 0;
                    border: 0;
                    border-radius: 0;
                    background: transparent;
                }
                #jav-quick-settings-popover .qs-name {
                    font-size: 12px;
                    font-weight: 750;
                    color: #334155;
                    white-space: nowrap;
                }
                #jav-quick-settings-popover .qs-value {
                    display: grid;
                    place-items: center;
                    min-width: 34px;
                    height: 22px;
                    border-radius: 999px;
                    background: #fff;
                    color: #1d4ed8;
                    font-size: 12px;
                    font-weight: 800;
                    border: 1px solid #dbeafe;
                }
                #jav-quick-settings-popover .qs-range {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 100%;
                    height: 5px;
                    border-radius: 999px;
                    background: linear-gradient(90deg,#93c5fd 0%,#dbeafe 100%);
                    outline: none;
                }
                #jav-quick-settings-popover .qs-range::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    border: 2px solid #fff;
                    background: #2563eb;
                    box-shadow: 0 3px 8px rgba(37,99,235,.22);
                    cursor: pointer;
                }
                #jav-quick-settings-popover .qs-range::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border: none;
                    border-radius: 50%;
                    background: #2563eb;
                    box-shadow: 0 3px 8px rgba(37,99,235,.22);
                    cursor: pointer;
                }
                #jav-quick-settings-popover .qs-toggle {
                    position: relative;
                    display: inline-block;
                    width: 36px;
                    height: 20px;
                    flex: 0 0 auto;
                }
                #jav-quick-settings-popover .qs-toggle input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                #jav-quick-settings-popover .qs-toggle-track {
                    position: absolute;
                    inset: 0;
                    border-radius: 999px;
                    background: #cbd5e1;
                    cursor: pointer;
                    transition: background .18s;
                }
                #jav-quick-settings-popover .qs-toggle-track::before {
                    content: '';
                    position: absolute;
                    width: 14px;
                    height: 14px;
                    left: 3px;
                    top: 3px;
                    border-radius: 50%;
                    background: #fff;
                    box-shadow: 0 1px 3px rgba(15,23,42,.22);
                    transition: transform .18s;
                }
                #jav-quick-settings-popover .qs-toggle input:checked + .qs-toggle-track {
                    background: #2563eb;
                }
                #jav-quick-settings-popover .qs-toggle input:checked + .qs-toggle-track::before {
                    transform: translateX(14px);
                }
                #jav-quick-settings-popover .qs-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                    margin-top: 8px;
                    padding-top: 8px;
                    border-top: 1px solid #e2e8f0;
                }
                #jav-quick-settings-popover .qs-more {
                    height: 28px;
                    padding: 0 12px;
                    border: 1px solid #c7d2fe;
                    border-radius: 7px;
                    background: #eef2ff;
                    color: #4338ca;
                    font-size: 11px;
                    font-weight: 800;
                    cursor: pointer;
                }
                #jav-quick-settings-popover .qs-more:hover { background: #e0e7ff; border-color: #a5b4fc; }
            `);
        }

        function positionPanel(panel, anchor) {
            const rect = anchor?.getBoundingClientRect?.();
            const margin = 10;
            const width = panel.offsetWidth || 286;
            const height = panel.offsetHeight || 150;
            let left = rect ? rect.right - width : window.innerWidth - width - 18;
            let top = rect ? rect.bottom + 8 : 64;
            left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));
            top = Math.max(margin, Math.min(top, window.innerHeight - height - margin));
            panel.style.left = `${left}px`;
            panel.style.top = `${top}px`;
        }

        function open(anchor = null) {
            document.getElementById('jav-quick-settings-popover')?.remove();
            ensureStyle();

            const site = getCurrentSite();
            if (!site) {
                SettingsPanel.open();
                return;
            }

            const panel = document.createElement('div');
            panel.id = 'jav-quick-settings-popover';
            panel.innerHTML = `
                <div class="qs-head">
                    <div>
                        <div class="qs-title">快捷设置</div>
                        <div class="qs-site">${siteLabelMap[site] || '当前站点'}</div>
                    </div>
                    <button class="qs-close" type="button" title="关闭">×</button>
                </div>
                <div class="qs-row">
                    <div class="qs-name">卡片列数</div>
                    <input class="qs-range" id="qs-columns" type="range" min="2" max="10" step="1">
                    <span class="qs-value" id="qs-columns-value">5</span>
                </div>
                <div class="qs-row">
                    <div class="qs-name">页面宽度</div>
                    <input class="qs-range" id="qs-zoom" type="range" min="60" max="100" step="1">
                    <span class="qs-value" id="qs-zoom-value">100%</span>
                </div>
                <div class="qs-detail-flex" id="qs-detail-flex">
                    <div class="qs-section-title">详情比例</div>
                    <div class="qs-row" data-detail-flex-row="cover">
                        <div class="qs-name">封面</div>
                        <input class="qs-range" id="qs-detail-cover" type="range" min="50" max="200" step="5">
                        <span class="qs-value" id="qs-detail-cover-value">1.0</span>
                    </div>
                    <div class="qs-row" data-detail-flex-row="info">
                        <div class="qs-name">信息</div>
                        <input class="qs-range" id="qs-detail-info" type="range" min="50" max="200" step="5">
                        <span class="qs-value" id="qs-detail-info-value">1.0</span>
                    </div>
                    <div class="qs-row" data-detail-flex-row="magnet">
                        <div class="qs-name">磁力</div>
                        <input class="qs-range" id="qs-detail-magnet" type="range" min="50" max="200" step="5">
                        <span class="qs-value" id="qs-detail-magnet-value">关闭</span>
                    </div>
                </div>
                <div class="qs-switch-grid">
                    <div class="qs-switch-row">
                        <div class="qs-name">115匹配</div>
                        <label class="qs-toggle">
                            <input id="qs-pan115" type="checkbox">
                            <span class="qs-toggle-track"></span>
                        </label>
                    </div>
                    <div class="qs-switch-row">
                        <div class="qs-name">瀑布流</div>
                        <label class="qs-toggle">
                            <input id="qs-infinite-scroll" type="checkbox">
                            <span class="qs-toggle-track"></span>
                        </label>
                    </div>
                    <div class="qs-switch-row">
                        <div class="qs-name">快捷预览图</div>
                        <label class="qs-toggle">
                            <input id="qs-list-preview" type="checkbox">
                            <span class="qs-toggle-track"></span>
                        </label>
                    </div>
                    <div class="qs-switch-row">
                        <div class="qs-name">预览图直显</div>
                        <label class="qs-toggle">
                            <input id="qs-detail-preview-inline" type="checkbox">
                            <span class="qs-toggle-track"></span>
                        </label>
                    </div>
                </div>
                <div class="qs-footer">
                    <button class="qs-more" type="button">更多设置</button>
                </div>
            `;
            document.body.appendChild(panel);

            const close = () => panel.remove();
            const columnsInput = panel.querySelector('#qs-columns');
            const columnsValue = panel.querySelector('#qs-columns-value');
            const zoomInput = panel.querySelector('#qs-zoom');
            const zoomValue = panel.querySelector('#qs-zoom-value');
            const pan115Input = panel.querySelector('#qs-pan115');
            const infiniteInput = panel.querySelector('#qs-infinite-scroll');
            const listPreviewInput = panel.querySelector('#qs-list-preview');
            const detailPreviewInput = panel.querySelector('#qs-detail-preview-inline');
            const detailSite = DetailFlex.detectCurrentSite();
            const detailWrap = panel.querySelector('#qs-detail-flex');
            const detailInputs = {
                cover: panel.querySelector('#qs-detail-cover'),
                info: panel.querySelector('#qs-detail-info'),
                magnet: panel.querySelector('#qs-detail-magnet'),
            };
            const detailValues = {
                cover: panel.querySelector('#qs-detail-cover-value'),
                info: panel.querySelector('#qs-detail-info-value'),
                magnet: panel.querySelector('#qs-detail-magnet-value'),
            };
            const formatFlexValue = value => (DetailFlex.clamp(value) / 100).toFixed(2).replace(/\.?0+$/, '');
            const syncDetailMagnetState = () => {
                const hasMagnet = detailSite && DetailFlex.hasMagnet(detailSite);
                const row = panel.querySelector('[data-detail-flex-row="magnet"]');
                if (row) row.classList.toggle('is-disabled', !hasMagnet);
                if (detailInputs.magnet) detailInputs.magnet.disabled = !hasMagnet;
                if (detailValues.magnet && !hasMagnet) detailValues.magnet.textContent = CFG.magnetTable ? '未渲染' : '关闭';
                return hasMagnet;
            };

            const columns = CardColumns.get(site);
            columnsInput.value = String(columns);
            columnsValue.textContent = String(columns);
            columnsInput.addEventListener('input', () => {
                const next = CardColumns.clamp(columnsInput.value);
                columnsValue.textContent = String(next);
                CardColumns.set(site, next);
                CardColumns.apply(site, next);
            });

            const zoom = PageZoom.get(site);
            zoomInput.value = String(zoom);
            zoomValue.textContent = `${zoom}%`;
            zoomInput.addEventListener('input', () => {
                const next = PageZoom.clamp(zoomInput.value);
                zoomValue.textContent = `${next}%`;
                PageZoom.set(site, next);
                PageZoom.apply(site, next);
            });
            if (detailSite && DetailFlex.hasLayout(detailSite)) {
                const flexValues = DetailFlex.get(detailSite);
                detailWrap?.classList.add('is-visible');
                Object.entries(detailInputs).forEach(([key, input]) => {
                    const valueEl = detailValues[key];
                    if (!input || !valueEl) return;
                    input.value = String(flexValues[key]);
                    valueEl.textContent = formatFlexValue(flexValues[key]);
                    input.addEventListener('input', () => {
                        const hasMagnet = key !== 'magnet' || syncDetailMagnetState();
                        if (!hasMagnet) return;
                        const next = DetailFlex.clamp(input.value);
                        valueEl.textContent = formatFlexValue(next);
                        DetailFlex.set(detailSite, key, next);
                        DetailFlex.apply(detailSite);
                    });
                });
                syncDetailMagnetState();
            }
            pan115Input.checked = CFG.btnShowPan115;
            pan115Input.addEventListener('change', () => {
                CFG.btnShowPan115 = pan115Input.checked;
                if (typeof window.__LAOSIJI_SYNC_PAN115__ === 'function') {
                    window.__LAOSIJI_SYNC_PAN115__(pan115Input.checked);
                }
            });
            infiniteInput.checked = CFG.infiniteScroll;
            infiniteInput.addEventListener('change', () => {
                CFG.infiniteScroll = infiniteInput.checked;
                if (infiniteInput.checked) {
                    window.__LAOSIJI_INFINITE_SCROLL__?.init?.();
                } else {
                    window.__LAOSIJI_INFINITE_SCROLL__?.destroy?.();
                }
            });
            listPreviewInput.checked = CFG.listPreviewQuick;
            listPreviewInput.addEventListener('change', () => {
                CFG.listPreviewQuick = listPreviewInput.checked;
                window.__LAOSIJI_LIST_PREVIEW__?.sync?.();
            });
            detailPreviewInput.checked = CFG.detailPreviewInline;
            detailPreviewInput.addEventListener('change', () => {
                CFG.detailPreviewInline = detailPreviewInput.checked;
                window.__LAOSIJI_DETAIL_PREVIEW_INLINE__?.sync?.();
            });
            panel.querySelector('.qs-close').addEventListener('click', close);
            panel.querySelector('.qs-more').addEventListener('click', () => {
                close();
                SettingsPanel.open();
            });
            panel.addEventListener('click', e => e.stopPropagation());
            setTimeout(() => {
                const onDocClick = e => {
                    if (!panel.contains(e.target)) {
                        close();
                        document.removeEventListener('click', onDocClick, true);
                    }
                };
                document.addEventListener('click', onDocClick, true);
            }, 0);
            positionPanel(panel, anchor);
        }

        return { open };
    })();
    window.__LAOSIJI_OPEN_QUICK_SETTINGS__ = anchor => QuickSettingsPanel.open(anchor);

    const Magnet = (() => {

        const ENGINE_LABELS = () => ({
            [CFG.javdbSearchUrl]: 'JavDB',
            [CFG.ciligouUrl]:     'CiliGou',
            [CFG.btdigUrl]:       'BtDig',
            [CFG.btsearchUrl]:    'BTSearch',
            [CFG.sukebeiUrl]:     'Sukebei',
            [CFG.sokittyUrl]:     'SoKitty',
        });

        const Engines = {
            getAll() {
                return {
                    [CFG.javdbSearchUrl]: _searchJavDB,
                    [CFG.ciligouUrl]:     _searchCiligou,
                    [CFG.btdigUrl]:       _searchBtdig,
                    [CFG.btsearchUrl]:    _searchBTSearch,
                    [CFG.sukebeiUrl]:     _searchsukebei,
                    [CFG.sokittyUrl]:     _searchSokitty,
                };
            },
            getCurrent() {
                const all = this.getAll();
                const key = CFG.defaultEngine;
                return all[key] ? { key, fn: all[key] } : { key: Object.keys(all)[0], fn: Object.values(all)[0] };
            },
        };

        const JAVDB_API_BASE = 'https://jdforrepam.com/api';
        const JAVDB_SIGN_SALT = '71cf27bb3c0bcdf207b64abecddc970098c7421ee7203b9cdae54478478a199e7d5a6e1a57691123c1a931c057842fb73ba3b3c83bcd69c17ccf174081e3d8aa';
        let javdbSignCache = { ts: 0, sign: '' };

        function javdbMd5(str) {
            const b = new TextEncoder().encode(str);
            const l = b.length;
            const n = ((l + 8) >> 6) + 1;
            const m = new Uint32Array(n * 16);
            const k = [];
            const s = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];

            for (let i = 0; i < 64; i++) k[i] = Math.floor(2 ** 32 * Math.abs(Math.sin(i + 1)));
            for (let i = 0; i < l; i++) m[i >> 2] |= b[i] << ((i % 4) << 3);
            m[l >> 2] |= 0x80 << ((l % 4) << 3);
            m[n * 16 - 2] = l * 8;

            let [a0, b0, c0, d0] = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476];
            for (let i = 0; i < n; i++) {
                const g = m.slice(i * 16, (i + 1) * 16);
                let [a, b, c, d] = [a0, b0, c0, d0];
                for (let j = 0; j < 64; j++) {
                    const q = Math.floor(j / 16);
                    const f = [(b & c) | (~b & d), (d & b) | (~d & c), b ^ c ^ d, c ^ (b | ~d)][q];
                    const p = [j, (5 * j + 1) % 16, (3 * j + 5) % 16, (7 * j) % 16][q];
                    const sum = (a + f + k[j] + g[p]) | 0;
                    const shift = s[(q << 2) | (j % 4)];
                    const nextA = d;
                    d = c;
                    c = b;
                    b = (b + ((sum << shift) | (sum >>> (32 - shift)))) | 0;
                    a = nextA;
                }
                a0 = (a0 + a) | 0;
                b0 = (b0 + b) | 0;
                c0 = (c0 + c) | 0;
                d0 = (d0 + d) | 0;
            }

            return [a0, b0, c0, d0]
                .map(v => new Uint32Array([v]))
                .map(v => new Uint8Array(v.buffer))
                .map(v => Array.from(v, b => b.toString(16).padStart(2, '0')).join(''))
                .join('');
        }

        function buildJavdbSignature() {
            const curr = Math.floor(Date.now() / 1000);
            if (javdbSignCache.sign && curr - javdbSignCache.ts <= 20) return javdbSignCache.sign;
            javdbSignCache = {
                ts: curr,
                sign: `${curr}.lpw6vgqzsp.${javdbMd5(`${curr}${JAVDB_SIGN_SALT}`)}`
            };
            return javdbSignCache.sign;
        }

        function parseJson(text) {
            try { return JSON.parse(text || '{}'); }
            catch { return null; }
        }

        function formatJavdbSize(size) {
            const mb = Number(size);
            if (!Number.isFinite(mb) || mb <= 0) return '';
            return mb >= 1024 ? `${(mb / 1024).toFixed(mb >= 10240 ? 1 : 2)} GB` : `${Math.round(mb)} MB`;
        }

        async function _searchJavDB(kw) {
            const webBase = 'https://' + CFG.javdbSearchUrl;
            const headers = {
                accept: 'application/json',
                jdSignature: buildJavdbSignature()
            };
            const params = new URLSearchParams({
                q: kw,
                page: '1',
                type: 'movie',
                limit: '5',
                movie_type: 'all',
                from_recent: 'false',
                movie_filter_by: 'all',
                movie_sort_by: 'relevance'
            });
            const searchUrl = `${JAVDB_API_BASE}/v2/search?${params.toString()}`;
            const r = await gmFetch(searchUrl, { headers });
            if (!r.loadstuts || r.status < 200 || r.status >= 400) return { url: webBase, data: [] };

            const json = parseJson(r.responseText);
            const movies = Array.isArray(json?.data?.movies) ? json.data.movies : [];
            const compactKw = String(kw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
            const movie = movies.find(item => {
                const number = String(item?.number || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
                return number && number === compactKw;
            }) || movies[0];
            if (!movie?.id) return { url: webBase, data: [] };

            const detailUrl = `${webBase}/v/${movie.id}`;
            const magnetsUrl = `${JAVDB_API_BASE}/v1/movies/${encodeURIComponent(movie.id)}/magnets`;
            const r2 = await gmFetch(magnetsUrl, { headers: { ...headers, jdSignature: buildJavdbSignature() } });
            if (!r2.loadstuts || r2.status < 200 || r2.status >= 400) return { url: detailUrl, data: [] };

            const magnetsJson = parseJson(r2.responseText);
            const magnets = Array.isArray(magnetsJson?.data?.magnets) ? magnetsJson.data.magnets : [];
            const data = magnets.map(item => {
                const hash = String(item?.hash || '').trim();
                if (!hash) return null;
                const name = String(item?.name || movie.number || kw).trim();
                const title = [
                    name,
                    item?.cnsub ? '-CH' : '',
                    item?.hd ? 'HD' : '',
                    item?.files_count ? `${item.files_count} files` : '',
                    item?.created_at || ''
                ].filter(Boolean).join(' ');
                return {
                    title,
                    maglink: `magnet:?xt=urn:btih:${hash}`,
                    size: formatJavdbSize(item?.size),
                    src: detailUrl,
                    cnsub: Boolean(item?.cnsub),
                    hd: Boolean(item?.hd)
                };
            }).filter(Boolean);

            return { url: detailUrl, data };
        }

        async function _searchCiligou(kw) {
            const base = 'https://' + CFG.ciligouUrl;

            const encoded = btoa(unescape(encodeURIComponent(kw))).replace(/=+$/, '');
            const searchUrl = `${base}/search?word=${encoded}`;

            const r = await gmFetch(searchUrl, {
                headers: {
                    'Referer': base + '/',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                },
            });
            if (!r.loadstuts) return { url: searchUrl, data: [] };
            const doc = parseHTML(r.responseText);

            const data = [];
            doc.querySelectorAll('#Search_list_wrapper li').forEach(li => {
                const titleA = li.querySelector('a.SearchListTitle_result_title');
                if (!titleA) return;

                const href = titleA.getAttribute('href') || '';
                const hash = href.split('/').pop();
                if (!hash) return;

                const maglink = `magnet:?xt=urn:btih:${hash}`;
                const src = base + href;

                const title = titleA.textContent.trim();

                const infoText = li.querySelector('.Search_list_info')?.textContent || '';
                const sizeMatch = infoText.match(/文件大小：([^\s]+)/);
                const size = sizeMatch ? sizeMatch[1] : '';

                data.push({ title, maglink, size, src });
            });

            return { url: searchUrl, data };
        }

        async function _searchBtdig(kw) {
            const base = 'https://' + CFG.btdigUrl;
            const r = await gmFetch(`${base}/search?q=${kw}`);
            if (!r.loadstuts) return { url: base, data: [] };
            const doc = parseHTML(r.responseText);
            const items = doc.querySelectorAll('div.one_result');
            const data = [...items].map(el => ({
                title:   el.querySelector('.torrent_name a')?.textContent?.trim() || '',
                maglink: el.querySelector('.fa.fa-magnet a')?.href || '',
                size:    el.querySelector('.torrent_size')?.textContent?.trim() || '',
                src:     el.querySelector('.torrent_name a')?.href || '',
            }));
            return { url: r.finalUrl || base, data };
        }

        function pickBTSearchItems(json) {
            if (Array.isArray(json?.data)) return json.data;
            if (Array.isArray(json?.data?.data)) return json.data.data;
            return [];
        }

        function cleanBTSearchText(value) {
            const raw = String(value || '').trim();
            if (!raw) return '';
            if (!/[<&]/.test(raw)) return raw.replace(/\s+/g, ' ');
            const doc = parseHTML(`<body>${raw}</body>`);
            return (doc.body?.textContent || raw.replace(/<[^>]+>/g, ''))
                .replace(/\s+/g, ' ')
                .trim();
        }

        function normalizeBTSearchItem(item, base, searchUrl, keyword) {
            const title = cleanBTSearchText(item?.name);
            const hash = String(item?.hash || '').replace(/^magnet:\?xt=urn:btih:/i, '').replace(/[^a-z0-9]/gi, '');
            if (!/^[a-f0-9]{32,40}$/i.test(hash)) return null;

            const maglink = `magnet:?xt=urn:btih:${hash}`;
            const size = formatBytes(item?.size);
            const src = item?.id
                ? `${base}/torrent/${encodeURIComponent(item.id)}?keyword=${encodeURIComponent(keyword)}`
                : searchUrl;

            return { title: title || maglink, maglink, size, src };
        }

        function randomBTSearchNonce(length = 8) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let nonce = '';
            for (let i = 0; i < length; i++) nonce += chars.charAt(Math.floor(Math.random() * chars.length));
            return nonce;
        }

        function buildBTSearchHeaders(params, referer) {
            const timestamp = Math.floor(Date.now() / 1000).toString();
            const nonce = randomBTSearchNonce();
            const parts = [`timestamp=${timestamp}`, `nonce=${nonce}`];
            Object.keys(params).forEach(key => parts.push(`${key}=${params[key]}`));
            const signText = `${parts.sort().join('&')}&key=long2ice`;
            return {
                Accept: 'application/json, text/plain, */*',
                Referer: referer,
                'x-timestamp': timestamp,
                'x-nonce': nonce,
                'x-sign': javdbMd5(signText).toUpperCase()
            };
        }

        async function _searchBTSearch(kw) {
            const base = 'https://' + CFG.btsearchUrl;
            const searchUrl = `${base}/search?keyword=${encodeURIComponent(kw)}`;
            const params = {
                keyword: kw,
                limit: '10',
                offset: '0',
                mode: '',
                time: '',
                sort: 'size',
                sort_type: 'desc',
                size: ''
            };
            const apiUrl = `${base}/api/search?${new URLSearchParams(params).toString()}`;
            const r = await gmFetch(apiUrl, {
                headers: buildBTSearchHeaders(params, searchUrl)
            });
            if (!r.loadstuts || r.status < 200 || r.status >= 400) return { url: searchUrl, data: [] };

            const json = parseJson(r.responseText);
            const data = pickBTSearchItems(json)
                .map(item => normalizeBTSearchItem(item, base, searchUrl, kw))
                .filter(Boolean);
            return { url: searchUrl, data };
        }

        async function _searchsukebei(kw) {
            const base = 'https://' + CFG.sukebeiUrl;
            const r = await gmFetch(`${base}/?f=0&c=0_0&q=${kw}`);
            if (!r.loadstuts) return { url: base, data: [] };
            const doc = parseHTML(r.responseText);
            const rows = doc.querySelectorAll('tr.default, tr.success');
            const data = [...rows].map(el => ({
                title:   el.querySelector('td:nth-child(2)>a:nth-child(1)')?.title || '',
                maglink: el.querySelector('td:nth-child(3)>a:last-child')?.href || '',
                size:    el.querySelector('td:nth-child(4)')?.textContent?.trim() || '',
                src:     base + (el.querySelector('td:nth-child(2)>a:nth-child(1)')?.getAttribute('href') || ''),
            }));
            return { url: r.finalUrl || base, data };
        }

        async function _searchSokitty(kw) {
            const base = 'https://' + CFG.sokittyUrl;

            const searchUrl = `${base}/search?key=${encodeURIComponent(kw)}`;
            const r = await gmFetch(searchUrl, {
                headers: { 'Referer': base + '/' },
            });
            if (!r.loadstuts) return { url: searchUrl, data: [] };
            const doc = parseHTML(r.responseText);

            const normalize = s => s.toUpperCase().replace(/[-_\s]/g, '');
            const kwNorm = normalize(kw);

            const data = [];
            doc.querySelectorAll('.panel.search-panel').forEach(panel => {
                const titleA = panel.querySelector('h3.panel-title > a.list-title');
                if (!titleA) return;

                const href = titleA.getAttribute('href') || '';
                if (!href.startsWith('/bt/')) return;

                const hash = href.replace('/bt/', '');
                if (!hash) return;

                const title = titleA.textContent.trim();

                if (!normalize(title).includes(kwNorm)) return;

                const maglink = `magnet:?xt=urn:btih:${hash}`;
                const src = base + href;

                const size = panel.querySelector('.panel-footer .info-item')?.textContent?.trim() || '';

                data.push({ title, maglink, size, src });
            });

            return { url: searchUrl, data };
        }
        async function offline115(maglink) {
            maglink = maglink.substring(0, 60);
            const tokenR = await gmFetch(`http://115.com/?ct=offline&ac=space&_=${Date.now()}`);
            if (!tokenR.loadstuts) {
                notify('115 错误', '无法获取token，请检查115是否已登录', 'http://115.com/?mode=login');
                return;
            }
            if (tokenR.responseText.includes('html')) {
                notify('115 未登录', '请先登录115账户后再离线下载', 'http://115.com/?mode=login');
                return;
            }
            const json = JSON.parse(tokenR.responseText);
            const uid = GM_getValue('jav_115_uid', '');

            return new Promise(resolve => {
                GM_xmlhttpRequest({
                    method: 'POST',
                    url: 'http://115.com/web/lixian/?ct=lixian&ac=add_task_url',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    data: `url=${encodeURIComponent(maglink)}&uid=${uid}&sign=${json.sign}&time=${json.time}`,
                    onload(r) {
                        const res = JSON.parse(r.responseText);
                        if (res.state) {
                            notify('115 离线成功', '任务已添加', 'http://115.com/?tab=offline&mode=wangpan');
                        } else {
                            const msg = res.errcode === '911'
                                ? '账号使用异常，请手工验证'
                                : (res.error_msg || '未知错误');
                            notify('115 离线失败', msg, 'http://115.com/?tab=offline&mode=wangpan');
                        }
                        resolve();
                    },
                });
            });
        }

        GM_addStyle(`
            #jav-nong-table {
                width: 100%;
                table-layout: fixed;
                margin: 8px 0; color: #666;
                font-size: 13px; text-align: center;
                background: #f2f2f2; border-collapse: collapse;
                max-width: 100%;
            }
            #jav-nong-table th, #jav-nong-table td {
                text-align: center; height: 30px;
                background: #fff; padding: 0 6px;
                border: 1px solid #efefef;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            #jav-nong-table th:nth-child(2), #jav-nong-table td:nth-child(2) { width: 74px; }
            #jav-nong-table th:nth-child(3), #jav-nong-table td:nth-child(3) { width: 74px; }
            #jav-nong-table th:nth-child(4), #jav-nong-table td:nth-child(4) { width: 48px; }
            #jav-nong-table:has(td.mag-laosiji-ready-cell) th:nth-child(3),
            #jav-nong-table:has(td.mag-laosiji-ready-cell) td:nth-child(3) {
                width: 104px;
            }
            #jav-nong-table td.mag-laosiji-ready-cell {
                overflow: visible;
            }
            #jav-nong-table td:first-child {
                min-width: 0;
                text-align: left;
            }
            #jav-nong-table .nong-head-row th { background: #f8f8f8; font-weight: 600; }
            #jav-nong-table .nong-magnet-name {
                display: flex;
                align-items: center;
                gap: 4px;
                min-width: 0;
                width: 100%;
                max-width: 100%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            #jav-nong-table .nong-magnet-name > a {
                flex: 1 1 auto;
                min-width: 0;
                display: block;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .nong-copy { color: #08c !important; cursor: pointer; }
            .nong-check { color: #be185d !important; cursor: pointer; margin-left: 8px; }
            .nong-offline-115 { color: rgb(0,180,30) !important; cursor: pointer; }
            .nong-offline-115:hover { color: red !important; }
            .whatslink-overlay { position: fixed; inset: 0; z-index: 10000040; display: flex; align-items: center; justify-content: center; padding: 22px; background: rgba(15,23,42,.66); backdrop-filter: blur(8px); }
            .whatslink-modal { width: min(1100px,96vw); max-height: 90vh; display: grid; grid-template-columns: 1.55fr .75fr; background: #f5f7fb; border: 1px solid rgba(203,213,225,.9); border-radius: 12px; overflow: hidden; box-shadow: 0 30px 80px rgba(2,8,23,.38); font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
            .whatslink-modal.no-shots { grid-template-columns: 1.1fr .9fr; }
            .whatslink-viewer { min-width: 0; display: grid; grid-template-rows: minmax(430px,1fr) auto; gap: 10px; padding: 14px; background: radial-gradient(circle at 20% 0%,#fff1f8 0,transparent 34%),#eef3f8; }
            .whatslink-stage { position: relative; min-height: 470px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid #dde7f2; border-radius: 12px; background: #111827; box-shadow: 0 18px 36px rgba(15,23,42,.16); }
            .whatslink-stage img { width: 100%; height: 100%; max-height: 68vh; object-fit: contain; border-radius: 10px; }
            .whatslink-modal.no-shots .whatslink-viewer { grid-template-rows: minmax(430px,1fr); background: linear-gradient(135deg,#f8fafc,#eef2ff); }
            .whatslink-modal.no-shots .whatslink-stage { background: linear-gradient(145deg,#fff,#f1f5f9); border-style: dashed; box-shadow: inset 0 0 0 1px rgba(255,255,255,.8),0 18px 36px rgba(15,23,42,.08); }
            .whatslink-modal.no-shots .whatslink-stage img, .whatslink-modal.no-shots .whatslink-nav, .whatslink-modal.no-shots .whatslink-counter, .whatslink-modal.no-shots .whatslink-thumbs { display: none; }
            .whatslink-empty { display: none; width: min(420px,72%); text-align: center; color: #475569; }
            .whatslink-modal.no-shots .whatslink-empty { display: block; }
            .whatslink-empty-icon { width: 62px; height: 62px; margin: 0 auto 15px; display: grid; place-items: center; border-radius: 18px; background: linear-gradient(135deg,#fce7f3,#e0e7ff); color: #be185d; font-size: 27px; box-shadow: 0 12px 26px rgba(190,24,93,.16); }
            .whatslink-empty-title { font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 7px; }
            .whatslink-empty-text { margin: 0; font-size: 13px; line-height: 1.6; }
            .whatslink-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 38px; height: 52px; border: 0; border-radius: 8px; background: rgba(255,255,255,.14); color: #fff; font-size: 28px; cursor: pointer; }
            .whatslink-nav:hover { background: rgba(255,255,255,.24); }
            .whatslink-prev { left: 12px; } .whatslink-next { right: 12px; }
            .whatslink-counter { position: absolute; right: 14px; bottom: 12px; color: #e2e8f0; font-size: 12px; text-shadow: 0 1px 6px rgba(0,0,0,.6); }
            .whatslink-thumbs { display: grid; grid-template-columns: repeat(5,1fr); gap: 7px; padding: 0; background: transparent; }
            .whatslink-thumb { border: 2px solid #e2e8f0; border-radius: 9px; padding: 0; overflow: hidden; background: #fff; cursor: pointer; aspect-ratio: 16 / 9; box-shadow: 0 6px 14px rgba(15,23,42,.08); }
            .whatslink-thumb.active { border-color: #db2777; box-shadow: 0 8px 18px rgba(219,39,119,.22); }
            .whatslink-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
            .whatslink-info { min-width: 0; padding: 14px; background: #f8fafc; overflow: auto; color: #172033; }
            .whatslink-head { position: sticky; top: 0; z-index: 2; margin: -14px -14px 12px; padding: 13px 14px; background: rgba(248,250,252,.94); border-bottom: 1px solid #e2e8f0; backdrop-filter: blur(10px); display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
            .whatslink-kicker { color: #db2777; font-size: 12px; font-weight: 800; margin-bottom: 5px; }
            .whatslink-title { margin: 0; font-size: 21px; line-height: 1.18; color: #111827; word-break: break-word; }
            .whatslink-close { width: 32px; height: 32px; border: 0; border-radius: 8px; color: #64748b; background: transparent; cursor: pointer; font-size: 25px; line-height: 1; }
            .whatslink-tag { display: inline-flex; align-items: center; min-height: 22px; padding: 0 8px; margin-top: 8px; border-radius: 999px; background: #ecfdf5; color: #047857; font-size: 12px; font-weight: 700; }
            .whatslink-meta { display: grid; grid-template-columns: 1fr; gap: 7px; margin: 10px 0 12px; }
            .whatslink-metric { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 10px; border: 1px solid #e2e8f0; border-radius: 11px; background: #fff; box-shadow: 0 8px 20px rgba(15,23,42,.06); }
            .whatslink-metric b { color: #172033; font-size: 13px; order: 2; }
            .whatslink-metric span { color: #64748b; font-size: 12px; order: 1; }
            .whatslink-section, .whatslink-summary-card { border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; padding: 10px; box-shadow: 0 8px 20px rgba(15,23,42,.06); }
            .whatslink-section h3 { margin: 0 0 8px; color: #be185d; font-size: 12px; }
            .whatslink-magnet { word-break: break-all; max-height: 86px; overflow: auto; padding: 9px; border-radius: 8px; background: #f6f8fb; color: #334155; font-family: ui-monospace,SFMono-Regular,Consolas,monospace; font-size: 12px; }
            .whatslink-summary { display: grid; gap: 8px; margin-top: 10px; }
            .whatslink-summary-card strong { display: block; margin-bottom: 4px; color: #111827; font-size: 12px; }
            .whatslink-summary-card p { margin: 0; color: #64748b; font-size: 11px; line-height: 1.45; }
            .whatslink-loading { padding: 28px; text-align: center; color: #475569; font-size: 14px; }
            #jav-nong-notice {
                padding: 8px 0;
            }
            .nong-magnet-name {
                max-width: 320px; white-space: nowrap;
                overflow: hidden; text-overflow: ellipsis;
                display: flex; align-items: center; text-align: left;
            }
            #jav-nong-refresh {
                display: none; margin-left: 8px;
                color: #e74c3c; font-weight: bold; cursor: pointer;
            }
        `);

        function formatBytes(bytes) {
            const num = Number(bytes) || 0;
            if (!num) return '-';
            const units = ['B', 'KB', 'MB', 'GB', 'TB'];
            let value = num;
            let index = 0;
            while (value >= 1024 && index < units.length - 1) {
                value /= 1024;
                index += 1;
            }
            return `${value.toFixed(index >= 3 ? 2 : 1)} ${units[index]}`;
        }

        function formatWhatslinkType(payload) {
            const raw = String(payload?.file_type || payload?.type || '').toUpperCase();
            if (raw.includes('FOLDER')) return '文件夹';
            if (raw.includes('FILE')) return '文件';
            return '-';
        }

        function showWhatslinkModal(payload, magnet) {
            document.querySelector('.whatslink-overlay')?.remove();
            const shots = Array.isArray(payload?.screenshots) ? payload.screenshots.map(item => item?.screenshot).filter(Boolean) : [];
            let index = 0;
            const resourceType = formatWhatslinkType(payload);
            const overlay = document.createElement('div');
            overlay.className = 'whatslink-overlay';
            const modal = document.createElement('section');
            modal.className = `whatslink-modal${shots.length ? '' : ' no-shots'}`;
            modal.innerHTML = `
                <div class="whatslink-viewer">
                    <div class="whatslink-stage">
                        <button class="whatslink-nav whatslink-prev" type="button">‹</button>
                        <img class="whatslink-hero" alt="截图预览">
                        <button class="whatslink-nav whatslink-next" type="button">›</button>
                        <div class="whatslink-counter"></div>
                        <div class="whatslink-empty">
                            <div class="whatslink-empty-icon">?</div>
                            <div class="whatslink-empty-title">暂无截图</div>
                            <p class="whatslink-empty-text">WhatsLink 已返回资源基础信息，但没有可展示的截图。可以通过名称、大小和文件数量先做基础判断。</p>
                        </div>
                    </div>
                    <div class="whatslink-thumbs"></div>
                </div>
                <aside class="whatslink-info">
                    <div class="whatslink-head">
                        <div>
                            <div class="whatslink-kicker">磁力验车</div>
                            <h2 class="whatslink-title"></h2>
                            <span class="whatslink-tag"></span>
                        </div>
                        <button class="whatslink-close" type="button">×</button>
                    </div>
                    <div class="whatslink-meta">
                        <div class="whatslink-metric"><b>${formatBytes(payload?.size)}</b><span>资源大小</span></div>
                        <div class="whatslink-metric"><b>${payload?.count ?? '-'}</b><span>文件数量</span></div>
                        <div class="whatslink-metric"><b>${resourceType}</b><span>资源结构</span></div>
                        <div class="whatslink-metric"><b>${shots.length}</b><span>截图数量</span></div>
                        <div class="whatslink-metric"><b>${payload?.error ? '异常' : '无错误'}</b><span>接口状态</span></div>
                    </div>
                    <div class="whatslink-section">
                        <h3>磁力链接</h3>
                        <div class="whatslink-magnet"></div>
                    </div>
                    <div class="whatslink-summary">
                        <div class="whatslink-summary-card"><strong>验车结论</strong><p>${shots.length ? 'WhatsLink 已返回截图，优先用左侧大图确认内容是否匹配番号。' : '当前没有截图，建议结合资源名称、大小和文件数量判断。'}</p></div>
                    </div>
                </aside>`;
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            modal.querySelector('.whatslink-title').textContent = payload?.name || '未知资源';
            modal.querySelector('.whatslink-tag').textContent = resourceType;
            modal.querySelector('.whatslink-magnet').textContent = magnet;
            const hero = modal.querySelector('.whatslink-hero');
            const thumbs = modal.querySelector('.whatslink-thumbs');
            const counter = modal.querySelector('.whatslink-counter');
            const render = () => {
                if (!shots.length) return;
                hero.src = shots[index];
                counter.textContent = `${index + 1} / ${shots.length}`;
                [...thumbs.children].forEach((btn, i) => btn.classList.toggle('active', i === index));
            };
            shots.forEach((url, i) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'whatslink-thumb';
                btn.innerHTML = `<img src="${url}" alt="截图 ${i + 1}">`;
                btn.addEventListener('click', () => { index = i; render(); });
                thumbs.appendChild(btn);
            });
            modal.querySelector('.whatslink-prev').addEventListener('click', () => { if (!shots.length) return; index = (index + shots.length - 1) % shots.length; render(); });
            modal.querySelector('.whatslink-next').addEventListener('click', () => { if (!shots.length) return; index = (index + 1) % shots.length; render(); });
            const close = () => overlay.remove();
            modal.querySelector('.whatslink-close').addEventListener('click', close);
            overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
            render();
        }

        async function checkWhatslink(magnet) {
            document.querySelector('.whatslink-overlay')?.remove();
            const overlay = document.createElement('div');
            overlay.className = 'whatslink-overlay';
            overlay.innerHTML = '<div class="whatslink-modal no-shots"><div class="whatslink-loading">正在验车...</div></div>';
            document.body.appendChild(overlay);
            try {
                const url = `https://whatslink.info/api/v1/link?url=${encodeURIComponent(magnet)}`;
                const r = await gmFetch(url, { timeout: 20000 });
                if (!r.loadstuts) throw new Error('WhatsLink 请求失败');
                const data = JSON.parse(r.responseText || '{}');
                overlay.remove();
                showWhatslinkModal(data, magnet);
            } catch (e) {
                overlay.remove();
                showWhatslinkModal({ error: e.message || '查询失败', name: '查询失败', type: '-', file_type: '-', size: 0, count: '-', screenshots: [] }, magnet);
            }
        }

        function buildTable(avid) {
            const table = document.createElement('table');
            table.id = 'jav-nong-table';
            table.dataset.avid = avid;

            const headRow = document.createElement('tr');
            headRow.className = 'nong-head-row';

            const thEngine = document.createElement('th');
            thEngine.style.textAlign = 'left';
            const allEngines = Engines.getAll();
            const curKey = CFG.defaultEngine;
            const sel = document.createElement('select');
            sel.style.cssText = 'height:22px;font-size:12px;border:1px solid #cbd5e1;border-radius:6px;padding:1px 22px 1px 6px;min-width:84px;background:#fff;color:#172033;font-weight:650;';
            const labels = ENGINE_LABELS();
            Object.keys(allEngines).forEach(k => {
                const op = document.createElement('option');
                op.value = k;
                op.textContent = labels[k] || k;
                if (k === curKey) op.selected = true;
                sel.appendChild(op);
            });

            const fitSelWidth = () => {
                sel.style.width = '';
                const natural = sel.offsetWidth;
                sel.style.width = Math.max(natural, 80) + 'px';
            };
            requestAnimationFrame(fitSelWidth);
            sel.addEventListener('change', () => {
                runSearch(table, avid, sel.value);
                requestAnimationFrame(fitSelWidth);
            });
            thEngine.appendChild(sel);
            headRow.appendChild(thEngine);

            ['大小', '操作', '115'].forEach(txt => {
                const th = document.createElement('th');
                th.textContent = txt;
                if (txt === '115') th.className = 'nong-115-head';
                headRow.appendChild(th);
            });

            table.appendChild(headRow);

            const loadRow = document.createElement('tr');
            const loadTd = document.createElement('td');
            loadTd.colSpan = 4;
            loadTd.id = 'jav-nong-notice';
            const loadText = document.createTextNode('Loading…');
            const refreshBtn = document.createElement('a');
            refreshBtn.id = 'jav-nong-refresh';
            refreshBtn.href = '#';
            refreshBtn.textContent = '🔄 刷新';
            refreshBtn.title = '网络加载失败，点击重试';
            refreshBtn.addEventListener('click', e => {
                e.preventDefault();
                runSearch(table, avid, sel.value);
            });
            loadTd.appendChild(loadText);
            loadTd.appendChild(refreshBtn);
            loadRow.appendChild(loadTd);
            table.appendChild(loadRow);

            return table;
        }

        function fillTable(table, data, engineUrl) {
            const parseSize = s => {
                if (!s) return 0;
                const m = s.replace(/,/g, '').match(/([\d.]+)\s*(GiB|MiB|KiB|GB|MB|KB|B)?/i);
                if (!m) return 0;
                const n = parseFloat(m[1]);
                const u = (m[2] || 'B').toUpperCase();
                return n * ({ GIB: 1073741824, MIB: 1048576, KIB: 1024, GB: 1073741824, MB: 1048576, KB: 1024, B: 1 }[u] || 1);
            };
            data = [...data].sort((a, b) => parseSize(b.size) - parseSize(a.size));

            const notice = table.querySelector('#jav-nong-notice');
            if (notice) notice.parentElement.remove();

            if (!data.length) {
                const emptyRow = document.createElement('tr');
                const td = document.createElement('td');
                td.colSpan = 4;
                td.innerHTML = `无搜索结果 <a href="${engineUrl}" target="_blank" style="color:red">前往查看</a>`;
                const refresh = document.createElement('a');
                refresh.href = '#';
                refresh.textContent = ' 🔄 刷新';
                refresh.style.cssText = 'margin-left:8px;color:#e74c3c;font-weight:bold;cursor:pointer;';
                refresh.addEventListener('click', e => {
                    e.preventDefault();
                    const engineKey = table.querySelector('select')?.value || CFG.defaultEngine;
                    runSearch(table, table.dataset.avid || '', engineKey);
                });
                td.appendChild(refresh);
                emptyRow.appendChild(td);
                table.appendChild(emptyRow);
                return;
            }

            data.forEach(item => {
                const tr = document.createElement('tr');
                tr.setAttribute('data-maglink', item.maglink);

                const tdTitle = document.createElement('td');
                const nameSpan = document.createElement('span');
                nameSpan.className = 'nong-magnet-name';
                nameSpan.title = item.title;
                const _hasCJK = /[\u4e00-\u9fff]/.test(item.title);
                const _hasJP  = /[\u3040-\u309f\u30a0-\u30ff]/.test(item.title);
                const isChinese = /(?:[^A-Za-z]|^)FHDC(?:[^A-Za-z]|$)/i.test(item.title)
                    || /[-_]CH?(?:[^A-Za-z]|$)/.test(item.title)
                    || /中字/.test(item.title)
                    || /中文/.test(item.title)
                    || /自提/.test(item.title)
                    || /征用/.test(item.title)
                    || (_hasCJK && !_hasJP);
                const is4K = /(?:[^A-Za-z0-9]|^)4K(?:UHD)?(?:[^A-Za-z0-9]|$)/i.test(item.title);
                if (isChinese) {
                    const badge = document.createElement('span');
                    badge.textContent = '[中字]';
                    badge.style.cssText = 'display:inline-block;margin-right:5px;padding:1px 5px;font-size:11px;font-weight:800;color:#fff;background:#16a34a;border-radius:4px;vertical-align:middle;flex-shrink:0;box-shadow:0 0 0 1px rgba(22,163,74,.18);';
                    nameSpan.appendChild(badge);
                    nameSpan.style.background = 'linear-gradient(90deg,#dcfce7 0%,#f0fdf4 55%,#fff 100%)';
                    nameSpan.style.borderLeft = '4px solid #16a34a';
                    nameSpan.style.paddingLeft = '5px';
                }
                if (is4K) {
                    const badge4k = document.createElement('span');
                    badge4k.textContent = '[4K]';
                    badge4k.style.cssText = 'display:inline-block;margin-right:5px;padding:1px 5px;font-size:11px;font-weight:800;color:#fff;background:#2563eb;border-radius:4px;vertical-align:middle;flex-shrink:0;box-shadow:0 0 0 1px rgba(37,99,235,.18);';
                    nameSpan.insertBefore(badge4k, nameSpan.firstChild);
                    if (!isChinese) {
                        nameSpan.style.background = 'linear-gradient(90deg,#dbeafe 0%,#eff6ff 55%,#fff 100%)';
                        nameSpan.style.borderLeft = '4px solid #2563eb';
                        nameSpan.style.paddingLeft = '5px';
                    }
                }
                const titleLink = document.createElement('a');
                titleLink.href = item.src || item.maglink;
                titleLink.target = '_blank';
                titleLink.textContent = item.title;
                nameSpan.appendChild(titleLink);
                tdTitle.appendChild(nameSpan);
                tr.appendChild(tdTitle);

                const tdSize = document.createElement('td');
                tdSize.style.whiteSpace = 'nowrap';
                tdSize.textContent = item.size;
                tr.appendChild(tdSize);

                const tdOp = document.createElement('td');
                tdOp.style.whiteSpace = 'nowrap';
                const copyBtn = document.createElement('a');
                const magShort = item.maglink.substring(0, 60);
                const _extractCode = (text) => {
                    if (!text) return null;
                    const patterns = [
                        /FC2[-\s_]?(?:PPV)?[-\s_]?(\d{6,9})/i,
                        /([A-Z]{2,15})-(\d{2,10})(?:-(\d+))?/i,
                        /([A-Z]{2,15})-([A-Z]{0,2}\d{2,10})/i,
                        /^[A-Z0-9]+[-_](\d{6}[-_]\d{2,3})/i,
                        /(\d{6}[-_]\d{2,3})[-_][A-Z0-9]+$/i,
                        /(?<!\w)(\d{6}[-_]\d{2,3})(?!\w)/,
                        /([A-Z]{1,2})(\d{3,4})/i,
                    ];
                    for (const re of patterns) {
                        const m = text.match(re);
                        if (m) return m[0].toUpperCase();
                    }
                    return null;
                };
                const dnCode = _extractCode(item.title) || _extractCode(item.maglink);
                const magWithDn = magShort + (dnCode ? `&dn=${encodeURIComponent(dnCode)}` : '');
                copyBtn.href = magShort;
                copyBtn.title = magShort;
                copyBtn.className = 'nong-copy';
                copyBtn.textContent = '复制';
                copyBtn.addEventListener('click', e => {
                    e.preventDefault();
                    GM_setClipboard(magWithDn);
                    copyBtn.textContent = '✓';
                    setTimeout(() => { copyBtn.textContent = '复制'; }, 1000);
                });
                tdOp.appendChild(copyBtn);
                const checkBtn = document.createElement('a');
                checkBtn.href = '#';
                checkBtn.className = 'nong-check';
                checkBtn.textContent = '验车';
                checkBtn.addEventListener('click', e => {
                    e.preventDefault();
                    checkWhatslink(item.maglink);
                });
                tdOp.appendChild(checkBtn);
                tr.appendChild(tdOp);

                const tdOffline = document.createElement('td');
                tdOffline.className = 'nong-115-cell';
                const offBtn = document.createElement('a');
                offBtn.href = '#';
                offBtn.className = 'nong-offline-115';
                offBtn.textContent = '115';
                offBtn.addEventListener('click', e => {
                    e.preventDefault();
                    offline115(item.maglink);
                });
                tdOffline.appendChild(offBtn);
                tr.appendChild(tdOffline);

                table.appendChild(tr);
            });
        }

        async function runSearch(table, avid, engineKey) {
            [...table.querySelectorAll('tr:not(.nong-head-row)')].forEach(r => r.remove());
            const loadRow = document.createElement('tr');
            const loadTd = document.createElement('td');
            loadTd.colSpan = 4;
            loadTd.id = 'jav-nong-notice';
            const loadText = document.createTextNode('Loading…');
            const refreshBtn = table.querySelector('#jav-nong-refresh') || document.createElement('a');
            refreshBtn.id = 'jav-nong-refresh';
            refreshBtn.href = '#';
            refreshBtn.textContent = '🔄 刷新';
            refreshBtn.style.cssText = 'display:none;margin-left:8px;color:#e74c3c;font-weight:bold;cursor:pointer;';
            refreshBtn.onclick = e => { e.preventDefault(); runSearch(table, avid, engineKey); };
            loadTd.appendChild(loadText);
            loadTd.appendChild(refreshBtn);
            loadRow.appendChild(loadTd);
            table.appendChild(loadRow);

            let timedOut = false;
            const timer = setTimeout(() => {
                timedOut = true;
                loadText.textContent = '加载超时 ';
                refreshBtn.style.display = 'inline';
            }, 8000);

            try {
                const allEngines = Engines.getAll();
                const fn = allEngines[engineKey] || Object.values(allEngines)[0];
                const { url, data } = await fn(avid);
                clearTimeout(timer);
                if (timedOut) return;
                fillTable(table, data, url);
            } catch(e) {
                clearTimeout(timer);
                log('磁力搜索出错:', e);
                loadText.textContent = '搜索出错 ';
                refreshBtn.style.display = 'inline';
            }
        }

        function createMagnetWidget(avid) {
            const wrapper = document.createElement('div');
            wrapper.className = 'jav-nong-wrapper';
            wrapper.style.cssText = `
                display: inline-block;
                width: min(560px, 100%);
                max-width: 100%;
                box-sizing: border-box;
                padding: 12px 12px 10px;
                background: #fafafa;
                border: 1px solid #ebebeb;
                border-radius: 6px;
                overflow: hidden;
            `;

            const header = document.createElement('div');
            header.style.cssText = 'margin-bottom:10px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;';

            const title = document.createElement('span');
            title.style.cssText = 'color:#0066cc;font-size:14px;font-weight:600;';
            title.textContent = '🔥 磁力搜索';
            header.appendChild(title);

            wrapper.appendChild(header);
            const table = buildTable(avid);
            wrapper.appendChild(table);

            const engineKey = CFG.defaultEngine;
            runSearch(table, avid, engineKey);

            return wrapper;
        }

        return { createMagnetWidget };
    })();

    const SiteJavBus = {
        match() {
            return location.hostname.includes('javbus');
        },
        getVid() {
            const kw = document.querySelector('meta[name="keywords"]')?.content || '';
            return normalizeAvid(kw.split(',')[0].trim());
        },
        isDetailPage() {
            return !!document.querySelector('.row.movie') &&
                   !document.querySelector('#waterfall div.item');
        },
        initPage(avid) {
            document.querySelector('.ad-box')?.remove();
            this._insertTopSettingsButton();
            setTimeout(() => this._insertTopSettingsButton(), 500);


            if (document.querySelector('#waterfall div.item')) {
                this._initListPage();
                return;
            }


            this._insertCopyButton(avid);
            GM_addStyle(`
                .container { max-width: 100% !important; width: 100% !important;
                    padding-left: 20px !important; padding-right: 20px !important; }
                .row.movie { display: flex !important; gap: 20px !important;
                    align-items: flex-start !important; flex-wrap: nowrap !important; margin: 0 !important; }
                .row.movie { --javbus-cover-flex: 1; --javbus-info-flex: .75; --javbus-magnet-flex: 1.2; }
                .col-md-9.screencap { flex: var(--javbus-cover-flex) 1 0 !important; min-width: 0 !important;
                    width: auto !important; float: none !important; padding: 0 !important; }
                .col-md-3.info { flex: var(--javbus-info-flex) 1 0 !important; min-width: 0 !important;
                    width: auto !important; float: none !important;
                    overflow: hidden !important; word-break: break-word !important; }
                .jav-nong-slot { flex: var(--javbus-magnet-flex) 1 0 !important; min-width: 0 !important; align-self: flex-start !important; overflow: hidden !important; }
                .jav-nong-wrapper { width: 560px; max-width: 100%; }
                .screencap img { width: 100%; max-width: 100%; }
                .footer { padding: 20px 0; }
            `);

            this._insertMagnet(avid);
        },
        _insertTopSettingsButton() {
            const navbar = document.querySelector('#navbar');
            if (!navbar || navbar.querySelector('.javbus-top-settings-nav')) return;

            const magnetNav = [...navbar.querySelectorAll(':scope > ul.nav.navbar-nav.navbar-right')].find(ul => {
                return ul.querySelector('.glyphicon-magnet') || /\u5df2\u6709\u78c1\u529b/.test(ul.textContent || '');
            });

            const settingsNav = document.createElement('ul');
            settingsNav.className = 'nav navbar-nav navbar-right javbus-top-settings-nav';
            settingsNav.innerHTML = `
                <li>
                    <a href="javascript:void(0)" class="javbus-top-settings-btn" title="\u6253\u5f00\u8001\u53f8\u673a\u8bbe\u7f6e">
                        <span class="glyphicon glyphicon-cog" style="font-size:12px;"></span>
                        <span class="hidden-md hidden-sm">\u8001\u53f8\u673a\u8bbe\u7f6e</span>
                    </a>
                </li>
            `;
            settingsNav.querySelector('.javbus-top-settings-btn')?.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                window.__LAOSIJI_OPEN_QUICK_SETTINGS__?.(e.currentTarget);
            });

            if (magnetNav) {
                magnetNav.insertAdjacentElement('afterend', settingsNav);
            } else {
                navbar.appendChild(settingsNav);
            }

            if (document.documentElement.dataset.laosijiJavbusTopSettingsStyle === '1') return;
            document.documentElement.dataset.laosijiJavbusTopSettingsStyle = '1';
            GM_addStyle(`
                #navbar .javbus-top-settings-btn {
                    color: #2563eb !important;
                    font-weight: 700 !important;
                }
                #navbar .javbus-top-settings-btn:hover {
                    color: #1d4ed8 !important;
                    background: rgba(37, 99, 235, .08) !important;
                }
            `);
        },
        _insertCopyButton(avid) {
            const infoCol = document.querySelector("div[class='col-md-3 info']");
            if (!infoCol || !avid) return;
            const anchor = [...infoCol.querySelectorAll('p, h3, span')].find(el => {
                return el.textContent.trim().toUpperCase().includes(normalizeAvid(avid));
            });
            insertAvidCopyBtn(anchor || infoCol.querySelector('h3'), avid, null, true);
        },
        _insertMagnet(avid) {
            if (!CFG.magnetTable) return;
            const infoCol = document.querySelector("div[class='col-md-3 info']");
            if (!infoCol) return;
            document.querySelectorAll('.jav-nong-slot').forEach(el => el.remove());
            const widget = Magnet.createMagnetWidget(avid);
            const slot = document.createElement('div');
            slot.className = 'jav-nong-slot';
            slot.style.overflow = 'hidden';
            slot.appendChild(widget);
            infoCol.after(slot);
        },
        _destroyMasonry(container) {
            try {
                const jq = window.jQuery || window.$;
                if (jq && jq(container).masonry) {
                    jq(container).masonry('destroy');
                }
            } catch (err) {  }
        },
        _swapCover(img) {
            const src = img.getAttribute('src') || '';

            if (!/\/(imgs|pics)\/(thumb|thumbs)\//i.test(src)) return;
            if (img.dataset.laosijiCoverSwapped === '1') return;
            let full = src.replace(/\/(imgs|pics)\/(thumb|thumbs)\//i, '/$1/cover/');
            if (!/nopic\.jpg/i.test(src)) {
                full = full.replace(/(\.jpg|\.jpeg|\.png)(?:([?#].*)?)$/i, '_b$1$2');
            }
            if (full === src) return;
            img.dataset.laosijiCoverSwapped = '1';
            img.dataset.laosijiThumbSrc = src;
            img.addEventListener('error', function onErr() {
                img.removeEventListener('error', onErr);
                if (img.dataset.laosijiThumbSrc) img.src = img.dataset.laosijiThumbSrc;
            });
            img.src = full;
            img.setAttribute('src', full);
        },
        _decorateCard(item) {
            if (!item) return;
            if (item.dataset.laosijiGridCard === '1') {
                window.__LAOSIJI_LIST_PREVIEW__?.attach?.(item);
                return;
            }
            item.dataset.laosijiGridCard = '1';
            item.classList.add('jav-card', 'javbus-grid-card');
            item.style.removeProperty('position');
            item.style.removeProperty('top');
            item.style.removeProperty('left');
            item.style.removeProperty('width');

            const anchor = item.querySelector(':scope > a.movie-box[href]') || item.querySelector('a.movie-box[href]');
            anchor?.classList.add('jav-card-link', 'javbus-card-link');

            const frame = item.querySelector('.photo-frame');
            frame?.classList.add('jav-card-cover', 'javbus-cover-frame');

            const img = frame?.querySelector('img[src]') || item.querySelector('img[src]');
            if (img) {
                img.removeAttribute('width');
                img.removeAttribute('height');
                img.classList.add('jav-card-image', 'javbus-card-image');
                this._swapCover(img);
            }

            const info = item.querySelector('.photo-info');
            info?.classList.add('jav-card-title', 'javbus-card-title');
            const infoBody = info?.querySelector(':scope > span') || info;
            if (infoBody && !infoBody.querySelector(':scope > .video-title')) {
                const nodes = Array.from(infoBody.childNodes);
                const titleNodes = [];
                for (const node of nodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const el = node;
                        if (el.matches('br, .item-tag, date, .jav-pan115-badge')) break;
                        titleNodes.push(node);
                        continue;
                    }
                    if (node.nodeType === Node.TEXT_NODE) {
                        if (node.textContent.trim() || titleNodes.length) titleNodes.push(node);
                    }
                }
                if (titleNodes.some(node => (node.textContent || '').trim())) {
                    const headline = document.createElement('span');
                    headline.className = 'video-title javbus-card-headline';
                    infoBody.insertBefore(headline, titleNodes[0]);
                    titleNodes.forEach(node => headline.appendChild(node));
                    while (headline.nextSibling?.nodeType === Node.TEXT_NODE && !headline.nextSibling.textContent.trim()) {
                        headline.nextSibling.remove();
                    }
                    if (headline.nextSibling?.nodeType === Node.ELEMENT_NODE && headline.nextSibling.matches('br')) {
                        headline.nextSibling.remove();
                    }
                }
            }
            const firstDate = info?.querySelector('date');
            if (firstDate && firstDate.dataset.laosijiCode !== '1') {
                firstDate.dataset.laosijiCode = '1';
                firstDate.classList.add('javbus-card-code');
            }
            window.__LAOSIJI_LIST_PREVIEW__?.attach?.(item);
        },
        _flattenWaterfall() {
            document.querySelectorAll('[id="waterfall"]').forEach(wf => {
                wf.querySelectorAll(':scope > #waterfall, :scope > .masonry').forEach(nested => {
                    while (nested.firstChild) wf.insertBefore(nested.firstChild, nested);
                    nested.remove();
                });
                wf.classList.remove('masonry');
                wf.style.setProperty('position', 'static', 'important');
                wf.style.setProperty('height', 'auto', 'important');
                wf.style.setProperty('width', 'auto', 'important');
                wf.querySelectorAll(':scope > .item').forEach(item => {
                    item.style.removeProperty('position');
                    item.style.removeProperty('top');
                    item.style.removeProperty('left');
                    item.style.removeProperty('width');
                });
            });
        },
        _getGridContainer() {
            return document.querySelector('#waterfall.jav-card-grid') ||
                   document.querySelector('#waterfall');
        },
        _initListPage() {
            this._flattenWaterfall();
            const container = this._getGridContainer();
            if (!container) return;
            this._destroyMasonry(container);
            container.classList.remove('masonry');
            container.style.setProperty('position', 'static', 'important');
            container.style.setProperty('height', 'auto', 'important');
            container.style.setProperty('width', 'auto', 'important');

            const needStyle = container.dataset.laosijiGrid !== '1';
            if (needStyle) {
                container.dataset.laosijiGrid = '1';
                container.classList.add('jav-card-grid', 'javbus-card-grid');
            }
            CardColumns.apply('javbus');

            container.querySelectorAll(':scope > .item').forEach(item => this._decorateCard(item));
            if (needStyle) {
                GM_addStyle(`
                    .jav-card-grid {
                        --jav-card-title-size: 15px;
                        --jav-card-title-line-height: 1.5;
                        --jav-card-title-lines: 3;
                        display: grid !important;
                        grid-template-columns: repeat(var(--jav-card-columns, 5), minmax(0, 1fr)) !important;
                        gap: 14px !important;
                        align-items: stretch !important;
                        width: 100% !important;
                        height: auto !important;
                        box-sizing: border-box !important;
                    }
                    .jav-card {
                        position: static !important;
                        float: none !important;
                        display: block !important;
                        width: auto !important;
                        height: 100% !important;
                        max-height: none !important;
                        min-width: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-sizing: border-box !important;
                        text-align: left !important;
                        background: #fff !important;
                        border: 1px solid #e5e7eb !important;
                        border-radius: 6px !important;
                        overflow: hidden !important;
                        box-shadow: 0 1px 4px rgba(15, 23, 42, .08) !important;
                        transform: translateZ(0) !important;
                        transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease !important;
                        will-change: transform !important;
                    }
                    .jav-card:hover {
                        border-color: rgba(37, 99, 235, .35) !important;
                        box-shadow: 0 10px 24px rgba(15, 23, 42, .16) !important;
                        transform: translateY(-4px) scale(1.018) !important;
                        z-index: 2 !important;
                    }
                    .jav-card-link {
                        display: flex !important;
                        flex-direction: column !important;
                        height: 100% !important;
                        max-height: none !important;
                        overflow: hidden !important;
                        color: #2563eb !important;
                        text-decoration: none !important;
                    }
                    .jav-card-link:visited { color: #7c3aed !important; }
                    .jav-card-cover {
                        display: block !important;
                        width: 100% !important;
                        height: auto !important;
                        aspect-ratio: 800 / 538 !important;
                        overflow: hidden !important;
                        background: #f8fafc !important;
                        border-bottom: 1px solid #f1f5f9 !important;
                        margin: 0 !important;
                    }
                    .jav-card-image {
                        display: block !important;
                        width: 100% !important;
                        height: 100% !important;
                        max-height: none !important;
                        object-fit: cover !important;
                        object-position: center center !important;
                        background: #f8fafc !important;
                        border: 0 !important;
                    }
                    .jav-card-title {
                        display: block !important;
                        width: 100% !important;
                        max-width: none !important;
                        height: auto !important;
                        max-height: none !important;
                        box-sizing: border-box !important;
                        flex: 1 1 auto !important;
                        min-height: 0 !important;
                        margin: 0 !important;
                        padding: 7px 8px 9px !important;
                        overflow: visible !important;
                        color: inherit !important;
                        font-size: var(--jav-card-title-size, 15px) !important;
                        line-height: var(--jav-card-title-line-height, 1.5) !important;
                        text-align: left !important;
                        white-space: normal !important;
                        word-break: break-word !important;
                    }
                    .javbus-card-grid {
                        position: static !important;
                        --jav-card-columns: 5;
                        box-sizing: border-box !important;
                    }
                    #waterfall.javbus-card-grid {
                        display: grid !important;
                        grid-template-columns: repeat(var(--jav-card-columns, 5), minmax(0, 1fr)) !important;
                        gap: 14px !important;
                        align-items: stretch !important;
                        min-height: 0 !important;
                    }
                    body .container-fluid {
                        padding-left: 28px !important;
                        padding-right: 28px !important;
                        box-sizing: border-box !important;
                    }
                    #waterfall.javbus-card-grid > .item,
                    .javbus-card-grid .item.javbus-grid-card {
                        position: static !important;
                        width: auto !important;
                        float: none !important;
                        margin: 0 !important;
                        top: auto !important;
                        left: auto !important;
                    }
                    .javbus-card-grid .item .jav-card-link.javbus-card-link {
                        width: 100% !important;
                        min-width: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #fff !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        overflow: hidden !important;
                    }
                    .javbus-card-grid .item .javbus-cover-frame.photo-frame {
                        margin: 0 !important;
                        height: auto !important;
                    }
                    .javbus-card-grid .item .javbus-card-image {
                        height: 100% !important;
                        margin: 0 !important;
                    }
                    .javbus-card-title > span {
                        display: block !important;
                    }
                    .javbus-card-title .video-title {
                        display: -webkit-box !important;
                        -webkit-box-orient: vertical !important;
                        -webkit-line-clamp: var(--jav-card-title-lines, 3) !important;
                        line-clamp: var(--jav-card-title-lines, 3) !important;
                        height: calc(var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 3) * 1em) !important;
                        max-height: calc(var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 3) * 1em) !important;
                        min-height: calc(var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 3) * 1em) !important;
                        overflow: hidden !important;
                        text-overflow: ellipsis !important;
                        white-space: normal !important;
                        word-break: break-word !important;
                        color: inherit !important;
                        font-size: var(--jav-card-title-size, 15px) !important;
                        line-height: var(--jav-card-title-line-height, 1.5) !important;
                        margin-bottom: 6px !important;
                    }
                    .javbus-card-grid .item .javbus-card-title .jav-pan115-badge {
                        display: inline-flex !important;
                        width: auto !important;
                        max-width: max-content !important;
                        float: none !important;
                        vertical-align: middle !important;
                        margin: 0 6px 4px 0 !important;
                    }
                    .javbus-card-title .item-tag {
                        margin: 6px 0 4px !important;
                    }
                    .javbus-card-title date {
                        color: #94a3b8 !important;
                        font-size: 12px !important;
                    }
                    .javbus-card-title date.javbus-card-code {
                        display: inline-block !important;
                        color: inherit !important;
                        font-size: 15px !important;
                        font-weight: 800 !important;
                        margin-top: 2px !important;
                    }
                    @media (max-width: 1100px) {
                        .javbus-card-grid { --jav-card-columns: 4; }
                    }
                    @media (max-width: 820px) {
                        .javbus-card-grid { --jav-card-columns: 3; }
                    }
                    @media (max-width: 560px) {
                        .javbus-card-grid { --jav-card-columns: 2; gap: 10px !important; }
                    }
                `);
            }
            setTimeout(() => {
                window.__LAOSIJI_LIST_PREVIEW__?.sync?.();
                window.__LAOSIJI_RENDER_BUTTONS__?.();
                window.__LAOSIJI_SCHEDULE_PAN115__?.();
            }, 0);
            setTimeout(() => {
                this._flattenWaterfall();
                container.querySelectorAll(':scope > .item').forEach(item => this._decorateCard(item));
                window.__LAOSIJI_LIST_PREVIEW__?.sync?.();
            }, 450);
        },
    };

    const SiteJavDB = {
        match() {
            return location.hostname.includes('javdb');
        },
        getVid() {
            const el = document.querySelector('a.button.is-white.copy-to-clipboard');
            return normalizeAvid(el?.dataset?.clipboardText || '');
        },
        initPage(avid) {
            document.querySelector('.app-desktop-banner')?.remove();
            this._dismissOver18Modal();
            this._insertTopSettingsButton();
            if (!location.pathname.startsWith('/v/')) {
                this._initListPage();
                return;
            }
            this._insertCopyButton(avid);
            this._hideDownloadCorrectionBlock();

            GM_addStyle(`
                .container { max-width: 100% !important; }
                .movie-panel-info { overflow: hidden; word-break: break-word; }
                .movie-panel-info .panel-block { flex-wrap: wrap; }
                .movie-panel-info .value { overflow: hidden; word-break: break-word; }
                .review-buttons > .panel-block:has(a[href="#magnet-links"]),
                .review-buttons > .panel-block:has(a[href*="/corrections/new"]) { display: none !important; }
            `);
            this._ensureDetailLayout();
            this._insertMagnet(avid);
        },
        _hideDownloadCorrectionBlock() {
            document.querySelectorAll('.review-buttons > .panel-block').forEach(block => {
                if (block.querySelector('a[href="#magnet-links"], a[href*="/corrections/new"]')) {
                    block.remove();
                }
            });
        },
        _dismissOver18Modal() {
            if (!this.match()) return;
            const modal = document.querySelector('.modal.is-active.over18-modal');
            if (!modal) return;
            const ok = modal.querySelector('a.button.is-success[href*="/over18?respond=1"]');
            const href = ok?.getAttribute('href') || '';
            if (href && sessionStorage.getItem('javdb_over18_confirming') !== '1') {
                sessionStorage.setItem('javdb_over18_confirming', '1');
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: new URL(href, location.origin).href,
                    onload: () => sessionStorage.removeItem('javdb_over18_confirming'),
                    onerror: () => sessionStorage.removeItem('javdb_over18_confirming'),
                    ontimeout: () => sessionStorage.removeItem('javdb_over18_confirming'),
                });
            }
            modal.remove();
            document.documentElement.classList.remove('is-clipped');
            document.body.classList.remove('is-clipped');
        },
        _initListPage() {
            const list = document.querySelector('.movie-list, .movies, .grid');
            if (!list) return;
            const needStyle = list.dataset.laosijiGrid !== '1';
            const cards = [...list.querySelectorAll(':scope > .item:not([data-laosiji-grid-card="1"])')];
            if (!cards.length && !needStyle) return;

            list.dataset.laosijiGrid = '1';
            list.classList.add('jav-card-grid', 'javdb-card-grid');
            CardColumns.apply('javdb');
            cards.forEach(card => this._decorateCard(card));

            if (needStyle) {
                GM_addStyle(`
                    .jav-card-grid {
                        --jav-card-title-size: 15px;
                        --jav-card-title-line-height: 1.5;
                        --jav-card-title-lines: 3;
                        display: grid !important;
                        grid-template-columns: repeat(var(--jav-card-columns, 5), minmax(0, 1fr)) !important;
                        gap: 14px !important;
                        align-items: stretch !important;
                        width: 100% !important;
                        box-sizing: border-box !important;
                    }
                    .jav-card {
                        float: none !important;
                        display: block !important;
                        width: auto !important;
                        height: 100% !important;
                        max-height: none !important;
                        min-width: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-sizing: border-box !important;
                        text-align: left !important;
                        background: #fff !important;
                        border: 1px solid #e5e7eb !important;
                        border-radius: 6px !important;
                        overflow: hidden !important;
                        box-shadow: 0 1px 4px rgba(15, 23, 42, .08) !important;
                        transform: translateZ(0) !important;
                        transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease !important;
                        will-change: transform !important;
                    }
                    .jav-card:hover {
                        border-color: rgba(37, 99, 235, .35) !important;
                        box-shadow: 0 10px 24px rgba(15, 23, 42, .16) !important;
                        transform: translateY(-4px) scale(1.018) !important;
                        z-index: 2 !important;
                    }
                    .jav-card-link {
                        display: flex !important;
                        flex-direction: column !important;
                        height: 100% !important;
                        max-height: none !important;
                        overflow: hidden !important;
                        color: #2563eb !important;
                        text-decoration: none !important;
                    }
                    .jav-card-link:visited {
                        color: #7c3aed !important;
                    }
                    .jav-card-cover {
                        display: block !important;
                        width: 100% !important;
                        height: auto !important;
                        aspect-ratio: 800 / 538 !important;
                        overflow: hidden !important;
                        background: #f8fafc !important;
                        border-bottom: 1px solid #f1f5f9 !important;
                    }
                    .jav-card-image {
                        display: block !important;
                        width: 100% !important;
                        height: 100% !important;
                        max-height: none !important;
                        object-fit: cover !important;
                        object-position: center center !important;
                        background: #f8fafc !important;
                        border: 0 !important;
                    }
                    .jav-card-title {
                        display: block !important;
                        width: 100% !important;
                        max-width: none !important;
                        height: calc((var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 3) * 1em) + 16px) !important;
                        max-height: calc((var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 3) * 1em) + 16px) !important;
                        box-sizing: border-box !important;
                        flex: 0 0 auto !important;
                        min-height: calc((var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 3) * 1em) + 16px) !important;
                        margin: 0 !important;
                        padding: 7px 8px 9px !important;
                        overflow: hidden !important;
                        color: inherit !important;
                        font-size: var(--jav-card-title-size, 15px) !important;
                        line-height: var(--jav-card-title-line-height, 1.5) !important;
                        text-align: left !important;
                        white-space: normal !important;
                        word-break: break-word !important;
                    }
                    .javdb-card-headline {
                        display: -webkit-box !important;
                        -webkit-box-orient: vertical !important;
                        -webkit-line-clamp: var(--jav-card-title-lines, 3) !important;
                        line-clamp: var(--jav-card-title-lines, 3) !important;
                        max-height: calc(var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 3) * 1em) !important;
                        overflow: hidden !important;
                        text-overflow: ellipsis !important;
                        white-space: normal !important;
                        word-break: break-word !important;
                    }
                    .jav-card-title strong {
                        color: inherit !important;
                        font-size: 16px !important;
                        font-weight: 800 !important;
                    }
                    .javdb-card-grid {
                        --jav-card-columns: 5;
                    }
                    .javdb-card-grid .item.javdb-grid-card {
                        position: static !important;
                        width: auto !important;
                        float: none !important;
                        margin: 0 !important;
                    }
                    .javdb-card-grid .item .javdb-card-link.box {
                        width: 100% !important;
                        min-width: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #fff !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        overflow: hidden !important;
                    }
                    .javdb-card-grid .item .javdb-cover-frame.cover {
                        margin: 0 !important;
                        height: auto !important;
                    }
                    .javdb-card-grid .item .javdb-card-image {
                        height: 100% !important;
                        margin: 0 !important;
                    }
                    .javdb-card-grid .item .javdb-card-title .jav-pan115-badge {
                        display: inline-flex !important;
                        width: auto !important;
                        max-width: max-content !important;
                        float: none !important;
                        vertical-align: middle !important;
                        margin: 0 6px 4px 0 !important;
                    }
                    .javdb-card-score,
                    .javdb-card-meta,
                    .javdb-card-tags {
                        padding-left: 8px !important;
                        padding-right: 8px !important;
                    }
                    .javdb-card-score {
                        margin-top: 2px !important;
                        color: #64748b !important;
                        font-size: 12px !important;
                        line-height: 1.45 !important;
                    }
                    .javdb-card-score .value {
                        color: inherit !important;
                        font-size: inherit !important;
                    }
                    .javdb-card-meta {
                        margin-top: 4px !important;
                        color: #94a3b8 !important;
                        font-size: 12px !important;
                        line-height: 1.45 !important;
                    }
                    .javdb-card-tags {
                        display: flex !important;
                        flex-wrap: wrap !important;
                        gap: 6px !important;
                        margin-top: auto !important;
                        padding-top: 8px !important;
                        padding-bottom: 10px !important;
                    }
                    .javdb-card-tags .tag {
                        margin: 0 !important;
                    }
                    @media (max-width: 1100px) {
                        .javdb-card-grid { --jav-card-columns: 4; }
                    }
                    @media (max-width: 820px) {
                        .javdb-card-grid { --jav-card-columns: 3; }
                    }
                    @media (max-width: 560px) {
                        .javdb-card-grid { --jav-card-columns: 2; gap: 10px !important; }
                    }
                `);
            }
            setTimeout(() => {
                window.__LAOSIJI_LIST_PREVIEW__?.sync?.();
                window.__LAOSIJI_RENDER_BUTTONS__?.();
                window.__LAOSIJI_SCHEDULE_PAN115__?.();
            }, 0);
        },
        _decorateCard(card) {
            if (!card) return;
            if (card.dataset.laosijiGridCard !== '1') {
                card.dataset.laosijiGridCard = '1';
                card.classList.add('jav-card', 'javdb-grid-card');
            }

            const anchor = card.querySelector(':scope > a.box[href], :scope > a[href].box, a.box[href]');
            anchor?.classList.add('jav-card-link', 'javdb-card-link');
            if (anchor && !anchor.querySelector('.jav-pan115-badge')) {
                delete anchor.dataset.pan115Checked;
                delete anchor.dataset.pan115HasBadge;
            }

            const cover = card.querySelector('.cover');
            cover?.classList.add('jav-card-cover', 'javdb-cover-frame');

            const img = cover?.querySelector('img[src]') || card.querySelector('img[src]');
            if (img) {
                img.removeAttribute('width');
                img.removeAttribute('height');
                img.classList.add('jav-card-image', 'javdb-card-image');
            }

            const titleEl = card.querySelector('.video-title');
            titleEl?.classList.add('jav-card-title', 'javdb-card-title');
            if (titleEl && !titleEl.querySelector('.javdb-card-headline')) {
                const headline = document.createElement('span');
                headline.className = 'javdb-card-headline';
                while (titleEl.firstChild) headline.appendChild(titleEl.firstChild);
                titleEl.appendChild(headline);
            }

            const scoreEl = card.querySelector('.score');
            scoreEl?.classList.add('javdb-card-score');

            const metaEl = card.querySelector('.meta');
            metaEl?.classList.add('javdb-card-meta');

            const tagsEl = card.querySelector('.tags');
            tagsEl?.classList.add('javdb-card-tags');
            window.__LAOSIJI_LIST_PREVIEW__?.attach?.(card);
        },
        _insertTopSettingsButton() {
            const navbarEnd = document.querySelector('#navbar-menu-user .navbar-end');
            if (!navbarEnd || navbarEnd.querySelector('.javdb-top-settings-btn')) return;

            const btn = document.createElement('a');
            btn.href = 'javascript:void(0)';
            btn.className = 'navbar-item javdb-top-settings-btn';
            btn.textContent = '\u8001\u53f8\u673a\u8bbe\u7f6e';
            btn.title = '\u6253\u5f00\u8001\u53f8\u673a\u8bbe\u7f6e';
            btn.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                window.__LAOSIJI_OPEN_QUICK_SETTINGS__?.(e.currentTarget);
            });

            const userMenu = navbarEnd.querySelector('a[href="/users/profile"]')?.closest('.navbar-item.has-dropdown');
            navbarEnd.insertBefore(btn, userMenu || null);

            if (document.documentElement.dataset.laosijiJavdbTopSettingsStyle === '1') return;
            document.documentElement.dataset.laosijiJavdbTopSettingsStyle = '1';
            GM_addStyle(`
                #navbar-menu-user .javdb-top-settings-btn {
                    color: #2563eb !important;
                    font-weight: 700 !important;
                }
                #navbar-menu-user .javdb-top-settings-btn:hover {
                    color: #1d4ed8 !important;
                    background: rgba(37, 99, 235, .08) !important;
                }
            `);
        },
        _insertCopyButton(avid) {
            const infoPanel = document.querySelector('.movie-panel-info');
            if (!infoPanel || !avid) return;

            const nativeCopy = infoPanel.querySelector('.copy-to-clipboard, [data-clipboard-text]');
            const anchor = nativeCopy?.closest('.panel-block')?.querySelector('.value')
                || [...infoPanel.querySelectorAll('.panel-block .value')].find(el => {
                    return el.textContent.trim().toUpperCase().includes(normalizeAvid(avid));
                });
            insertAvidCopyBtn(anchor, avid, nativeCopy);
        },
        _ensureDetailLayout() {
            const coverCol  = document.querySelector('.column.column-video-cover');
            const infoPanel = document.querySelector('.movie-panel-info');
            if (!coverCol || !infoPanel) return null;

            const infoCol = infoPanel.closest('.column') || infoPanel;
            const currentContainer = coverCol.closest('.jav-flex-container');
            const parent = currentContainer || coverCol.parentElement;
            if (!parent) return null;

            let flexContainer = currentContainer || parent.querySelector(':scope > .jav-flex-container');
            if (!flexContainer) {
                flexContainer = document.createElement('div');
                flexContainer.className = 'jav-flex-container';
                flexContainer.appendChild(coverCol);
                flexContainer.appendChild(infoCol);
                parent.appendChild(flexContainer);
            } else {
                if (coverCol.parentElement !== flexContainer) flexContainer.insertBefore(coverCol, flexContainer.firstChild);
                if (infoCol.parentElement !== flexContainer) {
                    const magnetSlot = flexContainer.querySelector(':scope > .jav-nong-slot');
                    flexContainer.insertBefore(infoCol, magnetSlot || null);
                }
            }
            flexContainer.style.setProperty('display', 'flex', 'important');
            flexContainer.style.setProperty('gap', '20px', 'important');
            flexContainer.style.setProperty('align-items', 'flex-start', 'important');
            flexContainer.style.setProperty('width', '100%', 'important');
            flexContainer.style.setProperty('margin-top', '16px', 'important');
            flexContainer.style.setProperty('--javdb-cover-flex', flexContainer.style.getPropertyValue('--javdb-cover-flex') || '1.6');
            flexContainer.style.setProperty('--javdb-info-flex', flexContainer.style.getPropertyValue('--javdb-info-flex') || '1.05');
            flexContainer.style.setProperty('--javdb-magnet-flex', flexContainer.style.getPropertyValue('--javdb-magnet-flex') || '1.5');

            coverCol.style.setProperty('flex', 'var(--javdb-cover-flex) 1 0', 'important');
            coverCol.style.setProperty('width', 'auto', 'important');
            coverCol.style.setProperty('max-width', 'none', 'important');
            coverCol.style.setProperty('min-width', '0', 'important');
            infoCol.style.setProperty('flex', 'var(--javdb-info-flex) 1 0', 'important');
            infoCol.style.setProperty('width', 'auto', 'important');
            infoCol.style.setProperty('max-width', 'none', 'important');
            infoCol.style.setProperty('min-width', '0', 'important');
            infoCol.style.setProperty('overflow', 'hidden', 'important');
            infoCol.style.setProperty('word-break', 'break-word', 'important');
            infoPanel.style.setProperty('width', '100%', 'important');
            infoPanel.style.setProperty('max-width', '100%', 'important');
            infoPanel.style.setProperty('box-sizing', 'border-box', 'important');

            const coverBox = coverCol.querySelector('.cover, .box');
            if (coverBox) {
                coverBox.style.setProperty('width', '100%', 'important');
                coverBox.style.setProperty('max-width', '100%', 'important');
                coverBox.style.setProperty('box-sizing', 'border-box', 'important');
            }
            const coverImg = coverCol.querySelector('img');
            if (coverImg) {
                coverImg.style.setProperty('width', '100%', 'important');
                coverImg.style.setProperty('height', 'auto', 'important');
                coverImg.style.setProperty('max-width', '100%', 'important');
            }
            return flexContainer;
        },
        _insertMagnet(avid) {
            if (!CFG.magnetTable) return;
            document.querySelectorAll('.jav-nong-slot').forEach(el => el.remove());
            const flexContainer = this._ensureDetailLayout();
            if (!flexContainer) return;

            const slot = document.createElement('div');
            slot.className = 'jav-nong-slot';
            slot.style.setProperty('flex', 'var(--javdb-magnet-flex) 1 0', 'important');
            slot.style.setProperty('min-width', '0', 'important');
            slot.style.setProperty('align-self', 'flex-start', 'important');
            slot.style.setProperty('overflow', 'hidden', 'important');
            const widget = Magnet.createMagnetWidget(avid);
            slot.appendChild(widget);
            flexContainer.appendChild(slot);
        },
    };

    const SiteJavLib = {
        match() {
            return /(javlibrary|javlib|r86m|s87n)/i.test(location.hostname);
        },
        isDetailPage() {
            return !!document.querySelector('#video_id .text') &&
                   !!document.querySelector('meta[name="keywords"]');
        },
        isHomePage() {
            return document.body?.classList.contains('main') &&
                   !this.isDetailPage() &&
                   !!document.querySelector('#rightcolumn > .videothumblist .videos');
        },
        getVid() {
            const el = document.querySelector('#video_id .text');
            if (el?.textContent?.trim()) return normalizeAvid(el.textContent.trim());
            const m = document.title.match(/([A-Z0-9]+-\d+)/i);
            return m ? m[1].toUpperCase() : '';
        },
        initPage(avid) {
            this._insertTopSettingsButton();
            if (!this.isDetailPage()) {
                this._initListPage();
                if (this.isHomePage()) this._initHomePage();
                return;
            }
            if (!avid) return;

            document.querySelector('.socialmedia')?.remove();
            this._insertCopyButton(avid);

            GM_addStyle(`
                #leftmenu { display: none; }
                #rightcolumn { margin: 0 !important; width: 100% !important; float: none !important; }
                #content { padding-top: 0; width: 100%; margin: 0 !important; }
                #video_jacket img { max-width: 100%; height: auto; }
                #video_info { text-align: left; font: 14px Arial; overflow: hidden; word-break: break-word; margin: 0 !important; width: 100% !important; float: none !important; }
                #video_info .item,
                #video_info table,
                #video_info tr,
                #video_info td,
                #video_info .header,
                #video_info .text {
                    text-align: left !important;
                }
                #video_info table {
                    margin-left: 0 !important;
                    margin-right: auto !important;
                }
                #video_info .jav-jump-btn-group {
                    justify-content: flex-start !important;
                }
                #video_reviews,
                #video_comments,
                #video_review_edit,
                #video_comment_edit {
                    width: 100% !important;
                    max-width: 100% !important;
                    box-sizing: border-box !important;
                    overflow-x: hidden !important;
                }
                #video_reviews .comment,
                #video_comments .comment {
                    width: 100% !important;
                    max-width: 100% !important;
                    table-layout: fixed !important;
                    box-sizing: border-box !important;
                }
                #video_reviews .comment td,
                #video_comments .comment td {
                    box-sizing: border-box !important;
                    vertical-align: top !important;
                }
                #video_reviews .comment td.info,
                #video_comments .comment td.info {
                    width: 132px !important;
                }
                #video_reviews .comment td.scores,
                #video_comments .comment td.scores {
                    width: 92px !important;
                }
                #video_reviews .comment td.t,
                #video_comments .comment td.t {
                    width: auto !important;
                    min-width: 0 !important;
                    overflow: hidden !important;
                }
                #video_reviews .comment td.t .text,
                #video_comments .comment td.t .text,
                #video_reviews .comment td.t textarea,
                #video_comments .comment td.t textarea {
                    width: auto !important;
                    max-width: 100% !important;
                    box-sizing: border-box !important;
                    white-space: normal !important;
                    word-break: break-word !important;
                    overflow-wrap: anywhere !important;
                }
                .jav-nong-slot .jav-nong-wrapper { width: 560px; max-width: 100%; margin-top: 16px; }
            `);

            this._ensureDetailLayout();
            this._insertMagnet(avid);
        },
        _initListPage() {
            const list = document.querySelector('.videothumblist .videos');
            if (!list) return;
            const needStyle = list.dataset.laosijiGrid !== '1';
            const cards = [...list.querySelectorAll(':scope > .video:not([data-laosiji-grid-card="1"])')];
            if (!cards.length && !needStyle) return;

            list.dataset.laosijiGrid = '1';
            list.classList.add('jav-card-grid', 'javlib-card-grid');
            CardColumns.apply('javlib');
            cards.forEach(card => {
                card.dataset.laosijiGridCard = '1';
                card.classList.add('jav-card', 'javlib-grid-card');
                const anchor = card.querySelector(':scope > a[href]:not(.emby-javlibrary-list-badge)');
                anchor?.classList.add('jav-card-link', 'javlib-card-link');
                if (anchor && !anchor.querySelector('.jav-pan115-badge')) {
                    delete anchor.dataset.pan115Checked;
                    delete anchor.dataset.pan115HasBadge;
                }
                const idEl = card.querySelector('.id');
                const titleEl = card.querySelector('.title');
                titleEl?.classList.add('jav-card-title', 'javlib-card-title');
                if (idEl && titleEl && !titleEl.querySelector('.javlib-card-headline')) {
                    const code = idEl.textContent.trim();
                    const titleText = titleEl.textContent.trim();
                    titleEl.textContent = '';
                    const headline = document.createElement('span');
                    headline.className = 'javlib-card-headline';
                    const strong = document.createElement('strong');
                    strong.className = 'javlib-card-code';
                    strong.textContent = code;
                    headline.appendChild(strong);
                    headline.appendChild(document.createTextNode(` ${titleText}`));
                    titleEl.appendChild(headline);
                    titleEl.dataset.laosijiCodeMerged = '1';
                }
                const img = card.querySelector('img[src]');
                if (!img) return;
                const src = img.getAttribute('src') || '';
                const fullSrc = src.replace(/ps\.jpg(?:([?#].*)?)$/i, 'pl.jpg$1');
                if (fullSrc !== src) {
                    img.src = fullSrc;
                    img.setAttribute('src', fullSrc);
                }
                img.removeAttribute('width');
                img.removeAttribute('height');
                img.classList.add('jav-card-image', 'javlib-card-image');
                if (!img.closest('.javlib-cover-frame')) {
                    const frame = document.createElement('div');
                    frame.className = 'jav-card-cover javlib-cover-frame';
                    img.parentNode.insertBefore(frame, img);
                    frame.appendChild(img);
                } else {
                    img.closest('.javlib-cover-frame')?.classList.add('jav-card-cover');
                }
            });

            if (needStyle) {
                GM_addStyle(`
                    .jav-card-grid {
                        --jav-card-title-size: 15px;
                        --jav-card-title-line-height: 1.5;
                        --jav-card-title-lines: 3;
                        display: grid !important;
                        grid-template-columns: repeat(var(--jav-card-columns, 5), minmax(0, 1fr)) !important;
                        gap: 14px !important;
                        align-items: stretch !important;
                        width: 100% !important;
                        box-sizing: border-box !important;
                    }
                    .jav-card {
                        float: none !important;
                        display: block !important;
                        width: auto !important;
                        height: 100% !important;
                        max-height: none !important;
                        min-width: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-sizing: border-box !important;
                        text-align: left !important;
                        background: #fff !important;
                        border: 1px solid #e5e7eb !important;
                        border-radius: 6px !important;
                        overflow: hidden !important;
                        box-shadow: 0 1px 4px rgba(15, 23, 42, .08) !important;
                        transform: translateZ(0) !important;
                        transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease !important;
                        will-change: transform !important;
                    }
                    .jav-card:hover {
                        border-color: rgba(37, 99, 235, .35) !important;
                        box-shadow: 0 10px 24px rgba(15, 23, 42, .16) !important;
                        transform: translateY(-4px) scale(1.018) !important;
                        z-index: 2 !important;
                    }
                    .jav-card-link {
                        display: flex !important;
                        flex-direction: column !important;
                        height: 100% !important;
                        max-height: none !important;
                        overflow: hidden !important;
                        color: #2563eb !important;
                        text-decoration: none !important;
                    }
                    .jav-card-link:visited {
                        color: #7c3aed !important;
                    }
                    .jav-card-cover {
                        display: block !important;
                        width: 100% !important;
                        height: auto !important;
                        aspect-ratio: 800 / 538 !important;
                        overflow: hidden !important;
                        background: #f8fafc !important;
                        border-bottom: 1px solid #f1f5f9 !important;
                    }
                    .jav-card-image {
                        display: block !important;
                        width: 100% !important;
                        height: 100% !important;
                        max-height: none !important;
                        object-fit: cover !important;
                        object-position: center center !important;
                        background: #f8fafc !important;
                        border: 0 !important;
                    }
                    .jav-card-title {
                        display: block !important;
                        width: 100% !important;
                        max-width: none !important;
                        height: calc((var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 3) * 1em) + 16px) !important;
                        max-height: calc((var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 3) * 1em) + 16px) !important;
                        box-sizing: border-box !important;
                        flex: 1 1 auto !important;
                        min-height: calc((var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 3) * 1em) + 16px) !important;
                        margin: 0 !important;
                        padding: 7px 8px 9px !important;
                        overflow: hidden !important;
                        text-overflow: ellipsis !important;
                        color: inherit !important;
                        font-size: var(--jav-card-title-size, 15px) !important;
                        line-height: var(--jav-card-title-line-height, 1.5) !important;
                        text-align: left !important;
                        white-space: normal !important;
                        word-break: break-word !important;
                    }
                    .javlib-card-headline {
                        display: -webkit-box !important;
                        -webkit-box-orient: vertical !important;
                        -webkit-line-clamp: var(--jav-card-title-lines, 3) !important;
                        line-clamp: var(--jav-card-title-lines, 3) !important;
                        max-height: calc(var(--jav-card-title-line-height, 1.5) * var(--jav-card-title-lines, 3) * 1em) !important;
                        overflow: hidden !important;
                        text-overflow: ellipsis !important;
                        white-space: normal !important;
                        word-break: break-word !important;
                    }
                    .jav-card-title strong {
                        color: inherit !important;
                        font-size: 16px !important;
                        font-weight: 800 !important;
                    }
                    .videothumblist { width: 100% !important; }
                    .videothumblist .videos.javlib-card-grid {
                        --jav-card-columns: 5;
                    }
                    .videothumblist .video.javlib-grid-card .id {
                        display: none !important;
                    }
                    .videothumblist .video.javlib-grid-card .toolbar {
                        display: none !important;
                    }
                    @media (max-width: 1100px) {
                        .videothumblist .videos.javlib-card-grid { --jav-card-columns: 4; }
                    }
                    @media (max-width: 820px) {
                        .videothumblist .videos.javlib-card-grid { --jav-card-columns: 3; }
                    }
                    @media (max-width: 560px) {
                        .videothumblist .videos.javlib-card-grid { --jav-card-columns: 2; gap: 10px !important; }
                    }
                `);
            }
            setTimeout(() => {
                window.__LAOSIJI_LIST_PREVIEW__?.sync?.();
                window.__LAOSIJI_SCHEDULE_PAN115__?.();
            }, 0);
        },
        _initHomePage() {
            if (document.body.dataset.laosijiJavlibHome === '1') return;
            document.body.dataset.laosijiJavlibHome = '1';
            document.body.classList.add('javlib-home-page');

            const rightColumn = document.querySelector('#rightcolumn');
            rightColumn?.querySelectorAll(':scope > .titlebox, :scope > table.about').forEach(el => {
                el.style.setProperty('display', 'none', 'important');
            });

            GM_addStyle(`
                body.javlib-home-page #rightcolumn > .videothumblist {
                    height: auto !important;
                    max-height: none !important;
                    overflow: visible !important;
                }
            `);
        },
        _insertTopSettingsButton() {
            const menu = document.querySelector('#topmenu .menutext, .menutext');
            if (!menu || menu.querySelector('.javlib-top-settings-btn')) return;

            const btn = document.createElement('a');
            btn.href = 'javascript:void(0)';
            btn.className = 'javlib-top-settings-btn';
            btn.textContent = '\u8001\u53f8\u673a\u8bbe\u7f6e';
            btn.title = '\u6253\u5f00\u8001\u53f8\u673a\u8bbe\u7f6e';
            btn.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                window.__LAOSIJI_OPEN_QUICK_SETTINGS__?.(e.currentTarget);
            });

            const accountLink = menu.querySelector('a[href*="myaccount.php"]');
            const sep = document.createTextNode(' | ');
            if (accountLink) {
                accountLink.after(sep, btn);
            } else {
                menu.append(sep, btn);
            }

            if (document.documentElement.dataset.laosijiJavlibTopSettingsStyle === '1') return;
            document.documentElement.dataset.laosijiJavlibTopSettingsStyle = '1';
            GM_addStyle(`
                #topmenu .menutext .javlib-top-settings-btn,
                .menutext .javlib-top-settings-btn {
                    color: #2563eb !important;
                    font-weight: 700 !important;
                    text-decoration: none !important;
                }
                #topmenu .menutext .javlib-top-settings-btn:hover,
                .menutext .javlib-top-settings-btn:hover {
                    color: #1d4ed8 !important;
                    text-decoration: underline !important;
                }
            `);
        },
        _insertCopyButton(avid) {
            const codeEl = document.querySelector('#video_id .text');
            insertAvidCopyBtn(codeEl, avid);
        },
        _ensureDetailLayout() {
            const table = document.getElementById('video_jacket_info');
            if (!table) return null;
            const row = table.querySelector('tr');
            if (!row) return null;

            table.style.setProperty('width', '100%', 'important');
            table.style.setProperty('display', 'block', 'important');
            row.style.setProperty('display', 'flex', 'important');
            row.style.setProperty('gap', '20px', 'important');
            row.style.setProperty('align-items', 'flex-start', 'important');
            row.style.setProperty('width', '100%', 'important');
            row.style.setProperty('--javlib-cover-flex', row.style.getPropertyValue('--javlib-cover-flex') || '1');
            row.style.setProperty('--javlib-info-flex', row.style.getPropertyValue('--javlib-info-flex') || '0.85');
            row.style.setProperty('--javlib-magnet-flex', row.style.getPropertyValue('--javlib-magnet-flex') || '1');

            const tds = row.querySelectorAll('td');
            if (tds[0]) {
                tds[0].style.setProperty('flex', 'var(--javlib-cover-flex) 1 0', 'important');
                tds[0].style.setProperty('min-width', '0', 'important');
                tds[0].style.setProperty('vertical-align', 'top', 'important');
            }
            if (tds[1]) {
                tds[1].style.setProperty('flex', 'var(--javlib-info-flex) 1 0', 'important');
                tds[1].style.setProperty('min-width', '0', 'important');
                tds[1].style.setProperty('vertical-align', 'top', 'important');
                tds[1].style.setProperty('overflow', 'hidden', 'important');
                tds[1].style.setProperty('word-break', 'break-word', 'important');
            }

            const jacketImg = document.getElementById('video_jacket_img');
            if (jacketImg) {
                jacketImg.removeAttribute('width');
                jacketImg.removeAttribute('height');
                jacketImg.style.setProperty('width', '100%', 'important');
                jacketImg.style.setProperty('height', 'auto', 'important');
                jacketImg.style.setProperty('max-width', '100%', 'important');
            }
            return row;
        },
        _insertMagnet(avid) {
            if (!CFG.magnetTable) return;
            document.querySelectorAll('.jav-nong-slot').forEach(el => el.remove());
            const row = this._ensureDetailLayout();
            if (!row) return;

            const magnetTd = document.createElement('td');
            magnetTd.className = 'jav-nong-slot';
            magnetTd.style.cssText = 'flex:var(--javlib-magnet-flex) 1 0;min-width:0;vertical-align:top;align-self:flex-start;';

            const innerWrap = document.createElement('div');
            innerWrap.style.cssText = 'display:inline-block;';

            const widget = Magnet.createMagnetWidget(avid);
            innerWrap.appendChild(widget);
            magnetTd.appendChild(innerWrap);
            row.appendChild(magnetTd);
        },
    };

    const SITES = [SiteJavBus, SiteJavDB, SiteJavLib];
    window.__LAOSIJI_SITE_JAVBUS__ = SiteJavBus;
    window.__LAOSIJI_SITE_JAVDB__ = SiteJavDB;

    if (SiteJavDB.match()) {
        SiteJavDB._dismissOver18Modal();
        SiteJavDB._hideDownloadCorrectionBlock();
        const javdbOver18Observer = new MutationObserver(() => {
            SiteJavDB._dismissOver18Modal();
            SiteJavDB._hideDownloadCorrectionBlock();
        });
        javdbOver18Observer.observe(document.documentElement, { childList: true, subtree: true });
        window.addEventListener('popstate', () => setTimeout(() => {
            SiteJavDB._dismissOver18Modal();
            SiteJavDB._hideDownloadCorrectionBlock();
        }, 0));
        window.addEventListener('hashchange', () => setTimeout(() => {
            SiteJavDB._dismissOver18Modal();
            SiteJavDB._hideDownloadCorrectionBlock();
        }, 0));
    }

    function mainRun() {
        const site = SITES.find(s => s.match());
        if (!site) return;

        const avid = site.getVid();
        log('匹配站点:', site.constructor?.name || '未知', '| 番号:', avid);

        site.initPage(avid);
        PageZoom.applyCurrent();
        DetailFlex.apply();
    }

    if (location.hostname.includes('javdb') && location.pathname.startsWith('/v/')) {
        setTimeout(mainRun, 600);
    } else {
        mainRun();
    }

})();


(function() {
    'use strict';

    const VIDEO_ENGINES = window.__LAOSIJI_VIDEO_ENGINES__ || [
        { key: 'missav', label: 'MissAV', host: /missav\.(com|ai|ws)/i, color: '#ec4899' },
        { key: 'jable',  label: 'Jable',  host: /jable\.tv/i, color: '#f97316' },
        { key: '123av',  label: '123AV',  host: /123av\.com/i, color: '#10b981' },
        { key: 'javday', label: 'JavDay', host: /javday\.app/i, color: '#0ea5e9' },
        { key: 'supjav', label: 'SupJav', host: /supjav\.com/i, color: '#ef4444' },
        { key: 'javrate', label: 'JavRate', host: /javrate\.com/i, color: '#8b5cf6' },
    ];

    GM_addStyle(`
        .preview-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.85);
            z-index: 2147483647;
            display: flex;
            overflow: auto;
            cursor: zoom-out;
            backdrop-filter: blur(5px);
        }
        .preview-img {
            border-radius: 4px;
            margin: auto;
            cursor: zoom-in;
            max-width: 95vw;
            max-height: 95vh;
            object-fit: contain;
            display: block;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        }
        .preview-img.zoomed {
            max-width: none;
            max-height: none;
            cursor: zoom-out;
        }
        a:focus:not(:focus-visible),
        button:focus:not(:focus-visible),
        [role="button"]:focus:not(:focus-visible),
        input[type="button"]:focus:not(:focus-visible),
        input[type="submit"]:focus:not(:focus-visible) {
            outline: none !important;
        }

        .jav-jump-btn-group {
            margin-top: 8px;
            margin-bottom: 4px;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
        }


        .emby-fix {
            width: 100% !important;
            flex-basis: 100% !important;
            clear: both !important;
            margin-top: 8px !important;
            margin-bottom: 4px !important;
        }

        .mini-switch {
            width: 40px;
            height: 20px;
            appearance: none;
            background: #e0e0e0;
            border-radius: 20px;
            position: relative;
            cursor: pointer;
            outline: none;
            transition: background 0.2s;
        }
        .mini-switch:checked {
            background: #4CAF50;
        }
        .mini-switch::before {
            content: '';
            position: absolute;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: white;
            top: 2px;
            left: 2px;
            transition: left 0.2s;
        }
        .mini-switch:checked::before {
            left: calc(100% - 18px);
        }

        @keyframes btnSlideIn {
            from {
                opacity: 0;
                transform: translateX(-10px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .jav-jump-btn-group a {
            transition: background .16s ease, border-color .16s ease, box-shadow .16s ease, transform .16s ease;
            animation: btnSlideIn 0.3s ease-out;
        }

        .jav-jump-btn-group a:hover {
            background: var(--jav-btn-hover-bg, #f8fafc) !important;
            transform: translateY(-1px) !important;
            filter: none !important;
            box-shadow: 0 5px 14px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.76) !important;
            text-decoration: none !important;
        }

        @keyframes menuFadeIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .search-menu {
            position: relative;
            display: inline-block;
            border-radius: 4px;
        }
        .search-main-btn {
            padding-right: 28px !important;
        }
        .search-toggle-btn {
            position: absolute;
            right: 4px;
            top: 50%;
            transform: translateY(-50%);
            width: 16px;
            height: 16px;
            padding: 0 !important;
            margin: 0 !important;
            display: inline-flex !important;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-size: 10px !important;
            line-height: 1;
            opacity: 1;
            background: color-mix(in srgb, var(--jav-btn-accent, #64748b) 18%, #ffffff) !important;
            color: inherit !important;
            border: 1px solid color-mix(in srgb, var(--jav-btn-accent, #64748b) 26%, #ffffff) !important;
            border-radius: 999px !important;
            box-shadow: 0 1px 2px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.7) !important;
            cursor: pointer;
        }
        .search-toggle-btn:hover { filter: none; background: color-mix(in srgb, var(--jav-btn-accent, #64748b) 26%, #ffffff) !important; }
        .search-toggle-btn .search-arrow { display: inline-block; transform: translateY(-1px); pointer-events: none; }
        .search-submenu {
            position: absolute;
            top: calc(100% + 4px);
            left: 0;
            display: none;
            flex-direction: column;
            gap: 4px;
            padding: 4px;
            background: rgba(255,255,255,0.95);
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            min-width: 120px;
            backdrop-filter: blur(5px);
        }
        .search-submenu.is-open { display: flex; }
        .search-submenu a { transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important; }
        .search-submenu a:hover { transform: translateX(5px) scale(1.02); filter: brightness(1.1); }
        .jav-pan115-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 58px;
            height: 22px !important;
            padding: 0 7px;
            margin-right: 6px;
            position: static !important;
            top: auto !important;
            transform: none !important;
            border-radius: 6px;
            background: #bbf7d0;
            border: 1px solid #22c55e;
            color: #065f46;
            font-size: 12px !important;
            font-weight: 800;
            line-height: 22px !important;
            text-decoration: none;
            box-sizing: border-box;
            vertical-align: middle;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.72);
        }
        .jav-pan115-badge:hover {
            background: #86efac;
            color: #064e3b;
            text-decoration: none;
            box-shadow: 0 4px 12px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.76);
        }
        span.jav-pan115-badge {
            cursor: pointer;
        }
        .jav-infinite-sentinel {
            width: 100%;
            padding: 14px 0;
            color: #64748b;
            font-size: 13px;
            font-weight: 700;
            text-align: center;
            clear: both;
        }
        .jav-infinite-sentinel.is-loading { color: #2563eb; }
        .jav-infinite-sentinel.is-done { color: #94a3b8; }
        .jav-infinite-sentinel.is-error { color: #dc2626; cursor: pointer; }

        .preview-toolbar {
            position: fixed;
            top: 20px;
            right: 20px;
            display: flex;
            gap: 8px;
            z-index: 2147483648;
            background: rgba(30, 30, 30, 0.75);
            backdrop-filter: blur(10px);
            padding: 6px 12px;
            border-radius: 30px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
        }

        .preview-btn {
            border: none;
            color: #eee;
            font-size: 13px;
            font-weight: 450;
            cursor: pointer;
            padding: 6px 14px;
            border-radius: 24px;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(100, 100, 120, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            letter-spacing: 0.2px;
        }

        .preview-btn:hover {
            background: rgba(140, 140, 160, 0.4);
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
        }

        .preview-btn.javfree.active {
            background: #2ecc71;
            color: white;
            border-color: rgba(255, 255, 255, 0.3);
            box-shadow: 0 0 16px rgba(46, 204, 113, 0.6);
            font-weight: 500;
        }

        .preview-btn.javstore.active {
            background: #e74c3c;
            color: white;
            border-color: rgba(255, 255, 255, 0.3);
            box-shadow: 0 0 16px rgba(231, 76, 60, 0.6);
            font-weight: 500;
        }

        .preview-btn.action {
            background: rgba(100, 100, 120, 0.3);
        }
        .preview-btn.action:hover {
            background: rgba(140, 140, 160, 0.5);
        }

        .preview-btn:active {
            transform: translateY(0);
            box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        }

        .trailer-overlay {
            position: fixed;
            inset: 0;
            z-index: 2147483647;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 34px;
            background:
                radial-gradient(circle at 50% 18%, rgba(56, 189, 248, 0.16), transparent 32%),
                linear-gradient(180deg, rgba(5, 7, 12, 0.88), rgba(0, 0, 0, 0.96));
            backdrop-filter: blur(16px) saturate(0.85);
            cursor: default;
        }
        .trailer-modal {
            width: min(1120px, 94vw);
            max-height: 92vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            color: #f8fafc;
            background: #05070c;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 8px;
            box-shadow:
                0 30px 80px rgba(0, 0, 0, 0.68),
                0 0 0 1px rgba(255, 255, 255, 0.04) inset;
            cursor: default;
            animation: trailerFadeIn .18s ease-out;
        }
        @keyframes trailerFadeIn {
            from { opacity: 0; transform: translateY(14px) scale(.985); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .trailer-header {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            z-index: 4;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 16px 18px 34px;
            background: linear-gradient(180deg, rgba(0, 0, 0, 0.66), rgba(0, 0, 0, 0));
            border: 0;
            pointer-events: none;
            opacity: 1;
            transition: opacity .18s ease, transform .18s ease;
        }
        .trailer-title {
            min-width: 0;
            display: flex;
            align-items: center;
            gap: 10px;
            font: 700 15px/1.3 Arial, "Microsoft YaHei", sans-serif;
            pointer-events: auto;
        }
        .trailer-code {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            letter-spacing: .4px;
        }
        .trailer-source {
            flex-shrink: 0;
            padding: 3px 9px;
            border-radius: 999px;
            color: rgba(255, 255, 255, 0.82);
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.18);
            font-size: 12px;
            font-weight: 500;
            backdrop-filter: blur(12px);
        }
        .jav-player-close {
            width: 34px;
            height: 34px;
            border: 0;
            border-radius: 50%;
            color: #fff;
            background: rgba(255, 255, 255, 0.14);
            cursor: pointer;
            font-size: 18px;
            line-height: 34px;
            pointer-events: auto;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.22);
            transition: transform .15s ease, background .15s ease, box-shadow .15s ease;
        }
        .jav-player-close:hover {
            transform: scale(1.08);
            background: rgba(248, 113, 113, 0.34);
            box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
        }
        .trailer-screen {
            position: relative;
            aspect-ratio: 16 / 9;
            width: 100%;
            max-height: 82vh;
            overflow: hidden;
            background:
                radial-gradient(circle at center, rgba(31, 41, 55, .75), #000 62%),
                #000;
        }
        .trailer-screen:fullscreen {
            width: 100vw;
            height: 100vh;
            max-height: none;
            aspect-ratio: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000;
        }
        .trailer-screen:-webkit-full-screen {
            width: 100vw;
            height: 100vh;
            max-height: none;
            aspect-ratio: auto;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000;
        }
        .trailer-screen::before {
            content: "";
            position: absolute;
            inset: 0;
            z-index: 1;
            pointer-events: none;
            background:
                linear-gradient(180deg, rgba(0, 0, 0, 0.52), rgba(0, 0, 0, 0) 30%),
                linear-gradient(0deg, rgba(0, 0, 0, 0.62), rgba(0, 0, 0, 0) 36%);
        }
        .trailer-screen video,
        .trailer-screen iframe {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            display: block;
            border: 0;
            background: #000;
            object-fit: contain;
        }
        .trailer-volume-indicator {
            position: absolute;
            top: 62px;
            right: 26px;
            z-index: 5;
            color: #f8fafc;
            font: 750 24px/1 Arial, "Microsoft YaHei", sans-serif;
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.82);
            opacity: 0;
            pointer-events: none;
            transition: opacity .14s ease;
        }
        .trailer-volume-indicator.is-visible {
            opacity: 1;
        }
        .trailer-quality-bar {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 0;
            background: transparent;
            border: none;
            border-radius: 0;
            backdrop-filter: none;
        }
        .trailer-quality-select {
            min-width: 78px;
            max-width: 140px;
            height: 30px;
            padding: 0 10px;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.16);
            background: rgba(255, 255, 255, 0.12);
            color: #f8fafc;
            outline: none;
            font-size: 12px;
            line-height: 28px;
            text-align: center;
            text-align-last: center;
            appearance: none;
            cursor: pointer;
        }
        .trailer-quality-select option {
            background: #0b1020;
            color: #f8fafc;
        }
        .trailer-footer {
            position: absolute;
            left: 16px;
            right: 16px;
            bottom: 16px;
            z-index: 4;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 9px 10px;
            color: rgba(255, 255, 255, 0.78);
            background: rgba(10, 14, 22, 0.62);
            border: 1px solid rgba(255, 255, 255, 0.16);
            border-radius: 8px;
            box-shadow: 0 18px 40px rgba(0, 0, 0, 0.32);
            backdrop-filter: blur(16px) saturate(1.08);
            font: 12px/1.4 Arial, "Microsoft YaHei", sans-serif;
            opacity: 1;
            transform: translateY(0);
            transition: opacity .18s ease, transform .18s ease;
        }
        .trailer-screen.is-controls-hidden {
            cursor: none;
        }
        .trailer-screen.is-controls-hidden .trailer-header {
            opacity: 0;
            transform: translateY(-8px);
            pointer-events: none;
        }
        .trailer-screen.is-controls-hidden .trailer-footer {
            opacity: 0;
            transform: translateY(10px);
            pointer-events: none;
        }
        .trailer-control-left,
        .trailer-control-right {
            display: flex;
            align-items: center;
            gap: 9px;
            min-width: 0;
        }
        .trailer-control-left {
            flex: 1 1 auto;
        }
        .trailer-control-right {
            flex: 0 0 auto;
        }
        .trailer-control-btn {
            width: 30px;
            height: 30px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 auto;
            padding: 0;
            border: 0;
            border-radius: 999px;
            color: #fff;
            background: rgba(255, 255, 255, 0.14);
            cursor: pointer;
            font: 700 13px/1 Arial, "Microsoft YaHei", sans-serif;
            transition: background .15s ease, transform .15s ease;
        }
        .trailer-control-btn:hover {
            background: rgba(255, 255, 255, 0.24);
            transform: translateY(-1px);
        }
        .trailer-volume-wrap {
            position: relative;
            display: inline-flex;
            flex: 0 0 auto;
            align-items: center;
            justify-content: center;
        }
        .trailer-volume-wrap::before {
            content: "";
            position: absolute;
            left: 50%;
            bottom: 100%;
            width: 46px;
            height: 14px;
            transform: translateX(-50%);
        }
        .trailer-volume-popover {
            position: absolute;
            left: 50%;
            bottom: calc(100% + 8px);
            width: 34px;
            height: 118px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px 0;
            border-radius: 999px;
            background: rgba(10, 14, 22, 0.76);
            border: 1px solid rgba(255, 255, 255, 0.16);
            box-shadow: 0 14px 32px rgba(0, 0, 0, 0.34);
            backdrop-filter: blur(16px) saturate(1.08);
            opacity: 0;
            pointer-events: none;
            transform: translate(-50%, 6px);
            transition: opacity .15s ease, transform .15s ease;
        }
        .trailer-volume-wrap:hover .trailer-volume-popover {
            opacity: 1;
            pointer-events: auto;
            transform: translate(-50%, 0);
        }
        .trailer-volume-rail {
            position: absolute;
            left: 50%;
            top: 14px;
            bottom: 14px;
            width: 4px;
            transform: translateX(-50%);
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.32);
            pointer-events: none;
        }
        .trailer-volume-fill {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: var(--volume-percent, 35%);
            border-radius: 999px;
            background: #38bdf8;
        }
        .trailer-volume-thumb {
            position: absolute;
            left: 50%;
            bottom: var(--volume-percent, 35%);
            width: 16px;
            height: 16px;
            transform: translate(-50%, 50%);
            border-radius: 50%;
            background: #38bdf8;
            border: 2px solid rgba(255, 255, 255, 0.92);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.38);
        }
        .trailer-volume-slider {
            position: absolute;
            top: 8px;
            bottom: 8px;
            left: 50%;
            width: 16px;
            height: calc(100% - 16px);
            margin: 0;
            transform: translateX(-50%);
            appearance: none;
            -webkit-appearance: none;
            writing-mode: vertical-lr;
            direction: rtl;
            background: transparent;
            cursor: pointer;
        }
        .trailer-volume-slider::-webkit-slider-runnable-track {
            width: 100%;
            height: 100%;
            background: transparent;
        }
        .trailer-volume-slider::-moz-range-track {
            width: 100%;
            height: 100%;
            background: transparent;
        }
        .trailer-volume-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 24px;
            height: 16px;
            background: transparent;
            border: 0;
            box-shadow: none;
        }
        .trailer-volume-slider::-moz-range-thumb {
            width: 24px;
            height: 16px;
            background: transparent;
            border: 0;
            box-shadow: none;
        }
        .trailer-time {
            flex: 0 0 auto;
            min-width: 36px;
            color: rgba(255, 255, 255, 0.78);
            font: 11px/1.3 Arial, "Microsoft YaHei", sans-serif;
            white-space: nowrap;
            text-align: center;
        }
        .trailer-progress {
            flex: 1 1 160px;
            min-width: 120px;
            height: 4px;
            margin: 0;
            border-radius: 999px;
            accent-color: #38bdf8;
            cursor: pointer;
        }
        .jav-jump-toast {
            position: fixed;
            left: 50%;
            top: 72px;
            z-index: 2147483647;
            display: flex;
            align-items: flex-start;
            gap: 12px;
            width: min(420px, calc(100vw - 32px));
            padding: 14px 16px;
            color: #f8fafc;
            background: rgba(15, 23, 42, 0.94);
            border: 1px solid rgba(148, 163, 184, 0.28);
            border-left: 4px solid #38bdf8;
            border-radius: 12px;
            box-shadow:
                0 18px 44px rgba(0, 0, 0, 0.34),
                0 0 0 1px rgba(255, 255, 255, 0.04) inset;
            backdrop-filter: blur(14px) saturate(1.1);
            font-family: Arial, "Microsoft YaHei", sans-serif;
            transform: translate(-50%, -12px);
            opacity: 0;
            pointer-events: none;
            transition: opacity .18s ease, transform .18s ease;
        }
        .jav-jump-toast.show {
            opacity: 1;
            transform: translate(-50%, 0);
        }
        .jav-jump-toast.hide {
            opacity: 0;
            transform: translate(-50%, -12px);
        }
        .jav-jump-toast-icon {
            flex: 0 0 auto;
            width: 24px;
            height: 24px;
            border-radius: 999px;
            color: #082f49;
            background: #7dd3fc;
            font-size: 16px;
            font-weight: 800;
            line-height: 24px;
            text-align: center;
        }
        .jav-jump-toast-title {
            margin: 0 0 4px;
            font-size: 14px;
            font-weight: 700;
            line-height: 1.35;
        }
        .jav-jump-toast-message {
            margin: 0;
            color: #cbd5e1;
            font-size: 13px;
            line-height: 1.45;
        }
        @media (max-width: 720px) {
            .trailer-overlay { padding: 12px; }
            .trailer-modal { width: 100%; border-radius: 8px; }
            .trailer-header { padding: 12px 12px 30px; }
            .trailer-title { gap: 7px; font-size: 13px; }
            .trailer-source { max-width: 42vw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .trailer-footer {
                left: 8px;
                right: 8px;
                bottom: 8px;
                flex-direction: column;
                align-items: stretch;
                gap: 7px;
                padding: 8px;
            }
            .trailer-control-left,
            .trailer-control-right {
                width: 100%;
                justify-content: center;
            }
            .trailer-progress { min-width: 80px; }
            .jav-jump-toast {
                top: 18px;
                width: calc(100vw - 24px);
                padding: 13px 14px;
            }
        }
    `);

    const Utils = {
        normalizeCode(code) {
            const raw = String(code || '').trim();
            if (!raw) return '';

            const normalized = raw
                .replace(/\s+/g, '-')
                .replace(/^FC2[-_]?PPV[-_]?/i, 'FC2-')
                .toUpperCase();

            const uncensoredNumeric = normalized.match(/(\d{6})[-_](\d{2,3})/);
            if (uncensoredNumeric) {
                const sep = uncensoredNumeric[0].includes('_') ? '_' : '-';
                return `${uncensoredNumeric[1]}${sep}${uncensoredNumeric[2]}`;
            }

            const compact = normalized.match(/^([A-Z]{2,10})(\d{3,6})$/);
            if (compact) {
                const number = compact[2].replace(/^0+(?=\d{3})/, '');
                return `${compact[1]}-${number}`;
            }

            const trimmed = normalized.match(/^([A-Z0-9]{2,15}[-_]\d{2,9})/);
            if (trimmed) return trimmed[1];

            return normalized;
        },

        extractCode(text, options = {}) {
            if (!text) return null;

            const mgstageHit = String(text).match(/\b(\d{3}[A-Z]{2,10})[-_\s](\d{2,6})\b/i);
            if (mgstageHit) return Utils.normalizeCode(`${mgstageHit[1]}-${mgstageHit[2]}`);

            const uncensoredHit = String(text).match(/(?:(PACOPACOMAMA|PACO|10MUSUME|10MU|1PONDO|CARIBBEANCOM|CARIB|HEYZO)[-_\s]*)?(\d{6})([-_])(\d{2,3})/i);
            if (uncensoredHit) {
                const code = Utils.normalizeCode(`${uncensoredHit[2]}${uncensoredHit[3]}${uncensoredHit[4]}`);
                if (options.keepUncensoredSource && uncensoredHit[1]) {
                    return `${uncensoredHit[1].toUpperCase()}_${code}`;
                }
                return code;
            }

            const patterns = [
                { regex: /([A-Z]{2,15})[-_\s]([A-Z]{1,2}\d{2,10})/i, type: 'alphanum' },
                { regex: /FC2[-\s_]?(?:PPV)?[-\s_]?(\d{6,9})/i, type: 'fc2' },
                { regex: /([A-Z]{2,15})[-_\s](\d{2,10})(?:[-_](\d{1,3}))?/i, type: 'standard' },
                { regex: /(\d{6})([-_\s]?)(\d{2,3})/, type: 'numeric' },
                { regex: /\b([A-Z]{2,10})(\d{3,6})\b/i, type: 'compactStandard' },
                { regex: /([A-Z]{1,2})(\d{3,4})/i, type: 'compact' }
            ];

            const ignoreList = ['FULLHD', 'H264', 'H265', '1080P', '720P', 'PART', 'DISC', '10BIT'];

            for (let i = 0; i < patterns.length; i++) {
                const { regex, type } = patterns[i];
                const match = text.match(regex);
                if (!match) continue;

                if (type === 'alphanum') {
                    return Utils.normalizeCode(match[0].trim());
                } else if (type === 'standard') {
                    const prefix = match[1].toUpperCase();
                    if (ignoreList.includes(prefix)) continue;
                    return Utils.normalizeCode(match[3] ? `${prefix}-${match[2]}-${match[3]}` : `${prefix}-${match[2]}`);
                } else if (type === 'fc2') {
                    return Utils.normalizeCode(`FC2-PPV-${match[1]}`);
                } else if (type === 'numeric') {
                    if (match[2] === '_') return Utils.normalizeCode(`${match[1]}_${match[3]}`);
                    return Utils.normalizeCode(`${match[1]}-${match[3]}`);
                } else if (type === 'compactStandard') {
                    const prefix = match[1].toUpperCase();
                    if (ignoreList.includes(prefix)) continue;
                    const number = match[2].replace(/^0+(?=\d{3})/, '');
                    return Utils.normalizeCode(`${prefix}-${number}`);
                } else if (type === 'compact') {
                    return Utils.normalizeCode(match[0].toUpperCase());
                }
            }
            return null;
        },

        hexToRgb(color) {
            const hex = String(color || '').trim().replace(/^#/, '');
            if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(hex)) return { r: 100, g: 116, b: 139 };
            const full = hex.length === 3 ? hex.split('').map(ch => ch + ch).join('') : hex;
            return {
                r: parseInt(full.slice(0, 2), 16),
                g: parseInt(full.slice(2, 4), 16),
                b: parseInt(full.slice(4, 6), 16),
            };
        },

        mixColor(color, target = '#ffffff', weight = 0.12) {
            const from = Utils.hexToRgb(color);
            const to = Utils.hexToRgb(target);
            const mix = key => Math.round(from[key] * weight + to[key] * (1 - weight));
            return `rgb(${mix('r')}, ${mix('g')}, ${mix('b')})`;
        },

        getModernBtnStyle(color) {
            const accent = color || '#64748b';
            const bg = Utils.mixColor(accent, '#ffffff', 0.10);
            const border = Utils.mixColor(accent, '#dbe3ef', 0.28);
            const text = Utils.mixColor(accent, '#111827', 0.72);
            const hoverBg = Utils.mixColor(accent, '#ffffff', 0.16);
            return [
                'height:30px',
                'padding:0 11px',
                `--jav-btn-accent:${accent}`,
                `--jav-btn-hover-bg:${hoverBg}`,
                `background:${bg}`,
                `color:${text}`,
                `border:1px solid ${border}`,
                'border-radius:7px',
                'font-size:13px',
                'font-weight:700',
                'line-height:1',
                'cursor:pointer',
                'text-decoration:none',
                'display:inline-flex',
                'align-items:center',
                'justify-content:center',
                'gap:6px',
                'white-space:nowrap',
                'box-shadow:inset 0 1px 0 rgba(255,255,255,0.7)',
                'box-sizing:border-box',
            ].join(';');
        },

        createLinkBtn(text, color, url) {
            const btn = document.createElement('a');
            btn.textContent = text;
            btn.href = url || '#';
            if (url) btn.target = '_blank';
            btn.rel = 'noopener noreferrer';
            btn.style.cssText = Utils.getModernBtnStyle(color);
            return btn;
        },

        createJumpLinkBtn(text, color, url) {
            const btn = Utils.createLinkBtn(text, color, url);
            btn.addEventListener('click', e => {
                e.stopImmediatePropagation();
            }, true);
            return btn;
        },

        createBtn(text, color, handler, useCapture = false) {
            const btn = document.createElement('a');
            btn.textContent = text;
            btn.style.cssText = Utils.getModernBtnStyle(color);
            if (useCapture) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handler();
                }, true);
            } else {
                btn.onclick = (e) => {
                    e.preventDefault();
                    handler();
                };
            }
            return btn;
        },

        request(url) {
            return new Promise((resolve) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: url,
                    timeout: 30000,
                    onload: (r) => resolve(r.responseText)
                });
            });
        },

        showToast(title, message = '', duration = 2000) {
            document.querySelector('.jav-jump-toast')?.remove();

            const toast = document.createElement('div');
            toast.className = 'jav-jump-toast';

            const icon = document.createElement('div');
            icon.className = 'jav-jump-toast-icon';
            icon.textContent = '!';

            const body = document.createElement('div');

            const titleEl = document.createElement('p');
            titleEl.className = 'jav-jump-toast-title';
            titleEl.textContent = title;

            const messageEl = document.createElement('p');
            messageEl.className = 'jav-jump-toast-message';
            messageEl.textContent = message;

            body.appendChild(titleEl);
            if (message) body.appendChild(messageEl);
            toast.appendChild(icon);
            toast.appendChild(body);
            document.body.appendChild(toast);

            requestAnimationFrame(() => toast.classList.add('show'));

            setTimeout(() => {
                toast.classList.remove('show');
                toast.classList.add('hide');
                setTimeout(() => toast.remove(), 220);
            }, duration);
        },

        showOverlay(imgUrl, code, source = null) {
            const originalHtmlOverflow = document.documentElement.style.overflow;
            const originalBodyOverflow = document.body.style.overflow;

            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';

            const container = document.createElement('div');
            container.className = 'preview-overlay';

            const img = document.createElement('img');
            img.className = 'preview-img zoomed';
            img.onclick = (e) => {
                e.stopPropagation();
                img.classList.toggle('zoomed');
            };

            let currentBlobUrl = null;
            const loadImg = (url, src) => {
                if (currentBlobUrl) {
                    URL.revokeObjectURL(currentBlobUrl);
                    currentBlobUrl = null;
                }
                if (src === 'projectjav') {
                    img.src = '';
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url,
                        responseType: 'blob',
                        headers: {
                            'Referer': 'https://projectjav.com/',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                        },
                        onload: r => {
                            if (r.response) {
                                currentBlobUrl = URL.createObjectURL(r.response);
                                img.src = currentBlobUrl;
                            }
                        },
                        onerror: () => { img.src = url; }
                    });
                } else {
                    img.src = url;
                }
            };

            loadImg(imgUrl, source);

            const toolbar = document.createElement('div');
            toolbar.className = 'preview-toolbar';
            toolbar.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                display: flex;
                gap: 12px;
                z-index: 2147483648;
            `;

            const createButton = (text, icon, className, onClick) => {
                const btn = document.createElement('button');
                btn.className = `preview-btn ${className}`;
                btn.innerHTML = `${icon} ${text}`;
                btn.onclick = onClick;
                return btn;
            };

            const setActiveSource = (activeSource) => {
                javfreeBtn.classList.toggle('active', activeSource === 'javfree');
                projectjavBtn.classList.toggle('active', activeSource === 'projectjav');
                javstoreBtn.classList.toggle('active', activeSource === 'javstore');
            };

            const javfreeBtn = createButton('javfree', '🟢', 'javfree', async (e) => {
                e.stopPropagation();
                const newUrl = await Thumbnail.javfree(code);
                if (newUrl) { loadImg(newUrl, 'javfree'); setActiveSource('javfree'); }
                else alert('javfree 未找到预览图');
            });

            const projectjavBtn = createButton('projectjav', '🟡', 'javstore', async (e) => {
                e.stopPropagation();
                const newUrl = await Thumbnail.projectjav(code);
                if (newUrl) { loadImg(newUrl, 'projectjav'); setActiveSource('projectjav'); }
                else alert('projectjav 未找到预览图');
            });

            const javstoreBtn = createButton('javstore', '🔴', 'javstore', async (e) => {
                e.stopPropagation();
                const newUrl = await Thumbnail.javstore(code);
                if (newUrl) { loadImg(newUrl, 'javstore'); setActiveSource('javstore'); }
                else alert('javstore 未找到预览图');
            });

            const newWindowBtn = createButton('新窗口', '🌐', 'action', (e) => {
                e.stopPropagation();
                window.open(img.src);
            });

            const downloadBtn = createButton('下载', '⬇️', 'action', (e) => {
                e.stopPropagation();
                GM_download(img.src, `${code}.jpg`);
            });

            if (source === 'javfree') javfreeBtn.classList.add('active');
            else if (source === 'projectjav') projectjavBtn.classList.add('active');
            else if (source === 'javstore') javstoreBtn.classList.add('active');

            toolbar.appendChild(javfreeBtn);
            toolbar.appendChild(projectjavBtn);
            toolbar.appendChild(javstoreBtn);
            toolbar.appendChild(newWindowBtn);
            toolbar.appendChild(downloadBtn);

            container.appendChild(img);

            const closeOverlay = () => {
                if (container.parentNode) {
                    container.remove();
                    toolbar.remove();
                    document.documentElement.style.overflow = originalHtmlOverflow;
                    document.body.style.overflow = originalBodyOverflow;
                    if (currentBlobUrl) {
                        URL.revokeObjectURL(currentBlobUrl);
                        currentBlobUrl = null;
                    }
                }
            };

            container.onclick = closeOverlay;

            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    closeOverlay();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);

            document.body.appendChild(container);
            document.body.appendChild(toolbar);
        },

        showTrailerOverlay({ code, url, type = 'video', source = '预告片', qualities = null, quality = null, urls = null }) {
            document.querySelector('.trailer-overlay')?.remove();

            const originalHtmlOverflow = document.documentElement.style.overflow;
            const originalBodyOverflow = document.body.style.overflow;
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';

            const overlay = document.createElement('div');
            overlay.className = 'trailer-overlay';

            const modal = document.createElement('div');
            modal.className = 'trailer-modal';
            modal.onclick = (e) => e.stopPropagation();

            const header = document.createElement('div');
            header.className = 'trailer-header';

            const title = document.createElement('div');
            title.className = 'trailer-title';
            title.innerHTML = `
                <span>🎞️</span>
                <span class="trailer-code">${code}</span>
                <span class="trailer-source">${source}</span>
            `;

            const closeBtn = document.createElement('button');
            closeBtn.className = 'jav-player-close';
            closeBtn.type = 'button';
            closeBtn.textContent = '×';

            header.appendChild(title);
            header.appendChild(closeBtn);

            const screen = document.createElement('div');
            screen.className = 'trailer-screen';
            const volumeIndicator = document.createElement('div');
            volumeIndicator.className = 'trailer-volume-indicator';
            const playBtn = document.createElement('button');
            playBtn.className = 'trailer-control-btn';
            playBtn.type = 'button';
            playBtn.textContent = '⏸';
            playBtn.title = '播放/暂停';
            const volumeBtn = document.createElement('button');
            volumeBtn.className = 'trailer-control-btn';
            volumeBtn.type = 'button';
            volumeBtn.textContent = '🔊';
            volumeBtn.title = '静音/取消静音';
            const volumeWrap = document.createElement('div');
            volumeWrap.className = 'trailer-volume-wrap';
            const volumePopover = document.createElement('div');
            volumePopover.className = 'trailer-volume-popover';
            const volumeRail = document.createElement('div');
            volumeRail.className = 'trailer-volume-rail';
            const volumeFill = document.createElement('div');
            volumeFill.className = 'trailer-volume-fill';
            const volumeThumb = document.createElement('div');
            volumeThumb.className = 'trailer-volume-thumb';
            const volumeSlider = document.createElement('input');
            volumeSlider.className = 'trailer-volume-slider';
            volumeSlider.type = 'range';
            volumeSlider.min = '0';
            volumeSlider.max = '100';
            volumeSlider.step = '1';
            volumeSlider.value = '35';
            volumeSlider.title = '音量';
            volumeRail.appendChild(volumeFill);
            volumeRail.appendChild(volumeThumb);
            volumePopover.appendChild(volumeRail);
            volumePopover.appendChild(volumeSlider);
            volumeWrap.appendChild(volumeBtn);
            volumeWrap.appendChild(volumePopover);
            const currentTimeText = document.createElement('span');
            currentTimeText.className = 'trailer-time';
            currentTimeText.textContent = '00:00';
            const durationText = document.createElement('span');
            durationText.className = 'trailer-time';
            durationText.textContent = '00:00';
            const progress = document.createElement('input');
            progress.className = 'trailer-progress';
            progress.type = 'range';
            progress.min = '0';
            progress.max = '1000';
            progress.step = '1';
            progress.value = '0';
            progress.title = '播放进度';
            const fullscreenBtn = document.createElement('button');
            fullscreenBtn.className = 'trailer-control-btn';
            fullscreenBtn.type = 'button';
            fullscreenBtn.textContent = '⛶';
            fullscreenBtn.title = '全屏';
            let video = null;
            let activeUrl = url;
            let activeQuality = quality;
            let volumeIndicatorTimer = null;
            let controlsHideTimer = null;
            let seekingByProgress = false;
            const fallbackUrls = Array.isArray(urls)
                ? [...new Set(urls.filter(Boolean))]
                : [url].filter(Boolean);
            let fallbackIndex = Math.max(0, fallbackUrls.indexOf(url));
            const sourceLink = { href: activeUrl };
            const playbackKeyBase = `trailer_playback_${String(code || '').trim().toUpperCase()}_${String(url || '').slice(0, 160)}`;
            const readPlaybackTime = (key = playbackKeyBase) => {
                const value = Number(sessionStorage.getItem(key) || 0);
                return Number.isFinite(value) && value > 0 ? value : 0;
            };
            const writePlaybackTime = (time = video?.currentTime || 0, key = playbackKeyBase) => {
                if (!Number.isFinite(time) || time < 3) return;
                const duration = Number(video?.duration || 0);
                if (Number.isFinite(duration) && duration > 0 && duration - time < 3) {
                    sessionStorage.removeItem(key);
                    return;
                }
                sessionStorage.setItem(key, String(Math.floor(time)));
            };
            const clearPlaybackTime = (key = playbackKeyBase) => sessionStorage.removeItem(key);
            const restorePlaybackTime = (key = playbackKeyBase) => {
                if (!video || video.dataset.playbackRestored === '1') return;
                const savedTime = readPlaybackTime(key);
                if (!savedTime) return;
                const duration = Number(video.duration || 0);
                if (Number.isFinite(duration) && duration > 0 && savedTime < duration - 3) {
                    video.currentTime = savedTime;
                    video.dataset.playbackRestored = '1';
                    syncTrailerControls();
                }
            };

            const formatTime = (seconds) => {
                if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
                const total = Math.floor(seconds);
                const h = Math.floor(total / 3600);
                const m = Math.floor((total % 3600) / 60);
                const s = total % 60;
                return h
                    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
                    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            };

            const syncTrailerControls = () => {
                if (!video) return;
                playBtn.textContent = video.paused ? '▶' : '⏸';
                volumeBtn.textContent = video.muted || video.volume <= 0 ? '🔇' : '🔊';
                volumeSlider.value = String(Math.round((video.muted ? 0 : video.volume) * 100));
                volumeRail.style.setProperty('--volume-percent', `${volumeSlider.value}%`);
                currentTimeText.textContent = formatTime(video.currentTime || 0);
                durationText.textContent = formatTime(video.duration || 0);
                if (!seekingByProgress && Number.isFinite(video.duration) && video.duration > 0) {
                    progress.value = String(Math.round(((video.currentTime || 0) / video.duration) * 1000));
                }
            };

            const showVolumeIndicator = () => {
                if (!video) return;
                volumeIndicator.textContent = `${Math.round(video.volume * 100)}%`;
                volumeIndicator.classList.add('is-visible');
                clearTimeout(volumeIndicatorTimer);
                volumeIndicatorTimer = setTimeout(() => {
                    volumeIndicator.classList.remove('is-visible');
                }, 820);
            };

            const showTrailerControls = () => {
                screen.classList.remove('is-controls-hidden');
                clearTimeout(controlsHideTimer);
                if (!video || video.paused) return;
                controlsHideTimer = setTimeout(() => {
                    if (!footer.matches(':hover') && document.activeElement !== volumeSlider) {
                        screen.classList.add('is-controls-hidden');
                    }
                }, 2000);
            };

            const scheduleHideTrailerControls = () => {
                clearTimeout(controlsHideTimer);
                if (!video || video.paused) {
                    screen.classList.remove('is-controls-hidden');
                    return;
                }
                controlsHideTimer = setTimeout(() => {
                    screen.classList.add('is-controls-hidden');
                }, 2000);
            };

            const toggleTrailerFullscreen = () => {
                if (document.fullscreenElement) document.exitFullscreen?.();
                else screen.requestFullscreen?.();
            };

            const isM3U8 = /\.m3u8(?:[?#].*)?$/i.test(url);
            const createHlsLoader = () => class GMHlsLoader {
                constructor(config) {
                    this.config = config;
                    this.context = null;
                    this.callbacks = null;
                    this.loader = null;
                }
                destroy() {
                    this.abort();
                }
                abort() {
                    this.loader?.abort?.();
                    this.loader = null;
                }
                load(context, config, callbacks) {
                    this.context = context;
                    this.callbacks = callbacks;
                    const requestUrl = context.url;
                    this.loader = GM_xmlhttpRequest({
                        method: 'GET',
                        url: requestUrl,
                        responseType: context.responseType === 'arraybuffer' ? 'arraybuffer' : 'text',
                        timeout: config?.timeout || 20000,
                        onload: (r) => {
                            const data = context.responseType === 'arraybuffer' ? r.response : (r.responseText || '');
                            callbacks.onSuccess?.({ data, url: r.finalUrl || requestUrl }, { trequest: Date.now(), tfirst: Date.now(), tload: Date.now() }, context);
                        },
                        onerror: () => callbacks.onError?.({ code: 0, text: 'network error' }, context, null),
                        ontimeout: () => callbacks.onTimeout?.(Date.now(), context, null)
                    });
                }
            };

            const attachMp4Src = (src) => {
                if (!src) return;
                video.src = src;
            };

            const attachM3u8Src = (src) => {
                if (!src) return;
                if (!(window.Hls && window.Hls.isSupported && window.Hls.isSupported())) {
                    video.src = src;
                    return;
                }
                const hls = new window.Hls({
                    enableWorker: false,
                    lowLatencyMode: true,
                    loader: createHlsLoader(),
                    autoStartLoad: true,
                    startPosition: 0,
                    capLevelToPlayerSize: true,
                    testBandwidth: false,
                    preferManagedMediaSource: false,
                    maxBufferLength: 6,
                    maxMaxBufferLength: 12,
                    backBufferLength: 30,
                    maxBufferHole: 0.5,
                    nudgeOffset: 0.1,
                    manifestLoadingMaxRetry: 2,
                    levelLoadingMaxRetry: 2,
                    fragLoadingMaxRetry: 2,
                    manifestLoadingTimeOut: 12000,
                    levelLoadingTimeOut: 12000,
                    fragLoadingTimeOut: 12000,
                    abrEwmaFastLive: 3,
                    abrEwmaSlowLive: 9,
                });
                hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
                    hls.startLoad(0);
                    video.play().catch(() => {});
                });
                hls.on(window.Hls.Events.ERROR, (_, data) => {
                    if (!data?.fatal) return;
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR && fallbackIndex < fallbackUrls.length - 1) {
                        fallbackIndex += 1;
                        const next = fallbackUrls[fallbackIndex];
                        activeUrl = next;
                        sourceLink.href = next;
                        hls.loadSource(next);
                        hls.startLoad(0);
                        return;
                    }
                    if (fallbackIndex >= fallbackUrls.length - 1) {
                        try { hls.destroy(); } catch {}
                        video._hls = null;
                        video.src = src;
                        video.load?.();
                        video.play().catch(() => {});
                    }
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                video._hls = hls;
            };

            const attachVideoSrc = (src) => {
                if (!src) return;
                if (/\.m3u8(?:[?#].*)?$/i.test(src)) attachM3u8Src(src);
                else attachMp4Src(src);
            };

            const initTrailerVideo = (src) => {
                if (isM3U8 && !window.Hls) {
                    const hlsScript = document.createElement('script');
                    hlsScript.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
                    hlsScript.async = true;
                    hlsScript.onload = () => attachVideoSrc(src);
                    hlsScript.onerror = () => attachMp4Src(src);
                    document.head.appendChild(hlsScript);
                } else {
                    attachVideoSrc(src);
                }

                if (isM3U8) {
                    const initialSrc = src;
                    setTimeout(() => {
                        if (!video || !video.isConnected) return;
                        const notReady = video.readyState < 2;
                        if (notReady && !video.error) {
                            try {
                                if (video._hls) {
                                    video._hls.destroy();
                                    video._hls = null;
                                }
                            } catch {}
                            video.src = initialSrc;
                            video.play().catch(() => {});
                        }
                    }, 2500);
                }
            };

            if (type === 'iframe') {
                const iframe = document.createElement('iframe');
                iframe.src = url;
                iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
                screen.appendChild(iframe);
            } else {
                video = document.createElement('video');
                video.controls = false;
                video.autoplay = true;
                video.loop = true;
                video.playsInline = true;
                const savedVolume = Number(GM_getValue('trailer_volume', 0.35));
                const savedMuted = GM_getValue('trailer_muted', false);
                video.volume = Number.isFinite(savedVolume) ? Math.min(1, Math.max(0, savedVolume)) : 0.35;
                video.muted = Boolean(savedMuted);

                initTrailerVideo(fallbackUrls[fallbackIndex] || url);
                video.preload = 'auto';

                video.addEventListener('volumechange', () => {
                    GM_setValue('trailer_volume', video.volume);
                    GM_setValue('trailer_muted', video.muted);
                    syncTrailerControls();
                });
                video.addEventListener('play', () => {
                    syncTrailerControls();
                    scheduleHideTrailerControls();
                });
                video.addEventListener('pause', () => {
                    syncTrailerControls();
                    screen.classList.remove('is-controls-hidden');
                    clearTimeout(controlsHideTimer);
                });
                video.addEventListener('timeupdate', () => {
                    syncTrailerControls();
                    writePlaybackTime();
                });
                video.addEventListener('durationchange', () => {
                    syncTrailerControls();
                    restorePlaybackTime();
                });
                video.addEventListener('loadedmetadata', () => {
                    syncTrailerControls();
                    restorePlaybackTime();
                });
                video.addEventListener('ended', () => clearPlaybackTime());
                video.addEventListener('error', () => {
                    if (fallbackIndex >= fallbackUrls.length - 1) return;
                    fallbackIndex += 1;
                    activeUrl = fallbackUrls[fallbackIndex];
                    sourceLink.href = activeUrl;
                    if (video._hls) {
                        video._hls.destroy();
                        video._hls = null;
                    }
                    attachVideoSrc(activeUrl);
                    video.load?.();
                    video.play().catch(() => {});
                });
                screen.appendChild(video);
                screen.appendChild(volumeIndicator);
                playBtn.addEventListener('click', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!video) return;
                    if (video.paused) video.play().catch(() => {});
                    else video.pause();
                    syncTrailerControls();
                });
                volumeBtn.addEventListener('click', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!video) return;
                    video.muted = !video.muted;
                    if (!video.muted && video.volume <= 0) video.volume = 0.35;
                    showVolumeIndicator();
                    syncTrailerControls();
                });
                volumeSlider.addEventListener('input', e => {
                    e.stopPropagation();
                    if (!video) return;
                    screen.classList.remove('is-controls-hidden');
                    clearTimeout(controlsHideTimer);
                    const nextVolume = Math.min(1, Math.max(0, Number(volumeSlider.value) / 100));
                    video.volume = nextVolume;
                    video.muted = nextVolume <= 0;
                    showVolumeIndicator();
                    syncTrailerControls();
                });
                volumeSlider.addEventListener('change', scheduleHideTrailerControls);
                video.addEventListener('click', e => {
                    e.preventDefault();
                    if (video.paused) video.play().catch(() => {});
                    else video.pause();
                    syncTrailerControls();
                });
                progress.addEventListener('input', () => {
                    seekingByProgress = true;
                    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
                    const nextTime = (Number(progress.value) / 1000) * video.duration;
                    currentTimeText.textContent = formatTime(nextTime);
                });
                progress.addEventListener('change', () => {
                    if (video && Number.isFinite(video.duration) && video.duration > 0) {
                        video.currentTime = (Number(progress.value) / 1000) * video.duration;
                        writePlaybackTime(video.currentTime);
                    }
                    seekingByProgress = false;
                    syncTrailerControls();
                });
                fullscreenBtn.addEventListener('click', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    fullscreenBtn.blur();
                    toggleTrailerFullscreen();
                });
                setTimeout(() => {
                    video.play().catch(() => {});
                    syncTrailerControls();
                    scheduleHideTrailerControls();
                }, 120);
            }

            const qualityBar = document.createElement('div');
            const qualityMap = qualities && typeof qualities === 'object' ? qualities : null;
            if (type !== 'iframe' && qualityMap && Object.keys(qualityMap).length > 1) {
                const qualityOrder = ['4k', 'hhb', 'hmb', 'mhb', 'mmb', 'dm', 'sm'];
                const qualityLabels = {
                    '4k': '4K',
                    hhb: '1080P',
                    hmb: '720P',
                    mhb: '576P',
                    mmb: '432P'
                };
                const sortedKeys = Object.keys(qualityMap)
                    .filter(key => qualityMap[key])
                    .sort((a, b) => qualityOrder.indexOf(a) - qualityOrder.indexOf(b));

                qualityBar.className = 'trailer-quality-bar';

                const select = document.createElement('select');
                select.className = 'trailer-quality-select';

                const setActiveQuality = (key) => {
                    activeQuality = key;
                    activeUrl = qualityMap[key];
                    select.value = key;
                };

                sortedKeys.forEach(key => {
                    const opt = document.createElement('option');
                    opt.value = key;
                    opt.textContent = qualityLabels[key] || key;
                    select.appendChild(opt);
                });

                select.addEventListener('change', async () => {
                    const key = select.value;
                    if (!video || !qualityMap[key] || activeQuality === key) return;
                    const currentTime = video.currentTime || 0;
                    const shouldPlay = !video.paused;
                    writePlaybackTime(currentTime);
                    video.src = qualityMap[key];
                    video.dataset.playbackRestored = '1';
                    fallbackIndex = Math.max(0, fallbackUrls.indexOf(qualityMap[key]));
                    video.load();
                    video.currentTime = currentTime;
                    setActiveQuality(key);
                    sourceLink.href = activeUrl;
                    if (shouldPlay) {
                        await video.play().catch(() => {});
                    }
                });

                qualityBar.appendChild(select);
                setActiveQuality(activeQuality && qualityMap[activeQuality] ? activeQuality : sortedKeys[0]);
            }

            const footer = document.createElement('div');
            footer.className = 'trailer-footer';
            const footerLeft = document.createElement('div');
            footerLeft.className = 'trailer-control-left';
            if (type !== 'iframe') {
                footerLeft.appendChild(playBtn);
                footerLeft.appendChild(volumeWrap);
                footerLeft.appendChild(currentTimeText);
                footerLeft.appendChild(progress);
                footerLeft.appendChild(durationText);
            }
            const footerRight = document.createElement('div');
            footerRight.className = 'trailer-control-right';
            footerRight.appendChild(qualityBar);
            footer.appendChild(footerLeft);
            footerRight.appendChild(fullscreenBtn);
            footer.appendChild(footerRight);

            modal.appendChild(screen);
            screen.appendChild(header);
            screen.appendChild(footer);
            overlay.appendChild(modal);
            screen.addEventListener('mousemove', showTrailerControls);
            screen.addEventListener('mouseenter', showTrailerControls);
            screen.addEventListener('mouseleave', () => {
                if (video && !video.paused) screen.classList.add('is-controls-hidden');
            });
            footer.addEventListener('mouseenter', () => {
                screen.classList.remove('is-controls-hidden');
                clearTimeout(controlsHideTimer);
            });
            footer.addEventListener('mouseleave', scheduleHideTrailerControls);

            const closeOverlay = (event = null) => {
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation?.();
                }
                const video = overlay.querySelector('video');
                if (video) {
                    writePlaybackTime(video.currentTime || 0);
                    video.pause();
                    video.removeAttribute('src');
                    video.load();
                }
                overlay.remove();
                document.documentElement.style.overflow = originalHtmlOverflow;
                document.body.style.overflow = originalBodyOverflow;
                window.removeEventListener('pointerdown', overlayCloseGuard, true);
                window.removeEventListener('mousedown', overlayCloseGuard, true);
                window.removeEventListener('click', overlayCloseGuard, true);
                document.removeEventListener('keydown', escHandler, true);
                clearTimeout(volumeIndicatorTimer);
                clearTimeout(controlsHideTimer);
            };

            const overlayCloseGuard = (event) => {
                if (!overlay.contains(event.target)) return;
                const shouldClose = event.target === overlay || event.target.closest('.jav-player-close');
                if (!shouldClose) return;
                if (event.type === 'click') {
                    closeOverlay(event);
                    return;
                }
                event.stopPropagation();
                event.stopImmediatePropagation?.();
            };

            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    closeOverlay();
                    return;
                }
                const key = e.key;
                const shouldCapture = [' ', 'Spacebar', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key);
                if (shouldCapture) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation?.();
                }
                if (key === 'Enter') {
                    toggleTrailerFullscreen();
                    showTrailerControls();
                    return;
                }
                if (!video || type === 'iframe') return;
                if (key === ' ' || key === 'Spacebar') {
                    if (video.paused) video.play().catch(() => {});
                    else video.pause();
                    syncTrailerControls();
                    showTrailerControls();
                } else if (key === 'ArrowLeft') {
                    video.currentTime = Math.max(0, (video.currentTime || 0) - 2);
                } else if (key === 'ArrowRight') {
                    const nextTime = (video.currentTime || 0) + 2;
                    video.currentTime = Number.isFinite(video.duration)
                        ? Math.min(video.duration, nextTime)
                        : nextTime;
                } else if (key === 'ArrowUp' || key === 'ArrowDown') {
                    const delta = key === 'ArrowUp' ? 0.05 : -0.05;
                    video.volume = Math.min(1, Math.max(0, Math.round((video.volume + delta) * 100) / 100));
                    if (video.volume > 0) video.muted = false;
                    showVolumeIndicator();
                }
            };

            closeBtn.addEventListener('click', closeOverlay, true);
            overlay.addEventListener('click', e => {
                if (e.target === overlay) closeOverlay(e);
            }, true);
            window.addEventListener('pointerdown', overlayCloseGuard, true);
            window.addEventListener('mousedown', overlayCloseGuard, true);
            window.addEventListener('click', overlayCloseGuard, true);
            document.addEventListener('keydown', escHandler, true);
            document.body.appendChild(overlay);
        },

        getJavBusUrl(code) {
            const codeLower = code.toLowerCase();

            const isUncensored =
                /^\d{6}[-_\s]\d{3}$/.test(code) ||
                codeLower.startsWith('heyzo') ||
                codeLower.startsWith('carib') ||
                codeLower.startsWith('1pondo') ||
                codeLower.startsWith('tokyo') ||
                codeLower.startsWith('cat') ||
                codeLower.startsWith('paco') ||
                codeLower.startsWith('10mu') ||
                codeLower.startsWith('muram') ||
                codeLower.startsWith('gach') ||
                codeLower.startsWith('real') ||
                codeLower.startsWith('juku') ||
                codeLower.startsWith('aka') ||
                codeLower.startsWith('s-cute') ||
                codeLower.startsWith('n_') ||
                /^n\d{4}$/.test(codeLower) ||
                codeLower.startsWith('k_') ||
                /^k\d{4}$/.test(codeLower);

            if (isUncensored) {
                return `https://www.javbus.com/uncensored/search/${encodeURIComponent(code)}&type=1`;
            }
            return `https://www.javbus.com/search/${encodeURIComponent(code)}&type=&parent=ce`;
        }
    };

    const Thumbnail = {
        cacheKey(code) {
            return `thumb_cache_v3_${code}`;
        },

        normalizeForCompare(text) {
            return String(text || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        },

        isCodeMatched(text, code) {
            const normalizedText = this.normalizeForCompare(text);
            const normalizedCode = this.normalizeForCompare(code);
            return !!normalizedCode && normalizedText.includes(normalizedCode);
        },

        isDetailMatched(doc, url, code) {
            const title = doc?.querySelector('title')?.textContent || '';
            const headings = [...(doc?.querySelectorAll('h1,h2,h3,.entry-title,.movie-title,.post-title') || [])]
                .map(el => el.textContent || '')
                .join(' ');
            const bodyText = (doc?.body?.textContent || '').slice(0, 5000);
            return this.isCodeMatched([url, title, headings, bodyText].join(' '), code);
        },

        normalizePreviewUrl(url, baseUrl = '') {
            if (!url) return '';
            const absolute = /^https?:\/\//i.test(url)
                ? url
                : (baseUrl ? new URL(url, baseUrl).href : url);
            return absolute.replace(/^http:/, 'https:');
        },

        isJavfreePreviewImage(url, code) {
            const cleanUrl = String(url || '').split('?')[0];
            return this.isCodeMatched(cleanUrl, code) &&
                /-(?:1080p|demosaic)\.(?:jpe?g|png|webp)$/i.test(cleanUrl);
        },

        selectJavfreePreviewUrl(doc, detailUrl, code) {
            const urls = [...doc.querySelectorAll('p > img[src]')]
                .map(img => this.normalizePreviewUrl(img.getAttribute('src') || img.src || '', detailUrl))
                .filter(url => this.isJavfreePreviewImage(url, code));
            return urls.find(url => /-1080p\./i.test(url)) ||
                urls.find(url => /-demosaic\./i.test(url)) ||
                '';
        },

        async javfree(code) {
            const cacheKey = this.cacheKey(code);
            const cacheEnabled = Settings.getPreviewCacheEnabled();
            if (cacheEnabled) {
                const cached = sessionStorage.getItem(cacheKey);
                if (cached) return cached;
            }

            try {
                const html = await Utils.request(`https://javfree.me/search/${code}`);
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const link = [...doc.querySelectorAll('.entry-title>a')]
                    .find(a => this.isCodeMatched([a.href, a.textContent].join(' '), code))?.href;
                if (!link) return null;

                const dHtml = await Utils.request(link);
                const dDoc = new DOMParser().parseFromString(dHtml, 'text/html');
                if (!this.isDetailMatched(dDoc, link, code)) return null;
                const url = this.selectJavfreePreviewUrl(dDoc, link, code);

                if (url && cacheEnabled) {
                    sessionStorage.setItem(cacheKey, url);
                    return url;
                }
                if (url) return url;
                return null;
            } catch {
                return null;
            }
        },

        async javstore(code) {
            try {
                const normalizedCode = code.replace(/^fc2-?/i, '').replace(/-/g, '').toLowerCase();
                console.log(`javstore: searching for code=${code}, normalized=${normalizedCode}`);

                const searchUrl = `https://javstore.net/search?q=${encodeURIComponent(code)}`;
                const searchHtml = await Utils.request(searchUrl);
                const searchDoc = new DOMParser().parseFromString(searchHtml, 'text/html');

                const candidateLinks = searchDoc.querySelectorAll('a[href*="/"]');
                const detailUrls = [];
                for (const link of candidateLinks) {
                    const href = link.getAttribute('href');
                    if (!href) continue;
                    if (href.startsWith('http') && !href.includes('javstore.net')) continue;
                    const urlObj = new URL(href, searchUrl);
                    if (!/javstore\.net$/i.test(urlObj.hostname)) continue;
                    if (/^\/search(?:[/?#]|$)/i.test(urlObj.pathname)) continue;
                    const fullUrl = urlObj.href;
                    const pathLastPart = decodeURIComponent(urlObj.pathname.split('/').pop() || '');
                    const normalizedPath = pathLastPart.toLowerCase().replace(/-/g, '');
                    const looksLikeDetail = /\.html$/i.test(urlObj.pathname) || /^\/\d+[-/]/.test(urlObj.pathname);
                    if (looksLikeDetail && normalizedPath.includes(normalizedCode) && !detailUrls.includes(fullUrl)) {
                        detailUrls.push(fullUrl);
                        console.log(`javstore: 候选链接 [${detailUrls.length}]: ${fullUrl}`);
                    }
                }

                if (detailUrls.length === 0) {
                    console.warn('javstore: 未找到匹配的详情页');
                    return null;
                }

                for (const detailUrl of detailUrls) {
                    console.log(`javstore: 尝试详情页: ${detailUrl}`);
                    const imgUrl = await this._extractImgFromDetail(detailUrl, code);
                    if (imgUrl) {
                        console.log(`javstore: 找到预览图: ${imgUrl}`);
                        return imgUrl;
                    }
                    console.log(`javstore: 该页无预览图，尝试下一个`);
                }

                console.warn('javstore: 所有候选页均无预览图');
                return null;
            } catch (e) {
                console.warn('javstore 获取失败', e);
                return null;
            }
        },

        async _extractImgFromDetail(detailUrl, code) {
            try {
                const detailHtml = await Utils.request(detailUrl);
                const detailDoc = new DOMParser().parseFromString(detailHtml, 'text/html');
                if (!this.isDetailMatched(detailDoc, detailUrl, code)) {
                    console.warn('javstore: 详情页番号不匹配，跳过', detailUrl);
                    return null;
                }

                for (const link of detailDoc.querySelectorAll('a')) {
                    if (link.textContent.includes('CLICK HERE')) {
                        const imgUrl = link.href || link.getAttribute('href') || '';
                        if (imgUrl) return this.normalizePreviewUrl(imgUrl, detailUrl);
                    }
                }

                const img = detailDoc.querySelector('img[src*="_s.jpg"]');
                if (img) {
                    let src = img.getAttribute('src') || '';
                    if (!src.startsWith('http')) src = new URL(src, detailUrl).href;
                    return this.normalizePreviewUrl(src.replace(/_s\.jpg$/, '_l.jpg'), detailUrl);
                }

                return null;
            } catch (e) {
                console.warn('javstore: 详情页请求失败', detailUrl, e.message);
                return null;
            }
        },

        async projectjav(code) {
            try {
                const request = (url) => new Promise((resolve, reject) => {
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url,
                        timeout: 20000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
                        },
                        onload: r => {
                            console.log(`[projectjav] ${url} → HTTP ${r.status}, final=${r.finalUrl || url}, 长度 ${r.responseText?.length}`);
                            if (r.status >= 200 && r.status < 400) resolve(r);
                            else reject(new Error(`HTTP ${r.status}`));
                        },
                        onerror: (e) => { console.warn('[projectjav] 网络错误', e); reject(new Error('请求失败')); },
                        ontimeout: () => { console.warn('[projectjav] 请求超时'); reject(new Error('请求超时')); }
                    });
                });

                const searchUrl = `https://projectjav.com/?searchTerm=${encodeURIComponent(code)}`;
                console.log('[projectjav] 搜索页:', searchUrl);
                const searchRes = await request(searchUrl);
                const searchHtml = searchRes.responseText || '';
                const finalSearchUrl = searchRes.finalUrl || searchUrl;
                const searchDoc = new DOMParser().parseFromString(searchHtml, 'text/html');

                let detailUrl = /\/movie\//i.test(new URL(finalSearchUrl).pathname)
                    ? finalSearchUrl
                    : '';
                if (!detailUrl) {
                    const allMovieLinks = [...searchDoc.querySelectorAll('a[href*="/movie/"]')];
                    console.log(`[projectjav] /movie/ 链接数: ${allMovieLinks.length}`);
                    allMovieLinks.slice(0, 5).forEach(a => console.log('  ', a.getAttribute('href')));
                    const firstLink = allMovieLinks[0]?.getAttribute('href') || '';
                    if (!firstLink) {
                        console.warn('[projectjav] 无结果，页面标题:', searchDoc.title);
                        console.warn('[projectjav] 页面前800字符:', searchHtml.slice(0, 800));
                        return null;
                    }
                    detailUrl = firstLink.startsWith('http') ? firstLink : `https://projectjav.com${firstLink}`;
                }
                console.log('[projectjav] 详情页:', detailUrl);
                const detailRes = finalSearchUrl === detailUrl ? searchRes : await request(detailUrl);
                const detailHtml = detailRes.responseText || '';
                const finalDetailUrl = detailRes.finalUrl || detailUrl;
                const detailDoc = new DOMParser().parseFromString(detailHtml, 'text/html');

                const screenshotLink = [...detailDoc.querySelectorAll('.col-md-12.thumbnail a[data-featherlight="image"], .thumbnail a[data-featherlight="image"]')]
                    .find(a => this.isCodeMatched([
                        a.outerHTML,
                        a.closest('.thumbnail')?.outerHTML,
                        finalDetailUrl
                    ].join(' '), code));
                console.log('[projectjav] screenshotLink matched:', !!screenshotLink, 'href:', screenshotLink?.getAttribute('href'));
                if (screenshotLink) {
                    const thumbImg = screenshotLink.querySelector('img');
                    const href = screenshotLink.getAttribute('href') || '';
                    if (href) return this.normalizePreviewUrl(href, finalDetailUrl);
                    if (thumbImg) {
                        const src = (thumbImg.getAttribute('src') || '').replace(/\?.*$/, '');
                        if (src) return this.normalizePreviewUrl(src, finalDetailUrl);
                    }
                }

                console.warn('[projectjav] 详情页未找到图片，页面标题:', detailDoc.title);
                return null;
            } catch (e) {
                console.warn('[projectjav] 异常:', e.message);
                return null;
            }
        },

        async get(code) {
            const cacheEnabled = Settings.getPreviewCacheEnabled();
            const cacheKey = this.cacheKey(code);
            if (cacheEnabled) {
                const cached = sessionStorage.getItem(cacheKey);
                if (cached) return { url: cached, source: null };
            }

            const order = Settings.getSourceOrder();
            let url = null, source = null;

            for (const src of order) {
                if (typeof this[src] !== 'function') continue;
                try {
                    url = await this[src](code);
                } catch (e) {
                    console.warn(`Thumbnail[${src}] 异常:`, e.message);
                    url = null;
                }
                if (url) { source = src; break; }
                console.log(`${src} 无结果，尝试下一个来源`);
            }

            console.log('预览图最终结果:', url ? `有图 (${source})` : '无图');
            if (url && cacheEnabled) {
                sessionStorage.setItem(cacheKey, url);
            }
            return { url, source };
        },

        async show(code) {
            const result = await this.get(code);
            if (result.url) {
                Utils.showOverlay(result.url, code, result.source);
            } else {
                alert('未找到预览图');
            }
        }
    };

    const ListPreview = (() => {
        let styleReady = false;

        function enabled() {
            return GM_getValue('list_preview_quick_enabled', true);
        }

        function ensureStyle() {
            if (styleReady) return;
            styleReady = true;
            GM_addStyle(`
                .jav-card-cover {
                    position: relative !important;
                }
                .jav-list-preview-btn {
                    position: absolute;
                    right: 8px;
                    bottom: 8px;
                    z-index: 3;
                    width: 32px;
                    height: 32px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(255,255,255,.28);
                    border-radius: 999px;
                    background: rgba(15,23,42,.56);
                    color: #fff;
                    backdrop-filter: blur(8px);
                    box-shadow: 0 4px 12px rgba(0,0,0,.24);
                    cursor: pointer;
                    user-select: none;
                    transition: transform .16s ease, background .16s ease, border-color .16s ease, box-shadow .16s ease;
                }
                .jav-list-preview-btn:hover {
                    transform: translateY(-1px) scale(1.04);
                    background: rgba(37,99,235,.78);
                    border-color: rgba(255,255,255,.42);
                    box-shadow: 0 8px 18px rgba(15,23,42,.28);
                }
                .jav-list-preview-btn:active {
                    transform: scale(.96);
                }
                .jav-list-preview-btn:focus-visible {
                    outline: 2px solid rgba(191,219,254,.95);
                    outline-offset: 2px;
                }
                .jav-list-preview-icon {
                    width: 16px;
                    height: 16px;
                    display: block;
                    background-repeat: no-repeat;
                    background-position: center;
                    background-size: contain;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z'/%3E%3Ccircle cx='12' cy='12' r='2.9'/%3E%3C/svg%3E");
                    opacity: .96;
                }
            `);
        }

        function isListPage() {
            return !isCurrentDetailPage();
        }

        function detectCode(card) {
            if (!card) return '';
            const explicitCode = card.querySelector('.javbus-card-code, .javlib-card-code, .id, [data-code]')?.textContent?.trim();
            if (explicitCode) {
                const normalized = Utils.extractCode(explicitCode) || Utils.normalizeCode(explicitCode);
                if (normalized) return normalized;
            }
            const titleText = [
                card.querySelector('.javdb-card-headline')?.textContent,
                card.querySelector('.javlib-card-headline')?.textContent,
                card.querySelector('.javbus-card-headline')?.textContent,
                card.querySelector('.video-title')?.textContent,
                card.querySelector('.title')?.textContent,
                card.querySelector('a[title]')?.getAttribute('title'),
                card.textContent
            ].filter(Boolean).join(' ');
            return Utils.extractCode(titleText) || '';
        }

        function getCards() {
            return [
                ...document.querySelectorAll('.javbus-card-grid > .item, .javdb-card-grid > .item, .videothumblist .videos.javlib-card-grid > .video')
            ];
        }

        function attachToCard(card) {
            if (!card) return;
            const cover = card.querySelector('.jav-card-cover');
            if (!cover) return;
            const existing = cover.querySelector('.jav-list-preview-btn');
            if (!enabled()) {
                existing?.remove();
                return;
            }
            const code = detectCode(card);
            if (!code) {
                existing?.remove();
                return;
            }
            if (existing) {
                existing.dataset.code = code;
                existing.title = `预览图 ${code}`;
                return;
            }
            const btn = document.createElement('span');
            btn.className = 'jav-list-preview-btn';
            btn.dataset.code = code;
            btn.setAttribute('role', 'button');
            btn.tabIndex = 0;
            btn.title = `预览图 ${code}`;
            btn.innerHTML = '<span class="jav-list-preview-icon" aria-hidden="true"></span>';

            const openPreview = async e => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation?.();
                if (btn.dataset.loading === '1') return;
                const targetCode = btn.dataset.code || detectCode(card);
                if (!targetCode) return;
                btn.dataset.loading = '1';
                btn.style.pointerEvents = 'none';
                btn.style.opacity = '.72';
                try {
                    await Thumbnail.show(targetCode);
                } finally {
                    delete btn.dataset.loading;
                    btn.style.pointerEvents = '';
                    btn.style.opacity = '';
                }
            };
            btn.addEventListener('click', openPreview, true);
            btn.addEventListener('keydown', e => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                openPreview(e);
            }, true);
            cover.appendChild(btn);
        }

        function removeAll() {
            document.querySelectorAll('.jav-list-preview-btn').forEach(el => el.remove());
        }

        function sync() {
            if (!isListPage()) {
                removeAll();
                return;
            }
            ensureStyle();
            if (!enabled()) {
                removeAll();
                return;
            }
            getCards().forEach(attachToCard);
        }

        return { sync, removeAll, attach: attachToCard };
    })();
    window.__LAOSIJI_LIST_PREVIEW__ = ListPreview;

    const DetailPreviewInline = (() => {
        let styleReady = false;
        let lastToken = 0;
        let state = { code: '', status: '' };

        function enabled() {
            return GM_getValue('detail_preview_inline_enabled', true);
        }

        function ensureStyle() {
            if (styleReady) return;
            styleReady = true;
            GM_addStyle(`
                .jav-nong-slot.has-detail-preview-inline {
                    display: flex !important;
                    align-items: flex-start !important;
                    gap: 12px !important;
                    overflow: visible !important;
                }
                .jav-nong-slot.has-detail-preview-inline .jav-nong-wrapper {
                    flex: 1 1 auto !important;
                    min-width: 0 !important;
                }
                .jav-detail-preview-wrap {
                    flex: 0 1 280px;
                    width: auto;
                    max-width: min(38%, 300px);
                    min-width: 0;
                    align-self: flex-start;
                    position: relative;
                    box-sizing: border-box;
                }
                .jav-detail-preview-wrap.is-loading {
                    min-height: 120px;
                }
                .jav-detail-preview-inline {
                    display: block;
                    width: auto;
                    max-width: 100%;
                    max-height: 420px;
                    object-fit: contain;
                    border-radius: 6px;
                    cursor: zoom-in;
                }
                .jav-detail-preview-loading {
                    position: absolute;
                    inset: 0;
                    display: grid;
                    place-items: center;
                    color: #475569;
                    font-size: 12px;
                    font-weight: 700;
                    white-space: nowrap;
                    pointer-events: none;
                }
                @media (max-width: 900px) {
                    .jav-nong-slot.has-detail-preview-inline {
                        flex-wrap: wrap !important;
                    }
                    .jav-detail-preview-wrap {
                        flex-basis: 100%;
                        max-width: 100%;
                    }
                    .jav-detail-preview-inline {
                        max-width: 100%;
                        max-height: 420px;
                        margin: 0 auto;
                    }
                }
            `);
        }

        function isDetailPage() {
            return typeof isCurrentDetailPage === 'function' ? isCurrentDetailPage() : false;
        }

        function getCurrentSite() {
            return Sites.find(site => site.match(window.location.href)) || null;
        }

        function getDetailCode() {
            const site = getCurrentSite();
            if (!site) return '';
            const titleElem = site.id === 'emby'
                ? resolveEmbyTitleElem()
                : document.querySelector(site.titleSelector);
            const titleText = titleElem?.textContent || '';
            return Utils.extractCode(titleText) || '';
        }

        function getInsertTarget() {
            const slot = document.querySelector('.jav-nong-slot');
            if (!slot) return null;
            const wrapper = slot.querySelector('.jav-nong-wrapper');
            return { slot, wrapper };
        }

        function remove() {
            document.querySelectorAll('.jav-detail-preview-wrap').forEach(el => el.remove());
            document.querySelectorAll('.jav-nong-slot.has-detail-preview-inline').forEach(el => {
                el.classList.remove('has-detail-preview-inline');
            });
        }

        function renderPreview(code, result) {
            if (!result?.url) return;
            const target = getInsertTarget();
            if (!target) return;

            remove();
            target.slot.classList.add('has-detail-preview-inline');

            const wrap = document.createElement('div');
            wrap.className = 'jav-detail-preview-wrap';
            wrap.dataset.code = code;
            wrap.dataset.state = 'loaded';

            const img = document.createElement('img');
            img.className = 'jav-detail-preview-inline';
            img.dataset.code = code;
            img.src = result.url;
            img.alt = code;
            img.loading = 'lazy';
            img.title = '点击查看预览图';
            img.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                Utils.showOverlay(result.url, code, result.source);
            });
            wrap.appendChild(img);

            if (target.wrapper?.parentElement === target.slot) {
                target.slot.insertBefore(wrap, target.wrapper);
            } else {
                target.slot.insertBefore(wrap, target.slot.firstChild);
            }
        }

        async function sync() {
            if (!enabled() || !isDetailPage()) {
                lastToken++;
                remove();
                state = { code: '', status: '' };
                return;
            }

            ensureStyle();

            const code = getDetailCode();
            if (!code) {
                lastToken++;
                remove();
                state = { code: '', status: '' };
                return;
            }
            if (state.code === code && state.status === 'missing') return;

            const existingWrap = document.querySelector('.jav-detail-preview-wrap');
            if (existingWrap?.dataset.code === code && existingWrap.dataset.state === 'loaded') return;
            if (existingWrap?.dataset.code === code && existingWrap.dataset.state === 'loading') return;

            const token = ++lastToken;
            state = { code, status: 'loading' };
            if (existingWrap && existingWrap.dataset.code !== code) existingWrap.remove();

            const target = getInsertTarget();
            if (!target) return;

            target.slot.classList.add('has-detail-preview-inline');
            let wrap = document.querySelector('.jav-detail-preview-wrap');
            if (!wrap) {
                wrap = document.createElement('div');
                wrap.className = 'jav-detail-preview-wrap';
                wrap.dataset.code = code;
                wrap.dataset.state = 'loading';
                const loading = document.createElement('span');
                loading.className = 'jav-detail-preview-loading';
                loading.textContent = '预览图加载中...';
                wrap.appendChild(loading);
                if (target.wrapper?.parentElement === target.slot) {
                    target.slot.insertBefore(wrap, target.wrapper);
                } else {
                    target.slot.insertBefore(wrap, target.slot.firstChild);
                }
            } else {
                wrap.dataset.code = code;
                wrap.dataset.state = 'loading';
                wrap.innerHTML = '<span class="jav-detail-preview-loading">预览图加载中...</span>';
            }

            const result = await Thumbnail.get(code);
            if (token !== lastToken || !wrap.isConnected) return;

            if (!result?.url) {
                wrap.remove();
                target.slot.classList.remove('has-detail-preview-inline');
                state = { code, status: 'missing' };
                return;
            }

            state = { code, status: 'loaded' };
            wrap.dataset.state = 'loaded';
            wrap.innerHTML = '';
            const img = document.createElement('img');
            img.className = 'jav-detail-preview-inline';
            img.dataset.code = code;
            img.src = result.url;
            img.alt = code;
            img.loading = 'lazy';
            img.title = '点击查看预览图';
            img.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                Utils.showOverlay(result.url, code, result.source);
            });
            wrap.appendChild(img);
        }

        return { sync, remove };
    })();
    window.__LAOSIJI_DETAIL_PREVIEW_INLINE__ = DetailPreviewInline;

    const Trailer = {
        normalize(code) {
            return Utils.normalizeCode(code);
        },

        normalizeForCompare(text) {
            return String(text || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        },

        cacheKey(code) {
            return `trailer_cache_v9_${this.normalize(code)}`;
        },

        debug(...args) {
            console.log('[TrailerResolver]', ...args);
        },

        async show(code) {
            const result = await this.get(code);
            if (result?.url) {
                this.debug('打开播放器', { code: this.normalize(code), source: result.source, type: result.type || 'video', url: result.url });
                Utils.showTrailerOverlay({
                    code: this.normalize(code),
                    url: result.url,
                    type: result.type || 'video',
                    source: result.source || '预告片',
                    qualities: result.qualities,
                    quality: result.quality,
                    urls: result.urls
                });
            } else {
                this.debug('最终未找到可用视频源', { code: this.normalize(code) });
                Utils.showToast('未找到可用的视频源。', '节点不可用，请将DMM域名分流到日本ip', 3000);
            }
        },

        async get(code) {
            const rawCode = String(code || '').trim();
            const id = this.normalize(code);
            const cacheEnabled = Settings.getTrailerCacheEnabled();
            this.debug('开始查询', { rawCode, normalized: id, cacheEnabled });
            if (cacheEnabled) {
                const cached = sessionStorage.getItem(this.cacheKey(id));
                if (cached) {
                    try {
                        const cachedResult = JSON.parse(cached);
                        if (cachedResult?.url) {
                            this.debug('缓存命中', { source: cachedResult.source, url: cachedResult.url });
                            return cachedResult;
                        }
                    } catch {
                    }
                    this.debug('缓存无效，已移除');
                    sessionStorage.removeItem(this.cacheKey(id));
                }
            }

            const resolvers = [
                this.fromFc2Hub,
                this.fromMgstage,
                this.fromJavxyCcCd,
                this.fromMgstageRetail
            ];

            for (const resolver of resolvers) {
                const resolverName = resolver.name || 'anonymous';
                try {
                    this.debug('尝试来源', resolverName);
                    const result = await resolver.call(this, id, rawCode);
                    if (result?.url) {
                        this.debug('来源命中', resolverName, { source: result.source, type: result.type || 'video', url: result.url, qualities: result.qualities ? Object.keys(result.qualities) : [] });
                        if (cacheEnabled) sessionStorage.setItem(this.cacheKey(id), JSON.stringify(result));
                        return result;
                    }
                    this.debug('来源无结果', resolverName);
                } catch (e) {
                    console.warn(`[TrailerResolver] 来源异常: ${resolverName}`, e);
                }
            }
            return null;
        },

        request(url, options = {}) {
            return new Promise((resolve) => {
                GM_xmlhttpRequest({
                    method: options.method || 'GET',
                    url,
                    data: options.data,
                    headers: options.headers || {},
                    timeout: options.timeout || 15000,
                    onload: (r) => resolve(r),
                    onerror: () => resolve(null),
                    ontimeout: () => resolve(null)
                });
            });
        },

        async requestDoc(url, options = {}) {
            const r = await this.request(url, options);
            if (!r || r.status < 200 || r.status >= 400 || !r.responseText) return null;
            return new DOMParser().parseFromString(r.responseText, 'text/html');
        },

        async head(url) {
            const r = await this.request(url, { method: 'HEAD', timeout: 5000 });
            if (!r) return null;
            if (r.status >= 200 && r.status < 400) return r.finalUrl || url;
            return null;
        },

        result(url, source, type = 'video', extra = {}) {
            return { url, source, type, ...extra };
        },

        mgstagePrefixMap: {
            LUXU: '259LUXU',
            MIUM: '300MIUM',
            GANA: '200GANA',
            SIRO: 'SIRO',
            DCV: '277DCV',
            JNT: '390JNT',
            JAC: '390JAC',
            HHH: '451HHH',
            HLM: '436HLM',
            SYS: '332SYS',
            NAMA: '332NAMA',
            HEN: '353HEN',
            ARA: '261ARA',
            FCT: '326FCT',
            ERK: '420ERK',
            STH: '420STH',
            MLA: '476MLA',
            MMC: '812MMC',
            OERO: '892OERO',
            HOI: '420HOI'
        },

        normalizeMgstageCode(text) {
            const raw = String(text || '').toUpperCase().replace(/\s+/g, '-');
            const match = raw.match(/\b((?:\d{3})?[A-Z]{2,10})[-_](\d{2,6})\b/);
            if (!match) return '';
            const prefix = this.mgstagePrefixMap[match[1]] || match[1];
            if (!Object.values(this.mgstagePrefixMap).includes(prefix)) return '';
            return `${prefix}-${match[2]}`;
        },

        mgstageSampleToMp4(url) {
            const cleaned = String(url || '')
                .replace(/\\\//g, '/')
                .replace(/&amp;/g, '&')
                .trim();
            if (!cleaned) return '';
            return cleaned.split('?')[0].replace(/\.ism\/request$/i, '.mp4');
        },

        mgstageHeaders(referer = 'https://www.mgstage.com/') {
            return {
                'accept-language': 'ja-JP,ja;q=0.9,en;q=0.8',
                Cookie: 'adc=1; coc=1',
                Referer: referer
            };
        },

        normalizeMgstageGenericCode(text) {
            const raw = String(text || '').toUpperCase().replace(/\s+/g, '-');
            const match = raw.match(/\b((?:\d{3})?[A-Z]{2,15})[-_](\d{2,9})\b/);
            if (!match || /^FC2$/i.test(match[1])) return '';
            return `${match[1]}-${match[2]}`;
        },

        async fetchMgstageProductTrailer(code, sourceLabel = 'MGStage 素人') {
            const detailUrl = `https://www.mgstage.com/product/product_detail/${code}/?agef=1`;
            this.debug('MGStage 请求详情页', { code, detailUrl });
            const headers = this.mgstageHeaders();
            const detail = await this.request(detailUrl, { timeout: 15000, headers });
            if (!detail?.responseText || detail.status < 200 || detail.status >= 400) {
                this.debug('MGStage 详情页失败', { status: detail?.status, finalUrl: detail?.finalUrl || detailUrl });
                return null;
            }
            if (!this.normalizeForCompare(detail.responseText).includes(this.normalizeForCompare(code))) {
                this.debug('MGStage 详情页未匹配当前番号', { code, finalUrl: detail?.finalUrl || detailUrl });
                return null;
            }

            const pid = detail.responseText.match(/sampleplayer\.html\/([0-9a-f-]{36})/i)?.[1]
                || detail.responseText.match(/[?&]pid=([0-9a-f-]{36})/i)?.[1];
            if (!pid) {
                this.debug('MGStage 未找到 pid');
                return null;
            }

            const apiUrl = `https://www.mgstage.com/sampleplayer/sampleRespons.php?pid=${encodeURIComponent(pid)}`;
            this.debug('MGStage 请求 sample API', { pid, apiUrl });
            const api = await this.request(apiUrl, {
                timeout: 15000,
                headers: {
                    ...headers,
                    Accept: 'application/json,text/plain,*/*',
                    Referer: detailUrl
                }
            });
            if (!api?.responseText || api.status < 200 || api.status >= 400) {
                this.debug('MGStage sample API 失败', { status: api?.status });
                return null;
            }

            let sampleUrl = '';
            try {
                sampleUrl = JSON.parse(api.responseText)?.url || '';
            } catch {
                sampleUrl = api.responseText.match(/"url"\s*:\s*"([^"]+)"/i)?.[1] || '';
            }

            const mp4Url = this.mgstageSampleToMp4(sampleUrl);
            if (!/\.mp4(?:[?#]|$)/i.test(mp4Url)) {
                this.debug('MGStage sample URL 未能转换为 mp4', { sampleUrl, mp4Url });
                return null;
            }

            const finalUrl = await this.head(mp4Url);
            this.debug('MGStage mp4 检测', { mp4Url, finalUrl: finalUrl || null });
            return this.result(finalUrl || mp4Url, sourceLabel, 'video', {
                sourceName: 'MGStage',
                sourceLabel,
                sourceTag: 'MGStage',
                trailerSource: 'MGStage'
            });
        },

        async fromMgstage(id, rawCode = '') {
            const code = this.normalizeMgstageCode(rawCode) || this.normalizeMgstageCode(id);
            if (!code) {
                this.debug('MGStage 跳过：番号不在支持前缀内', { id, rawCode });
                return null;
            }
            return this.fetchMgstageProductTrailer(code, 'MGStage 素人');
        },

        async fromMgstageRetail(id, rawCode = '') {
            const targets = [
                this.normalizeMgstageGenericCode(rawCode),
                this.normalizeMgstageGenericCode(id)
            ].filter(Boolean);
            const uniqueTargets = [...new Set(targets)];
            if (!uniqueTargets.length) {
                this.debug('MGStage 動画跳过：番号格式不适用', { id, rawCode });
                return null;
            }

            for (const code of uniqueTargets) {
                this.debug('MGStage 動画直连尝试', { code });
                const result = await this.fetchMgstageProductTrailer(code, 'MGStage 動画');
                if (result?.url) return result;
            }
            return null;
        },

        qualityOptions: [
            { quality: '4k', text: '4K' },
            { quality: 'hhb', text: '1080p' },
            { quality: '1080p', text: '1080p' },
            { quality: 'hmb', text: '720p' },
            { quality: '720p', text: '720p' },
            { quality: 'mhb', text: '576p' },
            { quality: '540p', text: '540p' },
            { quality: 'mmb', text: '432p' },
            { quality: '480p', text: '480p' },
            { quality: '396p', text: '396p' },
            { quality: '360p', text: '360p' },
            { quality: '240p', text: '240p' }
        ],

        selectHighestQuality(qualityMap) {
            return this.sortQualityKeys(qualityMap)[0] || null;
        },

        sortQualityKeys(qualityMap) {
            const rank = new Map(this.qualityOptions.map((item, index) => [item.quality, index]));
            return Object.keys(qualityMap || {})
                .filter(key => qualityMap[key])
                .sort((a, b) => (rank.get(a) ?? -1) - (rank.get(b) ?? -1));
        },

        javxySourceLabels: {
            DMM: 'Javxy | dmm',
            HEYZO: 'Javxy | Heyzo',
            PACO: 'Javxy | Paco',
            '10MU': 'Javxy | 10mu',
            Caribbean: 'Javxy | 加勒比',
            '1Pondo': 'Javxy | 一本道'
        },

        async fromJavxyCcCd(id, rawCode = '') {
            const query = String(id || rawCode || '').trim();
            if (!query) {
                this.debug('Javxy 跳过：查询词为空');
                return null;
            }

            const apiUrl = `https://javxy.cc.cd/trailers/${encodeURIComponent(query)}?client=laosiji-new`;
            this.debug('Javxy 请求 API', { query, apiUrl });
            const r = await this.request(apiUrl, {
                timeout: 15000,
                headers: { Accept: 'application/json,text/plain,*/*' }
            });
            if (!r?.responseText || r.status < 200 || r.status >= 400) {
                this.debug('Javxy API 失败', { status: r?.status });
                return null;
            }

            let data;
            try {
                data = JSON.parse(r.responseText);
            } catch {
                this.debug('Javxy JSON 解析失败');
                return null;
            }

            const trailerUrl = String(data?.trailer || '').trim();
            if (!trailerUrl) {
                this.debug('Javxy 无 trailer 字段', { keys: Object.keys(data || {}) });
                return null;
            }

            const qualityMap = data?.qualities && typeof data.qualities === 'object' ? data.qualities : {};
            const quality = data?.quality && qualityMap[data.quality] ? data.quality : this.selectHighestQuality(qualityMap);
            const source = this.javxySourceLabels[data?.source] || `Javxy | ${data?.source || 'dmm'}`;
            this.debug('Javxy 返回结果', { source: data?.source, quality, qualities: Object.keys(qualityMap) });

            return this.result(qualityMap[quality] || trailerUrl, source, 'video', {
                qualities: qualityMap,
                quality,
                urls: Array.isArray(data?.urls) && data.urls.length
                    ? data.urls
                    : this.sortQualityKeys(qualityMap).map(key => qualityMap[key])
            });
        },

        async fromFc2Hub(id, rawCode) {
            const checkCode = rawCode || id;
            if (!/FC2/i.test(checkCode)) return null;
            const numMatch = (rawCode || '').match(/(\d{6,9})/) || id.match(/(\d{6,9})/);
            if (!numMatch) return null;
            const vid = numMatch[1];

            const embedUrl = `https://adult.contents.fc2.com/embed/${vid}`;
            const embedRes = await this.request(embedUrl, { timeout: 15000 });
            if (!embedRes?.responseText) return null;

            const tokenMatch = embedRes.responseText.match(/push\(\['ae',\s*'([a-f0-9]{32})'\]/);
            if (!tokenMatch) return null;
            const token = tokenMatch[1];

            const apiUrl = `https://adult.contents.fc2.com/api/v2/videos/${vid}/sample?key=00000000000000000000000000000000`;
            const apiRes = await this.request(apiUrl, {
                timeout: 15000,
                headers: { 'X-FC2-Contents-Access-Token': token }
            });
            if (!apiRes?.responseText) return null;

            let json;
            try { json = JSON.parse(apiRes.responseText); } catch { return null; }
            if (!json.path) return null;

            return this.result(json.path, 'FC2Hub 预告', 'mp4');
        },



    };

    const Settings = {
        getPreviewCacheEnabled() {
            return true;
        },
        setPreviewCacheEnabled(value) {
            GM_setValue('preview_cache_enabled', value);
        },
        getTrailerCacheEnabled() {
            return true;
        },
        setTrailerCacheEnabled(value) {
            GM_setValue('trailer_cache_enabled', value);
        },
        defaults: {
            'sukebei':    { enabled: true },
            '169bbs':     { enabled: true },
            'supjav':     { enabled: true },
            'emby':       { enabled: true },
            'javbus':     { enabled: true },
            'javdb':      { enabled: true },
            'javlibrary': { enabled: true },
            'javrate':    { enabled: true },
            'sehuatang':  { enabled: true },
            'hjd2048':    { enabled: true },
            'missav':     { enabled: true }
        },

        get(siteId) {
            const saved = GM_getValue(`settings_${siteId}`, null);
            const defaults = this.defaults[siteId] || { enabled: true };
            if (saved) {
                return { ...defaults, ...JSON.parse(saved) };
            }
            return { ...defaults };
        },

        set(siteId, settings) {
            GM_setValue(`settings_${siteId}`, JSON.stringify(settings));
        },

        getAllFeatures() {
            return ['enabled'];
        },

        getFeatureName(feature) {
            const map = {
                enabled: '启用本站点功能'
            };
            return map[feature] || feature;
        },

        getDefaultSearchEngine() {
            const index = GM_getValue('default_search_engine', 2);
            return SearchEngines[index] || SearchEngines[0];
        },

        setDefaultSearchEngine(index) {
            GM_setValue('default_search_engine', index);
        },

        getDefaultVideoEngine() {
            return GM_getValue('default_video_engine', 'missav');
        },

        getVideoEngines() {
            return VIDEO_ENGINES;
        },

        getSourceOrder() {
            return GM_getValue('thumb_source_order', ['javfree', 'projectjav', 'javstore']);
        },
        setSourceOrder(order) {
            GM_setValue('thumb_source_order', order);
        }
    };

    const SearchEngines = [
        { name: 'BTDigg', color: '#F60', url: (code) => `https://btdig.com/search?q=${code}` },
        { name: 'Taocili', color: '#DE5833', url: (code) => `https://taocili.com/search?q=${code}` },
        { name: 'Google', color: '#4285F4', url: (code) => `https://www.google.com/search?q=${code}` },
        { name: 'Bing', color: '#008373', url: (code) => `https://www.bing.com/search?q=${code}` },
        { name: 'DuckGo', color: '#DE5833', url: (code) => `https://duckduckgo.com/?q=${code}` }
    ];

    const Pan115 = {
        api: 'https://webapi.115.com/files/search',
        videoExts: new Set(['mp4', 'mkv', 'avi', 'wmv', 'mov', 'm4v', 'ts', 'flv', 'rmvb', 'webm']),
        pending: new Map(),
        cachePrefix: 'pan115_cache_v5_',
        mgstagePrefixMap: {
            LUXU: '259LUXU',
            MIUM: '300MIUM',
            GANA: '200GANA',
            SIRO: 'SIRO',
            DCV: '277DCV',
            JNT: '390JNT',
            JAC: '390JAC',
            HHH: '451HHH',
            HLM: '436HLM',
            SYS: '332SYS',
            NAMA: '332NAMA',
            HEN: '353HEN',
            ARA: '261ARA',
            FCT: '326FCT',
            ERK: '420ERK',
            STH: '420STH',
            MLA: '476MLA',
            MMC: '812MMC',
            OERO: '892OERO',
        },
        sourceAliases: {
            PACO: ['PACO', 'PACOPACOMAMA'],
            PACOPACOMAMA: ['PACO', 'PACOPACOMAMA'],
            '10MU': ['10MU', '10MUSUME'],
            '10MUSUME': ['10MU', '10MUSUME'],
            '1PON': ['1PON', '1PONDO'],
            '1PONDO': ['1PON', '1PONDO'],
            CARIB: ['CARIB', 'CARIBBEANCOM'],
            CARIBBEANCOM: ['CARIB', 'CARIBBEANCOM'],
            HEYZO: ['HEYZO'],
        },
        enabled() {
            return GM_getValue('btn_show_pan115', false);
        },
        normalizeCode(code) {
            return String(code || '').trim().toUpperCase().replace(/[_\s]+/g, '-');
        },
        normalizeKeepSeparator(code) {
            return String(code || '').trim().toUpperCase().replace(/\s+/g, '-');
        },
        playUrl(pickcode) {
            const encoded = encodeURIComponent(pickcode);
            const playerMode = GM_getValue('pan115_player_mode', 'official');
            if (playerMode === '115master') {
                return `https://115.com/web/lixian/master/video/?pick_code=${encoded}`;
            }
            return `https://115vod.com/?pickcode=${encoded}&share_id=0`;
        },
        cacheKey(code) {
            return `${this.cachePrefix}${this.normalizeKeepSeparator(code)}`;
        },
        getCached(code) {
            try {
                const raw = sessionStorage.getItem(this.cacheKey(code));
                if (!raw) return undefined;
                return JSON.parse(raw);
            } catch {
                return undefined;
            }
        },
        setCached(code, value) {
            try {
                sessionStorage.setItem(this.cacheKey(code), JSON.stringify(value || null));
            } catch {}
        },
        sourcePattern() {
            return Object.keys(this.sourceAliases).sort((a, b) => b.length - a.length).join('|');
        },
        sourceGroup(source) {
            return this.sourceAliases[String(source || '').toUpperCase()] || [String(source || '').toUpperCase()].filter(Boolean);
        },
        uncensoredParts(code) {
            const normalized = this.normalizeKeepSeparator(code);
            const match = normalized.match(/^(\d{6})([-_])(\d{2,3})(?:[-_]([A-Z0-9]+))?$/);
            return match ? { date: match[1], sep: match[2], num: match[3], source: match[4] || '' } : null;
        },
        uncensoredDigitKey(code) {
            const parts = this.uncensoredParts(code);
            return parts ? `${parts.date}${parts.sep}${parts.num}` : '';
        },
        extractCode(text, fallbackCode = '') {
            const sourcePattern = this.sourcePattern();
            const tail = String(text || '').match(new RegExp(`\\b(\\d{6})([-_])(\\d{2,3})[-_\\s]*(${sourcePattern})\\b`, 'i'));
            if (tail) {
                const source = tail[4].toUpperCase();
                const sep = tail[2] === '_' ? '_' : '-';
                return `${tail[1]}${sep}${tail[3]}-${source}`;
            }
            const head = String(text || '').match(new RegExp(`\\b(${sourcePattern})[-_\\s]*(\\d{6})([-_])(\\d{2,3})\\b`, 'i'));
            if (head) {
                const source = head[1].toUpperCase();
                const sep = head[3] === '_' ? '_' : '-';
                return `${head[2]}${sep}${head[4]}-${source}`;
            }
            return fallbackCode || Utils.extractCode(text);
        },
        searchKeyword(code) {
            return String(code || '').trim().toLowerCase().replace(/^fc2-/, '');
        },
        searchVariants(code) {
            const normalized = this.normalizeKeepSeparator(code);
            const variants = [normalized];
            const mgstage = normalized.match(/^(\d{3})([A-Z]{2,10})-(\d{2,6})$/);
            if (mgstage && Object.values(this.mgstagePrefixMap).includes(`${mgstage[1]}${mgstage[2]}`)) {
                variants.push(`${mgstage[2]}-${mgstage[3]}`);
            }
            const shortMgstage = normalized.match(/^([A-Z]{2,10})-(\d{2,6})$/);
            if (shortMgstage && this.mgstagePrefixMap[shortMgstage[1]]) {
                variants.push(`${this.mgstagePrefixMap[shortMgstage[1]]}-${shortMgstage[2]}`);
            }
            const uncensored = this.uncensoredParts(normalized);
            if (uncensored) {
                variants.push(`${uncensored.date}${uncensored.sep}${uncensored.num}`);
                if (uncensored.source) {
                    this.sourceGroup(uncensored.source).forEach(source => {
                        variants.push(`${uncensored.date}${uncensored.sep}${uncensored.num}-${source}`);
                        variants.push(`${source}-${uncensored.date}${uncensored.sep}${uncensored.num}`);
                    });
                }
            }
            return [...new Set(variants.filter(Boolean))];
        },
        codeRegex(code) {
            const digitKey = this.uncensoredDigitKey(code);
            if (digitKey) {
                const parts = this.uncensoredParts(code);
                const sep = parts.sep === '_' ? '_' : '-';
                return new RegExp(`(^|[^0-9])${parts.date}${sep}${parts.num}([^0-9]|$)`, 'i');
            }
            const patterns = [];
            const add = value => {
                const normalized = this.normalizeCode(value);
                if (!normalized) return;
                const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[-_]/g, '[-_\\s]?');
                patterns.push(escaped, normalized.replace(/[-_]/g, ''));
            };
            this.searchVariants(code).forEach(add);
            return new RegExp(`(?:${[...new Set(patterns)].join('|')})`, 'i');
        },
        isVideoName(name) {
            const ext = String(name || '').split('.').pop().toLowerCase();
            return this.videoExts.has(ext);
        },
        flattenFiles(payload) {
            const candidates = [
                payload?.data,
                payload?.data?.list,
                payload?.data?.files,
                payload?.data?.items,
                payload?.files,
                payload?.list,
            ];
            const arr = candidates.find(Array.isArray) || [];
            return arr.map(item => ({
                name: item.n || item.name || item.file_name || item.filename || item.title || '',
                pickcode: item.pc || item.pickcode || item.pick_code || item.pickCode || item.pick || '',
                raw: item,
            })).filter(item => item.name);
        },
        async requestSearch(keyword) {
            const query = new URLSearchParams({
                search_value: keyword,
                limit: '30',
                offset: '0',
            });
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: `${this.api}?${query}`,
                    timeout: 15000,
                    anonymous: false,
                    headers: { Accept: 'application/json, text/plain, */*' },
                    onload: r => {
                        try {
                            resolve(JSON.parse(r.responseText));
                        } catch (err) {
                            reject(new Error('115返回不是JSON，可能未登录'));
                        }
                    },
                    onerror: () => reject(new Error('115请求失败')),
                    ontimeout: () => reject(new Error('115请求超时')),
                });
            });
        },
        async search(code) {
            const matcher = this.codeRegex(code);
            const seen = new Set();
            for (const keyword of this.searchVariants(code).map(item => this.searchKeyword(item))) {
                const payload = await this.requestSearch(keyword);
                const state = payload?.state ?? payload?.success;
                if (state === false) {
                    const msg = payload?.error || payload?.message || payload?.errno || '115查询失败';
                    throw new Error(String(msg));
                }
                for (const item of this.flattenFiles(payload)) {
                    const key = item.pickcode || item.name;
                    if (seen.has(key)) continue;
                    seen.add(key);
                    if (matcher.test(item.name) && this.isVideoName(item.name)) return item;
                }
            }
            return null;
        },
        async searchCached(code) {
            const normalized = this.normalizeKeepSeparator(code);
            if (!normalized) return null;
            const cached = this.getCached(normalized);
            if (cached !== undefined) return cached;
            if (this.pending.has(normalized)) return this.pending.get(normalized);
            const task = this.search(normalized)
                .then(hit => {
                    this.setCached(normalized, hit || null);
                    return hit || null;
                })
                .finally(() => this.pending.delete(normalized));
            this.pending.set(normalized, task);
            return task;
        },
    };

    function closeAllJumpMenus(exceptMenu = null) {
        document.querySelectorAll('.search-submenu.is-open').forEach(menu => {
            if (menu !== exceptMenu) menu.classList.remove('is-open');
        });
    }

    function bindJumpMenu(menuDiv, toggleBtn, subMenu, mainBtn = null) {
        let closeTimer = null;
        const clearCloseTimer = () => {
            if (closeTimer) {
                clearTimeout(closeTimer);
                closeTimer = null;
            }
        };
        const closeMenu = () => {
            clearCloseTimer();
            subMenu.classList.remove('is-open');
        };
        const scheduleClose = () => {
            clearCloseTimer();
            if (subMenu.classList.contains('is-open')) closeTimer = setTimeout(closeMenu, 1000);
        };

        toggleBtn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            const willOpen = !subMenu.classList.contains('is-open');
            closeAllJumpMenus(subMenu);
            clearCloseTimer();
            subMenu.classList.toggle('is-open', willOpen);
            if (willOpen && !menuDiv.matches(':hover')) scheduleClose();
        });
        menuDiv.addEventListener('mouseenter', clearCloseTimer);
        menuDiv.addEventListener('mouseleave', scheduleClose);
        if (mainBtn) mainBtn.addEventListener('click', closeMenu);
        subMenu.addEventListener('click', e => {
            if (e.target.closest('a')) closeMenu();
        });
        document.addEventListener('click', e => {
            if (!menuDiv.contains(e.target)) closeMenu();
        });
    }

    function addNyaaBtn(code, container, useCapture = false) {
        if (!GM_getValue('btn_show_nyaa', true)) return;
        if (/sukebei\.nyaa/i.test(location.hostname)) return;
        const btn = Utils.createJumpLinkBtn('🔍 Sukebei', '#17a2b8', `https://sukebei.nyaa.si/?f=0&c=0_0&q=${encodeURIComponent(code)}`);
        container.appendChild(btn);
    }

    function addJavbusBtn(code, container, useCapture = false) {
        if (!GM_getValue('btn_show_javbus', true)) return;
        if (/javbus\.com/i.test(location.hostname)) return;
        const url = Utils.getJavBusUrl(code);
        const btn = Utils.createJumpLinkBtn('🎬 JavBus', '#007bff', url);
        container.appendChild(btn);
    }

    function addJavdbBtn(code, container, useCapture = false) {
        if (!GM_getValue('btn_show_javdb', true)) return;
        if (/javdb\.com/i.test(location.hostname)) return;
        const btn = Utils.createJumpLinkBtn('📀 JavDB', '#6f42c1', `https://javdb.com/search?q=${encodeURIComponent(code)}`);
        container.appendChild(btn);
    }

    function addMissAVBtn(code, container, useCapture = false) {
        const showMissav = GM_getValue('btn_show_missav', true);
        if (!showMissav) return;

        const codeLower = code.toLowerCase();
        const codeCompactLower = codeLower.replace(/-/g, '');
        const videoUrlMap = {
            missav: `https://missav.ws/${codeLower}`,
            jable: `https://jable.tv/videos/${codeLower}/`,
            '123av': `https://123av.com/zh/v/${codeLower}`,
            javday: `https://javday.app/videos/${codeCompactLower}/`,
            supjav: `https://supjav.com/zh/?s=${encodeURIComponent(code)}`,
            javrate: `https://www.javrate.com/search/${encodeURIComponent(codeLower)}`,
        };
        const enabledVideoKeys = new Set([
            ...(showMissav ? ['missav', 'jable', '123av', 'javday', 'supjav', 'javrate'] : []),
        ]);
        const videoButtons = Settings.getVideoEngines()
            .filter(item => enabledVideoKeys.has(item.key) && !item.host.test(location.hostname))
            .map(item => ({ ...item, url: videoUrlMap[item.key] }))
            .filter(item => item.url);
        if (!videoButtons.length) return;

        const defaultKey = Settings.getDefaultVideoEngine();
        const mainItem = videoButtons.find(item => item.key === defaultKey) || videoButtons[0];
        const subItems = videoButtons.filter(item => item !== mainItem);
        const createVideoBtn = item => Utils.createJumpLinkBtn(`🎬 ${item.label}`, item.color, item.url);

        if (!subItems.length) {
            container.appendChild(createVideoBtn(mainItem));
            return;
        }

        const menuDiv = document.createElement('div');
        menuDiv.className = 'search-menu missav-menu';
        menuDiv.style.setProperty('--jav-btn-accent', mainItem.color);

        const mainBtn = createVideoBtn(mainItem);
        mainBtn.classList.add('search-main-btn');
        menuDiv.appendChild(mainBtn);

        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'search-toggle-btn';
        toggleBtn.title = '展开同类站点';
        toggleBtn.innerHTML = '<span class="search-arrow">▼</span>';
        menuDiv.appendChild(toggleBtn);

        const subMenu = document.createElement('div');
        subMenu.className = 'search-submenu';
        subItems.forEach(item => {
            const subBtn = createVideoBtn(item);
            subBtn.style.margin = '2px 0';
            subBtn.style.width = '100%';
            subBtn.style.textAlign = 'left';
            subMenu.appendChild(subBtn);
        });
        menuDiv.appendChild(subMenu);

        bindJumpMenu(menuDiv, toggleBtn, subMenu, mainBtn);

        container.appendChild(menuDiv);
    }

    function addDmmBtn(code, container, useCapture = false) {
        if (!GM_getValue('btn_show_fanza', true)) return;
        const btn = Utils.createBtn('▶ FANZA', '#c0392b', () => {
            window.open(`https://www.dmm.co.jp/mono/-/search/=/searchstr=${encodeURIComponent(code)}/`);
        }, useCapture);
        container.appendChild(btn);
    }

    function addTrailerBtn(code, container, useCapture = false) {
        if (!GM_getValue('btn_show_trailer', true)) return;
        const btn = Utils.createBtn('🎞️ 预告片', '#111827', async () => {
            const oldText = btn.textContent;
            btn.textContent = '🎞️ 解析中...';
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.72';
            try {
                await Trailer.show(code);
            } finally {
                btn.textContent = oldText;
                btn.style.pointerEvents = '';
                btn.style.opacity = '';
            }
        }, useCapture);
        btn.classList.add('jav-trailer-btn');
        container.appendChild(btn);
    }

    function addPreviewBtn(code, container, useCapture = false) {
        if (!GM_getValue('btn_show_preview', true)) return;
        const btn = Utils.createBtn('🖼️ 预览图', '#28a745', async () => {
            await Thumbnail.show(code);
        }, useCapture);
        btn.classList.add('jav-preview-btn');
        container.appendChild(btn);
    }

    function addPan115PlayBtn(code, container, useCapture = false) {
        if (!Pan115.enabled() || !code || !container) return;
        const normalized = Pan115.normalizeKeepSeparator(code);
        if (!normalized || container.dataset.pan115PlayCode === normalized) return;
        container.dataset.pan115PlayCode = normalized;
        const marker = document.createComment('pan115-play');
        const anchor = container.querySelector('.jav-trailer-btn, .jav-preview-btn, .jav-settings-btn');
        container.insertBefore(marker, anchor || null);
        Pan115.searchCached(normalized).then(hit => {
            const pickcode = hit?.pickcode;
            if (!Pan115.enabled() || !pickcode || !marker.parentNode) return;
            const btn = Utils.createJumpLinkBtn('115播放', '#00a85a', Pan115.playUrl(pickcode));
            btn.classList.add('jav-pan115-play-btn');
            btn.dataset.pickcode = pickcode;
            btn.title = hit.name || `115播放：${normalized}`;
            marker.parentNode.insertBefore(btn, marker);
        }).catch(err => {
            console.warn('[老司机] 115自动查询失败:', err);
        }).finally(() => {
            marker.remove();
        });
    }

    function addSearchMenu(code, container, useCapture = false) {
        if (!GM_getValue('btn_show_search', true)) return;
        const defaultEngine = Settings.getDefaultSearchEngine();

        const menuDiv = document.createElement('div');
        menuDiv.className = 'search-menu';
        menuDiv.style.setProperty('--jav-btn-accent', defaultEngine.color);

        const mainBtn = Utils.createBtn(`🔍 ${defaultEngine.name}`, defaultEngine.color, () => {
            window.open(defaultEngine.url(code));
        }, useCapture);
        mainBtn.classList.add('search-main-btn');
        menuDiv.appendChild(mainBtn);

        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'search-toggle-btn';
        toggleBtn.title = '展开搜索引擎';
        toggleBtn.innerHTML = '<span class="search-arrow">▼</span>';
        menuDiv.appendChild(toggleBtn);

        const subMenu = document.createElement('div');
        subMenu.className = 'search-submenu';

        SearchEngines.forEach(engine => {
            if (engine.name === defaultEngine.name) return;

            const subBtn = Utils.createBtn(`🔍 ${engine.name}`, engine.color, () => {
                window.open(engine.url(code));
                subMenu.classList.remove('is-open');
            }, useCapture);
            subBtn.style.margin = '2px 0';
            subBtn.style.width = '100%';
            subBtn.style.textAlign = 'left';
            subMenu.appendChild(subBtn);
        });

        menuDiv.appendChild(subMenu);

        bindJumpMenu(menuDiv, toggleBtn, subMenu, mainBtn);

        container.appendChild(menuDiv);
    }

    function addSettingsBtn(container, useCapture = false) {
        if (!container || container.querySelector('.jav-settings-btn')) return;
        const btn = Utils.createBtn('⚙️ 设置', '#475569', () => {
            if (typeof window.__LAOSIJI_OPEN_SETTINGS__ === 'function') {
                window.__LAOSIJI_OPEN_SETTINGS__();
            }
        }, useCapture);
        btn.classList.add('jav-settings-btn');
        btn.title = '打开老司机设置';
        container.appendChild(btn);
    }

    function createPan115Badge(hit, code, asAnchor = true) {
        const url = Pan115.playUrl(hit.pickcode);
        const badge = document.createElement(asAnchor ? 'a' : 'span');
        badge.className = 'jav-pan115-badge';
        badge.textContent = '115匹配';
        badge.title = hit.name || `115播放：${Pan115.normalizeKeepSeparator(code)}`;
        badge.dataset.pickcode = hit.pickcode;
        if (asAnchor) {
            badge.href = url;
            badge.target = '_blank';
            badge.rel = 'noopener noreferrer';
            badge.addEventListener('click', e => {
                e.stopImmediatePropagation();
            }, true);
        } else {
            badge.setAttribute('role', 'link');
            badge.tabIndex = 0;
            const open = e => {
                e.preventDefault();
                e.stopImmediatePropagation();
                window.open(Pan115.playUrl(badge.dataset.pickcode), '_blank', 'noopener,noreferrer');
            };
            badge.addEventListener('click', open, true);
            badge.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') open(e);
            }, true);
        }
        return badge;
    }

    function findPan115TitleTextNode(anchor) {
        const root = anchor.querySelector('.video-title, .title, [class*="title"], h1, h2, h3, h4, h5, p') || anchor;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        });
        return walker.nextNode();
    }

    function findPan115TitleAnchor(anchor) {
        if (!anchor || anchor.closest('.jav-jump-btn-group, .jav-pan115-badge')) return null;
        if (anchor.closest('.emby-btn, .emby-badge, .emby-button-group, .emby-javlibrary-list-badge')) return null;
        const href = anchor.getAttribute('href') || '';
        if (/^(?:magnet:|javascript:|#)/i.test(href)) return null;
        const text = [
            anchor.getAttribute('title'),
            anchor.getAttribute('aria-label'),
            anchor.textContent,
            href,
        ].filter(Boolean).join(' ');
        const code = Utils.extractCode(text);
        const pan115Code = Pan115.extractCode(text, code);
        if (!code || !pan115Code) return null;
        const visibleTitle = (anchor.textContent || anchor.getAttribute('title') || '').trim();
        const hasTitleText = visibleTitle.length > 0;
        if (!hasTitleText) return null;
        const looksLikeVideoLink =
            /\/v\/\w+/i.test(href) ||
            /(?:^|\/|\.)jav\w+\.html(?:[?#].*)?$/i.test(href) ||
            /\/videos\/[a-z0-9-]+\/?/i.test(href) ||
            /\/(?:[a-z]{2,15}-\d{2,10}|fc2[-_]?ppv[-_]?\d{6,9})\/?$/i.test(href) ||
            /\/(?:[a-z]{2,15}\d{3,6})\/?$/i.test(href) ||
            /(?:movie|video|detail|view|jav)/i.test(href);
        const inListContainer = !!anchor.closest('.movie-list, .movies, .grid, #waterfall, .movie-box, .box, .thumbnail, .video-list, .video-list-row, .section-container, .videothumblist');
        if (!looksLikeVideoLink && !inListContainer) return null;
        if (hasTitleText && !Utils.extractCode(visibleTitle) && !looksLikeVideoLink) return null;
        return { anchor, code: pan115Code };
    }

    function collectPan115ListTargets() {
        if (isCurrentDetailPage()) return [];
        const isSupjavList = /supjav\.com/.test(location.hostname);
        const seen = new Set();
        const targets = [];
        if (/(javlibrary|javlib|r86m|s87n)/i.test(location.hostname)) {
            document.querySelectorAll('.videothumblist .video > a[href]:not(.emby-javlibrary-list-badge)').forEach(anchor => {
                if (seen.has(anchor) || anchor.dataset.pan115Checked === '1') return;
                if (anchor.closest('.emby-btn, .emby-badge, .emby-button-group, .emby-javlibrary-list-badge')) return;
                const card = anchor.closest('.video');
                const text = [
                    card?.querySelector('.id')?.textContent,
                    card?.querySelector('.title')?.textContent,
                    anchor.getAttribute('title'),
                    anchor.href,
                ].filter(Boolean).join(' ');
                const code = Utils.extractCode(text);
                const pan115Code = Pan115.extractCode(text, code);
                if (!code || !pan115Code) return;
                seen.add(anchor);
                targets.push({ anchor, code: pan115Code });
            });
        }
        const selectors = [
            ...(isSupjavList ? ['.post h3 a[href]'] : []),
            '.movie-list a[href]',
            '.videothumblist .video > a[href]:not(.emby-javlibrary-list-badge)',
            '.movies a[href]',
            '.grid a[href]',
            '.item a[href]',
            '.video-title a[href]',
            'a.movie-box[href]',
            'a.box[href]',
            'a[href*="/v/"]',
            'a[title][href]',
        ];
        document.querySelectorAll(selectors.join(',')).forEach(anchor => {
            if (seen.has(anchor) || anchor.dataset.pan115Checked === '1') return;
            if (isSupjavList && !anchor.matches('.post h3 a[href]')) return;
            seen.add(anchor);
            const target = findPan115TitleAnchor(anchor);
            if (target) targets.push(target);
        });
        return targets;
    }

    function insertPan115ListBadge(anchor, hit, code) {
        if (!Pan115.enabled() || !hit?.pickcode || !anchor || anchor.dataset.pan115HasBadge === '1') return;
        if (anchor.matches?.('.emby-javlibrary-list-badge') || anchor.closest?.('.emby-btn, .emby-badge, .emby-button-group, .emby-javlibrary-list-badge')) return;
        const title = anchor.querySelector('.title, .video-title');
        if (title) {
            const badge = createPan115Badge(hit, code, false);
            const javlibHeadline = title.querySelector('.javlib-card-headline');
            if (javlibHeadline) {
                javlibHeadline.insertBefore(badge, javlibHeadline.firstChild);
                anchor.dataset.pan115HasBadge = '1';
                return;
            }
            const javdbHeadline = title.querySelector('.javdb-card-headline');
            if (javdbHeadline) {
                javdbHeadline.insertBefore(badge, javdbHeadline.firstChild);
                anchor.dataset.pan115HasBadge = '1';
                return;
            }
            title.insertBefore(badge, title.firstChild);
            anchor.dataset.pan115HasBadge = '1';
            return;
        }
        const textNode = findPan115TitleTextNode(anchor);
        if (textNode?.parentNode && anchor.contains(textNode.parentNode)) {
            const badge = createPan115Badge(hit, code, false);
            textNode.parentNode.insertBefore(badge, textNode);
        } else {
            const badge = createPan115Badge(hit, code, true);
            anchor.parentNode?.insertBefore(badge, anchor);
        }
        anchor.dataset.pan115HasBadge = '1';
    }

    let pan115ListRunning = false;
    async function renderPan115ListBadges() {
        if (!Pan115.enabled() || pan115ListRunning || isCurrentDetailPage()) return;
        pan115ListRunning = true;
        const targets = collectPan115ListTargets().slice(0, 36);
        try {
            targets.forEach(({ anchor }) => {
                anchor.dataset.pan115Checked = '1';
            });
            await Promise.all(targets.map(async ({ anchor, code }) => {
                try {
                    const hit = await Pan115.searchCached(code);
                    insertPan115ListBadge(anchor, hit, code);
                } catch (err) {
                    console.warn('[老司机] 115列表单项查询失败:', err);
                }
            }));
        } catch (err) {
            console.warn('[老司机] 115列表自动查询失败:', err);
        } finally {
            pan115ListRunning = false;
            if (Pan115.enabled() && collectPan115ListTargets().length) schedulePan115ListBadges();
        }
    }

    function removePan115Ui() {
        clearTimeout(pan115ListTimer);
        document.querySelectorAll('.jav-pan115-badge, .jav-pan115-play-btn').forEach(el => el.remove());
        document.querySelectorAll('[data-pan115-checked], [data-pan115-has-badge]').forEach(el => {
            delete el.dataset.pan115Checked;
            delete el.dataset.pan115HasBadge;
        });
        document.querySelectorAll('[data-pan115-play-code]').forEach(el => {
            delete el.dataset.pan115PlayCode;
        });
    }

    function refreshPan115PlayerLinks() {
        document.querySelectorAll('.jav-pan115-badge[data-pickcode], .jav-pan115-play-btn[data-pickcode]').forEach(el => {
            const url = Pan115.playUrl(el.dataset.pickcode);
            if (el.tagName === 'A') el.href = url;
        });
    }

    function forceRenderPan115Ui() {
        refreshPan115PlayerLinks();
        if (isCurrentDetailPage()) {
            renderButtonsForCurrentPage();
        } else {
            schedulePan115ListBadges();
        }
    }

    function syncPan115AfterSettingsSave(enabled = Pan115.enabled()) {
        if (!enabled) {
            removePan115Ui();
            return;
        }
        setTimeout(forceRenderPan115Ui, 0);
    }
    window.__LAOSIJI_SYNC_PAN115__ = syncPan115AfterSettingsSave;

    function addJumpLineBreak(container) {
        const lineBreak = document.createElement('span');
        lineBreak.className = 'jav-jump-line-break';
        lineBreak.style.cssText = 'flex-basis:100%;height:0;padding:0;margin:0;';
        container.appendChild(lineBreak);
    }

    const Sites = [
        {
            id: 'sukebei',
            name: 'Sukebei',
            match: (url) => /nyaa\.si/.test(url) && url.includes('/view/'),
            titleSelector: '.panel-title'
        },
        {
            id: '169bbs',
            name: '169bbs',
            match: (url) => /169bbs\.(com|net|org)/.test(url) && url.includes('mod=viewthread'),
            titleSelector: '#thread_subject, h1'
        },
        {
            id: 'supjav',
            name: 'SupJav',
            match: (url) => /supjav\.com/.test(url) && /\/\d+\.html$/.test(url),
            titleSelector: '.clearfix.post-meta > h2'
        },
        {
            id: 'emby',
            name: 'Emby',
            match: (url) => {
                try {
                    const u = new URL(url);
                    if (!/\/web\/index\.html/.test(u.pathname)) return false;
                    return /emby|jellyfin/i.test(u.hostname) || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(u.hostname);
                } catch {
                    return false;
                }
            },
            titleSelector: 'h1'
        },
        {
            id: 'javbus',
            name: 'JavBus',
            match: (url) => /javbus\.com/.test(url) && !/search|genre|actresses|uncensored|forum|page|series|studio|label|director|star/.test(url),
            titleSelector: 'h3'
        },
        {
            id: 'javdb',
            name: 'JavDB',
            match: (url) => /javdb\d*\.com/.test(url) && /\/v\/\w+/.test(url),
            titleSelector: 'h2.title'
        },
        {
            id: 'javlibrary',
            name: 'JAVLibrary',
            match: (url) => /javlibrary\.com/.test(url) && /\/cn\/jav\w+\.html/.test(url),
            titleSelector: '.post-title'
        },
        {
            id: 'javrate',
            name: 'Javrate',
            match: (url) => /javrate\.com/.test(url) && /\/movie\/detail\//i.test(url),
            titleSelector: 'h1'
        },
        {
            id: 'sehuatang',
            name: 'Sehuatang',
            match: (url) => /sehuatang\.(net|org|com)/.test(url) && url.includes('mod=viewthread'),
            titleSelector: '#thread_subject, h1'
        },
        {
            id: 'hjd2048',
            name: 'HJD2048',
            match: (url) => /hjd2048\.com/.test(url) && /\/2048\//.test(url),
            titleSelector: 'h1#subject_tpc, h1'
        },
        {
            id: 'missav',
            name: 'MissAV',
            match: (url) => {
                if (!/missav\.(ws|com)/.test(url)) return false;
                const pathname = new URL(url).pathname;
                if (/^\/$|\/search|\/tags|\/actresses|\/genres/.test(pathname)) return false;
                return /\/[a-z]{2,10}-\d+/i.test(pathname);
            },
            titleSelector: 'h1[class*="text-nord6"], h1'
        },
        {
            id: 'jable',
            name: 'Jable',
            match: (url) => /jable\.tv/.test(url) && /\/videos\/[a-z0-9-]+\/?/i.test(new URL(url).pathname),
            titleSelector: '.header-left > h4'
        }
    ];

    function isCurrentDetailPage() {
        if (/javbus\.com/i.test(location.hostname)) {
            return /^\/(?:[a-z]{2}\/)?(?:[A-Z]{2,15}-?\d{2,10}(?:-\d{1,3})?|[A-Z]{2,10}\d{3,6}|FC2(?:-PPV)?-\d{6,9})\/?$/i.test(location.pathname);
        }
        return Sites.some(site => site.match(window.location.href));
    }

    function isElemVisible(el) {
        if (!el) return false;
        if (el.closest('.hide, [hidden], [aria-hidden="true"]')) return false;
        const rects = el.getClientRects();
        if (!rects || rects.length === 0) return false;
        const cs = window.getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return false;
        return true;
    }

    function resolveEmbyTitleElem() {


        const nodes = Array.from(document.querySelectorAll(
            'h1, h2, h3.itemName, .itemName-primary, .pageTitle, .nameContainer h3, [class*="itemName"]'
        ));
        let firstVisible = null;
        for (const el of nodes) {
            const txt = (el.textContent || '').trim();
            if (!txt) continue;
            if (!isElemVisible(el)) continue;
            if (!firstVisible) firstVisible = el;
            if (Utils.extractCode(txt)) return el;
        }
        return firstVisible;
    }





    function getEmbyInsertAnchor(titleElem) {
        return titleElem.closest('.itemPrimaryNameContainer, .nameContainer, .detailPageWrapperContainer .infoWrapper') || titleElem;
    }

    function renderButtonsForCurrentPage() {
        const site = Sites.find(s => s.match(window.location.href));
        if (!site) return;

        let titleElem = site.id === 'emby'
            ? resolveEmbyTitleElem()
            : document.querySelector(site.titleSelector);
        if (!titleElem) return;
        if (site.id === 'emby' && !Utils.extractCode(titleElem.textContent || '')) return;

        const getEmbyRenderKey = () => {
            const hash = location.hash || '';
            const itemId = hash.match(/item\?id=([^&]+)/i)?.[1]
                || new URLSearchParams(hash.split('?')[1] || '').get('id')
                || '';
            const title = (titleElem.textContent || '').trim();
            return `${itemId}::${title}`;
        };

        const existingBtnGroup = document.querySelector('.jav-jump-btn-group[data-laosiji-jump="1"]');
        if (site.id === 'emby') {
            const renderKey = getEmbyRenderKey();
            const existingKey = existingBtnGroup?.dataset.embyRenderKey || '';
            if (existingBtnGroup) {


                if ((existingKey && existingKey !== renderKey) || !existingBtnGroup.isConnected) {
                    existingBtnGroup.remove();
                } else {


                    const anchor = getEmbyInsertAnchor(titleElem);
                    if (anchor.nextElementSibling !== existingBtnGroup) {
                        anchor.insertAdjacentElement('afterend', existingBtnGroup);
                    }
                    return;
                }
            }
            delete titleElem.dataset.enhanced;
        }
        if (existingBtnGroup) {
            if (site.id === 'emby') {

            } else {
            const code = Utils.extractCode(titleElem.textContent);
            const pan115Code = Pan115.extractCode(titleElem.textContent, code);
            if (pan115Code) addPan115PlayBtn(pan115Code, existingBtnGroup);
            addSettingsBtn(existingBtnGroup);
            placeJumpButtonGroup(site, titleElem, existingBtnGroup);
            return;
            }
        }

        if (titleElem.dataset.enhanced === '1') return;
        titleElem.dataset.enhanced = '1';

        const titleText = titleElem.textContent;
        const code = Utils.extractCode(titleText);
        if (!code) return;
        const trailerCode = Utils.extractCode(titleText, { keepUncensoredSource: true }) || code;

        const btnGroup = document.createElement('div');
        btnGroup.className = 'jav-jump-btn-group';
        btnGroup.dataset.laosijiJump = '1';

        if (site.id === 'javlibrary') {
            addNyaaBtn(code, btnGroup);
            addJavbusBtn(code, btnGroup);
            addJavdbBtn(code, btnGroup);
            addMissAVBtn(code, btnGroup);
            addDmmBtn(code, btnGroup);
            addSearchMenu(code, btnGroup);
            addJumpLineBreak(btnGroup);
            addPan115PlayBtn(Pan115.extractCode(titleText, code), btnGroup);
            addTrailerBtn(trailerCode, btnGroup);
            addPreviewBtn(code, btnGroup);
            addSettingsBtn(btnGroup);

            btnGroup.querySelectorAll('a').forEach(btn => {
                let style = btn.getAttribute('style') || '';
                style = style.replace(/background:\s*([^;]+);/g, 'background: $1 !important;');
                style = style.replace(/color:\s*([^;]+);/g, 'color: $1 !important;');
                btn.setAttribute('style', style);
            });

            placeJumpButtonGroup(site, titleElem, btnGroup);
        } else if (site.id === 'missav') {
            addNyaaBtn(code, btnGroup);
            addJavbusBtn(code, btnGroup);
            addJavdbBtn(code, btnGroup);
            addMissAVBtn(code, btnGroup);

            const defaultEngine = Settings.getDefaultSearchEngine();
            const searchMenuDiv = document.createElement('div');
            searchMenuDiv.className = 'search-menu';
            searchMenuDiv.style.setProperty('--jav-btn-accent', defaultEngine.color);

            const mainSearchBtn = Utils.createLinkBtn(`🔍 ${defaultEngine.name}`, defaultEngine.color, defaultEngine.url(code));
            mainSearchBtn.classList.add('search-main-btn');
            searchMenuDiv.appendChild(mainSearchBtn);

            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'search-toggle-btn';
            toggleBtn.title = '展开搜索引擎';
            toggleBtn.innerHTML = '<span class="search-arrow">▼</span>';
            searchMenuDiv.appendChild(toggleBtn);

            const subMenu = document.createElement('div');
            subMenu.className = 'search-submenu';
            SearchEngines.forEach(engine => {
                if (engine.name === defaultEngine.name) return;
                const subBtn = Utils.createLinkBtn(`🔍 ${engine.name}`, engine.color, engine.url(code));
                subBtn.style.margin = '2px 0';
                subMenu.appendChild(subBtn);
            });
            searchMenuDiv.appendChild(subMenu);

            bindJumpMenu(searchMenuDiv, toggleBtn, subMenu, mainSearchBtn);
            btnGroup.appendChild(searchMenuDiv);

            addPan115PlayBtn(Pan115.extractCode(titleText, code), btnGroup);
            addTrailerBtn(trailerCode, btnGroup);
            addPreviewBtn(code, btnGroup);
            addSettingsBtn(btnGroup);

            btnGroup.style.cssText = `
                margin: 10px 0 6px 0;
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                align-items: center;
                position: relative;
                z-index: 9999;
            `;

            placeJumpButtonGroup(site, titleElem, btnGroup);
        } else {
            addNyaaBtn(code, btnGroup);
            addJavbusBtn(code, btnGroup);
            addJavdbBtn(code, btnGroup);
            addMissAVBtn(code, btnGroup);
            addDmmBtn(code, btnGroup);
            addSearchMenu(code, btnGroup);
            if (['javbus', 'javdb', 'supjav', 'jable'].includes(site.id)) addJumpLineBreak(btnGroup);
            addPan115PlayBtn(Pan115.extractCode(titleText, code), btnGroup);
            addTrailerBtn(trailerCode, btnGroup);
            addPreviewBtn(code, btnGroup);
            addSettingsBtn(btnGroup);

            if (site.id === 'emby') {




                btnGroup.classList.add('emby-fix');
                btnGroup.dataset.embyRenderKey = getEmbyRenderKey();
                getEmbyInsertAnchor(titleElem).insertAdjacentElement('afterend', btnGroup);
            } else {
                placeJumpButtonGroup(site, titleElem, btnGroup);
            }
        }
    }

    function getJhsLikeJumpTarget(site) {
        if (site.id === 'javdb') return document.querySelector('.movie-panel-info');
        if (site.id === 'javbus') return document.querySelector('.container .info');
        if (site.id === 'javlibrary') return document.querySelector('#video_info');
        return null;
    }

    function placeJumpButtonGroup(site, titleElem, btnGroup) {
        if (site.id === 'supjav') {
            btnGroup.style.marginTop = '8px';
            if (btnGroup.parentElement !== titleElem.parentElement || btnGroup.previousElementSibling !== titleElem) {
                titleElem.insertAdjacentElement('afterend', btnGroup);
            }
            return;
        }
        if (site.id === 'jable') {
            btnGroup.style.marginTop = '8px';
            btnGroup.style.display = 'flex';
            btnGroup.style.flexWrap = 'wrap';
            if (btnGroup.parentElement !== titleElem) {
                titleElem.appendChild(btnGroup);
            }
            return;
        }
        const target = getJhsLikeJumpTarget(site);
        if (target) {
            allowJumpMenuOverflow(target);
            if (site.id === 'javlibrary') {
                if (btnGroup.parentElement !== target || btnGroup.nextElementSibling) target.appendChild(btnGroup);
            } else if (btnGroup.parentElement !== target) {
                target.appendChild(btnGroup);
            }
        } else if (btnGroup.parentElement !== titleElem.parentElement || btnGroup.previousElementSibling !== titleElem) {
            titleElem.insertAdjacentElement('afterend', btnGroup);
        }
    }

    function allowJumpMenuOverflow(target) {
        const elements = [
            target,
            target.closest('td'),
            target.closest('tr'),
            target.closest('#video_jacket_info'),
            target.closest('.movie-panel-info'),
            target.closest('.container .info'),
            target.closest('.col-md-3.info'),
            target.closest('.jav-flex-container'),
            target.closest('.row.movie'),
            target.closest('.video-info'),
            target.closest('.info-header')
        ];

        [...new Set(elements.filter(Boolean))].forEach(el => {
            el.style.setProperty('overflow', 'visible', 'important');
            el.style.setProperty('overflow-x', 'visible', 'important');
            el.style.setProperty('overflow-y', 'visible', 'important');
        });
    }

    const InfiniteScroll = {
        enabled() {
            return GM_getValue('infinite_scroll_enabled', false);
        },
        state: null,
        init() {
            if (!this.enabled() || isCurrentDetailPage() || this.state) return;
            const config = this.getConfig();
            if (!config?.container || !config.nextUrl) return;
            this.state = {
                ...config,
                loading: false,
                done: false,
                seen: new Set([...config.container.querySelectorAll('a[href]')].map(a => a.href)),
            };
            this.hidePagination();
            this.createSentinel();
            this.observe();
        },
        destroy() {
            if (this.state?.observer) {
                this.state.observer.disconnect();
            }
            this.state = null;
            document.querySelectorAll('.jav-infinite-sentinel').forEach(el => el.remove());
            document.querySelectorAll('#next, .pagination, nav.pagination').forEach(el => {
                el.style.display = '';
            });
        },
        getConfig(doc = document, baseUrl = location.href) {
            if (/javbus\.com/i.test(location.hostname)) {
                const container = doc === document
                    ? window.__LAOSIJI_SITE_JAVBUS__?._getGridContainer()
                    : doc.querySelector('#waterfall');
                const next = doc.querySelector('a#next[href]');
                if (!container || !next) return null;
                return {
                    site: 'javbus',
                    container,
                    nextUrl: new URL(next.getAttribute('href'), baseUrl).href,
                    itemSelector: '#waterfall > .item',
                    paginationSelector: '.pagination',
                };
            }
            if (/javdb\d*\.com/i.test(location.hostname)) {
                const container = doc.querySelector('.movie-list') || doc.querySelector('.movies') || doc.querySelector('.grid');
                const next = doc.querySelector('a.pagination-next[rel="next"][href], a[rel="next"].pagination-link[href]');
                if (!container || !next) return null;
                return {
                    site: 'javdb',
                    container,
                    nextUrl: new URL(next.getAttribute('href'), baseUrl).href,
                    itemSelector: '.movie-list .item, .movies .item, .grid .item',
                    paginationSelector: 'nav.pagination',
                };
            }
            return null;
        },
        createSentinel() {
            const sentinel = document.createElement('div');
            sentinel.className = 'jav-infinite-sentinel';
            sentinel.textContent = '继续滚动加载下一页';
            sentinel.addEventListener('click', () => {
                if (sentinel.classList.contains('is-error')) this.loadNext();
            });
            this.state.sentinel = sentinel;
            this.state.container.insertAdjacentElement('afterend', sentinel);
        },
        observe() {
            this.state.observer = new IntersectionObserver(entries => {
                if (entries.some(entry => entry.isIntersecting)) this.loadNext();
            }, { rootMargin: '900px 0px' });
            this.state.observer.observe(this.state.sentinel);
        },
        hidePagination() {
            document.querySelectorAll('#next, .pagination, nav.pagination').forEach(el => {
                el.style.display = 'none';
            });
        },
        setStatus(text, className = '') {
            const sentinel = this.state?.sentinel;
            if (!sentinel) return;
            sentinel.className = `jav-infinite-sentinel ${className}`.trim();
            sentinel.textContent = text;
        },
        async fetchDoc(url) {
            const r = await new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url,
                    timeout: 20000,
                    onload: resolve,
                    onerror: () => reject(new Error('加载失败')),
                    ontimeout: () => reject(new Error('加载超时')),
                });
            });
            return new DOMParser().parseFromString(r.responseText, 'text/html');
        },
        appendItems(doc) {
            const items = [...doc.querySelectorAll(this.state.itemSelector)];

            let container = this.state.container;
            if (this.state.site === 'javbus') {
                const live = window.__LAOSIJI_SITE_JAVBUS__._getGridContainer();
                if (live) container = this.state.container = live;
            }
            let added = 0;
            items.forEach(item => {
                try {
                    const href = item.querySelector('a[href]')?.getAttribute('href') || '';
                    const key = href ? new URL(href, location.href).href : item.textContent.trim().slice(0, 80);
                    if (key && this.state.seen.has(key)) return;
                    if (key) this.state.seen.add(key);
                    item.dataset.laosijiInfiniteItem = '1';
                    const adopted = document.adoptNode(item);
                    container.appendChild(adopted);

                    if (this.state.site === 'javbus') {
                        window.__LAOSIJI_SITE_JAVBUS__._decorateCard?.(adopted);
                        ListPreview.attach(adopted);
                    } else if (this.state.site === 'javdb') {
                        window.__LAOSIJI_SITE_JAVDB__?._decorateCard?.(adopted);
                        ListPreview.attach(adopted);
                    }
                    added += 1;
                } catch (err) {
                    console.warn('[老司机] 追加单项失败:', err);
                }
            });
            return added;
        },
        async loadNext() {
            if (!this.state || this.state.loading || this.state.done || !this.state.nextUrl) return;
            this.state.loading = true;
            this.setStatus('正在加载下一页...', 'is-loading');
            try {
                const currentUrl = this.state.nextUrl;
                const doc = await this.fetchDoc(currentUrl);
                if (!this.state) return;
                const added = this.appendItems(doc);
                const nextConfig = this.getConfig(doc, currentUrl);
                if (!this.state) return;
                this.state.nextUrl = nextConfig?.nextUrl || '';
                this.hidePagination();
                this.reflow();
                ListPreview.sync();
                schedulePan115ListBadges();
                setTimeout(() => {
                    renderButtonsForCurrentPage();
                    ListPreview.sync();
                    schedulePan115ListBadges();
                }, 80);
                if (!added || !this.state.nextUrl) {
                    this.state.done = true;
                    this.state.observer?.disconnect();
                    this.setStatus('已经到底了', 'is-done');
                } else {
                    this.setStatus('继续滚动加载下一页');
                }
            } catch (err) {
                console.warn('[老司机] 瀑布流加载失败:', err);
                this.setStatus('加载失败，点击重试', 'is-error');
            } finally {
                if (this.state) this.state.loading = false;
            }
        },
        reflow() {
            try {
                if (this.state.site === 'javbus') {

                    const container = window.__LAOSIJI_SITE_JAVBUS__._getGridContainer() || this.state.container;
                    container.querySelectorAll(':scope > .item').forEach(item => {
                        window.__LAOSIJI_SITE_JAVBUS__._decorateCard?.(item);
                    });
                } else {
                    const jq = window.jQuery || window.$;
                    if (jq && jq(this.state.container).masonry) {
                        jq(this.state.container).masonry('reloadItems');
                        jq(this.state.container).masonry('layout');
                    }
                }
            } catch (err) {
                console.warn('[老司机] 瀑布流重排失败:', err);
            }
            window.dispatchEvent(new Event('resize'));
        },
    };
    window.__LAOSIJI_INFINITE_SCROLL__ = InfiniteScroll;

    let pan115ListTimer = null;
    function schedulePan115ListBadges() {
        if (!Pan115.enabled() || isCurrentDetailPage()) return;
        clearTimeout(pan115ListTimer);
        pan115ListTimer = setTimeout(renderPan115ListBadges, 300);
    }
    window.__LAOSIJI_SCHEDULE_PAN115__ = schedulePan115ListBadges;
    window.__LAOSIJI_RENDER_BUTTONS__ = renderButtonsForCurrentPage;

    function resetEmbyButtonState() {
        if (!Sites.find(s => s.id === 'emby')?.match(window.location.href)) return;
        document.querySelectorAll('.jav-jump-btn-group[data-laosiji-jump="1"]').forEach(el => el.remove());
        document.querySelectorAll('h1[data-enhanced="1"]').forEach(el => delete el.dataset.enhanced);
    }

    let mutationSyncTimer = null;
    const observer = new MutationObserver(() => {
        clearTimeout(mutationSyncTimer);
        mutationSyncTimer = setTimeout(() => {
        renderButtonsForCurrentPage();
        ListPreview.sync();
        DetailPreviewInline.sync();
        schedulePan115ListBadges();
        InfiniteScroll.init();
        }, 120);
    });
    observer.observe(document.body, { childList: true, subtree: true });





    let lastEmbyLoc = location.href;

    function embyButtonsPresent() {
        const g = document.querySelector('.jav-jump-btn-group[data-laosiji-jump="1"]');
        return !!(g && g.isConnected);
    }

    let embyRetryTimers = [];
    function clearEmbyRetries() {
        embyRetryTimers.forEach(t => clearTimeout(t));
        embyRetryTimers = [];
    }
    function embyRenderWithRetry() {
        clearEmbyRetries();

        const delays = [0, 80, 200, 400, 700, 1100, 1700, 2500, 3500, 5000, 6500];
        delays.forEach(d => {
            embyRetryTimers.push(setTimeout(() => {
                renderButtonsForCurrentPage();
                if (embyButtonsPresent()) clearEmbyRetries();
            }, d));
        });
    }

    function onEmbyNavigate() {
        if (location.href === lastEmbyLoc) return;
        lastEmbyLoc = location.href;
        const isEmby = Sites.find(s => s.id === 'emby')?.match(window.location.href);
        if (isEmby) {
            resetEmbyButtonState();
            embyRenderWithRetry();
        } else {
            renderButtonsForCurrentPage();
        }
    }

    window.addEventListener('hashchange', onEmbyNavigate);
    window.addEventListener('popstate', onEmbyNavigate);
    (function hookHistory() {
        const wrap = (type) => {
            const orig = history[type];
            if (typeof orig !== 'function') return;
            history[type] = function () {
                const ret = orig.apply(this, arguments);

                setTimeout(onEmbyNavigate, 0);
                return ret;
            };
        };
        wrap('pushState');
        wrap('replaceState');
    })();


    if (Sites.find(s => s.id === 'emby')?.match(window.location.href)) {
        embyRenderWithRetry();
    } else {
        renderButtonsForCurrentPage();
    }
    ListPreview.sync();
    DetailPreviewInline.sync();
    schedulePan115ListBadges();
    InfiniteScroll.init();

})();

