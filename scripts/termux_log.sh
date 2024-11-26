#!/bin/bash

# 日志文件
LOG_FILE="$HOME/termux_setup.log"

# 重定向所有输出到日志文件
exec &> >(tee -a "$LOG_FILE")

echo "日志记录到 $LOG_FILE"

# 开始执行操作
echo "开始安装和配置..." | tee -a "$LOG_FILE"

# 检查是否使用国内源
echo "是否切换到国内源? [y/n]" | tee -a "$LOG_FILE"
read -p "请输入选项: " choice

case "$choice" in
    y|Y)
        echo "正在切换到国内源..." | tee -a "$LOG_FILE"
        sed -i 's@^\(deb.*stable main\)$@#\1\ndeb https://mirrors.tuna.tsinghua.edu.cn/termux/termux-packages-24 stable main@' $PREFIX/etc/apt/sources.list
        echo "更新软件包列表..." | tee -a "$LOG_FILE"
        apt update && apt upgrade -y 2>&1 | tee -a "$LOG_FILE" || { echo "更新失败，查看日志文件 $LOG_FILE"; exit 1; }
        ;;
    *)
        echo "跳过切换源，直接更新..." | tee -a "$LOG_FILE"
        apt update && apt upgrade -y 2>&1 | tee -a "$LOG_FILE" || { echo "更新失败，查看日志文件 $LOG_FILE"; exit 1; }
        ;;
esac

# 安装 curl 和 unzip
echo "检查并安装必需工具 curl 和 unzip..." | tee -a "$LOG_FILE"
pkg i curl unzip -y 2>&1 | tee -a "$LOG_FILE" || { echo "安装失败，查看日志文件 $LOG_FILE"; exit 1; }

# 安装 X11 和 Termux 用户存储库
echo "安装 X11 和 Termux 用户存储库..." | tee -a "$LOG_FILE"
pkg i x11-repo tur-repo -y 2>&1 | tee -a "$LOG_FILE" || { echo "安装失败，查看日志文件 $LOG_FILE"; exit 1; }

# 安装 Chromium 浏览器
echo "安装 Chromium 浏览器..." | tee -a "$LOG_FILE"
pkg i chromium -y 2>&1 | tee -a "$LOG_FILE" || { echo "安装失败，查看日志文件 $LOG_FILE"; exit 1; }

# 安装 Node.js
echo "安装 Node.js..." | tee -a "$LOG_FILE"
pkg i nodejs -y 2>&1 | tee -a "$LOG_FILE" || { echo "安装失败，查看日志文件 $LOG_FILE"; exit 1; }

# 下载 Android NDK
echo "正在下载 Android NDK，请稍候..." | tee -a "$LOG_FILE"
NDK_URL="https://github.com/lzhiyong/termux-ndk/releases/download/android-ndk/android-ndk-r27b-aarch64.zip"
NDK_ZIP="$HOME/android-ndk-r27b-aarch64.zip"
NDK_DIR="$HOME/android-ndk"

curl -L $NDK_URL -o $NDK_ZIP 2>&1 | tee -a "$LOG_FILE" || { echo "下载失败，查看日志文件 $LOG_FILE"; exit 1; }
echo "解压 Android NDK..." | tee -a "$LOG_FILE"
unzip -o $NDK_ZIP -d $NDK_DIR 2>&1 | tee -a "$LOG_FILE" || { echo "解压失败，查看日志文件 $LOG_FILE"; exit 1; }
rm $NDK_ZIP

# 解压 Android NDK
echo "解压 Android NDK..." | tee -a "$LOG_FILE"
unzip -o $NDK_ZIP -d $NDK_DIR 2>&1 | tee -a "$LOG_FILE" || { echo "解压失败，查看日志文件 $LOG_FILE"; exit 1; }

# 移动解压后的内容到正确的目录
mv $NDK_DIR/android-ndk-r27b/* $NDK_DIR/ 2>&1 | tee -a "$LOG_FILE" || { echo "移动文件失败，查看日志文件 $LOG_FILE"; exit 1; }
rm -r $NDK_DIR/android-ndk-r27b
rm $NDK_ZIP

# 读取解压位置并设置环境变量
echo "配置 Android NDK 环境变量..." | tee -a "$LOG_FILE"
export GYP_DEFINES="android_ndk_path='$NDK_DIR'"

# 安装 Telegram 相关依赖
echo "安装 Telegram 依赖库..." | tee -a "$LOG_FILE"
npm i telegram 2>&1 | tee -a "$LOG_FILE" || { echo "安装失败，查看日志文件 $LOG_FILE"; exit 1; }

# 安装 binutils-is-llvm
echo "安装 binutils-is-llvm..." | tee -a "$LOG_FILE"
pkg install binutils-is-llvm -y 2>&1 | tee -a "$LOG_FILE" || { echo "安装失败，查看日志文件 $LOG_FILE"; exit 1; }

# 安装 binutils
echo "安装 binutils..." | tee -a "$LOG_FILE"
pkg install binutils -y 2>&1 | tee -a "$LOG_FILE" || { echo "安装失败，查看日志文件 $LOG_FILE"; exit 1; }

# 安装 Python
echo "安装 Python..." | tee -a "$LOG_FILE"
pkg install python3 -y 2>&1 | tee -a "$LOG_FILE" || { echo "安装失败，查看日志文件 $LOG_FILE"; exit 1; }

# 安装 setuptools
echo "安装 setuptools..." | tee -a "$LOG_FILE"
pip install setuptools 2>&1 | tee -a "$LOG_FILE" || { echo "安装失败，查看日志文件 $LOG_FILE"; exit 1; }

# 安装 python-distutils 和 build-essential
echo "安装 python-distutils 和 build-essential..." | tee -a "$LOG_FILE"
pkg install build-essential -y 2>&1 | tee -a "$LOG_FILE" || { echo "安装失败，查看日志文件 $LOG_FILE"; exit 1; }

# 安装 SQLite3
echo "安装 SQLite3..." | tee -a "$LOG_FILE"
npm install sqlite3 2>&1 | tee -a "$LOG_FILE" || { echo "安装失败，查看日志文件 $LOG_FILE"; exit 1; }

echo "所有操作已完成！" | tee -a "$LOG_FILE"
