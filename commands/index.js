import { TelegramClient } from "telegram"; // 确保导入 TelegramClient
import { handleStartCommand } from "./start.js";
import { dc } from "./dc.js";
import { handleMusicCommand } from "./music.js";

const commandHandlers = {
  "/start": handleStartCommand,
  "/dc": dc,
  "/music": handleMusicCommand,
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
    }
  }, new TelegramClient.events.NewMessage({}));
}
