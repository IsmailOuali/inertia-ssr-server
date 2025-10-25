import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json({ limit: "10mb" }));

// ✅ Absolute path to SSR source
const ssrFile = path.resolve(__dirname, "./bootstrap/ssr/ssr.mjs");

app.post("/", async (req, res) => {
  try {
    // Reload fresh SSR module to avoid stale cache
    const { default: render } = await import(ssrFile + `?t=${Date.now()}`);

    const html = await render(req.body.page);

    // Wrap raw HTML in { head, body }
    res.json({ head: [], body: html });
  } catch (error) {
    console.error("❌ SSR failed:", error);
    res.status(500).json({
      error: "SSR render failed",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

app.get("/", (req, res) => {
  res.json({ status: "OK", message: "SSR server running" });
});

app.listen(PORT, () => console.log(`🚀 SSR running on port ${PORT}`));
