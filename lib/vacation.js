/**
 * Fetch VACATION.md from a GitHub repo.
 * Tries: main, master branches.
 */
export async function fetchVacationMd(owner, repo) {
  const branches = ["main", "master"];

  for (const branch of branches) {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/VACATION.md`;
    const res = await fetch(url, {
      headers: { "User-Agent": "on-vacation/1.0" },
    });
    if (res.ok) {
      return await res.text();
    }
  }

  return null;
}

/**
 * Parse the JSON schedule block from VACATION.md content.
 * Looks for a ```json fenced code block containing a "vacations" array.
 */
export function parseVacationSchedule(markdown) {
  // Extract JSON from fenced code block
  const jsonBlockRegex = /```json\s*\n([\s\S]*?)```/;
  const match = markdown.match(jsonBlockRegex);

  if (!match) {
    throw new Error("No JSON code block found in VACATION.md");
  }

  const parsed = JSON.parse(match[1]);

  if (!parsed.vacations || !Array.isArray(parsed.vacations)) {
    throw new Error('VACATION.md JSON must contain a "vacations" array');
  }

  // Validate each vacation entry
  for (const v of parsed.vacations) {
    if (!v.start || !v.end) {
      throw new Error("Each vacation must have start and end dates (YYYY-MM-DD)");
    }
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v.start) || !/^\d{4}-\d{2}-\d{2}$/.test(v.end)) {
      throw new Error("Dates must be in YYYY-MM-DD format");
    }
  }

  return parsed;
}
