/**
 * File: app.js
 * Description: Interactivity for the retro-futuristic portfolio.
 * Improves preview density, adds project pagination, polishes motion,
 * and preserves AI search, modals, saved searches, command palette,
 * and contact form behavior.
 * Version: 4.0.0
 */

(function initializeThemeToggle() {
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
})();

/* =========================
   Constants
========================= */
const TOAST_DURATION_MS = 1600;
const PROJECT_TECH_LIMIT = 4;
const GALLERY_TECH_LIMIT = 3;
const STARTUP_SCROLL_RESET_ATTEMPTS = 2;
const STARTUP_SCROLL_RESET_DELAY_MS = 120;
const PREVIEW_ITEM_LIMIT = 6;
const PROJECTS_PER_PAGE = 4;
const ANIMATION_STAGGER_MS = 45;

const STORAGE_KEYS = {
  TAB: "retro_portfolio_tab",
  SAVED: "retro_portfolio_saved_searches",
};

const SECTION_KEYS = {
  IMAGES: "images",
  PROJECTS: "projects",
  TIMELINE: "timeline",
  CERTIFICATES: "certificates",
  ACHIEVEMENTS: "achievements",
  GALLERY: "gallery",
  ABOUT: "about",
  ALL: "all",
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
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop",
  },
  {
    title: "Meta Front-End Developer",
    issuer: "Coursera / Meta",
    issued: "Nov 2023",
    credential_id: "META-FE-77821",
    link: "https://example.com/verify/meta",
    notes: "Advanced React patterns, testing, accessibility, and UX fundamentals.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
  },
  {
    title: "Google UX Design",
    issuer: "Coursera / Google",
    issued: "Aug 2023",
    credential_id: "G-UX-55019",
    link: "https://example.com/verify/google-ux",
    notes: "User research, prototyping, and design handoff workflows.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
  },
  {
    title: "Professional Scrum Master I",
    issuer: "Scrum.org",
    issued: "May 2022",
    credential_id: "PSM-I-00912",
    link: "https://example.com/verify/psm",
    notes: "Agile facilitation, sprint planning, and team delivery excellence.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop",
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
    description: "Immersive 3D space with floating shapes and interactive navigation.",
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
  projectPage: 1,
  certQuery: "",
  certSort: "newest",
  galleryFilter: "all",
  activeTimelineFilter: "all",
  timelineExpandedAll: false,
  activeTab: SECTION_KEYS.ALL,
};

const DEFAULT_QUERY = "querying portfolio: Gene Elpie Landoy.";

let animatedEntryObserver = null;

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
    window.setTimeout(() => reject(new Error("Request timed out.")), milliseconds);
  });
}

function disableBrowserScrollRestoration() {
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }
}

function forceScrollTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function clearStartupHash() {
  if (!window.location.hash || window.location.hash === "#top") {
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

function withSafeStorageRead(key, fallbackValue = "") {
  try {
    return window.localStorage.getItem(key) ?? fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function withSafeStorageWrite(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors.
  }
}

function toast(message) {
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

function scrollToEl(selector) {
  const element = $(selector);
  if (!element) {
    return;
  }

  element.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openFlexModal(selector) {
  const modal = $(selector);
  if (!modal) {
    return;
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
}

function closeFlexModal(selector) {
  const modal = $(selector);
  if (!modal) {
    return;
  }

  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.style.overflow = "";
}

function setResultsMeta(query) {
  const countElement = $("#resultsCount");
  const timeElement = $("#resultsTime");
  const titleBase = "Gene Elpie Landoy | Retro Search Portfolio";
  const resultBase = 700000 + Math.floor(Math.random() * 900000);
  const seconds = (Math.random() * 0.09 + 0.01).toFixed(3);

  if (countElement) {
    countElement.textContent = `About ${resultBase.toLocaleString()} results`;
  }

  if (timeElement) {
    timeElement.textContent = `(${seconds} seconds)`;
  }

  document.title = query ? `${query} | Retro Search` : titleBase;
}

function copyToClipboard(text, successMessage = "Copied") {
  navigator.clipboard
    .writeText(text)
    .then(() => toast(successMessage))
    .catch(() => toast("Copy failed"));
}

function isPreviewModeForSection(sectionKey) {
  return STATE.activeTab === SECTION_KEYS.ALL && sectionKey !== SECTION_KEYS.ALL;
}

function limitForSection(sectionKey, fullCount) {
  if (!isPreviewModeForSection(sectionKey)) {
    return fullCount;
  }

  // Gallery shows only 2 items in preview mode
  if (sectionKey === SECTION_KEYS.GALLERY) {
    return 2;
  }

  return PREVIEW_ITEM_LIMIT;
}

function sliceForPreview(items, sectionKey) {
  return items.slice(0, limitForSection(sectionKey, items.length));
}

function paginateItems(items, page, pageSize) {
  const safePageSize = Math.max(1, pageSize);
  const safeTotalPages = Math.max(1, Math.ceil(items.length / safePageSize));
  const safePage = clamp(page, 1, safeTotalPages);
  const startIndex = (safePage - 1) * safePageSize;
  const endIndex = startIndex + safePageSize;

  return {
    page: safePage,
    totalPages: safeTotalPages,
    totalItems: items.length,
    items: items.slice(startIndex, endIndex),
  };
}

function applyEntryAnimations(root) {
  if (!root) {
    return;
  }

  const animatedNodes = $$('[data-animate="true"]', root);

  animatedNodes.forEach((node, index) => {
    node.style.setProperty("--enter-delay", `${index * ANIMATION_STAGGER_MS}ms`);
    if (animatedEntryObserver) {
      animatedEntryObserver.observe(node);
    } else {
      node.classList.add("is-visible");
    }
  });
}

function injectDynamicStyles() {
  if (document.getElementById("portfolio-dynamic-styles")) {
    return;
  }

  const styleElement = document.createElement("style");
  styleElement.id = "portfolio-dynamic-styles";
  styleElement.textContent = `
    [data-animate="true"] {
      opacity: 0;
      transform: translateY(18px) scale(0.985);
      transition: opacity 520ms ease, transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
      transition-delay: var(--enter-delay, 0ms);
      will-change: transform, opacity;
    }

    [data-animate="true"].is-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    .js-enhanced-card,
    .image-card,
    .project-card,
    .cert-card,
    .gallery-card,
    .timeline-card {
      transition:
        transform 220ms ease,
        box-shadow 220ms ease,
        border-color 220ms ease,
        background-color 220ms ease;
      will-change: transform;
    }

    .js-enhanced-card:hover,
    .image-card:hover,
    .project-card:hover,
    .cert-card:hover,
    .gallery-card:hover,
    .timeline-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 14px 34px rgb(var(--overlay-rgb) / var(--overlay-alpha));
    }

    .project-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .project-card-body,
    .cert-card-body,
    .gallery-card-body {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .card-action-row {
      margin-top: auto;
    }

    .js-preview-card,
    .js-pager,
    .js-empty-card {
      border-radius: 1rem;
      border: 1px solid rgb(var(--text-main) / 0.08);
      background: rgb(var(--text-main) / 0.03);
      backdrop-filter: blur(8px);
    }

    .js-preview-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.1rem;
      margin-top: 1rem;
    }

    .js-preview-card .info {
      min-width: 0;
    }

    .js-preview-card .title {
      color: rgb(var(--text-main));
      font-size: 0.95rem;
      font-weight: 700;
    }

    .js-preview-card .meta {
      margin-top: 0.25rem;
      color: rgb(var(--text-muted));
      font-size: 0.78rem;
    }

    .js-preview-button,
    .js-page-button {
      border: 1px solid rgb(var(--text-main) / 0.1);
      border-radius: 999px;
      background: rgb(var(--text-main) / 0.04);
      color: rgb(var(--text-main));
      padding: 0.55rem 0.95rem;
      font-size: 0.78rem;
      transition: background-color 180ms ease, border-color 180ms ease, transform 180ms ease;
    }

    .js-preview-button:hover,
    .js-page-button:hover {
      background: rgb(var(--text-main) / 0.08);
      border-color: rgb(var(--text-main) / 0.16);
      transform: translateY(-1px);
    }

    .js-pager {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 0.55rem;
      margin-top: 1rem;
      padding: 1rem;
    }

    .js-page-button.is-active {
      border-color: rgb(var(--surface-button) / 0.45);
      background: rgb(var(--surface-button) / 0.14);
      box-shadow: 0 0 0 1px rgb(var(--surface-button) / 0.18);
    }

    .js-page-status {
      width: 100%;
      text-align: center;
      color: rgb(var(--text-muted));
      font-size: 0.76rem;
    }

    .js-grid-anchor {
      width: 100%;
    }

    @media (max-width: 640px) {
      .js-preview-card {
        flex-direction: column;
        align-items: flex-start;
      }

      .js-preview-button,
      .js-page-button {
        width: 100%;
        text-align: center;
      }
    }
  `;

  document.head.appendChild(styleElement);
}

function initEntryObserver() {
  if (!("IntersectionObserver" in window)) {
    return;
  }

  animatedEntryObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
  );
}

function createPreviewFooter(sectionKey, hiddenCount, label) {
  const wrapper = document.createElement("div");
  wrapper.className = "js-preview-card js-grid-anchor";
  wrapper.dataset.animate = "true";

  wrapper.innerHTML = `
    <div class="info min-w-0">
      <div class="title">${escapeHtml(label)}</div>
      <div class="meta">${hiddenCount} more item${hiddenCount > 1 ? "s" : ""} hidden in preview mode</div>
    </div>
    <button type="button" class="js-preview-button f-ring">Open full section</button>
  `;

  $("button", wrapper)?.addEventListener("click", () => {
    setTab(sectionKey);
    window.setTimeout(() => scrollToEl(`#section-${sectionKey}`), 120);
  });

  return wrapper;
}

function ensureSiblingMount(baseElement, id) {
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

function renderSectionPreviewMount(baseSelector, sectionKey, totalCount, visibleCount, label) {
  const baseElement = $(baseSelector);
  if (!baseElement) {
    return;
  }

  const mount = ensureSiblingMount(baseElement, `${sectionKey}PreviewMount`);
  if (!mount) {
    return;
  }

  mount.innerHTML = "";

  const hiddenCount = totalCount - visibleCount;
  if (!isPreviewModeForSection(sectionKey) || hiddenCount <= 0) {
    return;
  }

  mount.appendChild(createPreviewFooter(sectionKey, hiddenCount, label));
  applyEntryAnimations(mount);
}

function renderEmptyState(root, message) {
  root.innerHTML = `
    <div class="js-empty-card rounded-xl border border-borderDim bg-bgDark p-4 text-sm text-gray-400">
      ${escapeHtml(message)}
    </div>
  `;
}

/* =========================
   Knowledge panel
========================= */
function mountKnowledgePanels() {
  const template = $("#kpTemplate");
  const desktopMount = $("#kpDesktopMount");
  const mobileMount = $("#kpMobileMount");

  if (!template || !desktopMount || !mobileMount) {
    return;
  }

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
    const documentElement = document.documentElement;
    const maxScroll = Math.max(1, documentElement.scrollHeight - documentElement.clientHeight);
    const progress = (documentElement.scrollTop / maxScroll) * 100;

    if (scrollBar) {
      scrollBar.style.width = `${progress}%`;
    }

    if (buttonTop) {
      buttonTop.classList.toggle("hidden", documentElement.scrollTop < 600);
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
  if (!resultsArea) {
    return;
  }

  $$('[data-ai-results="true"]', resultsArea).forEach((node) => node.remove());
}

function renderAiResultBox(query, state) {
  const resultsArea = $("#resultsArea");
  if (!resultsArea) {
    return null;
  }

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
        <div class="h-3 w-2/3 rounded bg-gray-200"></div>
        <div class="mt-2 h-3 w-5/6 rounded bg-gray-200"></div>
        <div class="mt-2 h-3 w-1/2 rounded bg-gray-200"></div>
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
        <button type="button" class="f-ring rounded-xl border border-borderDim bg-bgPanel px-2 py-1.5 text-xs transition-colors" data-ai-open="projects">Projects</button>
        <button type="button" class="f-ring rounded-xl border border-borderDim bg-bgPanel px-2 py-1.5 text-xs transition-colors" data-ai-open="timeline">Timeline</button>
        <button type="button" class="f-ring rounded-xl border border-borderDim bg-bgPanel px-2 py-1.5 text-xs transition-colors" data-ai-open="certificates">Certificates</button>
        <button type="button" class="f-ring rounded-xl border border-borderDim bg-bgPanel px-2 py-1.5 text-xs transition-colors" data-ai-open="gallery">Gallery</button>
      </div>
    `;

    $$('[data-ai-open]', wrapper).forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.getAttribute("data-ai-open");
        if (!key) {
          return;
        }

        setTab(key);
        window.setTimeout(() => scrollToEl(`#section-${key}`), 120);
      });
    });
  }

  resultsArea.prepend(wrapper);
  return wrapper;
}

async function runQuery() {
  const query = ($("#searchInput")?.value || "").trim();
  if (!query) {
    return;
  }

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
    window.setTimeout(() => $("#searchShell")?.classList.remove("is-hot"), 650);
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
    { tab: SECTION_KEYS.IMAGES, query: "visual portfolio highlights" },
    { tab: SECTION_KEYS.PROJECTS, query: "best projects and case studies" },
    { tab: SECTION_KEYS.TIMELINE, query: "career timeline and milestones" },
    { tab: SECTION_KEYS.CERTIFICATES, query: "verified certificates and credentials" },
    { tab: SECTION_KEYS.ACHIEVEMENTS, query: "awards and competition history" },
    { tab: SECTION_KEYS.GALLERY, query: "creative coding and visual experiments" },
    { tab: SECTION_KEYS.ABOUT, query: "about gene elpie landoy" },
  ];

  const picked = picks[Math.floor(Math.random() * picks.length)];
  const input = $("#searchInput");

  if (input) {
    input.value = picked.query;
  }

  $("#btnClear")?.classList.remove("hidden");
  setResultsMeta(picked.query);
  setTab(picked.tab);

  window.setTimeout(() => {
    scrollToEl(`#section-${picked.tab}`);
  }, 220);

  toast(`Warping to ${picked.tab}...`);
}

function typeIntoInput(text, speedMin = 25, speedMax = 55) {
  const input = $("#searchInput");
  const clearButton = $("#btnClear");
  const shell = $("#searchShell");

  if (!input) {
    return;
  }

  input.value = "";
  clearButton?.classList.add("hidden");

  let index = 0;

  function step() {
    if (index < text.length) {
      input.value += text.charAt(index);
      index += 1;
      clearButton?.classList.remove("hidden");
      window.setTimeout(step, Math.random() * (speedMax - speedMin) + speedMin);
      return;
    }

    shell?.classList.add("is-hot");
    window.setTimeout(() => shell?.classList.remove("is-hot"), 700);
    setResultsMeta(input.value);
  }

  window.setTimeout(step, 350);
}

/* =========================
   Tabs and rerendering
========================= */
function updateTabButtonState(tab) {
  $$(".tab-btn").forEach((button) => {
    const isActive = button.dataset.tab === tab;
    button.classList.toggle("border-gBlue", isActive);
    button.classList.toggle("text-white", isActive);
    button.classList.toggle("shadow-glow", isActive);
  });
}

function updateSectionVisibility(tab) {
  $$('[data-section]').forEach((section) => {
    const key = section.getAttribute("data-section");
    const visible = tab === SECTION_KEYS.ALL || tab === key;
    section.classList.toggle("hidden", !visible);
  });
}

function rerenderContentSections() {
  renderImages(IMAGE_ITEMS);
  renderProjects();
  renderTimeline();
  renderCertificates();
  renderAchievements();
  renderGallery();
}

function setTab(tab) {
  const normalizedTab = tab || SECTION_KEYS.ALL;
  STATE.activeTab = normalizedTab;

  if (normalizedTab !== SECTION_KEYS.PROJECTS) {
    STATE.projectPage = 1;
  }

  withSafeStorageWrite(STORAGE_KEYS.TAB, normalizedTab);
  updateTabButtonState(normalizedTab);
  updateSectionVisibility(normalizedTab);
  rerenderContentSections();

  const query = $("#searchInput")?.value || "";
  setResultsMeta(normalizedTab === SECTION_KEYS.ALL ? query : `${normalizedTab} results`);

  // Auto-scroll to top when switching tabs
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =========================
   Lightbox
========================= */
let touchStartX = 0;

function setLightboxItems(items) {
  STATE.lightboxItems = items;
}

function openLightbox(index) {
  if (!STATE.lightboxItems.length) {
    return;
  }

  STATE.lightboxIndex = clamp(index, 0, STATE.lightboxItems.length - 1);
  const item = STATE.lightboxItems[STATE.lightboxIndex];
  const title = $("#lightboxTitle");
  const image = $("#lightboxImg");

  if (title) {
    title.textContent = item.title;
  }

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
  if (!STATE.lightboxItems.length) {
    return;
  }

  STATE.lightboxIndex =
    (STATE.lightboxIndex + delta + STATE.lightboxItems.length) % STATE.lightboxItems.length;

  const item = STATE.lightboxItems[STATE.lightboxIndex];
  const title = $("#lightboxTitle");
  const image = $("#lightboxImg");

  if (title) {
    title.textContent = item.title;
  }

  if (image) {
    image.src = item.src;
    image.alt = item.alt || item.title;
  }
}

function setupLightboxSwipe() {
  const image = $("#lightboxImg");
  if (!image) {
    return;
  }

  image.addEventListener(
    "touchstart",
    (event) => {
      if (!event.touches?.length) {
        return;
      }
      touchStartX = event.touches[0].clientX;
    },
    { passive: true }
  );

  image.addEventListener(
    "touchend",
    (event) => {
      if (!event.changedTouches?.length) {
        return;
      }

      const endX = event.changedTouches[0].clientX;
      const delta = endX - touchStartX;

      if (Math.abs(delta) < 40) {
        return;
      }

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
  if (!grid) {
    return;
  }

  const visibleItems = sliceForPreview(items, SECTION_KEYS.IMAGES);
  STATE.currentImages = visibleItems;
  setLightboxItems(
    visibleItems.map((item) => ({
      title: item.title,
      src: item.src,
      alt: item.alt,
    }))
  );

  grid.innerHTML = "";

  visibleItems.forEach((item, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "image-card js-enhanced-card f-ring";
    card.setAttribute("aria-label", `Open image: ${item.title}`);
    card.dataset.animate = "true";

    card.innerHTML = `
      <div class="absolute left-2 top-2 z-10 rounded-full border border-borderDim bg-bgPanel px-1.5 py-0.5 text-[10px] text-gray-300">
        ${escapeHtml(String(item.tag || "").toUpperCase())}
      </div>
      <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt)}" loading="lazy" class="h-32 w-full object-cover opacity-95 sm:h-36" />
      <div class="p-3">
        <div class="clamp-2 text-xs font-medium text-gray-200">${escapeHtml(item.title)}</div>
      </div>
    `;

    card.addEventListener("click", () => openLightbox(index));
    grid.appendChild(card);
  });

  renderSectionPreviewMount(
    "#imageGrid",
    SECTION_KEYS.IMAGES,
    items.length,
    visibleItems.length,
    "Image highlights"
  );
  applyEntryAnimations(grid);
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
    <span class="rounded-full border border-borderDim bg-bgPanel px-1.5 py-0.5 text-[11px] ${classMap[tag] || "text-gray-300"}">
      ${escapeHtml(tag)}
    </span>
  `;
}

function getFilteredTimelineItems() {
  return TIMELINE_ITEMS.filter((item) => {
    if (STATE.activeTimelineFilter === "all") {
      return true;
    }
    return (item.tags || []).includes(STATE.activeTimelineFilter);
  });
}

function renderTimeline() {
  const list = $("#timelineList");
  if (!list) {
    return;
  }

  list.innerHTML = "";
  const filteredItems = getFilteredTimelineItems();
  const visibleItems = sliceForPreview(filteredItems, SECTION_KEYS.TIMELINE);

  if (!filteredItems.length) {
    renderEmptyState(list, "No timeline entries match that filter.");
    return;
  }

  visibleItems.forEach((item) => {
    const wrapper = document.createElement("div");
    wrapper.className = "timeline-item";
    wrapper.dataset.animate = "true";

    const tags = (item.tags || []).map(getTimelineTagPill).join(" ");
    const metrics = (item.metrics || [])
      .map(
        (metric) => `
          <span class="rounded-full border border-borderDim bg-bgPanel px-1.5 py-0.5 text-[11px] text-gray-300">
            ${escapeHtml(metric)}
          </span>
        `
      )
      .join("");

    const stack = (item.stack || [])
      .map(
        (stackItem) => `
          <span class="rounded-full border border-borderDim bg-bgPanel px-1.5 py-0.5 text-[11px] text-gray-400">
            ${escapeHtml(stackItem)}
          </span>
        `
      )
      .join("");

    wrapper.innerHTML = `
      <div class="timeline-dot" aria-hidden="true"></div>
      <div class="timeline-card js-enhanced-card">
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

    if (STATE.timelineExpandedAll && !isPreviewModeForSection(SECTION_KEYS.TIMELINE)) {
      button?.setAttribute("aria-expanded", "true");
      panel?.classList.remove("hidden");
    }

    list.appendChild(wrapper);
  });

  renderSectionPreviewMount(
    "#timelineList",
    SECTION_KEYS.TIMELINE,
    filteredItems.length,
    visibleItems.length,
    "Timeline preview"
  );
  applyEntryAnimations(list);
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
    if (!query) {
      return true;
    }

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
  article.className = "project-card js-enhanced-card";
  article.dataset.animate = "true";
  article.style.cursor = "pointer";
  article.setAttribute("role", "button");
  article.setAttribute("tabindex", "0");

  article.innerHTML = `
    <div class="project-thumb">
      <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)}" loading="lazy" />
      <div class="project-badge-row">
        <span class="project-badge text-gBlue">${escapeHtml(project.category)}</span>
        <span class="project-badge text-gYellow">score ${escapeHtml(String(project.score || 0))}</span>
      </div>
      
      <!-- Hover overlay with project details -->
      <div class="project-hover-overlay">
        <div class="project-hover-content">
          <div class="text-base font-bold text-white mb-1 leading-tight">${escapeHtml(project.title)}</div>
          <div class="text-xs text-gray-400 mb-3">${escapeHtml(project.role)}</div>
          <div class="text-xs text-gray-300 leading-relaxed mb-3">${escapeHtml(project.description)}</div>
          <div class="text-[10px] text-gray-500 uppercase tracking-wide mb-1.5">Tech Stack</div>
          <div class="project-hover-tech">${techHtml}</div>
        </div>
      </div>
    </div>
  `;

  // Make the entire card clickable to open the modal
  article.addEventListener("click", () => {
    openProjectModal(project);
  });

  // Add keyboard support
  article.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProjectModal(project);
    }
  });

  return article;
}

