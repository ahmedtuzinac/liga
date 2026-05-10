# TT Liga — Project Status

## About
Online results platform for the Inter-Municipal Table Tennis League (Novi Pazar, Sjenica, Tutin).
Held at STA Tutić academy. Spring 2026, first half-season.

## Tech Stack
- **Backend**: Django 6.0.5 + Django REST Framework 3.17
- **Frontend**: Next.js 16.2.6 + Tailwind CSS 4
- **Database**: SQLite (dev), Supabase PostgreSQL (prod)
- **Design**: Dark theme + Gold/Orange accent (Theme A)

## Project Structure
```
projects/tt-liga/
├── assets/                     # Images, screenshots, design previews
├── backend/                    # Django API
│   ├── config/                 # Django settings, urls
│   ├── league/                 # Main app (models, views, serializers, admin)
│   │   ├── models.py           # Team, Player, Round, Match, Game, SetScore, ByeRound
│   │   ├── views.py            # Public + Admin API endpoints
│   │   ├── serializers.py      # DRF serializers
│   │   ├── urls.py             # API routes
│   │   ├── admin.py            # Django admin config
│   │   └── management/commands/seed_data.py
│   ├── db.sqlite3
│   └── manage.py
├── frontend/                   # Next.js
│   ├── src/
│   │   ├── app/                # Pages (home, standings, schedule, rounds, matches, teams)
│   │   ├── components/         # Header, Footer, StandingsTable, MatchCard
│   │   └── lib/                # api.ts (API client), types.ts
│   └── package.json
├── venv/                       # Python virtual environment
├── requirements.txt
└── docs/
```

## Running Locally

### Backend (Django API)
```bash
cd projects/tt-liga
source venv/bin/activate
cd backend
python manage.py runserver 8000
```
- API: http://localhost:8000/api/
- Django Admin: http://localhost:8000/admin/ (user: admin, pass: admin123)

### Frontend (Next.js)
```bash
cd projects/tt-liga/frontend
npm run dev -- -p 3003
```
- Site: http://localhost:3003

## API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/standings/ | League standings table |
| GET | /api/rounds/ | All rounds (summary) |
| GET | /api/rounds/{number}/ | Round detail with matches |
| GET | /api/matches/{id}/ | Match detail with games and sets |
| GET | /api/teams/ | All teams |
| GET | /api/teams/{id}/ | Team detail with players and match history |

### Admin (auth required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/admin/matches/{id}/result/ | Submit match result |

## Database Models
- **Team**: name, full_name, city
- **Player**: name, team (FK)
- **Round**: round_number, date
- **Match**: round (FK), home_team, away_team, home_score, away_score, is_completed
- **ByeRound**: round (FK), team (FK) — team that rests
- **Game**: match (FK), game_number, home/away player, designation (A/B/C vs X/Y/Z), sets_won, is_doubles
- **SetScore**: game (FK), set_number, home_points, away_points

## Seeded Data
- 9 teams: STK Stari Ras, PZ Spin, Metalux, Panteri, Has Pazarci, Cukovac, Tutin, Pacijenti, Duga Poljana
- 9 rounds with 4 matches each + bye team per round
- No players or results yet

## Match Format
- 6 singles: A-Y, B-X, C-Z, A-X, B-Z, C-Y
- Each single: best of 5 sets
- First team to 4 wins = match winner
- If 3:3 after 6 singles → doubles (deciding)
- Scoring: Win = 2 points, Loss = 0

## Frontend Pages
| Route | Status | Description |
|-------|--------|-------------|
| / | ✅ Done | Home — standings + current round |
| /standings | ✅ Done | Full standings table |
| /schedule | ✅ Done | All 9 rounds with matches |
| /rounds/[number] | ✅ Done | Single round detail |
| /matches/[id] | ✅ Done | Match detail with games |
| /teams | ✅ Done | Team cards grid |
| /teams/[id] | ✅ Done | Team profile (players + history) |
| /admin | ❌ TODO | Admin dashboard |
| /admin/login | ❌ TODO | Admin login |
| /admin/results/[matchId] | ❌ TODO | Result entry form |
| /admin/teams | ❌ TODO | Manage teams/players |

## What's Done
- [x] Django project + models + migrations
- [x] Seed data (9 teams, 9 rounds, 36 matches, bye teams)
- [x] Django REST API (public endpoints)
- [x] Django admin (built-in)
- [x] Admin result submission endpoint
- [x] Next.js project + Tailwind setup
- [x] Dark + Gold design system
- [x] All public pages (home, standings, schedule, rounds, matches, teams)
- [x] API client + TypeScript types
- [x] Responsive layout

## What's Next (Priority Order)
1. **Admin panel** — Login + result entry form (most important feature)
2. **Add players** — Need player data for all 9 teams
3. **Enter results** — 1st and 2nd round results already played
4. **Deploy** — Backend to Railway/Render, Frontend to Vercel
5. **Connect domain** — TBD
6. **Mobile polish** — Test on phones (primary use case)
