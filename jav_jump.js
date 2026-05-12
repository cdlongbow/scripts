// ==UserScript==
// @name         番号跳转加预览图
// @namespace    https://github.com/ZiPenOk
// @version      5.4.3
// @icon         https://javdb.com/favicon.ico
// @description  所有站点统一使用强番号逻辑 + JavBus 智能路径，表格开关，手动关闭，按钮统一在标题下方新行显示。新增 JavBus、JAVLibrary、JavDB、javrate , 增加javstore预览图来源, 并添加缓存控制选择。新增 MissAV 站点适配。增加ProjectJav预览图来源。新增预告片影院式播放。
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
// @downloadURL  https://github.com/ZiPenOk/scripts/raw/refs/heads/main/jav_jump.js
// @updateURL    https://github.com/ZiPenOk/scripts/raw/refs/heads/main/jav_jump.js
// ==/UserScript==
 
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
 
                let detailPath = allMovieLinks.find(a => /\/movie\/.+-\d+$/.test(a.getAttribute('href') || ''))?.getAttribute('href')
                    || allMovieLinks[0].getAttribute('href');
                console.log('[projectjav] 选中链接:', detailPath);
 
                const detailUrl = detailPath.startsWith('http') ? detailPath : `https://projectjav.com${detailPath}`;
                console.log('[projectjav] 步骤2 详情页:', detailUrl);
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
            // 截断多余的尾部数字段，如 JUR-664-30000 → JUR-664
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
            const cached = sessionStorage.getItem(this.cacheKey(id));
            if (cached) {
                try {
                    const cachedResult = JSON.parse(cached);
                    if (cachedResult?.url) return cachedResult;
                } catch {
                }
                sessionStorage.removeItem(this.cacheKey(id));
            }
 
            const resolvers = [
                this.fromDirectSamples,
                this.fromFc2Hub,
                this.fromDmmApi,
                this.fromCurrentPage,
                this.fromJavbus,
                this.fromDmmHeuristic,
                this.fromJavSpyl
            ];
 
            for (const resolver of resolvers) {
                try {
                    const result = await resolver.call(this, id);
                    if (result?.url) {
                        sessionStorage.setItem(this.cacheKey(id), JSON.stringify(result));
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
 
        async fromDmmHeuristic(id) {
            if (!/^[A-Z]{2,10}-\d{2,6}$/i.test(id) || /^FC2-/i.test(id)) return null;
            const urlParts = this.buildDmmUrlParts(id);
            const urls = urlParts.flatMap(part => this.dmmUrlsFromPart(part));
            const url = await this.firstWorkingUrl(urls, 10);
            return url ? this.result(url, 'DMM 通用预告') : null;
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
 
        buildDmmUrlParts(id) {
            const [corpRaw, numRaw] = id.toLowerCase().split('-');
            const numPlain = (numRaw || '').replace(/^0+(?=\d)/, '');
            if (!corpRaw || !numPlain) return [];
 
            const n3 = numPlain.padStart(3, '0');
            const n5 = numPlain.padStart(5, '0');
            const cidPrefixes = [
                '',
                '1', '118', '84', '53', '55', '57', '13',
                'h_086', 'h_237', 'h_1133', 'h_491'
            ];
            const parts = [];
 
            cidPrefixes.forEach(prefix => {
                parts.push(`${prefix}${corpRaw}${n3}`);
                parts.push(`${prefix}${corpRaw}${n5}`);
            });
            return [...new Set(parts)];
        }
    };
 
    const Settings = {
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
 
        const settings = Settings.get(site.id);
 
        if (!settings.enabled) return;
 
        const btnGroup = document.createElement('div');
        btnGroup.className = 'jav-jump-btn-group';
 
        if (site.id === 'javlibrary') {
            addNyaaBtn(code, btnGroup);
            addJavbusBtn(code, btnGroup);
            addJavdbBtn(code, btnGroup);
            addMissAVBtn(code, btnGroup);
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
 
    function createSettingsPanel() {
        const existing = document.getElementById('jav-jump-settings-panel');
        if (existing) existing.remove();
 
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
 
        const panel = document.createElement('div');
        panel.id = 'jav-jump-settings-panel';
        panel.style.cssText = `
            background:#fff;border-radius:16px;
            width:min(700px,94vw);max-height:88vh;
            display:flex;flex-direction:column;
            box-shadow:0 24px 64px rgba(0,0,0,.28);overflow:hidden;
        `;
 
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
 
        const header = document.createElement('div');
        header.className = 'jjs-header';
        header.innerHTML = `<div class="jjs-title"><span>⚙️</span> 番号跳转设置</div>
            <button class="jjs-close" id="jjs-close-btn">✕</button>`;
        panel.appendChild(header);
        header.querySelector('#jjs-close-btn').onclick = () => overlay.remove();
 
        const body = document.createElement('div');
        body.className = 'jjs-body';
 
        body.insertAdjacentHTML('beforeend', '<div class="jjs-section-title">通用配置</div>');
        const configCard = document.createElement('div');
        configCard.className = 'jjs-card';
 
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
 
        let currentOrder = Settings.getSourceOrder();
        Object.keys(SOURCE_META).forEach(src => {
            if (!currentOrder.includes(src)) currentOrder.push(src);
        });
 
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
 
        let dragging = null;
        let ghost    = null;
        let offsetX  = 0, offsetY = 0;
 
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
            ghost    = null;
        });
 
        buildOrderItems();
        orderCard.appendChild(orderList);
        body.appendChild(orderCard);
 
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
 
            const nameTd = document.createElement('td');
            nameTd.innerHTML = `<span class="jjs-site-icon">${icon}</span><span class="jjs-site-name">${site.name}</span>`;
            tr.appendChild(nameTd);
 
            const badgeTd = document.createElement('td');
            badgeTd.className = 'jjs-site-toggle-cell';
            const badge = document.createElement('span');
            badge.className = isOn ? 'jjs-badge-on' : 'jjs-badge-off';
            badge.innerHTML = `<span class="jjs-badge-dot"></span>${isOn ? '启用' : '停用'}`;
            badgeTd.appendChild(badge);
            tr.appendChild(badgeTd);
 
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
            const newSettingsMap = {};
            panel.querySelectorAll('input[data-site]').forEach(cb => {
                const sid = cb.dataset.site, feat = cb.dataset.feature;
                if (!newSettingsMap[sid]) newSettingsMap[sid] = {};
                newSettingsMap[sid][feat] = cb.checked;
            });
            Object.keys(newSettingsMap).forEach(sid => Settings.set(sid, newSettingsMap[sid]));
 
            Settings.setPreviewCacheEnabled(cacheCheckbox.checked);
            Settings.setDefaultSearchEngine(parseInt(engineSelect.value));
 
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
 
    const observer = new MutationObserver(() => {
        renderButtonsForCurrentPage();
    });
    observer.observe(document.body, { childList: true, subtree: true });
 
    renderButtonsForCurrentPage();
 
    GM_registerMenuCommand('⚙️ 番号跳转设置', createSettingsPanel);
})();
