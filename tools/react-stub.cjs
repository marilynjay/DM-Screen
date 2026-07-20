let hooks = [], hi = 0;
const React = {
  createElement: (t, p, ...ch) => ({ t, p, ch }),
  Fragment: "frag",
  useState: (init) => { const i = hi++; if (!(i in hooks)) hooks[i] = typeof init === "function" ? init() : init; return [hooks[i], (v) => { hooks[i] = typeof v === "function" ? v(hooks[i]) : v; }]; },
  useEffect: () => {}, useLayoutEffect: () => {}, useMemo: (f) => f(), useCallback: (f) => f,
  useRef: (v) => { const i = hi++; if (!(i in hooks)) hooks[i] = { current: v }; return hooks[i]; },
  __reset: () => { hooks = []; hi = 0; },
  __renderTree: function walk(node, depth = 0) {
    if (depth > 60 || node == null || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach((n) => walk(n, depth + 1));
    if (typeof node.t === "function") { const sub = node.t(node.p ? { ...node.p, children: node.ch } : { children: node.ch }); walk(sub, depth + 1); }
    (node.ch || []).forEach((n) => walk(n, depth + 1));
    if (node.p) for (const k in node.p) walk(node.p[k], depth + 1);
  },
};
module.exports = React; module.exports.default = React;
for (const k of Object.keys(React)) module.exports[k] = React[k];
