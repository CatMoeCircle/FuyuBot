// i18n.js
import i18next from "i18next";
import i18nextFsBackend from "i18next-fs-backend";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await i18next.use(i18nextFsBackend).init({
  lng: "en",
  fallbackLng: "en",
  supportedLngs: ["en", "zh", "ru"],
  backend: {
    loadPath: path.join(__dirname, "lang", "{{lng}}.json").replace(/\\/g, "/"),
  },
  initImmediate: false,
});

export default i18next;
