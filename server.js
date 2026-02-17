import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cache } from "./lib/cache.js";
import { fetchVacationMd, parseVacationSchedule } from "./lib/vacation.js";
import { renderPage } from "./lib/render.js";

const app = new Hono();

// Health check
app.get("/healthz", (c) => c.json({ ok: true }));

// Homepage - explain the service
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

// Main route: /:owner/:repo
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
      if (wantsJson) {
        return c.json({ error: msg, on_vacation: false }, 404);
      }
      return c.html(renderPage({ owner, repo, error: msg }), 404);
    }

    const now = new Date();
    const active = data.vacations.find((v) => {
      const start = new Date(v.start + "T00:00:00Z");
      const end = new Date(v.end + "T23:59:59Z");
      return now >= start && now <= end;
    });

    const upcoming = data.vacations
      .filter((v) => new Date(v.start + "T00:00:00Z") > now)
      .sort((a, b) => new Date(a.start) - new Date(b.start))[0];

    const result = {
      owner,
      repo,
      on_vacation: !!active,
      current: active || null,
      upcoming: upcoming || null,
      vacations: data.vacations,
    };

    if (wantsJson) {
      return c.json(result);
    }

    return c.html(renderPage(result));
  } catch (err) {
    console.error(`Error fetching ${key}:`, err.message);
    const msg = `Error fetching vacation status for ${owner}/${repo}`;
    if (wantsJson) {
      return c.json({ error: msg }, 500);
    }
    return c.html(renderPage({ owner, repo, error: msg }), 500);
  }
});

// Badge endpoint (SVG)
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
    const active =
      data &&
      data.vacations.find((v) => {
        const start = new Date(v.start + "T00:00:00Z");
        const end = new Date(v.end + "T23:59:59Z");
        return now >= start && now <= end;
      });

    const label = "vacation";
    const status = active ? "on vacation" : "available";
    const color = active ? "#e67e22" : "#2ecc71";

    const svg = renderBadge(label, status, color);
    c.header("Content-Type", "image/svg+xml");
    c.header("Cache-Control", "public, max-age=300");
    return c.body(svg);
  } catch {
    const svg = renderBadge("vacation", "unknown", "#95a5a6");
    c.header("Content-Type", "image/svg+xml");
    return c.body(svg);
  }
});

function renderBadge(label, status, color) {
  const labelWidth = label.length * 7 + 12;
  const statusWidth = status.length * 7 + 12;
  const totalWidth = labelWidth + statusWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="a">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#a)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${statusWidth}" height="20" fill="${color}"/>
    <rect width="${totalWidth}" height="20" fill="url(#b)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${labelWidth / 2}" y="14">${label}</text>
    <text x="${labelWidth + statusWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${status}</text>
    <text x="${labelWidth + statusWidth / 2}" y="14">${status}</text>
  </g>
</svg>`;
}

function renderHomePage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>on-vacation -- OSS Vacation Status</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0d1117;
      color: #e6edf3;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container { max-width: 680px; padding: 2rem; text-align: center; }
    h1 { font-size: 3rem; margin-bottom: 0.5rem; }
    .subtitle { color: #8b949e; font-size: 1.2rem; margin-bottom: 2rem; }
    .card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      padding: 2rem;
      text-align: left;
      margin-bottom: 1.5rem;
    }
    .card h2 { font-size: 1.1rem; color: #58a6ff; margin-bottom: 1rem; }
    code {
      background: #0d1117;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
      color: #f0883e;
    }
    pre {
      background: #0d1117;
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      margin: 0.75rem 0;
      font-size: 0.85rem;
      line-height: 1.5;
    }
    pre code { padding: 0; background: none; color: #e6edf3; }
    a { color: #58a6ff; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .step { margin-bottom: 0.75rem; }
    .step-num {
      display: inline-block;
      width: 24px; height: 24px;
      background: #58a6ff;
      color: #0d1117;
      border-radius: 50%;
      text-align: center;
      line-height: 24px;
      font-size: 0.8rem;
      font-weight: bold;
      margin-right: 0.5rem;
    }
    .badge-row { margin-top: 1rem; }
    .badge-row img { vertical-align: middle; }
    .footer { color: #484f58; font-size: 0.85rem; margin-top: 2rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🏖️ on-vacation</h1>
    <p class="subtitle">Let the world know when your OSS project is taking a break</p>

    <div class="card">
      <h2>How it works</h2>
      <div class="step">
        <span class="step-num">1</span>
        Add a <code>VACATION.md</code> to your repo root with a JSON schedule
      </div>
      <div class="step">
        <span class="step-num">2</span>
        Share <code>vacation.januschka.com/:owner/:repo</code>
      </div>
      <div class="step">
        <span class="step-num">3</span>
        Visitors see a live vacation status page
      </div>
    </div>

    <div class="card">
      <h2>VACATION.md format</h2>
      <pre><code># 🏖️ OSS Vacation

We're taking a break!

\`\`\`json
{
  "vacations": [
    {
      "start": "2026-02-10",
      "end": "2026-02-23",
      "title": "Winter Break 2026",
      "message": "PRs reopen Feb 23.",
      "links": {
        "discord": "https://discord.gg/..."
      }
    }
  ]
}
\`\`\`</code></pre>
    </div>

    <div class="card">
      <h2>JSON API</h2>
      <p>Set <code>Accept: application/json</code> to get machine-readable responses:</p>
      <pre><code>curl -H "Accept: application/json" \\
  https://vacation.januschka.com/badlogic/pi-mono</code></pre>
    </div>

    <div class="card">
      <h2>Badge</h2>
      <p>Add a badge to your README:</p>
      <pre><code>![Vacation Status](https://vacation.januschka.com/:owner/:repo/badge.svg)</code></pre>
    </div>

    <p class="footer">
      <a href="https://github.com/januschka/on-vacation">Source on GitHub</a>
    </p>
  </div>
</body>
</html>`;
}

const port = parseInt(process.env.PORT || "3000", 10);
serve({ fetch: app.fetch, port }, () => {
  console.log(`on-vacation listening on http://localhost:${port}`);
});
