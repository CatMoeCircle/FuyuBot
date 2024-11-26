import { log } from "util";
import DouYin from "../core/api/video/douyin.js";

export async function Video(client, event) {
  const message = event.message.text;

  if (message.startsWith("/video")) {
    const url = message.replace("/video", "").trim(); // 提取链接
    if (!url) {
      await client.sendMessage(event.chatId, {
        message:
          "请提供支持的视频平台分享链接\n目前支持的平台:\n- 抖音/抖音图集",
      });
      return;
    }
    const result = await DouYin(url);
    try {
      const message = `${result.title} \n\nBy <a href="https://www.douyin.com/user/${result.author.uid}">${result.author.name}</a> `;
      await client.sendMessage(event.chatId, {
        file: result.video_url,
        message,
        parseMode: "html",
      });
    } catch (error) {
      await client.sendMessage(event.chatId, {
        message: `消息发送失败 ${error}`,
      });
    }
  }
}
