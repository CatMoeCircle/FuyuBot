import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;

// 获取当前文件的目录名
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 设置静态文件目录
app.use(express.static(path.join(__dirname, "../plugins")));

app.listen(port, () => {
  console.log(`服务器正在运行在 http://localhost:${port}`);
});
