from django.contrib.auth import authenticate
from django.db.models import Q, Sum
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .models import Game, Match, Player, Round, SetScore, Team
from .serializers import (
    MatchDetailSerializer,
    MatchResultInputSerializer,
    MatchSerializer,
    PlayerSerializer,
    RoundListSerializer,
    RoundSerializer,
    StandingsSerializer,
    TeamListSerializer,
    TeamSerializer,
)


# ─── Public endpoints ────────────────────────────────────────────


@api_view(["GET"])
def standings(request):
    teams = Team.objects.all()
    standings_data = []

    for team in teams:
        completed_matches = Match.objects.filter(
            Q(home_team=team) | Q(away_team=team),
            is_completed=True,
        )

        played = completed_matches.count()
        wins = 0
        losses = 0
        singles_won = 0
        singles_lost = 0
        sets_won = 0
        sets_lost = 0

        for match in completed_matches:
            if match.home_team == team:
                singles_won += match.home_score
                singles_lost += match.away_score
                if match.home_score > match.away_score:
                    wins += 1
                else:
                    losses += 1
                # Count sets
                for game in match.games.all():
                    sets_won += game.home_sets_won
                    sets_lost += game.away_sets_won
            else:
                singles_won += match.away_score
                singles_lost += match.home_score
                if match.away_score > match.home_score:
                    wins += 1
                else:
                    losses += 1
                for game in match.games.all():
                    sets_won += game.away_sets_won
                    sets_lost += game.home_sets_won

        standings_data.append(
            {
                "team_id": team.id,
                "team_name": team.name,
                "team_full_name": team.full_name,
                "played": played,
                "wins": wins,
                "losses": losses,
                "points": wins * 2,
                "singles_won": singles_won,
                "singles_lost": singles_lost,
                "sets_won": sets_won,
                "sets_lost": sets_lost,
            }
        )

    # Sort by: points desc, then head-to-head (recursive), then singles diff, sets diff
    from collections import defaultdict

    def _h2h_points(team_id, group_ids):
        """Points from matches only against teams in group_ids."""
        pts = 0
        other_ids = [t for t in group_ids if t != team_id]
        for m in Match.objects.filter(
            Q(home_team_id=team_id, away_team_id__in=other_ids)
            | Q(away_team_id=team_id, home_team_id__in=other_ids),
            is_completed=True,
        ):
            if m.home_team_id == team_id and m.home_score > m.away_score:
                pts += 2
            elif m.away_team_id == team_id and m.away_score > m.home_score:
                pts += 2
        return pts

    def _resolve_group(entries):
        """Recursively resolve a group of tied teams using h2h."""
        if len(entries) <= 1:
            return entries

        ids = [e["team_id"] for e in entries]
        for e in entries:
            e["_h2h"] = _h2h_points(e["team_id"], ids)

        # Sub-group by h2h points
        h2h_groups = defaultdict(list)
        for e in entries:
            h2h_groups[e["_h2h"]].append(e)

        result = []
        for _h2h_val in sorted(h2h_groups.keys(), reverse=True):
            sub = h2h_groups[_h2h_val]
            if len(sub) == 1:
                result.extend(sub)
            elif len(sub) == len(entries):
                # h2h didn't break the tie — fall back to singles/sets diff
                sub.sort(
                    key=lambda x: (
                        x["singles_won"] - x["singles_lost"],
                        x["sets_won"] - x["sets_lost"],
                    ),
                    reverse=True,
                )
                result.extend(sub)
            else:
                # Smaller sub-group — recurse with narrower h2h
                result.extend(_resolve_group(sub))
        return result

    # Group by points, then resolve each group
    points_groups = defaultdict(list)
    for entry in standings_data:
        points_groups[entry["points"]].append(entry)

    standings_data = []
    for pts in sorted(points_groups.keys(), reverse=True):
        standings_data.extend(_resolve_group(points_groups[pts]))

    serializer = StandingsSerializer(standings_data, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def player_standings(request):
    players = Player.objects.select_related("team").all()
    data = []

    for player in players:
        home_games = Game.objects.filter(
            home_player=player, match__is_completed=True, is_doubles=False
        )
        away_games = Game.objects.filter(
            away_player=player, match__is_completed=True, is_doubles=False
        )

        wins = 0
        losses = 0
        sets_won = 0
        sets_lost = 0

        for g in home_games:
            sets_won += g.home_sets_won
            sets_lost += g.away_sets_won
            if g.home_sets_won > g.away_sets_won:
                wins += 1
            else:
                losses += 1

        for g in away_games:
            sets_won += g.away_sets_won
            sets_lost += g.home_sets_won
            if g.away_sets_won > g.home_sets_won:
                wins += 1
            else:
                losses += 1

        played = wins + losses
        if played == 0:
            continue

        data.append(
            {
                "player_id": player.id,
                "player_name": player.name,
                "team_name": player.team.name,
                "team_id": player.team.id,
                "played": played,
                "wins": wins,
                "losses": losses,
                "win_pct": round(wins / played * 100) if played > 0 else 0,
                "sets_won": sets_won,
                "sets_lost": sets_lost,
            }
        )

    data.sort(key=lambda x: (x["win_pct"], x["wins"], x["sets_won"] - x["sets_lost"]), reverse=True)
    return Response(data)


@api_view(["GET"])
def player_detail(request, player_id):
    try:
        player = Player.objects.select_related("team").get(id=player_id)
    except Player.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    home_games = Game.objects.filter(
        home_player=player, match__is_completed=True, is_doubles=False
    ).select_related("match__round", "match__home_team", "match__away_team", "away_player")

    away_games = Game.objects.filter(
        away_player=player, match__is_completed=True, is_doubles=False
    ).select_related("match__round", "match__home_team", "match__away_team", "home_player")

    wins = 0
    losses = 0
    sets_won = 0
    sets_lost = 0
    games_list = []

    for g in home_games:
        sets_won += g.home_sets_won
        sets_lost += g.away_sets_won
        won = g.home_sets_won > g.away_sets_won
        if won:
            wins += 1
        else:
            losses += 1
        set_scores = list(g.sets.values("set_number", "home_points", "away_points"))
        games_list.append({
            "game_id": g.id,
            "round_number": g.match.round.round_number,
            "match_id": g.match.id,
            "opponent_name": g.away_player.name,
            "opponent_team": g.match.away_team.name,
            "home_sets_won": g.home_sets_won,
            "away_sets_won": g.away_sets_won,
            "won": won,
            "sets": [{"set_number": s["set_number"], "player_points": s["home_points"], "opponent_points": s["away_points"]} for s in set_scores],
        })

    for g in away_games:
        sets_won += g.away_sets_won
        sets_lost += g.home_sets_won
        won = g.away_sets_won > g.home_sets_won
        if won:
            wins += 1
        else:
            losses += 1
        set_scores = list(g.sets.values("set_number", "home_points", "away_points"))
        games_list.append({
            "game_id": g.id,
            "round_number": g.match.round.round_number,
            "match_id": g.match.id,
            "opponent_name": g.home_player.name,
            "opponent_team": g.match.home_team.name,
            "home_sets_won": g.away_sets_won,
            "away_sets_won": g.home_sets_won,
            "won": won,
            "sets": [{"set_number": s["set_number"], "player_points": s["away_points"], "opponent_points": s["home_points"]} for s in set_scores],
        })

    games_list.sort(key=lambda x: x["round_number"])
    played = wins + losses

    return Response({
        "id": player.id,
        "name": player.name,
        "team_name": player.team.name,
        "team_full_name": player.team.full_name,
        "team_id": player.team.id,
        "played": played,
        "wins": wins,
        "losses": losses,
        "win_pct": round(wins / played * 100) if played > 0 else 0,
        "sets_won": sets_won,
        "sets_lost": sets_lost,
        "games": games_list,
    })


@api_view(["GET"])
def round_list(request):
    rounds = Round.objects.all()
    serializer = RoundListSerializer(rounds, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def round_detail(request, round_number):
    try:
        round_obj = Round.objects.get(round_number=round_number)
    except Round.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = RoundSerializer(round_obj)
    return Response(serializer.data)


@api_view(["GET"])
def match_detail(request, match_id):
    try:
        match = Match.objects.get(id=match_id)
    except Match.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = MatchDetailSerializer(match)
    return Response(serializer.data)


@api_view(["GET"])
def team_list(request):
    teams = Team.objects.all()
    serializer = TeamListSerializer(teams, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def team_detail(request, team_id):
    try:
        team = Team.objects.get(id=team_id)
    except Team.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = TeamSerializer(team)

    # Get match history
    matches = Match.objects.filter(
        Q(home_team=team) | Q(away_team=team),
        is_completed=True,
    )
    match_serializer = MatchSerializer(matches, many=True)

    data = serializer.data
    data["matches"] = match_serializer.data
    return Response(data)


# ─── Admin endpoints ─────────────────────────────────────────────


@api_view(["POST"])
def admin_login(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(username=username, password=password)
    if user and user.is_staff:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "username": user.username})
    return Response(
        {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_me(request):
    return Response({"username": request.user.username})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_rounds(request):
    rounds = Round.objects.all()
    data = []
    for r in rounds:
        matches = Match.objects.filter(round=r)
        data.append(
            {
                "id": r.id,
                "round_number": r.round_number,
                "date": r.date,
                "matches": MatchSerializer(matches, many=True).data,
            }
        )
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_match_detail(request, match_id):
    try:
        match = Match.objects.get(id=match_id)
    except Match.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    data = MatchDetailSerializer(match).data
    # Include players for both teams
    home_players = PlayerSerializer(
        Player.objects.filter(team=match.home_team), many=True
    ).data
    away_players = PlayerSerializer(
        Player.objects.filter(team=match.away_team), many=True
    ).data
    data["home_players"] = home_players
    data["away_players"] = away_players
    return Response(data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_add_player(request):
    name = request.data.get("name")
    team_id = request.data.get("team_id")
    if not name or not team_id:
        return Response(
            {"error": "name and team_id required"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        team = Team.objects.get(id=team_id)
    except Team.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    player = Player.objects.create(name=name, team=team)
    return Response(PlayerSerializer(player).data, status=status.HTTP_201_CREATED)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def admin_delete_player(request, player_id):
    try:
        player = Player.objects.get(id=player_id)
    except Player.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    player.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def submit_match_result(request, match_id):
    try:
        match = Match.objects.get(id=match_id)
    except Match.DoesNotExist:
        return Response(
            {"error": "Match not found"}, status=status.HTTP_404_NOT_FOUND
        )

    if match.is_completed:
        # Allow re-submission — clear existing games
        match.games.all().delete(
        )

    serializer = MatchResultInputSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    games_data = serializer.validated_data["games"]
    home_wins = 0
    away_wins = 0

    # Clear existing games if any
    match.games.all().delete()

    for game_data in games_data:
        sets_data = game_data.pop("sets")

        home_player = Player.objects.get(id=game_data["home_player_id"])
        away_player = Player.objects.get(id=game_data["away_player_id"])
        home_player_2 = (
            Player.objects.get(id=game_data["home_player_2_id"])
            if game_data.get("home_player_2_id")
            else None
        )
        away_player_2 = (
            Player.objects.get(id=game_data["away_player_2_id"])
            if game_data.get("away_player_2_id")
            else None
        )

        # Count sets won
        home_sets = sum(1 for s in sets_data if s["home_points"] > s["away_points"])
        away_sets = sum(1 for s in sets_data if s["away_points"] > s["home_points"])

        game = Game.objects.create(
            match=match,
            game_number=game_data["game_number"],
            home_player=home_player,
            away_player=away_player,
            home_player_2=home_player_2,
            away_player_2=away_player_2,
            home_designation=game_data["home_designation"],
            away_designation=game_data["away_designation"],
            home_sets_won=home_sets,
            away_sets_won=away_sets,
            is_doubles=game_data["is_doubles"],
        )

        for set_data in sets_data:
            SetScore.objects.create(game=game, **set_data)

        if home_sets > away_sets:
            home_wins += 1
        else:
            away_wins += 1

    match.home_score = home_wins
    match.away_score = away_wins
    match.is_completed = True
    match.save()

    return Response(
        MatchDetailSerializer(match).data, status=status.HTTP_201_CREATED
    )
