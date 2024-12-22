import { TelegramClient } from "telegram";
import { Start } from "./start.js";
import { dc } from "./dc/dc.js";
import { plugin } from "./plugins/add.js";

const commandHandlers = {
  start: Start,
  dc: dc,
  plugins: plugin,
};

export const registerCommands = async (client) => {
  client.addEventHandler(async (event) => {
    const message = event.message;
    const text = message.message;
    if (!text) return;

    const match = text.match(/^([/!])(\w+)(@(\w+))?/);
    if (!match) return;

    const [, , cmd, , username] = match;
    const me = await client.getMe();
    const botUsername = me.username;

    if (username && username.toLowerCase() !== botUsername.toLowerCase()) {
      return;
    }

    const handler = commandHandlers[cmd.toLowerCase()];
    if (handler) {
      await handler(client, event);
    }
  }, new TelegramClient.events.NewMessage({}));
};
