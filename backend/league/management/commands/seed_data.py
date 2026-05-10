from django.core.management.base import BaseCommand

from league.models import ByeRound, Game, Match, Player, Round, SetScore, Team


TEAMS = [
    ("Stari Ras", "STK Stari Ras", "Novi Pazar"),
    ("PZ Spin", "STK PZ Spin", "Novi Pazar"),
    ("Metalux", "STK Metalux", "Novi Pazar"),
    ("Panteri", "STK Panteri", "Novi Pazar"),
    ("Has Pazarci", "STK Has Pazarci", "Novi Pazar"),
    ("Cukovac", "STK Cukovac", "Sjenica"),
    ("Tutin", "STK Tutin", "Tutin"),
    ("Pacijenti", "STK Pacijenti", "Novi Pazar"),
    ("Duga Poljana", "STK Duga Poljana", "Sjenica"),
]

PLAYERS = {
    "Stari Ras": ["Veljko Kostić", "Veselin Veselinović", "Vito Tomović", "Luka Radisavljević"],
    "PZ Spin": ["Ahmed Tuzinac", "Zinedin Grišević", "Mesud Nikšić", "Vladimir Ðorđević"],
    "Metalux": ["Sead Tutić", "Aldin Idrizović", "Aldin Aljušević", "Dževad Idrizovic"],
    "Panteri": ["Slaviša Jaćovic", "Dušan Milenković", "Aleksandar Vujanac", "Slaviša Tiosavljević"],
    "Has Pazarci": ["Džemil Bihorac", "Eco Nikšić", "Nerko Hamzagić"],
    "Cukovac": ["Eldar Idrizović", "Zejd Baljinac", "Aldin Baljinac", "Nermin Crnovršanin", "Mirza Buđevac"],
    "Tutin": ["Amra Halilović", "Armin Manić", "Almin Halilović", "Enes Seferović", "Asmir Kahrović"],
    "Pacijenti": ["Adnan Kolašinac", "Suljo Pepić", "Sabe Murić", "Amir Kajkuš"],
    "Duga Poljana": ["Alen Turković", "Metko Džigal", "Bakir Kadrić", "Denis Ljajić", "Bakir Hamidović"],
}

ROUND_DATES = {
    1: "2026-05-03",
    2: "2026-05-03",
    3: "2026-05-10",
    4: "2026-05-10",
    5: "2026-05-17",
    6: "2026-05-17",
    7: "2026-05-24",
    8: "2026-05-24",
    9: "2026-05-31",
}

