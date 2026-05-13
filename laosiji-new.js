// ==UserScript==
// @name         JAV老司机-新
// @namespace    https://github.com/ZiPenOk
// @version      2.1.4
// @description  JavBus / JavDB / JavLib 磁力搜索与番号助手，集成 115 离线、番号复制、站点跳转、多源预览图、预告片播放、缓存管理和统一设置面板, 支持在 JavBus、JavDB、JavLibrary 等站点显示磁力表，并在 Sukebei、169bbs、SupJav、Emby、JavBus、JavDB、JavLibrary、Javrate、Sehuatang、HJD2048、MissAV 等页面提供番号跳转、预览图和预告片入口。
// @icon         https://img.sh1nyan.fun/file/1778560196416_laosiji.png
// @author       ZiPenOk

// @match        *://*javlibrary.com/*
// @match        *://*javbus.com/*
// @include      *://*javdb*.com/*

// Jav Jump merged sites
// @match        *://sukebei.nyaa.si/*
// @match        *://169bbs.com/*
// @match        *://supjav.com/*
// @match        *://emby.*/web/index.html*
// @match        *://10.*:*/web/index.html*
// @match        *://javrate.com/*
// @match        *://www.javrate.com/*
// @match        *://sehuatang.net/*
// @match        *://hjd2048.com/2048/*
// @match        *://missav.*/*

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
// @downloadURL  https://github.com/ZiPenOk/scripts/raw/refs/heads/main/laosiji-new.js
// @updateURL    https://github.com/ZiPenOk/scripts/raw/refs/heads/main/laosiji-new.js
// ==/UserScript==

