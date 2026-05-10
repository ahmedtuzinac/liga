"use client";

import { useState } from "react";
import type { Standing, PlayerStanding } from "@/lib/types";
import StandingsTable from "./StandingsTable";
import PlayerStandingsTable from "./PlayerStandingsTable";

export default function StandingsTabs({
  teamStandings,
  playerStandings,
}: {
  teamStandings: Standing[];
  playerStandings: PlayerStanding[];
}) {
  const [tab, setTab] = useState<"team" | "player">("team");

  return (
    <div>
      <div className="mb-4 flex gap-1 rounded-lg bg-card-bg p-1">
        <button
          onClick={() => setTab("team")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "team"
              ? "bg-accent text-background"
              : "text-muted hover:text-foreground"
          }`}
        >
          Po timu
        </button>
        <button
          onClick={() => setTab("player")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "player"
              ? "bg-accent text-background"
              : "text-muted hover:text-foreground"
          }`}
        >
          Po igracu
        </button>
      </div>
      {tab === "team" ? (
        <StandingsTable standings={teamStandings} />
      ) : (
        <PlayerStandingsTable standings={playerStandings} />
      )}
    </div>
  );
}