SCHEDULE = {
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

# Match results: key = (round_number, home_team, away_team)
# Value = list of games, each game is:
#   (home_player, away_player, home_designation, away_designation, is_doubles, [(hp, ap), ...])
#   For doubles: home_player is "Player1/Player2", same for away
RESULTS = {
    (1, "Cukovac", "Tutin"): {
        "home_score": 3, "away_score": 4,
        "games": [
            ("Eldar Idrizović", "Armin Manić", "A", "Y", False, [(12, 10), (11, 6), (13, 11)]),
            ("Zejd Baljinac", "Almin Halilović", "B", "X", False, [(11, 6), (11, 7), (12, 10), (0, 1)]),
            ("Mirza Buđevac", "Amra Halilović", "C", "Z", False, [(1, 11), (11, 6), (6, 11), (1, 11)]),
            ("Nermin Crnovršanin", "Enes Seferović", "A", "X", False, [(11, 9), (9, 11), (7, 11), (1, 11)]),
            ("Mirza Buđevac", "Armin Manić", "C", "Y", False, [(13, 11), (11, 8), (14, 16), (7, 11), (11, 8)]),
            ("Zejd Baljinac", "Amra Halilović", "B", "Z", False, [(11, 9), (7, 11), (8, 11), (12, 14)]),
            ("Zejd Baljinac/Eldar Idrizović", "Amra Halilović/Almin Halilović", "A", "X", True, [(3, 11), (9, 11), (3, 11)]),
        ],
    },
    (1, "PZ Spin", "Metalux"): {
        "home_score": 2, "away_score": 4,
        "games": [
            ("Zinedin Grišević", "Sead Tutić", "A", "Y", False, [(0, 1), (0, 1), (0, 1)]),
            ("Ahmed Tuzinac", "Dževad Idrizovic", "B", "X", False, [(1, 0), (0, 1), (0, 1), (0, 1)]),
            ("Mesud Nikšić", "Aldin Aljušević", "C", "Z", False, [(1, 0), (1, 0), (1, 0)]),
            ("Zinedin Grišević", "Dževad Idrizovic", "A", "X", False, [(11, 7), (11, 5), (11, 6)]),
            ("Mesud Nikšić", "Sead Tutić", "C", "Y", False, [(1, 11), (5, 11), (8, 11)]),
            ("Ahmed Tuzinac", "Aldin Aljušević", "B", "Z", False, [(1, 0), (0, 1), (0, 1), (0, 1)]),
        ],
    },
    (1, "Pacijenti", "Duga Poljana"): {
        "home_score": 4, "away_score": 3,
        "games": [
            ("Adnan Kolašinac", "Alen Turković", "A", "Y", False, [(7, 11), (11, 8), (8, 11), (11, 8), (11, 8)]),
            ("Suljo Pepić", "Metko Džigal", "B", "X", False, [(8, 11), (9, 11), (7, 11)]),
            ("Sabe Murić", "Bakir Kadrić", "C", "Z", False, [(3, 11), (9, 11), (8, 11), (11, 6), (11, 6)]),
            ("Adnan Kolašinac", "Metko Džigal", "A", "X", False, [(1, 0), (1, 0), (1, 0)]),
            ("Sabe Murić", "Alen Turković", "C", "Y", False, [(8, 11), (7, 11), (11, 5), (6, 11)]),
            ("Suljo Pepić", "Bakir Kadrić", "B", "Z", False, [(11, 5), (11, 9), (11, 3)]),
            ("Adnan Kolašinac/Suljo Pepić", "Alen Turković/Metko Džigal", "A", "X", True, [(0, 1), (1, 0), (1, 0), (1, 0)]),
        ],
    },
    (2, "Cukovac", "Duga Poljana"): {
        "home_score": 1, "away_score": 4,
        "games": [
            ("Aldin Baljinac", "Alen Turković", "A", "Y", False, [(11, 6), (11, 0), (11, 8)]),
            ("Eldar Idrizović", "Metko Džigal", "B", "X", False, [(8, 11), (10, 12), (3, 11)]),
            ("Mirza Buđevac", "Bakir Kadrić", "C", "Z", False, [(7, 11), (7, 11), (11, 9), (11, 9), (7, 11)]),
            ("Aldin Baljinac", "Metko Džigal", "A", "X", False, [(11, 9), (8, 11), (9, 11), (5, 11)]),
            ("Zejd Baljinac", "Alen Turković", "C", "Y", False, [(8, 11), (11, 8), (9, 11), (8, 11)]),
        ],
    },
    (2, "PZ Spin", "Pacijenti"): {
        "home_score": 0, "away_score": 4,
        "games": [
            ("Zinedin Grišević", "Adnan Kolašinac", "A", "Y", False, [(0, 1), (0, 1), (0, 1), (1, 0)]),
            ("Ahmed Tuzinac", "Suljo Pepić", "B", "X", False, [(2, 11), (2, 11), (1, 11)]),
            ("Mesud Nikšić", "Sabe Murić", "C", "Z", False, [(4, 11), (11, 6), (1, 0), (9, 11), (4, 11)]),
            ("Zinedin Grišević", "Suljo Pepić", "A", "X", False, [(4, 11), (4, 11), (3, 11)]),
        ],
    },
    (3, "Stari Ras", "Tutin"): {
        "home_score": 4, "away_score": 0,
        "games": [
            ("Vito Tomović", "Almin Halilović", "A", "Y", False, [(11, 5), (11, 5), (11, 7)]),
            ("Veljko Kostić", "Armin Manić", "B", "X", False, [(11, 6), (11, 7), (11, 7)]),
            ("Veselin Veselinović", "Amra Halilović", "C", "Z", False, [(12, 10), (12, 14), (11, 8), (11, 5)]),
            ("Vito Tomović", "Enes Seferović", "A", "X", False, [(11, 3), (11, 3), (11, 3)]),
        ],
    },
    (4, "Stari Ras", "Metalux"): {
        "home_score": 4, "away_score": 2,
        "games": [
            ("Veljko Kostić", "Sead Tutić", "A", "Y", False, [(3, 11), (9, 11), (11, 13)]),
            ("Veselin Veselinović", "Aldin Aljušević", "B", "X", False, [(11, 9), (14, 12), (11, 6)]),
            ("Vito Tomović", "Dževad Idrizovic", "C", "Z", False, [(11, 6), (11, 3), (12, 10)]),
            ("Veljko Kostić", "Aldin Aljušević", "A", "X", False, [(11, 3), (13, 11), (11, 6)]),
            ("Vito Tomović", "Sead Tutić", "C", "Y", False, [(4, 11), (12, 14), (6, 11)]),
            ("Veselin Veselinović", "Dževad Idrizovic", "B", "Z", False, [(11, 8), (12, 10), (8, 11), (11, 4)]),
        ],
    },
}


class Command(BaseCommand):
    help = "Seed teams, players, schedule, and results for the league"

    def handle(self, *args, **options):
        # Create teams
        team_map = {}
        for name, full_name, city in TEAMS:
            team, created = Team.objects.get_or_create(
                name=name, defaults={"full_name": full_name, "city": city}
            )
            team_map[name] = team
            self.stdout.write(f"  {'Created' if created else 'Exists'}: {full_name}")

        # Create players
        player_map = {}
        for team_name, player_names in PLAYERS.items():
            team = team_map[team_name]
            for pname in player_names:
                player, created = Player.objects.get_or_create(
                    name=pname, team=team
                )
                player_map[pname] = player
                if created:
                    self.stdout.write(f"    + {pname}")

        # Create rounds and matches
        match_map = {}
        for round_number, entries in SCHEDULE.items():
            round_obj, _ = Round.objects.get_or_create(
                round_number=round_number,
                defaults={"date": ROUND_DATES.get(round_number)},
            )
            if round_obj.date is None and round_number in ROUND_DATES:
                round_obj.date = ROUND_DATES[round_number]
                round_obj.save()

            bye_team_name = entries[-1]
            matches = entries[:-1]

            ByeRound.objects.get_or_create(
                round=round_obj, defaults={"team": team_map[bye_team_name]}
            )

            for home_name, away_name in matches:
                match, created = Match.objects.get_or_create(
                    round=round_obj,
                    home_team=team_map[home_name],
                    away_team=team_map[away_name],
                )
                match_map[(round_number, home_name, away_name)] = match
                if created:
                    self.stdout.write(f"  Kolo {round_number}: {home_name} vs {away_name}")

        # Seed results
        for key, result_data in RESULTS.items():
            match = match_map.get(key)
            if not match:
                self.stdout.write(self.style.WARNING(f"  Match not found: {key}"))
                continue

            if match.is_completed:
                self.stdout.write(f"  Already completed: {match}")
                continue

            match.games.all().delete()

            home_score = result_data["home_score"]
            away_score = result_data["away_score"]

            for gi, game_data in enumerate(result_data["games"]):
                home_name, away_name, h_des, a_des, is_doubles, sets_data = game_data

                # Handle doubles (names like "Player1/Player2")
                home_player_2 = None
                away_player_2 = None
                if is_doubles:
                    h_names = home_name.split("/")
                    a_names = away_name.split("/")
                    home_player = player_map[h_names[0]]
                    home_player_2 = player_map[h_names[1]] if len(h_names) > 1 else None
                    away_player = player_map[a_names[0]]
                    away_player_2 = player_map[a_names[1]] if len(a_names) > 1 else None
                else:
                    home_player = player_map[home_name]
                    away_player = player_map[away_name]

                home_sets = sum(1 for hp, ap in sets_data if hp > ap)
                away_sets = sum(1 for hp, ap in sets_data if ap > hp)

                game = Game.objects.create(
                    match=match,
                    game_number=gi + 1,
                    home_player=home_player,
                    away_player=away_player,
                    home_player_2=home_player_2,
                    away_player_2=away_player_2,
                    home_designation=h_des,
                    away_designation=a_des,
                    home_sets_won=home_sets,
                    away_sets_won=away_sets,
                    is_doubles=is_doubles,
                )

                for si, (hp, ap) in enumerate(sets_data):
                    SetScore.objects.create(
                        game=game,
                        set_number=si + 1,
                        home_points=hp,
                        away_points=ap,
                    )

            match.home_score = home_score
            match.away_score = away_score
            match.is_completed = True
            match.save()
            self.stdout.write(self.style.SUCCESS(f"  Result: {match}"))

        self.stdout.write(self.style.SUCCESS("\nDone! Seeded teams, players, schedule, and results."))
