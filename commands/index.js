import { TelegramClient } from "telegram";
import { Start } from "./start.js";
import { dc } from "./dc.js";
import { Video } from "./video.js";
import { help } from "./help.js";

const commandHandlers = {
  "/start": Start,
  "/dc": dc,
  "/video": Video,
  "/help": help,
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
