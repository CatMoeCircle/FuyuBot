import loadConfig from "./core/config.js";
import start from "./core/bot.js";
import "./WebUI/web.js";
import log from "#logger";

(async () => {
  try {
    log.info("[INIT]生成配置文件...");

    const load = await loadConfig();
    if (load === true) {
      log.info("[INIT]配置文件生成完毕，开始启动bot...");
      await start();
      log.info("[BOT]启动成功！");
    }
  } catch (err) {
    log.error(`[BOT]启动失败: ${err}`);
  }
})();
