// 插件信息
export const pluginInfo = {
  name: "Example Plugin",
  version: "1.0.0",
  description: "An example plugin",
  commands: ["/ping"],
  type: "all",
};

let pluginConfig = {};

// 初始化函数，接收配置
export function initialize(config) {
  pluginConfig = config || {};
}

// 定义命令处理器
export const commandHandlers = [
  async ({ event, command }) => {
    if (!pluginConfig.enabled) return;

    if (command === "ping") {
      const message = pluginConfig.responses?.ping || "pong";
      if (event.message.type === "private") {
        await event.message.send({ message });
      } else {
        await event.message.reply({ message });
      }
    }
  },
];
