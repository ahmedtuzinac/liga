"use client";

import { usePathname } from "next/navigation";
import type { Season } from "@/lib/types";
import { setSeasonCookie } from "@/lib/season-cookie";

// Detail pages belong to one season, so switching season leaves them
const DETAIL_ROUTE = /^\/(rounds|teams|players|matches)\/[^/]+/;

export default function SeasonSelect({
  seasons,
  current,
}: {
  seasons: Season[];
  current?: string;
}) {
  const pathname = usePathname();

  function onChange(slug: string) {
    setSeasonCookie(slug);
    // Full reload so client-side admin pages refetch as well
    if (DETAIL_ROUTE.test(pathname)) {
      window.location.assign("/");
    } else {
      window.location.reload();
    }
  }

  if (seasons.length < 2) return null;

  return (
    <select
      aria-label="Sezona"
      value={current}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-card-border bg-card-bg px-2 py-1 text-sm font-medium text-foreground focus:border-accent focus:outline-none"
    >
      {seasons.map((s) => (
        <option key={s.slug} value={s.slug}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
