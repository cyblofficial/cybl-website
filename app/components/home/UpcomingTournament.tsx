"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

type Tournament = {
  id: string;
  name: string;
  slug: string | null;
  city: string | null;
  country: string | null;
  venue: string | null;
  start_date: string | null;
  end_date: string | null;
  age_group: string | null;
  registration_status: string | null;
  description: string | null;
  poster_url: string | null;
  regulations_ge_url: string | null;
  regulations_en_url: string | null;
  presentation_url: string | null;
  is_featured: boolean;
  is_published: boolean;
};

function formatDate(date: string | null) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatDateRange(
  startDate: string | null,
  endDate: string | null
) {
  if (!startDate && !endDate) {
    return "Dates coming soon";
  }

  if (startDate && !endDate) {
    return formatDate(startDate);
  }

  if (!startDate && endDate) {
    return formatDate(endDate);
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth()
  ) {
    const month = new Intl.DateTimeFormat("en", {
      month: "long",
    }).format(start);

    return `${month} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`;
  }

  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

export default function UpcomingTournament() {
  const [tournament, setTournament] =
    useState<Tournament | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadFeaturedTournament();

    const channel = supabase
      .channel("featured-tournament-home")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tournaments",
        },
        () => {
          void loadFeaturedTournament();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  async function loadFeaturedTournament() {
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .eq("is_published", true)
      .eq("is_featured", true)
      .order("start_date", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(
        "Featured tournament load error:",
        error.message
      );

      setTournament(null);
      setLoading(false);
      return;
    }

    setTournament(
      data ? (data as Tournament) : null
    );

    setLoading(false);
  }

  if (loading) {
    return (
      <section
        id="tournament"
        className="bg-[#061426] px-8 py-20 text-white"
      >
        <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-white/5 p-10">
          <p className="text-gray-400">
            Loading featured tournament...
          </p>
        </div>
      </section>
    );
  }

  if (!tournament) {
    return null;
  }

  const registrationStatus =
    tournament.registration_status || "OPEN";

  const registrationOpen =
    registrationStatus.toUpperCase() === "OPEN";

  const tournamentUrl = tournament.slug
    ? `/tournaments/${tournament.slug}`
    : "#";

  const emailSubject = encodeURIComponent(
    `${tournament.name} Registration`
  );

  const emailBody = encodeURIComponent(
    `Hello CYBL,

We are interested in ${tournament.name}.

Team Name:
Country:
Age Group:
Number of Players:
Number of Coaches:
Contact Person:
Phone:
`
  );

  const whatsappMessage = encodeURIComponent(
    `Hello CYBL, we would like to register for ${tournament.name}.`
  );

  return (
    <section
      id="tournament"
      className="bg-[#061426] px-8 py-20 text-white"
    >
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">

        {tournament.poster_url && (
          <div className="relative aspect-[16/7] overflow-hidden bg-[#081B33]">
            <img
              src={tournament.poster_url}
              alt={`${tournament.name} poster`}
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#061426] via-transparent to-transparent" />
          </div>
        )}

        <div className="p-10">
          <p className="text-sm font-bold uppercase tracking-[6px] text-yellow-500">
            Featured Tournament
          </p>

          <h2 className="mt-4 text-4xl font-black uppercase md:text-6xl">
            {tournament.name}
          </h2>

          {tournament.description && (
            <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-300">
              {tournament.description}
            </p>
          )}

          <div className="mt-10 grid gap-6 md:grid-cols-4">

            <div className="rounded-2xl border border-white/10 bg-[#081B33] p-6">
              <p className="text-sm uppercase tracking-widest text-yellow-500">
                Location
              </p>

              <h3 className="mt-3 text-2xl font-bold">
                {tournament.city || "TBA"}
                {tournament.country
                  ? `, ${tournament.country}`
                  : ""}
              </h3>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#081B33] p-6">
              <p className="text-sm uppercase tracking-widest text-yellow-500">
                Dates
              </p>

              <h3 className="mt-3 text-2xl font-bold">
                {formatDateRange(
                  tournament.start_date,
                  tournament.end_date
                )}
              </h3>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#081B33] p-6">
              <p className="text-sm uppercase tracking-widest text-yellow-500">
                Age Group
              </p>

              <h3 className="mt-3 text-2xl font-bold">
                {tournament.age_group || "TBA"}
              </h3>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#081B33] p-6">
              <p className="text-sm uppercase tracking-widest text-yellow-500">
                Registration
              </p>

              <h3
                className={`mt-3 text-2xl font-bold ${
                  registrationOpen
                    ? "text-green-400"
                    : "text-yellow-400"
                }`}
              >
                {registrationStatus}
              </h3>
            </div>
          </div>

          {registrationOpen && (
            <div className="mt-10 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6">
              <h3 className="text-2xl font-bold text-yellow-400">
                Registration is Open
              </h3>

              <p className="mt-4 leading-8 text-gray-300">
                Teams interested in participating in{" "}
                {tournament.name} can contact CYBL via
                Email or WhatsApp for registration
                information.
              </p>
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-4">

            {tournament.slug && (
              <a
                href={tournamentUrl}
                className="rounded-full bg-yellow-500 px-8 py-4 font-bold text-black transition hover:bg-yellow-400"
              >
                View Tournament
              </a>
            )}

            {registrationOpen && (
              <>
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=telavicybl@gmail.com&su=${emailSubject}&body=${emailBody}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/30 px-8 py-4 font-bold text-white transition hover:bg-white/10"
                >
                  Register by Email
                </a>

                <a
                  href={`https://wa.me/995597970306?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/30 px-8 py-4 font-bold text-white transition hover:bg-white/10"
                >
                  Contact via WhatsApp
                </a>
              </>
            )}

            {tournament.regulations_ge_url && (
              <a
                href={tournament.regulations_ge_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-6 py-4 font-bold text-white transition hover:bg-white/10"
              >
                🇬🇪 ქართული დებულება
              </a>
            )}

            {tournament.regulations_en_url && (
              <a
                href={tournament.regulations_en_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/20 px-6 py-4 font-bold text-white transition hover:bg-white/10"
              >
                🇬🇧 English Regulations
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}