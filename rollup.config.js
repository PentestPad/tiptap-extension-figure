// rollup.config.js

const autoExternal = require("rollup-plugin-auto-external");
const commonjs = require("@rollup/plugin-commonjs");
const babel = require("@rollup/plugin-babel");
const typescript = require("rollup-plugin-typescript2");
const url = require("@rollup/plugin-url");
const postcss = require("rollup-plugin-postcss");

/** @type {import('rollup').RollupOptions} */
const config = {
  external: [/^prosemirror-/],
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.cjs.js",
      format: "cjs",
      exports: "named",
      sourcemap: true,
    },
    {
      file: "dist/index.js",
      format: "esm",
      exports: "named",
      sourcemap: true,
    },
  ],
  plugins: [
    autoExternal({ packagePath: "./package.json" }),
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
    }),
    commonjs(),
    typescript({
      useTsconfigDeclarationDir: true,
    }),
    url({
      include: ["**/*.svg"],
      limit: Infinity, // Embed all assets
    }),
    postcss({
      inject: true,
      modules: true,
      minimize: false,
    }),
  ],
};

module.exports = config;
