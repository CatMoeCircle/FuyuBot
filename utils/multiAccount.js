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
import { loadPlugins, loadedPlugins } from "../plugins/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, "..", "config", "botConfig.yaml");
let config = yaml.load(fs.readFileSync(configPath, "utf8"));
config.accounts = config.accounts || [];

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
            console.log(i18next.t("multiAccount.operation_cancelled"));
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
            validate: (value) =>
              value.length > 0 || i18next.t("multiAccount.token_required"),
          },
          {
            onCancel: () => {
              console.log(i18next.t("multiAccount.operation_cancelled"));
              process.exit(0);
            },
          }
        );

        if (!botResponse.token) {
          console.log(i18next.t("multiAccount.token_empty"));
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
          message: i18next.t("multiAccount.set_owner"),
          initial: true,
        },
        {
          onCancel: () => {
            console.log(i18next.t("multiAccount.operation_cancelled"));
            process.exit(0);
          },
        }
      );
      if (ownerResponse.setOwner) {
        const ownerUsernameResponse = await prompts(
          {
            type: "text",
            name: "ownerUsername",
            message: i18next.t("multiAccount.enter_owner"),
            validate: (value) =>
              value.length > 0 || i18next.t("multiAccount.owner_empty"),
          },
          {
            onCancel: () => {
              console.log(i18next.t("multiAccount.operation_cancelled"));
              process.exit(0);
            },
          }
        );

        if (ownerUsernameResponse.ownerUsername) {
          config.owner = ownerUsernameResponse.ownerUsername;
          fs.writeFileSync(configPath, yaml.dump(config));
          console.log(
            i18next.t("multiAccount.owner_set", {
              username: ownerUsernameResponse.ownerUsername,
            })
          );
        }
      } else {
        console.log(i18next.t("multiAccount.owner_not_set"));
      }
      const client = await login({ phone: phone, token: token, Bot: Bot });
      clients.push(client);
      const info = await client.getMe();
      console.log(info);
      const account = {
        accounts: String(accounts.length + 1),
        firstName: info.firstName,
        lastName: info.lastName,
        id: Number(info.id),
        username: info.username,
        types: Bot ? "bot" : "user",
        stringSession: client.session.save(),
        // 初始化插件配置
        plugins: Array.from(loadedPlugins.entries()).reduce(
          (acc, [name, plugin]) => {
            // 根据插件类型和账户类型决定默认值
            const supported =
              plugin.type === "all" ||
              (Bot && plugin.type === "bot") ||
              (!Bot && plugin.type === "user");
            acc[name] = supported ? true : false;
            return acc;
          },
          {}
        ),
      };

      accounts.push(account);
      config.accounts = accounts;

      fs.writeFileSync(configPath, yaml.dump(config));
    } else {
      for (const account of accounts) {
        // 检查并添加缺失的插件配置
        if (!account.plugins) {
          account.plugins = {};
        }

        // 更新现有账户的插件配置
        const isBot = account.types === "bot";
        loadedPlugins.forEach((plugin, name) => {
          if (account.plugins[name] === undefined) {
            const supported =
              plugin.type === "all" ||
              (isBot && plugin.type === "bot") ||
              (!isBot && plugin.type === "user");
            account.plugins[name] = supported ? true : false;
          }
        });

        const { types, stringSession, plugins } = account;
        const Bot = types === "bot";
        const client = await login({ stringSession: stringSession, Bot: Bot });
        clients.push(client);

        // 根据账户类型与 plugins 中的设置，启用或禁用对应插件
        client.addEventHandler(handleNewMessage, new NewMessage({}));
      }

      fs.writeFileSync(configPath, yaml.dump(config));
      console.log(i18next.t("multiAccount.all_accounts_logged_in"));
    }
  } catch (error) {
    console.error(i18next.t("authentication_error"), error.message);
  }
}

export { loginMultipleAccounts, clients, config };
