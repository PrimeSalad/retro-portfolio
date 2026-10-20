/**
 * File: js/recruiter.js
 * Description: Recruiter view. The whole profile condensed into one printable
 * page, built from the same data the portfolio renders. Opens from the profile
 * card, the terminal, or a shared #recruiter link.
 */

import { escapeHtml } from "./utils.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const SITE = "https://www.elpielandoy.space/";
const EMAIL = "g.landoyelpie@gmail.com";
const HONOR_ORDER = ["cum laude", "1st place", "champion", "awardee", "presenter", "5th place", "6th place"];

const shortTitle = (title) => String(title || "").split(/\s+[—-]\s+/)[0];

export function setupRecruiter({ data }) {
  const dialog = $("#recruiterDialog");
  const sheet = $("#recruiterSheet");
  if (!dialog || !sheet) return () => {};

  const topProjects = () => [...(data.projects || [])]
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || (b.score || 0) - (a.score || 0))
    .slice(0, 5);

  const topHonors = () => [...(data.achievements || [])]
    .map((item) => ({ item, rank: HONOR_ORDER.indexOf(String(item.badge || "").toLowerCase()) }))
    .filter(({ rank }) => rank >= 0)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 6)
    .map(({ item }) => item);

  /* Skills come from the Stack card so the two never disagree. */
  const skills = () => $$("#toolkit .tool-card").map((card) => ({
    group: $("h3", card)?.textContent.trim() || "",
    items: $$(".skill-chips li", card).filter((chip) => chip.classList.contains("is-used")).map((chip) => chip.firstChild.textContent.trim()),
  })).filter((row) => row.items.length);

  const render = () => {
    const roles = (data.timeline || []).slice(0, 5).map((role) => {
      const [title, ...org] = String(role.title || "").split(/,\s+/);
      return `
        <li>
          <div class="rs-row"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(role.date || role.year || "")}</span></div>
          ${org.length ? `<p class="rs-org">${escapeHtml(org.join(", "))}</p>` : ""}
          <p>${escapeHtml(role.bullets?.[0] || "")}</p>
        </li>`;
    }).join("");

    const projects = topProjects().map((project) => {
      const url = project.website || project.demo || project.app_store || "";
      return `
        <li>
          <div class="rs-row"><strong>${escapeHtml(shortTitle(project.title))}</strong><span>${escapeHtml(String(project.year || ""))}</span></div>
          <p class="rs-org">${escapeHtml(project.category || "")}${(project.tech || []).length ? ` · ${escapeHtml(project.tech.slice(0, 4).join(", "))}` : ""}</p>
          <p>${escapeHtml(project.impact || project.description || "")}${url && url !== "#" ? ` <a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""))}</a>` : ""}</p>
        </li>`;
    }).join("");

    const skillRows = skills().map((row) => `<li><strong>${escapeHtml(row.group)}</strong><span>${escapeHtml(row.items.join(", "))}</span></li>`).join("");
    const honors = topHonors().map((item) => `<li><strong>${escapeHtml(item.badge)}</strong><span>${escapeHtml(shortTitle(item.title))}</span></li>`).join("");

    sheet.innerHTML = `
      <header class="rs-head">
        <div>
          <h2 id="recruiterTitle">Gene Elpie Landoy</h2>
          <p class="rs-title">Full-Stack Developer &amp; Product Designer</p>
        </div>
        <p class="rs-contact">
          Boac, Marinduque, Philippines<br />
          <a href="mailto:${EMAIL}">${EMAIL}</a><br />
          <a href="${SITE}">elpielandoy.space</a> · <a href="https://github.com/PrimeSalad" target="_blank" rel="noreferrer">github.com/PrimeSalad</a><br />
          <a href="https://www.linkedin.com/in/gene-elpie-landoy-b1851b28b/" target="_blank" rel="noreferrer">linkedin.com/in/gene-elpie-landoy</a>
        </p>
      </header>
      <p class="rs-summary">Full-stack developer and product designer who ships web, mobile, and on-device AI products end to end, from planning and UI/UX through backend, release, and support. BS Information Technology, Cum Laude. Open to full-time, contract, and project work.</p>
      <div class="rs-grid">
        <div>
          <section><h3>Experience</h3><ul class="rs-list">${roles}</ul></section>
          <section><h3>Selected projects</h3><ul class="rs-list">${projects}</ul></section>
        </div>
        <aside>
          <section><h3>Skills</h3><ul class="rs-pairs">${skillRows}</ul></section>
          <section><h3>Honors</h3><ul class="rs-pairs">${honors}</ul></section>
          <section><h3>Education</h3><p><strong>BS Information Technology</strong><br />Marinduque State University<br />Cum Laude · Class of 2026</p></section>
          <section><h3>Credentials</h3><p>${(data.certs || []).length} certificates, including Career Service Professional Eligibility (CSC), DOST Technical Excellence and CodeMaster awards, and Hack4Gov 3 &amp; 4.</p></section>
        </aside>
      </div>`;
  };

  const setHash = (on) => {
    try {
      if (on && location.hash !== "#recruiter") history.replaceState(null, "", "#recruiter");
      if (!on && location.hash === "#recruiter") {
        const view = document.documentElement.dataset.view;
        history.replaceState(null, "", location.pathname + location.search + (view && view !== "top" ? `#/${view}` : ""));
      }
    } catch { /* sandboxed frames */ }
  };

  const open = () => {
    render();
    $$("dialog[open]").forEach((other) => { if (other !== dialog) other.close(); });
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    setHash(true);
  };

  $$("[data-open-recruiter]").forEach((button) => button.addEventListener("click", open));
  $("[data-close-recruiter]")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => setHash(false));

  /* Only the sheet prints; the page behind it is hidden by print CSS. */
  $("[data-print-recruiter]")?.addEventListener("click", () => {
    document.documentElement.classList.add("is-printing-recruiter");
    window.print();
  });
  window.addEventListener("afterprint", () => document.documentElement.classList.remove("is-printing-recruiter"));

  const copyButton = $("[data-copy-recruiter]");
  copyButton?.addEventListener("click", async () => {
    const link = `${SITE}#recruiter`;
    let copied = false;
    try {
      await navigator.clipboard.writeText(link);
      copied = true;
    } catch { /* clipboard blocked */ }
    copyButton.textContent = copied ? "Link copied ✓" : link;
    window.setTimeout(() => { copyButton.textContent = "Copy link"; }, 1800);
  });

  if (location.hash === "#recruiter") window.requestAnimationFrame(open);
  window.addEventListener("hashchange", () => { if (location.hash === "#recruiter") open(); });
  return open;
}
