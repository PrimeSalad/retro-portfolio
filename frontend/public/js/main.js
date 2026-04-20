/**
 * File: js/main.js
 * Description: Entry point for the retro-futuristic portfolio.
 */

import {
  $$,
  disableBrowserScrollRestoration, clearStartupHash, forceScrollTop,
  withSafeStorageRead,
  STORAGE_KEYS, SECTION_KEYS, DEFAULT_QUERY, STARTUP_SCROLL_RESET_ATTEMPTS, STARTUP_SCROLL_RESET_DELAY_MS
} from "./utils.js";

import { STATE, updateData } from "./state.js";
import { fetchPortfolioData } from "./api.js";
import { initializeThemeToggle } from "./theme.js";
import {
  initEntryObserver,
  mountKnowledgePanels,
  setupLightboxSwipe,
  setupEventHandlers,
  setupScrollUx,
  animateCounters,
  setTab,
  typeIntoInput
} from "./ui.js";

async function init() {
  // Initialize theme first to prevent flash of unstyled content
  initializeThemeToggle();

  // Load data
  const data = await fetchPortfolioData();
  if (data) {
    updateData(data);
  }

  // UI initialization
  initEntryObserver();
  stabilizeStartupScroll();

  mountKnowledgePanels();
  setupLightboxSwipe();
  setupEventHandlers();
  setupScrollUx();
  animateCounters();

  const savedTab = withSafeStorageRead(STORAGE_KEYS.TAB, SECTION_KEYS.ALL) || SECTION_KEYS.ALL;
  setTab(savedTab);

  $$('[data-timeline-filter]').forEach((button) => {
    const active = button.dataset.timelineFilter === "all";
    button.classList.toggle("border-gBlue", active);
    button.classList.toggle("text-white", active);
    button.classList.toggle("shadow-glow", active);
  });

  window.setTimeout(() => {
    typeIntoInput(DEFAULT_QUERY);
  }, 700);
}

function stabilizeStartupScroll() {
  disableBrowserScrollRestoration();
  clearStartupHash();
  forceScrollTop();

  let attemptCount = 0;
  const intervalId = window.setInterval(() => {
    forceScrollTop();
    attemptCount += 1;

    if (attemptCount >= STARTUP_SCROLL_RESET_ATTEMPTS) {
      window.clearInterval(intervalId);
    }
  }, STARTUP_SCROLL_RESET_DELAY_MS);

  window.addEventListener(
    "load",
    () => {
      disableBrowserScrollRestoration();
      forceScrollTop();
    },
    { once: true }
  );

  window.addEventListener(
    "pageshow",
    () => {
      disableBrowserScrollRestoration();
      forceScrollTop();
    },
    { once: true }
  );
}

// Start the app
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Modal functions
window.openHelpModal = function() {
  const modal = document.getElementById('helpModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
};

window.openFeedbackModal = function() {
  const modal = document.getElementById('feedbackModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
};

window.openPrivacyModal = function() {
  const modal = document.getElementById('privacyModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
};

window.openTermsModal = function() {
  const modal = document.getElementById('termsModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
};

// Close modals on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    ['helpModal', 'feedbackModal', 'privacyModal', 'termsModal'].forEach(modalId => {
      window.closeModal(modalId);
    });
  }
});
