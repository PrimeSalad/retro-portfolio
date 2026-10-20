import { PORTFOLIO_DATA } from "./data.js";
import { escapeHtml, resolveImagePath } from "./utils.js";
import { aiHealthCheck, aiSearch, submitContactForm } from "./api.js";
import { setupTerminal } from "./terminal.js";
import { setupRecruiter } from "./recruiter.js";

const data = PORTFOLIO_DATA;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/* Full recommendation texts, as written (source: whatpeoplesay.md). */
const testimonials = [
  {
    name: "Engr. Jayvi M. Mandalihan, LPT",
    role: "College of Information and Computing Sciences",
    headline: "Consistency, Commitment, and Quiet Strength",
    quote: "One of the best qualities of a good leader is being someone others can count on; someone who shows up and gives their best no matter the challenge. That’s who Mr. Landoy is. As someone who has taught him in previous courses, especially during group projects, I’ve seen how he always gives his full effort, not just helping, but truly committing to the task like it’s his own. Apparently, he doesn’t do things for show, but deep down, Mr. Landoy hopes his efforts are seen and appreciated. Like anyone who works hard, a simple recognition gives him that extra push to keep going. He may not say it out loud, but being appreciated reminds him that what he’s doing matters.",
  },
  {
    name: "Aldrin Requiz, MIT",
    role: "College of Information and Computing Sciences",
    headline: "Reliable, Collaborative, and Always Present",
    quote: "Mr. Landoy is the kind of teammate who brings stability and quiet strength to any group. He doesn’t need to stand out to make a difference—his consistency, support, and genuine commitment naturally lift the entire team. Always reliable, always present, and always working with purpose.",
  },
  {
    name: "Shiela Mae Liwanagan",
    role: "Accenture",
    headline: "Skilled, Supportive, and Goal-Oriented",
    quote: "Mr. Landoy stands out not just for his technical abilities but for how well he works with others. He brings strong skills to the table, whether in design, development, or collaboration, and uses them to help the team succeed. He listens, contributes thoughtfully, and stays focused on shared goals. Reliable, skilled, and easy to work with, he is the kind of teammate every project needs.",
  },
  {
    name: "Kryzha Lineses Lope",
    role: "Educational System Technological Institute · Computer Science",
    headline: "Excellence in Every Detail and Delivers Results That Matter",
    quote: "Mr. Landoy is one of the most reliable and technically skilled professionals I’ve had the pleasure of working with. He consistently delivers high-quality results and stays updated with the latest technologies, ensuring that every project is both efficient and future-ready. What makes him truly stand out is his dedication to client satisfaction. He listens carefully, communicates clearly, and always goes the extra mile to make sure the final output exceeds expectations. His strong sense of responsibility and attention to detail make him someone you can trust, not just to get the job done, but to do it with excellence. If you’re looking for someone who is both technically sharp and service-oriented, Mr. Landoy is the kind of professional you want on your team.",
  },
  {
    name: "John Ryan Rodelas",
    role: "Information Technology",
    headline: "A Natural and Effective Leader",
    quote: "Mr. Landoy leads with purpose, not pressure. He knows how to guide a team with clarity, patience, and confidence, making sure everyone feels heard and supported. What sets him apart is his ability to stay calm under pressure while staying focused on the bigger picture.",
  },
];

