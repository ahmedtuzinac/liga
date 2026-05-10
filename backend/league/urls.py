from django.urls import path

from . import views

urlpatterns = [
    # Public
    path("standings/", views.standings, name="standings"),
    path("standings/players/", views.player_standings, name="player-standings"),
    path("players/<int:player_id>/", views.player_detail, name="player-detail"),
    path("rounds/", views.round_list, name="round-list"),
    path("rounds/<int:round_number>/", views.round_detail, name="round-detail"),
    path("matches/<int:match_id>/", views.match_detail, name="match-detail"),
    path("teams/", views.team_list, name="team-list"),
    path("teams/<int:team_id>/", views.team_detail, name="team-detail"),
    # Admin
    path("admin/login/", views.admin_login, name="admin-login"),
    path("admin/me/", views.admin_me, name="admin-me"),
    path("admin/rounds/", views.admin_rounds, name="admin-rounds"),
    path(
        "admin/matches/<int:match_id>/",
        views.admin_match_detail,
        name="admin-match-detail",
    ),
    path(
        "admin/matches/<int:match_id>/result/",
        views.submit_match_result,
        name="submit-result",
    ),
    path("admin/players/", views.admin_add_player, name="admin-add-player"),
    path(
        "admin/players/<int:player_id>/",
        views.admin_delete_player,
        name="admin-delete-player",
    ),
]
