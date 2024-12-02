export async function Start(client, event) {
  const message = event.message;
  const text =
    "欢迎使用 Shiny☆journey BOT\n<a href='https://github.com/xiaoqvan/shiny-journey-bot'>Github</a>";
  try {
    if (message.peerId?.className === "PeerUser") {
      const sentMessage = await client.sendMessage(message.chatId, {
        message: text,
        parseMode: "html",
      });
      return sentMessage;
    } else {
      const sentMessage = await client.sendMessage(message.chatId, {
        message: text,
        parseMode: "html",
        replyTo: message.id,
      });
      return sentMessage;
    }
  } catch (error) {
    throw error;
  }
}
