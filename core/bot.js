import "./config.js";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { registerCommands } from "../commands/index.js";
import { logMessage } from "./utils/message.js";
import dotenv from "dotenv";
import fs from "fs";
import yaml from "js-yaml";
dotenv.config();

const apiId = parseInt(process.env.API_ID, 10);
const apiHash = process.env.API_HASH;
const botToken = process.env.BOT_TOKEN;

// 检查 cookie.yaml 是否存在，如果不存在则使用环境变量中的数据
let cookie;
try {
  cookie = yaml.load(fs.readFileSync("config/cookie.yaml", "utf-8"));
} catch (err) {
  // 如果 cookie.yaml 文件不存在，则从环境变量读取
  cookie = {
    stringSession: process.env.STRING_SESSION || "", // 如果环境变量中没有 stringSession，可以设置为空字符串
  };
}

const botconfig = yaml.load(fs.readFileSync("config/bot.yaml", "utf-8"));
const stringSession = new StringSession(cookie.stringSession || "");

export async function start() {
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  // 开始客户端，传入 botToken
  await client.start({
    botAuthToken: botToken,
    onError: (err) => logger.error(`${err}`),
  });

  logger.info("You should now be connected.");
  client.sendMessage(botconfig.creator_id, { message: "bot已经上线" });

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
}
