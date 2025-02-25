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
