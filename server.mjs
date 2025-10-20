import express from "express";
import path from "path";

const app = express();
const port = process.env.PORT || 8080; // Render/Railway uses PORT env var
const ssrFile = path.resolve("./bootstrap/ssr/ssr.mjs");

app.use(express.json());

app.post("/", async (req, res) => {
  try {
    const { default: render } = await import(`file://${ssrFile}`);
    const page = await render(req.body);
    res.send(page);
  } catch (err) {
    console.error("❌ SSR render error:", err);
    res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`✅ Inertia SSR server running on port ${port}`);
});
