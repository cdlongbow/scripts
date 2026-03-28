// ==UserScript==
// @name         番号跳转加预览图
// @namespace    https://github.com/ZiPenOk
// @version      4.9.4
// @icon         https://javdb.com/favicon.ico
// @description  所有站点统一使用强番号逻辑 + JavBus 智能路径，表格开关，手动关闭，按钮统一在标题下方新行显示。新增 JavBus、JAVLibrary、JavDB、javrate , 增加javstore预览图来源, 并添加缓存控制选择。新增 MissAV 站点适配
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
// @match        *://missav.ws/*
// @match        *://missav.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @connect      *
// @updateURL    https://raw.githubusercontent.com/ZiPenOk/scripts/main/jav_jump.js
// @downloadURL  https://raw.githubusercontent.com/ZiPenOk/scripts/main/jav_jump.js
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
            img.src = imgUrl;
            img.onclick = (e) => {
                e.stopPropagation();
                img.classList.toggle('zoomed');
            };

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
                if (activeSource === 'javfree') {
                    javfreeBtn.classList.add('active');
                    javstoreBtn.classList.remove('active');
                } else if (activeSource === 'javstore') {
                    javstoreBtn.classList.add('active');
                    javfreeBtn.classList.remove('active');
                }
            };

            const javfreeBtn = createButton('javfree', '🟢', 'javfree', async (e) => {
                e.stopPropagation();
                const newUrl = await Thumbnail.javfree(code);
                if (newUrl) {
                    img.src = newUrl;
                    setActiveSource('javfree');
                } else {
                    alert('javfree 未找到预览图');
                }
            });

            const javstoreBtn = createButton('javstore', '🔴', 'javstore', async (e) => {
                e.stopPropagation();
                const newUrl = await Thumbnail.javstore(code);
                if (newUrl) {
                    img.src = newUrl;
                    setActiveSource('javstore');
                } else {
                    alert('javstore 未找到预览图');
                }
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
            else if (source === 'javstore') javstoreBtn.classList.add('active');

            toolbar.appendChild(javfreeBtn);
            toolbar.appendChild(javstoreBtn);
            toolbar.appendChild(newWindowBtn);
            toolbar.appendChild(downloadBtn);

            container.appendChild(img);
            container.appendChild(toolbar);

            // 定义关闭并恢复滚动条的函数
            const closeOverlay = () => {
                if (container.parentNode) {
                    container.remove();
                    // 恢复原始 overflow 值
                    document.documentElement.style.overflow = originalHtmlOverflow;
                    document.body.style.overflow = originalBodyOverflow;
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

                // 2. 提取详情页链接
                const candidateLinks = searchDoc.querySelectorAll('a[href*="/"]');
                let detailUrl = null;
                for (let link of candidateLinks) {
                    const href = link.getAttribute('href');
                    if (!href) continue;
                    if (href.startsWith('http') && !href.includes('javstore.net')) {
                        continue;
                    }
                    const fullUrl = href.startsWith('http') ? href : new URL(href, searchUrl).href;
                    const pathLastPart = fullUrl.split('/').pop() || '';
                    const normalizedPath = pathLastPart.toLowerCase().replace(/-/g, '');
                    if (normalizedPath.includes(normalizedCode)) {
                        detailUrl = fullUrl;
                        console.log(`javstore: matched detail page: ${detailUrl}`);
                        break;
                    }
                }

                if (!detailUrl) {
                    console.warn('javstore: no matching detail page found');
                    return null;
                }

                // 3. 获取详情页
                const detailHtml = await Utils.request(detailUrl);
                const detailDoc = new DOMParser().parseFromString(detailHtml, 'text/html');

                // 4. 查找预览图链接
                const allLinks = detailDoc.querySelectorAll('a');
                let previewLink = null;
                for (let link of allLinks) {
                    if (link.textContent.includes('CLICK HERE')) {
                        previewLink = link;
                        break;
                    }
                }

                if (previewLink) {
                    let imgUrl = previewLink.href;
                    console.log('javstore: found CLICK HERE link:', imgUrl);
                    if (imgUrl.startsWith('http:')) {
                        imgUrl = imgUrl.replace(/^http:/, 'https:');
                    }
                    return imgUrl;
                }

                // 备用方案：查找包含 _s.jpg 的图片，转为原图 URL
                const img = detailDoc.querySelector('img[src*="_s.jpg"]');
                if (img) {
                    let src = img.src;
                    if (!src.startsWith('http')) {
                        src = new URL(src, detailUrl).href;
                    }
                    const highRes = src.replace(/_s\.jpg$/, '_l.jpg') || src.replace('_s.jpg', '.jpg');
                    const secureUrl = highRes.replace(/^http:/, 'https:');
                    console.log('javstore: fallback to img src:', secureUrl);
                    return secureUrl;
                }

                console.warn('javstore: no preview image found');
                return null;
            } catch (e) {
                console.warn('javstore 获取失败', e);
                return null;
            }
        },

        // ========== 主入口：固定逻辑（优先 javfree，失败后 javstore） ==========
        async get(code) {
            const cacheEnabled = Settings.getPreviewCacheEnabled();
            let cacheKey;
            if (cacheEnabled) {
                cacheKey = `thumb_cache_${code}`;
                const cached = sessionStorage.getItem(cacheKey);
                if (cached) {
                    return { url: cached, source: null };
                }
            }

            console.log('尝试获取预览图：优先 javfree');
            let url = null;
            let source = null;

            try {
                // 先尝试 javfree
                url = await this.javfree(code);
                if (url) {
                    source = 'javfree';
                } else {
                    console.log('javfree 失败，尝试 javstore');
                    url = await this.javstore(code);
                    if (url) source = 'javstore';
                }

                console.log('最终结果:', url ? '有图' : '无图');
                if (url && cacheEnabled) {
                    sessionStorage.setItem(cacheKey, url);
                }
                return { url, source };
            } catch (error) {
                console.error('Error in Thumbnail.get:', error);
                return { url: null, source: null };
            }
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
            id: 'missav',
            name: 'MissAV',
            // 匹配番号详情页，如 /dm47/ipzz-385 或 /cn/ipzz-385 或直接 /ipzz-385
            match: (url) => /missav\.(ws|com)/.test(url) && /\/[a-z0-9-]+\/[a-z]{2,10}-\d+$|\/[a-z]{2,10}-\d+$/i.test(new URL(url).pathname),
            titleSelector: 'h1.text-nord6'
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

            // 与 emby.js 共行：若 emby 按钮组已存在则追加进去，否则插入自己的容器
            const existingEmbyGroup = document.querySelector('.emby-button-group');
            if (existingEmbyGroup) {
                // 将本组所有子元素移入 emby 容器
                [...btnGroup.children].forEach(el => existingEmbyGroup.appendChild(el));
            } else {
                // emby 还未渲染，先插入自己；emby 稍后会检测到 .jav-jump-btn-group 并追加
                titleElem.insertAdjacentElement('afterend', btnGroup);
            }
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
    }

    // ============================ 管理面板模块 ============================
    function createSettingsPanel() {
        const existing = document.getElementById('jav-jump-settings-panel');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'jav-jump-settings-overlay';
        overlay.style.cssText = `
            position:fixed;
            top:0; left:0; width:100%; height:100%;
            background:rgba(0,0,0,0.5);
            z-index:10000001;
            display:flex;
            justify-content:center;
            align-items:center;
        `;

        const panel = document.createElement('div');
        panel.id = 'jav-jump-settings-panel';
        panel.style.cssText = `
            background:#fff;
            color:#333;
            border-radius:8px;
            padding:20px 30px;
            max-width:950px;
            width:90%;
            max-height:80vh;
            overflow:auto;
            box-shadow:0 4px 20px rgba(0,0,0,0.3);
            font-family:Arial,sans-serif;
        `;

        panel.innerHTML = '<h2 style="margin-top:0; text-align:center;">⚙️ 番号跳转设置</h2>';

        // ----- 预览图设置行（只保留缓存开关）-----
        const rowDiv = document.createElement('div');
        rowDiv.style.cssText = `
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 30px;
            flex-wrap: nowrap;
            overflow-x: auto;
            white-space: nowrap;
            width: 100%;
            box-sizing: border-box;
            padding: 2px 5px;
        `;

        // 缓存开关块
        const cacheDiv = document.createElement('div');
        cacheDiv.style.cssText = 'display: flex; align-items: center; gap: 10px; flex-shrink: 0;';
        const cacheLabel = document.createElement('span');
        cacheLabel.style.fontWeight = 'bold';
        cacheLabel.textContent = '启用预览图缓存:';
        const cacheCheckbox = document.createElement('input');
        cacheCheckbox.type = 'checkbox';
        cacheCheckbox.id = 'preview-cache-checkbox';
        cacheCheckbox.className = 'mini-switch';
        cacheDiv.appendChild(cacheLabel);
        cacheDiv.appendChild(cacheCheckbox);

        rowDiv.appendChild(cacheDiv);
        panel.appendChild(rowDiv);

        // 设置当前值
        cacheCheckbox.checked = Settings.getPreviewCacheEnabled();

        //默认搜索引擎
        const searchEngineRow = document.createElement('div');
        searchEngineRow.style.cssText = `
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
        `;

        const engineLabel = document.createElement('span');
        engineLabel.style.fontWeight = 'bold';
        engineLabel.textContent = '默认搜索引擎:';

        const engineSelect = document.createElement('select');
        engineSelect.id = 'default-search-engine';
        engineSelect.style.cssText = 'padding: 5px; border-radius: 4px; min-width: 200px;';

        SearchEngines.forEach((engine, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = engine.name;
            engineSelect.appendChild(option);
        });

        // 设置当前值
        const currentDefault = GM_getValue('default_search_engine', 0);
        engineSelect.value = currentDefault;

        searchEngineRow.appendChild(engineLabel);
        searchEngineRow.appendChild(engineSelect);
        panel.insertBefore(searchEngineRow, panel.querySelector('style'));

        // ----- 表格样式 -----
        const style = document.createElement('style');
        style.textContent = `
            .toggle-switch {
                position: relative;
                display: inline-block;
                width: 50px;
                height: 24px;
            }
            .toggle-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            .toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #ccc;
                transition: .4s;
                border-radius: 24px;
            }
            .toggle-slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: .4s;
                border-radius: 50%;
            }
            input:checked + .toggle-slider {
                background-color: #2196F3;
            }
            input:checked + .toggle-slider:before {
                transform: translateX(26px);
            }
            .settings-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            .settings-table th {
                background-color: #f2f2f2;
                padding: 12px 8px;
                text-align: center;
                font-weight: bold;
                border: 1px solid #ddd;
            }
            .settings-table td {
                padding: 10px 8px;
                text-align: center;
                border: 1px solid #ddd;
            }
            .settings-table td:first-child {
                font-weight: bold;
                background-color: #f9f9f9;
            }
        `;
        panel.appendChild(style);

        // ----- 站点表格 -----
        const table = document.createElement('table');
        table.className = 'settings-table';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const siteTh = document.createElement('th'); siteTh.textContent = '站点'; headerRow.appendChild(siteTh);
        const features = Settings.getAllFeatures();
        features.forEach(feature => {
            const th = document.createElement('th');
            th.textContent = Settings.getFeatureName(feature);
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        Sites.forEach(site => {
            const row = document.createElement('tr');
            const siteCell = document.createElement('td');
            siteCell.textContent = site.name;
            row.appendChild(siteCell);

            const settings = Settings.get(site.id);

            features.forEach(feature => {
                const cell = document.createElement('td');
                const label = document.createElement('label');
                label.className = 'toggle-switch';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.dataset.site = site.id;
                checkbox.dataset.feature = feature;
                const defaultValue = Settings.defaults[site.id] ? Settings.defaults[site.id][feature] : true;
                checkbox.checked = settings.hasOwnProperty(feature) ? settings[feature] : defaultValue;

                const slider = document.createElement('span');
                slider.className = 'toggle-slider';

                label.appendChild(checkbox);
                label.appendChild(slider);
                cell.appendChild(label);
                row.appendChild(cell);
            });

            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        panel.appendChild(table);

        // ----- 按钮 -----
        const btnDiv = document.createElement('div');
        btnDiv.style.display = 'flex';
        btnDiv.style.justifyContent = 'center';
        btnDiv.style.gap = '20px';
        btnDiv.style.marginTop = '20px';

        const saveBtn = document.createElement('button');
        saveBtn.textContent = '保存设置';
        saveBtn.style.cssText = 'padding:8px 20px;background:#28a745;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:16px;';
        saveBtn.onmouseover = () => saveBtn.style.background = '#218838';
        saveBtn.onmouseout = () => saveBtn.style.background = '#28a745';
        saveBtn.onclick = () => {
            // 保存每个站点的开关
            const checkboxes = panel.querySelectorAll('input[type="checkbox"]');
            const newSettingsMap = {};
            checkboxes.forEach(cb => {
                if (!cb.dataset.site) return; // 过滤掉预览图缓存开关
                const siteId = cb.dataset.site;
                const feature = cb.dataset.feature;
                if (!newSettingsMap[siteId]) newSettingsMap[siteId] = {};
                newSettingsMap[siteId][feature] = cb.checked;
            });

            // 保存预览图缓存设置
            const cacheEnabled = document.getElementById('preview-cache-checkbox').checked;
            Settings.setPreviewCacheEnabled(cacheEnabled);

            // 保存默认搜索引擎
            const selectedEngine = document.getElementById('default-search-engine').value;
            Settings.setDefaultSearchEngine(parseInt(selectedEngine));

            Object.keys(newSettingsMap).forEach(siteId => {
                Settings.set(siteId, newSettingsMap[siteId]);
            });

            overlay.remove();
            location.reload();
        };

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.style.cssText = 'padding:8px 20px;background:#6c757d;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:16px;';
        cancelBtn.onmouseover = () => cancelBtn.style.background = '#5a6268';
        cancelBtn.onmouseout = () => cancelBtn.style.background = '#6c757d';
        cancelBtn.onclick = () => overlay.remove();

        btnDiv.appendChild(saveBtn);
        btnDiv.appendChild(cancelBtn);
        panel.appendChild(btnDiv);

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
