// ==UserScript==
// @name         JAV老司机-新
// @namespace    https://github.com/ZiPenOk
// @version      1.2.0
// @description  JavBus / JavDB / JavLib 磁力搜索 + 115离线 + 多源预览图(可调序) + Overlay灯箱
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
// @grant        GM_download
// @grant        GM_info
// @connect      *
// @license      GPL-3.0
// @downloadURL  https://github.com/ZiPenOk/scripts/raw/refs/heads/main/laosiji-new.js
// @updateURL    https://github.com/ZiPenOk/scripts/raw/refs/heads/main/laosiji-new.js
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

        // 默认磁力搜索引擎
        get defaultEngine()    { return GM_getValue('cfg_default_engine', 'javdb.com'); },

        // 预览图来源顺序（搬运自 jump.js）
        get thumbSourceOrder() { return GM_getValue('thumb_source_order', ['javfree', 'projectjav', 'javstore']); },

        set javbusUrl(v)        { GM_setValue('cfg_javbus_url', v); },
        set javdbUrl(v)         { GM_setValue('cfg_javdb_url', v); },
        set javlibUrl(v)        { GM_setValue('cfg_javlib_url', v); },
        set javdbSearchUrl(v)   { GM_setValue('cfg_javdb_search_url', v); },
        set btsowUrl(v)         { GM_setValue('cfg_btsow_url', v); },
        set btdigUrl(v)         { GM_setValue('cfg_btdig_url', v); },
        set sukebeiUrl(v)          { GM_setValue('cfg_sukebei_url', v); },
        set torrentkittyUrl(v)  { GM_setValue('cfg_torrentkitty_url', v); },
        set defaultEngine(v)    { GM_setValue('cfg_default_engine', v); },
        set thumbSourceOrder(v) { GM_setValue('thumb_source_order', v); },
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
        if (raw.match(/-[^0]/)) return raw;
        if (raw.match(/^[0-9_-]+$/)) return raw;
        const m = raw.match(/^([A-Z]+[-_]?)(\d+)$/);
        if (m) return m[1].replace(/[-_]$/, '') + '-' + m[2];
        return raw;
    }

    // =========================================================================
    // [区块3] 预览图获取模块（完整搬运自 jump.js）
    // =========================================================================

    const Utils = {
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

        showOverlay(imgUrl, code, source = null) {
            const originalHtmlOverflow = document.documentElement.style.overflow;
            const originalBodyOverflow = document.body.style.overflow;
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';

            const container = document.createElement('div');
            container.className = 'preview-overlay';
            container.style.cssText = `
                position: fixed; inset: 0; background: rgba(0,0,0,0.85);
                z-index: 2147483647; display: flex; overflow: auto;
                cursor: zoom-out; backdrop-filter: blur(5px);
            `;

            const img = document.createElement('img');
            img.className = 'preview-img';
            img.style.cssText = `
                border-radius: 4px; margin: auto; cursor: zoom-in;
                max-width: 95vw; max-height: 95vh; object-fit: contain;
                display: block; box-shadow: 0 0 20px rgba(0,0,0,0.5);
            `;
            img.onclick = (e) => {
                e.stopPropagation();
                img.classList.toggle('zoomed');
                if (img.classList.contains('zoomed')) {
                    img.style.maxWidth = 'none';
                    img.style.maxHeight = 'none';
                    img.style.cursor = 'zoom-out';
                } else {
                    img.style.maxWidth = '95vw';
                    img.style.maxHeight = '95vh';
                    img.style.cursor = 'zoom-in';
                }
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
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
                position: fixed; top: 20px; right: 20px; display: flex; gap: 8px;
                z-index: 2147483648; background: rgba(30,30,30,0.75);
                backdrop-filter: blur(10px); padding: 6px 12px;
                border-radius: 30px; border: 1px solid rgba(255,255,255,0.08);
                box-shadow: 0 6px 18px rgba(0,0,0,0.25);
            `;

            const createButton = (text, emoji, className, onClick) => {
                const btn = document.createElement('button');
                btn.className = `preview-btn ${className}`;
                btn.innerHTML = `${emoji} ${text}`;
                btn.style.cssText = `
                    border: none; color: #eee; font-size: 13px; cursor: pointer;
                    padding: 6px 14px; border-radius: 24px; transition: all 0.2s;
                    background: rgba(100,100,120,0.3);
                    border: 1px solid rgba(255,255,255,0.05);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                `;
                btn.onclick = onClick;
                return btn;
            };

            const setActiveSource = (activeSource) => {
                javfreeBtn.classList.toggle('active', activeSource === 'javfree');
                projectjavBtn.classList.toggle('active', activeSource === 'projectjav');
                javstoreBtn.classList.toggle('active', activeSource === 'javstore');
                if (activeSource === 'javfree') javfreeBtn.style.background = '#2ecc71';
                else javfreeBtn.style.background = '';
                if (activeSource === 'projectjav') projectjavBtn.style.background = '#e74c3c';
                else projectjavBtn.style.background = '';
                if (activeSource === 'javstore') javstoreBtn.style.background = '#e74c3c';
                else javstoreBtn.style.background = '';
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

            if (source === 'javfree') javfreeBtn.style.background = '#2ecc71';
            else if (source === 'projectjav') projectjavBtn.style.background = '#e74c3c';
            else if (source === 'javstore') javstoreBtn.style.background = '#e74c3c';

            toolbar.appendChild(javfreeBtn);
            toolbar.appendChild(projectjavBtn);
            toolbar.appendChild(javstoreBtn);
            toolbar.appendChild(newWindowBtn);
            toolbar.appendChild(downloadBtn);

            container.appendChild(img);
            document.body.appendChild(container);
            document.body.appendChild(toolbar);

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
        }
    };

    const Thumbnail = {
        async javfree(code) {
            try {
                const html = await Utils.request(`https://javfree.me/search/${code}`);
                const doc = parseHTML(html);
                const link = doc.querySelector('.entry-title>a')?.href;
                if (!link) return null;
                const dHtml = await Utils.request(link);
                const dDoc = parseHTML(dHtml);
                const url = dDoc.querySelectorAll('p>img')[1]?.src || dDoc.querySelectorAll('p>img')[0]?.src;
                return url || null;
            } catch { return null; }
        },

        async javstore(code) {
            try {
                const normalizedCode = code.replace(/^fc2-?/i, '').replace(/-/g, '').toLowerCase();
                const searchUrl = `https://javstore.net/search?q=${encodeURIComponent(code)}`;
                const searchHtml = await Utils.request(searchUrl);
                const searchDoc = parseHTML(searchHtml);
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
                    }
                }
                if (detailUrls.length === 0) return null;
                for (const detailUrl of detailUrls) {
                    const imgUrl = await this._extractImgFromDetail(detailUrl);
                    if (imgUrl) return imgUrl;
                }
                return null;
            } catch { return null; }
        },

        async _extractImgFromDetail(detailUrl) {
            try {
                const detailHtml = await Utils.request(detailUrl);
                const detailDoc = parseHTML(detailHtml);
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
            } catch { return null; }
        },

        async projectjav(code) {
            try {
                const request = (url) => new Promise((resolve, reject) => {
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url,
                        timeout: 20000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
                        },
                        onload: r => {
                            if (r.status >= 200 && r.status < 400) resolve(r.responseText);
                            else reject(new Error(`HTTP ${r.status}`));
                        },
                        onerror: e => reject(e),
                        ontimeout: () => reject(new Error('请求超时'))
                    });
                });
                const searchUrl = `https://projectjav.com/?searchTerm=${encodeURIComponent(code)}`;
                const searchHtml = await request(searchUrl);
                const searchDoc = parseHTML(searchHtml);
                const allMovieLinks = [...searchDoc.querySelectorAll('a[href*="/movie/"]')];
                if (allMovieLinks.length === 0) return null;
                let detailPath = allMovieLinks.find(a => /\/movie\/.+-\d+$/.test(a.getAttribute('href') || ''))?.getAttribute('href')
                    || allMovieLinks[0].getAttribute('href');
                const detailUrl = detailPath.startsWith('http') ? detailPath : `https://projectjav.com${detailPath}`;
                const detailHtml = await request(detailUrl);
                const detailDoc = parseHTML(detailHtml);
                const screenshotLink = detailDoc.querySelector('.thumbnail a[data-featherlight="image"]');
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
                if (coverImg) {
                    const src = coverImg.getAttribute('src') || '';
                    if (src) return src.replace(/^http:/, 'https:');
                }
                return null;
            } catch { return null; }
        },

        async get(code) {
            const order = CFG.thumbSourceOrder;
            let url = null, source = null;
            for (const src of order) {
                if (typeof this[src] !== 'function') continue;
                try { url = await this[src](code); } catch (e) { url = null; }
                if (url) { source = src; break; }
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

    // 创建预览图按钮（替换原实现，直接使用 Thumbnail.show）
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
        btn.addEventListener('click', async () => {
            btn.textContent = '⏳';
            btn.disabled = true;
            await Thumbnail.show(avid);
            btn.textContent = '🖼 预览图';
            btn.disabled = false;
        });
        return btn;
    }

    // =========================================================================
    // [区块4] 设置面板 UI（已修复预览图顺序区域的空白问题）
    // =========================================================================

    const SettingsPanel = (() => {
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
                    width: 520px; max-height: 90vh; overflow-y: auto;
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

                /* 预览图来源顺序专用样式 */
                .sp-preview-order-block {
                    margin-top: 4px;
                }
                .sp-preview-order-label {
                    font-size: 14px; font-weight: 500; color: #555;
                    margin-bottom: 2px;
                }
                .sp-preview-order-hint {
                    font-size: 12px; color: #9ca3af;
                    margin-bottom: 8px;
                }
                /* 拖拽列表 */
                .jjs-order-list { display: flex; flex-direction: column; gap: 6px; }
                .jjs-order-item {
                    display: flex; align-items: center; gap: 8px;
                    padding: 8px 10px; border-radius: 8px;
                    border: 1px solid #e5e7eb; background: #fff;
                    cursor: grab; user-select: none;
                }
                .jjs-order-item:active { cursor: grabbing; }
                .jjs-order-item.drag-over { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.15); }
                .jjs-order-handle { font-size: 18px; color: #c4c9d4; cursor: grab; padding: 0 2px; line-height: 1; }
                .jjs-order-num {
                    width: 20px; height: 20px; border-radius: 50%;
                    background: #6366f1; color: #fff;
                    font-size: 11px; font-weight: 700;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                }
                .jjs-order-emoji { font-size: 16px; flex-shrink: 0; }
                .jjs-order-info { flex: 1; }
                .jjs-order-name { font-size: 13px; font-weight: 600; color: #374151; }
                .jjs-order-desc { font-size: 11px; color: #9ca3af; margin-top: 1px; }
                .jjs-order-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
            `);

            const overlay = document.createElement('div');
            overlay.id = 'jav-settings-overlay';

            const panel = document.createElement('div');
            panel.id = 'jav-settings-panel';

            panel.innerHTML = `
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
                        <select class="sp-select" id="sp-default-engine">
                            ${(() => {
                                const engineNames = {
                                    [CFG.javdbSearchUrl]: 'JavDB',
                                    [CFG.btsowUrl]: 'BtSow',
                                    [CFG.btdigUrl]: 'BtDig',
                                    [CFG.sukebeiUrl]: 'sukebei',
                                    [CFG.torrentkittyUrl]: 'TorrentKitty',
                                };
                                return Object.entries(engineNames)
                                    .map(([val, name]) => `<option value="${val}" ${CFG.defaultEngine === val ? 'selected' : ''}>${name} (${val})</option>`)
                                    .join('');
                            })()}
                        </select>
                    </div>
                    <!-- 预览图来源顺序（修复空白） -->
                    <div class="sp-preview-order-block">
                        <div class="sp-preview-order-label">预览图来源顺序</div>
                        <div class="sp-preview-order-hint">拖拽 ⠿ 手柄调整顺序，依次尝试获取</div>
                        <div id="jjs-order-list" class="jjs-order-list"></div>
                    </div>
                </div>
                <div class="sp-footer">
                    <span class="sp-saved-tip" id="sp-saved-tip">✓ 已保存，刷新页面生效</span>
                    <button class="sp-btn sp-btn-cancel">取消</button>
                    <button class="sp-btn sp-btn-save">保存</button>
                </div>
            `;

            document.body.appendChild(overlay);
            overlay.appendChild(panel);

            // 渲染来源顺序列表
            const SOURCE_META = {
                javfree:    { label: 'javfree.me',     color: '#2ecc71', emoji: '🟢', desc: '二次爬取，速度较快' },
                projectjav: { label: 'projectjav.com', color: '#f1c40f', emoji: '🟡', desc: '高清截图，两步请求' },
                javstore:   { label: 'javstore.net',   color: '#e74c3c', emoji: '🔴', desc: '兜底来源，成功率参差' },
            };

            let currentOrder = [...CFG.thumbSourceOrder];
            const orderList = document.getElementById('jjs-order-list');

            function buildOrderItems() {
                orderList.innerHTML = '';
                currentOrder.forEach((src, idx) => {
                    const meta = SOURCE_META[src] || { label: src, color: '#999', emoji: '⚪', desc: '' };
                    const item = document.createElement('div');
                    item.className = 'jjs-order-item';
                    item.dataset.src = src;
                    item.innerHTML = `
                        <span class="jjs-order-handle">⠿</span>
                        <span class="jjs-order-num">${idx + 1}</span>
                        <span class="jjs-order-emoji">${meta.emoji}</span>
                        <div class="jjs-order-info">
                            <div class="jjs-order-name">${meta.label}</div>
                            <div class="jjs-order-desc">${meta.desc}</div>
                        </div>
                        <span class="jjs-order-dot" style="background:${meta.color};"></span>
                    `;
                    orderList.appendChild(item);
                });
            }

            function refreshNums() {
                orderList.querySelectorAll('.jjs-order-item').forEach((el, i) => {
                    el.querySelector('.jjs-order-num').textContent = i + 1;
                });
            }

            function syncOrderFromDOM() {
                currentOrder = [...orderList.querySelectorAll('.jjs-order-item')].map(el => el.dataset.src);
            }

            buildOrderItems();

            // --- 拖拽排序逻辑 ---
            let dragging = null, ghost = null, offsetX = 0, offsetY = 0;

            orderList.addEventListener('mousedown', e => {
                const handle = e.target.closest('.jjs-order-handle');
                if (!handle) return;
                e.preventDefault();
                dragging = handle.closest('.jjs-order-item');
                if (!dragging) return;
                const rect = dragging.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;
                ghost = dragging.cloneNode(true);
                ghost.style.cssText = `
                    position: fixed; z-index: 10000099;
                    width: ${rect.width}px; left: ${rect.left}px; top: ${rect.top}px;
                    opacity: 0.85; box-shadow: 0 8px 24px rgba(0,0,0,0.18);
                    border-color: #6366f1; background: #fff; pointer-events: none;
                    border-radius: 8px; border: 1px solid #6366f1;
                `;
                document.body.appendChild(ghost);
                dragging.style.opacity = '0.3';
            });

            document.addEventListener('mousemove', e => {
                if (!ghost || !dragging) return;
                ghost.style.left = (e.clientX - offsetX) + 'px';
                ghost.style.top  = (e.clientY - offsetY) + 'px';
                orderList.querySelectorAll('.jjs-order-item').forEach(el => el.classList.remove('drag-over'));
                ghost.style.display = 'none';
                const elBelow = document.elementFromPoint(e.clientX, e.clientY);
                ghost.style.display = '';
                const target = elBelow?.closest('.jjs-order-item');
                if (target && target !== dragging) {
                    target.classList.add('drag-over');
                }
            });

            document.addEventListener('mouseup', e => {
                if (!dragging || !ghost) return;
                ghost.style.display = 'none';
                const elBelow = document.elementFromPoint(e.clientX, e.clientY);
                ghost.style.display = '';
                const target = elBelow?.closest('.jjs-order-item');
                if (target && target !== dragging && orderList.contains(target)) {
                    const items = [...orderList.querySelectorAll('.jjs-order-item')];
                    const fromIdx = items.indexOf(dragging);
                    const toIdx   = items.indexOf(target);
                    if (fromIdx < toIdx) {
                        orderList.insertBefore(dragging, target.nextSibling);
                    } else {
                        orderList.insertBefore(dragging, target);
                    }
                    refreshNums();
                    syncOrderFromDOM();
                }
                dragging.style.opacity = '';
                ghost.remove();
                orderList.querySelectorAll('.jjs-order-item').forEach(el => el.classList.remove('drag-over'));
                dragging = null;
                ghost = null;
            });

            // 关闭逻辑
            const closePanel = () => { overlay.style.display = 'none'; };
            panel.querySelector('.sp-close').addEventListener('click', closePanel);
            panel.querySelector('.sp-btn-cancel').addEventListener('click', closePanel);
            overlay.addEventListener('click', e => { if (e.target === overlay) closePanel(); });

            // 保存逻辑
            panel.querySelector('.sp-btn-save').addEventListener('click', () => {
                CFG.javbusUrl       = panel.querySelector('#sp-javbus-url').value.trim().replace(/^https?:\/\//, '');
                CFG.javdbUrl        = panel.querySelector('#sp-javdb-url').value.trim().replace(/^https?:\/\//, '');
                CFG.javlibUrl       = panel.querySelector('#sp-javlib-url').value.trim().replace(/^https?:\/\//, '');
                CFG.javdbSearchUrl  = panel.querySelector('#sp-javdb-search').value.trim().replace(/^https?:\/\//, '');
                CFG.btsowUrl        = panel.querySelector('#sp-btsow').value.trim().replace(/^https?:\/\//, '');
                CFG.btdigUrl        = panel.querySelector('#sp-btdig').value.trim().replace(/^https?:\/\//, '');
                CFG.sukebeiUrl         = panel.querySelector('#sp-sukebei').value.trim().replace(/^https?:\/\//, '');
                CFG.torrentkittyUrl = panel.querySelector('#sp-torrentkitty').value.trim().replace(/^https?:\/\//, '');
                CFG.defaultEngine    = panel.querySelector('#sp-default-engine').value;
                CFG.thumbSourceOrder = currentOrder; // 顺序已通过 DOM 同步

                const tip = panel.querySelector('#sp-saved-tip');
                tip.classList.add('show');
                setTimeout(() => tip.classList.remove('show'), 2500);
            });

            // 点击 overlay 空白关闭
            overlay.addEventListener('click', e => {
                if (e.target === overlay) closePanel();
            });
        }

        return { open };
    })();

    GM_registerMenuCommand('⚙️ 老司机设置', () => SettingsPanel.open());

    // =========================================================================
    // [区块5] 磁力核心（挊）
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

            // 用 contains 模糊匹配，取父元素的 href 属性（getAttribute 拿原始相对路径，避免 DOMParser 不补全绝对 URL）
            const kwUpper = kw.toUpperCase().replace('+', '-');
            const titleEl = [...doc.querySelectorAll('.box .video-title')]
                .find(el => el.textContent.trim().toUpperCase().replace('+', '-').includes(kwUpper));
            if (!titleEl) return { url: finalUrl, data: [] };

            // parentElement 是 <a>，用 getAttribute('href') 拿原始路径再手动补全
            const rawHref = titleEl.parentElement?.getAttribute('href') || '';
            const detailUrl = rawHref.startsWith('http') ? rawHref : base + rawHref;

            const r2 = await gmFetch(detailUrl);
            if (!r2.loadstuts) return { url: finalUrl, data: [] };
            const doc2 = parseHTML(r2.responseText);
            const items = doc2.querySelectorAll('#magnets-content .item');
            const data = [...items].map(el => {
                // magnet-name a 的 href 也是相对路径，需手动补全
                const rawMag = el.querySelector('.magnet-name a:nth-child(1)')?.getAttribute('href') || '';
                const maglink = rawMag.startsWith('magnet:') ? rawMag
                              : rawMag.startsWith('http')    ? rawMag
                              : base + rawMag;
                return {
                    title:   el.querySelector('.magnet-name span:nth-child(1)')?.textContent?.trim() || '',
                    maglink,
                    size:    el.querySelector('.magnet-name .meta')?.textContent?.trim() || '',
                    src:     r2.finalUrl || detailUrl,
                };
            });
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
            #jav-nong-refresh {
                display: none; margin-left: 8px;
                color: #e74c3c; font-weight: bold; cursor: pointer;
            }
        `);

        function buildTable(avid) {
            const table = document.createElement('table');
            table.id = 'jav-nong-table';

            const headRow = document.createElement('tr');
            headRow.className = 'nong-head-row';

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
            sel.addEventListener('change', () => {
                runSearch(table, avid, sel.value);
            });
            thEngine.appendChild(sel);
            headRow.appendChild(thEngine);

            ['大小', '操作', '115离线'].forEach(txt => {
                const th = document.createElement('th');
                th.textContent = txt;
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
                copyBtn.href = magShort;      // hover 状态栏显示磁力
                copyBtn.title = magShort;     // tooltip 显示磁力
                copyBtn.className = 'nong-copy';
                copyBtn.textContent = '复制';
                copyBtn.addEventListener('click', e => {
                    e.preventDefault();
                    GM_setClipboard(magWithDn);   // 复制带 &dn= 的完整磁力
                    copyBtn.textContent = '✓';
                    setTimeout(() => { copyBtn.textContent = '复制'; }, 1000);
                });
                tdOp.appendChild(copyBtn);
                tr.appendChild(tdOp);

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

            const engineKey = CFG.defaultEngine;
            runSearch(table, avid, engineKey);

            return wrapper;
        }

        return { createMagnetWidget };
    })();

    // =========================================================================
    // [区块6] 站点适配层（瀑布流已全部移除）
    // =========================================================================

    // --- JavBus ---
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

            GM_addStyle(`
                .container { max-width: 100% !important; width: 100% !important;
                    padding-left: 20px !important; padding-right: 20px !important; }
                .row.movie { display: flex !important; gap: 20px !important;
                    align-items: flex-start !important; flex-wrap: nowrap !important; margin: 0 !important; }
                .col-md-9.screencap { flex: 1 1 0 !important; min-width: 0 !important;
                    width: auto !important; float: none !important; padding: 0 !important; }
                .col-md-3.info { flex: 1 1 0 !important; min-width: 0 !important;
                    width: auto !important; float: none !important;
                    overflow: hidden !important; word-break: break-word !important; }
                .jav-nong-slot { flex: 1 1 0 !important; min-width: 0 !important; align-self: flex-start !important; }
                .jav-nong-wrapper { max-width: 100%; }
                .screencap img { width: 100%; max-width: 100%; }
                .footer { padding: 20px 0; }
            `);

            if (document.querySelector('#waterfall div.item') && document.querySelector('.masonry')) return;

            this._insertMagnet(avid);
        },
        _insertMagnet(avid) {
            const infoCol = document.querySelector("div[class='col-md-3 info']");
            if (!infoCol) return;
            document.querySelectorAll('.jav-nong-slot').forEach(el => el.remove());
            const previewBtn = createPreviewBtn(avid);
            const widget = Magnet.createMagnetWidget(avid, previewBtn);
            const slot = document.createElement('div');
            slot.className = 'jav-nong-slot';
            slot.appendChild(widget);
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
            document.querySelector('.app-desktop-banner')?.remove();
            document.querySelector('.modal.is-active.over18-modal')?.remove();

            GM_addStyle(`
                .container { max-width: 100% !important; }
                .movie-panel-info { overflow: hidden; word-break: break-word; }
                .movie-panel-info .panel-block { flex-wrap: wrap; }
                .movie-panel-info .value { overflow: hidden; word-break: break-word; }
            `);

            if (!location.pathname.startsWith('/v/')) return;
            this._insertMagnet(avid);
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
                flexContainer.style.cssText = 'display:flex;gap:20px;align-items:flex-start;width:100%;';
                coverCol.style.cssText  += ';flex:1 1 0;min-width:0;';
                infoPanel.style.cssText += ';flex:1 1 0;min-width:0;overflow:hidden;word-break:break-word;';
                flexContainer.appendChild(coverCol);
                flexContainer.appendChild(infoPanel);
                parent.appendChild(flexContainer);
            }

            const slot = document.createElement('div');
            slot.className = 'jav-nong-slot';
            slot.style.cssText = 'flex:1 1 0;min-width:0;align-self:flex-start;';
            const previewBtn = createPreviewBtn(avid);
            const widget = Magnet.createMagnetWidget(avid, previewBtn);
            slot.appendChild(widget);
            flexContainer.appendChild(slot);
        },
    };

    // --- JavLib ---
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

            GM_addStyle(`
                #leftmenu { display: none; }
                #rightcolumn { margin: 0 !important; width: 100% !important; float: none !important; }
                #content { padding-top: 0; width: 100%; }
                #video_jacket img { max-width: 100%; height: auto; }
                #video_info { text-align: left; font: 14px Arial; overflow: hidden; word-break: break-word; }
                .jav-nong-slot .jav-nong-wrapper { max-width: 100%; }
            `);

            this._insertMagnet(avid);
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
            if (tds[0]) tds[0].style.cssText = 'flex:1 1 0;min-width:0;vertical-align:top;';
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

            const previewBtn = createPreviewBtn(avid);
            const widget = Magnet.createMagnetWidget(avid, previewBtn);
            innerWrap.appendChild(widget);
            magnetTd.appendChild(innerWrap);
            row.appendChild(magnetTd);
        },
    };

    // =========================================================================
    // [区块7] 主入口
    // =========================================================================

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