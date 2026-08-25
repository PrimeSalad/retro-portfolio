const fs = require('fs');
const path = require('path');

const GEMINI_BASE_V1 = "https://generativelanguage.googleapis.com/v1";
const DEFAULT_MODEL = (process.env.GEMINI_MODEL || "").trim();
const REQUEST_TIMEOUT_MS = Math.max(5000, Number(process.env.GEMINI_TIMEOUT_MS || 11000));
const PREFERRED_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
];
const RETRIABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

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

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function requestJson(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchFn(url, { ...options, signal: controller.signal });
    const data = await response.json().catch(() => ({}));
    return { response, data };
  } catch (error) {
    if (error?.name === "AbortError") {
      const timeoutError = new Error("Gemini took too long to respond. Please try again.");
      timeoutError.status = 504;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function listModels() {
  const key = requireApiKey();
  const url = `${GEMINI_BASE_V1}/models?key=${encodeURIComponent(key)}`;

  const { response: res, data } = await requestJson(url, {}, 8000);

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

  const usableModels = models.filter((model) =>
    (model.supportedGenerationMethods || []).includes("generateContent")
  );
  const usable = PREFERRED_MODELS
    .map((preferred) => usableModels.find((model) => normalizeModelName(model.name) === preferred))
    .find(Boolean) || usableModels[0];

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

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 420,
      },
    }),
  };

  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const { response: res, data } = await requestJson(url, requestOptions);
      if (res.ok) {
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No answer generated.";
      }

      const err = new Error(data?.error?.message || "Gemini API request failed");
      err.status = res.status;
      err.details = data?.error || data;
      throw err;
    } catch (error) {
      lastError = error;
      const canRetry = RETRIABLE_STATUSES.has(Number(error?.status));
      if (!canRetry || attempt === 1) throw error;
      await delay(400 * (attempt + 1));
    }
  }

  throw lastError;
}

module.exports = {
  listModels,
  getAutoModel,
  generateAnswer,
  DEFAULT_MODEL,
  normalizeModelName
};
