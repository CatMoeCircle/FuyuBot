export function help(client, event) {
  const message = event.message;
  if (message.message === "/help") {
    client.sendMessage(message.chatId, { message: "编写中..." });
  }
}
