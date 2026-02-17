export function renderHomePage() {
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
      <a href="https://github.com/hjanuschka/oss-vacation">Source on GitHub</a>
    </p>
  </div>
</body>
</html>`;
}
