import { PORTFOLIO_DATA } from "./data.js";
import { escapeHtml, resolveImagePath } from "./utils.js";
import { aiSearch, submitContactForm } from "./api.js";

const data = PORTFOLIO_DATA;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const testimonials = [
  {
    quote: "One of the best qualities of a good leader is being someone others can count on—someone who shows up and gives their best no matter the challenge. That’s who Mr. Landoy is.",
    name: "Engr. Jayvi M. Mandalihan, LPT",
    role: "College of Information and Computing Sciences",
  },
  {
    quote: "Mr. Landoy brings stability and quiet strength to any group. His consistency, support, and genuine commitment naturally lift the entire team.",
    name: "Aldrin Requiz, MIT",
    role: "College of Information and Computing Sciences",
  },
  {
    quote: "He listens first, contributes with intention, and always puts the success of the team above personal credit. Reliable, skilled, and easy to work with.",
    name: "Shiela Mae Liwanagan",
    role: "Accenture",
  },
  {
    quote: "He listens carefully, communicates clearly, and always goes the extra mile to make sure the final output exceeds expectations.",
    name: "Kryzha Lineses Lope",
    role: "Educational System Technological Institute",
  },
  {
    quote: "Mr. Landoy leads with purpose, not pressure. He guides a team with clarity, patience, and confidence while staying focused on the bigger picture.",
    name: "John Ryan Rodelas",
    role: "Information Technology",
  },
];

const extraArchiveItems = [
  { title: "Portfolio cover", image: "/images/base.jpg", tag: "feature" },
  { title: "Distinguished Recognition Award", image: "/images/trophy.png", tag: "award", fit: "contain" },
  { title: "International Presenter Badge", image: "/images/badge.png", tag: "award", fit: "contain" },
  { title: "Cum Laude Recognition", image: "/images/cum laude.png", tag: "award", fit: "contain" },
  { title: "SPARK Technical Training", image: "/images/spark.png", tag: "award", fit: "contain" },
  { title: "Event Gallery 03", image: "/images/events/gallery/3.jpg", tag: "event" },
  { title: "Event Gallery 04", image: "/images/events/gallery/4.jpg", tag: "event" },
  { title: "Event Gallery 05", image: "/images/events/gallery/5.jpg", tag: "event" },
  { title: "Event Gallery 06", image: "/images/events/gallery/6.jpg", tag: "event" },
  { title: "Event Gallery 07", image: "/images/events/gallery/7.jpg", tag: "event" },
  { title: "Hackathon Gallery", image: "/images/events/gallery/hag.jpg", tag: "hackathon" },
  { title: "Community Event", image: "/images/events/gallery/event1.jpg", tag: "event" },
  { title: "CodeMaster Recognition", image: "/images/gallery/codemaster.jpg", tag: "award" },
];

const enhancedCertificatePreviewByTitle = {
  "CodeMaster Award": "/images/certificate/enhanced/codemaster_award_-_dost-enhanced.jpg",
  "Hack4Gov 4": "/images/certificate/enhanced/DICT_Hack4Gov_4-enhanced.jpg",
  "Emerging Leader Award": "/images/certificate/enhanced/emerging_leader_award_-dost-enhanced.jpg",
  "ICITE2025 International Conference on Information Technology Education": "/images/certificate/enhanced/ICITE2025_International_Conference_on_Information_Technology_Education-enhanced.jpg",
  "Technical Excellence Award": "/images/certificate/enhanced/technical_execellence_-dost-enhanced.jpg",
  "Top Achiever and Best in Project Execution Award": "/images/certificate/enhanced/top_achiever_and_best_project_execution_award_-_dost-enhanced.jpg",
};

const certificatePreviewRatioByTitle = {
  "Career Service Professional Eligibility": 2.315,
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function safeUrl(url) {
  if (!url || url === "#") return "";
  try {
    const parsed = new URL(url, window.location.origin);
    return ["http:", "https:", "mailto:"].includes(parsed.protocol) ? parsed.href : "";
  } catch {
    return "";
  }
}

function projectHost(url) {
  if (!url || url === "#") return "Portfolio archive";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Live product";
  }
}

function projectKind(project) {
  const text = `${project.category || ""} ${(project.tech || []).join(" ")}`.toLowerCase();
  const kinds = [];
  if (/\bai\b|gemini|artificial intelligence/.test(text)) kinds.push("ai");
  if (/mobile|flutter|dart|ios|swiftui|screen time/.test(text)) kinds.push("mobile");
  if (/react|javascript|typescript|web|browser|tailwind/.test(text)) kinds.push("web");
  return kinds.join(" ");
}

function initials(title) {
  return String(title)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function renderProjects(filter = "all") {
  const root = $("#projectGrid");
  if (!root) return;

  const projects = [...(data.projects || [])].sort((a, b) =>
    Number(Boolean(b.featured)) - Number(Boolean(a.featured))
      || Number(a.status === "archive") - Number(b.status === "archive")
      || (b.score || 0) - (a.score || 0));
  const visible = filter === "all" ? projects : projects.filter((project) => projectKind(project).includes(filter));
  const count = $("#projectCarouselCount");
  if (count) count.textContent = `${visible.length} projects`;

  if (!visible.length) {
    root.innerHTML = '<p class="empty-projects">No work in this category yet. Try another filter.</p>';
    return;
  }

  root.innerHTML = visible.map((project, index) => {
    const title = escapeHtml(project.title || "Untitled project");
    const category = escapeHtml(project.category || "Digital product");
    const description = escapeHtml(project.description || project.impact || "");
    const url = safeUrl(project.website || project.demo || project.preview || project.repo) || "#";
    const appStoreUrl = safeUrl(project.app_store || "");
    const image = project.image ? resolveImagePath(project.image) : "";
    const isLive = project.status !== "archive" && url !== "#";
    const isFlagship = Boolean(project.featured);
    const highlightLabel = escapeHtml(project.highlight_label || (appStoreUrl ? "App Store release" : "Featured project"));
    const captureLabel = isFlagship ? highlightLabel : isLive ? "Live site capture" : "Project archive";
    const host = escapeHtml(projectHost(url));
    const tags = (project.tech || []).slice(0, 4).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    const media = image
      ? `<img src="${escapeHtml(image)}" alt="Interface preview of ${title}" width="1440" height="900" loading="${index < 2 ? "eager" : "lazy"}" />`
      : `<span class="project-placeholder"><span>${escapeHtml(initials(project.title))}</span></span>`;
    const framedMedia = `
      <span class="project-windowbar" aria-hidden="true">
        <span class="project-window-controls"><i></i><i></i><i></i></span>
        <span class="project-window-address">${host}</span>
        <span class="project-capture-label">${captureLabel}</span>
      </span>
      <span class="project-shot">${media}</span>`;
    const mediaMarkup = url === "#"
      ? `<div class="project-media" aria-label="${title} project preview">${framedMedia}</div>`
      : `<a class="project-media" href="${escapeHtml(url)}" target="_blank" rel="noreferrer" aria-label="Open the live ${title} product">${framedMedia}</a>`;
    const titleMarkup = url === "#"
      ? title
      : `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${title}</a>`;
    const actionMarkup = isFlagship && appStoreUrl
      ? `<div class="project-flagship-actions">
          <a class="project-action project-site-link" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">Visit product site <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"></path></svg></a>
          <a class="project-app-store" href="${escapeHtml(appStoreUrl)}" target="_blank" rel="noreferrer" aria-label="Download Unchainly on the App Store">
            <img src="/images/app-store-badge.svg" alt="Download on the App Store" width="120" height="40" />
          </a>
        </div>`
      : url === "#"
      ? `<span class="project-action is-archive"><i aria-hidden="true"></i>Archived build</span>`
      : `<a class="project-action" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">View live product <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"></path></svg></a>`;
    const accoladeMarkup = isFlagship
      ? `<div class="project-accolade" aria-label="${highlightLabel}">
          <svg class="project-laurel" viewBox="0 0 24 30" aria-hidden="true"><path d="M20 2C10 7 5 17 6 28M14 7C11 7 9 6 8 4M11 12c-3 0-5-1-6-3m5 9c-3 0-5-1-6-3m7-4c1-3 3-5 6-6m-8 12c1-3 3-5 6-6m-8 12c1-3 3-5 6-6"></path></svg>
          <span>${highlightLabel}</span>
          <svg class="project-laurel is-right" viewBox="0 0 24 30" aria-hidden="true"><path d="M20 2C10 7 5 17 6 28M14 7C11 7 9 6 8 4M11 12c-3 0-5-1-6-3m5 9c-3 0-5-1-6-3m7-4c1-3 3-5 6-6m-8 12c1-3 3-5 6-6m-8 12c1-3 3-5 6-6"></path></svg>
        </div>`
      : "";

    return `
      <article class="project-card reveal ${isLive ? "is-live" : "is-archive"}${isFlagship ? " is-flagship" : ""}" data-kind="${escapeHtml(projectKind(project))}" data-delay="${index % 2}">
        ${accoladeMarkup}
        ${mediaMarkup}
        <div class="project-content">
          <div class="project-topline"><span>${String(index + 1).padStart(2, "0")} / ${isFlagship ? `${highlightLabel} / ` : ""}${category}</span><span>${escapeHtml(project.year || "2026")}</span></div>
          <h3>${titleMarkup}</h3>
          <p>${description}</p>
          <div class="project-card-footer">
            <div class="project-tags" aria-label="Technologies">${tags}</div>
            ${actionMarkup}
          </div>
        </div>
      </article>`;
  }).join("");
  root.scrollLeft = 0;

  $$(".project-media img", root).forEach((image) => {
    image.addEventListener("error", () => {
      const card = image.closest(".project-card");
      const title = card?.querySelector("h3")?.textContent || "Project";
      image.replaceWith(Object.assign(document.createElement("span"), {
        className: "project-placeholder",
        innerHTML: `<span>${escapeHtml(initials(title))}</span>`,
      }));
    }, { once: true });
  });

  observeReveals(root);
}

function setupProjectFilters() {
  $$("[data-project-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      $$("[data-project-filter]").forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      renderProjects(button.dataset.projectFilter || "all");
    });
  });
}

