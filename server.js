/**
 * RETRO PORTFOLIO SERVER
 * File: server.js
 * Version: 2.2.1
 * Purpose:
 * - Serve portfolio static files
 * - AI search endpoint (Gemini API)
 * - Health + models probe
 */

"use strict";

const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, "public");

/* =========================
   Middleware
========================= */
app.use(express.json({ limit: "1mb" }));
app.use(express.static(PUBLIC_DIR));

/* =========================
   Fetch (Node 18+ native; fallback for older)
========================= */
let fetchFn = global.fetch;
if (!fetchFn) {
  fetchFn = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));
}

/* =========================
   Gemini API (v1)
========================= */
const GEMINI_BASE_V1 = "https://generativelanguage.googleapis.com/v1";

// If you set GEMINI_MODEL in .env, we’ll try it first.
// If it fails, we auto-pick a working model via ListModels.
const DEFAULT_MODEL = (process.env.GEMINI_MODEL || "").trim();

let cachedAutoModel = null;

function requireApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    const err = new Error("Missing GEMINI_API_KEY in .env");
    err.status = 500;
    throw err;
  }
  return key;
}

function normalizeModelName(modelName) {
  return String(modelName || "").trim().replace(/^models\//, "");
}

async function listModels() {
  const key = requireApiKey();
  const url = `${GEMINI_BASE_V1}/models?key=${encodeURIComponent(key)}`;

  const res = await fetchFn(url);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.error?.message || "Failed to list models";
    const err = new Error(msg);
    err.status = res.status;
    err.details = data?.error || data;
    throw err;
  }

  return data?.models || [];
}

async function getAutoModel() {
  if (cachedAutoModel) return cachedAutoModel;

  const models = await listModels();

  const usable = models.find((m) =>
    (m.supportedGenerationMethods || []).includes("generateContent")
  );

  if (!usable?.name) {
    const err = new Error("No usable Gemini model found (generateContent not supported).");
    err.status = 500;
    throw err;
  }

  cachedAutoModel = normalizeModelName(usable.name);
  console.log("✅ Auto-selected Gemini model:", cachedAutoModel);

  return cachedAutoModel;
}

async function generateAnswer({ model, prompt }) {
  const key = requireApiKey();
  const chosen = normalizeModelName(model);

  if (!chosen) {
    const err = new Error("No model selected.");
    err.status = 500;
    throw err;
  }

  const url = `${GEMINI_BASE_V1}/models/${encodeURIComponent(
    chosen
  )}:generateContent?key=${encodeURIComponent(key)}`;

  const res = await fetchFn(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.error?.message || "Gemini API request failed";
    const err = new Error(msg);
    err.status = res.status;
    err.details = data?.error || data;
    throw err;
  }

  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text || "No answer generated."
  );
}

/* =========================
   API
========================= */
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "retro-portfolio" });
});

app.get("/api/models", async (req, res) => {
  try {
    const models = await listModels();

    // show only models that support generateContent
    const usable = models
      .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
      .map((m) => ({
        name: m.name, // "models/..."
        displayName: m.displayName,
        methods: m.supportedGenerationMethods || [],
      }));

    res.json({
      ok: true,
      usableModels: usable,
      envModel: DEFAULT_MODEL ? normalizeModelName(DEFAULT_MODEL) : null,
      autoModel: cachedAutoModel,
    });
  } catch (e) {
    res.status(e.status || 500).json({ ok: false, error: e.message });
  }
});

app.get("/api/search", (req, res) => {
  res.status(405).json({
    error: "Method Not Allowed. Use POST /api/search with JSON: { query: string }",
  });
});

app.post("/api/search", async (req, res) => {
  const query = String(req.body?.query || "").trim();
  if (!query) return res.status(400).json({ ok: false, error: "Missing query" });

  const prompt = `
You are an AI assistant for a portfolio.

ONLY answer about:
Gene Elpie Landoy

Profile:
Name: Gene Elpie Landoy
Role: Full Stack Developer

Skills:
HTML, CSS, JavaScript, Node.js, React, Tailwind

Projects:
Retro Google Portfolio, Travel Orbit Website, User Profile Backend

Rules:
- Only answer about Gene Elpie Landoy
- If unrelated say: "This search only works for Gene Elpie Landoy portfolio."

User question:
${query}

Answer:
`.trim();

  try {
    // 1) Try env model first (if set)
    if (DEFAULT_MODEL) {
      try {
        const model = normalizeModelName(DEFAULT_MODEL);
        const answer = await generateAnswer({ model, prompt });
        return res.json({ ok: true, model, answer });
      } catch (e) {
        // if env model is invalid/not found, fallback to auto model
        const msg = String(e.message || "").toLowerCase();
        const notFound = e.status === 404 || msg.includes("not found") || msg.includes("not supported");
        if (!notFound) throw e;
      }
    }

    // 2) Auto model (cached)
    const model = await getAutoModel();
    const answer = await generateAnswer({ model, prompt });
    return res.json({ ok: true, model, answer, note: "Model auto-selected via ListModels." });
  } catch (e) {
    console.error("Gemini API Error:", e.details || e);
    res.status(e.status || 500).json({
      ok: false,
      error: e.message || "Internal server error connecting to AI.",
    });
  }
});

/* =========================
   SPA fallback (MUST be last)
========================= */
app.get("*", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

/* =========================
   Start
========================= */
const server = app.listen(PORT, () => {
  console.log("Server running:");
  console.log(`http://localhost:${PORT}`);
  console.log("AI Endpoint active at: POST /api/search");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} already in use. Change PORT in .env or free the port.`);
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});