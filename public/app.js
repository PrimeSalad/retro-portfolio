/**
 * RETRO-GOOGLE FUTURISTIC PORTFOLIO
 * File: app.js
 * Version: 2.5.0
 * Purpose:
 * - Interactivity (tabs, search UX, modals, timeline, projects, gallery, saved searches, command palette)
 * - AI Search (POST /api/search) — NO local-search fallback
 */

/* =========================
   Data (replace with yours)
========================= */
const IMAGE_ITEMS = [
  {
    title: "ICITE2025: International Conference on Information Technology Education",
    src: "images/events/icite.jpg",
    alt: "conference stage with speakers and audience",
    tag: "International Conference",
  },
  {
    title: "DICT - Hack for Gov 3",
    src: "images/events/hag2.jpg",
    alt: "Hack for Gov event with participants collaborating and presenting projects",
    tag: "Hackathon",
  },
  {
    title: "DICT - Hack for Gov 4",
    src: "images/events/hag.jpg",
    alt: "Hack for Gov event with participants collaborating and presenting projects",
    tag: "Hackathon",
  },
  {
    title: "CICS - Internship Onboarding",
    src: "images/events/event1.jpg",
    alt: "Conference audience",
    tag: "Event",
  },
  {
    title: "Infocus Publication and Broadcasting Team - Recognition",
    src: "images/events/recog.jpg",
    alt: "Recognition event with team members receiving awards on stage",
    tag: "Recognition",
  },
  {
    title: "Infocus Publication and Broadcasting Team - Accreditation",
    src: "images/events/infocus 1.jpg",
    alt: "Accreditation event with team members receiving awards on stage",
    tag: "Accreditation",
  },
];

const PROJECTS = [
  {
    id: "p1",
    title: "Orbit UI Kit",
    year: 2026,
    category: "Design System",
    role: "Lead Frontend / Maintainer",
    impact: "Adoption across 6 squads · A11y baseline +22pts · Bundle -18%",
    description:
      "Reusable components, motion primitives, and accessibility defaults. Token-driven theming, keyboard patterns, and consistent focus states.",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=70",
    tech: ["React", "TypeScript", "Tailwind", "Storybook", "A11y"],
    demo: "#",
    repo: "https://github.com",
    score: 95,
  },
  {
    id: "p2",
    title: "Telemetry Dashboard",
    year: 2025,
    category: "Observability",
    role: "Full-stack Engineer",
    impact: "Error budgets + release health · Faster triage · Incidents -25%",
    description:
      "Performance monitoring, error budgets, release health, and alerting views. Built for speed: caching, pagination, and smart defaults.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=70",
    tech: ["Node.js", "Postgres", "React", "Charts", "Caching"],
    demo: "#",
    repo: "https://github.com",
    score: 88,
  },
  {
    id: "p3",
    title: "API Gateway",
    year: 2024,
    category: "Platform",
    role: "Backend Engineer",
    impact: "Latency -30% · Rate limits · Observability built-in",
    description:
      "Gateway with caching, request tracing, consistent error envelopes, and rate limiting strategies for public and internal consumers.",
    image:
      "https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=1200&q=70",
    tech: ["Node.js", "Redis", "OpenTelemetry", "Rate Limiting"],
    demo: "#",
    repo: "https://github.com",
    score: 84,
  },
  {
    id: "p4",
    title: "Retro Search Portfolio",
    year: 2026,
    category: "UI/UX",
    role: "Designer + Frontend",
    impact: "Interactive portfolio · Keyboard-first UX · Fast UI",
    description:
      "Retro Google-style portfolio with tabs, command palette, modals, saved searches, and a real timeline layout.",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=70",
    tech: ["HTML", "Tailwind", "Vanilla JS", "UX"],
    demo: "#",
    repo: "https://github.com",
    score: 90,
  },
];

const TIMELINE_ITEMS = [
  {
    id: "t1",
    year: "2026",
    date: "Feb 2026",
    title: "Senior Frontend Engineer @ TechCorp OS",
    tags: ["engineering", "leadership"],
    bullets: [
      "Led React platform migration and component standardization.",
      "Improved LCP and TTI; shipped perf instrumentation and budgets.",
      "Raised accessibility score with consistent focus states and ARIA patterns.",
    ],
    metrics: ["Load time -40%", "A11y +22 pts", "Bundle -18%"],
    stack: ["React", "TypeScript", "Tailwind", "Vite"],
  },
  {
    id: "t2",
    year: "2025",
    date: "Oct 2025",
    title: "Open Source Sprint — UI Libraries",
    tags: ["engineering"],
    bullets: [
      "Contributed to design system primitives and documentation.",
      "Implemented token-driven theming and dark mode improvements.",
    ],
    metrics: ["PRs merged 60+", "Docs coverage +35%"],
    stack: ["TS", "Storybook", "MDX"],
  },
  {
    id: "t3",
    year: "2024",
    date: "Jun 2024",
    title: "Speaker — Future of Web Design Summit",
    tags: ["design", "leadership"],
    bullets: [
      "Talk: ‘Design Systems That Don’t Fight Engineers’.",
      "Shared practical a11y + performance patterns for product teams.",
    ],
    metrics: ["Audience 1,200+", "Q&A 30 mins"],
    stack: ["Design systems", "A11y", "Perf"],
  },
  {
    id: "t4",
    year: "2023",
    date: "Jan 2023",
    title: "Web Developer @ CyberDyne Digital",
    tags: ["engineering", "design"],
    bullets: [
      "Built responsive interfaces and improved UX consistency across pages.",
      "Collaborated with designers to implement pixel-perfect components.",
    ],
    metrics: ["Conversion +8%", "Bug reports -25%"],
    stack: ["Tailwind", "JS", "Node"],
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
  },
  {
    title: "Meta Front-End Developer",
    issuer: "Coursera / Meta",
    issued: "Nov 2023",
    credential_id: "META-FE-77821",
    link: "https://example.com/verify/meta",
    notes: "Advanced React patterns, testing, accessibility, and UX fundamentals.",
  },
  {
    title: "Google UX Design",
    issuer: "Coursera / Google",
    issued: "Aug 2023",
    credential_id: "G-UX-55019",
    link: "https://example.com/verify/google-ux",
    notes: "User research, prototyping, and design handoff workflows.",
  },
  {
    title: "Professional Scrum Master I",
    issuer: "Scrum.org",
    issued: "May 2022",
    credential_id: "PSM-I-00912",
    link: "https://example.com/verify/psm",
    notes: "Agile facilitation, sprint planning, and team delivery excellence.",
  },
];

