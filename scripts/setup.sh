# 初始设置脚本
#!/bin/bash

# 获取当前脚本的上级目录
parent_dir=$(dirname "$(readlink -f "$0")")/..
config_dir="$parent_dir/config"

# 创建 config 目录
if [ ! -d "$config_dir" ]; then
    mkdir -p "$config_dir"
fi

# 创建 telegram.yaml
cat > "$config_dir/telegram.yaml" <<EOF
# 代理配置地址
proxy:
  # 代理协议
  protocol: http
  # 代理地址
  host: localhost
  # 代理端口
  port: 1080
  # 代理用户名
  username:
  # 代理密码
  password:
  # 代理超时时间
  timeout: 10
  # 代理是否开启
  enable: false
EOF

# 创建 redis.yaml
cat > "$config_dir/redis.yaml" <<EOF
# sqlite3地址
host: 127.0.0.1
# sqlite3端口
port: 6379
# sqlite3用户名，可以为空
username:
# sqlite3密码，没有密码可以为空
password:
EOF

# 创建 bot.yaml
cat > "$config_dir/bot.yaml" <<EOF
# chromium其他路径
chromium_path:
# 截图超时时间
screenshot_timeout: 10
# 任务超时时间
task_timeout: 30
# 错误尝试次数
error_retry: 3
# 创建者id[bot上线后发送消息给创建者]
creator_id: 12345678
EOF

# 创建 163cookie.yaml
cat > "$config_dir/163cookie.yaml" <<EOF
MUSIC_U: ""
os: pc
appver: 3.1.0.203271
EOF

echo "配置文件已生成到: $config_dir"
