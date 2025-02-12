import { EventEmitter } from "events";
import { TelegramClient } from "telegram";

export const eventupdate = new EventEmitter();

export const event = async (client) => {
  client.addEventHandler(async (event) => {
    eventupdate.emit("AllNewMessage", event.message);
    const message = event.message;
    const text = message.message;
    if (!text) return;

    const me = await client.getMe();
    const botUsername = me.username;

    // 检查是否为命令消息
    if (text.startsWith("/")) {
      // 提取命令部分和目标用户名部分（如果有）
      const commandParts = text.match(/^\/\w+(?:@(\w+))?/);
      if (commandParts) {
        const targetBot = commandParts[1]; // 获取@后面的用户名，如果没有则为undefined
        // 如果没有指定目标机器人或者指定了当前机器人
        if (!targetBot || targetBot === botUsername) {
          eventupdate.emit("CommandMessage", event.message);
        }
      }
    }
  }, new TelegramClient.events.NewMessage({}));
};