const ACHIEVEMENTS = [
  {
    badge: "Winner",
    badgeColor: "gYellow",
    title: "Global Open Source Hackathon (2025)",
    desc: "Built a modular UI kit with token-driven theming and accessibility defaults.",
    meta: "Focus: DX + A11y",
  },
  {
    badge: "Speaker",
    badgeColor: "gRed",
    title: "Future of Web Design Summit (2024)",
    desc: "Presented practical design system patterns for faster shipping without UX drift.",
    meta: "Topic: systems + UI",
  },
  {
    badge: "Open Source",
    badgeColor: "gGreen",
    title: "100+ merged PRs",
    desc: "Contributions across UI libraries, docs, and performance improvements.",
    meta: "Areas: TS, docs, a11y",
  },
  {
    badge: "Performance",
    badgeColor: "gBlue",
    title: "Load time reduced by 40%",
    desc: "Audited bundles, reduced JS, tuned caching, and improved rendering paths.",
    meta: "Metrics: LCP, TTI",
  },
];

const GALLERY_ITEMS = [
  {
    title: "Neural Network Visualization",
    description: "Interactive WebGL visualization of neural network training with real-time particle effects",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=70",
    category: "webgl",
    demo: "#",
    tech: ["WebGL", "Three.js", "Shaders"],
    featured: true,
  },
  {
    title: "Fluid Dynamics Simulation",
    description: "Real-time fluid simulation using GPU compute shaders and interactive mouse controls",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=800&q=70",
    category: "webgl",
    demo: "#",
    tech: ["WebGL", "GLSL", "Compute Shaders"],
    featured: true,
  },
  {
    title: "Generative Art Engine",
    description: "Algorithmic art generator creating unique patterns based on mathematical functions",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=800&q=70",
    category: "art",
    demo: "#",
    tech: ["Canvas API", "Math", "Algorithms"],
    featured: false,
  },
  {
    title: "Interactive Particle System",
    description: "GPU-accelerated particle system with physics simulation and user interaction",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=70",
    category: "animation",
    demo: "#",
    tech: ["WebGL", "Particles", "Physics"],
    featured: true,
  },
  {
    title: "3D Portfolio Environment",
    description: "Immersive 3D space with floating geometric shapes and interactive navigation",
    image: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=800&q=70",
    category: "webgl",
    demo: "#",
    tech: ["Three.js", "3D", "Shaders"],
    featured: true,
  },
  {
    title: "Audio Reactive Visualizer",
    description: "Real-time audio visualization that responds to microphone input or music playback",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=70",
    category: "interactive",
    demo: "#",
    tech: ["Web Audio API", "Canvas", "FFT"],
    featured: false,
  },
];

/* =========================
   Helpers
========================= */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const STORAGE_KEYS = {
  tab: "retro_portfolio_tab",
  saved: "retro_portfolio_saved_searches",
};

const AI = {
  searchEndpoint: "/api/search",
  healthEndpoint: "/api/health",
  timeoutMs: 14000,
  healthTimeoutMs: 2500,
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function toast(msg) {
  const t = $("#toast");
  const tt = $("#toastText");
  if (!t || !tt) return;
  tt.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => t.classList.add("hidden"), 1600);
}

function scrollToEl(selector) {
  const el = $(selector);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setResultsMeta(query) {
  const resultsCount = $("#resultsCount");
  const resultsTime = $("#resultsTime");
  const titleBase = "Gene Elpie Landoy - Retro-Google Futuristic Portfolio";

  const base = 700000 + Math.floor(Math.random() * 900000);
  const ms = (Math.random() * 0.09 + 0.01).toFixed(3);

  if (resultsCount) resultsCount.textContent = `About ${base.toLocaleString()} results`;
  if (resultsTime) resultsTime.textContent = `(${ms} seconds)`;

  document.title = query ? `${query} - Retro Search` : titleBase;
}

function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function openFlexModal(modalSel) {
  const modal = $(modalSel);
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
}

function closeFlexModal(modalSel) {
  const modal = $(modalSel);
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.style.overflow = "";
}

/* =========================
   Local Search Helpers (kept for optional filtering only)
========================= */
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function localFilterSearch(query) {
  const q = String(query || "").trim().toLowerCase();
  const sections = $$("[data-section]");
  if (!sections.length) return 0;

  if (!q) {
    sections.forEach((s) => s.classList.remove("hidden"));
    return sections.length;
  }

  let visible = 0;
  sections.forEach((s) => {
    const text = (s.innerText || "").toLowerCase();
    const show = text.includes(q);
    s.classList.toggle("hidden", !show);
    if (show) visible++;
  });

  return visible;
}

/* =========================
   AI Search (NO local fallback)
========================= */
function promiseTimeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out.")), ms));
}

async function aiHealthCheck() {
  try {
    const res = await Promise.race([
      fetch(AI.healthEndpoint, { method: "GET", cache: "no-store" }),
      promiseTimeout(AI.healthTimeoutMs),
    ]);
    return !!res.ok;
  } catch {
    return false;
  }
}

async function aiSearch(query) {
  const res = await Promise.race([
    fetch(AI.searchEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    }),
    promiseTimeout(AI.timeoutMs),
  ]);

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.error || "AI request failed.";
    throw new Error(msg);
  }

  const answer = data?.answer;
  if (typeof answer !== "string" || !answer.trim()) return "No answer generated.";
  return answer.trim();
}

function clearAiResultBoxes() {
  const results = $("#resultsArea");
  if (!results) return;
  $$('[data-ai-results="true"]', results).forEach((n) => n.remove());
}

