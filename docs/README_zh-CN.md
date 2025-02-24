**FuyuBot**
---

[English](../README.md) | 简体中文


---

## 描述:

一个基于 [GramJS](https://github.com/gram-js/gramjs) 的 Telegram Bot 项目，支持用户自定义插件。
***
## 支持平台

| 平台       | 状态 |
|----------|----|
| Windows  | ✔  |
| Termux(Android)  | ✔  |
| Linux   | ✔  |
| MacOS    | ?(未测试)|

关于MacOS，我们没有设备进行测试如果有问题请提Issue
Termux请看 [Termux 部署指南](#termux)

---

## 部署

### 先决条件

1. 转到 https://my.telegram.org/apps 并注册新的应用程序，获得API ID 和 API Hash。

2. [@BotFather](https://t.me/BotFather) 创建一个 Telegram Bot，获得 Bot Token。

3. 安装 [Node.js](https://nodejs.org/) v18 或更高版本。

### 克隆项目

```bash
git clone https://github.com/CatMoeCircle/FuyuBot.git
```

### 配置API


进入项目根目录后创建 `.env` 文件，添加以下内容：

```dotenv
API_ID=123456  # Telegram API ID
API_HASH=123456789abcdefghijklmn # Telegram API Hash
BOT_TOKEN=123456:ABCDEFGHIJKLMNOPQRSTUVWXYZ # Telegram Bot Token
```

---

### 启动

#### **Windows**
   ```bash
   npm i
   npm run start
   ```
#### **Linux**
在 Linux 系统下，您可能需要为 `puppeteer` 补全环境。请参考以下链接获取详细的故障排除步骤：https://pptr.dev/troubleshooting#chrome-doesnt-launch-on-linux

```bash
npm i
npm run start
```

#### **Termux**
使用安装脚本快速安装，脚本会自动配置环境，你只需要克隆项目，然后安装依赖包并启动。

```bash
bash <(curl -sL https://github.com/CatMoeCircle/FuyuBot/raw/main/scripts/termux.sh)
```

或者手动安装

```bash
# 更新软件包列表
pkg update && pkg upgrade

# 安装需要的软件包
pkg install x11-repo tur-repo
pkg install chromium-browser
pkg install nodejs python3 setuptools binutils binutils-is-llvm git which

# 下载termux的Android NDK https://github.com/lzhiyong/termux-ndk
curl -L https://github.com/lzhiyong/termux-ndk/releases/download/android-ndk/android-ndk-r27b-aarch64.zip
unzip android-ndk-r27b-aarch64.zip

# 配置NDK环境变量
export GYP_DEFINES="android_ndk_path='$HOME/android-ndk-r27b'"

# 克隆项目如果已经克隆则只需要进入项目目录
git clone https://github.com/CatMoeCircle/FuyuBot.git
cd shiny-journey-bot

# 安装依赖包
npm i

# 启动服务
npm run start
```
---

# 联系与参与贡献

如果在使用过程中有任何问题或改进建议，欢迎提交 Issue 或 Pull Requests，加入我们的群组进行讨论。  
一起让 **FuyuBot** 更加完善！


<!-- FuyuBot （“冬”的意思，冷静又宁静） -->