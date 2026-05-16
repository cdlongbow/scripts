#!/bin/bash

# ================= 配置区域 =================
NAS_IP="10.10.10.90"
MOUNT_PATH="/mnt/fnos_samba"
FLAG_FILE="$MOUNT_PATH"   # Samba 不一定有标志文件，这里直接检测目录可读
LOG_FILE="/home/script/logs/samba_monitor.log"
MAX_LOG_LINES=300
# ===========================================

SESSION_LOG=""

log() {
    local MSG="$(date '+%Y-%m-%d %H:%M:%S') - $1"
    SESSION_LOG="${SESSION_LOG}${MSG}\n"
}

finalize_log() {
    local SEPARATOR="------------------------------------------------------------\n"
    local FULL_BLOCK="${SESSION_LOG}${SEPARATOR}"
    
    if [ -f "$LOG_FILE" ]; then
        local OLD_CONTENT=$(head -n "$MAX_LOG_LINES" "$LOG_FILE" 2>/dev/null)
        echo -e "${FULL_BLOCK}${OLD_CONTENT}" > "$LOG_FILE"
    else
        echo -e "${FULL_BLOCK}" > "$LOG_FILE"
    fi
}

mkdir -p "$(dirname "$LOG_FILE")"

# 1. 网络检测
if ! ping -c 1 -W 2 "$NAS_IP" > /dev/null 2>&1; then
    log "[OFFLINE] 警告: 无法 ping 通 Samba 服务器 ($NAS_IP)，跳过。"
    finalize_log
    exit 0
fi

# 2. 挂载检测
if mountpoint -q "$MOUNT_PATH"; then
    if timeout 3 ls "$MOUNT_PATH" > /dev/null 2>&1; then
        log "[HEALTHY] Samba 挂载正常且可读。"
        finalize_log
        exit 0
    else
        ERROR_MSG="挂载僵死 (Stale)"
    fi
else
    ERROR_MSG="挂载点丢失"
fi

# 3. 修复流程
log "[RECOVER] 检测到异常: $ERROR_MSG，开始修复..."
umount -l "$MOUNT_PATH" > /dev/null 2>&1
umount -f "$MOUNT_PATH" > /dev/null 2>&1
sleep 2
mount -a
sleep 2

# 4. 验证结果
if mountpoint -q "$MOUNT_PATH" && timeout 3 ls "$MOUNT_PATH" > /dev/null 2>&1; then
    log "[SUCCESS] Samba 挂载已恢复正常。"
else
    log "[FAILED] 自动修复失败，请检查 Samba 服务状态。"
fi

finalize_log
