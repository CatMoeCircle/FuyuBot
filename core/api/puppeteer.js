import os from "os";
let puppeteer;
if (os.platform() === "android") {
  puppeteer = await import("puppeteer-core");
} else {
  puppeteer = await import("puppeteer");
}

import { mkdir, unlink } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";
import log from "#logger";
import UserAgent from "user-agents";

let executablePath;
if (os.platform() === "android") {
  try {
    executablePath = execSync("which chromium-browser").toString().trim();
    if (!executablePath) {
      throw new Error("chromium-browser not found in PATH");
    }
  } catch (error) {
    log.error(`Error getting chromium-browser path: ${error.message}`);
    throw error;
  }
}

const outputDir = "./caching/puppeteer";

/**
 * Ensures that a directory exists, creating it if necessary
 * @param {string} dir - Directory path to check/create
 * @returns {Promise<void>}
 */
const ensureDirectoryExists = async (dir) => {
  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    log.error(`Error ensuring directory exists: ${err.message}`);
  }
};

// 重试
const retryFunction = async (fn, retries = 3, delay = 1000) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      log.error(`Attempt ${attempt} failed: ${error.message}`);
      if (attempt >= retries) {
        throw new Error(`Failed after ${retries} attempts`);
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};
/**
 * Generate webpage screenshot
 * @param {string} htmlContent - HTML content to render
 * @param {Object} viewport - Viewport configuration
 * @param {number} viewport.width - Viewport width, default 800
 * @param {number} viewport.height - Viewport height, default 600
 * @param {number} [viewport.deviceScaleFactor] - Device scale factor
 * @returns {Promise<string>} Generated image file path
 */
const genImage = async (
  htmlContent,
  viewport = { width: 800, height: 600 }
) => {
  let browser;
  const startTime = Date.now();

  const generateScreenshot = async () => {
    try {
      browser = await puppeteer.launch({
        executablePath,
        headless: true,
        args: ["--no-sandbox", "--enable-gpu"],
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
      log.debug(`Screenshot generated in ${duration} seconds`);

      return outputPath;
    } catch (error) {
      log.error(`Error generating screenshot: ${error}`);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  };

  return await retryFunction(generateScreenshot);
};

/**
 *
 * @param {string} filePath - file path
 */
const deleteImage = async (filePath) => {
  try {
    await unlink(filePath);
  } catch (error) {
    log.error(`Error deleting file: ${error.message}`);
    throw error;
  }
};
/**
 * Fetches HTML content from a URL using a specified device type and headers
 * @param {string} url - URL to fetch content from
 * @param {string} devicey - Device type ('desktop' or 'mobile'), default 'desktop'
 * @returns {Promise<string>} HTML content of the page
 * @throws {Error} If fetching fails
 */
const gethtml = async (url, devicey = "desktop") => {
  try {
    const browser = await puppeteer.launch({ executablePath, headless: "new" });
    const page = await browser.newPage();

    await page.setUserAgent(
      new UserAgent({ deviceCategory: devicey }).toString()
    );

    await page.goto(url, { waitUntil: "networkidle2" });
    const pageContent = await page.content();
    await browser.close();
    return pageContent;
  } catch (error) {
    log.error(`Error generating screenshot: ${error}`);
    throw error;
  }
};
export { genImage, deleteImage, gethtml };
