**Shiny Journey Bot**
---

[中文](./docs/README_zh-CN.md)

---

## Description:

A Telegram Bot project based on [GramJS](https://github.com/gram-js/gramjs), supporting user-defined plugins.
***
## Supported Platforms

| Platform | Status |
|----------|--------|
| Windows  | ✔      |
| Termux   | ✔      |
| Linux    | ✔      |
| MacOS    | ?      |

---

## Deployment

### Prerequisites

1. Go to https://my.telegram.org/apps and register a new application to get the API ID and API Hash.

2. Create a Telegram Bot with [@BotFather](https://t.me/BotFather) to get the Bot Token.

3. Install [Node.js](https://nodejs.org/), it is recommended to use the LTS (Long Term Support) version.

### Clone the Project

```bash
git clone https://github.com/xiaoqvan/shiny-journey-bot.git
```

### Configure API

Create a `.env` file in the root directory of the project and add the following content:

```dotenv
API_ID=123456  # Telegram API ID
API_HASH=123456789abcdefghijklmn # Telegram API Hash
BOT_TOKEN=123456:ABCDEFGHIJKLMNOPQRSTUVWXYZ # Telegram Bot Token
```

---

### Start

#### Windows and Linux
   ```bash
   npm i
   npm run test
   ```

#### **Termux**
Use the one-click installation script for one-click installation. The script will automatically configure the environment and then start the service.
```bash
bash <(curl -sL https://github.com/xiaoqvan/shiny-journey-bot/raw/main/scripts/termux.sh)
```
Or install manually
```bash
# Update package list
pkg update && pkg upgrade
# Install required packages
pkg install x11-repo tur-repo
pkg install chromium
pkg install nodejs python3 setuptools binutils binutils-is-llvm git
# Download Termux's Android NDK https://github.com/lzhiyong/termux-ndk
curl -L https://github.com/lzhiyong/termux-ndk/releases/download/android-ndk/android-ndk-r27b-aarch64.zip
unzip android-ndk-r27b-aarch64.zip
# Configure NDK environment variables
export GYP_DEFINES="android_ndk_path='$HOME/android-ndk-r27b'"
# Clone the project, if already cloned, just enter the project directory
git clone https://github.com/xiaoqvan/shiny-journey-bot.git
cd shiny-journey-bot
# Install dependencies
npm i
# Start the service
npm run start
```
---

# Contact and Support

If you have any questions or suggestions for improvement during use, feel free to submit an issue or join our group for discussion.  
Let's make **Shiny Journey Bot** better together!
