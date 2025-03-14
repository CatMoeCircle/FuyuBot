import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";
import log from "#logger";
import { initDatabase } from "../data/db.js";
import initI18n from "#i18next";
import os from "os";
import { execSync } from "child_process";
import enquirer from "enquirer";
import { GlobalFonts } from "@napi-rs/canvas";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configDir = path.resolve(__dirname, "../config");
const botconfig = path.resolve(configDir, "bot.yaml");
const cookieconfig = path.resolve(configDir, "cookie.yaml");
const proxyconfig = path.resolve(configDir, "proxy.yaml");

let registeredFontPath = null;

function checkUnzip() {
  try {
    execSync("unzip -v", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
export async function ensureFontLoaded() {
  if (registeredFontPath) {
    return registeredFontPath;
  }

  const i18n = await initI18n();
  const fontPath = await initFont(i18n);
  registeredFontPath = fontPath;
  return fontPath;
}

async function initFont(i18n) {
  const platform = os.platform();
  let fontPath;

  if (platform === "win32") {
    fontPath = "Microsoft YaHei";
  } else if (platform === "darwin") {
    fontPath = "PingFang SC";
  } else {
    const fontDir = path.join(__dirname, "../resources/fonts");
    const fontZip = path.join(fontDir, "MapleMonoNL-NF-CN-unhinted.zip");
    const fontFile = path.join(fontDir, "MapleMonoNL-NF-CN-Medium.ttf");

    if (!fs.existsSync(fontFile)) {
      if (!fs.existsSync(fontDir)) {
        fs.mkdirSync(fontDir, { recursive: true });
      }

      const { prompt } = enquirer;
      const response = await prompt({
        type: "confirm",
        name: "downloadFont",
        message: i18n.t("log.dc_font_missing"),
        initial: true,
      }).catch(() => ({ downloadFont: false }));

      if (response.downloadFont) {
        if (!checkUnzip()) {
          log.info(i18n.t("log.dc_unzip_missing"));
          if (platform === "android") {
            log.info("pkg install unzip");
          } else {
            log.info(i18n.t("log.dc_unzip_install"));
          }
          log.info(i18n.t("log.dc_install_complete"));
          process.exit(1);
        }

        log.info(i18n.t("log.dc_downloading_font"));
        execSync(
          `curl -L -o ${fontZip} https://github.com/subframe7536/maple-font/releases/download/v7.0-beta36/MapleMonoNL-NF-CN-unhinted.zip`
        );
        log.info(i18n.t("log.dc_font_extracting"));
        execSync(`unzip ${fontZip} -d ${fontDir}`);
        fs.unlinkSync(fontZip);
        fs.readdirSync(fontDir).forEach((file) => {
          if (file !== "MapleMonoNL-NF-CN-Medium.ttf") {
            fs.unlinkSync(path.join(fontDir, file));
          }
        });
        log.info(i18n.t("log.dc_font_installed"));
        GlobalFonts.registerFromPath(fontFile, "MapleFont");
        fontPath = "MapleFont";
      } else {
        log.info(i18n.t("log.dc_font_skipped"));
        fontPath = "sans-serif";
      }
    } else {
      GlobalFonts.registerFromPath(fontFile, "MapleFont");
      fontPath = "MapleFont";
    }
  }

  const config = yaml.load(fs.readFileSync(botconfig, "utf8")) || {};
  config.fontPath = fontPath;
  fs.writeFileSync(botconfig, yaml.dump(config), "utf8");
  return fontPath;
}

async function loadConfig() {
  const i18n = await initI18n();

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
  }
  if (!initDatabase()) {
    log.error(i18n.t("log.db_init_failed"));
    return false;
  }

  await ensureFontLoaded();

  const configs = [
    {
      path: botconfig,
      default: { creator_id: "", fontPath: null },
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
      log.error(i18n.t("log.config_load_failed", { error: err }));
      return false;
    }
  }
  return true;
}

export default loadConfig;
