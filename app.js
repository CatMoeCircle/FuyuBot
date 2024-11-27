import pino from "pino";
import pretty from "pino-pretty";
import { loadConfig } from "./core/config.js";
import start from "./core/bot.js";

const logger = pino(
  {
    level: "debug", // 日志级别
  },
  pretty({
    colorize: true,
    translateTime: "yyyy-mm-dd HH:MM:ss",
  })
);

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
