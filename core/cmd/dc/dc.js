import log from "#logger";
import fs from "fs";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import path from "path";
import { fileURLToPath } from "url";
import initI18n from "#i18next";
import { ensureFontLoaded } from "../../../core/config.js";

const i18n = await initI18n();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontPath = await ensureFontLoaded();

export async function dc(client, event) {
  const message = event.message;
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
      log.error(
        i18n.t("log.dc_avatar_download_failed", { error: downloadError })
      );
      avatarBase64 = null;
    }
  } else {
    log.info(i18n.t("log.dc_no_avatar"));
    // 自己生成橙色背景 + 首字母头像
    let firstChar = "";

    // 获取有效字符，忽略特殊符号和空格
    if (UserInfo.firstName) {
      for (const char of UserInfo.firstName) {
        // 只保留字母、数字和中日韩文字
        if (/^[\p{L}\p{N}\p{Ideographic}]+$/u.test(char)) {
          firstChar = char;
          break;
        }
      }
    }

    // 如果没有找到有效字符，使用默认"?"
    if (!firstChar) {
      firstChar = "?";
    }

    const avatarCanvas = createCanvas(500, 500);
    const avatarCtx = avatarCanvas.getContext("2d");

    // 绘制橙色背景
    avatarCtx.fillStyle = "#ff9900";
    avatarCtx.fillRect(0, 0, 500, 500);

    // 绘制白色文字，调整大小
    avatarCtx.fillStyle = "#ffffff";
    avatarCtx.font = `bold 180px ${fontPath}`;
    avatarCtx.textAlign = "center";
    avatarCtx.textBaseline = "middle";
    avatarCtx.fillText(firstChar, 250, 250);

    // 转换为base64
    avatarBase64 = avatarCanvas.toDataURL("image/png");
  }

  // 安全获取dcId，检查UserInfo.photo是否存在
  const dcId = UserInfo.photo?.dcId || null;
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

  const canvas = createCanvas(1600, 1140);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 1600, 1140);

  const imgDir = path.join(__dirname, "../../../resources/images");
  const imgFiles = fs
    .readdirSync(imgDir)
    .filter((file) => file !== "3.png" && /\.(png|jpe?g)$/i.test(file));
  const randomImg = imgFiles[Math.floor(Math.random() * imgFiles.length)];
  loadImage(path.join(imgDir, randomImg))
    .then((background) => {
      const bgStartY = 40;
      const bgHeight = (1140 * 4) / 10;
      const bgRatio = background.width / background.height;
      const canvasRatio = 1600 / bgHeight;
      let drawWidth, drawHeight, drawX, drawY;

      if (bgRatio > canvasRatio) {
        drawHeight = bgHeight;
        drawWidth = drawHeight * bgRatio;
        drawX = (1600 - drawWidth) / 2;
        drawY = bgStartY;
      } else {
        drawWidth = 1600;
        drawHeight = drawWidth / bgRatio;
        drawY = bgStartY + (bgHeight - drawHeight) / 2;
        drawX = 0;
      }
      ctx.drawImage(background, drawX, drawY, drawWidth, drawHeight);

      const gradientStartY = bgHeight + bgStartY;
      const cornerRadius = 40;

      ctx.beginPath();
      ctx.moveTo(0, gradientStartY + cornerRadius);
      ctx.lineTo(0, 1140);
      ctx.lineTo(1600, 1140);
      ctx.lineTo(1600, gradientStartY + cornerRadius);
      ctx.arcTo(
        1600,
        gradientStartY,
        1600 - cornerRadius,
        gradientStartY,
        cornerRadius
      );
      ctx.lineTo(cornerRadius, gradientStartY);
      ctx.arcTo(
        0,
        gradientStartY,
        0,
        gradientStartY + cornerRadius,
        cornerRadius
      );
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, gradientStartY, 1600, 1140);
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(1, "#fff3ff");
      ctx.fillStyle = gradient;
      ctx.fill();

      return loadImage(avatarBase64);
    })
    .then((avatar) => {
      // 绘制头像（圆形裁剪）
      const avatarSize = 310;
      const avatarX = 90;
      const avatarY = 340;

      const avatarRatio = avatar.width / avatar.height;
      let drawAvatarWidth, drawAvatarHeight, drawAvatarX, drawAvatarY;

      if (avatarRatio > 1) {
        drawAvatarHeight = avatarSize;
        drawAvatarWidth = drawAvatarHeight * avatarRatio;
        drawAvatarX = avatarX + (avatarSize - drawAvatarWidth) / 2;
        drawAvatarY = avatarY;
      } else {
        drawAvatarWidth = avatarSize;
        drawAvatarHeight = drawAvatarWidth / avatarRatio;
        drawAvatarX = avatarX;
        drawAvatarY = avatarY + (avatarSize - drawAvatarHeight) / 2;
      }

      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
      ctx.shadowBlur = 20;

      ctx.beginPath();
      ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2 + 8,
        0,
        Math.PI * 2,
        true
      );
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2,
        true
      );
      ctx.clip();
      ctx.drawImage(
        avatar,
        drawAvatarX,
        drawAvatarY,
        drawAvatarWidth,
        drawAvatarHeight
      );
      ctx.restore();

      ctx.fillStyle = "black";
      ctx.font = `bold 90px ${fontPath}`;
      ctx.fillText(`${userFullName}`, 100, 740);
      ctx.fillStyle = "#666666";
      ctx.font = `65px ${fontPath}`;
      ctx.fillText(`@${userName}`, 100, 810);
      ctx.fillText(`ID:${ID} - DC:${dcId}`, 100, 960);
      ctx.font = `bold 35px ${fontPath}`;
      ctx.fillText("如果DC为空请检查头像是否设置或公开显示", 95, 1068);

      return loadImage(path.join(__dirname, "../../../resources/images/3.png"));
    })
    .then((watermark) => {
      ctx.save();
      ctx.globalAlpha = 0.5; // 设置透明度为0.2
      const wmSize = 637;
      ctx.drawImage(watermark, 960, 500, wmSize, wmSize);
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 4;
      ctx.strokeText(
        `FuyuBot - v${process.env.npm_package_version}`,
        1210,
        1068
      );
      ctx.fillText(`FuyuBot - v${process.env.npm_package_version}`, 1210, 1068);
      ctx.restore();

      // 保存图片到运行目录的 caching 文件夹，并添加随机哈希后缀
      const randomHash = Math.random().toString(36).substring(2, 8);
      const cachingDir = path.join(process.cwd(), "caching");

      // 确保 caching 目录存在
      if (!fs.existsSync(cachingDir)) {
        fs.mkdirSync(cachingDir, { recursive: true });
      }

      const outputPath = path.join(cachingDir, `dc_${randomHash}.jpg`);
      const out = fs.createWriteStream(outputPath);
      const buffer = canvas.toBuffer("image/jpeg", { quality: 0.95 });
      out.write(buffer);
      out.end();
      out.on("finish", async () => {
        try {
          if (message.peerId?.className === "PeerUser") {
            await client.sendMessage(message.chatId, {
              file: outputPath,
            });
          } else {
            await client.sendMessage(message.chatId, {
              file: outputPath,
              replyTo: message.id,
            });
          }
        } catch (error) {
          log.error(error);
        }
        try {
          await fs.promises.unlink(outputPath);
          await client.deleteMessages(message.chatId, [tip.id], {
            revoke: true,
          });
        } catch (error) {
          log.error(error);
        }
      });
    })
    .catch((err) => {
      console.error(i18n.t("log.dc_load_failed"), err);
    });
}
