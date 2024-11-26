[中文](./README_zh-CN.md)

# Project Overview

**Shiny Journey Bot** is a **JavaScript-based Telegram Bot** that leverages **puppeteer-core** to dynamically merge text and images. It breaks the limitations of traditional text-based Telegram Bots, offering a visually enhanced and interactive communication experience.

---

# Key Features

- **Plugin Interface**  
  Open plugin interface allows developers to easily extend functionalities according to their needs.

- **Hot Update & Hot Reload**  
  Update commands or features without restarting the service, ensuring a smoother development and user experience.

- **Image Generation API**  
  Design your own HTML layout and use the API to generate custom images effortlessly.

---

# Supported Platforms

1. **Termux**  
   Fully optimized for Termux with extensively tested one-click automatic setup scripts.

2. **Windows**  
   Supports Windows with a command-line version. A web-based version is under development—stay tuned! Suggestions are welcome via Issue submissions.

3. **Linux**  
   Compatible with Linux and provides the same convenient one-click automatic setup as Termux.

---

# Usage Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/xiaoqvan/shiny-journey-bot.git
```

### 2. Extract Files and Set Up Environment Variables

Navigate to the project directory and create a `.env` file with the following content:

```dotenv
API_ID=
API_HASH=
BOT_TOKEN=
```

Fill in your respective credentials.

---

### 3. Configuration and Startup

#### **For Windows**

1. Go to the `scripts` directory and double-click `win_setup.bat` to configure the environment.
2. Return to the root directory and install dependencies:

   ```bash
   npm i
   ```

3. Test the bot:

   ```bash
   npm run test
   ```

---

#### **For Linux**

1. Clone the repository and install dependencies.
2. Enter the `scripts` directory and execute the corresponding setup script.
3. Return to the root directory and start the bot:

   ```bash
   npm run start
   ```

---

#### **For Termux**

Setup scripts for Termux are under development and will be available soon. Stay tuned!

---

# Support and Contribution

If you encounter any issues or have suggestions for improvement, feel free to submit an Issue or join our development community.  
Together, let’s make **Shiny Journey Bot** even better!
