import { Api } from "telegram";

export async function sendMessage(client, chatId, sendMessageParams) {
  await client.sendMessage(chatId, sendMessageParams);
}
export async function replyToMessage(client, chatId, magid, sendMessageParams) {
  await client.sendMessage(chatId, {
    replyTo: magid,
    ...sendMessageParams,
  });
}
export async function editMessage(client, chatId, magid, editMessageParams) {
  await client.editMessage(chatId, {
    message: magid,
    ...editMessageParams,
  });
}
export async function replyToCmd(client, chatId, message, editMessageParams) {
  try {
    if (message.peerId?.className === "PeerUser") {
      await client.sendMessage(chatId, {
        editMessageParams,
      });
    } else {
      client.sendMessage(chatId, {
        replyTo: message.id,
        ...editMessageParams,
      });
    }
  } catch (e) {
    console.error("回复消息错误:", e);
  }
}
export async function sendMedia(client, chatId, files, sendFileParams) {
  if (!files || files.length === 0) return;

  if (files.length === 1) {
    // 只有一个文件，直接发送
    await client.sendFile(chatId, {
      file: files[0],
      ...sendFileParams,
    });
  } else {
    const allLinks = files.every(
      (file) => typeof file === "string" && file.startsWith("http")
    );

    const chunkSize = 10;
    for (let i = 0; i < files.length; i += chunkSize) {
      const batch = files.slice(i, i + chunkSize);

      if (allLinks) {
        // 处理多个链接，转换成 `InputMediaPhotoExternal`
        const media = batch.map(
          (url) => new Api.InputMediaPhotoExternal({ url })
        );
        await client.sendFile(chatId, {
          file: media,
          ...sendFileParams,
        });
      } else {
        // 处理多个本地路径，直接批量发送
        await client.sendFile(chatId, {
          file: batch,
          ...sendFileParams,
        });
      }
    }
  }
}
export async function deleteMessages(client, chatId, msgids, revoke) {
  await client.deleteMessages(chatId, msgids, { revoke: revoke });
}