function experienceSummary(item) {
  return item.bullets?.[0] || item.metrics?.[0] || "A role spanning craft, collaboration, and delivery.";
}

function renderExperience() {
  const root = $("#experienceList");
  if (!root) return;

  const timeline = data.timeline || [];
  root.innerHTML = timeline.map((item, index) => {
    const roleUrl = safeUrl(item.url);
    const roleTitle = escapeHtml(item.title || "Experience");
    const roleHeading = roleUrl
      ? `<a href="${roleUrl}" target="_blank" rel="noreferrer">${roleTitle}<span aria-hidden="true">↗</span></a>`
      : roleTitle;
    const roleLink = roleUrl
      ? `<a class="experience-live-link" href="${roleUrl}" target="_blank" rel="noreferrer"><i aria-hidden="true"></i>${escapeHtml(item.link_label || "Open live system")}<span aria-hidden="true">↗</span></a>`
      : "";

    return `
      <article class="experience-item reveal ${index >= 5 ? "is-extra" : ""}" ${index >= 5 ? "hidden" : ""}>
        <div class="experience-date">${escapeHtml(item.date || item.year || "")}</div>
        <div class="experience-main">
          <h3>${roleHeading}</h3>
          <p>${escapeHtml(experienceSummary(item))}</p>
          ${roleLink}
        </div>
        <div class="experience-stack" aria-label="Focus areas">${(item.stack || item.tags || []).slice(0, 5).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
      </article>`;
  }).join("");

  const toggle = $("#experienceToggle");
  if (!toggle) return;
  const extras = $$(".experience-item.is-extra", root);
  toggle.hidden = extras.length === 0;
  toggle.disabled = extras.length === 0;
  toggle.setAttribute("aria-expanded", "false");
  toggle.innerHTML = 'Show full history <span aria-hidden="true">＋</span>';

  toggle.onclick = () => {
    const nextExpanded = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(nextExpanded));
    extras.forEach((item) => {
      item.hidden = !nextExpanded;
      item.classList.toggle("is-visible", nextExpanded);
    });
    toggle.innerHTML = nextExpanded
      ? 'Show less <span aria-hidden="true">−</span>'
      : 'Show full history <span aria-hidden="true">＋</span>';
  };
}

const archiveState = { tab: "all" };

function uniqueImages(items) {
  const seen = new Set();
  return items.filter((item) => {
    const path = item.src || item.image;
    if (!path || seen.has(path)) return false;
    seen.add(path);
    return true;
  });
}

function archiveCollections() {
  const moments = uniqueImages([...(data.images || []), ...(data.gallery || []), ...extraArchiveItems])
    .map((item) => ({ ...item, archiveCategory: "moments" }));
  const graphics = uniqueImages(data.graphics || [])
    .map((item) => ({ ...item, image: item.src, archiveCategory: "graphics" }));
  const credentials = uniqueImages((data.certs || data.certificates || []).map((item) => ({
    ...item,
    image: item.image || (String(item.link || "").startsWith("/images/") ? item.link : ""),
    tag: item.issuer || "credential",
    fit: "contain",
  }))).map((item) => ({ ...item, archiveCategory: "credentials" }));

  return { moments, graphics, credentials };
}

function archiveItems() {
  const collections = archiveCollections();
  if (archiveState.tab !== "all") return collections[archiveState.tab] || [];
  return uniqueImages([...collections.moments, ...collections.graphics, ...collections.credentials]);
}

function renderArchive() {
  const root = $("#archiveGrid");
  if (!root) return;

  const items = archiveItems();
  const count = $("#archiveCarouselCount");
  if (count) count.textContent = `${items.length} pictures`;
  root.innerHTML = items.map((item, index) => {
    const path = resolveImagePath(item.src || item.image || "");
    const title = item.title || item.alt || "Portfolio image";
    const label = item.tag || item.category || item.archiveCategory || archiveState.tab;
    return `
      <button class="archive-item reveal ${item.fit === "contain" ? "is-contain" : ""}" type="button" data-lightbox-src="${escapeHtml(path)}" data-lightbox-title="${escapeHtml(title)}" aria-label="View ${escapeHtml(title)}" data-delay="${index % 3}">
        <img src="${escapeHtml(path)}" alt="" width="720" height="540" loading="lazy" />
        <span><b>${escapeHtml(title)}</b><i>${escapeHtml(label)}</i></span>
      </button>`;
  }).join("");
  root.scrollLeft = 0;

  $$("[data-lightbox-src]", root).forEach((button) => button.addEventListener("click", () => openLightbox(button.dataset.lightboxSrc, button.dataset.lightboxTitle)));
  observeReveals(root);
}

function setupArchive() {
  $$("[data-archive-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      archiveState.tab = button.dataset.archiveTab;
      $$("[data-archive-tab]").forEach((item) => item.setAttribute("aria-selected", String(item === button)));
      renderArchive();
    });
  });
}

function setupCarousel(trackSelector, previousSelector, nextSelector) {
  const track = $(trackSelector);
  if (!track) return;
  const move = (direction) => {
    const distance = Math.max(260, track.clientWidth * 0.72) * direction;
    track.scrollBy({ left: distance, behavior: reduceMotion.matches ? "auto" : "smooth" });
  };
  $(previousSelector)?.addEventListener("click", () => move(-1));
  $(nextSelector)?.addEventListener("click", () => move(1));
}

function renderCertificates() {
  const grid = $("#certGrid");
  if (!grid || !PORTFOLIO_DATA.certs) return;

  const certificates = [...PORTFOLIO_DATA.certs]
    .sort((a, b) => (b.preview_weight || 0) - (a.preview_weight || 0));

  const total = $("#certTotal");
  if (total) total.textContent = String(certificates.length).padStart(2, "0");

  grid.innerHTML = certificates.map((cert, index) => {
    const title = escapeHtml(cert.title || "Professional certificate");
    const issuer = escapeHtml(cert.issuer || "Credential issuer");
    const issued = escapeHtml(cert.issued_detail || cert.issued || "Date not listed");
    const credentialId = cert.credential_id && cert.credential_id !== "N/A"
      ? escapeHtml(cert.credential_id)
      : "Not applicable";
    const notes = escapeHtml(cert.notes || "Professional learning and achievement credential.");
    const recordType = escapeHtml(cert.type || "Credential");
    const verificationUrl = safeUrl(cert.verification_url || "");
    const originalImage = escapeHtml(resolveImagePath(cert.image || cert.link || ""));
    const enhancedPreview = enhancedCertificatePreviewByTitle[cert.title];
    const previewImage = escapeHtml(resolveImagePath(enhancedPreview || cert.image || cert.link || ""));
    const hasEnhancedPreview = Boolean(enhancedPreview);
    const previewRatio = certificatePreviewRatioByTitle[cert.title] || 1.414;
    const hasWidePreview = previewRatio > 1.8;

    const verificationMarkup = verificationUrl
      ? `<a class="cert-text-link" href="${escapeHtml(verificationUrl)}" target="_blank" rel="noreferrer">Open verified listing <span aria-hidden="true">↗</span></a>`
      : `<button class="cert-text-link" type="button" data-cert-open data-cert-image="${originalImage}" data-cert-title="${title}">Inspect credential <span aria-hidden="true">↗</span></button>`;
    const viewHint = verificationUrl
      ? "Product record · Open full size"
      : hasEnhancedPreview
        ? "Restored scan · Open original photo"
        : "Original document · View full size";

    return `
      <article class="cert-slide${index === 0 ? " is-active" : ""}${hasEnhancedPreview ? " has-enhanced-preview" : ""}${hasWidePreview ? " has-wide-preview" : ""}" role="group" aria-roledescription="slide" aria-label="${index + 1} of ${certificates.length}: ${title}" data-cert-index="${index}">
        <div class="cert-slide-media" data-preview-label="${verificationUrl ? "COMMUNITY RECOGNITION / VERIFIED LISTING" : hasEnhancedPreview ? "RESTORED SCAN / ORIGINAL ON CLICK" : "DOCUMENT / VERIFIED ARCHIVE"}">
          <button class="cert-open" type="button" data-cert-open data-cert-image="${originalImage}" data-cert-title="${title}" aria-label="View original ${title} full size">
            <span class="cert-document" style="--cert-preview-ratio: ${previewRatio}">
              <img src="${previewImage}" alt="${hasEnhancedPreview ? `Restored scan of ${title}` : `${title}, issued by ${issuer}`}" width="2200" height="1556" loading="${index === 0 ? "eager" : "lazy"}" />
            </span>
            <span class="cert-view-hint"><span>${viewHint}</span><span aria-hidden="true">↗</span></span>
          </button>
        </div>
        <div class="cert-slide-copy">
          <div class="cert-slide-topline"><span>${recordType} / ${String(index + 1).padStart(2, "0")}</span><span>${escapeHtml(cert.issued || "Archive")}</span></div>
          <p class="cert-slide-issuer">${issuer}</p>
          <h4>${title}</h4>
          <p class="cert-slide-notes">${notes}</p>
          <dl class="cert-details">
            <div><dt>Issued</dt><dd>${issued}</dd></div>
            <div><dt>Credential ID</dt><dd>${credentialId}</dd></div>
          </dl>
          ${verificationMarkup}
        </div>
      </article>`;
  }).join("");
}

