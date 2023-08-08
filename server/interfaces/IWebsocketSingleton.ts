import { IWebsocket } from "./IWebsocket.ts";

export interface IWebsocketSingleton {
  broadcastSend(data: string): void;
  addSocket(uid: string, socket: IWebsocket): void;
  removeSocket(uid: string): void;
}
