/**
 * Render the vacation status page HTML.
 * Styled to match januschka.com matte black theme.
 */
export function renderPage(data) {
  const { owner, repo, on_vacation, current, upcoming, error } = data;
  const repoUrl = `https://github.com/${owner}/${repo}`;

  let statusHtml;

  if (error) {
    statusHtml = `
      <div class="terminal-window">
        <div class="terminal-header">
          <span>~ vacation status</span>
          <span>unknown</span>
        </div>
        <div class="terminal-content">
          <div class="status-emoji">🤷</div>
          <div class="status-label" style="color: var(--text-dim);">Unknown</div>
          <p class="status-message">${escapeHtml(error)}</p>
          <p class="status-hint">Make sure the repo has a <code>VACATION.md</code> with a JSON schedule block.</p>
        </div>
      </div>`;
  } else if (on_vacation) {
    const endDate = formatDate(current.end);
    const hasEnd = !!current.end;
    statusHtml = `
      <div class="terminal-window vacation">
        <div class="terminal-header">
          <span>~ vacation status</span>
          <span>ON VACATION</span>
        </div>
        <div class="terminal-content">
          <div class="status-emoji">🏖️</div>
          <div class="status-label" style="color: var(--accent);">On Vacation</div>
          ${current.title ? `<div class="vacation-title">${escapeHtml(current.title)}</div>` : ""}
          <p class="status-message">${escapeHtml(current.message || (hasEnd ? `This project is on vacation until ${endDate}.` : "This project is currently on vacation."))}</p>
          ${hasEnd ? `<div class="date-range">
            <span class="date">${formatDate(current.start)}</span>
            <span class="date-arrow">-></span>
            <span class="date">${endDate}</span>
          </div>
          ${renderCountdown(current.end)}` : ""}
          ${renderLinks(current.links)}
        </div>
      </div>`;
  } else {
    statusHtml = `
      <div class="terminal-window active">
        <div class="terminal-header">
          <span>~ vacation status</span>
          <span>AVAILABLE</span>
        </div>
        <div class="terminal-content">
          <div class="status-emoji">✅</div>
          <div class="status-label" style="color: #4caf50;">Open for Business</div>
          <p class="status-message">This project is currently accepting issues and pull requests.</p>
          ${upcoming ? renderUpcoming(upcoming) : ""}
        </div>
      </div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${on_vacation ? "On Vacation" : "Available"} -- ${owner}/${repo}</title>
  <meta property="og:title" content="${owner}/${repo} -- ${on_vacation ? "On Vacation" : "Available"}">
  <meta property="og:description" content="${on_vacation && current ? escapeHtml(current.message || "") : `${owner}/${repo} is open for contributions`}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
  ${cssBlock()}
</head>
<body>
  <div class="container">
    <div class="repo-header">
      <a href="${repoUrl}" class="repo-link">
        <svg class="gh-icon" viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
          <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/>
        </svg>
        ${escapeHtml(owner)}/<span class="repo-name">${escapeHtml(repo)}</span>
      </a>
    </div>
    ${statusHtml}

    <div class="ascii-box">
      <div class="ascii-box-header">// badge</div>
      <div class="ascii-box-content">
        <p style="margin-bottom: 12px;">Add to your README:</p>
        <pre><code>[![Vacation Status](https://vacation.januschka.com/${escapeHtml(owner)}/${escapeHtml(repo)}/badge.svg)](https://vacation.januschka.com/${escapeHtml(owner)}/${escapeHtml(repo)})</code></pre>
        <div class="badge-preview">
          <img src="/${escapeHtml(owner)}/${escapeHtml(repo)}/badge.svg" alt="Vacation badge">
        </div>
      </div>
    </div>

    <div class="ascii-box">
      <div class="ascii-box-header">// json api</div>
      <div class="ascii-box-content">
        <pre><code>curl -H "Accept: application/json" \\
  https://vacation.januschka.com/${escapeHtml(owner)}/${escapeHtml(repo)}</code></pre>
      </div>
    </div>

    <p class="footer">
      Powered by <a href="https://vacation.januschka.com">on-vacation</a> | <a href="https://github.com/hjanuschka/oss-vacation">Source</a>
    </p>
  </div>
  ${on_vacation && data.current.end ? countdownScript(data.current.end) : ""}
</body>
</html>`;
}

function cssBlock() {
  return `<style>
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

    .container {
      max-width: 620px;
      width: 100%;
      padding: 2rem;
    }

    .repo-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .repo-link {
      color: var(--text-dim);
      text-decoration: none;
      font-size: 1.3rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .repo-link:hover { color: var(--accent); }
    .repo-name { color: var(--accent); font-weight: 700; }
    .gh-icon { flex-shrink: 0; opacity: 0.7; }
    .repo-link:hover .gh-icon { opacity: 1; }

    /* Terminal Window - matching januschka.com */
    .terminal-window {
      background: var(--bg);
      border: 3px solid var(--accent);
      border-radius: 12px;
      box-shadow: 0 0 20px rgba(255, 193, 7, 0.15);
      margin-bottom: 1.5rem;
    }
    .terminal-window.vacation {
      border-color: var(--orange);
      box-shadow: 0 0 20px rgba(211, 95, 95, 0.15);
    }
    .terminal-window.active {
      border-color: #4caf50;
      box-shadow: 0 0 20px rgba(76, 175, 80, 0.15);
    }

    .terminal-header {
      background: var(--accent);
      color: var(--bg);
      padding: 10px 20px;
      font-weight: bold;
      font-size: 13px;
      border-radius: 9px 9px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .terminal-window.vacation .terminal-header { background: var(--orange); color: #fff; }
    .terminal-window.active .terminal-header { background: #4caf50; color: #fff; }

    .terminal-content {
      padding: 2rem;
      text-align: center;
    }

    .status-emoji { font-size: 3.5rem; margin-bottom: 0.75rem; }
    .status-label {
      font-size: 1.6rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .vacation-title {
      font-size: 0.9rem;
      color: var(--text-dim);
      margin-bottom: 0.75rem;
      font-style: italic;
    }
    .status-message {
      color: var(--text);
      font-size: 0.95rem;
      line-height: 1.7;
      margin-bottom: 1.25rem;
    }
    .status-hint {
      color: var(--text-dim);
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }
    .status-hint code {
      background: var(--bg-lighter);
      padding: 2px 6px;
      border-radius: 4px;
      color: var(--accent);
    }

    .date-range {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .date {
      background: var(--bg-light);
      border: 1px solid var(--border);
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.9rem;
      color: var(--text);
    }
    .date-arrow { color: var(--text-dim); }

    .countdown {
      background: var(--bg-light);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.25rem;
    }
    .countdown-label {
      font-size: 0.75rem;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 0.4rem;
    }
    .countdown-value {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--accent);
    }

    .links {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    .links a {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 1rem;
      background: var(--bg-light);
      border: 2px solid var(--border);
      border-radius: 6px;
      color: var(--accent);
      text-decoration: none;
      font-size: 0.85rem;
      transition: border-color 0.2s;
    }
    .links a:hover { border-color: var(--accent); }

    .upcoming {
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border);
    }
    .upcoming-label {
      font-size: 0.75rem;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 0.4rem;
    }
    .upcoming-info {
      color: var(--text);
      font-size: 0.9rem;
    }

    /* ASCII Box - matching januschka.com */
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
    .ascii-box-content {
      padding: 16px;
    }

    pre {
      background: var(--bg);
      border: 1px solid var(--border);
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 0.8rem;
      line-height: 1.5;
    }
    code {
      font-family: inherit;
      color: var(--text);
    }

    .badge-preview {
      margin-top: 12px;
      padding: 12px;
      background: var(--bg);
      border-radius: 6px;
      text-align: center;
    }
    .badge-preview img { vertical-align: middle; }

    .footer {
      text-align: center;
      color: var(--text-dim);
      font-size: 0.8rem;
      margin-top: 0.5rem;
    }
    .footer a { color: var(--text-dim); text-decoration: none; }
    .footer a:hover { color: var(--accent); }

    @media (max-width: 500px) {
      .date-range { flex-direction: column; gap: 0.4rem; }
      .status-emoji { font-size: 2.5rem; }
      .status-label { font-size: 1.3rem; }
    }
  </style>`;
}

function renderCountdown(endDate) {
  return `
    <div class="countdown">
      <div class="countdown-label">Returns in</div>
      <div class="countdown-value" id="countdown">--</div>
    </div>`;
}

function countdownScript(endDate) {
  return `<script>
(function() {
  const end = new Date("${endDate}T23:59:59Z");
  const el = document.getElementById("countdown");
  function update() {
    const now = new Date();
    const diff = end - now;
    if (diff <= 0) { el.textContent = "Back now!"; return; }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const parts = [];
    if (days > 0) parts.push(days + "d");
    if (hours > 0) parts.push(hours + "h");
    parts.push(mins + "m");
    el.textContent = parts.join(" ");
  }
  update();
  setInterval(update, 60000);
})();
</script>`;
}

function renderLinks(links) {
  if (!links || Object.keys(links).length === 0) return "";

  // Built-in emoji for common link names
  const iconMap = {
    discord: "💬",
    website: "🌐",
    twitter: "🐦",
    mastodon: "🐘",
    email: "📧",
    blog: "📝",
    github: "🐙",
    slack: "💬",
    matrix: "🟩",
    forum: "💬",
    docs: "📖",
    donate: "💝",
    sponsor: "💜",
  };

  // Key format: "name" uses built-in emoji, or "emoji:Label" for custom
  // Examples:
  //   "discord": "https://..."          -> 💬 Discord
  //   "🎮:Game Server": "https://..."   -> 🎮 Game Server
  //   "☕:Buy me a coffee": "https://..." -> ☕ Buy me a coffee
  const items = Object.entries(links)
    .map(([name, url]) => {
      let icon, label;
      const colonIdx = name.indexOf(":");
      // Check if starts with an emoji (non-ASCII) followed by colon
      if (colonIdx > 0 && /[^\x00-\x7F]/.test(name.slice(0, colonIdx))) {
        icon = name.slice(0, colonIdx).trim();
        label = name.slice(colonIdx + 1).trim();
      } else {
        icon = iconMap[name.toLowerCase()] || "🔗";
        label = name.charAt(0).toUpperCase() + name.slice(1);
      }
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${icon} ${escapeHtml(label)}</a>`;
    })
    .join("\n      ");

  return `<div class="links">${items}</div>`;
}

function renderUpcoming(vacation) {
  return `
    <div class="upcoming">
      <div class="upcoming-label">Upcoming Vacation</div>
      <div class="upcoming-info">
        ${vacation.title ? `<strong>${escapeHtml(vacation.title)}</strong><br>` : ""}
        ${formatDate(vacation.start)} -> ${formatDate(vacation.end)}
      </div>
    </div>`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
