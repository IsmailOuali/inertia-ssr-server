// ✅ deepmerge-shim.mjs
// Fix for MUI SSR "isPlainObject is not a function" crash

import * as deepmergeNS from "deepmerge";
const realDeepmerge = deepmergeNS.default ?? deepmergeNS;

// Proper isPlainObject implementation
function isPlainObject(obj) {
  return (
    obj !== null &&
    typeof obj === "object" &&
    Object.prototype.toString.call(obj) === "[object Object]"
  );
}

// Create a merged export that includes both forms
const merged = Object.assign(realDeepmerge, { isPlainObject });

// ✅ Export both default and named forms (to satisfy any import style)
export default merged;
export const isPlainObjectExport = isPlainObject;
export * from "deepmerge";