function setupCertificateCarousel() {
  const carousel = $("#certificateCarousel");
  const track = $("#certGrid");
  const previous = $("#certPrev");
  const next = $("#certNext");
  const autoplayToggle = $("#certAutoplayToggle");
  const autoplayLabel = $("#certAutoplayLabel");
  const counter = $("#certCounter");
  const liveRegion = $("#certLive");
  const slides = $$(".cert-slide", track);
  if (!carousel || !track || !slides.length) return;

  const autoplayDelay = 6000;
  let activeIndex = 0;
  let timerId = 0;
  let scrollFrame = 0;
  let userPaused = reduceMotion.matches;
  let pointerInside = false;
  let focusInside = false;
  let isVisible = true;

  const clearTimer = () => {
    window.clearTimeout(timerId);
    timerId = 0;
    carousel.classList.remove("is-progressing");
  };

  const updateAutoplayControl = () => {
    if (!autoplayToggle || !autoplayLabel) return;
    const autoplayOn = !userPaused;
    autoplayToggle.setAttribute("aria-pressed", String(autoplayOn));
    autoplayToggle.setAttribute("aria-label", autoplayOn ? "Pause certificate autoplay" : "Resume certificate autoplay");
    autoplayLabel.textContent = autoplayOn ? "Auto on" : "Auto off";
  };

  const updateActiveSlide = (index, announce = false) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === activeIndex));
    if (counter) counter.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    if (announce && liveRegion) {
      const title = slides[activeIndex].querySelector("h4")?.textContent || "Credential";
      liveRegion.textContent = `Showing certificate ${activeIndex + 1} of ${slides.length}: ${title}`;
    }
  };

  const canAutoplay = () => !userPaused && !pointerInside && !focusInside && isVisible && !document.hidden;

  const scheduleAutoplay = () => {
    clearTimer();
    updateAutoplayControl();
    if (!canAutoplay()) return;
    void carousel.offsetWidth;
    carousel.classList.add("is-progressing");
    timerId = window.setTimeout(() => goToSlide(activeIndex + 1, false), autoplayDelay);
  };

  const goToSlide = (index, announce = true) => {
    const nextIndex = (index + slides.length) % slides.length;
    updateActiveSlide(nextIndex, announce);
    track.scrollTo({
      left: slides[nextIndex].offsetLeft,
      behavior: reduceMotion.matches ? "auto" : "smooth",
    });
    scheduleAutoplay();
  };

  previous?.addEventListener("click", () => goToSlide(activeIndex - 1));
  next?.addEventListener("click", () => goToSlide(activeIndex + 1));
  autoplayToggle?.addEventListener("click", () => {
    userPaused = !userPaused;
    if (liveRegion) liveRegion.textContent = userPaused ? "Certificate autoplay paused." : "Certificate autoplay resumed.";
    scheduleAutoplay();
  });

  track.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    goToSlide(activeIndex + (event.key === "ArrowRight" ? 1 : -1));
  });

  track.addEventListener("scroll", () => {
    window.cancelAnimationFrame(scrollFrame);
    scrollFrame = window.requestAnimationFrame(() => {
      const closestIndex = slides.reduce((closest, slide, index) => (
        Math.abs(slide.offsetLeft - track.scrollLeft) < Math.abs(slides[closest].offsetLeft - track.scrollLeft) ? index : closest
      ), 0);
      if (closestIndex !== activeIndex) updateActiveSlide(closestIndex);
    });
  }, { passive: true });

  carousel.addEventListener("mouseenter", () => {
    pointerInside = true;
    clearTimer();
  });
  carousel.addEventListener("mouseleave", () => {
    pointerInside = false;
    scheduleAutoplay();
  });
  carousel.addEventListener("focusin", () => {
    focusInside = true;
    clearTimer();
  });
  carousel.addEventListener("focusout", (event) => {
    if (carousel.contains(event.relatedTarget)) return;
    focusInside = false;
    scheduleAutoplay();
  });

  $$('[data-cert-open]', carousel).forEach((button) => {
    button.addEventListener("click", () => openLightbox(button.dataset.certImage, button.dataset.certTitle));
  });

  if ("IntersectionObserver" in window) {
    isVisible = false;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      scheduleAutoplay();
    }, { threshold: 0.25 });
    observer.observe(carousel);
  }

  document.addEventListener("visibilitychange", scheduleAutoplay);
  reduceMotion.addEventListener?.("change", (event) => {
    if (event.matches) userPaused = true;
    scheduleAutoplay();
  });

  updateActiveSlide(0);
  scheduleAutoplay();
}

const GITHUB_USER = "PrimeSalad";
const GITHUB_API = "https://api.github.com";
const GITHUB_FALLBACK_PROFILE = {
  avatar_url: "https://avatars.githubusercontent.com/u/160018090?v=4",
  name: "Gene Elpie L. Landoy",
  login: GITHUB_USER,
  public_repos: 46,
  followers: 8,
};
const GITHUB_FALLBACK_REPOS = [
  { name: "Smart-Trike-A-Mobile-TODA-Booking-System", language: "TypeScript", pushed_at: "2026-08-23T00:00:00Z", html_url: "https://github.com/PrimeSalad/Smart-Trike-A-Mobile-TODA-Booking-System" },
  { name: "flowguard", language: "TypeScript", pushed_at: "2026-08-20T00:00:00Z", html_url: "https://github.com/PrimeSalad/flowguard" },
  { name: "ar-system", language: "TypeScript", pushed_at: "2026-08-18T00:00:00Z", html_url: "https://github.com/PrimeSalad/ar-system" },
  { name: "sbccc", language: "CSS", pushed_at: "2026-08-13T00:00:00Z", html_url: "https://github.com/PrimeSalad/sbccc" },
  { name: "lyds", language: "TypeScript", pushed_at: "2026-08-03T00:00:00Z", html_url: "https://github.com/PrimeSalad/lyds" },
  { name: "hiraya", language: "TypeScript", pushed_at: "2026-07-22T00:00:00Z", html_url: "https://github.com/PrimeSalad/hiraya" },
];
const GITHUB_FALLBACK_EVENTS = GITHUB_FALLBACK_REPOS.map((repo) => ({
  type: "CachedUpdateEvent",
  repo: { name: `${GITHUB_USER}/${repo.name}` },
  created_at: repo.pushed_at,
  payload: {},
}));

