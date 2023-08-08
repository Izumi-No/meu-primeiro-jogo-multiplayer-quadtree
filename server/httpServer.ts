import { Application, send } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { Game } from "../public/game.ts";
import { IAnyCommand } from "../shared/interfaces/Command.ts";

export class HttpServer {
  constructor(
    port: number,
    game: Game,
    private sockets = new Map<string, WebSocket>()
  ) {
    const app = new Application();

    function broadcastSend(data: string) {
      sockets.forEach((client) => {
        client.send(data);
      });
    }

    game.subscribe((command) => {
      broadcastSend(JSON.stringify(command));
    });

    app.use(async (ctx) => {
      if (ctx.request.url.pathname === "/") {
        return send(ctx, ctx.request.url.pathname, {
          root: "./dist",
          index: "index.html",
        });
      }

      if (ctx.request.url.pathname === "/wss") {
        if (!ctx.isUpgradable) ctx.throw(400);

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

        return;
      }

      const filePath = ctx.request.url.pathname.replace("/dist", "");
      console.log(filePath);
      await send(ctx, filePath, {
        root: "./dist",
      });
    });

    app.addEventListener("listen", ({ hostname, port, secure }) => {
      console.log(
        `Listening on: ${secure ? "https://" : "http://"}${
          hostname ?? "localhost"
        }:${port}`
      );
    });

    app.addEventListener("error", (evt) => {
      console.log(evt.error);
    });

    app.listen({ hostname: "0.0.0.0", port });
  }
}

/*
function broadcastSend(data: string) {
  sockets.forEach((client) => {
    client.send(data);
  });
}

game.subscribe((command) => {
  broadcastSend(JSON.stringify(command));
});

wsServer.on("connection", function (ws: WebSocketClient) {
  const uid = globalThis.crypto.randomUUID();
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

  sockets.set(uid, ws);
  game.addPlayer({ type: "add-player", playerId: uid });
  ws.on("message", (message) => {
    const data: IAnyCommand = JSON.parse(message);

    if (data.type === "move-player") {
      console.log(`Receiving ${data.type} -> ${data.playerId}`);

      game.movePlayer(data);
    }

    broadcastSend(message);
  });

  ws.on("close", () => {
    if (!sockets.has(uid)) {
      return;
    }

    sockets.delete(uid);
    game.removePlayer({ type: "remove-player", playerId: uid });
    console.log(`Player disconnected: ${uid}`);
    sockets.delete(uid);
  });

  sockets.set(uid, ws);
});

*/
