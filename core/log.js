import pino from "pino";
import pretty from "pino-pretty";
export const logger = pino(
  {
    level: "debug", // 日志级别
  },
  pretty({
    colorize: true,
    translateTime: "yyyy-mm-dd HH:MM:ss",
  })
);