function renderProjectPagination(totalItems) {
  const grid = $("#projectsGrid");
  if (!grid) {
    return;
  }

  const mount = ensureSiblingMount(grid, "projectPaginationMount");
  if (!mount) {
    return;
  }

  mount.innerHTML = "";

  if (isPreviewModeForSection(SECTION_KEYS.PROJECTS)) {
    return;
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / PROJECTS_PER_PAGE));
  if (totalPages <= 1) {
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "js-pager";
  wrapper.dataset.animate = "true";

  const previousButton = document.createElement("button");
  previousButton.type = "button";
  previousButton.className = "js-page-button f-ring";
  previousButton.textContent = "Previous";
  previousButton.disabled = STATE.projectPage <= 1;
  previousButton.style.opacity = previousButton.disabled ? "0.45" : "1";
  previousButton.addEventListener("click", () => {
    if (STATE.projectPage <= 1) {
      return;
    }
    STATE.projectPage -= 1;
    renderProjects();
    scrollToEl("#section-projects");
  });

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.className = "js-page-button f-ring";
  nextButton.textContent = "Next";
  nextButton.disabled = STATE.projectPage >= totalPages;
  nextButton.style.opacity = nextButton.disabled ? "0.45" : "1";
  nextButton.addEventListener("click", () => {
    if (STATE.projectPage >= totalPages) {
      return;
    }
    STATE.projectPage += 1;
    renderProjects();
    scrollToEl("#section-projects");
  });

  wrapper.appendChild(previousButton);

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    const pageButton = document.createElement("button");
    pageButton.type = "button";
    pageButton.className = "js-page-button f-ring";
    if (pageNumber === STATE.projectPage) {
      pageButton.classList.add("is-active");
    }
    pageButton.textContent = String(pageNumber);
    pageButton.addEventListener("click", () => {
      STATE.projectPage = pageNumber;
      renderProjects();
      scrollToEl("#section-projects");
    });
    wrapper.appendChild(pageButton);
  }

  wrapper.appendChild(nextButton);

  const status = document.createElement("div");
  status.className = "js-page-status";
  status.textContent = `Showing ${Math.min(totalItems, (STATE.projectPage - 1) * PROJECTS_PER_PAGE + 1)}-${Math.min(totalItems, STATE.projectPage * PROJECTS_PER_PAGE)} of ${totalItems} projects`;
  wrapper.appendChild(status);

  mount.appendChild(wrapper);
  applyEntryAnimations(mount);
}

