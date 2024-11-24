import { pimg, deleteImage } from "../core/api/puppeteer.js";
import fs from "fs";

export function dc(client, event) {
  const message = event.message;
  if (message.message === "/dc") {
    const userId = message.senderId;

    // 获取用户信息
    client
      .getEntity(userId)
      .then(async (user) => {
        let avatarBase64;
        if (user.photo) {
          try {
            const photo = await client.downloadProfilePhoto(user);
            avatarBase64 = `data:image/jpeg;base64,${photo.toString("base64")}`;
          } catch (downloadError) {
            console.error("无法下载头像:", downloadError);
            avatarBase64 = null;
          }
        } else {
          console.log("用户没有头像");
          avatarBase64 = null;
        }

        const dcId = user.photo.dcId;
        const ID = user.id.value.toString();
        const userName = user.username || "未知用户";
        const userFullName = user.firstName || "未知姓名";
        const viewport = { width: 350, height: 240, deviceScaleFactor: 2 };

        // 生成HTML内容
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>userdcinfo</title>
    <style>
        body {
            padding: 0;
            margin: 0;
        }

        .main {
            width: 350px;
            height: 400px;

        }

        .background {
            width: 100%;
            height: 100%;
            position: absolute;
            z-index: -1;
        }

        .background img {
            width: 350px;
            height: 240px;
            object-fit: cover;
        }

        .title {
            color: white;
            position: absolute;
        }

        .title h1 {
            margin: 25px 0 0 25px;
            padding: 0;
            font-size: 30px;
            text-shadow: 0 0 10px #000;
            font-family: 'LXGW WenKai Screen';
        }

        .container-info {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            background: #ffffffbf;
            border: 2px solid rgb(255, 255, 255);
            border-radius: 10px;
            margin-top: 120px;
            box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.632);
            font-family: 'LXGW WenKai Screen';
        }

        .container {
            width: 100%;
            height: 110px;
            padding: 10px;
            box-sizing: border-box;
        }

        .avatar img {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
        }

        .avatar {
            display: flex;
            align-items: center;
            margin-left: 5px;
        }

        .name {
            font-size: 20px;
            margin: 0;
        }

        .user,
        .id {
            margin: 0;
        }

        .info {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            margin-left: 5px;
        }
    </style>
</head>

<body>
    <div class="main">
        <div class="background">
            <img src="https://998860.xyz/tp/ys" alt="">
        </div>
        <div class="title">
            <h1>个人信息</h1>
        </div>
        <div class="container">
            <div class="container-info">
                <div class="avatar">
                    <img src="${avatarBase64}" alt="avatar">
                </div>
                <div class="info">
                    <h1 class="name">${userName}</h1>
                    <p class="user">用户名：<span>@${userFullName}</span></p>
                    <p class="id">Id:${ID} - DC:<span>${dcId}</span></p>
                </div>
            </div>
        </div>
    </div>
</body>

</html>
        `;

        try {
          // 生成截图
          const screenshotPath = await pimg(htmlContent, viewport);

          // 发送信息给用户
          await client.sendMessage(message.chatId, {
            // 添加发送图片的功能
            file: screenshotPath, // 假设client支持发送文件
          });

          // 删除图片
          await deleteImage(screenshotPath);
        } catch (error) {
          console.error("无法生成截图:", error);

          // 发送错误信息给用户
          client.sendMessage(message.chatId, {
            message: "无法生成截图，请稍后再试。",
          });
        }
      })
      .catch((err) => {
        console.error("无法获取用户信息:", err);

        // 发送错误信息给用户
        client.sendMessage(message.chatId, {
          message: "无法获取你的DC服务器信息，请稍后再试。",
        });
      });
  }
}
