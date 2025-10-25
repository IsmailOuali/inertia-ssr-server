import express from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json({ limit: "10mb" }));

// Point to your actual SSR source file
const ssrFile = path.resolve("./bootstrap/ssr/ssr.mjs");

app.post("/", async (req, res) => {
  try {
    // Reload fresh SSR module to avoid stale cache
    const { default: render } = await import(ssrFile + `?t=${Date.now()}`);

    const html = await render(req.body.page);

    // Wrap raw HTML in { head, body }
    res.json({ head: [], body: html });
  } catch (error) {
    console.error("❌ SSR failed:", error);
    res.status(500).json({ error: "SSR render failed", message: error.message });
  }
});

app.get("/", (req, res) => {
  res.json({ status: "OK", message: "SSR server running" });
});

app.listen(PORT, () => console.log(`🚀 SSR running on port ${PORT}`));