function renderProjects() {
  const grid = $("#projectsGrid");
  if (!grid) {
    return;
  }

  grid.innerHTML = "";

  const filteredItems = getSortedProjects(filterProjects());
  const previewMode = isPreviewModeForSection(SECTION_KEYS.PROJECTS);
  let visibleItems = [];

  if (previewMode) {
    visibleItems = sliceForPreview(filteredItems, SECTION_KEYS.PROJECTS);
  } else {
    const pageData = paginateItems(filteredItems, STATE.projectPage, PROJECTS_PER_PAGE);
    STATE.projectPage = pageData.page;
    visibleItems = pageData.items;
  }

  if (!filteredItems.length) {
    renderEmptyState(grid, "No projects found. Try a different filter.");
    renderProjectPagination(0);
    return;
  }

  visibleItems.forEach((project) => {
    grid.appendChild(buildProjectCard(project));
  });

  $$('[data-project-open]', grid).forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-project-open");
      const project = PROJECTS.find((item) => item.id === id);
      if (!project) {
        return;
      }
      openProjectModal(project);
    });
  });

  renderSectionPreviewMount(
    "#projectsGrid",
    SECTION_KEYS.PROJECTS,
    filteredItems.length,
    visibleItems.length,
    "Project preview"
  );
  renderProjectPagination(filteredItems.length);
  applyEntryAnimations(grid);
}

