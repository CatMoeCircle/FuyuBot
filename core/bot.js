import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { registerCommands } from "../commands/index.js";
import { loadPlugins } from "./plugins.js";
import log from "#logger";
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
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    botAuthToken: botToken,
    onError: (err) => log.error(`${err}`),
  });

  log.info("[BOT]bot已连接");
  if (botconfig.creator_id) {
    // client.sendMessage(botconfig.creator_id, { message: "bot已经上线" });
  } else {
    log.warn("[BOT]未设置管理员ID前往 config/bot.yaml 设置");
  }

  // 登录成功后保存新的 session 到 cookie.yaml
  cookie.stringSession = client.session.save();
  fs.writeFileSync("config/cookie.yaml", yaml.dump(cookie));

  registerCommands(client);
  loadPlugins(client);
}
