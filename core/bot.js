import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { registerCommands } from "./cmd/index.js";
import { loadPlugins } from "./plugins.js";
import { event } from "./api/event.js";

import initI18n from "#i18next";
import log from "#logger";
import dotenv from "dotenv";
import fs from "fs";
import yaml from "js-yaml";

dotenv.config();

const apiId = parseInt(process.env.API_ID, 10);
const apiHash = process.env.API_HASH;
const botToken = process.env.BOT_TOKEN;

export default async function start() {
  const i18next = await initI18n();
  let cookie;
  try {
    cookie = yaml.load(fs.readFileSync("config/cookie.yaml", "utf-8"));
  } catch {
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
  log.info(i18next.t("log.bot_started"));
  log.info(i18next.t("log.bot_connected"));
  if (botconfig.creator_id) {
    // client.sendMessage(botconfig.creator_id, { message: "bot已经上线" });
  } else {
    log.warn(i18next.t("log.admin_id_not_set"));
  }

  // 登录成功后保存新的 session 到 cookie.yaml
  cookie.stringSession = client.session.save();
  fs.writeFileSync("config/cookie.yaml", yaml.dump(cookie));

  registerCommands(client);
  event(client);
  loadPlugins(client);
}
