import { fileURLToPath, pathToFileURL } from "url";
import chokidar from "chokidar";
import initI18n from "#i18next";
import path from "path";
import log from "#logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const plugins = new Map();
const handlers = new Map();
const debounceTimers = new Map();

export const loadPlugins = async (client) => {
  const i18next = await initI18n();
  const pluginsDir = path.resolve(__dirname, "../plugins");

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
  if (plugins.has(filePath)) {
    const pluginName = path.basename(path.dirname(filePath));
    log.info(i18next.t("log.plugin_loaded", { pluginName }));
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
