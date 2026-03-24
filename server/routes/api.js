const express = require('express');
const fs = require('fs');
const path = require('path');
const { listModels, getAutoModel, generateAnswer, DEFAULT_MODEL, normalizeModelName } = require('../services/gemini');

const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../data/portfolio.json');

router.get('/health', (req, res) => {
  res.json({ ok: true, service: "retro-portfolio" });
});

router.get('/data', (req, res) => {
  try {
    const data = fs.readFileSync(DATA_PATH, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: "Failed to read portfolio data" });
  }
});

router.get('/models', async (req, res) => {
  try {
    const models = await listModels();
    const usable = models
      .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
      .map((m) => ({
        name: m.name,
        displayName: m.displayName,
        methods: m.supportedGenerationMethods || [],
      }));

    res.json({
      ok: true,
      usableModels: usable,
      envModel: DEFAULT_MODEL ? normalizeModelName(DEFAULT_MODEL) : null,
      autoModel: await getAutoModel().catch(() => null),
    });
  } catch (e) {
    res.status(e.status || 500).json({ ok: false, error: e.message });
  }
});

router.post('/search', async (req, res) => {
  const query = String(req.body?.query || "").trim();
  if (!query) return res.status(400).json({ ok: false, error: "Missing query" });

  let portfolioDataStr = "{}";
  try {
      portfolioDataStr = fs.readFileSync(DATA_PATH, 'utf8');
  } catch (e) {
      console.warn("Could not read portfolio.json for prompt context");
  }

  const prompt = `
You are an AI assistant for a portfolio.
ONLY answer about:
Gene Elpie L. Landoy
Profile:
Name: Gene Elpie Landoy
Role: Full Stack Developer

Portfolio Data Context:
${portfolioDataStr}

Rules:
- Only answer about Gene Elpie Landoy based on the provided Portfolio Data Context.
- If unrelated say: "This search only works for Gene Elpie Landoy portfolio."
- Keep your answers concise, informative, and formatted cleanly.

User question:
${query}

Answer:
`.trim();

  try {
    if (DEFAULT_MODEL) {
      try {
        const model = normalizeModelName(DEFAULT_MODEL);
        const answer = await generateAnswer({ model, prompt });
        return res.json({ ok: true, model, answer });
      } catch (e) {
        const msg = String(e.message || "").toLowerCase();
        const notFound = e.status === 404 || msg.includes("not found") || msg.includes("not supported");
        if (!notFound) throw e;
      }
    }

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

module.exports = router;