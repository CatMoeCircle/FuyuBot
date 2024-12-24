import {
  registerBasicCommands,
  officialCommandHandlers,
} from "../commands/basic.js";
import { loadedPlugins } from "../plugins/index.js";

registerBasicCommands();

async function safeEventHandler(handler, event) {
  try {
    await handler(event);
  } catch (error) {
    console.error(`事件处理错误:`, error);
  }
}

export async function handleNewMessage(event) {
  try {
    if (event.message?.message?.startsWith("/")) {
      const command = event.message.message.split(" ")[0].substring(1);
      for (const handler of officialCommandHandlers) {
        await safeEventHandler(handler, { event, command });
      }
    }

    for (const [, plugin] of loadedPlugins.entries()) {
      if (!plugin.enabled) continue;

      // 包装消息处理
      const handlers = plugin.instance.messageHandlers || [];
      for (const handler of handlers) {
        await safeEventHandler(handler, event);
      }

      // 包装命令处理
      if (event.message?.message?.startsWith("/")) {
        const command = event.message.message.split(" ")[0].substring(1);
        const commandHandlers = plugin.instance.commandHandlers || [];
        for (const handler of commandHandlers) {
          await safeEventHandler(handler, { event, command });
        }
      }
    }
  } catch (error) {
    console.error("消息处理主循环错误:", error);
  }
}
