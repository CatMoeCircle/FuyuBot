**FuyuBot**
---

English | [简体中文](./docs/README_zh-CN.md)

---

## Description:

A Telegram Bot project based on [GramJS](https://github.com/gram-js/gramjs), supporting user-defined plugins.
***
## Supported Platforms

| Platform | Status |
|----------|--------|
| Windows  | ✔      |
| Termux(Android)   | ✔      |
| Linux    | ✔      |
| MacOS    | ❓ (Untested) |

For MacOS, we do not have the equipment to test. If you encounter any issues, please submit an Issue.

For Termux, please refer to the [Termux Deployment Guide](#termux)

---

## Deployment

### Prerequisites

1. Go to https://my.telegram.org/apps and register a new application to get the API ID and API Hash.

2. Create a Telegram Bot with [@BotFather](https://t.me/BotFather) to get the Bot Token.

3. Install [Node.js](https://nodejs.org/), it is recommended to use the LTS version.

### Clone the Project

```bash
git clone https://github.com/CatMoeCircle/FuyuBot.git
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
Use the installation script for a quick setup. The script will automatically configure the environment. You just need to clone the project, install the dependencies, and start the service.
```bash
bash <(curl -sL https://github.com/CatMoeCircle/FuyuBot/raw/main/scripts/termux.sh)
```
Or install manually
```bash
# Update package list
pkg update && pkg upgrade

# Install required packages
pkg install x11-repo tur-repo
pkg install chromium
pkg install nodejs python3 setuptools binutils binutils-is-llvm git which

# Download Termux's Android NDK https://github.com/lzhiyong/termux-ndk
curl -L https://github.com/lzhiyong/termux-ndk/releases/download/android-ndk/android-ndk-r27b-aarch64.zip
unzip android-ndk-r27b-aarch64.zip

# Configure NDK environment variables
export GYP_DEFINES="android_ndk_path='$HOME/android-ndk-r27b'"

# Clone the project, if already cloned, just enter the project directory
git clone https://github.com/CatMoeCircle/FuyuBot.git
cd FuyuBot

# Install dependencies
npm i

# Start the service
npm run test
```
---

# Contact and Contribute

If you encounter any issues or have suggestions for improvements while using the bot, feel free to submit an Issue or Pull Request. Join our group for discussions.  
Let's make **FuyuBot** even better together!
