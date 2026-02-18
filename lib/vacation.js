/**
 * Fetch vacation data from a GitHub repo.
 *
 * Strategy (in order):
 * 1. VACATION.md with ```vacajson block (full control, recurring schedules, custom links)
 * 2. README.md header starting with # 🏖️ (zero setup -- just works)
 *
 * Both are checked. VACATION.md takes priority if present.
 */
export async function fetchVacationData(owner, repo) {
  // Try VACATION.md first (explicit config)
  const vacationMd = await fetchFile(owner, repo, "VACATION.md");
  if (vacationMd) {
    const parsed = parseVacajsonBlock(vacationMd);
    if (parsed) return parsed;
  }

  // Fall back to README.md header (zero friction)
  const readme = await fetchFile(owner, repo, "README.md");
  if (readme) {
    const parsed = parseReadmeVacation(readme);
    if (parsed) return parsed;
  }

  return null;
}

/**
 * Fetch a single file from a GitHub repo via the API.
 */
async function fetchFile(owner, repo, path) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "on-vacation/1.0",
        "Accept": "application/vnd.github.raw+json",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) return await res.text();
  } catch (err) {
    console.error(`Fetch error for ${owner}/${repo}/${path}:`, err.message);
  }
  return null;
}

/**
 * Parse a ```vacajson fenced block from markdown.
 */
function parseVacajsonBlock(markdown) {
  const match = markdown.match(/```vacajson\s*\n([\s\S]*?)```/);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[1]);
    if (parsed.vacations && Array.isArray(parsed.vacations)) {
      for (const v of parsed.vacations) {
        if (v.recurring) {
          if (!["weekly", "daily"].includes(v.recurring) || !v.from || !v.to) return null;
        } else {
          if (!v.start || !v.end) return null;
          if (!/^\d{4}-\d{2}-\d{2}$/.test(v.start) || !/^\d{4}-\d{2}-\d{2}$/.test(v.end)) return null;
        }
      }
      return parsed;
    }
  } catch {}
  return null;
}

/**
 * Parse vacation status from a README.md that starts with a vacation header.
 *
 * Detects pattern:
 *   # 🏖️ ...
 *   ... reopen <date> ...
 *   ... [Discord](url) ...
 *
 * Reads everything above the first `---` or second `#` heading as the vacation block.
 */
