"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { adminApi } from "@/lib/admin-api";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      setAuthenticated(true);
      return;
    }

    const token = localStorage.getItem("tt_liga_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    adminApi
      .me()
      .then(() => {
        setAuthenticated(true);
        setChecking(false);
      })
      .catch(() => {
        localStorage.removeItem("tt_liga_token");
        router.push("/admin/login");
      });
  }, [isLoginPage, router]);

  if (checking && !isLoginPage) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted">
        Ucitavanje...
      </div>
    );
  }

  if (!authenticated && !isLoginPage) return null;

  return (
    <div>
      {!isLoginPage && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-card-border bg-card-bg px-5 py-3">
          <div className="flex gap-4 text-sm font-medium">
            <Link
              href="/admin"
              className={`transition-colors ${pathname === "/admin" ? "text-accent" : "text-muted hover:text-foreground"}`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/teams"
              className={`transition-colors ${pathname === "/admin/teams" ? "text-accent" : "text-muted hover:text-foreground"}`}
            >
              Timovi
            </Link>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("tt_liga_token");
              router.push("/admin/login");
            }}
            className="text-xs text-muted transition-colors hover:text-danger"
          >
            Odjavi se
          </button>
        </div>
      )}
      {children}
    </div>
  );
}
