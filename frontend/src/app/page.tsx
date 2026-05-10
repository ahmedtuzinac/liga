import { api } from "@/lib/api";
import StandingsTable from "@/components/ui/StandingsTable";
import MatchCard from "@/components/ui/MatchCard";
import Link from "next/link";

export default async function HomePage() {
  const [standings, rounds] = await Promise.all([
    api.getStandings(),
    api.getRounds(),
  ]);

  // Find current round (first round with incomplete matches, or last round)
  const currentRound =
    rounds.find((r) => (r.completed_count ?? 0) < (r.match_count ?? 4)) ||
    rounds[rounds.length - 1];

  // Get full round data with matches
  const roundDetail = currentRound
    ? await api.getRound(currentRound.round_number)
    : null;

  return (
    <div>
      {/* Hero */}
      <div className="mb-10 text-center">
        <span className="inline-block rounded-full bg-accent/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
          Prolece 2026
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
          Medjuopstinska{" "}
          <span className="text-accent">Liga</span>
        </h1>
        <p className="mt-2 text-muted">
          Novi Pazar &bull; Sjenica &bull; Tutin
        </p>
        <p className="mt-1 text-xs text-muted/60">
          STA Tutic &bull; 9 timova &bull; 9 kola
        </p>
      </div>

      {/* Standings */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Tabela
          </h2>
          <Link
            href="/standings"
            className="text-xs font-medium text-accent transition-colors hover:text-accent-light"
          >
            Kompletna tabela &rarr;
          </Link>
        </div>
        <StandingsTable standings={standings} />
      </section>

      {/* Current Round */}
      {roundDetail && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <span className="h-2 w-2 rounded-full bg-accent" />
              {roundDetail.round_number}. Kolo
            </h2>
            <Link
              href="/schedule"
              className="text-xs font-medium text-accent transition-colors hover:text-accent-light"
            >
              Sva kola &rarr;
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {roundDetail.matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
          {roundDetail.bye && (
            <p className="mt-3 text-center text-xs italic text-muted">
              Odmara: {roundDetail.bye.team_name}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
