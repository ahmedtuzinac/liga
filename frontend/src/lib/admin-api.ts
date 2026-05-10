import type { Match, Player } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tt_liga_token");
}

async function adminFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Token ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401) {
    localStorage.removeItem("tt_liga_token");
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface AdminRound {
  id: number;
  round_number: number;
  date: string | null;
  matches: Match[];
}

export interface AdminMatchDetail extends Match {
  games: Array<{
    id: number;
    game_number: number;
    home_player: number;
    away_player: number;
    home_player_name: string;
    away_player_name: string;
    home_player_2: number | null;
    away_player_2: number | null;
    home_player_2_name: string | null;
    away_player_2_name: string | null;
    home_designation: string;
    away_designation: string;
    home_sets_won: number;
    away_sets_won: number;
    is_doubles: boolean;
    sets: Array<{
      id: number;
      set_number: number;
      home_points: number;
      away_points: number;
    }>;
  }>;
  home_players: Player[];
  away_players: Player[];
}

export interface GameInput {
  game_number: number;
  home_player_id: number;
  away_player_id: number;
  home_player_2_id?: number | null;
  away_player_2_id?: number | null;
  home_designation: string;
  away_designation: string;
  is_doubles: boolean;
  sets: Array<{
    set_number: number;
    home_points: number;
    away_points: number;
  }>;
}

export const adminApi = {
  login: (username: string, password: string) =>
    adminFetch<{ token: string; username: string }>("/admin/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  me: () => adminFetch<{ username: string }>("/admin/me/"),

  getRounds: () => adminFetch<AdminRound[]>("/admin/rounds/"),

  getMatch: (id: number) =>
    adminFetch<AdminMatchDetail>(`/admin/matches/${id}/`),

  submitResult: (matchId: number, games: GameInput[]) =>
    adminFetch<Match>(`/admin/matches/${matchId}/result/`, {
      method: "POST",
      body: JSON.stringify({ games }),
    }),

  addPlayer: (name: string, teamId: number) =>
    adminFetch<Player>("/admin/players/", {
      method: "POST",
      body: JSON.stringify({ name, team_id: teamId }),
    }),

  deletePlayer: (playerId: number) =>
    adminFetch<void>(`/admin/players/${playerId}/`, {
      method: "DELETE",
    }),
};
