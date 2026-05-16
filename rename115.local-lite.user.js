// ==UserScript==
// @name         115 Local Rename Lite
// @namespace    https://github.com/ZiPenOk
// @version      2.4
// @description  115 local-only 借鉴115Rename2026 只做本地处理 自用脚本
// @author       ZiPenOk
// @match        https://115.com/*
// @icon         https://115.com/favicon.ico
// @updateURL    https://github.com/ZiPenOk/scripts/raw/refs/heads/main/rename115.local-lite.user.js
// @downloadURL  https://github.com/ZiPenOk/scripts/raw/refs/heads/main/rename115.local-lite.user.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    "use strict";

    const MENU_ID = "rename115_local_lite_menu";
    const ACTION_ID = "rename115_local_lite_action";
    const TOAST_STYLE_ID = "rename115_local_lite_style";
    const API_EDIT_URL = "https://webapi.115.com/files/edit";

    const INVALID_NAME_CHARS = /[\\/:*?"<>|]/g;
    const SUFFIX_ORDER = [
        "C",
        "8K",
        "4K",
        "1440P",
        "1080P",
        "720P",
        "VR",
        "60FPS",
        "120FPS",
        "破解",
        "流出"
    ];

    const GARBAGE_WORDS = [
        "WWW", "COM", "NET", "ORG", "HD", "FHD", "UHD", "SD", "X264", "X265", "H264", "H265",
        "HEVC", "AVC", "AAC", "AC3", "DTS", "FLAC", "MP3", "MP4", "MKV", "AVI", "WMV", "M4V",
        "RMVB", "ISO", "TS", "RARBG", "WEB", "WEBDL", "WEB-DL", "WEBRIP", "BLURAY", "BDRIP",
        "BDREMUX", "SUB", "SUBBED", "CHS", "CHT", "GB", "BIG5", "CHINESE", "UNCENSORED",
        "LEAK", "LEAKED", "WATERMARK", "4K", "8K", "2160P", "1440P", "1080P", "720P", "480P",
        "60FPS", "120FPS", "GG5", "THZ", "NYAP2P"
    ];

    const PREFIX_BLACKLIST = new Set([
        "HD", "FHD", "UHD", "SD", "VR", "AV", "AVC", "HEVC", "AAC", "AC3", "DTS", "WEB", "DVD",
        "BD", "MKV", "MP4", "AVI", "WMV", "SUB", "CHS", "CHT", "GB", "BIG5", "ISO", "TS"
    ]);
    const SUFFIX_SEP = "[-_.\\s\\[\\](){}]*";
    const REAL_EXTENSIONS = new Set([
        "MP4", "MKV", "AVI", "WMV", "M4V", "RMVB", "MOV", "TS", "M2TS", "ISO",
        "SRT", "ASS", "SSA", "VTT", "SUB", "ZIP", "RAR", "7Z"
    ]);
    const NOISE_EXTENSIONS = new Set([
        "COM", "NET", "ORG", "CO", "LA", "CC", "TV", "ME", "VIP", "XYZ",
        "H264", "H265", "X264", "X265", "HEVC", "AVC", "AAC", "FHD", "HD", "UHD",
        "4K", "8K", "2160P", "1440P", "1080P", "720P", "480P"
    ]);

    const KNOWN_PREFIXES = [
        "200GANA", "230GANA", "24ID", "259LUXU", "261ADA", "277DCV", "300MAAN", "ABP", "ABS", "ADN",
        "ADZ", "AKB", "AKBD", "ALB", "ALD", "AND", "ANIX", "ANND", "ATAD", "ATHB",
        "ATID", "AYAKISAKI", "AZGB", "BBAN", "BBI", "BF", "BID", "BLK", "BMW", "BNDV",
        "BOKD", "BT", "CAWD", "CGAD", "CGBD", "CHSD", "CHSH", "CJOD", "CLUB", "CMV",
        "COSETT", "COSQ", "CR", "CRS", "CUSD", "CYCD", "DAN", "DANDY", "DASS", "DBE",
        "DBUD", "DER", "DMG", "DOJ", "DOM", "DPMI", "DSAM", "DSD", "DSS", "DV",
        "DVAJ", "DVDES", "DVDPS", "DVH", "EBOD", "EDD", "ESK", "EVO", "EYAN", "EZD",
        "FELLATIOJAPAN", "FINH", "FSDSS", "FSET", "FST", "GAR", "GATE", "GDGA", "GDSC", "GEN",
        "GEXP", "GGFH", "GGTB", "GMMD", "GODS", "GOMD", "GOMK", "GPTM", "GRET", "GRYD",
        "GSAD", "GTRL", "GXXD", "GYD", "HAVD", "HBAD", "HHK", "HITMA", "HMN", "HND", "HODV",
        "HRDV", "HUNT", "HUNTA", "HUNTB", "HYK", "IBW", "IDBD", "IDOL", "IENE", "IESP",
        "INU", "IPBZ", "IPIT", "IPITD", "IPSD", "IPTD", "IPX", "IPZ", "IPZZ", "JBD",
        "JHZD", "JMSZ", "JOB", "JUC", "JUFE", "JUKD", "JUL", "JULIA", "JUSD", "JUX",
        "JUY", "KAPD", "KAWD", "KBH", "KIBD", "KIRD", "KISD", "KUF", "KWBD", "LADY",
        "LEGSJAPAN", "LOO", "MADA", "MAN", "MAS", "MBYD", "MDB", "MDS", "MDYD", "MEK",
        "MEYD", "MGJH", "MIAA", "MIAB", "MIAD", "MIAE", "MIAS", "MIDA", "MIDD", "MIDE",
        "MIDV", "MIFD", "MIGD", "MIID", "MILD", "MIRD", "MIZD", "MKCK", "MMND", "MMO",
        "MOED", "MOND", "MSBD", "MUDR", "MUKD", "MUM", "MV", "MX", "MX3DS", "MXGS",
        "MXVR", "N", "NATR", "NEXD", "NFDM", "NGKS", "NHDT", "NHDTA", "NSS", "NTR",
        "NWF", "OBA", "OFCD", "OFJE", "ONED", "OPD", "OPEN", "PAED", "PBD", "PGD",
        "PJD", "PPP", "PPPD", "PRED", "PRTD", "PXV", "RAY", "RBD", "RBS", "RCT",
        "RCTD", "RD", "REAL", "REBD", "REBDB", "RED", "REID", "RGI", "RJMD", "RMDBB",
        "RMDS", "RMLD", "RNHDT", "S2M", "S2MCR", "SACE", "SAD", "SAMA", "SCOP", "SDAB",
        "SDDE", "SDDM", "SDJS", "SDMM", "SDMS", "SDMT", "SDMU", "SDNM", "SDSI", "SEND",
        "SERO", "SHKD", "SHP", "SI", "SIVR", "SKOT", "SNIS", "SOE", "SPERMMANIA", "SPRD",
        "SPS", "SRXV", "SS", "SSIS", "SSNI", "SSPD", "STAR", "STARS", "SUPD", "SVDVD",
        "SVMGM", "SVND", "T28", "TBB", "TBL", "TBW", "TD", "TDLN", "TDP", "TEAM",
        "TEK", "TGGP", "THP", "THZ", "TMD", "TMS", "TMSD", "TOR", "TPPN", "TRE",
        "TSDL", "TSGS", "TSW", "TSWN", "TTRE", "TYOD", "TZZ", "ULJM", "UPSM", "URE",
        "VAGU", "VEMA", "VENU", "VOL", "VSPDR", "VSPDS", "WAAA", "WABB", "WANZ", "WPC",
        "XV", "XVSE", "XVSR", "YMDD", "YNO", "YRZ", "ZARD", "ZATS", "ZDAD", "ZKV",
        "ZUKO", "ZZR"
    ].sort((a, b) => b.length - a.length);

    function ensureStyle() {
        if (document.getElementById(TOAST_STYLE_ID)) return;
        const style = document.createElement("style");
        style.id = TOAST_STYLE_ID;
        style.textContent = `
            .rename115-lite-toast {
                position: fixed;
                right: 18px;
                top: 72px;
                z-index: 99999;
                max-width: 360px;
                padding: 10px 14px;
                border-radius: 6px;
                color: #fff;
                font-size: 13px;
                line-height: 1.45;
                background: rgba(20, 20, 20, .88);
                box-shadow: 0 8px 24px rgba(0, 0, 0, .18);
            }
            .rename115-lite-toast.success { border-left: 4px solid #35b36a; }
            .rename115-lite-toast.error { border-left: 4px solid #ef4444; }
            .rename115-lite-toast.info { border-left: 4px solid #3b82f6; }
        `;
        document.head.appendChild(style);
    }

    function toast(message, type = "info", duration = 2600) {
        ensureStyle();
        const node = document.createElement("div");
        node.className = `rename115-lite-toast ${type}`;
        node.textContent = message;
        document.body.appendChild(node);
        window.setTimeout(() => node.remove(), duration);
    }

    function uniq(values) {
        return [...new Set(values.filter(Boolean))];
    }

    function escapeRegExp(value) {
        return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    function normalizeSpaces(value) {
        return String(value || "").replace(/\s+/g, " ").trim();
    }

    function sanitizeName(value) {
        return normalizeSpaces(String(value || "").replace(INVALID_NAME_CHARS, " "));
    }

    function stripDomainPrefix(filename) {
        let name = String(filename || "");
        const idx = name.lastIndexOf("@");
        if (idx !== -1) name = name.slice(idx + 1);
        name = name.replace(/^\s*(?:\[[^\]]*(?:\.com|\.net|\.org|\.co|\.la|\.cc|\.tv|\.me|\.vip|\.xyz)[^\]]*]|\([^)]*(?:\.com|\.net|\.org|\.co|\.la|\.cc|\.tv|\.me|\.vip|\.xyz)[^)]*\)|【[^】]*(?:\.com|\.net|\.org|\.co|\.la|\.cc|\.tv|\.me|\.vip|\.xyz)[^】]*】)\s*/i, "");
        return name.trim();
    }

    function splitNameAndExt(filename, isFolder) {
        if (isFolder) return { stem: filename, ext: "" };
        const idx = filename.lastIndexOf(".");
        if (idx <= 0 || idx === filename.length - 1) return { stem: filename, ext: "" };
        const ext = filename.slice(idx);
        if (!/^\.[a-z0-9]{1,8}$/i.test(ext)) return { stem: filename, ext: "" };
        const extName = ext.slice(1).toUpperCase();
        if (NOISE_EXTENSIONS.has(extName)) return { stem: filename, ext: "" };
        if (!REAL_EXTENSIONS.has(extName) && /^(?:com|net|org|co|la|cc|tv|me|vip|xyz)$/i.test(extName)) {
            return { stem: filename, ext: "" };
        }
        return { stem: filename.slice(0, idx), ext };
    }

    function addSuffix(suffixes, suffix) {
        if (suffix && !suffixes.includes(suffix)) suffixes.push(suffix);
    }

    function detectSuffixes(raw, baseCode) {
        const suffixes = [];
        const text = String(raw || "");
        const lower = text.toLowerCase();

        if (/(?:中字|中文|字幕|中文字幕|chs|cht|big5|gb|chinese|subtitle|subbed)/i.test(text)) addSuffix(suffixes, "C");
        if (/(?:破解|hack|crack|uncensored|uncensor|restored|无码|無碼)/i.test(text)) addSuffix(suffixes, "破解");
        if (/(?:流出|leak|leaked)/i.test(text)) addSuffix(suffixes, "流出");
        if (/(^|[^A-Za-z0-9])vr([^A-Za-z0-9]|$)/i.test(text)) addSuffix(suffixes, "VR");
        if (/(^|[^A-Za-z0-9])8k([^A-Za-z0-9]|$)/i.test(text)) addSuffix(suffixes, "8K");
        if (/(^|[^A-Za-z0-9])(?:4k|2160p|uhd)([^A-Za-z0-9]|$)/i.test(text)) addSuffix(suffixes, "4K");
        if (/(^|[^A-Za-z0-9])1440p([^A-Za-z0-9]|$)/i.test(text)) addSuffix(suffixes, "1440P");
        if (/(^|[^A-Za-z0-9])(?:1080p|fhd|x1080x)([^A-Za-z0-9]|$)/i.test(text) || /(?:1080p|fhd|x1080x)$/i.test(text)) addSuffix(suffixes, "1080P");
        if (/(^|[^A-Za-z0-9])(?:720p|hd)([^A-Za-z0-9]|$)/i.test(text) && !suffixes.includes("1080P") && !suffixes.includes("4K")) addSuffix(suffixes, "720P");
        if (/(^|[^A-Za-z0-9])60\s*fps([^A-Za-z0-9]|$)/i.test(text)) addSuffix(suffixes, "60FPS");
        if (/(^|[^A-Za-z0-9])120\s*fps([^A-Za-z0-9]|$)/i.test(text)) addSuffix(suffixes, "120FPS");

        if (baseCode) {
            const codePattern = codeBodyPattern(baseCode);
            if (new RegExp(`${codePattern}${SUFFIX_SEP}(?:uc|cu|unc)(?=$|[^A-Za-z0-9])`, "i").test(text)) {
                addSuffix(suffixes, "C");
                addSuffix(suffixes, "破解");
            } else {
                if (new RegExp(`${codePattern}${SUFFIX_SEP}(?:c|ch)(?=$|[^A-Za-z0-9])`, "i").test(text)) addSuffix(suffixes, "C");
                if (new RegExp(`${codePattern}${SUFFIX_SEP}(?:u|un|unc|uncensored|restored)(?=$|[^A-Za-z0-9])`, "i").test(text)) addSuffix(suffixes, "破解");
            }
        }

        if (lower.includes("subtitle")) addSuffix(suffixes, "C");
        return sortSuffixes(suffixes);
    }

    function sortSuffixes(suffixes) {
        const clean = uniq(suffixes);
        return clean.sort((a, b) => {
            const da = /^cd/i.test(a);
            const db = /^cd/i.test(b);
            if (da || db) return da === db ? a.localeCompare(b) : (da ? 1 : -1);
            const ia = SUFFIX_ORDER.indexOf(a);
            const ib = SUFFIX_ORDER.indexOf(b);
            return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
        });
    }

    function codeBodyPattern(code) {
        if (/^FC2-PPV-\d+$/i.test(code)) {
            const num = code.match(/\d+$/)[0].replace(/^0+/, "");
            return `(?:FC2[-_.\\s]*(?:PPV[-_.\\s]*)?|PPV[-_.\\s]*)0*${escapeRegExp(num)}`;
        }
        if (/^Tokyo-Hot-n\d+$/i.test(code)) {
            const num = code.match(/\d+$/)[0].replace(/^0+/, "");
            return `(?:Tokyo[-_.\\s]*Hot[-_.\\s]*n?|TokyoHotn?|Hotn?)0*${escapeRegExp(num)}`;
        }
        const m = code.match(/^([A-Za-z]+)-(\d+)$/);
        if (m) {
            const prefix = escapeRegExp(m[1]);
            const rawNum = String(Number(m[2]));
            return `${prefix}[-_.\\s]*0*${rawNum}`;
        }
        return escapeRegExp(code).replace(/[-_]/g, "[-_.\\s]*");
    }

    function codeLoosePattern(code) {
        return `${codeBodyPattern(code)}(?=$|[^A-Za-z0-9])`;
    }

    function extractCode(raw) {
        const text = String(raw || "");

        const tokyoHot = text.match(/Tokyo[-_\s.]*Hot[-_\s.]*n?(\d{3,5})(?=$|[^0-9])/i);
        if (tokyoHot) return `Tokyo-Hot-n${tokyoHot[1].padStart(4, "0")}`;

        const fc2Patterns = [
            /FC2[-_\s.]*PPV[-_\s.]*(\d{5,8})(?=$|[^0-9])/i,
            /FC2PPV[-_\s.]*(\d{5,8})(?=$|[^0-9])/i,
            /FC2[-_\s.]*(\d{5,8})(?=$|[^0-9])/i,
            /PPV[-_\s.]*(\d{5,8})(?=$|[^0-9])/i
        ];
        for (const pattern of fc2Patterns) {
            const m = text.match(pattern);
            if (m) return `FC2-PPV-${m[1]}`;
        }

        const digitalSite = text.match(/(?:^|[^0-9])(\d{6})[-_\s.](\d{2,4})(?=$|[^A-Za-z0-9])/);
        if (digitalSite) {
            const lower = text.toLowerCase();
            if (lower.includes("1pon")) return `${digitalSite[1]}_${digitalSite[2]}-1Pondo`;
            if (lower.includes("carib")) return `${digitalSite[1]}-${digitalSite[2]}-Carib`;
            if (lower.includes("paco")) return `${digitalSite[1]}_${digitalSite[2]}-Paco`;
            if (lower.includes("heydouga")) return `${digitalSite[1]}-${digitalSite[2]}-Heydouga`;
            if (lower.includes("10mu")) return `${digitalSite[1]}_${digitalSite[2]}-10mu`;
            return `${digitalSite[1]}-${digitalSite[2]}`;
        }

        const upper = text.toUpperCase();
        for (const prefix of KNOWN_PREFIXES) {
            const m = upper.match(new RegExp(`(?:^|[^A-Z])${escapeRegExp(prefix)}[-_\\s.]*0*(\\d{2,6})(?=$|[^0-9])`, "i"));
            if (m) return `${prefix}-${String(Number(m[1])).padStart(3, "0")}`;
        }

        const loose = upper.match(/\b([A-Z]{2,12})[-_\s.]*0*(\d{2,6})(?=$|[^0-9])/);
        if (!loose) return null;

        const prefix = loose[1];
        if (PREFIX_BLACKLIST.has(prefix) || GARBAGE_WORDS.includes(prefix)) return null;
        return `${prefix}-${String(Number(loose[2])).padStart(3, "0")}`;
    }

    function extractDisc(raw, baseCode) {
        if (!baseCode) return "";
        const codePattern = codeBodyPattern(baseCode);
        const patterns = [
            new RegExp(`${codePattern}[-_.\\s\\[\\](){}]*(?:part|pt|cd|disc|vol|volume|ep|sp)[-_.\\s\\[\\](){}]*(\\d{1,3}|[ab])(?=$|[^A-Za-z0-9])`, "i"),
            new RegExp(`${codePattern}[-_.\\s\\[\\](){}]+(\\d{1,3}|[ab])(?=$|[^A-Za-z0-9])`, "i"),
            /(?:^|[^A-Za-z0-9])(?:part|pt|cd|disc|vol|volume|ep|sp)[-_.\s\[\](){}]*(\d{1,3}|[ab])(?=$|[^A-Za-z0-9])/i
        ];

        for (const pattern of patterns) {
            const m = String(raw || "").match(pattern);
            if (m) return `cd${m[1].toLowerCase()}`;
        }
        return "";
    }

    function parseLocalName(filename, isFolder) {
        const { stem, ext } = splitNameAndExt(filename, isFolder);
        const rawStem = stripDomainPrefix(stem);
        const baseCode = extractCode(rawStem);
        if (!baseCode) return null;

        const suffixes = detectSuffixes(rawStem, baseCode);
        const disc = extractDisc(rawStem, baseCode);
        if (disc) suffixes.push(disc);

        const normalized = sanitizeName([baseCode, ...sortSuffixes(suffixes)].join("-") + ext);
        return normalized || null;
    }

    window.rename115LocalLitePreview = name => parseLocalName(String(name || ""), false);

    function getSelectedItems() {
        const frame = document.querySelector("iframe[rel='wangpan']");
        const doc = frame && frame.contentDocument;
        if (!doc) return [];
        return [...doc.querySelectorAll("li.selected")].map(item => {
            const isFolder = item.getAttribute("file_type") === "0";
            return {
                id: isFolder ? item.getAttribute("cate_id") : item.getAttribute("file_id"),
                name: item.getAttribute("title") || "",
                isFolder
            };
        }).filter(item => item.id && item.name);
    }

    function rename115(id, newName) {
        const payload = { fid: id, file_name: newName };
        const jq = window.jQuery || window.$;

        if (jq && typeof jq.post === "function") {
            return new Promise(resolve => {
                jq.post(API_EDIT_URL, payload, data => resolve(parseEditResult(data)))
                    .fail(() => resolve({ ok: false, error: "request failed" }));
            });
        }

        const body = new URLSearchParams(payload);
        return fetch(API_EDIT_URL, {
            method: "POST",
            body,
            credentials: "include",
            headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }
        })
            .then(response => response.text())
            .then(text => parseEditResult(text))
            .catch(error => ({ ok: false, error: error && error.message ? error.message : "request failed" }));
    }

    function parseEditResult(data) {
        try {
            const result = typeof data === "string" ? JSON.parse(data) : data;
            return result && result.state
                ? { ok: true }
                : { ok: false, error: result && (result.error || result.message) || "rename rejected" };
        } catch (error) {
            return { ok: false, error: "invalid response" };
        }
    }

    // ========== 改名结果对比 ==========
    function buildCompareText(list) {
        const header = "【旧文件名】\t【新文件名】";
        const rows = list.map(item => `${item.original}\t${item.renamed}`);
        return [header, ...rows].join("\n");
    }

    function downloadCompareTxt(list) {
        const text = buildCompareText(list);
        const blob = new Blob(["\uFEFF", text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Rename_Compare.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast("对比文件已下载", "success", 3000);
    }

    function copyCompareToClipboard(list) {
        const text = buildCompareText(list);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => toast("对比结果已复制到剪贴板", "success", 3000))
                .catch(() => fallbackCopy(text));
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.cssText = "position:fixed;opacity:0;pointer-events:none;";
        document.body.appendChild(ta);
        ta.select();
        try {
            if (document.execCommand("copy")) {
                toast("对比结果已复制到剪贴板", "success", 3000);
            } else {
                toast("复制失败，请手动保存", "error", 4000);
            }
        } catch {
            toast("复制失败，请手动保存", "error", 4000);
        }
        document.body.removeChild(ta);
    }

    function showCompareDialog(list) {
        if (!list.length) return;
        if (window.confirm("改名已完成，是否导出改名对比？")) {
            if (window.confirm("导出方式：\n确定 → 下载 TXT 文件\n取消 → 复制到剪贴板")) {
                downloadCompareTxt(list);
            } else {
                copyCompareToClipboard(list);
            }
        }
    }

    async function runLocalRename() {
        const items = getSelectedItems();
        if (!items.length) {
            toast("请先选择要改名的文件或文件夹", "info");
            return;
        }

        let changed = 0;
        let skipped = 0;
        let failed = 0;
        const compareList = [];

        toast(`开始本地规范改名：${items.length} 项`, "info");

        for (const item of items) {
            const newName = parseLocalName(item.name, item.isFolder);
            if (!newName || newName === item.name) {
                skipped++;
                continue;
            }

            const result = await rename115(item.id, newName);
            if (result.ok) {
                changed++;
                compareList.push({ original: item.name, renamed: newName });
            } else {
                failed++;
                console.warn("[115 Local Rename Lite] rename failed:", item.name, "=>", newName, result.error);
            }
        }

        const type = failed ? "error" : "success";
        toast(`本地改名完成：成功 ${changed}，跳过 ${skipped}，失败 ${failed}`, type, failed ? 5200 : 3200);

        if (compareList.length > 0) {
            showCompareDialog(compareList);
        }
    }

    function injectMenu() {
        const menu = document.querySelector("div#js_float_content");
        if (!menu || document.getElementById(MENU_ID)) return;

        const openDir = menu.querySelector("li[val='open_dir'], li[data-val='open_dir'], li[menu='open_dir']");
        if (!openDir) return;

        const li = document.createElement("li");
        li.id = MENU_ID;
        li.innerHTML = `<a id="${ACTION_ID}" class="mark" href="javascript:;">本地规范改名</a>`;
        openDir.parentNode.insertBefore(li, openDir);

        const action = document.getElementById(ACTION_ID);
        if (action) action.addEventListener("click", runLocalRename);
    }

    window.setInterval(injectMenu, 1000);
    injectMenu();
})();
