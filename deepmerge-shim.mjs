// ✅ SSR-safe Deepmerge shim for MUI
// Fixes: "TypeError: (0, _deepmerge.isPlainObject) is not a function"

import deepmerge from "deepmerge";

// True "isPlainObject" check
export const isPlainObject = (obj) =>
  obj !== null &&
  typeof obj === "object" &&
  Object.prototype.toString.call(obj) === "[object Object]";

// Attach helper to the default export (MUI expects deepmerge.isPlainObject)
export default Object.assign(deepmerge, { isPlainObject });
