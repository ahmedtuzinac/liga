// Shared between server and client code — must not import next/headers
export const SEASON_COOKIE = "tt_season";

export function seasonQuery(season?: string): string {
  return season ? `?season=${encodeURIComponent(season)}` : "";
}

// Client-side only: read the selected season slug from document.cookie
export function getSeasonCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${SEASON_COOKIE}=`))
    ?.split("=")[1];
}

export function setSeasonCookie(slug: string) {
  document.cookie = `${SEASON_COOKIE}=${encodeURIComponent(slug)}; path=/; max-age=31536000; samesite=lax`;
}
