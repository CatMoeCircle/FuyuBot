import { NewMessage } from "../../api/index.js";

// 插件信息
export const pluginInfo = {
  name: "Example Plugin",
  version: "1.0.0",
  description: "An example plugin",
  commands: ["/ping"],
};

let pluginConfig = {};

// 初始化函数，接收配置
export function initialize(config) {
  pluginConfig = config;
}

// 注册插件命令
NewMessage.on("command", async ({ event, command }) => {
  if (!pluginConfig.enabled) {
    return;
  }
  if (command === "ping") {
    if (event.message.type === "private") {
      await event.message.send({
        message: pluginConfig.responses.ping,
      });
    } else {
      await event.message.reply({
        message: pluginConfig.responses.ping,
      });
    }
  }
});

// 处理普通消息(可选)
NewMessage.on("message", async ({ event }) => {
  if (!pluginConfig.enabled) {
    return;
  }

  const text = event.message.text || "";
  if (text.toLowerCase() === "hello") {
    if (event.message.type === "private") {
      await event.message.send({
        message: pluginConfig.responses.hello,
      });
    } else {
      await event.message.reply({
        message: pluginConfig.responses.hello,
      });
    }
  }
});
