import {
  pluginslist,
  addPlugin,
  unplugin,
  toggleSwitch,
  reload,
} from "../../plugins.js";
import initI18n from "#i18next";
import fs from "fs";
import yaml from "js-yaml";

export async function plugin(client, event) {
  const message = event.message;
  const id = yaml.load(fs.readFileSync("config/bot.yaml", "utf-8"));

  if (Number(message.peerId.userId.value) === Number(id.creator_id)) {
    const commandParts = message.message.trim().split(/\s+/);
    const mainCommand = commandParts[0];
    const pluginName = commandParts[1];
    const enableOrDisable = commandParts[2];

    if (mainCommand === "/plugins") {
      const i18next = await initI18n();

      switch (pluginName) {
        case "list":
          try {
            const pluginFiles = await pluginslist();
            const responseMessage = pluginFiles.join("\n");
            await client.sendMessage(message.chatId, {
              replyTo: message.id,
              message: `插件列表:\n${responseMessage}`,
            });
          } catch (error) {
            await client.sendMessage(message.chatId, {
              replyTo: message.id,
              message: `获取插件列表时出错。+ ${error.message}`,
            });
          }
          break;
        case "add":
          if (!enableOrDisable) {
            await client.sendMessage(message.chatId, {
              replyTo: message.id,
              message: "请提供一个 GitHub 链接。",
            });
            return;
          }
          try {
            const result = await addPlugin(enableOrDisable);
            await client.sendMessage(message.chatId, {
              replyTo: message.id,
              message: result,
            });
          } catch (error) {
            await client.sendMessage(message.chatId, {
              replyTo: message.id,
              message: `插件下载失败: ${error.message}`,
            });
          }
          break;
        case "delete":
          if (!enableOrDisable) {
            await client.sendMessage(message.chatId, {
              replyTo: message.id,
              message: "请提供要删除的插件名称。",
            });
            return;
          }
          try {
            const result = await unplugin(enableOrDisable);
            await client.sendMessage(message.chatId, {
              replyTo: message.id,
              message: result,
            });
          } catch (error) {
            await client.sendMessage(message.chatId, {
              replyTo: message.id,
              message: `插件卸载失败: ${error.message}`,
            });
          }
          break;
        case "reload":
          try {
            const result = await reload(client, i18next);
            await client.sendMessage(message.chatId, {
              replyTo: message.id,
              message: result,
            });
          } catch (error) {
            await client.sendMessage(message.chatId, {
              replyTo: message.id,
              message: `插件重新加载失败: ${error.message}`,
            });
          }
          break;
        default:
          if (enableOrDisable === "true" || enableOrDisable === "false") {
            try {
              const result = await toggleSwitch(
                pluginName,
                enableOrDisable === "true",
                client,
                i18next
              );
              await client.sendMessage(message.chatId, {
                replyTo: message.id,
                message: result,
              });
            } catch (error) {
              await client.sendMessage(message.chatId, {
                replyTo: message.id,
                message: `插件状态更新失败: ${error.message}`,
              });
            }
          } else {
            await client.sendMessage(message.chatId, {
              replyTo: message.id,
              message: `插件命令使用方法:
            /plugins list - 显示已安装的插件列表
            /plugins add <GitHub链接> - 添加新插件
            /plugins delete <插件名称> - 删除指定插件
            /plugins reload - 重新加载所有插件
            /plugins <插件名称> <true/false> - 启用/禁用指定插件`,
            });
          }
      }
    }
  } else {
    return;
  }
}
