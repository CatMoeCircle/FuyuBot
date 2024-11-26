import "./core/bot.js";
import pino from "pino";
import pretty from "pino-pretty";
import { start } from "./core/bot.js";

// 创建一个 pino logger 实例
const logger = pino(
  {
    level: "debug", // 设置日志级别，'debug' 输出所有日志级别的信息
  },
  pretty({
    colorize: true, // 彩色输出
    translateTime: "yyyy-mm-dd HH:MM:ss", // 时间格式化
  })
);

start(logger.info("Start Bot...")).catch((err) => {
  logger.error(`Failed to start the bot: ${err}`);
});

global.logger = logger;