async function fetchGithubJson(path) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 9000);
  try {
    const response = await fetch(`${GITHUB_API}${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`GitHub request failed: ${response.status}`);
    return response.json();
  } finally {
    window.clearTimeout(timeout);
  }
}

function githubEventLabel(event) {
  const repo = event.repo?.name?.replace(`${GITHUB_USER}/`, "") || "a repository";
  const commitCount = event.payload?.commits?.length || 1;
  const labels = {
    PushEvent: `Pushed ${commitCount} commit${commitCount === 1 ? "" : "s"} to`,
    CreateEvent: `Created ${event.payload?.ref_type || "something new"} in`,
    PullRequestEvent: `${event.payload?.action || "Updated"} a pull request in`,
    IssuesEvent: `${event.payload?.action || "Updated"} an issue in`,
    IssueCommentEvent: "Commented in",
    WatchEvent: "Starred",
    ForkEvent: "Forked",
    ReleaseEvent: `${event.payload?.action || "Published"} a release in`,
    DeleteEvent: `Deleted ${event.payload?.ref_type || "a reference"} from`,
    CachedUpdateEvent: "Updated",
  };
  return { action: labels[event.type] || event.type.replace(/Event$/, " activity in"), repo };
}

async function fetchGithubContributions(username) {
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}`, { signal: controller.signal });
    window.clearTimeout(timeout);
    if (!response.ok) return null;
    const data = await response.json();

    // Convert array format to object format for easier lookup
    if (data && Array.isArray(data.contributions)) {
      const contribMap = {};
      data.contributions.forEach(item => {
        contribMap[item.date] = {
          count: item.count,
          level: item.level
        };
      });
      return {
        total: data.total,
        contributions: contribMap
      };
    }

    return data;
  } catch {
    return null;
  }
}

function renderGithubHeatmap(contributionData, events) {
  const root = $("#githubHeatmap");
  const monthsRoot = $("#githubHeatmapMonths");
  const tooltip = $("#heatmapTooltip");
  const panel = document.querySelector(".github-heatmap-panel");
  if (!root) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  /* ── Build day-by-day map from contributions API (includes private) ── */
  const dayMap = new Map();
  let totalContributions = 0;

  if (contributionData && contributionData.contributions) {
    /* Full year data from contributions API - includes all commits */
    const contribs = contributionData.contributions;
    for (const [dateKey, info] of Object.entries(contribs)) {
      const count = typeof info === "number" ? info : (info.count ?? 0);
      dayMap.set(dateKey, count);
      const d = new Date(dateKey);
      if (d <= today) totalContributions += count;
    }
  } else {
    /* Fallback: build from GitHub public events */
    (events || []).forEach((event) => {
      const day = String(event.created_at || "").slice(0, 10);
      if (day) dayMap.set(day, (dayMap.get(day) || 0) + 1);
    });
    dayMap.forEach((count) => { totalContributions += count; });
  }

  /* Keep the hero proof metric synced to the current calendar year. */
  if (contributionData && contributionData.contributions) {
    const currentYear = today.getFullYear();
    let currentYearContributions = 0;
    dayMap.forEach((count, dateKey) => {
      if (dateKey.startsWith(`${currentYear}-`)) currentYearContributions += count;
    });
    const heroContributionCount = $("#heroContributionCount");
    const heroContributionLabel = $("#heroContributionLabel");
    if (heroContributionCount) heroContributionCount.textContent = currentYearContributions.toLocaleString();
    if (heroContributionLabel) heroContributionLabel.textContent = `contributions in ${currentYear}`;
  }

  /* ── Calculate date range: FULL 1 year back from today, aligned to Sunday ── */
  const start = new Date(today);
  start.setDate(start.getDate() - 364); // Exactly 52 weeks back
  start.setDate(start.getDate() - start.getDay()); // align to Sunday

  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // extend to Saturday

  totalContributions = 0;
  dayMap.forEach((count, dateKey) => {
    const date = new Date(`${dateKey}T00:00:00`);
    if (date >= start && date <= today) totalContributions += count;
  });

  const totalDays = Math.round((endDate - start) / 86400000) + 1;
  const totalWeeks = Math.ceil(totalDays / 7);

  const formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  /* ── Render month labels (GitHub style - positioned above weeks) ── */
  if (monthsRoot) {
    const cellSize = 11;
    const gap = 3;
    const weekWidth = cellSize + gap;
    const monthSpans = [];
    let lastMonth = -1;

    for (let w = 0; w < totalWeeks; w++) {
      const weekStart = new Date(start);
      weekStart.setDate(start.getDate() + w * 7);
      const month = weekStart.getMonth();

      if (month !== lastMonth) {
        const leftPos = w * weekWidth;
        monthSpans.push(`<span style="position:absolute;left:${leftPos}px">${monthNames[month]}</span>`);
        lastMonth = month;
      }
    }
    monthsRoot.innerHTML = monthSpans.join("");
  }

  /* ── Render cells ── */
  const cells = [];
  let longestStreak = 0;
  let currentStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const count = dayMap.get(key) || 0;
    const future = date > today;

    let level;
    if (future) {
      level = 0;
    } else if (contributionData && contributionData.contributions) {
      const info = contributionData.contributions[key];
      if (info && typeof info === "object" && info.level !== undefined) {
        level = info.level;
      } else {
        level = count === 0 ? 0 : count <= 3 ? 1 : count <= 6 ? 2 : count <= 9 ? 3 : 4;
      }
    } else {
      level = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 6 ? 3 : 4;
    }

    /* Streak calculation */
    if (!future && date <= today) {
      if (count > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    const label = future
      ? `${formatter.format(date)} — upcoming`
      : count === 0
        ? `No contributions on ${formatter.format(date)}`
        : `${count} contribution${count === 1 ? "" : "s"} on ${formatter.format(date)}`;

    const weekCol = Math.floor(i / 7);
    cells.push(`<span class="heatmap-cell ${future ? "is-future" : ""}" data-level="${level}" data-date="${key}" data-count="${count}" data-week="${weekCol}" aria-label="${escapeHtml(label)}"></span>`);
  }

  /* Current streak: count backwards from today */
  currentStreak = 0;
  for (let i = 0; ; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const count = dayMap.get(key) || 0;
    if (i === 0 && count === 0) {
      /* Today might not have contributions yet, check yesterday */
      continue;
    }
    if (count > 0) {
      currentStreak++;
    } else {
      break;
    }
    if (i > 400) break;
  }

  root.innerHTML = cells.join("");
  root.setAttribute("aria-label", `GitHub contribution graph — ${totalContributions} contributions in the last year.`);

  /* ── Tooltip interactions ── */
  if (tooltip && panel) {
    root.addEventListener("mouseenter", (e) => {
      if (e.target.classList.contains("heatmap-cell") && !e.target.classList.contains("is-future")) {
        const count = parseInt(e.target.dataset.count, 10) || 0;
        const dateStr = e.target.dataset.date;
        const d = new Date(dateStr + "T00:00:00");
        const formatted = formatter.format(d);
        tooltip.innerHTML = count === 0
          ? `No contributions on <strong>${formatted}</strong>`
          : `<strong>${count}</strong> contribution${count === 1 ? "" : "s"} on <strong>${formatted}</strong>`;
        tooltip.classList.add("is-visible");
      }
    }, true);

    root.addEventListener("mousemove", (e) => {
      if (e.target.classList.contains("heatmap-cell") && !e.target.classList.contains("is-future")) {
        const panelRect = panel.getBoundingClientRect();
        const x = e.clientX - panelRect.left;
        const y = e.target.getBoundingClientRect().top - panelRect.top;
        tooltip.style.left = `${x - tooltip.offsetWidth / 2}px`;
        tooltip.style.top = `${y - tooltip.offsetHeight - 10}px`;
      }
    }, true);

    root.addEventListener("mouseleave", (e) => {
      if (e.target.classList.contains("heatmap-cell")) {
        tooltip.classList.remove("is-visible");
      }
    }, true);
  }

  /* ── Contribution stats ── */
  const totalEl = $("#contribTotal");
  const longestEl = $("#contribLongestStreak");
  const currentEl = $("#contribCurrentStreak");

  if (totalEl) totalEl.textContent = totalContributions.toLocaleString();
  if (longestEl) longestEl.textContent = String(longestStreak);
  if (currentEl) currentEl.textContent = String(currentStreak);

  /* ── Update status text ── */
  const status = $("#githubStatus");
  if (status) {
    const contributionText = totalContributions === 1 ? "contribution" : "contributions";
    status.textContent = `${totalContributions.toLocaleString()} ${contributionText} in the last year`;
  }

  /* ── Staggered entrance animation ── */
  if (!reduceMotion.matches) {
    const allCells = root.querySelectorAll(".heatmap-cell");
    allCells.forEach((cell) => {
      cell.style.opacity = "0";
      cell.style.transform = "scale(0)";
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          allCells.forEach((cell, idx) => {
            const week = parseInt(cell.dataset.week, 10) || 0;
            const delay = week * 12 + (idx % 7) * 8;
            window.setTimeout(() => {
              cell.style.transition = "opacity 200ms ease, transform 200ms cubic-bezier(.2,1,.3,1)";
              cell.style.opacity = "1";
              cell.style.transform = "scale(1)";
            }, delay);
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.15 });

    observer.observe(root);
  }
}

function renderGithubFeed(events) {
  const root = $("#githubFeed");
  if (!root) return;
  const unique = [];
  const seen = new Set();
  for (const event of events) {
    const key = `${event.type}-${event.repo?.name}-${String(event.created_at).slice(0, 10)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(event);
    if (unique.length === 6) break;
  }

  if (!unique.length) {
    root.innerHTML = '<li>No recent public events returned by GitHub.</li>';
    return;
  }

  root.innerHTML = unique.map((event) => {
    const { action, repo } = githubEventLabel(event);
    const repoUrl = `https://github.com/${encodeURI(event.repo?.name || GITHUB_USER)}`;
    const date = new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric" }).format(new Date(event.created_at));
    return `<li><span class="github-event-dot" aria-hidden="true"></span><p>${escapeHtml(action)} <a href="${escapeHtml(repoUrl)}" target="_blank" rel="noreferrer">${escapeHtml(repo)}</a><time datetime="${escapeHtml(event.created_at)}">${escapeHtml(date)}</time></p></li>`;
  }).join("");
}

function renderGithubRepos(repos) {
  const root = $("#githubRepos");
  if (!root) return;
  const visible = repos.filter((repo) => !repo.fork).slice(0, 6);
  root.innerHTML = visible.map((repo) => {
    const updated = new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric" }).format(new Date(repo.pushed_at || repo.updated_at));
    return `<a class="github-repo" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noreferrer"><span><strong>${escapeHtml(repo.name)}</strong><small>${escapeHtml(repo.language || "Repository")}</small></span><span><small>${escapeHtml(updated)}</small><b aria-hidden="true">↗</b></span></a>`;
  }).join("");
}

async function loadGithubActivity() {
  const dashboard = $("#githubDashboard");
  const status = $("#githubStatus");
  if (!dashboard || !status) return;

  try {
    const [profileResult, eventsResult, reposResult, contributionsResult] = await Promise.allSettled([
      fetchGithubJson(`/users/${GITHUB_USER}`),
      fetchGithubJson(`/users/${GITHUB_USER}/events/public?per_page=100`),
      fetchGithubJson(`/users/${GITHUB_USER}/repos?sort=pushed&direction=desc&per_page=12`),
      fetchGithubContributions(GITHUB_USER),
    ]);

    const profile = profileResult.status === "fulfilled" ? profileResult.value : GITHUB_FALLBACK_PROFILE;
    const events = eventsResult.status === "fulfilled" && eventsResult.value.length
      ? eventsResult.value
      : GITHUB_FALLBACK_EVENTS;
    const repos = reposResult.status === "fulfilled" && reposResult.value.length
      ? reposResult.value
      : GITHUB_FALLBACK_REPOS;
    const contributions = contributionsResult.status === "fulfilled" ? contributionsResult.value : null;
    const usingCachedGithub = [profileResult, eventsResult, reposResult].some((result) => result.status === "rejected");

    $("#githubAvatar").src = profile.avatar_url || GITHUB_FALLBACK_PROFILE.avatar_url;
    $("#githubName").textContent = profile.name || profile.login || GITHUB_FALLBACK_PROFILE.name;
    $("#githubRepoCount").textContent = String(profile.public_repos ?? repos.length).padStart(2, "0");
    $("#githubFollowerCount").textContent = String(profile.followers ?? GITHUB_FALLBACK_PROFILE.followers).padStart(2, "0");
    $("#githubEventCount").textContent = String(events.length).padStart(2, "0");
    renderGithubHeatmap(contributions, events);
    renderGithubFeed(events);
    renderGithubRepos(repos);
    dashboard.dataset.source = usingCachedGithub ? "cached-plus-live" : "live";
    if (!contributions) {
      status.textContent = usingCachedGithub
        ? "Cached GitHub activity · live API rate-limited"
        : "Public events loaded · contribution graph unavailable";
    }
  } catch {
    status.textContent = "Cached GitHub activity · live refresh unavailable";
    renderGithubHeatmap(null, GITHUB_FALLBACK_EVENTS);
    renderGithubFeed(GITHUB_FALLBACK_EVENTS);
    renderGithubRepos(GITHUB_FALLBACK_REPOS);
    dashboard.dataset.source = "cached";
  } finally {
    dashboard.setAttribute("aria-busy", "false");
  }
}

function openLightbox(src, title) {
  const dialog = $("#lightbox");
  const image = $("#lightboxImage");
  const heading = $("#lightboxTitle");
  if (!dialog || !image || !heading || !src) return;
  image.src = src;
  image.alt = title || "Portfolio image";
  heading.textContent = title || "Portfolio image";
  if (!dialog.open) dialog.showModal();
}

function setupLightbox() {
  const dialog = $("#lightbox");
  $("#lightboxClose")?.addEventListener("click", () => dialog?.close());
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

let testimonialIndex = 0;

function renderTestimonial() {
  const item = testimonials[testimonialIndex];
  $("#testimonialQuote").textContent = item.quote;
  $("#testimonialName").textContent = item.name;
  $("#testimonialRole").textContent = item.role;
  $("#quoteCounter").textContent = `${String(testimonialIndex + 1).padStart(2, "0")} / ${String(testimonials.length).padStart(2, "0")}`;
}

function setupTestimonials() {
  $("#quotePrev")?.addEventListener("click", () => {
    testimonialIndex = (testimonialIndex - 1 + testimonials.length) % testimonials.length;
    renderTestimonial();
  });
  $("#quoteNext")?.addEventListener("click", () => {
    testimonialIndex = (testimonialIndex + 1) % testimonials.length;
    renderTestimonial();
  });
  renderTestimonial();
}

let revealObserver;

function observeReveals(root = document) {
  const elements = $$(".reveal:not(.is-visible)", root);
  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -7%" });
  }
  elements.forEach((element) => revealObserver.observe(element));
}

function setupTheme() {
  const storageKey = "gene-portfolio-theme";
  const saved = (() => {
    try { return localStorage.getItem(storageKey); } catch { return null; }
  })();
  const initial = saved === "dark" || saved === "light" ? saved : "light";

  const apply = (theme) => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    $("meta[name=\"theme-color\"]")?.setAttribute("content", theme === "dark" ? "#0c0c0f" : "#ffffff");
    $$('[data-theme-toggle]').forEach((button) => button.setAttribute("aria-pressed", String(theme === "dark")));
    $$('[data-theme-label]').forEach((label) => { label.textContent = theme === "dark" ? "Light mode" : "Dark mode"; });
  };

  apply(initial);
  $$('[data-theme-toggle]').forEach((button) => button.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    apply(next);
    try { localStorage.setItem(storageKey, next); } catch { /* Storage can be unavailable. */ }
  }));
}

