"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminApi, type AdminRound } from "@/lib/admin-api";

export default function AdminDashboard() {
  const [rounds, setRounds] = useState<AdminRound[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getRounds()
      .then(setRounds)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center text-muted">Ucitavanje...</div>;
  }

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold">
        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        Unos rezultata
      </h1>
      <div className="space-y-6">
        {rounds.map((round) => {
          const completed = round.matches.filter((m) => m.is_completed).length;
          const total = round.matches.length;
          return (
            <section key={round.id}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold">
                  {round.round_number}. Kolo
                </h2>
                <span
                  className={`text-xs font-medium ${completed === total ? "text-success" : "text-muted"}`}
                >
                  {completed}/{total} zavrseno
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {round.matches.map((match) => (
                  <Link
                    key={match.id}
                    href={`/admin/results/${match.id}`}
                    className={`flex items-center justify-between rounded-xl border p-4 transition-transform hover:-translate-y-0.5 ${
                      match.is_completed
                        ? "border-success/30 bg-success/5"
                        : "border-card-border bg-card-bg"
                    }`}
                  >
                    <div className="flex-1">
                      <span className="font-semibold">
                        {match.home_team_name}
                      </span>
                    </div>
                    <div
                      className={`mx-3 rounded-lg px-4 py-1 text-lg font-extrabold tabular-nums ${
                        match.is_completed
                          ? "bg-success/15 text-success"
                          : "bg-accent/10 text-accent"
                      }`}
                    >
                      {match.is_completed
                        ? `${match.home_score} : ${match.away_score}`
                        : "- : -"}
                    </div>
                    <div className="flex-1 text-right">
                      <span className="font-semibold">
                        {match.away_team_name}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
