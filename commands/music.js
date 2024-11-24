import get163music from "../core/api/music.js";
import fetch from "node-fetch";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import { join } from "path";

const execPromise = promisify(exec);
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
    console.log(songId, level);

    if (!songId) {
      client.sendMessage(message.chatId, {
        message: "请提供歌曲ID。",
      });

      return;
    }

    get163music(songId, level)
      .then(async (songInfo) => {
        // 确保下载目录存在
        ensureDirectoryExists(downloadDir);

        // 下载歌曲文件
        const response = await fetch(songInfo.url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = `${songInfo.name} - ${songInfo.artists}.flac`;
        const filePath = join(downloadDir, fileName);
        fs.writeFileSync(filePath, buffer);

        // 下载封面图片
        const coverResponse = await fetch(songInfo.picUrl);
        const coverArrayBuffer = await coverResponse.arrayBuffer();
        const coverBuffer = Buffer.from(coverArrayBuffer);
        const coverPath = join(downloadDir, `${songInfo.name}-cover.jpg`);
        fs.writeFileSync(coverPath, coverBuffer);

        // 发送音乐文件并附加封面
        await client.sendMessage(message.chatId, {
          file: filePath,
          thumb: coverPath, // 设置封面
        });
        // 删除临时文件
        fs.unlinkSync(filePath);
        fs.unlinkSync(coverPath);
      })
      .catch((error) => {
        console.error("无法获取歌曲信息:", error);
        client.sendMessage(message.chatId, {
          message: "无法获取歌曲信息，请稍后再试。",
        });
      });
  }
}
