import "./config.js"; // 确保在其他导入之前加载配置
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

const cookie = yaml.load(fs.readFileSync("config/cookie.yaml", "utf-8"));
const botconfig = yaml.load(fs.readFileSync("config/bot.yaml", "utf-8"));
const stringSession = new StringSession(cookie.stringSession || "");

export async function start() {
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.start({
    botAuthToken: botToken,
    onError: (err) => logger.error(`${err}`),
  });
  logger.info("You should now be connected.");
  client.sendMessage(botconfig.creator_id, { message: "bot已经上线" });

  cookie.stringSession = client.session.save();
  fs.writeFileSync("config/cookie.yaml", yaml.dump(cookie));

  registerCommands(client);

  // 添加事件处理器来打印所有接收到的消息
  client.addEventHandler((event) => {
    logMessage(client, event);
  }, new TelegramClient.events.NewMessage({}));

  // 使用插件
  Object.values(global.plugins).forEach((plugin) => {
    if (typeof plugin === "function") {
      plugin(client);
    }
  });
}
