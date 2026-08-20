"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

type Tournament = {
  id: string;
  name: string;
  slug: string | null;
  city: string | null;
  country: string | null;
  start_date: string | null;
  end_date: string | null;
};

function formatDateRange(
  startDate: string | null,
  endDate: string | null
) {
  if (!startDate) return "Dates coming soon";

  const start = new Date(`${startDate}T00:00:00`);

  if (!endDate) {
    return new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(start);
  }

  const end = new Date(`${endDate}T00:00:00`);

  if (
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth()
  ) {
    const month = new Intl.DateTimeFormat("en", {
      month: "long",
    }).format(start);

    return `${start.getDate()}–${end.getDate()} ${month} ${start.getFullYear()}`;
  }

  return `${start.toLocaleDateString("en-GB")} – ${end.toLocaleDateString(
    "en-GB"
  )}`;
}

export default function LiveBanner() {
  const [tournament, setTournament] =
    useState<Tournament | null>(null);

  useEffect(() => {
    void loadTournament();

    const channel = supabase
      .channel("home-next-event")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tournaments",
        },
        () => {
          void loadTournament();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  async function loadTournament() {
    const { data, error } = await supabase
      .from("tournaments")
      .select(
        `
        id,
        name,
        slug,
        city,
        country,
        start_date,
        end_date
        `
      )
      .eq("is_published", true)
      .eq("is_featured", true)
      .order("start_date", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(error.message);
      return;
    }

    setTournament(data as Tournament | null);
  }

  if (!tournament) {
    return null;
  }

  return (
    <section className="bg-[#050816] px-6 pb-10 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl border border-orange-500/20 bg-white/10 p-7 backdrop-blur-xl md:flex-row md:items-center">
        <div>
          <span className="inline-flex items-center rounded-full bg-red-500/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-red-400">
            🔴 Next Event
          </span>

          <h2 className="mt-4 text-3xl font-black md:text-4xl">
            {tournament.name}
          </h2>

          <p className="mt-3 text-lg text-gray-300">
            📅{" "}
            <span className="font-semibold text-white">
              {formatDateRange(
                tournament.start_date,
                tournament.end_date
              )}
            </span>

            {(tournament.city || tournament.country) && (
              <>
                {" • "}📍{" "}
                {[
                  tournament.city,
                  tournament.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </>
            )}
          </p>
        </div>

        <a
          href="#tournament"
          className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-8 py-4 font-bold text-white shadow-lg shadow-orange-500/20 transition duration-300 hover:-translate-y-1 hover:bg-orange-600 hover:shadow-orange-500/40"
        >
          View Tournament
          <span>→</span>
        </a>
      </div>
    </section>
  );
}