export function logMessage(client, event) {
  logger.info(`收到消息: ${event.message.message}`);
  global.handlePluginMessage(client, event);
}
