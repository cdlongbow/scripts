// ==UserScript==
// @name         Emby 指定媒体库默认缩略图
// @namespace    local.emby.force.thumb.selected
// @version      1.1.0
// @description  让指定的 Emby Web 媒体库默认以缩略图显示；用户可临时切换视图，但仅在当前浏览器会话中保留，不写入 Emby 配置。
// @author       ZiPenOk
// @license      MIT
// @match        http://10.10.10.*:8096/web/*
// @match        http://10.10.10.*:8097/web/*
// @include      /^https:\/\/emby\.[^/]+\/web\/.*/
// @run-at       document-start
// @grant        none
// @inject-into  page
// @homepageURL  https://github.com/ZiPenOk/scripts
// @supportURL   https://github.com/ZiPenOk/scripts/issues
// @downloadURL  https://github.com/ZiPenOk/scripts/raw/refs/heads/main/EmbyForceThumb.js
// @updateURL    https://github.com/ZiPenOk/scripts/raw/refs/heads/main/EmbyForceThumb.js
// ==/UserScript==

(function () {
  'use strict';

  var TAG = '[EmbyForceThumb-VM]';

  var FORCE_PARENT_IDS = [
    '565027',//wm
    '565031',//gc
    '565033'//om
  ];

  var DEFAULT_IMAGE_TYPE = 'thumb';
  var DEFAULT_CLASSIC_VIEW = 'Thumb';
  var SESSION_KEY = 'EmbyForceThumbTempPrefs';
  var tempPrefs = loadTempPrefs();

  function loadTempPrefs() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function saveTempPrefs() {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(tempPrefs));
    } catch (e) {}
  }

  var refreshTimer;

  function log() {
    console.log.apply(console, [TAG].concat([].slice.call(arguments)));
  }

  function getHashParams() {
    var query = (location.hash.split('?')[1] || '');
    return new URLSearchParams(query);
  }

  function getCurrentParentId() {
    var params = getHashParams();
    return params.get('parentId') || params.get('topParentId') || '';
  }

  function isTargetLibrary() {
    return FORCE_PARENT_IDS.indexOf(getCurrentParentId()) !== -1;
  }

  function isImageTypeKey(key) {
    return typeof key === 'string' && /-imageType$/.test(key);
  }

  function isClassicViewKey(key) {
    return typeof key === 'string' && (/-_view$/.test(key) || /-view$/.test(key));
  }

  function shouldControlKey(key) {
    return isTargetLibrary() && (isImageTypeKey(key) || isClassicViewKey(key));
  }

  function scopedKey(key) {
    return getCurrentParentId() + '::' + key;
  }

  function defaultValueForKey(key) {
    if (isImageTypeKey(key)) return DEFAULT_IMAGE_TYPE;
    if (isClassicViewKey(key)) return DEFAULT_CLASSIC_VIEW;
    return null;
  }

  function patchUserSettings(userSettings) {
    if (!userSettings || userSettings.__forceThumbVmSelectedPatched) return;
    userSettings.__forceThumbVmSelectedPatched = true;

    var oldGet = userSettings.get.bind(userSettings);
    var oldSet = userSettings.set.bind(userSettings);

    userSettings.get = function (key, enableOnServer) {
      if (shouldControlKey(key)) {
        var k = scopedKey(key);

        if (Object.prototype.hasOwnProperty.call(tempPrefs, k)) {
          return tempPrefs[k];
        }

        return defaultValueForKey(key);
      }

      return oldGet(key, enableOnServer);
    };

    userSettings.set = function (key, value, enableOnServer) {
      if (shouldControlKey(key)) {
        tempPrefs[scopedKey(key)] = value == null ? defaultValueForKey(key) : value.toString();
        saveTempPrefs();
        log('session temporary only:', key, '=>', tempPrefs[scopedKey(key)]);
        scheduleRefresh();
        return value;
      }

      return oldSet(key, value, enableOnServer);
    };

    log('patched userSettings');
    scheduleRefresh();
  }

  function patch() {
    var req = window.require || window.requirejs;
    if (!req) return;

    try {
      req(['userSettings'], patchUserSettings);
    } catch (e) {
      log('patch failed', e);
    }
  }

  function scheduleRefresh() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(refreshCurrentPage, 300);
  }

  function refreshCurrentPage() {
    if (!isTargetLibrary()) return;

    document.querySelectorAll('.itemsContainer').forEach(function (container) {
      container.classList.remove('vertical-list');
      container.classList.add('vertical-wrap');

      if (typeof container.refreshItems === 'function') {
        try {
          container.refreshItems();
        } catch (e) {}
      }
    });

    log('refresh requested', location.href);
  }

  log('loaded:', location.href);

  var timer = setInterval(patch, 500);
  setTimeout(function () {
    clearInterval(timer);
  }, 20000);

  document.addEventListener('viewshow', function () {
    patch();
    scheduleRefresh();
  }, true);

  window.addEventListener('hashchange', function () {

    setTimeout(function () {
      patch();
      scheduleRefresh();
    }, 500);
  });
})();
