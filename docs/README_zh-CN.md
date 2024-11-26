[English](./README.md)

# 项目概述

**Shiny Journey Bot** 是一个由 **JavaScript** 编写的 **Telegram Bot**，通过集成 **puppeteer-core** 实现文本与图像的动态融合，彻底突破 Telegram Bot 传统的文本交流与内联限制，为聊天体验带来更多创意和视觉享受。

---

# 特色功能

- **插件扩展接口**  
  提供开放式插件接口，开发者可以根据需求轻松扩展功能。

- **热更新与热加载**  
  无需重启服务，支持命令实时修改，让开发调试更加高效。

- **图像生成接口**  
  只需编写 HTML 界面，通过调用接口即可快速生成个性化图像。

---

# 支持平台

1. **Termux**  
   我们针对 Termux 环境进行了深入优化，提供了多次测试验证的全自动脚本，仅需一条命令即可完成环境配置。

2. **Windows**  
   支持 Windows 平台，提供命令行版本（Web 版本开发中）。如有建议，欢迎提交 Issue。

3. **Linux**  
   支持 Linux 环境，提供与 Termux 一样便捷的全自动脚本配置方案。

---

# 使用方法

### 1. 克隆项目

```bash
git clone https://github.com/xiaoqvan/shiny-journey-bot.git
```

### 2. 解压文件并进入项目目录

进入项目根目录后创建 `.env` 文件，添加以下内容：

```dotenv
API_ID=
API_HASH=
BOT_TOKEN=
```

填入对应的参数即可。

---

### 3. 配置与启动

#### **Windows 平台**

1. 进入 `scripts` 目录，双击执行 `win_setup.bat` 脚本完成环境配置。
2. 返回项目根目录，安装依赖：

   ```bash
   npm i
   ```

3. 测试运行：

   ```bash
   npm run test
   ```

---

#### **Linux 平台**

1. 克隆项目并安装依赖。
2. 进入 `scripts` 目录，找到对应脚本，执行后返回根目录。
3. 启动服务：

   ```bash
   npm run start
   ```

---

#### **Termux 平台**

脚本正在开发中，敬请期待！

---

# 联系与支持

如果在使用过程中有任何问题或改进建议，欢迎提交 Issue 或加入我们的开发社区进行讨论。  
一起让 **Shiny Journey Bot** 更加完善！
