import loadConfig from "./core/config.js";
import start from "./core/bot.js";
import "./WebUI/web.js";
import { logger } from "./core/log.js";

async function init() {
  try {
    console.log("生成配置文件...");

    const load = await loadConfig();
    console.log(load);
    if (load === true) {
      logger.info("配置文件生成完毕，开始启动bot...");
      await start();
      logger.info("Start Bot...");
    }
  } catch (err) {
    logger.error(`Failed to start the bot: ${err}`);
  }
}

init();

global.logger = logger;
