// ✅ Deepmerge shim for SSR (MUI-compatible, safe for Vite ESM builds)

import * as deepmergeModule from "deepmerge";

// Detect the right export — either a function or a namespace
const baseMerge =
  typeof deepmergeModule.default === "function"
    ? deepmergeModule.default
    : typeof deepmergeModule === "function"
    ? deepmergeModule
    : (a, b) => ({ ...a, ...b }); // fallback merge if deepmerge is broken

// Safe isPlainObject helper (used by MUI)
export const isPlainObject = (obj) =>
  obj !== null &&
  typeof obj === "object" &&
  Object.prototype.toString.call(obj) === "[object Object]";

// Attach the helper to the merge function (MUI expects deepmerge.isPlainObject)
baseMerge.isPlainObject = isPlainObject;

// ✅ Export as both default and named (for any import style)
export default baseMerge;
export { baseMerge as deepmerge };
