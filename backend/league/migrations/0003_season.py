import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("league", "0002_game_away_player_2_game_home_player_2"),
    ]

    operations = [
        migrations.CreateModel(
            name="Season",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=20, unique=True)),
                ("slug", models.SlugField(max_length=20, unique=True)),
                ("is_active", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ["-name"],
            },
        ),
        migrations.AddField(
            model_name="team",
            name="season",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="teams",
                to="league.season",
            ),
        ),
        migrations.AddField(
            model_name="round",
            name="season",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="rounds",
                to="league.season",
            ),
        ),
    ]
