// ==UserScript==
// @name         番号跳转加预览图
// @namespace    https://github.com/ZiPenOk
// @version      5.3.1
// @icon         https://javdb.com/favicon.ico
// @description  所有站点统一使用强番号逻辑 + JavBus 智能路径，表格开关，手动关闭，按钮统一在标题下方新行显示。新增 JavBus、JAVLibrary、JavDB、javrate , 增加javstore预览图来源, 并添加缓存控制选择。新增 MissAV 站点适配。增加ProjectJav预览图来源。
// @author       ZiPenOk
// @match        *://sukebei.nyaa.si/*
// @match        *://169bbs.com/*
// @match        *://supjav.com/*
// @match        *://emby.sh1nyan.fun/web/index.html*
// @match        *://10.10.10.*:*/web/index.html*
// @match        *://www.javbus.com/*
// @match        *://javbus.com/*
// @match        *://javdb.com/v/*
// @match        *://www.javlibrary.com/*
// @match        *://javlibrary.com/*
// @match        *://javrate.com/*
// @match        *://www.javrate.com/*
// @match        *://sehuatang.net/*
// @match        *://hjd2048.com/2048/*
// @match        *://missav.ws/*
// @match        *://missav.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @connect      *
// @updateURL    https://github.com/ZiPenOk/scripts/raw/refs/heads/main/jav_jump.js
// @downloadURL  https://github.com/ZiPenOk/scripts/raw/refs/heads/main/jav_jump.js
// ==/UserScript==

