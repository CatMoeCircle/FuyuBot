import { get163music, searchMusic } from "./api/music.js";
import fetch from "node-fetch";
import fs from "fs";
import { join, extname } from "path";
import { Api } from "telegram";
import { genImage, deleteImage } from "#puppeteer";
import log from "#logger";

const downloadDir = "../../caching/downloads";

const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export default async function music(client, event) {
  if (!event || !event.message) {
    log.error("Event or event.message is undefined");
    return;
  }
  const message = event.message;
  const command = message.message.split(" ");

  if (command[0].startsWith("/music")) {
    const query = command[1];
    const level = command[2] || "standard";

    if (!query) {
      client.sendMessage(message.chatId, {
        message: "请提供歌曲ID或名称。",
      });
      return;
    }

    let songInfo;
    try {
      if (/^\d+$/.test(query)) {
        // 如果是纯数字，则认为是歌曲ID
        songInfo = await get163music(query, level);
      } else {
        // 否则认为是歌曲名称，进行搜索
        const search = await searchMusic(query);
        if (search.length === 0) {
          client.sendMessage(message.chatId, {
            message: "未找到相关歌曲。",
          });
          return;
        }
        let htmlContent = fs.readFileSync(
          "plugins/XQ-plugins/163Music/html/163search.html",
          "utf8"
        );

        htmlContent = htmlContent.replace("${keyword}", query);
        let musicList = "";
        let count = 0;
        search.forEach((search) => {
          if (count < 6) {
            musicList += `
      <div class="music-item">
        <div class="music-item-cover">
          <img src="${search.cover}" alt="cover">
        </div>
        <div class="music-item-info">
          <div class="music-item-name">
            <p>${search.name}</p>
          </div>
          <div class="music-item-artist">
            <p>${search.artists}</p>
          </div>
          <div class="music-item-id">
            <p>ID: <span class="music-item-id-text">${search.id}</span></p>
          </div>
          <div class="music-item-action">
            <p>${search.alia}</p>
          </div>
        </div>
      </div>`;
            count++;
          }
        });

        htmlContent = htmlContent.replace("${musicList}", musicList);
        htmlContent = htmlContent.replace(
          "${version}",
          process.env.npm_package_version
        );
        const viewport = { width: 400, height: 180, deviceScaleFactor: 3 };
        const screenshotPath = await genImage(htmlContent, viewport);
        await client.sendMessage(message.chatId, {
          file: screenshotPath,
        });
        await deleteImage(screenshotPath);
        return;
      }
    } catch (getSongInfoError) {
      log.error(`无法获取歌曲信息: ${getSongInfoError}`);
      client.sendMessage(message.chatId, {
        message: "无法获取歌曲信息，请稍后再试。",
      });
      return;
    }

    const musicTitle = songInfo.name;
    const artistName = songInfo.artists;

    client
      .sendMessage(message.chatId, {
        message: "正在获取，请稍等...",
      })
      .then(async (sentMessage) => {
        if (!sentMessage || !sentMessage.id) {
          log.error("发送消息失败，无法获取有效的消息ID");
          return;
        }

        try {
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
                log.error(`无法上传歌曲文件: ${uploadError}`);
                await client.invoke(
                  new Api.messages.EditMessage({
                    peer: message.chatId,
                    id: sentMessage.id,
                    message: "无法上传歌曲文件，请稍后再试。",
                  })
                );
              }
            } catch (coverDownloadError) {
              log.error(`无法下载封面图片: ${coverDownloadError}`);
              await client.invoke(
                new Api.messages.EditMessage({
                  peer: message.chatId,
                  id: sentMessage.id,
                  message: "无法下载封面图片，请稍后再试。",
                })
              );
            }
          } catch (songDownloadError) {
            log.error(`无法下载歌曲文件: ${songDownloadError}`);
            await client.invoke(
              new Api.messages.EditMessage({
                peer: message.chatId,
                id: sentMessage.id,
                message: "无法下载歌曲文件，请检查你的id是否正确。",
              })
            );
          }
        } catch (getSongInfoError) {
          log.error(`无法获取歌曲信息: ${getSongInfoError}`);
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
