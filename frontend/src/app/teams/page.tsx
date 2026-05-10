import { api } from "@/lib/api";
import Link from "next/link";

export default async function TeamsPage() {
  const teams = await api.getTeams();

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold">
        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        Timovi
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Link
            key={team.id}
            href={`/teams/${team.id}`}
            className="rounded-xl border border-card-border bg-card-bg p-5 transition-transform hover:-translate-y-0.5"
          >
            <h2 className="text-lg font-bold">{team.full_name}</h2>
            <p className="mt-1 text-sm text-muted">{team.city}</p>
            <p className="mt-2 text-xs text-muted/60">
              {team.player_count}{" "}
              {team.player_count === 1 ? "igrac" : "igraca"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
