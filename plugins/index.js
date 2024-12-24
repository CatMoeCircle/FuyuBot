import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";
import i18next from "../i18n/i18n.js";

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
    console.error(i18next.t("plugins.read_config_error", { error }));
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
    console.error(i18next.t("plugins.save_config_error", { error }));
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
    console.error(
      i18next.t("plugins.read_info_error", {
        path: pluginDir,
        error,
      })
    );
    return null;
  }
}

function getPluginList() {
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

function createPluginProxy(plugin, pluginName) {
  return new Proxy(plugin, {
    get(target, prop) {
      const original = target[prop];
      if (typeof original === "function") {
        return async (...args) => {
          try {
            return await original.apply(target, args);
          } catch (error) {
            console.error(
              i18next.t("plugins.execution_error", {
                name: pluginName,
                method: prop,
                error,
              })
            );

            return null;
          }
        };
      }
      return original;
    },
  });
}

async function enablePlugin(pluginName) {
  try {
    const plugin = loadedPlugins.get(pluginName);
    if (!plugin) {
      throw new Error(i18next.t("plugins.not_found", { name: pluginName }));
    }
    if (plugin.enabled) {
      return false;
    }

    await plugin.instance.enable?.();
    plugin.enabled = true;

    const config = loadPluginConfig();
    config[pluginName] = true;
    savePluginConfig(config);

    return true;
  } catch (error) {
    console.error(
      i18next.t("plugins.enable_error", {
        name: pluginName,
        error,
      })
    );
    return false;
  }
}

async function disablePlugin(pluginName) {
  try {
    const plugin = loadedPlugins.get(pluginName);
    if (!plugin) {
      throw new Error(i18next.t("plugins.not_found", { name: pluginName }));
    }
    if (!plugin.enabled) {
      return false;
    }

    await plugin.instance.disable?.();
    plugin.enabled = false;

    const config = loadPluginConfig();
    config[pluginName] = false;
    savePluginConfig(config);

    return true;
  } catch (error) {
    console.error(
      i18next.t("plugins.disable_error", {
        name: pluginName,
        error,
      })
    );
    return false;
  }
}

async function loadPlugins() {
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
            i18next.t("plugins.loading", {
              name: pluginData.info.name,
              version: pluginData.info.version,
            })
          );

          const plugin = await import(`file://${pluginPath}`);

          const proxiedPlugin = createPluginProxy(plugin, pluginData.info.name);

          const pluginType = pluginData.info.type || "all";
          const pluginName = pluginData.info.name;
          if (pluginConfig[pluginName] === undefined) {
            pluginConfig[pluginName] = true;
          }

          loadedPlugins.set(pluginName, {
            info: pluginData.info,
            config: pluginData.config,
            instance: proxiedPlugin,
            type: pluginType,
            enabled: pluginConfig[pluginName],
          });

          if (typeof proxiedPlugin.initialize === "function") {
            await proxiedPlugin.initialize(pluginData.config);
          }

          console.log(
            i18next.t("plugins.load_success", {
              name: pluginData.info.name,
            })
          );
        } catch (error) {
          console.error(
            i18next.t("plugins.load_error", {
              name: dir,
              error,
            })
          );
        }
      }
    }
    savePluginConfig(pluginConfig);
  } catch (error) {
    console.error(
      i18next.t("plugins.load_error", {
        name: "unknown",
        error,
      })
    );
  }
}

export {
  loadPlugins,
  getPluginList,
  enablePlugin,
  disablePlugin,
  loadedPlugins,
};
