#!/bin/bash

# 更新 apt 包管理器
echo "正在进行更新操作..."
sudo apt update -y

# 安装必要的依赖
echo "安装必要依赖..."
sudo apt install -y curl git

# 安装 nvm (Node Version Manager)
echo "安装 nvm..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# 加载 nvm 到当前 shell 环境
\. "$HOME/.nvm/nvm.sh"

# 安装 Node.js 最新版本（22.x）
echo "安装 Node.js 22..."
nvm install 22

# 验证 Node.js 版本
echo "Verifying Node.js version..."
node -v  # Should print "v22.14.0"
nvm current  # Should print "v22.14.0"

# 验证 npm 版本
echo "Verifying npm version..."
npm -v   # Should print "10.9.2"

# 安装 Chromium 浏览器
echo "安装 Chromium 浏览器..."
sudo apt update
sudo apt install -y chromium-browser

# 安装字体
sudo apt-get -y install fontconfig xfonts-utils
fc-list :lang=zh
sudo apt install fonts-noto-cjk
sudo apt install fontconfig
sudo dpkg-reconfigure fontconfig-config
sudo fc-cache -f -v

echo "环境配置完成!"
echo "开始执行克隆操作..."

echo "正在克隆 FuyuBot 请稍候..."

git clone https://github.com/CatMoeCircle/FuyuBot.git || { echo "克隆失败"; exit 1; }

echo "克隆完成！"

cd FuyuBot

echo "正在为您配置环境..."
npm install || { echo "安装依赖失败"; exit 1; }
echo "环境配置完成！"