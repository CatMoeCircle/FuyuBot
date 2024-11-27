import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";

// 定义 __filename 和 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

global.plugins = {};

const loadPlugins = async () => {
  const pluginsPath = path.resolve(__dirname, "../plugins");
  const pluginFiles = fs
    .readdirSync(pluginsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of pluginFiles) {
    const pluginName = path.basename(file, ".js");
    const pluginPath = path.join(pluginsPath, file);
    delete global.plugins[pluginName];
    const plugin = await import(
      pathToFileURL(pluginPath).href + `?update=${Date.now()}`
    );
    global.plugins[pluginName] = plugin.default || plugin;
    console.log(`插件已加载: ${pluginName}`);
  }
};

await loadPlugins();
console.log("所有插件已初始化");

chokidar
  .watch(path.resolve(__dirname, "../plugins"))
  .on("all", async (event, filePath) => {
    if (filePath.endsWith(".js")) {
      await loadPlugins();
      console.log("插件已重新加载");
    }
  });

global.handlePluginMessage = (client, event) => {
  const message = event.message;
  Object.values(global.plugins).forEach((plugin) => {
    if (typeof plugin === "function") {
      plugin(client, event);
    }
  }
  return true;
}

export { loadConfig };
