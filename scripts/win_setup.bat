# 初始设置脚本
@echo off
:: 获取当前脚本的上级目录
set "parent_dir=%~dp0..\"
set "config_dir=%parent_dir%config"

:: 创建config目录
if not exist "%config_dir%" (
    mkdir "%config_dir%"
)

:: 创建telegram.yaml
(
    echo # 代理配置地址
    echo proxy:
    echo   # 代理协议
    echo   protocol: http
    echo   # 代理地址
    echo   host: localhost
    echo   # 代理端口
    echo   port: 1080
    echo   # 代理用户名
    echo   username:
    echo   # 代理密码
    echo   password:
    echo   # 代理超时时间
    echo   timeout: 10
    echo   # 代理是否开启
    echo   enable: false
) > "%config_dir%\telegram.yaml"

:: 创建redis.yaml
(
    echo # sqlite3地址
    echo host: 127.0.0.1
    echo # sqlite3端口
    echo port: 6379
    echo # sqlite3用户名，可以为空
    echo username:
    echo # sqlite3密码，没有密码可以为空
    echo password:
) > "%config_dir%\redis.yaml"

:: 创建bot.yaml
(
    echo # chromium其他路径
    echo chromium_path:
    echo # 截图超时时间
    echo screenshot_timeout: 10
    echo # 任务超时时间
    echo task_timeout: 30
    echo # 错误尝试次数
    echo error_retry: 3
    echo # 创建者id[bot上线后发送消息给创建者]
    echo creator_id: 12345678
) > "%config_dir%\bot.yaml"

:: 创建163cookie.yaml
(
    echo MUSIC_U: ""
    echo os: pc
    echo appver: 3.1.0.203271
) > "%config_dir%\163cookie.yaml"

echo 配置文件已生成到: %config_dir%
pause
