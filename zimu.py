# -*- coding: utf-8 -*-
import os, re, time, random, json, hashlib, traceback, unicodedata
import cloudscraper
import requests
from datetime import datetime
from colorama import Fore, Style, init
import tkinter as tk
from tkinter import filedialog

init(autoreset=True)

# ==================== 路径配置 ====================
DESKTOP = os.path.join(os.path.expanduser("~"), "Desktop")

SCRIPT_NAME = "字幕下载助手"
SCRIPT_VERSION = "2026.05.07"
DELAY_MIN, DELAY_MAX = 2.5, 5.0
REQUEST_RETRIES = 3
MAX_TASK_RETRY_ROUNDS = 2
PROGRESS_FILE = "progress.json"
FORCE_MODE = False
stats = {"total":0,"success":0,"skip":0,"fail":0}
report_details = []
_selected_folder = ""
VIDEO_EXTS = {".mp4", ".mkv", ".avi", ".mov", ".wmv", ".flv", ".ts", ".m2ts", ".rmvb", ".strm"}
RETRYABLE_REASONS = {"网络/接口失败", "接口解析失败", "下载失败", "字幕校验失败", "无法识别"}

scraper = cloudscraper.create_scraper()
session = requests.Session()

SYMBOL_MAP = {
    "scan":  "[🔍]",
    "net":   "[🌐]",
    "down":  "[📥]",
    "ok":    "[✅]",
    "rep":   "[♻️]",
    "skip":  "[⏩]",
    "fall":  "[🔄]",
    "match": "[🎯]",
    "err":   "[❓]",
    "log":   "[📝]",
    "info":  "[ℹ️]",
    "retry": "[🔁]"
}

def log(tag, color, msg):
    print(color + f"{SYMBOL_MAP.get(tag,'[    ]')} {msg}" + Style.RESET_ALL)

def fail_result(reason, detail, code, path):
    return "FAIL", reason, code, path, detail, reason in RETRYABLE_REASONS

def success_result(source, code, path, detail=""):
    return "SUCCESS", source, code, path, detail, False

def skip_result(reason, code, path, detail=""):
    return "SKIP", reason, code, path, detail, False

def fallback_msg(tw):
    return "，回退 Manko TW" if tw else ""

def pause_before_exit(msg="\n按任意键关闭窗口..."):
    print(msg)
    try:
        os.system("pause >nul")
    except:
        try:
            input()
        except:
            pass

def print_welcome():
    print("=" * 68)
    print(f" {SCRIPT_NAME} v{SCRIPT_VERSION}")
    print("=" * 68)
    print(" 工作流: 选择模式 → 选择目录 → 批量检索 → 校验字幕 → 失败重试")
    print(f" 网络请求: 单次请求最多重试 {REQUEST_RETRIES} 次")
    print(f" 任务重试: 批量结束后可重试可恢复失败，最多 {MAX_TASK_RETRY_ROUNDS} 轮")
    print(" 字幕校验: 时间轴 / 中文比例 / 乱码字符 / HTML错误页")
    print("-" * 68)

def choose_mode():
    while True:
        print("\n请选择运行模式")
        print("  1. 正常模式  - 已有有效字幕跳过；无效字幕会尝试替换")
        print("  2. 洗版模式  - 重新下载并用 MD5 判断是否替换")
        choice = input("请输入 1 或 2: ").strip()
        if choice in ("1", "2"):
            return choice == "2"
        log("err", Fore.YELLOW, "输入无效，请输入 1 或 2")

def choose_folder():
    print("\n请选择要扫描的文件夹...")
    tk.Tk().withdraw()
    folder = filedialog.askdirectory()
    if folder:
        log("info", Fore.CYAN, f"已选择目录: {folder}")
    return folder

def load_progress():
    if not os.path.exists(PROGRESS_FILE):
        return set()
    try:
        with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
            return set(json.load(f).get("done", []))
    except:
        return set()

def save_progress(done_set):
    try:
        with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
            json.dump({"done": list(done_set)}, f, ensure_ascii=False, indent=2)
    except:
        pass

