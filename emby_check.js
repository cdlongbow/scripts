// ==UserScript==
// @name         跳转到Emby播放(改)
// @namespace    https://github.com/ZiPenOk
// @version      5.5.5
// @description  👆👆👆在 ✅JavBus✅Javdb✅Sehuatang ✅supjav ✅Sukebei ✅madou ✅javrate ✅ 169bbs 高亮emby存在的视频，并提供标注一键跳转功能
// @author       ZiPenOk
// @match        *://www.javbus.com/*
// @match        *://javdb*.com/v/*
// @match        *://javdb*.com/search?q=*
// @match        *://www.javdb.com/*
// @match        *://javdb.com/*
// @match        *://supjav.com/*
// @match        *://sehuatang.net/*
// @match        *://sukebei.nyaa.si/view/*
// @match        *://sukebei.nyaa.si/*
// @match        *://www.javlibrary.com/*/*
// @match        *://madou.com/archives/*
// @match        *://*.madou.com/archives/*
// @match        *://javrate.com/*
// @match        *://*.javrate.com/*
// @match        *://169bbs.com/*
// @match        *://*169bbs*.*/*
// @match        *://hjd2048.com/2048/*
// @match        *://missav.ws/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @run-at       document-start
// @license      MIT
// @supportURL   https://github.com/ZiPenOk/scripts/issues
// @homepageURL  https://github.com/ZiPenOk/scripts
// @icon         https://img.icons8.com/fluency/96/emby.png
// @updateURL    https://raw.githubusercontent.com/ZiPenOk/scripts/main/emby_check.js
// @downloadURL  https://raw.githubusercontent.com/ZiPenOk/scripts/main/emby_check.js
// ==/UserScript==

