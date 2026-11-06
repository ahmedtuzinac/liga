from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils.text import slugify

from league.models import Player, Season, Team


class Command(BaseCommand):
    help = 'Create a new season, e.g. `create_season 2026/2027 [--copy-teams-from 2025-2026] [--activate]`'

    def add_arguments(self, parser):
        parser.add_argument("name", help='Season name, e.g. "2026/2027"')
        parser.add_argument(
            "--copy-teams-from",
            metavar="SLUG",
            help="Copy teams and players from an existing season (by slug)",
        )
        parser.add_argument(
            "--activate",
            action="store_true",
            help="Make this the active (default) season on the site",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        name = options["name"]
        slug = slugify(name.replace("/", "-"))

        if Season.objects.filter(slug=slug).exists():
            raise CommandError(f"Season {name} ({slug}) already exists")

        source = None
        if options["copy_teams_from"]:
            source = Season.objects.filter(slug=options["copy_teams_from"]).first()
            if source is None:
                raise CommandError(f"Season {options['copy_teams_from']} not found")

        season = Season.objects.create(
            name=name, slug=slug, is_active=options["activate"]
        )
        self.stdout.write(f"  Created season: {season.name} ({season.slug})")

        if source:
            for team in source.teams.prefetch_related("players"):
                new_team = Team.objects.create(
                    season=season,
                    name=team.name,
                    full_name=team.full_name,
                    city=team.city,
                )
                Player.objects.bulk_create(
                    Player(name=p.name, team=new_team) for p in team.players.all()
                )
                self.stdout.write(
                    f"    + {new_team.full_name} ({team.players.count()} igraca)"
                )

        active = Season.get_default()
        self.stdout.write(
            self.style.SUCCESS(f"\nDone! Active season: {active.name}")
        )
