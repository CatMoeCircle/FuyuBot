import get163music from "../core/api/music.js";
import fetch from "node-fetch";
import fs from "fs";
import { join, extname } from "path";
import { Api } from "telegram";
import { log } from "console";

const downloadDir = "./caching/downloads";

// 确保目录存在
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export function handleMusicCommand(client, event) {
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

    // 发送 "正在获取" 消息
    client
      .sendMessage(message.chatId, {
        message: "正在获取，请稍等...",
      })
      .then(async (sentMessage) => {
        if (!sentMessage || !sentMessage.id) {
          console.error("发送消息失败，无法获取有效的消息ID");
          return;
        }

        try {
          const songInfo = await get163music(songId, level);
          const musicTitle = songInfo.name;
          const artistName = songInfo.artists;

          // 确保下载目录存在
          ensureDirectoryExists(downloadDir);

          // 下载歌曲文件
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

            // 下载封面图片
            try {
              const coverResponse = await fetch(songInfo.picUrl);
              const coverArrayBuffer = await coverResponse.arrayBuffer();
              const coverBuffer = Buffer.from(coverArrayBuffer);
              const coverPath = join(
                downloadDir,
                `${songInfo.name.replace(/[\/\\:*?"<>|]/g, "")}-cover.jpg`
              );
              fs.writeFileSync(coverPath, coverBuffer);

              // 修改消息为 "正在上传"
              await client.invoke(
                new Api.messages.EditMessage({
                  peer: message.chatId, // 确保这是正确的聊天ID
                  id: sentMessage.id, // 确保这是有效的消息ID
                  message: "正在上传，请稍等...",
                })
              );

              // 发送音乐文件并附带封面图片
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

                // 删除提示消息
                await client.invoke(
                  new Api.messages.DeleteMessages({
                    id: [sentMessage.id],
                    revoke: true,
                  })
                );

                // 删除临时文件
                fs.unlinkSync(filePath);
                fs.unlinkSync(coverPath);
              } catch (uploadError) {
                console.error("无法上传歌曲文件:", uploadError);
                await client.invoke(
                  new Api.messages.EditMessage({
                    peer: message.chatId,
                    id: sentMessage.id,
                    message: "无法上传歌曲文件，请稍后再试。",
                  })
                );
              }
            } catch (coverDownloadError) {
              console.error("无法下载封面图片:", coverDownloadError);
              await client.invoke(
                new Api.messages.EditMessage({
                  peer: message.chatId,
                  id: sentMessage.id,
                  message: "无法下载封面图片，请稍后再试。",
                })
              );
            }
          } catch (songDownloadError) {
            console.error("无法下载歌曲文件:", songDownloadError);
            await client.invoke(
              new Api.messages.EditMessage({
                peer: message.chatId,
                id: sentMessage.id,
                message: "无法下载歌曲文件，请稍后再试。",
              })
            );
          }
        } catch (getSongInfoError) {
          console.error("无法获取歌曲信息:", getSongInfoError);
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
