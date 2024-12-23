import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pluginConfigPath = path.join(process.cwd(), "config", "plugins.yaml");

const loadedPlugins = new Map();

function loadPluginConfig() {
  try {
    if (!fs.existsSync(pluginConfigPath)) {
      fs.writeFileSync(pluginConfigPath, "# 插件启用状态配置\n");
      return {};
    }
    return yaml.load(fs.readFileSync(pluginConfigPath, "utf8")) || {};
  } catch (error) {
    console.error("读取插件配置失败:", error);
    return {};
  }
}

function savePluginConfig(config) {
  try {
    fs.writeFileSync(
      pluginConfigPath,
      yaml.dump(config, {
        indent: 2,
        lineWidth: -1,
      })
    );
  } catch (error) {
    console.error("保存插件配置失败:", error);
  }
}

async function loadPluginInfo(pluginDir) {
  const infoPath = path.join(pluginDir, "info.json");
  const configPath = path.join(pluginDir, "config.yaml");

  try {
    const info = JSON.parse(fs.readFileSync(infoPath, "utf8"));

    let config = {};
    if (fs.existsSync(configPath)) {
      config = yaml.load(fs.readFileSync(configPath, "utf8"));
    }

    return { info, config };
  } catch (error) {
    console.error(`读取插件信息失败: ${pluginDir}`, error);
    return null;
  }
}

export function getPluginList() {
  const pluginList = [];
  loadedPlugins.forEach((plugin, name) => {
    pluginList.push({
      name: name,
      version: plugin.info.version,
      description: plugin.info.description,
      enabled: plugin.enabled,
    });
  });
  return pluginList;
}

export async function enablePlugin(pluginName) {
  const plugin = loadedPlugins.get(pluginName);
  if (!plugin) {
    throw new Error(`插件 ${pluginName} 不存在`);
  }
  if (plugin.enabled) {
    return false;
  }

  if (typeof plugin.instance.enable === "function") {
    await plugin.instance.enable();
  }
  plugin.enabled = true;

  const config = loadPluginConfig();
  config[pluginName] = true;
  savePluginConfig(config);

  return true;
}

export async function disablePlugin(pluginName) {
  const plugin = loadedPlugins.get(pluginName);
  if (!plugin) {
    throw new Error(`插件 ${pluginName} 不存在`);
  }
  if (!plugin.enabled) {
    return false;
  }

  if (typeof plugin.instance.disable === "function") {
    await plugin.instance.disable();
  }
  plugin.enabled = false;

  const config = loadPluginConfig();
  config[pluginName] = false;
  savePluginConfig(config);

  return true;
}

export async function loadPlugins() {
  try {
    const pluginConfig = loadPluginConfig();
    const pluginDirs = fs
      .readdirSync(__dirname, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const dir of pluginDirs) {
      const pluginDir = path.join(__dirname, dir);
      const pluginPath = path.join(pluginDir, "index.js");

      if (fs.existsSync(pluginPath)) {
        try {
          const pluginData = await loadPluginInfo(pluginDir);
          if (!pluginData) {
            continue;
          }

          console.log(
            `正在加载插件: ${pluginData.info.name} v${pluginData.info.version}`
          );

          const plugin = await import(`file://${pluginPath}`);

          const enabled = pluginConfig[pluginData.info.name] !== false; // 默认为true
          loadedPlugins.set(pluginData.info.name, {
            info: pluginData.info,
            config: pluginData.config,
            instance: plugin,
            enabled: enabled,
          });

          if (typeof plugin.initialize === "function") {
            await plugin.initialize(pluginData.config);
          }

          console.log(`插件 ${pluginData.info.name} 加载成功！`);
        } catch (error) {
          console.error(`加载插件 ${dir} 失败:`, error);
        }
      }
    }
  } catch (error) {
    console.error("加载插件时出错:", error);
  }
}
