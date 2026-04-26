#!/usr/bin/env bash
# Alpine Linux 多功能管理脚本
# 支持 Alpine 3.18 ~ 3.24
# 功能：网络配置、Docker安装、DPanel面板安装

# 检查 bash 是否存在
if ! command -v bash &>/dev/null; then
    echo "[ERROR] 本脚本需要 bash，请运行: apk add bash"
    exit 1
fi

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

MAIN_IFACE=""
CURRENT_IP=""
ALPINE_VER=""

# 打印函数
print_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_title() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# 获取 Alpine 版本
get_alpine_version() {
    ALPINE_VER=$(cut -d. -f1,2 /etc/alpine-release)
}

# 检测并修复仓库配置
fix_repositories() {
    # [修复] 局部变量初始化，防止多次调用时残留上次的值
    local NEED_FIX=0
    local NEED_UPDATE=0

    get_alpine_version
    print_info "检查仓库配置..."

    # 检查是否配置了源
    if [ ! -s /etc/apk/repositories ]; then
        print_warn "仓库配置文件为空，重新配置..."
        NEED_FIX=1
    fi

    # 检查 community 是否被注释
    if grep -q "^#.*community" /etc/apk/repositories 2>/dev/null; then
        print_warn "检测到 community 仓库被注释，正在启用..."
        sed -i 's/^#\(.*community\)/\1/' /etc/apk/repositories
        NEED_UPDATE=1
    fi

    # 检查 main 是否被注释
    if grep -q "^#.*main" /etc/apk/repositories 2>/dev/null; then
        print_warn "检测到 main 仓库被注释，正在启用..."
        sed -i 's/^#\(.*main\)/\1/' /etc/apk/repositories
        NEED_UPDATE=1
    fi

    # 检查是否缺少必要的仓库
    if ! grep -q "main" /etc/apk/repositories 2>/dev/null || \
       ! grep -q "community" /etc/apk/repositories 2>/dev/null; then
        print_warn "仓库配置不完整，重新配置..."
        NEED_FIX=1
    fi

    # 重新配置仓库
    if [ "$NEED_FIX" = "1" ]; then
        cp /etc/apk/repositories /etc/apk/repositories.bak.$(date +%Y%m%d_%H%M%S) 2>/dev/null
        cat > /etc/apk/repositories <<EOF
http://mirrors.tuna.tsinghua.edu.cn/alpine/v$ALPINE_VER/main
http://mirrors.tuna.tsinghua.edu.cn/alpine/v$ALPINE_VER/community
EOF
        NEED_UPDATE=1
    fi

    if [ "$NEED_UPDATE" = "1" ]; then
        print_info "更新软件包索引..."
        apk update
    fi

    echo ""
    print_info "当前仓库配置:"
    grep -v "^#" /etc/apk/repositories | while read -r line; do
        echo "  ✓ $line"
    done
    echo ""
}

# 检测网络配置
detect_network() {
    # [修复] 正则加括号，正确匹配 eth/ens/enp 前缀的网卡名
    MAIN_IFACE=$(ip link show | grep -v lo | grep -E '^[0-9]+: (eth|ens|enp)' | head -1 | awk -F': ' '{print $2}')
    [ -z "$MAIN_IFACE" ] && MAIN_IFACE="eth0"
    CURRENT_IP=$(ip addr show "$MAIN_IFACE" 2>/dev/null | grep 'inet ' | awk '{print $2}' | cut -d/ -f1 | head -1)
    [ -z "$CURRENT_IP" ] && CURRENT_IP="未配置"
}

# 检查并安装必要工具
check_and_install_tools() {
    local need_install=0

    if ! command -v curl &>/dev/null; then
        print_warn "curl 未安装，将自动安装"
        need_install=1
    fi

    if ! command -v wget &>/dev/null; then
        print_warn "wget 未安装，将自动安装"
        need_install=1
    fi

    if ! command -v nano &>/dev/null; then
        print_warn "nano 未安装，将自动安装"
        need_install=1
    fi

    if [ $need_install -eq 1 ]; then
        print_info "安装必要工具 (curl, wget, nano)..."
        apk add --no-cache curl wget nano
    fi
}

