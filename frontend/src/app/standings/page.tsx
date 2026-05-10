import { api } from "@/lib/api";
import StandingsTabs from "@/components/ui/StandingsTabs";

export default async function StandingsPage() {
  const [teamStandings, playerStandings] = await Promise.all([
    api.getStandings(),
    api.getPlayerStandings(),
  ]);

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold">
        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        Tabela
      </h1>
      <StandingsTabs
        teamStandings={teamStandings}
        playerStandings={playerStandings}
      />
    </div>
  );
}