const extraArchiveItems = [
  { title: "AppBuildersPH Hackathon 2026 — with Bryl Lim", image: "/images/events/appbuildersph-bryl-lim.jpg", tag: "hackathon" },
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

function projectKind(project) {
  const text = `${project.category || ""} ${(project.tech || []).join(" ")}`.toLowerCase();
  const kinds = [];
  if (/\bai\b|gemini|gemma|artificial intelligence/.test(text)) kinds.push("ai");
  if (/mobile|flutter|dart|ios|android|swiftui|react native|expo|screen time/.test(text)) kinds.push("mobile");
  /* TypeScript alone only means web when the project is not a mobile app. */
  const isMobile = kinds.includes("mobile");
  if (/react(?! native)|javascript|web|browser|tailwind/.test(text) || (!isMobile && /typescript/.test(text))) kinds.push("web");
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

function sortedProjects() {
  return [...(data.projects || [])].sort((a, b) =>
    Number(Boolean(b.featured)) - Number(Boolean(a.featured))
      || Number(a.status === "archive") - Number(b.status === "archive")
      || (b.score || 0) - (a.score || 0));
}

function projectSlug(project) {
  return String(project.title || project.id)
    .split(/\s+[—-]\s+/)[0]
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* Projects currently shown in the grid, in order; the case study viewer browses this list. */
let visibleProjects = [];

function renderProjects(filter = "all") {
  const root = $("#projectGrid");
  if (!root) return;

  const projects = sortedProjects();
  const visible = filter === "all" ? projects : projects.filter((project) => projectKind(project).includes(filter));
  visibleProjects = visible;
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
    const url = safeUrl(project.website || project.demo || project.preview || project.repo) || "";
    const appStoreUrl = safeUrl(project.app_store || "");
    const image = project.image ? resolveImagePath(project.image) : "";
    const isLive = project.status !== "archive" && Boolean(url || appStoreUrl);
    const tags = (project.tech || []).slice(0, 4).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    const caseAttrs = `type="button" data-case="${escapeHtml(project.id)}"`;
    const media = image
      ? `<img src="${escapeHtml(image)}" alt="" width="1440" height="900" loading="${index < 2 ? "eager" : "lazy"}" />`
      : `<span class="project-placeholder"><span>${escapeHtml(initials(project.title))}</span></span>`;
    /* One quiet outbound link per card; the case study holds everything else. */
    const outbound = appStoreUrl
      ? `<a class="project-out" href="${escapeHtml(appStoreUrl)}" target="_blank" rel="noreferrer" aria-label="${title} on the App Store">App Store <span aria-hidden="true">↗</span></a>`
      : url
      ? `<a class="project-out" href="${escapeHtml(url)}" target="_blank" rel="noreferrer" aria-label="Open the live ${title} product">Live site <span aria-hidden="true">↗</span></a>`
      : `<span class="project-out is-archive">Archived</span>`;

    return `
      <article class="project-card reveal ${isLive ? "is-live" : "is-archive"}" data-kind="${escapeHtml(projectKind(project))}" data-delay="${index % 2}">
        <button class="project-media" ${caseAttrs} tabindex="-1" aria-hidden="true"><span class="project-shot">${media}</span></button>
        <div class="project-content">
          <div class="project-topline"><span>${String(index + 1).padStart(2, "0")} · ${category}</span><span>${escapeHtml(project.year || "2026")}</span></div>
          <h3><button class="project-title" ${caseAttrs}>${title}</button></h3>
          <p>${description}</p>
          <div class="project-tags" aria-label="Technologies">${tags}</div>
          <div class="project-card-actions">
            <button class="project-case-link" ${caseAttrs} aria-label="Read the ${title} case study">Case study <span aria-hidden="true">→</span></button>
            ${outbound}
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
    const [role, ...orgParts] = String(item.title || "Experience").split(/,\s+/);
    const org = orgParts.join(", ");
    const roleTitle = escapeHtml(role);
    const roleHeading = roleUrl
      ? `<a href="${roleUrl}" target="_blank" rel="noreferrer">${roleTitle}<span aria-hidden="true">↗</span></a>`
      : roleTitle;
    const roleLink = roleUrl
      ? `<a class="experience-live-link" href="${roleUrl}" target="_blank" rel="noreferrer"><i aria-hidden="true"></i>${escapeHtml(item.link_label || "Open live system")}<span aria-hidden="true">↗</span></a>`
      : "";

    return `
      <article class="experience-item reveal ${index >= 5 ? "is-extra" : ""}" ${index >= 5 ? "hidden" : ""}>
        <span class="experience-logo${item.logo ? " has-image" : ""}" aria-hidden="true">${item.logo
          ? `<img src="${escapeHtml(resolveImagePath(item.logo))}" alt="" width="48" height="48" loading="lazy" />`
          : escapeHtml(initials(org || role))}</span>
        <div class="experience-date">${escapeHtml(item.date || item.year || "")}</div>
        <div class="experience-main">
          <h3>${roleHeading}</h3>
          ${org ? `<p class="experience-org">${escapeHtml(org)}</p>` : ""}
          <p>${escapeHtml(experienceSummary(item))}</p>
          ${roleLink}
        </div>
        <div class="experience-details">
          ${(item.bullets || []).length > 1 ? `<ul>${item.bullets.slice(1).map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>` : ""}
          ${(item.metrics || []).length ? `<p><strong>Impact</strong> ${item.metrics.map(escapeHtml).join(" · ")}</p>` : ""}
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

  /* Certificates and honors overlap on a few events (a hackathon has both a
     participation certificate and a placement), so count each event once. */
  const eventKey = (title) => String(title || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const certKeys = new Set(certificates.map((cert) => eventKey(cert.title)));
  const honors = (data.achievements || []).filter((item) => !certKeys.has(eventKey(item.title)));
  const total = $("#certTotal");
  if (total) total.textContent = String(certificates.length + honors.length);
  const breakdown = $("#certBreakdown");
  if (breakdown) breakdown.textContent = `${certificates.length} certificates · ${(data.achievements || []).length} honors`;

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

/* Honors & awards: every achievement the four feature cards don't already show. */
function renderHonors() {
  const list = $("#honorsList");
  if (!list) return;
  const featured = new Set($$(".achievement-card h3").map((heading) => heading.textContent.trim().toLowerCase()));
  const placement = /place|champion|winner/i;
  list.innerHTML = (data.achievements || [])
    .filter((item) => !featured.has(String(item.title).trim().toLowerCase()))
    .map((item, index) => `
      <li class="honor reveal" data-delay="${index % 4}">
        <span class="honor-badge${placement.test(item.badge || "") ? " is-placement" : ""}">${escapeHtml(item.badge || "Honor")}</span>
        <div>
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.desc || "")}</p>
          ${item.meta ? `<small>${escapeHtml(item.meta)}</small>` : ""}
        </div>
      </li>`).join("");
  observeReveals(list);
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
    /* Read the column step from the grid itself so labels track the CSS cell size. */
    const gridStyles = getComputedStyle(root);
    const weekWidth = (Number.parseFloat(gridStyles.gridAutoColumns) + Number.parseFloat(gridStyles.columnGap)) || 11;
    const labels = [];
    let lastMonth = -1;

    for (let w = 0; w < totalWeeks; w++) {
      const weekStart = new Date(start);
      weekStart.setDate(start.getDate() + w * 7);
      const month = weekStart.getMonth();

      if (month !== lastMonth) {
        /* A partial leading month would collide with the next label, so drop it. */
        if (labels.length === 1 && w - labels[0].week < 3) labels.pop();
        labels.push({ week: w, month });
        lastMonth = month;
      }
    }
    monthsRoot.innerHTML = labels
      .map(({ week, month }) => `<span style="position:absolute;left:${week * weekWidth}px">${monthNames[month]}</span>`)
      .join("");
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

  const heatmapScroller = $(".github-heatmap-wrapper");
  if (heatmapScroller) heatmapScroller.scrollLeft = heatmapScroller.scrollWidth;

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

/* "Currently building" on the profile card: the latest push from the events
   already fetched, else the most recently pushed repo. */
function renderCurrentlyBuilding(events, repos) {
  const target = $("#liBuilding");
  if (!target) return;
  const push = events.find((event) => event.type === "PushEvent");
  const repo = repos[0];
  const name = (push?.repo?.name || repo?.full_name || repo?.name || "").replace(`${GITHUB_USER}/`, "");
  const when = push?.created_at || repo?.pushed_at;
  if (!name || !when) return;
  const message = push?.payload?.commits?.at(-1)?.message?.split("\n")[0] || "";

  const minutes = Math.round((Date.now() - new Date(when).getTime()) / 60000);
  const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const ago = minutes < 60 ? relative.format(-Math.max(1, minutes), "minute")
    : minutes < 1440 ? relative.format(-Math.round(minutes / 60), "hour")
    : relative.format(-Math.round(minutes / 1440), "day");
  const recent = minutes < 60 * 24 * 7;

  target.innerHTML = `<span class="li-building-dot${recent ? " is-live" : ""}" aria-hidden="true"></span>${recent ? "Currently building" : "Last shipped"} <a href="https://github.com/${GITHUB_USER}/${escapeHtml(name)}" target="_blank" rel="noreferrer">${escapeHtml(name)}</a>${message ? ` <span class="li-building-msg">“${escapeHtml(message)}”</span>` : ""} <span class="li-building-time">· ${escapeHtml(ago)}</span>`;
  target.hidden = false;
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
    /* Live data only: the cached fallback is months old and would mislead. */
    renderCurrentlyBuilding(
      eventsResult.status === "fulfilled" ? eventsResult.value : [],
      reposResult.status === "fulfilled" ? reposResult.value : [],
    );
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

/* Recommendations: LinkedIn-style list. Long texts clamp with "see more",
   and only the first three show until "Show all" is pressed. */
function recoInitials(name) {
  const words = name.split(",")[0].split(/\s+/).filter((word) => word && !word.endsWith("."));
  return initials([words[0], words[words.length - 1]].join(" "));
}

function setupTestimonials() {
  const list = $("#recoList");
  if (!list) return;
  const visibleCount = 3;
  list.innerHTML = testimonials.map((item, index) => `
    <li class="reco reveal${index >= visibleCount ? " is-extra" : ""}"${index >= visibleCount ? " hidden" : ""} data-delay="${index % 3}">
      <span class="reco-avatar" aria-hidden="true">${escapeHtml(recoInitials(item.name))}</span>
      <div class="reco-body">
        <p class="reco-name">${escapeHtml(item.name)}</p>
        <p class="reco-role">${escapeHtml(item.role)}</p>
        <p class="reco-headline">${escapeHtml(item.headline)}</p>
        <blockquote class="reco-quote" id="recoQuote${index}">${escapeHtml(item.quote)}</blockquote>
        <button class="reco-more" type="button" aria-expanded="false" aria-controls="recoQuote${index}" hidden>…see more</button>
      </div>
    </li>`).join("");

  /* "see more" only where the clamp actually hides text. */
  const syncClamps = () => $$(".reco", list).forEach((item) => {
    const quote = $(".reco-quote", item);
    const more = $(".reco-more", item);
    if (item.hidden || quote.classList.contains("is-open")) return;
    more.hidden = quote.scrollHeight <= quote.clientHeight + 2;
  });
  list.addEventListener("click", (event) => {
    const more = event.target.closest(".reco-more");
    if (!more) return;
    const quote = $(`#${more.getAttribute("aria-controls")}`);
    const open = !quote.classList.contains("is-open");
    quote.classList.toggle("is-open", open);
    more.setAttribute("aria-expanded", String(open));
    more.textContent = open ? "see less" : "…see more";
  });

  const toggle = $("#recoToggle");
  const extras = $$(".reco.is-extra", list);
  if (toggle && extras.length) {
    toggle.hidden = false;
    toggle.textContent = `Show all ${testimonials.length} recommendations`;
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(expanded));
      extras.forEach((item) => {
        item.hidden = !expanded;
        item.classList.toggle("is-visible", expanded);
      });
      toggle.textContent = expanded ? "Show less" : `Show all ${testimonials.length} recommendations`;
      syncClamps();
    });
  }
  requestAnimationFrame(syncClamps);
  window.addEventListener("resize", syncClamps, { passive: true });
  observeReveals(list);
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

  /* The new theme grows out of the button as a circle. Browsers without view
     transitions (or reduced-motion users) get the plain CSS colour fade. */
  const switchTheme = (next, button) => {
    const root = document.documentElement;
    if (!document.startViewTransition || reduceMotion.matches) {
      apply(next);
      return;
    }
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    root.classList.add("is-theme-switching");
    const transition = document.startViewTransition(() => apply(next));
    transition.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 620, easing: "cubic-bezier(.2, .7, .2, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    }).catch(() => {});
    transition.finished.finally(() => root.classList.remove("is-theme-switching"));
  };

  apply(initial);
  $$('[data-theme-toggle]').forEach((button) => button.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    switchTheme(next, button);
    try { localStorage.setItem(storageKey, next); } catch { /* Storage can be unavailable. */ }
  }));
}

/* Skills: chips used by the projects and roles on this page are marked,
   with the count in the tooltip, from the same data those sections render. */
const skillAliases = {
  "tailwind css": "tailwind",
  "rest apis": "rest api",
};

function renderSkillCounts() {
  const usage = new Map();
  const add = (tag) => {
    const key = String(tag).toLowerCase();
    usage.set(key, (usage.get(key) || 0) + 1);
  };
  (data.projects || []).forEach((project) => (project.tech || []).forEach(add));
  (data.timeline || []).forEach((role) => (role.stack || []).forEach(add));

  $$(".skill-chips [data-skill]").forEach((chip) => {
    const name = chip.textContent.trim().toLowerCase();
    const count = usage.get(skillAliases[name] || name) || 0;
    if (!count) return;
    chip.classList.add("is-used");
    chip.title = `Used in ${count} project${count === 1 ? "" : "s"} and role${count === 1 ? "" : "s"} on this page`;
  });
}

function setupHeroLocalTime() {
  const time = $("#heroLocalTime");
  if (!time) return;

  const formatter = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const update = () => {
    const now = new Date();
    time.textContent = formatter.format(now);
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
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || menu.hidden) return;
    setOpen(false);
    button.focus();
  });
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

/* One underline that glides to the active tab instead of each tab
   drawing its own. */
function setupNavIndicator() {
  const nav = $(".rail-nav");
  if (!nav) return () => {};
  const indicator = Object.assign(document.createElement("span"), { className: "rail-indicator" });
  indicator.setAttribute("aria-hidden", "true");
  nav.append(indicator);
  nav.classList.add("has-indicator");

  const place = () => {
    const current = $(".rail-link.is-active", nav);
    const inMore = Boolean(current?.closest(".rail-more"));
    $("#railMore")?.classList.toggle("has-active", inMore);
    const active = inMore ? $("#railMoreToggle") : current;
    if (!active || !active.offsetWidth) {
      indicator.style.opacity = "0";
      return;
    }
    const label = $("span", active) || active;
    const left = label.getBoundingClientRect().left - nav.getBoundingClientRect().left;
    indicator.style.opacity = "1";
    indicator.style.width = `${label.offsetWidth}px`;
    indicator.style.transform = `translateX(${left}px)`;
  };
  place();
  window.addEventListener("resize", place, { passive: true });
  document.fonts?.ready.then(place);
  return place;
}

function setupAsideSticky() {
  const aside = $(".li-aside");
  if (!aside || !("ResizeObserver" in window)) return;
  const update = () => {
    const pinnedTop = 80;
    const fitTop = window.innerHeight - aside.offsetHeight - 16;
    aside.style.setProperty("--li-aside-top", `${Math.min(pinnedTop, fitTop)}px`);
  };
  new ResizeObserver(update).observe(aside);
  window.addEventListener("resize", update, { passive: true });
  update();
}

/* "More" dropdown in the top bar: click to open, closes on outside click,
   Escape, or after choosing a section. */
function setupNavMore() {
  const root = $("#railMore");
  const toggle = $("#railMoreToggle");
  const menu = $("#railMoreMenu");
  if (!root || !toggle || !menu) return;
  const setOpen = (open) => {
    root.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    menu.inert = !open;
  };
  setOpen(false);
  toggle.addEventListener("click", () => setOpen(!root.classList.contains("is-open")));
  menu.addEventListener("click", (event) => { if (event.target.closest("a")) setOpen(false); });
  document.addEventListener("click", (event) => { if (!root.contains(event.target)) setOpen(false); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && root.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
}

/* Profile "More" menu: share, copy link, save a contact card, open the terminal. */
const PROFILE_URL = "https://www.elpielandoy.space/";

function downloadContactCard() {
  const card = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:Landoy;Gene Elpie;;;",
    "FN:Gene Elpie Landoy",
    "TITLE:Full-Stack Developer & Product Designer",
    "EMAIL;TYPE=INTERNET:g.landoyelpie@gmail.com",
    "ADR;TYPE=HOME:;;;Boac;Marinduque;;Philippines",
    `URL:${PROFILE_URL}`,
    "URL;TYPE=LinkedIn:https://www.linkedin.com/in/gene-elpie-landoy-b1851b28b/",
    "URL;TYPE=GitHub:https://github.com/PrimeSalad",
    "END:VCARD",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([card], { type: "text/vcard" }));
  const anchor = Object.assign(document.createElement("a"), { href: url, download: "Gene-Elpie-Landoy.vcf" });
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function setupProfileMore() {
  const root = $("#profileMore");
  const toggle = $("#profileMoreToggle");
  const menu = $("#profileMoreMenu");
  const status = $("#profileMoreStatus");
  if (!root || !toggle || !menu) return;

  const setOpen = (open) => {
    root.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    menu.inert = !open;
  };
  const flash = (button, text) => {
    const original = button.dataset.label || button.lastChild.textContent;
    button.dataset.label = original;
    button.lastChild.textContent = text;
    if (status) status.textContent = text;
    window.setTimeout(() => { button.lastChild.textContent = original; }, 1600);
  };
  /* Clipboard API first; the hidden-textarea copy covers browsers that refuse it. */
  const copyLink = async (button) => {
    let copied = false;
    try {
      await navigator.clipboard.writeText(PROFILE_URL);
      copied = true;
    } catch {
      const field = Object.assign(document.createElement("textarea"), { value: PROFILE_URL, readOnly: true });
      field.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.append(field);
      field.select();
      try { copied = document.execCommand("copy"); } catch { /* unsupported */ }
      field.remove();
    }
    flash(button, copied ? "Link copied ✓" : "Copy failed");
  };

  setOpen(false);
  toggle.addEventListener("click", () => setOpen(!root.classList.contains("is-open")));
  document.addEventListener("click", (event) => { if (!root.contains(event.target)) setOpen(false); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") setOpen(false); });

  menu.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-profile-action]");
    if (!button) {
      if (event.target.closest("[data-open-terminal]")) setOpen(false);
      return;
    }
    const action = button.dataset.profileAction;
    if (action === "share") {
      if (navigator.share) {
        try { await navigator.share({ title: "Gene Elpie Landoy", text: "Full-stack developer & product designer", url: PROFILE_URL }); } catch { /* dismissed */ }
        setOpen(false);
      } else {
        await copyLink(button);
      }
    } else if (action === "copy") {
      await copyLink(button);
    } else if (action === "vcard") {
      downloadContactCard();
      flash(button, "Saved ✓");
    }
  });
}

function setupScrollUX() {
  const progress = $("#pageProgress");
  const placeIndicator = setupNavIndicator();

  const onScroll = () => {
    const available = document.documentElement.scrollHeight - window.innerHeight;
    const percent = available > 0 ? (window.scrollY / available) * 100 : 0;
    if (progress) progress.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  setupViews(placeIndicator);
}

/* =========================
   Views: the profile is one long scroll. Nav links jump to sections and the
   underline follows the scroll. Each section can also open on its own as a
   full page at #/<id> (LinkedIn's "show all" arrow), with Back and paging.
========================= */
const FULL_VIEWS = [
  { id: "work", label: "Projects" },
  { id: "profile", label: "Profile" },
  { id: "experience", label: "Experience" },
  { id: "toolkit", label: "Stack" },
  { id: "achievements", label: "Certifications" },
  { id: "github", label: "GitHub" },
  { id: "archive", label: "Archive" },
  { id: "recognition", label: "Recommendations" },
];

function renderViewPager(index) {
  const pager = $("#viewPager");
  if (!pager) return;
  const previous = FULL_VIEWS[index - 1];
  const next = FULL_VIEWS[index + 1];
  pager.innerHTML = `
    ${previous ? `<a href="#/${previous.id}">← ${previous.label}</a>` : "<span></span>"}
    ${next ? `<a href="#/${next.id}">${next.label} →</a>` : "<span></span>"}`;
}

/* The hash for what is showing, so closing an overlay returns to it. */
function viewHash() {
  const view = document.documentElement.dataset.view;
  return view && view !== "top" ? `#/${view}` : "";
}

/* One line of numbers for the top of each full page. */
function viewSummary(id) {
  const projects = data.projects || [];
  const years = projects.map((project) => Number(project.year)).filter(Boolean);
  const usedSkills = $$("#toolkit .skill-chips li.is-used").length;
  const summaries = {
    work: `${projects.length} projects · ${Math.min(...years)}–${Math.max(...years)}`,
    profile: "Background, photos, and quick facts",
    experience: `${(data.timeline || []).length} roles since ${Math.min(...(data.timeline || []).map((role) => Number(role.year)).filter(Boolean))}`,
    toolkit: `${$$("#toolkit .tool-card").length} groups · ${usedSkills} tools used in shipped work`,
    achievements: `${$("#certTotal")?.textContent.trim() || ""} credentials · ${(data.certs || []).length} certificates · ${(data.achievements || []).length} honors`,
    github: "Live from github.com/PrimeSalad",
    archive: $("#archiveCarouselCount")?.textContent.trim() || "Events and design work",
    recognition: `${testimonials.length} recommendations`,
  };
  return summaries[id] || "";
}

function setupViews(placeIndicator) {
  const root = document.documentElement;
  const sections = $$("main > section[id]");
  const navLinks = $$(".rail-link, .mobile-menu nav a");
  const back = $("#viewBack");
  const baseTitle = document.title;

  /* The arrow in each section header that opens it on its own page. */
  FULL_VIEWS.forEach(({ id, label }) => {
    const heading = $(`#${id} .section-heading`);
    if (!heading || $(".section-expand", heading)) return;
    heading.insertAdjacentHTML("beforeend", `<a class="section-expand" href="#/${id}" aria-label="Open ${label} on its own page" title="View all"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>`);
  });

  const setActive = (id) => {
    navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`));
    placeIndicator();
  };

  const showFull = (id) => {
    const index = FULL_VIEWS.findIndex((view) => view.id === id);
    const view = FULL_VIEWS[index];
    root.dataset.view = id;
    root.classList.remove("is-home-view");
    sections.forEach((section) => section.classList.toggle("is-view-hidden", section.id !== id));
    setActive(id);
    renderViewPager(index);
    if (back) {
      back.innerHTML = `<a href="#${id}"><span aria-hidden="true">←</span> Back to full profile</a><span>${escapeHtml(viewSummary(id))}</span>`;
      back.hidden = false;
    }
    document.title = `${view.label} · Gene Elpie Landoy`;
    const section = document.getElementById(id);
    if (section && !reduceMotion.matches) {
      section.classList.remove("is-entering");
      void section.offsetWidth;
      section.classList.add("is-entering");
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    /* Carousels and the sticky sidebar measure themselves on resize. */
    window.dispatchEvent(new Event("resize"));
  };

  const showHome = (anchor = "") => {
    const wasFull = Boolean(root.dataset.view) && root.dataset.view !== "top";
    root.dataset.view = "top";
    root.classList.add("is-home-view");
    sections.forEach((section) => section.classList.remove("is-view-hidden"));
    $("#viewPager")?.replaceChildren();
    if (back) back.hidden = true;
    document.title = baseTitle;
    if (anchor) setActive(anchor);
    if (!wasFull) return;
    window.dispatchEvent(new Event("resize"));
    /* The browser couldn't scroll to an anchor that was hidden a moment ago. */
    const target = anchor && document.getElementById(anchor);
    if (target) target.scrollIntoView({ behavior: "instant", block: "start" });
    else window.scrollTo({ top: 0, behavior: "instant" });
  };

  const fromHash = () => {
    const hash = location.hash.slice(1);
    if (hash.startsWith("/")) {
      const id = hash.slice(1);
      if (FULL_VIEWS.some((view) => view.id === id)) showFull(id);
      else showHome();
    } else if (hash === "top" || hash === "contact" || FULL_VIEWS.some((view) => view.id === hash)) {
      showHome(hash);
    } else if (!hash || !root.dataset.view) {
      /* No hash, or #case-… / #recruiter opening on top of the profile. */
      showHome();
    }
  };
  window.addEventListener("hashchange", fromHash);
  fromHash();
  if (!location.hash) setActive("top");

  /* On the long page the tab underline follows whichever section is in view. */
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      if (root.dataset.view !== "top") return;
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: "-22% 0px -58%", threshold: [0.05, 0.2, 0.5] });
    sections.forEach((section) => spy.observe(section));
  }
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

  const namedProject = projects.find((project) => {
    const name = String(project.title || "").split(/\s+[—-]\s+/)[0].toLowerCase();
    return name.length > 2 && query.includes(name);
  });
  if (namedProject) {
    const link = namedProject.app_store ? " It's available on the App Store." : "";
    return `${namedProject.title} (${namedProject.year}, ${namedProject.category}): ${namedProject.description} ${namedProject.outcome || ""}${link}`.replace(/\s+/g, " ").trim();
  }

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

  /* Pasting or dropping the sentence would report an impossible WPM. */
  ["paste", "drop"].forEach((type) => input.addEventListener(type, (event) => {
    event.preventDefault();
    status.textContent = "Type it out — pasting doesn't count.";
  }));

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
  /* Konami code toggles god mode: Byte smashes bugs instead of crashing,
     and any run that used it never touches the saved best score. */
  const konami = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
  let konamiIndex = 0;
  let godMode = false;
  let godRun = false;
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
    godRun = godMode;
    obstacles = [];
    nextObstacleDistance = worldWidth * 0.72;
    dog.y = groundY - dog.height;
    dog.velocityY = 0;
    startButton.disabled = false;
    stage.dataset.state = "ready";
    startButton.innerHTML = `Start run <span aria-hidden="true">→</span>`;
    if (godMode) showOverlay("God mode, Byte.", "Bugs can't stop you. These runs skip the best score.");
    else showOverlay("Ready, Byte?", "Press start, space, or tap the track.");
    updateScoreboard();
    drawScene();
    if (startImmediately) start();
  };

  const endRun = () => {
    running = false;
    gameOver = true;
    stage.dataset.state = "game-over";
    window.cancelAnimationFrame(animationFrame);
    if (score > best && !godRun) {
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

    const hits = obstacles.filter(intersectsObstacle);
    if (hits.length && !godMode) {
      endRun();
      return;
    }
    if (hits.length) obstacles = obstacles.filter((obstacle) => !hits.includes(obstacle));

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

  const toggleGodMode = () => {
    godMode = !godMode;
    if (godMode) godRun = true;
    stage.dataset.god = godMode ? "on" : "off";
    const message = godMode ? "God mode on. Byte smashes every bug; these runs skip the best score." : "God mode off. Bugs bite again.";
    if (announcement) announcement.textContent = message;
    if (!dialog.open) open();
    else if (!running) showOverlay(godMode ? "God mode, Byte." : "Mortal again.", message);
  };

  document.addEventListener("keydown", (event) => {
    const key = String(event.key || "").toLowerCase();
    konamiIndex = key === konami[konamiIndex] ? konamiIndex + 1 : key === konami[0] ? 1 : 0;
    if (konamiIndex === konami.length) {
      konamiIndex = 0;
      toggleGodMode();
      return;
    }
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

  /* Rescale the current run instead of restarting it, so mobile toolbar
     resizes and rotation don't wipe the score or unpause the game. */
  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    if (!dialog.open) return;
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      const rect = canvas.getBoundingClientRect();
      if (Math.max(280, rect.width || 640) === worldWidth && Math.max(140, rect.height || 200) === worldHeight) return;
      const previousWidth = worldWidth;
      const previousHeight = worldHeight;
      const previousGroundOffset = groundY - dog.height - dog.y;
      const previousVelocity = dog.velocityY;
      configureWorld();
      if (!hasStarted) {
        reset();
        return;
      }
      const scaleX = worldWidth / previousWidth;
      const scaleY = worldHeight / previousHeight;
      distance *= scaleX;
      nextObstacleDistance *= scaleX;
      obstacles.forEach((obstacle) => {
        obstacle.x *= scaleX;
        obstacle.width *= scaleY;
        obstacle.height *= scaleY;
      });
      dog.y = groundY - dog.height - Math.max(0, previousGroundOffset * scaleY);
      dog.velocityY = previousVelocity * scaleY;
      if (!running) drawScene();
    }, 120);
  });

  new MutationObserver(() => {
    readPalette();
    if (!running) drawScene();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  readPalette();
  updateScoreboard();
}

/* =========================
   Playground dropdown in the side rail
========================= */
function setupRailTools() {
  const root = $("#railTools");
  const toggle = $("#railToolsToggle");
  const menu = $("#railToolsMenu");
  if (!root || !toggle || !menu) return;
  const storageKey = "gene-portfolio-playground-open";

  const setOpen = (open, persist = true) => {
    root.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    /* Collapsed items must not be reachable by Tab or screen readers. */
    menu.inert = !open;
    if (!persist) return;
    try { localStorage.setItem(storageKey, open ? "1" : "0"); } catch { /* private mode */ }
  };

  let saved = null;
  try { saved = localStorage.getItem(storageKey); } catch { /* private mode */ }
  setOpen(saved === "1", false);

  toggle.addEventListener("click", () => setOpen(!root.classList.contains("is-open")));
  menu.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    setOpen(false);
    toggle.focus();
  });
}

/* =========================
   Shared dialog helpers
========================= */
function openExclusiveDialog(dialog) {
  $$("dialog[open]").forEach((openDialog) => {
    if (openDialog !== dialog) openDialog.close();
  });
  if (!dialog.open) dialog.showModal();
  if ($("#menuToggle")?.getAttribute("aria-expanded") === "true") $("#menuToggle")?.click();
}

function projectLinks(project) {
  const links = [];
  const live = safeUrl(project.website || project.demo || project.preview);
  const appStore = safeUrl(project.app_store);
  const repo = safeUrl(project.repo);
  if (live && live !== appStore) links.push({ href: live, label: "Visit live product" });
  if (appStore) links.push({ href: appStore, label: "App Store", appStore: true });
  const video = safeUrl(project.video);
  if (video) links.push({ href: video, label: "Watch demo" });
  /* Bare "https://github.com" placeholders are not real repositories. */
  if (repo && new URL(repo).pathname.length > 1) links.push({ href: repo, label: "Source code" });
  return links;
}

/* Demo videos play inside the case study. Facebook share links can't be
   resolved in the browser, so data stores the canonical reel/watch URL. */
function videoEmbed(project) {
  const source = safeUrl(project.video_embed);
  if (!source) return null;
  const url = new URL(source);
  if (/(^|\.)youtube\.com$/.test(url.hostname)) {
    const id = url.searchParams.get("v");
    return id ? { src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&playsinline=1`, vertical: false } : null;
  }
  if (/(^|\.)facebook\.com$/.test(url.hostname)) {
    return { src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(source)}&show_text=false&autoplay=true`, vertical: url.pathname.startsWith("/reel/"), sized: true };
  }
  return null;
}

/* =========================
   Case studies
========================= */
const caseState = { list: [], index: 0 };

/* Scroll areas hide their scrollbars; a bottom fade signals there is more to read. */
function updateCaseFade() {
  ["#caseDialog .case-content", "#caseDialog .case-body"].forEach((selector) => {
    const area = $(selector);
    if (!area) return;
    const scrollable = getComputedStyle(area).overflowY === "auto";
    const remaining = area.scrollHeight - area.clientHeight - area.scrollTop;
    area.classList.toggle("has-more", scrollable && remaining > 2);
  });
}

function renderCaseStudy(direction = 0) {
  const project = caseState.list[caseState.index];
  if (!project) return;
  const title = project.title || "Untitled project";
  const total = caseState.list.length;
  const position = `${String(caseState.index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  const primaryLink = projectLinks(project)[0];

  $("#caseCounter").textContent = `Case study ${position}`;
  $("#caseKicker").textContent = [project.category, project.year].filter(Boolean).join(" · ");
  $("#caseTitle").textContent = title;
  $("#caseImpact").textContent = project.impact || project.description || "";
  $("#caseRole").textContent = project.role || "Developer";
  $("#caseOutcome").textContent = project.outcome || project.description || "";

  const image = $("#caseImage");
  const media = $("#caseMedia");
  media.hidden = !project.image;
  if (project.image) {
    image.src = resolveImagePath(project.image);
    image.alt = `Interface preview of ${title}`;
  }
  const stage = $("#caseVideo");
  const hasVideo = Boolean(videoEmbed(project) && project.image);
  media.classList.toggle("is-replaced", hasVideo);
  stage.hidden = !hasVideo;
  stage.classList.remove("is-playing", "is-vertical");
  stage.innerHTML = hasVideo
    ? `<button class="case-play" type="button" aria-label="Play the ${escapeHtml(title)} demo video"><img src="${escapeHtml(resolveImagePath(project.image))}" alt="" width="1440" height="900" /><span class="case-play-badge"><span aria-hidden="true">▶</span> Play demo</span></button>`
    : "";
  if (primaryLink) {
    media.href = primaryLink.href;
    media.setAttribute("aria-label", `Open ${title}`);
  } else {
    media.removeAttribute("href");
    media.removeAttribute("aria-label");
  }

  $("#caseHighlights").innerHTML = (project.highlights || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  $("#caseStack").innerHTML = (project.tech || [])
    .map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  $("#caseLinks").innerHTML = projectLinks(project).map((link) => link.appStore
    ? `<a class="case-app-store" href="${escapeHtml(link.href)}" target="_blank" rel="noreferrer" aria-label="Download ${escapeHtml(title)} on the App Store"><img src="/images/app-store-badge.svg" alt="" width="120" height="40" /></a>`
    : `<a class="case-link" href="${escapeHtml(link.href)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)} <span aria-hidden="true">↗</span></a>`).join("");

  $("#casePrev").disabled = total < 2;
  $("#caseNext").disabled = total < 2;
  $("#caseLive").textContent = `${title}, case study ${caseState.index + 1} of ${total}`;
  $$("#caseDialog .case-content, #caseDialog .case-body").forEach((area) => { area.scrollTop = 0; });
  requestAnimationFrame(updateCaseFade);
  if (direction && !reduceMotion.matches && $(".case-body")?.animate) {
    $(".case-body").animate([
      { opacity: 0.35, transform: `translateX(${direction * 14}px)` },
      { opacity: 1, transform: "none" },
    ], { duration: 260, easing: "cubic-bezier(.2,.7,.3,1)" });
  }

  try { history.replaceState(null, "", `#case-${projectSlug(project)}`); } catch { /* sandboxed frames */ }
}

function openCaseStudy(projectId, list = visibleProjects) {
  const dialog = $("#caseDialog");
  if (!dialog) return;
  const source = list.some((project) => project.id === projectId) ? list : sortedProjects();
  caseState.list = source;
  caseState.index = Math.max(0, source.findIndex((project) => project.id === projectId));
  renderCaseStudy();
  openExclusiveDialog(dialog);
}

function setupCaseStudies() {
  const dialog = $("#caseDialog");
  if (!dialog) return;

  const step = (delta) => {
    if (caseState.list.length < 2) return;
    caseState.index = (caseState.index + delta + caseState.list.length) % caseState.list.length;
    renderCaseStudy(delta);
  };
  const close = () => { if (dialog.open) dialog.close(); };

  $("#projectGrid")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-case]");
    if (button) openCaseStudy(button.dataset.case);
  });
  $("#casePrev").addEventListener("click", () => step(-1));
  $("#caseNext").addEventListener("click", () => step(1));
  $("[data-close-case]").addEventListener("click", close);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
  dialog.addEventListener("keydown", (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
  });
  $("#caseVideo").addEventListener("click", (event) => {
    if (!event.target.closest(".case-play")) return;
    const project = caseState.list[caseState.index];
    const embed = project && videoEmbed(project);
    if (!embed) return;
    const stage = $("#caseVideo");
    stage.classList.add("is-playing");
    stage.classList.toggle("is-vertical", embed.vertical);
    const frame = Object.assign(document.createElement("iframe"), {
      title: `${project.title} demo video`,
      allow: "autoplay; encrypted-media; picture-in-picture; fullscreen",
    });
    stage.replaceChildren(frame);
    /* Facebook's player only fills the frame when it is told the exact size. */
    const { width, height } = frame.getBoundingClientRect();
    frame.src = embed.sized ? `${embed.src}&width=${Math.round(width)}&height=${Math.round(height)}` : embed.src;
  });
  dialog.addEventListener("close", () => {
    /* Dropping the iframe is the only reliable way to stop third-party playback. */
    $("#caseVideo").replaceChildren();
    if (!location.hash.startsWith("#case-")) return;
    try { history.replaceState(null, "", location.pathname + location.search + viewHash()); } catch { /* ignore */ }
  });

  $$("#caseDialog .case-content, #caseDialog .case-body").forEach((area) => {
    area.addEventListener("scroll", updateCaseFade, { passive: true });
  });
  $("#caseImage").addEventListener("load", updateCaseFade);
  window.addEventListener("resize", () => { if (dialog.open) updateCaseFade(); }, { passive: true });

  const copyButton = $("#caseCopyLink");
  copyButton.addEventListener("click", async () => {
    let copied = false;
    try {
      await navigator.clipboard.writeText(location.href);
      copied = true;
    } catch { /* clipboard blocked */ }
    copyButton.textContent = copied ? "link copied ✓" : "copy failed";
    window.setTimeout(() => { copyButton.textContent = "copy link"; }, 1600);
  });

  const openFromHash = () => {
    const match = location.hash.match(/^#case-([a-z0-9-]+)$/);
    if (!match) return;
    const all = sortedProjects();
    const project = all.find((item) => projectSlug(item) === match[1]);
    if (project) openCaseStudy(project.id, all);
  };
  window.addEventListener("hashchange", openFromHash);
  openFromHash();
}

/* =========================
   Swipe mode — TidyPaw-style review of the project list
========================= */
function setupSwipeMode() {
  const dialog = $("#swipeDialog");
  const deck = $("#swipeDeck");
  if (!dialog || !deck) return;

  const done = $("#swipeDone");
  const controls = $("#swipeControls");
  const undoButton = $("#swipeUndo");
  const progress = $("#swipeProgress");
  const live = $("#swipeLive");
  const SWIPE_DISTANCE = 96;
  const FLING_VELOCITY = 0.55;

  let projects = [];
  let index = 0;
  let decisions = [];
  let animating = false;

  const cardMarkup = (project, depth) => {
    const title = escapeHtml(project.title || "Untitled project");
    const image = project.image ? `<img src="${escapeHtml(resolveImagePath(project.image))}" alt="" draggable="false" />` : "";
    const tags = (project.tech || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    return `
      <article class="swipe-card" data-depth="${depth}"${depth ? ' aria-hidden="true"' : ""}>
        <div class="swipe-card-media">${image}<b class="swipe-stamp is-like" aria-hidden="true">Shortlist</b><b class="swipe-stamp is-skip" aria-hidden="true">Skip</b></div>
        <div class="swipe-card-copy">
          <p>${escapeHtml(project.category || "Digital product")} · ${escapeHtml(project.year || "")}</p>
          <h3>${title}</h3>
          <span>${escapeHtml(project.description || project.impact || "")}</span>
          <div class="swipe-card-tags">${tags}</div>
        </div>
      </article>`;
  };

  const likedProjects = () => decisions.filter((item) => item.liked).map((item) => item.project);

  const renderDone = () => {
    const liked = likedProjects();
    $("#swipeDoneTitle").textContent = liked.length
      ? `${liked.length} project${liked.length === 1 ? "" : "s"} caught your eye.`
      : "Tough crowd — nothing shortlisted.";
    $("#swipeShortlist").innerHTML = liked.length
      ? liked.map((project) => `<li><button type="button" data-swipe-case="${escapeHtml(project.id)}"><span>${escapeHtml(project.title)}</span><small>${escapeHtml(project.category || "")}</small><i aria-hidden="true">→</i></button></li>`).join("")
      : '<li class="is-empty">Start over to give the projects another look.</li>';
    const subject = liked.length ? "Your portfolio — projects I liked" : "Hello from your portfolio";
    const body = liked.length
      ? `Hi Gene,\n\nI went through your portfolio in swipe mode and these stood out:\n${liked.map((project) => `• ${project.title}`).join("\n")}\n\n`
      : "Hi Gene,\n\n";
    $("#swipeEmail").href = `mailto:g.landoyelpie@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    requestAnimationFrame(updateShortlistFade);
  };

  const shortlist = $("#swipeShortlist");
  function updateShortlistFade() {
    const remaining = shortlist.scrollHeight - shortlist.clientHeight - shortlist.scrollTop;
    shortlist.classList.toggle("has-more", remaining > 2);
  }
  shortlist.addEventListener("scroll", updateShortlistFade, { passive: true });

  const render = () => {
    const finished = index >= projects.length;
    deck.hidden = finished;
    done.hidden = !finished;
    controls.hidden = finished;
    dialog.classList.toggle("is-finished", finished);
    undoButton.disabled = decisions.length === 0;
    progress.textContent = finished
      ? "Done"
      : `${String(index + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
    if (finished) {
      renderDone();
      return;
    }
    deck.innerHTML = projects.slice(index, index + 3)
      .map((project, depth) => cardMarkup(project, depth))
      .reverse()
      .join("");
    attachDrag(deck.querySelector('.swipe-card[data-depth="0"]'));
  };

  const commit = (liked, card = deck.querySelector('.swipe-card[data-depth="0"]')) => {
    if (animating || index >= projects.length) return;
    const project = projects[index];
    decisions.push({ project, liked });
    live.textContent = `${project.title} ${liked ? "added to shortlist" : "skipped"}.`;
    const finish = () => {
      animating = false;
      index += 1;
      render();
      if (index >= projects.length) $("#swipeEmail")?.focus();
    };
    if (!card || reduceMotion.matches) {
      finish();
      return;
    }
    animating = true;
    card.style.transition = "transform 280ms cubic-bezier(.2,.7,.3,1), opacity 280ms ease";
    card.style.setProperty(liked ? "--like" : "--skip", "1");
    card.style.transform = `translateX(${liked ? 130 : -130}%) rotate(${liked ? 18 : -18}deg)`;
    card.style.opacity = "0";
    window.setTimeout(finish, 290);
  };

  const undo = () => {
    if (animating || !decisions.length) return;
    const last = decisions.pop();
    index = Math.max(0, index - 1);
    live.textContent = `Brought back ${last.project.title}.`;
    render();
    const card = deck.querySelector('.swipe-card[data-depth="0"]');
    if (card && !reduceMotion.matches && card.animate) {
      card.animate([
        { transform: `translateX(${last.liked ? 120 : -120}%) rotate(${last.liked ? 16 : -16}deg)`, opacity: 0 },
        { transform: "none", opacity: 1 },
      ], { duration: 300, easing: "cubic-bezier(.2,.7,.3,1)" });
    }
    $("#swipeLike")?.focus();
  };

  function attachDrag(card) {
    if (!card) return;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;
    let dragging = false;

    const setOffset = (dx, dy) => {
      card.style.transform = `translate(${dx}px, ${dy * 0.25}px) rotate(${dx / 18}deg)`;
      card.style.setProperty("--like", String(Math.max(0, Math.min(1, dx / SWIPE_DISTANCE))));
      card.style.setProperty("--skip", String(Math.max(0, Math.min(1, -dx / SWIPE_DISTANCE))));
    };

    card.addEventListener("pointerdown", (event) => {
      if (animating || event.button > 0) return;
      dragging = true;
      startX = lastX = event.clientX;
      startY = event.clientY;
      lastTime = event.timeStamp;
      velocity = 0;
      card.setPointerCapture(event.pointerId);
      card.style.transition = "none";
      card.classList.add("is-dragging");
    });
    card.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const elapsed = Math.max(1, event.timeStamp - lastTime);
      velocity = (event.clientX - lastX) / elapsed;
      lastX = event.clientX;
      lastTime = event.timeStamp;
      setOffset(event.clientX - startX, event.clientY - startY);
    });
    const release = (event) => {
      if (!dragging) return;
      dragging = false;
      card.classList.remove("is-dragging");
      const dx = event.clientX - startX;
      if (event.type === "pointerup" && (Math.abs(dx) > SWIPE_DISTANCE || (Math.abs(velocity) > FLING_VELOCITY && Math.abs(dx) > 24))) {
        commit(dx > 0, card);
        return;
      }
      card.style.transition = "transform 220ms cubic-bezier(.2,.7,.3,1)";
      setOffset(0, 0);
      card.style.transform = "";
    };
    card.addEventListener("pointerup", release);
    card.addEventListener("pointercancel", release);
  }

  const reset = () => {
    projects = sortedProjects();
    index = 0;
    decisions = [];
    animating = false;
    render();
  };

  const open = () => {
    if (!projects.length) reset();
    openExclusiveDialog(dialog);
    window.setTimeout(() => (index < projects.length ? $("#swipeLike") : $("#swipeEmail"))?.focus(), 30);
  };
  const close = () => { if (dialog.open) dialog.close(); };

  $$("[data-open-swipe]").forEach((button) => button.addEventListener("click", open));
  $("[data-close-swipe]").addEventListener("click", close);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
  $("#swipeLike").addEventListener("click", () => commit(true));
  $("#swipeSkip").addEventListener("click", () => commit(false));
  undoButton.addEventListener("click", undo);
  $("#swipeRestart").addEventListener("click", () => {
    reset();
    $("#swipeLike")?.focus();
  });
  $("#swipeShortlist").addEventListener("click", (event) => {
    const button = event.target.closest("[data-swipe-case]");
    if (button) openCaseStudy(button.dataset.swipeCase, likedProjects());
  });

  dialog.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      undo();
      return;
    }
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === "ArrowRight") { event.preventDefault(); commit(true); }
    if (event.key === "ArrowLeft") { event.preventDefault(); commit(false); }
  });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "e") {
      event.preventDefault();
      open();
    }
  });
}