(function() {
    'use strict';

    // ============================ 全局样式 ============================
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

        /* 统一按钮组样式 */
        .jav-jump-btn-group {
            margin-top: 8px;
            margin-bottom: 4px;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
        }

        /* JAVLibrary 专用修复 - 只影响该站点的按钮组 */
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
            /* 背景和颜色由内联样式控制，此处不覆盖 */
        }

        /* Emby 专用修复：强制按钮组换行并占满整宽 */
        .emby-fix {
            width: 100% !important;
            flex-basis: 100% !important;
            clear: both !important;
            margin-top: 8px !important;
            margin-bottom: 4px !important;
        }

        //预览图缓存控制
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

        /* ========== 按钮特效悬停和动画 ========== */
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

        /* 通用按钮组样式 */
        .jav-jump-btn-group a,
        .javlibrary-fix a {
            transition: all 0.2s ease-in-out;
            animation: btnSlideIn 0.3s ease-out;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        /* 悬停效果（针对 JAVLibrary 使用 !important 覆盖内联样式） */
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

        /* 预览图工具栏 */
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
            background: rgba(100, 100, 120, 0.3); /* 统一灰色默认背景 */
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
    `);

    // ============================ 核心工具模块 ============================
    const Utils = {
        extractCode(text) {
            if (!text) return null;

            const patterns = [
                { regex: /([A-Z]{2,15})[-_\s]([A-Z]{1,2}\d{2,10})/i, type: 'alphanum' },
                { regex: /([A-Z]{2,15})[-_\s](\d{2,10})(?:[-_\s](\d+))?/i, type: 'standard' },
                { regex: /FC2[-\s_]?(?:PPV)?[-\s_]?(\d{6,9})/i, type: 'fc2' },
                { regex: /(\d{6})[-_\s]?(\d{2,3})/, type: 'numeric' },
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
                } else if (type === 'compact') {
                    return match[0].toUpperCase();
                }
            }
            return null;
        },

        // 专为 MissAV 等站点：直接用 <a href target=_blank>，浏览器天然认可为用户手势，不拦截弹窗
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

        showOverlay(imgUrl, code, source = null) {
            // 保存原始 overflow 值
            const originalHtmlOverflow = document.documentElement.style.overflow;
            const originalBodyOverflow = document.body.style.overflow;

            // 隐藏 html 和 body 的滚动条
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

            // 带防盗链绕过的图片加载：projectjav 需要 Referer，用 blob URL 规避跨域限制
            let currentBlobUrl = null;
            const loadImg = (url, src) => {
                // 释放上一个 blob URL
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
                        onerror: () => { img.src = url; } // 降级直接加载
                    });
                } else {
                    img.src = url;
                }
            };

            // 初始加载
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
            // toolbar 直接挂到 body，脱离遮罩层级，确保 position:fixed 固定在右上角不随图片滚动

            // 定义关闭并恢复滚动条的函数
            const closeOverlay = () => {
                if (container.parentNode) {
                    container.remove();
                    toolbar.remove();
                    document.documentElement.style.overflow = originalHtmlOverflow;
                    document.body.style.overflow = originalBodyOverflow;
                    // 释放 blob URL 防止内存泄漏
                    if (currentBlobUrl) {
                        URL.revokeObjectURL(currentBlobUrl);
                        currentBlobUrl = null;
                    }
                }
            };

            container.onclick = closeOverlay;

            // ESC键关闭
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

    // ============================ 预览图模块 ============================
    const Thumbnail = {
        // ========== 来源1：javfree.me ==========
        async javfree(code) {
            const cacheKey = `thumb_cache_${code}`;
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) return cached;

            try {
                const html = await Utils.request(`https://javfree.me/search/${code}`);
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const link = doc.querySelector('.entry-title>a')?.href;
                if (!link) return null;

                const dHtml = await Utils.request(link);
                const dDoc = new DOMParser().parseFromString(dHtml, 'text/html');
                const url = dDoc.querySelectorAll('p>img')[1]?.src || dDoc.querySelectorAll('p>img')[0]?.src;

                if (url) {
                    sessionStorage.setItem(cacheKey, url);
                    return url;
                }
                return null;
            } catch {
                return null;
            }
        },

        // ========== 来源2：javstore.net ==========
        async javstore(code) {
            try {
                const normalizedCode = code.replace(/^fc2-?/i, '').replace(/-/g, '').toLowerCase();
                console.log(`javstore: searching for code=${code}, normalized=${normalizedCode}`);

                // 1. 搜索页
                const searchUrl = `https://javstore.net/search?q=${encodeURIComponent(code)}`;
                const searchHtml = await Utils.request(searchUrl);
                const searchDoc = new DOMParser().parseFromString(searchHtml, 'text/html');

                // 2. 收集所有匹配番号的详情页链接（不止取第一个）
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

                // 3. 依次尝试每个候选链接，找到有预览图的为止
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

        // 从 javstore 详情页提取预览图 URL
        async _extractImgFromDetail(detailUrl) {
            try {
                const detailHtml = await Utils.request(detailUrl);
                const detailDoc = new DOMParser().parseFromString(detailHtml, 'text/html');

                // 优先：CLICK HERE 直链
                for (const link of detailDoc.querySelectorAll('a')) {
                    if (link.textContent.includes('CLICK HERE')) {
                        const imgUrl = link.href || link.getAttribute('href') || '';
                        if (imgUrl) return imgUrl.replace(/^http:/, 'https:');
                    }
                }

                // 备用：_s.jpg 缩略图转原图
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

        // ========== 来源3：projectjav.com ==========
        // 搜索端点：/?searchTerm={code}
        // GM_xmlhttpRequest 不执行 JS，搜索页返回列表，需两步：
        //   1. 请求搜索列表页 → 提取第一个 /movie/ 链接
        //   2. 请求详情页 → 取截图大图（优先）或封面图（备用）
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

                // 步骤1：搜索列表页
                const searchUrl = `https://projectjav.com/?searchTerm=${encodeURIComponent(code)}`;
                console.log('[projectjav] 步骤1 搜索页:', searchUrl);
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

                // 优先末尾是数字ID的链接，其次取第一个
                let detailPath = allMovieLinks.find(a => /\/movie\/.+-\d+$/.test(a.getAttribute('href') || ''))?.getAttribute('href')
                    || allMovieLinks[0].getAttribute('href');
                console.log('[projectjav] 选中链接:', detailPath);

                // 步骤2：详情页
                const detailUrl = detailPath.startsWith('http') ? detailPath : `https://projectjav.com${detailPath}`;
                console.log('[projectjav] 步骤2 详情页:', detailUrl);
                const detailHtml = await request(detailUrl);
                const detailDoc = new DOMParser().parseFromString(detailHtml, 'text/html');

                // 优先截图（取 data-featherlight 属性值，不是 href）
                const screenshotLink = detailDoc.querySelector('.thumbnail a[data-featherlight="image"]');
                console.log('[projectjav] screenshotLink data-src:', screenshotLink?.getAttribute('data-src') , 'featherlight:', screenshotLink?.getAttribute('data-featherlight'));
                if (screenshotLink) {
                    // 图片 URL 在 <img src> 子元素上（去掉 ?width=300 参数取原图）
                    const thumbImg = screenshotLink.querySelector('img');
                    if (thumbImg) {
                        const src = (thumbImg.getAttribute('src') || '').replace(/\?.*$/, '');
                        if (src) return src.replace(/^http:/, 'https:');
                    }
                    // 备用：a 标签自身的 href（部分版本有）
                    const href = screenshotLink.getAttribute('href') || '';
                    if (href && href.startsWith('http')) return href.replace(/^http:/, 'https:');
                }

                // 备用封面
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

        // ========== 主入口：按用户配置的顺序依次尝试各来源 ==========
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

    // ============================ 设置管理模块 ============================
    const Settings = {
        // 移除了 getPreviewSource 和 setPreviewSource
        getPreviewCacheEnabled() {
            return GM_getValue('preview_cache_enabled', true);
        },
        setPreviewCacheEnabled(value) {
            GM_setValue('preview_cache_enabled', value);
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

        // 预览图来源顺序
        getSourceOrder() {
            return GM_getValue('thumb_source_order', ['javfree', 'projectjav', 'javstore']);
        },
        setSourceOrder(order) {
            GM_setValue('thumb_source_order', order);
        }
    };

    // ============================ 搜索引擎数据 ============================
    const SearchEngines = [
        { name: 'BTDigg', color: '#F60', url: (code) => `https://btdig.com/search?q=${code}` },
        { name: 'CiLiJia', color: '#DE5833', url: (code) => `https://cilijia.net/search?q=${code}` },
        { name: 'Google', color: '#4285F4', url: (code) => `https://www.google.com/search?q=${code}` },
        { name: 'Bing', color: '#008373', url: (code) => `https://www.bing.com/search?q=${code}` },
        { name: 'DuckGo', color: '#DE5833', url: (code) => `https://duckduckgo.com/?q=${code}` }
    ];

    // 默认搜索引擎索引（可配置）
    const DEFAULT_SEARCH_ENGINE_INDEX = 0; // BTDigg (根据您定义的顺序)

    // ============================ 按钮创建辅助函数 ============================
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

    function addPreviewBtn(code, container, useCapture = false) {
        const btn = Utils.createBtn('🖼️ 预览图', '#28a745', async () => {
            await Thumbnail.show(code);
        }, useCapture);
        container.appendChild(btn);
    }

    function addSearchMenu(code, container, useCapture = false) {
        // 获取默认搜索引擎
        const defaultEngine = Settings.getDefaultSearchEngine();

        // 创建菜单容器
        const menuDiv = document.createElement('div');
        menuDiv.className = 'search-menu';
        menuDiv.style.cssText = `
            position: relative;
            display: inline-block;
        `;

        // 主按钮（默认搜索引擎）
        const mainBtn = Utils.createBtn(`🔍 ${defaultEngine.name}`, defaultEngine.color, () => {
            window.open(defaultEngine.url(code));
        }, useCapture);
        mainBtn.classList.add('search-main-btn');
        menuDiv.appendChild(mainBtn);

        // 子菜单容器
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

        // 为每个搜索引擎创建子按钮（排除默认引擎）
        SearchEngines.forEach(engine => {
            if (engine.name === defaultEngine.name) return; // 不重复显示默认引擎

            const subBtn = Utils.createBtn(`🔍 ${engine.name}`, engine.color, () => {
                window.open(engine.url(code));
            }, useCapture);
            subBtn.style.margin = '2px 0';
            subBtn.style.width = '100%';
            subBtn.style.textAlign = 'left';
            subMenu.appendChild(subBtn);
        });

        menuDiv.appendChild(subMenu);

        // 悬停逻辑
        let hoverTimer;
        menuDiv.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimer);
            hoverTimer = setTimeout(() => {
                subMenu.style.display = 'flex';
                // 添加淡入动画
                subMenu.style.animation = 'menuFadeIn 0.2s ease';
            }, 1000);
        });

        menuDiv.addEventListener('mouseleave', (e) => {
            clearTimeout(hoverTimer);
            // 如果鼠标移入子菜单，不隐藏
            if (e.relatedTarget && subMenu.contains(e.relatedTarget)) return;

            setTimeout(() => {
                if (!subMenu.matches(':hover')) {
                    subMenu.style.display = 'none';
                }
            }, 300); // 给一点缓冲时间
        });

        // 子菜单悬停时不隐藏
        subMenu.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimer);
        });

        subMenu.addEventListener('mouseleave', () => {
            subMenu.style.display = 'none';
        });

        container.appendChild(menuDiv);
    }

    // ============================ 站点定义模块 ============================
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
            // 兼容各种路径结构的详情页，包括：
            //   /ipzz-385
            //   /dm47/ipzz-385
            //   /dm32/cn/pppe-166
            //   /dm32/cn/pppe-166-uncensored-leak （带 -uncensored-leak 等后缀）
            // 只要 pathname 含 /字母-数字 片段即视为详情页，并排除列表类页面。
            match: (url) => {
                if (!/missav\.(ws|com)/.test(url)) return false;
                const pathname = new URL(url).pathname;
                if (/^\/$|\/search|\/tags|\/actresses|\/genres/.test(pathname)) return false;
                return /\/[a-z]{2,10}-\d+/i.test(pathname);
            },
            // h1 带多个 class，用属性含匹配更稳健；fallback 任意 h1
            titleSelector: 'h1[class*="text-nord6"], h1'
        }
    ];

    // ============================ UI 渲染模块 ============================
    function renderButtonsForCurrentPage() {
        const site = Sites.find(s => s.match(window.location.href));
        if (!site) return;

        const titleElem = document.querySelector(site.titleSelector);
        if (!titleElem) return;

        if (titleElem.dataset.enhanced === '1') return;
        titleElem.dataset.enhanced = '1';

        const code = Utils.extractCode(titleElem.textContent);
        if (!code) return;

        const settings = Settings.get(site.id);

        // 如果该站点被禁用，直接返回
        if (!settings.enabled) return;

        const btnGroup = document.createElement('div');
        btnGroup.className = 'jav-jump-btn-group';

        // 区分 JAVLibrary 特殊处理
        if (site.id === 'javlibrary') {
            // 强制添加所有按钮（忽略设置，确保显示）
            addNyaaBtn(code, btnGroup);
            addJavbusBtn(code, btnGroup);
            addJavdbBtn(code, btnGroup);
            addMissAVBtn(code, btnGroup);
            addSearchMenu(code, btnGroup);
            addPreviewBtn(code, btnGroup);

            // 为按钮内联样式添加 !important 防止被覆盖
            btnGroup.querySelectorAll('a').forEach(btn => {
                let style = btn.getAttribute('style') || '';
                style = style.replace(/background:\s*([^;]+);/g, 'background: $1 !important;');
                style = style.replace(/color:\s*([^;]+);/g, 'color: $1 !important;');
                btn.setAttribute('style', style);
            });

            btnGroup.classList.add('javlibrary-fix');

            // 插入到 #rightcolumn 顶部
            const rightColumn = document.querySelector('#rightcolumn');
            if (rightColumn) {
                rightColumn.prepend(btnGroup);
            } else {
                titleElem.insertAdjacentElement('afterend', btnGroup);
            }
        } else if (site.id === 'missav') {
            // MissAV 核心问题：window.open() 会被浏览器弹窗拦截器拦截。
            // 解决方案：直接用 <a href target=_blank>，这是浏览器唯一不拦截的方式。
            const missavBtns = [
                { text: '🔍 Sukebei', color: '#17a2b8', url: `https://sukebei.nyaa.si/?f=0&c=0_0&q=${code}` },
                { text: '🎬 JavBus',  color: '#007bff',  url: Utils.getJavBusUrl(code) },
                { text: '📀 JavDB',   color: '#6f42c1',  url: `https://javdb.com/search?q=${code}` },
            ];
            missavBtns.forEach(({ text, color, url }) => {
                btnGroup.appendChild(Utils.createLinkBtn(text, color, url));
            });

            // 搜索菜单：主按钮也改为 <a>，子菜单同理
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

            // 预览图按钮：不涉及 window.open，用普通 handler 即可
            addPreviewBtn(code, btnGroup);

            // 适配 MissAV 深色主题
            btnGroup.style.cssText = `
                margin: 10px 0 6px 0;
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                align-items: center;
                position: relative;
                z-index: 9999;
            `;

            // 与 emby.js 共行由公共层统一处理，这里只负责插入自己的容器
            titleElem.insertAdjacentElement('afterend', btnGroup);
        } else {
            // 其他站点添加所有按钮（不再按单个功能判断）
            addNyaaBtn(code, btnGroup);
            addJavbusBtn(code, btnGroup);
            addJavdbBtn(code, btnGroup);
            addMissAVBtn(code, btnGroup);
            addSearchMenu(code, btnGroup);
            addPreviewBtn(code, btnGroup);

            // Emby 特殊处理
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

        // ── 公共层：与 emby.js 共行 ──────────────────────────────────────
        // 无论哪个站点分支，按钮组插入 DOM 后统一处理与 emby.js 的合并。
        // emby.js 侧已在 BaseProcessor.appendToSharedRow 里做了相同的镜像处理：
        //   • emby 先到 → emby 独立插入 .emby-button-group，jump 后到时检测并合并进去
        //   • jump 先到 → jump 插入 .jav-jump-btn-group，emby 后到时检测并追加进来
        // 这里处理"emby 比 jump 更早插入"的情况：
        const embyGroup = document.querySelector('.emby-button-group');
        if (embyGroup && btnGroup.isConnected) {
            // 先记录 jump 按钮数量，搬移后 childElementCount 会归零
            const jumpBtnCount = btnGroup.childElementCount;
            // emby 已独立插入，把 jump 的所有按钮搬进 emby 容器前面
            [...btnGroup.children].forEach(el => embyGroup.insertBefore(el, embyGroup.firstChild));
            // 在 jump 按钮（前 jumpBtnCount 个）与 emby 按钮之间加分隔线
            const sep = document.createElement('span');
            sep.style.cssText = 'display:inline-block;width:1px;height:16px;background:rgba(128,128,128,0.35);margin:0 4px;align-self:center;flex-shrink:0;';
            // children[jumpBtnCount] 正好是第一个 emby 按钮（或 null 表示末尾）
            embyGroup.insertBefore(sep, embyGroup.children[jumpBtnCount] || null);
            // 移除已清空的 jump 容器
            btnGroup.remove();
        }
    }

    // ============================ 管理面板模块 ============================
    function createSettingsPanel() {
        const existing = document.getElementById('jav-jump-settings-panel');
        if (existing) existing.remove();

        // ── 元数据 ─────────────────────────────────────────────────────────
        const SOURCE_META = {
            javfree:    { label: 'javfree.me',     color: '#2ecc71', emoji: '🟢', desc: '二次爬取，速度较快' },
            projectjav: { label: 'projectjav.com', color: '#f1c40f', emoji: '🟡', desc: '高清截图，两步请求' },
            javstore:   { label: 'javstore.net',   color: '#e74c3c', emoji: '🔴', desc: '兜底来源，成功率参差' },
        };
        const siteIcons = {
            sukebei:'🔵','169bbs':'🟠',supjav:'🟣',emby:'🎬',
            javbus:'🚌',javdb:'💿',javlibrary:'📚',javrate:'⭐',
            sehuatang:'🌺',hjd2048:'🔢',missav:'🌸',jable:'📺'
        };

        // ── 遮罩 ──────────────────────────────────────────────────────────
        const overlay = document.createElement('div');
        overlay.id = 'jav-jump-settings-overlay';
        overlay.style.cssText = `
            position:fixed;inset:0;
            background:rgba(15,15,20,.65);
            backdrop-filter:blur(6px);
            z-index:10000001;
            display:flex;justify-content:center;align-items:center;
            font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        `;
        overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

        // ── 面板 ──────────────────────────────────────────────────────────
        const panel = document.createElement('div');
        panel.id = 'jav-jump-settings-panel';
        panel.style.cssText = `
            background:#fff;border-radius:16px;
            width:min(700px,94vw);max-height:88vh;
            display:flex;flex-direction:column;
            box-shadow:0 24px 64px rgba(0,0,0,.28);overflow:hidden;
        `;

        // ── 内联样式表 ────────────────────────────────────────────────────
        const style = document.createElement('style');
        style.textContent = `
            #jav-jump-settings-panel *{box-sizing:border-box;}
            .jjs-header{display:flex;align-items:center;justify-content:space-between;
                padding:18px 24px 16px;border-bottom:1px solid #f0f0f0;flex-shrink:0;}
            .jjs-title{font-size:17px;font-weight:700;color:#1a1a2e;
                display:flex;align-items:center;gap:8px;}
            .jjs-title span{font-size:20px;}
            .jjs-close{width:30px;height:30px;border-radius:50%;border:none;
                background:#f0f0f0;color:#666;font-size:16px;cursor:pointer;
                display:flex;align-items:center;justify-content:center;transition:background .15s;}
            .jjs-close:hover{background:#e0e0e0;color:#333;}
            .jjs-body{padding:20px 24px;overflow-y:auto;flex:1;}
            .jjs-section-title{font-size:11px;font-weight:700;color:#9ca3af;
                letter-spacing:1px;text-transform:uppercase;margin:0 0 10px;padding-left:2px;}
            .jjs-card{background:#fafafa;border:1px solid #ebebeb;border-radius:12px;
                padding:16px;margin-bottom:16px;}
            .jjs-row{display:flex;align-items:center;justify-content:space-between;
                gap:16px;padding:10px 0;border-bottom:1px solid #f3f3f3;}
            .jjs-row:last-child{border-bottom:none;padding-bottom:0;}
            .jjs-row:first-child{padding-top:0;}
            .jjs-row-label{font-size:14px;color:#374151;font-weight:500;}
            .jjs-row-desc{font-size:12px;color:#9ca3af;margin-top:2px;}
            .jjs-select{padding:6px 10px;border-radius:8px;border:1px solid #d1d5db;
                background:#fff;font-size:13px;color:#374151;cursor:pointer;
                min-width:130px;outline:none;transition:border-color .15s;}
            .jjs-select:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.12);}
            .jjs-toggle{position:relative;display:inline-block;width:40px;height:22px;flex-shrink:0;}
            .jjs-toggle input{opacity:0;width:0;height:0;}
            .jjs-toggle-track{position:absolute;inset:0;border-radius:11px;
                background:#d1d5db;cursor:pointer;transition:background .2s;}
            .jjs-toggle input:checked + .jjs-toggle-track{background:#6366f1;}
            .jjs-toggle-track::before{content:'';position:absolute;width:16px;height:16px;
                border-radius:50%;background:#fff;top:3px;left:3px;
                transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.2);}
            .jjs-toggle input:checked + .jjs-toggle-track::before{transform:translateX(18px);}

            /* 拖拽排序列表 */
            .jjs-order-list{display:flex;flex-direction:column;gap:8px;margin-top:4px;}
            .jjs-order-item{
                display:flex;align-items:center;gap:10px;
                padding:10px 12px;border-radius:10px;
                border:1.5px solid #e5e7eb;background:#fff;
                cursor:grab;user-select:none;transition:box-shadow .15s,border-color .15s;
            }
            .jjs-order-item:active{cursor:grabbing;}
            .jjs-order-item.drag-over{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.15);}
            .jjs-order-item.dragging{opacity:.45;box-shadow:0 4px 16px rgba(0,0,0,.15);}
            .jjs-order-handle{font-size:16px;color:#c4c9d4;flex-shrink:0;line-height:1;}
            .jjs-order-num{
                width:20px;height:20px;border-radius:50%;
                background:#6366f1;color:#fff;
                font-size:11px;font-weight:700;
                display:flex;align-items:center;justify-content:center;flex-shrink:0;
            }
            .jjs-order-emoji{font-size:16px;flex-shrink:0;}
            .jjs-order-info{flex:1;}
            .jjs-order-name{font-size:13px;font-weight:600;color:#374151;}
            .jjs-order-desc{font-size:11px;color:#9ca3af;margin-top:1px;}
            .jjs-order-dot{
                width:8px;height:8px;border-radius:50%;flex-shrink:0;
            }

            /* 站点表格 */
            .jjs-sites-table{width:100%;border-collapse:separate;border-spacing:0;font-size:13px;}
            .jjs-sites-table thead th{padding:8px 12px;text-align:left;
                font-size:11px;font-weight:700;color:#9ca3af;
                letter-spacing:.8px;text-transform:uppercase;
                border-bottom:1px solid #ebebeb;}
            .jjs-sites-table thead th:last-child{text-align:center;}
            .jjs-sites-table tbody tr{transition:background .12s;}
            .jjs-sites-table tbody tr:hover{background:#f5f3ff;}
            .jjs-sites-table tbody td{padding:9px 12px;
                border-bottom:1px solid #f3f3f3;vertical-align:middle;}
            .jjs-sites-table tbody tr:last-child td{border-bottom:none;}
            .jjs-site-icon{font-size:15px;margin-right:7px;}
            .jjs-site-name{font-weight:500;color:#374151;}
            .jjs-site-toggle-cell{text-align:center;}
            .jjs-badge-on{display:inline-flex;align-items:center;gap:4px;
                padding:2px 8px;border-radius:20px;
                background:#eef2ff;color:#4f46e5;font-size:11px;font-weight:600;}
            .jjs-badge-off{display:inline-flex;align-items:center;gap:4px;
                padding:2px 8px;border-radius:20px;
                background:#f3f4f6;color:#9ca3af;font-size:11px;font-weight:600;}
            .jjs-badge-dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex-shrink:0;}
            .jjs-footer{display:flex;align-items:center;justify-content:flex-end;
                gap:10px;padding:14px 24px;border-top:1px solid #f0f0f0;flex-shrink:0;}
            .jjs-btn{padding:8px 20px;border-radius:8px;border:none;
                font-size:14px;font-weight:600;cursor:pointer;transition:all .15s;}
            .jjs-btn-cancel{background:#f3f4f6;color:#6b7280;}
            .jjs-btn-cancel:hover{background:#e5e7eb;}
            .jjs-btn-save{background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;
                box-shadow:0 2px 8px rgba(99,102,241,.35);}
            .jjs-btn-save:hover{box-shadow:0 4px 14px rgba(99,102,241,.45);transform:translateY(-1px);}
        `;
        panel.appendChild(style);

        // ── Header ────────────────────────────────────────────────────────
        const header = document.createElement('div');
        header.className = 'jjs-header';
        header.innerHTML = `<div class="jjs-title"><span>⚙️</span> 番号跳转设置</div>
            <button class="jjs-close" id="jjs-close-btn">✕</button>`;
        panel.appendChild(header);
        header.querySelector('#jjs-close-btn').onclick = () => overlay.remove();

        // ── Body ──────────────────────────────────────────────────────────
        const body = document.createElement('div');
        body.className = 'jjs-body';

        // —— 通用配置卡片 ——————————————————————————————————————————————————
        body.insertAdjacentHTML('beforeend', '<div class="jjs-section-title">通用配置</div>');
        const configCard = document.createElement('div');
        configCard.className = 'jjs-card';

        // 预览图缓存行
        const cacheRow = document.createElement('div');
        cacheRow.className = 'jjs-row';
        cacheRow.innerHTML = `<div>
            <div class="jjs-row-label">预览图缓存</div>
            <div class="jjs-row-desc">会话内缓存地址，减少重复请求</div>
        </div>`;
        const cacheToggle = document.createElement('label');
        cacheToggle.className = 'jjs-toggle';
        const cacheCheckbox = document.createElement('input');
        cacheCheckbox.type = 'checkbox';
        cacheCheckbox.id = 'preview-cache-checkbox';
        cacheCheckbox.checked = Settings.getPreviewCacheEnabled();
        const cacheTrack = document.createElement('span');
        cacheTrack.className = 'jjs-toggle-track';
        cacheToggle.appendChild(cacheCheckbox);
        cacheToggle.appendChild(cacheTrack);
        cacheRow.appendChild(cacheToggle);
        configCard.appendChild(cacheRow);

        // 默认搜索引擎行
        const engineRow = document.createElement('div');
        engineRow.className = 'jjs-row';
        engineRow.innerHTML = `<div>
            <div class="jjs-row-label">默认搜索引擎</div>
            <div class="jjs-row-desc">点击搜索按钮时默认使用的引擎</div>
        </div>`;
        const engineSelect = document.createElement('select');
        engineSelect.id = 'default-search-engine';
        engineSelect.className = 'jjs-select';
        SearchEngines.forEach((e, i) => {
            const opt = document.createElement('option');
            opt.value = i; opt.textContent = e.name;
            engineSelect.appendChild(opt);
        });
        engineSelect.value = GM_getValue('default_search_engine', 0);
        engineRow.appendChild(engineSelect);
        configCard.appendChild(engineRow);

        body.appendChild(configCard);

        // —— 预览图来源顺序卡片 ————————————————————————————————————————————
        body.insertAdjacentHTML('beforeend', '<div class="jjs-section-title">预览图来源顺序</div>');
        const orderCard = document.createElement('div');
        orderCard.className = 'jjs-card';
        orderCard.style.paddingBottom = '12px';

        const orderHint = document.createElement('div');
        orderHint.style.cssText = 'font-size:12px;color:#9ca3af;margin-bottom:12px;';
        orderHint.textContent = '拖拽 ⠿ 手柄调整顺序，依次尝试直到获取成功';
        orderCard.appendChild(orderHint);

        const orderList = document.createElement('div');
        orderList.className = 'jjs-order-list';
        orderList.id = 'jjs-order-list';

        // 当前顺序
        let currentOrder = Settings.getSourceOrder();
        Object.keys(SOURCE_META).forEach(src => {
            if (!currentOrder.includes(src)) currentOrder.push(src);
        });

        // 构建列表项
        function buildOrderItems() {
            orderList.innerHTML = '';
            currentOrder.forEach((src, idx) => {
                const meta = SOURCE_META[src] || { label: src, color: '#999', emoji: '⚪', desc: '' };
                const item = document.createElement('div');
                item.className = 'jjs-order-item';
                item.dataset.src = src;
                item.innerHTML = `
                    <span class="jjs-order-handle" style="cursor:grab;font-size:18px;color:#c4c9d4;padding:0 4px;flex-shrink:0;line-height:1;">⠿</span>
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

        // ── mouse-event 拖拽排序 ──────────────────────────────────────────
        // 完全不依赖 HTML5 drag API，在 Tampermonkey 沙箱中可靠运行
        let dragging = null;         // 正在拖动的真实 item 元素
        let ghost    = null;         // 跟随鼠标的幽灵副本
        let offsetX  = 0, offsetY = 0; // 鼠标在 item 内的偏移

        orderList.addEventListener('mousedown', e => {
            const handle = e.target.closest('.jjs-order-handle');
            if (!handle) return;
            e.preventDefault();

            dragging = handle.closest('.jjs-order-item');
            if (!dragging) return;

            const rect = dragging.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            // 幽灵元素：克隆当前 item，fixed 定位跟随鼠标
            ghost = dragging.cloneNode(true);
            ghost.style.cssText = `
                position:fixed;
                z-index:10000099;
                width:${rect.width}px;
                left:${rect.left}px;
                top:${rect.top}px;
                opacity:0.85;
                box-shadow:0 8px 24px rgba(0,0,0,0.18);
                border-color:#6366f1;
                background:#fff;
                pointer-events:none;
                border-radius:10px;
                border:1.5px solid #6366f1;
            `;
            document.body.appendChild(ghost);

            // 原始 item 半透明占位
            dragging.style.opacity = '0.3';
        });

        document.addEventListener('mousemove', e => {
            if (!ghost || !dragging) return;

            // 移动幽灵
            ghost.style.left = (e.clientX - offsetX) + 'px';
            ghost.style.top  = (e.clientY - offsetY) + 'px';

            // 清除所有高亮
            orderList.querySelectorAll('.jjs-order-item').forEach(el => el.classList.remove('drag-over'));

            // 找到鼠标正下方的目标 item（排除自身）
            ghost.style.display = 'none'; // 暂时隐藏幽灵，让 elementFromPoint 能穿透
            const elBelow = document.elementFromPoint(e.clientX, e.clientY);
            ghost.style.display = '';

            const target = elBelow?.closest('.jjs-order-item');
            if (target && target !== dragging) {
                target.classList.add('drag-over');
            }
        });

        document.addEventListener('mouseup', e => {
            if (!dragging || !ghost) return;

            // 找到释放位置的目标
            ghost.style.display = 'none';
            const elBelow = document.elementFromPoint(e.clientX, e.clientY);
            ghost.style.display = '';

            const target = elBelow?.closest('.jjs-order-item');

            if (target && target !== dragging && orderList.contains(target)) {
                // 判断方向：插到目标前还是后
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

            // 清理
            dragging.style.opacity = '';
            ghost.remove();
            orderList.querySelectorAll('.jjs-order-item').forEach(el => el.classList.remove('drag-over'));
            dragging = null;
            ghost    = null;
        });

        buildOrderItems();
        orderCard.appendChild(orderList);
        body.appendChild(orderCard);

        // —— 站点管理卡片 ——————————————————————————————————————————————————
        body.insertAdjacentHTML('beforeend', '<div class="jjs-section-title">站点管理</div>');
        const sitesCard = document.createElement('div');
        sitesCard.className = 'jjs-card';
        sitesCard.style.cssText = 'padding:0;overflow:hidden;';

        const table = document.createElement('table');
        table.className = 'jjs-sites-table';
        table.innerHTML = `<thead><tr>
            <th>站点</th>
            <th style="text-align:center;">状态</th>
            <th style="text-align:center;">开关</th>
        </tr></thead>`;

        const tbody = document.createElement('tbody');
        Sites.forEach(site => {
            const s = Settings.get(site.id);
            const defVal = Settings.defaults[site.id]?.enabled ?? true;
            const isOn = s.hasOwnProperty('enabled') ? s.enabled : defVal;
            const icon = siteIcons[site.id] || '🌐';

            const tr = document.createElement('tr');

            // 名称列
            const nameTd = document.createElement('td');
            nameTd.innerHTML = `<span class="jjs-site-icon">${icon}</span><span class="jjs-site-name">${site.name}</span>`;
            tr.appendChild(nameTd);

            // 状态徽章列
            const badgeTd = document.createElement('td');
            badgeTd.className = 'jjs-site-toggle-cell';
            const badge = document.createElement('span');
            badge.className = isOn ? 'jjs-badge-on' : 'jjs-badge-off';
            badge.innerHTML = `<span class="jjs-badge-dot"></span>${isOn ? '启用' : '停用'}`;
            badgeTd.appendChild(badge);
            tr.appendChild(badgeTd);

            // 开关列
            const toggleTd = document.createElement('td');
            toggleTd.className = 'jjs-site-toggle-cell';
            const lbl = document.createElement('label');
            lbl.className = 'jjs-toggle';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.dataset.site = site.id;
            cb.dataset.feature = 'enabled';
            cb.checked = isOn;
            const track = document.createElement('span');
            track.className = 'jjs-toggle-track';
            lbl.appendChild(cb); lbl.appendChild(track);
            toggleTd.appendChild(lbl);
            tr.appendChild(toggleTd);

            cb.addEventListener('change', () => {
                badge.className = cb.checked ? 'jjs-badge-on' : 'jjs-badge-off';
                badge.innerHTML = `<span class="jjs-badge-dot"></span>${cb.checked ? '启用' : '停用'}`;
            });

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        sitesCard.appendChild(table);
        body.appendChild(sitesCard);
        panel.appendChild(body);

        // ── Footer ────────────────────────────────────────────────────────
        const footer = document.createElement('div');
        footer.className = 'jjs-footer';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'jjs-btn jjs-btn-cancel';
        cancelBtn.textContent = '取消';
        cancelBtn.onclick = () => overlay.remove();

        const saveBtn = document.createElement('button');
        saveBtn.className = 'jjs-btn jjs-btn-save';
        saveBtn.textContent = '保存设置';
        saveBtn.onclick = () => {
            // 站点开关
            const newSettingsMap = {};
            panel.querySelectorAll('input[data-site]').forEach(cb => {
                const sid = cb.dataset.site, feat = cb.dataset.feature;
                if (!newSettingsMap[sid]) newSettingsMap[sid] = {};
                newSettingsMap[sid][feat] = cb.checked;
            });
            Object.keys(newSettingsMap).forEach(sid => Settings.set(sid, newSettingsMap[sid]));

            // 缓存 & 搜索引擎
            Settings.setPreviewCacheEnabled(cacheCheckbox.checked);
            Settings.setDefaultSearchEngine(parseInt(engineSelect.value));

            // 来源顺序
            Settings.setSourceOrder(currentOrder);

            overlay.remove();
            location.reload();
        };

        footer.appendChild(cancelBtn);
        footer.appendChild(saveBtn);
        panel.appendChild(footer);

        overlay.appendChild(panel);
        document.body.appendChild(overlay);
    }

    // ============================ 初始化 ============================
    const observer = new MutationObserver(() => {
        renderButtonsForCurrentPage();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    renderButtonsForCurrentPage();

    GM_registerMenuCommand('⚙️ 番号跳转设置', createSettingsPanel);
})();
