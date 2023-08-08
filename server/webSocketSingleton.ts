import { IWebsocket } from "./interfaces/IWebsocket.ts";
import { IWebsocketSingleton } from "./interfaces/IWebsocketSingleton.ts";

class WebSocketSingleton implements IWebsocketSingleton {
  private static instance: WebSocketSingleton;

  public sockets = new Map<string, IWebsocket>();

  private constructor() {}

  public broadcastSend(data: string) {
    this.sockets.forEach((client) => {
      client.send(data);
    });
  }

  /*
  public subscribe(callback: (data: string) => void) {
    this.sockets.forEach((client) => {
      client.onMessage(callback);
    });
  }
*/
  public addSocket(uid: string, socket: IWebsocket) {
    this.sockets.set(uid, socket);
  }

  public removeSocket(uid: string) {
    this.sockets.delete(uid);
  }

  public static getInstance(): WebSocketSingleton {
    if (!WebSocketSingleton.instance) {
      WebSocketSingleton.instance = new WebSocketSingleton();
    }

    return WebSocketSingleton.instance;
  }
}

export const websocketSingleton = WebSocketSingleton.getInstance();

/*


      console.log("Upgrading to WebSocket");
      if (!ctx.isUpgradable) return ctx.throw(400);

      const ws = ctx.upgrade();
      const uid = globalThis.crypto.randomUUID();

      ws.addEventListener("open", () => {
        ws.send(JSON.stringify({ type: "uid", uid }));

        ws.send(
          JSON.stringify({
            type: "setup",
            state: {
              screen: game.state.screen,
              maxObjects: game.state.quadtree.capacity,
              points: game.state.quadtree.getAllPoints(),
            },
          })
        );

        this.sockets.set(uid, ws);

        game.addPlayer({ type: "add-player", playerId: uid });

        ws.addEventListener("message", (message: MessageEvent) => {
          const data: IAnyCommand = JSON.parse(message.data);

          if (data.type === "move-player") {
            console.log(`Receiving ${data.type} -> ${data.playerId}`);

            game.movePlayer(data);
          }

          broadcastSend(message.data);
        });
      });

      ws.onclose = () => {
        if (!this.sockets.has(uid)) {
          return;
        }

        this.sockets.delete(uid);
        game.removePlayer({ type: "remove-player", playerId: uid });
        console.log(`Player disconnected: ${uid}`);
        this.sockets.delete(uid);
      };
*/
