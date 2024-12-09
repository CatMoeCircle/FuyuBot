import loadConfig from "./core/config.js";
import start from "./core/bot.js";
import "./WebUI/web.js";
import log from "#logger";

(async () => {
  try {
    log.info("[INIT] 生成配置文件...");

    const load = await loadConfig();
    if (load === true) {
      const retryInterval = 5000;
      const maxRetries = 5;
      let retryCount = 0;

      const initializeBot = async () => {
        try {
          log.info("[INIT] 配置文件生成完毕，开始启动 bot...");
          await start();
          log.info("[BOT] 启动成功！");
        } catch (err) {
          retryCount++;
          if (retryCount > maxRetries) {
            log.error(
              `[BOT] 启动失败: ${err}，重试次数已达最大限制（${maxRetries} 次），停止重试。`
            );
            return;
          }

          log.error(
            `[BOT] 启动失败: ${err}，${
              retryInterval / 1000
            } 秒后尝试重启（第 ${retryCount} 次重试）...`
          );

          setTimeout(initializeBot, retryInterval);
        }
      };

      await initializeBot();
    }
  } catch (err) {
    log.error(`[BOT] 启动失败: ${err}`);
  }
})();
