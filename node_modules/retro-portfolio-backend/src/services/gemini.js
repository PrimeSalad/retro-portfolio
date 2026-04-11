const fs = require('fs');
const path = require('path');

const GEMINI_BASE_V1 = "https://generativelanguage.googleapis.com/v1";
const DEFAULT_MODEL = (process.env.GEMINI_MODEL || "").trim();

let cachedAutoModel = null;

let fetchFn = global.fetch;
if (!fetchFn) {
  fetchFn = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));
}

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

module.exports = {
  listModels,
  getAutoModel,
  generateAnswer,
  DEFAULT_MODEL,
  normalizeModelName
};