const sockets = new Map<string, WebSocketClient>();
import { Game } from "../public/game.ts";
import { IAnyCommand } from "../shared/interfaces/Command.ts";
import { HttpServer } from "./httpServer.ts";
import {
  WebSocketClient,
  WebSocketServer as Server,
} from "https://deno.land/x/websocket@v0.1.4/mod.ts";

const env = Deno.env.toObject();

new HttpServer(Number(env.PORT) || 8080);
const game = new Game();
const wsServer = new Server(Number(env.WEBSOCKET_PORT) || 8081);

game.start();

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
