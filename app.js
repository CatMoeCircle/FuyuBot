import loadConfig from "./core/config.js";
import start from "./core/bot.js";
import log from "#logger";
import initI18n from "#i18next";

(async () => {
  const i18next = await initI18n();
  try {
    log.info(i18next.t("log.config_generating"));

    const load = await loadConfig();
    if (load === true) {
      const retryInterval = 5000;
      const maxRetries = 5;
      let retryCount = 0;

      const initializeBot = async () => {
        try {
          log.info(i18next.t("log.bot_starting"));
          await start();
        } catch (err) {
          retryCount++;
          if (retryCount > maxRetries) {
            log.error(
              i18next.t("log.bot_start_failed_max_retries", {
                error: err,
                maxRetries: maxRetries,
              })
            );
            return;
          }

          log.error(
            i18next.t("log.bot_start_failed_retry", {
              error: err,
              interval: retryInterval / 1000,
              retryCount: retryCount,
            })
          );

          setTimeout(initializeBot, retryInterval);
        }
      };

      await initializeBot();
    }
  } catch (err) {
    log.error(i18next.t("log.bot_start_failed", { error: err }));
  }
})();
