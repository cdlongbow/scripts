# -*- coding: utf-8 -*-
import os, re, time, random, signal, json, hashlib, traceback
import cloudscraper
from datetime import datetime
from colorama import Fore, Style, init
from collections import Counter
import tkinter as tk
from tkinter import filedialog

init(autoreset=True)

DELAY_MIN, DELAY_MAX = 2.5, 5.0
REQUEST_RETRIES = 3

FORCE_MODE = False
stats = {"total":0,"success":0,"skip":0,"fail":0}
report_details = []
_selected_folder = ""

scraper = cloudscraper.create_scraper()

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

# ===== 重试请求 =====
def safe_get(url, **kwargs):
    for i in range(REQUEST_RETRIES):
        try:
            r = scraper.get(url, timeout=15, **kwargs)
            if r.status_code == 200 and r.text.strip():
                return r
        except:
            pass

        wait = 2 + i * 2
        log("err", Fore.YELLOW, f"请求失败，重试 {i+1}/{REQUEST_RETRIES} (等待{wait}s)")
        time.sleep(wait)

    return None

# ===== 字幕检测 =====
def check_subtitle(content):
    try:
        text = content.decode("utf-8", errors="ignore")
    except:
        return False, "编码错误"

    if len(text) < 50:
        return False, "内容过短"

    total = len(text)
    zh = sum(1 for c in text if '\u4e00' <= c <= '\u9fff')
    zh_ratio = zh / total

    bad = sum(1 for c in text if ord(c) > 127 and c not in "，。！？：；“”‘’（）【】《》")
    bad_ratio = bad / total

    if zh < 20:
        return False, f"中文过少({zh})"

    if zh_ratio < 0.1:
        return False, f"中文比例低({zh_ratio:.2f})"

    if bad_ratio > 0.3:
        return False, f"乱码比例高({bad_ratio:.2f})"

    return True, "正常"

# ===== MD5 =====
def md5_file(p):
    if not os.path.exists(p): return None
    with open(p,"rb") as f: return hashlib.md5(f.read()).hexdigest()

def md5_bytes(b): return hashlib.md5(b).hexdigest()

# ===== 编号 =====
def extract_code(name):
    m=re.search(r'([A-Z]+[0-9]*-\d+)',name,re.I)
    return m.group(1).upper() if m else None

# ===== 内嵌字幕 =====
def has_embedded(file):
    return re.search(r'-(c|ch)(?=[\-\.\(]|$)',file,re.I)

# ===== 下载 =====
def download(url,save):
    r = safe_get(url)
    if not r: return "FAIL","下载失败"

    content = r.content
    new = md5_bytes(content)
    old = md5_file(save)

    if FORCE_MODE and old:
        if new == old:
            return "SKIP_MD5","MD5相同"
        else:
            with open(save,"wb") as f:f.write(content)
            return "REPLACED","MD5不同"

    with open(save,"wb") as f:f.write(content)
    return "OK","成功"

# ===== Manko 解码 =====
def base91_decode(e):
    A='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"'
    t=e or "";a=o=0;i=-1;r=[]
    for c in t:
        p=A.find(c)
        if p==-1:continue
        if i<0:i=p
        else:
            i+=p*91;a|=i<<o
            o+=13 if (i&8191)>88 else 14
            while o>7:r.append(a&255);a>>=8;o-=8
            i=-1
    if i>-1:r.append((a|i<<o)&255)
    try:return bytes(r).decode()
    except:return ""

def decode_manko(j):
    try:
        return json.loads(base91_decode(j.get("data","")))
    except:
        return None

# ===== Manko =====
def get_manko(code):
    try:
        log("net",Fore.WHITE,"Manko 查询中...")

        r = safe_get("https://healertanker.com/swx/movie/search",
                     params={"keyword":code,"size":24,"page":1})

        if not r: return []

        try:
            decoded = decode_manko(r.json())
        except:
            return []

        if not decoded: return []

        mid = decoded[0]["_id"]

        r = safe_get(f"https://healertanker.com/swx/subtitle-link/{mid}")
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

        log("net",Fore.WHITE,f"Manko返回字幕数: {len(subs)}")
        return subs

    except Exception as e:
        log("err",Fore.RED,f"Manko异常: {e}")
        return []

