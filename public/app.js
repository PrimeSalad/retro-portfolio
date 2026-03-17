/**
 * File: app.js
 * Description: Interactivity for the retro-futuristic portfolio.
 * Handles AI search, tabs, image lightbox, premium project cards,
 * verified certificate image preview modal, timeline filters,
 * saved searches, command palette, and contact form.
 * Version: 3.1.0
 */


/*
 * File: app.js
 * Description: Theme toggle extension for preserved portfolio logic.
 * Version: 1.1.0
 */

(function initializeThemeToggle() {
  "use strict";

  const STORAGE_KEY = "portfolio_theme_mode";
  const bodyElement = document.body;
  const themeButtonElement = document.getElementById("btnTheme");
  const themeLabelElement = document.getElementById("themeLabel");
  const themeIconElement = document.getElementById("themeIcon");

  if (!bodyElement || !themeButtonElement || !themeLabelElement) {
    return;
  }

  /**
   * Apply theme mode to document.
   * @param {string} themeName
   * @returns {void}
   */
  function applyTheme(themeName) {
    const normalizedTheme = themeName === "dark" ? "dark" : "light";
    const isDarkMode = normalizedTheme === "dark";

    bodyElement.setAttribute("data-theme", normalizedTheme);
    themeButtonElement.setAttribute("aria-pressed", String(isDarkMode));
    themeLabelElement.textContent = isDarkMode ? "Light mode" : "Dark mode";

    if (themeIconElement) {
      themeIconElement.textContent = isDarkMode ? "☀️" : "🌙";
    }
  }

  /**
   * Get saved theme from localStorage.
   * @returns {string}
   */
  function getSavedTheme() {
    const savedTheme = window.localStorage.getItem(STORAGE_KEY);

    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }

    return "";
  }

  /**
   * Get default theme from OS preference.
   * @returns {"light" | "dark"}
   */
  function getSystemTheme() {
    try {
      return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
    } catch {
      return "light";
    }
  }

  function getInitialTheme() {
    const saved = getSavedTheme();
    if (saved === "dark" || saved === "light") return saved;
    return getSystemTheme();
  }

  /**
   * Toggle theme mode.
   * @returns {void}
   */
  function toggleTheme() {
    const currentTheme = bodyElement.getAttribute("data-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    applyTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  }

  applyTheme(getInitialTheme());
  themeButtonElement.addEventListener("click", toggleTheme);

  try {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    media?.addEventListener?.("change", () => {
      const saved = getSavedTheme();
      if (saved === "dark" || saved === "light") return;
      applyTheme(getSystemTheme());
    });
  } catch {
    // ignore
  }
})();
/* =========================
   Constants
========================= */
const TOAST_DURATION_MS = 1600;
const PROJECT_TECH_LIMIT = 4;
const GALLERY_TECH_LIMIT = 3;
const STARTUP_SCROLL_RESET_ATTEMPTS = 6;
const STARTUP_SCROLL_RESET_DELAY_MS = 120;

const STORAGE_KEYS = {
  TAB: "retro_portfolio_tab",
  SAVED: "retro_portfolio_saved_searches",
};

const AI = {
  SEARCH_ENDPOINT: "/api/search",
  HEALTH_ENDPOINT: "/api/health",
  TIMEOUT_MS: 14000,
  HEALTH_TIMEOUT_MS: 2500,
};

/* =========================
   DOM helpers
========================= */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/* =========================
   Demo content
========================= */
const IMAGE_ITEMS = [
  {
    title: "ICITE2025: International Conference on Information Technology Education",
    src: "images/events/icite.jpg",
    alt: "conference stage with speakers and audience",
    tag: "conference",
  },
  {
    title: "DICT — Hack for Gov 3",
    src: "images/events/hag2.jpg",
    alt: "hackathon with participants collaborating",
    tag: "hackathon",
  },
  {
    title: "DICT — Hack for Gov 4",
    src: "images/events/hag.jpg",
    alt: "hackathon with participants collaborating",
    tag: "hackathon",
  },
  {
    title: "CICS — Internship Onboarding",
    src: "images/events/event1.jpg",
    alt: "internship onboarding event",
    tag: "event",
  },
  {
    title: "Infocus Publication and Broadcasting Team — Recognition",
    src: "images/events/recog.jpg",
    alt: "recognition event with team members on stage",
    tag: "recognition",
  },
  {
    title: "Infocus Publication and Broadcasting Team — Accreditation",
    src: "images/events/infocus 1.jpg",
    alt: "accreditation event",
    tag: "accreditation",
  },
];

const PROJECTS = [
  {
    id: "p1",
    title: "salitAI.orbit",
    year: 2026,
    category: "Speech to Text AI Assistant",
    role: "Developer + Designer",
    impact: "AI takes the notes so the whole team can focus on the actual meeting.",
    outcome: "Task ownership and deadlines are extracted automatically from meeting content.",
    description:
      "salitAI.orbit captures spoken discussion, transforms it into structured notes, and highlights assigned action items with due dates so that teams leave every meeting with clarity.",
    image: "images/projects/salitai.jpg",
    tech: ["React", "TypeScript", "Tailwind", "Gemini API"],
    demo: "https://salit-ai-orbit.space/",
    repo: "https://github.com",
    score: 95,
    highlights: [
      "Designed a cleaner meeting-to-action workflow instead of raw transcript dumping.",
      "Focused on usability so non-technical users can immediately understand outputs.",
      "Structured result cards for owners, tasks, and deadlines for stronger accountability.",
    ],
    status: "live",
  },
  {
    id: "p2",
    title: "Plastech",
    year: 2026,
    category: "AI Model",
    role: "AI Model Developer",
    impact: "Turns plastic waste into connectivity value for communities.",
    outcome: "Recycling becomes directly useful through incentive-based digital access.",
    description:
      "PlasTech transforms recycled plastic into innovative WiFi-linked community solutions, combining sustainability and applied AI to connect environmental action with practical digital benefit.",
    image: "images/projects/plastech.jpg",
    tech: ["Python", "TensorFlow", "Computer Vision"],
    demo: "#",
    repo: "https://github.com",
    score: 88,
    highlights: [
      "Connects sustainability, behavior change, and digital inclusion in one concept.",
      "Designed for social impact, not just technical novelty.",
      "Strong storytelling potential for competitions and presentations.",
    ],
    status: "concept",
  },
  {
    id: "p3",
    title: "SHAPE: Speech, Hearing, Autism Personalized Education",
    year: 2025,
    category: "Mobile Application",
    role: "Project Manager + Frontend Developer + Game Developer",
    impact: "Makes learning more accessible for students with special needs.",
    outcome: "Interactive education delivery becomes more adaptive and engaging.",
    description:
      "SHAPE is a mobile learning application designed for learners with autism and hearing challenges, using tailored content and game-like interactions to improve classroom support and communication.",
    image: "images/projects/shape.jpg",
    tech: ["Flutter", "Dart", "Firebase"],
    demo: "#",
    repo: "https://github.com",
    score: 84,
    highlights: [
      "Focused on accessible interaction design for real learner needs.",
      "Used game elements to support engagement and retention.",
      "Balanced product planning, implementation, and presentation quality.",
    ],
    status: "prototype",
  },
  {
    id: "p4",
    title: "Travel Orbit",
    year: 2026,
    category: "Web Application",
    role: "Frontend Developer + UX Designer + Project Manager",
    impact: "Delivers a smoother ticketing and planning experience.",
    outcome: "Users can compare, plan, and book with less friction and better clarity.",
    description:
      "Travel Orbit is an online ticketing platform that simplifies travel planning by organizing trip options, surfacing helpful recommendations, and reducing the cognitive load of multi-step booking flows.",
    image: "images/projects/travel.jpg",
    tech: ["React", "TypeScript", "Node.js", "Express", "MongoDB"],
    demo: "#",
    repo: "https://github.com",
    score: 90,
    highlights: [
      "Prioritized user flow and visual clarity across booking screens.",
      "Designed around simplification of decision-heavy user journeys.",
      "Great candidate for a polished case-study presentation.",
    ],
    status: "in progress",
  },
];

const TIMELINE_ITEMS = [
  {
    id: "t1",
    year: "2026",
    date: "Jan - Present",
    title: "Founder and Lead Developer, DotOrbit Development Team",
    tags: ["backend", "leadership", "design", "publication", "frontend"],
    bullets: [
      "Managed team delivery rhythm and kept the task board aligned with actual priorities.",
      "Built and coordinated modular services so the system could scale more safely.",
    ],
    metrics: [
      "Balanced coding with product direction",
      "Focused the team on features that mattered most",
    ],
    stack: ["PostgreSQL", "Tailwind", "Podman", "Postman"],
  },
  {
    id: "t2",
    year: "2026",
    date: "Jan - Apr 2026",
    title: "Backend Developer | Product Owner, DOST League of Developers Initiative",
    tags: ["backend", "leadership"],
    bullets: [
      "Handled product-side planning while still contributing technical implementation.",
      "Kept backend work aligned with team structure and expected delivery flow.",
    ],
    metrics: [
      "Product + engineering alignment",
      "Improved team coordination under sprint work",
    ],
    stack: ["PostgreSQL", "REST API", "Podman", "Postman"],
  },
  {
    id: "t3",
    year: "2025",
    date: "Jul 2025 - Jul 2026",
    title: "Organization Canva Admin, MarSU - College of Information and Computing Sciences",
    tags: ["publication", "design", "leadership"],
    bullets: [
      "Managed Canva for Education organization access and student onboarding.",
      "Helped student organizations use creative tools better for events and publication work.",
    ],
    metrics: ["Onboarded 200+ student orgs", "Led workshops with 100+ attendees"],
    stack: ["Canva for Education"],
  },
  {
    id: "t4",
    year: "2025",
    date: "Jul 2025 - Jan 2026",
    title: "Correspondent, Sentro Publication",
    tags: ["design", "leadership", "publication"],
    bullets: [
      "Produced publication-related outputs and supported coverage-related execution.",
      "Improved content handling through better creative and editorial coordination.",
    ],
    metrics: ["Consistent content delivery", "Stronger publication contribution"],
    stack: ["Writing", "Layout", "Coverage"],
  },
  {
    id: "t5",
    year: "2025",
    date: "Jul 2025 - Jul 2026",
    title: "Associate Editor-in-Chief, Infocus Publication and Broadcasting Team",
    tags: ["design", "leadership", "publication", "frontend", "video"],
    bullets: [
      "Supported direction, creative quality, and execution across publication and broadcast outputs.",
      "Helped maintain stronger coordination between content and design responsibilities.",
    ],
    metrics: ["Higher publication quality", "Broader team coordination"],
    stack: ["Editorial", "Layout", "Broadcast"],
  },
  {
    id: "t6",
    year: "2024",
    date: "Jul 2024 - Jul 2025",
    title: "Editor-in-Chief, Infocus Publication and Broadcasting Team",
    tags: ["design", "leadership", "publication", "frontend", "video"],
    bullets: [
      "Led the publication team and shaped output quality across multiple deliverables.",
      "Oversaw direction, approvals, and presentation quality for content releases.",
    ],
    metrics: ["Leadership in publication", "Clearer editorial direction"],
    stack: ["Editorial", "Management", "Creative direction"],
  },
  {
    id: "t7",
    year: "2023",
    date: "Jul 2023 - Jul 2024",
    title: "Chief Layout Artist, Infocus Publication and Broadcasting Team",
    tags: ["frontend", "publication", "leadership", "video", "design"],
    bullets: [
      "Improved visual presentation consistency and layout quality.",
      "Worked closely with content and creative contributors for polished outputs.",
    ],
    metrics: ["Better visual consistency", "Faster output turnaround"],
    stack: ["Canva", "Layout", "Design"],
  },
  {
    id: "t8",
    year: "2022",
    date: "Aug 2022 - Sep 2022",
    title: "Head Layout Artist, The Heart Publication",
    tags: ["publication", "design"],
    bullets: [
      "Led layout direction for publication materials.",
      "Established stronger visual output quality through layout decisions.",
    ],
    metrics: ["Cleaner layouts", "Improved readability"],
    stack: ["Publication design", "Layout"],
  },
];

const CERTS = [
  {
    title: "AWS Solutions Architect",
    issuer: "Amazon Web Services",
    issued: "Jan 2024",
    credential_id: "AWS-ABC-12345",
    link: "https://example.com/verify/aws",
    notes: "Architecture best practices, cost optimization, and secure cloud design.",
    image: "images/certificates/aws.jpg",
  },
  {
    title: "Meta Front-End Developer",
    issuer: "Coursera / Meta",
    issued: "Nov 2023",
    credential_id: "META-FE-77821",
    link: "https://example.com/verify/meta",
    notes: "Advanced React patterns, testing, accessibility, and UX fundamentals.",
    image: "images/certificates/meta-frontend.jpg",
  },
  {
    title: "Google UX Design",
    issuer: "Coursera / Google",
    issued: "Aug 2023",
    credential_id: "G-UX-55019",
    link: "https://example.com/verify/google-ux",
    notes: "User research, prototyping, and design handoff workflows.",
    image: "images/certificates/google-ux.jpg",
  },
  {
    title: "Professional Scrum Master I",
    issuer: "Scrum.org",
    issued: "May 2022",
    credential_id: "PSM-I-00912",
    link: "https://example.com/verify/psm",
    notes: "Agile facilitation, sprint planning, and team delivery excellence.",
    image: "images/certificates/psm.jpg",
  },
];

const ACHIEVEMENTS = [
  {
    badge: "Champion",
    badgeColor: "gYellow",
    title: "Marinduque State University Official Logo",
    desc: "Designed and implemented the official university logo and branding system.",
    meta: "Tech: Figma, Adobe Illustrator, Ibis Paint",
  },
  {
    badge: "1st Place",
    badgeColor: "gBlue",
    title: "Base PH Hackathon 2025",
    desc: "Built a Games of the Generals-inspired strategy experience using Ohara.",
    meta: "Tech: Ohara, WebSockets, React",
  },
  {
    badge: "5th Place",
    badgeColor: "gRed",
    title: "DICT — MIMAROPA Hack for Gov 3",
    desc: "Focused on web exploitation and reverse engineering challenges.",
    meta: "Tech: Linux, Metasploit",
  },
  {
    badge: "6th Place",
    badgeColor: "gGreen",
    title: "DICT — MIMAROPA Hack for Gov 4",
    desc: "Focused on web exploitation and reverse engineering challenges.",
    meta: "Tech: Linux, Metasploit",
  },
  {
    badge: "Presenter",
    badgeColor: "gBlue",
    title: "ICITE2025: International Conference on Information Technology Education",
    desc: "Presented SHAPE, a personalized education mobile application.",
    meta: "Tech: Flutter, Dart, Firebase",
  },
  {
    badge: "Presenter",
    badgeColor: "gRed",
    title: "Y4IT Research Summit 2024",
    desc: "Presented Carabao Cart, a smart inventory management concept for small businesses.",
    meta: "Tech: Figma",
  },
  {
    badge: "Presenter",
    badgeColor: "gYellow",
    title: "NPK Deficiency Detection using Leaf Color Scanning Technology",
    desc: "Developed a system to detect nutrient deficiencies in crops using leaf color analysis.",
    meta: "Tech: Arduino",
  },
  {
    badge: "Presenter",
    badgeColor: "gGreen",
    title: "DOST: Regional Innovation Contest and Exhibition (RICE)",
    desc: "Presented a crop deficiency detection concept using leaf color analysis.",
    meta: "Tech: Arduino",
  },
];

const GALLERY_ITEMS = [
  {
    title: "Neural Network Visualization",
    description:
      "Interactive WebGL visualization of neural network training with real-time particle effects.",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=70",
    category: "webgl",
    demo: "#",
    tech: ["WebGL", "Three.js", "Shaders"],
    featured: true,
  },
  {
    title: "Fluid Dynamics Simulation",
    description:
      "Real-time fluid simulation using GPU compute shaders and interactive controls.",
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=800&q=70",
    category: "webgl",
    demo: "#",
    tech: ["WebGL", "GLSL", "Compute Shaders"],
    featured: true,
  },
  {
    title: "Generative Art Engine",
    description:
      "Algorithmic art generator creating unique patterns through math-based systems.",
    image:
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=800&q=70",
    category: "art",
    demo: "#",
    tech: ["Canvas API", "Math", "Algorithms"],
    featured: false,
  },
  {
    title: "Interactive Particle System",
    description:
      "GPU-accelerated particle system with physics simulation and responsive interaction.",
    image:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=70",
    category: "animation",
    demo: "#",
    tech: ["WebGL", "Particles", "Physics"],
    featured: true,
  },
  {
    title: "3D Portfolio Environment",
    description:
      "Immersive 3D space with floating shapes and interactive navigation.",
    image:
      "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=800&q=70",
    category: "webgl",
    demo: "#",
    tech: ["Three.js", "3D", "Shaders"],
    featured: true,
  },
  {
    title: "Audio Reactive Visualizer",
    description:
      "Real-time audio visualization that responds to microphone input or music playback.",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=70",
    category: "interactive",
    demo: "#",
    tech: ["Web Audio API", "Canvas", "FFT"],
    featured: false,
  },
];

/* =========================
   App state
========================= */
const STATE = {
  currentImages: [],
  lightboxIndex: 0,
  lightboxItems: [],
  projectQuery: "",
  projectSort: "impact",
  certQuery: "",
  certSort: "newest",
  galleryFilter: "all",
  activeTimelineFilter: "all",
  timelineExpandedAll: false,
};

const DEFAULT_QUERY = "querying portfolio: Gene Elpie Landoy.";

/* =========================
   Generic helpers
========================= */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function promiseTimeout(milliseconds) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Request timed out.")), milliseconds);
  });
}

