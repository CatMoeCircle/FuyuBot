import get163music from "../core/api/music.js";
import fetch from "node-fetch";
import fs from "fs";
import { join, extname } from "path";
import { Api } from "telegram";

const downloadDir = "./caching/downloads";

const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export function Music(client, event) {
  const message = event.message;
  const command = message.message.split(" ");

  if (command[0].startsWith("/music")) {
    const songId = command[1];
    const level = command[2] || "standard";

    if (!songId) {
      client.sendMessage(message.chatId, {
        message: "请提供歌曲ID。",
      });

      return;
    }

    client
      .sendMessage(message.chatId, {
        message: "正在获取，请稍等...",
      })
      .then(async (sentMessage) => {
        if (!sentMessage || !sentMessage.id) {
          logger.error("发送消息失败，无法获取有效的消息ID");
          return;
        }

        try {
          const songInfo = await get163music(songId, level);
          const musicTitle = songInfo.name;
          const artistName = songInfo.artists;

          ensureDirectoryExists(downloadDir);

          try {
            const response = await fetch(songInfo.url);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const fileExtension = extname(songInfo.url).split("?")[0];
            const sanitizedFileName = `${songInfo.name.replace(
              /[\/\\:*?"<>|]/g,
              ""
            )} - ${songInfo.artists.replace(
              /[\/\\:*?"<>|]/g,
              ""
            )}${fileExtension}`;
            const filePath = join(downloadDir, sanitizedFileName);

            fs.writeFileSync(filePath, buffer);

            try {
              const coverResponse = await fetch(songInfo.picUrl);
              const coverArrayBuffer = await coverResponse.arrayBuffer();
              const coverBuffer = Buffer.from(coverArrayBuffer);
              const coverPath = join(
                downloadDir,
                `${songInfo.name.replace(/[\/\\:*?"<>|]/g, "")}-cover.jpg`
              );
              fs.writeFileSync(coverPath, coverBuffer);

              await client.invoke(
                new Api.messages.EditMessage({
                  peer: message.chatId,
                  id: sentMessage.id,
                  message: "正在上传，请稍等...",
                })
              );

              try {
                await client.sendMessage(message.chatId, {
                  file: filePath,
                  thumb: coverPath,
                  attributes: [
                    new Api.DocumentAttributeAudio({
                      title: musicTitle,
                      performer: artistName,
                      voice: false,
                    }),
                  ],
                });

                await client.invoke(
                  new Api.messages.DeleteMessages({
                    id: [sentMessage.id],
                    revoke: true,
                  })
                );

                fs.unlinkSync(filePath);
                fs.unlinkSync(coverPath);
              } catch (uploadError) {
                logger.error(`无法上传歌曲文件: ${uploadError}`);
                await client.invoke(
                  new Api.messages.EditMessage({
                    peer: message.chatId,
                    id: sentMessage.id,
                    message: "无法上传歌曲文件，请稍后再试。",
                  })
                );
              }
            } catch (coverDownloadError) {
              logger.error(`无法下载封面图片: ${coverDownloadError}`);
              await client.invoke(
                new Api.messages.EditMessage({
                  peer: message.chatId,
                  id: sentMessage.id,
                  message: "无法下载封面图片，请稍后再试。",
                })
              );
            }
          } catch (songDownloadError) {
            logger.error(`无法下载歌曲文件: ${songDownloadError}`);
            await client.invoke(
              new Api.messages.EditMessage({
                peer: message.chatId,
                id: sentMessage.id,
                message: "无法下载歌曲文件，请稍后再试。",
              })
            );
          }
        } catch (getSongInfoError) {
          logger.error(`无法获取歌曲信息: ${getSongInfoError}`);
          await client.invoke(
            new Api.messages.EditMessage({
              peer: message.chatId,
              id: sentMessage.id,
              message: "无法获取歌曲信息，请稍后再试。",
            })
          );
        }
      });
  }
}
