import type { Match, PlayerDetail, PlayerStanding, Round, Standing, Team } from "./types";

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
  getStandings: () => fetchApi<Standing[]>("/standings/"),
  getPlayerStandings: () => fetchApi<PlayerStanding[]>("/standings/players/"),
  getPlayer: (id: number) => fetchApi<PlayerDetail>(`/players/${id}/`),
  getRounds: () => fetchApi<Round[]>("/rounds/"),
  getRound: (number: number) => fetchApi<Round>(`/rounds/${number}/`),
  getMatch: (id: number) => fetchApi<Match>(`/matches/${id}/`),
  getTeams: () => fetchApi<Team[]>("/teams/"),
  getTeam: (id: number) => fetchApi<Team & { matches: Match[] }>(`/teams/${id}/`),
};
