import { JSON_SCHEMA } from "js-yaml";
import { pimg, deleteImage } from "../core/api/puppeteer.js";

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
            logger.error(`无法下载头像: ${downloadError}`);
            avatarBase64 = null;
          }
        } else {
          logger.info("用户没有头像");
          avatarBase64 = `https://dummyimage.com/80x80/cccccc/ffffff&text=${user.firstName.charAt(
            0
          )}`;
        }

        const dcId = user.photo.dcId || null;
        const ID = user.id.value.toString();
        const userName = user.username || "null";
        const userFullName =
          (user.firstName === null ||
          user.firstName === "null" ||
          user.firstName === ""
            ? ""
            : user.firstName) +
            (user.lastName === null ||
            user.lastName === "null" ||
            user.lastName === ""
              ? ""
              : user.lastName) || "未知姓名";
        const viewport = { width: 400, height: 285, deviceScaleFactor: 2 };

        const htmlContent = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
            html,
        body {
            margin: 0;
            padding: 0;
        }

        .main {
            width: 400px;
            height: 285px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .background {
            position: absolute;
            width: 400px;
            height: 135px;
        }

        .background img {
            width: 400px;
            height: 135px;
            object-fit: cover;
        }

        .avatar {
            position: absolute;
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 50%;
            border: 2px solid #ffffff;
            top: 80px;
            left: 20px;
            z-index: 99;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        }

        .content {
            position: absolute;
            width: 400px;
            height: 165px;
            top: 128px;
            background-image: linear-gradient(to bottom right, #ffffff 0%, #fff3ff 100%);
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        }

        .info {
            display: flex;
            flex-direction: column;
            margin-left: 20px;
        }

        .info h2,
        p {
            margin: 0;
            padding: 0;
        }


        .content h2 {
            margin-top: 30px;
            font-size: 25px;
            font-weight: 400;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 360px;

        }

        .username {
            color: #808080;
            font-size: 15px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 360px;
        }

        .id {
            color: #808080;
            font-size: 15px;
            margin-top: 15px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 360px;
        }

        .tips {
            display: flex;

            margin: 20px 20px 0 20px;
            justify-content: space-between;
            align-items: center;
        }

        .tips p {
            margin: 0;
            padding: 0;
            font-size: 7px;
            color: #808080;
        }
    </style>
</head>

<body>
    <div class="main">
        <div class="background">
            <img src="http://localhost:3000/api/random-image" alt="background">
        </div>
        <img class="avatar" src="${avatarBase64}" alt="avatar">
        <div class="content">
            <div class="info">
                <h2 class="name">${userFullName}</h2>
                <p class="username">@${userName}</p>
                <p class="id">ID:<span class="id_id">${ID}</span> - DC:<span class="id_dc">${dcId}</span></p>
            </div>
            <div class="tips">
                <div>
                    <p>如果DC为空请检查头像是否设置或公开显示</p>
                </div>
                <div>
                    <p>version<span>1.0.0</span></p>
                </div>
            </div>
        </div>
    </div>
</body>

</html>
        `;

        try {
          const screenshotPath = await pimg(htmlContent, viewport);

          await client.sendMessage(message.chatId, {
            file: screenshotPath,
          });

          await deleteImage(screenshotPath);
        } catch (error) {
          logger.error(`无法生成截图: ${error}`);

          client.sendMessage(message.chatId, {
            message: "无法生成截图，请稍后再试。",
          });
        }
      })
      .catch((err) => {
        logger.error(`无法获取用户信息: ${err}`);

        client.sendMessage(message.chatId, {
          message: "无法获取你的DC服务器信息，请稍后再试。",
        });
      });
  }
}