(function () {
    'use strict';

    // 全局配置对象（多服务器版）—— 新增 darkMode 配置
    const Config = {
        // 服务器列表
        get embyServers() {
            return GM_getValue('embyServers', []);
        },
        set embyServers(val) {
            GM_setValue('embyServers', val);
        },
        // 当前活动服务器索引
        get activeServerIndex() {
            return GM_getValue('activeServerIndex', 0);
        },
        set activeServerIndex(val) {
            GM_setValue('activeServerIndex', val);
        },

        // 兼容原有单服务器属性（从当前活动服务器读取）
        get embyBaseUrl() {
            const servers = this.embyServers;
            if (servers.length > 0 && this.activeServerIndex < servers.length) {
                return servers[this.activeServerIndex].baseUrl;
            }
            return '';
        },
        get embyAPI() {
            const servers = this.embyServers;
            if (servers.length > 0 && this.activeServerIndex < servers.length) {
                return servers[this.activeServerIndex].apiKey;
            }
            return '';
        },
        // 设置时更新当前活动服务器
        set embyBaseUrl(val) {
            let servers = this.embyServers;
            if (servers.length === 0) {
                servers = [{ name: '默认服务器', baseUrl: val, apiKey: '' }];
                this.embyServers = servers;
                this.activeServerIndex = 0;
            } else if (this.activeServerIndex < servers.length) {
                servers[this.activeServerIndex].baseUrl = val;
                this.embyServers = servers;
            }
        },
        set embyAPI(val) {
            let servers = this.embyServers;
            if (servers.length === 0) {
                servers = [{ name: '默认服务器', baseUrl: '', apiKey: val }];
                this.embyServers = servers;
                this.activeServerIndex = 0;
            } else if (this.activeServerIndex < servers.length) {
                servers[this.activeServerIndex].apiKey = val;
                this.embyServers = servers;
            }
        },

        // 徽章相关配置
        get highlightColor() {
            return GM_getValue('highlightColor', '#52b54b');
        },
        get maxConcurrentRequests() {
            return GM_getValue('maxConcurrentRequests', 50);
        },
        get badgeColor() {
            return GM_getValue('badgeColor', '#2ecc71');
        },
        get badgeTextColor() {
            return GM_getValue('badgeTextColor', '#fff');
        },
        get badgeSize() {
            return GM_getValue('badgeSize', 'medium');
        },
        get enabledSites() {
            const saved = GM_getValue('enabledSites', {});
            const defaults = {
                javbus: { list: true, detail: true },
                javdb: { list: true, detail: true },
                supjav: { list: true, detail: true },
                sehuatang: { list: false, detail: true },
                sukebei: { list: true, detail: true },
                javlibrary: { list: true, detail: true },
                madou: { list: false, detail: true },
                javrate: { list: false, detail: true },
                '169bbs': { list: true, detail: true },
                'hjd2048': { list: true, detail: true },
                'missav': { list: true, detail: true }
            };
            for (let site in defaults) {
                if (!(site in saved)) {
                    saved[site] = defaults[site];
                }
            }
            return saved;
        },
        // ===== 新增深色模式配置 =====
        get darkMode() {
            return GM_getValue('darkMode', false);
        },
        set darkMode(val) {
            GM_setValue('darkMode', val);
        },

        // Setters
        set highlightColor(val) { GM_setValue('highlightColor', val); },
        set maxConcurrentRequests(val) { GM_setValue('maxConcurrentRequests', val); },
        set badgeColor(val) { GM_setValue('badgeColor', val); },
        set badgeTextColor(val) { GM_setValue('badgeTextColor', val); },
        set badgeSize(val) { GM_setValue('badgeSize', val); },
        set enabledSites(val) { GM_setValue('enabledSites', val); },

        // 迁移旧数据（如果存在）
        _migrateOldConfig() {
            const oldBaseUrl = GM_getValue('embyBaseUrl', '');
            const oldApiKey = GM_getValue('embyAPI', '');
            const servers = this.embyServers;
            if ((oldBaseUrl || oldApiKey) && servers.length === 0) {
                this.embyServers = [{
                    name: '默认服务器',
                    baseUrl: oldBaseUrl,
                    apiKey: oldApiKey
                }];
                this.activeServerIndex = 0;
            }
        },

        isValid() {
            const servers = this.embyServers;
            return servers.length > 0 &&
                   this.activeServerIndex < servers.length &&
                   !!servers[this.activeServerIndex].baseUrl &&
                   !!servers[this.activeServerIndex].apiKey;
        }
    };

    // 立即执行迁移
    Config._migrateOldConfig();

    // 获取徽章尺寸样式
    function getBadgeSizeStyle() {
        switch (Config.badgeSize) {
            case 'small':
                return { fontSize: '10px', padding: '1px 4px' };
            case 'large':
                return { fontSize: '14px', padding: '3px 7px' };
            case 'medium':
            default:
                return { fontSize: '12px', padding: '2px 5px' };
        }
    }

    // 初始化 DOM 样式
    const badgeSize = getBadgeSizeStyle();

    GM_addStyle(`
        :root {
            --primary: #52b54b;
            --success: #28a745;
            --danger: #dc3545;
            --border: #d9e1e8;
            --bg-light: #eef2f5;
            --text-dark: #1e2a3a;
        }

        /* 设置面板基础定位 */
        .emby-jump-settings-panel {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%,-50%);
            z-index: 10000;
            display: none;
        }

        /* 状态指示器 */
        .emby-jump-status-indicator {
            position: fixed; bottom: 20px; right: 20px;
            background: rgba(0,0,0,0.7); color: white;
            padding: 8px 12px; border-radius: 4px; font-size: 14px;
            z-index: 9999; transition: opacity 0.3s;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2); max-width: 300px;
            display: flex; align-items: center; opacity: 0;
        }
        .emby-jump-status-indicator .progress {
            display: inline-block; margin-left: 10px;
            width: 100px; height: 6px; background: rgba(255,255,255,0.3);
            border-radius: 3px;
        }
        .emby-jump-status-indicator .progress-bar {
            height: 100%; background: var(--primary); border-radius: 3px;
            transition: width 0.3s;
        }
        .emby-jump-status-indicator.success { background-color: rgba(40,167,69,0.9) !important; }
        .emby-jump-status-indicator.error { background-color: rgba(220,53,69,0.9) !important; }
        .emby-jump-status-indicator .close-btn { margin-left: 10px; cursor: pointer; font-size: 16px; font-weight: bold; }

        /* 徽章样式 */
        .emby-badge {
            position: absolute; top: 5px; right: 5px;
            color: ${Config.badgeTextColor}; padding: ${badgeSize.padding}; font-size: ${badgeSize.fontSize};
            font-weight: bold; z-index: 10; border: 2px solid transparent; border-radius: 4px;
            background-origin: border-box; background-clip: padding-box, border-box;
            background-image: linear-gradient(${Config.badgeColor} 0 0), linear-gradient(50deg,#ff0000,#ff7f00,#ffff00,#00ff00,#0000ff,#4b0082,#8b00ff);
        }
        .emby-badge:hover {
            color: #000;
            background-image: linear-gradient(#fff 0 0), linear-gradient(50deg,#ff0000,#ff7f00,#ffff00,#00ff00,#0000ff,#4b0082,#8b00ff);
        }
        .emby-highlight { outline: 4px solid ${Config.highlightColor} !important; position: relative; }
        .emby-exists {
            font-weight: bold !important;
            border-left: 4px solid var(--success);
            padding-left: 4px;
            opacity: 0;
            animation: embyFadeIn 0.2s ease forwards;
        }
        .emby-exists:link {
            color: var(--success) !important;
        }
        @keyframes embyFadeIn { to { opacity: 1; } }

        /* 现代化设置面板 */
        .emby-jump-settings-panel.modern {
            font-family: system-ui, sans-serif;
            background: var(--bg-light); border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            padding: 0; width: 900px; max-width: 95vw; overflow: hidden;
        }
        .modern .settings-header,
        .modern .settings-footer {
            background: #ffffffd9; backdrop-filter: blur(4px); border-bottom: 1px solid #d0d7dd;
        }
        .modern .settings-header {
            display: flex; justify-content: space-between; align-items: center;
            padding: 16px 20px;
        }
        .modern .settings-header h3 { margin: 0; font-size: 22px; font-weight: 600; color: var(--text-dark); }
        .modern .settings-header .close-btn {
            background: none; border: none; font-size: 26px; cursor: pointer; color: #6c7a8a; line-height: 1;
        }
        .modern .settings-content {
            padding: 20px; max-height: 70vh; overflow-y: auto;
            display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
            align-items: stretch;
        }
        .modern .left-column, .modern .right-column { display: flex; flex-direction: column; gap: 16px; }
        .modern .left-column .settings-card:last-child { flex: 1; }
        .modern .right-column { flex: 1; }
        .modern .right-column .settings-card { flex: 1; display: flex; flex-direction: column; }
        .modern .right-column .settings-card .card-body { flex: 1; }
        .modern .settings-card {
            background: #ffffffde; backdrop-filter: blur(2px); border-radius: 12px; padding: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.04); border: 1px solid var(--border);
        }
        .modern .card-title {
            font-weight: 600; margin-bottom: 12px; color: #2c3e50;
            display: flex; align-items: center; gap: 6px; font-size: 18px;
        }
        .modern .card-title.collapsible {
            cursor: pointer; user-select: none; justify-content: space-between; margin-bottom: 0;
        }
        .modern .card-body.two-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .modern .field { display: flex; flex-direction: column; gap: 4px; }
        .modern .field label { font-size: 16px; font-weight: 500; color: #4a5a6e; }
        .modern .field input, .modern .field select {
            padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px;
            font-size: 16px; transition: border-color 0.15s; box-sizing: border-box; background: #fff;
        }
        .modern .field input:focus, .modern .field select:focus {
            outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(82,181,75,0.15);
        }
        .modern .field small { font-size: 14px; color: #7c8b9c; }
        .modern .color-field { display: flex; flex-direction: row; align-items: center; gap: 10px; }
        .modern .color-field label { width: 70px; flex-shrink: 0; font-size: 16px; }
        .modern .color-field input[type="color"] {
            width: 60px; height: 36px; padding: 2px; border-radius: 6px; border: 1px solid #cbd5e1;
        }
        .modern .test-btn {
            background: #e2e8f0; border: 1px solid #b9c7d9; border-radius: 30px;
            padding: 8px 16px; font-size: 15px; cursor: pointer; color: #1e293b;
        }
        .modern .test-btn:hover { background: #d1dbe8; }

        /* 服务器管理表格 */
        .modern .servers-table { width: 100%; margin-top: 8px; }
        .modern .servers-table-header,
        .modern .server-row { display: flex; padding: 8px 12px; border-bottom: 1px solid var(--border); }
        .modern .servers-table-header {
            font-weight: 600; background-color: #e6edf5; border-bottom-width: 2px; border-bottom-color: #b9c7d9;
        }
        .modern .servers-table-header > div:first-child { flex: 2; }
        .modern .servers-table-header > div:last-child { flex: 1; text-align: center; }
        .modern .server-row { align-items: center; }
        .modern .server-info { flex: 2; display: flex; flex-direction: column; gap: 4px; }
        .modern .server-name { font-weight: 500; color: #1e293b; font-size: 16px; }
        .modern .server-url { font-size: 14px; color: #5a6f88; word-break: break-all; }
        .modern .server-api { font-size: 14px; color: #5a6f88; font-family: monospace; }
        .modern .server-actions { flex: 1; display: flex; justify-content: center; gap: 8px; }
        .modern .server-btn {
            background: none; border: none; font-size: 1.2rem; cursor: pointer;
            padding: 4px; border-radius: 4px; line-height: 1;
        }
        .modern .server-btn:hover:not(:disabled) { background-color: #d9e1e8; }
        .modern .server-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .modern .active-badge { font-size: 1.2rem; color: var(--primary); padding: 4px; }
        .modern .btn.secondary {
            background: #e2e8f0; color: #1e293b; border: 1px solid #b9c7d9;
            padding: 8px 16px; border-radius: 30px; font-weight: 500; cursor: pointer; font-size: 15px;
        }
        .modern .btn.secondary:hover { background: #d1dbe8; }

        /* 滑动开关 */
        .modern .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .modern .switch input { opacity: 0; width: 0; height: 0; }
        .modern .slider {
            position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
            background-color: #b9c7d9; transition: .2s; border-radius: 24px;
        }
        .modern .slider:before {
            content: ""; position: absolute; height: 20px; width: 20px; left: 2px; bottom: 2px;
            background-color: white; transition: .2s; border-radius: 50%;
        }
        .modern input:checked + .slider { background-color: var(--primary); }
        .modern input:checked + .slider:before { transform: translateX(20px); }

        /* 站点开关表头 */
        .modern .sites-header-fixed,
        .modern .sites-row-flex { display: flex; padding: 8px 12px; border-bottom: 1px solid var(--border); align-items: center; }
        .modern .sites-header-fixed {
            background-color: #e6edf5; border-bottom-width: 2px; border-bottom-color: #b9c7d9; font-weight: 600;
        }
        .modern .sites-header-fixed > div,
        .modern .sites-row-flex > div { flex: 1; }
        .modern .sites-header-fixed > div:nth-child(2),
        .modern .sites-header-fixed > div:nth-child(3),
        .modern .sites-row-flex > div:nth-child(2),
        .modern .sites-row-flex > div:nth-child(3) { text-align: center; }
        .modern .sites-row-flex { padding: 10px 12px; }

        .modern .settings-footer {
            padding: 16px 20px; background: #ffffffd9; backdrop-filter: blur(4px);
            border-top: 1px solid #d0d7dd; display: flex; justify-content: space-between;
            align-items: center; gap: 12px;
        }
        .modern .btn {
            padding: 8px 20px; border-radius: 30px; border: none;
            font-weight: 500; cursor: pointer; font-size: 15px;
        }
        .modern .btn.cancel { background: #e2e8f0; color: #1e293b; border: 1px solid #b9c7d9; }
        .modern .btn.save { background: var(--primary); color: white; }
        .modern .btn.save:hover { background: #3e9e37; }

        /* 深色模式切换 */
        .modern .dark-mode-toggle { font-size: 26px; cursor: pointer; line-height: 1; padding: 0 4px; user-select: none; transition: transform 0.2s; }
        .modern .dark-mode-toggle:hover { transform: scale(1.1); }

        /* 深色模式（仅覆盖颜色） */
        .emby-jump-settings-panel.modern.dark-mode,
        .modern.dark-mode .settings-header,
        .modern.dark-mode .settings-footer,
        .modern.dark-mode .settings-card,
        .modern.dark-mode .servers-table-header,
        .modern.dark-mode .server-row,
        .modern.dark-mode .sites-header-fixed,
        .modern.dark-mode .sites-row-flex {
            background: #242435; border-color: #3a3a50; color: #c0c0d0;
        }
        .modern.dark-mode .settings-header h3 { color: #fff; }
        .modern.dark-mode .card-title { color: #d0d0e0; }
        .modern.dark-mode .field label { color: #b0b0c0; }
        .modern.dark-mode .field input,
        .modern.dark-mode .field select { background: #1e1e30; border-color: #4a4a60; color: #e0e0f0; }
        .modern.dark-mode .field input:focus { border-color: var(--primary); }
        .modern.dark-mode .server-url,
        .modern.dark-mode .server-api { color: #a0a0b8; }
        .modern.dark-mode .server-btn:hover:not(:disabled) { background: #3a3a50; }
        .modern.dark-mode .btn.secondary,
        .modern.dark-mode .test-btn { background: #2e2e42; border-color: #5a5a78; color: #ddd; }
        .modern.dark-mode .btn.secondary:hover,
        .modern.dark-mode .test-btn:hover { background: #3e3e58; }
        .modern.dark-mode .btn.cancel { background: #3a3a50; color: #ddd; border-color: #5a5a78; }
        .modern.dark-mode .btn.save { background: #3e9e37; }
        .modern.dark-mode .close-btn { color: #aaa; }

        /* JAVLibrary 列表页高亮 */
        .video.emby-highlight { position: relative !important; background: linear-gradient(to bottom, rgba(82,181,75,0.12) 0%, rgba(82,181,75,0.04) 100%) !important; transition: background 0.25s ease !important; }
        /* 伪元素负责内光晕，不画边框线 */
        .video.emby-highlight::before { content: ''; position: absolute; inset: 0; pointer-events: none; box-shadow: inset 0 0 6px 2px rgba(82,181,75,0.5); border-radius: 4px; z-index: 1; opacity: 0.7; }
        /* 悬停加强（光晕更明显） */
        .video.emby-highlight:hover::before { box-shadow: inset 0 0 12px 4px rgba(82,181,75,0.8); }
        .video.emby-highlight:hover { background: linear-gradient(to bottom, rgba(82,181,75,0.18) 0%, rgba(82,181,75,0.08) 100%) !important; }
        /* 防偏移 */
        .videothumblist .videos .video:first-child.emby-highlight { transform: translateY(0) !important; margin-top: 0 !important; }
        /* 标题和 ID 变色 */
        .emby-title-exists, .emby-id-exists { color: #4CAF50 !important; font-weight: 700 !important; text-shadow: 0 0 3px rgba(76,175,80,0.6) !important; }

        /* 统一按钮系统 */
        .emby-btn {
            display: inline-flex; align-items: center; justify-content: center;
            border-radius: 6px; font-weight: 600; cursor: pointer;
            line-height: 1; box-sizing: border-box; white-space: nowrap;
            transition: all .18s ease; vertical-align: middle;
            text-decoration: none !important;
            border: none; user-select: none;
        }
        .emby-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 10px rgba(0,0,0,.25);
            text-decoration: none !important;
        }
        .emby-btn:visited {
            color: inherit !important;
            background: inherit !important;
        }
        .emby-btn-small { font-size: 11px; padding: 3px 8px; }
        .emby-btn-medium { font-size: 13px; padding: 6px 10px; }
        .emby-btn-large { font-size: 15px; padding: 6px 14px; }
        .emby-btn-jump { background: ${Config.highlightColor}; color: #fff; }
        .emby-btn-jump:visited { background: ${Config.highlightColor} !important; color: #fff !important; }
        .emby-btn-copy { background: linear-gradient(135deg,#667eea,#764ba2); color: #fff; }
        .emby-btn-copy:visited { background: linear-gradient(135deg,#667eea,#764ba2) !important; color: #fff !important; }
        .emby-button-group { display: inline-flex; align-items: center; gap: 6px; margin-left: 8px; }
        }

        /* Sukebei 列表页标题栏按钮布局 */
        .sukebei-list-td {
            display: flex !important;
            align-items: center !important;
            white-space: nowrap !important;
            overflow: visible !important;
        }
        .sukebei-list-td a:first-child {
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1 1 auto;
            min-width: 0;
        }
        .sukebei-list-td .emby-btn-jump {
            flex-shrink: 0;
            margin-left: 8px;
        }

        /* MissAV 列表页高亮 */
        .missav .thumbnail.group.emby-highlight {
            outline: 4px solid ${Config.highlightColor} !important;
            outline-offset: -4px !important;
            border-radius: 12px !important;
            background: rgba(82,181,75,0.08) !important;
        }
    `);

    // 单例状态指示器
    const Status = (() => {
        let el, bar, timeout;

        const debounce = (fn, ms) => {
            let timer;
            return (...args) => {
                clearTimeout(timer);
                timer = setTimeout(() => fn(...args), ms);
            };
        };

        const createUI = () => {
            if (el) return;
            el = document.createElement('div');
            el.className = 'emby-jump-status-indicator';
            el.innerHTML = `
                <span class="status-text">准备中...</span>
                <span class="close-btn">&times;</span>
            `;
            document.body.appendChild(el);
            bar = el.querySelector('.progress-bar');
            el.querySelector('.close-btn').addEventListener('click', hide);
        };

        const show = (msg, type = '') => {
            createUI();
            if (timeout) clearTimeout(timeout);
            el.classList.remove('success', 'error');
            if (type) el.classList.add(type);

            el.querySelector('.status-text').textContent = msg;
            el.style.opacity = '1';
        };

        const hide = () => {
            if (!el) return;
            el.style.opacity = '0';
            timeout = setTimeout(() => {
                if (el && el.parentNode) el.parentNode.removeChild(el);
                el = bar = null;
            }, 300);
        };

        const updateProgress = (current, total) => {
            const percent = Math.min(Math.round((current / total) * 100), 100);
            if (bar) bar.style.width = `${percent}%`;
            show(`查询中: ${current}/${total} (${percent}%)`);
        };

        return {
            show,
            success: (msg, autoHide) => {
                show(msg, 'success');
                if (autoHide) setTimeout(hide, 5000);
            },
            error: (msg, autoHide) => {
                show(msg, 'error');
                if (autoHide) setTimeout(hide, 5000);
            },
            hide
        };
    })();

    // 统一提示管理
    const Prompt = {
        queryStart(code) { Status.show(`⏳ 查询番号 ${code} 中...`); },
        querySuccess(code) { Status.success(`✅ Emby 找到匹配项: ${code}`, true); },
        queryNotFound(code) { Status.error(`❌ Emby未找到匹配项: ${code}`, true); },
        queryError(code, errMsg) { Status.error(`❌ Emby查询失败: ${errMsg}`, true); },
        batchStart(count) { Status.show(`⏳ 正在查询 ${count} 个番号...`); },
        batchComplete(foundCount) { Status.success(`✅ Emby查询完成，找到 ${foundCount} 项`, true); }
    };

    // 统一番号提取规则（从文本中提取）
    function extractCodeFromText(text) {
        if (!text) return null;

        const patterns = [
            /FC2[-\s_]?(?:PPV)?[-\s_]?(\d{6,9})/i,
            /([A-Z]{2,15})-(\d{2,10})(?:-(\d+))?/i,
            /([A-Z]{2,15})-([A-Z]{0,2}\d{2,10})/i,
            /^[A-Z0-9]+[-_](\d{6}[-_]\d{2,3})/i,
            /(\d{6}[-_]\d{2,3})[-_][A-Z0-9]+$/i,
            /(?<!\w)(\d{6}[-_]\d{2,3})(?!\w)/,
            /([A-Z]{1,2})(\d{3,4})/i
        ];

        for (let i = 0; i < patterns.length; i++) {
            const match = text.match(patterns[i]);
            if (match) {
                if (i === 0) { // FC2
                    return `FC2-PPV-${match[1]}`;
                } else if (i === 1) {
                    return match[3] ? `${match[1]}-${match[2]}-${match[3]}` : `${match[1]}-${match[2]}`;
                } else if (i === 2) {
                    return match[0];
                } else if (i === 3 || i === 4) {
                    return match[1];
                } else if (i === 5) {
                    return match[1];
                } else if (i === 6) {
                    return match[0];
                }
            }
        }
        return null;
    }

    // 设置面板 - 多服务器版（新增深色模式切换）
    const SettingsUI = {
        show() {
            let panel = document.getElementById('emby-jump-settings-panel');
            if (panel) {
                panel.style.display = 'block';
                return;
            }

            panel = document.createElement('div');
            panel.id = 'emby-jump-settings-panel';
            panel.className = 'emby-jump-settings-panel modern';
            // 根据保存的深色模式设置初始类
            if (Config.darkMode) {
                panel.classList.add('dark-mode');
            }

            // 读取当前配置
            const currentConfig = {
                embyServers: Config.embyServers,
                activeServerIndex: Config.activeServerIndex,
                highlightColor: Config.highlightColor,
                maxConcurrentRequests: Config.maxConcurrentRequests,
                badgeSize: Config.badgeSize,
                badgeColor: Config.badgeColor,
                badgeTextColor: Config.badgeTextColor,
                enabledSites: Config.enabledSites,
                darkMode: Config.darkMode
            };
            const initialServers = JSON.parse(JSON.stringify(Config.embyServers));
            const initialActiveIndex = Config.activeServerIndex;
            const initialSites = JSON.parse(JSON.stringify(Config.enabledSites));

            // 生成服务器列表HTML
            function generateServersHTML() {
                const servers = Config.embyServers;
                if (!servers || servers.length === 0) {
                    return '<div style="padding: 12px; text-align: center; color: #999;">暂无服务器，请添加</div>';
                }
                let rows = '';
                servers.forEach((server, index) => {
                    const isActive = index === Config.activeServerIndex;
                    rows += `
                        <div class="server-row" data-index="${index}">
                            <div class="server-info">
                                <span class="server-name">${server.name || '未命名'}</span>
                                <span class="server-url">${server.baseUrl}</span>
                                <span class="server-api">${server.apiKey ? '••••••' + server.apiKey.slice(-4) : '未设置'}</span>
                            </div>
                            <div class="server-actions">
                                ${!isActive ? '<button class="server-btn set-active" title="设为默认">⭐</button>' : '<span class="active-badge" title="当前默认">✅</span>'}
                                <button class="server-btn edit-server" title="编辑">✏️</button>
                                <button class="server-btn delete-server" title="删除" ${servers.length === 1 ? 'disabled' : ''}>🗑️</button>
                            </div>
                        </div>
                    `;
                });
                return rows;
            }

            // 图标显示：深色模式开启时显示☀️（点击切回浅色），关闭时显示🌙（点击切深色）
            const darkModeIcon = Config.darkMode ? '☀️' : '🌙';
            const darkModeTitle = Config.darkMode ? '切换浅色模式' : '切换深色模式';

            const sitesHeaderHTML = `
                <div class="sites-header-fixed">
                    <div>站点</div>
                    <div>列表页</div>
                    <div>详情页</div>
                </div>
            `;

            function generateSitesRows() {
                const sites = currentConfig.enabledSites;
                let rows = '';
                for (const site in sites) {
                    rows += `
                        <div class="sites-row-flex">
                            <div class="site-name">${site}</div>
                            <div class="site-toggle">
                                <label class="switch">
                                    <input type="checkbox" data-site="${site}" data-type="list" ${sites[site].list ? 'checked' : ''}>
                                    <span class="slider round"></span>
                                </label>
                            </div>
                            <div class="site-toggle">
                                <label class="switch">
                                    <input type="checkbox" data-site="${site}" data-type="detail" ${sites[site].detail ? 'checked' : ''}>
                                    <span class="slider round"></span>
                                </label>
                            </div>
                        </div>
                    `;
                }
                return rows;
            }

            panel.innerHTML = `
                <div class="settings-header">
                    <h3><span class="icon">⚙️</span> Emby 设置</h3>
                    <span class="close-btn">&times;</span>
                </div>
                <div class="settings-content">
                    <!-- 服务器管理卡片（跨列，默认折叠） -->
                    <div class="settings-card" style="grid-column: 1 / -1;">
                        <div class="card-title collapsible" id="servers-toggle-header">
                            <span>🖥️ 服务器管理</span>
                            <span class="toggle-icon" id="servers-toggle-icon">▶</span>
                        </div>
                        <div class="card-body" id="servers-grid" style="display: none;">
                            <div class="servers-table">
                                <div class="servers-table-header">
                                    <div>服务器列表</div>
                                    <div>操作</div>
                                </div>
                                <div id="servers-list-container">
                                    ${generateServersHTML()}
                                </div>
                            </div>
                            <div style="margin-top: 12px; display: flex; gap: 8px; align-items: center;">
                                <button class="btn secondary" id="add-server-btn">➕ 添加服务器</button>
                                <span style="flex:1;"></span>
                                <button class="test-btn" id="test-connection" type="button">测试当前连接</button>
                                <span id="test-result" style="font-size: 0.9rem;"></span>
                            </div>
                        </div>
                    </div>

                    <!-- 左列 -->
                    <div class="left-column">
                        <!-- 外观设置卡片 -->
                        <div class="settings-card">
                            <div class="card-title">🎨 外观设置</div>
                            <div class="card-body two-columns">
                                <div class="field color-field">
                                    <label for="highlight-color">高亮颜色</label>
                                    <input type="color" id="highlight-color" value="${currentConfig.highlightColor}">
                                </div>
                                <div class="field color-field">
                                    <label for="badge-color">徽章背景</label>
                                    <input type="color" id="badge-color" value="${currentConfig.badgeColor}">
                                </div>
                                <div class="field color-field">
                                    <label for="badge-text-color">徽章文字颜色</label>
                                    <input type="color" id="badge-text-color" value="${currentConfig.badgeTextColor}">
                                </div>
                                <div class="field color-field">
                                    <label for="badge-size">徽章大小</label>
                                    <select id="badge-size">
                                        <option value="small" ${currentConfig.badgeSize === 'small' ? 'selected' : ''}>小</option>
                                        <option value="medium" ${currentConfig.badgeSize === 'medium' ? 'selected' : ''}>中</option>
                                        <option value="large" ${currentConfig.badgeSize === 'large' ? 'selected' : ''}>大</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- 高级选项卡片 -->
                        <div class="settings-card">
                            <div class="card-title">⚡ 高级选项</div>
                            <div class="card-body">
                                <div class="field">
                                    <label for="max-requests">最大并发请求数</label>
                                    <input type="number" id="max-requests" min="1" max="100" value="${currentConfig.maxConcurrentRequests}">
                                    <small>建议 20-50</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 右列 -->
                    <div class="right-column">
                        <!-- 站点开关卡片（表头固定，内容滚动） -->
                        <div class="settings-card">
                            <div class="card-title">🌐 站点开关</div>
                            ${sitesHeaderHTML}
                            <div class="card-body" id="sites-grid" style="max-height: 300px; overflow-y: auto; padding: 0;">
                                ${generateSitesRows()}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="settings-footer">
                    <!-- 左侧：深色模式切换图标 -->
                    <div class="dark-mode-toggle" id="dark-mode-toggle" title="${darkModeTitle}">${darkModeIcon}</div>
                    <!-- 右侧：按钮组 -->
                    <div>
                        <button class="btn cancel">取消</button>
                        <button class="btn save">保存</button>
                    </div>
                </div>
                <div id="save-message" style="display:none; position:absolute; bottom:20px; left:50%; transform:translateX(-50%); background:#52b54b; color:white; padding:8px 16px; border-radius:4px; z-index:10001; font-size:14px; box-shadow:0 2px 8px rgba(0,0,0,0.2);"></div>
            `;

            document.body.appendChild(panel);

            // 服务器卡片折叠/展开功能
            const serversHeader = panel.querySelector('#servers-toggle-header');
            const serversGrid = panel.querySelector('#servers-grid');
            const serversIcon = panel.querySelector('#servers-toggle-icon');
            let serversVisible = false; // 默认折叠

            serversHeader.addEventListener('click', () => {
                if (serversVisible) {
                    serversGrid.style.display = 'none';
                    serversIcon.textContent = '▶';
                } else {
                    serversGrid.style.display = 'block';
                    serversIcon.textContent = '▼';
                }
                serversVisible = !serversVisible;
            });

            // 服务器管理功能
            const serversListContainer = panel.querySelector('#servers-list-container');

            function refreshServersList() {
                serversListContainer.innerHTML = generateServersHTML();
                attachServerEvents();
            }

            function attachServerEvents() {
                // 设为默认
                panel.querySelectorAll('.set-active').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const row = e.target.closest('.server-row');
                        const index = parseInt(row.dataset.index);
                        Config.activeServerIndex = index;
                        refreshServersList();
                    });
                });

                // 编辑服务器
                panel.querySelectorAll('.edit-server').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const row = e.target.closest('.server-row');
                        const index = parseInt(row.dataset.index);
                        const servers = Config.embyServers;
                        const server = servers[index];
                        const newName = prompt('请输入服务器名称', server.name || '');
                        if (newName === null) return;
                        const newUrl = prompt('请输入服务器地址 (以/结尾)', server.baseUrl);
                        if (newUrl === null) return;
                        const newApi = prompt('请输入API密钥', server.apiKey);
                        if (newApi === null) return;

                        servers[index] = {
                            name: newName.trim() || '未命名',
                            baseUrl: newUrl.trim(),
                            apiKey: newApi.trim()
                        };
                        Config.embyServers = servers;
                        refreshServersList();
                    });
                });

                // 删除服务器
                panel.querySelectorAll('.delete-server').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        if (btn.disabled) return;
                        const row = e.target.closest('.server-row');
                        const index = parseInt(row.dataset.index);
                        const servers = Config.embyServers;
                        if (servers.length <= 1) {
                            alert('至少保留一个服务器');
                            return;
                        }
                        if (!confirm(`确定删除服务器 "${servers[index].name}" 吗？`)) return;
                        servers.splice(index, 1);
                        if (Config.activeServerIndex === index) {
                            Config.activeServerIndex = 0;
                        } else if (Config.activeServerIndex > index) {
                            Config.activeServerIndex--;
                        }
                        Config.embyServers = servers;
                        refreshServersList();
                    });
                });
            }

            panel.querySelector('#add-server-btn').addEventListener('click', () => {
                const name = prompt('请输入服务器名称', '新服务器');
                if (!name) return;
                const url = prompt('请输入服务器地址 (以/结尾)', 'http://');
                if (!url) return;
                const api = prompt('请输入API密钥', '');
                if (api === null) return;

                const servers = Config.embyServers;
                servers.push({
                    name: name.trim(),
                    baseUrl: url.trim(),
                    apiKey: api.trim()
                });
                Config.embyServers = servers;
                refreshServersList();
            });

            attachServerEvents();

            // 测试连接按钮
            panel.querySelector('#test-connection').addEventListener('click', async () => {
                const url = Config.embyBaseUrl;
                const apiKey = Config.embyAPI;
                const testResultSpan = panel.querySelector('#test-result');

                testResultSpan.textContent = '';
                if (!url || !apiKey) {
                    testResultSpan.textContent = '❌ 当前服务器配置不完整';
                    testResultSpan.style.color = '#dc3545';
                    return;
                }

                const testBtn = panel.querySelector('#test-connection');
                testBtn.disabled = true;
                testResultSpan.textContent = '⏳ 测试中...';
                testResultSpan.style.color = '#6c757d';

                try {
                    const response = await new Promise((resolve, reject) => {
                        GM_xmlhttpRequest({
                            method: 'GET',
                            url: `${url}emby/System/Info?api_key=${apiKey}`,
                            timeout: 5000,
                            onload: (res) => {
                                if (res.status >= 200 && res.status < 300) {
                                    resolve(res);
                                } else {
                                    reject(new Error(`HTTP ${res.status}`));
                                }
                            },
                            onerror: () => reject(new Error('网络错误')),
                            ontimeout: () => reject(new Error('请求超时'))
                        });
                    });

                    let serverName = 'Emby服务器';
                    try {
                        const data = JSON.parse(response.responseText);
                        if (data.ServerName) serverName = data.ServerName;
                    } catch (e) {}

                    testResultSpan.textContent = `✅ 连接成功 (${serverName})`;
                    testResultSpan.style.color = '#28a745';
                } catch (error) {
                    testResultSpan.textContent = `❌ 连接失败: ${error.message}`;
                    testResultSpan.style.color = '#dc3545';
                } finally {
                    testBtn.disabled = false;
                }
            });

            // ===== 深色模式切换逻辑 =====
            const darkModeToggle = panel.querySelector('#dark-mode-toggle');
            darkModeToggle.addEventListener('click', () => {
                const isDark = panel.classList.contains('dark-mode');
                if (isDark) {
                    panel.classList.remove('dark-mode');
                    darkModeToggle.textContent = '🌙';
                    Config.darkMode = false;
                    darkModeToggle.title = '切换深色模式';   // 切换后为浅色，提示可切回深色
                } else {
                    panel.classList.add('dark-mode');
                    darkModeToggle.textContent = '☀️';
                    Config.darkMode = true;
                    darkModeToggle.title = '切换浅色模式';   // 切换后为深色，提示可切回浅色
                }
            });

            // 关闭面板
            const closePanel = () => {
                panel.style.display = 'none';
            };
            panel.querySelector('.close-btn').addEventListener('click', closePanel);
            panel.querySelector('.btn.cancel').addEventListener('click', closePanel);

            // 保存设置
            panel.querySelector('.btn.save').addEventListener('click', () => {
                // 保存外观设置
                Config.highlightColor = document.getElementById('highlight-color').value;
                Config.maxConcurrentRequests = parseInt(document.getElementById('max-requests').value, 10);
                Config.badgeSize = document.getElementById('badge-size').value;
                Config.badgeColor = document.getElementById('badge-color').value;
                Config.badgeTextColor = document.getElementById('badge-text-color').value;

                // 收集站点开关新状态
                const updatedSites = { ...Config.enabledSites };
                panel.querySelectorAll('[data-site]').forEach(input => {
                    const site = input.dataset.site;
                    const type = input.dataset.type;
                    if (!updatedSites[site]) {
                        updatedSites[site] = { list: false, detail: false };
                    }
                    updatedSites[site][type] = input.checked;
                });
                Config.enabledSites = updatedSites;

                // 显示保存成功消息
                const msgEl = document.getElementById('save-message');
                if (msgEl) {
                    msgEl.textContent = '✅ 设置已保存';
                    msgEl.style.display = 'block';
                }

                // 判断是否需要刷新
                const serversChanged = JSON.stringify(initialServers) !== JSON.stringify(Config.embyServers) ||
                                       initialActiveIndex !== Config.activeServerIndex;
                const currentSite = detectSite();
                const siteChanged = currentSite && (
                    (initialSites[currentSite]?.list !== updatedSites[currentSite]?.list) ||
                    (initialSites[currentSite]?.detail !== updatedSites[currentSite]?.detail)
                );

                if (serversChanged || siteChanged) {
                    // 有相关变化，刷新页面
                    setTimeout(() => location.reload(), 300);
                } else {
                    // 无变化，仅显示消息后关闭面板
                    setTimeout(() => {
                        if (msgEl) msgEl.style.display = 'none';
                        panel.style.display = 'none'; // 关闭面板
                    }, 1500);
                }
            });

            panel.style.display = 'block';
        }
    };

    /* ========= Emby 查询缓存 ========= */
    const EmbyCache = {
        KEY: 'emby_query_cache_v1',
        TTL: 7 * 24 * 60 * 60 * 1000, // 7天

        load() {
            return GM_getValue(this.KEY, {});
        },

        save(data) {
            GM_setValue(this.KEY, data);
        },

        get(code) {
            const cache = this.load();
            return cache[code] || null;
        },

        set(code, item) {
            const cache = this.load();
            cache[code] = {
                itemId: item.Id,
                serverId: item.ServerId,
                time: Date.now()
            };
            this.save(cache);
        },

        remove(code) {
            const cache = this.load();
            delete cache[code];
            this.save(cache);
        },

        clear() {
            GM_setValue(this.KEY, {});
        },

        isExpired(entry) {
            return Date.now() - entry.time > this.TTL;
        }
    };

    // 复制工具函数
    function copyToClipboard(text, element) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showCopySuccess(element);
            }).catch(() => {
                fallbackCopyTextToClipboard(text, element);
            });
        } else {
            fallbackCopyTextToClipboard(text, element);
        }
    }

    function showCopySuccess(element) {
        const originalText = element.innerHTML;
        const originalBg = element.style.background;

        element.innerHTML = '✓ 已复制到剪切板';
        element.style.background = 'linear-gradient(135deg, #52b54b 0%, #3d9142 100%)';

        setTimeout(() => {
            element.innerHTML = originalText;
            element.style.background = originalBg;
        }, 1500);
    }

    function fallbackCopyTextToClipboard(text, element) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.cssText = 'position: fixed; top: 0; left: 0; width: 2em; height: 2em; padding: 0; border: none; outline: none; box-shadow: none; background: transparent;';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            if (document.execCommand('copy')) {
                showCopySuccess(element);
            }
        } catch (err) {
            console.error('复制失败:', err);
        }
        document.body.removeChild(textArea);
    }

    // Emby API 和请求控制
    class EmbyAPI {
        constructor() {
            this.active = 0;
            this.waiting = [];
            this.total = 0;
            this.completed = 0;
        }

        getBtnSizeClass() {
            switch (Config.badgeSize) {
                case 'small': return 'emby-btn-small';
                case 'large': return 'emby-btn-large';
                default: return 'emby-btn-medium';
            }
        }

        async fetchData(code) {
            if (!code) return { Items: [] };

            const clean = code.trim().toUpperCase();

            // 自动降级搜索：MDSR-0005-2 → 先搜自己 → 再搜 MDSR-0005
            const tryCodes = [clean];
            const mainMatch = clean.match(/^([A-Z]+-\d+)/);
            if (mainMatch && mainMatch[1] !== clean) {
                tryCodes.push(mainMatch[1]);
            }

            // 先查缓存
            for (const c of tryCodes) {
                const cached = EmbyCache.get(c);
                if (cached && !EmbyCache.isExpired(cached)) {
                    try {
                        const checkUrl =
                            `${Config.embyBaseUrl}emby/Items/${cached.itemId}?api_key=${Config.embyAPI}`;
                        const res = await this.request(checkUrl);
                        const item = JSON.parse(res.responseText);
                        return { Items: [item], _searchCode: c, _fromCache: true };
                    } catch {
                        EmbyCache.remove(c);
                    }
                }
            }

            // 正式搜索
            for (const c of tryCodes) {
                try {
                    const url =
                        `${Config.embyBaseUrl}emby/Users/${Config.embyAPI}/Items`
                        + `?api_key=${Config.embyAPI}`
                        + `&Recursive=true&IncludeItemTypes=Movie`
                        + `&SearchTerm=${encodeURIComponent(c)}`
                        + `&Fields=Name,Id,ServerId`;

                    const response = await this.request(url);
                    const data = JSON.parse(response.responseText);
                    data._searchCode = c;

                    if (data.Items?.length) {
                        const best = this.findBestMatch(data.Items, c);
                        if (best) EmbyCache.set(c, best);
                        return data;
                    }
                } catch (e) {
                    console.error(`Emby 查询失败 ${c}`, e);
                }
            }

            return { Items: [] };
        }

        /*** 检查指定番号在 Emby 中是否存在，返回最佳匹配项（或 null）*/
        async checkExists(code) {
            if (!code) return null;

            const clean = code.trim().toUpperCase();

            let tryCodes = [clean];

            // 处理 FC2 变体
            const fc2PPVMatch = clean.match(/^FC2-PPV-(\d+)$/i);
            const fc2Match = clean.match(/^FC2-(\d+)$/i);
            if (fc2PPVMatch) {
                tryCodes.push(`FC2-${fc2PPVMatch[1]}`);
            } else if (fc2Match) {
                tryCodes.push(`FC2-PPV-${fc2Match[1]}`);
            }

            // 标准番号降级（如 IPZZ-777-2 -> IPZZ-777）
            const mainMatch = clean.match(/^([A-Z]+-\d+)/);
            if (mainMatch && mainMatch[1] !== clean) {
                tryCodes.push(mainMatch[1]);
            }

            // 如果原始番号是纯数字核心（即提取后的结果），只生成无分隔符版本作为备选（保留原始分隔符）
            const pureDigitMatch = clean.match(/^\d{6}[-_]\d{2,3}$/);
            if (pureDigitMatch) {
                // 原始格式已在 tryCodes 中，只需添加无分隔符版本
                tryCodes.push(clean.replace(/[-_]/, ''));
            }

            // 如果原始番号带厂商后缀，提取纯数字核心（使用原始分隔符）作为备选
            const suffixDigitMatch = clean.match(/^(\d{6})([-_])(\d{2,3})[-_][A-Z0-9]+$/i);
            if (suffixDigitMatch) {
                const base = `${suffixDigitMatch[1]}${suffixDigitMatch[2]}${suffixDigitMatch[3]}`; // 保留原始分隔符
                tryCodes.push(base);
                tryCodes.push(base.replace(/[-_]/, '')); // 无分隔符版本
            }

            // 去重
            tryCodes = [...new Set(tryCodes)];

            // 先查缓存
            for (const c of tryCodes) {
                const cached = EmbyCache.get(c);
                if (cached && !EmbyCache.isExpired(cached)) {
                    try {
                        const checkUrl = `${Config.embyBaseUrl}emby/Items/${cached.itemId}?api_key=${Config.embyAPI}`;
                        const res = await this.request(checkUrl);
                        const item = JSON.parse(res.responseText);
                        return item;
                    } catch {
                        EmbyCache.remove(c);
                    }
                }
            }

            // 执行搜索
            for (let i = 0; i < tryCodes.length; i++) {
                const c = tryCodes[i];
                try {
                    const url = `${Config.embyBaseUrl}emby/Users/${Config.embyAPI}/Items` +
                        `?api_key=${Config.embyAPI}` +
                        `&Recursive=true&IncludeItemTypes=Movie` +
                        `&SearchTerm=${encodeURIComponent(c)}` +
                        `&Fields=Name,Id,ServerId`;

                    const response = await this.request(url);
                    const data = JSON.parse(response.responseText);
                    const items = data.Items || [];

                    if (items.length) {
                        const best = this.findBestMatch(items, c, code);
                        if (best) {
                            EmbyCache.set(c, best);
                            return best;
                        }
                    }
                } catch (e) {
                    console.error(`Emby 查询失败 ${c}`, e);
                    // 仅当这是第一个尝试的番号（原始番号）时，显示错误提示
                    if (i === 0) {
                        Prompt.queryError(code, e.message);
                    }
                }
            }

            return null;
        }

        async batchQuery(codes) {
            if (!codes || codes.length === 0) return [];

            this.total = codes.length;
            this.completed = 0;
            this.active = 0;
            this.waiting = [];

            const results = new Array(this.total);

            return new Promise(resolve => {
                const checkComplete = () => {
                    if (this.completed >= this.total && this.active === 0) {
                        const found = results.filter(r => r !== null).length;
                        Prompt.batchComplete(found);
                        resolve(results);
                    }
                };

                const processRequest = (index) => {
                    const code = codes[index];
                    this.active++;

                    this.checkExists(code).then(best => {
                        results[index] = best;
                        this.active--;
                        this.completed++;

                        if (this.waiting.length > 0) processRequest(this.waiting.shift());
                        checkComplete();
                    }).catch(() => {
                        results[index] = null;
                        this.active--;
                        this.completed++;

                        if (this.waiting.length > 0) processRequest(this.waiting.shift());
                        checkComplete();
                    });
                };

                for (let i = 0; i < this.total; i++) {
                    if (this.active < Config.maxConcurrentRequests) processRequest(i);
                    else this.waiting.push(i);
                }
            });
        }

        request(url) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url,
                    headers: { accept: "application/json" },
                    timeout: 10000,
                    onload: res =>
                        res.status >= 200 && res.status < 300
                            ? resolve(res)
                            : reject(new Error(`HTTP 错误: ${res.status}`)),
                    onerror: () => reject(new Error("请求错误")),
                    ontimeout: () => reject(new Error("请求超时"))
                });
            });
        }

        createLink(item) {
            if (!item) return null;

            const embyUrl = `${Config.embyBaseUrl}web/index.html#!/item?id=${item.Id}&serverId=${item.ServerId}`;

            const link = document.createElement('a');
            link.href = embyUrl;
            link.target = '_blank';
            link.className = `emby-btn emby-btn-jump ${this.getBtnSizeClass()}`;
            link.textContent = '🎬 跳转到Emby';

            return link;
        }

        createCopyButton(code) {
            if (!code) return null;

            const btn = document.createElement('span');
            btn.className = `emby-btn emby-btn-copy ${this.getBtnSizeClass()}`;
            btn.textContent = `📀 ${code}`;

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                copyToClipboard(code, btn);
            });

            return btn;
        }

        createBadge(item) {
            if (!item) return null;

            const embyUrl = `${Config.embyBaseUrl}web/index.html#!/item?id=${item.Id}&serverId=${item.ServerId}`;

            const el = document.createElement('a');
            el.className = 'emby-badge';
            el.href = embyUrl;
            el.target = '_blank';
            el.textContent = 'Emby';
            return el;
        }

        findBestMatch(items, queryCode, originalCode) {
            if (!items || items.length === 0) return null;

            const target = queryCode.trim().toUpperCase();
            const targetClean = target.replace(/[-_]/g, '');           // SNOS180
            const mainTarget = target.replace(/-\d+$/, '');            // SNOS（去掉末尾数字段，仅用于前缀判断）
            const cleanStr = s => (s || '').toUpperCase().replace(/[-_]/g, '');
            const targetAlphaNum = target.replace(/[^A-Z0-9]/g, '');   // SNOS180
            const targetPrefix = target.split(/[-_\s]/)[0];            // SNOS

            // 从番号中提取数字部分（SNOS-180 → 180），用于精确数字验证
            const targetNumPart = target.match(/(\d+)$/)?.[1] || '';

            // 判断原始番号是否带厂商后缀
            const hasSuffix = /^\d{6}[-_]\d{2,3}[-_][A-Z0-9]+$/i.test(originalCode);
            let originalSuffix = null;
            if (hasSuffix) {
                originalSuffix = originalCode.replace(/^\d{6}[-_]\d{2,3}[-_]/, '').toUpperCase();
            }

            let best = null;
            let bestScore = 0;

            for (const it of items) {
                const name = (it.Name || '').toUpperCase();
                const nameClean = cleanStr(name);                       // 去掉所有 -_
                const nameAlphaNum = name.replace(/[^A-Z0-9]/g, '');
                const namePrefix = name.split(/[-_\s]/)[0];

                let nameSuffix = null;
                if (/^\d{6}[-_]\d{2,3}[-_][A-Z0-9]+$/i.test(name)) {
                    nameSuffix = name.replace(/^\d{6}[-_]\d{2,3}[-_]/, '').toUpperCase();
                }

                let score = 0;

                const normalizedName = name.replace(/_/g, '-');
                const normalizedTarget = target.replace(/_/g, '-');

                if (name === target) score = 100;
                else if (nameClean === targetClean) score = 95;
                // 只有当分隔符相同时，才允许忽略分隔符差异的包含匹配
                else if (normalizedName.includes(normalizedTarget) && target.includes('_') === name.includes('_')) score = 92;
                else if (name === mainTarget) score = 90;
                else if (nameClean === cleanStr(mainTarget)) score = 88;
                // score 85/80：必须包含完整的 targetClean（含数字部分），仅前缀相同不够
                // 防止 SNOS-097 因标题含"180天"而误匹配 SNOS-180
                else if (normalizedName.includes(normalizedTarget) && targetPrefix === namePrefix) score = 85;
                else if (nameClean.includes(targetClean) && targetPrefix === namePrefix) score = 80;
                else if (nameAlphaNum === targetAlphaNum) score = 75;

                // 如果分数为75（宽松匹配），检查分隔符是否一致，若不一致则降分
                if (score === 75 && queryCode === originalCode) {
                    const targetHasUnderscore = target.includes('_');
                    const nameHasUnderscore = name.includes('_');
                    if (targetHasUnderscore !== nameHasUnderscore) {
                        score = 60;
                    }
                }

                // 如果原始番号带后缀，且名称中也包含一个不同的后缀，则降分
                if (hasSuffix && score > 0 && nameSuffix && nameSuffix !== originalSuffix) {
                    score = 50;
                }

                // 额外保护：对于有数字部分的番号，验证 name 里确实含有该番号的完整字母+数字组合
                // 防止标题内容中恰好包含番号数字的情况（如 SNOS-097 标题含"180天"误匹配 SNOS-180）
                if (score >= 75 && score < 95 && targetNumPart) {
                    // 要求 nameClean 中包含 targetClean（完整番号字母+数字），而不仅仅是前缀
                    if (!nameClean.includes(targetClean)) {
                        score = 0;
                    }
                }

                if (score > bestScore) {
                    bestScore = score;
                    best = it;
                }
            }

            return bestScore >= 75 ? best : null;
        }
    }

    const BaseProcessor = {
        init(api) {
            this.api = api;
            this.processed = new WeakSet();
            return this;
        },

        // 公共方法：将 Emby 按钮插入到与 jump.js 共享的行容器。
        // 若 .jav-jump-btn-group 已存在则追加（加分隔线），
        // 否则等 600ms 重试（给 jump.js 足够时间先插入按钮行），
        // 还是没有才在 fallbackAnchor 后独立插入 .emby-button-group。
        appendToSharedRow(link, copyBtn, fallbackAnchor) {
            if (!link && !copyBtn) return;

            const doAppend = () => {
                const jumpGroup = document.querySelector('.jav-jump-btn-group');
                if (jumpGroup) {
                    const sep = document.createElement('span');
                    sep.style.cssText = 'display:inline-block;width:1px;height:16px;background:rgba(128,128,128,0.35);margin:0 4px;align-self:center;flex-shrink:0;';
                    jumpGroup.appendChild(sep);
                    if (link) jumpGroup.appendChild(link);
                    if (copyBtn) jumpGroup.appendChild(copyBtn);
                    return true;
                }
                return false;
            };

            if (doAppend()) return;

            // 600ms 给 jump.js 更充裕的时间插入 .jav-jump-btn-group
            setTimeout(() => {
                if (doAppend()) return;
                const container = document.createElement('span');
                container.className = 'emby-button-group';
                container.style.cssText = 'display:inline-flex;align-items:center;gap:6px;margin-left:8px;';
                if (link) container.appendChild(link);
                if (copyBtn) container.appendChild(copyBtn);
                if (fallbackAnchor && fallbackAnchor.parentNode) {
                    fallbackAnchor.parentNode.insertBefore(container, fallbackAnchor.nextSibling);
                }
            }, 600);
        },

        async processItemsWithBadge(items) {
            if (!items?.length) return;

            Status.show(`正在收集番号: 共${items.length}个项目`);

            const toProcess = [];
            const codes = [];

            for (const item of items) {
                if (this.processed.has(item)) continue;
                this.processed.add(item);

                const code = this.extractCode(item);
                if (!code) continue;

                const imgContainer = this.findImgContainer(item);
                if (!imgContainer) continue;

                toProcess.push({ item, code, imgContainer });
                codes.push(code);
            }

            if (codes.length > 0) {
                const bestItems = await this.api.batchQuery(codes);
                const operations = [];

                for (let i = 0; i < bestItems.length; i++) {
                    if (bestItems[i]) {
                        const { item, imgContainer } = toProcess[i];
                        const badge = this.api.createBadge(bestItems[i]);

                        if (badge) {
                            operations.push(() => {
                                if (window.getComputedStyle(imgContainer).position === 'static') {
                                    imgContainer.style.position = 'relative';
                                }
                                item.classList.add('emby-highlight');
                                imgContainer.appendChild(badge);
                            });
                        }
                    }
                }

                if (operations.length > 0) {
                    requestAnimationFrame(() => {
                        operations.forEach(op => op());
                    });
                }
            }
        },

        async processItemsWithLink(items) {
            if (!items?.length) return;

            Status.show(`正在收集番号: 共${items.length}个项目`);

            const toProcess = [];
            const codes = [];

            for (const item of items) {
                if (this.processed.has(item)) continue;
                this.processed.add(item);

                const code = this.extractCode(item);
                const element = this.getElement(item);

                if (code && element) {
                    toProcess.push({ element, code });
                    codes.push(code);
                }
            }

            if (codes.length > 0) {
                const bestItems = await this.api.batchQuery(codes);
                const processedElements = [];

                for (let i = 0; i < bestItems.length; i++) {
                    if (bestItems[i]) {
                        const { element } = toProcess[i];
                        const item = items[i];

                        if (item) item.classList.add('emby-processed');

                        const link = this.api.createLink(bestItems[i]);

                        if (link) {
                            const target = element.parentNode || element;
                            let current = element;

                            const containerClasses = [
                                'item',
                                'masonry-brick',
                                'grid-item',
                                'movie-list',
                                'post'
                            ];

                            while (current && current !== document.body) {
                                for (const className of containerClasses) {
                                    if (current.classList?.contains(className)) {
                                        current.style.cssText += `
                                            border:3px solid ${Config.highlightColor};
                                            background-color:${Config.highlightColor}22;
                                        `;
                                        break;
                                    }
                                }
                                current = current.parentElement;
                            }

                            processedElements.push({
                                target,
                                link,
                                position: element.nextSibling
                            });
                        }
                    }
                }

                requestAnimationFrame(() => {
                    processedElements.forEach(({ target, link, position }) => {
                        target.insertBefore(link, position);
                    });
                });
            }
        },

        async process() {

            const siteConfig = this.__siteConfig;
            if (!siteConfig) return;

            /* 列表页控制 */
            if (siteConfig.list && this.listSelector) {
                const items = document.querySelectorAll(this.listSelector);
                if (items.length > 0) {
                    await this.processItemsWithBadge(items);
                }
            }

            /* 详情页控制 */
            if (siteConfig.detail && this.processDetailPage) {
                await this.processDetailPage();
            }

            this.setupObserver();
        },

        findImgContainer(item) {
            const imgSelectors = ['.img', 'a.movie-box', '.cover', 'img'];

            for (const selector of imgSelectors) {
                const imgContainer = item.querySelector(selector);
                if (imgContainer) return imgContainer;
            }

            return item.querySelector('a') || item;
        },

        setupObserver() {
            let pending = [];
            let timer = null;

            const processMutations = () => {

                if (!this.__siteConfig || !this.__siteConfig.list) {
                    pending = [];
                    timer = null;
                    return;
                }
                const newElements = [];

                for (const mutation of pending) {
                    if (mutation.type === 'childList') {
                        for (const node of mutation.addedNodes) {
                            if (node.nodeType !== 1) continue;

                            if (node.matches?.(this.listSelector)) {
                                newElements.push(node);
                            }

                            if (node.querySelectorAll) {
                                node.querySelectorAll(this.listSelector).forEach(el => newElements.push(el));
                            }
                        }
                    }
                }

                if (newElements.length > 0) {
                    this.processItemsWithBadge(newElements);
                }

                pending = [];
                timer = null;
            };

            new MutationObserver(mutations => {
                pending.push(...mutations);
                if (!timer) timer = setTimeout(processMutations, 300);
            }).observe(document.body, { childList: true, subtree: true });
        }
    };

    const Processors = {
        javbus: Object.assign(Object.create(BaseProcessor), {
            listSelector: '.item.masonry-brick, #waterfall .item',

            extractCode: item => {
                const text = item.querySelector('.item date')?.textContent?.trim();
                return extractCodeFromText(text);
            },

            getElement: item =>
                item.querySelector('.item date'),

            async processDetailPage() {
                if (document.querySelector('.emby-jump-link, .emby-badge, .emby-copy-btn')) return;

                const infoElement = document.querySelector('.col-md-3.info p');
                if (!infoElement) return;

                const spans = infoElement.querySelectorAll('span');
                if (spans.length > 1) {
                    const code = extractCodeFromText(spans[1].textContent);
                    if (code) {
                        Prompt.queryStart(code);
                        const bestItem = await this.api.checkExists(code);
                        const link = bestItem ? this.api.createLink(bestItem) : null;
                        const copyBtn = this.api.createCopyButton(code);
                        this.appendToSharedRow(link, copyBtn, spans[1]);
                        if (bestItem) Prompt.querySuccess(code);
                        else Prompt.queryNotFound(code);
                    }
                }
            }
        }),

        javdb: Object.assign(Object.create(BaseProcessor), {
            listSelector: '.movie-list .item, .grid-item',

            extractCode: item => {
                const text = item.querySelector('.video-title strong')?.textContent?.trim();
                return extractCodeFromText(text);
            },

            getElement: item =>
                item.querySelector('.video-title strong'),

            async processDetailPage() {
                if (document.querySelector('.emby-jump-link, .emby-badge, .emby-copy-btn')) return;

                const detailElement =
                    document.querySelector('body > section > div > div.video-detail > h2 > strong') ||
                    document.querySelector('.video-detail h2 strong');

                if (!detailElement) return;

                const code = extractCodeFromText(detailElement.textContent);
                if (code) {
                    Prompt.queryStart(code);
                    const bestItem = await this.api.checkExists(code);
                    const link = bestItem ? this.api.createLink(bestItem) : null;
                    const copyBtn = this.api.createCopyButton(code);
                    this.appendToSharedRow(link, copyBtn, detailElement.parentNode);
                    if (bestItem) Prompt.querySuccess(code);
                    else Prompt.queryNotFound(code);
                }
            }
        }),

        supjav: Object.assign(Object.create(BaseProcessor), {
            listSelector: '.post',

            extractCode(item) {
                const text = item.querySelector('h3 a')?.textContent?.trim();
                return extractCodeFromText(text);
            },

            getElement(item) {
                return item.querySelector('h3 a');
            },

            async processDetailPage() {
                const titleElement = document.querySelector('.video-wrap .archive-title h1');
                if (!titleElement) return;

                if (titleElement.dataset.embyInjected === '1') return;
                titleElement.dataset.embyInjected = '1';

                const title = titleElement.textContent.trim();
                const code = extractCodeFromText(title);
                if (!code) return;

                Prompt.queryStart(code);
                const bestItem = await this.api.checkExists(code);
                const link = bestItem ? this.api.createLink(bestItem) : null;
                const copyBtn = this.api.createCopyButton(code);
                this.appendToSharedRow(link, copyBtn, titleElement);
                if (bestItem) Prompt.querySuccess(code);
                else Prompt.queryNotFound(code);
            }
        }),

        sehuatang: Object.assign(Object.create(BaseProcessor), {
            listSelector: 'tbody[id^="normalthread_"]',

            extractCode: function(item) {
                const link = item.querySelector('a.xst');
                return link ? extractCodeFromText(link.textContent) : null;
            },

            getElement: item => item.querySelector('a.xst'),

            async processListPage() {
                const items = document.querySelectorAll(this.listSelector);
                if (!items.length) return;

                Status.show(`正在收集番号: 共${items.length}个项目`);

                const toProcess = [];
                const codes = [];

                for (const item of items) {
                    if (this.processed.has(item)) continue;
                    this.processed.add(item);

                    const code = this.extractCode(item);
                    const element = this.getElement(item);

                    if (code && element) {
                        toProcess.push({ element, code, item });
                        codes.push(code);
                    }
                }

                if (codes.length === 0) {
                    Status.hide();
                    return;
                }

                const bestItems = await this.api.batchQuery(codes);
                const operations = [];

                for (let i = 0; i < bestItems.length; i++) {
                    const { element, item } = toProcess[i];
                    const bestItem = bestItems[i];

                    if (bestItem) {
                        // 标题变色
                        element.classList.add('emby-exists');
                        if (item) item.classList.add('emby-processed');

                        // 创建跳转按钮（仅当存在时）
                        const jumpBtn = this.api.createLink(bestItem);
                        if (jumpBtn) {
                            jumpBtn.style.marginLeft = '8px';
                            operations.push(() => {
                                element.parentNode.insertBefore(jumpBtn, element.nextSibling);
                            });
                        }
                    }
                }

                if (operations.length > 0) {
                    requestAnimationFrame(() => {
                        operations.forEach(op => op());
                    });
                }
            },

            async process() {
                const siteConfig = this.__siteConfig;
                if (!siteConfig) return;

                // 列表页处理
                if (siteConfig.list) {
                    await this.processListPage();
                }

                // 详情页处理：统一使用 appendToSharedRow，与 jump.js 共享按钮行
                if (siteConfig.detail) {
                    if (document.querySelector('.emby-jump-link, .emby-badge, .emby-copy-btn')) return;

                    const titleEl = document.querySelector('#thread_subject') ||
                                    document.querySelector('h1.ts') ||
                                    document.querySelector('h1');
                    if (!titleEl) return;

                    const title = document.title.trim();
                    const codes = this.extractCodes(title);

                    if (codes.length > 0) {
                        Prompt.batchStart(codes.length);
                        const bestItems = await this.api.batchQuery(codes);
                        let foundAny = false;

                        for (let i = 0; i < codes.length; i++) {
                            const code = codes[i];
                            const bestItem = bestItems[i];
                            const link = bestItem ? this.api.createLink(bestItem) : null;
                            const copyBtn = this.api.createCopyButton(code);
                            // 第一个番号追加到共享行，后续番号也追加进去
                            this.appendToSharedRow(link, copyBtn, titleEl);
                            if (bestItem) foundAny = true;
                        }

                        Prompt.batchComplete(foundAny ? bestItems.filter(Boolean).length : 0);
                    }
                }

                this.setupObserver();
            },

            extractCodes(title) {
                if (!title) return [];
                const patterns = [
                    /([a-zA-Z]{2,15})[-\s]?(\d{2,15})/i,
                    /FC2[-\s]?PPV[-\s]?(\d{6,7})/i
                ];
                const results = [];
                for (const pattern of patterns) {
                    const match = title.match(pattern);
                    if (match) {
                        if (match[2]) results.push(`${match[1]}-${match[2]}`);
                        else if (match[1]) results.push(match[0]);
                    }
                }
                return results;
            }
        }),

        sukebei: Object.assign(Object.create(BaseProcessor), {
            listSelector: 'table tbody tr',

            // ✅ 关键修复：明确选中标题链接（排除评论链接）
            extractCode(item) {
                const linkEl = item.querySelector('td:nth-child(2) a:not(.comments)');
                return linkEl ? extractCodeFromText(linkEl.textContent) : null;
            },

            getElement(item) {
                return item.querySelector('td:nth-child(2) a:not(.comments)');
            },

            async process() {
                const siteConfig = this.__siteConfig;
                if (!siteConfig) return;

                if (location.pathname.startsWith('/view/')) {
                    if (siteConfig.detail) await this.processDetailPage();
                    return;
                }

                if (siteConfig.list) await this.processListPage();
            },

            async processDetailPage() {
                if (document.querySelector('.emby-jump-link, .emby-badge, .emby-copy-btn')) return;

                const titleElement = document.querySelector('.panel-heading .panel-title');
                if (!titleElement) return;

                const code = extractCodeFromText(titleElement.textContent);
                if (!code) return;

                Prompt.queryStart(code);
                const bestItem = await this.api.checkExists(code);
                const link = bestItem ? this.api.createLink(bestItem) : null;
                const copyBtn = this.api.createCopyButton(code);
                this.appendToSharedRow(link, copyBtn, titleElement);
                if (bestItem) Prompt.querySuccess(code);
                else Prompt.queryNotFound(code);
            },

            async processListPage() {
                    const rows = document.querySelectorAll(this.listSelector);
                    const items = [];

                    for (const row of rows) {
                        // ✅ 这里也改成同一个选择器，保证一致
                        const linkEl = row.querySelector('td:nth-child(2) a:not(.comments)');
                        if (!linkEl || linkEl.dataset.embyChecked) continue;

                        linkEl.dataset.embyChecked = "1";

                        const code = extractCodeFromText(linkEl.textContent);   // 现在一定能拿到 SNOS-xxx
                        if (!code) continue;

                        const td = linkEl.parentNode;
                        if (!td) continue;

                        items.push({ linkEl, td, code });
                    }

                    if (items.length === 0) return;

                    const codes = items.map(item => item.code);
                    const bestItems = await this.api.batchQuery(codes);

                    let foundCount = 0;
                    for (let i = 0; i < bestItems.length; i++) {
                        const bestItem = bestItems[i];
                        if (!bestItem) continue;

                        foundCount++;
                        const { linkEl, td } = items[i];
                        if (td.dataset.embyBtnAdded) continue;
                        td.dataset.embyBtnAdded = '1';

                        linkEl.classList.add('emby-exists');

                        const icon = td.querySelector('[data-lmt]');

                        const wrapper = document.createElement('span');
                        wrapper.style.display = 'flex';
                        wrapper.style.alignItems = 'center';
                        wrapper.style.width = '100%';
                        wrapper.style.minWidth = '0';

                        if (icon) {
                            icon.parentNode.removeChild(icon);
                            wrapper.appendChild(icon);
                            icon.style.flexShrink = '0';
                            icon.style.marginRight = '4px';
                        }

                        linkEl.parentNode.removeChild(linkEl);
                        wrapper.appendChild(linkEl);

                        linkEl.style.flex = '1';
                        linkEl.style.minWidth = '0';
                        linkEl.style.overflow = 'hidden';
                        linkEl.style.textOverflow = 'ellipsis';
                        linkEl.style.whiteSpace = 'nowrap';

                        const embyUrl = `${Config.embyBaseUrl}web/index.html#!/item?id=${bestItem.Id}&serverId=${bestItem.ServerId}`;
                        const btn = document.createElement('a');
                        btn.href = embyUrl;
                        btn.target = '_blank';
                        btn.className = `emby-btn emby-btn-jump ${this.api.getBtnSizeClass()}`;
                        btn.textContent = '🎬跳转到Emby';
                        btn.style.flexShrink = '0';
                        btn.style.marginLeft = '8px';
                        wrapper.appendChild(btn);

                        td.innerHTML = '';
                        td.appendChild(wrapper);
                    }

                    Prompt.batchComplete(foundCount);
                }
            }),

        javlibrary: (function() {
            const embyItemMap = new Map();

            function applyHighlight(video) {
                if (!video) return;

                const titleEl = video.querySelector('.title') || video.querySelector('a');
                const idEl = video.querySelector('div.id');

                if (titleEl) titleEl.classList.add('emby-title-exists');
                if (idEl) idEl.classList.add('emby-id-exists');

                video.classList.add('emby-highlight');
            }

            function scanAndRepair() {
                document.querySelectorAll('.video').forEach(video => {
                    const idEl = video.querySelector('div.id');
                    if (!idEl) return;
                    const code = idEl.textContent.trim();
                    if (embyItemMap.has(code)) {
                        applyHighlight(video);
                    }
                });
            }

            // 详情页维护函数
            function maintainDetailPage(api) {
                const siteConfig = typeof GM_getValue !== 'undefined' ? Config.enabledSites.javlibrary : { detail: true };
                if (!siteConfig || !siteConfig.detail) return;

                const idContainer = document.querySelector('#video_id');
                const idCodeElement = document.querySelector('#video_id .text');
                if (!idContainer || !idCodeElement) return;

                const code = extractCodeFromText(idCodeElement.textContent);
                if (!code) return;

                if (idContainer.dataset.embyCode === code) return;
                if (idContainer.dataset.embyProcessing === 'true') return;

                idContainer.dataset.embyProcessing = 'true';
                const copyBtn = api.createCopyButton(code);

                let item = embyItemMap.get(code);
                if (item) {
                    const link = api.createLink(item);
                    BaseProcessor.appendToSharedRow(link, copyBtn, idContainer);
                    if (link) Prompt.querySuccess(code);
                    idContainer.dataset.embyCode = code;
                    delete idContainer.dataset.embyProcessing;
                    return;
                }

                Prompt.queryStart(code);
                api.checkExists(code).then(bestItem => {
                    if (bestItem) {
                        embyItemMap.set(code, bestItem);
                        const link = api.createLink(bestItem);
                        BaseProcessor.appendToSharedRow(link, copyBtn, idContainer);
                        if (link) Prompt.querySuccess(code);
                        else Status.error('❌ 创建链接失败', true);
                    } else {
                        BaseProcessor.appendToSharedRow(null, copyBtn, idContainer);
                        Prompt.queryNotFound(code);
                    }
                }).catch(e => {
                    console.error('Emby查询失败', e);
                    Prompt.queryError(code, e.message);
                }).finally(() => {
                    if (idContainer && idContainer.dataset) {
                        idContainer.dataset.embyCode = code;
                        delete idContainer.dataset.embyProcessing;
                    }
                });
            }

            return Object.assign(Object.create(BaseProcessor), {
                listSelector: '.video',

                extractCode: function(item) {
                    const idEl = item.querySelector('div.id');
                    return idEl ? extractCodeFromText(idEl.textContent) : null;
                },

                async process() {
                    const siteConfig = this.__siteConfig;
                    if (!siteConfig) return;

                    // 列表页处理
                    if (siteConfig.list) {
                        const items = document.querySelectorAll(this.listSelector);
                        if (items.length > 0) {
                            const videos = [], codes = [];
                            items.forEach(item => {
                                if (this.processed.has(item)) return;
                                this.processed.add(item);
                                const code = this.extractCode(item);
                                if (code) {
                                    videos.push(item);
                                    codes.push(code);
                                }
                            });

                            if (codes.length > 0) {
                                const bestItems = await this.api.batchQuery(codes);
                                for (let i = 0; i < bestItems.length; i++) {
                                    if (bestItems[i]) {
                                        const video = videos[i];
                                        const code = codes[i];
                                        embyItemMap.set(code, bestItems[i]);
                                        applyHighlight(video);
                                    }
                                }
                            }
                        }

                        this.setupContainerObserver();
                        this.startListMaintenance();
                    }

                    // 详情页处理
                    if (siteConfig.detail) {
                        this.startDetailMaintenance();
                        maintainDetailPage(this.api);
                    }

                    this.setupObserver();
                },

                setupObserver() {
                    let pending = [], timer = null;
                    const processMutations = () => {
                        const newItems = [];
                        pending.forEach(m => {
                            if (m.type === 'childList') {
                                m.addedNodes.forEach(node => {
                                    if (node.nodeType !== 1) return;
                                    if (node.matches?.(this.listSelector)) newItems.push(node);
                                    node.querySelectorAll?.(this.listSelector).forEach(el => newItems.push(el));
                                });
                            }
                        });
                        if (newItems.length) this.process();
                        pending = []; timer = null;
                    };
                    new MutationObserver(mutations => {
                        pending.push(...mutations);
                        if (!timer) timer = setTimeout(processMutations.bind(this), 300);
                    }).observe(document.body, { childList: true, subtree: true });
                },

                setupContainerObserver() {
                    if (this._containerObserved) return;
                    this._containerObserved = true;
                    const container = document.querySelector('.videothumblist') || document.querySelector('#rightcolumn');
                    if (!container) return;
                    const observer = new MutationObserver(() => setTimeout(scanAndRepair, 50));
                    observer.observe(container, { childList: true, subtree: true });
                },

                startListMaintenance() {
                    if (this._listMaintenanceStarted) return;
                    this._listMaintenanceStarted = true;
                    setInterval(() => {
                        const siteConfig = this.__siteConfig;
                        if (!siteConfig || !siteConfig.list) return;
                        scanAndRepair();
                    }, 3000);
                },

                startDetailMaintenance() {
                    if (this._detailMaintenanceStarted) return;
                    this._detailMaintenanceStarted = true;
                    setInterval(() => maintainDetailPage(this.api), 2000);
                }
            });
        })(),

        madou: Object.assign(Object.create(BaseProcessor), {
            listSelector: '',

            async process() {
                const siteConfig = this.__siteConfig;
                if (!siteConfig || !siteConfig.detail) return;

                await this.processDetailPage();
            },

            async processDetailPage() {
                if (document.querySelector('.emby-jump-link, .emby-badge, .emby-copy-btn')) return;

                let code = null;

                const keywords = document.querySelector('meta[name="keywords"]')?.content || "";
                code = extractCodeFromText(keywords);
                if (code) code = code.toUpperCase();

                if (!code) {
                    const info = document.querySelector('.vd-infos');
                    if (info) {
                        const ps = info.querySelectorAll('p');
                        for (const p of ps) {
                            const text = p.textContent || '';
                            code = extractCodeFromText(text);
                            if (code) {
                                code = code.toUpperCase();
                                break;
                            }
                        }
                    }
                }

                if (code) {
                    Prompt.queryStart(code);
                    const bestItem = await this.api.checkExists(code);
                    const link = bestItem ? this.api.createLink(bestItem) : null;
                    const copyBtn = this.api.createCopyButton(code);
                    const titleElement = document.querySelector('h1');
                    this.appendToSharedRow(link, copyBtn, titleElement || document.body);
                    if (bestItem) Prompt.querySuccess(code);
                    else Prompt.queryNotFound(code);
                }
            }
        }),

        javrate: Object.assign(Object.create(BaseProcessor), {
            listSelector: '.mgn-item',

            extractCode: item => {
                const strong = item.querySelector('strong.fg-main');
                return strong ? extractCodeFromText(strong.textContent) : null;
            },

            findImgContainer: item => {
                // 返回相对定位的容器，用于放置徽章
                return item.querySelector('.mgn-box') || item;
            },

            async process() {
                const siteConfig = this.__siteConfig;
                if (!siteConfig) return;

                // 列表页处理
                if (siteConfig.list && this.listSelector) {
                    const items = document.querySelectorAll(this.listSelector);
                    if (items.length > 0) {
                        await this.processItemsWithBadge(items);
                    }
                }

                // 详情页处理
                if (siteConfig.detail) {
                    await this.processDetailPage();
                }

                this.setupObserver();
            },

            async processDetailPage() {
                if (document.querySelector('.emby-jump-link, .emby-badge, .emby-copy-btn')) return;

                let code = null;
                const h1Strong = document.querySelector('h1 strong.fg-main');
                if (h1Strong) code = extractCodeFromText(h1Strong.textContent);
                if (!code) {
                    const keywords = document.querySelector('meta[name="keywords"]')?.content || "";
                    code = extractCodeFromText(keywords);
                }
                if (!code) { console.log('[Emby] 未找到番号'); return; }

                code = code.toUpperCase();
                Prompt.queryStart(code);
                const bestItem = await this.api.checkExists(code);
                const link = bestItem ? this.api.createLink(bestItem) : null;
                const copyBtn = this.api.createCopyButton(code);
                const titleElement = document.querySelector('h1');
                this.appendToSharedRow(link, copyBtn, titleElement || document.body);
                if (bestItem) Prompt.querySuccess(code);
                else Prompt.queryNotFound(code);
            }
        }),

        '169bbs': Object.assign(Object.create(BaseProcessor), {
            listSelector: 'tbody[id^="normalthread_"]',
            codeRegex: /[A-Z]{2,10}-\d+/i,

            extractCode: function(item) {
                const link = item.querySelector('a.xst');
                if (!link) return null;
                return extractCodeFromText(link.textContent);
            },

            getElement: item => item.querySelector('a.xst'),

            async processItemsWithLink(items) {
                if (!items?.length) return;

                Status.show(`正在收集番号: 共${items.length}个项目`);

                const toProcess = [];
                const codes = [];

                for (const item of items) {
                    if (this.processed.has(item)) continue;
                    this.processed.add(item);

                    const code = this.extractCode(item);
                    const element = this.getElement(item);

                    if (code && element) {
                        toProcess.push({ element, code, item });
                        codes.push(code);
                    }
                }

                if (codes.length > 0) {
                    const bestItems = await this.api.batchQuery(codes);
                    const processedElements = [];

                    for (let i = 0; i < bestItems.length; i++) {
                        if (bestItems[i]) {
                            const { element, item } = toProcess[i];

                            // 为标题添加高亮类（变色）
                            element.classList.add('emby-exists');
                            if (item) item.classList.add('emby-processed');

                            const link = this.api.createLink(bestItems[i]);
                            if (link) {
                                link.style.marginLeft = '8px';

                                // 可选：为父容器添加边框高亮（如需要）
                                let current = element;
                                const containerClasses = ['item', 'masonry-brick', 'grid-item', 'movie-list', 'post'];
                                while (current && current !== document.body) {
                                    for (const className of containerClasses) {
                                        if (current.classList?.contains(className)) {
                                            current.style.cssText += `
                                                border:3px solid ${Config.highlightColor};
                                                background-color:${Config.highlightColor}22;
                                            `;
                                            break;
                                        }
                                    }
                                    current = current.parentElement;
                                }

                                processedElements.push({
                                    target: element.parentNode || element,
                                    link,
                                    position: element.nextSibling
                                });
                            }
                        }
                    }

                    requestAnimationFrame(() => {
                        processedElements.forEach(({ target, link, position }) => {
                            target.insertBefore(link, position);
                        });
                    });
                } else {
                    Status.hide();
                }
            },

            async process() {
                const siteConfig = this.__siteConfig;
                if (!siteConfig) return;

                if (siteConfig.list) {
                    const items = document.querySelectorAll(this.listSelector);
                    if (items.length > 0) {
                        await this.processItemsWithLink(items);
                    }
                }

                if (siteConfig.detail) {
                    const titleEl = document.querySelector('#thread_subject');
                    if (titleEl) {
                        const code = extractCodeFromText(titleEl.textContent);
                        if (code) {
                            Prompt.queryStart(code);
                            const bestItem = await this.api.checkExists(code);
                            const link = bestItem ? this.api.createLink(bestItem) : null;
                            const copyBtn = this.api.createCopyButton(code);
                            this.appendToSharedRow(link, copyBtn, titleEl);
                            if (bestItem) Prompt.querySuccess(code);
                            else Prompt.queryNotFound(code);
                        }
                    }
                }

                this.setupObserver();
            }
        }),

        'hjd2048': Object.assign(Object.create(BaseProcessor), {
            listSelector: 'tr.tr3.t_one',   // 每个帖子所在的行

            extractCode: function(item) {
                const link = item.querySelector('a.subject');
                return link ? extractCodeFromText(link.textContent) : null;
            },

            getElement: item => item.querySelector('a.subject'),

            // 列表页处理：标题变色 + 插入跳转按钮（仅当存在时）
            async processItemsWithLink(items) {
                if (!items?.length) return;

                Status.show(`正在收集番号: 共${items.length}个项目`);

                const toProcess = [];
                const codes = [];

                for (const item of items) {
                    if (this.processed.has(item)) continue;
                    this.processed.add(item);

                    const code = this.extractCode(item);
                    const element = this.getElement(item);

                    if (code && element) {
                        toProcess.push({ element, code, item });
                        codes.push(code);
                    }
                }

                if (codes.length === 0) {
                    Status.hide();
                    return;
                }

                const bestItems = await this.api.batchQuery(codes);
                const operations = [];

                for (let i = 0; i < bestItems.length; i++) {
                    const { element, item } = toProcess[i];
                    const bestItem = bestItems[i];

                    if (bestItem) {
                        // 标题变色（左边框 + 加粗，颜色由浏览器控制）
                        element.classList.add('emby-exists');
                        if (item) item.classList.add('emby-processed');

                        const jumpBtn = this.api.createLink(bestItem);
                        if (jumpBtn) {
                            jumpBtn.style.marginLeft = '8px';
                            operations.push(() => {
                                element.parentNode.insertBefore(jumpBtn, element.nextSibling);
                            });
                        }
                    }
                }

                if (operations.length > 0) {
                    requestAnimationFrame(() => {
                        operations.forEach(op => op());
                    });
                }
            },

            async processListPage() {
                const items = document.querySelectorAll(this.listSelector);
                if (items.length) {
                    await this.processItemsWithLink(items);
                }
            },

            async processDetailPage() {
                if (document.querySelector('.emby-jump-link, .emby-badge, .emby-copy-btn')) return;

                const titleEl = document.querySelector('h1#subject_tpc');
                if (!titleEl) return;

                const code = extractCodeFromText(titleEl.textContent);
                if (!code) return;

                Prompt.queryStart(code);
                const bestItem = await this.api.checkExists(code);
                const link = bestItem ? this.api.createLink(bestItem) : null;
                const copyBtn = this.api.createCopyButton(code);
                this.appendToSharedRow(link, copyBtn, titleEl);
                if (bestItem) Prompt.querySuccess(code);
                else Prompt.queryNotFound(code);
            },

            async process() {
                const siteConfig = this.__siteConfig;
                if (!siteConfig) return;

                if (siteConfig.list) {
                    await this.processListPage();
                }

                if (siteConfig.detail) {
                    await this.processDetailPage();
                }

                this.setupObserver();
            }
        }),

        missav: Object.assign(Object.create(BaseProcessor), {
            listSelector: '.thumbnail.group',

            extractCode: item => {
                const titleEl = item.querySelector('.my-2 a') ||
                               item.querySelector('a[alt]') ||
                               item.querySelector('a');
                return titleEl ? extractCodeFromText(titleEl.textContent || titleEl.getAttribute('alt') || '') : null;
            },

            getElement: item => item.querySelector('.my-2 a') || item.querySelector('a'),

            // 列表页使用标题旁按钮 + 卡片高亮（不再依赖图片上的徽章）
            async processItemsWithBadge(items) {
                if (!items?.length) return;

                Status.show(`正在收集番号: 共${items.length}个项目`);

                const toProcess = [];
                const codes = [];

                for (const item of items) {
                    if (this.processed.has(item)) continue;
                    this.processed.add(item);

                    const code = this.extractCode(item);
                    if (!code) continue;

                    const titleEl = this.getElement(item);
                    if (!titleEl) continue;

                    toProcess.push({ item, code, titleEl });
                    codes.push(code);
                }

                if (codes.length === 0) return;

                const bestItems = await this.api.batchQuery(codes);

                const operations = [];
                for (let i = 0; i < bestItems.length; i++) {
                    if (bestItems[i]) {
                        const { item, titleEl } = toProcess[i];
                        item.classList.add('emby-highlight');

                        const badge = this.api.createBadge(bestItems[i]);
                        if (badge) {
                            badge.style.marginLeft = '8px';
                            badge.style.fontSize = '11px';
                            operations.push(() => {
                                // 把徽章插入到标题链接旁边
                                if (titleEl.parentNode) {
                                    titleEl.parentNode.insertBefore(badge, titleEl.nextSibling);
                                }
                            });
                        }
                    }
                }

                if (operations.length > 0) {
                    requestAnimationFrame(() => operations.forEach(op => op()));
                }
            },

            async process() {
                const siteConfig = this.__siteConfig;
                if (!siteConfig) return;

                if (siteConfig.list && this.listSelector) {
                    const items = document.querySelectorAll(this.listSelector);
                    if (items.length > 0) {
                        await this.processItemsWithBadge(items);
                    }
                }

                if (siteConfig.detail) {
                    await this.processDetailPage();
                }

                this.setupObserver();
            },

            async processDetailPage() {
                // 详情页保持原来逻辑（标题下方按钮）
                if (document.querySelector('.emby-jump-link, .emby-badge, .emby-copy-btn')) return;

                const titleElement = document.querySelector('h1') || document.querySelector('title');
                if (!titleElement) return;

                const titleText = typeof titleElement === 'string' ? document.title : titleElement.textContent || document.title;
                const code = extractCodeFromText(titleText);
                if (!code) return;

                Prompt.queryStart(code);
                const bestItem = await this.api.checkExists(code);
                const link = bestItem ? this.api.createLink(bestItem) : null;
                const copyBtn = this.api.createCopyButton(code);
                this.appendToSharedRow(link, copyBtn, titleElement);
                if (bestItem) Prompt.querySuccess(code);
                else Prompt.queryNotFound(code);
            }
        }),
    };

    // 站点自动识别
    function detectSite() {
        const host = location.hostname;
        const url = location.href;

        if (host.includes('javbus')) return 'javbus';
        if (host.includes('javdb')) return 'javdb';
        if (host.includes('supjav')) return 'supjav';
        if (host.includes('sehuatang')) return 'sehuatang';
        if (host.includes('nyaa.si')) return 'sukebei';
        if (host.includes('javlibrary')) return 'javlibrary';
        if (host.includes('madou')) return 'madou';
        if (host.includes('javrate')) return 'javrate';
        if (host.includes('169bbs')) return '169bbs';
        if (host.includes('hjd2048.com')) return 'hjd2048';
        if (host.includes('missav.ws')) return 'missav';

        return null;
    }

    // 菜单：设置 & 清除缓存
    GM_registerMenuCommand('⚙️ Emby 设置', () => SettingsUI.show());
    GM_registerMenuCommand('🧹 清除 Emby 查询缓存', () => {
        if (confirm('确定要清除缓存吗？')) {
            EmbyCache.clear();
            alert('缓存已清除！');
        }
    });

    // 主入口
    async function main() {
        const currentUrl = location.href;
        const currentPath = location.pathname.toLowerCase();

        const site = detectSite();

        const isJavBusForum = currentUrl.includes('javbus.com/forum');
        const skipPaths = ['/genre', '/actresses', '/uncensored/actresses'];

        if (!site || isJavBusForum || skipPaths.some(path => currentPath.includes(path))) {
            return;
        }

        if (!Config.isValid()) {
            Status.error('配置无效', true);
            setTimeout(() => {
                alert('请先设置您的 Emby 服务器地址和 API 密钥');
                SettingsUI.show();
            }, 500);
            return;
        }

        console.log('Emby 跳转脚本启动，识别站点:', site);

        const siteConfig = Config.enabledSites[site];
        if (!siteConfig) return;

        const processor = Processors[site].init(new EmbyAPI());
        if (processor) {
            processor.__siteConfig = siteConfig;
            await processor.process();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
    } else {
        main();
    }

})();
