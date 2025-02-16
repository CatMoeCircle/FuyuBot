import { eventupdate } from "../../core/api/event.js";

export default async (client) => {
  eventupdate.on("CommandMessage", async (event) => {
    const message = event.message;
    const text = message.message;

    if (text.startsWith("/help")) {
      client.sendMessage(message.chatId, {
        replyTo: message.id,
        message: "Hello, World!",
      });
    }
  });
};
