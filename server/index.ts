import {
  Application,
  Router,
  send,
} from "https://deno.land/x/oak@v12.6.0/mod.ts";
import { Game } from "../public/game.ts";
import { websocketSingleton } from "./webSocketSingleton.ts";
import { IAnyCommand } from "../shared/interfaces/Command.ts";
import { wsAdapt } from "./adapters/WebsocketAdapter.ts";

const env = Deno.env.toObject();

const game = new Game();

game.start();

const app = new Application();
const router = new Router();

game.subscribe((command) => {
  websocketSingleton.broadcastSend(JSON.stringify(command));
});

router.get("/", (ctx) => {
  return send(ctx, ctx.request.url.pathname, {
    root: "./dist",
    index: "index.html",
  });
});

router.get("/:path", (ctx, next) => {
  if (ctx.request.url.pathname.includes("wss")) {
    return next();
  }
  const filePath = ctx.params.path;

  console.log(filePath);
  return send(ctx, filePath, {
    root: "./dist",
  });
});

router.get("/wss", (ctx) => {
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

    websocketSingleton.sockets.set(uid, wsAdapt(ws));

    game.addPlayer({ type: "add-player", playerId: uid });

    ws.addEventListener("message", (message: MessageEvent) => {
      const data: IAnyCommand = JSON.parse(message.data);

      if (data.type === "move-player") {
        console.log(`Receiving ${data.type} -> ${data.playerId}`);

        game.movePlayer(data);
      }

      websocketSingleton.broadcastSend(message.data);
    });
  });

  ws.onclose = () => {
    if (!websocketSingleton.sockets.has(uid)) {
      return;
    }

    websocketSingleton.sockets.delete(uid);
    game.removePlayer({ type: "remove-player", playerId: uid });
    console.log(`Player disconnected: ${uid}`);
    websocketSingleton.sockets.delete(uid);
  };
});

app.use(router.routes());
app.use(router.allowedMethods());

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

app.listen({ port: Number(env.PORT || 8000) });