def safe_get(url, use_scraper=False, source="请求", **kwargs):
    client = scraper if use_scraper else session
    for i in range(REQUEST_RETRIES):
        try:
            time.sleep(random.uniform(0.5, 1.5))
            r = client.get(url, timeout=15, **kwargs)
            if r.status_code == 200 and r.content.strip():
                return r
            if r.status_code == 429:
                wait = 2 ** (i+1)
                log("err", Fore.YELLOW, f"{source} 429限速，退避 {wait}s")
                time.sleep(wait)
                continue
            log("err", Fore.YELLOW, f"{source} HTTP {r.status_code}，内容长度 {len(r.content)}")
        except Exception as e:
            log("err", Fore.YELLOW, f"{source} 异常: {str(e)[:60]}")
        wait = 2 ** (i+1)
        log("err", Fore.YELLOW, f"{source} 失败，重试 {i+1}/{REQUEST_RETRIES} (等待{wait}s)")
        time.sleep(wait)
    log("err", Fore.YELLOW, f"{source} 最终失败")
    return None

def extract_valid_text(text, ext="srt"):
    lines = text.splitlines()
    valid_lines = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if ext.lower() == "srt":
            if "-->" in line or line.isdigit():
                continue
        else:  # ass
            if line.startswith("[") and line.endswith("]"):
                continue
            if line.lower().startswith("dialogue:"):
                parts = line.split(",", 9)
                if len(parts) == 10:
                    line = parts[9]
                else:
                    line = ",".join(parts[9:])
                line = re.sub(r"\{.*?\}", "", line)
                line = line.replace("\\N", "\n")
        line = re.sub(r"<.*?>", "", line)
        if line.strip():
            valid_lines.append(line)
    return "\n".join(valid_lines)

def is_cjk_char(c):
    return (
        '\u3400' <= c <= '\u4dbf' or
        '\u4e00' <= c <= '\u9fff' or
        '\uf900' <= c <= '\ufaff'
    )

def is_bad_subtitle_char(c):
    if ord(c) <= 127 or is_cjk_char(c) or c.isspace():
        return False
    category = unicodedata.category(c)
    return category[0] not in ("P", "S", "N", "Z")

def has_subtitle_timeline(text, ext="srt"):
    ext = ext.lower()
    if ext == "srt":
        return bool(re.search(
            r"\d{1,2}:\d{2}:\d{2}[,.]\d{3}\s*-->\s*\d{1,2}:\d{2}:\d{2}[,.]\d{3}",
            text
        ))
    if ext == "ass":
        lower = text.lower()
        return "dialogue:" in lower or "[events]" in lower
    return True

def decoded_subtitle_candidates(content):
    encodings = []
    if content.startswith(b"\xef\xbb\xbf"):
        encodings.append("utf-8-sig")
    if content.startswith((b"\xff\xfe", b"\xfe\xff")):
        encodings.append("utf-16")
    encodings += ["utf-8", "gb18030", "big5", "cp950"]
    if content[:500].count(b"\x00") > 20:
        encodings += ["utf-16", "utf-16le", "utf-16be"]

    seen = set()
    for enc in encodings:
        if enc in seen:
            continue
        seen.add(enc)
        try:
            yield enc, content.decode(enc)
        except UnicodeError:
            continue

def validate_subtitle_text(text, ext="srt"):
    if "<html" in text.lower():
        return False, "HTML内容"
    if not has_subtitle_timeline(text, ext):
        return False, "缺少字幕时间轴"
    clean_text = extract_valid_text(text, ext)
    if len(clean_text) < 20:
        return False, "有效内容过少"
    total = len(clean_text)
    zh = sum(1 for c in clean_text if is_cjk_char(c))
    zh_ratio = zh / total if total else 0
    bad = sum(1 for c in clean_text if is_bad_subtitle_char(c))
    bad_ratio = bad / total if total else 0
    if ext.lower() == "ass":
        if zh < 5:
            return False, f"中文过少({zh})"
        if bad_ratio > 0.8:
            return False, f"乱码比例高({bad_ratio:.2f})"
        return True, "正常"
    else:
        if zh < 10:
            return False, f"中文过少({zh})"
        if zh_ratio < 0.1:
            return False, f"中文比例低({zh_ratio:.2f})"
        if bad_ratio > 0.4:
            return False, f"乱码比例高({bad_ratio:.2f})"
        return True, "正常"

