import chokidar from "chokidar";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import fs from "fs";

// 定义 __filename 和 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

global.plugins = {};

const loadPlugins = async () => {
  const pluginsPath = path.resolve(__dirname, "../plugins");
  const authorDirs = fs
    .readdirSync(pluginsPath)
    .filter((dir) => fs.statSync(path.join(pluginsPath, dir)).isDirectory());

  for (const dir of authorDirs) {
    const pluginName = dir;
    const pluginPath = path.join(pluginsPath, dir, "index.js");
    if (fs.existsSync(pluginPath)) {
      delete global.plugins[pluginName];
      const plugin = await import(
        pathToFileURL(pluginPath).href + `?update=${Date.now()}`
      );
      global.plugins[pluginName] = plugin.default || plugin;
      console.log(`插件已加载: ${pluginName}`);
    } else {
      console.warn(`插件目录 ${pluginName} 中没有找到 index.js 文件`);
    }
  }
};

// Initialize plugins on startup
await loadPlugins();
console.log("所有插件已初始化");

// Watch for changes in the plugins folder
chokidar
  .watch(path.resolve(__dirname, "../plugins"))
  .on("all", async (event, filePath) => {
    if (filePath.endsWith("index.js")) {
      await loadPlugins();
      console.log("插件已重新加载");
    }
  });

// 处理未处理的消息并传递给插件
global.handlePluginMessage = (client, event) => {
  const message = event.message;
  Object.values(global.plugins).forEach((plugin) => {
    if (typeof plugin === "function") {
      plugin(client, event);
    }
  });
};
