import { fileURLToPath, pathToFileURL } from "url";
import chokidar from "chokidar";
import initI18n from "#i18next";
import path from "path";
import yaml from "js-yaml";
import log from "#logger";
import fs from "fs";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.resolve(__dirname, "../config/plugins.yaml");

const plugins = new Map();
const handlers = new Map();
const debounceTimers = new Map();

export const loadPlugins = async (client) => {
  const i18next = await initI18n();
  const pluginsDir = path.resolve(__dirname, "../plugins");

  await checkAndSyncPlugins();

  const watcher = chokidar.watch(pluginsDir, {
    ignored: /(^|[/\\])\../,
    persistent: true,
  });

  watcher
    .on("ready", () => {
      log.debug(i18next.t("log.plugin_reload_ready"));
    })
    .on("add", (filePath) => handleFileChange(filePath, client, i18next))
    .on("change", (filePath) => handleFileChange(filePath, client, i18next))
    .on("unlink", (filePath) => unloadPlugin(filePath, client, i18next));
};

async function checkAndSyncPlugins() {
  const pluginsDir = path.resolve(__dirname, "../plugins");

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, yaml.dump({}), "utf8");
  }

  const pluginFiles = await fs.promises.readdir(pluginsDir);
  const config = yaml.load(fs.readFileSync(configPath, "utf8")) || {};

  let configUpdated = false;
  pluginFiles.forEach((pluginName) => {
    if (config[pluginName] === undefined) {
      config[pluginName] = true;
      configUpdated = true;
    }
  });

  if (configUpdated) {
    fs.writeFileSync(configPath, yaml.dump(config), "utf8");
  }
}

function handleFileChange(filePath, client, i18next) {
  const pluginsBasePath = path.resolve(__dirname, "../plugins");
  const relativePath = path.relative(pluginsBasePath, filePath);
  const pathParts = relativePath.split(path.sep);

  const isValidPluginPath =
    pathParts.length === 2 &&
    pathParts[1] === "index.js" &&
    path.dirname(filePath).startsWith(pluginsBasePath);

  if (isValidPluginPath) {
    if (debounceTimers.has(filePath)) {
      clearTimeout(debounceTimers.get(filePath));
    }
    debounceTimers.set(
      filePath,
      setTimeout(() => {
        reloadPlugin(filePath, client, i18next);
        debounceTimers.delete(filePath);
      }, 300)
    );
  }
}

async function loadPlugin(filePath, client, i18next) {
  const pluginName = path.basename(path.dirname(filePath));
  const config = yaml.load(fs.readFileSync(configPath, "utf8")) || {};

  if (!config[pluginName]) {
    log.info(i18next.t("log.plugin_disabled", { pluginName }));
    return;
  }

  try {
    const fileUrl = pathToFileURL(filePath).href;
    const timestamp = Date.now();
    const urlWithTimestamp = `${fileUrl}?t=${timestamp}`;

    const pluginName = path.basename(path.dirname(filePath));
    log.info(i18next.t("log.plugin_loading", { pluginName }));
    const plugin = await import(urlWithTimestamp);

    if (typeof plugin.default === "function") {
      try {
        const result = await plugin.default(client);

        plugins.set(filePath, plugin);
        if (result && result.handler) {
          handlers.set(filePath, result.handler);
        }
        log.debug(i18next.t("log.plugin_load_complete", { pluginName }));
      } catch (initError) {
        plugins.delete(filePath);
        handlers.delete(filePath);
        log.error(
          i18next.t("log.plugin_init_failed", { pluginName, initError })
        );
      }
    }
  } catch (err) {
    const pluginName = path.basename(path.dirname(filePath));
    log.error(
      i18next.t("log.plugin_load_failed", { pluginName, error: err.message })
    );
  }
}

async function reloadPlugin(filePath, client, i18next) {
  const pluginName = path.basename(path.dirname(filePath));
  log.debug(i18next.t("log.plugin_reloading", { pluginName }));
  if (plugins.has(filePath)) {
    await unloadPlugin(filePath, client, i18next);
  }
  await loadPlugin(filePath, client, i18next);
}

