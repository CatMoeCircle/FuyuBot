// 插件示例
export default (client, event) => {
  const message = event.message;
  if (message.message.startsWith("/chat")) {
    client.sendMessage(message.peerId, {
      message: "Hello! This is a response from the /chat command.",
    });
  }
};
