import { api } from "@/lib/api";
import MatchCard from "@/components/ui/MatchCard";

export default async function RoundPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const round = await api.getRound(parseInt(number));

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-extrabold">
        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        {round.round_number}. Kolo
      </h1>
      {round.date && (
        <p className="mb-4 text-sm text-muted">
          {new Date(round.date).toLocaleDateString("sr-Latn-RS")}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {round.matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
      {round.bye && (
        <p className="mt-4 text-center text-sm italic text-muted">
          Odmara: {round.bye.team_name}
        </p>
      )}
    </div>
  );
}
