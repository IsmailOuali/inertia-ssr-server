// 👇 MUST be first — before express, before anything
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ⚡ Deepmerge override (fixes MUI SSR crash)
const Module = require("module");
const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === "deepmerge") {
    console.log("🔁 Using deepmerge-shim.mjs instead of node_modules");
    return path.resolve(__dirname, "deepmerge-shim.mjs");
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

// ✅ Now import express AFTER the override
import express from "express";

const SSR_FILE = path.join(__dirname, "ssr.mjs");

let render;
(async () => {
  try {
    const mod = await import(SSR_FILE);
    render = mod.default;
    console.log("✅ Inertia SSR loaded!");
  } catch (err) {
    console.error("❌ Failed to load SSR module:", err);
  }
})();

const app = express();
app.use(express.json({ limit: "10mb" }));

app.post("/", async (req, res) => {
  try {
    if (!render) throw new Error("SSR not ready");
    const html = await render(req.body.page);
    res.json(html);
  } catch (e) {
    console.error("SSR error:", e);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 SSR running on port ${PORT}`));
