import { TelegramClient } from "telegram";
import { Start } from "./start.js";
import { dc } from "./dc/dc.js";
import { help } from "./help/help.js";

const commandHandlers = {
  start: Start,
  dc: dc,
  help: help,
};

export const registerCommands = async (client) => {
  client.addEventHandler(async (event) => {
    const message = event.message;
    const text = message.message;
    if (!text) return;

    // 使用正则表达式提取命令
    const match = text.match(/^([\/!])(\w+)(@(\w+))?/);
    if (!match) return;

    const [, , cmd, , username] = match;
    const me = await client.getMe();
    const botUsername = me.username;

    // 检查命令是否指向该机器人
    if (username && username.toLowerCase() !== botUsername.toLowerCase()) {
      return;
    }

    // 查找对应的命令处理器
    const handler = commandHandlers[cmd.toLowerCase()];
    if (handler) {
      await handler(client, event);
    }
  }, new TelegramClient.events.NewMessage({}));
};
