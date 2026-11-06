import Link from "next/link";
import { getCurrentSeason } from "@/lib/season";
import SeasonSelect from "./SeasonSelect";

export default async function Header() {
  const { seasons, current } = await getCurrentSeason();

  return (
    <header className="border-b border-card-border bg-card-bg/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          <span className="text-accent">TT</span>{" "}
          <span className="text-foreground">Liga</span>
        </Link>
        <div className="flex items-center gap-6">
        <nav className="hidden gap-6 text-sm font-medium sm:flex">
          <Link
            href="/standings"
            className="text-muted transition-colors hover:text-foreground"
          >
            Tabela
          </Link>
          <Link
            href="/schedule"
            className="text-muted transition-colors hover:text-foreground"
          >
            Raspored
          </Link>
          <Link
            href="/teams"
            className="text-muted transition-colors hover:text-foreground"
          >
            Timovi
          </Link>
        </nav>
        <SeasonSelect seasons={seasons} current={current?.slug} />
        </div>
      </div>
    </header>
  );
}
