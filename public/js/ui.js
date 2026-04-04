/**
 * File: js/ui.js
 * Description: UI rendering and event handlers for the portfolio.
 */

import {
  $, $$,
  clamp, shuffle, safeJsonParse, escapeHtml,
  withSafeStorageRead, withSafeStorageWrite,
  toast, scrollToEl, openFlexModal, closeFlexModal,
  copyToClipboard, ensureSiblingMount,
  TOAST_DURATION_MS, PROJECT_TECH_LIMIT, GALLERY_TECH_LIMIT,
  PREVIEW_ITEM_LIMIT, PROJECTS_PER_PAGE, ANIMATION_STAGGER_MS,
  STORAGE_KEYS, SECTION_KEYS, DEFAULT_QUERY
} from "./utils.js";

import { STATE, DATA } from "./state.js";
import { aiHealthCheck, aiSearch, submitContactForm } from "./api.js";

let animatedEntryObserver = null;

/* =========================
   Entry Animations
========================= */
export function initEntryObserver() {
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

export function applyEntryAnimations(root) {
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

/* =========================
   UI Helpers
========================= */
export function isPreviewModeForSection(sectionKey) {
  return STATE.activeTab === SECTION_KEYS.ALL && sectionKey !== SECTION_KEYS.ALL;
}

export function limitForSection(sectionKey, fullCount) {
  if (!isPreviewModeForSection(sectionKey)) {
    return fullCount;
  }

  if (sectionKey === SECTION_KEYS.GALLERY) {
    return 2;
  }

  if (sectionKey === SECTION_KEYS.VIDEOS) {
    return 2;
  }

  return PREVIEW_ITEM_LIMIT;
}

export function sliceForPreview(items, sectionKey) {
  return items.slice(0, limitForSection(sectionKey, items.length));
}

export function paginateItems(items, page, pageSize) {
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

export function createPreviewFooter(sectionKey, hiddenCount, label) {
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

export function renderSectionPreviewMount(baseSelector, sectionKey, totalCount, visibleCount, label) {
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

export function renderEmptyState(root, message) {
  root.innerHTML = `
    <div class="js-empty-card rounded-xl border border-borderDim bg-bgDark p-4 text-sm text-gray-400">
      ${escapeHtml(message)}
    </div>
  `;
}

export function setResultsMeta(query) {
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

/* =========================
   Knowledge panel
========================= */
export function mountKnowledgePanels() {
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
export function setupScrollUx() {
  const scrollBar = $("#scrollProgress");
  const buttonTop = $("#btnTop");
  const header = $("#topHeader");

  function handleScroll() {
    const documentElement = document.documentElement;
    const scrollTop = documentElement.scrollTop;
    const maxScroll = Math.max(1, documentElement.scrollHeight - documentElement.clientHeight);
    const progress = (scrollTop / maxScroll) * 100;

    if (scrollBar) {
      scrollBar.style.width = `${progress}%`;
    }

    if (buttonTop) {
      buttonTop.classList.toggle("hidden", scrollTop < 600);
    }

    if (header) {
      const isScrolled = scrollTop > 10;
      header.classList.toggle("shadow-soft", isScrolled);
      header.classList.toggle("border-b-transparent", !isScrolled);
      header.classList.toggle("bg-bgDark/85", isScrolled);
      header.classList.toggle("bg-bgDark/50", !isScrolled);
    }
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  buttonTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* =========================
   AI Search UI
========================= */
export function clearAiResultBoxes() {
  const resultsArea = $("#resultsArea");
  if (!resultsArea) {
    return;
  }

  $$('[data-ai-results="true"]', resultsArea).forEach((node) => node.remove());
}

export function renderAiResultBox(query, state) {
  const resultsArea = $("#resultsArea");
  if (!resultsArea) {
    return null;
  }

  clearAiResultBoxes();

  const wrapper = document.createElement("div");
  wrapper.dataset.aiResults = "true";
  wrapper.className = "rounded-2xl border border-borderDim bg-bgPanel p-6 shadow-glow transition-all duration-300 animate-pop";

  const header = `
    <div class="flex items-center gap-3 mb-4">
      <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gBlue/10 text-gBlue">
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      </div>
      <div>
        <h2 class="font-heading text-xl text-white">AI Overview</h2>
        <div class="text-xs text-gray-500">
          Generated for "<span class="text-gBlue font-medium">${escapeHtml(query)}</span>"
        </div>
      </div>
    </div>
  `;

  if (state.type === "loading") {
    wrapper.innerHTML = `
      ${header}
      <div class="space-y-3">
        <div class="h-4 w-full animate-pulse rounded bg-gray-700/50"></div>
        <div class="h-4 w-5/6 animate-pulse rounded bg-gray-700/50"></div>
        <div class="h-4 w-4/6 animate-pulse rounded bg-gray-700/50"></div>
      </div>
      <div class="mt-6 flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-600">
        <span class="flex h-1.5 w-1.5 animate-ping rounded-full bg-gBlue"></span>
        Gemini is thinking...
      </div>
    `;
  } else if (state.type === "error") {
    wrapper.innerHTML = `
      ${header}
      <div class="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
        <div class="flex items-center gap-2 text-red-400">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="text-sm font-bold">Search Unavailable</span>
        </div>
        <p class="mt-2 text-xs text-gray-400 leading-relaxed">${escapeHtml(state.message || "Unknown error")}</p>
        <div class="mt-4 flex items-center gap-2 text-[10px] text-gray-600">
          <span>Check if server is running at http://localhost:3000</span>
        </div>
      </div>
    `;
  } else {
    wrapper.innerHTML = `
      ${header}
      <div class="rounded-xl border border-borderDim bg-bgDark/40 p-5">
        <div class="prose prose-sm prose-invert max-w-none">
          <p class="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-200">
            ${escapeHtml(state.answer || "No answer generated.")}
          </p>
        </div>
      </div>
      
      <div class="mt-6">
        <div class="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Explore related</div>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="f-ring rounded-full border border-borderDim bg-bgDark px-4 py-2 text-xs font-medium text-gray-300 transition-all hover:border-gBlue hover:text-white" data-ai-open="projects">Projects</button>
          <button type="button" class="f-ring rounded-full border border-borderDim bg-bgDark px-4 py-2 text-xs font-medium text-gray-300 transition-all hover:border-gBlue hover:text-white" data-ai-open="timeline">Timeline</button>
          <button type="button" class="f-ring rounded-full border border-borderDim bg-bgDark px-4 py-2 text-xs font-medium text-gray-300 transition-all hover:border-gBlue hover:text-white" data-ai-open="certificates">Certificates</button>
          <button type="button" class="f-ring rounded-full border border-borderDim bg-bgDark px-4 py-2 text-xs font-medium text-gray-300 transition-all hover:border-gBlue hover:text-white" data-ai-open="gallery">Gallery</button>
        </div>
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

export async function runQuery() {
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

export function feelingFuturistic() {
  const picks = [
    { tab: SECTION_KEYS.IMAGES, query: "visual portfolio highlights" },
    { tab: SECTION_KEYS.VIDEOS, query: "video editing highlights and reels" },
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

export function typeIntoInput(text, speedMin = 25, speedMax = 55) {
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
export function updateTabButtonState(tab) {
  $$(".tab-btn").forEach((button) => {
    const isActive = button.dataset.tab === tab;
    button.classList.toggle("border-gBlue", isActive);
    button.classList.toggle("text-white", isActive);
    button.classList.toggle("shadow-glow", isActive);
  });
}

export function updateSectionVisibility(tab) {
  $$('[data-section]').forEach((section) => {
    const key = section.getAttribute("data-section");
    const visible = tab === SECTION_KEYS.ALL || tab === key;
    section.classList.toggle("hidden", !visible);
  });
}

export function rerenderContentSections() {
  renderImages(DATA.IMAGE_ITEMS);
  renderVideos();
  renderProjects();
  renderTimeline();
  renderCertificates();
  renderAchievements();
  renderGallery();
}

export function setTab(tab) {
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

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =========================
   Lightbox
========================= */
let touchStartX = 0;

export function setLightboxItems(items) {
  STATE.lightboxItems = items;
}

export function openLightbox(index) {
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

export function closeLightbox() {
  closeFlexModal("#lightbox");
}

export function nextLightboxImage(delta) {
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

export function setupLightboxSwipe() {
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
export function renderImages(items) {
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
    const shortTitle = String(item.title || "")
      .split(":")[0]
      .split("—")[0]
      .split("-")[0]
      .trim();

    const card = document.createElement("button");
    card.type = "button";
    card.className = "image-card js-enhanced-card f-ring";
    card.setAttribute("aria-label", `Open image: ${item.title}`);
    card.dataset.animate = "true";

    card.innerHTML = `
      <div class="image-card-media">
        <div class="absolute left-2 top-2 z-10 rounded-full border border-borderDim bg-bgPanel px-1.5 py-0.5 text-[10px] text-gray-300">
          ${escapeHtml(String(item.tag || "").toUpperCase())}
        </div>
        <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt)}" loading="lazy" class="image-card-thumb" />
        <div class="image-card-overlay">
          <div class="clamp-2 text-xs font-medium text-white">${escapeHtml(shortTitle || item.title)}</div>
        </div>
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
   Videos
========================= */
export function getVideoEmbedUrl(rawUrl) {
  if (!rawUrl || rawUrl === "#") {
    return "";
  }

  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, "");
    let videoId = "";

    if (host === "youtu.be") {
      videoId = url.pathname.replace(/^\/+/, "").split("/")[0] || "";
    } else if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v") || "";
      } else if (url.pathname.startsWith("/embed/") || url.pathname.startsWith("/shorts/")) {
        videoId = url.pathname.split("/")[2] || "";
      }
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : "";
  } catch {
    return "";
  }
}

export function getYouTubeVideoId(rawUrl) {
  if (!rawUrl || rawUrl === "#") {
    return "";
  }

  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return url.pathname.replace(/^\/+/, "").split("/")[0] || "";
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") {
        return url.searchParams.get("v") || "";
      }

      if (url.pathname.startsWith("/embed/") || url.pathname.startsWith("/shorts/")) {
        return url.pathname.split("/")[2] || "";
      }
    }

    return "";
  } catch {
    return "";
  }
}

export function getVideoThumbnail(video) {
  const youtubeId = getYouTubeVideoId(video.link);
  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  }

  return video.thumbnail || "images/events/cics.jpg";
}

export function getPlayableVideos() {
  return DATA.VIDEOS.map((video) => ({
    ...video,
    embedUrl: getVideoEmbedUrl(video.link),
    externalUrl: video.link && video.link !== "#" ? video.link : "",
    resolvedThumbnail: getVideoThumbnail(video),
  }));
}

export function withAutoplay(url) {
  if (!url) {
    return "";
  }

  return url;
}

export function buildVideoCard(video, index, isActive) {
  const button = document.createElement("button");
  const hasEmbed = Boolean(video.embedUrl);
  const hasExternalUrl = Boolean(video.externalUrl);
  const activeEmbedUrl = hasEmbed ? withAutoplay(video.embedUrl) : "";

  button.type = "button";
  button.className = `video-card js-enhanced-card f-ring rounded-2xl border border-borderDim bg-bgPanel text-left${isActive ? " is-active" : ""}`;
  button.dataset.animate = "true";
  button.setAttribute("aria-pressed", isActive ? "true" : "false");
  button.setAttribute(
    "aria-label",
    hasEmbed
      ? `Play video: ${video.title}`
      : hasExternalUrl
        ? `Open video: ${video.title}`
        : `Video unavailable: ${video.title}`
  );
  button.innerHTML = `
    ${isActive && hasEmbed
      ? `
      <div class="video-thumb video-player-inline">
        <iframe
          class="video-player-frame"
          src="${escapeHtml(activeEmbedUrl)}"
          title="${escapeHtml(video.title)}"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </div>
      `
      : `
      <div class="video-thumb">
        <img
          src="${escapeHtml(video.resolvedThumbnail || "images/events/cics.jpg")}"
          alt="${escapeHtml(video.title)}"
          loading="lazy"
          class="video-thumb-img"
        />
        <div class="video-thumb-overlay"></div>
        <div class="video-play-core" aria-hidden="true">&#9654;</div>
      </div>
      `}
    <div class="video-card-body">
      <div class="flex flex-wrap items-center gap-2">
        <span class="rounded-full border border-borderDim bg-bgDark px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-gRed">${escapeHtml(video.tag || "video")}</span>
        <span class="text-xs text-gray-500">${escapeHtml(video.role || "Editor")}</span>
      </div>
      <h4 class="mt-3 text-base font-bold text-white">${escapeHtml(video.title)}</h4>
      <p class="mt-2 text-sm leading-relaxed text-gray-400">${escapeHtml(video.description || "")}</p>
    </div>
  `;

  button.addEventListener("click", () => {
    if (hasEmbed) {
      STATE.activeVideoIndex = index;
      renderVideos();
      return;
    }

    if (hasExternalUrl) {
      window.open(video.externalUrl, "_blank", "noopener,noreferrer");
    }
  });

  return button;
}

export function renderVideos() {
  const grid = $("#videoGrid");
  if (!grid) {
    return;
  }

  grid.innerHTML = "";
  const allVideos = getPlayableVideos();
  const visibleItems = sliceForPreview(allVideos, SECTION_KEYS.VIDEOS);

  if (!DATA.VIDEOS.length) {
    renderEmptyState(grid, "No videos added yet.");
    return;
  }

  const hasAnyPlayable = visibleItems.some((video) => video.embedUrl);
  if (!hasAnyPlayable) {
    STATE.activeVideoIndex = 0;
  } else {
    STATE.activeVideoIndex = clamp(STATE.activeVideoIndex, 0, visibleItems.length - 1);
  }

  visibleItems.forEach((video, index) => {
    const isActive = Boolean(video.embedUrl) && hasAnyPlayable && index === STATE.activeVideoIndex;
    grid.appendChild(buildVideoCard(video, index, isActive));
  });

  renderSectionPreviewMount(
    "#videoGrid",
    SECTION_KEYS.VIDEOS,
    DATA.VIDEOS.length,
    visibleItems.length,
    "Video preview"
  );
  applyEntryAnimations(grid);
}

/* =========================
   Timeline
========================= */
export function getTimelineTagPill(tag) {
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

export function getFilteredTimelineItems() {
  return DATA.TIMELINE_ITEMS.filter((item) => {
    if (STATE.activeTimelineFilter === "all") {
      return true;
    }
    return (item.tags || []).includes(STATE.activeTimelineFilter);
  });
}

export function renderTimeline() {
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
export function getSortedProjects(items) {
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

export function filterProjects() {
  const query = STATE.projectQuery.trim().toLowerCase();

  return DATA.PROJECTS.filter((project) => {
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

export function buildProjectCard(project) {
  const techHtml = (project.tech || [])
    .slice(0, PROJECT_TECH_LIMIT)
    .map((item) => `<span class="card-chip">${escapeHtml(item)}</span>`)
    .join("");

  const article = document.createElement("article");
  article.className = "project-card js-enhanced-card group";
  article.dataset.animate = "true";
  article.style.cursor = "pointer";
  article.setAttribute("role", "button");
  article.setAttribute("tabindex", "0");

  // Check if project has live preview URL
  const hasLivePreview = project.preview && project.preview !== "#" && project.preview.startsWith("http");
  
  const thumbnailContent = hasLivePreview 
    ? `<div class="project-iframe-wrapper">
         <iframe src="${escapeHtml(project.preview)}" class="project-preview-iframe" loading="lazy" title="${escapeHtml(project.title)} live preview"></iframe>
       </div>`
    : `<img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)}" loading="lazy" />`;

  article.innerHTML = `
    <div class="project-thumb">
      ${thumbnailContent}
      <div class="project-badge-row">
        <span class="project-badge text-gBlue">${escapeHtml(project.category)}</span>
      </div>
      
      <div class="project-hover-overlay">
        <div class="project-hover-content">
          <div class="project-hover-minimal">
            <div class="text-xl font-black text-white mb-4 leading-tight hover-slide-up" style="--slide-delay: 0ms;">${escapeHtml(project.title)}</div>
            
            <div class="hover-slide-up" style="--slide-delay: 60ms;">
              <div class="text-[9px] text-gray-500 uppercase tracking-[0.3em] mb-3 font-black opacity-60">Tech Stack</div>
              <div class="project-hover-tech">${techHtml}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  article.addEventListener("click", () => {
    openProjectModal(project);
  });

  article.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProjectModal(project);
    }
  });

  return article;
}

export function renderProjectPagination(totalItems) {
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

export function renderProjects() {
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

export function openProjectModal(project) {
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

  if (title) title.textContent = project.title;
  if (image) {
    image.src = project.image || "";
    image.alt = project.title;
  }
  if (meta) meta.textContent = `${project.category} · ${project.year} · ${project.status || "build"}`;
  if (impact) impact.textContent = project.impact || "";
  if (description) description.textContent = project.description || "";
  if (role) role.textContent = project.role || "";
  if (outcome) outcome.textContent = project.outcome || "";

  if (techRoot) {
    techRoot.innerHTML = "";
    (project.tech || []).forEach((item) => {
      const chip = document.createElement("span");
      chip.className = "rounded-full border border-borderDim bg-bgPanel px-1.5 py-0.5 text-[11px] text-gray-300";
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

export function closeProjectModal() {
  closeFlexModal("#projectModal");
}

/* =========================
   Certificates
========================= */
export function parseIssued(value) {
  const parts = String(value || "").split(" ");
  if (parts.length !== 2) return new Date(2000, 0, 1);
  const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  const monthIndex = months[parts[0]] ?? 0;
  const year = Number(parts[1]) || 2000;
  return new Date(year, monthIndex, 1);
}

export function getSortedCertificates(items) {
  const copy = [...items];

  if (isPreviewModeForSection(SECTION_KEYS.CERTIFICATES) || STATE.certSort === "highlights") {
    copy.sort((left, right) => {
      const weightDiff = Number(right.preview_weight || 0) - Number(left.preview_weight || 0);
      if (weightDiff !== 0) {
        return weightDiff;
      }
      return parseIssued(right.issued) - parseIssued(left.issued);
    });
    return copy;
  }

  if (STATE.certSort === "newest") copy.sort((left, right) => parseIssued(right.issued) - parseIssued(left.issued));
  else if (STATE.certSort === "oldest") copy.sort((left, right) => parseIssued(left.issued) - parseIssued(right.issued));
  else if (STATE.certSort === "issuer") copy.sort((left, right) => left.issuer.localeCompare(right.issuer));
  else if (STATE.certSort === "title") copy.sort((left, right) => left.title.localeCompare(right.title));
  return copy;
}

export function filterCertificates() {
  const query = STATE.certQuery.trim().toLowerCase();
  return DATA.CERTS.filter((cert) => {
    if (!query) return true;
    const haystack = [cert.title, cert.issuer, cert.issued, cert.issued_detail, cert.credential_id, cert.notes].join(" ").toLowerCase();
    return haystack.includes(query);
  });
}

export function buildCertificateCard(cert) {
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
      <div class="cert-hover-overlay">
        <div class="cert-hover-content">
          <div class="text-sm font-semibold text-white mb-2">${escapeHtml(cert.title)}</div>
          <div class="text-xs text-gray-300">${escapeHtml(cert.notes)}</div>
        </div>
      </div>
    </div>
  `;

  article.addEventListener("click", () => {
    openCertificateModal(cert);
  });

  return article;
}

export function renderCertificates() {
  const grid = $("#certGrid");
  if (!grid) return;
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

  renderSectionPreviewMount(
    "#certGrid",
    SECTION_KEYS.CERTIFICATES,
    filteredItems.length,
    visibleItems.length,
    "Certificate preview"
  );
  applyEntryAnimations(grid);
}

export function openCertificateModal(cert) {
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

  setLightboxItems([{ title: cert.title, src: cert.image, alt: cert.title }]);
  const openFullView = () => openLightbox(0);
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

export function closeCertificateModal() {
  closeFlexModal("#certModal");
}

/* =========================
   Achievements
========================= */
export function renderAchievements() {
  const grid = $("#achGrid");
  if (!grid) return;
  grid.innerHTML = "";
  const visibleItems = sliceForPreview(DATA.ACHIEVEMENTS, SECTION_KEYS.ACHIEVEMENTS);

  visibleItems.forEach((item) => {
    const card = document.createElement("div");
    card.className = "js-enhanced-card rounded-xl border border-borderDim bg-bgDark p-4 transition-colors hover:border-gBlue/30";
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
    DATA.ACHIEVEMENTS.length,
    visibleItems.length,
    "Achievement preview"
  );
  applyEntryAnimations(grid);
}

export function animateCounters() {
  const counters = $$(".counter");
  if (!counters.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const target = Number(element.dataset.target || "0");
      const duration = 950 + Math.random() * 550;
      const startTime = performance.now();
      observer.unobserve(element);
      function tick(timestamp) {
        const progress = clamp((timestamp - startTime) / duration, 0, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = String(Math.floor(target * eased));
        if (progress < 1) requestAnimationFrame(tick);
        else element.textContent = String(target);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.35 });
  counters.forEach((counter) => observer.observe(counter));
}

/* =========================
   Gallery
========================= */
export function filterGalleryItems() {
  return DATA.GALLERY_ITEMS.filter((item) => {
    if (STATE.galleryFilter === "all") return true;
    if (STATE.galleryFilter === "featured") return Boolean(item.featured);
    return item.category === STATE.galleryFilter;
  });
}

export function renderGallery() {
  const grid = $("#galleryGrid");
  if (!grid) return;
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
    const techHtml = (item.tech || []).slice(0, GALLERY_TECH_LIMIT).map((tech) => `<span class="gallery-chip">${escapeHtml(tech)}</span>`).join("");

    card.innerHTML = `
      <div class="gallery-thumb">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy" class="gallery-thumb-img" />
        <div class="gallery-badge">${badge}</div>
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

export function openGalleryModal(item) {
  const title = $("#galleryModalTitle");
  const image = $("#galleryModalImg");
  const meta = $("#galleryModalMeta");
  const description = $("#galleryModalDesc");
  const techRoot = $("#galleryModalTech");
  const demo = $("#galleryModalDemo");
  const copyButton = $("#btnCopyGalleryItem");

  if (title) title.textContent = item.title;
  if (image) { image.src = item.image; image.alt = item.title; }
  if (meta) meta.textContent = `Category: ${item.category}${item.featured ? " · Featured" : ""}`;
  if (description) description.textContent = item.description;
  if (demo) demo.href = item.demo || "#";

  if (techRoot) {
    techRoot.innerHTML = "";
    (item.tech || []).forEach((tech) => {
      const chip = document.createElement("span");
      chip.className = "rounded-full border border-borderDim bg-bgDark px-1.5 py-0.5 text-[11px] text-gray-300";
      chip.textContent = tech;
      techRoot.appendChild(chip);
    });
  }

  if (copyButton) {
    copyButton.onclick = () => {
      const summary = [item.title, item.description, `Tech: ${(item.tech || []).join(", ")}`, `Demo: ${item.demo || ""}`].join("\n");
      copyToClipboard(summary, "Gallery item copied");
    };
  }
  openFlexModal("#galleryModal");
}

export function closeGalleryModal() {
  closeFlexModal("#galleryModal");
}

/* =========================
   Saved searches
========================= */
export function getSavedSearches() {
  return safeJsonParse(withSafeStorageRead(STORAGE_KEYS.SAVED, "[]"), []);
}

export function setSavedSearches(list) {
  withSafeStorageWrite(STORAGE_KEYS.SAVED, JSON.stringify(list.slice(0, 20)));
}

export function saveCurrentSearch() {
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

export function renderSavedList() {
  const root = $("#savedList");
  if (!root) return;
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
      if (!item || !input) return;
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

export function openSavedModal() {
  renderSavedList();
  openFlexModal("#savedModal");
}

export function closeSavedModal() {
  closeFlexModal("#savedModal");
}

/* =========================
   Command palette
========================= */
export const COMMANDS = [
  { label: "Go: Top", run: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
  { label: "Tab: All", run: () => setTab(SECTION_KEYS.ALL) },
  { label: "Tab: Images", run: () => setTab(SECTION_KEYS.IMAGES) },
  { label: "Tab: Videos", run: () => setTab(SECTION_KEYS.VIDEOS) },
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

export function renderCommandList(query = "") {
  const list = $("#cmdList");
  if (!list) return;
  const normalized = String(query).trim().toLowerCase();
  const items = COMMANDS.filter((command) => {
    if (!normalized) return true;
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
    button.className = "f-ring w-full rounded-xl border border-borderDim bg-bgDark p-3 text-left transition-colors hover:border-gBlue";
    button.textContent = command.label;
    button.addEventListener("click", () => {
      closeCommandPalette();
      command.run();
    });
    list.appendChild(button);
  });
}

export function openCommandPalette() {
  openFlexModal("#cmdPalette");
  renderCommandList("");
  const input = $("#cmdInput");
  if (input) { input.value = ""; input.focus(); }
}

export function closeCommandPalette() {
  closeFlexModal("#cmdPalette");
}

/* =========================
   Profile drawer
========================= */
export function openProfileDrawer() {
  const drawer = $("#kpDrawer");
  if (!drawer) return;
  drawer.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

export function closeProfileDrawer() {
  const drawer = $("#kpDrawer");
  if (!drawer) return;
  drawer.classList.add("hidden");
  document.body.style.overflow = "";
}

/* =========================
   Contact form
========================= */
export async function handleContactFormSubmit(event) {
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
    await submitContactForm(payload);
    if (status) status.textContent = "Sent! Saved on server.";
    form.reset();
    toast("Message sent");
  } catch (error) {
    if (status) status.textContent = error.message || "Network error.";
    toast(error.message || "Network error");
  }
}

/* =========================
   Event wiring
========================= */
export function setupEventHandlers() {
  $$(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.dataset.tab;
      if (tab) setTab(tab);
    });
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target?.closest?.("[data-scrollto]");
    if (trigger) {
      const destination = trigger.getAttribute("data-scrollto");
      const parentSection = trigger.closest("[data-section]");
      const sectionKey = parentSection?.getAttribute("data-section");

      if (destination && sectionKey && STATE.activeTab === SECTION_KEYS.ALL) {
        if (typeof trigger.blur === "function") {
          trigger.blur();
        }
        if (document.activeElement && typeof document.activeElement.blur === "function") {
          document.activeElement.blur();
        }
        setTab(sectionKey);
        return;
      }

      if (destination) scrollToEl(destination);
    }
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
    window.setTimeout(() => $("#searchShell")?.classList.remove("is-hot"), 600);
    toast("Voice search is a demo here");
  });

  $("#btnShuffleImages")?.addEventListener("click", () => {
    DATA.IMAGE_ITEMS = shuffle(DATA.IMAGE_ITEMS);
    renderImages(DATA.IMAGE_ITEMS);
    toast("Images shuffled");
  });

  $("#viewAllImages")?.addEventListener("click", () => {
    setTab(SECTION_KEYS.IMAGES);
    scrollToEl("#section-images");
  });

  $("#viewAllVideos")?.addEventListener("click", () => {
    setTab(SECTION_KEYS.VIDEOS);
    scrollToEl("#section-videos");
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
    if (button) button.textContent = STATE.timelineExpandedAll ? "Collapse all" : "Expand all";
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
    if (STATE.activeTab === SECTION_KEYS.ALL) {
      setTab(SECTION_KEYS.CERTIFICATES);
    }
    renderCertificates();
  });

  $("#certSort")?.addEventListener("change", (event) => {
    STATE.certSort = event.target.value;
    if (STATE.activeTab === SECTION_KEYS.ALL) {
      setTab(SECTION_KEYS.CERTIFICATES);
    }
    renderCertificates();
  });

  $("#galleryFilter")?.addEventListener("change", (event) => {
    STATE.galleryFilter = event.target.value;
    renderGallery();
  });

  $("#btnShuffleGallery")?.addEventListener("click", () => {
    DATA.GALLERY_ITEMS = shuffle(DATA.GALLERY_ITEMS);
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

  $("#contactForm")?.addEventListener("submit", handleContactFormSubmit);
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
    if (event.key !== "Enter") return;
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
      if ($("#cmdPalette")?.classList.contains("hidden")) openCommandPalette();
      else closeCommandPalette();
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
