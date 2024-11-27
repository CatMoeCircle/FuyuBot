import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { registerCommands } from "../commands/index.js";
import { logMessage } from "./utils/message.js";
import { loadConfig } from "./config.js";
import "./plugins.js";
import dotenv from "dotenv";
import fs from "fs";
import yaml from "js-yaml";
dotenv.config();

const apiId = parseInt(process.env.API_ID, 10);
const apiHash = process.env.API_HASH;
const botToken = process.env.BOT_TOKEN;

export default async function start() {
  let cookie;
  try {
    cookie = yaml.load(fs.readFileSync("config/cookie.yaml", "utf-8"));
  } catch (err) {
    cookie = {
      stringSession: process.env.STRING_SESSION || "",
    };
  }

  const botconfig = yaml.load(fs.readFileSync("config/bot.yaml", "utf-8"));
  const stringSession = new StringSession(cookie.stringSession || "");
  const configLoaded = await loadConfig();
  if (configLoaded) {
    const client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
    });

    // 开始客户端，传入 botToken
    await client.start({
      botAuthToken: botToken,
      onError: (err) => logger.error(`${err}`),
    });

    logger.info("You should now be connected.");
    if (botconfig.creator_id) {
      client.sendMessage(botconfig.creator_id, { message: "bot已经上线" });
    } else {
      logger.warn("未设置管理员ID前往 config/bot.yaml 设置");
    }

    // 登录成功后保存新的 session 到 cookie.yaml
    cookie.stringSession = client.session.save();
    fs.writeFileSync("config/cookie.yaml", yaml.dump(cookie));

    registerCommands(client);

    client.addEventHandler((event) => {
      logMessage(client, event);
    }, new TelegramClient.events.NewMessage({}));

    // 插件
    Object.values(global.plugins).forEach((plugin) => {
      if (typeof plugin === "function") {
        plugin(client);
      }
    });
  } else {
    logger.error("配置加载失败");
  }
}
