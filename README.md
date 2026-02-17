# 🏖️ on-vacation

A lightweight service that lets OSS projects announce vacation periods. Add a `VACATION.md` to your repo, and anyone can check if your project is on a break -- as a web page, JSON API, or README badge.

**Live at [vacation.januschka.com](https://vacation.januschka.com)**

## How it works

1. Add a `VACATION.md` to the root of your GitHub repo
2. Include a JSON schedule in a fenced code block
3. Point people to `https://vacation.januschka.com/:owner/:repo`

The service fetches your `VACATION.md` (no cloning -- just the single file via raw.githubusercontent.com), parses the schedule, and shows a live status page with countdown timer.

## VACATION.md format

Create a file called `VACATION.md` in your repository root. The human-readable markdown is rendered nicely by GitHub, while the JSON block is parsed by the service.

### Date-range vacations

One-off or multi-day breaks:

````markdown
# 🏖️ OSS Vacation

We're taking a break! Issue tracker and PRs reopen February 23, 2026.

```vacajson
{
  "vacations": [
    {
      "start": "2026-02-10",
      "end": "2026-02-23",
      "title": "Winter Break 2026",
      "message": "Issue tracker and PRs reopen February 23, 2026.",
      "links": {
        "discord": "https://discord.gg/example"
      }
    }
  ]
}
```
````

### Recurring weekly schedule

Automatically active every week -- e.g. weekends off:

```vacajson
{
  "vacations": [
    {
      "recurring": "weekly",
      "from": "fri 18:00",
      "to": "sun 23:59",
      "timezone": "Europe/Vienna",
      "title": "Weekend Break",
      "message": "We're off for the weekend. Back Monday."
    }
  ]
}
```

The `from`/`to` fields accept:
- **Shorthand:** `"fri 18:00"`, `"sun 23:59"`
- **Object form:** `{ "day": "Friday", "time": "18:00" }`
- **English days:** `mon`, `tue`, `wed`, `thu`, `fri`, `sat`, `sun` (or full names)
- **German days:** `mo`, `di`, `mi`, `do`, `fr`, `sa`, `so`

Wrapping around the week boundary works too (e.g. `"from": "sat 20:00", "to": "mon 08:00"`).

### Recurring daily schedule

After-hours mode, active every day:

```vacajson
{
  "vacations": [
    {
      "recurring": "daily",
      "from": "18:00",
      "to": "09:00",
      "timezone": "America/New_York",
      "title": "After Hours",
      "message": "We respond during business hours (9am-6pm ET)."
    }
  ]
}
```

Overnight windows work naturally -- `"from": "18:00", "to": "09:00"` means 6pm to 9am.

### Mix them together

Combine date ranges and recurring schedules in one file:

```vacajson
{
  "vacations": [
    {
      "start": "2026-12-23",
      "end": "2027-01-02",
      "title": "Holiday Break",
      "message": "Happy holidays! Back Jan 3."
    },
    {
      "recurring": "weekly",
      "from": "fri 18:00",
      "to": "sun 23:59",
      "timezone": "Europe/Vienna",
      "title": "Weekend"
    }
  ]
}
```

The first matching entry wins -- so a holiday break takes precedence over the weekend schedule.

### Schedule fields

| Field | Required | Description |
|-------|----------|-------------|
| `start` | Yes (date-range) | Start date `YYYY-MM-DD` |
| `end` | Yes (date-range) | End date `YYYY-MM-DD` (inclusive) |
| `recurring` | Yes (recurring) | `"weekly"` or `"daily"` |
| `from` | Yes (recurring) | Start day/time (see formats above) |
| `to` | Yes (recurring) | End day/time |
| `timezone` | No | IANA timezone (default: `UTC`) |
| `title` | No | Name for this vacation period |
| `message` | No | Message shown to visitors |
| `links` | No | Object of `name: url` pairs |

## Checking vacation status

### Web page

```
https://vacation.januschka.com/badlogic/pi-mono
```

Shows a styled status page with countdown, links, and upcoming vacation dates.

### JSON API

```bash
curl -H "Accept: application/json" \
  https://vacation.januschka.com/badlogic/pi-mono
```

Response when on vacation:

```json
{
  "owner": "badlogic",
  "repo": "pi-mono",
  "on_vacation": true,
  "current": {
    "start": "2026-02-10",
    "end": "2026-02-23",
    "title": "Winter Break 2026",
    "message": "Issue tracker and PRs reopen February 23, 2026."
  },
  "upcoming": null,
  "vacations": [...]
}
```

### README badge

```markdown
[![Vacation Status](https://vacation.januschka.com/YOUR_ORG/YOUR_REPO/badge.svg)](https://vacation.januschka.com/YOUR_ORG/YOUR_REPO)
```

## Use cases

- **CI/CD** -- check the JSON API before opening automated PRs
- **Bots** -- respect vacation periods before filing issues
- **Community** -- let contributors know when maintainers are away
- **After-hours** -- signal when response times will be slower

Example GitHub Actions check:

```yaml
- name: Check if project is on vacation
  run: |
    STATUS=$(curl -s -H "Accept: application/json" \
      https://vacation.januschka.com/${{ github.repository }} | jq -r '.on_vacation')
    if [ "$STATUS" = "true" ]; then
      echo "Project is on vacation, skipping."
      exit 0
    fi
```

## Self-hosting

```bash
git clone https://github.com/hjanuschka/on-vacation.git
cd on-vacation
npm install
npm start
```

Runs on port 3000 by default. Set `PORT` env var to change it.

### Vercel

Deploy with one click -- the project includes `vercel.json` with proper rewrites. All routes go through a single serverless function.

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port (standalone mode) |

## How caching works

Vacation data is cached in memory for 5 minutes. After the TTL expires, the next request fetches fresh data from GitHub's raw content API.

## License

MIT