function openProjectModal(project) {
  const title = $("#projectModalTitle");
  const image = $("#projectModalImg");
  const meta = $("#projectModalMeta");
  const impact = $("#projectModalImpact");
  const description = $("#projectModalDesc");
  const role = $("#projectModalRole");
  const outcome = $("#projectModalOutcome");
  const techRoot = $("#projectModalTech");
  const highlightRoot = $("#projectModalHighlights");
  const demo = $("#projectModalDemo");
  const repo = $("#projectModalRepo");

  if (title) {
    title.textContent = project.title;
  }

  if (image) {
    image.src = project.image || "";
    image.alt = project.title;
  }

  if (meta) {
    meta.textContent = `${project.category} · ${project.year} · ${project.status || "build"}`;
  }

  if (impact) {
    impact.textContent = project.impact || "";
  }

  if (description) {
    description.textContent = project.description || "";
  }

  if (role) {
    role.textContent = project.role || "";
  }

  if (outcome) {
    outcome.textContent = project.outcome || "";
  }

  if (techRoot) {
    techRoot.innerHTML = "";
    (project.tech || []).forEach((item) => {
      const chip = document.createElement("span");
      chip.className =
        "rounded-full border border-borderDim bg-bgPanel px-1.5 py-0.5 text-[11px] text-gray-300";
      chip.textContent = item;
      techRoot.appendChild(chip);
    });
  }

  if (highlightRoot) {
    highlightRoot.innerHTML = "";
    (project.highlights || []).forEach((item) => {
      const listItem = document.createElement("li");
      listItem.textContent = `• ${item}`;
      highlightRoot.appendChild(listItem);
    });
  }

  if (demo) {
    demo.href = project.demo || "#";
  }

  if (repo) {
    repo.href = project.repo || "#";
  }

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
  if (parts.length !== 2) {
    return new Date(2000, 0, 1);
  }

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
    if (!query) {
      return true;
    }

    const haystack = [cert.title, cert.issuer, cert.issued, cert.credential_id, cert.notes]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

function buildCertificateCard(cert) {
  const article = document.createElement("article");
  article.className = "cert-card js-enhanced-card";
  article.dataset.animate = "true";
  article.style.cursor = "pointer";

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
      
      <!-- Hover overlay with description -->
      <div class="cert-hover-overlay">
        <div class="cert-hover-content">
          <div class="text-sm font-semibold text-white mb-2">${escapeHtml(cert.title)}</div>
          <div class="text-xs text-gray-300">${escapeHtml(cert.notes)}</div>
        </div>
      </div>
    </div>
  `;

  // Make card clickable to open modal
  article.addEventListener("click", () => {
    openCertificateModal(cert);
  });

  return article;
}

function renderCertificates() {
  const grid = $("#certGrid");
  if (!grid) {
    return;
  }

  grid.innerHTML = "";
  const filteredItems = getSortedCertificates(filterCertificates());
  const visibleItems = sliceForPreview(filteredItems, SECTION_KEYS.CERTIFICATES);

  if (!filteredItems.length) {
    renderEmptyState(grid, "No certificates found. Try a different filter.");
    return;
  }

  visibleItems.forEach((cert) => {
    grid.appendChild(buildCertificateCard(cert));
  });

  $$('[data-cert-open]', grid).forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-cert-open");
      const cert = CERTS.find((item) => item.credential_id === id);
      if (!cert) {
        return;
      }
      openCertificateModal(cert);
    });
  });

  renderSectionPreviewMount(
    "#certGrid",
    SECTION_KEYS.CERTIFICATES,
    filteredItems.length,
    visibleItems.length,
    "Certificate preview"
  );
  applyEntryAnimations(grid);
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

  if (title) {
    title.textContent = cert.title;
  }

  if (issuer) {
    issuer.textContent = cert.issuer;
  }

  if (issued) {
    issued.textContent = cert.issued;
  }

  if (credentialId) {
    credentialId.textContent = cert.credential_id;
  }

  if (notes) {
    notes.textContent = cert.notes;
  }

  if (link) {
    link.href = cert.link || "#";
  }

  if (image) {
    image.src = cert.image || "";
    image.alt = cert.title;
  }

  setLightboxItems([
    {
      title: cert.title,
      src: cert.image,
      alt: cert.title,
    },
  ]);

  const openFullView = () => openLightbox(0);

  if (imageButton) {
    imageButton.onclick = openFullView;
  }

  if (fullViewButton) {
    fullViewButton.onclick = openFullView;
  }

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
  if (!grid) {
    return;
  }

  grid.innerHTML = "";
  const visibleItems = sliceForPreview(ACHIEVEMENTS, SECTION_KEYS.ACHIEVEMENTS);

  visibleItems.forEach((item) => {
    const card = document.createElement("div");
    card.className =
      "js-enhanced-card rounded-xl border border-borderDim bg-bgDark p-4 transition-colors hover:border-gBlue/30";
    card.dataset.animate = "true";

    card.innerHTML = `
      <div class="flex items-center justify-between gap-3">
        <span class="rounded-full border border-borderDim bg-bgPanel px-1.5 py-0.5 text-[11px] text-${escapeHtml(item.badgeColor)}">${escapeHtml(item.badge)}</span>
        <span class="text-xs text-gray-500">${escapeHtml(item.meta)}</span>
      </div>
      <div class="mt-3 text-sm font-bold text-white">${escapeHtml(item.title)}</div>
      <div class="mt-2 text-xs leading-relaxed text-gray-400">${escapeHtml(item.desc)}</div>
    `;

    grid.appendChild(card);
  });

  renderSectionPreviewMount(
    "#achGrid",
    SECTION_KEYS.ACHIEVEMENTS,
    ACHIEVEMENTS.length,
    visibleItems.length,
    "Achievement preview"
  );
  applyEntryAnimations(grid);
}

function animateCounters() {
  const counters = $$(".counter");
  if (!counters.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const element = entry.target;
        const target = Number(element.dataset.target || "0");
        const duration = 950 + Math.random() * 550;
        const startTime = performance.now();

        observer.unobserve(element);

        function tick(timestamp) {
          const progress = clamp((timestamp - startTime) / duration, 0, 1);
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
    if (STATE.galleryFilter === "all") {
      return true;
    }

    if (STATE.galleryFilter === "featured") {
      return Boolean(item.featured);
    }

    return item.category === STATE.galleryFilter;
  });
}

function renderGallery() {
  const grid = $("#galleryGrid");
  if (!grid) {
    return;
  }

  grid.innerHTML = "";
  const filteredItems = filterGalleryItems();
  const visibleItems = sliceForPreview(filteredItems, SECTION_KEYS.GALLERY);

  if (!filteredItems.length) {
    renderEmptyState(grid, "No gallery items match that filter.");
    return;
  }

  visibleItems.forEach((item) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "gallery-card js-enhanced-card f-ring text-left";
    card.dataset.animate = "true";

    const badge = item.featured
      ? '<span class="rounded-full border border-borderDim bg-bgPanel px-1.5 py-0.5 text-[10px] text-gYellow">featured</span>'
      : `<span class="rounded-full border border-borderDim bg-bgPanel px-1.5 py-0.5 text-[10px] text-gray-400">${escapeHtml(item.category)}</span>`;

    const techHtml = (item.tech || [])
      .slice(0, GALLERY_TECH_LIMIT)
      .map((tech) => `<span class="gallery-chip">${escapeHtml(tech)}</span>`)
      .join("");

    card.innerHTML = `
      <div class="gallery-thumb">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy" class="gallery-thumb-img" />
        <div class="gallery-badge">${badge}</div>
        
        <!-- Hover overlay with gallery details -->
        <div class="gallery-hover-overlay">
          <div class="gallery-hover-content">
            <div class="text-base font-bold text-white mb-1 leading-tight">${escapeHtml(item.title)}</div>
            <div class="text-xs text-gray-300 leading-relaxed mb-3">${escapeHtml(item.description)}</div>
            <div class="text-[10px] text-gray-500 uppercase tracking-wide mb-1.5">Tech Stack</div>
            <div class="gallery-hover-tech">${techHtml}</div>
          </div>
        </div>
      </div>
    `;

    card.addEventListener("click", () => openGalleryModal(item));
    grid.appendChild(card);
  });

  renderSectionPreviewMount(
    "#galleryGrid",
    SECTION_KEYS.GALLERY,
    filteredItems.length,
    visibleItems.length,
    "Gallery preview"
  );
  applyEntryAnimations(grid);
}

function openGalleryModal(item) {
  const title = $("#galleryModalTitle");
  const image = $("#galleryModalImg");
  const meta = $("#galleryModalMeta");
  const description = $("#galleryModalDesc");
  const techRoot = $("#galleryModalTech");
  const demo = $("#galleryModalDemo");
  const copyButton = $("#btnCopyGalleryItem");

  if (title) {
    title.textContent = item.title;
  }

  if (image) {
    image.src = item.image;
    image.alt = item.title;
  }

  if (meta) {
    meta.textContent = `Category: ${item.category}${item.featured ? " · Featured" : ""}`;
  }

  if (description) {
    description.textContent = item.description;
  }

  if (demo) {
    demo.href = item.demo || "#";
  }

  if (techRoot) {
    techRoot.innerHTML = "";
    (item.tech || []).forEach((tech) => {
      const chip = document.createElement("span");
      chip.className =
        "rounded-full border border-borderDim bg-bgDark px-1.5 py-0.5 text-[11px] text-gray-300";
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
  return safeJsonParse(withSafeStorageRead(STORAGE_KEYS.SAVED, "[]"), []);
}

function setSavedSearches(list) {
  withSafeStorageWrite(STORAGE_KEYS.SAVED, JSON.stringify(list.slice(0, 20)));
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
  if (!root) {
    return;
  }

  const list = getSavedSearches();
  root.innerHTML = "";

  if (!list.length) {
    renderEmptyState(root, "No saved searches yet.");
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
        <button type="button" class="f-ring rounded-xl border border-borderDim bg-bgPanel px-2 py-1.5 text-xs transition-colors" data-load="${index}">Load</button>
        <button type="button" class="f-ring rounded-xl border border-borderDim bg-bgPanel px-2 py-1.5 text-xs transition-colors" data-del="${index}">Del</button>
      </div>
    `;

    root.appendChild(row);
  });

  $$('[data-load]', root).forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.load);
      const item = getSavedSearches()[index];
      const input = $("#searchInput");

      if (!item || !input) {
        return;
      }

      input.value = item.q;
      $("#btnClear")?.classList.remove("hidden");
      setResultsMeta(item.q);
      closeSavedModal();
      toast("Loaded");
    });
  });

  $$('[data-del]', root).forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.del);
      const listItems = getSavedSearches();
      listItems.splice(index, 1);
      setSavedSearches(listItems);
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
  { label: "Tab: All", run: () => setTab(SECTION_KEYS.ALL) },
  { label: "Tab: Images", run: () => setTab(SECTION_KEYS.IMAGES) },
  { label: "Tab: Projects", run: () => setTab(SECTION_KEYS.PROJECTS) },
  { label: "Tab: Timeline", run: () => setTab(SECTION_KEYS.TIMELINE) },
  { label: "Tab: Certificates", run: () => setTab(SECTION_KEYS.CERTIFICATES) },
  { label: "Tab: Achievements", run: () => setTab(SECTION_KEYS.ACHIEVEMENTS) },
  { label: "Tab: Gallery", run: () => setTab(SECTION_KEYS.GALLERY) },
  { label: "Tab: About", run: () => setTab(SECTION_KEYS.ABOUT) },
  { label: "Open: Saved searches", run: () => openSavedModal() },
  { label: "Open: Profile panel", run: () => openProfileDrawer() },
  { label: "Action: Run query", run: () => runQuery() },
  { label: "Action: Feeling Futuristic", run: () => feelingFuturistic() },
];

