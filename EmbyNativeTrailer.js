// 本脚本的作用为在 CustomCssJS 插件下：将 Emby 的原生预告片按钮替换为外部预告片源。
// 如果 Emby 因为 NFO 文件中没有预告片 URL 而隐藏了原生预告片按钮，则此脚本会注入一个新的预告片按钮
// 当用户点击预告片按钮时，脚本会尝试从页面中提取番号信息，并查找预告片并播放,特殊番号需要使用 EmbyCustomTrailerBridge.user.js 提供的桥接 API 查询
(function () {
    "use strict";

    const SCRIPT_KEY = "__customTrailerInstalled";
    if (window[SCRIPT_KEY]) return;
    window[SCRIPT_KEY] = true;

    console.log("[CustomTrailer] Script loaded");

    // Only intercept trailer clicks inside these Emby library ids.
    const ENABLED_LIBRARIES = [
        "565020",
        "565027"
    ];

    const API_BASE = "https://javp.cc.cd/trailers/";
    const TRAILER_CACHE_PREFIX = "customTrailerResult_v3_";
    const JAVP_QUALITY_OPTIONS = [
        { quality: "4k", label: "4K" },
        { quality: "hhb", label: "1080P" },
        { quality: "hmb", label: "720P" },
        { quality: "mhb", label: "576P" },
        { quality: "mmb", label: "432P" }
    ];
    const EXTRA_QUALITY_OPTIONS = [
        { quality: "1080p", label: "1080P" },
        { quality: "720p", label: "720P" },
        { quality: "540p", label: "540P" },
        { quality: "480p", label: "480P" },
        { quality: "396p", label: "396P" },
        { quality: "360p", label: "360P" },
        { quality: "240p", label: "240P" }
    ];
    const ALL_QUALITY_OPTIONS = JAVP_QUALITY_OPTIONS.concat(EXTRA_QUALITY_OPTIONS);
    const MGSTAGE_PREFIX_MAP = {
        LUXU: "259LUXU",
        MIUM: "300MIUM",
        GANA: "200GANA",
        SIRO: "SIRO",
        DCV: "277DCV",
        JNT: "390JNT",
        JAC: "390JAC",
        HHH: "451HHH",
        HLM: "436HLM",
        SYS: "332SYS",
        NAMA: "332NAMA",
        HEN: "353HEN",
        ARA: "261ARA"
    };
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
    let ensureRunId = 0;
    const itemLibraryCache = new Map();
    const itemLibraryPending = new Map();

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
        const clickScope = detailRoot || btn;
        const itemId = getCurrentItemId(clickScope);
        const isCustomButton = btn.classList?.contains(CUSTOM_BUTTON_CLASS);
        const cachedState = getCachedLibraryState(clickScope);
        const buttonLibraryId = isCustomButton ? btn.dataset.customTrailerLibraryId : null;
        const libraryId = cachedState?.enabled ? cachedState.libraryId : buttonLibraryId;
        console.log("[CustomTrailer] 当前 API LibraryId:", libraryId || null, "itemId:", itemId);

        if (isCustomButton && btn.dataset.customTrailerItemId && itemId && btn.dataset.customTrailerItemId !== String(itemId)) {
            removeCustomTrailerButtons(document);
            console.log("[CustomTrailer] 自定义按钮已过期，忽略本次点击");
            return;
        }

        if (!libraryId || !isEnabledLibraryId(libraryId)) {
            if (itemId && !cachedState) {
                resolveLibraryStateByItemId(itemId);
            }
            console.log("[CustomTrailer] API 未确认当前项目属于启用库，放行 Emby 原生预告片");
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
        return !!(target && target.closest && target.closest("#custom-trailer-overlay, .trailer-overlay, .jav-player-close"));
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
                node.matches?.(".itemDetailPage, .detailPageWrapper, .page, .view, .mainDetailButtons, .detailButtons, .detailButtonContainer, .itemDetailButtons, .itemDetailButtonContainer, .buttons, .btnPlay, [data-action='resume'], [data-action='play'], [data-itemid]") ||
                node.querySelector?.(".itemDetailPage, .detailPageWrapper, .page, .view, .mainDetailButtons, .detailButtons, .detailButtonContainer, .itemDetailButtons, .itemDetailButtonContainer, .buttons, .btnPlay, [data-action='resume'], [data-action='play'], [data-itemid]")
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

    async function ensureCustomTrailerButton(options) {
        const runId = ++ensureRunId;
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

        const libraryState = await resolveCurrentLibraryState(detailRoot);
        if (runId !== ensureRunId) {
            return debugEnsureSkipped("已有新的详情页检测，忽略本次结果", {
                libraryState,
                number
            }, forceLog);
        }

        const libraryId = libraryState?.libraryId || null;
        const isEnabledLibrary = libraryId && isEnabledLibraryId(libraryId);
        const actionContainer = findDetailActionContainer(detailRoot) || ensureFallbackActionContainer(detailRoot);
        const nativeButton = findNativeTrailerButton(detailRoot);

        if (!isEnabledLibrary || !actionContainer || nativeButton) {
            if (detailRoot.querySelector(CUSTOM_BUTTON_SELECTOR)) {
                removeCustomTrailerButtons(detailRoot);
            }

            return debugEnsureSkipped("跳过补按钮", {
                libraryId,
                isEnabledLibrary,
                hasActionContainer: !!actionContainer,
                hasNativeButton: !!nativeButton,
                itemId: libraryState?.itemId || getCurrentItemId(detailRoot),
                number
            }, forceLog);
        }

        if (actionContainer.querySelector(CUSTOM_BUTTON_SELECTOR)) {
            return debugEnsureSkipped("自定义预告片按钮已存在", {
                libraryId,
                itemId: libraryState?.itemId || getCurrentItemId(detailRoot),
                number
            }, forceLog);
        }

        removeCustomTrailerButtons(detailRoot);
        ensureCustomTrailerStyles();
        insertCustomTrailerButton(actionContainer, createCustomTrailerButton(number, libraryState));
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

    function createCustomTrailerButton(number, libraryState) {
        let btn;
        try {
            btn = document.createElement("button", { is: "emby-button" });
        } catch (err) {
            btn = document.createElement("button");
        }

        btn.type = "button";
        btn.className = "btnPlayTrailer btnPlayTrailer-main raised detailButton emby-button button-hoverable detailButton-stacked " + CUSTOM_BUTTON_CLASS;
        btn.setAttribute("is", "emby-button");
        btn.setAttribute("title", "预告片");
        btn.setAttribute("aria-label", "预告片");
        if (number) {
            btn.dataset.customTrailerNumber = number;
        }
        if (libraryState?.itemId) {
            btn.dataset.customTrailerItemId = String(libraryState.itemId);
        }
        if (libraryState?.libraryId) {
            btn.dataset.customTrailerLibraryId = String(libraryState.libraryId);
        }
        btn.innerHTML = `
            <i class="md-icon button-icon button-icon-left"></i>
            <span>预告片</span>
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
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }

    function collectEnsureState() {
        const root = getVisibleDetailRoot() || document;
        const itemId = getCurrentItemId(root);
        const cachedLibraryState = itemId ? itemLibraryCache.get(String(itemId)) || null : null;
        return {
            href: location.href,
            itemId,
            cachedLibraryState,
            hasPendingLibraryLookup: itemId ? itemLibraryPending.has(String(itemId)) : false,
            enabledLibraries: ENABLED_LIBRARIES.slice(),
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

    function isEnabledLibraryId(id) {
        return ENABLED_LIBRARIES.includes(String(id || ""));
    }

    function getCurrentItemId(scope) {
        return getItemIdFromLocation() || getItemIdFromDom(scope);
    }

    function getItemIdFromLocation() {
        const href = location.href || "";
        const hash = location.hash || "";
        const matches = [
            href.match(/[?&]id=([^&#]+)/i),
            href.match(/[?&]itemId=([^&#]+)/i),
            hash.match(/[?&]id=([^&#]+)/i),
            hash.match(/[?&]itemId=([^&#]+)/i),
            href.match(/#!\/item\/([^?&#/]+)/i),
            href.match(/\/items\/([^?&#/]+)/i)
        ];

        for (const match of matches) {
            if (match && match[1]) return decodeURIComponent(match[1]);
        }

        return null;
    }

    function getItemIdFromDom(scope) {
        const root = scope || getVisibleDetailRoot() || document;
        const candidates = [
            root?.dataset?.itemid,
            root?.dataset?.itemId,
            root?.getAttribute?.("data-id"),
            root?.closest?.("[data-itemid]")?.dataset.itemid,
            root?.closest?.("[data-id]")?.getAttribute("data-id"),
            root?.querySelector?.("[data-itemid]")?.dataset.itemid,
            root?.querySelector?.("[data-id]")?.getAttribute("data-id"),
            document.querySelector(".itemDetailPage[data-itemid]")?.dataset.itemid,
            document.querySelector(".detailPageWrapper[data-itemid]")?.dataset.itemid,
            document.querySelector("[data-itemid]")?.dataset.itemid
        ].filter(Boolean);

        return candidates.find((id) => /^\d+$/.test(String(id))) || candidates[0] || null;
    }

    function getCachedLibraryState(scope) {
        const itemId = getCurrentItemId(scope);
        if (!itemId) return null;

        return itemLibraryCache.get(String(itemId)) || null;
    }

    async function resolveCurrentLibraryState(scope) {
        const itemId = getCurrentItemId(scope);
        if (!itemId) {
            return {
                enabled: false,
                libraryId: null,
                itemId: null,
                reason: "missing-item-id"
            };
        }

        return await resolveLibraryStateByItemId(itemId);
    }

    async function resolveLibraryStateByItemId(itemId) {
        const key = String(itemId || "");
        if (!key) {
            return {
                enabled: false,
                libraryId: null,
                itemId: null,
                reason: "missing-item-id"
            };
        }

        const cached = itemLibraryCache.get(key);
        if (cached) return cached;

        if (itemLibraryPending.has(key)) {
            return await itemLibraryPending.get(key);
        }

        const pending = fetchItemLibraryState(key)
            .catch((err) => {
                console.warn("[CustomTrailer] 查询媒体库归属失败:", err);
                return {
                    enabled: false,
                    libraryId: null,
                    itemId: key,
                    reason: "api-error"
                };
            })
            .then((state) => {
                itemLibraryCache.set(key, state);
                itemLibraryPending.delete(key);
                return state;
            });

        itemLibraryPending.set(key, pending);
        return await pending;
    }

    async function fetchItemLibraryState(itemId) {
        const item = await fetchEmbyItem(itemId).catch((err) => {
            console.warn("[CustomTrailer] 查询项目详情失败，继续查询祖先库:", err);
            return null;
        });
        const ancestors = await fetchEmbyItemAncestors(itemId).catch((err) => {
            console.warn("[CustomTrailer] 查询项目祖先库失败:", err);
            return [];
        });
        const ids = []
            .concat(item ? [item.ParentId, item.TopParentId, item.CollectionFolderId, item.Id] : [])
            .concat((ancestors || []).map((ancestor) => ancestor && ancestor.Id))
            .filter(Boolean)
            .map(String);
        const libraryId = ids.find(isEnabledLibraryId) || null;

        return {
            enabled: !!libraryId,
            libraryId,
            itemId: String(itemId),
            itemName: item?.Name || null,
            ancestorIds: ids
        };
    }

    function getApiClient() {
        return window.ApiClient ||
            window.Emby?.ApiClient ||
            window.require?.s?.contexts?._?.defined?.ApiClient ||
            null;
    }

    function getApiClientUserId(apiClient) {
        try {
            const direct = apiClient?.getCurrentUserId?.();
            if (direct) return direct;
        } catch (err) {
            // Some Emby builds expose getCurrentUserId as a property-like method that can throw early.
        }

        return apiClient?._serverInfo?.UserId ||
            apiClient?.serverInfo?.UserId ||
            window.Dashboard?.getCurrentUserId?.() ||
            null;
    }

    async function fetchEmbyItem(itemId) {
        const apiClient = getApiClient();
        const userId = getApiClientUserId(apiClient);

        const attempts = [
            () => apiClient?.getItem?.(userId, itemId),
            () => apiClient?.getItem?.(itemId),
            () => embyAjaxJson(apiClient, buildEmbyApiPath("/Users/" + encodeURIComponent(userId) + "/Items/" + encodeURIComponent(itemId))),
            () => embyAjaxJson(apiClient, buildEmbyApiPath("/Items/" + encodeURIComponent(itemId)))
        ];

        return await firstSuccessfulJson(attempts);
    }

    async function fetchEmbyItemAncestors(itemId) {
        const apiClient = getApiClient();
        const userId = getApiClientUserId(apiClient);

        const userQuery = userId ? "?UserId=" + encodeURIComponent(userId) : "";
        const attempts = [
            () => apiClient?.getAncestors?.(userId, itemId),
            () => apiClient?.getAncestors?.(itemId, userId),
            () => apiClient?.getAncestors?.(itemId),
            () => apiClient?.getItemAncestors?.(userId, itemId),
            () => apiClient?.getItemAncestors?.(itemId, userId),
            () => apiClient?.getItemAncestors?.(itemId),
            () => embyAjaxJson(apiClient, buildEmbyApiPath("/Items/" + encodeURIComponent(itemId) + "/Ancestors" + userQuery)),
            () => embyAjaxJson(apiClient, buildEmbyApiPath("/Users/" + encodeURIComponent(userId) + "/Items/" + encodeURIComponent(itemId) + "/Ancestors")),
            () => embyAjaxJson(apiClient, buildEmbyApiPath("/Items/" + encodeURIComponent(itemId) + "/Ancestors"))
        ];

        const result = await firstSuccessfulJson(attempts);
        if (Array.isArray(result)) return result;
        if (Array.isArray(result?.Items)) return result.Items;
        return [];
    }

    async function firstSuccessfulJson(attempts) {
        let lastError = null;
        for (const attempt of attempts) {
            try {
                const result = await attempt();
                if (result) return result;
            } catch (err) {
                lastError = err;
            }
        }

        if (lastError) throw lastError;
        return null;
    }

    function buildEmbyApiPath(path) {
        const cleanPath = String(path || "").replace(/^\/+/, "");
        return getEmbyServerBaseUrl() + cleanPath;
    }

    function getEmbyServerBaseUrl() {
        const apiClient = getApiClient();
        let base = "";

        try {
            base = typeof apiClient?.serverAddress === "function" ? apiClient.serverAddress() : "";
        } catch (err) {
            base = "";
        }

        if (!base) {
            base = apiClient?._serverAddress ||
                apiClient?.serverAddress ||
                location.origin;
        }

        base = String(base || location.origin).replace(/\/+$/, "");
        return /\/emby$/i.test(base) ? base + "/" : base + "/emby/";
    }

    async function embyAjaxJson(apiClient, url) {
        if (!url || /\/Users\/null\//i.test(url) || /\/Users\/undefined\//i.test(url)) {
            return null;
        }

        if (apiClient?.ajax) {
            const result = await apiClient.ajax({
                type: "GET",
                url,
                dataType: "json"
            });
            return typeof result === "string" ? JSON.parse(result) : result;
        }

        const headers = {
            "Accept": "application/json"
        };
        const token = getApiAccessToken(apiClient);
        if (token) headers["X-Emby-Token"] = token;

        const res = await fetch(url, {
            cache: "no-store",
            credentials: "same-origin",
            headers
        });
        if (!res.ok) throw new Error("HTTP " + res.status + " " + url);
        return await res.json();
    }

    function getApiAccessToken(apiClient) {
        try {
            const direct = apiClient?.accessToken?.();
            if (direct) return direct;
        } catch (err) {
            // Ignore and fall back to known fields/storage below.
        }

        const fieldToken = apiClient?._serverInfo?.AccessToken ||
            apiClient?.serverInfo?.AccessToken ||
            apiClient?._accessToken;
        if (fieldToken) return fieldToken;

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (!key || !/token|access/i.test(key)) continue;
                const value = localStorage.getItem(key);
                if (value && /^[A-Za-z0-9+/_=-]{20,}$/.test(value)) return value;
            }
        } catch (err) {
            // localStorage can be unavailable in restricted contexts.
        }

        return null;
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

        const rawNumber = extractNumberFromPage(root, { preserveSource: true }) ||
            extractNumberFromButtonContext(context?.button, { preserveSource: true }) ||
            normalizeNumber(context?.number) ||
            number;
        const trailer = await fetchTrailer(number, rawNumber);
        if (!trailer?.url) {
            alert("未找到预告片：" + number);
            return;
        }

        playTrailerOverlay(trailer);
    }

    function extractNumberFromPage(root, options) {
        const scope = root || getVisibleDetailRoot() || document;
        return extractNumberFromCandidates(getTitleCandidates(scope), options);
    }

    function extractNumberFromButtonContext(button, options) {
        if (!button || !button.closest) return null;

        return extractNumberFromCandidates([
            button.closest("[data-itemid]")?.getAttribute("title"),
            button.closest("[title]")?.getAttribute("title"),
            document.querySelector(".itemName")?.textContent,
            document.title
        ], options);
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

    function extractNumberFromCandidates(candidates, options) {
        for (const candidate of candidates) {
            const number = extractNumber(candidate, options);
            if (number) return number;
        }

        return null;
    }

    function normalizeNumber(number) {
        return number ? extractNumber(String(number)) || normalizeCode(number).toLowerCase() : null;
    }

    function extractNumber(text, options) {
        if (!text) return null;

        const raw = String(text);
        const mgstageHit = raw.match(/\b(\d{3}[A-Z]{2,10})[-_\s](\d{2,6})\b/i);
        if (mgstageHit) return normalizeCode(mgstageHit[1] + "-" + mgstageHit[2]).toLowerCase();

        const uncensoredHit = raw.match(/(?:(PACOPACOMAMA|PACO|10MUSUME|10MU|1PONDO|CARIBBEANCOM|CARIB|HEYZO)[-_\s]*)?(\d{6})([-_])(\d{2,3})/i);
        if (uncensoredHit) {
            if (options?.preserveSource && uncensoredHit[1]) {
                return uncensoredHit[1].toLowerCase() + "_" + normalizeCode(uncensoredHit[2] + uncensoredHit[3] + uncensoredHit[4]).toLowerCase();
            }
            return normalizeCode(uncensoredHit[2] + uncensoredHit[3] + uncensoredHit[4]).toLowerCase();
        }

        const patterns = [
            { regex: /\b([A-Z]{2,15})[-_\s]([A-Z]{1,2}\d{2,10})\b/i, type: "alphanum" },
            { regex: /\b([A-Z]{2,15})[-_\s](\d{2,10})(?:[-_](\d{1,3}))?\b/i, type: "standard" },
            { regex: /\bFC2[-\s_]?(?:PPV)?[-\s_]?(\d{5,9})\b/i, type: "fc2" },
            { regex: /\b(\d{2,6}[A-Z]{2,10})[-_\s]*(\d{2,7})\b/i, type: "mgstageCompact" },
            { regex: /\b([A-Z]{2,10})(\d{3,6})\b/i, type: "compactStandard" }
        ];

        for (const { regex, type } of patterns) {
            const match = raw.match(regex);
            if (!match) continue;

            if (type === "alphanum") {
                const prefix = match[1].toUpperCase();
                if (isIgnoredNumberPrefix(prefix)) continue;
                return normalizeCode(match[0].trim()).toLowerCase();
            }

            if (type === "standard") {
                const prefix = match[1].toUpperCase();
                if (isIgnoredNumberPrefix(prefix)) continue;
                return normalizeCode(match[3] ? prefix + "-" + match[2] + "-" + match[3] : prefix + "-" + match[2]).toLowerCase();
            }

            if (type === "fc2") {
                return normalizeCode("FC2-PPV-" + match[1]).toLowerCase();
            }

            if (type === "mgstageCompact") {
                return normalizeCode(match[1] + "-" + match[2]).toLowerCase();
            }

            if (type === "compactStandard") {
                const prefix = match[1].toUpperCase();
                if (isIgnoredNumberPrefix(prefix)) continue;
                const number = match[2].replace(/^0+(?=\d{3})/, "");
                return normalizeCode(prefix + "-" + number).toLowerCase();
            }
        }

        return null;
    }

    function normalizeCode(code) {
        const raw = String(code || "").trim();
        if (!raw) return "";

        const normalized = raw
            .replace(/\s+/g, "-")
            .replace(/^FC2[-_]?PPV[-_]?/i, "FC2-")
            .toUpperCase();

        const uncensoredNumeric = normalized.match(/(\d{6})[-_](\d{2,3})/);
        if (uncensoredNumeric) {
            const sep = uncensoredNumeric[0].includes("_") ? "_" : "-";
            return uncensoredNumeric[1] + sep + uncensoredNumeric[2];
        }

        const compact = normalized.match(/^([A-Z]{2,10})(\d{3,6})$/);
        if (compact) {
            const number = compact[2].replace(/^0+(?=\d{3})/, "");
            return compact[1] + "-" + number;
        }

        const trimmed = normalized.match(/^([A-Z0-9]{2,15}[-_]\d{2,6}(?:[-_]\d{1,3})?)/);
        if (trimmed) return trimmed[1];

        return normalized;
    }

    function isIgnoredNumberPrefix(prefix) {
        return [
            "FULLHD",
            "H264",
            "H265",
            "1080P",
            "720P",
            "480P",
            "360P",
            "PART",
            "DISC",
            "10BIT",
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
        ].map((value) => value.toLowerCase()).includes(String(prefix || "").toLowerCase());
    }

    async function fetchTrailer(number, rawNumber) {
        const query = normalizeTrailerQuery(number);
        const rawQuery = String(rawNumber || number || "").trim();
        if (!query) return null;

        const cacheKey = TRAILER_CACHE_PREFIX + query + "_" + normalizeTrailerQuery(rawQuery);
        const cached = getCachedTrailerResult(cacheKey);
        if (cached?.url) {
            console.log("[CustomTrailer] 预告片缓存命中:", query, cached);
            return cached;
        }

        const resolvers = [
            fromMgstage,
            fromDirectSamples,
            fromFc2Hub,
            fromJavpCcCd,
            fromDmmApi,
            fromDmmPlayerPage,
            fromJavSpyl
        ];

        for (const resolver of resolvers) {
            try {
                const result = await resolver(query, rawQuery);
                if (result?.url) {
                    const normalized = normalizeTrailerResult(result, query);
                    sessionStorage.setItem(cacheKey, JSON.stringify(normalized));
                    console.log("[CustomTrailer] 预告片来源:", normalized.source, normalized);
                    return normalized;
                }
            } catch (err) {
                console.warn("[CustomTrailer] resolver failed:", resolver.name, err);
            }
        }

        return null;
    }

    function getCachedTrailerResult(cacheKey) {
        try {
            const raw = sessionStorage.getItem(cacheKey);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return parsed && parsed.url ? parsed : null;
        } catch (err) {
            sessionStorage.removeItem(cacheKey);
            return null;
        }
    }

    function normalizeTrailerQuery(value) {
        return String(value || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    }

    function normalizeTrailerResult(result, code) {
        const quality = result.quality && result.qualities?.[result.quality]
            ? result.quality
            : sortQualityKeys(result.qualities)[0] || result.quality || null;
        const url = quality && result.qualities?.[quality] ? result.qualities[quality] : result.url;
        return {
            code,
            source: result.source || "预告片",
            type: result.type || "video",
            url,
            qualities: result.qualities || null,
            quality,
            urls: Array.isArray(result.urls) && result.urls.length
                ? result.urls.filter(Boolean)
                : (result.qualities ? sortQualityKeys(result.qualities).map((key) => result.qualities[key]).filter(Boolean) : [url].filter(Boolean))
        };
    }

    function trailerResult(url, source, type, extra) {
        return {
            url,
            source,
            type: type || "video",
            ...(extra || {})
        };
    }

    async function requestText(url, options) {
        if (shouldUseTrailerBridge(url)) {
            return requestTextWithBridge(url, options);
        }

        if (typeof GM_xmlhttpRequest === "function") {
            return requestTextWithGm(url, options);
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), options?.timeout || 15000);
        try {
            const res = await fetch(url, {
                method: options?.method || "GET",
                cache: "no-store",
                credentials: options?.credentials || "omit",
                headers: options?.headers || {},
                body: options?.body,
                signal: controller.signal
            });
            const text = await res.text();
            return {
                ok: res.ok,
                status: res.status,
                responseText: text,
                finalUrl: res.url || url
            };
        } finally {
            clearTimeout(timeout);
        }
    }

    function isMgstageUrl(url) {
        try {
            const host = new URL(url, location.href).hostname.toLowerCase();
            return host === "mgstage.com" || host.endsWith(".mgstage.com");
        } catch (err) {
            return false;
        }
    }

    function shouldUseTrailerBridge(url) {
        return isMgstageUrl(url) &&
            !!window.CustomTrailerBridge &&
            typeof window.CustomTrailerBridge.requestText === "function";
    }

    function getPrivilegedRequestMode(url) {
        if (typeof GM_xmlhttpRequest === "function") return "GM_xmlhttpRequest";
        if (shouldUseTrailerBridge(url)) return "TampermonkeyBridge";
        return "fetch";
    }

    async function requestTextWithBridge(url, options) {
        const result = await window.CustomTrailerBridge.requestText(url, {
            method: options?.method || "GET",
            headers: options?.headers || {},
            body: options?.body,
            timeout: options?.timeout || 15000
        });
        if (result?.error) throw new Error(result.error);
        return {
            ok: !!result?.ok,
            status: result?.status || 0,
            profile: result?.profile || "",
            responseHeaders: result?.responseHeaders || "",
            responseText: result?.responseText || "",
            finalUrl: result?.finalUrl || url
        };
    }

    function requestTextWithGm(url, options) {
        return new Promise((resolve, reject) => {
            const timeout = options?.timeout || 15000;
            GM_xmlhttpRequest({
                method: options?.method || "GET",
                url,
                headers: options?.headers || {},
                data: options?.body,
                timeout,
                onload: (res) => {
                    resolve({
                        ok: res.status >= 200 && res.status < 400,
                        status: res.status,
                        responseHeaders: res.responseHeaders || "",
                        responseText: res.responseText || "",
                        finalUrl: res.finalUrl || url
                    });
                },
                onerror: reject,
                ontimeout: () => reject(new Error("GM_xmlhttpRequest timeout: " + url))
            });
        });
    }

    async function requestJson(url, options) {
        const r = await requestText(url, options);
        if (!r.ok || !r.responseText) return null;
        try {
            return JSON.parse(r.responseText);
        } catch (err) {
            return null;
        }
    }

    async function requestDoc(url, options) {
        const r = await requestText(url, options);
        if (!r.ok || !r.responseText) return null;
        return new DOMParser().parseFromString(r.responseText, "text/html");
    }

    async function headUrl(url) {
        try {
            const res = await fetch(url, {
                method: "HEAD",
                cache: "no-store"
            });
            return res.ok || (res.status >= 200 && res.status < 400) ? (res.url || url) : null;
        } catch (err) {
            return await canLoadVideoMetadata(url) ? url : null;
        }
    }

    function getDirectSampleSourceHint(rawCode) {
        const raw = String(rawCode || "").toLowerCase();
        if (/(?:caribbeancom|carib)/.test(raw)) return "caribbean";
        if (/(?:pacopacomama|paco)/.test(raw)) return "paco";
        if (/(?:10musume|10mu)/.test(raw)) return "10mu";
        if (/(?:1pondo|1pon)/.test(raw)) return "1pondo";
        return "";
    }

    function classifyDirectSample(id, rawCode) {
        const normalized = normalizeCode(rawCode || id || "").toLowerCase();
        const hint = getDirectSampleSourceHint(rawCode);
        const hintedSourceChecks = {
            caribbean: /^[01]\d{5}-\d{2,3}$/.test(normalized),
            paco: /^\d{6}_100$/.test(normalized),
            "10mu": /^\d{6}_\d{2}$/.test(normalized),
            "1pondo": /^\d{6}_\d{3}$/.test(normalized)
        };
        const sourceChecks = {
            caribbean: /^[01]\d{5}-\d{2,3}$/.test(normalized),
            paco: /^\d{6}_100$/.test(normalized),
            "10mu": /^\d{6}_\d{2}$/.test(normalized),
            "1pondo": /^\d{6}_(?!100$)\d{3}$/.test(normalized)
        };

        if (hint) {
            return hintedSourceChecks[hint] ? { source: hint, id: normalized } : null;
        }

        const matches = Object.keys(sourceChecks).filter((source) => sourceChecks[source]);
        return matches.length === 1 ? { source: matches[0], id: normalized } : null;
    }

    function buildFixedQualityResult(config) {
        const qualities = {
            "1080p": config.urlBase + "/1080p." + (config.ext || "mp4"),
            "720p": config.urlBase + "/720p." + (config.ext || "mp4"),
            "480p": config.urlBase + "/480p." + (config.ext || "mp4"),
            "360p": config.urlBase + "/360p." + (config.ext || "mp4"),
            "240p": config.urlBase + "/240p." + (config.ext || "mp4")
        };
        return trailerResult(qualities["1080p"], config.sourceLabel, "video", {
            qualities,
            quality: "1080p",
            urls: sortQualityKeys(qualities).map((key) => qualities[key])
        });
    }

    function buildDirectSampleBySource(classification, rawCode) {
        if (!classification?.source || !classification.id) return null;
        const id = classification.id;
        switch (classification.source) {
            case "caribbean":
                return buildFixedQualityResult({
                    urlBase: "https://smovie.caribbeancom.com/sample/movies/" + id,
                    sourceLabel: "无码直连预告 / 加勒比"
                });
            case "paco":
                return buildFixedQualityResult({
                    urlBase: "https://fms.pacopacomama.com/hls/sample/pacopacomama.com/" + id,
                    sourceLabel: "无码直连预告 / PACO"
                });
            case "10mu":
                return buildFixedQualityResult({
                    urlBase: "https://fms.10musume.com/hls/sample/10musume.com/" + id,
                    sourceLabel: "无码直连预告 / 10MU"
                });
            case "1pondo": {
                const hasPondoHint = getDirectSampleSourceHint(rawCode) === "1pondo";
                if (!hasPondoHint && rawCode && /-/.test(rawCode)) return null;
                return buildFixedQualityResult({
                    urlBase: "https://sample-1pondo.eroxjapanz.com/sample/movies/" + id,
                    sourceLabel: "无码直连预告 / 一本道"
                });
            }
            default:
                return null;
        }
    }

    function buildHeyzoDirect(id) {
        if (!/^heyzo[-_ ]?\d{4}$/i.test(id)) return null;
        const num = id.match(/\d{4}/)?.[0];
        const qualities = {
            "1080p": "https://www.heyzo.com/contents/3000/" + num + "/heyzo_hd_" + num + "_sample.mp4",
            "540p": "https://www.heyzo.com/contents/3000/" + num + "/sample.mp4",
            "396p": "https://www.heyzo.com/contents/3000/" + num + "/sample_low.mp4"
        };
        const quality = sortQualityKeys(qualities)[0];
        return trailerResult(qualities[quality], "无码直连预告 / HEYZO", "video", {
            qualities,
            quality,
            urls: sortQualityKeys(qualities).map((key) => qualities[key])
        });
    }

    async function buildTokyoHotDirect(id) {
        if (!/^(?:k|n)\d{4}$/i.test(id)) return null;
        const lower = id.toLowerCase();
        const url = "https://my.cdn.tokyo-hot.com/media/samples/" + lower + ".mp4";
        const finalUrl = await headUrl(url);
        return finalUrl ? trailerResult(finalUrl, "无码直连预告 / Tokyo-Hot", "video") : null;
    }

    async function fromDirectSamples(id, rawCode) {
        const directSample = classifyDirectSample(id, rawCode);
        const directResult = buildDirectSampleBySource(directSample, rawCode);
        if (directResult?.url) return directResult;

        return buildHeyzoDirect(id) || await buildTokyoHotDirect(id);
    }

    function normalizeMgstageCode(text) {
        const raw = String(text || "").toUpperCase().replace(/\s+/g, "-");
        const match = raw.match(/\b((?:\d{3})?[A-Z]{2,10})[-_](\d{2,6})\b/);
        if (!match) return "";
        const prefix = MGSTAGE_PREFIX_MAP[match[1]] || match[1];
        if (!Object.values(MGSTAGE_PREFIX_MAP).includes(prefix)) return "";
        return prefix + "-" + match[2];
    }

    function mgstageSampleToMp4(url) {
        return String(url || "")
            .replace(/\\\//g, "/")
            .replace(/&amp;/g, "&")
            .trim()
            .split("?")[0]
            .replace(/\.ism\/request$/i, ".mp4");
    }

    function isAdultVerificationPage(text) {
        return /成人認証|ADULT_CERTIFICATION|18歳未満|id=["']entry["']/i.test(String(text || ""));
    }

    function getResponseDebugInfo(response) {
        const text = String(response?.responseText || "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 160);
        const headers = String(response?.responseHeaders || "")
            .split(/\r?\n/)
            .filter((line) => /server|cf-|cloudfront|x-cache|content-type|location/i.test(line))
            .join(" | ");
        return {
            status: response?.status || 0,
            profile: response?.profile || "",
            finalUrl: response?.finalUrl || "",
            headers,
            body: text
        };
    }

    async function fromMgstage(id, rawCode) {
        const code = normalizeMgstageCode(rawCode) || normalizeMgstageCode(id);
        if (!code) return null;

        const detailUrl = "https://www.mgstage.com/product/product_detail/" + encodeURIComponent(code) + "/?agef=1";
        const requestMode = getPrivilegedRequestMode(detailUrl);
        const canSetForbiddenHeaders = requestMode === "GM_xmlhttpRequest" || requestMode === "TampermonkeyBridge";
        console.log("[CustomTrailer] MGStage 尝试直连:", {
            code,
            rawCode: rawCode || "",
            requestMode
        });

        const mgstageHeaders = {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "accept-language": "ja-JP,ja;q=0.9,en;q=0.8"
        };
        if (canSetForbiddenHeaders) {
            mgstageHeaders.Cookie = "adc=1; coc=1";
            mgstageHeaders.Referer = "https://www.mgstage.com/";
        }

        let detail = null;
        try {
            detail = await requestText(detailUrl, {
                timeout: 15000,
                credentials: "include",
                headers: mgstageHeaders
            });
        } catch (err) {
            console.warn("[CustomTrailer] MGStage 详情页请求被拦截或超时，转 JAVP:", err?.message || err);
            return null;
        }
        if (!detail?.ok || !detail.responseText) {
            console.warn("[CustomTrailer] MGStage 详情页请求失败，转 JAVP:", getResponseDebugInfo(detail));
            return null;
        }
        if (isAdultVerificationPage(detail.responseText)) {
            console.warn("[CustomTrailer] MGStage 返回成人认证页，转 JAVP:", code);
            return null;
        }

        const pid = detail.responseText.match(/sampleplayer\.html\/([0-9a-f-]{36})/i)?.[1] ||
            detail.responseText.match(/[?&]pid=([0-9a-f-]{36})/i)?.[1] ||
            detail.responseText.match(/data-pid=["']([0-9a-f-]{36})["']/i)?.[1];
        if (!pid) {
            console.warn("[CustomTrailer] MGStage 未找到 sample pid，转 JAVP:", code);
            return null;
        }
        console.log("[CustomTrailer] MGStage sample pid:", pid);

        const apiUrl = "https://www.mgstage.com/sampleplayer/sampleRespons.php?pid=" + encodeURIComponent(pid);
        const apiHeaders = {
            "Accept": "application/json,text/plain,*/*"
        };
        if (canSetForbiddenHeaders) {
            apiHeaders["X-Requested-With"] = "XMLHttpRequest";
            apiHeaders.Cookie = "adc=1; coc=1";
            apiHeaders.Referer = detailUrl;
        }

        let api = null;
        try {
            api = await requestText(apiUrl, {
                timeout: 15000,
                credentials: "include",
                headers: apiHeaders
            });
        } catch (err) {
            console.warn("[CustomTrailer] MGStage sampleRespons 请求被拦截或超时，转 JAVP:", err?.message || err);
            return null;
        }
        if (!api?.ok || !api.responseText) {
            console.warn("[CustomTrailer] MGStage sampleRespons 请求失败，转 JAVP:", getResponseDebugInfo(api));
            return null;
        }
        if (isAdultVerificationPage(api.responseText)) {
            console.warn("[CustomTrailer] MGStage sampleRespons 返回成人认证页，转 JAVP:", code);
            return null;
        }

        let sampleUrl = "";
        try {
            sampleUrl = JSON.parse(api.responseText)?.url || "";
        } catch (err) {
            sampleUrl = api.responseText.match(/"url"\s*:\s*"([^"]+)"/i)?.[1] || "";
        }

        const mp4Url = mgstageSampleToMp4(sampleUrl);
        if (!/\.mp4(?:[?#]|$)/i.test(mp4Url)) {
            console.warn("[CustomTrailer] MGStage 未返回可播放 mp4，转 JAVP:", sampleUrl || api.responseText.slice(0, 80));
            return null;
        }

        return trailerResult(mp4Url, "MGStage 直连预告", "video");
    }

    async function fromJavpCcCd(id, rawCode) {
        const query = normalizeTrailerQuery(rawCode || id);
        if (!query) return null;

        const url = API_BASE + encodeURIComponent(query);
        console.log("[CustomTrailer] 请求接口:", url);
        const data = await requestJson(url, {
            timeout: 15000,
            headers: {
                "Accept": "application/json,text/plain,*/*"
            }
        });

        const trailerUrl = String(data?.trailer || "").trim();
        return trailerUrl ? await buildJavpTrailerResult(query, trailerUrl) : null;
    }

    async function fromFc2Hub(id) {
        if (!/^fc2-\d{5,9}$/i.test(id)) return null;
        const fc2Id = id.toUpperCase();
        const searchUrl = "https://fc2hub.com/search?kw=" + encodeURIComponent(fc2Id);
        const search = await requestText(searchUrl, { timeout: 15000 });
        if (!search?.ok) return null;

        let detailUrl = search.finalUrl && search.finalUrl !== searchUrl ? search.finalUrl : null;
        if (!detailUrl && search.responseText) {
            const doc = new DOMParser().parseFromString(search.responseText, "text/html");
            const link = doc.querySelector("a[href*='/id'], a[href*='fc2']")?.getAttribute("href");
            if (link) detailUrl = link.startsWith("http") ? link : new URL(link, searchUrl).href;
        }
        if (!detailUrl) return null;

        const doc = await requestDoc(detailUrl, { timeout: 15000 });
        const iframe = doc?.querySelector("iframe.lazy[data-src], iframe[src]");
        const iframeUrl = iframe?.dataset?.src || iframe?.getAttribute("src");
        if (!iframeUrl) return null;

        return trailerResult(iframeUrl.startsWith("http") ? iframeUrl : new URL(iframeUrl, detailUrl).href, "FC2Hub 预告", "iframe");
    }

    async function fromDmmApi(id) {
        const upperId = String(id || "").toUpperCase();
        if (!/^[A-Z]{2,10}-\d{2,6}$/i.test(upperId) || /^FC2-/i.test(upperId) || upperId.includes("VR-")) return null;

        const items = await searchDmmContentIds(upperId);
        for (const item of items) {
            const qualities = await extractDmmTrailerLinks(item);
            const quality = sortQualityKeys(qualities)[0];
            if (quality) {
                return trailerResult(qualities[quality], "DMM/FANZA 多画质预告", "video", {
                    qualities,
                    quality,
                    urls: sortQualityKeys(qualities).map((key) => qualities[key])
                });
            }
        }
        return null;
    }

    async function searchDmmContentIds(id) {
        const idLower = id.toLowerCase();
        const idNoHyphen = id.replace(/-/g, "").toLowerCase();
        const attempts = [
            id.replace("-", "00"),
            id,
            idNoHyphen
        ];
        for (const keyword of attempts) {
            const params = new URLSearchParams({
                api_id: "UrwskPfkqQ0DuVry2gYL",
                affiliate_id: "10278-996",
                output: "json",
                site: "FANZA",
                sort: "match",
                keyword
            });
            const data = await requestJson("https://api.dmm.com/affiliate/v3/ItemList?" + params.toString(), {
                timeout: 15000,
                headers: { "Accept": "application/json,text/plain,*/*" }
            });
            const items = data?.result?.items || [];
            const matched = [];
            for (const item of items) {
                if (matched.length >= 3) break;
                const contentId = String(item.content_id || "").toLowerCase();
                const makerProduct = String(item.maker_product || "").toLowerCase();
                const keywordNormalized = String(keyword || "").toLowerCase().replace(/-/g, "");
                if (contentId.includes(keywordNormalized) || contentId.includes(idNoHyphen) || makerProduct === idLower) {
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
    }

    async function extractDmmTrailerLinks(item) {
        if (!item?.contentId || !item.serviceCode || !item.floorCode) return null;
        const playerUrl = "https://www.dmm.co.jp/service/digitalapi/-/html5_player/=/cid=" +
            encodeURIComponent(item.contentId) + "/mtype=AhRVShI_/service=" +
            encodeURIComponent(item.serviceCode) + "/floor=" +
            encodeURIComponent(item.floorCode) + "/mode=/";
        const r = await requestText(playerUrl, {
            timeout: 15000,
            headers: {
                "accept-language": "ja-JP,ja;q=0.9"
            }
        });
        if (!r?.ok || !r.responseText || r.responseText.includes("このサービスはお住まいの地域からは")) return null;

        const argsMatch = r.responseText.match(/const\s+args\s*=\s*({[\s\S]*?});/);
        if (!argsMatch) return null;

        let args;
        try {
            args = JSON.parse(argsMatch[1]);
        } catch (err) {
            return null;
        }

        const qualityMap = {};
        const qualityRegex = new RegExp("(" + JAVP_QUALITY_OPTIONS.map((item) => item.quality).join("|") + ")\\.mp4(?:[?#].*)?$");
        const normalizeVideoUrl = (value) => String(value || "")
            .replace(/^\/\//, "https://")
            .replace(/^http:/, "https:")
            .replace("cc3001.dmm.co.jp", "cc3001.dmm.com");
        const resolveQuality = (videoUrl) => {
            const match = videoUrl.match(qualityRegex);
            if (match?.[1]) return match[1];
            const filename = decodeURIComponent(videoUrl.split(/[?#]/)[0].split("/").pop() || "")
                .replace(/\.mp4$/i, "")
                .toLowerCase();
            const suffix = filename.replace(String(item.contentId).toLowerCase(), "").replace(/^[_-]+/, "");
            return ALL_QUALITY_OPTIONS.some((option) => option.quality === suffix) ? suffix : "";
        };
        const addVideoUrl = (rawUrl, fallbackQuality) => {
            if (!rawUrl || typeof rawUrl !== "string") return;
            const videoUrl = normalizeVideoUrl(rawUrl);
            const quality = resolveQuality(videoUrl) || fallbackQuality;
            if (quality) qualityMap[quality] = videoUrl;
        };

        if (Array.isArray(args.bitrates)) {
            args.bitrates.forEach((bitrate) => addVideoUrl(bitrate?.src));
        }
        if (!Object.keys(qualityMap).length && args.src) {
            addVideoUrl(args.src, "mhb");
        }
        return Object.keys(qualityMap).length ? qualityMap : null;
    }

    async function fromDmmPlayerPage(id) {
        const upperId = String(id || "").toUpperCase();
        if (!/^[A-Z]{2,10}-\d{2,6}$/i.test(upperId) || /^FC2-/i.test(upperId)) return null;

        const searchUrl = "https://www.dmm.co.jp/mono/-/search/=/searchstr=" + encodeURIComponent(upperId) + "/";
        const sr = await requestText(searchUrl, {
            timeout: 15000,
            headers: {
                "accept-language": "ja-JP,ja;q=0.9"
            }
        });
        if (!sr?.ok || !sr.responseText) return null;

        const cid = sr.responseText.match(/\/detail\/=\/cid=([a-z0-9_]+)\//i)?.[1]?.toLowerCase();
        if (!cid) return null;

        const ajaxUrl = "https://www.dmm.co.jp/mono/dvd/-/detail/ajax-movie/=/cid=" + encodeURIComponent(cid) + "/";
        const ar = await requestText(ajaxUrl, {
            timeout: 15000,
            headers: {
                "accept": "text/html, */*; q=0.01",
                "accept-language": "ja-JP,ja;q=0.9",
                "x-requested-with": "XMLHttpRequest"
            }
        });
        if (!ar?.ok || !ar.responseText) return null;

        const iframeMatch = ar.responseText.match(/service=([A-Za-z0-9_-]+)\/floor=([A-Za-z0-9_-]+)\//);
        if (!iframeMatch) return null;
        const qualities = await extractDmmTrailerLinks({
            contentId: cid,
            serviceCode: iframeMatch[1],
            floorCode: iframeMatch[2]
        });
        const quality = sortQualityKeys(qualities)[0];
        return quality ? trailerResult(qualities[quality], "DMM 预告", "video", {
            qualities,
            quality,
            urls: sortQualityKeys(qualities).map((key) => qualities[key])
        }) : null;
    }

    async function fromJavSpyl(id) {
        const r = await requestText("https://api.javspyl.eu.org/api/", {
            method: "POST",
            timeout: 12000,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "ID=" + encodeURIComponent(String(id || "").toUpperCase())
        });
        if (!r?.ok || !r.responseText) return null;

        try {
            const data = JSON.parse(r.responseText);
            let url = data?.info?.url;
            if (!url) return null;
            if (!/^https?:\/\//i.test(url)) url = "https://" + url;
            const finalUrl = await headUrl(url);
            return finalUrl ? trailerResult(finalUrl, "JavSpyl 预告", "video") : null;
        } catch (err) {
            return null;
        }
    }

    async function buildJavpTrailerResult(query, trailerUrl) {
        const matched = trailerUrl.match(/^(.*?)(4k|hhb|hmb|mhb|mmb)\.mp4(?:[?#].*)?$/i);
        if (!matched) {
            return {
                code: query,
                url: trailerUrl,
                source: "JAVP / DMM",
                type: "video"
            };
        }

        const prefix = matched[1];
        const originalQuality = matched[2].toLowerCase();
        const qualityCandidates = JAVP_QUALITY_OPTIONS.map((item) => ({
            quality: item.quality,
            label: item.label,
            url: prefix + item.quality + ".mp4"
        }));

        const checks = await Promise.all(qualityCandidates.map(async (item) => ({
            ...item,
            ok: await isPlayableUrl(item.url)
        })));
        const qualities = {};
        checks.forEach((item) => {
            if (item.ok) qualities[item.quality] = item.url;
        });

        if (!Object.keys(qualities).length) {
            qualities[originalQuality] = trailerUrl;
        }

        const quality = sortQualityKeys(qualities)[0] || originalQuality;
        return {
            code: query,
            url: qualities[quality] || trailerUrl,
            source: "JAVP / DMM",
            type: "video",
            qualities,
            quality,
            urls: sortQualityKeys(qualities).map((key) => qualities[key]).filter(Boolean)
        };
    }

    async function isPlayableUrl(url) {
        try {
            const res = await fetch(url, {
                method: "HEAD",
                cache: "no-store"
            });
            return res.ok || (res.status >= 200 && res.status < 400);
        } catch (err) {
            return await canLoadVideoMetadata(url);
        }
    }

    function canLoadVideoMetadata(url) {
        return new Promise((resolve) => {
            const video = document.createElement("video");
            let done = false;
            const cleanup = (ok) => {
                if (done) return;
                done = true;
                clearTimeout(timer);
                video.removeAttribute("src");
                video.load();
                resolve(ok);
            };
            const timer = setTimeout(() => cleanup(false), 4500);
            video.preload = "metadata";
            video.muted = true;
            video.playsInline = true;
            video.addEventListener("loadedmetadata", () => cleanup(true), { once: true });
            video.addEventListener("canplay", () => cleanup(true), { once: true });
            video.addEventListener("error", () => cleanup(false), { once: true });
            video.src = url;
            video.load();
        });
    }

    function sortQualityKeys(qualityMap) {
        const rank = new Map(ALL_QUALITY_OPTIONS.map((item, index) => [item.quality, index]));
        return Object.keys(qualityMap || {})
            .filter((key) => qualityMap[key])
            .sort((a, b) => (rank.get(a) ?? 999) - (rank.get(b) ?? 999));
    }

    function getQualityLabel(quality) {
        return ALL_QUALITY_OPTIONS.find((item) => item.quality === quality)?.label || quality;
    }

    function getTrailerTimeKey(url) {
        return "customTrailerTime_" + String(url || "");
    }

    function getSavedTrailerTime(url) {
        const saved = localStorage.getItem(getTrailerTimeKey(url));
        if (saved === null) return 0;

        const time = parseFloat(saved);
        return Number.isNaN(time) ? 0 : time;
    }

    function playTrailerOverlay(trailer) {
        const url = typeof trailer === "string" ? trailer : trailer?.url;
        const isIframeTrailer = trailer && typeof trailer === "object" && trailer.type === "iframe";
        const qualityMap = trailer && typeof trailer === "object" && trailer.qualities ? trailer.qualities : null;
        const sortedQualityKeys = qualityMap ? sortQualityKeys(qualityMap) : [];
        let activeQuality = trailer?.quality && qualityMap?.[trailer.quality] ? trailer.quality : sortedQualityKeys[0] || null;
        let activeUrl = activeQuality ? qualityMap[activeQuality] : url;
        const fallbackUrls = Array.isArray(trailer?.urls) && trailer.urls.length
            ? trailer.urls.filter(Boolean)
            : sortedQualityKeys.map((key) => qualityMap[key]).filter(Boolean);
        if (activeUrl && !fallbackUrls.includes(activeUrl)) fallbackUrls.unshift(activeUrl);
        if (url && !fallbackUrls.includes(url)) fallbackUrls.push(url);
        let fallbackIndex = Math.max(0, fallbackUrls.indexOf(activeUrl));

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

        const qualitySelect = document.createElement("select");
        qualitySelect.setAttribute("aria-label", "画质");
        qualitySelect.title = "画质";
        qualitySelect.style.cssText = `
            position: absolute;
            top: 8px;
            left: 10px;
            z-index: 3;
            height: 30px;
            min-width: 82px;
            color: #fff;
            background: rgba(0, 0, 0, .48);
            border: 1px solid rgba(255, 255, 255, .32);
            border-radius: 4px;
            padding: 0 8px;
            font-size: 13px;
            outline: none;
        `;

        const video = document.createElement("video");
        if (!isIframeTrailer) {
            video.src = activeUrl || url;
        }
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

        const iframe = document.createElement("iframe");
        iframe.src = url;
        iframe.allow = "autoplay; fullscreen; picture-in-picture; encrypted-media";
        iframe.style.cssText = `
            width: 100%;
            aspect-ratio: 16 / 9;
            display: block;
            background: #000;
            border: 0;
        `;

        let hudTimer = null;
        let currentStorageKey = getTrailerTimeKey(activeUrl || url);

        const setVolume = (value) => {
            video.volume = Math.min(1, Math.max(0, value));
            showVolumeHud();
        };

        const applyVideoSource = (nextUrl, options) => {
            if (!nextUrl) return;
            const currentTime = options?.keepTime ? (video.currentTime || 0) : getSavedTrailerTime(nextUrl);
            const shouldPlay = options?.keepPlaying ? !video.paused : true;
            activeUrl = nextUrl;
            currentStorageKey = getTrailerTimeKey(nextUrl);
            video.addEventListener("loadedmetadata", () => {
                if (currentTime && Number.isFinite(video.duration)) {
                    video.currentTime = Math.min(currentTime, Math.max(0, video.duration - 1));
                }
                if (shouldPlay) {
                    video.play().catch((err) => console.warn("[CustomTrailer] play failed:", err));
                }
            }, { once: true });
            video.src = nextUrl;
            video.load();
        };

        const updateQualitySelect = () => {
            if (!qualityMap || sortedQualityKeys.length <= 1) return;
            qualitySelect.innerHTML = "";
            sortedQualityKeys.forEach((key) => {
                const option = document.createElement("option");
                option.value = key;
                option.textContent = getQualityLabel(key);
                qualitySelect.appendChild(option);
            });
            qualitySelect.value = activeQuality || sortedQualityKeys[0];
        };

        if (qualityMap && sortedQualityKeys.length > 1) {
            updateQualitySelect();
            qualitySelect.addEventListener("change", () => {
                const nextQuality = qualitySelect.value;
                const nextUrl = qualityMap[nextQuality];
                if (!nextUrl || nextQuality === activeQuality) return;
                activeQuality = nextQuality;
                fallbackIndex = Math.max(0, fallbackUrls.indexOf(nextUrl));
                applyVideoSource(nextUrl, {
                    keepTime: true,
                    keepPlaying: true
                });
            });
        }

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
            iframe.removeAttribute("src");
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

        const savedTime = getSavedTrailerTime(activeUrl || url);
        video.addEventListener("loadedmetadata", () => {
            if (savedTime && Number.isFinite(video.duration)) {
                video.currentTime = Math.min(savedTime, Math.max(0, video.duration - 1));
            }
        }, { once: true });

        video.addEventListener("volumechange", () => {
            localStorage.setItem("customTrailerVolume", video.volume);
            showVolumeHud();
        });

        video.addEventListener("timeupdate", () => {
            localStorage.setItem(currentStorageKey, video.currentTime);
        });

        video.addEventListener("error", () => {
            if (fallbackIndex < fallbackUrls.length - 1) {
                fallbackIndex += 1;
                const nextUrl = fallbackUrls[fallbackIndex];
                activeQuality = qualityMap ? sortedQualityKeys.find((key) => qualityMap[key] === nextUrl) || activeQuality : activeQuality;
                if (qualitySelect.options.length && activeQuality) qualitySelect.value = activeQuality;
                console.warn("[CustomTrailer] 当前地址播放失败，尝试下一个清晰度:", nextUrl);
                applyVideoSource(nextUrl, {
                    keepTime: true,
                    keepPlaying: true
                });
                return;
            }

            const code = video.error ? video.error.code : "unknown";
            console.error("[CustomTrailer] video 播放失败:", code, activeUrl || url);
            alert("预告片地址无法播放，请返回后重试或换一个影片。\n" + (activeUrl || url));
        });

        const keyHandler = (e) => {
            if (isIframeTrailer) {
                if (e.key === "Escape") {
                    e.preventDefault();
                    e.stopPropagation();
                    cleanup();
                }
                return;
            }

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
        if (!isIframeTrailer && qualityMap && sortedQualityKeys.length > 1) {
            box.appendChild(qualitySelect);
        }
        box.appendChild(isIframeTrailer ? iframe : video);
        overlay.appendChild(box);
        document.body.appendChild(overlay);

        if (!isIframeTrailer) {
            setTimeout(() => {
                video.focus();
                video.play().catch((err) => console.warn("[CustomTrailer] autoplay failed:", err));
            }, 50);
        }
    }
})();
