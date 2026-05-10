import { api } from "@/lib/api";
import MatchCard from "@/components/ui/MatchCard";
import Link from "next/link";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = await api.getTeam(parseInt(id));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold">{team.full_name}</h1>
      <p className="mb-6 text-sm text-muted">{team.city}</p>

      {/* Players */}
      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Igraci
        </h2>
        {team.players.length > 0 ? (
          <div className="rounded-xl border border-card-border bg-card-bg">
            {team.players.map((player) => (
              <Link
                key={player.id}
                href={`/players/${player.id}`}
                className="block border-b border-card-border/50 px-5 py-3 font-medium transition-colors last:border-0 hover:text-accent"
              >
                {player.name}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm italic text-muted">
            Nema registrovanih igraca
          </p>
        )}
      </section>

      {/* Match history */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Odigrani mecevi
        </h2>
        {team.matches.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {team.matches.map((match) => (
              <MatchCard key={match.id} match={match} showRound />
            ))}
          </div>
        ) : (
          <p className="text-sm italic text-muted">
            Nema odigranih meceva
          </p>
        )}
      </section>
    </div>
  );
}
