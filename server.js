import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cache } from "./lib/cache.js";
import { fetchVacationMd, parseVacationSchedule, findActiveVacation, findUpcomingVacation } from "./lib/vacation.js";
import { renderPage } from "./lib/render.js";
import { renderHomePage } from "./lib/home.js";
import { renderBadge } from "./lib/badge.js";

const app = new Hono();

app.get("/healthz", (c) => c.json({ ok: true }));

app.get("/", (c) => {
  const accept = c.req.header("accept") || "";
  if (accept.includes("application/json")) {
    return c.json({
      service: "on-vacation",
      usage: "GET /:owner/:repo to check if a project is on vacation",
      spec: "Add a VACATION.md with a JSON schedule block to your repo root",
      example: "https://vacation.januschka.com/badlogic/pi-mono",
    });
  }
  return c.html(renderHomePage());
});

app.get("/:owner/:repo/badge.svg", async (c) => {
  const { owner, repo } = c.req.param();
  const key = `${owner}/${repo}`;

  try {
    const data = await cache.getOrFetch(key, async () => {
      const md = await fetchVacationMd(owner, repo);
      if (!md) return null;
      return parseVacationSchedule(md);
    });

    const now = new Date();
    const active = data ? findActiveVacation(data.vacations, now) : null;
    const status = active ? "on vacation" : "available";
    const color = active ? "#e67e22" : "#2ecc71";

    const svg = renderBadge("vacation", status, color);
    c.header("Content-Type", "image/svg+xml");
    c.header("Cache-Control", "public, max-age=300");
    return c.body(svg);
  } catch {
    const svg = renderBadge("vacation", "unknown", "#95a5a6");
    c.header("Content-Type", "image/svg+xml");
    return c.body(svg);
  }
});

app.get("/:owner/:repo", async (c) => {
  const { owner, repo } = c.req.param();
  const key = `${owner}/${repo}`;
  const accept = c.req.header("accept") || "";
  const wantsJson = accept.includes("application/json");

  try {
    const data = await cache.getOrFetch(key, async () => {
      const md = await fetchVacationMd(owner, repo);
      if (!md) return null;
      return parseVacationSchedule(md);
    });

    if (!data) {
      const msg = `No VACATION.md found in ${owner}/${repo}`;
      if (wantsJson) return c.json({ error: msg, on_vacation: false }, 404);
      return c.html(renderPage({ owner, repo, error: msg }), 404);
    }

    const now = new Date();
    const active = findActiveVacation(data.vacations, now);
    const upcoming = findUpcomingVacation(data.vacations, now);

    const result = {
      owner,
      repo,
      on_vacation: !!active,
      current: active || null,
      upcoming: upcoming || null,
      vacations: data.vacations,
    };

    if (wantsJson) return c.json(result);
    return c.html(renderPage(result));
  } catch (err) {
    console.error(`Error fetching ${key}:`, err.message);
    const msg = `Error fetching vacation status for ${owner}/${repo}`;
    if (wantsJson) return c.json({ error: msg }, 500);
    return c.html(renderPage({ owner, repo, error: msg }), 500);
  }
});

const port = parseInt(process.env.PORT || "3000", 10);
serve({ fetch: app.fetch, port }, () => {
  console.log(`on-vacation listening on http://localhost:${port}`);
});
