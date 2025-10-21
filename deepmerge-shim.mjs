// ✅ SSR-safe deepmerge shim for MUI
import deepmerge from 'deepmerge'

// Add a missing helper expected by MUI
export const isPlainObject = (obj) =>
  obj !== null && typeof obj === 'object' && !Array.isArray(obj)

// Patch default export with this helper
export default Object.assign(deepmerge, { isPlainObject })
