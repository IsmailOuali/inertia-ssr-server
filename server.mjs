import express from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json({ limit: "10mb" }));

// Dynamically resolve SSR file (root folder)
const ssrFile = path.resolve("./ssr.mjs");

app.post("/", async (req, res) => {
  try {
    // Always reload SSR module to avoid stale cache
    const mod = await import(ssrFile + `?t=${Date.now()}`);

    // ⚡ Detect default export or named export
    const render =
      typeof mod.default === "function"
        ? mod.default
        : typeof mod.render === "function"
        ? mod.render
        : null;

    if (!render) {
      throw new Error(
        `SSR module does not export a render function. Found exports: ${Object.keys(
          mod
        ).join(", ")}`
      );
    }

    const html = await render(req.body.page);

    res.json({ head: [], body: html });
  } catch (error) {
    console.error("❌ SSR failed:", error);
    res.status(500).json({ error: "SSR render failed", message: error.message });
  }
});

app.get("/", (req, res) => {
  res.json({ status: "OK", message: "SSR server running" });
});

app.listen(PORT, () =>
  console.log(`🚀 SSR server running on port ${PORT}`)
);