function setupHeroLocalTime() {
  const time = $("#heroLocalTime");
  if (!time) return;

  const formatter = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const update = () => {
    const now = new Date();
    time.textContent = `MRQ ${formatter.format(now)}`;
    time.dateTime = now.toISOString();
  };

  update();
  window.setInterval(update, 60_000);
}

function setupMobileMenu() {
  const button = $("#menuToggle");
  const menu = $("#mobileMenu");
  if (!button || !menu) return;

  const setOpen = (open) => {
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    menu.hidden = !open;
    document.body.classList.toggle("menu-open", open);
    button.innerHTML = open
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>';
  };

  button.addEventListener("click", () => setOpen(button.getAttribute("aria-expanded") !== "true"));
  $$("a", menu).forEach((link) => link.addEventListener("click", () => setOpen(false)));
  window.addEventListener("resize", () => { if (window.innerWidth > 900) setOpen(false); }, { passive: true });
}

function setupAvailabilityPanel() {
  const panel = $("#availabilityPanel");
  const backdrop = $(".availability-backdrop");
  const toggles = $$('[data-availability-toggle]');
  const closeButton = $("[data-availability-close]", panel);
  if (!panel || !toggles.length || !closeButton) return;

  let lastTrigger = null;

  const setOpen = (open, trigger = lastTrigger, restoreFocus = false) => {
    if (open && trigger) lastTrigger = trigger;
    panel.hidden = !open;
    if (backdrop) backdrop.hidden = !open;
    document.body.classList.toggle("availability-open", open);
    toggles.forEach((button) => {
      button.setAttribute("aria-expanded", String(open));
      $$('[data-availability-symbol]', button).forEach((symbol) => {
        symbol.textContent = open ? "−" : "+";
      });
    });

    if (open) {
      window.requestAnimationFrame(() => closeButton.focus());
    } else if (restoreFocus && lastTrigger) {
      lastTrigger.focus();
    }
  };

  toggles.forEach((button) => button.addEventListener("click", () => {
    setOpen(panel.hidden, button, false);
  }));

  closeButton.addEventListener("click", () => setOpen(false, lastTrigger, true));
  backdrop?.addEventListener("click", () => setOpen(false, lastTrigger, true));

  document.addEventListener("click", (event) => {
    if (panel.hidden || panel.contains(event.target) || event.target.closest("[data-availability-toggle]")) return;
    setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || panel.hidden) return;
    event.preventDefault();
    setOpen(false, lastTrigger, true);
  });

  if (new URLSearchParams(window.location.search).get("availability") === "open") {
    setOpen(true, toggles[0]);
  }
}