def prepare_subtitle_content(content, ext="srt"):
    first_error = None
    for enc, text in decoded_subtitle_candidates(content):
        ok, reason = validate_subtitle_text(text, ext)
        if ok:
            text = text.replace("\r\n", "\n").replace("\r", "\n")
            note = "正常" if enc in ("utf-8", "utf-8-sig") else f"正常({enc}->utf-8)"
            return True, note, text.encode("utf-8")
        if first_error is None:
            first_error = f"{reason}({enc})"
    return False, first_error or "编码错误", None

def check_subtitle(content, ext="srt"):
    ok, reason, _ = prepare_subtitle_content(content, ext)
    return ok, reason

def check_subtitle_file(path):
    ext = os.path.splitext(path)[1].lstrip(".").lower() or "srt"
    try:
        with open(path, "rb") as f:
            return check_subtitle(f.read(), ext)
    except Exception as e:
        return False, f"读取失败({str(e)[:30]})"

def md5_file(p):
    if not os.path.exists(p): return None
    with open(p,"rb") as f: return hashlib.md5(f.read()).hexdigest()

def md5_bytes(b): return hashlib.md5(b).hexdigest()

def write_file_atomic(path, content):
    tmp = f"{path}.tmp"
    with open(tmp, "wb") as f:
        f.write(content)
    os.replace(tmp, path)

def path_key(path):
    return os.path.normcase(os.path.abspath(path))

def normalize_num(num):
    n = num.lstrip("0") or "0"
    return n.zfill(3) if len(n) < 3 else n

def extract_code(name):
    text = re.sub(r'\([^)]*\)|\[[^]]*\]', ' ', name)

    m = re.search(r'([A-Z]{2,8}\d*)\s*-\s*(\d{2,6})', text, re.I)
    if m:
        return f"{m.group(1).upper()}-{normalize_num(m.group(2))}"

    m = re.search(r'([A-Z]{2,8})(\d{3,6})', text, re.I)
    if m:
        return f"{m.group(1).upper()}-{normalize_num(m.group(2))}"

    return None

def has_embedded(file):
    return re.search(r'(?i)(?:^|[\s._-])(ch|c)(?=[\s._\-\(\[]|$)', file)

def download(url, save, existing_invalid_reason=None):
    existing_invalid = existing_invalid_reason
    if os.path.exists(save) and not FORCE_MODE:
        if existing_invalid is None:
            ok, reason = check_subtitle_file(save)
            if ok:
                log("skip", Fore.YELLOW, f"文件已存在且有效，跳过: {os.path.basename(save)}")
                return "SKIP_EXIST", "文件已存在"
            existing_invalid = reason
            log("err", Fore.YELLOW, f"本地字幕无效({reason})，尝试重新下载: {os.path.basename(save)}")

    r = safe_get(url, source="字幕下载")
    if not r:
        return "FAIL", "下载失败"
    
    ext = os.path.splitext(save)[1].lstrip(".").lower() or "srt"
    ok, reason, content = prepare_subtitle_content(r.content, ext)
    if not ok:
        log("err", Fore.YELLOW, f"字幕校验失败({reason}): {os.path.basename(save)}")
        return "FAIL_INVALID", reason

    new_md5 = md5_bytes(content)
    old_md5 = md5_file(save)
    
    if os.path.exists(save):
        if FORCE_MODE:
            if new_md5 == old_md5:
                log("skip", Fore.YELLOW, f"MD5相同，跳过: {os.path.basename(save)}")
                return "SKIP_MD5", "MD5相同"
            else:
                write_file_atomic(save, content)
                log("rep", Fore.CYAN, f"洗版替换完成: {os.path.basename(save)}")
                return "REPLACED", "MD5不同（已替换）"
        else:
            write_file_atomic(save, content)
            log("rep", Fore.CYAN, f"无效字幕替换完成: {os.path.basename(save)}")
            return "REPLACED_INVALID", f"替换无效字幕({existing_invalid})"
    
    # 文件不存在 → 正常下载
    write_file_atomic(save, content)
    log("ok", Fore.GREEN, f"下载完成: {os.path.basename(save)}")
    return "OK", "成功（新建）"

def base91_decode(e):
    A='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"'
    t=e or "";a=o=0;i=-1;r=[]
    for c in t:
        p=A.find(c)
        if p==-1: continue
        if i<0: i=p
        else:
            i+=p*91; a|=i<<o
            o+=13 if (i&8191)>88 else 14
            while o>7: r.append(a&255); a>>=8; o-=8
            i=-1
    if i>-1: r.append((a|i<<o)&255)
    try: return bytes(r).decode()
    except: return ""

