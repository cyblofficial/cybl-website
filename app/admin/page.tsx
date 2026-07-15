"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "SUPER_ADMIN" | "SCORER";
  is_active: boolean;
};

type DashboardStats = {
  teams: number;
  players: number;
  tournaments: number;
  games: number;
};

export default function AdminPage() {
  const router = useRouter();

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [stats, setStats] =
    useState<DashboardStats>({
      teams: 0,
      players: 0,
      tournaments: 0,
      games: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    void loadAdmin();
  }, []);

  async function loadAdmin() {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      router.replace("/admin/login");
      return;
    }

    const {
      data: profileData,
      error: profileError,
    } = await supabase
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
      .eq("id", session.user.id)
      .single();

    if (
      profileError ||
      !profileData ||
      !profileData.is_active
    ) {
      await supabase.auth.signOut();

      router.replace("/admin/login");
      return;
    }

    setProfile(profileData as Profile);

    const [
      teamsResponse,
      playersResponse,
      tournamentsResponse,
      gamesResponse,
    ] = await Promise.all([
      supabase
        .from("teams")
        .select("*", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("players")
        .select("*", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("tournaments")
        .select("*", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("games")
        .select("*", {
          count: "exact",
          head: true,
        }),
    ]);

    setStats({
      teams: teamsResponse.count ?? 0,
      players: playersResponse.count ?? 0,
      tournaments:
        tournamentsResponse.count ?? 0,
      games: gamesResponse.count ?? 0,
    });

    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    router.replace("/admin/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
        <p className="text-xl font-black">
          Loading Admin Panel...
        </p>
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  const isSuperAdmin =
    profile.role === "SUPER_ADMIN";

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-400">
              CYBL Administration
            </p>

            <h1 className="mt-3 text-4xl font-black md:text-6xl">
              Admin Dashboard
            </h1>

            <p className="mt-4 text-gray-400">
              Signed in as{" "}
              <span className="font-bold text-white">
                {profile.email}
              </span>
              {" · "}
              <span className="font-bold text-orange-400">
                {profile.role}
              </span>
            </p>
          </div>

          <button
            onClick={() =>
              void handleLogout()
            }
            className="rounded-full border border-white/15 bg-white/10 px-6 py-3 font-black transition active:scale-95"
          >
            Log Out
          </button>
        </div>

        {errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {errorMessage}
          </div>
        )}

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            number={stats.teams}
            label="Teams"
          />

          <DashboardCard
            number={stats.players}
            label="Players"
          />

          <DashboardCard
            number={stats.tournaments}
            label="Tournaments"
          />

          <DashboardCard
            number={stats.games}
            label="Games"
          />
        </section>

        <section className="mt-10">
          <h2 className="text-3xl font-black">
            Management
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <AdminCard
              title="Teams"
              description="Add, rename, edit and deactivate CYBL teams."
              href="/admin/teams"
              enabled={isSuperAdmin}
            />

            <AdminCard
              title="Players"
              description="Manage rosters, CYBL IDs, jersey numbers and player information."
              href="/admin/players"
              enabled={true}
            />

            <AdminCard
              title="Tournaments"
              description="Create tournaments, dates, age categories and participating teams."
              href="/admin/tournaments"
              enabled={isSuperAdmin}
            />

            <AdminCard
              title="Games"
              description="Create schedules, assign teams, times, courts and YouTube streams."
              href="/admin/games"
              enabled={true}
            />

            <AdminCard
              title="News"
              description="Create, edit and publish CYBL news."
              href="/admin/news"
              enabled={isSuperAdmin}
            />

            <AdminCard
              title="Scorer Panel"
              description="Open live game statistics and scoring control."
              href="/scorer"
              enabled={true}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function DashboardCard({
  number,
  label,
}: {
  number: number;
  label: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
      <p className="text-4xl font-black text-orange-400">
        {number}
      </p>

      <p className="mt-2 text-sm font-bold uppercase tracking-widest text-gray-400">
        {label}
      </p>
    </div>
  );
}

function AdminCard({
  title,
  description,
  href,
  enabled,
}: {
  title: string;
  description: string;
  href: string;
  enabled: boolean;
}) {
  if (!enabled) {
    return (
      <div className="rounded-3xl border border-white/5 bg-white/5 p-6 opacity-40">
        <h3 className="text-2xl font-black">
          {title}
        </h3>

        <p className="mt-3 leading-7 text-gray-400">
          {description}
        </p>

        <p className="mt-6 text-sm font-black uppercase tracking-wider text-gray-500">
          No access
        </p>
      </div>
    );
  }

  return (
    <a
      href={href}
      className="group rounded-3xl border border-white/10 bg-white/10 p-6 transition hover:-translate-y-1 hover:border-orange-400/50 hover:bg-orange-500/10"
    >
      <h3 className="text-2xl font-black">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-gray-400">
        {description}
      </p>

      <p className="mt-6 font-black text-orange-400">
        Open →
      </p>
    </a>
  );
}