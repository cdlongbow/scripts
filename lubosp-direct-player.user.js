// ==UserScript==
// @name         lubosp direct m3u8 player
// @namespace    https://www.lubosp.com/
// @version      1.0.0
// @description  Replace cover vod.jpg with index.m3u8 and open an overlay player.
// @match        https://www.lubosp.com/*
// @require      https://cdn.jsdelivr.net/npm/hls.js@latest
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  const HOST = 'googlebaidusoso360.shanxianzhijia.top';
  const IMAGE_RE = /https?:\/\/(?:[^/]+\/video\/\d{8}\/[^/]+)\/vod\.jpg/i;
  const DETAIL_RE = /\/type01\/column12\/\d+\.html$/i;

  function toM3U8(url) {
    if (!url) return '';
    return String(url).replace(/\/vod\.jpg(?:\?.*)?$/i, '/index.m3u8');
  }

  function isTargetDetailUrl(url) {
    try {
      const u = new URL(url, location.href);
      return u.hostname === location.hostname && DETAIL_RE.test(u.pathname);
    } catch {
      return false;
    }
  }

  function extractVideoUrlFromScope(scope) {
    if (!scope) return '';
    const img = scope.querySelector && scope.querySelector(`img[src*="${HOST}"][src*="/vod.jpg"]`);
    if (img && img.src) return toM3U8(img.src);
    return '';
  }

  function extractVideoUrl() {
    const fromDom = extractVideoUrlFromScope(document);
    if (fromDom) return fromDom;

    const textMatch = document.documentElement.innerHTML.match(IMAGE_RE);
    if (textMatch) return toM3U8(textMatch[0]);

    const og = document.querySelector('meta[property="og:image"]');
    if (og && og.content && og.content.includes('/vod.jpg')) return toM3U8(og.content);

    return '';
  }

  function injectStyles() {
    GM_addStyle(`
      #cx-player-overlay { display: flex !important; position: fixed !important; inset: 0 !important; z-index: 2147483647 !important; background: #000 !important; align-items: center !important; justify-content: center !important; }
      #cx-player-shell { position: relative !important; width: 100vw !important; height: 100vh !important; background: #000 !important; }
      #cx-video { width: 100% !important; height: 100% !important; background: #000 !important; }
      #cx-close { position: absolute !important; top: 12px !important; right: 12px !important; z-index: 2 !important; border: 0 !important; border-radius: 999px !important; width: 40px !important; height: 40px !important; color: #fff !important; background: rgba(255,255,255,.16) !important; font-size: 24px !important; cursor: pointer !important; }
      #cx-tip { position: absolute !important; left: 12px !important; top: 12px !important; z-index: 2 !important; color: #fff !important; font: 14px/1.4 system-ui, sans-serif !important; background: rgba(0,0,0,.35) !important; padding: 8px 10px !important; border-radius: 8px !important; }
      .cx-hide-page > body > :not(#cx-player-overlay) { display: none !important; }
      .cx-hide-page, .cx-hide-page body { overflow: hidden !important; background: #000 !important; }
    `);
  }

  function loadHlsScript() {
    return new Promise((resolve, reject) => {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.onload = () => resolve(window.Hls);
      script.onerror = reject;
      document.documentElement.appendChild(script);
    });
  }

  async function playM3U8(video, videoUrl) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      video.play().catch(() => {});
      return;
    }

    try {
      const Hls = await loadHlsScript();
      if (Hls && Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
        return;
      }
    } catch {
      // Fall back to direct src so the browser can still try.
    }

    video.src = videoUrl;
    video.play().catch(() => {});
  }

  function createOverlay(videoUrl) {
    if (!videoUrl) return;
    injectStyles();
    document.documentElement.classList.add('cx-hide-page');
    const old = document.querySelector('#cx-player-overlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'cx-player-overlay';
    overlay.innerHTML = `
      <div id="cx-player-shell">
        <div id="cx-tip">Page blocked. Playing m3u8 directly.</div>
        <button id="cx-close" aria-label="close">x</button>
        <video id="cx-video" controls autoplay playsinline webkit-playsinline></video>
      </div>
    `;
    document.documentElement.appendChild(overlay);

    const video = overlay.querySelector('#cx-video');
    const close = overlay.querySelector('#cx-close');
    playM3U8(video, videoUrl);

    close.addEventListener('click', () => {
      overlay.remove();
      document.documentElement.classList.remove('cx-hide-page');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        overlay.remove();
        document.documentElement.classList.remove('cx-hide-page');
      }
    }, { once: true });
  }

  function hijackClicks() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;

      const container = a.closest('li, .vodlist_thumb, .module-item, .row, body');
      const videoUrl = extractVideoUrlFromScope(container) || extractVideoUrlFromScope(a);

      if (!videoUrl || (!isTargetDetailUrl(a.href) && !a.href.includes('.html'))) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      createOverlay(videoUrl);
    }, true);
  }

  function boot() {
    hijackClicks();

    if (DETAIL_RE.test(location.pathname)) {
      const videoUrl = extractVideoUrl();
      if (videoUrl) createOverlay(videoUrl);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