function renderCommandList(query = "") {
  const list = $("#cmdList");
  if (!list) {
    return;
  }

  const normalized = String(query).trim().toLowerCase();
  const items = COMMANDS.filter((command) => {
    if (!normalized) {
      return true;
    }
    return command.label.toLowerCase().includes(normalized);
  }).slice(0, 12);

  list.innerHTML = "";

  if (!items.length) {
    renderEmptyState(list, "No commands found.");
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
  if (!drawer) {
    return;
  }

  drawer.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeProfileDrawer() {
  const drawer = $("#kpDrawer");
  if (!drawer) {
    return;
  }

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

  if (status) {
    status.textContent = "Sending...";
  }

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.ok) {
      const message = data?.error || "Send failed.";
      if (status) {
        status.textContent = message;
      }
      toast(message);
      return;
    }

    if (status) {
      status.textContent = "Sent! Saved on server.";
    }

    form.reset();
    toast("Message sent");
  } catch {
    if (status) {
      status.textContent = "Network error.";
    }
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
      if (!tab) {
        return;
      }

      setTab(tab);
    });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    const trigger = target?.closest?.("[data-scrollto]");

    if (!trigger) {
      return;
    }

    const destination = trigger.getAttribute("data-scrollto");
    if (!destination) {
      return;
    }

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
    if (input) {
      input.value = "";
    }

    $("#btnClear")?.classList.add("hidden");
    clearAiResultBoxes();
    setResultsMeta("");
    toast("Cleared");
  });

  $("#btnVoice")?.addEventListener("click", () => {
    $("#searchShell")?.classList.add("is-hot");
    window.setTimeout(() => $("#searchShell")?.classList.remove("is-hot"), 600);
    toast("Voice search is a demo here");
  });

  $("#btnShuffleImages")?.addEventListener("click", () => {
    renderImages(shuffle(IMAGE_ITEMS));
    toast("Images shuffled");
  });

  $("#viewAllImages")?.addEventListener("click", () => {
    setTab(SECTION_KEYS.IMAGES);
    scrollToEl("#section-images");
  });

  $("#btnCloseLightbox")?.addEventListener("click", closeLightbox);
  $("#btnPrevImg")?.addEventListener("click", () => nextLightboxImage(-1));
  $("#btnNextImg")?.addEventListener("click", () => nextLightboxImage(1));

  $("#lightbox")?.addEventListener("click", (event) => {
    if (event.target?.dataset?.close === "true") {
      closeLightbox();
    }
  });

  $("#btnCloseProjectModal")?.addEventListener("click", closeProjectModal);
  $("#projectModal")?.addEventListener("click", (event) => {
    if (event.target?.dataset?.close === "true") {
      closeProjectModal();
    }
  });

  $("#btnCloseCertModal")?.addEventListener("click", closeCertificateModal);
  $("#certModal")?.addEventListener("click", (event) => {
    if (event.target?.dataset?.close === "true") {
      closeCertificateModal();
    }
  });

  $("#btnCloseGalleryModal")?.addEventListener("click", closeGalleryModal);
  $("#galleryModal")?.addEventListener("click", (event) => {
    if (event.target?.dataset?.close === "true") {
      closeGalleryModal();
    }
  });

  $$('[data-timeline-filter]').forEach((button) => {
    button.addEventListener("click", () => {
      STATE.activeTimelineFilter = button.dataset.timelineFilter || "all";

      $$('[data-timeline-filter]').forEach((item) => {
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
    STATE.projectPage = 1;
    renderProjects();
  });

  $("#projectSort")?.addEventListener("change", (event) => {
    STATE.projectSort = event.target.value;
    STATE.projectPage = 1;
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
    const shuffledItems = shuffle(GALLERY_ITEMS);
    GALLERY_ITEMS.length = 0;
    shuffledItems.forEach((item) => GALLERY_ITEMS.push(item));
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
    if (event.target?.dataset?.close === "true") {
      closeProfileDrawer();
    }
  });

  $("#btnSaveSearch")?.addEventListener("click", saveCurrentSearch);
  $("#btnOpenSaved")?.addEventListener("click", openSavedModal);
  $("#btnCloseSaved")?.addEventListener("click", closeSavedModal);
  $("#savedModal")?.addEventListener("click", (event) => {
    if (event.target?.dataset?.close === "true") {
      closeSavedModal();
    }
  });

  $("#btnCmd")?.addEventListener("click", openCommandPalette);
  $("#cmdPalette")?.addEventListener("click", (event) => {
    if (event.target?.dataset?.close === "true") {
      closeCommandPalette();
    }
  });

  $("#cmdInput")?.addEventListener("input", (event) => {
    renderCommandList(event.target.value);
  });

  $("#cmdInput")?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }

    const query = ($("#cmdInput")?.value || "").trim().toLowerCase();
    const hit = COMMANDS.find((command) => command.label.toLowerCase().includes(query)) || COMMANDS[0];
    closeCommandPalette();
    hit.run();
  });

  document.addEventListener("keydown", (event) => {
    const activeTagName = document.activeElement?.tagName?.toLowerCase?.() || "";
    const isTyping = ["input", "textarea"].includes(activeTagName);

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
  injectDynamicStyles();
  initEntryObserver();
  // stabilizeStartupScroll();

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

init();