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
    const renderFunction = mod.render || mod.default?.render;

    if (!renderFunction) {
      throw new Error(
        `SSR module does not export a render function. Found exports: ${Object.keys(
          mod
        ).join(", ")}`
      );
    }

    const result = await renderFunction(req.body.page);

    // Handle both string and object responses
    let head = [];
    let body = '';
    
    if (typeof result === 'object' && result.head && result.body) {
      head = result.head;
      body = result.body;
    } else {
      body = result;
    }

    res.json({ head, body });
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