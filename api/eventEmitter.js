import EventEmitter from "events";

class MessageEventEmitter extends EventEmitter {
  broadcast(eventName, data) {
    this.emit(eventName, data);
  }
}

export const messageEmitter = new MessageEventEmitter();
