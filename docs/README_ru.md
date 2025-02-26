# FuyuBot
---  

[English](../README.md) | [简体中文](./README_zh-CN.md) | Русский

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
| MacOS     | ? (Не тестировалось) |

Для macOS, хотя у нас в настоящее время нет оборудования для тестирования, теоретически всё должно работать. Если вы столкнетесь с какими-либо проблемами, пожалуйста, создайте Issue.

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

#### **Windows и Linux**
```bash
npm i
npm run start
```

#### **Termux**

Скрипт установки для быстрого развертывания:

```bash
bash <(curl -sL https://github.com/CatMoeCircle/FuyuBot/raw/main/scripts/termux.sh)

# Перейдите к разделу настройки API выше

npm i
npm run start
```

Или установка вручную:

```bash
# Обновить список пакетов
pkg update && pkg upgrade

# Установка необходимых пакетов
pkg install x11-repo tur-repo
pkg install nodejs 
pkg install python3 setuptools binutils binutils-is-llvm git

# Скачать Android NDK для Termux: https://github.com/lzhiyong/termux-ndk
curl -L https://github.com/lzhiyong/termux-ndk/releases/download/android-ndk/android-ndk-r27b-aarch64.zip --output android-ndk-r27b-aarch64.zip
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

Если вы обнаружили ошибки или у вас есть предложения по улучшению, создайте Issue или Pull Request. Присоединяйтесь к группе для обсуждения.  
[@CatMoeCircle_Group](https://t.me/CatMoeCircle_Group)
Вместе сделаем **FuyuBot** лучше!

