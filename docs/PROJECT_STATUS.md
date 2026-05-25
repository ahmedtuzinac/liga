# TT Liga — Project Status

## About
Online results platform for the Inter-Municipal Table Tennis League (Novi Pazar, Sjenica, Tutin).
Held at STA Tutić academy. Spring 2026, first half-season.

**Live**: https://medjuopstinskaliga.nyvark.com/

## Tech Stack
- **Backend**: Django 6.0.5 + Django REST Framework 3.17
- **Frontend**: Next.js 16.2.6 + Tailwind CSS 4
- **Database**: PostgreSQL 16 (Docker, both dev and prod)
- **Deployment**: Docker Compose (db, backend, frontend, nginx)
- **Design**: Dark theme + Gold/Orange accent (#f59e0b)

## Project Structure
```
projects/tt-liga/
├── backend/                    # Django API
│   ├── config/                 # Django settings, urls
│   ├── league/                 # Main app
│   │   ├── models.py           # Team, Player, Round, Match, Game, SetScore, ByeRound
│   │   ├── views.py            # Public + Admin API endpoints
│   │   ├── serializers.py      # DRF serializers
│   │   ├── urls.py             # API routes
│   │   ├── admin.py            # Django admin config
│   │   └── management/commands/seed_data.py
│   ├── Dockerfile
│   └── manage.py
├── frontend/                   # Next.js
│   ├── src/
│   │   ├── app/                # Pages (public + admin)
│   │   ├── components/         # UI components
│   │   └── lib/                # api.ts, types.ts
│   ├── Dockerfile
│   └── package.json
├── nginx/default.conf          # Reverse proxy config
├── docker-compose.yml
└── docs/
```

## Running Locally

### Docker (recommended)
```bash
cd projects/tt-liga
docker compose up -d
```
- Site: http://localhost (port 80)
- API: http://localhost/api/
- Django Admin: http://localhost/django-admin/

### Manual (dev)
```bash
# Backend
cd projects/tt-liga && source venv/bin/activate && cd backend
python manage.py runserver 8000

# Frontend
cd projects/tt-liga/frontend
npm run dev -- -p 3003
```

## Deployment (Production)
Server: Hetzner VPS (4 vCPU, 3.8 GB RAM, AMD EPYC)
```bash
ssh medjuopstinskaliga.nyvark.com
cd ~/liga && git pull && docker compose up -d --build
```

## API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/standings/ | League standings (sorted by points, h2h, singles diff, sets diff) |
| GET | /api/player-standings/ | Individual player rankings (win %, wins, sets) |
| GET | /api/players/{id}/ | Player profile with game history |
| GET | /api/rounds/ | All rounds (summary) |
| GET | /api/rounds/{number}/ | Round detail with matches |
| GET | /api/matches/{id}/ | Match detail with games and set scores |
| GET | /api/teams/ | All teams |
| GET | /api/teams/{id}/ | Team detail with players and match history |

### Admin (token auth required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/admin/login/ | Login, returns token |
| GET | /api/admin/me/ | Current user info |
| GET | /api/admin/rounds/ | Rounds with matches for admin |
| GET | /api/admin/matches/{id}/ | Match detail + both teams' players |
| POST | /api/admin/matches/{id}/result/ | Submit/edit match result |
| POST | /api/admin/players/ | Add player to team |
| DELETE | /api/admin/players/{id}/ | Delete player |

## Database Models
- **Team**: name, full_name, city
- **Player**: name, team (FK)
- **Round**: round_number, date
- **Match**: round (FK), home_team, away_team, home_score, away_score, is_completed
- **ByeRound**: round (FK), team (FK) — team that rests
- **Game**: match (FK), game_number, home/away player, home/away player_2 (doubles), designation (A/B/C vs X/Y/Z), sets_won, is_doubles
- **SetScore**: game (FK), set_number, home_points, away_points

## Match Format
- 6 singles: A-Y, B-X, C-Z, A-X, C-Y, B-Z
- Each single: best of 5 sets
- First team to 4 wins = match winner (match can end before 6th single)
- If 3:3 after 6 singles → doubles (deciding, 2 players per side)
- Scoring: Win = 2 points, Loss = 0

## Standings Tiebreaker Rules
1. **Points** (wins × 2)
2. **Head-to-head** among tied teams (recursive — if sub-group still tied, narrows to direct match)
3. **Singles difference** (singles won − singles lost)
4. **Sets difference** (sets won − sets lost)

## Current Data (as of 2026-05-25)
- 9 teams, 45 players
- 34/36 matches completed (2 remaining: Round 7 and 8)
- 195 games, 695 set scores

## Frontend Pages
| Route | Status | Description |
|-------|--------|-------------|
| / | ✅ | Home — standings + current round |
| /standings | ✅ | Standings with team + player tabs |
| /schedule | ✅ | All 9 rounds (auto-scrolls to next incomplete) |
| /rounds/[number] | ✅ | Single round detail |
| /matches/[id] | ✅ | Match detail with games, sets, substitution labels |
| /teams | ✅ | Team cards grid |
| /teams/[id] | ✅ | Team profile with player links + match history |
| /players/[id] | ✅ | Player profile with stats + game history |
| /admin | ✅ | Admin dashboard |
| /admin/login | ✅ | Admin login |
| /admin/results/[matchId] | ✅ | Result entry/edit form |
| /admin/teams | ✅ | Manage teams/players |

## Key Features
- [x] Full public pages with responsive dark + gold design
- [x] Admin panel with token auth
- [x] Result entry form with player assignment (A/B/C vs Y/X/Z)
- [x] Dynamic game count (hides games after team reaches 4 wins)
- [x] Multiple substitutions per team with timing (after game N)
- [x] Substitution form allows selecting any team player
- [x] Doubles support (2 players per side, auto-appears at 3:3)
- [x] Edit mode for submitted results (pre-fills form)
- [x] Player standings tab with win percentage ranking
- [x] Player profile pages with game history
- [x] Substitution detection and labels on public match page
- [x] Auto-scroll to next game day on schedule page
- [x] Head-to-head tiebreaker in standings
- [x] Docker Compose deployment (db, backend, frontend, nginx)
- [x] Production deploy on Hetzner VPS