# 查看网络状态
show_network_status() {
    print_title "网络状态"
    detect_network

    echo "【网卡信息】"
    ip addr show | grep -E "^[0-9]+:|inet " | while read -r line; do echo "  $line"; done
    echo ""
    echo "【主网卡: $MAIN_IFACE】"
    echo "  IP地址: $CURRENT_IP"
    echo ""
    echo "【路由信息】"
    ip route | while read -r line; do echo "  $line"; done
    echo ""
    echo "【DNS 配置】"
    if [ -f /etc/resolv.conf ]; then
        grep nameserver /etc/resolv.conf | while read -r line; do echo "  $line"; done
    else
        echo "  未配置 DNS"
    fi
    echo ""
    echo "【网络连接测试】"
    if ping -c 2 8.8.8.8 &>/dev/null; then
        print_info "网络连接正常"
    else
        print_warn "网络连接异常"
    fi
    echo ""
    read -rp "按回车键返回..."
}

# 配置 DHCP
configure_dhcp() {
    print_title "配置 DHCP"
    detect_network
    echo "当前网卡: $MAIN_IFACE | 当前IP: $CURRENT_IP"
    read -rp "确认设置为 DHCP？(y/n): " confirm; echo
    [[ ! $confirm =~ ^[Yy]$ ]] && { print_info "取消"; read -rp "按回车键返回..."; return; }

    cp /etc/network/interfaces /etc/network/interfaces.bak.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
    cat > /etc/network/interfaces <<EOF
auto lo
iface lo inet loopback

auto $MAIN_IFACE
iface $MAIN_IFACE inet dhcp
EOF
    service networking restart || /etc/init.d/networking restart
    sleep 3
    detect_network
    print_info "新 IP: $CURRENT_IP (DHCP)"
    read -rp "按回车键返回..."
}

# 配置静态IP
configure_static() {
    print_title "配置静态IP"
    detect_network
    echo "当前网卡: $MAIN_IFACE | 当前IP: $CURRENT_IP"
    echo ""

    read -rp "静态IP地址 [例: 192.168.1.100]: " STATIC_IP
    while [ -z "$STATIC_IP" ]; do read -rp "IP不能为空: " STATIC_IP; done
    read -rp "子网掩码 [默认: 255.255.255.0]: " NETMASK
    NETMASK=${NETMASK:-255.255.255.0}
    read -rp "网关地址: " GATEWAY
    while [ -z "$GATEWAY" ]; do read -rp "网关不能为空: " GATEWAY; done

    echo ""
    print_info "配置信息: $STATIC_IP / $NETMASK / 网关 $GATEWAY"
    read -rp "确认？(y/n): " confirm; echo
    [[ ! $confirm =~ ^[Yy]$ ]] && { print_info "取消"; read -rp "按回车键返回..."; return; }

    cp /etc/network/interfaces /etc/network/interfaces.bak.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
    cat > /etc/network/interfaces <<EOF
auto lo
iface lo inet loopback

auto $MAIN_IFACE
iface $MAIN_IFACE inet static
    address $STATIC_IP
    netmask $NETMASK
    gateway $GATEWAY
EOF
    service networking restart || /etc/init.d/networking restart
    sleep 3
    detect_network
    print_info "静态IP配置完成: $CURRENT_IP"
    read -rp "按回车键返回..."
}

# DNS 设置
configure_dns() {
    print_title "DNS 设置"

    echo "当前 DNS:"
    if [ -f /etc/resolv.conf ]; then
        grep nameserver /etc/resolv.conf | while read -r line; do echo "  $line"; done
    else
        echo "  未配置"
    fi
    echo ""

    echo "请选择操作："
    echo "1. DHCP 自动获取"
    echo "2. 手动设置 DNS（最多2个）"
    echo "3. 使用公共 DNS（阿里+腾讯）"
    echo "4. 使用公共 DNS（谷歌+Cloudflare）"
    echo "5. 清空 DNS"
    echo "0. 返回上级菜单"
    echo ""
    read -rp "请选择 [0-5]: " dns_choice

    case $dns_choice in
        0)
            print_info "返回上级菜单"
            return
            ;;
        1)
            service networking restart || /etc/init.d/networking restart
            print_info "已恢复 DHCP DNS"
            ;;
        2)
            echo ""
            print_info "手动设置 DNS（最多2个，输入空行结束）"
            > /etc/resolv.conf

            read -rp "请输入首选 DNS [例: 8.8.8.8]: " dns1
            if [ -n "$dns1" ]; then
                echo "nameserver $dns1" >> /etc/resolv.conf
                print_info "已设置 DNS1: $dns1"

                echo ""
                read -rp "是否设置第二个 DNS？(y/n): " set_dns2; echo
                if [[ $set_dns2 =~ ^[Yy]$ ]]; then
                    read -rp "请输入备用 DNS [例: 8.8.4.4]: " dns2
                    if [ -n "$dns2" ]; then
                        echo "nameserver $dns2" >> /etc/resolv.conf
                        print_info "已设置 DNS2: $dns2"
                    fi
                fi
            else
                print_warn "未输入任何 DNS，取消设置"
            fi
            ;;
        3)
            cat > /etc/resolv.conf <<EOF
