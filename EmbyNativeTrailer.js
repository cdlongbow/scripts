// 自定义预告片脚本：拦截 Emby 原生预告片按钮，改为调用外部接口获取真实播放地址。
// 使用悬浮层 HTML5 播放器播放预告片，避免 Emby 内置播放器报错并提升兼容性。
(function () {
    console.log("[CustomTrailer] Script Loaded");

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

        // 捕获阶段执行我们自己的逻辑，并阻断 Emby
        btn.addEventListener("click", async function (e) {
            e.preventDefault();
            e.stopPropagation(); // 阻止冒泡到 Emby
            // 不使用 stopImmediatePropagation()

            console.log("[CustomTrailer] 捕获阶段触发 → 我们的逻辑执行");

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

        }, true); // 捕获阶段（关键）
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
        close.onclick = () => overlay.remove();

        const video = document.createElement("video");
        video.src = url;
        video.controls = true;
        video.autoplay = true;
        video.style.cssText = `
            width: 100%;
            height: auto;
            display: block;
            background: #000;
        `;

        box.appendChild(close);
        box.appendChild(video);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
    }

})();
