export const officialCommandHandlers = [
  async ({ event, command }) => {
    try {
      const messageFunc =
        event.message.type === "private"
          ? event.message.send.bind(event.message)
          : event.message.reply.bind(event.message);

      switch (command) {
        case "help":
          await messageFunc({
            message: `命令列表：
/help - 显示此帮助信息
/hello - 打个招呼 
/time - 显示当前时间
/myid - 显示你的用户ID`,
          });
          break;

        case "hello":
          await messageFunc({ message: `你好！👋` });
          break;

        case "time":
          const now = new Date();
          await messageFunc({
            message: `现在的时间是：${now.toLocaleString()}`,
          });
          break;

        case "myid":
          await messageFunc({
            message: `你的用户ID是：${event.message.senderId}`,
          });
          break;
      }
    } catch (error) {
      console.error("处理官方命令时出错：", error);
    }
  },
];