function unloadPlugin(filePath, client, i18next) {
  try {
    const plugin = plugins.get(filePath);
    const handler = handlers.get(filePath);
    const pluginName = path.basename(path.dirname(filePath));

    if (handler) {
      log.info(i18next.t("log.plugin_unloading", { pluginName }));
      client.removeEventHandler(handler);
      handlers.delete(filePath);
    }

    if (plugin && typeof plugin.unregister === "function") {
      plugin.unregister(client);
    }
  } catch (err) {
    const pluginName = path.basename(path.dirname(filePath));
    log.error(i18next.t("log.plugin_unload_error", { pluginName, err }));
  } finally {
    const pluginName = path.basename(path.dirname(filePath));
    plugins.delete(filePath);
    log.info(i18next.t("log.plugin_unload_complete", { pluginName }));
  }
}

export async function pluginslist() {
  try {
    const pluginsDir = path.resolve(__dirname, "../plugins");
    const pluginFiles = await fs.promises.readdir(pluginsDir);
    const config = yaml.load(fs.readFileSync(configPath, "utf8")) || {};

    // 检查并添加新插件
    let configUpdated = false;
    pluginFiles.forEach((pluginName) => {
      if (config[pluginName] === undefined) {
        config[pluginName] = true; // 默认启用新插件
        configUpdated = true;
      }
    });

    if (configUpdated) {
      fs.writeFileSync(configPath, yaml.dump(config), "utf8");
    }

    return pluginFiles.map((pluginName) => {
      const isEnabled = config[pluginName] ? "启用" : "禁用";
      return `${pluginName} (${isEnabled})`;
    });
  } catch (error) {
    console.error("读取插件目录时出错:", error);
    throw new Error("无法获取插件列表");
  }
}

export async function unplugin(pluginName) {
  return new Promise((resolve, reject) => {
    const pluginDir = path.resolve(__dirname, "../plugins", pluginName);

    if (!fs.existsSync(pluginDir)) {
      reject(new Error(`插件目录 '${pluginDir}' 不存在。`));
      return;
    }

    fs.rm(pluginDir, { recursive: true, force: true }, (err) => {
      if (err) {
        console.error(`卸载插件失败: ${err}`);
        reject(new Error("卸载插件失败"));
      } else {
        console.log(`插件 '${pluginName}' 已成功卸载。`);
        // 从配置文件中移除插件状态
        const config = yaml.load(fs.readFileSync(configPath, "utf8")) || {};
        delete config[pluginName];
        fs.writeFileSync(configPath, yaml.dump(config), "utf8");
        resolve(`插件 '${pluginName}' 已成功卸载并从配置中移除。`);
      }
    });
  });
}

export async function addPlugin(gitUrl) {
  return new Promise((resolve, reject) => {
    const match = gitUrl.match(/github\.com\/([^/]+)\/([^/]+)\.git/);
    if (!match) {
      reject(new Error("无效的 GitHub 链接"));
      return;
    }

    const repoName = match[2];
    const pluginDir = path.resolve(__dirname, "../plugins", repoName);

    if (fs.existsSync(pluginDir)) {
      reject(new Error(`插件目录 '${pluginDir}' 已存在。`));
      return;
    }

    const command = `git clone ${gitUrl} ${pluginDir}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`插件下载失败: ${stderr}`);
        reject(new Error("插件下载失败"));
      } else {
        console.log(`插件下载成功: ${stdout}`);
        // 默认启用新插件
        const config = yaml.load(fs.readFileSync(configPath, "utf8")) || {};
        config[repoName] = true;
        fs.writeFileSync(configPath, yaml.dump(config), "utf8");
        resolve("插件下载成功并已启用");
      }
    });
  });
}

export async function toggleSwitch(pluginName, enable, client, i18next) {
  try {
    const config = yaml.load(fs.readFileSync(configPath, "utf8")) || {};
    if (config[pluginName] === undefined) {
      throw new Error(`插件 '${pluginName}' 不存在于配置中。`);
    }
    config[pluginName] = enable;
    fs.writeFileSync(configPath, yaml.dump(config), "utf8");

    const pluginDir = path.resolve(
      __dirname,
      "../plugins",
      pluginName,
      "index.js"
    );
    if (enable) {
      await loadPlugin(pluginDir, client, i18next);
    } else {
      unloadPlugin(pluginDir, client, i18next);
    }

    return `插件 '${pluginName}' 已被${enable ? "启用" : "禁用"}`;
  } catch (error) {
    console.error("更新插件配置时出错:", error);
    throw new Error("无法更新插件配置");
  }
}

export async function reload() {
  return 重载;
}
