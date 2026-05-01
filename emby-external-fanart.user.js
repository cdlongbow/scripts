// ==UserScript==
// @name         Emby External Fanart
// @namespace    emby-external-fanart
// @version      2.1.0
// @description  在 Emby 详情页从 JavBus / JavDB / DMM 抓取外部剧照并替换原有embycss剧照区块
// @author       ZiPenOk
// @match        *://*/web/index.html*
// @match        *://*/web/
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
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

    // ===== 配置 =====
    const CONFIG = {
        siteOrder: ['javbus', 'javdb', 'dmm'],
        sites: {
            javbus: 'https://www.javbus.com',
            javdb:  'https://javdb.com',
            dmm:    'https://www.dmm.co.jp',
        },
        containerId: 'jv-image-container',
        cacheExpiry: 60 * 60 * 1000, // 1小时
        maxImages: 0,
    };

    const log  = (...a) => console.log('[ExternalFanart]', ...a);
    const warn = (...a) => console.warn('[ExternalFanart]', ...a);

    // ===== 缓存 =====
    const memCache = new Map();

    function getCached(code) {
        const hit = memCache.get(code);
        if (hit && Date.now() - hit.ts < CONFIG.cacheExpiry) return hit;
        try {
            const stored = GM_getValue(`ef_${code}`, null);
            if (stored && Date.now() - stored.ts < CONFIG.cacheExpiry) {
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
                method: 'GET',
                url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,*/*;q=0.9',
                    'Accept-Language': 'ja,zh-CN;q=0.9,en;q=0.8',
                    ...extraHeaders,
                },
                responseType: 'document',
                timeout: 20000,
                onload:    (res) => res.status >= 200 && res.status < 400 ? resolve(res.response) : reject(new Error(`HTTP ${res.status}`)),
                onerror:   () => reject(new Error(`网络错误: ${url}`)),
                ontimeout: () => reject(new Error(`请求超时: ${url}`)),
            });
        });
    }

    // ===== 番号提取（修复版）=====
    // 从整个字符串中搜索番号，不再只取纯文本节点
    function extractCode(text) {
        if (!text) return null;
        // 匹配番号：字母-数字，如 DLDSS-286、SSNI-946、FC2-PPV-1234567
        const m = text.match(/\b([A-Za-z]{2,10}(?:-[A-Za-z]+)?)-(\d{2,7})\b/);
        if (m) return `${m[1].toUpperCase()}-${m[2]}`;
        return null;
    }

    // 优先从 Emby API 读取，再从页面标题提取
    async function getCode(itemId) {
        // 1. 尝试 Emby API：OriginalTitle 和 ProviderIds 最可靠
        if (typeof ApiClient !== 'undefined') {
            try {
                const userId = ApiClient.getCurrentUserId();
                const item   = await ApiClient.getItem(userId, itemId);

                // OriginalTitle 通常直接就是番号，如 "DLDSS-286"
                if (item.OriginalTitle) {
                    const code = extractCode(item.OriginalTitle);
                    if (code) { log('番号来源: OriginalTitle →', code); return code; }
                }

                // ProviderIds 里可能有 Javbus / JavDB 等键值
                if (item.ProviderIds) {
                    for (const val of Object.values(item.ProviderIds)) {
                        const code = extractCode(String(val));
                        if (code) { log('番号来源: ProviderIds →', code); return code; }
                    }
                }

                // Name（完整标题，包含番号前缀）
                if (item.Name) {
                    const code = extractCode(item.Name);
                    if (code) { log('番号来源: Name →', code); return code; }
                }
            } catch (e) {
                warn('Emby API 读取失败，回退到页面标题:', e.message);
            }
        }

        // 2. 回退：从页面 DOM 标题元素的完整 textContent 提取
        const selectors = [
            '.detailPagePrimaryContainer h1',
            '#itemDetailPage:not(.hide) .nameContainer .itemName',
            '.itemView:not(.hide) .nameContainer .itemName',
            '.detailPagePrimaryContainer .itemName',
            '.nameContainer .itemName',
            'h1',
            '.itemName',
        ];
        for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (!el) continue;
            // 取完整 textContent（包含所有子元素文本，番号 badge 也会被包含）
            const text = el.textContent.trim();
            log('尝试从DOM提取，文本:', text);
            const code = extractCode(text);
            if (code) { log('番号来源: DOM →', code); return code; }
        }

        return null;
    }

    // ===== JavBus 抓取 =====
    async function fetchJavBus(code) {
        const url = `${CONFIG.sites.javbus}/${code}`;
        log(`[JavBus] 请求: ${url}`);
        const doc = await gmFetch(url);
        if (!doc) return [];

        const imgs = [];
        doc.querySelectorAll('#sample-waterfall a.sample-box').forEach(a => {
            const href = a.getAttribute('href') || '';
            if (href && href.startsWith('http')) imgs.push(href);
        });
        log(`[JavBus] 找到 ${imgs.length} 张`);
        return imgs;
    }

    // ===== JavDB 抓取 =====
    async function fetchJavDB(code) {
        const searchUrl = `${CONFIG.sites.javdb}/search?q=${encodeURIComponent(code)}&f=all`;
        log(`[JavDB] 搜索: ${searchUrl}`);
        const searchDoc = await gmFetch(searchUrl);
        if (!searchDoc) return [];

        const firstResult = searchDoc.querySelector('.movie-list .item a');
        if (!firstResult) { log('[JavDB] 搜索无结果'); return []; }

        const href = firstResult.getAttribute('href') || '';
        const detailUrl = href.startsWith('http') ? href : `${CONFIG.sites.javdb}${href}`;

        log(`[JavDB] 详情页: ${detailUrl}`);
        const detailDoc = await gmFetch(detailUrl, { Referer: searchUrl });
        if (!detailDoc) return [];

        const imgs = [];
        detailDoc.querySelectorAll('.tile-images.preview-images a.tile-item').forEach(a => {
            const href = a.getAttribute('href') || '';
            if (href && href.startsWith('http')) imgs.push(href);
        });
        log(`[JavDB] 找到 ${imgs.length} 张`);
        return imgs;
    }

    // ===== DMM 抓取 =====
    async function fetchDMM(code) {
        const dmmCid = normalizeDMMCode(code);
        if (!dmmCid) { warn(`[DMM] 无法转换番号: ${code}`); return []; }

        const url = `${CONFIG.sites.dmm}/digital/videoa/-/detail/=/cid=${dmmCid}/`;
        log(`[DMM] 请求: ${url}`);

        let doc;
        try {
            doc = await gmFetch(url, {
                Cookie: 'age_check_done=1; ckcy=1',
                'Accept-Language': 'ja',
            });
        } catch (e) {
            warn(`[DMM] 请求失败: ${e.message}`);
            return [];
        }
        if (!doc) return [];

        const imgs = [];
        doc.querySelectorAll('#sample-image-block img').forEach(img => {
            const src = img.getAttribute('data-lazy') || '';
            if (src && src.startsWith('http') && !src.endsWith('ps.jpg')) imgs.push(src);
        });
        log(`[DMM] 找到 ${imgs.length} 张`);
        return imgs;
    }

    function normalizeDMMCode(code) {
        const m = code.match(/^([A-Za-z]+)-(\d+)$/);
        if (!m) return null;
        return m[1].toLowerCase() + m[2].padStart(5, '0');
    }

    // ===== 按优先级抓取 =====
    const FETCHERS = { javbus: fetchJavBus, javdb: fetchJavDB, dmm: fetchDMM };

    async function fetchFanartImages(code) {
        const cached = getCached(code);
        if (cached) {
            log(`[Cache] 命中: ${code} (${cached.images.length} 张, 来自 ${cached.source})`);
            return cached;
        }

        for (const site of CONFIG.siteOrder) {
            try {
                const imgs = await FETCHERS[site](code);
                if (imgs && imgs.length > 0) {
                    const result = CONFIG.maxImages > 0 ? imgs.slice(0, CONFIG.maxImages) : imgs;
                    setCache(code, result, site);
                    return { images: result, source: site };
                }
                warn(`[${site}] 未找到剧照，尝试下一站点`);
            } catch (e) {
                warn(`[${site}] 出错: ${e.message}，尝试下一站点`);
            }
        }

        warn('[所有站点] 均未找到剧照');
        return { images: [], source: null };
    }

    // ===== 注入样式 =====
    function injectStyles() {
        if (document.getElementById('ef-styles')) return;
        const style = document.createElement('style');
        style.id = 'ef-styles';
        style.textContent = `
            #jv-image-container .jv-images-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                align-items: flex-start;
            }
            .ef-img-wrapper {
                position: relative;
                cursor: pointer;
                overflow: hidden;
                border-radius: 4px;
                height: 160px;
                flex: 0 0 auto;
                background: rgba(255,255,255,0.05);
            }
            .ef-img-wrapper img {
                height: 100%;
                width: auto;
                max-width: 300px;
                object-fit: cover;
                display: block;
                transition: transform 0.2s ease, opacity 0.3s ease;
                opacity: 0;
            }
            .ef-img-wrapper img.ef-loaded { opacity: 1; }
            .ef-img-wrapper:hover img { transform: scale(1.05); }
            .ef-source-badge {
                position: absolute;
                top: 4px;
                left: 4px;
                background: rgba(0,0,0,0.65);
                color: #fff;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 3px;
                pointer-events: none;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                z-index: 1;
            }
            #ef-zoom-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.93);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            #ef-zoom-overlay img {
                max-width: 92vw;
                max-height: 92vh;
                object-fit: contain;
                border-radius: 4px;
                transition: opacity 0.2s ease;
            }
            .ef-nav-btn {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(255,255,255,0.12);
                border: none;
                color: #fff;
                font-size: 2.2rem;
                width: 52px;
                height: 52px;
                cursor: pointer;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.15s;
                z-index: 1;
            }
            .ef-nav-btn:hover { background: rgba(255,255,255,0.25); }
            .ef-nav-left  { left: 16px; }
            .ef-nav-right { right: 16px; }
            .ef-zoom-close {
                position: absolute;
                top: 16px;
                right: 16px;
                background: rgba(255,255,255,0.12);
                border: none;
                color: #fff;
                font-size: 1.2rem;
                width: 38px;
                height: 38px;
                cursor: pointer;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.15s;
            }
            .ef-zoom-close:hover { background: rgba(255,255,255,0.3); }
            .ef-zoom-counter {
                position: absolute;
                bottom: 16px;
                left: 50%;
                transform: translateX(-50%);
                color: rgba(255,255,255,0.6);
                font-size: 13px;
                pointer-events: none;
            }
            .ef-status {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 14px 0;
                color: rgba(255,255,255,0.5);
                font-size: 13px;
            }
            .ef-status.ef-error { color: rgba(255,100,100,0.75); }
            .ef-spinner {
                flex-shrink: 0;
                width: 16px;
                height: 16px;
                border: 2px solid rgba(255,255,255,0.2);
                border-top-color: rgba(255,255,255,0.7);
                border-radius: 50%;
                animation: ef-spin 0.7s linear infinite;
            }
            @keyframes ef-spin { to { transform: rotate(360deg); } }
        `;
        document.head.appendChild(style);
    }

    // ===== 灯箱 =====
    let zoomOverlay = null;
    let zoomImgs = [], zoomIdx = 0;

    function buildZoomOverlay() {
        if (zoomOverlay) return;
        zoomOverlay = document.createElement('div');
        zoomOverlay.id = 'ef-zoom-overlay';
        zoomOverlay.style.display = 'none';
        zoomOverlay.innerHTML = `
            <button class="ef-nav-btn ef-nav-left">&#8249;</button>
            <img id="ef-zoom-img" />
            <button class="ef-nav-btn ef-nav-right">&#8250;</button>
            <button class="ef-zoom-close">&#x2715;</button>
            <div class="ef-zoom-counter"></div>
        `;
        document.body.appendChild(zoomOverlay);
        zoomOverlay.querySelector('.ef-nav-left').onclick  = (e) => { e.stopPropagation(); navZoom(-1); };
        zoomOverlay.querySelector('.ef-nav-right').onclick = (e) => { e.stopPropagation(); navZoom(+1); };
        zoomOverlay.querySelector('.ef-zoom-close').onclick = closeZoom;
        zoomOverlay.addEventListener('click', (e) => { if (e.target === zoomOverlay) closeZoom(); });
        document.addEventListener('keydown', (e) => {
            if (!zoomOverlay || zoomOverlay.style.display === 'none') return;
            if (e.key === 'ArrowLeft')  navZoom(-1);
            if (e.key === 'ArrowRight') navZoom(+1);
            if (e.key === 'Escape')     closeZoom();
        });
    }

    function openZoom(images, index) {
        buildZoomOverlay();
        zoomImgs = images; zoomIdx = index;
        zoomOverlay.style.display = 'flex';
        updateZoomImg();
    }

    function navZoom(dir) {
        zoomIdx = (zoomIdx + dir + zoomImgs.length) % zoomImgs.length;
        updateZoomImg();
    }

    function updateZoomImg() {
        const img = zoomOverlay.querySelector('#ef-zoom-img');
        img.style.opacity = '0';
        img.src = zoomImgs[zoomIdx];
        img.onload = () => { img.style.opacity = '1'; };
        zoomOverlay.querySelector('.ef-zoom-counter').textContent = `${zoomIdx + 1} / ${zoomImgs.length}`;
    }

    function closeZoom() { if (zoomOverlay) zoomOverlay.style.display = 'none'; }

    // ===== 渲染剧照 =====
    function renderImages(container, images, source) {
        const grid = container.querySelector('.jv-images-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const countEl = container.querySelector('.jv-image-count');
        if (countEl) countEl.textContent = `共 ${images.length} 张 · 来自 ${source.toUpperCase()}`;

        images.forEach((src, idx) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'ef-img-wrapper';

            const badge = document.createElement('span');
            badge.className = 'ef-source-badge';
            badge.textContent = source;
            wrapper.appendChild(badge);

            const img = document.createElement('img');
            img.decoding = 'async';
            img.loading  = 'lazy';
            img.alt      = `剧照 ${idx + 1}`;
            img.onload   = () => img.classList.add('ef-loaded');
            img.onerror  = () => { wrapper.style.display = 'none'; };
            img.onclick  = () => openZoom(images, idx);
            img.src      = src;
            wrapper.appendChild(img);

            grid.appendChild(wrapper);
        });
    }

    function showLoading(container, code) {
        const grid = container.querySelector('.jv-images-grid');
        if (!grid) return;
        grid.innerHTML = '';
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
        grid.innerHTML = '';
        const div = document.createElement('div');
        div.className = 'ef-status ef-error';
        div.textContent = msg;
        grid.appendChild(div);
        const countEl = container.querySelector('.jv-image-count');
        if (countEl) countEl.textContent = '';
    }

    // ===== 主流程 =====
    let currentItemId = null;
    let isRunning     = false;

    async function run() {
        if (!isDetailPage()) return;

        const itemId = getItemId();
        if (!itemId || itemId === currentItemId) return;
        if (isRunning) return;

        isRunning     = true;
        currentItemId = itemId;

        try {
            const container = await waitForElement(`#${CONFIG.containerId}`, 12000);
            if (!container) {
                warn('未找到 #jv-image-container，请确认原始脚本已安装');
                return;
            }
            if (getItemId() !== itemId) return;

            // 获取番号（优先 API，回退 DOM）
            const code = await getCode(itemId);
            if (!code) {
                warn('无法提取番号，跳过');
                showError(container, '无法从标题或元数据中提取番号');
                return;
            }
            log('最终番号:', code);

            injectStyles();
            showLoading(container, code);

            const { images, source } = await fetchFanartImages(code);

            if (getItemId() !== itemId) return;

            if (!images || images.length === 0) {
                showError(container, `未能从 JavBus / JavDB / DMM 找到「${code}」的剧照`);
            } else {
                renderImages(container, images, source);
            }
        } catch (e) {
            warn('run() 出错:', e);
        } finally {
            isRunning = false;
        }
    }

    function isDetailPage() {
        return location.hash.includes('/details?id=') || location.hash.includes('/item?id=');
    }

    function getItemId() {
        return location.hash.match(/id=([^&]+)/)?.[1] ?? null;
    }

    function waitForElement(selector, timeout = 12000) {
        return new Promise(resolve => {
            const el = document.querySelector(selector);
            if (el) return resolve(el);
            const ob = new MutationObserver(() => {
                const found = document.querySelector(selector);
                if (found) { ob.disconnect(); resolve(found); }
            });
            ob.observe(document.body, { childList: true, subtree: true });
            setTimeout(() => { ob.disconnect(); resolve(null); }, timeout);
        });
    }

    // ===== 监听导航 =====
    const scheduleRun = (() => {
        let timer = null;
        return (delay = 700) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                currentItemId = null;
                isRunning     = false;
                run();
            }, delay);
        };
    })();

    document.addEventListener('viewshow',  () => scheduleRun(700));
    window.addEventListener('hashchange', () => scheduleRun(900));
    scheduleRun(1500);

    log('v2.1 已加载');
})();
