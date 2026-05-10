from django.contrib import admin

from .models import ByeRound, Game, Match, Player, Round, SetScore, Team


class PlayerInline(admin.TabularInline):
    model = Player
    extra = 1


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ["full_name", "city"]
    inlines = [PlayerInline]


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ["name", "team"]
    list_filter = ["team"]


class MatchInline(admin.TabularInline):
    model = Match
    extra = 0


class ByeRoundInline(admin.StackedInline):
    model = ByeRound
    extra = 0


@admin.register(Round)
class RoundAdmin(admin.ModelAdmin):
    list_display = ["round_number", "date"]
    inlines = [MatchInline, ByeRoundInline]


class GameInline(admin.TabularInline):
    model = Game
    extra = 0


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ["__str__", "round", "is_completed"]
    list_filter = ["round", "is_completed"]
    inlines = [GameInline]


class SetScoreInline(admin.TabularInline):
    model = SetScore
    extra = 0


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ["__str__", "match"]
    inlines = [SetScoreInline]