/* =========================
   Motion polish
========================= */
function setupCountUps() {
  const counters = $$("[data-count-up]");
  if (!counters.length || reduceMotion.matches || !("IntersectionObserver" in window)) return;

  const animate = (element) => {
    const match = element.textContent.trim().match(/^([\d,]+)(.*)$/);
    if (!match) return;
    const target = Number(match[1].replace(/,/g, ""));
    const suffix = match[2];
    const pad = /^0\d/.test(match[1]) ? match[1].length : 0;
    if (!target) return;
    const format = (value) => `${pad ? String(value).padStart(pad, "0") : value.toLocaleString()}${suffix}`;
    const duration = 1100;
    const start = performance.now();
    let written = format(0);
    element.textContent = written;

    const frame = (now) => {
      /* Live data (e.g. GitHub) replaced the number mid-animation: let it win. */
      if (element.textContent !== written) return;
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      written = format(Math.round(target * eased));
      element.textContent = written;
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      animate(entry.target);
    });
  }, { threshold: 0.6 });
  counters.forEach((counter) => observer.observe(counter));
}

function setCounts() {
  const projectCount = $("#projectCount");
  const recognitionCount = $("#recognitionCount");
  const currentYear = $("#currentYear");
  if (projectCount) projectCount.textContent = String((data.projects || []).length).padStart(2, "0");
  if (recognitionCount) recognitionCount.textContent = String((data.achievements || []).length).padStart(2, "0");
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
}

/* The Render backend can be cold; wake it while the visitor reads so the
   assistant and contact form answer quickly when they're used. */
function warmBackend() {
  const ping = () => { aiHealthCheck(); };
  if ("requestIdleCallback" in window) window.requestIdleCallback(ping, { timeout: 3000 });
  else window.setTimeout(ping, 1500);
}

function init() {
  setupTheme();
  setupHeroLocalTime();
  setupMobileMenu();
  setupRailTools();
  setupAvailabilityPanel();
  renderProjects();
  setupProjectFilters();
  setupCarousel("#projectGrid", "#projectPrev", "#projectNext");
  renderExperience();
  renderSkillCounts();
  renderCertificates();
  renderHonors();
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
  setupCaseStudies();
  setupSwipeMode();
  setupNavMore();
  setupProfileMore();
  const openRecruiter = setupRecruiter({ data });
  setupTerminal({ data, openCaseStudy, openRecruiter, answer: localPortfolioAnswer, reduceMotion });
  setupScrollUX();
  setupAsideSticky();
  setCounts();
  setupCountUps();
  observeReveals();
  warmBackend();
}

init();