function disableBrowserScrollRestoration() {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }
}

function forceScrollTop() {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "auto",
  });

  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function clearStartupHash() {
  if (!window.location.hash) {
    return;
  }

  if (window.location.hash === "#top") {
    return;
  }

  const cleanUrl = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", cleanUrl);
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

function toast(message) {
  const toastRoot = $("#toast");
  const toastText = $("#toastText");
  if (!toastRoot || !toastText) return;

  toastText.textContent = message;
  toastRoot.classList.remove("hidden");

  clearTimeout(window.__toast_timer__);
  window.__toast_timer__ = setTimeout(() => {
    toastRoot.classList.add("hidden");
  }, TOAST_DURATION_MS);
}

function scrollToEl(selector) {
  const element = $(selector);
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openFlexModal(selector) {
  const modal = $(selector);
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
}

function closeFlexModal(selector) {
  const modal = $(selector);
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.style.overflow = "";
}

function setResultsMeta(query) {
  const countEl = $("#resultsCount");
  const timeEl = $("#resultsTime");
  const titleBase = "Gene Elpie Landoy | Retro Search Portfolio";

  const base = 700000 + Math.floor(Math.random() * 900000);
  const seconds = (Math.random() * 0.09 + 0.01).toFixed(3);

  if (countEl) countEl.textContent = `About ${base.toLocaleString()} results`;
  if (timeEl) timeEl.textContent = `(${seconds} seconds)`;

  document.title = query ? `${query} | Retro Search` : titleBase;
}

function copyToClipboard(text, successMessage = "Copied") {
  navigator.clipboard
    .writeText(text)
    .then(() => toast(successMessage))
    .catch(() => toast("Copy failed"));
}

/* =========================
   Knowledge panel
========================= */
function mountKnowledgePanels() {
  const template = $("#kpTemplate");
  const desktopMount = $("#kpDesktopMount");
  const mobileMount = $("#kpMobileMount");

  if (!template || !desktopMount || !mobileMount) return;

  desktopMount.innerHTML = "";
  mobileMount.innerHTML = "";

  desktopMount.appendChild(template.content.cloneNode(true));
  mobileMount.appendChild(template.content.cloneNode(true));
}

/* =========================
   Scroll UX
========================= */
function setupScrollUx() {
  const scrollBar = $("#scrollProgress");
  const buttonTop = $("#btnTop");

  function handleScroll() {
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - doc.clientHeight);
    const progress = (doc.scrollTop / max) * 100;

    if (scrollBar) {
      scrollBar.style.width = `${progress}%`;
    }

    if (buttonTop) {
      buttonTop.classList.toggle("hidden", doc.scrollTop < 600);
    }
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  buttonTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* =========================
   AI Search
========================= */
async function aiHealthCheck() {
  try {
    const response = await Promise.race([
      fetch(AI.HEALTH_ENDPOINT, { method: "GET", cache: "no-store" }),
      promiseTimeout(AI.HEALTH_TIMEOUT_MS),
    ]);
    return Boolean(response.ok);
  } catch {
    return false;
  }
}

async function aiSearch(query) {
  const response = await Promise.race([
    fetch(AI.SEARCH_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    }),
    promiseTimeout(AI.TIMEOUT_MS),
  ]);

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || "AI request failed.");
  }

  const answer = data?.answer;
  if (typeof answer !== "string" || !answer.trim()) {
    return "No answer generated.";
  }

  return answer.trim();
}

