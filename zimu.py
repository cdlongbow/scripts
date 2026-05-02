import os
import re
import time
import random
import signal
import atexit
from datetime import datetime
from collections import Counter
import cloudscraper
from colorama import Fore, Style, init
from tqdm import tqdm
import tkinter as tk
from tkinter import filedialog

init(autoreset=True)

# ====== 配置 ======
DELAY_MIN = 1.5
DELAY_MAX = 3.0
DOWNLOAD_RETRIES = 3        # 下载最大重试次数
RETRY_DELAY = 2.0           # 重试基础间隔（秒），指数退避

scraper = cloudscraper.create_scraper()

# ====== 日志 ======
def log(level, msg):
    colors = {
        "INFO": Fore.CYAN,
        "OK": Fore.GREEN,
        "WARN": Fore.YELLOW,
        "ERR": Fore.RED
    }
    tqdm.write(colors.get(level, "") + f"[{level}] {msg}" + Style.RESET_ALL)

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

    for attempt in range(1, DOWNLOAD_RETRIES + 1):
        try:
            r = scraper.get(sub["url"], timeout=20)
            if r.status_code == 200 and len(r.content) > 100:
                with open(save_path, "wb") as f:
                    f.write(r.content)
                return True
            else:
                log("WARN", f"下载响应异常 (尝试 {attempt}/{DOWNLOAD_RETRIES}): HTTP {r.status_code}, 大小 {len(r.content)}B")
        except Exception as e:
            log("WARN", f"下载异常 (尝试 {attempt}/{DOWNLOAD_RETRIES}): {e}")

        if attempt < DOWNLOAD_RETRIES:
            wait = RETRY_DELAY * (2 ** (attempt - 1))   # 指数退避: 2s, 4s
            log("INFO", f"等待 {wait:.0f}s 后重试...")
            time.sleep(wait)

    log("ERR", f"下载失败，已重试 {DOWNLOAD_RETRIES} 次")
    return False

# ====== 字幕优先级评分 ======
# 返回值越小优先级越高
def sub_priority(sub):
    name = sub.get("name", "").lower()

    # 第一优先级：zh / zh-cn / chs（简体明确标记）
    if re.search(r'[\.\-_]zh[\.\-_](?!tw|hk|hant)', name):  # .zh. 排除繁体
        lang_score = 0
    elif re.search(r'[\.\-_](zh-cn|chs|sc|simp)[\.\-_.]', name):
        lang_score = 1
    # 第二优先级：无语言后缀（纯番号命名）
    elif re.search(r'^[a-z]+-\d+\.(srt|ass|vtt)$', name):
        lang_score = 2
    # 第三优先级：繁体中文
    elif re.search(r'[\.\-_](zh-tw|zh-hk|cht|trad|hant)[\.\-_.]', name):
        lang_score = 3
    # 兜底：其他
    else:
        lang_score = 4

    # 同级内文件名短的更干净
    name_len = len(name)

    return (lang_score, name_len)

# ====== 选择字幕 ======
def choose_best_sub(subs):
    if not subs:
        return None
    subs.sort(key=sub_priority)
    best = subs[0]
    log("INFO", f"选择字幕: {best.get('name', '?')}")
    return best

# ====== 构建文件名 ======
def build_name(file, ext):
    base = file[:-5]  # 去掉 ".strm"
    return f"{base}.zh.{ext}"

# ====== 统计 ======
stats = {"total": 0, "success": 0, "skip": 0, "fail": 0}
report = {"fail": []}

# ====== 断点续传 ======
CACHE_FILE = ".zimu_cache"
_done_set: set = set()
_cache_handle = None

def load_cache():
    """读取上次已处理的文件路径"""
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            paths = {line.strip() for line in f if line.strip()}
        log("INFO", f"发现断点缓存，已跳过 {len(paths)} 个文件")
        return paths
    return set()

def open_cache_writer():
    """追加模式打开 cache，程序运行期间保持句柄"""
    global _cache_handle
    _cache_handle = open(CACHE_FILE, "a", encoding="utf-8")

def mark_done(full_path):
    """记录一个文件已处理完成"""
    _done_set.add(full_path)
    if _cache_handle:
        _cache_handle.write(full_path + "\n")
        _cache_handle.flush()   # 立即落盘，防止崩溃丢失

def close_cache():
    if _cache_handle:
        _cache_handle.close()

def clear_cache():
    """任务正常完成后删除 cache"""
    close_cache()
    if os.path.exists(CACHE_FILE):
        os.remove(CACHE_FILE)
        log("INFO", "断点缓存已清除")

def _emergency_save(signum=None, frame=None):
    """捕获到终止信号时，确保 cache 落盘后退出"""
    tqdm.write(Fore.YELLOW + "\n[WARN] 检测到中断，正在保存进度..." + Style.RESET_ALL)
    close_cache()
    # 不删 cache，下次启动可以续传
    os._exit(1)   # 强制退出，跳过 atexit（atexit 里的 clear_cache 是正常完成才调用）

