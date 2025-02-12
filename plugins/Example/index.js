import { eventupdate } from "../../core/api/event";

export default async (client) => {
  eventupdate.on("CommandMessage", async (message) => {
    const text = message.message;

    if (text.startsWith("/help")) {
      client.sendMessage(message.chatId, {
        replyTo: message.id,
        message: "Hello, World!",
      });
    }
  });
};
