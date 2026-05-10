"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/admin-api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await adminApi.login(username, password);
      localStorage.setItem("tt_liga_token", token);
      router.push("/admin");
    } catch {
      setError("Pogresno korisnicko ime ili lozinka");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-card-border bg-card-bg p-8"
      >
        <h1 className="mb-6 text-center text-2xl font-extrabold">
          <span className="text-accent">Admin</span> Login
        </h1>
        {error && (
          <p className="mb-4 rounded-lg bg-danger/10 px-4 py-2 text-center text-sm text-danger">
            {error}
          </p>
        )}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-muted">
            Korisnicko ime
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-card-border bg-background px-4 py-2.5 text-foreground outline-none transition-colors focus:border-accent"
            required
          />
        </div>
        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-muted">
            Lozinka
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-card-border bg-background px-4 py-2.5 text-foreground outline-none transition-colors focus:border-accent"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent py-2.5 font-semibold text-background transition-colors hover:bg-accent-light disabled:opacity-50"
        >
          {loading ? "..." : "Prijavi se"}
        </button>
      </form>
    </div>
  );
}
