import { Game } from "../public/game.ts";
import { HttpServer } from "./httpServer.ts";

const env = Deno.env.toObject();

const game = new Game();

game.start();

new HttpServer(Number(env.PORT) || 8080, game);