function clearAiResultBoxes() {
  const resultsArea = $("#resultsArea");
  if (!resultsArea) return;
  $$('[data-ai-results="true"]', resultsArea).forEach((node) => node.remove());
}

function renderAiResultBox(query, state) {
  const resultsArea = $("#resultsArea");
  if (!resultsArea) return null;

  clearAiResultBoxes();

  const wrapper = document.createElement("div");
  wrapper.dataset.aiResults = "true";
  wrapper.className = "rounded-2xl border border-borderDim bg-bgPanel p-5";

  const header = `
    <div class="text-lg text-gBlue">Search Results</div>
    <div class="mt-1 text-sm text-gray-300">
      Results for "<span class="text-white">${escapeHtml(query)}</span>"
    </div>
  `;

  if (state.type === "loading") {
    wrapper.innerHTML = `
      ${header}
      <div class="mt-2 text-xs text-gray-500">AI search is running…</div>
      <div class="mt-4 rounded-xl border border-borderDim bg-bgDark p-4">
        <div class="h-3 w-2/3 rounded bg-white/10"></div>
        <div class="mt-2 h-3 w-5/6 rounded bg-white/10"></div>
        <div class="mt-2 h-3 w-1/2 rounded bg-white/10"></div>
      </div>
    `;
  } else if (state.type === "error") {
    wrapper.innerHTML = `
      ${header}
      <div class="mt-2 text-xs text-gray-500">AI search is unavailable.</div>
      <div class="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
        <div class="text-sm font-bold text-white">AI request failed</div>
        <div class="mt-2 text-xs text-gray-300">${escapeHtml(state.message || "Unknown error")}</div>
        <div class="mt-3 text-xs text-gray-400">
          Open this site with <span class="font-bold text-gray-200">http://localhost:3000</span>
          and make sure your server is running.
        </div>
      </div>
    `;
  } else {
    wrapper.innerHTML = `
      ${header}
      <div class="mt-2 text-xs text-gray-500">AI search is active.</div>
      <div class="mt-4 rounded-xl border border-borderDim bg-bgDark p-4">
        <pre class="m-0 whitespace-pre-wrap text-sm leading-relaxed text-gray-200">${escapeHtml(state.answer || "No answer generated.")}</pre>
      </div>
      <div class="mt-3 flex flex-wrap gap-2">
        <button type="button" class="f-ring rounded-xl border border-borderDim bg-bgPanel px-3 py-2 text-xs transition-colors hover:bg-[#1c2430]" data-ai-open="projects">Projects</button>
        <button type="button" class="f-ring rounded-xl border border-borderDim bg-bgPanel px-3 py-2 text-xs transition-colors hover:bg-[#1c2430]" data-ai-open="timeline">Timeline</button>
        <button type="button" class="f-ring rounded-xl border border-borderDim bg-bgPanel px-3 py-2 text-xs transition-colors hover:bg-[#1c2430]" data-ai-open="certificates">Certificates</button>
        <button type="button" class="f-ring rounded-xl border border-borderDim bg-bgPanel px-3 py-2 text-xs transition-colors hover:bg-[#1c2430]" data-ai-open="gallery">Gallery</button>
      </div>
    `;

    $$("[data-ai-open]", wrapper).forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.getAttribute("data-ai-open");
        if (!key) return;
        setTab(key);
        setTimeout(() => scrollToEl(`#section-${key}`), 120);
      });
    });
  }

  resultsArea.prepend(wrapper);
  return wrapper;
}

