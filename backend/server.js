/**
 * RETRO PORTFOLIO SERVER
 * File: server.js
 * Version: 3.0.0
 * Purpose:
 * - Serve portfolio static files
 * - Mount API routes
 */

"use strict";

const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const apiRoutes = require('./src/routes/api');

const app = express();

const PORT = Number(process.env.PORT || 3000);
const FRONTEND_URL = process.env.FRONTEND_URL;
const PUBLIC_DIR = path.join(__dirname, "../frontend/public");

/* =========================
   Middleware
========================= */
app.use(cors({
  origin: FRONTEND_URL ? FRONTEND_URL.split(',') : "*",
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.static(PUBLIC_DIR));

/* =========================
   API Routes
========================= */
app.use('/api', apiRoutes);

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
  console.log("API Endpoints active at: /api");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} already in use. Change PORT in .env or free the port.`);
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});
