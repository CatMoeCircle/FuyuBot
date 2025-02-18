export async function Start(client, event) {
  const message = event.message;
  const text =
    "欢迎使用 本bot \n/help - 查看帮助 \n本bot基于FuyuBot\n<a href='https://github.com/CatMoeCircle/FuyuBot'>Github</a>框架";
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
