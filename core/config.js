import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";
import log from "#logger";
import { initDatabase } from "../data/db.js";
import initI18n from "#i18next";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configDir = path.resolve(__dirname, "../config");
const botconfig = path.resolve(configDir, "bot.yaml");
const cookieconfig = path.resolve(configDir, "cookie.yaml");
const proxyconfig = path.resolve(configDir, "proxy.yaml");

async function loadConfig() {
  const i18next = await initI18n();

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
  }
  // 初始化数据库
  if (!initDatabase()) {
    log.error(i18next.t("log.db_init_failed"));
    return false;
  }

  const configs = [
    {
      path: botconfig,
      default: { creator_id: "" },
    },
    {
      path: cookieconfig,
      default: { stringSession: "" },
    },
    {
      path: proxyconfig,
      default: {
        proxy: {
          protocol: "http",
          host: "localhost",
          port: 1080,
          username: "",
          password: "",
          timeout: 10,
          enable: false,
        },
      },
    },
  ];

  for (const { path, default: defaultConfig } of configs) {
    try {
      if (!fs.existsSync(path)) {
        const yamlStr = yaml.dump(defaultConfig);
        fs.writeFileSync(path, yamlStr, "utf8");
      }
    } catch (err) {
      log.error(i18next.t("log.config_load_failed", { error: err }));
      return false;
    }
  }
  return true;
}

export default loadConfig;
