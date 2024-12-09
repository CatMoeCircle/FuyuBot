export async function Start(client, event) {
  const message = event.message;
  const text =
    "欢迎使用 Cat☆acg BOT\n<a href='https://github.com/moecatacg/cat-acg'>Github</a>";
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
}
