import { api } from "@/lib/api";
import Link from "next/link";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await api.getPlayer(parseInt(id));

  return (
    <div>
      <Link
        href="/standings"
        className="mb-4 inline-block text-xs font-medium text-accent hover:text-accent-light"
      >
        &larr; Tabela
      </Link>

      {/* Player header */}
      <div className="mb-6 rounded-xl border border-card-border bg-card-bg p-6">
        <h1 className="text-2xl font-extrabold">{player.name}</h1>
        <Link
          href={`/teams/${player.team_id}`}
          className="text-sm text-muted hover:text-accent"
        >
          {player.team_full_name}
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Odigrano" value={player.played} />
        <StatCard label="Pobede" value={player.wins} />
        <StatCard label="Porazi" value={player.losses} />
        <StatCard
          label="Procenat"
          value={`${player.win_pct}%`}
          highlight
        />
      </div>

      {/* Sets stats */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <StatCard label="Setovi dobijeni" value={player.sets_won} />
        <StatCard label="Setovi izgubljeni" value={player.sets_lost} />
      </div>

      {/* Game history */}
      <h2 className="mb-3 text-lg font-bold">Istorija meceva</h2>
      {player.games.length === 0 ? (
        <p className="text-sm text-muted">Nema odigranih meceva.</p>
      ) : (
        <div className="rounded-xl border border-card-border bg-card-bg">
          {player.games.map((game) => (
            <Link
              key={game.game_id}
              href={`/matches/${game.match_id}`}
              className="block border-b border-card-border/50 px-5 py-4 transition-colors last:border-0 hover:bg-card-border/20"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[11px] font-semibold text-muted/60">
                  {game.round_number}. kolo
                </span>
                <span className="text-[11px] text-muted/40">
                  vs {game.opponent_team}
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <span className="font-medium">{player.name}</span>
                <span
                  className={`min-w-[52px] rounded-md px-3 py-1 text-center font-bold tabular-nums ${
                    game.won
                      ? "bg-success/15 text-success"
                      : "bg-accent/10 text-accent-light"
                  }`}
                >
                  {game.home_sets_won} : {game.away_sets_won}
                </span>
                <span className="text-right font-medium text-muted">
                  {game.opponent_name}
                </span>
              </div>
              {game.sets.length > 0 && (
                <div className="mt-2 flex justify-center gap-2">
                  {game.sets.map((s) => (
                    <span
                      key={s.set_number}
                      className="rounded bg-card-border/40 px-2 py-0.5 text-xs font-medium tabular-nums text-muted"
                    >
                      {s.player_points}:{s.opponent_points}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-4 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted/60">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-extrabold tabular-nums ${highlight ? "text-accent" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