def decode_manko(j):
    try:
        raw = j.get("data","")
        decoded = base91_decode(raw)
        return json.loads(decoded)
    except Exception as e:
        log("err", Fore.YELLOW, f"Manko解码失败: {str(e)[:60]}")
        return None

def get_manko(code):
    try:
        log("net",Fore.WHITE,"Manko 查询中...")
        r = safe_get("https://healertanker.com/swx/movie/search", use_scraper=True, source="Manko搜索", params={"keyword":code,"size":24,"page":1})
        if not r:
            log("err", Fore.YELLOW, "Manko搜索失败")
            return [], "网络/接口失败", "Manko搜索失败"
        decoded = decode_manko(r.json())
        if not decoded:
            log("err", Fore.YELLOW, "Manko搜索结果为空或解码失败")
            return [], "接口解析失败", "Manko搜索结果为空或解码失败"
        mid = decoded[0]["_id"]
        r = safe_get(f"https://healertanker.com/swx/subtitle-link/{mid}", use_scraper=True, source="Manko字幕链接")
        if not r:
            log("err", Fore.YELLOW, "Manko字幕链接获取失败")
            return [], "网络/接口失败", "Manko字幕链接获取失败"
        raw = decode_manko(r.json())
        if not raw:
            log("err", Fore.YELLOW, "Manko字幕链接为空或解码失败")
            return [], "接口解析失败", "Manko字幕链接为空或解码失败"
        subs=[]
        for it in raw.get("subtitle_link",[]):
            for lang,url in it.items():
                if url:
                    subs.append({
                        "lang":lang.lower(),
                        "url":url,
                        "ext":"ass" if ".ass" in url else "srt"
                    })
        if not subs:
            log("err", Fore.YELLOW, "Manko未找到字幕")
            return [], "无可用字幕", "Manko未找到字幕"
        log("net",Fore.WHITE,f"Manko返回字幕数: {len(subs)}")
        return subs, "", ""
    except Exception as e:
        log("err",Fore.RED,f"Manko异常: {e}")
        return [], "网络/接口失败", f"Manko异常: {e}"

