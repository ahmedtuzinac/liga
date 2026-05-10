import { api } from "@/lib/api";
import MatchCard from "@/components/ui/MatchCard";
import ScrollToRound from "@/components/ui/ScrollToRound";
import Link from "next/link";

export default async function SchedulePage() {
  const roundsList = await api.getRounds();

  // Fetch full details for each round (includes matches)
  const rounds = await Promise.all(
    roundsList.map((r) => api.getRound(r.round_number))
  );

  // Find next game day: nearest date >= today, scroll to first round of that date
  const today = new Date().toISOString().slice(0, 10);
  const nextGameDate = rounds
    .map((r) => r.date)
    .filter((d): d is string => d != null && d >= today)
    .sort()[0];
  // If no future date, fall back to first round with incomplete matches
  const nextRound = nextGameDate
    ? rounds.find((r) => r.date === nextGameDate)
    : rounds.find((r) => r.matches.some((m) => !m.is_completed));

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold">
        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        Raspored
      </h1>
      {nextRound && <ScrollToRound roundNumber={nextRound.round_number} />}
      <div className="space-y-8">
        {rounds.map((round) => (
          <section key={round.id} id={`round-${round.round_number}`}>
            <Link
              href={`/rounds/${round.round_number}`}
              className="mb-3 flex items-center justify-between"
            >
              <h2 className="text-lg font-bold">
                {round.round_number}. Kolo
                {round.date && (
                  <span className="ml-2 text-sm font-normal text-muted">
                    {new Date(round.date).toLocaleDateString("sr-Latn-RS")}
                  </span>
                )}
              </h2>
              <span className="text-xs text-muted">
                {round.matches.filter((m) => m.is_completed).length}/
                {round.matches.length} zavrseno
              </span>
            </Link>
            <div className="grid gap-3 sm:grid-cols-2">
              {round.matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
            {round.bye && (
              <p className="mt-2 text-center text-xs italic text-muted">
                Odmara: {round.bye.team_name}
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
