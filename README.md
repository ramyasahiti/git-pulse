# Git Pulse 🏆
A real-time developer activity leaderboard that tracks Git events,
scores contributions, and serves live analytics — built with
Kafka, Flask, FastAPI, MongoDB, and GitHub Actions CI/CD.

## Architecture
GitHub Webhook → Flask (port 5000) → Kafka → Consumer → MongoDB → FastAPI (port 8000)

## Tech Stack
| Technology | Role |
|---|---|
| Flask | Receives GitHub webhook events |
| Kafka | Streams events between services |
| Kafka Consumer | Scores events, writes to MongoDB |
| MongoDB | Stores events, leaderboard, daily stats |
| FastAPI | Serves REST API and analytics |
| GitHub Actions | CI/CD — lint and build on every push |

## Quick Start
```bash
git clone https://github.com/ramyasahiti/git-pulse
cd git-pulse
docker compose up --build
```

## API Endpoints
| Endpoint | Description |
|---|---|
| GET /leaderboard | Top developers ranked by score |
| GET /developer/{username} | Individual stats and activity |
| GET /pulse?days=7 | Team activity summary |
| GET /stats | Daily breakdown of events |

Interactive API docs: http://localhost:8000/docs

## Scoring System
| Event | Points |
|---|---|
| Push | +10 |
| Pull Request | +20 |
| PR Review | +15 |

## MongoDB Collections
| Collection | Purpose |
|---|---|
| events | Raw log of every Git event |
| leaderboard | Running scores per developer |
| stats | Daily team activity summary |

## Simulate Events
```bash
# Fake push event
curl -X POST http://localhost:5000/webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d "{\"sender\": {\"login\": \"ramya\"}, \"repository\": {\"full_name\": \"ramya/test-repo\"}}"

# Check leaderboard
curl http://localhost:8000/leaderboard
```

## Git Branch Strategy
- `main` — production, protected (CI must pass)
- `dev` — integration branch
- `feature/*` — individual features