(function () {
    'use strict';
    const SCRIPT_VERSION = '2.1.4';

    const CFG = {
        get javdbSearchUrl()   { return GM_getValue('cfg_javdb_search_url',  'javdb.com'); },
        get ciligouUrl()       { return GM_getValue('cfg_ciligou_url',       'clg55.top'); },
        get btdigUrl()         { return GM_getValue('cfg_btdig_url',         'btdig.com'); },
        get sukebeiUrl()          { return GM_getValue('cfg_sukebei_url',          'sukebei.nyaa.si'); },
        get sokittyUrl()       { return GM_getValue('cfg_sokitty_url',       'w1.sokitty.me'); },

        get defaultEngine()    { return GM_getValue('cfg_default_engine', 'javdb.com'); },

        get thumbSourceOrder() { return GM_getValue('thumb_source_order', ['javfree', 'projectjav', 'javstore']); },

        set javdbSearchUrl(v)   { GM_setValue('cfg_javdb_search_url', v); },
        set ciligouUrl(v)       { GM_setValue('cfg_ciligou_url', v); },
        set btdigUrl(v)         { GM_setValue('cfg_btdig_url', v); },
        set sukebeiUrl(v)          { GM_setValue('cfg_sukebei_url', v); },
        set sokittyUrl(v)       { GM_setValue('cfg_sokitty_url', v); },
        set defaultEngine(v)    { GM_setValue('cfg_default_engine', v); },
        set thumbSourceOrder(v) { GM_setValue('thumb_source_order', v); },
    };

    const log = (...args) => console.log('[老司机]', ...args);

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
            { key: 'sukebeiUrl',      label: 'Sukebei',      placeholder: 'sukebei.nyaa.si' },
            { key: 'sokittyUrl',      label: 'SoKitty',       placeholder: 'w1.sokitty.me' },
        ];
        const JUMP_SEARCH_ENGINES = ['BTDigg', 'Taocili', 'Google', 'Bing', 'DuckGo'];
        const THUMB_META = {
            javfree:    { label: 'javfree.me',     color: '#16a34a', desc: '优先速度' },
            projectjav: { label: 'projectjav.com', color: '#ca8a04', desc: '高清截图' },
            javstore:   { label: 'javstore.net',   color: '#dc2626', desc: '兜底来源' },
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
                #jav-settings-panel .sp-subtitle { margin-top:3px; font-size:12px; color:#cbd5e1; }
                #jav-settings-panel .sp-close { width:32px; height:32px; border:1px solid rgba(255,255,255,.24); border-radius:8px; background:rgba(255,255,255,.1); color:#fff; cursor:pointer; font-size:18px; line-height:1; }
                #jav-settings-panel .sp-close:hover { background:rgba(255,255,255,.18); }
                #jav-settings-panel .sp-body { padding:18px 22px; overflow:auto; display:grid; gap:14px; }
                #jav-settings-panel .sp-card { position:relative; background:rgba(255,255,255,.92); border:1px solid rgba(203,213,225,.88); border-radius:10px; padding:15px; box-shadow:0 10px 24px rgba(15,23,42,.06); overflow:hidden; }
                #jav-settings-panel .sp-card::before { content:''; position:absolute; left:0; top:0; width:4px; height:100%; background:#2563eb; }
                #jav-settings-panel .sp-card-magnet::before { background:#16a34a; }
                #jav-settings-panel .sp-card-preview::before { background:#f59e0b; }
                #jav-settings-panel .sp-card-order::before { background:#dc2626; }
                #jav-settings-panel .sp-card-title { font-size:13px; font-weight:750; color:#1e293b; margin-bottom:12px; }
                #jav-settings-panel .sp-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px 12px; }
                #jav-settings-panel .sp-field { display:flex; flex-direction:column; gap:6px; min-width:0; }
                #jav-settings-panel .sp-label { font-size:12px; font-weight:650; color:#475569; }
                #jav-settings-panel .sp-input, #jav-settings-panel .sp-select { width:100%; min-width:0; height:34px; padding:6px 9px; border:1px solid #cbd5e1; border-radius:8px; background:#fff; color:#0f172a; font-size:13px; outline:none; }
                #jav-settings-panel .sp-input:focus, #jav-settings-panel .sp-select:focus { border-color:#2563eb; box-shadow:0 0 0 3px rgba(37,99,235,.13); }
                #jav-settings-panel .sp-engine-row { display:grid; grid-template-columns:170px 1fr; gap:10px; align-items:end; }
                #jav-settings-panel .sp-stack { display:flex; flex-direction:column; gap:10px; min-width:0; }
                #jav-settings-panel .sp-toggle-row { display:flex; align-items:center; justify-content:space-between; gap:16px; min-height:34px; }
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
                #jav-settings-panel .sp-order-desc { font-size:11px; color:#64748b; margin-top:2px; }
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
                @media (max-width: 640px) { #jav-settings-panel .sp-grid, #jav-settings-panel .sp-engine-row { grid-template-columns:1fr; } #jav-settings-panel .sp-cache-actions { margin-right:0; } #jav-settings-panel .sp-footer { flex-wrap:wrap; } }
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
                        <div class="sp-subtitle">磁力、跳转、预览图统一管理</div>
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
                    <section class="sp-card sp-card-preview">
                        <div class="sp-card-title">跳转与预览</div>
                        <div class="sp-grid">
                            <label class="sp-field"><span class="sp-label">默认跳转搜索</span><select class="sp-select" id="sp-jump-engine"></select></label>
                            <div class="sp-stack">
                                <div class="sp-toggle-row">
                                    <div><div class="sp-label">预览图缓存</div><div class="sp-desc">本次会话内缓存已命中的图片地址</div></div>
                                    <label class="sp-toggle"><input id="sp-preview-cache" type="checkbox"><span class="sp-toggle-track"></span></label>
                                </div>
                                <div class="sp-toggle-row">
                                    <div><div class="sp-label">预告片缓存</div><div class="sp-desc">本次会话内缓存已解析的视频源</div></div>
                                    <label class="sp-toggle"><input id="sp-trailer-cache" type="checkbox"><span class="sp-toggle-track"></span></label>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section class="sp-card sp-card-order">
                        <div class="sp-card-title">预览图来源顺序</div>
                        <div class="sp-order-list" id="sp-thumb-order"></div>
                    </section>
                </div>
                <div class="sp-footer">
                    <div class="sp-cache-actions">
                        <div class="sp-footer-links">
                            <a class="sp-footer-link" href="https://github.com/ZiPenOk" target="_blank" rel="noopener noreferrer">Github</a>
                            <span class="sp-footer-sep"></span>
                            <a class="sp-footer-link" href="https://github.com/ZiPenOk/scripts/issues" target="_blank" rel="noopener noreferrer">反馈</a>
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
            const cacheCheckbox = panel.querySelector('#sp-preview-cache');
            const trailerCacheCheckbox = panel.querySelector('#sp-trailer-cache');
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
            jumpEngineSelect.value = String(GM_getValue('default_search_engine', 0));
            cacheCheckbox.checked = GM_getValue('preview_cache_enabled', true);
            trailerCacheCheckbox.checked = GM_getValue('trailer_cache_enabled', true);

            const renderOrder = () => {
                orderList.innerHTML = '';
                currentOrder.forEach((src, index) => {
                    const meta = THUMB_META[src];
                    const item = document.createElement('div');
                    item.className = 'sp-order-item';
                    item.dataset.src = src;
                    item.innerHTML = `
                        <div><div class="sp-order-name">${meta.label}</div><div class="sp-order-desc">${meta.desc}</div></div>
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
            clearCacheBtn.addEventListener('click', () => {
                const prefixes = ['thumb_cache_', 'trailer_cache_v3_'];
                let count = 0;
                Object.keys(sessionStorage).forEach(key => {
                    if (prefixes.some(prefix => key.startsWith(prefix))) {
                        sessionStorage.removeItem(key);
                        count += 1;
                    }
                });
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
                MAGNET_ENGINES.forEach(item => { CFG[item.key] = stripProtocol(domainDraft[item.key]); });
                CFG.defaultEngine = defaultSelect.value;
                GM_setValue('default_search_engine', parseInt(jumpEngineSelect.value, 10) || 0);
                GM_setValue('preview_cache_enabled', cacheCheckbox.checked);
                GM_setValue('trailer_cache_enabled', trailerCacheCheckbox.checked);
                GM_setValue('thumb_source_order', currentOrder);
                closePanel();
                location.reload();
            });
        }

        return { open };
    })();
    GM_registerMenuCommand('⚙️ 老司机设置', () => SettingsPanel.open());

    const Magnet = (() => {

        const ENGINE_LABELS = () => ({
            [CFG.javdbSearchUrl]: 'JavDB',
            [CFG.ciligouUrl]:     'CiliGou',
            [CFG.btdigUrl]:       'BtDig',
            [CFG.sukebeiUrl]:     'Sukebei',
            [CFG.sokittyUrl]:     'SoKitty',
        });

        const Engines = {
            getAll() {
                return {
                    [CFG.javdbSearchUrl]: _searchJavDB,
                    [CFG.ciligouUrl]:     _searchCiligou,
                    [CFG.btdigUrl]:       _searchBtdig,
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

        async function _searchJavDB(kw) {
            const base = 'https://' + CFG.javdbSearchUrl;

            const normalizeCodeText = text => String(text || '')
                .toUpperCase()
                .replace(/[＿_\s]+/g, '-');
            const compactCodeText = text => normalizeCodeText(text).replace(/[^A-Z0-9]/g, '');
            const kwNorm = normalizeCodeText(kw);
            const kwCompact = compactCodeText(kw);
            const isCodeMatch = text => {
                const norm = normalizeCodeText(text);
                const compact = compactCodeText(text);
                return norm.includes(kwNorm) || compact.includes(kwCompact);
            };
            const extractMagnets = (doc, srcUrl) => {
                const items = doc.querySelectorAll('#magnets-content .item, .magnet-list .item');
                return [...items].map(el => {
                    const magA = el.querySelector('a[href^="magnet:"]') || el.querySelector('.magnet-name a:nth-child(1)');
                    const rawMag = magA?.getAttribute('href') || '';
                    const maglink = rawMag.startsWith('magnet:') ? rawMag
                                  : rawMag.startsWith('http')    ? rawMag
                                  : rawMag ? new URL(rawMag, srcUrl).href : '';
                    return {
                        title:   el.querySelector('.magnet-name span:nth-child(1)')?.textContent?.trim()
                              || el.querySelector('.name')?.textContent?.trim()
                              || magA?.textContent?.trim()
                              || '',
                        maglink,
                        size:    el.querySelector('.magnet-name .meta')?.textContent?.trim()
                              || el.querySelector('.meta')?.textContent?.trim()
                              || el.querySelector('.size')?.textContent?.trim()
                              || '',
                        src:     srcUrl,
                    };
                }).filter(item => item.maglink);
            };

            const searchUrl = `${base}/search?f=download&q=${encodeURIComponent(kw)}`;
            const r = await gmFetch(searchUrl, { headers: { Referer: base + '/' } });
            if (!r.loadstuts) return { url: base, data: [] };
            const doc = parseHTML(r.responseText);
            const finalUrl = r.finalUrl || searchUrl;

            if (/\/v\/[^/?#]+/.test(finalUrl)) {
                return { url: finalUrl, data: extractMagnets(doc, finalUrl) };
            }

            const candidates = [...doc.querySelectorAll('a[href*="/v/"]')]
                .map(a => ({
                    a,
                    text: [
                        a.textContent,
                        a.querySelector('.video-title')?.textContent,
                        a.querySelector('.uid')?.textContent,
                        a.querySelector('.value')?.textContent,
                    ].filter(Boolean).join(' '),
                }))
                .filter(item => item.a.getAttribute('href'));
            const matched = candidates.find(item => isCodeMatch(item.text))
                || (candidates.length === 1 ? candidates[0] : null);
            if (!matched) return { url: finalUrl, data: [] };

            const rawHref = matched.a.getAttribute('href') || '';
            const detailUrl = new URL(rawHref, base + '/').href;

            const r2 = await gmFetch(detailUrl);
            if (!r2.loadstuts) return { url: finalUrl, data: [] };
            const doc2 = parseHTML(r2.responseText);
            return { url: r2.finalUrl || detailUrl, data: extractMagnets(doc2, r2.finalUrl || detailUrl) };
        }

        async function _searchCiligou(kw) {
            const base = 'https://' + CFG.ciligouUrl;
            // ciligou 搜索词需 Base64 编码
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
                margin: 8px 0; color: #666;
                font-size: 13px; text-align: center;
                background: #f2f2f2; border-collapse: collapse;
                max-width: 100%;
            }
            #jav-nong-table th, #jav-nong-table td {
                text-align: center; height: 30px;
                background: #fff; padding: 0 6px;
                border: 1px solid #efefef;
            }
            #jav-nong-table .nong-head-row th { background: #f8f8f8; font-weight: 600; }
            .nong-copy { color: #08c !important; cursor: pointer; }
            .nong-offline-115 { color: rgb(0,180,30) !important; cursor: pointer; }
            .nong-offline-115:hover { color: red !important; }
            #jav-nong-notice { padding: 8px 0; }
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
            sel.style.cssText = 'font-size:12px;border:1px solid #ddd;border-radius:4px;padding:2px 4px;min-width:80px;';
            const labels = ENGINE_LABELS();
            Object.keys(allEngines).forEach(k => {
                const op = document.createElement('option');
                op.value = k;
                op.textContent = labels[k] || k;
                if (k === curKey) op.selected = true;
                sel.appendChild(op);
            });
            // 每次切换后重新量自然宽度，自适应但不低于 80px
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

            ['大小', '操作', '115离线'].forEach(txt => {
                const th = document.createElement('th');
                th.textContent = txt;
                if (txt === '115离线') th.className = 'nong-115-head';
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
            // 按文件大小由高到低排序
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
                // 中字别判太松，误伤普通标题很烦。
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
                    badge.style.cssText = 'display:inline-block;margin-right:4px;padding:0 4px;font-size:11px;font-weight:700;color:#fff;background:#27ae60;border-radius:3px;vertical-align:middle;flex-shrink:0;';
                    nameSpan.appendChild(badge);
                    nameSpan.style.background = 'linear-gradient(90deg,#f0fff4 0%,#fff 100%)';
                    nameSpan.style.borderLeft = '3px solid #27ae60';
                    nameSpan.style.paddingLeft = '4px';
                }
                if (is4K) {
                    const badge4k = document.createElement('span');
                    badge4k.textContent = '[4K]';
                    badge4k.style.cssText = 'display:inline-block;margin-right:4px;padding:0 4px;font-size:11px;font-weight:700;color:#fff;background:#1a6fa8;border-radius:3px;vertical-align:middle;flex-shrink:0;';
                    nameSpan.insertBefore(badge4k, nameSpan.firstChild);
                    if (!isChinese) {
                        nameSpan.style.background = 'linear-gradient(90deg,#f0f7ff 0%,#fff 100%)';
                        nameSpan.style.borderLeft = '3px solid #1a6fa8';
                        nameSpan.style.paddingLeft = '4px';
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
                // 超时后的刷新入口别被空结果顶掉。
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
                max-width: 100%;
                box-sizing: border-box;
                padding: 12px 14px;
                background: #fafafa;
                border: 1px solid #ebebeb;
                border-radius: 6px;
                overflow-x: auto;
            `;

            const header = document.createElement('div');
            header.style.cssText = 'margin-bottom:10px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;';

            const title = document.createElement('span');
            title.style.cssText = 'color:#0066cc;font-size:15px;font-weight:600;';
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
            return location.hostname.includes('javbus') && !!document.querySelector('.header');
        },
        getVid() {
            const kw = document.querySelector('meta[name="keywords"]')?.content || '';
            return normalizeAvid(kw.split(',')[0].trim());
        },
        initPage(avid) {
            document.querySelector('.ad-box')?.remove();
            this._insertCopyButton(avid);

            GM_addStyle(`
                .container { max-width: 100% !important; width: 100% !important;
                    padding-left: 20px !important; padding-right: 20px !important; }
                .row.movie { display: flex !important; gap: 20px !important;
                    align-items: flex-start !important; flex-wrap: nowrap !important; margin: 0 !important; }
                .col-md-9.screencap { flex: 1.5 1 0 !important; min-width: 0 !important;
                    width: auto !important; float: none !important; padding: 0 !important; }
                .col-md-3.info { flex: 0.7 1 0 !important; min-width: 0 !important;
                    width: auto !important; float: none !important;
                    overflow: hidden !important; word-break: break-word !important; }
                .jav-nong-slot { flex: 1.3 1 0 !important; min-width: 0 !important; align-self: flex-start !important; overflow: hidden !important; }
                .jav-nong-wrapper { max-width: 100%; }
                .screencap img { width: 100%; max-width: 100%; }
                .footer { padding: 20px 0; }
            `);

            if (document.querySelector('#waterfall div.item') && document.querySelector('.masonry')) return;

            this._insertMagnet(avid);
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
            document.querySelector('.modal.is-active.over18-modal')?.remove();
            this._insertCopyButton(avid);

            GM_addStyle(`
                .container { max-width: 100% !important; }
                .movie-panel-info { overflow: hidden; word-break: break-word; }
                .movie-panel-info .panel-block { flex-wrap: wrap; }
                .movie-panel-info .value { overflow: hidden; word-break: break-word; }
            `);

            if (!location.pathname.startsWith('/v/')) return;
            this._insertMagnet(avid);
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
        _insertMagnet(avid) {
            const coverCol  = document.querySelector('.column.column-video-cover');
            const infoPanel = document.querySelector('.movie-panel-info');
            if (!coverCol || !infoPanel) return;

            document.querySelectorAll('.jav-nong-slot').forEach(el => el.remove());

            const parent = coverCol.parentElement;
            let flexContainer = parent.querySelector('.jav-flex-container');
            if (!flexContainer) {
                flexContainer = document.createElement('div');
                flexContainer.className = 'jav-flex-container';
                flexContainer.style.cssText = 'display:flex;gap:20px;align-items:flex-start;width:100%;margin-top:16px;';
                coverCol.style.cssText  += ';flex:1 1 0;min-width:0;';
                infoPanel.style.cssText += ';flex:1 1 0;min-width:0;overflow:hidden;word-break:break-word;';
                flexContainer.appendChild(coverCol);
                flexContainer.appendChild(infoPanel);
                parent.appendChild(flexContainer);
            }

            const slot = document.createElement('div');
            slot.className = 'jav-nong-slot';
            slot.style.cssText = 'flex:1 1 0;min-width:0;align-self:flex-start;overflow:hidden;';
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
        getVid() {
            const el = document.querySelector('#video_id .text');
            if (el?.textContent?.trim()) return normalizeAvid(el.textContent.trim());
            const m = document.title.match(/([A-Z0-9]+-\d+)/i);
            return m ? m[1].toUpperCase() : '';
        },
        initPage(avid) {
            if (!this.isDetailPage()) return;
            if (!avid) return;

            document.querySelector('.socialmedia')?.remove();
            this._insertCopyButton(avid);

            GM_addStyle(`
                #leftmenu { display: none; }
                #rightcolumn { margin: 0 !important; width: 100% !important; float: none !important; }
                #content { padding-top: 0; width: 100%; }
                #video_jacket img { max-width: 100%; height: auto; }
                #video_info { text-align: left; font: 14px Arial; overflow: hidden; word-break: break-word; }
                .jav-nong-slot .jav-nong-wrapper { max-width: 100%; margin-top: 16px; }
            `);

            this._insertMagnet(avid);
        },
        _insertCopyButton(avid) {
            const codeEl = document.querySelector('#video_id .text');
            insertAvidCopyBtn(codeEl, avid);
        },
        _insertMagnet(avid) {
            const table = document.getElementById('video_jacket_info');
            if (!table) return;
            const row = table.querySelector('tr');
            if (!row) return;

            document.querySelectorAll('.jav-nong-slot').forEach(el => el.remove());

            table.style.cssText = 'width:100%;display:block;';
            row.style.cssText = 'display:flex;gap:20px;align-items:flex-start;width:100%;';

            const tds = row.querySelectorAll('td');
            if (tds[0]) tds[0].style.cssText = 'flex:1.5 1 0;min-width:0;vertical-align:top;';
            if (tds[1]) tds[1].style.cssText = 'flex:1 1 0;min-width:0;vertical-align:top;overflow:hidden;word-break:break-word;';

            const jacketImg = document.getElementById('video_jacket_img');
            if (jacketImg) {
                jacketImg.removeAttribute('width');
                jacketImg.removeAttribute('height');
                jacketImg.style.cssText = 'width:100%;height:auto;max-width:100%;';
            }

            const magnetTd = document.createElement('td');
            magnetTd.className = 'jav-nong-slot';
            magnetTd.style.cssText = 'flex:1 1 0;min-width:0;vertical-align:top;align-self:flex-start;';

            const innerWrap = document.createElement('div');
            innerWrap.style.cssText = 'display:inline-block;';

            const widget = Magnet.createMagnetWidget(avid);
            innerWrap.appendChild(widget);
            magnetTd.appendChild(innerWrap);
            row.appendChild(magnetTd);
        },
    };

    const SITES = [SiteJavBus, SiteJavDB, SiteJavLib];

    function mainRun() {
        const site = SITES.find(s => s.match());
        if (!site) return;

        const avid = site.getVid();
        log('匹配站点:', site.constructor?.name || '未知', '| 番号:', avid);

        site.initPage(avid);
    }

    if (location.hostname.includes('javdb') && location.pathname.startsWith('/v/')) {
        setTimeout(mainRun, 600);
    } else {
        mainRun();
    }

})();

// jump runtime
(function() {
    'use strict';

    GM_addStyle(`
        #emby-config-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 2147483647; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); font-family: sans-serif; }
        .emby-config-modal { background: #2d2d2d; border: 1px solid #444; border-radius: 12px; width: 320px; padding: 25px; color: white; box-shadow: 0 10px 50px rgba(0,0,0,0.9); }
        .emby-config-header { font-size: 18px; font-weight: bold; margin-bottom: 20px; text-align: center; color: #00a4dc; border-bottom: 1px solid #444; padding-bottom: 12px; }
        .emby-config-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; cursor: pointer; user-select: none; }
        .emby-config-item input { width: 18px; height: 18px; cursor: pointer; }
        .emby-config-footer { margin-top: 25px; display: flex; gap: 12px; }
        .emby-config-btn { flex: 1; padding: 10px; border-radius: 6px; border: none; cursor: pointer; font-weight: bold; font-size: 14px; }
        .emby-config-save { background: #00a4dc; color: white; }
        .emby-config-cancel { background: #444; color: #ccc; }

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

        .jav-jump-btn-group {
            margin-top: 8px;
            margin-bottom: 4px;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
        }

        body.main .javlibrary-fix {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
            margin: 15px 0 10px !important;
            padding: 0 !important;
            background: transparent !important;
            border: none !important;
            width: 100% !important;
            position: relative !important;
            z-index: 9999 !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
        body.main .javlibrary-fix a {
            display: inline-block !important;
            padding: 4px 8px !important;
            border-radius: 4px !important;
            font-size: 13px !important;
            font-weight: bold !important;
            font-family: Arial, "Microsoft YaHei", sans-serif !important;
            text-decoration: none !important;
            border: none !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2) !important;
            box-sizing: border-box !important;
            line-height: normal !important;
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

        .jav-jump-btn-group a,
        .javlibrary-fix a {
            transition: all 0.2s ease-in-out;
            animation: btnSlideIn 0.3s ease-out;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        .jav-jump-btn-group a:hover,
        .javlibrary-fix a:hover {
            transform: scale(1.05) !important;
            filter: brightness(1.2) !important;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3) !important;
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

        .search-submenu a {
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        }

        .search-submenu a:hover {
            transform: translateX(5px) scale(1.02);
            filter: brightness(1.1);
        }

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
                radial-gradient(circle at 50% 20%, rgba(70, 84, 130, 0.26), transparent 34%),
                linear-gradient(180deg, rgba(0, 0, 0, 0.92), rgba(0, 0, 0, 0.98));
            backdrop-filter: blur(14px) saturate(0.75);
            cursor: default;
        }
        .trailer-modal {
            width: min(1180px, 94vw);
            max-height: 92vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            color: #f8fafc;
            background: #060812;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 16px;
            box-shadow:
                0 35px 90px rgba(0, 0, 0, 0.72),
                0 0 0 1px rgba(255, 255, 255, 0.04) inset;
            cursor: default;
            animation: trailerFadeIn .18s ease-out;
        }
        @keyframes trailerFadeIn {
            from { opacity: 0; transform: translateY(14px) scale(.985); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .trailer-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 13px 16px;
            background: linear-gradient(180deg, rgba(22, 28, 44, 0.96), rgba(10, 13, 24, 0.92));
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .trailer-title {
            min-width: 0;
            display: flex;
            align-items: center;
            gap: 10px;
            font: 600 15px/1.3 Arial, "Microsoft YaHei", sans-serif;
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
            color: #bae6fd;
            background: rgba(14, 165, 233, 0.14);
            border: 1px solid rgba(14, 165, 233, 0.24);
            font-size: 12px;
            font-weight: 500;
        }
        .trailer-close {
            width: 34px;
            height: 34px;
            border: 0;
            border-radius: 50%;
            color: #e5e7eb;
            background: rgba(255, 255, 255, 0.08);
            cursor: pointer;
            font-size: 18px;
            line-height: 34px;
            transition: transform .15s ease, background .15s ease;
        }
        .trailer-close:hover {
            transform: scale(1.08);
            background: rgba(248, 113, 113, 0.28);
        }
        .trailer-screen {
            position: relative;
            aspect-ratio: 16 / 9;
            width: 100%;
            background:
                radial-gradient(circle at center, rgba(31, 41, 55, .75), #000 62%),
                #000;
        }
        .trailer-screen video,
        .trailer-screen iframe {
            width: 100%;
            height: 100%;
            display: block;
            border: 0;
            background: #000;
        }
        .trailer-quality-bar {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            padding: 10px 16px;
            background: #070a12;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .trailer-quality-label {
            color: #9ca3af;
            font: 12px/1.4 Arial, "Microsoft YaHei", sans-serif;
            margin-right: 2px;
        }
        .trailer-quality-btn {
            min-width: 58px;
            padding: 6px 10px;
            color: #d1d5db;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 999px;
            cursor: pointer;
            font-size: 12px;
            transition: background .15s ease, color .15s ease, border-color .15s ease;
        }
        .trailer-quality-btn:hover {
            color: #fff;
            background: rgba(96, 165, 250, 0.22);
            border-color: rgba(147, 197, 253, 0.45);
        }
        .trailer-quality-btn.active {
            color: #fff;
            background: #2563eb;
            border-color: #60a5fa;
            box-shadow: 0 0 16px rgba(37, 99, 235, .38);
        }
        .trailer-footer {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            padding: 10px 16px;
            color: #9ca3af;
            background: #080b14;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            font: 12px/1.4 Arial, "Microsoft YaHei", sans-serif;
        }
        .trailer-footer a {
            color: #93c5fd;
            text-decoration: none;
        }
        .trailer-footer a:hover {
            color: #bfdbfe;
            text-decoration: underline;
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
            .trailer-modal { width: 100%; border-radius: 12px; }
            .trailer-footer { flex-direction: column; }
            .jav-jump-toast {
                top: 18px;
                width: calc(100vw - 24px);
                padding: 13px 14px;
            }
        }
    `);

    const Utils = {
        extractCode(text) {
            if (!text) return null;

            const patterns = [
                { regex: /([A-Z]{2,15})[-_\s]([A-Z]{1,2}\d{2,10})/i, type: 'alphanum' },
                { regex: /([A-Z]{2,15})[-_\s](\d{2,10})(?:[-_](\d{1,3}))?/i, type: 'standard' },
                { regex: /FC2[-\s_]?(?:PPV)?[-\s_]?(\d{6,9})/i, type: 'fc2' },
                { regex: /(\d{6})[-_\s]?(\d{2,3})/, type: 'numeric' },
                { regex: /\b([A-Z]{2,10})(\d{3,6})\b/i, type: 'compactStandard' },
                { regex: /([A-Z]{1,2})(\d{3,4})/i, type: 'compact' }
            ];

            const ignoreList = ['FULLHD', 'H264', 'H265', '1080P', '720P', 'PART', 'DISC', '10BIT'];

            for (let i = 0; i < patterns.length; i++) {
                const { regex, type } = patterns[i];
                const match = text.match(regex);
                if (!match) continue;

                if (type === 'alphanum') {
                    return match[0].trim();
                } else if (type === 'standard') {
                    const prefix = match[1].toUpperCase();
                    if (ignoreList.includes(prefix)) continue;
                    return match[3] ? `${prefix}-${match[2]}-${match[3]}` : `${prefix}-${match[2]}`;
                } else if (type === 'fc2') {
                    return `FC2-PPV-${match[1]}`;
                } else if (type === 'numeric') {
                    return `${match[1]}-${match[2]}`;
                } else if (type === 'compactStandard') {
                    const prefix = match[1].toUpperCase();
                    if (ignoreList.includes(prefix)) continue;
                    const number = match[2].replace(/^0+(?=\d{3})/, '');
                    return `${prefix}-${number}`;
                } else if (type === 'compact') {
                    return match[0].toUpperCase();
                }
            }
            return null;
        },

        createLinkBtn(text, color, url) {
            const btn = document.createElement('a');
            btn.textContent = text;
            btn.href = url || '#';
            if (url) btn.target = '_blank';
            btn.rel = 'noopener noreferrer';
            btn.style.cssText = `
                padding:4px 8px;
                background: ${color};
                color: white;
                border-radius: 4px;
                font-size: 13px;
                font-weight: bold;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
                border: none;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                box-sizing: border-box;
            `;
            return btn;
        },

        createBtn(text, color, handler, useCapture = false) {
            const btn = document.createElement('a');
            btn.textContent = text;
            btn.style.cssText = `
                padding:4px 8px;
                background: ${color};
                color: white;
                border-radius: 4px;
                font-size: 13px;
                font-weight: bold;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
                border: none;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                box-sizing: border-box;
            `;
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
            img.className = 'preview-img';
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
            closeBtn.className = 'trailer-close';
            closeBtn.type = 'button';
            closeBtn.textContent = '×';

            header.appendChild(title);
            header.appendChild(closeBtn);

            const screen = document.createElement('div');
            screen.className = 'trailer-screen';
            let video = null;
            let activeUrl = url;
            let activeQuality = quality;
            const fallbackUrls = Array.isArray(urls)
                ? [...new Set(urls.filter(Boolean))]
                : [url].filter(Boolean);
            let fallbackIndex = Math.max(0, fallbackUrls.indexOf(url));

            if (type === 'iframe') {
                const iframe = document.createElement('iframe');
                iframe.src = url;
                iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
                iframe.allowFullscreen = true;
                screen.appendChild(iframe);
            } else {
                video = document.createElement('video');
                video.controls = true;
                video.autoplay = true;
                video.loop = true;
                video.playsInline = true;
                const savedVolume = Number(GM_getValue('trailer_volume', 0.35));
                const savedMuted = GM_getValue('trailer_muted', false);
                video.volume = Number.isFinite(savedVolume) ? Math.min(1, Math.max(0, savedVolume)) : 0.35;
                video.muted = Boolean(savedMuted);
                video.src = fallbackUrls[fallbackIndex] || url;
                video.addEventListener('volumechange', () => {
                    GM_setValue('trailer_volume', video.volume);
                    GM_setValue('trailer_muted', video.muted);
                });
                video.addEventListener('error', () => {
                    if (fallbackIndex >= fallbackUrls.length - 1) return;
                    fallbackIndex += 1;
                    activeUrl = fallbackUrls[fallbackIndex];
                    sourceLink.href = activeUrl;
                    video.src = activeUrl;
                    video.load();
                    video.play().catch(() => {});
                });
                screen.appendChild(video);
                setTimeout(() => video.play().catch(() => {}), 120);
            }

            const qualityBar = document.createElement('div');
            const qualityMap = qualities && typeof qualities === 'object' ? qualities : null;
            if (type !== 'iframe' && qualityMap && Object.keys(qualityMap).length > 1) {
                const qualityOrder = ['sm', 'sm_s', 'dm', 'dm_s', 'dmb_s', 'dmb_w', 'mhb_w', 'mmb', 'mhb', 'hmb', 'hhb', 'hhbs', '4k', '4ks'];
                const qualityLabels = {
                    sm: '低画质',
                    sm_s: '240p',
                    dm: '中画质',
                    dm_s: '360p',
                    dmb_s: '480p',
                    dmb_w: '404p宽',
                    mhb_w: '404p高宽',
                    mmb: '432p',
                    mhb: '576p',
                    hmb: '720p',
                    hhb: '1080p',
                    hhbs: '1080p60',
                    '4k': '4K',
                    '4ks': '4K60'
                };
                const sortedKeys = Object.keys(qualityMap)
                    .filter(key => qualityMap[key])
                    .sort((a, b) => qualityOrder.indexOf(b) - qualityOrder.indexOf(a));

                qualityBar.className = 'trailer-quality-bar';
                const label = document.createElement('span');
                label.className = 'trailer-quality-label';
                label.textContent = '画质';
                qualityBar.appendChild(label);

                const setActiveQuality = (key) => {
                    activeQuality = key;
                    activeUrl = qualityMap[key];
                    qualityBar.querySelectorAll('.trailer-quality-btn').forEach(btn => {
                        btn.classList.toggle('active', btn.dataset.quality === key);
                    });
                };

                sortedKeys.forEach(key => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'trailer-quality-btn';
                    btn.dataset.quality = key;
                    btn.textContent = qualityLabels[key] || key;
                    btn.onclick = async () => {
                        if (!video || !qualityMap[key] || activeQuality === key) return;
                        const currentTime = video.currentTime || 0;
                        const shouldPlay = !video.paused;
                        video.src = qualityMap[key];
                        fallbackIndex = Math.max(0, fallbackUrls.indexOf(qualityMap[key]));
                        video.load();
                        video.currentTime = currentTime;
                        setActiveQuality(key);
                        sourceLink.href = activeUrl;
                        if (shouldPlay) {
                            await video.play().catch(() => {});
                        }
                    };
                    qualityBar.appendChild(btn);
                });

                setActiveQuality(activeQuality && qualityMap[activeQuality] ? activeQuality : sortedKeys[0]);
            }

            const footer = document.createElement('div');
            footer.className = 'trailer-footer';
            const footerText = document.createElement('span');
            footerText.textContent = '影院模式播放，按 Esc 或点击右上角关闭。';
            const sourceLink = document.createElement('a');
            sourceLink.href = activeUrl;
            sourceLink.target = '_blank';
            sourceLink.rel = 'noopener noreferrer';
            sourceLink.textContent = '新窗口打开源地址';
            footer.appendChild(footerText);
            footer.appendChild(sourceLink);

            modal.appendChild(header);
            modal.appendChild(screen);
            if (qualityBar.childElementCount) {
                modal.appendChild(qualityBar);
            }
            modal.appendChild(footer);
            overlay.appendChild(modal);

            const closeOverlay = () => {
                const video = overlay.querySelector('video');
                if (video) {
                    video.pause();
                    video.removeAttribute('src');
                    video.load();
                }
                overlay.remove();
                document.documentElement.style.overflow = originalHtmlOverflow;
                document.body.style.overflow = originalBodyOverflow;
                document.removeEventListener('keydown', escHandler);
            };

            const escHandler = (e) => {
                if (e.key === 'Escape') closeOverlay();
            };

            closeBtn.onclick = closeOverlay;
            document.addEventListener('keydown', escHandler);
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
        async javfree(code) {
            const cacheKey = `thumb_cache_${code}`;
            const cacheEnabled = Settings.getPreviewCacheEnabled();
            if (cacheEnabled) {
                const cached = sessionStorage.getItem(cacheKey);
                if (cached) return cached;
            }

            try {
                const html = await Utils.request(`https://javfree.me/search/${code}`);
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const link = doc.querySelector('.entry-title>a')?.href;
                if (!link) return null;

                const dHtml = await Utils.request(link);
                const dDoc = new DOMParser().parseFromString(dHtml, 'text/html');
                const url = dDoc.querySelectorAll('p>img')[1]?.src || dDoc.querySelectorAll('p>img')[0]?.src;

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
                    const fullUrl = href.startsWith('http') ? href : new URL(href, searchUrl).href;
                    const pathLastPart = fullUrl.split('/').pop() || '';
                    const normalizedPath = pathLastPart.toLowerCase().replace(/-/g, '');
                    if (normalizedPath.includes(normalizedCode) && !detailUrls.includes(fullUrl)) {
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
                    const imgUrl = await this._extractImgFromDetail(detailUrl);
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

        async _extractImgFromDetail(detailUrl) {
            try {
                const detailHtml = await Utils.request(detailUrl);
                const detailDoc = new DOMParser().parseFromString(detailHtml, 'text/html');

                for (const link of detailDoc.querySelectorAll('a')) {
                    if (link.textContent.includes('CLICK HERE')) {
                        const imgUrl = link.href || link.getAttribute('href') || '';
                        if (imgUrl) return imgUrl.replace(/^http:/, 'https:');
                    }
                }

                const img = detailDoc.querySelector('img[src*="_s.jpg"]');
                if (img) {
                    let src = img.getAttribute('src') || '';
                    if (!src.startsWith('http')) src = new URL(src, detailUrl).href;
                    return src.replace(/_s\.jpg$/, '_l.jpg').replace(/^http:/, 'https:');
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
                            console.log(`[projectjav] ${url} → HTTP ${r.status}, 长度 ${r.responseText?.length}`);
                            if (r.status >= 200 && r.status < 400) resolve(r.responseText);
                            else reject(new Error(`HTTP ${r.status}`));
                        },
                        onerror: (e) => { console.warn('[projectjav] 网络错误', e); reject(new Error('请求失败')); },
                        ontimeout: () => { console.warn('[projectjav] 请求超时'); reject(new Error('请求超时')); }
                    });
                });

                const searchUrl = `https://projectjav.com/?searchTerm=${encodeURIComponent(code)}`;
                console.log('[projectjav] 搜索页:', searchUrl);
                const searchHtml = await request(searchUrl);
                const searchDoc = new DOMParser().parseFromString(searchHtml, 'text/html');

                const allMovieLinks = [...searchDoc.querySelectorAll('a[href*="/movie/"]')];
                console.log(`[projectjav] /movie/ 链接数: ${allMovieLinks.length}`);
                allMovieLinks.slice(0, 5).forEach(a => console.log('  ', a.getAttribute('href')));

                if (allMovieLinks.length === 0) {
                    console.warn('[projectjav] 无结果，页面标题:', searchDoc.title);
                    console.warn('[projectjav] 页面前800字符:', searchHtml.slice(0, 800));
                    return null;
                }

                let detailPath = allMovieLinks.find(a => /\/movie\/.+-\d+$/.test(a.getAttribute('href') || ''))?.getAttribute('href')
                    || allMovieLinks[0].getAttribute('href');
                console.log('[projectjav] 选中链接:', detailPath);

                const detailUrl = detailPath.startsWith('http') ? detailPath : `https://projectjav.com${detailPath}`;
                console.log('[projectjav] 详情页:', detailUrl);
                const detailHtml = await request(detailUrl);
                const detailDoc = new DOMParser().parseFromString(detailHtml, 'text/html');

                const screenshotLink = detailDoc.querySelector('.thumbnail a[data-featherlight="image"]');
                console.log('[projectjav] screenshotLink data-src:', screenshotLink?.getAttribute('data-src') , 'featherlight:', screenshotLink?.getAttribute('data-featherlight'));
                if (screenshotLink) {
                    const thumbImg = screenshotLink.querySelector('img');
                    if (thumbImg) {
                        const src = (thumbImg.getAttribute('src') || '').replace(/\?.*$/, '');
                        if (src) return src.replace(/^http:/, 'https:');
                    }
                    const href = screenshotLink.getAttribute('href') || '';
                    if (href && href.startsWith('http')) return href.replace(/^http:/, 'https:');
                }

                const coverImg = detailDoc.querySelector('.movie-detail .col-md-6 img');
                console.log('[projectjav] coverImg src:', coverImg?.getAttribute('src'));
                if (coverImg) {
                    const src = coverImg.getAttribute('src') || '';
                    if (src) return src.replace(/^http:/, 'https:');
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
            if (cacheEnabled) {
                const cached = sessionStorage.getItem(`thumb_cache_${code}`);
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
                sessionStorage.setItem(`thumb_cache_${code}`, url);
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

    const Trailer = {
        normalize(code) {
            const normalized = String(code || '')
                .trim()
                .replace(/\s+/g, '-')
                .replace(/^FC2[-_]?PPV[-_]?/i, 'FC2-')
                .toUpperCase();
            const compact = normalized.match(/^([A-Z]{2,10})(\d{3,6})$/);
            if (compact) {
                const number = compact[2].replace(/^0+(?=\d{3})/, '');
                return `${compact[1]}-${number}`;
            }
            // 有些站会塞尾巴，先按主番号收。
            const trimmed = normalized.match(/^([A-Z]{2,10}-\d{2,6})/);
            if (trimmed) return trimmed[1];
            return normalized;
        },

        normalizeForCompare(text) {
            return String(text || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        },

        cacheKey(code) {
            return `trailer_cache_v3_${this.normalize(code)}`;
        },

        async show(code) {
            const result = await this.get(code);
            if (result?.url) {
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
                Utils.showToast('未找到可用的视频源。', '节点不可用，请将DMM域名分流到日本ip', 3000);
            }
        },

        async get(code) {
            const id = this.normalize(code);
            const cacheEnabled = Settings.getTrailerCacheEnabled();
            if (cacheEnabled) {
                const cached = sessionStorage.getItem(this.cacheKey(id));
                if (cached) {
                    try {
                        const cachedResult = JSON.parse(cached);
                        if (cachedResult?.url) return cachedResult;
                    } catch {
                    }
                    sessionStorage.removeItem(this.cacheKey(id));
                }
            }

            const resolvers = [
                this.fromDirectSamples,
                this.fromFc2Hub,
                this.fromDmmApi,
                this.fromCurrentPage,
                this.fromJavbus,
                this.fromJavPackApi,
                this.fromJavSpyl
            ];

            for (const resolver of resolvers) {
                try {
                    const result = await resolver.call(this, id);
                    if (result?.url) {
                        if (cacheEnabled) sessionStorage.setItem(this.cacheKey(id), JSON.stringify(result));
                        return result;
                    }
                } catch (e) {
                    console.warn(`Trailer resolver failed: ${resolver.name}`, e);
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

        async firstWorkingUrl(urls, batchSize = 8) {
            const uniqueUrls = [...new Set(urls.filter(Boolean))];
            for (let i = 0; i < uniqueUrls.length; i += batchSize) {
                const batch = uniqueUrls.slice(i, i + batchSize);
                const results = await Promise.all(batch.map(async (url) => {
                    const finalUrl = await this.head(url);
                    return finalUrl ? { url: finalUrl } : null;
                }));
                const found = results.find(Boolean);
                if (found) return found.url;
            }
            return null;
        },

        result(url, source, type = 'video', extra = {}) {
            return { url, source, type, ...extra };
        },

        qualityOptions: [
            { quality: 'sm', text: '低画质' },
            { quality: 'dm', text: '中画质' },
            { quality: 'sm_s', text: '旧视频源-低画质 (240p)' },
            { quality: 'dm_s', text: '旧视频源-中画质 (360p)' },
            { quality: 'dmb_s', text: '旧视频源-中画质 (480p)' },
            { quality: 'dmb_w', text: '旧视频源-中画质宽版 (404p)' },
            { quality: 'mhb_w', text: '旧视频源-高画质宽版 (404p)' },
            { quality: 'mmb', text: '中画质 (432p)' },
            { quality: 'mhb', text: '高画质 (576p)' },
            { quality: 'hmb', text: 'HD (720p)' },
            { quality: 'hhb', text: 'FullHD (1080p)' },
            { quality: 'hhbs', text: 'FullHD (1080p60fps)' },
            { quality: '4k', text: '4K (2160p)' },
            { quality: '4ks', text: '4K (2160p60fps)' }
        ],

        selectHighestQuality(qualityMap) {
            return this.sortQualityKeys(qualityMap)[0] || null;
        },

        sortQualityKeys(qualityMap) {
            const rank = new Map(this.qualityOptions.map((item, index) => [item.quality, index]));
            return Object.keys(qualityMap || {})
                .filter(key => qualityMap[key])
                .sort((a, b) => (rank.get(b) ?? -1) - (rank.get(a) ?? -1));
        },

        async fromDmmApi(id) {
            if (!/^[A-Z]{2,10}-\d{2,6}$/i.test(id) || /^FC2-/i.test(id) || id.includes('VR-')) return null;

            const items = await this.searchDmmContentIds(id);
            if (!items.length) return null;

            for (const item of items) {
                const qualityMap = await this.extractDmmTrailerLinks(item);
                const highestQuality = this.selectHighestQuality(qualityMap);
                if (highestQuality) {
                    return this.result(qualityMap[highestQuality], 'DMM/FANZA 多画质预告', 'video', {
                        qualities: qualityMap,
                        quality: highestQuality,
                        urls: this.sortQualityKeys(qualityMap).map(key => qualityMap[key])
                    });
                }
            }
            return null;
        },

        async searchDmmContentIds(id) {
            const idLower = id.toLowerCase();
            const idNoHyphen = id.replace(/-/g, '').toLowerCase();
            const keywordAttempts = [
                { keyword: id.replace('-', '00'), name: '00 替换关键词' },
                { keyword: id, name: '原始番号关键词' },
                { keyword: idNoHyphen, name: '无横杠关键词' }
            ];

            for (const attempt of keywordAttempts) {
                const params = new URLSearchParams({
                    api_id: 'UrwskPfkqQ0DuVry2gYL',
                    affiliate_id: '10278-996',
                    output: 'json',
                    site: 'FANZA',
                    sort: 'match',
                    keyword: attempt.keyword
                });
                const apiUrl = `https://api.dmm.com/affiliate/v3/ItemList?${params.toString()}`;
                const r = await this.request(apiUrl, {
                    timeout: 15000,
                    headers: { Accept: 'application/json,text/plain,*/*' }
                });
                if (!r?.responseText || r.status < 200 || r.status >= 400) continue;

                let data;
                try {
                    data = JSON.parse(r.responseText);
                } catch {
                    continue;
                }

                const items = data?.result?.items || [];
                const matched = [];
                for (const item of items) {
                    if (matched.length >= 3) break;
                    const contentId = String(item.content_id || '').toLowerCase();
                    const makerProduct = String(item.maker_product || '').toLowerCase();
                    const attemptNormalized = String(attempt.keyword || '').toLowerCase().replace(/-/g, '');
                    if (
                        contentId.includes(attemptNormalized) ||
                        contentId.includes(idNoHyphen) ||
                        makerProduct === idLower
                    ) {
                        matched.push({
                            serviceCode: item.service_code,
                            floorCode: item.floor_code,
                            contentId: item.content_id,
                            pageUrl: item.URL
                        });
                    }
                }

                if (matched.length) return matched;
            }
            return [];
        },

        async extractDmmTrailerLinks({ contentId, serviceCode, floorCode }) {
            if (!contentId || !serviceCode || !floorCode) return null;
            const playerUrl = `https://www.dmm.co.jp/service/digitalapi/-/html5_player/=/cid=${contentId}/mtype=AhRVShI_/service=${serviceCode}/floor=${floorCode}/mode=/`;
            const r = await this.request(playerUrl, {
                timeout: 15000,
                headers: {
                    'accept-language': 'ja-JP,ja;q=0.9',
                    Cookie: 'age_check_done=1'
                }
            });
            if (!r?.responseText || r.status < 200 || r.status >= 400) return null;
            if (r.responseText.includes('このサービスはお住まいの地域からは')) {
                console.warn('DMM/FANZA 播放器页提示地区不可用，继续尝试其它来源');
                return null;
            }

            const argsMatch = r.responseText.match(/const\s+args\s*=\s*({[\s\S]*?});/);
            if (!argsMatch) return null;

            let args;
            try {
                args = JSON.parse(argsMatch[1]);
            } catch (e) {
                console.warn('DMM/FANZA 播放器 args 解析失败:', e);
                return null;
            }

            if (!Array.isArray(args.bitrates)) return null;

            const qualityKeys = this.qualityOptions.map(item => item.quality).join('|');
            const qualityRegex = new RegExp(`(${qualityKeys})\\.mp4(?:[?#].*)?$`);
            const qualityMap = {};

            args.bitrates.forEach(item => {
                let videoUrl = item?.src;
                if (!videoUrl || typeof videoUrl !== 'string') return;
                const match = videoUrl.match(qualityRegex);
                if (!match?.[1]) return;
                videoUrl = videoUrl
                    .replace(/^\/\//, 'https://')
                    .replace(/^http:/, 'https:')
                    .replace('cc3001.dmm.co.jp', 'cc3001.dmm.com');
                qualityMap[match[1]] = videoUrl;
            });

            return Object.keys(qualityMap).length ? qualityMap : null;
        },

        fromCurrentPage(id) {
            if (/javbus\.com/i.test(location.hostname)) {
                const direct = this.extractMp4FromDoc(document, location.href);
                if (direct) return this.result(direct, '当前 JavBus 页面');

                const cid = this.extractDmmCid(document.documentElement.innerHTML);
                if (cid) {
                    return this.firstWorkingUrl(this.dmmUrlsFromPart(cid))
                        .then(url => url ? this.result(url, 'JavBus DMM 预告') : null);
                }
            }

            return null;
        },

        async fromDirectSamples(id) {
            const urls = [];
            const lower = id.toLowerCase();

            if (/^[01]\d{5}-\d{2,3}$/.test(lower)) {
                urls.push(`https://smovie.caribbeancom.com/sample/movies/${lower}/480p.mp4`);
                urls.push(`http://smovie.caribbeancom.com/sample/movies/${lower}/480p.mp4`);
                urls.push(`https://smovie.1pondo.tv/sample/movies/${lower.replace('-', '_')}/480p.mp4`);
                urls.push(`http://smovie.1pondo.tv/sample/movies/${lower.replace('-', '_')}/480p.mp4`);
            }

            if (/^heyzo[-_ ]?\d{4}$/i.test(id)) {
                const num = id.match(/\d{4}/)?.[0];
                urls.push(`https://www.heyzo.com/contents/3000/${num}/heyzo_hd_${num}_sample.mp4`);
            }

            if (/^(?:k|n)\d{4}$/i.test(id)) {
                urls.push(`https://my.cdn.tokyo-hot.com/media/samples/${lower}.mp4`);
            }

            const url = await this.firstWorkingUrl(urls, 4);
            return url ? this.result(url, '无码直连预告') : null;
        },

        async fromFc2Hub(id) {
            if (!/^FC2-\d{6,9}$/i.test(id)) return null;

            const searchUrl = `https://fc2hub.com/search?kw=${encodeURIComponent(id)}`;
            const search = await this.request(searchUrl, { timeout: 15000 });
            if (!search) return null;

            let detailUrl = search.finalUrl && search.finalUrl !== searchUrl ? search.finalUrl : null;
            if (!detailUrl && search.responseText) {
                const doc = new DOMParser().parseFromString(search.responseText, 'text/html');
                const link = doc.querySelector('a[href*="/id"], a[href*="fc2"]')?.getAttribute('href');
                if (link) detailUrl = link.startsWith('http') ? link : new URL(link, searchUrl).href;
            }
            if (!detailUrl) return null;

            const doc = await this.requestDoc(detailUrl, { timeout: 15000 });
            const iframe = doc?.querySelector('iframe.lazy[data-src], iframe[src]');
            const iframeUrl = iframe?.dataset?.src || iframe?.getAttribute('src');
            if (!iframeUrl) return null;

            return this.result(iframeUrl.startsWith('http') ? iframeUrl : new URL(iframeUrl, detailUrl).href, 'FC2Hub 预告', 'iframe');
        },

        async fromJavbus(id) {
            if (!/^[A-Z]{2,10}-\d{2,6}$/i.test(id)) return null;

            const detailUrl = `https://www.javbus.com/${encodeURIComponent(id)}`;
            const doc = await this.requestDoc(detailUrl, { timeout: 15000 });
            if (!doc) return null;

            const direct = this.extractMp4FromDoc(doc, detailUrl);
            if (direct) {
                const finalUrl = await this.head(direct);
                if (finalUrl) return this.result(finalUrl, 'JavBus 页面预告');
            }

            const cid = this.extractDmmCid(doc.documentElement.innerHTML);
            if (!cid) return null;

            const url = await this.firstWorkingUrl(this.dmmUrlsFromPart(cid));
            return url ? this.result(url, 'JavBus DMM 预告') : null;
        },

        async fromJavPackApi(id) {
            // jav-pack-api: 直接返回 DMM 预告片地址，无需 API key
            // https://jav-pack-api.bolin.workers.dev/trailers/{番号}
            if (/^FC2-/i.test(id)) return null;
            const apiUrl = `https://jav-pack-api.bolin.workers.dev/trailers/${encodeURIComponent(id)}`;
            const r = await this.request(apiUrl, { timeout: 10000 });
            if (!r?.responseText || r.status < 200 || r.status >= 400) return null;

            let json;
            try { json = JSON.parse(r.responseText); } catch { return null; }
            const url = json?.trailer;
            if (!url) return null;

            return this.result(url, 'DMM 预告', 'video', { urls: [url] });
        },

        async fromJavSpyl(id) {
            const r = await this.request('https://api.javspyl.eu.org/api/', {
                method: 'POST',
                timeout: 12000,
                headers: {
                    origin: 'https://api.javspyl.eu.org',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: `ID=${encodeURIComponent(id)}`
            });
            if (!r?.responseText) return null;

            try {
                const data = JSON.parse(r.responseText);
                let url = data?.info?.url;
                if (!url) return null;
                if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
                const finalUrl = await this.head(url);
                return finalUrl ? this.result(finalUrl, 'JavSpyl 预告') : null;
            } catch {
                return null;
            }
        },

        extractMp4FromDoc(doc, baseUrl = location.href) {
            const node = doc.querySelector('video source[src], video[src], source[src*=".mp4"]');
            let url = node?.getAttribute('src') || node?.src;
            if (!url) {
                const html = doc.documentElement.innerHTML;
                url = html.match(/https?:\/\/[^"'\\\s<>]+\.mp4(?:\?[^"'\\\s<>]*)?/i)?.[0];
            }
            if (!url) return null;
            return url.startsWith('http') ? url.replace(/^http:/, 'https:') : new URL(url, baseUrl).href;
        },

        extractDmmCid(text) {
            const raw = String(text || '');
            const match =
                raw.match(/cid=([a-z0-9_]+)/i) ||
                raw.match(/\/video\/([a-z0-9_]+)\//i) ||
                raw.match(/\/cid\/([a-z0-9_]+)/i);
            return match?.[1]?.toLowerCase() || null;
        },

        dmmUrlsFromPart(part) {
            const urlPart = String(part || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
            if (!urlPart || urlPart.length < 5) return [];
            const infix = 'litevideo/freepv';
            const hosts = ['cc3001.dmm.com'];
            const qualities = ['mhb', '_dmb_w'];
            const first = urlPart[0];
            const prefix = urlPart.substring(0, 3);
            const urls = [];

            hosts.forEach(host => {
                qualities.forEach(q => {
                    urls.push(`https://${host}/${infix}/${first}/${prefix}/${urlPart}/${urlPart}${q}.mp4`);
                });
            });
            return urls;
        },


    };

    const Settings = {
        getPreviewCacheEnabled() {
            return GM_getValue('preview_cache_enabled', true);
        },
        setPreviewCacheEnabled(value) {
            GM_setValue('preview_cache_enabled', value);
        },
        getTrailerCacheEnabled() {
            return GM_getValue('trailer_cache_enabled', true);
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
            const index = GM_getValue('default_search_engine', 0);
            return SearchEngines[index] || SearchEngines[0];
        },

        setDefaultSearchEngine(index) {
            GM_setValue('default_search_engine', index);
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

    const DEFAULT_SEARCH_ENGINE_INDEX = 0;

    function addNyaaBtn(code, container, useCapture = false) {
        const btn = Utils.createBtn('🔍 Sukebei', '#17a2b8', () => {
            window.open(`https://sukebei.nyaa.si/?f=0&c=0_0&q=${code}`);
        }, useCapture);
        container.appendChild(btn);
    }

    function addJavbusBtn(code, container, useCapture = false) {
        const url = Utils.getJavBusUrl(code);
        const btn = Utils.createBtn('🎬 JavBus', '#007bff', () => {
            window.open(url);
        }, useCapture);
        container.appendChild(btn);
    }

    function addJavdbBtn(code, container, useCapture = false) {
        const btn = Utils.createBtn('📀 JavDB', '#6f42c1', () => {
            window.open(`https://javdb.com/search?q=${code}`);
        }, useCapture);
        container.appendChild(btn);
    }

    function addMissAVBtn(code, container, useCapture = false) {
        const codeLower = code.toLowerCase();
        const directUrl = `https://missav.ws/${codeLower}`;
        const btn = Utils.createBtn('🎬 MissAV', '#ec4899', () => {
            window.open(directUrl);
        }, useCapture);
        container.appendChild(btn);
    }

    function addDmmBtn(code, container, useCapture = false) {
        const btn = Utils.createBtn('▶ FANZA', '#c0392b', () => {
            window.open(`https://www.dmm.co.jp/mono/-/search/=/searchstr=${encodeURIComponent(code)}/`);
        }, useCapture);
        container.appendChild(btn);
    }

    function addTrailerBtn(code, container, useCapture = false) {
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
        container.appendChild(btn);
    }

    function addPreviewBtn(code, container, useCapture = false) {
        const btn = Utils.createBtn('🖼️ 预览图', '#28a745', async () => {
            await Thumbnail.show(code);
        }, useCapture);
        container.appendChild(btn);
    }

    function addSearchMenu(code, container, useCapture = false) {
        const defaultEngine = Settings.getDefaultSearchEngine();

        const menuDiv = document.createElement('div');
        menuDiv.className = 'search-menu';
        menuDiv.style.cssText = `
            position: relative;
            display: inline-block;
        `;

        const mainBtn = Utils.createBtn(`🔍 ${defaultEngine.name}`, defaultEngine.color, () => {
            window.open(defaultEngine.url(code));
        }, useCapture);
        mainBtn.classList.add('search-main-btn');
        menuDiv.appendChild(mainBtn);

        const subMenu = document.createElement('div');
        subMenu.className = 'search-submenu';
        subMenu.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            display: none;
            flex-direction: column;
            gap: 4px;
            margin-top: 4px;
            padding: 4px;
            background: rgba(255,255,255,0.95);
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            min-width: 120px;
            backdrop-filter: blur(5px);
        `;

        SearchEngines.forEach(engine => {
            if (engine.name === defaultEngine.name) return;

            const subBtn = Utils.createBtn(`🔍 ${engine.name}`, engine.color, () => {
                window.open(engine.url(code));
            }, useCapture);
            subBtn.style.margin = '2px 0';
            subBtn.style.width = '100%';
            subBtn.style.textAlign = 'left';
            subMenu.appendChild(subBtn);
        });

        menuDiv.appendChild(subMenu);

        let hoverTimer;
        menuDiv.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimer);
            hoverTimer = setTimeout(() => {
                subMenu.style.display = 'flex';
                subMenu.style.animation = 'menuFadeIn 0.2s ease';
            }, 1000);
        });

        menuDiv.addEventListener('mouseleave', (e) => {
            clearTimeout(hoverTimer);
            if (e.relatedTarget && subMenu.contains(e.relatedTarget)) return;

            setTimeout(() => {
                if (!subMenu.matches(':hover')) {
                    subMenu.style.display = 'none';
                }
            }, 300);
        });

        subMenu.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimer);
        });

        subMenu.addEventListener('mouseleave', () => {
            subMenu.style.display = 'none';
        });

        container.appendChild(menuDiv);
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
            titleSelector: '.archive-title h1'
        },
        {
            id: 'emby',
            name: 'Emby',
            match: (url) => /10\.10\.10\.\d+:\d+\/web\/index\.html/.test(url) || /emby\.sh1nyan\.fun\/web\/index\.html/.test(url),
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
        }
    ];

    function renderButtonsForCurrentPage() {
        const site = Sites.find(s => s.match(window.location.href));
        if (!site) return;

        const titleElem = document.querySelector(site.titleSelector);
        if (!titleElem) return;

        if (titleElem.dataset.enhanced === '1') return;
        titleElem.dataset.enhanced = '1';

        const code = Utils.extractCode(titleElem.textContent);
        if (!code) return;

        const btnGroup = document.createElement('div');
        btnGroup.className = 'jav-jump-btn-group';

        if (site.id === 'javlibrary') {
            addNyaaBtn(code, btnGroup);
            addJavbusBtn(code, btnGroup);
            addJavdbBtn(code, btnGroup);
            addMissAVBtn(code, btnGroup);
            addDmmBtn(code, btnGroup);
            addSearchMenu(code, btnGroup);
            addTrailerBtn(code, btnGroup);
            addPreviewBtn(code, btnGroup);

            btnGroup.querySelectorAll('a').forEach(btn => {
                let style = btn.getAttribute('style') || '';
                style = style.replace(/background:\s*([^;]+);/g, 'background: $1 !important;');
                style = style.replace(/color:\s*([^;]+);/g, 'color: $1 !important;');
                btn.setAttribute('style', style);
            });

            btnGroup.classList.add('javlibrary-fix');

            const rightColumn = document.querySelector('#rightcolumn');
            if (rightColumn) {
                rightColumn.prepend(btnGroup);
            } else {
                titleElem.insertAdjacentElement('afterend', btnGroup);
            }
        } else if (site.id === 'missav') {
            const missavBtns = [
                { text: '🔍 Sukebei', color: '#17a2b8', url: `https://sukebei.nyaa.si/?f=0&c=0_0&q=${code}` },
                { text: '🎬 JavBus',  color: '#007bff',  url: Utils.getJavBusUrl(code) },
                { text: '📀 JavDB',   color: '#6f42c1',  url: `https://javdb.com/search?q=${code}` },
            ];
            missavBtns.forEach(({ text, color, url }) => {
                btnGroup.appendChild(Utils.createLinkBtn(text, color, url));
            });

            const defaultEngine = Settings.getDefaultSearchEngine();
            const searchMenuDiv = document.createElement('div');
            searchMenuDiv.style.cssText = 'position: relative; display: inline-block;';

            const mainSearchBtn = Utils.createLinkBtn(`🔍 ${defaultEngine.name}`, defaultEngine.color, defaultEngine.url(code));
            searchMenuDiv.appendChild(mainSearchBtn);

            const subMenu = document.createElement('div');
            subMenu.style.cssText = `
                position: absolute; top: 100%; left: 0; display: none;
                flex-direction: column; gap: 4px; margin-top: 4px; padding: 4px;
                background: rgba(30,30,30,0.95); border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.4); z-index: 10000; min-width: 120px;
            `;
            SearchEngines.forEach(engine => {
                if (engine.name === defaultEngine.name) return;
                const subBtn = Utils.createLinkBtn(`🔍 ${engine.name}`, engine.color, engine.url(code));
                subBtn.style.margin = '2px 0';
                subMenu.appendChild(subBtn);
            });
            searchMenuDiv.appendChild(subMenu);

            let hoverTimer;
            searchMenuDiv.addEventListener('mouseenter', () => {
                clearTimeout(hoverTimer);
                hoverTimer = setTimeout(() => { subMenu.style.display = 'flex'; }, 800);
            });
            searchMenuDiv.addEventListener('mouseleave', () => {
                clearTimeout(hoverTimer);
                setTimeout(() => { if (!subMenu.matches(':hover')) subMenu.style.display = 'none'; }, 300);
            });
            subMenu.addEventListener('mouseleave', () => { subMenu.style.display = 'none'; });
            btnGroup.appendChild(searchMenuDiv);

            addTrailerBtn(code, btnGroup);
            addPreviewBtn(code, btnGroup);

            btnGroup.style.cssText = `
                margin: 10px 0 6px 0;
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                align-items: center;
                position: relative;
                z-index: 9999;
            `;

            titleElem.insertAdjacentElement('afterend', btnGroup);
        } else {
            addNyaaBtn(code, btnGroup);
            addJavbusBtn(code, btnGroup);
            addJavdbBtn(code, btnGroup);
            addMissAVBtn(code, btnGroup);
            addDmmBtn(code, btnGroup);
            addSearchMenu(code, btnGroup);
            addTrailerBtn(code, btnGroup);
            addPreviewBtn(code, btnGroup);

            if (site.id === 'emby') {
                btnGroup.classList.add('emby-fix');
                const parent = titleElem.parentNode;
                if (parent) {
                    parent.appendChild(btnGroup);
                } else {
                    titleElem.insertAdjacentElement('afterend', btnGroup);
                }
            } else {
                titleElem.insertAdjacentElement('afterend', btnGroup);
            }
        }

        const embyGroup = document.querySelector('.emby-button-group');
        if (embyGroup && btnGroup.isConnected) {
            const jumpBtnCount = btnGroup.childElementCount;
            [...btnGroup.children].forEach(el => embyGroup.insertBefore(el, embyGroup.firstChild));
            const sep = document.createElement('span');
            sep.style.cssText = 'display:inline-block;width:1px;height:16px;background:rgba(128,128,128,0.35);margin:0 4px;align-self:center;flex-shrink:0;';
            embyGroup.insertBefore(sep, embyGroup.children[jumpBtnCount] || null);
            btnGroup.remove();
        }
    }

    const observer = new MutationObserver(() => {
        renderButtonsForCurrentPage();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    renderButtonsForCurrentPage();

})();