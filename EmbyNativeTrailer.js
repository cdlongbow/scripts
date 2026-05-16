// 自定义预告片脚本：拦截 Emby 原生预告片按钮，改为调用外部接口获取真实播放地址。
// 使用悬浮层 HTML5 播放器播放预告片，避免 Emby 内置播放器报错并提升兼容性。
// 如果播放出错,返回重进再试
(function () {
    console.log("[CustomTrailer] Script Loaded");

    // ★★★ 只在这些库生效（填你的 LibraryId）★★★
    const ENABLED_LIBRARIES = [
        "565020",
        "565027"
    ];

    const API_BASE = "https://javp.cc.cd/trailers/";

    const observer = new MutationObserver(() => {
        hookTrailerButton();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    function hookTrailerButton() {
        const btn = document.querySelector(".itemTrailerButton, .btnPlayTrailer, button[title='预告片'], button[aria-label='预告片']");
        if (!btn) return;
        if (btn.dataset.customTrailerHooked === "1") return;

        btn.dataset.customTrailerHooked = "1";
        console.log("[CustomTrailer] Trailer button hooked");

        // 捕获阶段：先判断库 ID，再决定是否拦截
        btn.addEventListener("click", async function (e) {

            // ★ 从 DOM 获取 LibraryId ★
            const libraryId = document.querySelector("[data-parentid]")?.dataset.parentid;
            console.log("[CustomTrailer] 当前 LibraryId:", libraryId);

            // ★★★ 如果不是目标库 → 直接放行，不拦截 ★★★
            if (!libraryId || !ENABLED_LIBRARIES.includes(libraryId)) {
                console.log("[CustomTrailer] 当前库未启用脚本 → 放行原生预告片");
                return; // 不阻断事件
            }

            // ★★★ 是目标库 → 拦截 Emby 原生事件 ★★★
            e.preventDefault();
            e.stopPropagation();

            console.log("[CustomTrailer] 捕获阶段触发（目标库）");

            const number = extractNumberFromPage();
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

        }, true); // 捕获阶段
    }

    function extractNumberFromPage() {
        const text = document.body.innerText || "";
        const m = text.match(/[a-z]{2,6}-\d{2,5}/i);
        return m ? m[0].toLowerCase() : null;
    }

    async function fetchTrailer(number) {
        const url = API_BASE + number;
        console.log("[CustomTrailer] 请求接口:", url);

        try {
            const res = await fetch(url);
            if (!res.ok) return null;
            const data = await res.json();
            return data.trailer || null;
        } catch (e) {
            console.error("[CustomTrailer] API 错误:", e);
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
        `;

        const box = document.createElement("div");
        box.style.cssText = `
            width: 80%;
            max-width: 960px;
            background: #000;
            position: relative;
            box-shadow: 0 0 20px rgba(0,0,0,.8);
        `;

        const close = document.createElement("button");
        close.textContent = "×";
        close.style.cssText = `
            position: absolute;
            top: 6px;
            right: 10px;
            z-index: 2;
            font-size: 26px;
            color: #fff;
            background: transparent;
            border: none;
            cursor: pointer;
        `;
        close.onclick = () => {
            overlay.remove();
            document.removeEventListener("keydown", keyHandler);
        };

        const video = document.createElement("video");
        video.src = url;
        video.controls = true;
        video.autoplay = true;
        video.tabIndex = 0;          // ★ 允许 video 接收键盘事件
        video.style.cssText = `
            width: 100%;
            height: auto;
            display: block;
            background: #000;
        `;

        // ★★★ 自动恢复音量 ★★★
        const savedVolume = localStorage.getItem("customTrailerVolume");
        if (savedVolume !== null) {
            video.volume = parseFloat(savedVolume);
        }

        // ★★★ 自动恢复播放位置 ★★★
        const savedTime = localStorage.getItem("customTrailerTime_" + url);
        if (savedTime !== null) {
            video.currentTime = parseFloat(savedTime);
        }

        // ★★★ 保存音量 ★★★
        video.addEventListener("volumechange", () => {
            localStorage.setItem("customTrailerVolume", video.volume);
        });

        // ★★★ 保存播放进度 ★★★
        video.addEventListener("timeupdate", () => {
            localStorage.setItem("customTrailerTime_" + url, video.currentTime);
        });

        // ★★★ 键盘控制（ESC / 空格 / 上下音量 / 左右快进）★★★
        const keyHandler = (e) => {
            // 阻止页面滚动、阻止页面快捷键
            if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                e.preventDefault();
                e.stopPropagation();
            }

            // ESC 关闭
            if (e.key === "Escape") {
                overlay.remove();
                document.removeEventListener("keydown", keyHandler);
            }

            // 空格暂停/播放
            if (e.key === " " || e.code === "Space") {
                if (video.paused) video.play();
                else video.pause();
            }

            // 上下方向键调节音量
            if (e.key === "ArrowUp") {
                video.volume = Math.min(1, video.volume + 0.05);
            }
            if (e.key === "ArrowDown") {
                video.volume = Math.max(0, video.volume - 0.05);
            }

            // 左右方向键快进/快退（5 秒）
            if (e.key === "ArrowRight") {
                video.currentTime = Math.min(video.duration, video.currentTime + 5);
            }
            if (e.key === "ArrowLeft") {
                video.currentTime = Math.max(0, video.currentTime - 5);
            }
        };

        document.addEventListener("keydown", keyHandler);

        // ★★★ 打开播放器后自动聚焦 video（关键）★★★
        setTimeout(() => video.focus(), 50);

        box.appendChild(close);
        box.appendChild(video);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
    }

})();
