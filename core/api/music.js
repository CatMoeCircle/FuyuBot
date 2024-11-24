import crypto from "crypto";
import axios from "axios";
import fs from "fs";
import path from "path";
import { URL, fileURLToPath } from "url";
import yaml from "js-yaml";

// 计算十六进制摘要
const hexDigest = (data) =>
  data.map((d) => d.toString(16).padStart(2, "0")).join("");

// 计算MD5摘要
const hashDigest = (text) =>
  crypto.createHash("md5").update(text, "utf8").digest();

// 计算MD5十六进制摘要
const hashHexDigest = (text) => hexDigest(Array.from(hashDigest(text)));

const readCookie = () => {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const cookieFile = path.join(scriptDir, "../../config/163cookie.yaml");
  const fileContents = fs.readFileSync(cookieFile, "utf8");
  const cookies = yaml.load(fileContents);
  return cookies;
};

const post = async (url, params, cookie) => {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/2.10.2.200154",
    "Accept-Encoding": "gzip, deflate, br",
    Accept: "*/*",
    Connection: "keep-alive",
    Referer: "",
    Cookie: `os=${cookie.os}; appver=${cookie.appver}; osver=; deviceId=Telegram; MUSIC_U=${cookie.MUSIC_U}`,
  };

  const response = await axios.post(url, `params=${params}`, {
    headers,
  });
  return response.data;
};

// 获取歌曲URL
const MusicUrl = async (id, level, cookies) => {
  const url =
    "https://interface3.music.163.com/eapi/song/enhance/player/url/v1";
  const AES_KEY = Buffer.from("e82ckenh8dichen8");
  const config = {
    os: "pc",
    appver: "",
    osver: "",
    deviceId: "Telegram",
    requestId: (Math.floor(Math.random() * 10000000) + 20000000).toString(),
  };

  const payload = {
    ids: [id],
    level: level,
    encodeType: "flac",
    header: JSON.stringify(config),
  };

  if (level === "sky") {
    payload["immerseType"] = "c51";
  }

  const url2 = new URL(url).pathname.replace("/eapi/", "/api/");
  const digest = hashHexDigest(
    `nobody${url2}use${JSON.stringify(payload)}md5forencrypt`
  );
  const params = `${url2}-36cd479b6b5-${JSON.stringify(
    payload
  )}-36cd479b6b5-${digest}`;
  const padder = crypto.createCipheriv("aes-128-ecb", AES_KEY, null);
  const enc = Buffer.concat([padder.update(params, "utf8"), padder.final()]);
  const response = await post(url, hexDigest(Array.from(enc)), cookies);
  return response;
};

// 获取歌曲名称
const MusicInfo = async (id) => {
  const url = "https://interface3.music.163.com/api/v3/song/detail";
  const data = `c=${encodeURIComponent(JSON.stringify([{ id: id, v: 0 }]))}`;
  const response = await axios.post(url, data, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return response.data;
};

const get163music = async (id, level) => {
  const cookies = readCookie();
  try {
    const songInfo = await MusicInfo(id);
    const songUrlData = await MusicUrl(id, level, cookies);

    // 提取所需的字段
    const { size, url, level: songLevel } = songUrlData.data[0];
    const songDetails = songInfo.songs[0];

    // 构建JSON对象
    const result = {
      name: songDetails.name,
      picUrl: songDetails.al.picUrl,
      artists: songDetails.ar.map((artist) => artist.name).join("/"),
      album: songDetails.al.name,
      level: songLevel,
      size: size,
      time: songDetails.dt,
      url: url,
    };

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default get163music;
