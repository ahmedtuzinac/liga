from django.core.management.base import BaseCommand

from league.models import ByeRound, Match, Round, Season, Team


# First half schedule (rounds 1-9) - we reverse home/away for second half
FIRST_HALF_SCHEDULE = {
    1: [
        ("Panteri", "Has Pazarci"),
        ("Cukovac", "Tutin"),
        ("PZ Spin", "Metalux"),
        ("Pacijenti", "Duga Poljana"),
        "Stari Ras",
    ],
    2: [
        ("Stari Ras", "Has Pazarci"),
        ("Panteri", "Metalux"),
        ("Cukovac", "Duga Poljana"),
        ("PZ Spin", "Pacijenti"),
        "Tutin",
    ],
    3: [
        ("Stari Ras", "Tutin"),
        ("Has Pazarci", "Metalux"),
        ("Panteri", "Pacijenti"),
        ("Cukovac", "PZ Spin"),
        "Duga Poljana",
    ],
    4: [
        ("Stari Ras", "Metalux"),
        ("Tutin", "Duga Poljana"),
        ("Has Pazarci", "Pacijenti"),
        ("Panteri", "Cukovac"),
        "PZ Spin",
    ],
    5: [
        ("Stari Ras", "Duga Poljana"),
        ("Metalux", "Pacijenti"),
        ("Tutin", "PZ Spin"),
        ("Has Pazarci", "Cukovac"),
        "Panteri",
    ],
    6: [
        ("Stari Ras", "Pacijenti"),
        ("Duga Poljana", "PZ Spin"),
        ("Metalux", "Cukovac"),
        ("Tutin", "Panteri"),
        "Has Pazarci",
    ],
    7: [
        ("Stari Ras", "PZ Spin"),
        ("Pacijenti", "Cukovac"),
        ("Duga Poljana", "Panteri"),
        ("Tutin", "Has Pazarci"),
        "Metalux",
    ],
    8: [
        ("Stari Ras", "Cukovac"),
        ("PZ Spin", "Panteri"),
        ("Duga Poljana", "Has Pazarci"),
        ("Metalux", "Tutin"),
        "Pacijenti",
    ],
    9: [
        ("Stari Ras", "Panteri"),
        ("PZ Spin", "Has Pazarci"),
        ("Pacijenti", "Tutin"),
        ("Duga Poljana", "Metalux"),
        "Cukovac",
    ],
}

# Two rounds per Sunday, starting 2026-09-13
ROUND_DATES = {
    10: "2026-09-13",
    11: "2026-09-13",
    12: "2026-09-20",
    13: "2026-09-20",
    14: "2026-09-27",
    15: "2026-09-27",
    16: "2026-10-04",
    17: "2026-10-04",
    18: "2026-10-11",
}


class Command(BaseCommand):
    help = "Seed second half-season schedule (rounds 10-18) with reversed home/away"

    def handle(self, *args, **options):
        season = Season.objects.get(slug="2025-2026")
        team_map = {t.name: t for t in Team.objects.filter(season=season)}

        for first_round_num in range(1, 10):
            second_round_num = first_round_num + 9
            entries = FIRST_HALF_SCHEDULE[first_round_num]
            bye_team_name = entries[-1]
            matches = entries[:-1]

            round_obj, created = Round.objects.get_or_create(
                season=season,
                round_number=second_round_num,
                defaults={"date": ROUND_DATES[second_round_num]},
            )
            action = "Created" if created else "Exists"
            self.stdout.write(f"  {action}: Kolo {second_round_num} ({ROUND_DATES[second_round_num]})")

            ByeRound.objects.get_or_create(
                round=round_obj, defaults={"team": team_map[bye_team_name]}
            )
            self.stdout.write(f"    Odmara: {bye_team_name}")

            for home_name, away_name in matches:
                # Reverse home/away for second half
                match, created = Match.objects.get_or_create(
                    round=round_obj,
                    home_team=team_map[away_name],
                    away_team=team_map[home_name],
                )
                if created:
                    self.stdout.write(
                        f"    {away_name} vs {home_name}"
                    )

        self.stdout.write(
            self.style.SUCCESS(
                "\nDone! Second half-season schedule created (rounds 10-18)."
            )
        )