function setupScrollUX() {
  const progress = $("#pageProgress");
  const sections = $$("main section[id]");
  const links = $$(".rail-link");

  const onScroll = () => {
    const available = document.documentElement.scrollHeight - window.innerHeight;
    const percent = available > 0 ? (window.scrollY / available) * 100 : 0;
    if (progress) progress.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (!("IntersectionObserver" in window)) return;
  const navObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const id = visible.target.id === "top" ? "work" : visible.target.id;
    links.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`));
  }, { rootMargin: "-22% 0px -58%", threshold: [0.05, 0.2, 0.5] });
  sections.forEach((section) => navObserver.observe(section));
}

function fieldError(id, message = "") {
  const field = $(`#${id}`);
  const error = $(`[data-error-for="${id}"]`);
  if (!field || !error) return;
  field.setAttribute("aria-invalid", String(Boolean(message)));
  error.textContent = message;
}

function setupContactEmail() {
  const button = $("#copyEmailButton");
  const status = $("#copyEmailStatus");
  if (!button || !status) return;
  const label = $("[data-copy-label]", button);
  if (!label) return;

  const copyWithFallback = async (value) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }

    const fallback = document.createElement("textarea");
    fallback.value = value;
    fallback.setAttribute("readonly", "");
    fallback.style.position = "fixed";
    fallback.style.opacity = "0";
    document.body.appendChild(fallback);
    fallback.select();
    const copied = document.execCommand("copy");
    fallback.remove();
    return copied;
  };

  button.addEventListener("click", async () => {
    const email = button.dataset.email || "g.landoyelpie@gmail.com";
    try {
      const copied = await copyWithFallback(email);
      if (!copied) throw new Error("Clipboard unavailable");
      button.classList.add("is-copied");
      label.textContent = "Copied";
      status.textContent = "Email address copied to clipboard.";
      window.setTimeout(() => {
        button.classList.remove("is-copied");
        label.textContent = "Copy address";
      }, 2400);
    } catch {
      status.textContent = "Copy is unavailable. Use the email link instead.";
    }
  });
}

function setupContactForm() {
  const form = $("#contactForm");
  const status = $("#contactStatus");
  if (!form || !status) return;
  const submit = $("button[type=\"submit\"]", form);
  if (!submit) return;
  const submitDefault = submit.innerHTML;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form).entries());
    const emailOkay = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.email || ""));
    fieldError("contactName", String(values.name || "").trim() ? "" : "Please add your name.");
    fieldError("contactEmail", emailOkay ? "" : "Enter a valid email address.");
    fieldError("contactMessage", String(values.message || "").trim().length >= 10 ? "" : "Add at least 10 characters so I have some context.");

    const firstInvalid = $("[aria-invalid=\"true\"]", form);
    if (firstInvalid) {
      firstInvalid.focus();
      status.textContent = "Please check the highlighted fields.";
      return;
    }

    submit.disabled = true;
    submit.innerHTML = '<span>Sending…</span><span class="contact-send-arrow" aria-hidden="true">↗</span>';
    status.textContent = "Sending your note…";

    try {
      await submitContactForm({ name: String(values.name).trim(), email: String(values.email).trim(), message: String(values.message).trim() });
      form.reset();
      status.textContent = "Note sent. I’ll get back to you soon.";
    } catch {
      status.innerHTML = 'The form is offline right now. <a href="mailto:g.landoyelpie@gmail.com">Send an email instead.</a>';
    } finally {
      submit.disabled = false;
      submit.innerHTML = submitDefault;
    }
  });

  $$("input, textarea", form).forEach((field) => field.addEventListener("blur", () => {
    if (field.value.trim()) fieldError(field.id, "");
  }));
}

function localPortfolioAnswer(question) {
  const query = String(question || "").toLowerCase();
  const projects = data.projects || [];
  const roles = data.timeline || [];
  const certs = data.certs || data.certificates || [];
  const achievements = data.achievements || [];

  if (/project|build|product|work/.test(query)) {
    const names = projects.slice(0, 6).map((project) => project.title).join(", ");
    return `Gene has ${projects.length} documented projects across web, mobile, AI, public service, research, education, and business systems. Featured work includes ${names}.`;
  }
  if (/stack|skill|tech|tool|language/.test(query)) {
    return "Gene works across React, Next.js, JavaScript, TypeScript, Tailwind CSS, Flutter, Dart, Node.js, Express, Python, Flask, FastAPI, Firebase, PostgreSQL, MongoDB, Supabase, Figma, and Adobe creative tools.";
  }
  if (/experience|role|job|career/.test(query)) {
    const names = roles.slice(0, 5).map((role) => role.title).join("; ");
    return `Gene's documented experience includes ${names}. His work spans full-stack delivery, product ownership, technical leadership, and editorial production.`;
  }
  if (/award|certificate|certification|credential|recognition|education|degree/.test(query)) {
    return `Gene is a BS Information Technology graduate, Cum Laude, with ${certs.length} archived credentials and ${achievements.length} documented recognitions covering software development, design, cybersecurity, leadership, research, and public service.`;
  }
  if (/contact|email|hire|available|availability/.test(query)) {
    return "Gene is open to full-time, contract, and selected project work. Reach him directly at g.landoyelpie@gmail.com; he usually replies within one to two days.";
  }
  if (/where|location|based|home/.test(query)) {
    return "Gene is based in Boac, Marinduque, Philippines, and works across product planning, UI/UX, frontend, backend, mobile development, and visual communication.";
  }
  return `Gene Elpie Landoy is a full-stack developer and product designer based in Marinduque. He turns rough ideas and real requirements into useful web, mobile, and AI products. Ask about his ${projects.length} projects, experience, stack, credentials, or availability.`;
}

function setupCommandCenter() {
  const dialog = $("#commandDialog");
  const form = $("#askForm");
  const input = $("#askInput");
  const answer = $("#askAnswer");
  if (!dialog || !form || !input || !answer) return;

  const open = () => {
    $$('dialog[open]').forEach((openDialog) => {
      if (openDialog !== dialog) openDialog.close();
    });
    if (!dialog.open) dialog.showModal();
    if ($("#menuToggle")?.getAttribute("aria-expanded") === "true") $("#menuToggle")?.click();
    window.setTimeout(() => input.focus(), 30);
  };
  const close = () => { if (dialog.open) dialog.close(); };

  $$('[data-open-command]').forEach((button) => button.addEventListener("click", open));
  $('[data-close-command]')?.addEventListener("click", close);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });

  $$('[data-question]', dialog).forEach((button) => button.addEventListener("click", () => {
    input.value = button.dataset.question || "";
    form.requestSubmit();
  }));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    const paragraph = $("p", answer);
    const submit = $('button[type="submit"]', form);
    const submitLabel = submit?.innerHTML || "ask";
    answer.classList.add("is-loading");
    paragraph.textContent = "Looking through Gene's portfolio…";
    input.disabled = true;
    if (submit) {
      submit.disabled = true;
      submit.innerHTML = 'thinking <span aria-hidden="true">···</span>';
    }

    try {
      paragraph.textContent = await aiSearch(question);
    } catch {
      paragraph.textContent = localPortfolioAnswer(question);
    } finally {
      answer.classList.remove("is-loading");
      input.disabled = false;
      if (submit) {
        submit.disabled = false;
        submit.innerHTML = submitLabel;
      }
      input.focus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      open();
    }
  });
}

