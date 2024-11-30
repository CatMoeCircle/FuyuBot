import music from "./163Music/index.js";
import douyin from "./douyin/index.js";
import log from "#logger";

export default async (client) => {
  log.info("[XQ-plugins]插件已加载");

  const handler = async (event) => {
    try {
      if (!event || !event.message) {
        return;
      }
      await music(client, event);
      await douyin(client, event);
    } catch (error) {
      log.error(`插件处理消息时出错: ${error}`);
    }
  };

  client.addEventHandler(handler);

  // 返回处理器以便卸载时使用
  return {
    handler, // 返回handler以便卸载时移除
    unregister: () => {
      client.removeEventHandler(handler);
      log.info("[XQ-plugins]插件已卸载");
    },
  };
};
