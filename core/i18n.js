import i18next from "i18next";
import Backend from "i18next-fs-backend";
import { fileURLToPath } from "url";
import path from "path";
import yaml from "js-yaml";
import fs from "fs";
import enquirer from "enquirer";
import log from "#logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initI18n = async () => {
  const configPath = path.resolve(__dirname, "../config/bot.yaml");
  const configDir = path.dirname(configPath);
  let config = {};

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  if (!fs.existsSync(configPath)) {
    const { prompt } = enquirer;
    log.info(
      "If your characters appear garbled, please check if your terminal is set to UTF-8."
    );
    const response = await prompt({
      type: "select",
      name: "language",
      message:
        "请选择您的语言 / Please select your language / Пожалуйста, выберите ваш язык:",
      choices: ["简体中文", "English", "Русский"],
      initial: 0,
    }).catch(() => ({ language: "简体中文" }));

    config.language =
      response.language === "简体中文"
        ? "zh-cn"
        : response.language === "English"
        ? "en-us"
        : "ru-ru";
    fs.writeFileSync(configPath, yaml.dump(config), "utf8");
  } else {
    config = yaml.load(fs.readFileSync(configPath, "utf8")) || {};
  }

  const userLanguage = config.language || "en-us";

  await i18next.use(Backend).init({
    // debug: true,
    backend: {
      loadPath: path.join(__dirname, "./lang/{{lng}}.json"),
    },
    fallbackLng: "zh-cn",
    preload: ["en-us", "zh-cn", "ru-ru"],
    supportedLngs: ["en-us", "zh-cn", "ru-ru"],
    lowerCaseLng: true,
    lng: userLanguage,
  });

  return i18next;
};

export default initI18n;
