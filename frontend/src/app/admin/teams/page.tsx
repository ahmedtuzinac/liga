"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import type { Team } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPlayerName, setNewPlayerName] = useState<Record<number, string>>(
    {}
  );

  async function fetchTeams() {
    const res = await fetch(`${API_BASE}/teams/`);
    const data = await res.json();
    // Fetch full details for each team to get players
    const detailed = await Promise.all(
      data.map(async (t: Team) => {
        const r = await fetch(`${API_BASE}/teams/${t.id}/`);
        return r.json();
      })
    );
    setTeams(detailed);
    setLoading(false);
  }

  useEffect(() => {
    fetchTeams();
  }, []);

  async function addPlayer(teamId: number) {
    const name = newPlayerName[teamId]?.trim();
    if (!name) return;
    await adminApi.addPlayer(name, teamId);
    setNewPlayerName((prev) => ({ ...prev, [teamId]: "" }));
    fetchTeams();
  }

  async function deletePlayer(playerId: number) {
    await adminApi.deletePlayer(playerId);
    fetchTeams();
  }

  if (loading) {
    return <div className="text-center text-muted">Ucitavanje...</div>;
  }

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold">
        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        Upravljanje timovima
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <div
            key={team.id}
            className="rounded-xl border border-card-border bg-card-bg p-5"
          >
            <h2 className="mb-1 text-lg font-bold">{team.full_name}</h2>
            <p className="mb-3 text-xs text-muted">{team.city}</p>

            {/* Players list */}
            <div className="mb-3 space-y-1">
              {team.players && team.players.length > 0 ? (
                team.players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between rounded-lg bg-background/50 px-3 py-1.5"
                  >
                    <span className="text-sm">{player.name}</span>
                    <button
                      onClick={() => deletePlayer(player.id)}
                      className="text-xs text-muted transition-colors hover:text-danger"
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs italic text-muted">Nema igraca</p>
              )}
            </div>

            {/* Add player form */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ime igraca"
                value={newPlayerName[team.id] || ""}
                onChange={(e) =>
                  setNewPlayerName((prev) => ({
                    ...prev,
                    [team.id]: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") addPlayer(team.id);
                }}
                className="flex-1 rounded-lg border border-card-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
              />
              <button
                onClick={() => addPlayer(team.id)}
                className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-background hover:bg-accent-light"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
