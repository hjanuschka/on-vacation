/**
 * Render the vacation status page HTML.
 */
export function renderPage(data) {
  const { owner, repo, on_vacation, current, upcoming, error } = data;
  const repoUrl = `https://github.com/${owner}/${repo}`;

  let statusHtml;
  let statusEmoji;
  let accentColor;

  if (error) {
    statusEmoji = "🤷";
    accentColor = "#8b949e";
    statusHtml = `
      <div class="status-card status-error">
        <div class="status-emoji">${statusEmoji}</div>
        <div class="status-label">Not Found</div>
        <p class="status-message">${escapeHtml(error)}</p>
        <p class="status-hint">Make sure the repo has a <code>VACATION.md</code> with a JSON schedule block.</p>
      </div>`;
  } else if (on_vacation) {
    statusEmoji = "🏖️";
    accentColor = "#f0883e";
    const endDate = formatDate(current.end);
    statusHtml = `
      <div class="status-card status-vacation">
        <div class="status-emoji">${statusEmoji}</div>
        <div class="status-label">On Vacation</div>
        ${current.title ? `<div class="vacation-title">${escapeHtml(current.title)}</div>` : ""}
        <p class="status-message">${escapeHtml(current.message || `This project is on vacation until ${endDate}.`)}</p>
        <div class="date-range">
          <span class="date">${formatDate(current.start)}</span>
          <span class="date-arrow">→</span>
          <span class="date">${endDate}</span>
        </div>
        ${renderCountdown(current.end)}
        ${renderLinks(current.links)}
      </div>`;
  } else {
    statusEmoji = "✅";
    accentColor = "#2ea043";
    statusHtml = `
      <div class="status-card status-active">
        <div class="status-emoji">${statusEmoji}</div>
        <div class="status-label">Open for Business</div>
        <p class="status-message">This project is currently accepting issues and pull requests.</p>
        ${upcoming ? renderUpcoming(upcoming) : ""}
      </div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${on_vacation ? "🏖️ On Vacation" : "✅ Available"} -- ${owner}/${repo}</title>
  <meta property="og:title" content="${owner}/${repo} -- ${on_vacation ? "On Vacation" : "Available"}">
  <meta property="og:description" content="${on_vacation && current ? escapeHtml(current.message || "") : `${owner}/${repo} is open for contributions`}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0d1117;
      color: #e6edf3;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .container {
      max-width: 560px;
      width: 100%;
      padding: 2rem;
      text-align: center;
    }
    .repo-header {
      margin-bottom: 2rem;
    }
    .repo-header a {
      color: #58a6ff;
      text-decoration: none;
      font-size: 1.4rem;
      font-weight: 600;
    }
    .repo-header a:hover { text-decoration: underline; }
    .status-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 16px;
      padding: 2.5rem 2rem;
      margin-bottom: 1.5rem;
    }
    .status-vacation { border-color: #f0883e40; }
    .status-active { border-color: #2ea04340; }
    .status-error { border-color: #8b949e40; }
    .status-emoji { font-size: 4rem; margin-bottom: 1rem; }
    .status-label {
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
    }
    .status-vacation .status-label { color: #f0883e; }
    .status-active .status-label { color: #2ea043; }
    .status-error .status-label { color: #8b949e; }
    .vacation-title {
      font-size: 1rem;
      color: #8b949e;
      margin-bottom: 0.75rem;
      font-style: italic;
    }
    .status-message {
      color: #c9d1d9;
      font-size: 1.05rem;
      line-height: 1.6;
      margin-bottom: 1.25rem;
    }
    .status-hint {
      color: #8b949e;
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }
    .status-hint code {
      background: #0d1117;
      padding: 2px 6px;
      border-radius: 4px;
      color: #f0883e;
    }
    .date-range {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .date {
      background: #0d1117;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
      font-size: 0.95rem;
      color: #e6edf3;
    }
    .date-arrow { color: #484f58; font-size: 1.2rem; }
    .countdown {
      background: #0d1117;
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 1.25rem;
    }
    .countdown-label {
      font-size: 0.8rem;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }
    .countdown-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #f0883e;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
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
      background: #21262d;
      border: 1px solid #30363d;
      border-radius: 8px;
      color: #58a6ff;
      text-decoration: none;
      font-size: 0.9rem;
      transition: border-color 0.15s;
    }
    .links a:hover { border-color: #58a6ff; }
    .upcoming {
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid #21262d;
    }
    .upcoming-label {
      font-size: 0.8rem;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }
    .upcoming-info {
      color: #c9d1d9;
      font-size: 0.95rem;
    }
    .footer {
      color: #484f58;
      font-size: 0.8rem;
      margin-top: 1rem;
    }
    .footer a { color: #484f58; text-decoration: none; }
    .footer a:hover { color: #8b949e; }

    .json-hint {
      margin-top: 1rem;
      color: #484f58;
      font-size: 0.8rem;
    }
    .json-hint code {
      background: #0d1117;
      padding: 2px 5px;
      border-radius: 3px;
      color: #8b949e;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="repo-header">
      <a href="${repoUrl}">${escapeHtml(owner)}/${escapeHtml(repo)}</a>
    </div>
    ${statusHtml}
    <div class="json-hint">
      JSON API: <code>curl -H "Accept: application/json" ${escapeHtml(`https://vacation.januschka.com/${owner}/${repo}`)}</code>
    </div>
    <p class="footer">
      Powered by <a href="https://vacation.januschka.com">on-vacation</a>
    </p>
  </div>
  ${on_vacation ? countdownScript(data.current.end) : ""}
</body>
</html>`;
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

  const iconMap = {
    discord: "💬",
    website: "🌐",
    twitter: "🐦",
    mastodon: "🐘",
    email: "📧",
    blog: "📝",
  };

  const items = Object.entries(links)
    .map(([name, url]) => {
      const icon = iconMap[name.toLowerCase()] || "🔗";
      const label = name.charAt(0).toUpperCase() + name.slice(1);
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
        ${formatDate(vacation.start)} → ${formatDate(vacation.end)}
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
