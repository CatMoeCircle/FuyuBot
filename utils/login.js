// login.js
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import i18next from "./../i18n/i18n.js";
import fs from "fs";
import dotenv from "dotenv";
import prompts from "prompts";

dotenv.config();

// 检查并加载API_ID和API_HASH
async function checkAndLoadEnv() {
  if (!process.env.API_ID || !process.env.API_HASH) {
    console.log(i18next.t("tg_api.enter_api_id_or_hash_not_found"));

    const response = await prompts([
      {
        type: "number",
        name: "apiId",
        message: i18next.t("tg_api.enter_api_id"),
        validate: (value) =>
          Number.isInteger(value) ? true : i18next.t("tg_api.invalid_api_id"),
      },
      {
        type: "text",
        name: "apiHash",
        message: i18next.t("tg_api.enter_api_hash"),
        validate: (value) =>
          value.trim() !== "" ? true : i18next.t("tg_api.invalid_api_hash"),
      },
    ]);

    const { apiId, apiHash } = response;

    if (!apiId || !apiHash) {
      console.error(i18next.t("errors.invalid_input"));
      process.exit(1);
    }

    fs.writeFileSync(".env", `API_ID=${apiId}\nAPI_HASH=${apiHash}\n`);
    dotenv.config();
  }

  if (!process.env.API_ID || !process.env.API_HASH) {
    console.error(i18next.t("errors.invalid_input"));
    process.exit(1);
  }
}

/**
 * @param {Object} options
 * @param {string} [options.stringSession]
 * @param {string} [options.token]
 * @param {string} [options.phone]
 * @param {boolean} options.Bot
 * @returns {Promise<Object>}
 */
async function login({ stringSession = "", token, phone = "", Bot }) {
  const apiId = parseInt(process.env.API_ID, 10);
  const apiHash = process.env.API_HASH;
  const session = new StringSession(stringSession || "");
  let telegramTestDC = {
    // dcId: 3,
    // ip: "149.154.175.117",
    dcId: 2,
    ip: "149.154.167.40",
    // dcId: 1,
    // ip: "149.154.175.10",
    port: 443,
  };
  session.setDC(telegramTestDC.dcId, telegramTestDC.ip, telegramTestDC.port);
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
    testServers: true,
  });

  if (Bot) {
    await client.start({
      botAuthToken: token,
      onError: (err) => console.log(err),
    });
  } else {
    await client.start({
      phoneNumber: phone,
      phoneCode: async () => {
        const response = await prompts({
          type: "text",
          name: "phoneCode",
          message: i18next.t("enter_verification_code"),
          validate: (value) =>
            value.trim() !== "" ? true : i18next.t("invalid_verification_code"),
        });
        return response.phoneCode;
      },
      password: async () => {
        const response = await prompts({
          type: "password",
          name: "password",
          message: i18next.t("enter_2fa_password"),
          validate: (value) =>
            value.trim() !== "" ? true : i18next.t("invalid_password"),
        });
        return response.password;
      },
      onError: (err) => console.log(err),
    });
  }

  console.log("Logged in successfully!");
  return client;
}

export { checkAndLoadEnv, login };
