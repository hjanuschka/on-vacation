# 🏖️ oss-vacation

A lightweight service that lets OSS projects announce vacation periods. Add a `VACATION.md` to your repo, and anyone can check if your project is on a break -- as a web page, JSON API, or README badge.

**Live at [vacation.januschka.com](https://vacation.januschka.com)**

## How it works

1. Add a `VACATION.md` to the root of your GitHub repo
2. Include a JSON schedule in a fenced code block
3. Point people to `https://vacation.januschka.com/:owner/:repo`

The service fetches your `VACATION.md`, parses the schedule, and shows a live status page with countdown timer.

## VACATION.md format

Create a file called `VACATION.md` in your repository root:

```markdown
# 🏖️ OSS Vacation

We're taking a break! Issue tracker and PRs reopen February 23, 2026.

All PRs will be auto-closed until then. Approved contributors can submit
PRs after vacation without reapproval. For support, join our Discord.

\`\`\`json
{
  "vacations": [
    {
      "start": "2026-02-10",
      "end": "2026-02-23",
      "title": "Winter Break 2026",
      "message": "Issue tracker and PRs reopen February 23, 2026. All PRs will be auto-closed until then.",
      "links": {
        "discord": "https://discord.gg/example",
        "blog": "https://example.com/blog/vacation"
      }
    }
  ]
}
\`\`\`
```

### Schedule fields

| Field | Required | Description |
|-------|----------|-------------|
| `start` | Yes | Start date in `YYYY-MM-DD` format |
| `end` | Yes | End date in `YYYY-MM-DD` format (inclusive) |
| `title` | No | Name for this vacation period |
| `message` | No | Message shown to visitors |
| `links` | No | Object of `name: url` pairs (discord, blog, website, twitter, etc.) |

You can list multiple vacations in the `vacations` array. The service automatically determines which one is currently active or upcoming.

### Why a Markdown file?

The `VACATION.md` file is both human-readable (GitHub renders it nicely in your repo) and machine-readable (the JSON block is parsed by the service). One file, two purposes.

## Checking vacation status

### Web page

Visit the URL in your browser:

```
https://vacation.januschka.com/badlogic/pi-mono
```

Shows a styled status page with:
- Whether the project is currently on vacation or open
- Countdown timer until vacation ends
- Links to Discord/blog/etc.
- Upcoming vacation dates if any are scheduled

### JSON API

Set the `Accept` header to `application/json`:

```bash
curl -H "Accept: application/json" https://vacation.januschka.com/badlogic/pi-mono
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
    "message": "Issue tracker and PRs reopen February 23, 2026.",
    "links": { "discord": "https://discord.gg/example" }
  },
  "upcoming": null,
  "vacations": [...]
}
```

Response when available:

```json
{
  "owner": "badlogic",
  "repo": "pi-mono",
  "on_vacation": false,
  "current": null,
  "upcoming": { "start": "2026-06-01", "end": "2026-06-14", "title": "Summer Break" },
  "vacations": [...]
}
```

### README badge

Add a badge to your repo's README:

```markdown
[![Vacation Status](https://vacation.januschka.com/YOUR_ORG/YOUR_REPO/badge.svg)](https://vacation.januschka.com/YOUR_ORG/YOUR_REPO)
```

The badge shows either **on vacation** (orange) or **available** (green).

## Use cases

- **CI/CD integration** -- check the JSON API before opening automated PRs
- **Bots** -- respect vacation periods before filing issues
- **Community** -- let contributors know when maintainers are away
- **GitHub Actions** -- skip workflows that need maintainer attention

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
git clone https://github.com/hjanuschka/oss-vacation.git
cd oss-vacation
npm install
npm start
```

The server runs on port 3000 by default. Set `PORT` env var to change it.

### Docker

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port to listen on |

## How caching works

Vacation data is cached in memory for 5 minutes to avoid hammering the GitHub raw content API. After the TTL expires, the next request fetches fresh data.

## License

MIT
