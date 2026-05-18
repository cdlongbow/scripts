// CustomCssJS Provider: replace Emby's native trailer button with an external trailer source.
// If Emby hides the native trailer button because NFO has no trailer URL, this script injects
// a compatible trailer button for the enabled libraries.
(function () {
    "use strict";

    const SCRIPT_KEY = "__customTrailerInstalled";
    if (window[SCRIPT_KEY]) return;
    window[SCRIPT_KEY] = true;

    console.log("[CustomTrailer] Script loaded");

    // Only intercept trailer clicks inside these Emby library ids.
    const ENABLED_LIBRARIES = [
        "565020"
    ];

    const API_BASE = "https://javp.cc.cd/trailers/";
    const CUSTOM_BUTTON_CLASS = "custom-trailer-button";
    const CUSTOM_BUTTON_SELECTOR = "." + CUSTOM_BUTTON_CLASS;
    const CUSTOM_ACTIONS_CLASS = "custom-trailer-actions";
    const CUSTOM_STYLE_ID = "custom-trailer-style";
    const TRAILER_BUTTON_SELECTOR = [
        CUSTOM_BUTTON_SELECTOR,
        ".itemTrailerButton",
        ".btnPlayTrailer",
        "[data-action='playTrailer']",
        "[data-action='playtrailer']",
        "button[title*='Trailer']",
        "button[aria-label*='Trailer']",
        "button[title*='预告']",
        "button[aria-label*='预告']"
    ].join(",");

    let isHandlingClick = false;
    let scanTimer = null;
    let lastEnabledLibraryId = getEnabledLibraryIdFromLocation();

    window.addEventListener("click", handleTrailerClick, true);
    document.addEventListener("click", handleTrailerClick, true);
    window.addEventListener("hashchange", scheduleEnsureTrailerButtonBurst);
    window.addEventListener("popstate", scheduleEnsureTrailerButtonBurst);
    window.addEventListener("pageshow", scheduleEnsureTrailerButtonBurst);

    startTrailerButtonObserver();
    installDebugApi();

    function handleTrailerClick(e) {
        if (isInsideTrailerOverlay(e.target)) return;

        const btn = findTrailerButton(e.target);
        if (!btn) return;

        const detailRoot = getVisibleDetailRoot() || getDetailRootForNode(btn);
        const libraryId = getCurrentLibraryId(detailRoot || btn, { allowGlobalFallback: true });
        console.log("[CustomTrailer] 当前 LibraryId:", libraryId);

        if (!libraryId || !ENABLED_LIBRARIES.includes(libraryId)) {
            console.log("[CustomTrailer] 当前库未启用脚本，放行 Emby 原生预告片");
            return;
        }

        // This must happen synchronously, before any async lookup, otherwise Emby may still
        // receive the same click and open its native trailer player.
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === "function") {
            e.stopImmediatePropagation();
        }

        if (isHandlingClick) return;
        isHandlingClick = true;

        openTrailerForCurrentPage({
            root: detailRoot,
            button: btn,
            number: btn.dataset.customTrailerNumber
        }).finally(() => {
            isHandlingClick = false;
        });
    }

    function isInsideTrailerOverlay(target) {
        return !!(target && target.closest && target.closest("#custom-trailer-overlay"));
    }

    function startTrailerButtonObserver() {
        if (!document.body) {
            document.addEventListener("DOMContentLoaded", startTrailerButtonObserver, { once: true });
            return;
        }

        const observer = new MutationObserver((mutations) => {
            if (mutations.some(isRelevantDetailMutation)) {
                scheduleEnsureTrailerButton();
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        scheduleEnsureTrailerButtonBurst();
    }

    function installDebugApi() {
        window.CustomTrailerDebug = function () {
            window.__customTrailerDebug = true;
            return ensureCustomTrailerButton({ forceLog: true });
        };
    }

    function isRelevantDetailMutation(mutation) {
        const nodes = [mutation.target].concat(Array.from(mutation.addedNodes || []));
        return nodes.some((node) => {
            if (!node || node.nodeType !== 1) return false;
            return !!(
                node.matches?.(".itemDetailPage, .detailPageWrapper, .page, .view, .mainDetailButtons, .detailButtons, .detailButtonContainer, .itemDetailButtons, .itemDetailButtonContainer, .buttons, .btnPlay, [data-action='resume'], [data-action='play'], [data-parentid]") ||
                node.querySelector?.(".itemDetailPage, .detailPageWrapper, .page, .view, .mainDetailButtons, .detailButtons, .detailButtonContainer, .itemDetailButtons, .itemDetailButtonContainer, .buttons, .btnPlay, [data-action='resume'], [data-action='play'], [data-parentid]")
            );
        });
    }

    function scheduleEnsureTrailerButton() {
        clearTimeout(scanTimer);
        scanTimer = setTimeout(ensureCustomTrailerButton, 350);
    }

    function scheduleEnsureTrailerButtonBurst() {
        [300, 900, 1800].forEach((delay) => {
            setTimeout(ensureCustomTrailerButton, delay);
        });
    }

    function ensureCustomTrailerButton(options) {
        const forceLog = !!(options && options.forceLog);
        if (document.getElementById("custom-trailer-overlay")) {
            return debugEnsureSkipped("播放器已打开，跳过补按钮", null, forceLog);
        }

        if (isLibraryListUrl()) {
            removeCustomTrailerButtons(document);
            return debugEnsureSkipped("当前是库列表页，跳过补按钮", collectEnsureState(), forceLog);
        }

        const detailRoot = getVisibleDetailRoot() || document.body;
        const number = extractNumberFromPage(detailRoot) || extractNumberFromPage(document);
        if (!number) {
            removeCustomTrailerButtons(document);
            return debugEnsureSkipped("未找到当前详情页番号", collectEnsureState(), forceLog);
        }

        const libraryId = getCurrentLibraryId(detailRoot, { allowGlobalFallback: true });
        const isEnabledLibrary = libraryId && ENABLED_LIBRARIES.includes(libraryId);
        const actionContainer = findDetailActionContainer(detailRoot) || ensureFallbackActionContainer(detailRoot);
        const nativeButton = findNativeTrailerButton(detailRoot);

        if (!isEnabledLibrary || !actionContainer || nativeButton) {
            if (isEnabledLibrary && detailRoot.querySelector(CUSTOM_BUTTON_SELECTOR)) {
                removeCustomTrailerButtons(detailRoot);
            }

            return debugEnsureSkipped("跳过补按钮", {
                libraryId,
                isEnabledLibrary,
                hasActionContainer: !!actionContainer,
                hasNativeButton: !!nativeButton,
                number
            }, forceLog);
        }

        if (actionContainer.querySelector(CUSTOM_BUTTON_SELECTOR)) {
            return debugEnsureSkipped("自定义预告片按钮已存在", {
                libraryId,
                number
            }, forceLog);
        }

        removeCustomTrailerButtons(detailRoot);
        ensureCustomTrailerStyles();
        insertCustomTrailerButton(actionContainer, createCustomTrailerButton(number));
        console.log("[CustomTrailer] 已补充自定义预告片按钮:", number || "点击时提取");
        return true;
    }

    function getVisibleDetailRoot() {
        const actionContainer = findVisibleDetailActionContainer();
        if (actionContainer) {
            const root = actionContainer.closest(".itemDetailPage, .detailPageWrapper, .page, .view") || document.body;
            return looksLikeDetailRoot(root) ? root : null;
        }

        const roots = Array.from(document.querySelectorAll(".itemDetailPage, .detailPageWrapper, .page, .view"));
        return roots.find((root) => {
            return isElementVisible(root) && looksLikeDetailRoot(root);
        }) || null;
    }

    function getDetailRootForNode(node) {
        if (!node || !node.closest) return null;
        return node.closest(".itemDetailPage, .detailPageWrapper");
    }

    function findNativeTrailerButton(root) {
        return Array.from(root.querySelectorAll(TRAILER_BUTTON_SELECTOR)).find((btn) => {
            return !btn.classList.contains(CUSTOM_BUTTON_CLASS) &&
                (btn.matches("button") || btn.classList.contains("emby-button") || btn.classList.contains("paper-icon-button-light")) &&
                !isInsideTrailerOverlay(btn) &&
                isElementVisible(btn);
        }) || null;
    }

    function findVisibleDetailActionContainer() {
        const selectors = [
            ".mainDetailButtons",
            ".detailButtons",
            ".detailButtonContainer",
            ".itemDetailButtons",
            ".itemDetailButtonContainer",
            ".detailPagePrimaryContainer .buttons",
            ".detailPagePrimaryContent .buttons"
        ];

        for (const selector of selectors) {
            const match = Array.from(document.querySelectorAll(selector)).find((node) => {
                const container = getActionContainerFromNode(node);
                return container && isElementVisible(container) && looksLikeDetailRoot(container.closest(".itemDetailPage, .detailPageWrapper, .page, .view") || document.body);
            });
            if (match) return getActionContainerFromNode(match);
        }

        return null;
    }

    function findDetailActionContainer(root) {
        const scope = root || document;
        const selectors = [
            ".mainDetailButtons",
            ".detailButtons",
            ".detailButtonContainer",
            ".itemDetailButtons",
            ".itemDetailButtonContainer",
            ".detailButtonWrapper",
            ".itemDetailPageButtons",
            ".mediaInfoButtons",
            ".primaryMediaInfo .buttons",
            ".detailPagePrimaryContainer .buttons",
            ".detailPagePrimaryContent .buttons"
        ];

        for (const selector of selectors) {
            const container = scope.querySelector(selector);
            if (container && !isInsideTrailerOverlay(container) && isElementVisible(container)) return container;
        }

        const anchorButton = scope.querySelector(".btnPlay, [data-action='resume'], [data-action='play']");
        return anchorButton && !isInsideTrailerOverlay(anchorButton) ? getActionContainerFromNode(anchorButton) : null;
    }

    function ensureFallbackActionContainer(root) {
        const scope = root || document.body;
        const existing = scope.querySelector("." + CUSTOM_ACTIONS_CLASS);
        if (existing) return existing;

        const title = findTitleElement(scope);
        if (!title || !title.parentElement) return null;

        const container = document.createElement("div");
        container.className = CUSTOM_ACTIONS_CLASS;
        title.insertAdjacentElement("afterend", container);
        return container;
    }

    function findTitleElement(scope) {
        const root = scope || document;
        const selectors = [
            ".itemName",
            ".itemNameOriginal",
            ".detailPagePrimaryContent .itemName",
            ".detailPagePrimaryContainer .itemName",
            "h1",
            ".title",
            ".itemTitle",
            ".mediaTitle"
        ];

        for (const selector of selectors) {
            const el = root.querySelector?.(selector) || document.querySelector(selector);
            if (el && isElementVisible(el) && extractNumber(el.textContent)) return el;
        }

        return null;
    }

    function getActionContainerFromNode(node) {
        if (!node) return null;

        if (node.matches?.(".mainDetailButtons, .detailButtons, .detailButtonContainer, .itemDetailButtons, .itemDetailButtonContainer")) {
            return node;
        }

        return node.closest?.(".mainDetailButtons, .detailButtons, .detailButtonContainer, .itemDetailButtons, .itemDetailButtonContainer, .buttons") ||
            node.parentElement ||
            null;
    }

    function looksLikeDetailRoot(root) {
        if (!root) return false;
        const hasDetailShell = !!root.querySelector?.(".detailPagePrimaryContent, .detailPageContent, .mainDetailButtons, .detailButtons, .itemDetailButtons");
        const hasTitleNumber = getTitleCandidates(root).some((candidate) => !!extractNumber(candidate));
        return hasDetailShell && hasTitleNumber;
    }

    function isElementVisible(el) {
        if (!el || !el.isConnected) return false;
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") return false;
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    }

    function removeCustomTrailerButtons(root) {
        root.querySelectorAll(CUSTOM_BUTTON_SELECTOR).forEach((btn) => btn.remove());
    }

    function insertCustomTrailerButton(container, btn) {
        const playButton = container.querySelector(".btnPlay, [data-action='resume'], [data-action='play']");
        if (playButton && playButton.nextSibling) {
            container.insertBefore(btn, playButton.nextSibling);
            return;
        }

        container.appendChild(btn);
    }

    function createCustomTrailerButton(number) {
        let btn;
        try {
            btn = document.createElement("button", { is: "emby-button" });
        } catch (err) {
            btn = document.createElement("button");
        }

        btn.type = "button";
        btn.className = CUSTOM_BUTTON_CLASS + " detailButton emby-button";
        btn.setAttribute("is", "emby-button");
        btn.setAttribute("title", "预告片");
        btn.setAttribute("aria-label", "预告片");
        if (number) {
            btn.dataset.customTrailerNumber = number;
        }
        btn.innerHTML = `
            <span class="material-icons custom-trailer-icon" aria-hidden="true">movie</span>
            <span class="custom-trailer-label">预告片</span>
        `;

        return btn;
    }

    function ensureCustomTrailerStyles() {
        if (document.getElementById(CUSTOM_STYLE_ID)) return;

        const style = document.createElement("style");
        style.id = CUSTOM_STYLE_ID;
        style.textContent = `
            .${CUSTOM_ACTIONS_CLASS} {
                display: flex;
                align-items: center;
                gap: .35em;
                margin: .45em 0 .65em;
            }

            .${CUSTOM_BUTTON_CLASS} {
                display: inline-flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-width: 5.2em;
                min-height: 4.5em;
                margin: .25em .35em;
                padding: .45em .65em;
                color: inherit;
                background: transparent;
                border: 0;
                border-radius: .35em;
                cursor: pointer;
                vertical-align: top;
            }

            .${CUSTOM_BUTTON_CLASS}:hover,
            .${CUSTOM_BUTTON_CLASS}:focus-visible {
                background: rgba(255, 255, 255, .1);
                outline: none;
            }

            .${CUSTOM_BUTTON_CLASS} .custom-trailer-icon {
                font-family: "Material Icons", "Material Symbols Outlined", "Material Icons Round", sans-serif;
                font-size: 2em;
                line-height: 1;
                pointer-events: none;
            }

            .${CUSTOM_BUTTON_CLASS} .custom-trailer-label {
                margin-top: .25em;
                font-size: .86em;
                line-height: 1.2;
                pointer-events: none;
                white-space: nowrap;
            }
        `;
        document.head.appendChild(style);
    }

    function collectEnsureState() {
        return {
            href: location.href,
            enabledLibraryFromLocation: getEnabledLibraryIdFromLocation(),
            lastEnabledLibraryId,
            itemDetailPageCount: document.querySelectorAll(".itemDetailPage").length,
            detailPageWrapperCount: document.querySelectorAll(".detailPageWrapper").length,
            pageCount: document.querySelectorAll(".page").length,
            viewCount: document.querySelectorAll(".view").length,
            actionContainerCount: document.querySelectorAll(".mainDetailButtons, .detailButtons, .detailButtonContainer, .itemDetailButtons, .itemDetailButtonContainer, .buttons").length,
            playButtonCount: document.querySelectorAll(".btnPlay, [data-action='resume'], [data-action='play']").length,
            itemName: document.querySelector(".itemName")?.textContent || "",
            title: document.title
        };
    }

    function debugEnsureSkipped(message, detail, forceLog) {
        if (!forceLog && !window.__customTrailerDebug) return false;
        console.log("[CustomTrailer]", message, detail || "");
        return false;
    }

    function findTrailerButton(target) {
        if (!target || !target.closest) return null;

        const direct = target.closest(TRAILER_BUTTON_SELECTOR);
        if (direct) return direct;

        const button = target.closest("button, .emby-button, .paper-icon-button-light");
        if (!button) return null;

        const text = [
            button.className,
            button.getAttribute("title"),
            button.getAttribute("aria-label"),
            button.getAttribute("data-action"),
            button.textContent
        ].filter(Boolean).join(" ").toLowerCase();

        return /trailer|预告/.test(text) ? button : null;
    }

    function getCurrentLibraryId(btn, options) {
        const allowGlobalFallback = !!(options && options.allowGlobalFallback);
        const scope = getDetailRootForNode(btn) || btn;
        const candidates = [
            scope?.dataset?.parentid,
            scope?.closest?.("[data-parentid]")?.dataset.parentid,
            scope?.querySelector?.("[data-parentid]")?.dataset.parentid,
            getEnabledLibraryIdFromLocation()
        ].filter(Boolean);

        if (allowGlobalFallback) {
            const globalCandidates = [
                lastEnabledLibraryId,
                document.querySelector(".itemDetailPage [data-parentid]")?.dataset.parentid,
                document.querySelector(".detailPageWrapper [data-parentid]")?.dataset.parentid,
                document.querySelector("[data-parentid]")?.dataset.parentid
            ].filter(Boolean);

            candidates.push(...globalCandidates);
        }

        const enabledId = candidates.find((id) => ENABLED_LIBRARIES.includes(id));
        if (enabledId) {
            lastEnabledLibraryId = enabledId;
            return enabledId;
        }

        return candidates[0] || null;
    }

    function getEnabledLibraryIdFromLocation() {
        const href = location.href || "";
        return ENABLED_LIBRARIES.find((id) => {
            return href.includes("parentId=" + encodeURIComponent(id)) ||
                href.includes("parentid=" + encodeURIComponent(id)) ||
                href.includes("/items/" + encodeURIComponent(id));
        }) || null;
    }

    function isLibraryListUrl() {
        const href = location.href || "";
        return /[?&]parentId=/i.test(href) && /#!\/videos/i.test(href);
    }

    async function openTrailerForCurrentPage(context) {
        const root = context?.root || getVisibleDetailRoot() || getDetailRootForNode(context?.button);
        const number = normalizeNumber(context?.number) ||
            extractNumberFromPage(root) ||
            extractNumberFromButtonContext(context?.button);
        console.log("[CustomTrailer] 番号提取结果:", number);

        if (!number) {
            alert("无法从页面提取番号");
            return;
        }

        const trailerUrl = await fetchTrailer(number);
        if (!trailerUrl) {
            alert("未找到预告片：" + number);
            return;
        }

        playTrailerOverlay(trailerUrl);
    }

    function extractNumberFromPage(root) {
        const scope = root || getVisibleDetailRoot() || document;
        return extractNumberFromCandidates(getTitleCandidates(scope));
    }

    function extractNumberFromButtonContext(button) {
        if (!button || !button.closest) return null;

        return extractNumberFromCandidates([
            button.closest("[data-itemid]")?.getAttribute("title"),
            button.closest("[title]")?.getAttribute("title"),
            document.querySelector(".itemName")?.textContent,
            document.title
        ]);
    }

    function getTitleCandidates(scope) {
        const root = scope || document;
        const candidates = [
            root.querySelector?.(".itemName")?.textContent,
            root.querySelector?.(".itemNameOriginal")?.textContent,
            root.querySelector?.(".detailPagePrimaryContent .itemName")?.textContent,
            root.querySelector?.(".detailPagePrimaryContainer .itemName")?.textContent,
            root.querySelector?.("h1")?.textContent,
            root.querySelector?.(".title")?.textContent,
            root.querySelector?.(".itemTitle")?.textContent,
            root.querySelector?.(".mediaTitle")?.textContent,
            root.querySelector?.("[data-itemid][title]")?.getAttribute("title"),
            document.querySelector(".itemName")?.textContent,
            document.querySelector("h1")?.textContent,
            document.title
        ];

        return candidates
            .map((value) => String(value || "").trim())
            .filter(Boolean)
            .filter((value, index, arr) => arr.indexOf(value) === index);
    }

    function extractNumberFromCandidates(candidates) {
        for (const candidate of candidates) {
            const number = extractNumber(candidate);
            if (number) return number;
        }

        return null;
    }

    function normalizeNumber(number) {
        return number ? extractNumber(String(number)) || String(number).toLowerCase() : null;
    }

    function extractNumber(text) {
        if (!text) return null;

        const patterns = [
            /\bfc2(?:[-_\s]*ppv)?[-_\s]*(\d{5,8})\b/i,
            /\b(\d{2,6}[a-z]{2,10})[-_\s]*(\d{2,7})\b/i,
            /\b([a-z]{2,10})[-_\s]*(\d{2,7})\b/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (!match) continue;

            if (/^fc2/i.test(match[0])) {
                return "fc2-ppv-" + match[1];
            }

            const prefix = match[1].toLowerCase();
            if (isIgnoredNumberPrefix(prefix)) continue;

            return prefix + "-" + match[2];
        }

        return null;
    }

    function isIgnoredNumberPrefix(prefix) {
        return [
            "tv",
            "season",
            "episode",
            "part",
            "disc",
            "cd",
            "dvd",
            "bluray",
            "video",
            "movie"
        ].includes(prefix);
    }

    async function fetchTrailer(number) {
        const url = API_BASE + encodeURIComponent(number);
        console.log("[CustomTrailer] 请求接口:", url);

        try {
            const res = await fetch(url, {
                cache: "no-store",
                headers: {
                    "Accept": "application/json"
                }
            });

            if (!res.ok) {
                console.warn("[CustomTrailer] API HTTP error:", res.status, res.statusText);
                return null;
            }

            const data = await res.json();
            return data && data.trailer ? data.trailer : null;
        } catch (err) {
            console.error("[CustomTrailer] API 错误:", err);
            return null;
        }
    }

    function playTrailerOverlay(url) {
        const old = document.getElementById("custom-trailer-overlay");
        if (old) old.remove();

        const overlay = document.createElement("div");
        overlay.id = "custom-trailer-overlay";
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,.85);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            box-sizing: border-box;
        `;

        const box = document.createElement("div");
        box.style.cssText = `
            width: min(960px, 100%);
            background: #000;
            position: relative;
            box-shadow: 0 0 20px rgba(0,0,0,.8);
        `;

        const close = document.createElement("button");
        close.type = "button";
        close.textContent = "×";
        close.setAttribute("aria-label", "关闭");
        close.style.cssText = `
            position: absolute;
            top: 6px;
            right: 10px;
            z-index: 3;
            font-size: 26px;
            line-height: 1;
            color: #fff;
            background: transparent;
            border: none;
            cursor: pointer;
        `;

        const volumeHud = document.createElement("div");
        volumeHud.style.cssText = `
            position: absolute;
            top: 10px;
            right: 48px;
            z-index: 2;
            color: #fff;
            background: transparent;
            border: 0;
            padding: 0;
            font-size: 14px;
            font-weight: 600;
            line-height: 1;
            text-align: center;
            text-shadow: 0 1px 3px rgba(0, 0, 0, .9);
            pointer-events: none;
            opacity: 0;
            transition: opacity .18s ease;
        `;

        const video = document.createElement("video");
        video.src = url;
        video.controls = true;
        video.autoplay = true;
        video.preload = "auto";
        video.playsInline = true;
        video.tabIndex = 0;
        video.style.cssText = `
            width: 100%;
            height: auto;
            display: block;
            background: #000;
        `;

        let hudTimer = null;

        const setVolume = (value) => {
            video.volume = Math.min(1, Math.max(0, value));
            showVolumeHud();
        };

        const showVolumeHud = () => {
            volumeHud.textContent = Math.round(video.volume * 100) + "%";
            volumeHud.style.opacity = "1";
            clearTimeout(hudTimer);
            hudTimer = setTimeout(() => {
                volumeHud.style.opacity = "0";
            }, 1000);
        };

        const cleanup = () => {
            clearTimeout(hudTimer);
            video.pause();
            video.removeAttribute("src");
            video.load();
            overlay.remove();
            document.removeEventListener("keydown", keyHandler, true);
        };

        close.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (typeof e.stopImmediatePropagation === "function") {
                e.stopImmediatePropagation();
            }
            cleanup();
        });
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) cleanup();
        });

        const savedVolume = localStorage.getItem("customTrailerVolume");
        if (savedVolume !== null) {
            const volume = parseFloat(savedVolume);
            if (!Number.isNaN(volume)) video.volume = Math.min(1, Math.max(0, volume));
        }

        const savedTime = localStorage.getItem("customTrailerTime_" + url);
        video.addEventListener("loadedmetadata", () => {
            if (savedTime === null) return;

            const time = parseFloat(savedTime);
            if (!Number.isNaN(time) && Number.isFinite(video.duration)) {
                video.currentTime = Math.min(time, Math.max(0, video.duration - 1));
            }
        }, { once: true });

        video.addEventListener("volumechange", () => {
            localStorage.setItem("customTrailerVolume", video.volume);
            showVolumeHud();
        });

        video.addEventListener("timeupdate", () => {
            localStorage.setItem("customTrailerTime_" + url, video.currentTime);
        });

        video.addEventListener("error", () => {
            const code = video.error ? video.error.code : "unknown";
            console.error("[CustomTrailer] video 播放失败:", code, url);
            alert("预告片地址无法播放，请返回后重试或换一个影片。\n" + url);
        }, { once: true });

        const keyHandler = (e) => {
            if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                e.preventDefault();
                e.stopPropagation();
            }

            if (e.key === "Escape") {
                cleanup();
                return;
            }

            if (e.key === " " || e.code === "Space") {
                if (video.paused) {
                    video.play().catch((err) => console.warn("[CustomTrailer] play failed:", err));
                } else {
                    video.pause();
                }
            }

            if (e.key === "ArrowUp") {
                setVolume(video.volume + 0.05);
            }
            if (e.key === "ArrowDown") {
                setVolume(video.volume - 0.05);
            }
            if (e.key === "ArrowRight" && Number.isFinite(video.duration)) {
                video.currentTime = Math.min(video.duration, video.currentTime + 2);
            }
            if (e.key === "ArrowLeft") {
                video.currentTime = Math.max(0, video.currentTime - 2);
            }
        };

        document.addEventListener("keydown", keyHandler, true);

        box.appendChild(close);
        box.appendChild(volumeHud);
        box.appendChild(video);
        overlay.appendChild(box);
        document.body.appendChild(overlay);

        setTimeout(() => {
            video.focus();
            video.play().catch((err) => console.warn("[CustomTrailer] autoplay failed:", err));
        }, 50);
    }
})();
