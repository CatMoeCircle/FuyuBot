// multiAccount.js
import { login } from "./login.js";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { NewMessage } from "telegram/events/index.js";
import { fileURLToPath } from "url";
import i18next from "../i18n/i18n.js";
import prompts from "prompts";
import { handleNewMessage } from "../api/eventHandler.js";
import { loadPlugins } from "../plugins/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, "..", "config", "botConfig.yaml");
let config = yaml.load(fs.readFileSync(configPath, "utf8"));

const clients = [];

async function loginMultipleAccounts() {
  try {
    await loadPlugins();

    const accounts = config.accounts || [];

    if (accounts.length === 0) {
      const response = await prompts(
        [
          {
            type: "select",
            name: "choice",
            message: i18next.t("login_choice"),
            choices: [
              { title: "Bot", value: "bot" },
              { title: "User", value: "user" },
            ],
            initial: 0,
          },
        ],
        {
          onCancel: () => {
            console.log("操作已取消");
            process.exit(0);
          },
        }
      );

      let phone;
      let Bot;
      let token;

      if (response.choice === "bot") {
        const botResponse = await prompts(
          {
            type: "text",
            name: "token",
            message: i18next.t("enter_bot_token"),
            validate: (value) => value.length > 0 || "Token不能为空",
          },
          {
            onCancel: () => {
              console.log("操作已取消");
              process.exit(0);
            },
          }
        );

        if (!botResponse.token) {
          console.log("未输入Token，程序退出");
          process.exit(0);
        }

        token = botResponse.token;
        Bot = true;
      } else {
        try {
          const phoneResponse = await prompts(
            {
              type: "text",
              name: "phone",
              message: i18next.t("enter_phone_number"),
              validate: (value) =>
                value.length > 0 || i18next.t("invalid_phone_number_format"),
            },
            {
              onCancel: () => {
                console.log("操作已取消");
                process.exit(0);
              },
            }
          );

          if (!phoneResponse.phone) {
            throw new Error(i18next.t("invalid_phone_number_format"));
          }

          phone = phoneResponse.phone;
          Bot = false;
        } catch (error) {
          console.error(i18next.t("authentication_error"), error.message);
          process.exit(1);
        }
      }
      const ownerResponse = await prompts(
        {
          type: "confirm",
          name: "setOwner",
          message: "是否设置主人？",
          initial: true,
        },
        {
          onCancel: () => {
            console.log("操作已取消");
            process.exit(0);
          },
        }
      );
      if (ownerResponse.setOwner) {
        const ownerUsernameResponse = await prompts(
          {
            type: "text",
            name: "ownerUsername",
            message: "请输入主人的用户名：",
            validate: (value) => value.length > 0 || "用户名不能为空",
          },
          {
            onCancel: () => {
              console.log("操作已取消");
              process.exit(0);
            },
          }
        );

        if (ownerUsernameResponse.ownerUsername) {
          config.owner = ownerUsernameResponse.ownerUsername;
          fs.writeFileSync(configPath, yaml.dump(config));
          console.log("主人已设置为：", ownerUsernameResponse.ownerUsername);
        }
      } else {
        console.log("未设置主人");
      }
      const client = await login({ phone: phone, token: token, Bot: Bot });
      clients.push(client);
      const info = await client.getMe();
      console.log(info);
      const account = {
        accounts: String(accounts.length + 1),
        firstName: info.firstName,
        lastName: info.lastName,
        id: info.id,
        username: info.username,
        types: Bot ? "bot" : "user",
        stringSession: client.session.save(),
      };

      accounts.push(account);
      config.accounts = accounts;

      fs.writeFileSync(configPath, yaml.dump(config));
    } else {
      for (const account of accounts) {
        const { types, stringSession } = account;
        const Bot = types === "bot";
        const client = await login({ stringSession: stringSession, Bot: Bot });
        clients.push(client);

        client.addEventHandler(handleNewMessage, new NewMessage({}));
      }
      console.log(i18next.t("all_accounts_logged_in"));
    }
  } catch (error) {
    console.error(i18next.t("authentication_error"), error.message);
  }
}

export { loginMultipleAccounts, clients, config };