# ====== 保存日志 ======
def save_report():
    name = datetime.now().strftime("subtitle_log_%Y-%m-%d_%H-%M-%S.txt")

    with open(name, "w", encoding="utf-8") as f:
        f.write(f"总数:{stats['total']}\n成功:{stats['success']}\n跳过:{stats['skip']}\n失败:{stats['fail']}\n\n")

        f.write("失败列表:\n")
        for i in report["fail"]:
            f.write(f"{i[0]} → {i[1]}\n")

        f.write("\n失败统计:\n")
        c = Counter([r for _, r in report["fail"]])
        for k, v in c.items():
            f.write(f"{k}:{v}\n")

    log("INFO", f"日志保存: {name}")

# ====== 选择目录 ======
def choose_folder():
    root = tk.Tk()
    root.withdraw()
    return filedialog.askdirectory(title="选择STRM目录")

# ====== 收集所有 strm 文件 ======
def collect_strm_files(folder):
    result = []
    for root, _, files in os.walk(folder):
        for file in files:
            if file.endswith(".strm"):
                result.append((os.path.normpath(root), file))
    return result

# ====== 主程序 ======
def main():
    folder = choose_folder()
    if not folder:
        return

    log("INFO", f"目录: {folder}")

    # 注册信号处理（Ctrl+C、kill、窗口关闭）
    signal.signal(signal.SIGINT,  _emergency_save)
    signal.signal(signal.SIGTERM, _emergency_save)

    # 加载断点缓存
    global _done_set
    _done_set = load_cache()
    open_cache_writer()

    log("INFO", "扫描文件中...")
    strm_files = collect_strm_files(folder)
    stats["total"] = len(strm_files)

    if not strm_files:
        log("WARN", "未找到任何 .strm 文件")
        clear_cache()
        return

    # 过滤掉已处理的
    pending = [(r, f) for r, f in strm_files
               if os.path.join(r, f) not in _done_set]
    skipped_by_cache = len(strm_files) - len(pending)

    log("INFO", f"共找到 {stats['total']} 个 .strm 文件")
    if skipped_by_cache:
        log("INFO", f"断点续传：跳过已完成 {skipped_by_cache} 个，剩余 {len(pending)} 个\n")
    else:
        log("INFO", "")

    with tqdm(
        total=len(pending),
        unit="个",
        ncols=80,
        bar_format="{l_bar}{bar}| {n_fmt}/{total_fmt} [{elapsed}<{remaining}]"
    ) as pbar:
        for root, file in pending:
            full_path = os.path.join(root, file)

            code_hint = extract_code(file) or file[:20]
            pbar.set_description(f"{code_hint:<12}")

            log("INFO", f"\n{'─'*50}")
            log("INFO", f"文件: {full_path}")

            if has_chinese_sub_mark(file):
                log("WARN", "跳过（内嵌字幕）")
                stats["skip"] += 1
                mark_done(full_path)
                pbar.update(1)
                continue

            has_sub, reason = check_and_fix_subtitle(root, file)
            if has_sub:
                log("WARN", reason)
                stats["skip"] += 1
                mark_done(full_path)
                pbar.update(1)
                continue

            code = extract_code(file)
            if not code:
                log("WARN", "无法识别番号")
                stats["skip"] += 1
                mark_done(full_path)
                pbar.update(1)
                continue

            subs = get_javsubs_subs(code)
            if not subs:
                log("ERR", "未找到字幕")
                stats["fail"] += 1
                report["fail"].append((full_path, "未找到字幕"))
                mark_done(full_path)
                pbar.update(1)
                continue

            sub = choose_best_sub(subs)
            if not sub:
                log("ERR", "无合适字幕")
                stats["fail"] += 1
                report["fail"].append((full_path, "无合适字幕"))
                mark_done(full_path)
                pbar.update(1)
                continue

            save_path = os.path.join(root, build_name(file, sub["ext"]))

            if download_javsubs(sub, save_path):
                log("OK", "完成")
                stats["success"] += 1
            else:
                stats["fail"] += 1
                report["fail"].append((full_path, "下载失败"))

            # 无论成功失败都标记已处理（失败的日志里有记录，不重复跑）
            mark_done(full_path)
            pbar.update(1)
            time.sleep(random.uniform(DELAY_MIN, DELAY_MAX))

    print("\n" + "=" * 50)
    log("INFO", "全部处理完成")
    log("INFO", f"总数:  {stats['total']}")
    log("OK",   f"成功:  {stats['success']}")
    log("WARN", f"跳过:  {stats['skip']}")
    log("ERR",  f"失败:  {stats['fail']}")

    save_report()
    clear_cache()   # 正常完成才删 cache

if __name__ == "__main__":
    main()
    input("\n回车退出...")
