import { PORTFOLIO_DATA } from "./data.js";
import { escapeHtml, resolveImagePath } from "./utils.js";
import { submitContactForm } from "./api.js";

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
  { title: "Event Gallery 03", image: "/images/events/gallery/3.jpg", tag: "event" },
  { title: "Event Gallery 04", image: "/images/events/gallery/4.jpg", tag: "event" },
  { title: "Event Gallery 05", image: "/images/events/gallery/5.jpg", tag: "event" },
  { title: "Event Gallery 06", image: "/images/events/gallery/6.jpg", tag: "event" },
  { title: "Event Gallery 07", image: "/images/events/gallery/7.jpg", tag: "event" },
  { title: "Hackathon Gallery", image: "/images/events/gallery/hag.jpg", tag: "hackathon" },
  { title: "Community Event", image: "/images/events/gallery/event1.jpg", tag: "event" },
  { title: "CodeMaster Recognition", image: "/images/gallery/codemaster.jpg", tag: "award" },
];

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
  if (/\bai\b|gemini|artificial intelligence/.test(text)) kinds.push("ai");
  if (/mobile|flutter|dart/.test(text)) kinds.push("mobile");
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

  const projects = [...(data.projects || [])].sort((a, b) => Number(a.status === "archive") - Number(b.status === "archive"));
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
    const url = safeUrl(project.demo || project.preview || project.repo) || "#";
    const image = project.image ? resolveImagePath(project.image) : "";
    const tags = (project.tech || []).slice(0, 4).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    const media = image
      ? `<img src="${escapeHtml(image)}" alt="Preview of ${title}" width="960" height="600" loading="lazy" />`
      : `<span class="project-placeholder"><span>${escapeHtml(initials(project.title))}</span></span>`;
    const mediaMarkup = url === "#"
      ? `<div class="project-media" aria-label="${title} project preview">${media}</div>`
      : `<a class="project-media" href="${escapeHtml(url)}" target="_blank" rel="noreferrer" aria-label="Open ${title}">${media}</a>`;
    const titleMarkup = url === "#"
      ? title
      : `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${title}</a>`;

    return `
      <article class="project-card reveal" data-kind="${escapeHtml(projectKind(project))}" data-delay="${index % 2}">
        ${mediaMarkup}
        <div class="project-topline"><span>${String(index + 1).padStart(2, "0")} / ${category}</span><span>${escapeHtml(project.year || "2026")}</span></div>
        <h3>${titleMarkup}</h3>
        <p>${description}</p>
        <div class="project-tags" aria-label="Technologies">${tags}</div>
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

  root.innerHTML = (data.timeline || []).map((item, index) => `
    <article class="experience-item reveal ${index >= 5 ? "is-extra" : ""}" ${index >= 5 ? "hidden" : ""}>
      <div class="experience-date">${escapeHtml(item.date || item.year || "")}</div>
      <div class="experience-main">
        <h3>${escapeHtml(item.title || "Experience")}</h3>
        <p>${escapeHtml(experienceSummary(item))}</p>
      </div>
      <div class="experience-stack" aria-label="Focus areas">${(item.stack || item.tags || []).slice(0, 5).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
    </article>`).join("");

  const toggle = $("#experienceToggle");
  if (!toggle) return;
  if ((data.timeline || []).length <= 5) toggle.hidden = true;

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    $$(".experience-item.is-extra", root).forEach((item) => { item.hidden = expanded; });
    toggle.innerHTML = expanded
      ? 'Show full history <span aria-hidden="true">＋</span>'
      : 'Show less <span aria-hidden="true">−</span>';
    if (!expanded) observeReveals(root);
  });
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
  const projects = uniqueImages((data.projects || []).filter((item) => item.image))
    .map((item) => ({ ...item, archiveCategory: "projects", tag: item.category || "project" }));
  const graphics = uniqueImages(data.graphics || [])
    .map((item) => ({ ...item, image: item.src, archiveCategory: "graphics" }));
  const credentials = uniqueImages((data.certs || data.certificates || []).map((item) => ({
    ...item,
    image: item.image || (String(item.link || "").startsWith("/images/") ? item.link : ""),
    tag: item.issuer || "credential",
    fit: "contain",
  }))).map((item) => ({ ...item, archiveCategory: "credentials" }));

  return { moments, projects, graphics, credentials };
}

function archiveItems() {
  const collections = archiveCollections();
  if (archiveState.tab !== "all") return collections[archiveState.tab] || [];
  return uniqueImages([...collections.projects, ...collections.moments, ...collections.graphics, ...collections.credentials]);
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

function renderCredentials() {
  const root = $("#credentialGrid");
  const toggle = $("#credentialToggle");
  const certs = data.certs || data.certificates || [];
  if (!root || !toggle) return;

  root.innerHTML = certs.map((cert, index) => {
    const url = safeUrl(cert.link) || resolveImagePath(cert.image || cert.link || "");
    return `
      <article class="credential-card ${index >= 6 ? "is-extra" : ""}" ${index >= 6 ? "hidden" : ""}>
        <a href="${escapeHtml(url || "#")}" ${url ? "target=\"_blank\" rel=\"noreferrer\"" : "aria-disabled=\"true\""}>
          <p>${escapeHtml(cert.issuer || "Credential")} / ${escapeHtml(cert.issued || cert.year || "")}</p>
          <h3>${escapeHtml(cert.title || "Certificate")}</h3>
        </a>
      </article>`;
  }).join("");

  $("#credentialCount").textContent = `${String(certs.length).padStart(2, "0")} verified moments`;
  toggle.hidden = certs.length <= 6;
  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    $$(".credential-card.is-extra", root).forEach((card) => { card.hidden = expanded; });
    toggle.innerHTML = expanded
      ? 'Show more credentials <span aria-hidden="true">＋</span>'
      : 'Show fewer credentials <span aria-hidden="true">−</span>';
  });
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
  const initial = saved === "dark" || saved === "light" ? saved : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  const apply = (theme) => {
    document.body.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    $("meta[name=\"theme-color\"]")?.setAttribute("content", theme === "dark" ? "#11120f" : "#f3f0e8");
    $$('[data-theme-toggle]').forEach((button) => button.setAttribute("aria-pressed", String(theme === "dark")));
    $$('[data-theme-label]').forEach((label) => { label.textContent = theme === "dark" ? "Light mode" : "Dark mode"; });
  };

  apply(initial);
  $$('[data-theme-toggle]').forEach((button) => button.addEventListener("click", () => {
    const next = document.body.dataset.theme === "dark" ? "light" : "dark";
    apply(next);
    try { localStorage.setItem(storageKey, next); } catch { /* Storage can be unavailable. */ }
  }));
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

function setupContactForm() {
  const form = $("#contactForm");
  const status = $("#contactStatus");
  if (!form || !status) return;

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

    const submit = $("button[type=\"submit\"]", form);
    submit.disabled = true;
    submit.innerHTML = 'Sending… <span aria-hidden="true">↗</span>';
    status.textContent = "Sending your note…";

    try {
      await submitContactForm({ name: String(values.name).trim(), email: String(values.email).trim(), message: String(values.message).trim() });
      form.reset();
      status.textContent = "Note sent. I’ll get back to you soon.";
    } catch {
      status.innerHTML = 'The form is offline right now. <a href="mailto:g.landoyelpie@gmail.com">Send an email instead.</a>';
    } finally {
      submit.disabled = false;
      submit.innerHTML = 'Send note <span aria-hidden="true">↗</span>';
    }
  });

  $$("input, textarea", form).forEach((field) => field.addEventListener("blur", () => {
    if (field.value.trim()) fieldError(field.id, "");
  }));
}

function setCounts() {
  $("#projectCount").textContent = String((data.projects || []).length).padStart(2, "0");
  $("#recognitionCount").textContent = String((data.achievements || []).length).padStart(2, "0");
  $("#currentYear").textContent = String(new Date().getFullYear());
}

function init() {
  setupTheme();
  setupMobileMenu();
  renderProjects();
  setupProjectFilters();
  setupCarousel("#projectGrid", "#projectPrev", "#projectNext");
  renderExperience();
  setupArchive();
  renderArchive();
  setupCarousel("#archiveGrid", "#archivePrev", "#archiveNext");
  setupLightbox();
  setupTestimonials();
  renderCredentials();
  setupContactForm();
  setupScrollUX();
  setCounts();
  observeReveals();
}

init();
