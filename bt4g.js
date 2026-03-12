// ==UserScript==
// @name         BT4G 磁力链提取器
// @namespace    https://github.com/ZiPenOk
// @version      1.0
// @description  为 BT4G 搜索结果页和详情页添加磁力链接（显示纯 hash，复制/打开带 dn）
// @author       ZiPenOk
// @match        https://*.bt4gprx.com/*
// @grant        none
// @run-at       document-idle
// @supportURL   https://github.com/ZiPenOk/scripts/issues
// @homepageURL  https://github.com/ZiPenOk/scripts
// @icon         https://bt4gprx.com/static/favicon.ico
// @updateURL    https://raw.githubusercontent.com/ZiPenOk/scripts/main/bt4g.js
// @downloadURL  https://raw.githubusercontent.com/ZiPenOk/scripts/main/bt4g.js
// ==/UserScript==

(function () {
    'use strict';

    function createMagnetContainer(hash, fullMagnet) {
        const container = document.createElement('div');
        container.className = 'magnet-link-container';
        container.style.cssText = `
            margin: 8px 0 4px 0; padding: 8px 12px; background-color: #f0f7ff;
            border-left: 4px solid #409eff; border-radius: 6px; font-size: 13px;
            display: flex; align-items: center; justify-content: space-between;
            flex-wrap: wrap; gap: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        `;

        const linkSpan = document.createElement('span');
        linkSpan.style.cssText = `
            word-break: break-all; color: #409eff; flex: 1; font-family: monospace;
            cursor: pointer; text-decoration: underline; text-decoration-color: #a0cfff;
        `;
        linkSpan.textContent = `magnet:?xt=urn:btih:${hash}`;
        linkSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            window.open(fullMagnet, '_blank');
        });

        const copyBtn = document.createElement('button');
        copyBtn.textContent = '复制';
        copyBtn.style.cssText = `
            background-color: #409eff; color: white; border: none; border-radius: 20px;
            padding: 5px 16px; cursor: pointer; font-size: 12px; font-weight: 500;
            transition: all 0.2s; white-space: nowrap; box-shadow: 0 2px 4px rgba(64,158,255,0.3);
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
            navigator.clipboard.writeText(fullMagnet).then(() => {
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
        return container;
    }

    function showToast(msg) {
        const tip = document.createElement('div');
        tip.textContent = msg;
        tip.style.cssText = `
            position: fixed; bottom: 100px; right: 30px; background: #67c23a; color: white;
            padding: 8px 16px; border-radius: 20px; font-size: 13px; z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(tip);
        setTimeout(() => tip.remove(), 2000);
    }

    function clearOldContainers() {
        document.querySelectorAll('.magnet-link-container').forEach(el => el.remove());
    }

    async function addMagnetLinks() {
        clearOldContainers();
        console.log('[BT4G 提取] 开始执行');

        const path = window.location.pathname;

        // 详情页
        if (path.startsWith('/magnet/')) {
            console.log('[BT4G 提取] 详情页模式');
            const btn = document.querySelector('a[href*="downloadtorrentfile.com/hash/"]');
            if (!btn) {
                console.log('[BT4G 提取] 未找到 downloadtorrentfile 按钮');
                return;
            }

            let href = btn.href.startsWith('//') ? 'https:' + btn.href : btn.href;
            const u = new URL(href);
            const hash = u.pathname.split('/').pop();
            let name = u.searchParams.get('name');
            if (name) name = decodeURIComponent(name);
            else name = document.querySelector('h3')?.textContent.trim() || '';

            const pure = `magnet:?xt=urn:btih:${hash}`;
            const full = name ? `${pure}&dn=${name}` : pure;

            const container = createMagnetContainer(hash, full);

            const target = document.querySelector('.card-body') ||
                           document.querySelector('.card') ||
                           document.querySelector('main') ||
                           document.body;
            if (target) {
                target.appendChild(container);
                console.log('[BT4G 提取] 详情页磁力框已插入');
                showToast('详情页磁力已添加');
            }
            return;
        }

        // 搜索结果页
        if (path.includes('/search')) {
            console.log('[BT4G 提取] 搜索结果页模式');
            const items = document.querySelectorAll('.list-group-item.result-item');
            if (!items.length) {
                console.log('[BT4G 提取] 未找到 .list-group-item.result-item');
                return;
            }

            let successCount = 0;
            for (const item of items) {
                const a = item.querySelector('h5 a');
                if (!a?.href.includes('/magnet/')) continue;

                try {
                    const resp = await fetch(a.href);
                    if (!resp.ok) continue;
                    const html = await resp.text();
                    const doc = new DOMParser().parseFromString(html, 'text/html');
                    const btn = doc.querySelector('a[href*="downloadtorrentfile.com/hash/"]');
                    if (!btn) continue;

                    let href = btn.getAttribute('href');
                    if (href.startsWith('//')) href = 'https:' + href;
                    const u = new URL(href);
                    const hash = u.pathname.split('/').pop();
                    let name = u.searchParams.get('name');
                    if (name) name = decodeURIComponent(name);
                    else name = a.textContent.trim();

                    const pure = `magnet:?xt=urn:btih:${hash}`;
                    const full = name ? `${pure}&dn=${name}` : pure;

                    item.appendChild(createMagnetContainer(hash, full));
                    successCount++;
                } catch (e) {
                    console.error('[BT4G 提取] 预读失败:', e);
                }
            }
            if (successCount > 0) {
                console.log(`[BT4G 提取] 成功为 ${successCount} 条结果添加磁力框`);
                showToast(`已为 ${successCount} 条结果添加磁力`);
            } else {
                console.log('[BT4G 提取] 本页无有效磁力信息');
            }
        }
    }

    function createRefreshButton() {
        if (document.getElementById('magnet-refresh-btn')) return;

        const btn = document.createElement('div');
        btn.id = 'magnet-refresh-btn';
        btn.innerHTML = '🔄 刷新磁力链';
        btn.style.cssText = `
            position: fixed; bottom: 30px; right: 120px; background: #409eff; color: white;
            padding: 12px 20px; border-radius: 40px; font-size: 14px; font-weight: bold;
            box-shadow: 0 6px 16px rgba(64,158,255,0.4); cursor: pointer; z-index: 9999;
            transition: all 0.3s;
        `;
        btn.addEventListener('click', () => {
            addMagnetLinks();
            showToast('正在刷新磁力链...');
        });
        document.body.appendChild(btn);
    }

    function createSettingsButton() {
    }

    // 初始化
    setTimeout(() => {
        addMagnetLinks();
        createRefreshButton();
        createSettingsButton();
    }, 1200);
})();