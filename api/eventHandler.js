import { messageEmitter } from "./eventEmitter.js";
import { registerBasicCommands } from "../commands/basic.js";

// 注册基础命令
registerBasicCommands();

// 主消息处理器
export async function handleNewMessage(event) {
  const message = event.message;
  const text = message.text || "";

  // 添加消息类型识别
  message.type = message.groupId ? "group" : "private";

  try {
    if (text.startsWith("/")) {
      const command = text.slice(1).toLowerCase();
      messageEmitter.broadcast("command", { event, command });
      return;
    }
    messageEmitter.broadcast("message", { event });
  } catch (error) {
    console.error("处理消息时出错：", error);
  }
}