def process(root, file):
    code = extract_code(file)
    base = os.path.splitext(file)[0]
    abs_path = os.path.abspath(os.path.join(root, file))
    rel_path = abs_path

    if has_embedded(file):
        log("skip", Fore.YELLOW, f"{abs_path} (内嵌字幕跳过)")
        return skip_result("内嵌字幕", code or "Unknown", rel_path)

    if not code:
        return fail_result("无法识别", "文件名未匹配到番号", "Unknown", rel_path)

    log("scan", Fore.CYAN, f"检索中: {code} | {abs_path}")

    # ====================== 模式1：本地字幕优先检查 ======================
    local_invalid = {}
    if not FORCE_MODE:   # 正常模式下先检查本地
        candidates = []
        for lang in ["zh", "chs", "sc", "zh-CN"]:
            for ext in ["srt", "ass"]:
                candidates.append(os.path.join(root, f"{base}.{lang}.{ext}"))

        checked = set()
        for existing in candidates:
            key = path_key(existing)
            if key in checked or not os.path.exists(existing):
                continue
            checked.add(key)

            ok, reason = check_subtitle_file(existing)
            if ok:
                log("skip", Fore.YELLOW, f"本地已存在有效字幕，跳过: {os.path.basename(existing)}")
                return skip_result("本地已存在", code, rel_path, os.path.basename(existing))

            local_invalid[key] = reason
            log("err", Fore.YELLOW, f"本地字幕无效({reason})，继续查找替换: {os.path.basename(existing)}")

    # ====================== Manko 查询 ======================
    failure_notes = []
    subs, manko_reason, manko_detail = get_manko(code)
    if manko_reason:
        failure_notes.append((manko_reason, manko_detail))
    tw = None

    for s in subs:
        if s["lang"] in ["zh", "chs", "sc"]:
            save = os.path.join(root, f"{base}.{s['lang']}.{s['ext']}")
            log("down", Fore.MAGENTA, f"Manko({s['lang']}) -> {os.path.basename(save)}")
            
            status, reason = download(s["url"], save, local_invalid.get(path_key(save)))
            
            if status in ["REPLACED", "REPLACED_INVALID", "OK"]:
                log("ok", Fore.GREEN, f"成功: {code} (Manko-zh)")
                return success_result("Manko", code, rel_path, "Manko-zh")
            elif status in ["SKIP_MD5", "SKIP_EXIST"]:
                log("ok", Fore.GREEN, f"成功: {code} (Manko-zh 已存在)")
                return success_result("Manko", code, rel_path, "Manko-zh 已存在")
            elif status == "FAIL_INVALID":
                failure_notes.append(("字幕校验失败", f"Manko({s['lang']}) {reason}"))
            elif status == "FAIL":
                failure_notes.append(("下载失败", f"Manko({s['lang']}) {reason}"))
                
        elif s["lang"] in ["tw", "cht", "tc"]:
            tw = s

    if tw:
        log("fall", Fore.WHITE, "Manko zh 异常 → 暂存 tw → 尝试 JavSubs")
    else:
        log("fall", Fore.WHITE, "Manko无有效字幕 → JavSubs")

    # ====================== JavSubs 查询 ======================
    log("net", Fore.WHITE, "JavSubs 查询中...")
    r = safe_get(f"https://javsubs.furina.in/api/subtitle?name={code}", source="JavSubs查询")
    if not r:
        log("err", Fore.YELLOW, f"JavSubs查询失败{fallback_msg(tw)}")
        failure_notes.append(("网络/接口失败", "JavSubs查询失败"))
    else:
        try:
            data = r.json().get("data", [])
        except Exception as e:
            log("err", Fore.YELLOW, f"JavSubs JSON解析失败: {str(e)[:60]}")
            data = []
            failure_notes.append(("接口解析失败", f"JavSubs JSON解析失败: {str(e)[:60]}"))

        if not data:
            log("err", Fore.YELLOW, f"JavSubs无返回字幕{fallback_msg(tw)}")
            failure_notes.append(("无可用字幕", "JavSubs无返回字幕"))
        else:
            matched_subs = [sub for sub in data if code.upper() in sub.get('name', '').upper()]
            
            if not matched_subs:
                log("err", Fore.YELLOW, f"JavSubs返回 {len(data)} 条，但无明确匹配 {code}{fallback_msg(tw)}")
                failure_notes.append(("无可用字幕", f"JavSubs返回 {len(data)} 条但无明确匹配"))
            else:
                ass_subs = [sub for sub in matched_subs if sub.get('ext','').lower() == 'ass']
                srt_subs = [sub for sub in matched_subs if sub.get('ext','').lower() == 'srt']
                
                if ass_subs:
                    log("fall", Fore.WHITE, f"JavSubs 找到 {len(ass_subs)} 个 ASS 和 {len(srt_subs)} 个 SRT")
                else:
                    log("fall", Fore.WHITE, f"JavSubs 找到 {len(srt_subs)} 个 SRT")
                
                priority_list = ass_subs + srt_subs
                
                for sub in priority_list:
                    log("match", Fore.CYAN, f"匹配: {sub['name']}")
                    save = os.path.join(root, f"{base}.zh.{sub['ext']}")
                    
                    log("down", Fore.MAGENTA, f"JavSubs -> {os.path.basename(save)}")
                    status, reason = download(sub["url"], save, local_invalid.get(path_key(save)))
                    
                    if status in ["REPLACED", "REPLACED_INVALID", "OK"]:
                        log("ok", Fore.GREEN, f"成功: {code} (JavSubs - {sub['ext'].upper()})")
                        return success_result("JavSubs", code, rel_path, f"JavSubs-{sub['ext'].upper()}")
                    elif status in ["SKIP_MD5", "SKIP_EXIST"]:
                        log("ok", Fore.GREEN, f"成功: {code} (JavSubs - 已存在)")
                        return success_result("JavSubs", code, rel_path, "JavSubs 已存在")
                    else:
                        log("err", Fore.YELLOW, f"JavSubs下载不可用: {sub.get('name','Unknown')} | {reason}")
                        fail_type = "字幕校验失败" if status == "FAIL_INVALID" else "下载失败"
                        failure_notes.append((fail_type, f"JavSubs {sub.get('name','Unknown')} | {reason}"))

                log("err", Fore.YELLOW, f"JavSubs匹配结果全部下载或校验失败{fallback_msg(tw)}")

    # ====================== 回退 Manko TW ======================
    if tw:
        save = os.path.join(root, f"{base}.{tw['lang']}.{tw['ext']}")
        log("down", Fore.MAGENTA, f"Manko({tw['lang']}) -> {os.path.basename(save)}")
        status, reason = download(tw["url"], save, local_invalid.get(path_key(save)))
        
        if status in ["REPLACED", "REPLACED_INVALID", "OK", "SKIP_MD5", "SKIP_EXIST"]:
            log("ok", Fore.GREEN, f"成功: {code} (Manko-tw)")
            return success_result("Manko", code, rel_path, "Manko-tw")
        elif status == "FAIL_INVALID":
            failure_notes.append(("字幕校验失败", f"Manko({tw['lang']}) {reason}"))
        elif status == "FAIL":
            failure_notes.append(("下载失败", f"Manko({tw['lang']}) {reason}"))

    retryable_notes = [item for item in failure_notes if item[0] in RETRYABLE_REASONS]
    if retryable_notes:
        reason, detail = retryable_notes[-1]
    elif failure_notes:
        reason, detail = failure_notes[-1]
    else:
        reason, detail = "无可用字幕", "所有字幕源均无可用结果"

    log("err", Fore.RED, f"失败: {code} ({reason})")
    return fail_result(reason, detail, code, rel_path)

