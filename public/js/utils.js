/**
 * File: js/utils.js
 * Description: Generic helpers and constants for the portfolio.
 */

/* =========================
   Constants
========================= */
export const TOAST_DURATION_MS = 1600;
export const PROJECT_TECH_LIMIT = 4;
export const GALLERY_TECH_LIMIT = 3;
export const STARTUP_SCROLL_RESET_ATTEMPTS = 2;
export const STARTUP_SCROLL_RESET_DELAY_MS = 120;
export const PREVIEW_ITEM_LIMIT = 6;
export const PROJECTS_PER_PAGE = 4;
export const ANIMATION_STAGGER_MS = 45;

export const STORAGE_KEYS = {
  TAB: "retro_portfolio_tab",
  SAVED: "retro_portfolio_saved_searches",
};

export const SECTION_KEYS = {
  IMAGES: "images",
  PROJECTS: "projects",
  TIMELINE: "timeline",
  CERTIFICATES: "certificates",
  ACHIEVEMENTS: "achievements",
  GALLERY: "gallery",
  ABOUT: "about",
  ALL: "all",
};

export const AI = {
  SEARCH_ENDPOINT: "/api/search",
  HEALTH_ENDPOINT: "/api/health",
  TIMEOUT_MS: 14000,
  HEALTH_TIMEOUT_MS: 2500,
};

export const DEFAULT_QUERY = "querying portfolio: Gene Elpie Landoy.";

/* =========================
   DOM helpers
========================= */
export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/* =========================
   Generic helpers
========================= */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function shuffle(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
}

export function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function promiseTimeout(milliseconds) {
  return new Promise((_, reject) => {
    window.setTimeout(() => reject(new Error("Request timed out.")), milliseconds);
  });
}

export function disableBrowserScrollRestoration() {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }
}

export function forceScrollTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export function clearStartupHash() {
  if (!window.location.hash || window.location.hash === "#top") {
    return;
  }

  const cleanUrl = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", cleanUrl);
}

export function withSafeStorageRead(key, fallbackValue = "") {
  try {
    return window.localStorage.getItem(key) ?? fallbackValue;
  } catch {
    return fallbackValue;
  }
}

export function withSafeStorageWrite(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors.
  }
}

export function toast(message) {
  const toastRoot = $("#toast");
  const toastText = $("#toastText");

  if (!toastRoot || !toastText) {
    return;
  }

  toastText.textContent = message;
  toastRoot.classList.remove("hidden");

  window.clearTimeout(window.__toast_timer__);
  window.__toast_timer__ = window.setTimeout(() => {
    toastRoot.classList.add("hidden");
  }, TOAST_DURATION_MS);
}

export function scrollToEl(selector) {
  const element = $(selector);
  if (!element) {
    return;
  }

  element.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function openFlexModal(selector) {
  const modal = $(selector);
  if (!modal) {
    return;
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
}

export function closeFlexModal(selector) {
  const modal = $(selector);
  if (!modal) {
    return;
  }

  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.style.overflow = "";
}

export function copyToClipboard(text, successMessage = "Copied") {
  navigator.clipboard
    .writeText(text)
    .then(() => toast(successMessage))
    .catch(() => toast("Copy failed"));
}

export function ensureSiblingMount(baseElement, id) {
  if (!baseElement || !baseElement.parentElement) {
    return null;
  }

  let mount = document.getElementById(id);
  if (!mount) {
    mount = document.createElement("div");
    mount.id = id;
    baseElement.insertAdjacentElement("afterend", mount);
  }

  return mount;
}
