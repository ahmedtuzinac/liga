import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("league", "0004_assign_existing_to_2025_2026"),
    ]

    operations = [
        migrations.AlterField(
            model_name="team",
            name="season",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="teams",
                to="league.season",
            ),
        ),
        migrations.AlterField(
            model_name="round",
            name="season",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="rounds",
                to="league.season",
            ),
        ),
        migrations.AlterField(
            model_name="round",
            name="round_number",
            field=models.IntegerField(),
        ),
        migrations.AlterModelOptions(
            name="round",
            options={"ordering": ["season", "round_number"]},
        ),
        migrations.AlterUniqueTogether(
            name="round",
            unique_together={("season", "round_number")},
        ),
    ]
