import { Application, send } from "https://deno.land/x/oak@v12.6.0/mod.ts";

export class HttpServer {
  constructor(port: number) {
    const app = new Application();

    app.use(async (ctx) => {
      if (ctx.request.url.pathname === "/") {
        await send(ctx, ctx.request.url.pathname, {
          root: "./dist",
          index: "index.html",
        });
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

    app.listen({ port });
  }
}
