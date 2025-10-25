import express from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT || 8080;
const ssrFile = path.resolve("./ssr.mjs");

app.use(express.json({ limit: "10mb" }));

app.post("/", async (req, res) => {
  try {
    const mod = await import(ssrFile + `?t=${Date.now()}`);
    const renderFunction = mod.render || mod.default?.render;

    if (!renderFunction) throw new Error("SSR module does not export 'render'");

    const { head, body } = await renderFunction(req.body.page);
    res.json({ head, body });
  } catch (error) {
    console.error("❌ SSR failed:", error);
    res.status(500).json({ error: "SSR render failed", message: error.message });
  }
});

app.get("/", (_, res) => res.json({ status: "OK", message: "SSR server running" }));

app.listen(PORT, () => console.log(`🚀 SSR server running on port ${PORT}`));
