import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "data.db");

export function initDatabase() {
  if (!fs.existsSync(dbPath)) {
    try {
      const db = new Database(dbPath);

      db.exec(`
        CREATE TABLE IF NOT EXISTS user_data (
          user_id INTEGER PRIMARY KEY,
          language TEXT DEFAULT 'zh-cn',
          custom_settings TEXT,  -- 存储JSON格式的自定义设置
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.exec(`
        INSERT OR IGNORE INTO user_data (
          user_id,
          language,
          custom_settings
        ) VALUES (
          1,
          'zh-cn',
          '{}'
        )
      `);

      db.close();
      return true;
    } catch (err) {
      console.error("数据库初始化失败:", err);
      return false;
    }
  }
  return true;
}

export function createUser(userId, language = "zh-cn", customSettings = "{}") {
  try {
    const db = new Database(dbPath);
    const stmt = db.prepare(`
      INSERT INTO user_data (user_id, language, custom_settings)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(userId, language, customSettings);
    db.close();
    return result.changes > 0;
  } catch (err) {
    console.error("创建用户失败:", err);
    return false;
  }
}

export function updateUser(userId, data) {
  try {
    const db = new Database(dbPath);
    const updates = [];
    const params = [];

    if (data.language) {
      updates.push("language = ?");
      params.push(data.language);
    }

    if (data.customSettings) {
      updates.push("custom_settings = ?");
      params.push(
        typeof data.customSettings === "string"
          ? data.customSettings
          : JSON.stringify(data.customSettings)
      );
    }

    if (updates.length === 0) {
      db.close();
      return false;
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    params.push(userId);

    const stmt = db.prepare(`
      UPDATE user_data 
      SET ${updates.join(", ")}
      WHERE user_id = ?
    `);

    const result = stmt.run(...params);
    db.close();
    return result.changes > 0;
  } catch (err) {
    console.error("更新用户数据失败:", err);
    return false;
  }
}
