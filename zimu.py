import os
import re
import time
import random
from datetime import datetime
from collections import Counter
import cloudscraper
from colorama import Fore, Style, init
import tkinter as tk
from tkinter import filedialog

init(autoreset=True)

# ====== 配置 ======
DELAY_MIN = 1.5
DELAY_MAX = 3.0

scraper = cloudscraper.create_scraper()

# ====== 日志 ======
def log(level, msg):
    colors = {
        "INFO": Fore.CYAN,
        "OK": Fore.GREEN,
        "WARN": Fore.YELLOW,
        "ERR": Fore.RED
    }
    print(colors.get(level, "") + f"[{level}] {msg}" + Style.RESET_ALL)

# ====== 工具 ======
def extract_code(filename):
    m = re.search(r'([A-Z]+[0-9]*-\d+)', filename, re.I)
    return m.group(1).upper() if m else None

def has_chinese_sub_mark(filename):
    return re.search(r'-(c|ch)(?=[\-\.\(]|$)', filename, re.I)

def is_normal_name(name):
    return bool(re.search(r'[A-Z]+-\d+', name, re.I))

# ====== 字幕检测+修正 ======
def check_and_fix_subtitle(root, file):
    base = file.replace(".strm", "")
    exts = [".srt", ".ass", ".vtt"]

    for ext in exts:
        normal = os.path.join(root, base + ext)
        zh = os.path.join(root, base + ".zh" + ext)

        if os.path.exists(zh):
            log("OK", f"已标准字幕: {os.path.basename(zh)}")
            return True, "已存在标准字幕"

        if os.path.exists(normal):
            try:
                os.rename(normal, zh)
                log("INFO", f"修正字幕: {os.path.basename(normal)} → {os.path.basename(zh)}")
                return True, "已修正字幕命名"
            except Exception as e:
                log("ERR", f"改名失败: {e}")
                return True, "改名失败"

    return False, None

# ====== JavSubs ======
def get_javsubs_subs(code):
    log("INFO", f"[JavSubs] 搜索: {code}")

    url = f"https://javsubs.furina.in/api/subtitle?name={code}"

    try:
        r = scraper.get(url, timeout=15)
        if r.status_code != 200:
            log("ERR", "请求失败")
            return []

        subs = r.json().get("data", [])
        log("INFO", f"找到 {len(subs)} 条")
        return subs

    except Exception as e:
        log("ERR", f"异常: {e}")
        return []

def download_javsubs(sub, save_path):
    log("INFO", f"下载: {os.path.basename(save_path)}")

    try:
        r = scraper.get(sub["url"], timeout=20)
        if r.status_code == 200 and len(r.content) > 100:
            with open(save_path, "wb") as f:
                f.write(r.content)
            return True
    except Exception as e:
        log("ERR", f"下载异常: {e}")

    return False

# ====== 选择字幕 ======
def choose_best_sub(subs):
    if not subs:
        return None

    # 优先有duration
    valid = [s for s in subs if s.get("duration", 0) > 0]
    if valid:
        subs = valid

    # 优先短文件名
    subs.sort(key=lambda x: len(x.get("name", "")))
    return subs[0]

# ====== 构建文件名 ======
def build_name(file, ext):
    return file.replace(".strm", f".zh.{ext}")

# ====== 统计 ======
stats = {"total":0,"success":0,"skip":0,"fail":0}
report = {"fail":[]}

# ====== 保存日志 ======
def save_report():
    name = datetime.now().strftime("subtitle_log_%Y-%m-%d_%H-%M-%S.txt")

    with open(name,"w",encoding="utf-8") as f:
        f.write(f"总数:{stats['total']}\n成功:{stats['success']}\n跳过:{stats['skip']}\n失败:{stats['fail']}\n\n")

        f.write("失败列表:\n")
        for i in report["fail"]:
            f.write(f"{i[0]} → {i[1]}\n")

        f.write("\n失败统计:\n")
        c = Counter([r for _,r in report["fail"]])
        for k,v in c.items():
            f.write(f"{k}:{v}\n")

    log("INFO", f"日志保存: {name}")

# ====== 选择目录 ======
def choose_folder():
    root = tk.Tk()
    root.withdraw()
    return filedialog.askdirectory(title="选择STRM目录")

# ====== 主程序 ======
def main():
    folder = choose_folder()
    if not folder:
        return

    log("INFO", f"目录: {folder}")

    for root,_,files in os.walk(folder):
        for file in files:
            if not file.endswith(".strm"):
                continue

            stats["total"]+=1
            log("INFO", f"\n处理: {file}")

            if has_chinese_sub_mark(file):
                log("WARN","跳过（内嵌字幕）")
                stats["skip"]+=1
                continue

            has_sub, reason = check_and_fix_subtitle(root, file)
            if has_sub:
                log("WARN", reason)
                stats["skip"]+=1
                continue

            code = extract_code(file)
            if not code:
                log("WARN","无法识别番号")
                stats["skip"]+=1
                continue

            subs = get_javsubs_subs(code)
            if not subs:
                log("ERR","未找到字幕")
                stats["fail"]+=1
                report["fail"].append((file,"未找到字幕"))
                continue

            sub = choose_best_sub(subs)
            if not sub:
                log("ERR","无合适字幕")
                stats["fail"]+=1
                report["fail"].append((file,"无合适字幕"))
                continue

            save_path = os.path.join(root, build_name(file, sub["ext"]))

            if download_javsubs(sub, save_path):
                log("OK","完成")
                stats["success"]+=1
            else:
                log("ERR","下载失败")
                stats["fail"]+=1
                report["fail"].append((file,"下载失败"))

            time.sleep(random.uniform(DELAY_MIN, DELAY_MAX))

    print("\n"+"="*40)
    log("INFO","完成")
    log("INFO",f"总数:{stats['total']}")
    log("OK",f"成功:{stats['success']}")
    log("WARN",f"跳过:{stats['skip']}")
    log("ERR",f"失败:{stats['fail']}")

    save_report()

if __name__ == "__main__":
    main()
    input("\n回车退出...")