def save_report():
    if not _selected_folder: return
    
    # 确保桌面路径存在
    os.makedirs(DESKTOP, exist_ok=True)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    path = os.path.join(DESKTOP, f"字幕任务报告_{timestamp}.txt")
    
    try:
        with open(path,"w",encoding="utf-8") as f:
            f.write("="*80+"\n")
            f.write(f" 字幕下载详细报告 | 生成时间: {datetime.now()}\n")
            f.write("="*80+"\n\n")
            f.write(f"[ 数据统计 ]\n")
            f.write(f" - 任务总数: {stats['total']}\n")
            f.write(f" - 成功下载: {stats['success']}\n")
            f.write(f" - 自动跳过: {stats['skip']}\n")
            f.write(f" - 任务失败: {stats['fail']}\n\n")
            f.write("[ 失败归因分析 ]\n")
            for r in report_details:
                if r["status"]=="FAIL":
                    detail = f" | {r['detail']}" if r.get("detail") else ""
                    retry = "可重试" if r.get("retryable") else "不建议重试"
                    f.write(f" ● {r['code']} | {r['path']} | {r['reason']}{detail} | {retry}\n")
            f.write("\n[ 重试成功记录 ]\n")
            for r in report_details:
                if r["status"]=="SUCCESS" and r.get("attempt", 1) > 1:
                    f.write(f" ● {r['code']} | 第{r['attempt']}次尝试成功 | {r['path']} | {r.get('detail','')}\n")
        log("log",Fore.GREEN,f"报告已保存: {path}")
    except Exception as e:
        log("err", Fore.RED, f"保存报告失败: {e}")

def make_task_key(root, file):
    return path_key(os.path.join(root, file))

def result_record(root, file, result, attempt=1):
    st, reason, code, path, detail, retryable = result
    return {
        "root": root,
        "file": file,
        "code": code,
        "status": st,
        "reason": reason,
        "detail": detail,
        "path": path,
        "retryable": retryable,
        "attempt": attempt,
    }

def record_result(results, root, file, result, attempt=1):
    rec = result_record(root, file, result, attempt)
    results[make_task_key(root, file)] = rec
    return rec

def recompute_stats(results):
    stats["total"] = len(results)
    stats["success"] = sum(1 for r in results.values() if r["status"] == "SUCCESS")
    stats["skip"] = sum(1 for r in results.values() if r["status"] == "SKIP")
    stats["fail"] = sum(1 for r in results.values() if r["status"] == "FAIL")

def sync_report_details(results):
    report_details.clear()
    report_details.extend(results.values())

def retryable_failures(results):
    return [r for r in results.values() if r["status"] == "FAIL" and r.get("retryable")]