async function runQuery() {
  const query = ($("#searchInput")?.value || "").trim();
  if (!query) return;

  setResultsMeta(query);
  renderAiResultBox(query, { type: "loading" });
  toast("Searching with AI...");

  const healthy = await aiHealthCheck();
  if (!healthy) {
    renderAiResultBox(query, {
      type: "error",
      message:
        "Server not reachable. Open http://localhost:3000 and ensure your dev server is running.",
    });
    toast("AI server offline");
    return;
  }

  try {
    const answer = await aiSearch(query);
    renderAiResultBox(query, { type: "success", answer });
    $("#searchShell")?.classList.add("is-hot");
    setTimeout(() => $("#searchShell")?.classList.remove("is-hot"), 650);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast("AI result ready");
  } catch (error) {
    renderAiResultBox(query, {
      type: "error",
      message: error?.message || "AI request failed.",
    });
    toast("AI request failed");
  }
}

function feelingFuturistic() {
  const picks = [
    { tab: "images", query: "visual portfolio highlights" },
    { tab: "projects", query: "best projects and case studies" },
    { tab: "timeline", query: "career timeline and milestones" },
    { tab: "certificates", query: "verified certificates and credentials" },
    { tab: "achievements", query: "awards and competition history" },
    { tab: "gallery", query: "creative coding and visual experiments" },
    { tab: "about", query: "about gene elpie landoy" },
  ];

  const picked = picks[Math.floor(Math.random() * picks.length)];
  const input = $("#searchInput");

  if (input) {
    input.value = picked.query;
  }

  $("#btnClear")?.classList.remove("hidden");
  setResultsMeta(picked.query);
  setTab(picked.tab);

  setTimeout(() => {
    scrollToEl(`#section-${picked.tab}`);
  }, 220);

  toast(`Warping to ${picked.tab}...`);
}

function typeIntoInput(text, speedMin = 25, speedMax = 55) {
  const input = $("#searchInput");
  const clearButton = $("#btnClear");
  const shell = $("#searchShell");
  if (!input) return;

  input.value = "";
  clearButton?.classList.add("hidden");

  let index = 0;

  function step() {
    if (index < text.length) {
      input.value += text.charAt(index);
      index += 1;
      clearButton?.classList.remove("hidden");
      setTimeout(step, Math.random() * (speedMax - speedMin) + speedMin);
      return;
    }

    shell?.classList.add("is-hot");
    setTimeout(() => shell?.classList.remove("is-hot"), 700);
    setResultsMeta(input.value);
  }

  setTimeout(step, 350);
}

/* =========================
   Tabs
========================= */
function setTab(tab) {
  localStorage.setItem(STORAGE_KEYS.TAB, tab);

  $$(".tab-btn").forEach((button) => {
    const isActive = button.dataset.tab === tab;
    button.classList.toggle("border-gBlue", isActive);
    button.classList.toggle("text-white", isActive);
    button.classList.toggle("shadow-glow", isActive);
  });

  $$("[data-section]").forEach((section) => {
    const key = section.getAttribute("data-section");
    const visible = tab === "all" || tab === key;
    section.classList.toggle("hidden", !visible);
  });

  const query = $("#searchInput")?.value || "";
  setResultsMeta(tab === "all" ? query : `${tab} results`);
}

/* =========================
   Lightbox
========================= */
let touchStartX = 0;

function setLightboxItems(items) {
  STATE.lightboxItems = items;
}

function openLightbox(index) {
  if (!STATE.lightboxItems.length) return;

  STATE.lightboxIndex = clamp(index, 0, STATE.lightboxItems.length - 1);
  const item = STATE.lightboxItems[STATE.lightboxIndex];

  const title = $("#lightboxTitle");
  const image = $("#lightboxImg");

  if (title) title.textContent = item.title;
  if (image) {
    image.src = item.src;
    image.alt = item.alt || item.title;
  }

  openFlexModal("#lightbox");
}

function closeLightbox() {
  closeFlexModal("#lightbox");
}

function nextLightboxImage(delta) {
  if (!STATE.lightboxItems.length) return;

  STATE.lightboxIndex =
    (STATE.lightboxIndex + delta + STATE.lightboxItems.length) % STATE.lightboxItems.length;

  const item = STATE.lightboxItems[STATE.lightboxIndex];
  const title = $("#lightboxTitle");
  const image = $("#lightboxImg");

  if (title) title.textContent = item.title;
  if (image) {
    image.src = item.src;
    image.alt = item.alt || item.title;
  }
}

function setupLightboxSwipe() {
  const image = $("#lightboxImg");
  if (!image) return;

  image.addEventListener(
    "touchstart",
    (event) => {
      if (!event.touches?.length) return;
      touchStartX = event.touches[0].clientX;
    },
    { passive: true }
  );

  image.addEventListener(
    "touchend",
    (event) => {
      if (!event.changedTouches?.length) return;
      const endX = event.changedTouches[0].clientX;
      const delta = endX - touchStartX;
      if (Math.abs(delta) < 40) return;
      nextLightboxImage(delta > 0 ? -1 : 1);
    },
    { passive: true }
  );
}

/* =========================
   Images
========================= */
function renderImages(items) {
  const grid = $("#imageGrid");
  if (!grid) return;

  STATE.currentImages = items;
  setLightboxItems(
    items.map((item) => ({
      title: item.title,
      src: item.src,
      alt: item.alt,
    }))
  );

  grid.innerHTML = "";

  items.forEach((item, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "image-card f-ring";
    card.setAttribute("aria-label", `Open image: ${item.title}`);

    card.innerHTML = `
      <div class="absolute left-2 top-2 z-10 rounded-full border border-borderDim bg-bgPanel px-2 py-1 text-[10px] text-gray-300">
        ${escapeHtml(String(item.tag || "").toUpperCase())}
      </div>
      <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt)}" loading="lazy" class="h-28 w-full object-cover opacity-90 sm:h-32" />
      <div class="p-2">
        <div class="clamp-2 text-xs text-gray-300">${escapeHtml(item.title)}</div>
      </div>
    `;

    card.addEventListener("click", () => openLightbox(index));
    grid.appendChild(card);
  });
}

/* =========================
   Timeline
========================= */
function getTimelineTagPill(tag) {
  const classMap = {
    backend: "text-gBlue",
    frontend: "text-gYellow",
    design: "text-gYellow",
    leadership: "text-gGreen",
    publication: "text-gRed",
    video: "text-gBlue",
  };

  return `
    <span class="rounded-full border border-borderDim bg-bgPanel px-2 py-0.5 text-[11px] ${classMap[tag] || "text-gray-300"}">
      ${escapeHtml(tag)}
    </span>
  `;
}

