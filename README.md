**Fuyu Bot**
---

English |  [简体中文](./docs/README_zh-CN.md) | [Русский](.docs/README_RU.md)

---

## Developing v2 Version
Currently in progress. Some features are not yet implemented. Stay tuned!

### Features
- Multi-account login support
- Support for bot and user account login
- Improved plugin loading
- Multi-language support
- WEB management interface

## Description

A Telegram Bot project based on [GramJS](https://github.com/gram-js/gramjs), supporting user-defined plugins.

---

## Supported Platforms

| Platform       | Status |
|----------------|--------|
| Windows        | ✔      |
| Termux(Android)| ✔      |
| Linux          | ✔      |
| MacOS          | ? (Untested)|

For MacOS, we don't have the necessary hardware for testing. If you encounter any issues, please submit an issue.  
For Termux, refer to the [Termux Deployment Guide](#termux).

---

## Deployment

### Prerequisites

1. Go to https://my.telegram.org/apps and register a new application to get your API ID and API Hash.

2. Create a Telegram Bot via [@BotFather](https://t.me/BotFather) and get the Bot Token.

3. Install [Node.js](https://nodejs.org/), preferably the LTS (Long-Term Support) version.

### Clone the Project

```bash
git clone https://github.com/CatMoeCircle/FuyuBot.git
```
### Configure API

Navigate to the project root directory and create a .env file. Add the following content:

```env
API_ID=123456  # Telegram API ID
API_HASH=123456789abcdefghijklmn  # Telegram API Hash
```
---
### Start the Bot

#### On Windows and Linux
```bash
npm i
npm run test
```
#### On Termux

Manual installation and environment setup:
```bash
# Update the package list
pkg update && pkg upgrade

# Install required packages
pkg install x11-repo tur-repo
pkg install chromium
pkg install nodejs python3 setuptools binutils binutils-is-llvm git which

# Download Android NDK for Termux: https://github.com/lzhiyong/termux-ndk
curl -L https://github.com/lzhiyong/termux-ndk/releases/download/android-ndk/android-ndk-r27b-aarch64.zip
unzip android-ndk-r27b-aarch64.zip

# Set up NDK environment variables
export GYP_DEFINES="android_ndk_path='$HOME/android-ndk-r27b'"

# Clone the project or navigate to the project directory if already cloned
git clone https://github.com/CatMoeCircle/FuyuBot.git
cd shiny-journey-bot

# Install dependencies
npm i

# Start the bot
npm run test
```

---

# Contact and Contributions

If you encounter any issues or have suggestions for improvement, feel free to submit an Issue or Pull Request.
Join our group [@xiaoqvan_chat](https://t.me/xiaoqvan_chat) to discuss and collaborate.
Let's make FuyuBot better together!