nameserver 223.5.5.5
nameserver 119.29.29.29
EOF
            print_info "已设置 DNS: 阿里(223.5.5.5) + 腾讯(119.29.29.29)"
            ;;
        4)
            cat > /etc/resolv.conf <<EOF
nameserver 8.8.8.8
nameserver 1.1.1.1
EOF
            print_info "已设置 DNS: 谷歌(8.8.8.8) + Cloudflare(1.1.1.1)"
            ;;
        5)
            > /etc/resolv.conf
            print_info "已清空 DNS"
            ;;
        *)
            print_error "无效选项"
            read -rp "按回车键返回..."
            return
            ;;
    esac

    echo ""
    print_info "当前 DNS 配置:"
    if [ -s /etc/resolv.conf ]; then
        grep nameserver /etc/resolv.conf | while read -r line; do echo "  $line"; done
    else
        echo "  (未配置)"
    fi
    echo ""
    read -rp "按回车键返回..."
}

# 网络菜单
network_menu() {
    while true; do
        clear
        print_title "网络配置"
        echo ""
        echo "1. 查看网络状态"
        echo "2. DHCP 自动获取"
        echo "3. 静态IP配置"
        echo "4. DNS 设置"
        echo "0. 返回主菜单"
        echo ""
        read -rp "请选择 [0-4]: " choice
        case $choice in
            1) show_network_status ;;
            2) configure_dhcp ;;
            3) configure_static ;;
            4) configure_dns ;;
            0) break ;;
            *) print_error "无效选项"; sleep 1 ;;
        esac
    done
}

# 配置清华源
configure_tsinghua() {
    print_title "配置清华源"
    get_alpine_version

    if grep -q "mirrors.tuna.tsinghua.edu.cn" /etc/apk/repositories; then
        print_info "当前已是清华源"
        echo ""
        cat /etc/apk/repositories
    else
        cp /etc/apk/repositories /etc/apk/repositories.bak.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
        cat > /etc/apk/repositories <<EOF
http://mirrors.tuna.tsinghua.edu.cn/alpine/v$ALPINE_VER/main
http://mirrors.tuna.tsinghua.edu.cn/alpine/v$ALPINE_VER/community
EOF
        apk update
        print_info "✅ 清华源配置完成"
    fi
    echo ""
    read -rp "按回车键返回..."
}

