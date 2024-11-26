import { TelegramClient } from "telegram"; // 确保导入 TelegramClient
import { Start } from "./start.js";
import { dc } from "./dc.js";
import { Music } from "./music.js";

const commandHandlers = {
  "/start": Start,
  "/dc": dc,
  "/music": Music,
};

export function registerCommands(client) {
  client.addEventHandler((event) => {
    const message = event.message;
    const command = message.message.split(" ")[0];
    const handler = Object.keys(commandHandlers).find((cmd) =>
      command.startsWith(cmd)
    );
    if (handler) {
      commandHandlers[handler](client, event);
    } else {
      // 将未处理的消息传递给插件
      global.handlePluginMessage(client, event);
    }
  }, new TelegramClient.events.NewMessage({}));
}
