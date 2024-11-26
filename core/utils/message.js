export function logMessage(event) {
  logger.info(`收到消息: ${event.message.message}`);
}
