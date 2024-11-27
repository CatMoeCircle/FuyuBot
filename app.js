import "./core/bot.js";
import pino from "pino";
import pretty from "pino-pretty";
import { start } from "./core/bot.js";

const logger = pino(
  {
    level: "debug", // 日志级别
  },
  pretty({
    colorize: true,
    translateTime: "yyyy-mm-dd HH:MM:ss",
  })
);

start(logger.info("Start Bot...")).catch((err) => {
  logger.error(`Failed to start the bot: ${err}`);
});

global.logger = logger;
