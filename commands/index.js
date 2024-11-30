import { TelegramClient } from "telegram";
import { Start } from "./start.js";
import { dc } from "./dc.js";
import { help } from "./help/help.js";

const commandHandlers = {
  "/start": Start,
  "/dc": dc,
  "/help": help,
};

export const registerCommands = async (client) => {
  client.addEventHandler(async (event) => {
    const message = event.message;
    const command = message.message.split(" ")[0];
    const me = await client.getMe();
    const botUsername = me.username;

    const [cmd, username] = command.split("@");
    if (username && username.toLowerCase() !== botUsername.toLowerCase()) {
      return;
    }

    const handler = Object.keys(commandHandlers).find((cmdKey) =>
      cmd.startsWith(cmdKey)
    );
    if (handler) {
      await commandHandlers[handler](client, event);
    }
  }, new TelegramClient.events.NewMessage({}));
};
