/**
 * File: js/terminal.js
 * Description: Terminal mode. A small shell over the portfolio: it reads the
 * same data and DOM the page renders, and can drive the page (open case
 * studies, switch theme, jump to sections, start the games).
 */

import { escapeHtml } from "./utils.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const BANNER = String.raw`
  ____ _____ _   _ _____
 / ___| ____| \ | | ____|
| |  _|  _| |  \| |  _|
| |_| | |___| |\  | |___
 \____|_____|_| \_|_____|`;

const SECTIONS = {
  home: "top", top: "top", profile: "profile", projects: "work", work: "work", experience: "experience",
  stack: "toolkit", skills: "toolkit", certifications: "achievements", certs: "achievements",
  honors: "achievements", github: "github", archive: "archive", recommendations: "recognition",
  contact: "contact",
};

const GAMES = { typing: "[data-open-typing]", runner: "[data-open-runner]", swipe: "[data-open-swipe]", ask: "[data-open-command]" };

const EMAIL = "g.landoyelpie@gmail.com";

export function setupTerminal({ data, openCaseStudy, openRecruiter, answer, reduceMotion }) {
  const dialog = $("#termDialog");
  const output = $("#termOutput");
  const form = $("#termForm");
  const input = $("#termInput");
  if (!dialog || !output || !form || !input) return;

  const projects = () => data.projects || [];
  const slug = (title) => String(title).split(/\s+[—-]\s+/)[0].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const history = [];
  let historyIndex = 0;
  let booted = false;
  let queue = Promise.resolve();

  /* ---------- output ---------- */
  const scrollToEnd = () => { output.scrollTop = output.scrollHeight; };
  const line = (html = "", className = "") => {
    const row = document.createElement("div");
    row.className = `term-line${className ? ` ${className}` : ""}`;
    row.innerHTML = html;
    output.append(row);
    scrollToEnd();
    return row;
  };
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, reduceMotion.matches ? 0 : ms));
  /* Lines land one after another, quickly, so long output still feels typed. */
  const print = (rows, delay = 18) => {
    queue = queue.then(async () => {
      for (const row of rows) {
        if (Array.isArray(row)) line(...row);
        else line(row);
        await wait(delay);
      }
    });
    return queue;
  };
  const cmd = (name, label = name) => `<button type="button" class="term-cmd" data-run="${escapeHtml(name)}">${escapeHtml(label)}</button>`;
  const muted = (text) => `<span class="term-muted">${text}</span>`;
  const strong = (text) => `<span class="term-strong">${text}</span>`;
  const link = (href, text) => `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${escapeHtml(text)}</a>`;
  const pad = (text, width) => escapeHtml(text) + "&nbsp;".repeat(Math.max(1, width - String(text).length));

  const phTime = () => new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", hour: "numeric", minute: "2-digit", hour12: true }).format(new Date());

  /* ---------- commands ---------- */
  const commands = {
    help: {
      about: "list commands",
      run: () => print([
        strong("Commands"),
        ...Object.entries(commands)
          .filter(([, command]) => !command.hidden)
          .map(([name, command]) => `${cmd(name, name.padEnd(12, " "))}${muted(escapeHtml(command.about))}`),
        "",
        muted("Tab completes · ↑ ↓ history · Ctrl+L clears · Esc closes"),
      ], 10),
    },
    whoami: {
      about: "who is this",
      run: () => print([
        strong("Gene Elpie Landoy"),
        "Full-stack developer / product designer",
        `Boac, Marinduque, Philippines ${muted(`· ${phTime()} there`)}`,
        `BS Information Technology, Cum Laude ${muted("· Marinduque State University")}`,
        `Open to full-time, contract, and project work ${muted("→")} ${cmd("contact")}`,
      ]),
    },
    about: {
      about: "the short version",
      run: () => print([
        "I'm a full-stack developer & product designer. I build modern web, mobile, and AI products.",
        "Right now I'm building useful new stuff end to end. I love turning rough ideas and real",
        "requirements into things people actually use.",
      ]),
    },
    projects: {
      about: "list projects",
      run: () => print([
        strong(`${projects().length} projects`) + muted("  ·  open &lt;number|name&gt; to read one"),
        ...projects().map((project, index) => `${cmd(`open ${index + 1}`, String(index + 1).padStart(2, "0"))} ${pad(project.title.split(/\s+[—-]\s+/)[0], 24)}${muted(`${escapeHtml(project.category || "")} · ${project.year || ""}`)}`),
      ], 22),
    },
    open: {
      about: "open a project case study",
      args: () => projects().map((project) => slug(project.title)),
      run: (args) => {
        const query = args.join(" ").toLowerCase().trim();
        if (!query) return print([`usage: open &lt;number|name&gt;  ${muted("e.g.")} ${cmd("open unhooked")}`]);
        const list = projects();
        const byNumber = list[Number(query) - 1];
        const project = byNumber || list.find((item) => slug(item.title) === slug(query)) || list.find((item) => item.title.toLowerCase().includes(query));
        if (!project) return print([`open: no project matches "${escapeHtml(query)}". Try ${cmd("projects")}`]);
        return print([`Opening ${strong(escapeHtml(project.title))}…`]).then(() => wait(260)).then(() => {
          dialog.close();
          openCaseStudy(project.id);
        });
      },
    },
    stack: {
      about: "tools by category",
      run: () => {
        const rows = $$("#toolkit .tool-card").map((card) => {
          const name = $("h3", card)?.textContent.trim() || "";
          const skills = $$(".skill-chips li", card).map((chip) => chip.classList.contains("is-used")
            ? escapeHtml(chip.firstChild.textContent.trim())
            : muted(escapeHtml(chip.firstChild.textContent.trim())));
          return `${strong(pad(name, 10))}${skills.join(muted(" · "))}`;
        });
        return print([...rows, "", muted("brighter = used in projects or roles on the site")], 30);
      },
    },
    experience: {
      about: "work history",
      run: () => print((data.timeline || []).map((role) => {
        const [title, ...org] = String(role.title).split(/,\s+/);
        return `${muted(pad(role.date || role.year || "", 20))}${strong(escapeHtml(title))}${org.length ? muted(` · ${escapeHtml(org.join(", "))}`) : ""}`;
      }), 26),
    },
    honors: {
      about: "awards and placements",
      run: () => {
        const honors = data.achievements || [];
        return print([
          strong(`${honors.length} honors · ${(data.certs || []).length} certificates`),
          ...honors.map((item) => `${pad(`[${item.badge || "Honor"}]`, 14)}${escapeHtml(item.title)}`),
        ], 22);
      },
    },
    github: {
      about: "live GitHub numbers",
      run: () => {
        const read = (id) => $(`#${id}`)?.textContent.trim() || "—";
        return print([
          `${pad("repositories", 16)}${strong(read("githubRepoCount"))}`,
          `${pad("contributions", 16)}${strong(read("contribTotal"))} ${muted("last 12 months")}`,
          `${pad("longest streak", 16)}${strong(read("contribLongestStreak"))} ${muted("days")}`,
          `${pad("profile", 16)}${link("https://github.com/PrimeSalad", "github.com/PrimeSalad")}`,
        ]);
      },
    },
    contact: {
      about: "how to reach me",
      run: () => print([
        `${pad("email", 10)}${link(`mailto:${EMAIL}`, EMAIL)}`,
        `${pad("linkedin", 10)}${link("https://www.linkedin.com/in/gene-elpie-landoy-b1851b28b/", "in/gene-elpie-landoy")}`,
        `${pad("github", 10)}${link("https://github.com/PrimeSalad", "@PrimeSalad")}`,
        muted(`I usually reply within 1–2 days. Or run ${cmd("sudo hire gene")}`),
      ]),
    },
    recruiter: {
      about: "one-page recruiter view",
      run: () => print(["Opening the one-page view…"]).then(() => wait(220)).then(() => {
        dialog.close();
        openRecruiter();
      }),
    },
    resume: {
      about: "download my résumé",
      run: () => print(["Downloading CURRICULUM-VITAE-LANDOY.pdf…"]).then(() => {
        const anchor = Object.assign(document.createElement("a"), { href: "/CURRICULUM-VITAE-LANDOY.pdf", download: "" });
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
      }),
    },
    ask: {
      about: "ask anything about me",
      run: (args) => {
        const question = args.join(" ").trim();
        if (!question) return print([`usage: ask &lt;question&gt;  ${muted("e.g.")} ${cmd("ask what is unhooked")}`]);
        return print([escapeHtml(answer(question))]);
      },
    },
    goto: {
      about: "jump to a section",
      args: () => Object.keys(SECTIONS),
      run: (args) => {
        const id = SECTIONS[(args[0] || "").toLowerCase()];
        if (!id) return print([`goto: try one of ${Object.keys(SECTIONS).filter((key, i, all) => all.indexOf(key) === i).slice(0, 9).map((key) => cmd(`goto ${key}`, key)).join(" ")}`]);
        dialog.close();
        location.hash = id;
        window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth" }));
        return Promise.resolve();
      },
    },
    play: {
      about: "typing | runner | swipe",
      args: () => ["typing", "runner", "swipe"],
      run: (args) => {
        const selector = GAMES[(args[0] || "").toLowerCase()];
        if (!selector) return print([`play: ${cmd("play typing", "typing")} ${cmd("play runner", "runner")} ${cmd("play swipe", "swipe")}`]);
        dialog.close();
        $(selector)?.click();
        return Promise.resolve();
      },
    },
    theme: {
      about: "light | dark",
      args: () => ["light", "dark"],
      run: (args) => {
        const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
        const wanted = (args[0] || (current === "dark" ? "light" : "dark")).toLowerCase();
        if (!["light", "dark"].includes(wanted)) return print(["theme: light | dark"]);
        if (wanted !== current) $("[data-theme-toggle]")?.click();
        return print([`theme → ${wanted}`]);
      },
    },
    history: {
      about: "commands you ran",
      run: () => print(history.length ? history.map((entry, index) => `${muted(String(index + 1).padStart(3, " "))}  ${escapeHtml(entry)}`) : [muted("nothing yet")]),
    },
    date: { about: "time in the Philippines", run: () => print([`${new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", dateStyle: "full", timeStyle: "short" }).format(new Date())} ${muted("(PH)")}`]) },
    clear: { about: "clear the screen", run: () => { output.innerHTML = ""; return Promise.resolve(); } },
    exit: { about: "close the terminal", run: () => { dialog.close(); return Promise.resolve(); } },

    /* Easter eggs: not listed in help. */
    sudo: {
      hidden: true,
      run: (args) => {
        if (args.join(" ").toLowerCase() === "hire gene") {
          return print([`[sudo] password for recruiter: ${muted("••••••••")}`, strong("Permission granted."), "Opening a new email…"], 220).then(() => {
            window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Let's work together")}`;
          });
        }
        return print([`${escapeHtml(args.join(" ") || "sudo")}: you're not in the sudoers file. This incident will be reported.`]);
      },
    },
    rm: { hidden: true, run: () => print(["nice try. this portfolio is read-only 🙂"]) },
    ls: { hidden: true, run: () => print([["about.txt&nbsp;&nbsp;projects/&nbsp;&nbsp;stack.md&nbsp;&nbsp;resume.pdf&nbsp;&nbsp;contact.vcf"]]) },
    cat: { hidden: true, run: () => commands.about.run() },
    coffee: { hidden: true, run: () => print(["☕  brewing… done. back to shipping."]) },
    hello: { hidden: true, run: () => print(["hey 👋  type help to look around."]) },
    konami: { hidden: true, run: () => print([muted("↑ ↑ ↓ ↓ ← → ← → B A  — try it inside Byte runner.")]) },
  };
  commands.ll = commands.ls;
  commands.hi = commands.hello;

  /* ---------- input ---------- */
  const run = (raw) => {
    const text = raw.trim();
    line(`<span class="term-prompt">gene@portfolio ~ %</span> ${escapeHtml(text)}`, "term-echo");
    if (!text) return;
    history.push(text);
    historyIndex = history.length;
    const [name, ...args] = text.split(/\s+/);
    const command = commands[name.toLowerCase()];
    if (!command) {
      print([`zsh: command not found: ${escapeHtml(name)}. Type ${cmd("help")}`]);
      return;
    }
    command.run(args);
  };

  const complete = () => {
    const value = input.value;
    const parts = value.split(/\s+/);
    let options;
    if (parts.length <= 1) {
      options = Object.keys(commands).filter((name) => !commands[name].hidden && name.startsWith(parts[0].toLowerCase()));
      if (options.length === 1) input.value = `${options[0]} `;
    } else {
      const command = commands[parts[0].toLowerCase()];
      const pool = command?.args ? command.args() : [];
      const partial = parts.slice(1).join(" ").toLowerCase();
      options = pool.filter((option) => option.startsWith(partial));
      if (options.length === 1) input.value = `${parts[0]} ${options[0]}`;
    }
    if (options && options.length > 1) line(options.map((option) => muted(escapeHtml(option))).join("&nbsp;&nbsp;"));
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value;
    input.value = "";
    run(value);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      complete();
    } else if (event.key === "ArrowUp") {
      if (!history.length) return;
      event.preventDefault();
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex];
    } else if (event.key === "ArrowDown") {
      if (!history.length) return;
      event.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = history[historyIndex] || "";
    } else if (event.ctrlKey && event.key.toLowerCase() === "l") {
      event.preventDefault();
      output.innerHTML = "";
    } else if (event.ctrlKey && event.key.toLowerCase() === "c") {
      event.preventDefault();
      line(`<span class="term-prompt">gene@portfolio ~ %</span> ${escapeHtml(input.value)}^C`, "term-echo");
      input.value = "";
    }
  });

  /* Clicking a command name in the output runs it. */
  dialog.addEventListener("click", (event) => {
    const button = event.target.closest("[data-run]");
    if (button) {
      run(button.dataset.run);
      input.focus();
      return;
    }
    if (event.target === dialog) {
      dialog.close();
      return;
    }
    if (!event.target.closest("a, button") && !window.getSelection()?.toString()) input.focus();
  });

  /* ---------- open / close ---------- */
  const boot = () => {
    booted = true;
    const lastLogin = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date());
    print([
      muted(`Last login: ${lastLogin} on ttys001`),
      ["", ""],
      [escapeHtml(BANNER), "term-banner"],
      ["", ""],
      `Welcome to ${strong("elpielandoy.space")} ${muted("— portfolio shell v1.0")}`,
      `Type ${cmd("help")} to look around, or try ${cmd("projects")} ${cmd("whoami")} ${cmd("stack")}`,
      "",
    ], 45);
  };

  const open = () => {
    $$("dialog[open]").forEach((other) => { if (other !== dialog) other.close(); });
    if (!dialog.open) dialog.showModal();
    if (!booted) boot();
    window.requestAnimationFrame(() => input.focus());
  };

  $$("[data-open-terminal]").forEach((button) => button.addEventListener("click", open));
  $("[data-close-terminal]")?.addEventListener("click", () => dialog.close());

  document.addEventListener("keydown", (event) => {
    const typing = event.target.closest?.("input, textarea, [contenteditable='true']");
    if ((event.key === "`" || event.key === "~") && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      if (dialog.open) dialog.close();
      else open();
    }
  });
}
