from django.db import migrations


def assign_existing(apps, schema_editor):
    Season = apps.get_model("league", "Season")
    Team = apps.get_model("league", "Team")
    Round = apps.get_model("league", "Round")

    season, _ = Season.objects.get_or_create(
        slug="2025-2026", defaults={"name": "2025/2026", "is_active": True}
    )
    Team.objects.filter(season__isnull=True).update(season=season)
    Round.objects.filter(season__isnull=True).update(season=season)


class Migration(migrations.Migration):

    dependencies = [
        ("league", "0003_season"),
    ]

    operations = [
        migrations.RunPython(assign_existing, migrations.RunPython.noop),
    ]