function renderAiResultBox(query, state) {
  const results = $("#resultsArea");
  if (!results) return null;

  clearAiResultBoxes();

  const box = document.createElement("div");
  box.dataset.aiResults = "true";
  box.className = "border border-borderDim bg-bgPanel rounded-xl p-5";

  const header = `
    <div class="text-gBlue text-lg mb-2">Search Results</div>
    <div class="text-gray-300 text-sm">
      Results for "<span class="text-white">${escapeHtml(query)}</span>"
    </div>
  `;

  if (state.type === "loading") {
    box.innerHTML = `
      ${header}
      <div class="mt-2 text-xs text-gray-500">AI search is running…</div>
      <div class="mt-4 border border-borderDim bg-bgDark rounded-xl p-4">
        <div class="h-3 w-2/3 bg-white/10 rounded"></div>
        <div class="mt-2 h-3 w-5/6 bg-white/10 rounded"></div>
        <div class="mt-2 h-3 w-1/2 bg-white/10 rounded"></div>
      </div>
    `;
  } else if (state.type === "error") {
    box.innerHTML = `
      ${header}
      <div class="mt-2 text-xs text-gray-500">AI search is unavailable.</div>
      <div class="mt-4 border border-red-500/30 bg-red-500/10 rounded-xl p-4">
        <div class="text-sm text-white font-bold">AI request failed</div>
        <div class="mt-2 text-xs text-gray-300">${escapeHtml(state.message || "Unknown error")}</div>
        <div class="mt-3 text-xs text-gray-400">
          Open this site using <span class="text-gray-200 font-bold">http://localhost:3000</span> (not file://) and ensure the server is running.
        </div>
      </div>
    `;
  } else {
    const answerHtml = escapeHtml(state.answer || "No answer generated.");
    box.innerHTML = `
      ${header}
      <div class="mt-2 text-xs text-gray-500">AI search is active.</div>
      <div class="mt-4 border border-borderDim bg-bgDark rounded-xl p-4">
        <pre class="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed m-0">${answerHtml}</pre>
      </div>
      <div class="mt-3 flex flex-wrap gap-2">
        <button type="button"
          class="px-3 py-2 rounded-xl border border-borderDim bg-bgPanel hover:bg-[#1c2430] transition-colors text-xs f-ring"
          data-ai-open="projects">Projects</button>
        <button type="button"
          class="px-3 py-2 rounded-xl border border-borderDim bg-bgPanel hover:bg-[#1c2430] transition-colors text-xs f-ring"
          data-ai-open="timeline">Timeline</button>
        <button type="button"
          class="px-3 py-2 rounded-xl border border-borderDim bg-bgPanel hover:bg-[#1c2430] transition-colors text-xs f-ring"
          data-ai-open="certificates">Certificates</button>
        <button type="button"
          class="px-3 py-2 rounded-xl border border-borderDim bg-bgPanel hover:bg-[#1c2430] transition-colors text-xs f-ring"
          data-ai-open="gallery">Gallery</button>
      </div>
    `;

    $$("[data-ai-open]", box).forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-ai-open");
        if (!key) return;
        setTab(key);
        setTimeout(() => scrollToEl(`#section-${key}`), 120);
      });
    });
  }

  results.prepend(box);
  return box;
}

/* =========================
   Mount Knowledge Panel
========================= */
function mountKnowledgePanels() {
  const tpl = $("#kpTemplate");
  const desktop = $("#kpDesktopMount");
  const mobile = $("#kpMobileMount");
  if (!tpl || !desktop || !mobile) return;

  desktop.innerHTML = "";
  mobile.innerHTML = "";

  desktop.appendChild(tpl.content.cloneNode(true));
  mobile.appendChild(tpl.content.cloneNode(true));
}

/* =========================
   Scroll progress + Back to top
========================= */
function setupScrollUx() {
  const bar = $("#scrollProgress");
  const btnTop = $("#btnTop");

  function onScroll() {
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - doc.clientHeight);
    const p = (doc.scrollTop / max) * 100;
    if (bar) bar.style.width = `${p}%`;
    if (btnTop) btnTop.classList.toggle("hidden", doc.scrollTop < 600);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  btnTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* =========================
   Image Pack + Lightbox (with swipe)
========================= */
let currentImages = [];
let lightboxIndex = 0;
let __touchStartX = 0;

function renderImages(items) {
  currentImages = items;
  const grid = $("#imageGrid");
  if (!grid) return;

  grid.innerHTML = "";

  items.forEach((img, idx) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className =
      "group relative overflow-hidden rounded-xl border border-borderDim bg-bgDark hover:border-gBlue transition-colors f-ring";
    card.setAttribute("aria-label", `Open image: ${img.title}`);
    card.dataset.idx = String(idx);

    card.innerHTML = `
      <div class="absolute top-2 left-2 z-10 text-[10px] px-2 py-1 rounded-full border border-borderDim bg-bgPanel text-gray-400">
        ${String(img.tag || "").toUpperCase()}
      </div>
      <img
        src="${img.src}"
        alt="${img.alt}"
        loading="lazy"
        class="h-28 sm:h-32 w-full object-cover opacity-90 group-hover:opacity-100 transition duration-300"
      />
      <div class="p-2">
        <div class="text-xs text-gray-300 clamp-2">${img.title}</div>
      </div>
    `;

    card.addEventListener("click", () => openLightbox(idx));
    grid.appendChild(card);
  });
}

function openLightbox(idx) {
  lightboxIndex = clamp(idx, 0, currentImages.length - 1);
  const item = currentImages[lightboxIndex];
  const title = $("#lightboxTitle");
  const img = $("#lightboxImg");
  if (title) title.textContent = item.title;
  if (img) {
    img.src = item.src;
    img.alt = item.alt;
  }
  openFlexModal("#lightbox");
}

function closeLightbox() {
  closeFlexModal("#lightbox");
}

function nextImg(delta) {
  if (!currentImages.length) return;
  lightboxIndex = (lightboxIndex + delta + currentImages.length) % currentImages.length;
  const item = currentImages[lightboxIndex];
  const title = $("#lightboxTitle");
  const img = $("#lightboxImg");
  if (title) title.textContent = item.title;
  if (img) {
    img.src = item.src;
    img.alt = item.alt;
  }
}

function setupLightboxSwipe() {
  const img = $("#lightboxImg");
  if (!img) return;

  img.addEventListener(
    "touchstart",
    (e) => {
      if (!e.touches || !e.touches.length) return;
      __touchStartX = e.touches[0].clientX;
    },
    { passive: true }
  );

  img.addEventListener(
    "touchend",
    (e) => {
      if (!e.changedTouches || !e.changedTouches.length) return;
      const endX = e.changedTouches[0].clientX;
      const dx = endX - __touchStartX;
      if (Math.abs(dx) < 40) return;
      nextImg(dx > 0 ? -1 : 1);
    },
    { passive: true }
  );
}

/* =========================
   Timeline
========================= */
let activeTimelineFilter = "all";
let timelineExpandedAll = false;

function timelineTagPill(tag) {
  const map = {
    engineering: "text-gBlue",
    design: "text-gYellow",
    leadership: "text-gGreen",
  };
  const c = map[tag] || "text-gray-300";
  return `<span class="text-[11px] px-2 py-0.5 rounded-full border border-borderDim bg-bgPanel ${c}">${tag}</span>`;
}

