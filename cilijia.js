// ==UserScript==
// @name         磁力家磁力链提取
// @namespace    https://github.com/ZiPenOk
// @version      1.2
// @description  磁力家搜索结果加载后为每个资源添加磁力链接和复制按钮,可能需要手动刷新一次页面
// @author       ZiPenOk
// @match        https://cilijia.net/search*
// @match        https://taocili.com/search*
// @grant        none
// @run-at       document-idle
// @supportURL   https://github.com/ZiPenOk/scripts/issues
// @homepageURL  https://github.com/ZiPenOk/scripts
// @icon         https://taocili.com/favicon.ico
// @updateURL    https://raw.githubusercontent.com/ZiPenOk/scripts/main/cilijia.js
// @downloadURL  https://raw.githubusercontent.com/ZiPenOk/scripts/main/cilijia.js
// ==/UserScript==

(function() {
    'use strict';

    // 从 __NUXT__ 提取资源列表
    function getItems() {
        try {
            return window.__NUXT__?.data?.[0]?.items || [];
        } catch (e) {
            return [];
        }
    }

    // 添加磁力链接到每个 .item 下方
    function addMagnetLinks() {
        const items = getItems();
        if (!items.length) return;

        const itemElements = document.querySelectorAll('.item');
        if (!itemElements.length) return;

        // 先清理旧的（防止重复）
        document.querySelectorAll('.magnet-link-container').forEach(el => el.remove());

        itemElements.forEach((itemEl, index) => {
            const itemData = items[index];
            if (!itemData?.hash) return;

            const magnet = `magnet:?xt=urn:btih:${itemData.hash}`;

            const container = document.createElement('div');
            container.className = 'magnet-link-container';
            container.style.cssText = `
                margin: 8px 0 4px 0;
                padding: 8px 12px;
                background-color: #f0f7ff;
                border-left: 4px solid #409eff;
                border-radius: 6px;
                font-size: 13px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 10px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.05);
            `;

            const linkSpan = document.createElement('span');
            linkSpan.style.cssText = `
                word-break: break-all;
                color: #409eff;
                flex: 1;
                font-family: monospace;
                cursor: pointer;
                text-decoration: underline;
                text-decoration-color: #a0cfff;
            `;
            linkSpan.textContent = magnet;
            linkSpan.addEventListener('click', (e) => {
                e.stopPropagation();
                window.open(magnet, '_blank');
            });

            const copyBtn = document.createElement('button');
            copyBtn.textContent = '复制';
            copyBtn.style.cssText = `
                background-color: #409eff;
                color: white;
                border: none;
                border-radius: 20px;
                padding: 5px 16px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
                transition: all 0.2s;
                white-space: nowrap;
                box-shadow: 0 2px 4px rgba(64,158,255,0.3);
            `;
            copyBtn.addEventListener('mouseenter', () => {
                copyBtn.style.backgroundColor = '#66b1ff';
                copyBtn.style.transform = 'translateY(-1px)';
                copyBtn.style.boxShadow = '0 4px 8px rgba(64,158,255,0.4)';
            });
            copyBtn.addEventListener('mouseleave', () => {
                copyBtn.style.backgroundColor = '#409eff';
                copyBtn.style.transform = 'none';
                copyBtn.style.boxShadow = '0 2px 4px rgba(64,158,255,0.3)';
            });
            copyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(magnet).then(() => {
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = '✓ 已复制';
                    copyBtn.style.backgroundColor = '#67c23a';
                    setTimeout(() => {
                        copyBtn.textContent = originalText;
                        copyBtn.style.backgroundColor = '#409eff';
                    }, 1500);
                }).catch(() => alert('复制失败，请手动复制'));
            });

            container.appendChild(linkSpan);
            container.appendChild(copyBtn);
            itemEl.appendChild(container);
        });
    }

    // 创建悬浮刷新按钮
    function createRefreshButton() {
        if (document.getElementById('magnet-refresh-btn')) return;

        const btn = document.createElement('div');
        btn.id = 'magnet-refresh-btn';
        btn.innerHTML = '🔄 刷新磁力链';
        btn.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background-color: #409eff;
            color: white;
            padding: 12px 20px;
            border-radius: 40px;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 6px 16px rgba(64,158,255,0.4);
            cursor: pointer;
            z-index: 9999;
            transition: all 0.3s;
            border: none;
            user-select: none;
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255,255,255,0.2);
        `;
        btn.addEventListener('mouseenter', () => {
            btn.style.backgroundColor = '#66b1ff';
            btn.style.transform = 'scale(1.05)';
            btn.style.boxShadow = '0 10px 24px rgba(64,158,255,0.5)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.backgroundColor = '#409eff';
            btn.style.transform = 'scale(1)';
            btn.style.boxShadow = '0 6px 16px rgba(64,158,255,0.4)';
        });
        btn.addEventListener('click', () => {
            // 点击后重新添加（相当于手动刷新）
            addMagnetLinks();
            showToast('已刷新');
        });
        document.body.appendChild(btn);
    }

    function showToast(msg) {
        const tip = document.createElement('div');
        tip.textContent = msg;
        tip.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 30px;
            background: #67c23a;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 13px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(tip);
        setTimeout(() => tip.remove(), 1500);
    }

    // 初始化：页面加载后执行一次
    setTimeout(() => {
        addMagnetLinks();
        createRefreshButton();
    }, 500);
})();
