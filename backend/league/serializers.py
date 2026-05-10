from rest_framework import serializers

from .models import ByeRound, Game, Match, Player, Round, SetScore, Team


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ["id", "name", "team"]


class TeamSerializer(serializers.ModelSerializer):
    players = PlayerSerializer(many=True, read_only=True)

    class Meta:
        model = Team
        fields = ["id", "name", "full_name", "city", "players"]


class TeamListSerializer(serializers.ModelSerializer):
    player_count = serializers.IntegerField(source="players.count", read_only=True)

    class Meta:
        model = Team
        fields = ["id", "name", "full_name", "city", "player_count"]


class SetScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = SetScore
        fields = ["id", "set_number", "home_points", "away_points"]


class GameSerializer(serializers.ModelSerializer):
    sets = SetScoreSerializer(many=True, read_only=True)
    home_player_name = serializers.CharField(source="home_player.name", read_only=True)
    away_player_name = serializers.CharField(source="away_player.name", read_only=True)
    home_player_2_name = serializers.CharField(
        source="home_player_2.name", read_only=True, default=None
    )
    away_player_2_name = serializers.CharField(
        source="away_player_2.name", read_only=True, default=None
    )

    class Meta:
        model = Game
        fields = [
            "id",
            "game_number",
            "home_player",
            "away_player",
            "home_player_name",
            "away_player_name",
            "home_player_2",
            "away_player_2",
            "home_player_2_name",
            "away_player_2_name",
            "home_designation",
            "away_designation",
            "home_sets_won",
            "away_sets_won",
            "is_doubles",
            "sets",
        ]


class MatchSerializer(serializers.ModelSerializer):
    home_team_name = serializers.CharField(source="home_team.full_name", read_only=True)
    away_team_name = serializers.CharField(source="away_team.full_name", read_only=True)

    class Meta:
        model = Match
        fields = [
            "id",
            "round",
            "home_team",
            "away_team",
            "home_team_name",
            "away_team_name",
            "home_score",
            "away_score",
            "is_completed",
        ]


class MatchDetailSerializer(serializers.ModelSerializer):
    home_team_name = serializers.CharField(source="home_team.full_name", read_only=True)
    away_team_name = serializers.CharField(source="away_team.full_name", read_only=True)
    games = GameSerializer(many=True, read_only=True)

    class Meta:
        model = Match
        fields = [
            "id",
            "round",
            "home_team",
            "away_team",
            "home_team_name",
            "away_team_name",
            "home_score",
            "away_score",
            "is_completed",
            "games",
        ]


class ByeRoundSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source="team.full_name", read_only=True)

    class Meta:
        model = ByeRound
        fields = ["team", "team_name"]


class RoundSerializer(serializers.ModelSerializer):
    matches = MatchSerializer(many=True, read_only=True)
    bye = ByeRoundSerializer(read_only=True)

    class Meta:
        model = Round
        fields = ["id", "round_number", "date", "matches", "bye"]


class RoundListSerializer(serializers.ModelSerializer):
    match_count = serializers.IntegerField(source="matches.count", read_only=True)
    completed_count = serializers.SerializerMethodField()
    bye = ByeRoundSerializer(read_only=True)

    class Meta:
        model = Round
        fields = ["id", "round_number", "date", "match_count", "completed_count", "bye"]

    def get_completed_count(self, obj):
        return obj.matches.filter(is_completed=True).count()


class StandingsSerializer(serializers.Serializer):
    team_id = serializers.IntegerField()
    team_name = serializers.CharField()
    team_full_name = serializers.CharField()
    played = serializers.IntegerField()
    wins = serializers.IntegerField()
    losses = serializers.IntegerField()
    points = serializers.IntegerField()
    singles_won = serializers.IntegerField()
    singles_lost = serializers.IntegerField()
    sets_won = serializers.IntegerField()
    sets_lost = serializers.IntegerField()


# Admin serializers for result entry
class SetScoreInputSerializer(serializers.Serializer):
    set_number = serializers.IntegerField(min_value=1, max_value=5)
    home_points = serializers.IntegerField(min_value=0)
    away_points = serializers.IntegerField(min_value=0)


class GameInputSerializer(serializers.Serializer):
    game_number = serializers.IntegerField(min_value=1, max_value=7)
    home_player_id = serializers.IntegerField()
    away_player_id = serializers.IntegerField()
    home_player_2_id = serializers.IntegerField(required=False, default=None)
    away_player_2_id = serializers.IntegerField(required=False, default=None)
    home_designation = serializers.ChoiceField(choices=["A", "B", "C"])
    away_designation = serializers.ChoiceField(choices=["X", "Y", "Z"])
    is_doubles = serializers.BooleanField(default=False)
    sets = SetScoreInputSerializer(many=True)


class MatchResultInputSerializer(serializers.Serializer):
    games = GameInputSerializer(many=True)
