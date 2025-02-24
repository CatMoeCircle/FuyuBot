# FuyuBot
---  

[English](../README.md) | Английский | [简体中文](./README_zh-CN.md)  

---  

## Описание

Проект Telegram-бота, основанный на [GramJS](https://github.com/gram-js/gramjs), поддерживающий плагины, определяемые пользователем.
***  

## Поддерживаемые платформы

| Платформа | Статус |
|-----------|--------|
| Windows   | ✔      |
| Termux (Android) | ✔ |
| Linux     | ✔      |
| MacOS     | ❓ (Не тестировалось) |

Для macOS необходима дополнительная проверка, так как у нас нет соответствующего оборудования. Если возникнут проблемы, создайте Issue.

Для Termux ознакомьтесь с [руководством по развертыванию Termux](#termux).

---  

## Развертывание

### Необходимые условия

1. Зарегистрируйтесь на https://my.telegram.org/apps для получения API ID и API Hash.
2. Создайте Telegram-бота с помощью [@BotFather](https://t.me/BotFather) для получения токена.
3. Установите [Node.js](https://nodejs.org/) версии 18 или выше.

### Клонировать проект

```bash
git clone https://github.com/CatMoeCircle/FuyuBot.git
```

### Настройка API

Создайте файл `.env` в корневой директории проекта и добавьте:

```dotenv
API_ID=123456  # Telegram API ID
API_HASH=123456789abcdefghijklmn # Telegram API Hash
BOT_TOKEN=123456:ABCDEFGHIJKLMNOPQRSTUVWXYZ # Telegram Bot Token
```

---  

### Запуск

Можно использовать `pnpm` вместо `npm`.

#### **Windows**
```bash
npm i
npm run start
```

#### **Linux**

Для Linux может потребоваться дополнительная настройка для `puppeteer`: https://pptr.dev/troubleshooting#chrome-doesnt-launch-on-linux

```bash
npm i
npm run start
```

#### **Termux**

Скрипт установки для быстрого развертывания:

```bash
bash <(curl -sL https://github.com/CatMoeCircle/FuyuBot/raw/main/scripts/termux.sh)
```

Или установка вручную:

```bash
# Обновить список пакетов
pkg update && pkg upgrade

# Установка необходимых пакетов
pkg install x11-repo tur-repo
pkg install chromium-browser
pkg install nodejs python3 setuptools binutils binutils-is-llvm git which

# Скачать Android NDK для Termux: https://github.com/lzhiyong/termux-ndk
curl -L https://github.com/lzhiyong/termux-ndk/releases/download/android-ndk/android-ndk-r27b-aarch64.zip
unzip android-ndk-r27b-aarch64.zip

# Настройка переменных окружения для NDK
export GYP_DEFINES="android_ndk_path='$HOME/android-ndk-r27b'"

# Если проект не клонирован — клонируйте его, иначе перейдите в директорию проекта
git clone https://github.com/CatMoeCircle/FuyuBot.git
cd FuyuBot

# Установка зависимостей
npm i

# Запуск сервиса
npm run start
```

---  

# Контакты и участие

Если вы обнаружили ошибки или у вас есть предложения по улучшению, создайте Issue или Pull Request. Присоединяйтесь к группе для обсуждения. Вместе сделаем **FuyuBot** лучше!
