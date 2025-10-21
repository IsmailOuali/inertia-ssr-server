// 👇 Must be at the very top
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";
import express from "express";

try {
  const pkg = await import('deepmerge');
  const fixed = {
    default: pkg.default || pkg,
    isPlainObject:
      pkg.isPlainObject ||
      ((obj) => Object.prototype.toString.call(obj) === '[object Object]'),
  };
  global.deepmerge = fixed.default;
  global.isPlainObject = fixed.isPlainObject;
  console.log('🔁 Patched deepmerge for MUI SSR');
} catch (e) {
  console.warn('⚠️ deepmerge patch skipped', e);
}
const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ⚡ Deepmerge override (before importing SSR)
const Module = require("module");
const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === "deepmerge") {
    console.log("🔁 Using local deepmerge-shim.mjs");
    return path.resolve(__dirname, "deepmerge-shim.mjs");
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

// ✅ Lazy-load SSR renderer
const SSR_FILE = path.join(__dirname, "ssr.mjs");
let render;

(async () => {
  try {
    const mod = await import(SSR_FILE);
    render = mod.default;
    console.log("✅ Inertia SSR loaded successfully!");
  } catch (err) {
    console.error("❌ Failed to load SSR module:", err);
  }
})();

// ✅ Express app
const app = express();
app.use(express.json({ limit: "10mb" }));

app.post("/", async (req, res) => {
  try {
    if (!render) throw new Error("SSR not ready yet");
    const html = await render(req.body.page);
    res.json(html);
  } catch (e) {
    console.error("SSR error:", e);
    res.status(500).json({ error: e.message });
  }
});

// Optional health check
app.get("/ping", (_, res) => res.send("pong"));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 SSR running on port ${PORT}`));
