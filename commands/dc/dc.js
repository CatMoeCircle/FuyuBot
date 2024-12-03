import { genImage, deleteImage } from "#puppeteer";
import log from "#logger";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlContent = fs.readFileSync(path.join(__dirname, "dc.html"), "utf8");
const viewport = { width: 400, height: 285, deviceScaleFactor: 2 };

export async function dc(client, event) {
  const message = event.message;
  log.info(message);
  const tip = await client.sendMessage(message.chatId, {
    message: "正在获取...",
    replyTo: message.id,
  });

  const UserInfo = await client.getEntity(message.senderId);
  // 下载转换头像为base64
  let avatarBase64;
  if (UserInfo.photo) {
    try {
      const photo = await client.downloadProfilePhoto(UserInfo);
      avatarBase64 = `data:image/jpeg;base64,${photo.toString("base64")}`;
    } catch (downloadError) {
      log.error(`无法下载头像: ${downloadError}`);
      avatarBase64 = null;
    }
  } else {
    log.info("用户没有头像");
    avatarBase64 = `https://dummyimage.com/80x80/cccccc/ffffff&text=${UserInfo.firstName.charAt(
      0
    )}`;
  }
  const dcId = UserInfo.photo.dcId || null;
  const ID = UserInfo.id.value.toString();
  const userName = UserInfo.username || "null";
  const userFullName =
    UserInfo.title ||
    (UserInfo.firstName && UserInfo.firstName !== "null"
      ? UserInfo.firstName
      : "") +
      (UserInfo.lastName && UserInfo.lastName !== "null"
        ? UserInfo.lastName
        : "") ||
    "未知姓名";
  const html = htmlContent
    .replace("${avatarBase64}", avatarBase64)
    .replace("${dcId}", dcId)
    .replace("${ID}", ID)
    .replace("${userName}", userName)
    .replace("${userFullName}", userFullName)
    .replace("${version}", process.env.npm_package_version);

  const image = await genImage(html, viewport);
  try {
    if (message.peerId?.className === "PeerUser") {
      await client.sendMessage(message.chatId, {
        file: image,
      });
    } else {
      await client.sendMessage(message.chatId, {
        file: image,
        replyTo: message.id,
      });
    }
  } catch (error) {
    log.error(error);
  }
  try {
    await deleteImage(image);
    await client.deleteMessages(message.chatId, [tip.id], { revoke: true });
  } catch (error) {
    log.error(error);
  }
}
