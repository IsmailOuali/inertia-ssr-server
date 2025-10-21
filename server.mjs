import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SSR_FILE = path.join(__dirname, "ssr.mjs");

let render;
(async () => {
  const mod = await import(SSR_FILE);
  render = mod.default;
  console.log("✅ Inertia SSR loaded!");
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