# 安装 Docker（核心）
install_docker() {
    print_title "安装 Docker"

    get_alpine_version
    print_info "检测到 Alpine 版本: $ALPINE_VER"

    fix_repositories
    check_and_install_tools

    echo ""
    print_info "开始安装 Docker..."

    if apk add --no-cache docker docker-compose openrc; then
        print_info "✅ Docker 安装成功"
    else
        print_warn "尝试其他包名组合..."
        if apk add --no-cache docker docker-cli docker-cli-compose openrc 2>/dev/null; then
            print_info "✅ Docker 安装成功（使用 docker-cli）"
        else
            print_error "Docker 安装失败"
            echo ""
            print_info "请手动检查:"
            echo "  1. 仓库配置: cat /etc/apk/repositories"
            echo "  2. 搜索可用包: apk search docker | grep -E '^docker'"
            echo "  3. 手动安装: apk add docker docker-compose openrc"
            read -rp "按回车键返回..."
            return 1
        fi
    fi

    echo ""
    print_info "配置 cgroup（PVE 环境适配）..."
    # [修复] PVE 宿主机下 cgroup 通常已由内核挂载，检测后再决定是否手动挂载
    # 避免在已挂载的情况下重复挂载导致冲突
    if ! mount | grep -q cgroup2; then
        # 额外判断：/sys/fs/cgroup 下已有子目录说明已由系统接管，不强行挂载
        if [ -z "$(ls -A /sys/fs/cgroup 2>/dev/null)" ]; then
            print_info "尝试挂载 cgroup2..."
            mount -t cgroup2 none /sys/fs/cgroup 2>/dev/null || \
                print_warn "cgroup2 挂载失败，Docker 可能仍可正常运行"
        else
            print_info "cgroup 已由系统管理，跳过手动挂载"
        fi
    else
        print_info "cgroup2 已挂载，跳过"
    fi
    # [修复] PVE 环境不写 fstab cgroup 条目，避免重启挂载冲突

    echo ""
    print_info "配置 Docker 服务..."
    mkdir -p /run/openrc /run/lock
    touch /run/openrc/softlevel

    # [修复] 使用 default 级别而非 boot，确保在网络就绪后再启动 Docker
    if rc-update add docker default 2>/dev/null; then
        print_info "已添加 docker 到开机启动 (default 级别)"
    fi

    # 启动 Docker 服务
    if service docker start 2>/dev/null; then
        print_info "Docker 服务已启动"
    elif rc-service docker start 2>/dev/null; then
        print_info "Docker 服务已启动"
    else
        print_warn "尝试手动启动 dockerd..."
        dockerd > /var/log/docker.log 2>&1 &
        sleep 3
    fi

    echo ""
    sleep 2

    # 等待 Docker 就绪（最多 20 秒）
    local retry=0
    while ! docker info &>/dev/null && [ $retry -lt 10 ]; do
        echo -n "."
        sleep 2
        retry=$((retry + 1))
    done
    echo ""

    if docker info &>/dev/null; then
        print_info "✅ Docker 运行正常！"
        echo ""
        docker version
        echo ""
        read -rp "测试运行 hello-world？(y/n): " confirm; echo
        if [[ $confirm =~ ^[Yy]$ ]]; then
            docker run --rm hello-world
        fi
    else
        print_error "Docker 启动失败"
        echo ""
        print_info "尝试手动启动:"
        echo "  dockerd &"
        echo "  或查看日志: tail -f /var/log/docker.log"
    fi

    echo ""
    read -rp "按回车键返回..."
}

# Docker 状态
show_docker_status() {
    print_title "Docker 状态"

    if command -v docker &>/dev/null && docker info &>/dev/null; then
        print_info "✅ Docker 运行中"
        echo ""
        docker version
        echo ""
        echo "【容器列表】"
        docker ps -a
        echo ""
        echo "【资源使用】"
        docker system df
        echo ""
        echo "【Docker 信息】"
        docker info | grep -E "Containers|Images|Cgroup Driver|Cgroup Version|Storage Driver"
    elif command -v docker &>/dev/null; then
        print_error "Docker 已安装但未运行"
        echo ""
        print_info "尝试启动: service docker start"
    else
        print_error "Docker 未安装"
    fi

    echo ""
    read -rp "按回车键返回..."
}

# Docker 菜单
docker_menu() {
    while true; do
        clear
        print_title "Docker 管理"
        echo ""
        echo "1. 安装 Docker"
        echo "2. 查看状态"
        echo "3. 启动 Docker"
        echo "4. 停止 Docker"
        echo "5. 重启 Docker"
        echo "6. 卸载 Docker"
        echo "0. 返回主菜单"
        echo ""
        read -rp "请选择 [0-6]: " choice

        case $choice in
            1) install_docker ;;
            2) show_docker_status ;;
            3)
                service docker start 2>/dev/null || dockerd > /var/log/docker.log 2>&1 &
                print_info "Docker 已启动"
                sleep 2
                ;;
            4)
                service docker stop 2>/dev/null || pkill dockerd
                print_info "Docker 已停止"
                sleep 1
                ;;
            5)
                service docker stop 2>/dev/null || pkill dockerd
                sleep 2
                service docker start 2>/dev/null || dockerd > /var/log/docker.log 2>&1 &
                print_info "Docker 已重启"
                sleep 2
                ;;
            6)
                print_title "卸载 Docker"
                read -rp "确认卸载 Docker？(y/n): " confirm; echo
                if [[ $confirm =~ ^[Yy]$ ]]; then
                    service docker stop 2>/dev/null
                    pkill dockerd 2>/dev/null
                    rc-update del docker default 2>/dev/null
                    apk del docker docker-compose docker-cli docker-cli-compose docker-engine 2>/dev/null
                    rm -rf /var/lib/docker /etc/docker /run/docker /var/run/docker.sock
                    print_info "✅ Docker 已卸载"
                fi
                sleep 1
                ;;
            0) break ;;
            *) print_error "无效选项"; sleep 1 ;;
        esac
    done
}

