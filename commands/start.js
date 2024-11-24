export function handleStartCommand(client, event) {
  const message = event.message;
  if (message.message === "/start") {
    client.sendMessage(message.chatId, { message: "你好" });
  }
}
