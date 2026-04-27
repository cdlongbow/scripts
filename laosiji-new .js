// ==UserScript==
// @name         JAV老司机-新
// @namespace    https://github.com/ZiPenOk
// @version      1.0.1
// @description  JavBus / JavDB / JavLib 磁力搜索 + 115离线 + 瀑布流 + 灯箱预览
// @author       ZiPenOk
// @require      https://lib.baomitu.com/jquery/2.2.4/jquery.min.js

// JavLib
// @include      *://*javlibrary.com/*
// @include      *://*javlib.com/*
// @include      *://*r86m.com/*
// @include      *://*s87n.com/*

// JavBus
// @match        https://www.javbus.com/*
// @match        *://*javbus.com/*

// JavDB
// @include      *://*javdb*.com/*

// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_notification
// @grant        GM_setClipboard
// @grant        GM_registerMenuCommand
// @grant        GM_info
// @connect      *
// @license      GPL-3.0
// @downloadURL  https://raw.githubusercontent.com/ZiPenOk/scripts/main/laosiji-new.js
// @updateURL    https://raw.githubusercontent.com/ZiPenOk/scripts/main/laosiji-new.js
// ==/UserScript==

(function () {
    'use strict';

    // =========================================================================
    // [区块1] 配置 - 所有持久化 key 统一管理
    // =========================================================================
    const CFG = {
        // 站点网址（不含协议头，纯域名）
        get javbusUrl()        { return GM_getValue('cfg_javbus_url',        'www.javbus.com'); },
        get javdbUrl()         { return GM_getValue('cfg_javdb_url',         'javdb.com'); },
        get javlibUrl()        { return GM_getValue('cfg_javlib_url',        'www.javlibrary.com'); },

        // 磁力搜索引擎域名
        get javdbSearchUrl()   { return GM_getValue('cfg_javdb_search_url',  'javdb.com'); },
        get btsowUrl()         { return GM_getValue('cfg_btsow_url',         'btsow.hair'); },
        get btdigUrl()         { return GM_getValue('cfg_btdig_url',         'btdig.com'); },
        get sukebeiUrl()          { return GM_getValue('cfg_sukebei_url',          'sukebei.nyaa.si'); },
        get torrentkittyUrl()  { return GM_getValue('cfg_torrentkitty_url',  'www.torrentkitty.tv'); },

        // 功能开关
        get waterfallEnabled() { return GM_getValue('cfg_waterfall', 1); },
        get defaultEngine()    { return GM_getValue('cfg_default_engine', 'javdb.com'); },

        set javbusUrl(v)        { GM_setValue('cfg_javbus_url', v); },
        set javdbUrl(v)         { GM_setValue('cfg_javdb_url', v); },
        set javlibUrl(v)        { GM_setValue('cfg_javlib_url', v); },
        set javdbSearchUrl(v)   { GM_setValue('cfg_javdb_search_url', v); },
        set btsowUrl(v)         { GM_setValue('cfg_btsow_url', v); },
        set btdigUrl(v)         { GM_setValue('cfg_btdig_url', v); },
        set sukebeiUrl(v)          { GM_setValue('cfg_sukebei_url', v); },
        set torrentkittyUrl(v)  { GM_setValue('cfg_torrentkitty_url', v); },
        set waterfallEnabled(v) { GM_setValue('cfg_waterfall', v); },
        set defaultEngine(v)    { GM_setValue('cfg_default_engine', v); },
    };

    // =========================================================================
    // [区块2] 工具层
    // =========================================================================

    // --- 日志 ---
    const log = (...args) => console.log('[老司机]', ...args);

    // --- 通知 ---
    function notify(title, text, url) {
        GM_notification({ title, text, onclick: () => url && window.open(url) });
    }

    // --- 解析 HTML 字符串为 Document ---
    function parseHTML(str) {
        return new DOMParser().parseFromString(str, 'text/html');
    }

    // --- GM_xmlhttpRequest 封装（返回 Promise）---
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

    // --- 请求 HTML 页面，返回 Document ---
    async function fetchDoc(url, referrer = '') {
        const r = await gmFetch(url, { headers: { 'Cache-Control': 'no-cache', referrer } });
        if (!r.loadstuts) return null;
        return parseHTML(r.responseText);
    }

    // --- 番号标准化 ---
    function normalizeAvid(raw) {
        if (!raw) return '';
        raw = raw.trim().toUpperCase();
        // 已有连字符且不是 -0 开头的数字段，直接返回
        if (raw.match(/-[^0]/)) return raw;
        // 纯数字/下划线不处理
        if (raw.match(/^[0-9_-]+$/)) return raw;
        // 字母+数字 => ABC-123
        const m = raw.match(/^([A-Z]+[-_]?)(\d+)$/);
        if (m) return m[1].replace(/[-_]$/, '') + '-' + m[2];
        return raw;
    }

    // --- 番号解析（用于缩略图搜索匹配）---
    function parseCode(code) {
        const codes = code.split(/[-_]/);
        const sep = '\\s?(0|-|_){0,2}\\s?';
        let pattern = codes.join(sep);
        if (/^fc2/i.test(code)) pattern = `${codes[0]}${sep}(ppv)?${sep}${codes.at(-1)}`;
        return {
            code,
            codes,
            prefix: codes[0],
            regex: new RegExp(`(?<![a-z])${pattern}(?!\\d)`, 'i'),
        };
    }

    // =========================================================================
    // [区块3] 缩略图获取
    // =========================================================================

    // 静态缓存（内存级），避免同一页面重复请求
    const _thumbCache = new Map();

    async function fetchThumbnail(code) {
        if (_thumbCache.has(code)) return _thumbCache.get(code);

        // GM_getValue 磁盘缓存
        const cached = GM_getValue(`thumb_${code}`);
        if (cached) { _thumbCache.set(code, cached); return cached; }

        const { regex } = parseCode(code);

        // 尝试 javfree
        try {
            const url = await _thumbFromJavfree(code, regex);
            if (url) { _cacheThumb(code, url); return url; }
        } catch(e) { log('javfree fail:', e.message); }

        // 降级 javstore
        try {
            const url = await _thumbFromJavstore(code, regex);
            if (url) { _cacheThumb(code, url); return url; }
        } catch(e) { log('javstore fail:', e.message); }

        return null;
    }

    function _cacheThumb(code, url) {
        _thumbCache.set(code, url);
        GM_setValue(`thumb_${code}`, url);
    }

    async function _thumbFromJavfree(code, regex) {
        const doc = await fetchDoc(`https://javfree.me/search/${code}`);
        if (!doc) throw new Error('javfree no response');
        const links = [...doc.querySelectorAll('.entry-title>a')];
        const link = links.find(a => regex.test(a.textContent));
        if (!link) throw new Error('javfree no match');
        const detail = await fetchDoc(link.href);
        if (!detail) throw new Error('javfree detail fail');
        const imgs = detail.querySelectorAll('p>img');
        const url = code.startsWith('n0') || code.startsWith('n1')
            ? [...imgs].map(i => i.src).find(s => /[s]+\.(jpe?g|png)$/i.test(s))
            : imgs?.[1]?.src;
        if (!url) throw new Error('javfree no img');
        return url;
    }

    async function _thumbFromJavstore(code, regex) {
        const doc = await fetchDoc(`https://img.javstore.net/me/search/?q=${code}`);
        if (!doc) throw new Error('javstore no response');
        const imgs = [...doc.querySelectorAll('.image-container img')];
        const url = imgs.find(i => regex.test(i.src))?.src?.replace('.md', '');
        if (!url) throw new Error('javstore no match');
        return url;
    }

    // =========================================================================
    // [区块4] 灯箱 Lightbox
    // =========================================================================

    const Lightbox = (() => {
        let overlay, img, _url;

        function build() {
            if (document.getElementById('jav-lightbox')) return;

            GM_addStyle(`
                #jav-lightbox {
                    display: none;
                    position: fixed;
                    inset: 0;
                    z-index: 999999;
                    background: rgba(0,0,0,.88);
                    overflow-y: auto;
                    overflow-x: hidden;
                    cursor: zoom-in;
                }
                #jav-lightbox.expanded { cursor: zoom-out; }
                #jav-lightbox img {
                    display: block;
                    margin: 0 auto;
                    max-width: 80%;
                    transition: max-width .2s;
                    cursor: inherit;
                    /* 从顶部对齐，不居中，避免首尾裁剪 */
                    position: relative;
                    top: 0;
                }
                #jav-lightbox.expanded img { max-width: 100%; }
                #jav-lightbox-close {
                    position: fixed;
                    top: 14px; right: 20px;
                    color: #fff;
                    font-size: 28px;
                    cursor: pointer;
                    z-index: 1000000;
                    line-height: 1;
                    user-select: none;
                }
            `);

            overlay = document.createElement('div');
            overlay.id = 'jav-lightbox';

            const closeBtn = document.createElement('span');
            closeBtn.id = 'jav-lightbox-close';
            closeBtn.textContent = '✕';
            closeBtn.addEventListener('click', e => { e.stopPropagation(); close(); });

            img = document.createElement('img');
            img.referrerPolicy = 'no-referrer';

            // 点击图片切换缩放
            img.addEventListener('click', e => {
                e.stopPropagation();
                overlay.classList.toggle('expanded');
                if (!overlay.classList.contains('expanded')) {
                    overlay.scrollTop = 0;
                }
            });

            // 点击空白区域关闭
            overlay.addEventListener('click', () => close());

            // 滚轮滚动（覆盖页面滚动）
            overlay.addEventListener('wheel', e => {
                e.preventDefault();
                overlay.scrollTop += e.deltaY;
            }, { passive: false });

            overlay.appendChild(closeBtn);
            overlay.appendChild(img);
            document.body.appendChild(overlay);

            document.addEventListener('keydown', e => {
                if (e.key === 'Escape' && overlay.style.display !== 'none') close();
            });
        }

        function open(url) {
            build();
            _url = url;
            img.src = url;
            overlay.classList.remove('expanded');
            overlay.scrollTop = 0;
            overlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }

        function close() {
            if (!overlay) return;
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        }

        return { open, close };
    })();

    // 创建预览图按钮（插入到任意容器）
    function createPreviewBtn(avid) {
        const btn = document.createElement('button');
        btn.textContent = '🖼 预览图';
        btn.style.cssText = `
            display: inline-block; margin-left: 8px;
            padding: 2px 8px; font-size: 12px;
            background: #e8f4fd; border: 1px solid #90c5e8;
            border-radius: 4px; cursor: pointer; color: #1a6fa8;
            vertical-align: middle;
        `;
        let loaded = false;
        btn.addEventListener('click', async () => {
            btn.textContent = '⏳';
            btn.disabled = true;
            if (!loaded) {
                const url = await fetchThumbnail(avid);
                loaded = true;
                btn.textContent = '🖼 预览图';
                btn.disabled = false;
                if (url) {
                    Lightbox.open(url);
                } else {
                    btn.textContent = '🖼 无图';
                    btn.style.color = '#999';
                }
            } else {
                btn.textContent = '🖼 预览图';
                btn.disabled = false;
            }
        });
        return btn;
    }

    // =========================================================================
    // [区块5] 设置面板 UI（绑定到油猴菜单）
    // =========================================================================

    const SettingsPanel = (() => {
        function getEngineNames() {
            return {
                [CFG.javdbSearchUrl]: 'JavDB',
                [CFG.btsowUrl]:       'BtSow',
                [CFG.btdigUrl]:       'BtDig',
                [CFG.sukebeiUrl]:        'sukebei',
                [CFG.torrentkittyUrl]:'TorrentKitty',
            };
        }

        function open() {
            if (document.getElementById('jav-settings-overlay')) {
                document.getElementById('jav-settings-overlay').style.display = 'flex';
                return;
            }

            GM_addStyle(`
                #jav-settings-overlay {
                    position: fixed; inset: 0; z-index: 999998;
                    background: rgba(0,0,0,.5);
                    display: flex; align-items: center; justify-content: center;
                }
                #jav-settings-panel {
                    background: #fff; border-radius: 12px;
                    width: 480px; max-height: 80vh; overflow-y: auto;
                    padding: 0; box-shadow: 0 8px 40px rgba(0,0,0,.3);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    font-size: 14px; color: #333;
                }
                #jav-settings-panel .sp-header {
                    position: sticky; top: 0;
                    background: linear-gradient(135deg, #1a6fa8, #0d4f7a);
                    color: #fff; padding: 16px 20px;
                    border-radius: 12px 12px 0 0;
                    display: flex; align-items: center; justify-content: space-between;
                }
                #jav-settings-panel .sp-header h2 { margin: 0; font-size: 16px; font-weight: 600; }
                #jav-settings-panel .sp-close {
                    cursor: pointer; font-size: 20px; line-height: 1;
                    opacity: .8; transition: opacity .15s;
                }
                #jav-settings-panel .sp-close:hover { opacity: 1; }
                #jav-settings-panel .sp-section {
                    padding: 16px 20px 4px;
                }
                #jav-settings-panel .sp-section-title {
                    font-size: 11px; font-weight: 700; color: #888;
                    text-transform: uppercase; letter-spacing: .06em;
                    margin-bottom: 10px; padding-bottom: 6px;
                    border-bottom: 1px solid #eee;
                }
                #jav-settings-panel .sp-row {
                    display: flex; align-items: center;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid #f5f5f5;
                }
                #jav-settings-panel .sp-row:last-child { border-bottom: none; }
                #jav-settings-panel .sp-label { color: #555; flex: 0 0 130px; }
                #jav-settings-panel .sp-input {
                    flex: 1; margin-left: 12px;
                    padding: 5px 8px; border: 1px solid #ddd;
                    border-radius: 6px; font-size: 13px;
                    outline: none; transition: border-color .15s;
                }
                #jav-settings-panel .sp-input:focus { border-color: #1a6fa8; }
                #jav-settings-panel .sp-select {
                    flex: 1; margin-left: 12px;
                    padding: 5px 8px; border: 1px solid #ddd;
                    border-radius: 6px; font-size: 13px;
                    background: #fff; outline: none;
                }
                #jav-settings-panel .sp-toggle {
                    position: relative; width: 42px; height: 24px;
                    flex: 0 0 42px; margin-left: 12px;
                }
                #jav-settings-panel .sp-toggle input { opacity: 0; width: 0; height: 0; }
                #jav-settings-panel .sp-toggle-slider {
                    position: absolute; inset: 0; cursor: pointer;
                    background: #ccc; border-radius: 24px;
                    transition: background .2s;
                }
                #jav-settings-panel .sp-toggle-slider::before {
                    content: ''; position: absolute;
                    width: 18px; height: 18px; border-radius: 50%;
                    background: #fff; left: 3px; top: 3px;
                    transition: transform .2s;
                }
                #jav-settings-panel .sp-toggle input:checked + .sp-toggle-slider { background: #1a6fa8; }
                #jav-settings-panel .sp-toggle input:checked + .sp-toggle-slider::before { transform: translateX(18px); }
                #jav-settings-panel .sp-footer {
                    padding: 14px 20px;
                    background: #fafafa;
                    border-top: 1px solid #eee;
                    border-radius: 0 0 12px 12px;
                    display: flex; justify-content: flex-end; gap: 10px;
                }
                #jav-settings-panel .sp-btn {
                    padding: 8px 20px; border-radius: 7px;
                    font-size: 14px; cursor: pointer; border: none;
                    font-weight: 500; transition: opacity .15s;
                }
                #jav-settings-panel .sp-btn:hover { opacity: .85; }
                #jav-settings-panel .sp-btn-cancel {
                    background: #eee; color: #555;
                }
                #jav-settings-panel .sp-btn-save {
                    background: linear-gradient(135deg, #1a6fa8, #0d4f7a);
                    color: #fff;
                }
                #jav-settings-panel .sp-saved-tip {
                    font-size: 12px; color: #1a6fa8; align-self: center;
                    opacity: 0; transition: opacity .3s;
                }
                #jav-settings-panel .sp-saved-tip.show { opacity: 1; }
            `);

            const overlay = document.createElement('div');
            overlay.id = 'jav-settings-overlay';

            const engineNames = getEngineNames();
            const engineOptions = Object.entries(engineNames)
                .map(([val, name]) =>
                    `<option value="${val}" ${CFG.defaultEngine === val ? 'selected' : ''}>${name} (${val})</option>`
                ).join('');

            overlay.innerHTML = `
                <div id="jav-settings-panel">
                    <div class="sp-header">
                        <h2>🚗 老司机设置</h2>
                        <span class="sp-close">✕</span>
                    </div>

                    <div class="sp-section">
                        <div class="sp-section-title">站点网址</div>
                        <div class="sp-row">
                            <span class="sp-label">JavBus 域名</span>
                            <input class="sp-input" id="sp-javbus-url" value="${CFG.javbusUrl}" placeholder="www.javbus.com">
                        </div>
                        <div class="sp-row">
                            <span class="sp-label">JavDB 域名</span>
                            <input class="sp-input" id="sp-javdb-url" value="${CFG.javdbUrl}" placeholder="javdb.com">
                        </div>
                        <div class="sp-row">
                            <span class="sp-label">JavLib 域名</span>
                            <input class="sp-input" id="sp-javlib-url" value="${CFG.javlibUrl}" placeholder="www.javlibrary.com">
                        </div>
                    </div>

                    <div class="sp-section">
                        <div class="sp-section-title">磁力搜索引擎域名</div>
                        <div class="sp-row">
                            <span class="sp-label">JavDB 搜索</span>
                            <input class="sp-input" id="sp-javdb-search" value="${CFG.javdbSearchUrl}" placeholder="javdb.com">
                        </div>
                        <div class="sp-row">
                            <span class="sp-label">BtSow</span>
                            <input class="sp-input" id="sp-btsow" value="${CFG.btsowUrl}" placeholder="btsow.hair">
                        </div>
                        <div class="sp-row">
                            <span class="sp-label">BtDig</span>
                            <input class="sp-input" id="sp-btdig" value="${CFG.btdigUrl}" placeholder="btdig.com">
                        </div>
                        <div class="sp-row">
                            <span class="sp-label">sukebei</span>
                            <input class="sp-input" id="sp-sukebei" value="${CFG.sukebeiUrl}" placeholder="sukebei.nyaa.si">
                        </div>
                        <div class="sp-row">
                            <span class="sp-label">TorrentKitty</span>
                            <input class="sp-input" id="sp-torrentkitty" value="${CFG.torrentkittyUrl}" placeholder="www.torrentkitty.tv">
                        </div>
                    </div>

                    <div class="sp-section">
                        <div class="sp-section-title">功能设置</div>
                        <div class="sp-row">
                            <span class="sp-label">默认搜索引擎</span>
                            <select class="sp-select" id="sp-default-engine">${engineOptions}</select>
                        </div>
                        <div class="sp-row">
                            <span class="sp-label">瀑布流翻页</span>
                            <label class="sp-toggle">
                                <input type="checkbox" id="sp-waterfall" ${CFG.waterfallEnabled ? 'checked' : ''}>
                                <span class="sp-toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <div class="sp-footer">
                        <span class="sp-saved-tip" id="sp-saved-tip">✓ 已保存，刷新页面生效</span>
                        <button class="sp-btn sp-btn-cancel">取消</button>
                        <button class="sp-btn sp-btn-save">保存</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // 关闭
            const closePanel = () => { overlay.style.display = 'none'; };
            overlay.querySelector('.sp-close').addEventListener('click', closePanel);
            overlay.querySelector('.sp-btn-cancel').addEventListener('click', closePanel);
            overlay.addEventListener('click', e => { if (e.target === overlay) closePanel(); });

            // 保存
            overlay.querySelector('.sp-btn-save').addEventListener('click', () => {
                CFG.javbusUrl       = overlay.querySelector('#sp-javbus-url').value.trim().replace(/^https?:\/\//, '');
                CFG.javdbUrl        = overlay.querySelector('#sp-javdb-url').value.trim().replace(/^https?:\/\//, '');
                CFG.javlibUrl       = overlay.querySelector('#sp-javlib-url').value.trim().replace(/^https?:\/\//, '');
                CFG.javdbSearchUrl  = overlay.querySelector('#sp-javdb-search').value.trim().replace(/^https?:\/\//, '');
                CFG.btsowUrl        = overlay.querySelector('#sp-btsow').value.trim().replace(/^https?:\/\//, '');
                CFG.btdigUrl        = overlay.querySelector('#sp-btdig').value.trim().replace(/^https?:\/\//, '');
                CFG.sukebeiUrl         = overlay.querySelector('#sp-sukebei').value.trim().replace(/^https?:\/\//, '');
                CFG.torrentkittyUrl = overlay.querySelector('#sp-torrentkitty').value.trim().replace(/^https?:\/\//, '');
                CFG.defaultEngine   = overlay.querySelector('#sp-default-engine').value;
                CFG.waterfallEnabled = overlay.querySelector('#sp-waterfall').checked ? 1 : 0;

                const tip = overlay.querySelector('#sp-saved-tip');
                tip.classList.add('show');
                setTimeout(() => tip.classList.remove('show'), 2500);
            });
        }

        return { open };
    })();

    GM_registerMenuCommand('⚙️ 老司机设置', () => SettingsPanel.open());

    // =========================================================================
    // [区块6] 瀑布流（参考 jhs.js AutoPagePlugin 逻辑）
    // =========================================================================

    const Waterfall = (() => {
        const PRELOAD_DISTANCE = 500; // 距底部多少 px 时预加载

        function resolveUrl(href) {
            if (!href) return null;
            if (href.startsWith('http')) return href;
            return location.origin + (href.startsWith('/') ? '' : '/') + href;
        }

        function init({ nextSel, itemSel, contSel, pagiSel }) {
            if (!CFG.waterfallEnabled) return;

            const cont = document.querySelector(contSel);
            if (!cont) { log('瀑布流: 找不到容器', contSel); return; }

            const nextEl = document.querySelector(nextSel);
            if (!nextEl) { log('瀑布流: 没有下一页链接', nextSel); return; }

            // 隐藏原分页栏
            const pagi = document.querySelector(pagiSel);
            if (pagi) pagi.style.display = 'none';

            let nextUrl  = resolveUrl(nextEl.getAttribute('href'));
            let isLoading = false;
            let hasMore  = !!nextUrl;

            // loader div：插在容器后面，用于触发检测和状态展示
            const loader = document.createElement('div');
            loader.style.cssText = 'text-align:center;padding:16px;font-size:13px;color:#999;';
            cont.parentNode.insertBefore(loader, cont.nextSibling);

            // 点击 loader 可在出错时重试
            loader.addEventListener('click', () => {
                if (loader.dataset.state === 'error') loadNext();
            });

            function setState(state, text) {
                loader.dataset.state = state;
                loader.textContent = text;
                loader.style.color = state === 'error' ? '#f44336' : '#999';
                loader.style.cursor = state === 'error' ? 'pointer' : 'default';
            }

            async function loadNext() {
                if (isLoading || !hasMore || !nextUrl) return;
                isLoading = true;
                setState('loading', '加载中…');

                try {
                    // 用原生 fetch，same-origin 自动带 cookie，适合同域翻页
                    const html = await fetch(nextUrl, { credentials: 'same-origin' }).then(r => r.text());
                    const doc  = new DOMParser().parseFromString(html, 'text/html');

                    const items = [...doc.querySelectorAll(itemSel)];
                    items.forEach(el => {
                        el.querySelectorAll('a').forEach(a => { a.target = '_blank'; });
                        cont.appendChild(el);
                    });

                    const nextA = doc.querySelector(nextSel);
                    nextUrl  = resolveUrl(nextA?.getAttribute('href') || null);
                    hasMore  = !!nextUrl;

                    if (hasMore) {
                        setState('loading', '');
                    } else {
                        setState('done', '— The End —');
                        window.removeEventListener('scroll', onScroll);
                    }
                } catch(e) {
                    log('瀑布流加载失败:', e);
                    setState('error', '加载失败，点击重试');
                } finally {
                    isLoading = false;
                    // 加载完后立即检查是否还需要继续加载（内容不足一屏的情况）
                    checkLoad();
                }
            }

            function checkLoad() {
                if (!hasMore || isLoading) return;
                // 核心：loader 元素顶部距视口底部小于 PRELOAD_DISTANCE 时触发
                const rect = loader.getBoundingClientRect();
                if (rect.top < window.innerHeight + PRELOAD_DISTANCE) {
                    loadNext();
                }
            }

            function onScroll() { checkLoad(); }

            window.addEventListener('scroll', onScroll, { passive: true });

            // 延迟初始检测（等页面渲染完成）
            setTimeout(checkLoad, 800);

            if (!hasMore) setState('done', '— The End —');
        }

        return { init };
    })();

    // =========================================================================
    // [区块7] 磁力核心（挊）
    // =========================================================================

    const Magnet = (() => {

        // --- 搜索引擎 ---
        const Engines = {
            getAll() {
                return {
                    [CFG.javdbSearchUrl]: _searchJavDB,
                    [CFG.btsowUrl]:       _searchBtsow,
                    [CFG.btdigUrl]:       _searchBtdig,
                    [CFG.sukebeiUrl]:        _searchsukebei,
                    [CFG.torrentkittyUrl]:_searchTorrentkitty,
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
            const r = await gmFetch(`${base}/search?f=download&q=${kw}`, { headers: { referrer: base + '/' } });
            if (!r.loadstuts) return { url: base, data: [] };
            const doc = parseHTML(r.responseText);
            const finalUrl = r.finalUrl || `${base}/search?q=${kw}`;

            // 找到精确匹配的番号条目
            const titleEl = [...doc.querySelectorAll('.box .video-title')]
                .find(el => el.textContent.trim().toUpperCase().replace('+','-') === kw.toUpperCase());
            if (!titleEl) return { url: finalUrl, data: [] };

            const detailUrl = (() => {
                let href = titleEl.closest('a')?.href || titleEl.parentElement?.href || '';
                if (!href.startsWith('http')) href = base + href;
                return href.replace(location.origin, base);
            })();

            const r2 = await gmFetch(detailUrl);
            if (!r2.loadstuts) return { url: finalUrl, data: [] };
            const doc2 = parseHTML(r2.responseText);
            const items = doc2.querySelectorAll('#magnets-content .item');
            const data = [...items].map(el => ({
                title:   el.querySelector('.magnet-name span:nth-child(1)')?.textContent?.trim() || '',
                maglink: el.querySelector('.magnet-name a:nth-child(1)')?.href || '',
                size:    el.querySelector('.magnet-name .meta')?.textContent?.trim() || '',
                src:     r2.finalUrl || detailUrl,
            }));
            return { url: r2.finalUrl || detailUrl, data };
        }

        async function _searchBtsow(kw) {
            const base = 'https://' + CFG.btsowUrl;
            const r = await gmFetch(`${base}/search/${kw}`);
            if (!r.loadstuts) return { url: base, data: [] };
            const doc = parseHTML(r.responseText);
            const rows = doc.querySelectorAll('.data-list a:not(.btn)');
            const data = [...rows].map(a => ({
                title:   a.title || a.textContent.trim(),
                maglink: 'magnet:?xt=urn:btih:' + a.outerHTML.replace(/.*hash\//, '').replace(/\" .*\n.*\n.*\n.*/, ''),
                size:    a.nextElementSibling?.textContent?.trim() || '',
                src:     a.href,
            }));
            return { url: r.finalUrl || base, data };
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

        async function _searchTorrentkitty(kw) {
            const base = 'https://' + CFG.torrentkittyUrl;
            const r = await gmFetch(`${base}/search/${kw}`);
            if (!r.loadstuts) return { url: base, data: [] };
            const doc = parseHTML(r.responseText);
            const rows = [...doc.querySelectorAll('#archiveResult tr:not(:first-child)')];
            const data = rows
                .filter(el => !/(No result)/i.test(el.querySelector('.name')?.textContent || ''))
                .map(el => ({
                    title:   el.querySelector('.name')?.textContent?.trim() || '',
                    maglink: el.querySelector('.action>a:nth-child(2)')?.href || '',
                    size:    el.querySelector('.size')?.textContent?.trim() || '',
                    src:     base + (el.querySelector('.action>a:nth-child(1)')?.getAttribute('href') || ''),
                }));
            return { url: r.finalUrl || base, data };
        }

        // --- 115 离线下载 ---
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

        // --- 磁力表格渲染 ---
        GM_addStyle(`
            #jav-nong-table {
                margin: 8px 0; color: #666;
                font-size: 13px; text-align: center;
                background: #f2f2f2; border-collapse: collapse;
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
                display: block; text-align: left;
            }
            /* 刷新按钮 */
            #jav-nong-refresh {
                display: none; margin-left: 8px;
                color: #e74c3c; font-weight: bold; cursor: pointer;
            }
        `);

        function buildTable(avid) {
            const table = document.createElement('table');
            table.id = 'jav-nong-table';

            // 表头行
            const headRow = document.createElement('tr');
            headRow.className = 'nong-head-row';

            // 引擎选择列
            const thEngine = document.createElement('th');
            const allEngines = Engines.getAll();
            const curKey = CFG.defaultEngine;
            const sel = document.createElement('select');
            sel.style.cssText = 'font-size:12px;border:1px solid #ddd;border-radius:4px;padding:2px 4px;';
            Object.keys(allEngines).forEach(k => {
                const op = document.createElement('option');
                op.value = k;
                op.textContent = k;
                if (k === curKey) op.selected = true;
                sel.appendChild(op);
            });
            // 切换引擎：只影响本次搜索，不持久化
            sel.addEventListener('change', () => {
                runSearch(table, avid, sel.value);
            });
            thEngine.appendChild(sel);
            headRow.appendChild(thEngine);

            // 其他列头
            ['大小', '操作', '115离线'].forEach(txt => {
                const th = document.createElement('th');
                th.textContent = txt;
                headRow.appendChild(th);
            });

            table.appendChild(headRow);

            // Loading 行
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

        function showLoading(table) {
            const notice = table.querySelector('#jav-nong-notice');
            if (!notice) return;
            notice.firstChild.textContent = 'Loading…';
            const btn = notice.querySelector('#jav-nong-refresh');
            if (btn) btn.style.display = 'none';
        }

        function showRefreshBtn(table, msg = '加载超时，') {
            const notice = table.querySelector('#jav-nong-notice');
            if (!notice) return;
            notice.firstChild.textContent = msg;
            const btn = notice.querySelector('#jav-nong-refresh');
            if (btn) btn.style.display = 'inline';
        }

        function fillTable(table, data, engineUrl) {
            // 移除 loading 行
            const notice = table.querySelector('#jav-nong-notice');
            if (notice) notice.parentElement.remove();

            if (!data.length) {
                const emptyRow = document.createElement('tr');
                const td = document.createElement('td');
                td.colSpan = 4;
                td.innerHTML = `无搜索结果 <a href="${engineUrl}" target="_blank" style="color:red">前往查看</a>`;
                emptyRow.appendChild(td);
                table.appendChild(emptyRow);
                return;
            }

            data.forEach(item => {
                const tr = document.createElement('tr');
                tr.setAttribute('data-maglink', item.maglink);

                // 标题
                const tdTitle = document.createElement('td');
                const nameSpan = document.createElement('span');
                nameSpan.className = 'nong-magnet-name';
                nameSpan.title = item.title;
                const titleLink = document.createElement('a');
                titleLink.href = item.src || item.maglink;
                titleLink.target = '_blank';
                titleLink.textContent = item.title;
                nameSpan.appendChild(titleLink);
                tdTitle.appendChild(nameSpan);
                tr.appendChild(tdTitle);

                // 大小
                const tdSize = document.createElement('td');
                tdSize.style.whiteSpace = 'nowrap';
                tdSize.textContent = item.size;
                tr.appendChild(tdSize);

                // 操作（复制）
                const tdOp = document.createElement('td');
                tdOp.style.whiteSpace = 'nowrap';
                const copyBtn = document.createElement('a');
                copyBtn.href = '#';
                copyBtn.className = 'nong-copy';
                copyBtn.textContent = '复制';
                copyBtn.addEventListener('click', e => {
                    e.preventDefault();
                    GM_setClipboard(item.maglink.substring(0, 60));
                    copyBtn.textContent = '✓';
                    setTimeout(() => { copyBtn.textContent = '复制'; }, 1000);
                });
                tdOp.appendChild(copyBtn);
                tr.appendChild(tdOp);

                // 115离线
                const tdOffline = document.createElement('td');
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
            // 重置表格到 loading 状态
            // 移除所有非表头、非notice行
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
            refreshBtn.style.display = 'none';
            refreshBtn.style.cssText = 'display:none;margin-left:8px;color:#e74c3c;font-weight:bold;cursor:pointer;';
            refreshBtn.onclick = e => { e.preventDefault(); runSearch(table, avid, engineKey); };
            loadTd.appendChild(loadText);
            loadTd.appendChild(refreshBtn);
            loadRow.appendChild(loadTd);
            table.appendChild(loadRow);

            // 15秒超时显示刷新按钮
            const timer = setTimeout(() => {
                loadText.textContent = '加载超时，';
                refreshBtn.style.display = 'inline';
            }, 15000);

            try {
                const allEngines = Engines.getAll();
                const fn = allEngines[engineKey] || Object.values(allEngines)[0];
                const { url, data } = await fn(avid);
                clearTimeout(timer);
                fillTable(table, data, url);
            } catch(e) {
                clearTimeout(timer);
                log('磁力搜索出错:', e);
                loadText.textContent = '搜索出错，';
                refreshBtn.style.display = 'inline';
            }
        }

        // 创建完整磁力模块（表格 + 标题容器）
        function createMagnetWidget(avid, previewBtn) {
            const wrapper = document.createElement('div');
            wrapper.className = 'jav-nong-wrapper';
            wrapper.style.cssText = `
                display: inline-block;
                padding: 12px 14px;
                background: #fafafa;
                border: 1px solid #ebebeb;
                border-radius: 6px;
            `;

            const header = document.createElement('div');
            header.style.cssText = 'margin-bottom:10px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;';

            const title = document.createElement('span');
            title.style.cssText = 'color:#0066cc;font-size:15px;font-weight:600;';
            title.textContent = '🔥 磁力搜索';
            header.appendChild(title);

            if (previewBtn) header.appendChild(previewBtn);

            wrapper.appendChild(header);

            const table = buildTable(avid);
            wrapper.appendChild(table);

            // 启动首次搜索
            const engineKey = CFG.defaultEngine;
            runSearch(table, avid, engineKey);

            return wrapper;
        }

        return { createMagnetWidget };
    })();

    // =========================================================================
    // [区块8] 站点适配层
    // =========================================================================

    // --- JavBus ---
    const SiteJavBus = {
        match() {
            return location.hostname.includes('javbus') && !!document.querySelector('.header');
        },
        getVid() {
            // 从关键字 meta 取第一个词即番号
            const kw = document.querySelector('meta[name="keywords"]')?.content || '';
            return normalizeAvid(kw.split(',')[0].trim());
        },
        initPage(avid) {
            // 去广告
            document.querySelector('.ad-box')?.remove();

            // 全局铺满
            GM_addStyle(`
                /* JavBus 全局铺满 */
                .container { max-width: 100% !important; width: 100% !important;
                    padding-left: 20px !important; padding-right: 20px !important; }
                /* 三列 flex 布局 */
                .row.movie { display: flex !important; gap: 20px !important;
                    align-items: flex-start !important; flex-wrap: nowrap !important; margin: 0 !important; }
                .col-md-9.screencap { flex: 1 1 0 !important; min-width: 0 !important;
                    width: auto !important; float: none !important; padding: 0 !important; }
                .col-md-3.info { flex: 1 1 0 !important; min-width: 0 !important;
                    width: auto !important; float: none !important;
                    overflow: hidden !important; word-break: break-word !important; }
                .col-md-3.info .genre { display: inline-block; max-width: 100%; white-space: normal; }
                /* 磁力列占位槽 */
                .jav-nong-slot { flex: 1 1 0 !important; min-width: 0 !important; align-self: flex-start !important; }
                .jav-nong-wrapper { max-width: 100%; }
                /* 封面图自适应 */
                .screencap img { width: 100%; max-width: 100%; }
                /* 页脚 */
                .footer { padding: 20px 0; }
            `);

            // 列表页：有 #waterfall 且有 .masonry
            if (document.querySelector('#waterfall div.item') && document.querySelector('.masonry')) {
                Waterfall.init({
                    nextSel: 'a#next',
                    itemSel: '#waterfall div.item',
                    contSel: '.masonry',
                    pagiSel: '.pagination-lg',
                });
                return; // 列表页不插磁力表格
            }

            // 详情页：插入磁力模块
            this._insertMagnet(avid);
        },
        _insertMagnet(avid) {
            const infoCol = document.querySelector("div[class='col-md-3 info']");
            if (!infoCol) return;

            // 清理旧槽（刷新场景）
            document.querySelectorAll('.jav-nong-slot').forEach(el => el.remove());

            const previewBtn = createPreviewBtn(avid);
            const widget = Magnet.createMagnetWidget(avid, previewBtn);

            const slot = document.createElement('div');
            slot.className = 'jav-nong-slot';
            slot.appendChild(widget);

            // .row.movie 已被 CSS 改为 flex，直接插在 infoCol 后面即可
            infoCol.after(slot);
        },
    };

    // --- JavDB ---
    const SiteJavDB = {
        match() {
            return location.hostname.includes('javdb');
        },
        getVid() {
            const el = document.querySelector('a.button.is-white.copy-to-clipboard');
            return normalizeAvid(el?.dataset?.clipboardText || '');
        },
        initPage(avid) {
            // 去广告/弹窗
            document.querySelector('.app-desktop-banner')?.remove();
            document.querySelector('.modal.is-active.over18-modal')?.remove();

            GM_addStyle(`
                /* JavDB 全局 */
                .container { max-width: 100% !important; }
                /* 详情页介绍列标签换行 */
                .movie-panel-info { overflow: hidden; word-break: break-word; }
                .movie-panel-info .panel-block { flex-wrap: wrap; }
                .movie-panel-info .value { overflow: hidden; word-break: break-word; }
            `);

            // 列表页：只做瀑布流
            if (!location.pathname.startsWith('/v/')) {
                const movieList = document.querySelector('.movie-list');
                if (movieList) {
                    Waterfall.init({
                        nextSel: '.pagination-next',
                        itemSel: '.movie-list .item',
                        contSel: '.movie-list',
                        pagiSel: '.pagination',
                    });
                }
                return;
            }

            // 详情页
            this._insertMagnet(avid);
        },
        _insertMagnet(avid) {
            // JavDB 详情页结构：左封面列 + 右面板（.column.column-video-cover / .column.video-meta-panel）
            const coverCol  = document.querySelector('.column.column-video-cover');
            const infoPanel = document.querySelector('.movie-panel-info');
            if (!coverCol || !infoPanel) return;

            document.querySelectorAll('.jav-nong-slot').forEach(el => el.remove());

            // 三列均分 flex
            const parent = coverCol.parentElement;
            let flexContainer = parent.querySelector('.jav-flex-container');
            if (!flexContainer) {
                flexContainer = document.createElement('div');
                flexContainer.className = 'jav-flex-container';
                flexContainer.style.cssText = 'display:flex;gap:20px;align-items:flex-start;width:100%;';

                coverCol.style.cssText  += ';flex:1 1 0;min-width:0;';
                infoPanel.style.cssText += ';flex:1 1 0;min-width:0;overflow:hidden;word-break:break-word;';

                flexContainer.appendChild(coverCol);
                flexContainer.appendChild(infoPanel);
                parent.appendChild(flexContainer);
            }

            // 磁力列：占位槽 + 内容 wrapper（inline-block 不被 flex 撑开）
            const slot = document.createElement('div');
            slot.className = 'jav-nong-slot';
            slot.style.cssText = 'flex:1 1 0;min-width:0;align-self:flex-start;';

            const previewBtn = createPreviewBtn(avid);
            const widget = Magnet.createMagnetWidget(avid, previewBtn);
            slot.appendChild(widget);
            flexContainer.appendChild(slot);

            // JavDB 列表页瀑布流（详情页不会进来，此段实际不执行）
            if (document.querySelector('.movie-list .item')) {
                Waterfall.init({
                    nextSel: '.pagination-next',
                    itemSel: '.movie-list .item',
                    contSel: '.movie-list',
                    pagiSel: '.pagination',
                });
            }
        },
    };

    // --- JavLib ---
    const SiteJavLib = {
        match() {
            return /(javlibrary|javlib|r86m|s87n)/i.test(location.hostname);
        },
        // 详情页判断：有 #video_id .text 且有 meta[name="keywords"]
        isDetailPage() {
            return !!document.querySelector('#video_id .text') &&
                   !!document.querySelector('meta[name="keywords"]');
        },
        getVid() {
            // 详情页：从 #video_id .text 取番号
            const el = document.querySelector('#video_id .text');
            if (el?.textContent?.trim()) return normalizeAvid(el.textContent.trim());
            // 降级：从 title 匹配
            const m = document.title.match(/([A-Z0-9]+-\d+)/i);
            return m ? m[1].toUpperCase() : '';
        },
        initPage(avid) {
            // 列表页：只做瀑布流
            if (!this.isDetailPage()) {
                if (document.querySelector('div.videos div.video')) {
                    GM_addStyle(`
                        .videothumblist .videos .video { height: 270px; padding: 0; margin: 4px; }
                        .videothumblist .videos .video .title { height: 2.8em; }
                        .id { height: 1.3em; overflow: hidden; }
                    `);
                    const cont = document.querySelector('div.videos');
                    if (cont) cont.id = 'jav-waterfall';
                    Waterfall.init({
                        nextSel: 'a[class="page next"]',
                        itemSel: 'div.videos div.video',
                        contSel: '#jav-waterfall',
                        pagiSel: '.page_selector',
                    });
                    // JavLib 列表页不插磁力表格
                }
                return;
            }

            // 详情页
            if (!avid) return;

            // 去除干扰
            document.querySelector('.socialmedia')?.remove();

            GM_addStyle(`
                /* 全局铺满，隐藏左侧导航菜单（详情页不需要） */
                #leftmenu { display: none; }
                #rightcolumn { margin: 0 !important; width: 100% !important; float: none !important; }
                #content { padding-top: 0; width: 100%; }
                /* 封面图自适应 */
                #video_jacket img { max-width: 100%; height: auto; }
                /* 介绍列标签换行 */
                #video_info { text-align: left; font: 14px Arial; overflow: hidden; word-break: break-word; }
                /* 磁力表格不超出列宽 */
                .jav-nong-slot .jav-nong-wrapper { max-width: 100%; }
            `);

            this._insertMagnet(avid);
        },
        _insertMagnet(avid) {
            // JavLib 结构：table#video_jacket_info > tr > td（封面）+ td（介绍）
            // 方案：把 table 的 tr 改为 flex 容器，三列均分，追加磁力列
            const table = document.getElementById('video_jacket_info');
            if (!table) return;
            const row = table.querySelector('tr');
            if (!row) return;

            document.querySelectorAll('.jav-nong-slot').forEach(el => el.remove());

            // table 本身撑满
            table.style.cssText = 'width:100%;display:block;';

            // tr 改为 flex 行
            row.style.cssText = 'display:flex;gap:20px;align-items:flex-start;width:100%;';

            // 封面 td 和介绍 td 均分
            const tds = row.querySelectorAll('td');
            if (tds[0]) tds[0].style.cssText = 'flex:1 1 0;min-width:0;vertical-align:top;';
            if (tds[1]) tds[1].style.cssText = 'flex:1 1 0;min-width:0;vertical-align:top;overflow:hidden;word-break:break-word;';

            // 封面图自适应列宽
            const jacketImg = document.getElementById('video_jacket_img');
            if (jacketImg) {
                jacketImg.removeAttribute('width');
                jacketImg.removeAttribute('height');
                jacketImg.style.cssText = 'width:100%;height:auto;max-width:100%;';
            }

            // 第三列：磁力表格（占位 td + inline-block wrapper，边框跟随内容宽度）
            const magnetTd = document.createElement('td');
            magnetTd.className = 'jav-nong-slot';
            magnetTd.style.cssText = 'flex:1 1 0;min-width:0;vertical-align:top;align-self:flex-start;';

            const innerWrap = document.createElement('div');
            innerWrap.style.cssText = 'display:inline-block;';

            const previewBtn = createPreviewBtn(avid);
            const widget = Magnet.createMagnetWidget(avid, previewBtn);
            innerWrap.appendChild(widget);
            magnetTd.appendChild(innerWrap);
            row.appendChild(magnetTd);
        },
    };

    // =========================================================================
    // [区块9] 主入口
    // =========================================================================

    const SITES = [SiteJavBus, SiteJavDB, SiteJavLib];

    function mainRun() {
        const site = SITES.find(s => s.match());
        if (!site) return;

        const avid = site.getVid();
        log('匹配站点:', site.constructor?.name || '未知', '| 番号:', avid);

        site.initPage(avid);
    }

    // JavDB 详情页有动态加载，稍作延迟
    if (location.hostname.includes('javdb') && location.pathname.startsWith('/v/')) {
        setTimeout(mainRun, 600);
    } else {
        mainRun();
    }

})();
