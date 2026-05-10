import { api } from "@/lib/api";
import Link from "next/link";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await api.getMatch(parseInt(id));

  return (
    <div>
      <Link
        href={`/rounds/${match.round}`}
        className="mb-4 inline-block text-xs font-medium text-accent hover:text-accent-light"
      >
        &larr; {match.round}. Kolo
      </Link>

      {/* Score header */}
      <div className="mb-8 rounded-xl border border-card-border bg-card-bg p-6 text-center">
        <div className="flex items-center justify-center gap-6">
          <div className="flex-1 text-right">
            <h2 className="text-xl font-bold">{match.home_team_name}</h2>
          </div>
          <div className="rounded-lg bg-accent/10 px-6 py-2 text-3xl font-extrabold tabular-nums text-accent-light">
            {match.is_completed
              ? `${match.home_score} : ${match.away_score}`
              : "- : -"}
          </div>
          <div className="flex-1 text-left">
            <h2 className="text-xl font-bold">{match.away_team_name}</h2>
          </div>
        </div>
        {!match.is_completed && (
          <p className="mt-3 text-sm text-muted">Mec jos nije odigran</p>
        )}
      </div>

      {/* Games */}
      {match.games && match.games.length > 0 && (() => {
        // Detect substitutions: first player on each designation is the original
        const homeOriginal: Record<string, number> = {};
        const awayOriginal: Record<string, number> = {};
        for (const g of match.games) {
          if (!g.is_doubles) {
            if (!(g.home_designation in homeOriginal)) homeOriginal[g.home_designation] = g.home_player;
            if (!(g.away_designation in awayOriginal)) awayOriginal[g.away_designation] = g.away_player;
          }
        }

        return (
        <div className="rounded-xl border border-card-border bg-card-bg">
          {match.games.map((game) => {
            const homeWon = game.home_sets_won > game.away_sets_won;
            const homeSubbed = !game.is_doubles && homeOriginal[game.home_designation] !== game.home_player;
            const awaySubbed = !game.is_doubles && awayOriginal[game.away_designation] !== game.away_player;
            return (
              <div
                key={game.id}
                className="border-b border-card-border/50 px-5 py-4 last:border-0"
              >
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-muted/50">
                      {game.game_number}
                    </span>
                    <span className="text-[11px] font-bold text-muted/40">
                      {game.is_doubles ? "D" : game.home_designation}
                    </span>
                    <span
                      className={`font-medium ${
                        homeWon ? "text-foreground" : "text-muted"
                      }`}
                    >
                      {game.home_player_name}
                      {game.is_doubles && game.home_player_2_name && (
                        <> / {game.home_player_2_name}</>
                      )}
                    </span>
                    {homeSubbed && (
                      <span className="text-[10px] text-accent">zamena</span>
                    )}
                  </div>
                  <span
                    className={`min-w-[52px] rounded-md px-3 py-1 text-center font-bold tabular-nums ${
                      homeWon
                        ? "bg-success/15 text-success"
                        : "bg-accent/10 text-accent-light"
                    }`}
                  >
                    {game.home_sets_won} : {game.away_sets_won}
                  </span>
                  <div className="flex items-center justify-end gap-1">
                    {awaySubbed && (
                      <span className="text-[10px] text-accent">zamena</span>
                    )}
                    <span
                      className={`font-medium ${
                        !homeWon ? "text-foreground" : "text-muted"
                      }`}
                    >
                      {game.away_player_name}
                      {game.is_doubles && game.away_player_2_name && (
                        <> / {game.away_player_2_name}</>
                      )}
                    </span>
                    <span className="text-[11px] font-bold text-muted/40">
                      {game.is_doubles ? "D" : game.away_designation}
                    </span>
                  </div>
                </div>
                {game.sets.length > 0 && (
                  <div className="mt-2 flex justify-center gap-2">
                    {game.sets.map((s) => (
                      <span
                        key={s.set_number}
                        className="rounded bg-card-border/40 px-2 py-0.5 text-xs font-medium tabular-nums text-muted"
                      >
                        {s.home_points}:{s.away_points}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        );
      })()}
    </div>
  );
}
