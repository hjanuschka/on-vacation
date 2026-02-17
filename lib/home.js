export function renderHomePage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>on-vacation -- OSS Vacation Status</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --bg: #121212;
      --bg-light: #1e1e1e;
      --bg-lighter: #333333;
      --text: #bebebe;
      --text-dim: #8a8a8d;
      --accent: #FFC107;
      --accent-dim: #e68e0d;
      --border: #333333;
      --orange: #D35F5F;
    }

    body {
      font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      font-size: 14px;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .container { max-width: 700px; padding: 2rem; }

    .hero { text-align: center; margin-bottom: 2.5rem; }
    .hero h1 {
      font-size: 2.5rem;
      color: var(--accent);
      margin-bottom: 0.5rem;
      text-shadow: 0 0 10px rgba(255, 193, 7, 0.3);
    }
    .subtitle { color: var(--text-dim); font-size: 1rem; }

    /* Terminal Window */
    .terminal-window {
      background: var(--bg);
      border: 3px solid var(--accent);
      border-radius: 12px;
      box-shadow: 0 0 20px rgba(255, 193, 7, 0.15);
      margin-bottom: 1.5rem;
    }
    .terminal-header {
      background: var(--accent);
      color: var(--bg);
      padding: 10px 20px;
      font-weight: bold;
      font-size: 13px;
      border-radius: 9px 9px 0 0;
    }
    .terminal-content { padding: 20px; }

    /* ASCII Box */
    .ascii-box {
      border: 2px solid var(--border);
      border-radius: 8px;
      background: var(--bg-light);
      margin-bottom: 1.5rem;
    }
    .ascii-box-header {
      background: var(--border);
      color: var(--text);
      padding: 8px 16px;
      font-weight: bold;
      font-size: 12px;
      border-radius: 6px 6px 0 0;
    }
    .ascii-box-content { padding: 16px; }

    .step { margin-bottom: 0.75rem; display: flex; align-items: baseline; gap: 0.5rem; }
    .step-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px; height: 22px;
      background: var(--accent);
      color: var(--bg);
      border-radius: 50%;
      font-size: 0.75rem;
      font-weight: bold;
      flex-shrink: 0;
    }

    code {
      background: var(--bg);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
      color: var(--accent);
      font-family: inherit;
    }
    pre {
      background: var(--bg);
      border: 1px solid var(--border);
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 0.8rem;
      line-height: 1.5;
      margin: 0.5rem 0;
    }
    pre code { padding: 0; background: none; color: var(--text); }

    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }

    .badge-demo {
      margin-top: 12px;
      display: flex;
      gap: 12px;
      align-items: center;
    }

    p { margin-bottom: 0.5rem; }
    .section-label {
      font-size: 0.75rem;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 0.5rem;
    }

    .footer {
      text-align: center;
      color: var(--text-dim);
      font-size: 0.8rem;
      margin-top: 0.5rem;
    }
    .footer a { color: var(--text-dim); }
    .footer a:hover { color: var(--accent); }

    /* Tabs / Chips */
    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .tab {
      padding: 6px 14px;
      border: 2px solid var(--border);
      border-radius: 20px;
      background: var(--bg);
      color: var(--text-dim);
      font-family: inherit;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.15s;
      user-select: none;
    }
    .tab:hover {
      border-color: var(--accent);
      color: var(--text);
    }
    .tab.active {
      background: var(--accent);
      color: var(--bg);
      border-color: var(--accent);
      font-weight: bold;
    }
    .tab-panel {
      display: none;
    }
    .tab-panel.active {
      display: block;
    }

    .note {
      background: var(--bg);
      border: 1px solid var(--border);
      border-left: 3px solid var(--accent);
      border-radius: 4px;
      padding: 10px 14px;
      font-size: 0.85rem;
      color: var(--text-dim);
      margin-top: 12px;
    }
    .note code {
      font-size: 0.85em;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <h1>🏖️ on-vacation</h1>
      <p class="subtitle">Let the world know when your OSS project is taking a break</p>
    </div>

    <div class="terminal-window">
      <div class="terminal-header">~ how it works</div>
      <div class="terminal-content">
        <div class="step">
          <span class="step-num">1</span>
          <span>Start your <code>README.md</code> with <code># 🏖️</code> and a reopen date -- that's it</span>
        </div>
        <div class="step">
          <span class="step-num">2</span>
          <span>Share <code>vacation.januschka.com/:owner/:repo</code></span>
        </div>
        <p style="margin-top: 12px; color: var(--text-dim); font-size: 0.85rem;">
          Want recurring schedules or custom links? Add a <code>VACATION.md</code> with a <code>&#96;&#96;&#96;vacajson</code> block.
        </p>
      </div>
    </div>

    <div class="ascii-box">
      <div class="ascii-box-header">// schedule format</div>
      <div class="ascii-box-content">
        <div class="tabs">
          <button class="tab active" onclick="switchTab(event, 'tab-readme')">README.md</button>
          <button class="tab" onclick="switchTab(event, 'tab-full')">VACATION.md</button>
          <button class="tab" onclick="switchTab(event, 'tab-daterange')">Date Range</button>
          <button class="tab" onclick="switchTab(event, 'tab-weekly')">Weekly</button>
          <button class="tab" onclick="switchTab(event, 'tab-daily')">Daily</button>
          <button class="tab" onclick="switchTab(event, 'tab-mixed')">Mixed</button>
        </div>

        <div id="tab-readme" class="tab-panel active">
          <p>Zero setup -- just start your README.md with a vacation header:</p>
          <pre><code># 🏖️ OSS Vacation

**Issue tracker and PRs reopen February 23, 2026.**

All PRs will be auto-closed until then.
For support, join [Discord](https://discord.gg/...).

---

(rest of your README below the separator)</code></pre>
          <div class="note">
            That's it. We detect the 🏖️ heading, parse the date, and extract any links automatically. No special files or config needed.
          </div>
        </div>

        <div id="tab-daterange" class="tab-panel">
          <p>One-off or multi-day breaks:</p>
          <pre><code>{
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
}</code></pre>
        </div>

        <div id="tab-weekly" class="tab-panel">
          <p>Automatically active every week (e.g. weekends off):</p>
          <pre><code>{
  "vacations": [
    {
      "recurring": "weekly",
      "from": "fri 18:00",
      "to": "sun 23:59",
      "timezone": "Europe/Vienna",
      "title": "Weekend Break",
      "message": "We're off for the weekend."
    }
  ]
}</code></pre>
          <p style="margin-top: 8px; font-size: 0.85rem; color: var(--text-dim);">
            Supports: <code>mon</code> <code>tue</code> <code>wed</code> <code>thu</code> <code>fri</code> <code>sat</code> <code>sun</code>
            or German: <code>mo</code> <code>di</code> <code>mi</code> <code>do</code> <code>fr</code> <code>sa</code> <code>so</code>
          </p>
        </div>

        <div id="tab-daily" class="tab-panel">
          <p>After-hours mode, active every day:</p>
          <pre><code>{
  "vacations": [
    {
      "recurring": "daily",
      "from": "18:00",
      "to": "09:00",
      "timezone": "America/New_York",
      "title": "After Hours",
      "message": "We respond during business hours."
    }
  ]
}</code></pre>
          <p style="margin-top: 8px; font-size: 0.85rem; color: var(--text-dim);">
            Overnight windows work naturally -- <code>18:00</code> to <code>09:00</code> means 6pm to 9am.
          </p>
        </div>

        <div id="tab-mixed" class="tab-panel">
          <p>Combine date ranges and recurring schedules:</p>
          <pre><code>{
  "vacations": [
    {
      "start": "2026-12-23",
      "end": "2027-01-02",
      "title": "Holiday Break"
    },
    {
      "recurring": "weekly",
      "from": "fri 18:00",
      "to": "sun 23:59",
      "timezone": "Europe/Vienna",
      "title": "Weekend"
    }
  ]
}</code></pre>
          <p style="margin-top: 8px; font-size: 0.85rem; color: var(--text-dim);">
            First matching entry wins -- holiday breaks take precedence.
          </p>
        </div>

        <div id="tab-full" class="tab-panel">
          <p>A complete <code>VACATION.md</code> file for your repo:</p>
          <pre><code># 🏖️ OSS Vacation

We're taking a break! Issue tracker and PRs
reopen February 23, 2026.

All PRs will be auto-closed until then.
Approved contributors can submit PRs after
vacation without reapproval.

For support, join our Discord.

&#96;&#96;&#96;vacajson
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
&#96;&#96;&#96;</code></pre>
          <div class="note">
            Use <code>&#96;&#96;&#96;vacajson</code> instead of <code>&#96;&#96;&#96;json</code> so the schedule block doesn't clash with regular JSON examples in your markdown. GitHub renders it as a plain code block.
          </div>
        </div>
      </div>
    </div>

    <div class="ascii-box">
      <div class="ascii-box-header">// json api</div>
      <div class="ascii-box-content">
        <p>Set <code>Accept: application/json</code> for machine-readable responses:</p>
        <pre><code>curl -H "Accept: application/json" \\
  https://vacation.januschka.com/badlogic/pi-mono</code></pre>
      </div>
    </div>

    <div class="ascii-box">
      <div class="ascii-box-header">// badge</div>
      <div class="ascii-box-content">
        <p>Add to your README:</p>
        <pre><code>[![Vacation](https://vacation.januschka.com/OWNER/REPO/badge.svg)](https://vacation.januschka.com/OWNER/REPO)</code></pre>
        <div class="badge-demo">
          <span class="section-label" style="margin: 0;">Preview:</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="122" height="20">
            <linearGradient id="b1" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
            <clipPath id="a1"><rect width="122" height="20" rx="3" fill="#fff"/></clipPath>
            <g clip-path="url(#a1)"><rect width="68" height="20" fill="#555"/><rect x="68" width="54" height="20" fill="#2ecc71"/><rect width="122" height="20" fill="url(#b1)"/></g>
            <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,sans-serif" font-size="11"><text x="34" y="15" fill="#010101" fill-opacity=".3">Vacation</text><text x="34" y="14">Vacation</text><text x="95" y="15" fill="#010101" fill-opacity=".3">active</text><text x="95" y="14">active</text></g>
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="131" height="20">
            <linearGradient id="b2" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
            <clipPath id="a2"><rect width="131" height="20" rx="3" fill="#fff"/></clipPath>
            <g clip-path="url(#a2)"><rect width="68" height="20" fill="#555"/><rect x="68" width="63" height="20" fill="#e67e22"/><rect width="131" height="20" fill="url(#b2)"/></g>
            <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,sans-serif" font-size="11"><text x="34" y="15" fill="#010101" fill-opacity=".3">Vacation</text><text x="34" y="14">Vacation</text><text x="99" y="15" fill="#010101" fill-opacity=".3">inactive</text><text x="99" y="14">inactive</text></g>
          </svg>
        </div>
      </div>
    </div>

    <p class="footer">
      <a href="https://github.com/hjanuschka/on-vacation">Source on GitHub</a>
    </p>
  </div>

  <script>
    function switchTab(e, tabId) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      document.getElementById(tabId).classList.add('active');
    }
  </script>
</body>
</html>`;
}
