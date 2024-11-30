import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import chokidar from "chokidar";
import log from "#logger";

const app = express();
const port = 3000;

// 获取当前文件的目录名
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 设置静态文件目录
app.use(express.static(path.join(__dirname, "../plugins")));
app.use(express.static(path.join(__dirname, "resources")));

// 获取resources/Background目录下的图像列表
let images = [];
let weights = [];
const imagesDir = path.join(__dirname, "resources/Background");

const updateImagesList = () => {
  fs.readdir(imagesDir, (err, files) => {
    if (err) {
      console.error("无法读取目录:", err);
      return;
    }
    images = files.filter((file) => /\.(jpg|jpeg|png|gif)$/.test(file));
    weights = new Array(images.length).fill(1); // 初始化权重
  });
};

// 初始更新图像列表
updateImagesList();

// 监听resources/Background目录的变化
chokidar.watch(imagesDir).on("all", () => {
  updateImagesList();
});

// 加权随机选择算法
const weightedRandom = () => {
  const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < weights.length; i++) {
    if (random < weights[i]) {
      return i;
    }
    random -= weights[i];
  }
  return weights.length - 1;
};

// 创建API随机返回图像
app.get("/api/random-image", (req, res) => {
  if (images.length === 0) {
    return res.status(404).send("没有找到图像");
  }
  const index = weightedRandom();
  const randomImage = images[index];
  weights[index] = Math.max(weights[index] / 2, 0.1); // 降低已选择图像的权重，但不低于0.1
  res.sendFile(path.join(imagesDir, randomImage));
});

app.listen(port, () => {
  log.info(`[WEB]服务器正在运行在 http://localhost:${port}`);
});
