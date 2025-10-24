// server.mjs
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// ───────────────────────────────────────────────
// ✅ Deepmerge patch for MUI / Emotion SSR issues
// ───────────────────────────────────────────────
try {
  const deepmergePkg = await import("deepmerge");
  const deepmergeShim = {
    default: deepmergePkg.default || deepmergePkg,
    isPlainObject:
      deepmergePkg.isPlainObject ||
      ((obj) => Object.prototype.toString.call(obj) === "[object Object]"),
  };

  global.deepmerge = deepmergeShim.default;
  global.isPlainObject = deepmergeShim.isPlainObject;

  console.log("🔁 Patched deepmerge for MUI SSR (inline shim active)");
} catch (e) {
  console.warn("⚠️ deepmerge patch skipped:", e);
}

// ───────────────────────────────────────────────
// ✅ Express server setup for SSR requests
// ───────────────────────────────────────────────
const ssrFile = path.resolve("./ssr.mjs");

// Middleware
app.use(express.json({ limit: "10mb" }));

// Main SSR endpoint
app.post("/", async (req, res) => {
  try {
    // 🔁 Always reload fresh SSR bundle to avoid stale cache
    const { default: render } = await import(ssrFile + `?t=${Date.now()}`);

    const result = await render(req.body.page);

    // If your render() already returns { head, body }, keep it.
    // If it returns raw HTML, wrap it manually.
    const payload =
      typeof result === "object" && result.body
        ? result
        : { head: [], body: result };

    res.json(payload);
  } catch (error) {
    console.error("❌ Failed to load SSR module:", error);
    res.status(500).json({
      error: "SSR render failed",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Simple GET route to test if SSR server is up
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "Inertia SSR server running" });
});

// ───────────────────────────────────────────────
// ✅ Start server
// ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 SSR running on port ${PORT}`);
});
