import DouYin from "../core/api/video/douyin.js";

export async function Video(client, event) {
  const message = event.message.text;

  if (message.startsWith("/video")) {
    // 使用正则表达式提取链接
    const urlMatch = message.match(/https?:\/\/[^\s]+/);
    const url = urlMatch ? urlMatch[0] : null;

    if (!url) {
      await client.sendMessage(event.chatId, {
        message:
          "请提供支持的视频平台分享链接\n目前支持的平台:\n- 抖音/抖音图集",
      });
      return;
    }

    try {
      const result = await DouYin(url);

      if (!result || !result.video_url) {
        await client.sendMessage(event.chatId, {
          message: "无法获取视频信息，请检查链接是否正确。",
        });
        return;
      }

      const title = result.title.replace(/(?<!\s)#/g, " #");
      const caption = `${title} \n\nBy <a href="https://www.douyin.com/user/${result.author.uid}">${result.author.name}</a>`;

      await client.sendMessage(event.chatId, {
        file: result.video_url,
        message: caption,
        parseMode: "html",
      });
    } catch (error) {
      await client.sendMessage(event.chatId, {
        message: `消息发送失败: ${error.message}`,
      });
    }
  }
}
