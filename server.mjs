import express from "express";
import path from "path";
import { renderToString } from "react-dom/server";
import React from "react";
import { createInertiaApp } from "@inertiajs/react";
import pretty from "pretty";

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json({ limit: "10mb" }));

// Dynamically load your SSR entry
const ssrFile = path.resolve("./dist/ssr/ssr.mjs");

app.post("/", async (req, res) => {
  try {
    const { default: render } = await import(ssrFile + `?t=${Date.now()}`);
    const html = await render(req.body.page);
    res.json({ head: [], body: html });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "SSR render failed", message: e.message });
  }
});

app.get("/", (req, res) => {
  res.json({ status: "OK", message: "SSR server running" });
});

app.listen(PORT, () => {
  console.log(`🚀 SSR running on port ${PORT}`);
});