function setupTypingTest() {
  const dialog = $("#typingDialog");
  const input = $("#typingInput");
  const promptElement = $("#typingPrompt");
  const prompt = promptElement?.textContent || "";
  const wpm = $("#typingWpm");
  const accuracy = $("#typingAccuracy");
  const time = $("#typingTime");
  const progress = $("#typingProgress");
  const status = $("#typingStatus");
  if (!dialog || !input || !promptElement || !wpm || !accuracy || !time || !progress || !status) return;

  let startedAt = 0;
  let timerId = 0;
  input.maxLength = prompt.length;

  const renderPrompt = (typed = "") => {
    promptElement.innerHTML = [...prompt].map((character, index) => {
      const state = index >= typed.length
        ? "is-pending"
        : typed[index] === character
          ? "is-correct"
          : "is-incorrect";
      return `<span class="${state}">${escapeHtml(character)}</span>`;
    }).join("");
  };

  const update = () => {
    const typed = input.value;
    const elapsed = startedAt ? Math.max(1, (Date.now() - startedAt) / 1000) : 0;
    const correct = [...typed].reduce((total, character, index) => total + Number(character === prompt[index]), 0);
    const score = typed.length ? Math.round((correct / typed.length) * 100) : 100;
    const wordsPerMinute = elapsed ? Math.round((correct / 5) / (elapsed / 60)) : 0;
    const completed = typed === prompt;
    wpm.textContent = String(wordsPerMinute);
    accuracy.textContent = `${score}%`;
    time.textContent = `${Math.floor(elapsed)}s`;
    progress.style.transform = `scaleX(${Math.min(1, typed.length / Math.max(1, prompt.length))})`;
    renderPrompt(typed);
    input.classList.toggle("is-complete", completed);
    status.classList.toggle("is-complete", completed);

    if (completed) {
      window.clearInterval(timerId);
      timerId = 0;
      input.disabled = true;
      status.textContent = `Complete — ${wordsPerMinute} WPM at ${score}% accuracy.`;
    } else if (typed.length === prompt.length) {
      status.textContent = "Almost there — review the highlighted characters.";
    } else if (typed.length) {
      status.textContent = `${typed.length} of ${prompt.length} characters · keep going.`;
    } else {
      status.textContent = "Ready — start typing when you are.";
    }
  };

  const restart = () => {
    window.clearInterval(timerId);
    timerId = 0;
    startedAt = 0;
    input.disabled = false;
    input.value = "";
    input.classList.remove("is-complete");
    status.classList.remove("is-complete");
    update();
    input.focus();
  };

  const open = () => {
    $$('dialog[open]').forEach((openDialog) => {
      if (openDialog !== dialog) openDialog.close();
    });
    if (!dialog.open) dialog.showModal();
    if ($("#menuToggle")?.getAttribute("aria-expanded") === "true") $("#menuToggle")?.click();
    restart();
  };
  const close = () => {
    window.clearInterval(timerId);
    timerId = 0;
    if (dialog.open) dialog.close();
  };

  input.addEventListener("input", () => {
    if (!startedAt && input.value) {
      startedAt = Date.now();
      timerId = window.setInterval(update, 250);
    }
    update();
  });
  $("#typingRestart")?.addEventListener("click", restart);
  $$('[data-open-typing]').forEach((button) => button.addEventListener("click", open));
  $('[data-close-typing]')?.addEventListener("click", close);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
  dialog.addEventListener("close", () => {
    window.clearInterval(timerId);
    timerId = 0;
  });
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "j") {
      event.preventDefault();
      open();
    }
  });

  renderPrompt();
}

