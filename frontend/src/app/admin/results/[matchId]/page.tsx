"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  adminApi,
  type AdminMatchDetail,
  type GameInput,
} from "@/lib/admin-api";
import type { Player } from "@/lib/types";

const PAIRINGS = [
  { home: "A", away: "Y" },
  { home: "B", away: "X" },
  { home: "C", away: "Z" },
  { home: "A", away: "X" },
  { home: "C", away: "Y" },
  { home: "B", away: "Z" },
];

interface GameForm {
  homePlayerId: number | null;
  awayPlayerId: number | null;
  sets: [number, number][];
}

export default function ResultEntryPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = use(params);
  const router = useRouter();
  const [match, setMatch] = useState<AdminMatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Player assignments: A, B, C for home; Y, X, Z for away
  const [homeAssign, setHomeAssign] = useState<Record<string, number | null>>({
    A: null,
    B: null,
    C: null,
  });
  const [awayAssign, setAwayAssign] = useState<Record<string, number | null>>({
    Y: null,
    X: null,
    Z: null,
  });

  // Multiple substitutions per team
  type Sub = { outId: number | null; inId: number | null; afterGame: number };
  const [homeSubs, setHomeSubs] = useState<Sub[]>([]);
  const [awaySubs, setAwaySubs] = useState<Sub[]>([]);

  // Game forms
  const [games, setGames] = useState<GameForm[]>(
    PAIRINGS.map(() => ({
      homePlayerId: null,
      awayPlayerId: null,
      sets: [
        [0, 0],
        [0, 0],
        [0, 0],
      ],
    }))
  );

  // Doubles
  const [showDoubles, setShowDoubles] = useState(false);
  const [doublesGame, setDoublesGame] = useState<GameForm>({
    homePlayerId: null,
    awayPlayerId: null,
    sets: [
      [0, 0],
      [0, 0],
      [0, 0],
    ],
  });
  const [doublesHomePair, setDoublesHomePair] = useState<[number | null, number | null]>([null, null]);
  const [doublesAwayPair, setDoublesAwayPair] = useState<[number | null, number | null]>([null, null]);

  useEffect(() => {
    adminApi
      .getMatch(parseInt(matchId))
      .then(setMatch)
      .finally(() => setLoading(false));
  }, [matchId]);

  // When assignments or subs change, update game player IDs
  useEffect(() => {
    setGames((prev) =>
      prev.map((g, i) => {
        let homeId = homeAssign[PAIRINGS[i].home];
        let awayId = awayAssign[PAIRINGS[i].away];

        // Apply all substitutions in order
        for (const sub of homeSubs) {
          if (sub.outId && sub.inId && i >= sub.afterGame) {
            if (homeId === sub.outId) homeId = sub.inId;
          }
        }
        for (const sub of awaySubs) {
          if (sub.outId && sub.inId && i >= sub.afterGame) {
            if (awayId === sub.outId) awayId = sub.inId;
          }
        }

        return { ...g, homePlayerId: homeId, awayPlayerId: awayId };
      })
    );
  }, [homeAssign, awayAssign, homeSubs, awaySubs]);

  function updateSet(
    gameIndex: number,
    setIndex: number,
    side: "home" | "away",
    value: number
  ) {
    setGames((prev) => {
      const updated = [...prev];
      const sets = [...updated[gameIndex].sets];
      sets[setIndex] = [...sets[setIndex]] as [number, number];
      sets[setIndex][side === "home" ? 0 : 1] = value;
      updated[gameIndex] = { ...updated[gameIndex], sets };
      return updated;
    });
  }

  function addSet(gameIndex: number) {
    setGames((prev) => {
      const updated = [...prev];
      if (updated[gameIndex].sets.length < 5) {
        updated[gameIndex] = {
          ...updated[gameIndex],
          sets: [...updated[gameIndex].sets, [0, 0]],
        };
      }
      return updated;
    });
  }

  function removeSet(gameIndex: number) {
    setGames((prev) => {
      const updated = [...prev];
      if (updated[gameIndex].sets.length > 1) {
        updated[gameIndex] = {
          ...updated[gameIndex],
          sets: updated[gameIndex].sets.slice(0, -1),
        };
      }
      return updated;
    });
  }

  function getGameScore(game: GameForm): [number, number] {
    let home = 0;
    let away = 0;
    for (const [h, a] of game.sets) {
      if (h > a) home++;
      else if (a > h) away++;
    }
    return [home, away];
  }

  function getMatchScore(): [number, number] {
    let home = 0;
    let away = 0;
    for (const game of games) {
      const [h, a] = getGameScore(game);
      if (h > a) home++;
      else if (a > h) away++;
    }
    if (showDoubles) {
      const [h, a] = getGameScore(doublesGame);
      if (h > a) home++;
      else if (a > h) away++;
    }
    return [home, away];
  }

  // How many games are active (stop when someone reaches 4)
  function getActiveGameCount(): number {
    let home = 0;
    let away = 0;
    for (let i = 0; i < games.length; i++) {
      if (home >= 4 || away >= 4) return i;
      const [h, a] = getGameScore(games[i]);
      if (h > a) home++;
      else if (a > h) away++;
    }
    return games.length;
  }

  async function handleSubmit() {
    setError("");

    // Validate assignments
    const homeValues = Object.values(homeAssign);
    const awayValues = Object.values(awayAssign);
    if (homeValues.some((v) => !v) || awayValues.some((v) => !v)) {
      setError("Dodeli sve igrace na pozicije A/B/C i X/Y/Z");
      return;
    }

    // Only validate active games (before someone reaches 4)
    const activeCount = getActiveGameCount();
    const playedGames = games.slice(0, activeCount);

    for (let i = 0; i < playedGames.length; i++) {
      const g = playedGames[i];
      const validSets = g.sets.filter(([h, a]) => h > 0 || a > 0);
      if (validSets.length === 0) {
        setError(`Unesi rezultate za ${i + 1}. mec`);
        return;
      }
    }

    setSubmitting(true);

    const gameInputs: GameInput[] = playedGames.map((g, i) => ({
      game_number: i + 1,
      home_player_id: g.homePlayerId!,
      away_player_id: g.awayPlayerId!,
      home_designation: PAIRINGS[i].home,
      away_designation: PAIRINGS[i].away,
      is_doubles: false,
      sets: g.sets
        .filter(([h, a]) => h > 0 || a > 0)
        .map(([h, a], si) => ({
          set_number: si + 1,
          home_points: h,
          away_points: a,
        })),
    }));

    // Include doubles if score is 3:3 after singles
    const [mH, mA] = getMatchScore();
    if (mH === 3 && mA === 3) {
      gameInputs.push({
        game_number: 7,
        home_player_id: doublesHomePair[0] || homeAssign.A!,
        away_player_id: doublesAwayPair[0] || awayAssign.Y!,
        home_player_2_id: doublesHomePair[1],
        away_player_2_id: doublesAwayPair[1],
        home_designation: "A",
        away_designation: "X",
        is_doubles: true,
        sets: doublesGame.sets
          .filter(([h, a]) => h > 0 || a > 0)
          .map(([h, a], si) => ({
            set_number: si + 1,
            home_points: h,
            away_points: a,
          })),
      });
    }

    try {
      await adminApi.submitResult(parseInt(matchId), gameInputs);
      router.push("/admin");
    } catch (err) {
      setError("Greska pri slanju rezultata");
    } finally {
      setSubmitting(false);
    }
  }

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (match && !match.is_completed) setEditing(true);
  }, [match]);

  function startEditing() {
    if (!match || !match.games || match.games.length === 0) {
      setEditing(true);
      return;
    }

    // Rebuild assignments from existing games
    const newHomeAssign: Record<string, number | null> = { A: null, B: null, C: null };
    const newAwayAssign: Record<string, number | null> = { Y: null, X: null, Z: null };

    for (const game of match.games) {
      if (game.home_designation in newHomeAssign) {
        newHomeAssign[game.home_designation] = game.home_player;
      }
      if (game.away_designation in newAwayAssign) {
        newAwayAssign[game.away_designation] = game.away_player;
      }
    }

    setHomeAssign(newHomeAssign);
    setAwayAssign(newAwayAssign);

    // Rebuild game forms from existing data
    const newGames: GameForm[] = PAIRINGS.map((pairing, i) => {
      const existingGame = match.games.find((g) => g.game_number === i + 1);
      if (existingGame) {
        const sets: [number, number][] = existingGame.sets.map((s) => [
          s.home_points,
          s.away_points,
        ]);
        // Ensure at least 3 set slots
        while (sets.length < 3) sets.push([0, 0]);
        return {
          homePlayerId: existingGame.home_player,
          awayPlayerId: existingGame.away_player,
          sets,
        };
      }
      return {
        homePlayerId: newHomeAssign[pairing.home],
        awayPlayerId: newAwayAssign[pairing.away],
        sets: [[0, 0], [0, 0], [0, 0]],
      };
    });

    setGames(newGames);

    // Rebuild doubles if exists
    const doublesGameData = match.games.find((g) => g.is_doubles);
    if (doublesGameData) {
      const sets: [number, number][] = doublesGameData.sets.map((s) => [
        s.home_points,
        s.away_points,
      ]);
      while (sets.length < 3) sets.push([0, 0]);
      setDoublesGame({
        homePlayerId: doublesGameData.home_player,
        awayPlayerId: doublesGameData.away_player,
        sets,
      });
      setDoublesHomePair([
        doublesGameData.home_player,
        doublesGameData.home_player_2 ?? null,
      ]);
      setDoublesAwayPair([
        doublesGameData.away_player,
        doublesGameData.away_player_2 ?? null,
      ]);
    }

    setEditing(true);
  }

  if (loading) {
    return <div className="text-center text-muted">Ucitavanje...</div>;
  }

  if (!match) {
    return <div className="text-center text-danger">Mec nije pronadjen</div>;
  }

  if (match.is_completed && !editing) {
    return (
      <div>
        <button
          onClick={() => router.push("/admin")}
          className="mb-4 text-xs font-medium text-accent hover:text-accent-light"
        >
          &larr; Nazad
        </button>
        <div className="mb-6 rounded-xl border border-card-border bg-card-bg p-6 text-center">
          <div className="flex items-center justify-center gap-6">
            <h2 className="flex-1 text-right text-xl font-bold">
              {match.home_team_name}
            </h2>
            <div className="rounded-lg bg-success/15 px-6 py-2 text-3xl font-extrabold tabular-nums text-success">
              {match.home_score} : {match.away_score}
            </div>
            <h2 className="flex-1 text-left text-xl font-bold">
              {match.away_team_name}
            </h2>
          </div>
          <p className="mt-3 text-sm text-success">Rezultat je unesen</p>
        </div>
        {match.games && match.games.length > 0 && (
          <div className="mb-6 rounded-xl border border-card-border bg-card-bg">
            {match.games.map((game) => {
              const homeWon = game.home_sets_won > game.away_sets_won;
              return (
                <div
                  key={game.id}
                  className={`border-b border-card-border/50 px-5 py-3 last:border-0 ${game.is_doubles ? "border-t-2 border-t-accent/30" : ""}`}
                >
                  {game.is_doubles && (
                    <div className="mb-2 text-center text-[11px] font-bold uppercase tracking-wider text-accent">
                      Dubl
                    </div>
                  )}
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-muted/50">
                        {game.game_number}
                      </span>
                      <span className="text-[11px] font-bold text-muted/40">
                        {game.is_doubles ? "D" : game.home_designation}
                      </span>
                      <span
                        className={`font-medium ${homeWon ? "text-foreground" : "text-muted"}`}
                      >
                        {game.home_player_name}
                        {game.is_doubles && game.home_player_2_name && (
                          <> / {game.home_player_2_name}</>
                        )}
                      </span>
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
                      <span
                        className={`font-medium ${!homeWon ? "text-foreground" : "text-muted"}`}
                      >
                        {game.away_player_name}
                        {game.is_doubles && game.away_player_2_name && (
                          <> / {game.away_player_2_name}</>
                        )}
                      </span>
                      <span className="text-[11px] font-bold text-muted/40">
                        {game.away_designation}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <button
          onClick={startEditing}
          className="w-full rounded-xl border border-accent bg-accent/10 py-3 text-lg font-bold text-accent transition-colors hover:bg-accent/20"
        >
          Izmeni rezultat
        </button>
      </div>
    );
  }

  const [matchHome, matchAway] = getMatchScore();

  return (
    <div>
      <button
        onClick={() => router.push("/admin")}
        className="mb-4 text-xs font-medium text-accent hover:text-accent-light"
      >
        &larr; Nazad
      </button>

      {/* Match header */}
      <div className="mb-6 rounded-xl border border-card-border bg-card-bg p-6 text-center">
        <div className="flex items-center justify-center gap-6">
          <h2 className="flex-1 text-right text-xl font-bold">
            {match.home_team_name}
          </h2>
          <div className="rounded-lg bg-accent/10 px-6 py-2 text-3xl font-extrabold tabular-nums text-accent-light">
            {matchHome} : {matchAway}
          </div>
          <h2 className="flex-1 text-left text-xl font-bold">
            {match.away_team_name}
          </h2>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-danger/10 px-4 py-2 text-center text-sm text-danger">
          {error}
        </p>
      )}

      {/* Player assignments */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <PlayerAssignment
          label="Domacin"
          teamName={match.home_team_name}
          players={match.home_players}
          designations={["A", "B", "C"]}
          assignments={homeAssign}
          onChange={setHomeAssign}
        />
        <PlayerAssignment
          label="Gost"
          teamName={match.away_team_name}
          players={match.away_players}
          designations={["Y", "X", "Z"]}
          assignments={awayAssign}
          onChange={setAwayAssign}
        />
      </div>

      {/* Substitutions */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <SubstitutionList
          label="Zamene — Domacin"
          players={match.home_players}
          assignedIds={Object.values(homeAssign).filter(Boolean) as number[]}
          subs={homeSubs}
          onChange={setHomeSubs}
        />
        <SubstitutionList
          label="Zamene — Gost"
          players={match.away_players}
          assignedIds={Object.values(awayAssign).filter(Boolean) as number[]}
          subs={awaySubs}
          onChange={setAwaySubs}
        />
      </div>

      {/* Games */}
      <div className="mb-6 space-y-3">
        {(() => {
          let runningHome = 0;
          let runningAway = 0;
          return games.map((game, gi) => {
            // Skip this game if match is already decided
            if (runningHome >= 4 || runningAway >= 4) return null;

            const [h, a] = getGameScore(game);
            // Update running score for next iteration
            if (h > a) runningHome++;
            else if (a > h) runningAway++;

            const originalHomeId = homeAssign[PAIRINGS[gi].home];
            const originalAwayId = awayAssign[PAIRINGS[gi].away];
            const homeName = getPlayerName(match.home_players, game.homePlayerId);
            const awayName = getPlayerName(match.away_players, game.awayPlayerId);
            const homeSubbed = game.homePlayerId !== originalHomeId && originalHomeId != null;
            const awaySubbed = game.awayPlayerId !== originalAwayId && originalAwayId != null;

          return (
            <div
              key={gi}
              className="rounded-xl border border-card-border bg-card-bg p-4"
            >
              <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted/50">
                    {gi + 1}.
                  </span>
                  <span className="text-xs font-bold text-muted/40">
                    {PAIRINGS[gi].home}
                  </span>
                  <span className="font-medium">
                    {homeName || "—"}
                  </span>
                  {homeSubbed && (
                    <span className="text-[10px] text-accent">zamena</span>
                  )}
                </div>
                <div
                  className={`min-w-[52px] rounded-md px-3 py-0.5 text-center text-sm font-bold tabular-nums ${
                    h > a
                      ? "bg-success/15 text-success"
                      : a > h
                        ? "bg-danger/15 text-danger"
                        : "bg-card-border/50 text-muted"
                  }`}
                >
                  {h} : {a}
                </div>
                <div className="flex items-center justify-end gap-2">
                  {awaySubbed && (
                    <span className="text-[10px] text-accent">zamena</span>
                  )}
                  <span className="font-medium">
                    {awayName || "—"}
                  </span>
                  <span className="text-xs font-bold text-muted/40">
                    {PAIRINGS[gi].away}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {game.sets.map((s, si) => (
                  <div key={si} className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={s[0] || ""}
                      onChange={(e) =>
                        updateSet(gi, si, "home", parseInt(e.target.value) || 0)
                      }
                      className="w-12 rounded border border-card-border bg-background px-2 py-1.5 text-center text-sm tabular-nums outline-none focus:border-accent"
                    />
                    <span className="text-xs text-muted">:</span>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={s[1] || ""}
                      onChange={(e) =>
                        updateSet(gi, si, "away", parseInt(e.target.value) || 0)
                      }
                      className="w-12 rounded border border-card-border bg-background px-2 py-1.5 text-center text-sm tabular-nums outline-none focus:border-accent"
                    />
                  </div>
                ))}
                <div className="flex gap-1">
                  {game.sets.length < 5 && (
                    <button
                      onClick={() => addSet(gi)}
                      className="rounded bg-card-border/50 px-2 py-1 text-xs text-muted hover:text-foreground"
                    >
                      +set
                    </button>
                  )}
                  {game.sets.length > 1 && (
                    <button
                      onClick={() => removeSet(gi)}
                      className="rounded bg-card-border/50 px-2 py-1 text-xs text-muted hover:text-foreground"
                    >
                      -set
                    </button>
                  )}
                </div>
              </div>
            </div>
            );
          });
        })()}
      </div>

      {/* Doubles — auto-show when 3:3 */}
      {matchHome === 3 && matchAway === 3 && (
        <div className="mb-6">
          <div className="rounded-xl border-2 border-accent/30 bg-card-bg p-4">
            <div className="mb-3 text-center text-sm font-bold text-accent">
              DUBL (3:3)
            </div>
            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase text-muted/60">
                  Domacin (2 igraca)
                </label>
                <select
                  value={doublesHomePair[0] || ""}
                  onChange={(e) => {
                    const id = parseInt(e.target.value) || null;
                    setDoublesHomePair([id, doublesHomePair[1]]);
                    setDoublesGame({ ...doublesGame, homePlayerId: id });
                  }}
                  className="mb-1 w-full rounded border border-card-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
                >
                  <option value="">— Igrac 1 —</option>
                  {match.home_players.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <select
                  value={doublesHomePair[1] || ""}
                  onChange={(e) =>
                    setDoublesHomePair([doublesHomePair[0], parseInt(e.target.value) || null])
                  }
                  className="w-full rounded border border-card-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
                >
                  <option value="">— Igrac 2 —</option>
                  {match.home_players
                    .filter((p) => p.id !== doublesHomePair[0])
                    .map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase text-muted/60">
                  Gost (2 igraca)
                </label>
                <select
                  value={doublesAwayPair[0] || ""}
                  onChange={(e) => {
                    const id = parseInt(e.target.value) || null;
                    setDoublesAwayPair([id, doublesAwayPair[1]]);
                    setDoublesGame({ ...doublesGame, awayPlayerId: id });
                  }}
                  className="mb-1 w-full rounded border border-card-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
                >
                  <option value="">— Igrac 1 —</option>
                  {match.away_players.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <select
                  value={doublesAwayPair[1] || ""}
                  onChange={(e) =>
                    setDoublesAwayPair([doublesAwayPair[0], parseInt(e.target.value) || null])
                  }
                  className="w-full rounded border border-card-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
                >
                  <option value="">— Igrac 2 —</option>
                  {match.away_players
                    .filter((p) => p.id !== doublesAwayPair[0])
                    .map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {doublesGame.sets.map((s, si) => (
                <div key={si} className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={s[0] || ""}
                    onChange={(e) => {
                      const updated = { ...doublesGame };
                      const sets = [...updated.sets];
                      sets[si] = [...sets[si]] as [number, number];
                      sets[si][0] = parseInt(e.target.value) || 0;
                      setDoublesGame({ ...updated, sets });
                    }}
                    className="w-12 rounded border border-card-border bg-background px-2 py-1.5 text-center text-sm tabular-nums outline-none focus:border-accent"
                  />
                  <span className="text-xs text-muted">:</span>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={s[1] || ""}
                    onChange={(e) => {
                      const updated = { ...doublesGame };
                      const sets = [...updated.sets];
                      sets[si] = [...sets[si]] as [number, number];
                      sets[si][1] = parseInt(e.target.value) || 0;
                      setDoublesGame({ ...updated, sets });
                    }}
                    className="w-12 rounded border border-card-border bg-background px-2 py-1.5 text-center text-sm tabular-nums outline-none focus:border-accent"
                  />
                </div>
              ))}
              <div className="flex gap-1">
                {doublesGame.sets.length < 5 && (
                  <button
                    onClick={() =>
                      setDoublesGame({
                        ...doublesGame,
                        sets: [...doublesGame.sets, [0, 0]],
                      })
                    }
                    className="rounded bg-card-border/50 px-2 py-1 text-xs text-muted hover:text-foreground"
                  >
                    +set
                  </button>
                )}
                {doublesGame.sets.length > 1 && (
                  <button
                    onClick={() =>
                      setDoublesGame({
                        ...doublesGame,
                        sets: doublesGame.sets.slice(0, -1),
                      })
                    }
                    className="rounded bg-card-border/50 px-2 py-1 text-xs text-muted hover:text-foreground"
                  >
                    -set
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full rounded-xl bg-accent py-3 text-lg font-bold text-background transition-colors hover:bg-accent-light disabled:opacity-50"
      >
        {submitting ? "Slanje..." : "Sacuvaj rezultat"}
      </button>
    </div>
  );
}

function PlayerAssignment({
  label,
  teamName,
  players,
  designations,
  assignments,
  onChange,
}: {
  label: string;
  teamName: string;
  players: Player[];
  designations: string[];
  assignments: Record<string, number | null>;
  onChange: (a: Record<string, number | null>) => void;
}) {
  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-4">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </h3>
      <p className="mb-3 font-bold">{teamName}</p>
      {players.length === 0 ? (
        <p className="text-sm italic text-muted">
          Nema registrovanih igraca. Dodaj ih na stranici Timovi.
        </p>
      ) : (
        <>
          <div className="space-y-2">
            {designations.map((d) => (
              <div key={d} className="flex items-center gap-2">
                <span className="w-6 text-center text-sm font-bold text-accent">
                  {d}
                </span>
                <select
                  value={assignments[d] || ""}
                  onChange={(e) =>
                    onChange({
                      ...assignments,
                      [d]: parseInt(e.target.value) || null,
                    })
                  }
                  className="flex-1 rounded border border-card-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
                >
                  <option value="">— Izaberi igraca —</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {(() => {
            const assignedIds = new Set(
              Object.values(assignments).filter(Boolean)
            );
            const reserves = players.filter((p) => !assignedIds.has(p.id));
            if (reserves.length === 0) return null;
            return (
              <div className="mt-3 border-t border-card-border/50 pt-3">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted/60">
                  Rezervni igraci
                </p>
                <div className="flex flex-wrap gap-2">
                  {reserves.map((p) => (
                    <span
                      key={p.id}
                      className="rounded bg-card-border/30 px-2 py-0.5 text-xs text-muted"
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}

function SubstitutionList({
  label,
  players,
  assignedIds,
  subs,
  onChange,
}: {
  label: string;
  players: Player[];
  assignedIds: number[];
  subs: { outId: number | null; inId: number | null; afterGame: number }[];
  onChange: (
    s: { outId: number | null; inId: number | null; afterGame: number }[]
  ) => void;
}) {
  const reserves = players.filter((p) => !assignedIds.includes(p.id));
  const starters = players.filter((p) => assignedIds.includes(p.id));

  if (reserves.length === 0) return null;

  // All players already used in subs (in or out)
  const usedOutIds = new Set(subs.map((s) => s.outId).filter(Boolean));
  const usedInIds = new Set(subs.map((s) => s.inId).filter(Boolean));

  return (
    <div className="rounded-xl border border-dashed border-card-border bg-card-bg/50 p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </h3>
      <div className="space-y-3">
        {subs.map((sub, si) => (
          <div key={si} className="space-y-2 rounded-lg bg-background/30 p-3">
            <div className="flex items-center gap-2">
              <span className="w-14 text-xs text-muted">Izlazi:</span>
              <select
                value={sub.outId || ""}
                onChange={(e) => {
                  const updated = [...subs];
                  updated[si] = {
                    ...sub,
                    outId: parseInt(e.target.value) || null,
                  };
                  onChange(updated);
                }}
                className="flex-1 rounded border border-card-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
              >
                <option value="">— Izaberi —</option>
                {starters.map((p) => (
                  <option
                    key={p.id}
                    value={p.id}
                    disabled={usedOutIds.has(p.id) && sub.outId !== p.id}
                  >
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-14 text-xs text-muted">Ulazi:</span>
              <select
                value={sub.inId || ""}
                onChange={(e) => {
                  const updated = [...subs];
                  updated[si] = {
                    ...sub,
                    inId: parseInt(e.target.value) || null,
                  };
                  onChange(updated);
                }}
                className="flex-1 rounded border border-card-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
              >
                <option value="">— Izaberi —</option>
                {reserves.map((p) => (
                  <option
                    key={p.id}
                    value={p.id}
                    disabled={usedInIds.has(p.id) && sub.inId !== p.id}
                  >
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-14 text-xs text-muted">Posle:</span>
              <select
                value={sub.afterGame}
                onChange={(e) => {
                  const updated = [...subs];
                  updated[si] = {
                    ...sub,
                    afterGame: parseInt(e.target.value),
                  };
                  onChange(updated);
                }}
                className="flex-1 rounded border border-card-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}. meca
                  </option>
                ))}
              </select>
              <button
                onClick={() => onChange(subs.filter((_, i) => i !== si))}
                className="text-xs text-muted hover:text-danger"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() =>
            onChange([...subs, { outId: null, inId: null, afterGame: 3 }])
          }
          className="w-full rounded-lg border border-dashed border-card-border py-2 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent"
        >
          + Dodaj zamenu
        </button>
      </div>
    </div>
  );
}

function getPlayerName(
  players: Player[],
  playerId: number | null | undefined
): string {
  if (!playerId) return "";
  return players.find((p) => p.id === playerId)?.name || "";
}