function renderTimeline() {
  const list = $("#timelineList");
  if (!list) return;
  list.innerHTML = "";

  const items = TIMELINE_ITEMS.filter((it) => {
    if (activeTimelineFilter === "all") return true;
    return (it.tags || []).includes(activeTimelineFilter);
  });

  items.forEach((it) => {
    const wrap = document.createElement("div");
    wrap.className = "timeline-item";
    wrap.dataset.tags = (it.tags || []).join(",");

    const tags = (it.tags || []).map(timelineTagPill).join(" ");
    const metrics = (it.metrics || [])
      .map((m) => `<span class="text-[11px] px-2 py-1 rounded-full border border-borderDim bg-bgPanel text-gray-300">${m}</span>`)
      .join(" ");

    const stack = (it.stack || [])
      .map((s) => `<span class="text-[11px] px-2 py-1 rounded-full border border-borderDim bg-bgPanel text-gray-400">${s}</span>`)
      .join(" ");

    wrap.innerHTML = `
      <div class="timeline-dot" aria-hidden="true"></div>
      <div class="timeline-card">
        <button
          class="timeline-head w-full text-left hover:bg-[#141b24] transition-colors f-ring"
          type="button"
          aria-expanded="false"
          data-acc-btn="true"
        >
          <div class="min-w-0">
            <div class="text-xs text-gray-500">${it.year} · ${it.date || ""} · ${tags}</div>
            <div class="text-sm text-white mt-1">${it.title}</div>
          </div>
          <div class="text-xs text-gray-500 shrink-0">toggle</div>
        </button>

        <div class="timeline-body hidden" data-acc-panel="true">
          <div class="text-xs text-gray-500">Highlights</div>
          <ul class="mt-2 space-y-2 text-sm text-gray-300">
            ${(it.bullets || []).map((b) => `<li>• ${b}</li>`).join("")}
          </ul>

          <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="border border-borderDim bg-bgPanel rounded-xl p-3">
              <div class="text-xs text-gray-500">Impact</div>
              <div class="mt-2 flex flex-wrap gap-2">${metrics}</div>
            </div>
            <div class="border border-borderDim bg-bgPanel rounded-xl p-3">
              <div class="text-xs text-gray-500">Stack</div>
              <div class="mt-2 flex flex-wrap gap-2">${stack}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    const btn = wrap.querySelector('[data-acc-btn="true"]');
    const panel = wrap.querySelector('[data-acc-panel="true"]');

    btn?.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      panel?.classList.toggle("hidden", expanded);
    });

    if (timelineExpandedAll) {
      btn?.setAttribute("aria-expanded", "true");
      panel?.classList.remove("hidden");
    }

    list.appendChild(wrap);
  });

  if (!items.length) {
    list.innerHTML = `
      <div class="border border-borderDim bg-bgDark rounded-xl p-4 text-sm text-gray-400">
        No timeline entries match that filter.
      </div>
    `;
  }
}

/* =========================
   Projects
========================= */
let projectQuery = "";
let projectSort = "impact";

function getSortedProjects(items) {
  const a = [...items];
  if (projectSort === "newest") a.sort((x, y) => (y.year || 0) - (x.year || 0));
  else if (projectSort === "oldest") a.sort((x, y) => (x.year || 0) - (y.year || 0));
  else if (projectSort === "title") a.sort((x, y) => String(x.title).localeCompare(String(y.title)));
  else a.sort((x, y) => (y.score || 0) - (x.score || 0));
  return a;
}

function renderProjects() {
  const grid = $("#projectsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const q = projectQuery.trim().toLowerCase();
  const filtered = PROJECTS.filter((p) => {
    if (!q) return true;
    const hay = `${p.title} ${p.category} ${p.role} ${p.description} ${(p.tech || []).join(" ")}`.toLowerCase();
    return hay.includes(q);
  });

  const items = getSortedProjects(filtered);

  items.forEach((p) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "text-left border border-borderDim bg-bgDark rounded-xl p-4 hover:border-gBlue transition-colors f-ring";
    card.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="text-sm text-white font-bold clamp-2">${p.title}</div>
          <div class="text-xs text-gray-500 mt-1">${p.category} · ${p.year} · ${p.role}</div>
        </div>
        <span class="text-[11px] px-2 py-1 rounded-full border border-borderDim bg-bgPanel text-gYellow">project</span>
      </div>
      <div class="mt-3 text-xs text-gray-400 clamp-2">${p.description}</div>
      <div class="mt-3 flex flex-wrap gap-2">
        ${(p.tech || []).slice(0, 3)
          .map((t) => `<span class="text-[10px] px-2 py-1 rounded-full border border-borderDim bg-bgPanel text-gray-400">${t}</span>`)
          .join("")}
      </div>
    `;
    card.addEventListener("click", () => openProjectModal(p));
    grid.appendChild(card);
  });

  if (!items.length) {
    grid.innerHTML = `
      <div class="border border-borderDim bg-bgDark rounded-xl p-4 text-sm text-gray-400">
        No projects found. Try a different filter.
      </div>
    `;
  }
}