def print_retry_summary(items):
    counts = {}
    for item in items:
        counts[item["reason"]] = counts.get(item["reason"], 0) + 1
    print("\n" + "-" * 60)
    log("retry", Fore.CYAN, f"发现可重试失败 {len(items)} 个")
    for reason, count in sorted(counts.items()):
        print(f" - {reason}: {count}")

def ask_retry(items, round_no):
    if not items or round_no > MAX_TASK_RETRY_ROUNDS:
        return False
    print_retry_summary(items)
    print(f"当前可进行第 {round_no}/{MAX_TASK_RETRY_ROUNDS} 轮任务级重试")
    choice = input("是否重试这些任务？1重试 2跳过: ").strip()
    return choice == "1"

def run_one_task(root, file, index, total, done_set, attempt=1, retry_mode=False):
    prefix = "重试进度" if retry_mode else "进度"
    print(f"\n{prefix}: {index}/{total}")
    start_time = datetime.now()
    print(f"{Fore.CYAN}[🕒] {start_time.strftime('%Y-%m-%d %H:%M:%S')}{Style.RESET_ALL}")

    code = extract_code(file)
    if not retry_mode and not FORCE_MODE and code in done_set:
        log("skip", Fore.YELLOW, f"{code} 已完成(断点续跑)")
        end_time = datetime.now()
        print(f"{Fore.CYAN}[⏰️] {end_time.strftime('%Y-%m-%d %H:%M:%S')}  (跳过){Style.RESET_ALL}")
        return skip_result("断点续跑", code or "Unknown", os.path.abspath(os.path.join(root, file)), "progress.json")

    result = process(root, file)
    st, reason, cd, _, detail, _ = result
    if st == "SUCCESS":
        done_set.add(cd)
        save_progress(done_set)

    end_time = datetime.now()
    duration = (end_time - start_time).seconds
    print(f"{Fore.CYAN}[🕒] {end_time.strftime('%Y-%m-%d %H:%M:%S')}  (耗时 {duration}秒){Style.RESET_ALL}")
    if retry_mode:
        log("retry", Fore.CYAN, f"重试结果: {cd} | {st} | {reason}" + (f" | {detail}" if detail else ""))
    print("─"*40)
    time.sleep(random.uniform(DELAY_MIN, DELAY_MAX))
    return result

def main():
    global FORCE_MODE, _selected_folder
    print_welcome()
    FORCE_MODE = choose_mode()
    mode_name = "洗版模式" if FORCE_MODE else "正常模式"
    log("info", Fore.CYAN, f"当前模式: {mode_name}")

    _selected_folder = choose_folder()
    if not _selected_folder: 
        return

    done_set = load_progress()
    files = []
    for r, _, fs in os.walk(_selected_folder):
        for f in fs:
            if os.path.splitext(f)[1].lower() in VIDEO_EXTS:
                files.append((r, f))
    
    results = {}
    print(f"\n🚀 开始任务: 共 {len(files)} 个\n" + "-"*60)

    for i, (root, file) in enumerate(files, 1):
        result = run_one_task(root, file, i, len(files), done_set)
        record_result(results, root, file, result)

    recompute_stats(results)
    sync_report_details(results)
    save_report()

    retry_round = 1
    while True:
        items = retryable_failures(results)
        if not ask_retry(items, retry_round):
            break

        print(f"\n🔁 开始第 {retry_round}/{MAX_TASK_RETRY_ROUNDS} 轮任务级重试: 共 {len(items)} 个\n" + "-"*60)
        for i, item in enumerate(items, 1):
            result = run_one_task(item["root"], item["file"], i, len(items), done_set, attempt=retry_round + 1, retry_mode=True)
            record_result(results, item["root"], item["file"], result, attempt=retry_round + 1)

        recompute_stats(results)
        sync_report_details(results)
        save_report()
        retry_round += 1
        if retry_round > MAX_TASK_RETRY_ROUNDS:
            log("retry", Fore.CYAN, "已达到最大任务级重试轮数")
            break

    recompute_stats(results)
    sync_report_details(results)
    print("\n✨ 任务完成！")
    print(f"最终统计: 总数 {stats['total']} | 成功 {stats['success']} | 跳过 {stats['skip']} | 失败 {stats['fail']}")
    pause_before_exit()

if __name__=="__main__":
    try:
        main()
    except:
        traceback.print_exc()
        pause_before_exit("\n程序异常，按任意键退出...")
