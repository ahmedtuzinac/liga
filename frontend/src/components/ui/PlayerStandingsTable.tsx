import Link from "next/link";
import type { PlayerStanding } from "@/lib/types";

export default function PlayerStandingsTable({
  standings,
}: {
  standings: PlayerStanding[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-card-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-accent bg-card-bg text-xs uppercase tracking-wider text-muted">
            <th className="px-4 py-3 text-center font-semibold">#</th>
            <th className="px-4 py-3 text-left font-semibold">Igrac</th>
            <th className="hidden px-4 py-3 text-left font-semibold sm:table-cell">
              Tim
            </th>
            <th className="px-4 py-3 text-center font-semibold">O</th>
            <th className="px-4 py-3 text-center font-semibold">W</th>
            <th className="px-4 py-3 text-center font-semibold">L</th>
            <th className="px-4 py-3 text-center font-semibold">%</th>
            <th className="hidden px-4 py-3 text-center font-semibold sm:table-cell">
              S+
            </th>
            <th className="hidden px-4 py-3 text-center font-semibold sm:table-cell">
              S-
            </th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr
              key={s.player_id}
              className="border-b border-card-border/50 transition-colors hover:bg-card-bg/50"
            >
              <td className="px-4 py-3 text-center font-bold text-accent">
                <span
                  className={
                    i < 3
                      ? "inline-block rounded-md bg-accent/10 px-2 py-0.5"
                      : ""
                  }
                >
                  {i + 1}
                </span>
              </td>
              <td className="px-4 py-3 font-semibold">
                <Link
                  href={`/players/${s.player_id}`}
                  className="transition-colors hover:text-accent"
                >
                  {s.player_name}
                </Link>
              </td>
              <td className="hidden px-4 py-3 text-muted sm:table-cell">
                {s.team_name}
              </td>
              <td className="px-4 py-3 text-center tabular-nums">{s.played}</td>
              <td className="px-4 py-3 text-center tabular-nums">{s.wins}</td>
              <td className="px-4 py-3 text-center tabular-nums">{s.losses}</td>
              <td className="px-4 py-3 text-center font-bold tabular-nums">
                {s.win_pct}%
              </td>
              <td className="hidden px-4 py-3 text-center tabular-nums sm:table-cell">
                {s.sets_won}
              </td>
              <td className="hidden px-4 py-3 text-center tabular-nums sm:table-cell">
                {s.sets_lost}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
