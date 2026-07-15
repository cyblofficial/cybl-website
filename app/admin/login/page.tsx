"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    void checkExistingSession();
  }, []);

  async function checkExistingSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      router.replace("/admin");
      return;
    }

    setCheckingSession(false);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email || !password) {
      setErrorMessage("Enter your email and password.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error || !data.user) {
      setErrorMessage(
        error?.message ?? "Login failed."
      );

      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select(
          `
          id,
          email,
          full_name,
          role,
          is_active
          `
        )
        .eq("id", data.user.id)
        .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();

      setErrorMessage(
        "Your admin profile could not be loaded."
      );

      setLoading(false);
      return;
    }

    if (!profile.is_active) {
      await supabase.auth.signOut();

      setErrorMessage(
        "This account is inactive."
      );

      setLoading(false);
      return;
    }

    if (
      profile.role !== "SUPER_ADMIN" &&
      profile.role !== "SCORER"
    ) {
      await supabase.auth.signOut();

      setErrorMessage(
        "You do not have access to the admin panel."
      );

      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] px-6 text-white">
        <p className="text-lg font-black">
          Checking session...
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050816] px-6 py-16 text-white">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-400">
            CYBL Administration
          </p>

          <h1 className="mt-4 text-4xl font-black">
            Admin Login
          </h1>

          <p className="mt-3 text-gray-400">
            Sign in to manage tournaments, teams,
            players, games and live statistics.
          </p>

          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold text-red-300">
              {errorMessage}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className="mt-8 space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-300">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                className="w-full rounded-2xl border border-white/10 bg-[#081321] px-4 py-4 text-white outline-none transition focus:border-orange-400"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-300">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                className="w-full rounded-2xl border border-white/10 bg-[#081321] px-4 py-4 text-white outline-none transition focus:border-orange-400"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-orange-500 px-6 py-4 font-black text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "SIGNING IN..."
                : "SIGN IN"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}