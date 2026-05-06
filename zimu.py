# -*- coding: utf-8 -*-
import os, re, time, random, json, hashlib, traceback
import cloudscraper
import requests
from datetime import datetime
from colorama import Fore, Style, init
import tkinter as tk
from tkinter import filedialog

init(autoreset=True)

# ==================== 路径配置 ====================
DESKTOP = os.path.join(os.path.expanduser("~"), "Desktop")

DELAY_MIN, DELAY_MAX = 2.5, 5.0
REQUEST_RETRIES = 3
PROGRESS_FILE = "progress.json"
FORCE_MODE = False
stats = {"total":0,"success":0,"skip":0,"fail":0}
report_details = []
_selected_folder = ""

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
    "log":   "[📝]"
}

def log(tag, color, msg):
    print(color + f"{SYMBOL_MAP.get(tag,'[    ]')} {msg}" + Style.RESET_ALL)

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

def safe_get(url, use_scraper=False, **kwargs):
    client = scraper if use_scraper else session
    for i in range(REQUEST_RETRIES):
        try:
            time.sleep(random.uniform(0.5, 1.5))
            r = client.get(url, timeout=15, **kwargs)
            if r.status_code == 200 and r.content.strip():
                return r
            if r.status_code == 429:
                wait = 2 ** (i+1)
                log("err", Fore.YELLOW, f"429限速，退避 {wait}s")
                time.sleep(wait)
                continue
        except Exception as e:
            log("err", Fore.YELLOW, f"请求异常: {str(e)[:50]}")
        wait = 2 ** (i+1)
        log("err", Fore.YELLOW, f"请求失败，重试 {i+1}/{REQUEST_RETRIES} (等待{wait}s)")
        time.sleep(wait)
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

def check_subtitle(content, ext="srt"):
    try:
        text = content.decode("utf-8", errors="ignore")
    except:
        return False, "编码错误"
    if "<html" in text.lower():
        return False, "HTML内容"
    clean_text = extract_valid_text(text, ext)
    if len(clean_text) < 20:
        return False, "有效内容过少"
    total = len(clean_text)
    zh = sum(1 for c in clean_text if '\u4e00' <= c <= '\u9fff')
    zh_ratio = zh / total if total else 0
    bad = sum(1 for c in clean_text if ord(c) > 127 and not ('\u4e00' <= c <= '\u9fff') and c not in "，。！？：；“”‘’（）【】《》")
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

def md5_file(p):
    if not os.path.exists(p): return None
    with open(p,"rb") as f: return hashlib.md5(f.read()).hexdigest()

def md5_bytes(b): return hashlib.md5(b).hexdigest()

def extract_code(name):
    m = re.search(r'([A-Z]+[0-9]*-\d+)', name, re.I)
    return m.group(1).upper() if m else None

def has_embedded(file):
    return re.search(r'-(c|ch)(?=[\-\.\(]|$)',file,re.I)

def download(url, save):
    r = safe_get(url)
    if not r:
        return "FAIL", "下载失败"
    
    content = r.content
    new_md5 = md5_bytes(content)
    old_md5 = md5_file(save)
    
    if os.path.exists(save):
        if FORCE_MODE:
            if new_md5 == old_md5:
                log("skip", Fore.YELLOW, f"MD5相同，跳过: {os.path.basename(save)}")
                return "SKIP_MD5", "MD5相同"
            else:
                with open(save, "wb") as f:
                    f.write(content)
                log("rep", Fore.CYAN, f"洗版替换完成: {os.path.basename(save)}")
                return "REPLACED", "MD5不同（已替换）"
        else:
            log("skip", Fore.YELLOW, f"文件已存在，跳过: {os.path.basename(save)}")
            return "SKIP_EXIST", "文件已存在"
    
    # 文件不存在 → 正常下载
    with open(save, "wb") as f:
        f.write(content)
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
        r = safe_get("https://healertanker.com/swx/movie/search", use_scraper=True, params={"keyword":code,"size":24,"page":1})
        if not r: return []
        decoded = decode_manko(r.json())
        if not decoded: return []
        mid = decoded[0]["_id"]
        r = safe_get(f"https://healertanker.com/swx/subtitle-link/{mid}", use_scraper=True)
        if not r: return []
        raw = decode_manko(r.json())
        if not raw: return []
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
        log("net",Fore.WHITE,f"Manko返回字幕数: {len(subs)}")
        return subs
    except Exception as e:
        log("err",Fore.RED,f"Manko异常: {e}")
        return []