# 安装 DPanel
install_dpanel() {
    print_title "安装 DPanel 面板"

    if ! command -v docker &>/dev/null || ! docker info &>/dev/null; then
        print_error "Docker 未运行或未安装"
        echo ""
        read -rp "是否先安装 Docker？(y/n): " confirm; echo
        if [[ $confirm =~ ^[Yy]$ ]]; then
            install_docker
            if ! docker info &>/dev/null; then
                print_error "Docker 安装失败，无法继续安装 DPanel"
                read -rp "按回车键返回..."
                return
            fi
        else
            read -rp "按回车键返回..."
            return
        fi
    fi

    check_and_install_tools

    echo ""
    print_info "下载并执行 DPanel 安装脚本..."
    print_warn "注意：DPanel 安装完成后会自动返回本脚本"
    echo ""
    read -rp "继续安装 DPanel？(y/n): " confirm; echo
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        read -rp "按回车键返回..."
        return
    fi

    # [修复] 下载失败时报错退出，不盲目执行空文件
    print_info "正在下载 DPanel 安装脚本..."
    if curl -sSL --connect-timeout 15 --retry 2 https://dpanel.cc/quick.sh -o /tmp/quick.sh; then
        # 基本校验：文件非空且包含 bash 内容
        if [ -s /tmp/quick.sh ] && head -1 /tmp/quick.sh | grep -q "sh"; then
            bash /tmp/quick.sh
            rm -f /tmp/quick.sh
            echo ""
            print_info "✅ DPanel 安装完成"
        else
            rm -f /tmp/quick.sh
            print_error "下载的安装脚本内容异常，已取消执行"
        fi
    else
        print_error "DPanel 安装脚本下载失败，请检查网络连接"
        print_info "也可手动执行: curl -sSL https://dpanel.cc/quick.sh | bash"
    fi

    echo ""
    read -rp "按回车键返回..."
}

# 一键安装
install_all() {
    print_title "一键安装 (网络 + Docker + DPanel)"

    echo "=== 步骤 1/4: 网络配置 ==="
    echo "1. DHCP 自动获取"
    echo "2. 静态IP配置"
    echo "3. 跳过"
    read -rp "请选择 [1-3]: " net_choice
    echo ""

    case $net_choice in
        1) configure_dhcp ;;
        2) configure_static ;;
        *) print_info "跳过网络配置" ;;
    esac

    echo ""
    echo "=== 步骤 2/4: DNS 配置 ==="
    read -rp "是否配置 DNS？(y/n): " confirm; echo
    if [[ $confirm =~ ^[Yy]$ ]]; then
        configure_dns
    fi

    echo ""
    echo "=== 步骤 3/4: 安装 Docker ==="
    read -rp "是否安装 Docker？(y/n): " confirm; echo
    if [[ $confirm =~ ^[Yy]$ ]]; then
        install_docker
    else
        print_info "跳过 Docker 安装"
    fi

    echo ""
    echo "=== 步骤 4/4: 安装 DPanel ==="
    read -rp "是否安装 DPanel？(y/n): " confirm; echo
    if [[ $confirm =~ ^[Yy]$ ]]; then
        install_dpanel
    fi

    print_info "✅ 一键安装完成"
    echo ""
    read -rp "按回车键返回..."
}

# 主菜单
main_menu() {
    while true; do
        clear
        print_title "Alpine Linux 管理脚本"
        get_alpine_version
        echo "  系统版本: Alpine $ALPINE_VER"
        echo -e "${BLUE}========================================${NC}"
        echo ""
        echo "1. 网络配置"
        echo "2. Docker 管理"
        echo "3. 安装 DPanel 面板"
        echo "4. 配置清华源"
        echo "5. 一键全部安装"
        echo "0. 退出"
        echo ""
        read -rp "请选择 [0-5]: " choice

        case $choice in
            1) network_menu ;;
            2) docker_menu ;;
            3) install_dpanel ;;
            4) configure_tsinghua ;;
            5) install_all ;;
            0)
                print_info "感谢使用，再见！"
                exit 0
                ;;
            *)
                print_error "无效选项，请重新选择"
                sleep 1
                ;;
        esac
    done
}

# 主入口
if [ "$(id -u)" != "0" ]; then
    print_error "请使用 root 用户运行此脚本"
    exit 1
fi

# 初始化
get_alpine_version
main_menu
