import { cache } from "react";
import { cookies } from "next/headers";
import { api } from "./api";
import { SEASON_COOKIE } from "./season-cookie";

// Selected season from cookie, falling back to the active season
export const getCurrentSeason = cache(async () => {
  const seasons = await api.getSeasons();
  const slug = (await cookies()).get(SEASON_COOKIE)?.value;
  const current =
    seasons.find((s) => s.slug === slug) ??
    seasons.find((s) => s.is_active) ??
    seasons[0];
  return { seasons, current };
});
