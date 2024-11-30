import { genImage, deleteImage } from "../../core/api/puppeteer.js";
import fs from "fs";

export async function help(client, event) {
  const message = event.message;
  if (message.message === "/help") {
    try {
      const htmlContent = fs.readFileSync(
        "commands/help/html/help.html",
        "utf-8"
      );
      const viewport = { width: 1250, height: 600 };
      const screenshotPath = await genImage(htmlContent, viewport);
      await client.sendMessage(message.chatId, {
        file: screenshotPath,
      });
      await deleteImage(screenshotPath);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }
}
