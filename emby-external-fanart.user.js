// ==UserScript==
// @name         Emby External Fanart
// @namespace    emby-external-fanart
// @version      3.1.0
// @description  在 Emby 详情页从 JavBus / JavDB / DMM 抓取外部剧照并替换原有embycss剧照区块，保留预告片卡片
// @author       ZiPenOk
// @match        *://*/web/index.html*
// @match        *://*/web/
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      www.javbus.com
// @connect      javdb.com
// @connect      www.dmm.co.jp
// @connect      pics.dmm.co.jp
// @connect      c0.jdbstatic.com
// @run-at       document-end
// @icon         https://img.icons8.com/fluency/96/emby.png
// @updateURL    https://github.com/ZiPenOk/scripts/raw/refs/heads/main/emby-external-fanart.user.js
// @downloadURL  https://github.com/ZiPenOk/scripts/raw/refs/heads/main/emby-external-fanart.user.js
// ==/UserScript==

(function () {
    'use strict';

    // ===== 站点元信息 =====
    const SITE_META = {
        javbus: { name: 'JavBus', note: '需要先在浏览器登录 JavBus', noteWarn: true },
        javdb:  { name: 'JavDB',  note: '无需登录', noteWarn: false },
        dmm:    { name: 'DMM / FANZA', note: '无需登录', noteWarn: false },
    };

    // ===== 设置读写 =====
    const SETTINGS_KEY = 'ef_settings';

    function loadSettings() {
        try {
            const raw = GM_getValue(SETTINGS_KEY, null);
            if (raw) return raw;
        } catch (e) {}
        return {
            siteOrder:    ['javbus', 'javdb', 'dmm'],
            siteEnabled:  { javbus: true, javdb: true, dmm: true },
        };
    }

    function saveSettings(settings) {
        try { GM_setValue(SETTINGS_KEY, settings); } catch (e) {}
    }

    // 当前运行时配置（从存储加载）
    let SETTINGS = loadSettings();

    function getActiveSites() {
        return SETTINGS.siteOrder.filter(s => SETTINGS.siteEnabled[s]);
    }

    // ===== 日志 =====
    const log  = (...a) => console.log('[ExternalFanart]', ...a);
    const warn = (...a) => console.warn('[ExternalFanart]', ...a);

    // ===== 图片缓存 =====
    const memCache = new Map();
    const CACHE_EXPIRY = 60 * 60 * 1000;

    function getCached(code) {
        const hit = memCache.get(code);
        if (hit && Date.now() - hit.ts < CACHE_EXPIRY) return hit;
        try {
            const stored = GM_getValue(`ef_${code}`, null);
            if (stored && Date.now() - stored.ts < CACHE_EXPIRY) {
                memCache.set(code, stored);
                return stored;
            }
        } catch (e) {}
        return null;
    }

    function setCache(code, images, source) {
        const entry = { images, source, ts: Date.now() };
        memCache.set(code, entry);
        try { GM_setValue(`ef_${code}`, entry); } catch (e) {}
    }

    // ===== GM fetch 封装 =====
    function gmFetch(url, extraHeaders = {}) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET', url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,*/*;q=0.9',
                    'Accept-Language': 'ja,zh-CN;q=0.9,en;q=0.8',
                    ...extraHeaders,
                },
                responseType: 'document', timeout: 20000,
                onload:    (res) => res.status >= 200 && res.status < 400 ? resolve(res.response) : reject(new Error(`HTTP ${res.status}`)),
                onerror:   () => reject(new Error(`网络错误: ${url}`)),
                ontimeout: () => reject(new Error(`请求超时: ${url}`)),
            });
        });
    }

    // JavBus 专用：携带浏览器 Cookie
    function gmFetchWithCookie(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET', url,
                anonymous: false,
                headers: {
                    'User-Agent': navigator.userAgent,
                    'Accept': 'text/html,application/xhtml+xml,*/*;q=0.9',
                    'Accept-Language': 'ja,zh-CN;q=0.9,en;q=0.8',
                    'Referer': 'https://www.javbus.com/',
                },
                responseType: 'document', timeout: 20000,
                onload:    (res) => res.status >= 200 && res.status < 400 ? resolve(res.response) : reject(new Error(`HTTP ${res.status}`)),
                onerror:   () => reject(new Error(`网络错误: ${url}`)),
                ontimeout: () => reject(new Error(`请求超时: ${url}`)),
            });
        });
    }

    // ===== 番号提取 =====
    function extractCode(text) {
        if (!text) return null;
        const m = text.match(/\b([A-Za-z]{2,10}(?:-[A-Za-z]+)?)-(\d{2,7})\b/);
        if (m) return `${m[1].toUpperCase()}-${m[2]}`;
        return null;
    }

    async function getCode(itemId) {
        if (typeof ApiClient !== 'undefined') {
            try {
                const item = await ApiClient.getItem(ApiClient.getCurrentUserId(), itemId);
                if (item.OriginalTitle) { const c = extractCode(item.OriginalTitle); if (c) { log('番号来源: OriginalTitle →', c); return c; } }
                if (item.ProviderIds)   { for (const v of Object.values(item.ProviderIds)) { const c = extractCode(String(v)); if (c) { log('番号来源: ProviderIds →', c); return c; } } }
                if (item.Name)          { const c = extractCode(item.Name); if (c) { log('番号来源: Name →', c); return c; } }
            } catch (e) { warn('Emby API 失败，回退到DOM:', e.message); }
        }
        const selectors = ['.detailPagePrimaryContainer h1','#itemDetailPage:not(.hide) .nameContainer .itemName','.itemView:not(.hide) .nameContainer .itemName','.nameContainer .itemName','h1','.itemName'];
        for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (!el) continue;
            const c = extractCode(el.textContent.trim());
            if (c) { log('番号来源: DOM →', c); return c; }
        }
        return null;
    }

    // ===== 各站点抓取 =====
    async function fetchJavBus(code) {
        const url = `https://www.javbus.com/${code}`;
        log(`[JavBus] 请求: ${url}`);
        const doc = await gmFetchWithCookie(url);
        if (!doc) return [];
        const imgs = [];
        doc.querySelectorAll('#sample-waterfall a.sample-box').forEach(a => {
            const href = a.getAttribute('href') || '';
            if (href.startsWith('http')) imgs.push(href);
        });
        log(`[JavBus] 找到 ${imgs.length} 张`);
        return imgs;
    }

    async function fetchJavDB(code) {
        const searchUrl = `https://javdb.com/search?q=${encodeURIComponent(code)}&f=all`;
        log(`[JavDB] 搜索: ${searchUrl}`);
        const searchDoc = await gmFetch(searchUrl);
        if (!searchDoc) return [];
        const first = searchDoc.querySelector('.movie-list .item a');
        if (!first) { log('[JavDB] 无结果'); return []; }
        const href = first.getAttribute('href') || '';
        const detailUrl = href.startsWith('http') ? href : `https://javdb.com${href}`;
        log(`[JavDB] 详情页: ${detailUrl}`);
        const detailDoc = await gmFetch(detailUrl, { Referer: searchUrl });
        if (!detailDoc) return [];
        const imgs = [];
        detailDoc.querySelectorAll('.tile-images.preview-images a.tile-item').forEach(a => {
            const h = a.getAttribute('href') || '';
            if (h.startsWith('http')) imgs.push(h);
        });
        log(`[JavDB] 找到 ${imgs.length} 张`);
        return imgs;
    }

    async function fetchDMM(code) {
        const m = code.match(/^([A-Za-z]+)-(\d+)$/);
        if (!m) { warn(`[DMM] 无法转换番号: ${code}`); return []; }
        const cid = m[1].toLowerCase() + m[2].padStart(5, '0');
        const url = `https://www.dmm.co.jp/digital/videoa/-/detail/=/cid=${cid}/`;
        log(`[DMM] 请求: ${url}`);
        let doc;
        try { doc = await gmFetch(url, { Cookie: 'age_check_done=1; ckcy=1', 'Accept-Language': 'ja' }); }
        catch (e) { warn(`[DMM] 失败: ${e.message}`); return []; }
        if (!doc) return [];
        const imgs = [];
        doc.querySelectorAll('#sample-image-block img').forEach(img => {
            const src = img.getAttribute('data-lazy') || '';
            if (src.startsWith('http') && !src.endsWith('ps.jpg')) imgs.push(src);
        });
        log(`[DMM] 找到 ${imgs.length} 张`);
        return imgs;
    }

    const FETCHERS = { javbus: fetchJavBus, javdb: fetchJavDB, dmm: fetchDMM };

    async function fetchFanartImages(code) {
        const cached = getCached(code);
        if (cached) { log(`[Cache] 命中: ${code}`); return cached; }
        for (const site of getActiveSites()) {
            try {
                const imgs = await FETCHERS[site](code);
                if (imgs && imgs.length > 0) {
                    setCache(code, imgs, site);
                    return { images: imgs, source: site };
                }
                warn(`[${site}] 未找到，尝试下一站点`);
            } catch (e) { warn(`[${site}] 出错: ${e.message}`); }
        }
        return { images: [], source: null };
    }

    // ===== 注入样式 =====
    function injectStyles() {
        if (document.getElementById('ef-styles')) return;
        const s = document.createElement('style');
        s.id = 'ef-styles';
        s.textContent = `
        #jv-image-container .jv-images-grid{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start}
        .ef-img-wrapper{position:relative;cursor:pointer;overflow:hidden;border-radius:4px;height:160px;flex:0 0 auto;background:rgba(255,255,255,0.05)}
        .ef-img-wrapper img{height:100%;width:auto;max-width:300px;object-fit:cover;display:block;transition:transform 0.2s ease,opacity 0.3s ease;opacity:0}
        .ef-img-wrapper img.ef-loaded{opacity:1}
        .ef-img-wrapper:hover img{transform:scale(1.05)}
        .ef-source-badge{position:absolute;top:4px;left:4px;background:rgba(0,0,0,0.65);color:#fff;font-size:10px;padding:2px 6px;border-radius:3px;pointer-events:none;text-transform:uppercase;letter-spacing:0.5px;z-index:1}
        #ef-zoom-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.93);z-index:99999;display:flex;align-items:center;justify-content:center}
        #ef-zoom-overlay img{max-width:92vw;max-height:92vh;object-fit:contain;border-radius:4px;transition:opacity 0.2s ease}
        .ef-nav-btn{position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.12);border:none;color:#fff;font-size:2.2rem;width:52px;height:52px;cursor:pointer;border-radius:6px;display:flex;align-items:center;justify-content:center;transition:background 0.15s;z-index:1}
        .ef-nav-btn:hover{background:rgba(255,255,255,0.25)}
        .ef-nav-left{left:16px}.ef-nav-right{right:16px}
        .ef-zoom-close{position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.12);border:none;color:#fff;font-size:1.2rem;width:38px;height:38px;cursor:pointer;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:background 0.15s}
        .ef-zoom-close:hover{background:rgba(255,255,255,0.3)}
        .ef-zoom-counter{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,0.6);font-size:13px;pointer-events:none}
        .ef-status{display:flex;align-items:center;gap:10px;padding:14px 0;color:rgba(255,255,255,0.5);font-size:13px}
        .ef-status.ef-error{color:rgba(255,100,100,0.75)}
        .ef-spinner{flex-shrink:0;width:16px;height:16px;border:2px solid rgba(255,255,255,0.2);border-top-color:rgba(255,255,255,0.7);border-radius:50%;animation:ef-spin 0.7s linear infinite}
        @keyframes ef-spin{to{transform:rotate(360deg)}}

        /* ===== 设置面板 ===== */
        #ef-settings-mask{position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:999998;display:flex;align-items:center;justify-content:center}
        #ef-settings-panel{background:#1e1e1e;border:1px solid rgba(255,255,255,0.12);border-radius:12px;width:420px;max-width:92vw;overflow:hidden;font-family:system-ui,sans-serif;color:#e8e8e8}
        .ef-panel-header{padding:18px 20px 14px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between}
        .ef-panel-title{font-size:15px;font-weight:500;color:#fff}
        .ef-panel-subtitle{font-size:12px;color:rgba(255,255,255,0.4);margin-top:2px}
        .ef-panel-close{background:none;border:none;color:rgba(255,255,255,0.4);font-size:18px;cursor:pointer;padding:0;line-height:1;transition:color 0.15s}
        .ef-panel-close:hover{color:#fff}
        .ef-panel-body{padding:18px 20px}
        .ef-section-label{font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:10px;letter-spacing:0.5px;text-transform:uppercase}
        .ef-site-list{display:flex;flex-direction:column;gap:7px}
        .ef-site-item{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px 12px;display:flex;align-items:center;gap:10px;cursor:grab;user-select:none;transition:border-color 0.15s,background 0.15s}
        .ef-site-item:active{cursor:grabbing}
        .ef-site-item.ef-dragging{opacity:0.35;border:1px dashed rgba(255,255,255,0.2)}
        .ef-site-item.ef-drag-over{border-color:rgba(255,255,255,0.4);background:rgba(255,255,255,0.09)}
        .ef-drag-handle{display:flex;flex-direction:column;gap:3px;padding:2px 4px;opacity:0.3;flex-shrink:0}
        .ef-drag-handle span{display:block;width:14px;height:1.5px;background:#fff;border-radius:1px}
        .ef-rank{width:20px;height:20px;border-radius:50%;border:1px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:500;color:rgba(255,255,255,0.5);flex-shrink:0}
        .ef-site-info{flex:1;min-width:0}
        .ef-site-name{font-size:13px;font-weight:500;color:#e8e8e8}
        .ef-site-note{font-size:11px;color:rgba(255,255,255,0.35);margin-top:2px}
        .ef-site-note.warn{color:#c9913a}
        .ef-toggle{position:relative;width:34px;height:19px;flex-shrink:0}
        .ef-toggle input{opacity:0;width:0;height:0;position:absolute}
        .ef-toggle-track{position:absolute;inset:0;border-radius:10px;background:rgba(255,255,255,0.15);transition:background 0.2s;cursor:pointer}
        .ef-toggle input:checked+.ef-toggle-track{background:#1D9E75}
        .ef-toggle-track::after{content:'';position:absolute;width:13px;height:13px;border-radius:50%;background:#fff;top:3px;left:3px;transition:transform 0.2s}
        .ef-toggle input:checked+.ef-toggle-track::after{transform:translateX(15px)}
        .ef-divider{height:1px;background:rgba(255,255,255,0.07);margin:16px 0}
        .ef-action-row{display:flex;gap:8px;justify-content:space-between;align-items:center}
        .ef-saved-hint{font-size:12px;color:#1D9E75;opacity:0;transition:opacity 0.3s}
        .ef-saved-hint.show{opacity:1}
        .ef-btn{padding:7px 16px;border-radius:7px;font-size:13px;cursor:pointer;border:1px solid rgba(255,255,255,0.15);background:transparent;color:#e8e8e8;transition:background 0.15s}
        .ef-btn:hover{background:rgba(255,255,255,0.08)}
        .ef-btn-primary{background:#1D9E75;border-color:transparent;color:#fff}
        .ef-btn-primary:hover{background:#18876a}
        `;
        document.head.appendChild(s);
    }

    // ===== 灯箱 =====
    let zoomOverlay = null, zoomImgs = [], zoomIdx = 0;

    function buildZoomOverlay() {
        if (zoomOverlay) return;
        zoomOverlay = document.createElement('div');
        zoomOverlay.id = 'ef-zoom-overlay';
        zoomOverlay.style.display = 'none';
        zoomOverlay.innerHTML = `<button class="ef-nav-btn ef-nav-left">&#8249;</button><img id="ef-zoom-img"/><button class="ef-nav-btn ef-nav-right">&#8250;</button><button class="ef-zoom-close">&#x2715;</button><div class="ef-zoom-counter"></div>`;
        document.body.appendChild(zoomOverlay);
        zoomOverlay.querySelector('.ef-nav-left').onclick  = (e) => { e.stopPropagation(); navZoom(-1); };
        zoomOverlay.querySelector('.ef-nav-right').onclick = (e) => { e.stopPropagation(); navZoom(+1); };
        zoomOverlay.querySelector('.ef-zoom-close').onclick = closeZoom;
        zoomOverlay.addEventListener('click', e => { if (e.target === zoomOverlay) closeZoom(); });
        document.addEventListener('keydown', e => {
            if (!zoomOverlay || zoomOverlay.style.display === 'none') return;
            if (e.key === 'ArrowLeft') navZoom(-1);
            if (e.key === 'ArrowRight') navZoom(+1);
            if (e.key === 'Escape') closeZoom();
        });
    }
    function openZoom(images, idx) { buildZoomOverlay(); zoomImgs = images; zoomIdx = idx; zoomOverlay.style.display = 'flex'; updateZoomImg(); }
    function navZoom(dir) { zoomIdx = (zoomIdx + dir + zoomImgs.length) % zoomImgs.length; updateZoomImg(); }
    function updateZoomImg() {
        const img = zoomOverlay.querySelector('#ef-zoom-img');
        img.style.opacity = '0'; img.src = zoomImgs[zoomIdx];
        img.onload = () => { img.style.opacity = '1'; };
        zoomOverlay.querySelector('.ef-zoom-counter').textContent = `${zoomIdx + 1} / ${zoomImgs.length}`;
    }
    function closeZoom() { if (zoomOverlay) zoomOverlay.style.display = 'none'; }

    // ===== 渲染剧照 =====
    function clearGrid(grid) {
        [...grid.children].forEach(c => { if (!c.classList.contains('jv-trailer-wrapper')) c.remove(); });
    }

    function renderImages(container, images, source) {
        const grid = container.querySelector('.jv-images-grid');
        if (!grid) return;
        const hasTrailer = !!grid.querySelector('.jv-trailer-wrapper');
        clearGrid(grid);
        grid.querySelector('.ef-status')?.remove();

        const countEl = container.querySelector('.jv-image-count');
        if (countEl) countEl.textContent = `${hasTrailer ? '预告片 + ' : ''}${images.length} 张 · 来自 ${source.toUpperCase()}`;

        images.forEach((src, idx) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'ef-img-wrapper';
            const badge = document.createElement('span');
            badge.className = 'ef-source-badge';
            badge.textContent = source;
            const img = document.createElement('img');
            img.decoding = 'async'; img.loading = 'lazy'; img.alt = `剧照 ${idx + 1}`;
            img.onload  = () => img.classList.add('ef-loaded');
            img.onerror = () => { wrapper.style.display = 'none'; };
            img.onclick = () => openZoom(images, idx);
            img.src = src;
            wrapper.appendChild(badge); wrapper.appendChild(img);
            grid.appendChild(wrapper);
        });
    }

    function showLoading(container, code) {
        const grid = container.querySelector('.jv-images-grid');
        if (!grid) return;
        clearGrid(grid);
        const div = document.createElement('div');
        div.className = 'ef-status';
        div.innerHTML = `<div class="ef-spinner"></div><span>正在加载外部剧照（${code}）…</span>`;
        grid.appendChild(div);
        const countEl = container.querySelector('.jv-image-count');
        if (countEl) countEl.textContent = '';
    }

    function showError(container, msg) {
        const grid = container.querySelector('.jv-images-grid');
        if (!grid) return;
        clearGrid(grid);
        const div = document.createElement('div');
        div.className = 'ef-status ef-error';
        div.textContent = msg;
        grid.appendChild(div);
        const countEl = container.querySelector('.jv-image-count');
        if (countEl) countEl.textContent = '';
    }

    // ===== 设置面板 =====
    function openSettingsPanel() {
        if (document.getElementById('ef-settings-mask')) return;
        injectStyles();

        // 从存储重新加载最新设置
        SETTINGS = loadSettings();

        const mask = document.createElement('div');
        mask.id = 'ef-settings-mask';

        // 构建站点列表 HTML
        function buildSiteItems(order, enabled) {
            return order.map((site, i) => {
                const meta = SITE_META[site];
                return `
                <div class="ef-site-item" data-site="${site}">
                    <div class="ef-drag-handle"><span></span><span></span><span></span></div>
                    <div class="ef-rank">${i + 1}</div>
                    <div class="ef-site-info">
                        <div class="ef-site-name">${meta.name}</div>
                        <div class="ef-site-note${meta.noteWarn ? ' warn' : ''}">${meta.noteWarn ? '⚠ ' : ''}${meta.note}</div>
                    </div>
                    <label class="ef-toggle">
                        <input type="checkbox" ${enabled[site] ? 'checked' : ''} data-site="${site}">
                        <span class="ef-toggle-track"></span>
                    </label>
                </div>`;
            }).join('');
        }

        mask.innerHTML = `
        <div id="ef-settings-panel">
            <div class="ef-panel-header">
                <div>
                    <div class="ef-panel-title">外部剧照设置</div>
                    <div class="ef-panel-subtitle">Emby External Fanart v3.0</div>
                </div>
                <button class="ef-panel-close" id="ef-panel-close">&#x2715;</button>
            </div>
            <div class="ef-panel-body">
                <div class="ef-section-label">剧照来源优先级 · 拖拽调整顺序</div>
                <div class="ef-site-list" id="ef-site-list">
                    ${buildSiteItems(SETTINGS.siteOrder, SETTINGS.siteEnabled)}
                </div>
                <div class="ef-divider"></div>
                <div class="ef-action-row">
                    <span class="ef-saved-hint" id="ef-saved-hint">✓ 已保存</span>
                    <div style="display:flex;gap:8px">
                        <button class="ef-btn" id="ef-btn-reset">恢复默认</button>
                        <button class="ef-btn ef-btn-primary" id="ef-btn-save">保存设置</button>
                    </div>
                </div>
            </div>
        </div>`;

        document.body.appendChild(mask);

        // 拖拽排序
        const siteList = mask.querySelector('#ef-site-list');
        let dragging = null;

        function updateRanks() {
            siteList.querySelectorAll('.ef-site-item').forEach((item, i) => {
                item.querySelector('.ef-rank').textContent = i + 1;
            });
        }

        initDrag(siteList);

        // ===== 鼠标模拟拖拽 =====
        function initDrag(list) {
            list.querySelectorAll('.ef-site-item').forEach(item => {
                const handle = item.querySelector('.ef-drag-handle');
                let startY = 0, origIndex = 0, ghost = null, offsetY = 0;

                handle.addEventListener('mousedown', e => {
                    e.preventDefault();
                    startY = e.clientY;
                    offsetY = e.clientY - item.getBoundingClientRect().top;

                    // 克隆作为拖拽影子
                    ghost = item.cloneNode(true);
                    ghost.style.cssText = `
                        position:fixed;
                        left:${item.getBoundingClientRect().left}px;
                        top:${item.getBoundingClientRect().top}px;
                        width:${item.offsetWidth}px;
                        opacity:0.85;
                        pointer-events:none;
                        z-index:9999999;
                        box-shadow:0 4px 20px rgba(0,0,0,0.5);
                        margin:0;
                    `;
                    document.body.appendChild(ghost);
                    item.classList.add('ef-dragging');

                    const items = [...list.querySelectorAll('.ef-site-item')];
                    origIndex = items.indexOf(item);

                    function onMouseMove(e) {
                        ghost.style.top = (e.clientY - offsetY) + 'px';

                        // 找到鼠标下方的目标元素
                        const siblings = [...list.querySelectorAll('.ef-site-item:not(.ef-dragging)')];
                        siblings.forEach(s => s.classList.remove('ef-drag-over'));

                        let target = null;
                        let insertBefore = true;
                        for (const s of siblings) {
                            const rect = s.getBoundingClientRect();
                            if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
                                target = s;
                                insertBefore = e.clientY < rect.top + rect.height / 2;
                                s.classList.add('ef-drag-over');
                                break;
                            }
                        }

                        if (target) {
                            if (insertBefore) list.insertBefore(item, target);
                            else list.insertBefore(item, target.nextSibling);
                        }
                    }

                    function onMouseUp() {
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                        if (ghost) { ghost.remove(); ghost = null; }
                        item.classList.remove('ef-dragging');
                        list.querySelectorAll('.ef-site-item').forEach(s => s.classList.remove('ef-drag-over'));
                        updateRanks();
                    }

                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                });
            });
        }

        // 读取当前面板状态
        function readPanelState() {
            const order = [...siteList.querySelectorAll('.ef-site-item')].map(el => el.dataset.site);
            const enabled = {};
            siteList.querySelectorAll('input[type=checkbox]').forEach(cb => {
                enabled[cb.dataset.site] = cb.checked;
            });
            return { siteOrder: order, siteEnabled: enabled };
        }

        // 保存
        mask.querySelector('#ef-btn-save').addEventListener('click', () => {
            const state = readPanelState();
            SETTINGS = state;
            saveSettings(state);
            const hint = mask.querySelector('#ef-saved-hint');
            hint.classList.add('show');
            setTimeout(() => hint.classList.remove('show'), 2000);
            // 清空缓存，下次进入详情页重新抓取
            memCache.clear();
        });

        // 恢复默认
        mask.querySelector('#ef-btn-reset').addEventListener('click', () => {
            const defaults = { siteOrder: ['javbus', 'javdb', 'dmm'], siteEnabled: { javbus: true, javdb: true, dmm: true } };
            siteList.innerHTML = buildSiteItems(defaults.siteOrder, defaults.siteEnabled);
            initDrag(siteList);
        });

        // 关闭
        const closePanel = () => mask.remove();
        mask.querySelector('#ef-panel-close').addEventListener('click', closePanel);
        mask.addEventListener('click', e => { if (e.target === mask) closePanel(); });
        document.addEventListener('keydown', function onKey(e) {
            if (e.key === 'Escape') { closePanel(); document.removeEventListener('keydown', onKey); }
        });
    }

    // ===== Tampermonkey 菜单注册 =====
    GM_registerMenuCommand('⚙ 外部剧照设置', openSettingsPanel);

    // ===== 主流程 =====
    let currentItemId = null, isRunning = false;

    async function run() {
        if (!isDetailPage()) return;
        const itemId = getItemId();
        if (!itemId || itemId === currentItemId || isRunning) return;
        isRunning = true; currentItemId = itemId;

        try {
            const container = await waitForElement('#jv-image-container', 12000);
            if (!container) { warn('未找到 #jv-image-container，请确认原始脚本已安装'); return; }
            if (getItemId() !== itemId) return;

            const code = await getCode(itemId);
            if (!code) { warn('无法提取番号，跳过'); showError(container, '无法从标题或元数据中提取番号'); return; }
            log('最终番号:', code);

            injectStyles();
            showLoading(container, code);

            const { images, source } = await fetchFanartImages(code);
            if (getItemId() !== itemId) return;

            if (!images || images.length === 0) {
                const activeNames = getActiveSites().map(s => SITE_META[s].name).join(' / ');
                showError(container, `未能从 ${activeNames || '已启用站点'} 找到「${code}」的剧照`);
            } else {
                renderImages(container, images, source);
            }
        } catch (e) { warn('run() 出错:', e); }
        finally { isRunning = false; }
    }

    function isDetailPage() { return location.hash.includes('/details?id=') || location.hash.includes('/item?id='); }
    function getItemId() { return location.hash.match(/id=([^&]+)/)?.[1] ?? null; }
    function waitForElement(selector, timeout = 12000) {
        return new Promise(resolve => {
            const el = document.querySelector(selector);
            if (el) return resolve(el);
            const ob = new MutationObserver(() => { const f = document.querySelector(selector); if (f) { ob.disconnect(); resolve(f); } });
            ob.observe(document.body, { childList: true, subtree: true });
            setTimeout(() => { ob.disconnect(); resolve(null); }, timeout);
        });
    }

    const scheduleRun = (() => {
        let timer = null;
        return (delay = 700) => {
            clearTimeout(timer);
            timer = setTimeout(() => { currentItemId = null; isRunning = false; run(); }, delay);
        };
    })();

    document.addEventListener('viewshow',  () => scheduleRun(700));
    window.addEventListener('hashchange', () => scheduleRun(900));
    scheduleRun(1500);

    log('v3.0 已加载 · Tampermonkey 菜单中可打开设置面板');
})();
