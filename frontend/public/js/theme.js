/**
 * File: js/theme.js
 * Description: Theme management for the portfolio.
 */

export function initializeThemeToggle() {
  "use strict";

  const STORAGE_KEY = "portfolio_theme_mode";
  const bodyElement = document.body;
  const themeButtonElement = document.getElementById("btnTheme");

  if (!bodyElement || !themeButtonElement) {
    return;
  }

  function applyTheme(themeName) {
    const normalizedTheme = themeName === "dark" ? "dark" : "light";
    const isDarkMode = normalizedTheme === "dark";

    bodyElement.setAttribute("data-theme", normalizedTheme);
    themeButtonElement.setAttribute("aria-pressed", String(isDarkMode));
  }

  function getSavedTheme() {
    try {
      const savedTheme = window.localStorage.getItem(STORAGE_KEY);
      if (savedTheme === "dark" || savedTheme === "light") {
        return savedTheme;
      }
    } catch {
      // Ignore storage errors.
    }

    return "";
  }

  function getSystemTheme() {
    try {
      return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
    } catch {
      return "light";
    }
  }

  function getInitialTheme() {
    const savedTheme = getSavedTheme();
    return savedTheme || getSystemTheme();
  }

  function toggleTheme() {
    const currentTheme = bodyElement.getAttribute("data-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    applyTheme(nextTheme);

    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // Ignore storage errors.
    }
  }

  applyTheme(getInitialTheme());
  themeButtonElement.addEventListener("click", toggleTheme);

  try {
    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    mediaQuery?.addEventListener?.("change", () => {
      const savedTheme = getSavedTheme();
      if (savedTheme) {
        return;
      }
      applyTheme(getSystemTheme());
    });
  } catch {
    // Ignore media query listener errors.
  }
}
