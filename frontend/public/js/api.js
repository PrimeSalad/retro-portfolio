/**
 * File: js/api.js
 * Description: Data fetching and AI search for the portfolio.
 */

import { AI, promiseTimeout, toast } from "./utils.js";

export async function fetchPortfolioData() {
  try {
    const response = await fetch("/api/data");
    if (!response.ok) {
      throw new Error("Failed to fetch portfolio data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    toast("Error loading data");
    return null;
  }
}

export async function aiHealthCheck() {
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

export async function aiSearch(query) {
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

export async function submitContactForm(payload) {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.ok) {
    throw new Error(data?.error || "Send failed.");
  }

  return data;
}
