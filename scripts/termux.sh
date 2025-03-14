#!/bin/bash

echo "开始执行操作..."

# 安装 curl 和 unzip
echo "检查并安装必需工具 curl 和 unzip..."
pkg i curl unzip -y || { echo "安装失败"; exit 1; }

# 安装 X11 和 Termux 用户存储库
echo "安装 X11 和 Termux 用户存储库..."
pkg i x11-repo tur-repo -y || { echo "安装失败"; exit 1; }

# 安装 Chromium 浏览器
echo "安装 Chromium 浏览器..."
pkg i chromium -y || { echo "安装失败"; exit 1; }

# 安装 Node.js
echo "安装 Node.js..."
pkg i nodejs -y || { echo "安装失败"; exit 1; }

# 下载 Android NDK
echo "正在下载 Android NDK，请稍候..."
NDK_URL="https://github.com/lzhiyong/termux-ndk/releases/download/android-ndk/android-ndk-r27b-aarch64.zip"
NDK_ZIP="$HOME/android-ndk-r27b-aarch64.zip"
NDK_DIR="$HOME/android-ndk"

curl -L $NDK_URL -o $NDK_ZIP || { echo "下载失败"; exit 1; }
echo "解压 Android NDK..."
unzip -o $NDK_ZIP -d $NDK_DIR || { echo "解压失败"; exit 1; }
rm $NDK_ZIP

# 移动解压后的内容到正确的目录
mv $NDK_DIR/android-ndk-r27b/* $NDK_DIR/ || { echo "移动文件失败"; exit 1; }
rm -r $NDK_DIR/android-ndk-r27b

# 配置 Android NDK 环境变量
echo "配置 Android NDK 环境变量..."
export GYP_DEFINES="android_ndk_path='$NDK_DIR'"

# 安装 Telegram 相关依赖
echo "安装 Telegram 依赖库..."
npm i telegram || { echo "安装失败"; exit 1; }

# 安装 binutils-is-llvm
echo "安装 binutils-is-llvm..."
pkg install binutils-is-llvm -y || { echo "安装失败"; exit 1; }

# 安装 binutils
echo "安装 binutils..."
pkg install binutils -y || { echo "安装失败"; exit 1; }

# 安装 Python
echo "安装 Python..."
pkg install python3 -y || { echo "安装失败"; exit 1; }

# 安装 setuptools
echo "安装 setuptools..."
pip install setuptools || { echo "安装失败"; exit 1; }

# 安装 python-distutils 和 build-essential
echo "安装 python-distutils 和 build-essential..."
pkg install build-essential -y || { echo "安装失败"; exit 1; }

# 安装 SQLite3
echo "安装 SQLite3..."
npm install sqlite3 || { echo "安装失败"; exit 1; }

echo "环境配置操作已完成！"

echo "开始执行克隆操作..."

echo "正在克隆 FuyuBot 请稍候..."

git clone https://github.com/CatMoeCircle/FuyuBot.git || { echo "克隆失败"; exit 1; }

echo "克隆完成！"

cd FuyuBot

echo "正在为您配置环境..."
npm install || { echo "安装依赖失败"; exit 1; }
echo "环境配置完成！"