def process(root, file):
    code = extract_code(file)
    base = os.path.splitext(file)[0]
    abs_path = os.path.abspath(os.path.join(root, file))
    rel_path = abs_path

    if has_embedded(file):
        log("skip", Fore.YELLOW, f"{abs_path} (内嵌字幕跳过)")
        return "SKIP", "内嵌字幕", code or "Unknown", rel_path

    if not code:
        return "FAIL", "无法识别", "Unknown", rel_path

    log("scan", Fore.CYAN, f"检索中: {code} | {abs_path}")

    # ====================== 模式1：本地字幕优先检查 ======================
    if not FORCE_MODE:   # 正常模式下先检查本地
        for lang in ["zh", "chs", "sc", "zh-CN"]:
            for ext in ["srt", "ass"]:
                existing = os.path.join(root, f"{base}.{lang}.{ext}")
                if os.path.exists(existing):
                    log("skip", Fore.YELLOW, f"本地已存在字幕，跳过: {os.path.basename(existing)}")
                    return "SKIP", "本地已存在", code, rel_path
                    
                # 也检查不带语言后缀的 .zh.srt 常见写法
                simple_zh = os.path.join(root, f"{base}.zh.{ext}")
                if os.path.exists(simple_zh):
                    log("skip", Fore.YELLOW, f"本地已存在字幕，跳过: {os.path.basename(simple_zh)}")
                    return "SKIP", "本地已存在", code, rel_path

    # ====================== Manko 查询 ======================
    subs = get_manko(code)
    tw = None

    for s in subs:
        if s["lang"] in ["zh", "chs", "sc"]:
            save = os.path.join(root, f"{base}.{s['lang']}.{s['ext']}")
            log("down", Fore.MAGENTA, f"Manko({s['lang']}) -> {os.path.basename(save)}")
            
            status, reason = download(s["url"], save)
            
            if status in ["REPLACED", "OK"]:
                log("ok", Fore.GREEN, f"成功: {code} (Manko-zh)")
                return "SUCCESS", "Manko", code, rel_path
            elif status in ["SKIP_MD5", "SKIP_EXIST"]:
                log("ok", Fore.GREEN, f"成功: {code} (Manko-zh 已存在)")
                return "SUCCESS", "Manko", code, rel_path
                
        elif s["lang"] in ["tw", "cht", "tc"]:
            tw = s

    if tw:
        log("fall", Fore.WHITE, "Manko zh 异常 → 暂存 tw → 尝试 JavSubs")
    else:
        log("fall", Fore.WHITE, "Manko无有效字幕 → JavSubs")

    # ====================== JavSubs 查询 ======================
    r = safe_get(f"https://javsubs.furina.in/api/subtitle?name={code}")
    if r:
        try:
            data = r.json().get("data", [])
        except:
            data = []

        if data:
            matched_subs = [sub for sub in data if code.upper() in sub.get('name', '').upper()]
            
            if matched_subs:
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
                    status, reason = download(sub["url"], save)
                    
                    if status in ["REPLACED", "OK"]:
                        log("ok", Fore.GREEN, f"成功: {code} (JavSubs - {sub['ext'].upper()})")
                        return "SUCCESS", "JavSubs", code, rel_path
                    elif status in ["SKIP_MD5", "SKIP_EXIST"]:
                        log("ok", Fore.GREEN, f"成功: {code} (JavSubs - 已存在)")
                        return "SUCCESS", "JavSubs", code, rel_path

    # ====================== 回退 Manko TW ======================
    if tw:
        save = os.path.join(root, f"{base}.{tw['lang']}.{tw['ext']}")
        log("down", Fore.MAGENTA, f"Manko({tw['lang']}) -> {os.path.basename(save)}")
        status, reason = download(tw["url"], save)
        
        if status in ["REPLACED", "OK", "SKIP_MD5", "SKIP_EXIST"]:
            log("ok", Fore.GREEN, f"成功: {code} (Manko-tw)")
            return "SUCCESS", "Manko", code, rel_path

    log("err", Fore.RED, f"失败: {code} (无可用字幕)")
    return "FAIL", "无可用字幕", code, rel_path

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
                    f.write(f" ● {r['code']} | {r['path']} | {r['reason']}\n")
        log("log",Fore.GREEN,f"报告已保存: {path}")
    except Exception as e:
        log("err", Fore.RED, f"保存报告失败: {e}")

def main():
    global FORCE_MODE, _selected_folder
    tk.Tk().withdraw()
    _selected_folder = filedialog.askdirectory()
    if not _selected_folder: 
        return
    
    FORCE_MODE = (input("模式: 1正常 2洗版: ").strip()=="2")

    done_set = load_progress()
    files = []
    for r, _, fs in os.walk(_selected_folder):
        for f in fs:
            VIDEO_EXTS = {".mp4", ".mkv", ".avi", ".mov", ".wmv", ".flv", ".ts", ".m2ts", ".rmvb", ".strm"}
            if os.path.splitext(f)[1].lower() in VIDEO_EXTS:
                files.append((r, f))
    
    stats["total"] = len(files)
    print(f"\n🚀 开始任务: 共 {stats['total']} 个\n" + "-"*60)

    for i, (root, file) in enumerate(files, 1):
        print(f"\n进度: {i}/{stats['total']}")
        
        # ==================== 开始时间戳 ====================
        start_time = datetime.now()
        print(f"{Fore.CYAN}[🕒] {start_time.strftime('%Y-%m-%d %H:%M:%S')}{Style.RESET_ALL}")
        # ==================================================
        
        code = extract_code(file)
        if not FORCE_MODE and code in done_set:
            log("skip", Fore.YELLOW, f"{code} 已完成(断点续跑)")
            stats["skip"] += 1
            # 结束时间戳（跳过的情况也打印）
            end_time = datetime.now()
            print(f"{Fore.CYAN}[⏰️] {end_time.strftime('%Y-%m-%d %H:%M:%S')}  (跳过){Style.RESET_ALL}")
            continue
        
        st, rs, cd, path = process(root, file)
        
        if st == "SUCCESS":
            stats["success"] += 1
            done_set.add(cd)
            save_progress(done_set)
        elif st == "SKIP":
            stats["skip"] += 1
        else:
            stats["fail"] += 1
        
        report_details.append({"code": cd, "status": st, "reason": rs, "path": path})
        
        # ==================== 结束时间戳 ====================
        end_time = datetime.now()
        duration = (end_time - start_time).seconds
        print(f"{Fore.CYAN}[🕒] {end_time.strftime('%Y-%m-%d %H:%M:%S')}  (耗时 {duration}秒){Style.RESET_ALL}")
        # ==================================================
        
        print("─"*40)
        time.sleep(random.uniform(DELAY_MIN, DELAY_MAX))

    save_report()
    print("\n✨ 任务完成！")
    input("\n按回车键关闭窗口...")

if __name__=="__main__":
    try:
        main()
    except:
        traceback.print_exc()
        input("\n程序异常，按回车退出...")