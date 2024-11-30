import log from "#logger";

export function logMessage(client, event) {
  log.info(`收到消息: ${event.message.message}`);
  global.handlePluginMessage(client, event);
}
