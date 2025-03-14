import { EventEmitter } from "events";
import { EditedMessage } from "telegram/events/EditedMessage.js";
import { DeletedMessage } from "telegram/events/DeletedMessage.js";
import { CallbackQuery } from "telegram/events/CallbackQuery.js";
import { Album } from "telegram/events/Album.js";
import { NewMessage } from "telegram/events/index.js";

/**
 * Message event handler
 * @event AllNewMessage - Emitted for all new messages
 * @event CommandMessage - Emitted for command messages starting with "/"
 * @event EditedMessage - Emitted for edited messages
 * @event DeletedMessage - Emitted for deleted messages
 * @event Album - Emitted for album messages
 * @event CallbackQuery - Emitted for callback queries
 */
export const eventupdate = new EventEmitter();

export const event = async (client) => {
  client.addEventHandler(async (event) => {
    eventupdate.emit("AllNewMessage", event);

    const { message: text } = event.message;
    if (!text) return;

    // 处理命令消息
    if (text.startsWith("/")) {
      const me = await client.getMe();
      const commandMatch = text.match(/^\/\w+(?:@(\w+))?/);

      if (commandMatch) {
        const targetBot = commandMatch[1];
        if (!targetBot || targetBot === me.username) {
          eventupdate.emit("CommandMessage", event);
        }
      }
    }
  }, new NewMessage({}));
  client.addEventHandler(async (event) => {
    eventupdate.emit("EditedMessage", event);
  }, new EditedMessage({}));
  client.addEventHandler(async (event) => {
    eventupdate.emit("DeletedMessage", event);
  }, new DeletedMessage({}));
  client.addEventHandler(async (event) => {
    eventupdate.emit("Album", event);
  }, new Album({}));
  client.addEventHandler(async (event) => {
    eventupdate.emit("CallbackQuery", event);
  }, new CallbackQuery({}));
};
