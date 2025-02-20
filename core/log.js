import pino from "pino";
import pretty from "pino-pretty";

const log = pino(
  {
    level: "info",
  },
  pretty({
    colorize: true,
    translateTime: "yyyy-mm-dd HH:MM:ss",
  })
);

export default log;
