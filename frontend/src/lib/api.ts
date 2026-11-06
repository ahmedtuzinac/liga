import type { Match, PlayerDetail, PlayerStanding, Round, Season, Standing, Team } from "./types";
import { seasonQuery } from "./season-cookie";

// Server-side (SSR) uses internal Docker URL, client-side uses public URL
const API_BASE =
  typeof window === "undefined"
    ? process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getSeasons: () => fetchApi<Season[]>("/seasons/"),
  getStandings: (season?: string) =>
    fetchApi<Standing[]>(`/standings/${seasonQuery(season)}`),
  getPlayerStandings: (season?: string) =>
    fetchApi<PlayerStanding[]>(`/standings/players/${seasonQuery(season)}`),
  getPlayer: (id: number) => fetchApi<PlayerDetail>(`/players/${id}/`),
  getRounds: (season?: string) => fetchApi<Round[]>(`/rounds/${seasonQuery(season)}`),
  getRound: (number: number, season?: string) =>
    fetchApi<Round>(`/rounds/${number}/${seasonQuery(season)}`),
  getMatch: (id: number) => fetchApi<Match>(`/matches/${id}/`),
  getTeams: (season?: string) => fetchApi<Team[]>(`/teams/${seasonQuery(season)}`),
  getTeam: (id: number) => fetchApi<Team & { matches: Match[] }>(`/teams/${id}/`),
};
