from django.db import models


class Team(models.Model):
    name = models.CharField(max_length=100)
    full_name = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.full_name


class Player(models.Model):
    name = models.CharField(max_length=200)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="players")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.team.name})"


class Round(models.Model):
    round_number = models.IntegerField(unique=True)
    date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["round_number"]

    def __str__(self):
        return f"Kolo {self.round_number}"


class Match(models.Model):
    round = models.ForeignKey(Round, on_delete=models.CASCADE, related_name="matches")
    home_team = models.ForeignKey(
        Team, on_delete=models.CASCADE, related_name="home_matches"
    )
    away_team = models.ForeignKey(
        Team, on_delete=models.CASCADE, related_name="away_matches"
    )
    home_score = models.IntegerField(default=0)
    away_score = models.IntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["round__round_number", "id"]

    def __str__(self):
        score = f" ({self.home_score}:{self.away_score})" if self.is_completed else ""
        return f"{self.home_team.name} vs {self.away_team.name}{score}"


class ByeRound(models.Model):
    round = models.OneToOneField(
        Round, on_delete=models.CASCADE, related_name="bye"
    )
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="bye_rounds")

    def __str__(self):
        return f"Kolo {self.round.round_number}: {self.team.name} odmara"


class Game(models.Model):
    DESIGNATION_CHOICES_HOME = [("A", "A"), ("B", "B"), ("C", "C")]
    DESIGNATION_CHOICES_AWAY = [("X", "X"), ("Y", "Y"), ("Z", "Z")]

    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name="games")
    game_number = models.IntegerField()
    home_player = models.ForeignKey(
        Player, on_delete=models.CASCADE, related_name="home_games"
    )
    away_player = models.ForeignKey(
        Player, on_delete=models.CASCADE, related_name="away_games"
    )
    home_player_2 = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="home_doubles_games",
        null=True,
        blank=True,
    )
    away_player_2 = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="away_doubles_games",
        null=True,
        blank=True,
    )
    home_designation = models.CharField(max_length=1, choices=DESIGNATION_CHOICES_HOME)
    away_designation = models.CharField(max_length=1, choices=DESIGNATION_CHOICES_AWAY)
    home_sets_won = models.IntegerField(default=0)
    away_sets_won = models.IntegerField(default=0)
    is_doubles = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["match", "game_number"]

    def __str__(self):
        return (
            f"#{self.game_number}: {self.home_player.name} vs "
            f"{self.away_player.name} ({self.home_sets_won}:{self.away_sets_won})"
        )


class SetScore(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="sets")
    set_number = models.IntegerField()
    home_points = models.IntegerField()
    away_points = models.IntegerField()

    class Meta:
        ordering = ["game", "set_number"]
        unique_together = ["game", "set_number"]

    def __str__(self):
        return f"Set {self.set_number}: {self.home_points}:{self.away_points}"
