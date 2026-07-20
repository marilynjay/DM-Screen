/* Smoke test: transpile src/app.jsx with tsc, evaluate it with a stub React,
   and walk the full initial render. Catches syntax errors, duplicate
   declarations, and render-time crashes that a type-check alone misses.
   Usage:  npx tsc src/app.jsx --allowJs --checkJs false --jsx react --target es2022 \
             --module commonjs --outDir /tmp/smoke-out --skipLibCheck
           node tools/run-smoke.cjs /tmp/smoke-out/app.js                     */
const fs = require("fs");
const path = process.argv[2];
if (!path) { console.error("usage: node tools/run-smoke.cjs <transpiled app.js>"); process.exit(2); }
const React = require("./react-stub.cjs");
global.React = React;
global.require = (m) => (m === "react" ? React : require(m));
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {}, key: () => null, length: 0 };
global.window = { storage: null, addEventListener: () => {}, removeEventListener: () => {} };
global.document = { addEventListener: () => {}, removeEventListener: () => {} };
global.navigator = { userAgent: "smoke" };
let js = fs.readFileSync(path, "utf8");
js = js.replace(/^"use strict";[\s\S]*?exports\.default[^\n]*\n?/m, (s) => s); // tolerate commonjs preamble
global.exports = {}; global.module = { exports: {} };
try { (0, eval)(js); console.log("MODULE EVAL: OK"); }
catch (e) { console.log("MODULE EVAL FAILED:", e.message); process.exit(1); }
const App = (global.module.exports && (global.module.exports.default || global.module.exports.App)) || global.exports.default;
try { React.__reset(); React.__renderTree(App({})); console.log("INITIAL RENDER: OK"); }
catch (e) { console.log("RENDER FAILED:", e.message); process.exit(1); }