function renderTimeline() {
  const list = $("#timelineList");
  if (!list) return;

  list.innerHTML = "";

  const items = TIMELINE_ITEMS.filter((item) => {
    if (STATE.activeTimelineFilter === "all") return true;
    return (item.tags || []).includes(STATE.activeTimelineFilter);
  });

  if (!items.length) {
    list.innerHTML = `
      <div class="rounded-xl border border-borderDim bg-bgDark p-4 text-sm text-gray-400">
        No timeline entries match that filter.
      </div>
    `;
    return;
  }

  items.forEach((item) => {
    const wrapper = document.createElement("div");
    wrapper.className = "timeline-item";

    const tags = (item.tags || []).map(getTimelineTagPill).join(" ");
    const metrics = (item.metrics || [])
      .map(
        (metric) => `
          <span class="rounded-full border border-borderDim bg-bgPanel px-2 py-1 text-[11px] text-gray-300">
            ${escapeHtml(metric)}
          </span>
        `
      )
      .join("");

    const stack = (item.stack || [])
      .map(
        (stackItem) => `
          <span class="rounded-full border border-borderDim bg-bgPanel px-2 py-1 text-[11px] text-gray-400">
            ${escapeHtml(stackItem)}
          </span>
        `
      )
      .join("");

    wrapper.innerHTML = `
      <div class="timeline-dot" aria-hidden="true"></div>
      <div class="timeline-card">
        <button class="timeline-head f-ring w-full text-left" type="button" aria-expanded="false" data-acc-btn="true">
          <div class="min-w-0">
            <div class="text-xs text-gray-500">${escapeHtml(item.year)} · ${escapeHtml(item.date || "")} · ${tags}</div>
            <div class="mt-1 text-sm text-white">${escapeHtml(item.title)}</div>
          </div>
          <div class="shrink-0 text-xs text-gray-500">toggle</div>
        </button>

        <div class="timeline-body hidden" data-acc-panel="true">
          <div class="text-xs text-gray-500">Highlights</div>
          <ul class="mt-2 space-y-2 text-sm text-gray-300">
            ${(item.bullets || []).map((bullet) => `<li>• ${escapeHtml(bullet)}</li>`).join("")}
          </ul>

          <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div class="rounded-xl border border-borderDim bg-bgPanel p-3">
              <div class="text-xs text-gray-500">Impact</div>
              <div class="mt-2 flex flex-wrap gap-2">${metrics}</div>
            </div>
            <div class="rounded-xl border border-borderDim bg-bgPanel p-3">
              <div class="text-xs text-gray-500">Stack</div>
              <div class="mt-2 flex flex-wrap gap-2">${stack}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    const button = $('[data-acc-btn="true"]', wrapper);
    const panel = $('[data-acc-panel="true"]', wrapper);

    button?.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", expanded ? "false" : "true");
      panel?.classList.toggle("hidden", expanded);
    });

    if (STATE.timelineExpandedAll) {
      button?.setAttribute("aria-expanded", "true");
      panel?.classList.remove("hidden");
    }

    list.appendChild(wrapper);
  });
}

/* =========================
   Projects
========================= */
function getSortedProjects(items) {
  const copy = [...items];

  if (STATE.projectSort === "newest") {
    copy.sort((left, right) => (right.year || 0) - (left.year || 0));
  } else if (STATE.projectSort === "oldest") {
    copy.sort((left, right) => (left.year || 0) - (right.year || 0));
  } else if (STATE.projectSort === "title") {
    copy.sort((left, right) => String(left.title).localeCompare(String(right.title)));
  } else {
    copy.sort((left, right) => (right.score || 0) - (left.score || 0));
  }

  return copy;
}

function filterProjects() {
  const query = STATE.projectQuery.trim().toLowerCase();

  return PROJECTS.filter((project) => {
    if (!query) return true;

    const haystack = [
      project.title,
      project.category,
      project.role,
      project.description,
      project.impact,
      project.outcome,
      ...(project.tech || []),
      ...(project.highlights || []),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

function buildProjectCard(project) {
  const techHtml = (project.tech || [])
    .slice(0, PROJECT_TECH_LIMIT)
    .map((item) => `<span class="card-chip">${escapeHtml(item)}</span>`)
    .join("");

  const article = document.createElement("article");
  article.className = "project-card";

  article.innerHTML = `
    <div class="project-thumb">
      <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)}" loading="lazy" />
      <div class="project-badge-row">
        <span class="project-badge text-gBlue">${escapeHtml(project.category)}</span>
        <span class="project-badge text-gYellow">score ${escapeHtml(String(project.score || 0))}</span>
      </div>
      <div class="project-thumb-footer">
        <div class="project-score">${escapeHtml(String(project.year))} · ${escapeHtml(project.status || "build")}</div>
      </div>
    </div>

    <div class="project-card-body">
      <div class="project-card-title">${escapeHtml(project.title)}</div>
      <div class="project-card-subtitle">${escapeHtml(project.role)} · ${escapeHtml(project.impact)}</div>
      <div class="project-card-desc clamp-3">${escapeHtml(project.description)}</div>

      <div class="card-chip-row">${techHtml}</div>

      <div class="card-action-row">
        <button type="button" class="card-action f-ring" data-project-open="${escapeHtml(project.id)}">Open details</button>
        <a href="${escapeHtml(project.demo || "#")}" target="_blank" rel="noreferrer" class="card-link f-ring">Live demo</a>
        <a href="${escapeHtml(project.repo || "#")}" target="_blank" rel="noreferrer" class="card-link f-ring">GitHub</a>
      </div>
    </div>
  `;

  return article;
}

function renderProjects() {
  const grid = $("#projectsGrid");
  if (!grid) return;

  grid.innerHTML = "";

  const items = getSortedProjects(filterProjects());

  if (!items.length) {
    grid.innerHTML = `
      <div class="rounded-xl border border-borderDim bg-bgDark p-4 text-sm text-gray-400">
        No projects found. Try a different filter.
      </div>
    `;
    return;
  }

  items.forEach((project) => {
    const card = buildProjectCard(project);
    grid.appendChild(card);
  });

  $$("[data-project-open]", grid).forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-project-open");
      const project = PROJECTS.find((item) => item.id === id);
      if (!project) return;
      openProjectModal(project);
    });
  });
}

function openProjectModal(project) {
  const title = $("#projectModalTitle");
  const image = $("#projectModalImg");
  const meta = $("#projectModalMeta");
  const impact = $("#projectModalImpact");
  const desc = $("#projectModalDesc");
  const role = $("#projectModalRole");
  const outcome = $("#projectModalOutcome");
  const techRoot = $("#projectModalTech");
  const highlightRoot = $("#projectModalHighlights");
  const demo = $("#projectModalDemo");
  const repo = $("#projectModalRepo");

  if (title) title.textContent = project.title;
  if (image) {
    image.src = project.image || "";
    image.alt = project.title;
  }
  if (meta) meta.textContent = `${project.category} · ${project.year} · ${project.status || "build"}`;
  if (impact) impact.textContent = project.impact || "";
  if (desc) desc.textContent = project.description || "";
  if (role) role.textContent = project.role || "";
  if (outcome) outcome.textContent = project.outcome || "";

  if (techRoot) {
    techRoot.innerHTML = "";
    (project.tech || []).forEach((item) => {
      const chip = document.createElement("span");
      chip.className =
        "rounded-full border border-borderDim bg-bgPanel px-2 py-1 text-[11px] text-gray-300";
      chip.textContent = item;
      techRoot.appendChild(chip);
    });
  }

  if (highlightRoot) {
    highlightRoot.innerHTML = "";
    (project.highlights || []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `• ${item}`;
      highlightRoot.appendChild(li);
    });
  }

  if (demo) demo.href = project.demo || "#";
  if (repo) repo.href = project.repo || "#";

  const copyButton = $("#btnCopyProject");
  if (copyButton) {
    copyButton.onclick = () => {
      const summary = [
        project.title,
        `Category: ${project.category}`,
        `Year: ${project.year}`,
        `Role: ${project.role}`,
        `Impact: ${project.impact}`,
        `Outcome: ${project.outcome}`,
        `Tech: ${(project.tech || []).join(", ")}`,
        `Demo: ${project.demo || ""}`,
        `Repo: ${project.repo || ""}`,
      ].join("\n");

      copyToClipboard(summary, "Project summary copied");
    };
  }

  openFlexModal("#projectModal");
}

function closeProjectModal() {
  closeFlexModal("#projectModal");
}

/* =========================
   Certificates
========================= */
function parseIssued(value) {
  const parts = String(value || "").split(" ");
  if (parts.length !== 2) return new Date(2000, 0, 1);

  const monthIndex =
    {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    }[parts[0]] ?? 0;

  const year = Number(parts[1]) || 2000;
  return new Date(year, monthIndex, 1);
}

function getSortedCertificates(items) {
  const copy = [...items];

  if (STATE.certSort === "newest") {
    copy.sort((left, right) => parseIssued(right.issued) - parseIssued(left.issued));
  } else if (STATE.certSort === "oldest") {
    copy.sort((left, right) => parseIssued(left.issued) - parseIssued(right.issued));
  } else if (STATE.certSort === "issuer") {
    copy.sort((left, right) => left.issuer.localeCompare(right.issuer));
  } else if (STATE.certSort === "title") {
    copy.sort((left, right) => left.title.localeCompare(right.title));
  }

  return copy;
}

function filterCertificates() {
  const query = STATE.certQuery.trim().toLowerCase();

  return CERTS.filter((cert) => {
    if (!query) return true;

    const haystack = [cert.title, cert.issuer, cert.issued, cert.credential_id, cert.notes]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

function buildCertificateCard(cert) {
  const article = document.createElement("article");
  article.className = "cert-card";

  article.innerHTML = `
    <div class="cert-thumb">
      <img src="${escapeHtml(cert.image)}" alt="${escapeHtml(cert.title)}" loading="lazy" />
      <div class="project-badge-row">
        <span class="cert-badge text-gGreen">verified</span>
        <span class="cert-badge text-gBlue">${escapeHtml(cert.issuer)}</span>
      </div>
      <div class="cert-thumb-footer">
        <div class="text-xs text-white">${escapeHtml(cert.issued)}</div>
      </div>
    </div>

    <div class="cert-card-body">
      <div class="project-card-title">${escapeHtml(cert.title)}</div>
      <div class="project-card-subtitle">${escapeHtml(cert.issuer)} · ${escapeHtml(cert.credential_id)}</div>
      <div class="project-card-desc clamp-3">${escapeHtml(cert.notes)}</div>

      <div class="card-action-row">
        <button type="button" class="card-action f-ring" data-cert-open="${escapeHtml(cert.credential_id)}">View certificate</button>
        <a href="${escapeHtml(cert.link || "#")}" target="_blank" rel="noreferrer" class="card-link f-ring">Verify</a>
      </div>
    </div>
  `;

  return article;
}

function renderCertificates() {
  const grid = $("#certGrid");
  if (!grid) return;

  grid.innerHTML = "";

  const items = getSortedCertificates(filterCertificates());

  if (!items.length) {
    grid.innerHTML = `
      <div class="rounded-xl border border-borderDim bg-bgDark p-4 text-sm text-gray-400">
        No certificates found. Try a different filter.
      </div>
    `;
    return;
  }

  items.forEach((cert) => {
    grid.appendChild(buildCertificateCard(cert));
  });

  $$("[data-cert-open]", grid).forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-cert-open");
      const cert = CERTS.find((item) => item.credential_id === id);
      if (!cert) return;
      openCertificateModal(cert);
    });
  });
}

function openCertificateModal(cert) {
  const title = $("#certModalTitle");
  const issuer = $("#certModalIssuer");
  const issued = $("#certModalIssued");
  const credentialId = $("#certModalId");
  const notes = $("#certModalNotes");
  const link = $("#certModalLink");
  const image = $("#certModalImage");
  const imageButton = $("#btnCertImage");
  const fullViewButton = $("#btnOpenCertImage");

  if (title) title.textContent = cert.title;
  if (issuer) issuer.textContent = cert.issuer;
  if (issued) issued.textContent = cert.issued;
  if (credentialId) credentialId.textContent = cert.credential_id;
  if (notes) notes.textContent = cert.notes;
  if (link) link.href = cert.link || "#";
  if (image) {
    image.src = cert.image || "";
    image.alt = cert.title;
  }

  const lightboxItems = [
    {
      title: cert.title,
      src: cert.image,
      alt: cert.title,
    },
  ];
  setLightboxItems(lightboxItems);

  const openFullView = () => {
    openLightbox(0);
  };

  if (imageButton) imageButton.onclick = openFullView;
  if (fullViewButton) fullViewButton.onclick = openFullView;

  const copyButton = $("#btnCopyCert");
  if (copyButton) {
    copyButton.onclick = () => {
      const details = [
        cert.title,
        `Issuer: ${cert.issuer}`,
        `Issued: ${cert.issued}`,
        `Credential ID: ${cert.credential_id}`,
        `Verify: ${cert.link}`,
        `Notes: ${cert.notes}`,
      ].join("\n");

      copyToClipboard(details, "Certificate details copied");
    };
  }

  openFlexModal("#certModal");
}

function closeCertificateModal() {
  closeFlexModal("#certModal");
}

/* =========================
   Achievements
========================= */
function renderAchievements() {
  const grid = $("#achGrid");
  if (!grid) return;

  grid.innerHTML = "";

  ACHIEVEMENTS.forEach((item) => {
    const card = document.createElement("div");
    card.className =
      "rounded-xl border border-borderDim bg-bgDark p-4 transition-colors hover:border-white/30";
    card.innerHTML = `
      <div class="flex items-center justify-between gap-3">
        <span class="rounded-full border border-borderDim bg-bgPanel px-2 py-1 text-[11px] text-${escapeHtml(item.badgeColor)}">${escapeHtml(item.badge)}</span>
        <span class="text-xs text-gray-500">${escapeHtml(item.meta)}</span>
      </div>
      <div class="mt-3 text-sm font-bold text-white">${escapeHtml(item.title)}</div>
      <div class="mt-2 text-xs text-gray-400">${escapeHtml(item.desc)}</div>
    `;
    grid.appendChild(card);
  });
}

function animateCounters() {
  const counters = $$(".counter");
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const element = entry.target;
        const target = Number(element.dataset.target || "0");
        const duration = 950 + Math.random() * 550;
        const start = performance.now();

        observer.unobserve(element);

        function tick(timestamp) {
          const progress = clamp((timestamp - start) / duration, 0, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          element.textContent = String(Math.floor(target * eased));

          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            element.textContent = String(target);
          }
        }

        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.35 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

/* =========================
   Gallery
========================= */
function filterGalleryItems() {
  return GALLERY_ITEMS.filter((item) => {
    if (STATE.galleryFilter === "all") return true;
    if (STATE.galleryFilter === "featured") return Boolean(item.featured);
    return item.category === STATE.galleryFilter;
  });
}

function renderGallery() {
  const grid = $("#galleryGrid");
  if (!grid) return;

  grid.innerHTML = "";

  const items = filterGalleryItems();

  if (!items.length) {
    grid.innerHTML = `
      <div class="rounded-xl border border-borderDim bg-bgDark p-4 text-sm text-gray-400">
        No gallery items match that filter.
      </div>
    `;
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "gallery-card f-ring text-left";

    const badge = item.featured
      ? `<span class="rounded-full border border-borderDim bg-bgPanel px-2 py-1 text-[10px] text-gYellow">featured</span>`
      : `<span class="rounded-full border border-borderDim bg-bgPanel px-2 py-1 text-[10px] text-gray-400">${escapeHtml(item.category)}</span>`;

    card.innerHTML = `
      <div class="relative">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy" class="h-40 w-full object-cover opacity-90" />
        <div class="absolute left-2 top-2">${badge}</div>
      </div>
      <div class="p-4">
        <div class="clamp-2 text-sm font-bold text-white">${escapeHtml(item.title)}</div>
        <div class="clamp-2 mt-2 text-xs text-gray-400">${escapeHtml(item.description)}</div>
        <div class="mt-3 flex flex-wrap gap-2">
          ${(item.tech || [])
        .slice(0, GALLERY_TECH_LIMIT)
        .map(
          (tech) => `<span class="rounded-full border border-borderDim bg-bgPanel px-2 py-1 text-[10px] text-gray-400">${escapeHtml(tech)}</span>`
        )
        .join("")}
        </div>
      </div>
    `;

    card.addEventListener("click", () => openGalleryModal(item));
    grid.appendChild(card);
  });
}

function openGalleryModal(item) {
  const title = $("#galleryModalTitle");
  const image = $("#galleryModalImg");
  const meta = $("#galleryModalMeta");
  const desc = $("#galleryModalDesc");
  const techRoot = $("#galleryModalTech");
  const demo = $("#galleryModalDemo");
  const copyButton = $("#btnCopyGalleryItem");

  if (title) title.textContent = item.title;
  if (image) {
    image.src = item.image;
    image.alt = item.title;
  }
  if (meta) {
    meta.textContent = `Category: ${item.category}${item.featured ? " · Featured" : ""}`;
  }
  if (desc) desc.textContent = item.description;
  if (demo) demo.href = item.demo || "#";

  if (techRoot) {
    techRoot.innerHTML = "";
    (item.tech || []).forEach((tech) => {
      const chip = document.createElement("span");
      chip.className =
        "rounded-full border border-borderDim bg-bgDark px-2 py-1 text-[11px] text-gray-300";
      chip.textContent = tech;
      techRoot.appendChild(chip);
    });
  }

  if (copyButton) {
    copyButton.onclick = () => {
      const summary = [
        item.title,
        item.description,
        `Tech: ${(item.tech || []).join(", ")}`,
        `Demo: ${item.demo || ""}`,
      ].join("\n");

      copyToClipboard(summary, "Gallery item copied");
    };
  }

  openFlexModal("#galleryModal");
}

function closeGalleryModal() {
  closeFlexModal("#galleryModal");
}

/* =========================
   Saved searches
========================= */
function getSavedSearches() {
  return safeJsonParse(localStorage.getItem(STORAGE_KEYS.SAVED) || "[]", []);
}

function setSavedSearches(list) {
  localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(list.slice(0, 20)));
}

function saveCurrentSearch() {
  const query = ($("#searchInput")?.value || "").trim();
  if (!query) {
    toast("Type a query first");
    return;
  }

  const list = getSavedSearches();
  const next = [{ q: query, at: new Date().toISOString() }, ...list.filter((entry) => entry.q !== query)];

  setSavedSearches(next);
  toast("Search saved");
}

function renderSavedList() {
  const root = $("#savedList");
  if (!root) return;

  const list = getSavedSearches();
  root.innerHTML = "";

  if (!list.length) {
    root.innerHTML = `
      <div class="rounded-xl border border-borderDim bg-bgDark p-4 text-sm text-gray-400">
        No saved searches yet.
      </div>
    `;
    return;
  }

  list.forEach((entry, index) => {
    const row = document.createElement("div");
    row.className = "flex items-start justify-between gap-3 rounded-xl border border-borderDim bg-bgDark p-4";

    row.innerHTML = `
      <div class="min-w-0">
        <div class="clamp-2 text-sm font-bold text-white">${escapeHtml(entry.q)}</div>
        <div class="mt-1 text-xs text-gray-500">Saved: ${new Date(entry.at).toLocaleString()}</div>
      </div>
      <div class="flex gap-2">
        <button type="button" class="f-ring rounded-xl border border-borderDim bg-bgPanel px-3 py-2 text-xs transition-colors hover:bg-[#1c2430]" data-load="${index}">Load</button>
        <button type="button" class="f-ring rounded-xl border border-borderDim bg-bgPanel px-3 py-2 text-xs transition-colors hover:bg-[#1c2430]" data-del="${index}">Del</button>
      </div>
    `;

    root.appendChild(row);
  });

  $$("[data-load]", root).forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.load);
      const item = getSavedSearches()[index];
      const input = $("#searchInput");
      if (!item || !input) return;

      input.value = item.q;
      $("#btnClear")?.classList.remove("hidden");
      setResultsMeta(item.q);
      closeSavedModal();
      toast("Loaded");
    });
  });

  $$("[data-del]", root).forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.del);
      const list = getSavedSearches();
      list.splice(index, 1);
      setSavedSearches(list);
      renderSavedList();
      toast("Deleted");
    });
  });
}

function openSavedModal() {
  renderSavedList();
  openFlexModal("#savedModal");
}

function closeSavedModal() {
  closeFlexModal("#savedModal");
}

/* =========================
   Command palette
========================= */
const COMMANDS = [
  { label: "Go: Top", run: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
  { label: "Tab: All", run: () => setTab("all") },
  { label: "Tab: Images", run: () => setTab("images") },
  { label: "Tab: Projects", run: () => setTab("projects") },
  { label: "Tab: Timeline", run: () => setTab("timeline") },
  { label: "Tab: Certificates", run: () => setTab("certificates") },
  { label: "Tab: Achievements", run: () => setTab("achievements") },
  { label: "Tab: Gallery", run: () => setTab("gallery") },
  { label: "Tab: About", run: () => setTab("about") },
  { label: "Open: Saved searches", run: () => openSavedModal() },
  { label: "Open: Profile panel", run: () => openProfileDrawer() },
  { label: "Action: Run query", run: () => runQuery() },
  { label: "Action: Feeling Futuristic", run: () => feelingFuturistic() },
];

function renderCommandList(query = "") {
  const list = $("#cmdList");
  if (!list) return;

  const normalized = String(query).trim().toLowerCase();
  const items = COMMANDS.filter((command) => {
    if (!normalized) return true;
    return command.label.toLowerCase().includes(normalized);
  }).slice(0, 12);

  list.innerHTML = "";

  if (!items.length) {
    list.innerHTML = `
      <div class="rounded-xl border border-borderDim bg-bgDark p-4 text-sm text-gray-400">
        No commands found.
      </div>
    `;
    return;
  }

  items.forEach((command) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "f-ring w-full rounded-xl border border-borderDim bg-bgDark p-3 text-left transition-colors hover:border-gBlue";
    button.textContent = command.label;
    button.addEventListener("click", () => {
      closeCommandPalette();
      command.run();
    });
    list.appendChild(button);
  });
}

function openCommandPalette() {
  openFlexModal("#cmdPalette");
  renderCommandList("");

  const input = $("#cmdInput");
  if (input) {
    input.value = "";
    input.focus();
  }
}

function closeCommandPalette() {
  closeFlexModal("#cmdPalette");
}

/* =========================
   Profile drawer
========================= */
function openProfileDrawer() {
  const drawer = $("#kpDrawer");
  if (!drawer) return;
  drawer.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeProfileDrawer() {
  const drawer = $("#kpDrawer");
  if (!drawer) return;
  drawer.classList.add("hidden");
  document.body.style.overflow = "";
}

/* =========================
   Contact form
========================= */
async function submitContactForm(event) {
  event.preventDefault();

  const form = event.target;
  const status = $("#contactStatus");
  const formData = new FormData(form);

  const payload = {
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    message: String(formData.get("message") || ""),
  };

  if (status) status.textContent = "Sending...";

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.ok) {
      const message = data?.error || "Send failed.";
      if (status) status.textContent = message;
      toast(message);
      return;
    }

    if (status) status.textContent = "Sent! Saved on server.";
    form.reset();
    toast("Message sent");
  } catch {
    if (status) status.textContent = "Network error.";
    toast("Network error");
  }
}

/* =========================
   Event wiring
========================= */
function setupEventHandlers() {
  $$(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.dataset.tab;
      if (!tab) return;

      setTab(tab);
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    const trigger = target?.closest?.("[data-scrollto]");
    if (!trigger) return;

    const destination = trigger.getAttribute("data-scrollto");
    if (!destination) return;

    scrollToEl(destination);
  });

  $("#searchShell")?.addEventListener("submit", (event) => {
    event.preventDefault();
    runQuery();
  });

  $("#btnRun")?.addEventListener("click", runQuery);
  $("#btnLucky")?.addEventListener("click", feelingFuturistic);

  $("#searchInput")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      runQuery();
    }
  });

  $("#searchInput")?.addEventListener("input", (event) => {
    const value = event.target.value;
    $("#btnClear")?.classList.toggle("hidden", !value);
    setResultsMeta(value);
  });

  $("#btnClear")?.addEventListener("click", () => {
    const input = $("#searchInput");
    if (input) input.value = "";
    $("#btnClear")?.classList.add("hidden");
    clearAiResultBoxes();
    setResultsMeta("");
    toast("Cleared");
  });

  $("#btnVoice")?.addEventListener("click", () => {
    $("#searchShell")?.classList.add("is-hot");
    setTimeout(() => $("#searchShell")?.classList.remove("is-hot"), 600);
    toast("Voice search is a demo here");
  });

  $("#btnShuffleImages")?.addEventListener("click", () => {
    renderImages(shuffle(IMAGE_ITEMS));
    toast("Images shuffled");
  });

  $("#viewAllImages")?.addEventListener("click", () => {
    setTab("images");
    scrollToEl("#section-images");
  });

  $("#btnCloseLightbox")?.addEventListener("click", closeLightbox);
  $("#btnPrevImg")?.addEventListener("click", () => nextLightboxImage(-1));
  $("#btnNextImg")?.addEventListener("click", () => nextLightboxImage(1));
  $("#lightbox")?.addEventListener("click", (event) => {
    if (event.target?.dataset?.close === "true") closeLightbox();
  });

  $("#btnCloseProjectModal")?.addEventListener("click", closeProjectModal);
  $("#projectModal")?.addEventListener("click", (event) => {
    if (event.target?.dataset?.close === "true") closeProjectModal();
  });

  $("#btnCloseCertModal")?.addEventListener("click", closeCertificateModal);
  $("#certModal")?.addEventListener("click", (event) => {
    if (event.target?.dataset?.close === "true") closeCertificateModal();
  });

  $("#btnCloseGalleryModal")?.addEventListener("click", closeGalleryModal);
  $("#galleryModal")?.addEventListener("click", (event) => {
    if (event.target?.dataset?.close === "true") closeGalleryModal();
  });

  $$("[data-timeline-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      STATE.activeTimelineFilter = button.dataset.timelineFilter || "all";

      $$("[data-timeline-filter]").forEach((item) => {
        const active = item.dataset.timelineFilter === STATE.activeTimelineFilter;
        item.classList.toggle("border-gBlue", active);
        item.classList.toggle("text-white", active);
        item.classList.toggle("shadow-glow", active);
      });

      renderTimeline();
      toast(`Timeline filter: ${STATE.activeTimelineFilter}`);
    });
  });

  $("#btnExpandAllTimeline")?.addEventListener("click", () => {
    STATE.timelineExpandedAll = !STATE.timelineExpandedAll;
    const button = $("#btnExpandAllTimeline");
    if (button) {
      button.textContent = STATE.timelineExpandedAll ? "Collapse all" : "Expand all";
    }
    renderTimeline();
  });

  $("#projectSearch")?.addEventListener("input", (event) => {
    STATE.projectQuery = event.target.value;
    renderProjects();
  });

  $("#projectSort")?.addEventListener("change", (event) => {
    STATE.projectSort = event.target.value;
    renderProjects();
  });

  $("#certSearch")?.addEventListener("input", (event) => {
    STATE.certQuery = event.target.value;
    renderCertificates();
  });

  $("#certSort")?.addEventListener("change", (event) => {
    STATE.certSort = event.target.value;
    renderCertificates();
  });

  $("#galleryFilter")?.addEventListener("change", (event) => {
    STATE.galleryFilter = event.target.value;
    renderGallery();
  });

  $("#btnShuffleGallery")?.addEventListener("click", () => {
    const shuffled = shuffle(GALLERY_ITEMS);
    GALLERY_ITEMS.length = 0;
    shuffled.forEach((item) => GALLERY_ITEMS.push(item));
    renderGallery();
    toast("Gallery shuffled");
  });

  $("#btnCopyBio")?.addEventListener("click", () => {
    const text = ($("#bioText")?.textContent || "").trim();
    copyToClipboard(text, "Bio copied");
  });

  $("#btnDownloadResume")?.addEventListener("click", () => {
    toast("Demo: connect a real PDF or document link here");
  });

  $("#contactForm")?.addEventListener("submit", submitContactForm);

  $("#btnOpenKp")?.addEventListener("click", openProfileDrawer);
  $("#btnCloseKp")?.addEventListener("click", closeProfileDrawer);
  $("#kpDrawer")?.addEventListener("click", (event) => {
    if (event.target?.dataset?.close === "true") closeProfileDrawer();
  });

  $("#btnSaveSearch")?.addEventListener("click", saveCurrentSearch);
  $("#btnOpenSaved")?.addEventListener("click", openSavedModal);
  $("#btnCloseSaved")?.addEventListener("click", closeSavedModal);
  $("#savedModal")?.addEventListener("click", (event) => {
    if (event.target?.dataset?.close === "true") closeSavedModal();
  });

  $("#btnCmd")?.addEventListener("click", openCommandPalette);
  $("#cmdPalette")?.addEventListener("click", (event) => {
    if (event.target?.dataset?.close === "true") closeCommandPalette();
  });

  $("#cmdInput")?.addEventListener("input", (event) => {
    renderCommandList(event.target.value);
  });

  $("#cmdInput")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const query = ($("#cmdInput")?.value || "").trim().toLowerCase();
      const hit =
        COMMANDS.find((command) => command.label.toLowerCase().includes(query)) || COMMANDS[0];
      closeCommandPalette();
      hit.run();
    }
  });

  document.addEventListener("keydown", (event) => {
    const isTyping = ["input", "textarea"].includes(
      document.activeElement?.tagName?.toLowerCase?.() || ""
    );

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if ($("#cmdPalette")?.classList.contains("hidden")) {
        openCommandPalette();
      } else {
        closeCommandPalette();
      }
      return;
    }

    if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey && !isTyping) {
      event.preventDefault();
      $("#searchInput")?.focus();
      return;
    }

    if (event.key === "Escape") {
      if (!$("#lightbox")?.classList.contains("hidden")) closeLightbox();
      if (!$("#projectModal")?.classList.contains("hidden")) closeProjectModal();
      if (!$("#certModal")?.classList.contains("hidden")) closeCertificateModal();
      if (!$("#galleryModal")?.classList.contains("hidden")) closeGalleryModal();
      if (!$("#kpDrawer")?.classList.contains("hidden")) closeProfileDrawer();
      if (!$("#cmdPalette")?.classList.contains("hidden")) closeCommandPalette();
      if (!$("#savedModal")?.classList.contains("hidden")) closeSavedModal();
    }

    if (!$("#lightbox")?.classList.contains("hidden")) {
      if (event.key === "ArrowLeft") nextLightboxImage(-1);
      if (event.key === "ArrowRight") nextLightboxImage(1);
    }
  });
}

/* =========================
   Init
========================= */
function init() {
  stabilizeStartupScroll();

  mountKnowledgePanels();
  renderImages(IMAGE_ITEMS);
  renderProjects();
  renderTimeline();
  renderCertificates();
  renderAchievements();
  renderGallery();
  animateCounters();

  setupLightboxSwipe();
  setupEventHandlers();
  setupScrollUx();

  const savedTab = localStorage.getItem(STORAGE_KEYS.TAB) || "all";
  setTab(savedTab);

  $$("[data-timeline-filter]").forEach((button) => {
    const active = button.dataset.timelineFilter === "all";
    button.classList.toggle("border-gBlue", active);
    button.classList.toggle("text-white", active);
    button.classList.toggle("shadow-glow", active);
  });

  setTimeout(() => {
    typeIntoInput(DEFAULT_QUERY);
    forceScrollTop();
  }, 700);

  setTimeout(() => {
    forceScrollTop();
  }, 1200);
}

init();