# ===== 主逻辑 =====
def process(root,file):
    code=extract_code(file)
    base=os.path.splitext(file)[0]

    if has_embedded(file):
        log("skip",Fore.YELLOW,f"{file} (内嵌字幕跳过)")
        return "SKIP","内嵌字幕",code or "Unknown"

    if not code:
        return "FAIL","无法识别","Unknown"

    log("scan",Fore.CYAN,f"检索中: {code}")

    subs=get_manko(code)
    tw=None

    for s in subs:
        if s["lang"] in ["zh","chs","sc"]:
            save=os.path.join(root,f"{base}.{s['lang']}.{s['ext']}")
            log("down",Fore.MAGENTA,f"Manko({s['lang']}) -> {os.path.basename(save)}")

            r=safe_get(s["url"])
            if not r: continue

            ok,reason=check_subtitle(r.content)
            if not ok:
                log("err",Fore.YELLOW,f"Manko zh 字幕异常: {reason}")
                continue

            res,_=download(s["url"],save)
            log("ok",Fore.GREEN,f"成功: {code} (Manko-zh)")
            return "SUCCESS","Manko",code

        elif s["lang"] in ["tw","cht","tc"]:
            tw=s

    if tw:
        log("fall",Fore.WHITE,"Manko zh 异常 → 暂存 tw → 尝试 JavSubs(优先简体)")
    else:
        log("fall",Fore.WHITE,"Manko无有效字幕 → JavSubs")

    # ===== JavSubs =====
    r=safe_get(f"https://javsubs.furina.in/api/subtitle?name={code}")
    if r:
        try:
            data=r.json().get("data",[])
        except:
            data=[]

        for sub in data:
            log("match",Fore.CYAN,f"匹配: {sub['name']}")

            save=os.path.join(root,f"{base}.zh.{sub['ext']}")
            log("down",Fore.MAGENTA,f"JavSubs -> {os.path.basename(save)}")

            r2=safe_get(sub["url"])
            if not r2: continue

            ok,reason=check_subtitle(r2.content)
            if not ok:
                log("err",Fore.YELLOW,f"JavSubs 字幕异常: {reason}")
                continue

            download(sub["url"],save)
            log("ok",Fore.GREEN,f"成功: {code} (JavSubs)")
            return "SUCCESS","JavSubs",code

    # fallback tw
    if tw:
        save=os.path.join(root,f"{base}.{tw['lang']}.{tw['ext']}")
        log("down",Fore.MAGENTA,f"Manko({tw['lang']}) -> {os.path.basename(save)}")

        r=safe_get(tw["url"])
        if r:
            ok,_=check_subtitle(r.content)
            if ok:
                download(tw["url"],save)
                log("ok",Fore.GREEN,f"成功: {code} (Manko-tw)")
                return "SUCCESS","Manko",code

    return "FAIL","失败",code

# ===== 报告 =====
def save_report():
    if not _selected_folder:return
    path=os.path.join(_selected_folder,f"字幕任务报告_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt")

    with open(path,"w",encoding="utf-8") as f:
        f.write("="*80+"\n")
        f.write(f" 字幕下载详细报告 | 生成时间: {datetime.now()}\n")
        f.write("="*80+"\n\n")

        f.write(f"任务总数: {stats['total']}\n成功: {stats['success']}\n跳过: {stats['skip']}\n失败: {stats['fail']}\n\n")

        for r in report_details:
            f.write(f"{r['code']} | {r['status']} | {r['reason']}\n")

    log("log",Fore.GREEN,f"报告已保存: {path}")

# ===== 主 =====
def main():
    global FORCE_MODE,_selected_folder

    tk.Tk().withdraw()
    _selected_folder=filedialog.askdirectory()
    if not _selected_folder:return

    FORCE_MODE=(input("模式: 1正常 2洗版: ").strip()=="2")

    files=[]
    for r,_,fs in os.walk(_selected_folder):
        for f in fs:
            if f.endswith(".strm"):
                files.append((r,f))

    stats["total"]=len(files)

    print(f"\n🚀 开始任务: 共 {stats['total']} 个\n"+"-"*60)

    for root,file in files:
        st,rs,cd=process(root,file)

        if st=="SUCCESS": stats["success"]+=1
        elif st=="SKIP": stats["skip"]+=1
        else: stats["fail"]+=1

        report_details.append({"code":cd,"status":st,"reason":rs})

        print("─"*40)
        time.sleep(random.uniform(DELAY_MIN,DELAY_MAX))

    save_report()

    print("\n✨ 任务完成！")
    input("\n按回车键关闭窗口...")

if __name__=="__main__":
    try:
        main()
    except:
        traceback.print_exc()
        input("\n程序异常，按回车退出...")