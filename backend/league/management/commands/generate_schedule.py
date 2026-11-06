from datetime import date, timedelta

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from league.models import ByeRound, Match, Round, Season


def round_robin(teams):
    """Single round-robin via Berger tables. Returns list of rounds, each a
    (pairs, bye_team) tuple; bye_team is None for an even team count.
    Home games are balanced (differ by at most 1) and no team plays more
    than 2 home or away games in a row."""
    teams = list(teams)
    if len(teams) % 2:
        teams.append(None)
    n = len(teams)
    m = n - 1  # teams[m] is fixed, the rest rotate
    rounds = []
    for r in range(m):
        fixed = (teams[m], teams[r]) if r % 2 == 0 else (teams[r], teams[m])
        raw = [fixed]
        for i in range(1, n // 2):
            a, b = teams[(r + i) % m], teams[(r - i) % m]
            raw.append((a, b) if i % 2 else (b, a))
        pairs = []
        bye = None
        for a, b in raw:
            if a is None or b is None:
                bye = a or b
            else:
                pairs.append((a, b))
        rounds.append((pairs, bye))
    return rounds


class Command(BaseCommand):
    help = (
        "Generate a season schedule. First half: round-robin of the season's teams. "
        "--second-half: mirror existing first-half rounds with home/away reversed."
    )

    def add_arguments(self, parser):
        parser.add_argument("season", help='Season slug, e.g. "2026-2027"')
        parser.add_argument("--start", required=True, help="Date of first round (YYYY-MM-DD)")
        parser.add_argument(
            "--rounds-per-day", type=int, default=2, help="Rounds played on the same day (default 2)"
        )
        parser.add_argument(
            "--days-between", type=int, default=7, help="Days between game days (default 7)"
        )
        parser.add_argument("--second-half", action="store_true")

    @transaction.atomic
    def handle(self, *args, **options):
        season = Season.objects.filter(slug=options["season"]).first()
        if season is None:
            raise CommandError(f"Season {options['season']} not found")

        start = date.fromisoformat(options["start"])

        if options["second_half"]:
            first_half = list(season.rounds.prefetch_related("matches"))
            if not first_half:
                raise CommandError("No first-half rounds to mirror")
            offset = len(first_half)
            schedule = [
                (
                    [(m.away_team, m.home_team) for m in r.matches.all()],
                    getattr(r, "bye", None) and r.bye.team,
                )
                for r in first_half
            ]
        else:
            if season.rounds.exists():
                raise CommandError("Season already has rounds; use --second-half")
            teams = season.teams.order_by("id")
            if teams.count() < 2:
                raise CommandError("Season needs at least 2 teams")
            offset = 0
            schedule = round_robin(teams)

        for i, (pairs, bye) in enumerate(schedule):
            round_number = offset + i + 1
            game_day = start + timedelta(
                days=(i // options["rounds_per_day"]) * options["days_between"]
            )
            round_obj = Round.objects.create(
                season=season, round_number=round_number, date=game_day
            )
            self.stdout.write(f"  Kolo {round_number} ({game_day})")
            for home, away in pairs:
                Match.objects.create(round=round_obj, home_team=home, away_team=away)
                self.stdout.write(f"    {home.name} vs {away.name}")
            if bye:
                ByeRound.objects.create(round=round_obj, team=bye)
                self.stdout.write(f"    Odmara: {bye.name}")

        self.stdout.write(self.style.SUCCESS(f"\nDone! {len(schedule)} rounds created."))
