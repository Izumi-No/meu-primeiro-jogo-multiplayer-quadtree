import { IWebsocket } from "../interfaces/IWebsocket.ts";

export function wsAdapt(ws: WebSocket): IWebsocket<keyof WebSocketEventMap> {
  return {
    send: (data: string) => ws.send(data),
    onOpen: (callback: () => void) => ws.addEventListener("open", callback),
    onClose: (callback: () => void) => ws.addEventListener("close", callback),
    onMessage: (callback: (data: string) => void) =>
      ws.addEventListener("message", (message: MessageEvent) =>
        callback(message.data)
      ),

    addEventListener: (event, callback: () => void) =>
      ws.addEventListener(event, callback),
  };
}
