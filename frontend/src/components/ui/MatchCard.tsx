import Link from "next/link";
import type { Match } from "@/lib/types";

export default function MatchCard({
  match,
  showRound = false,
}: {
  match: Match;
  showRound?: boolean;
}) {
  return (
    <Link
      href={`/matches/${match.id}`}
      className="block rounded-xl border border-card-border bg-card-bg p-5 transition-transform hover:-translate-y-0.5"
    >
      {showRound && (
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">
          {match.round}. Kolo
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 font-semibold">{match.home_team_name}</div>
        <div
          className={`rounded-lg px-4 py-1 text-xl font-extrabold tabular-nums ${
            match.is_completed
              ? "bg-accent/10 text-accent-light"
              : "bg-card-border/50 text-muted"
          }`}
        >
          {match.is_completed
            ? `${match.home_score} : ${match.away_score}`
            : "- : -"}
        </div>
        <div className="flex-1 text-right font-semibold">
          {match.away_team_name}
        </div>
      </div>
      {match.is_completed && (
        <div className="mt-2 text-xs text-muted">
          Zavrsen &bull;{" "}
          {match.home_score + match.away_score}{" "}
          {match.home_score + match.away_score === 1 ? "singl" : "singlova"}
        </div>
      )}
    </Link>
  );
}