function openProjectModal(p) {
  $("#projectModalTitle") && ($("#projectModalTitle").textContent = p.title);
  const img = $("#projectModalImg");
  if (img) {
    img.src = p.image || "";
    img.alt = p.title;
  }
  $("#projectModalDesc") && ($("#projectModalDesc").textContent = p.description);
  $("#projectModalMeta") && ($("#projectModalMeta").textContent = `${p.category} · ${p.year}`);
  $("#projectModalRole") && ($("#projectModalRole").textContent = p.role || "");
  $("#projectModalImpact") && ($("#projectModalImpact").textContent = p.impact || "");

  const demo = $("#projectModalDemo");
  const repo = $("#projectModalRepo");
  if (demo) demo.href = p.demo || "#";
  if (repo) repo.href = p.repo || "#";

  const tech = $("#projectModalTech");
  if (tech) {
    tech.innerHTML = "";
    (p.tech || []).forEach((t) => {
      const pill = document.createElement("span");
      pill.className = "text-[11px] px-2 py-1 rounded-full border border-borderDim bg-bgDark text-gray-300";
      pill.textContent = t;
      tech.appendChild(pill);
    });
  }

  const btnCopy = $("#btnCopyProject");
  if (btnCopy) {
    btnCopy.onclick = async () => {
      const text = `${p.title}\nCategory: ${p.category}\nYear: ${p.year}\nRole: ${p.role}\nImpact: ${p.impact}\nTech: ${(p.tech || []).join(
        ", "
      )}\nDemo: ${p.demo}\nRepo: ${p.repo}`;
      try {
        await navigator.clipboard.writeText(text);
        toast("Project summary copied");
      } catch {
        toast("Copy failed (browser permission)");
      }
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
let certQuery = "";
let certSort = "newest";

function parseIssued(issuedStr) {
  const parts = String(issuedStr || "").split(" ");
  if (parts.length !== 2) return new Date(2000, 0, 1);
  const monthMap = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const m = monthMap[parts[0]] ?? 0;
  const y = Number(parts[1]) || 2000;
  return new Date(y, m, 1);
}

function getSortedCerts(items) {
  const a = [...items];
  if (certSort === "newest") a.sort((x, y) => parseIssued(y.issued) - parseIssued(x.issued));
  else if (certSort === "oldest") a.sort((x, y) => parseIssued(x.issued) - parseIssued(y.issued));
  else if (certSort === "issuer") a.sort((x, y) => x.issuer.localeCompare(y.issuer));
  else if (certSort === "title") a.sort((x, y) => x.title.localeCompare(y.title));
  return a;
}

function renderCerts() {
  const grid = $("#certGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const q = certQuery.trim().toLowerCase();
  const filtered = CERTS.filter((c) => {
    if (!q) return true;
    return (
      c.title.toLowerCase().includes(q) ||
      c.issuer.toLowerCase().includes(q) ||
      c.issued.toLowerCase().includes(q) ||
      c.credential_id.toLowerCase().includes(q)
    );
  });

  const items = getSortedCerts(filtered);

  items.forEach((c) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "text-left border border-borderDim bg-bgDark rounded-xl p-4 hover:border-gBlue transition-colors f-ring";
    card.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm text-white font-bold">${c.title}</div>
          <div class="text-xs text-gray-500 mt-1">${c.issuer} · Issued ${c.issued}</div>
        </div>
        <span class="text-[11px] px-2 py-1 rounded-full border border-borderDim bg-bgPanel text-gGreen">verified</span>
      </div>
      <div class="mt-3 text-xs text-gray-400 clamp-2">${c.notes}</div>
    `;
    card.addEventListener("click", () => openCertModal(c));
    grid.appendChild(card);
  });

  if (!items.length) {
    grid.innerHTML = `
      <div class="border border-borderDim bg-bgDark rounded-xl p-4 text-sm text-gray-400">
        No certificates found. Try a different filter.
      </div>
    `;
  }
}

function openCertModal(c) {
  $("#certModalTitle") && ($("#certModalTitle").textContent = c.title);
  $("#certModalIssuer") && ($("#certModalIssuer").textContent = c.issuer);
  $("#certModalIssued") && ($("#certModalIssued").textContent = c.issued);
  $("#certModalId") && ($("#certModalId").textContent = c.credential_id);
  $("#certModalNotes") && ($("#certModalNotes").textContent = c.notes);
  const link = $("#certModalLink");
  if (link) link.href = c.link;

  openFlexModal("#certModal");

  const btnCopy = $("#btnCopyCert");
  if (btnCopy) {
    btnCopy.onclick = async () => {
      const text = `${c.title}\nIssuer: ${c.issuer}\nIssued: ${c.issued}\nCredential ID: ${c.credential_id}\nVerify: ${c.link}\nNotes: ${c.notes}`;
      try {
        await navigator.clipboard.writeText(text);
        toast("Certificate details copied");
      } catch {
        toast("Copy failed (browser permission)");
      }
    };
  }
}

function closeCertModal() {
  closeFlexModal("#certModal");
}

/* =========================
   Achievements
========================= */
function renderAchievements() {
  const grid = $("#achGrid");
  if (!grid) return;
  grid.innerHTML = "";

  ACHIEVEMENTS.forEach((a) => {
    const card = document.createElement("div");
    card.className = "border border-borderDim bg-bgDark rounded-xl p-4 hover:border-white/30 transition-colors";
    card.innerHTML = `
      <div class="flex items-center justify-between gap-3">
        <span class="text-[11px] px-2 py-1 rounded-full border border-borderDim bg-bgPanel text-${a.badgeColor}">${a.badge}</span>
        <span class="text-xs text-gray-500">${a.meta}</span>
      </div>
      <div class="mt-3 text-sm text-white font-bold">${a.title}</div>
      <div class="mt-2 text-xs text-gray-400">${a.desc}</div>
    `;
    grid.appendChild(card);
  });
}

function animateCounters() {
  const counters = $$(".counter");
  if (!counters.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        io.unobserve(el);

        const target = Number(el.dataset.target || "0");
        const duration = 900 + Math.random() * 600;
        const start = performance.now();

        function tick(t) {
          const p = clamp((t - start) / duration, 0, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.floor(target * eased));
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = String(target);
        }
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.35 }
  );

  counters.forEach((c) => io.observe(c));
}

/* =========================
   Gallery
========================= */
let galleryFilter = "all";

function renderGallery() {
  const grid = $("#galleryGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const items = GALLERY_ITEMS.filter((it) => {
    if (galleryFilter === "all") return true;
    if (galleryFilter === "featured") return !!it.featured;
    return it.category === galleryFilter;
  });

  items.forEach((it) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "text-left border border-borderDim bg-bgDark rounded-xl overflow-hidden hover:border-gBlue transition-colors f-ring";

    const badge = it.featured
      ? `<span class="text-[10px] px-2 py-1 rounded-full border border-borderDim bg-bgPanel text-gYellow">featured</span>`
      : `<span class="text-[10px] px-2 py-1 rounded-full border border-borderDim bg-bgPanel text-gray-400">${it.category}</span>`;

    card.innerHTML = `
      <div class="relative">
        <img src="${it.image}" alt="${it.title}" loading="lazy" class="h-40 w-full object-cover opacity-90 hover:opacity-100 transition" />
        <div class="absolute top-2 left-2">${badge}</div>
      </div>
      <div class="p-4">
        <div class="text-sm text-white font-bold clamp-2">${it.title}</div>
        <div class="mt-2 text-xs text-gray-400 clamp-2">${it.description}</div>
        <div class="mt-3 flex flex-wrap gap-2">
          ${(it.tech || [])
            .slice(0, 3)
            .map((t) => `<span class="text-[10px] px-2 py-1 rounded-full border border-borderDim bg-bgPanel text-gray-400">${t}</span>`)
            .join("")}
        </div>
      </div>
    `;

    card.addEventListener("click", () => openGalleryModal(it));
    grid.appendChild(card);
  });

  if (!items.length) {
    grid.innerHTML = `
      <div class="border border-borderDim bg-bgDark rounded-xl p-4 text-sm text-gray-400">
        No gallery items match that filter.
      </div>
    `;
  }
}

function openGalleryModal(it) {
  $("#galleryModalTitle") && ($("#galleryModalTitle").textContent = it.title);
  const img = $("#galleryModalImg");
  if (img) {
    img.src = it.image;
    img.alt = it.title;
  }
  $("#galleryModalDesc") && ($("#galleryModalDesc").textContent = it.description);
  $("#galleryModalMeta") &&
    ($("#galleryModalMeta").textContent = `Category: ${it.category}${it.featured ? " · Featured" : ""}`);

  const demo = $("#galleryModalDemo");
  if (demo) demo.href = it.demo || "#";

  const tech = $("#galleryModalTech");
  if (tech) {
    tech.innerHTML = "";
    (it.tech || []).forEach((t) => {
      const pill = document.createElement("span");
      pill.className = "text-[11px] px-2 py-1 rounded-full border border-borderDim bg-bgDark text-gray-300";
      pill.textContent = t;
      tech.appendChild(pill);
    });
  }

  const btnCopy = $("#btnCopyGalleryItem");
  if (btnCopy) {
    btnCopy.onclick = async () => {
      const text = `${it.title}\n${it.description}\nTech: ${(it.tech || []).join(", ")}\nDemo: ${it.demo || ""}`;
      try {
        await navigator.clipboard.writeText(text);
        toast("Gallery item copied");
      } catch {
        toast("Copy failed (browser permission)");
      }
    };
  }

  openFlexModal("#galleryModal");
}

function closeGalleryModal() {
  closeFlexModal("#galleryModal");
}

/* =========================
   Tabs
========================= */
function setTab(tab) {
  localStorage.setItem(STORAGE_KEYS.tab, tab);

  $$(".tab-btn").forEach((b) => {
    const on = b.dataset.tab === tab;
    b.classList.toggle("border-gBlue", on);
    b.classList.toggle("text-white", on);
    b.classList.toggle("shadow-glow", on);
  });

  const sections = $$("[data-section]");
  sections.forEach((s) => {
    const key = s.getAttribute("data-section");
    const show = tab === "all" || tab === key;
    s.classList.toggle("hidden", !show);
  });

  const q = $("#searchInput")?.value || "";
  setResultsMeta(tab === "all" ? q : `${tab} results`);
}

/* =========================
   Search interactions
========================= */
const DEFAULT_QUERY =
  "querying portfolio: Gene Elpie Landoy.";

function typeIntoInput(text, speedMin = 25, speedMax = 55) {
  const input = $("#searchInput");
  if (!input) return;
  input.value = "";
  $("#btnClear")?.classList.add("hidden");

  let i = 0;
  const shell = $("#searchShell");

  function step() {
    if (i < text.length) {
      input.value += text.charAt(i);
      i++;
      $("#btnClear")?.classList.remove("hidden");
      setTimeout(step, Math.random() * (speedMax - speedMin) + speedMin);
    } else {
      shell?.classList.add("is-hot");
      setTimeout(() => shell?.classList.remove("is-hot"), 700);
      setResultsMeta(input.value);
    }
  }

  setTimeout(step, 350);
}


async function runQuery() {
  const q = ($("#searchInput")?.value || "").trim();
  if (!q) return;

  setResultsMeta(q);

  // show loading UI (AI-only)
  renderAiResultBox(q, { type: "loading" });
  toast("Searching with AI...");

  // Optional: quick health check (nice error message)
  const healthy = await aiHealthCheck();
  if (!healthy) {
    renderAiResultBox(q, {
      type: "error",
      message: "Server not reachable. Open http://localhost:3000 and ensure `npm run dev` is running.",
    });
    toast("AI server offline");
    return;
  }

  try {
    const answer = await aiSearch(q);

    renderAiResultBox(q, {
      type: "success",
      answer,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
    toast("AI result ready");

    $("#searchShell")?.classList.add("is-hot");
    setTimeout(() => $("#searchShell")?.classList.remove("is-hot"), 650);
  } catch (e) {
    renderAiResultBox(q, {
      type: "error",
      message: e?.message || "AI request failed.",
    });
    toast("AI request failed");
  }
}

function feelingFuturistic() {
  const picks = [
    { tab: "images", msg: "Warping to images…" },
    { tab: "projects", msg: "Warping to projects…" },
    { tab: "timeline", msg: "Warping to timeline…" },
    { tab: "certificates", msg: "Warping to certificates…" },
    { tab: "achievements", msg: "Warping to achievements…" },
    { tab: "gallery", msg: "Warping to gallery…" },
    { tab: "about", msg: "Warping to about…" },
  ];

  const pick = picks[Math.floor(Math.random() * picks.length)];
  setTab(pick.tab);
  toast(pick.msg);

  const sectionId = `#section-${pick.tab}`;
  setTimeout(() => scrollToEl(sectionId), 250);

  const variants = [
    "best frontend engineer portfolio retro google",
    "gene elpie landoy projects timeline webgl",
    "projects orbit ui kit telemetry dashboard",
    "timeline work history milestones impact",
    "certificates aws meta frontend verify",
    "achievements open source speaker performance",
    "creative coding gallery webgl shaders",
    "about gene elpie landoy ui architect a11y performance",
  ];

  const input = $("#searchInput");
  if (input) {
    input.value = variants[Math.floor(Math.random() * variants.length)];
    $("#btnClear")?.classList.remove("hidden");
    setResultsMeta(input.value);
  }
}

/* =========================
   Saved searches
========================= */
function getSavedSearches() {
  return safeJsonParse(localStorage.getItem(STORAGE_KEYS.saved) || "[]", []);
}

function setSavedSearches(list) {
  localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(list.slice(0, 20)));
}

function saveCurrentSearch() {
  const input = $("#searchInput");
  const q = input ? input.value.trim() : "";
  if (!q) return toast("Type a query first");
  const list = getSavedSearches();
  const now = new Date().toISOString();
  const entry = { q, at: now };
  const next = [entry, ...list.filter((x) => x.q !== q)];
  setSavedSearches(next);
  toast("Search saved");
}

function openSavedModal() {
  renderSavedList();
  openFlexModal("#savedModal");
}

function closeSavedModal() {
  closeFlexModal("#savedModal");
}

function renderSavedList() {
  const root = $("#savedList");
  if (!root) return;

  const list = getSavedSearches();
  root.innerHTML = "";

  if (!list.length) {
    root.innerHTML = `
      <div class="border border-borderDim bg-bgDark rounded-xl p-4 text-sm text-gray-400">
        No saved searches yet.
      </div>
    `;
    return;
  }

  list.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = "border border-borderDim bg-bgDark rounded-xl p-4 flex items-start justify-between gap-3";
    const when = new Date(item.at);
    row.innerHTML = `
      <div class="min-w-0">
        <div class="text-sm text-white font-bold clamp-2">${escapeHtml(item.q)}</div>
        <div class="mt-1 text-xs text-gray-500">Saved: ${when.toLocaleString()}</div>
      </div>
      <div class="flex gap-2">
        <button class="px-3 py-2 rounded-xl border border-borderDim bg-bgPanel hover:bg-[#1c2430] transition-colors text-xs f-ring" type="button" data-load="${idx}">Load</button>
        <button class="px-3 py-2 rounded-xl border border-borderDim bg-bgPanel hover:bg-[#1c2430] transition-colors text-xs f-ring" type="button" data-del="${idx}">Del</button>
      </div>
    `;
    root.appendChild(row);
  });

  $$("[data-load]", root).forEach((b) => {
    b.addEventListener("click", () => {
      const i = Number(b.dataset.load);
      const list = getSavedSearches();
      const picked = list[i];
      if (!picked) return;
      const input = $("#searchInput");
      if (input) input.value = picked.q;
      $("#btnClear")?.classList.remove("hidden");
      setResultsMeta(picked.q);
      closeSavedModal();
      toast("Loaded");
    });
  });

  $$("[data-del]", root).forEach((b) => {
    b.addEventListener("click", () => {
      const i = Number(b.dataset.del);
      const list = getSavedSearches();
      list.splice(i, 1);
      setSavedSearches(list);
      renderSavedList();
      toast("Deleted");
    });
  });
}

/* =========================
   Command Palette
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
  { label: "Open: Profile panel", run: () => openKpDrawer() },
  { label: "Action: Run query", run: () => runQuery() },
  { label: "Action: Feeling Futuristic", run: () => feelingFuturistic() },
];

function openCmdPalette() {
  renderCmdList("");
  openFlexModal("#cmdPalette");
  const input = $("#cmdInput");
  if (input) {
    input.value = "";
    input.focus();
  }
}

function closeCmdPalette() {
  closeFlexModal("#cmdPalette");
}

function renderCmdList(q) {
  const root = $("#cmdList");
  if (!root) return;

  root.innerHTML = "";
  const s = (q || "").trim().toLowerCase();
  const items = COMMANDS.filter((c) => !s || c.label.toLowerCase().includes(s)).slice(0, 12);

  if (!items.length) {
    root.innerHTML = `
      <div class="border border-borderDim bg-bgDark rounded-xl p-4 text-sm text-gray-400">
        No commands found.
      </div>
    `;
    return;
  }

  items.forEach((c) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "w-full text-left border border-borderDim bg-bgDark rounded-xl p-3 hover:border-gBlue transition-colors f-ring";
    row.textContent = c.label;
    row.addEventListener("click", () => {
      closeCmdPalette();
      c.run();
    });
    root.appendChild(row);
  });
}

/* =========================
   Mobile Profile Drawer
========================= */
function openKpDrawer() {
  const drawer = $("#kpDrawer");
  if (!drawer) return;
  drawer.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeKpDrawer() {
  const drawer = $("#kpDrawer");
  if (!drawer) return;
  drawer.classList.add("hidden");
  document.body.style.overflow = "";
}

/* =========================
   Wire up UI
========================= */
function setupEventHandlers() {
  // Tabs
  $$(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      if (!tab) return;
      setTab(tab);
      const sectionId = tab === "all" ? "#top" : `#section-${tab}`;
      setTimeout(() => scrollToEl(sectionId), 120);
    });
  });

  // Scroll-to links
  document.addEventListener("click", (e) => {
    const t = e.target;
    const el = t && t.closest ? t.closest("[data-scrollto]") : null;
    if (!el) return;
    const dest = el.getAttribute("data-scrollto");
    if (!dest) return;
    scrollToEl(dest);
  });

  // Run / Lucky
  $("#btnRun")?.addEventListener("click", runQuery);
  $("#btnLucky")?.addEventListener("click", feelingFuturistic);

  // Enter key should run query
  $("#searchInput")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runQuery();
    }
  });

  // Search input meta
  $("#searchInput")?.addEventListener("input", (e) => {
    const val = e.target.value;
    $("#btnClear")?.classList.toggle("hidden", !val);
    setResultsMeta(val);
  });

  // “/” focus search
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const active = document.activeElement;
      const tag = active && active.tagName ? active.tagName.toLowerCase() : "";
      const typing = tag === "input" || tag === "textarea";
      if (typing) return;
      e.preventDefault();
      $("#searchInput")?.focus();
    }
  });

  // Clear
  $("#btnClear")?.addEventListener("click", () => {
    const input = $("#searchInput");
    if (input) input.value = "";
    $("#btnClear")?.classList.add("hidden");
    setResultsMeta("");
    localFilterSearch("");
    clearAiResultBoxes();
    toast("Cleared");
  });

  // Voice demo
  $("#btnVoice")?.addEventListener("click", () => {
    toast("Voice search is a demo here 😄");
    $("#searchShell")?.classList.add("is-hot");
    setTimeout(() => $("#searchShell")?.classList.remove("is-hot"), 600);
  });

  // Images
  $("#btnShuffleImages")?.addEventListener("click", () => {
    renderImages(shuffle(IMAGE_ITEMS));
    toast("Images shuffled");
  });

  $("#viewAllImages")?.addEventListener("click", (e) => {
    e.preventDefault();
    setTab("images");
    scrollToEl("#section-images");
  });

  // Lightbox
  $("#btnCloseLightbox")?.addEventListener("click", closeLightbox);
  $("#btnPrevImg")?.addEventListener("click", () => nextImg(-1));
  $("#btnNextImg")?.addEventListener("click", () => nextImg(1));
  $("#lightbox")?.addEventListener("click", (e) => {
    if (e.target?.dataset?.close === "true") closeLightbox();
  });

  // Cert modal
  $("#btnCloseCertModal")?.addEventListener("click", closeCertModal);
  $("#certModal")?.addEventListener("click", (e) => {
    if (e.target?.dataset?.close === "true") closeCertModal();
  });

  // Project modal
  $("#btnCloseProjectModal")?.addEventListener("click", closeProjectModal);
  $("#projectModal")?.addEventListener("click", (e) => {
    if (e.target?.dataset?.close === "true") closeProjectModal();
  });

  // Gallery modal
  $("#btnCloseGalleryModal")?.addEventListener("click", closeGalleryModal);
  $("#galleryModal")?.addEventListener("click", (e) => {
    if (e.target?.dataset?.close === "true") closeGalleryModal();
  });

  // Timeline filter chips
  $$("[data-timeline-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeTimelineFilter = btn.dataset.timelineFilter || "all";
      $$("[data-timeline-filter]").forEach((b) => {
        const on = b.dataset.timelineFilter === activeTimelineFilter;
        b.classList.toggle("border-gBlue", on);
        b.classList.toggle("text-white", on);
        b.classList.toggle("shadow-glow", on);
      });
      renderTimeline();
      toast(`Timeline filter: ${activeTimelineFilter}`);
    });
  });

  // Expand all timeline
  $("#btnExpandAllTimeline")?.addEventListener("click", () => {
    timelineExpandedAll = !timelineExpandedAll;
    const btn = $("#btnExpandAllTimeline");
    if (btn) btn.textContent = timelineExpandedAll ? "Collapse all" : "Expand all";
    renderTimeline();
  });

  // Certificates search + sort
  $("#certSearch")?.addEventListener("input", (e) => {
    certQuery = e.target.value;
    renderCerts();
  });
  $("#certSort")?.addEventListener("change", (e) => {
    certSort = e.target.value;
    renderCerts();
  });

  // Projects search + sort
  $("#projectSearch")?.addEventListener("input", (e) => {
    projectQuery = e.target.value;
    renderProjects();
  });
  $("#projectSort")?.addEventListener("change", (e) => {
    projectSort = e.target.value;
    renderProjects();
  });

  // Gallery filter + shuffle
  $("#galleryFilter")?.addEventListener("change", (e) => {
    galleryFilter = e.target.value;
    renderGallery();
  });

  $("#btnShuffleGallery")?.addEventListener("click", () => {
    const shuffled = shuffle(GALLERY_ITEMS);
    GALLERY_ITEMS.length = 0;
    shuffled.forEach((x) => GALLERY_ITEMS.push(x));
    renderGallery();
    toast("Gallery shuffled");
  });

  // Copy bio
  $("#btnCopyBio")?.addEventListener("click", async () => {
    const text = ($("#bioText")?.textContent || "").trim();
    try {
      await navigator.clipboard.writeText(text);
      toast("Bio copied");
    } catch {
      toast("Copy failed (browser permission)");
    }
  });

  // Download resume (demo)
  $("#btnDownloadResume")?.addEventListener("click", () => toast("Demo: connect a real PDF/Doc link here"));

  // Contact form
  $("#contactForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;
    const fd = new FormData(form);

    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      message: String(fd.get("message") || ""),
    };

    const status = $("#contactStatus");
    if (status) status.textContent = "Sending...";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        const msg = data?.error || "Send failed.";
        if (status) status.textContent = msg;
        toast(msg);
        return;
      }

      if (status) status.textContent = "Sent! Saved on server.";
      toast("Message sent");
      form.reset();
    } catch {
      if (status) status.textContent = "Network error.";
      toast("Network error");
    }
  });

  // Mobile drawer open/close
  $("#btnOpenKp")?.addEventListener("click", openKpDrawer);
  $("#btnCloseKp")?.addEventListener("click", closeKpDrawer);
  $("#kpDrawer")?.addEventListener("click", (e) => {
    if (e.target?.dataset?.close === "true") closeKpDrawer();
  });

  // Saved searches
  $("#btnSaveSearch")?.addEventListener("click", saveCurrentSearch);
  $("#btnOpenSaved")?.addEventListener("click", openSavedModal);
  $("#btnCloseSaved")?.addEventListener("click", closeSavedModal);
  $("#savedModal")?.addEventListener("click", (e) => {
    if (e.target?.dataset?.close === "true") closeSavedModal();
  });

  // Command palette
  $("#btnCmd")?.addEventListener("click", openCmdPalette);
  $("#cmdPalette")?.addEventListener("click", (e) => {
    if (e.target?.dataset?.close === "true") closeCmdPalette();
  });

  $("#cmdInput")?.addEventListener("input", (e) => renderCmdList(e.target.value));
  $("#cmdInput")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const q = $("#cmdInput")?.value.trim().toLowerCase() || "";
      const hit = COMMANDS.find((c) => c.label.toLowerCase().includes(q)) || COMMANDS[0];
      closeCmdPalette();
      hit.run();
    }
  });

  // Global keyboard (Escape, arrows, Cmd+K)
  document.addEventListener("keydown", (e) => {
    const lbOpen = !$("#lightbox")?.classList.contains("hidden");
    const cmOpen = !$("#certModal")?.classList.contains("hidden");
    const pmOpen = !$("#projectModal")?.classList.contains("hidden");
    const gmOpen = !$("#galleryModal")?.classList.contains("hidden");
    const kpOpen = !$("#kpDrawer")?.classList.contains("hidden");
    const cmdOpen = !$("#cmdPalette")?.classList.contains("hidden");
    const savedOpen = !$("#savedModal")?.classList.contains("hidden");

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (cmdOpen) closeCmdPalette();
      else openCmdPalette();
      return;
    }

    if (e.key === "Escape") {
      if (lbOpen) closeLightbox();
      if (cmOpen) closeCertModal();
      if (pmOpen) closeProjectModal();
      if (gmOpen) closeGalleryModal();
      if (kpOpen) closeKpDrawer();
      if (cmdOpen) closeCmdPalette();
      if (savedOpen) closeSavedModal();
    }

    if (lbOpen && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      nextImg(e.key === "ArrowLeft" ? -1 : 1);
    }
  });
}

/* =========================
   Init
========================= */
function init() {
  mountKnowledgePanels();

  renderImages(IMAGE_ITEMS);
  renderProjects();
  renderTimeline();
  renderCerts();
  renderAchievements();
  renderGallery();
  animateCounters();

  setupLightboxSwipe();
  setupEventHandlers();
  setupScrollUx();

  const savedTab = localStorage.getItem(STORAGE_KEYS.tab) || "all";
  setTab(savedTab);

  $$("[data-timeline-filter]").forEach((b) => {
    const on = b.dataset.timelineFilter === "all";
    b.classList.toggle("border-gBlue", on);
    b.classList.toggle("text-white", on);
    b.classList.toggle("shadow-glow", on);
  });

  setTimeout(() => typeIntoInput(DEFAULT_QUERY), 700);
}

init();