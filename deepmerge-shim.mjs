// ✅ deepmerge-shim.mjs
import realDeepmerge from "deepmerge";

export const isPlainObject = (obj) =>
  obj !== null &&
  typeof obj === "object" &&
  Object.prototype.toString.call(obj) === "[object Object]";

// Patch default export with helper
export default Object.assign(realDeepmerge, { isPlainObject });
