import { terser } from "rollup-plugin-terser";
import del from "rollup-plugin-delete";
import html2 from "rollup-plugin-html2";

import replace from "@rollup/plugin-replace";
import progress from "rollup-plugin-progress";
import resolve from "@rollup/plugin-node-resolve";
import { swc } from "rollup-plugin-swc3";
import jscc from "rollup-plugin-jscc";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "public/index.ts",
  output: {
    sourcemap: true,
    file: "dist/bundle.js",
    format: "iife",

    entryFileNames: "bundle.[hash].js",
    chunkFileNames: "chunk.[hash].js",
  },
  plugins: [
    html2({ template: "public/index.html" }),
    swc({
      sourceMaps: true,
      tsconfig: "tsconfig.json",
      jsc: {
        parser: {
          syntax: "typescript",
        },
        target: "es2016",
      },
    }),
    replace({
      values: {
        "process.env.WEBSOCKET_PORT": process.env.WS_PORT || undefined,
        "process.env.SIZE_OF_GAME": process.env.SIZE_OF_GAME || undefined,
        "process.env.isProduction": production || false,
      },
    }),
    jscc({ values: { _BROWSER: true } }),
    resolve({ extensions: [".ts", ".tsx"] }),
    del({ targets: "dist/*" }),
    progress({ clearLine: true }),
    production &&
      terser({
        output: { comments: false },
        mangle: {
          toplevel: true,
          properties: {
            regex: /^_\w/,
          },
        },
      }),
  ],
};
