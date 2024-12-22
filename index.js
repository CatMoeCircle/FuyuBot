import { checkAndLoadEnv } from "./utils/login.js";
import {
  loginMultipleAccounts,
  clients,
  config,
} from "./utils/multiAccount.js";
import i18next from "./i18n/i18n.js";
import prompts from "prompts";

async function startBot() {
  await chooseLanguage();
  await checkAndLoadEnv();
  await loginMultipleAccounts();
  try {
    const owner = config.owner;
    for (const client of clients) {
      try {
        await client.sendMessage(owner, { message: "你好，主人！" });
        console.log("已发送消息给主人。");
      } catch (error) {
        console.error(i18next.t("errors.connection_failed"), error.message);
      }
    }
  } catch (error) {
    console.error("发送给主人的消息时出错：", error.message);
  }
}

async function chooseLanguage() {
  const response = await prompts({
    type: "select",
    name: "language",
    message: "请选择语言 / Please select language / Выберите язык:",
    choices: [
      { title: "简体中文", value: "zh" },
      { title: "English", value: "en" },
      { title: "Русский", value: "ru" },
    ],
    initial: 0,
  });

  const selectedLang = response.language;
  await i18next.changeLanguage(selectedLang);
  return selectedLang;
}

startBot();
