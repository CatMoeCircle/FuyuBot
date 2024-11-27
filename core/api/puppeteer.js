import puppeteer from "puppeteer-core";
import { mkdir, unlink } from "fs/promises";
import { join } from "path";

const executablePath =
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"; // Chrome/Chromium 路径
const outputDir = "./caching/puppeteer";

const ensureDirectoryExists = async (dir) => {
  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    logger.error(`Error ensuring directory exists: ${err.message}`);
  }
};

const pimg = async (htmlContent, viewport = { width: 800, height: 600 }) => {
  let browser;
  const startTime = Date.now();
  try {
    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ["--no-sandbox", "--disable-gpu"],
    });

    const page = await browser.newPage();

    await page.setViewport(viewport);

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    await ensureDirectoryExists(outputDir);

    const fileName = `screenshot-${Date.now()}.png`;
    const outputPath = join(outputDir, fileName);

    await page.screenshot({ path: outputPath });
    await page.close();

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    logger.debug(`Screenshot generated in ${duration} seconds`);

    return outputPath;
  } catch (error) {
    logger.error(`Error generating screenshot: ${error}`);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// 删除图片
const deleteImage = async (filePath) => {
  try {
    await unlink(filePath);
  } catch (error) {
    logger.error(`Error deleting file: ${error.message}`);
    throw error;
  }
};

export { pimg, deleteImage };