function setupMiniRunner() {
  const dialog = $("#runnerDialog");
  const canvas = $("#runnerCanvas");
  const stage = $("#runnerStage");
  const overlay = $("#runnerOverlay");
  const overlayTitle = $("#runnerOverlayTitle");
  const overlayCopy = $("#runnerOverlayCopy");
  const scoreElement = $("#runnerScore");
  const bestElement = $("#runnerBest");
  const speedElement = $("#runnerSpeed");
  const announcement = $("#runnerAnnouncement");
  const startButton = $("#runnerStart");
  const jumpButton = $("#runnerJump");
  const restartButton = $("#runnerRestart");
  const context = canvas?.getContext("2d");
  if (!dialog || !canvas || !stage || !overlay || !context || !scoreElement || !bestElement || !speedElement || !startButton || !jumpButton || !restartButton) return;

  const dogSprite = new Image();
  let dogSpriteReady = false;
  const dog = { x: 0, y: 0, width: 0, height: 0, velocityY: 0 };
  let worldWidth = 640;
  let worldHeight = 200;
  let groundY = 156;
  let obstacles = [];
  let nextObstacleDistance = 0;
  let distance = 0;
  let score = 0;
  let best = 0;
  let speedMultiplier = 1;
  let running = false;
  let gameOver = false;
  let hasStarted = false;
  let lastFrame = 0;
  let animationFrame = 0;
  let palette = {};

  try {
    best = Number.parseInt(localStorage.getItem("gene-byte-runner-best") || "0", 10) || 0;
  } catch { /* The game still works when storage is unavailable. */ }

  const readPalette = () => {
    const styles = getComputedStyle(document.documentElement);
    palette = {
      surface: styles.getPropertyValue("--surface").trim() || "#ffffff",
      surfaceSoft: styles.getPropertyValue("--surface-soft").trim() || "#fafafa",
      ink: styles.getPropertyValue("--ink").trim() || "#0a0a0a",
      muted: styles.getPropertyValue("--muted").trim() || "#737373",
      line: styles.getPropertyValue("--line-strong").trim() || "#d4d4d4",
      green: styles.getPropertyValue("--accent-green").trim() || "#1f7a45",
    };
  };

  const updateScoreboard = () => {
    scoreElement.textContent = String(score).padStart(3, "0");
    bestElement.textContent = String(best).padStart(3, "0");
    speedElement.textContent = `${speedMultiplier.toFixed(1)}×`;
  };

  const showOverlay = (title, copy) => {
    overlayTitle.textContent = title;
    overlayCopy.textContent = copy;
    overlay.hidden = false;
  };

  const hideOverlay = () => {
    overlay.hidden = true;
  };

  const configureWorld = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    worldWidth = Math.max(280, rect.width || 640);
    worldHeight = Math.max(140, rect.height || 200);
    canvas.width = Math.round(worldWidth * dpr);
    canvas.height = Math.round(worldHeight * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    groundY = worldHeight * 0.77;
    dog.width = worldHeight * 0.34;
    dog.height = dog.width;
    dog.x = Math.max(34, worldWidth * 0.13);
    dog.y = groundY - dog.height;
    dog.velocityY = 0;
  };

  const drawDog = (time = 0) => {
    if (dogSpriteReady) {
      const onGround = Math.abs(dog.y - (groundY - dog.height)) < 1;
      const row = onGround ? (running ? 2 : 0) : 3;
      const frame = running
        ? Math.floor(time / (onGround ? 85 : 120)) % 6
        : 0;
      context.save();
      context.imageSmoothingEnabled = false;
      context.drawImage(
        dogSprite,
        frame * 16,
        row * 16,
        16,
        16,
        dog.x,
        dog.y,
        dog.width,
        dog.height,
      );
      context.restore();
      return;
    }

    const scale = dog.height / 48;
    const stride = running && Math.abs(dog.y - (groundY - dog.height)) < 1
      ? Math.sin(time * 0.026) * 4
      : 0;

    context.save();
    context.translate(dog.x, dog.y);
    context.scale(scale, scale);

    context.strokeStyle = palette.ink;
    context.lineWidth = 4;
    context.lineCap = "square";
    context.beginPath();
    context.moveTo(10, 17);
    context.lineTo(2, 11 - Math.abs(stride) * 0.35);
    context.stroke();

    context.fillStyle = palette.ink;
    context.fillRect(9, 13, 35, 22);
    context.fillRect(38, 6, 18, 25);
    context.fillRect(51, 17, 12, 11);

    context.beginPath();
    context.moveTo(41, 7);
    context.lineTo(48, 0);
    context.lineTo(51, 9);
    context.fill();

    context.fillStyle = palette.green;
    context.fillRect(39, 25, 17, 4);
    context.fillRect(35, 27, 5, 8);

    context.fillStyle = palette.surface;
    context.fillRect(50, 11, 3, 3);
    context.fillRect(59, 20, 3, 3);

    context.fillStyle = palette.ink;
    context.fillRect(14, 33, 7, Math.max(5, 13 + stride));
    context.fillRect(31, 33, 7, Math.max(5, 13 - stride));
    context.fillRect(44, 29, 7, Math.max(5, 17 + stride));
    context.restore();
  };

  const drawObstacle = (obstacle) => {
    const top = groundY - obstacle.height;
    context.fillStyle = palette.surface;
    context.fillRect(obstacle.x, top, obstacle.width, obstacle.height);
    context.strokeStyle = palette.ink;
    context.lineWidth = 2;
    context.strokeRect(obstacle.x, top, obstacle.width, obstacle.height);
    context.fillStyle = palette.green;
    context.fillRect(obstacle.x, top, obstacle.width, 4);
    context.strokeStyle = palette.line;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(obstacle.x + 6, top + 10);
    context.lineTo(obstacle.x + obstacle.width - 6, groundY - 6);
    context.moveTo(obstacle.x + obstacle.width - 6, top + 10);
    context.lineTo(obstacle.x + 6, groundY - 6);
    context.stroke();
  };

  const drawScene = (time = 0) => {
    context.clearRect(0, 0, worldWidth, worldHeight);
    context.fillStyle = palette.surfaceSoft;
    context.fillRect(0, 0, worldWidth, worldHeight);

    context.fillStyle = palette.muted;
    context.font = `${Math.max(7, worldHeight * 0.045)}px Geist Mono, monospace`;
    context.fillText("BYTE.RUN // ONLINE", 14, 20);

    context.strokeStyle = palette.line;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(0, worldHeight * 0.42);
    context.lineTo(worldWidth, worldHeight * 0.42);
    context.stroke();

    context.strokeStyle = palette.ink;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, groundY);
    context.lineTo(worldWidth, groundY);
    context.stroke();

    const dashWidth = Math.max(18, worldWidth * 0.04);
    const trackOffset = running ? -(distance % (dashWidth * 2)) : 0;
    context.strokeStyle = palette.line;
    context.lineWidth = 1;
    for (let x = trackOffset; x < worldWidth; x += dashWidth * 2) {
      context.beginPath();
      context.moveTo(x, groundY + worldHeight * 0.11);
      context.lineTo(x + dashWidth, groundY + worldHeight * 0.11);
      context.stroke();
    }

    obstacles.forEach(drawObstacle);
    drawDog(time);

    context.fillStyle = palette.green;
    context.fillRect(0, worldHeight - 3, Math.min(worldWidth, (score % 100) / 100 * worldWidth), 3);
  };

  dogSprite.addEventListener("load", () => {
    dogSpriteReady = true;
    if (!running) drawScene(performance.now());
  });
  dogSprite.src = "/images/game/byte-dog.png";

  const reset = (startImmediately = false) => {
    window.cancelAnimationFrame(animationFrame);
    running = false;
    gameOver = false;
    hasStarted = false;
    distance = 0;
    score = 0;
    speedMultiplier = 1;
    obstacles = [];
    nextObstacleDistance = worldWidth * 0.72;
    dog.y = groundY - dog.height;
    dog.velocityY = 0;
    startButton.disabled = false;
    stage.dataset.state = "ready";
    startButton.innerHTML = `Start run <span aria-hidden="true">→</span>`;
    showOverlay("Ready, Byte?", "Press start, space, or tap the track.");
    updateScoreboard();
    drawScene();
    if (startImmediately) start();
  };

  const endRun = () => {
    running = false;
    gameOver = true;
    stage.dataset.state = "game-over";
    window.cancelAnimationFrame(animationFrame);
    if (score > best) {
      best = score;
      try { localStorage.setItem("gene-byte-runner-best", String(best)); } catch { /* Non-persistent best is fine. */ }
    }
    updateScoreboard();
    startButton.disabled = false;
    startButton.innerHTML = `Run again <span aria-hidden="true">↻</span>`;
    showOverlay("Bug found.", `Score ${score}. Tap run again and clear the next build.`);
    if (announcement) announcement.textContent = `Run over. Score ${score}. Best score ${best}.`;
    drawScene();
  };

  const intersectsObstacle = (obstacle) => {
    const dogBox = {
      x: dog.x + dog.width * 0.12,
      y: dog.y + dog.height * 0.28,
      width: dog.width * 0.76,
      height: dog.height * 0.58,
    };
    const obstacleBox = {
      x: obstacle.x + 3,
      y: groundY - obstacle.height + 3,
      width: obstacle.width - 6,
      height: obstacle.height - 3,
    };
    return dogBox.x < obstacleBox.x + obstacleBox.width
      && dogBox.x + dogBox.width > obstacleBox.x
      && dogBox.y < obstacleBox.y + obstacleBox.height
      && dogBox.y + dogBox.height > obstacleBox.y;
  };

  const tick = (time) => {
    if (!running) return;
    const delta = Math.min(2, Math.max(0.4, (time - lastFrame) / 16.667 || 1));
    lastFrame = time;
    speedMultiplier = Math.min(2.2, 1 + score / 260);
    const speed = worldWidth * 0.009 * speedMultiplier;
    const gravity = worldHeight * 0.0048;

    dog.velocityY += gravity * delta;
    dog.y += dog.velocityY * delta;
    if (dog.y >= groundY - dog.height) {
      dog.y = groundY - dog.height;
      dog.velocityY = 0;
      stage.dataset.state = "running";
    }

    distance += speed * delta;
    score = Math.floor(distance / Math.max(14, worldWidth * 0.045));
    nextObstacleDistance -= speed * delta;
    if (nextObstacleDistance <= 0) {
      const width = Math.max(22, worldHeight * (0.12 + Math.random() * 0.035));
      obstacles.push({
        x: worldWidth + width,
        width,
        height: worldHeight * (0.17 + Math.random() * 0.085),
      });
      nextObstacleDistance = worldWidth * (0.48 + Math.random() * 0.24);
    }

    obstacles.forEach((obstacle) => { obstacle.x -= speed * delta; });
    obstacles = obstacles.filter((obstacle) => obstacle.x + obstacle.width > -10);

    if (obstacles.some(intersectsObstacle)) {
      endRun();
      return;
    }

    updateScoreboard();
    drawScene(time);
    animationFrame = window.requestAnimationFrame(tick);
  };

  const start = () => {
    if (running) return;
    if (gameOver) reset(false);
    running = true;
    hasStarted = true;
    stage.dataset.state = "running";
    hideOverlay();
    startButton.disabled = true;
    startButton.textContent = "Running…";
    lastFrame = performance.now();
    if (announcement) announcement.textContent = "Byte runner started.";
    animationFrame = window.requestAnimationFrame(tick);
  };

  const jump = () => {
    if (!running) start();
    const onGround = Math.abs(dog.y - (groundY - dog.height)) < 1;
    if (running && onGround) {
      dog.velocityY = -worldHeight * 0.058;
      dog.y -= 1;
      stage.dataset.state = "airborne";
    }
  };

  const pause = () => {
    if (!running) return;
    running = false;
    stage.dataset.state = "paused";
    window.cancelAnimationFrame(animationFrame);
    startButton.disabled = false;
    startButton.innerHTML = `Resume <span aria-hidden="true">→</span>`;
    showOverlay("Run paused.", "Press resume, space, or tap the track.");
    drawScene();
  };

  const open = () => {
    $$('dialog[open]').forEach((openDialog) => {
      if (openDialog !== dialog) openDialog.close();
    });
    if (!dialog.open) dialog.showModal();
    if ($("#menuToggle")?.getAttribute("aria-expanded") === "true") $("#menuToggle")?.click();
    readPalette();
    window.requestAnimationFrame(() => {
      configureWorld();
      reset();
      startButton.focus();
    });
  };

  const close = () => {
    pause();
    if (dialog.open) dialog.close();
  };

  startButton.addEventListener("click", start);
  jumpButton.addEventListener("click", jump);
  restartButton.addEventListener("click", () => reset(true));
  stage.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;
    jump();
  });
  $$('[data-open-runner]').forEach((button) => button.addEventListener("click", open));
  $('[data-close-runner]')?.addEventListener("click", close);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
  dialog.addEventListener("close", pause);
  document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "g") {
      event.preventDefault();
      open();
      return;
    }
    if (!dialog.open || event.metaKey || event.ctrlKey || event.altKey) return;
    if ([" ", "ArrowUp", "w", "W"].includes(event.key)) {
      event.preventDefault();
      jump();
    } else if (event.key.toLowerCase() === "r") {
      event.preventDefault();
      reset(true);
    }
  });

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    if (!dialog.open) return;
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      configureWorld();
      reset(hasStarted && !gameOver);
    }, 120);
  });

  new MutationObserver(() => {
    readPalette();
    if (!running) drawScene();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  readPalette();
  updateScoreboard();
}

function setCounts() {
  const projectCount = $("#projectCount");
  const recognitionCount = $("#recognitionCount");
  const currentYear = $("#currentYear");
  if (projectCount) projectCount.textContent = String((data.projects || []).length).padStart(2, "0");
  if (recognitionCount) recognitionCount.textContent = String((data.achievements || []).length).padStart(2, "0");
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
}

function init() {
  setupTheme();
  setupHeroLocalTime();
  setupMobileMenu();
  setupAvailabilityPanel();
  renderProjects();
  setupProjectFilters();
  setupCarousel("#projectGrid", "#projectPrev", "#projectNext");
  renderExperience();
  renderCertificates();
  setupCertificateCarousel();
  loadGithubActivity();
  setupArchive();
  renderArchive();
  setupCarousel("#archiveGrid", "#archivePrev", "#archiveNext");
  setupLightbox();
  setupTestimonials();
  setupContactEmail();
  setupContactForm();
  setupCommandCenter();
  setupTypingTest();
  setupMiniRunner();
  setupScrollUX();
  setCounts();
  observeReveals();
}

init();
