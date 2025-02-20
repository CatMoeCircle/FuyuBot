import i18next from "i18next";
import Backend from "i18next-fs-backend";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initI18n = async () => {
  await i18next.use(Backend).init({
    // debug: true,
    backend: {
      loadPath: path.join(__dirname, "./lang/{{lng}}.json"),
    },
    fallbackLng: "zh-cn",
    preload: ["en-us", "zh-cn"],
    supportedLngs: ["en-us", "zh-cn"],
    lowerCaseLng: true,
  });

  return i18next;
};

export default initI18n;
