**Fuyu Bot**  
---

[English](../README.md) | [简体中文](./README.zh-CN.md) | Русский  

---

## Разрабатываемая версия v2  
В настоящее время в разработке. Некоторые функции еще не реализованы. Ожидайте!  

### Возможности  
- Поддержка нескольких учетных записей  
- Поддержка входа как через бот, так и через пользовательские аккаунты  
- Оптимизированная загрузка плагинов  
- Поддержка нескольких языков  
- Веб-интерфейс управления  

## Описание  

Проект Telegram Bot на основе [GramJS](https://github.com/gram-js/gramjs), поддерживающий пользовательские плагины.  

---

## Поддерживаемые платформы  

| Платформа       | Статус     |  
|-----------------|------------|  
| Windows         | ✔          |  
| Termux(Android) | ✔          |  
| Linux           | ✔          |  
| MacOS           | ? (не тестировалось)|  

Для MacOS у нас нет необходимого оборудования для тестирования. Если возникнут проблемы, пожалуйста, создайте Issue.  
Для Termux см. [Руководство по развертыванию в Termux](#termux).  

---

## Развертывание  

### Предварительные требования  

1. Перейдите на https://my.telegram.org/apps и зарегистрируйте новое приложение, чтобы получить API ID и API Hash.  

2. Создайте бота Telegram через [@BotFather](https://t.me/BotFather) и получите токен бота.  

3. Установите [Node.js](https://nodejs.org/), желательно LTS (долгосрочная поддержка).  

### Клонирование проекта  

```bash  
git clone https://github.com/CatMoeCircle/FuyuBot.git
```
### Настройка API

Перейдите в корневую директорию проекта и создайте файл .env. Добавьте следующий контент:
```env
API_ID=123456  # Telegram API ID  
API_HASH=123456789abcdefghijklmn  # Telegram API Hash
```

---

### Запуск

#### На Windows и Linux
```
npm i  
npm run test
```
#### На Termux

Ручная установка и настройка среды:
```bash
# Обновите список пакетов  
pkg update && pkg upgrade  

# Установите необходимые пакеты  
pkg install x11-repo tur-repo  
pkg install chromium  
pkg install nodejs python3 setuptools binutils binutils-is-llvm git which  

# Загрузите Android NDK для Termux: https://github.com/lzhiyong/termux-ndk  
curl -L https://github.com/lzhiyong/termux-ndk/releases/download/android-ndk/android-ndk-r27b-aarch64.zip  
unzip android-ndk-r27b-aarch64.zip  

# Настройте переменные окружения для NDK  
export GYP_DEFINES="android_ndk_path='$HOME/android-ndk-r27b'"  

# Клонируйте проект или перейдите в директорию проекта, если он уже клонирован  
git clone https://github.com/CatMoeCircle/FuyuBot.git  
cd shiny-journey-bot  

# Установите зависимости  
npm i  

# Запустите бота  
npm run test
```

---

# Контакты и вклад

Если вы столкнулись с проблемами или у вас есть предложения по улучшению, создайте Issue или Pull Request.
Присоединяйтесь к нашей группе [@xiaoqvan_chat](https://t.me/xiaoqvan_chat) для обсуждения и сотрудничества.
Давайте сделаем FuyuBot лучше вместе!



