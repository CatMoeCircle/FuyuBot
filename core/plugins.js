import chokidar from "chokidar";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import log from "#logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const plugins = new Map();
const handlers = new Map();
const debounceTimers = new Map();

export const loadPlugins = async (client) => {
  const pluginsDir = path.resolve(__dirname, "../plugins");

  const watcher = chokidar.watch(pluginsDir, {
    ignored: /(^|[/\\])\../, // 忽略隐藏文件
    persistent: true,
  });

  watcher
    .on("ready", () => {
      log.debug("[PLUGIN]插件动态重载已准备好");
    })
    .on("add", (filePath) => handleFileChange(filePath, client))
    .on("change", (filePath) => handleFileChange(filePath, client))
    .on("unlink", (filePath) => unloadPlugin(filePath, client));
};

function handleFileChange(filePath, client) {
  const pluginsBasePath = path.resolve(__dirname, "../plugins");
  const relativePath = path.relative(pluginsBasePath, filePath);
  const pathParts = relativePath.split(path.sep);

  const isValidPluginPath =
    pathParts.length === 2 && // 必须是两层目录深度
    pathParts[1] === "index.js" && // 文件名必须是 index.js
    path.dirname(filePath).startsWith(pluginsBasePath); // 必须在插件目录下

  if (isValidPluginPath) {
    // 使用去抖动来减少重复操作
    if (debounceTimers.has(filePath)) {
      clearTimeout(debounceTimers.get(filePath));
    }
    debounceTimers.set(
      filePath,
      setTimeout(() => {
        reloadPlugin(filePath, client);
        debounceTimers.delete(filePath);
      }, 300)
    );
  }
}

async function loadPlugin(filePath, client) {
  if (plugins.has(filePath)) {
    const pluginName = path.basename(path.dirname(filePath));
    log.info(`[PLUGIN]插件已加载: ${pluginName}`);
    return;
  }

  try {
    const fileUrl = pathToFileURL(filePath).href;
    const timestamp = Date.now();
    const urlWithTimestamp = `${fileUrl}?t=${timestamp}`;

    const pluginName = path.basename(path.dirname(filePath));
    log.info(`[PLUGIN]正在加载插件: ${pluginName}`);
    const plugin = await import(urlWithTimestamp);

    if (typeof plugin.default === "function") {
      try {
        const result = await plugin.default(client);
        // 存储插件和它的处理器
        plugins.set(filePath, plugin);
        if (result && result.handler) {
          handlers.set(filePath, result.handler);
        }
        log.debug(`[PLUGIN]插件加载完成: ${pluginName}`);
      } catch (initError) {
        plugins.delete(filePath);
        handlers.delete(filePath);
        log.error(
          `[PLUGIN]插件初始化失败: ${pluginName} - ${initError.message}`
        );
      }
    }
  } catch (err) {
    const pluginName = path.basename(path.dirname(filePath));
    log.error(`[PLUGIN]加载插件失败: ${pluginName} - ${err.message}`);
  }
}

async function reloadPlugin(filePath, client) {
  const pluginName = path.basename(path.dirname(filePath));
  log.debug(`[PLUGIN]开始重载插件: ${pluginName}`);
  if (plugins.has(filePath)) {
    await unloadPlugin(filePath, client);
  }
  await loadPlugin(filePath, client);
}

function unloadPlugin(filePath, client) {
  try {
    const plugin = plugins.get(filePath);
    const handler = handlers.get(filePath);
    const pluginName = path.basename(path.dirname(filePath));

    if (handler) {
      log.info(`[PLUGIN]正在卸载插件: ${pluginName}`);
      client.removeEventHandler(handler);
      handlers.delete(filePath);
    }

    if (plugin && typeof plugin.unregister === "function") {
      plugin.unregister(client);
    }
  } catch (err) {
    const pluginName = path.basename(path.dirname(filePath));
    log.error(`[PLUGIN]卸载插件出错: ${pluginName} - ${err.message}`);
  } finally {
    const pluginName = path.basename(path.dirname(filePath));
    plugins.delete(filePath);
    log.info(`[PLUGIN]插件卸载完成: ${pluginName}`);
  }
}
