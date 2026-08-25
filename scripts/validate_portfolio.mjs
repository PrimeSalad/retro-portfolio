import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const url = process.argv[2] || "http://127.0.0.1:4173";
const port = 9235;
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const profilePath = join(tmpdir(), `codex-portfolio-validation-${port}`);
const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profilePath}`,
  "about:blank",
], { stdio: "ignore", windowsHide: true });

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

for (let attempt = 0; attempt < 40; attempt += 1) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/json/version`);
    if (response.ok) break;
  } catch {
    // Chrome is still starting.
  }
  await delay(200);
}

const targetResponse = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
const target = await targetResponse.json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let nextId = 0;

function call(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});

await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

async function evaluate(expression) {
  const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  return result.result.value;
}

try {
  await call("Page.enable");
  await call("Page.navigate", { url });
  await delay(3000);

  const initial = await evaluate(`(() => {
    const extras = [...document.querySelectorAll('.experience-item.is-extra')];
    const heatmap = document.querySelector('.github-heatmap-inner')?.getBoundingClientRect();
    const heatmapWrapper = document.querySelector('.github-heatmap-wrapper')?.getBoundingClientRect();
    return {
      toggleText: document.querySelector('#experienceToggle')?.textContent.trim(),
      expanded: document.querySelector('#experienceToggle')?.getAttribute('aria-expanded'),
      extraHidden: extras.every((item) => item.hidden && getComputedStyle(item).display === 'none'),
      visibleExperience: [...document.querySelectorAll('.experience-item')].filter((item) => getComputedStyle(item).display !== 'none').length,
      projectCount: document.querySelector('#projectCount')?.textContent,
      firstProject: document.querySelector('.project-card h3')?.textContent.trim(),
      flagship: document.querySelector('.project-card')?.classList.contains('is-flagship'),
      projectHeights: [...document.querySelectorAll('.project-card')].map((card) => Math.round(card.getBoundingClientRect().height)),
      accolades: [...document.querySelectorAll('.project-accolade span')].map((item) => item.textContent.trim()),
      flagshipWebsite: document.querySelector('.project-card.is-flagship .project-media')?.href,
      appStoreLink: document.querySelector('.project-card.is-flagship .project-app-store')?.href,
      appStoreBadge: document.querySelector('.project-card.is-flagship .project-app-store img')?.getAttribute('src'),
      credentialTotal: document.querySelector('#certTotal')?.textContent,
      credentialFilter: getComputedStyle(document.querySelector('.cert-document img')).filter,
      archiveFilter: getComputedStyle(document.querySelector('.archive-item img')).filter,
      heatmapCenterDelta: heatmap && heatmapWrapper ? Math.round(Math.abs((heatmap.left + heatmap.width / 2) - (heatmapWrapper.left + heatmapWrapper.width / 2))) : null,
      contributionColor: getComputedStyle(document.querySelector('.heatmap-legend i[data-level="4"]')).backgroundColor,
      runnerTriggerCount: document.querySelectorAll('[data-open-runner]').length,
      lydsDate: [...document.querySelectorAll('.experience-item')].find((item) => item.textContent.includes('Local Youth Development Section'))?.querySelector('.experience-date')?.textContent.trim(),
      lydsLink: [...document.querySelectorAll('.experience-item')].find((item) => item.textContent.includes('Local Youth Development Section'))?.querySelector('.experience-live-link')?.href,
      builderEmbeds: [...document.querySelectorAll('.builder-proof iframe')].map((frame) => frame.src),
    };
  })()`);

  await evaluate(`document.querySelector('.project-card')?.scrollIntoView({ block: 'center' })`);
  await delay(120);
  const firstProjectRect = await evaluate(`(() => {
    const rect = document.querySelector('.project-card')?.getBoundingClientRect();
    return rect ? { x: rect.left + rect.width / 2, y: rect.top + Math.min(rect.height / 3, 130) } : null;
  })()`);
  if (firstProjectRect) {
    await call("Input.dispatchMouseEvent", { type: "mouseMoved", x: firstProjectRect.x, y: firstProjectRect.y });
    await delay(320);
  }
  const projectHover = await evaluate(`(() => ({
    hovered: document.querySelector('.project-card')?.matches(':hover'),
    imageFilter: getComputedStyle(document.querySelector('.project-card .project-shot img')).filter,
    borderColor: getComputedStyle(document.querySelector('.project-card')).borderColor,
  }))()`);
  await evaluate(`document.querySelector('.project-card a')?.focus()`);
  await delay(320);
  const projectFocus = await evaluate(`(() => ({
    focusWithin: document.querySelector('.project-card')?.matches(':focus-within'),
    imageFilter: getComputedStyle(document.querySelector('.project-card .project-shot img')).filter,
    borderColor: getComputedStyle(document.querySelector('.project-card')).borderColor,
  }))()`);

  await evaluate(`document.querySelector('[data-open-typing]').click()`);
  await delay(180);
  await evaluate(`(() => {
    const input = document.querySelector('#typingInput');
    const prompt = document.querySelector('#typingPrompt').getAttribute('aria-label');
    input.value = 'x'.repeat(prompt.length);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
  })()`);
  await call("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  await call("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
  const typingWrong = await evaluate(`(() => ({
    open: document.querySelector('#typingDialog').open,
    disabled: document.querySelector('#typingInput').disabled,
    valueLength: document.querySelector('#typingInput').value.length,
    status: document.querySelector('#typingStatus').textContent,
    activeElement: document.activeElement?.id || document.activeElement?.className,
    incorrectCharacters: document.querySelectorAll('#typingPrompt .is-incorrect').length,
  }))()`);
  await evaluate(`(() => {
    document.querySelector('#typingRestart').click();
    const input = document.querySelector('#typingInput');
    input.value = document.querySelector('#typingPrompt').getAttribute('aria-label');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  const typingComplete = await evaluate(`(() => ({
    disabled: document.querySelector('#typingInput').disabled,
    completeClass: document.querySelector('#typingInput').classList.contains('is-complete'),
    status: document.querySelector('#typingStatus').textContent,
    progress: document.querySelector('#typingProgress').style.transform,
  }))()`);
  await evaluate(`document.querySelector('[data-close-typing]').click()`);

  await evaluate(`document.querySelector('[data-open-runner]').click()`);
  await delay(250);
  const runnerReady = await evaluate(`(() => {
    const dialog = document.querySelector('#runnerDialog');
    const canvas = document.querySelector('#runnerCanvas').getBoundingClientRect();
    const jump = document.querySelector('#runnerJump').getBoundingClientRect();
    return {
      open: dialog.open,
      state: document.querySelector('#runnerStage').dataset.state,
      canvas: { width: Math.round(canvas.width), height: Math.round(canvas.height) },
      jumpHeight: Math.round(jump.height),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  })()`);

  await evaluate(`document.querySelector('#runnerStart').click()`);
  await delay(650);
  const runnerRunning = await evaluate(`(() => ({
    state: document.querySelector('#runnerStage').dataset.state,
    score: document.querySelector('#runnerScore').textContent,
    startDisabled: document.querySelector('#runnerStart').disabled,
    overlayHidden: document.querySelector('#runnerOverlay').hidden,
  }))()`);

  await evaluate(`document.querySelector('#runnerJump').click()`);
  await delay(40);
  const runnerJump = await evaluate(`document.querySelector('#runnerStage').dataset.state`);
  await evaluate(`document.querySelector('[data-close-runner]').click()`);

  await evaluate(`document.querySelector('#experienceToggle').click()`);
  await delay(250);
  const expanded = await evaluate(`(() => ({
    toggleText: document.querySelector('#experienceToggle').textContent.trim(),
    expanded: document.querySelector('#experienceToggle').getAttribute('aria-expanded'),
    visibleExperience: [...document.querySelectorAll('.experience-item')].filter((item) => getComputedStyle(item).display !== 'none').length,
    extrasVisible: [...document.querySelectorAll('.experience-item.is-extra')].every((item) => !item.hidden && getComputedStyle(item).display !== 'none'),
  }))()`);

  await evaluate(`document.querySelector('#experienceToggle').click()`);
  await delay(250);
  const collapsed = await evaluate(`(() => ({
    toggleText: document.querySelector('#experienceToggle').textContent.trim(),
    expanded: document.querySelector('#experienceToggle').getAttribute('aria-expanded'),
    visibleExperience: [...document.querySelectorAll('.experience-item')].filter((item) => getComputedStyle(item).display !== 'none').length,
  }))()`);

  await call("Emulation.setDeviceMetricsOverride", {
    width: 375,
    height: 812,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await call("Page.navigate", { url });
  await delay(1800);
  await evaluate(`document.querySelector('#menuToggle').click(); document.querySelector('.mobile-menu [data-open-runner]').click()`);
  await delay(300);
  const mobileRunner = await evaluate(`(() => {
    const dialog = document.querySelector('#runnerDialog').getBoundingClientRect();
    const canvas = document.querySelector('#runnerCanvas').getBoundingClientRect();
    const jump = document.querySelector('#runnerJump').getBoundingClientRect();
    return {
      viewport: [innerWidth, innerHeight],
      dialog: { left: Math.round(dialog.left), right: Math.round(dialog.right), width: Math.round(dialog.width), height: Math.round(dialog.height) },
      canvas: { width: Math.round(canvas.width), height: Math.round(canvas.height) },
      jumpHeight: Math.round(jump.height),
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      runnerOpen: document.querySelector('#runnerDialog').open,
    };
  })()`);

  process.stdout.write(`${JSON.stringify({ initial, projectHover, projectFocus, typingWrong, typingComplete, runnerReady, runnerRunning, runnerJump, expanded, collapsed, mobileRunner }, null, 2)}\n`);
} finally {
  socket.close();
  chrome.kill();
}