function parseReadmeVacation(readme) {
  const lines = readme.split("\n");

  // Must start with a vacation header (allow leading whitespace)
  const firstHeading = lines.find((l) => /^#\s/.test(l.trim()));
  if (!firstHeading) return null;
  if (!/🏖/.test(firstHeading)) return null;

  // Extract the vacation block: everything until --- or next # heading
  const blockLines = [];
  let started = false;
  for (const line of lines) {
    if (!started) {
      if (/^#\s/.test(line.trim()) && /🏖/.test(line)) started = true;
      continue;
    }
    if (/^---/.test(line.trim()) || (/^#\s/.test(line.trim()) && !blockLines.length === 0)) break;
    if (/^#\s/.test(line.trim())) break;
    blockLines.push(line);
  }

  const block = blockLines.join("\n");
  if (!block.trim()) return null;

  // Extract end date from common patterns:
  //   "reopen February 23, 2026"
  //   "until February 23, 2026"
  //   "back on February 23, 2026"
  //   "returns February 23, 2026"
  const datePattern = /(?:reopen|until|back on|returns?|through|ends?)\s+(\w+ \d{1,2},?\s*\d{4})/i;
  const dateMatch = block.match(datePattern);

  const endDate = dateMatch ? parseNaturalDate(dateMatch[1]) : null;

  // Title from the heading
  const title = firstHeading.replace(/^#+\s*/, "").trim();

  // Message: first bold line or first non-empty line
  const boldMatch = block.match(/\*\*(.+?)\*\*/);
  const message = boldMatch
    ? boldMatch[1].replace(/\*\*/g, "")
    : block.trim().split("\n").find((l) => l.trim())?.trim() || "";

  // Extract links: [Label](url)
  const links = {};
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(block)) !== null) {
    const label = linkMatch[1].trim();
    const url = linkMatch[2];
    // Use lowercase label as key, auto-detects known names like "Discord"
    links[label.toLowerCase()] = url;
  }

  // Build vacation entry
  const entry = {
    title,
    message,
    links: Object.keys(links).length > 0 ? links : undefined,
    _source: "readme",
  };

  if (endDate) {
    const end = new Date(endDate + "T23:59:59Z");
    const sevenBefore = new Date(end.getTime() - 7 * 86400000);
    const now = new Date();
    entry.start = now < sevenBefore
      ? formatISODate(sevenBefore)
      : formatISODate(new Date(Math.min(now.getTime(), end.getTime())));
    entry.end = endDate;
  } else {
    // No date found -- still on vacation, just no end date
    entry.start = formatISODate(new Date());
    entry.end = null;
  }

  return { vacations: [entry] };
}

/**
 * Parse a natural language date like "February 23, 2026" into "2026-02-23".
 */
function parseNaturalDate(str) {
  const cleaned = str.replace(",", "").trim();
  const d = new Date(cleaned + " UTC");
  if (isNaN(d.getTime())) return null;
  return formatISODate(d);
}

function formatISODate(d) {
  return d.toISOString().split("T")[0];
}

// --- Active/upcoming detection ---

/**
 * Check if a given date falls within any vacation window.
 */
export function findActiveVacation(vacations, now = new Date()) {
  for (const v of vacations) {
    if (v.recurring) {
      if (isInRecurringWindow(v, now)) return v;
    } else {
      const start = new Date(v.start + "T00:00:00Z");
      if (!v.end) {
        // No end date -- always active once started
        if (now >= start) return v;
      } else {
        const end = new Date(v.end + "T23:59:59Z");
        if (now >= start && now <= end) return v;
      }
    }
  }
  return null;
}

/**
 * Find the next upcoming vacation (date-range only).
 */
export function findUpcomingVacation(vacations, now = new Date()) {
  return (
    vacations
      .filter((v) => !v.recurring && new Date(v.start + "T00:00:00Z") > now)
      .sort((a, b) => new Date(a.start) - new Date(b.start))[0] || null
  );
}

// --- Recurring logic ---

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const DAY_SHORT = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function parseDayTime(input) {
  if (typeof input === "object" && input.day && input.time) {
    const day = parseDayName(input.day);
    const [h, m] = input.time.split(":").map(Number);
    return { day, hour: h, minute: m };
  }

  if (typeof input === "string") {
    const parts = input.trim().toLowerCase().split(/\s+/);
    if (parts.length === 2) {
      const day = parseDayName(parts[0]);
      const [h, m] = parts[1].split(":").map(Number);
      return { day, hour: h, minute: m };
    }
    if (parts.length === 1 && parts[0].includes(":")) {
      const [h, m] = parts[0].split(":").map(Number);
      return { day: null, hour: h, minute: m };
    }
  }

  throw new Error(`Cannot parse day/time: ${JSON.stringify(input)}`);
}

function parseDayName(name) {
  const lower = name.toLowerCase().replace(/\.$/, "");
  let idx = DAY_NAMES.indexOf(lower);
  if (idx >= 0) return idx;
  idx = DAY_SHORT.indexOf(lower.slice(0, 3));
  if (idx >= 0) return idx;
  const german = { mo: 1, di: 2, mi: 3, do: 4, fr: 5, sa: 6, so: 0 };
  if (german[lower.slice(0, 2)] !== undefined) return german[lower.slice(0, 2)];
  throw new Error(`Unknown day name: ${name}`);
}

function isInRecurringWindow(v, now) {
  const tz = v.timezone || "UTC";
  const localStr = now.toLocaleString("en-US", { timeZone: tz });
  const local = new Date(localStr);
  const currentDay = local.getDay();
  const currentMinutes = local.getHours() * 60 + local.getMinutes();

  if (v.recurring === "daily") {
    const from = parseDayTime(v.from);
    const to = parseDayTime(v.to);
    const fromMin = from.hour * 60 + from.minute;
    const toMin = to.hour * 60 + to.minute;
    if (fromMin <= toMin) {
      return currentMinutes >= fromMin && currentMinutes <= toMin;
    } else {
      return currentMinutes >= fromMin || currentMinutes <= toMin;
    }
  }

  if (v.recurring === "weekly") {
    const from = parseDayTime(v.from);
    const to = parseDayTime(v.to);
    const fromMin = from.hour * 60 + from.minute;
    const toMin = to.hour * 60 + to.minute;
    const currentWeekMin = currentDay * 1440 + currentMinutes;
    const fromWeekMin = from.day * 1440 + fromMin;
    const toWeekMin = to.day * 1440 + toMin;
    if (fromWeekMin <= toWeekMin) {
      return currentWeekMin >= fromWeekMin && currentWeekMin <= toWeekMin;
    } else {
      return currentWeekMin >= fromWeekMin || currentWeekMin <= toWeekMin;
    }
  }

  return false;
}
