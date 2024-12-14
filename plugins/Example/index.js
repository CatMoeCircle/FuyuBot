// 接收新消息，判断命令，有则执行对应的命令
// Receive new messages, check for commands, and execute corresponding commands if any
import { NewMessage } from "telegram/events/index.js";

// 必须export default一个函数，接收一个client参数
// Must export a default function that takes a client parameter
export default async function (client) {
  // 定义一个处理器函数
  // Define a handler function
  const handler = async (event) => {
    try {
      // 把获取的消息赋值给message
      // Assign the received message to the variable message
      const message = event.message;
      // 判断消息是否以/开头
      // Check if the message starts with a "/"
      const command = message.message.split(" ")[0];
      // 获取登录的账号的信息
      // Get the information of the logged-in account
      const me = await client.getMe();
      // 判断命令@的人是否是登录的账号，防止回复他人的指定@的消息
      // Check if the command is directed at the logged-in account to prevent responding to messages directed at others
      const [cmd, username] = command.split("@");
      if (username && username.toLowerCase() !== me.username.toLowerCase()) {
        return;
      }
      // 命令列表
      // List of commands
      const commands = {
        "/Example": Example,
      };

      // 判断消息中是否有命令在列表中
      // Check if the message contains a command in the list
      if (commands[cmd]) {
        await commands[cmd](client, event);
      }

      async function Example() {
        client.sendMessage(message.chatId, {
          // 回复消息，replyTo: message.id 表示回复这条消息
          // Reply to the message, replyTo: message.id indicates replying to this message
          replyTo: message.id,
          // 回复消息的内容
          // Content of the reply message
          message: "Hello, World!",
        });
      }
    } catch (error) {
      console.log(error);

      // Log an error if there is an issue processing the message
    }
  };

  // 注册接收新消息处理器
  // Register the handler for receiving new messages
  // 更多的处理器前往 gramjs 官方文档查看 https://gram.js.org/beta/classes/TelegramClient.html#addEventHandler
  // For more handlers, refer to the gramjs official documentation at https://gram.js.org/beta/classes/TelegramClient.html#addEventHandler
  client.addEventHandler(handler, new NewMessage({}));

  // 必须返回处理器，需要销毁否则会重复注册，出现消息重复的情况
  // Must return the handler, needs to be destroyed to avoid duplicate registrations and repeated messages
  return {
    handler,
  };
}
