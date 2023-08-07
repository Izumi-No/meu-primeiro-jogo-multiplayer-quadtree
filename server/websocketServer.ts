import {
  WebSocketClient,
  WebSocketServer as Server,
} from "https://deno.land/x/websocket@v0.1.4/mod.ts";

export class WebSocketServer {
  public wss: Server;
  sockets: Map<string, WebSocketClient> = new Map();
  public onMessage: (message: string, ws?: WebSocketClient) => void = (
    message
  ) => {
    console.log(message);
    this.broadcastSend(message);
  };
  public onConnection: (ws: WebSocketClient, id: string) => void = (ws, id) => {
    console.log("connected");
  };

  constructor(port: number) {
    const wss = new Server(port);
    this.wss = wss;
    console.log(`websocket server is running on localhost:${port}`);
    const onMessage = this.onMessage;

    const sockets = this.sockets;
    const onConnection = this.onConnection;
    /*
    wss.on("connection", function (ws: WebSocketClient) {
      const uid = globalThis.crypto.randomUUID();
      sockets.set(uid, ws);
      ws.send(JSON.stringify({ type: "uid", uid }));

      onConnection(ws, uid);
      //ws.on("message", (message) => onMessage(message, ws));

      ws.on("close", () => {
        sockets.delete(uid);
      });
    });
    */
  }

  broadcastSend(data: string) {
    this.sockets.forEach((client) => {
      client.send(data);
    });
  }

  sendToClient(clientId: string, data: string) {
    const client = this.sockets.get(clientId);
    // @ts-ignore isClosed is not in the types
    if (client && !client.isClosed()) {
      client.send(data);
    }
  }

  setOnConnection(onConnection: (ws: WebSocketClient, id: string) => void) {
    this.onConnection = onConnection;
  }

  setOnMessage(onMessage: (message: string, ws?: WebSocketClient) => void) {
    this.onMessage = onMessage;
  }
}
