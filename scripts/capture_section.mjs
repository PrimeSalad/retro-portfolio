import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [url, selector, outputPath, widthArg = "1440", heightArg = "1000", portArg = "9230", openSelector = ""] = process.argv.slice(2);
const width = Number(widthArg);
const height = Number(heightArg);
const port = Number(portArg);
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const profilePath = join(tmpdir(), `codex-section-capture-${port}`);

if (!url || !selector || !outputPath) {
  throw new Error("Usage: node capture_section.mjs <url> <selector> <output> [width] [height] [port]");
}

const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--no-first-run",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profilePath}`,
  "about:blank",
], { stdio: "ignore", windowsHide: true });

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForDebugger() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return;
    } catch {
      // Chrome needs a moment to expose the debugging endpoint.
    }
    await delay(200);
  }
  throw new Error("Chrome debugging endpoint did not start.");
}

await waitForDebugger();

const targetResponse = await fetch(
  `http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`,
  { method: "PUT" },
);
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

try {
  await call("Page.enable");
  await call("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width <= 480,
  });
  await call("Page.navigate", { url });
  await delay(3500);
  if (openSelector) {
    await call("Runtime.evaluate", {
      expression: `document.querySelector(${JSON.stringify(openSelector)})?.click();`,
    });
    await delay(450);
  }
  await call("Runtime.evaluate", {
    expression: `document.documentElement.style.scrollBehavior = "auto"; document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({ block: "start" });`,
  });
  await delay(800);
  const screenshot = await call("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  writeFileSync(outputPath, Buffer.from(screenshot.data, "base64"));
  process.stdout.write(`${outputPath}\n`);
} finally {
  socket.close();
  chrome.kill();
}
