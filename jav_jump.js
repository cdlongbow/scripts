// ==UserScript==
// @name         番号跳转加预览图
// @namespace    https://github.com/ZiPenOk
// @version      6.0.0
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
 
(function () {
    'use strict';

    const KEY = 'jav_jump_migration_notice_2_0_0';
    const url = 'https://sleazyfork.org/zh-CN/scripts/576375-jav%E8%80%81%E5%8F%B8%E6%9C%BA-%E6%96%B0';

    GM_registerMenuCommand('打开 JAV老司机-新', () => window.open(url));

    if (!GM_getValue(KEY, false)) {
        GM_setValue(KEY, true);
        GM_notification({
            title: 'jav_jump 已合并',
            text: '功能已并入 JAV老司机-新 2.0.0，请禁用或卸载 jav_jump.js。',
            timeout: 8000,
            onclick: () => window.open(url)
        });
    }
})();
