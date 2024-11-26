import puppeteer from "puppeteer-core";
import { mkdir, unlink } from "fs/promises";
import { join } from "path";

const executablePath =
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"; // 替换为实际的 Chrome/Chromium 路径
const outputDir = "./caching/puppeteer"; // 截图保存的文件夹

// 确保目录存在
const ensureDirectoryExists = async (dir) => {
  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    logger.error(`Error ensuring directory exists: ${err.message}`);
  }
};

const pimg = async (htmlContent, viewport = { width: 800, height: 600 }) => {
  let browser;
  const startTime = Date.now(); // 开始时间
  try {
    // 初始化浏览器
    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ["--no-sandbox", "--disable-gpu"],
    });

    const page = await browser.newPage();

    // 设置视口大小
    await page.setViewport(viewport);

    // 加载 HTML 内容
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // 确保输出目录存在
    await ensureDirectoryExists(outputDir);

    // 生成截图文件名
    const fileName = `screenshot-${Date.now()}.png`;
    const outputPath = join(outputDir, fileName);

    // 截图
    await page.screenshot({ path: outputPath });
    await page.close();

    const endTime = Date.now(); // 结束时间
    const duration = (endTime - startTime) / 1000; // 用时（秒）
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
