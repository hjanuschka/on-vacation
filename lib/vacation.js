/**
 * Fetch VACATION.md from a GitHub repo.
 * Tries: main, master branches. Uses AbortController for timeout.
 */
export async function fetchVacationMd(owner, repo) {
  const branches = ["main", "master"];

  for (const branch of branches) {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/VACATION.md`;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, {
        headers: { "User-Agent": "on-vacation/1.0" },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        return await res.text();
      }
    } catch (err) {
      continue;
    }
  }

  return null;
}

/**
 * Parse the JSON schedule block from VACATION.md content.
 *
 * Supports two types of entries in the "vacations" array:
 *
 * 1. Date-range vacations (one-off or multi-day):
 *    {
 *      "start": "2026-02-10",
 *      "end": "2026-02-23",
 *      "title": "Winter Break",
 *      "message": "Back on Feb 23."
 *    }
 *
 * 2. Recurring weekly schedule:
 *    {
 *      "recurring": "weekly",
 *      "from": { "day": "Friday", "time": "18:00" },
 *      "to": { "day": "Sunday", "time": "23:59" },
 *      "timezone": "Europe/Vienna",
 *      "title": "Weekend Break",
 *      "message": "We're off for the weekend."
 *    }
 *
 *    Also supports shorthand:
 *    {
 *      "recurring": "weekly",
 *      "from": "fri 18:00",
 *      "to": "sun 23:59",
 *      "timezone": "Europe/Vienna"
 *    }
 *
 * 3. Daily recurring:
 *    {
 *      "recurring": "daily",
 *      "from": "18:00",
 *      "to": "09:00",
 *      "timezone": "Europe/Vienna",
 *      "title": "After Hours"
 *    }
 */
export function parseVacationSchedule(markdown) {
  const jsonBlockRegex = /```vacajson\s*\n([\s\S]*?)```/;
  const match = markdown.match(jsonBlockRegex);

  if (!match) {
    throw new Error("No JSON code block found in VACATION.md");
  }

  const parsed = JSON.parse(match[1]);

  if (!parsed.vacations || !Array.isArray(parsed.vacations)) {
    throw new Error('VACATION.md JSON must contain a "vacations" array');
  }

  for (const v of parsed.vacations) {
    if (v.recurring) {
      validateRecurring(v);
    } else {
      validateDateRange(v);
    }
  }

  return parsed;
}

function validateDateRange(v) {
  if (!v.start || !v.end) {
    throw new Error("Each date-range vacation must have start and end (YYYY-MM-DD)");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.start) || !/^\d{4}-\d{2}-\d{2}$/.test(v.end)) {
    throw new Error("Dates must be in YYYY-MM-DD format");
  }
}

function validateRecurring(v) {
  if (!["weekly", "daily"].includes(v.recurring)) {
    throw new Error('recurring must be "weekly" or "daily"');
  }
  if (!v.from || !v.to) {
    throw new Error("Recurring entries need from and to");
  }
}

/**
 * Check if a given date falls within any vacation window.
 * Returns the matching vacation entry or null.
 */
export function findActiveVacation(vacations, now = new Date()) {
  for (const v of vacations) {
    if (v.recurring) {
      if (isInRecurringWindow(v, now)) return v;
    } else {
      const start = new Date(v.start + "T00:00:00Z");
      const end = new Date(v.end + "T23:59:59Z");
      if (now >= start && now <= end) return v;
    }
  }
  return null;
}

/**
 * Find the next upcoming vacation (date-range only, not recurring).
 */
export function findUpcomingVacation(vacations, now = new Date()) {
  return vacations
    .filter((v) => !v.recurring && new Date(v.start + "T00:00:00Z") > now)
    .sort((a, b) => new Date(a.start) - new Date(b.start))[0] || null;
}

// --- Recurring logic ---

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const DAY_SHORT = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function parseDayTime(input) {
  // Object form: { day: "Friday", time: "18:00" }
  if (typeof input === "object" && input.day && input.time) {
    const day = parseDayName(input.day);
    const [h, m] = input.time.split(":").map(Number);
    return { day, hour: h, minute: m };
  }

  // String shorthand: "fri 18:00" or just "18:00" (for daily)
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
  const lower = name.toLowerCase().replace(/\.$/,'');
  let idx = DAY_NAMES.indexOf(lower);
  if (idx >= 0) return idx;
  idx = DAY_SHORT.indexOf(lower.slice(0, 3));
  if (idx >= 0) return idx;
  // German day abbreviations
  const german = { mo: 1, di: 2, mi: 3, do: 4, fr: 5, sa: 6, so: 0 };
  if (german[lower.slice(0, 2)] !== undefined) return german[lower.slice(0, 2)];
  throw new Error(`Unknown day name: ${name}`);
}

function isInRecurringWindow(v, now) {
  const tz = v.timezone || "UTC";

  // Get current time in the specified timezone
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
      // Same day window: e.g. 18:00 -> 23:59
      return currentMinutes >= fromMin && currentMinutes <= toMin;
    } else {
      // Overnight window: e.g. 18:00 -> 09:00
      return currentMinutes >= fromMin || currentMinutes <= toMin;
    }
  }

  if (v.recurring === "weekly") {
    const from = parseDayTime(v.from);
    const to = parseDayTime(v.to);
    const fromMin = from.hour * 60 + from.minute;
    const toMin = to.hour * 60 + to.minute;

    // Convert everything to "minutes since start of week (Sunday 00:00)"
    const currentWeekMin = currentDay * 1440 + currentMinutes;
    const fromWeekMin = from.day * 1440 + fromMin;
    const toWeekMin = to.day * 1440 + toMin;

    if (fromWeekMin <= toWeekMin) {
      // Normal range: e.g. Friday 18:00 -> Sunday 23:59
      return currentWeekMin >= fromWeekMin && currentWeekMin <= toWeekMin;
    } else {
      // Wraps around week boundary: e.g. Saturday 20:00 -> Monday 08:00
      return currentWeekMin >= fromWeekMin || currentWeekMin <= toWeekMin;
    }
  }

  return false;
}
