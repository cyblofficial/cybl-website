"use client";

import { useEffect, useMemo, useState } from "react";
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

type TournamentRow = {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  is_featured: boolean;
  is_published: boolean;
};

type TeamRow = {
  id: string;
  name: string;
  short_name: string | null;
};

type GameStatus =
  | "UPCOMING"
  | "LIVE"
  | "PAUSED"
  | "FINISHED";

type GameRow = {
  id: string;
  tournament_id: string | null;
  game_code: string;
  home_team_id: string | null;
  away_team_id: string | null;
  game_date: string | null;
  game_time: string | null;
  court: string | null;
  category: string | null;
  status: GameStatus;
  current_period: string | null;
  game_clock: string | null;
  home_score: number;
  away_score: number;
  youtube_url: string | null;
  started_at: string | null;
  finished_at: string | null;
};

export default function AdminPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);

  const [stats, setStats] = useState<DashboardStats>({
    teams: 0,
    players: 0,
    tournaments: 0,
    games: 0,
  });

  const [tournaments, setTournaments] = useState<TournamentRow[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [games, setGames] = useState<GameRow[]>([]);

  const [selectedTournamentId, setSelectedTournamentId] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingGameId, setSavingGameId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    void loadAdmin();
  }, []);

  const isSuperAdmin = profile?.role === "SUPER_ADMIN";

  const filteredGames = useMemo(() => {
    let list = [...games];

    if (selectedTournamentId) {
      list = list.filter(
        (game) => game.tournament_id === selectedTournamentId
      );
    }

    return list.sort((a, b) => {
      const aDate = `${a.game_date ?? ""} ${a.game_time ?? ""}`;
      const bDate = `${b.game_date ?? ""} ${b.game_time ?? ""}`;

      return aDate.localeCompare(bDate);
    });
  }, [games, selectedTournamentId]);

  const liveGames = useMemo(
    () =>
      filteredGames.filter(
        (game) =>
          game.status === "LIVE" ||
          game.status === "PAUSED"
      ),
    [filteredGames]
  );

  const upcomingGames = useMemo(
    () =>
      filteredGames.filter(
        (game) => game.status === "UPCOMING"
      ),
    [filteredGames]
  );

  const finishedGames = useMemo(
    () =>
      filteredGames
        .filter((game) => game.status === "FINISHED")
        .reverse()
        .slice(0, 5),
    [filteredGames]
  );

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
      playersCountResponse,
      tournamentsResponse,
      gamesResponse,
    ] = await Promise.all([
      supabase
        .from("teams")
        .select("id, name, short_name")
        .order("name"),

      supabase
        .from("players")
        .select("*", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("tournaments")
        .select(
          `
          id,
          name,
          start_date,
          end_date,
          is_featured,
          is_published
          `
        )
        .order("start_date", {
          ascending: true,
        }),

      supabase
        .from("games")
        .select(
          `
          id,
          tournament_id,
          game_code,
          home_team_id,
          away_team_id,
          game_date,
          game_time,
          court,
          category,
          status,
          current_period,
          game_clock,
          home_score,
          away_score,
          youtube_url,
          started_at,
          finished_at
          `
        )
        .order("game_date", {
          ascending: true,
        })
        .order("game_time", {
          ascending: true,
        }),
    ]);

    if (teamsResponse.error) {
      setErrorMessage(teamsResponse.error.message);
    }

    if (tournamentsResponse.error) {
      setErrorMessage(tournamentsResponse.error.message);
    }

    if (gamesResponse.error) {
      setErrorMessage(gamesResponse.error.message);
    }

    const loadedTeams =
      (teamsResponse.data ?? []) as TeamRow[];

    const loadedTournaments =
      (tournamentsResponse.data ?? []) as TournamentRow[];

    const loadedGames =
      (gamesResponse.data ?? []) as GameRow[];

    setTeams(loadedTeams);
    setTournaments(loadedTournaments);
    setGames(loadedGames);

    const featuredTournament =
      loadedTournaments.find(
        (tournament) =>
          tournament.is_featured &&
          tournament.is_published
      );

    if (featuredTournament) {
      setSelectedTournamentId(featuredTournament.id);
    }

    setStats({
      teams: loadedTeams.length,
      players: playersCountResponse.count ?? 0,
      tournaments: loadedTournaments.length,
      games: loadedGames.length,
    });

    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    router.replace("/admin/login");
    router.refresh();
  }

  function getTeamName(teamId: string | null) {
    if (!teamId) return "TBA";

    const team = teams.find(
      (item) => item.id === teamId
    );

    return (
      team?.short_name ||
      team?.name ||
      "TBA"
    );
  }

  function getTournamentName(
    tournamentId: string | null
  ) {
    if (!tournamentId) return "No Tournament";

    return (
      tournaments.find(
        (item) => item.id === tournamentId
      )?.name ?? "Tournament"
    );
  }

  async function startGame(game: GameRow) {
    if (savingGameId) return;

    const confirmed = window.confirm(
      `Start ${getTeamName(
        game.home_team_id
      )} vs ${getTeamName(game.away_team_id)}?`
    );

    if (!confirmed) return;

    setSavingGameId(game.id);
    setErrorMessage("");
    setMessage("");

    const { error } = await supabase
      .from("games")
      .update({
        status: "LIVE",
        current_period:
          game.current_period || "Q1",
        game_clock:
          game.game_clock || "10:00",
        started_at:
          game.started_at ??
          new Date().toISOString(),
      })
      .eq("id", game.id);

    if (error) {
      setErrorMessage(error.message);
      setSavingGameId("");
      return;
    }

    setMessage(
      `${getTeamName(
        game.home_team_id
      )} vs ${getTeamName(
        game.away_team_id
      )} is now LIVE.`
    );

    await refreshGames();

    setSavingGameId("");

    /*
      შემდეგ ეტაპზე scorer-ს game ID-ს დავუკავშირებთ.
      URL უკვე მზად იქნება ამისთვის.
    */
    router.push(`/scorer?game=${game.id}`);
  }

  async function refreshGames() {
    const { data, error } = await supabase
      .from("games")
      .select(
        `
        id,
        tournament_id,
        game_code,
        home_team_id,
        away_team_id,
        game_date,
        game_time,
        court,
        category,
        status,
        current_period,
        game_clock,
        home_score,
        away_score,
        youtube_url,
        started_at,
        finished_at
        `
      )
      .order("game_date", {
        ascending: true,
      })
      .order("game_time", {
        ascending: true,
      });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setGames((data ?? []) as GameRow[]);
  }

  async function saveYoutubeLink(
    gameId: string,
    youtubeUrl: string
  ) {
    setSavingGameId(gameId);
    setErrorMessage("");
    setMessage("");

    const { error } = await supabase
      .from("games")
      .update({
        youtube_url:
          youtubeUrl.trim() || null,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", gameId);

    if (error) {
      setErrorMessage(error.message);
      setSavingGameId("");
      return;
    }

    await refreshGames();

    setMessage("YouTube Live link saved.");
    setSavingGameId("");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
        <p className="text-xl font-black">
          Loading CYBL Control Center...
        </p>
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-6 md:py-10">

        {/* HEADER */}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-400">
              CYBL Administration
            </p>

            <h1 className="mt-3 text-4xl font-black md:text-6xl">
              Tournament Control Center
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

          <div className="flex flex-wrap gap-3">
            <a
              href="/"
              target="_blank"
              className="rounded-full border border-white/15 bg-white/10 px-5 py-3 font-black"
            >
              View Website ↗
            </a>

            <a
              href="/scorer"
              className="rounded-full bg-orange-500 px-5 py-3 font-black"
            >
              Open Scorer
            </a>

            <button
              onClick={() =>
                void handleLogout()
              }
              className="rounded-full border border-white/15 bg-white/10 px-5 py-3 font-black"
            >
              Log Out
            </button>
          </div>
        </div>

        {message && (
          <div className="mt-8 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 font-bold text-green-300">
            ✓ {message}
          </div>
        )}

        {errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {errorMessage}
          </div>
        )}

        {/* COUNTERS */}

        <section className="mt-8 grid gap-3 grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            number={stats.tournaments}
            label="Tournaments"
          />

          <DashboardCard
            number={stats.games}
            label="Games"
          />

          <DashboardCard
            number={stats.teams}
            label="Teams"
          />

          <DashboardCard
            number={stats.players}
            label="Players"
          />
        </section>

        {/* QUICK ACTIONS */}

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-400">
                Quick Actions
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Manage Tournament
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction
              title="+ Tournament"
              description="Create or edit a tournament."
              href="/admin/tournaments"
              enabled={isSuperAdmin}
            />

            <QuickAction
              title="+ Game"
              description="Add games, dates, teams and streams."
              href="/admin/games"
              enabled={true}
            />

            <QuickAction
              title="+ Team"
              description="Add or edit participating teams."
              href="/admin/teams"
              enabled={isSuperAdmin}
            />

            <QuickAction
              title="+ Player"
              description="Add players and team members."
              href="/admin/players"
              enabled={true}
            />
          </div>
        </section>

        {/* TOURNAMENT FILTER */}

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5">
          <label className="text-xs font-black uppercase tracking-[0.25em] text-gray-400">
            Tournament
          </label>

          <select
            value={selectedTournamentId}
            onChange={(event) =>
              setSelectedTournamentId(
                event.target.value
              )
            }
            className="mt-3 w-full rounded-2xl border border-white/10 bg-[#081321] p-4 font-black"
          >
            <option value="">
              All Tournaments
            </option>

            {tournaments.map(
              (tournament) => (
                <option
                  key={tournament.id}
                  value={tournament.id}
                >
                  {tournament.name}
                </option>
              )
            )}
          </select>
        </section>

        {/* LIVE GAMES */}

        {liveGames.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />

              <h2 className="text-3xl font-black">
                Live Games
              </h2>
            </div>

            <div className="mt-5 grid gap-4">
              {liveGames.map((game) => (
                <GameControlCard
                  key={game.id}
                  game={game}
                  homeName={getTeamName(
                    game.home_team_id
                  )}
                  awayName={getTeamName(
                    game.away_team_id
                  )}
                  tournamentName={getTournamentName(
                    game.tournament_id
                  )}
                  saving={
                    savingGameId === game.id
                  }
                  onStart={() =>
                    void startGame(game)
                  }
                  onSaveYoutube={
                    saveYoutubeLink
                  }
                  live
                />
              ))}
            </div>
          </section>
        )}

        {/* UPCOMING GAMES */}

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-400">
                Schedule
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Upcoming Games
              </h2>
            </div>

            <a
              href="/admin/games"
              className="rounded-full bg-orange-500 px-5 py-3 font-black"
            >
              + Add / Manage Games
            </a>
          </div>

          {upcomingGames.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-8 text-gray-400">
              No upcoming games.
            </div>
          ) : (
            <div className="mt-5 grid gap-4">
              {upcomingGames.map(
                (game) => (
                  <GameControlCard
                    key={game.id}
                    game={game}
                    homeName={getTeamName(
                      game.home_team_id
                    )}
                    awayName={getTeamName(
                      game.away_team_id
                    )}
                    tournamentName={getTournamentName(
                      game.tournament_id
                    )}
                    saving={
                      savingGameId ===
                      game.id
                    }
                    onStart={() =>
                      void startGame(game)
                    }
                    onSaveYoutube={
                      saveYoutubeLink
                    }
                  />
                )
              )}
            </div>
          )}
        </section>

        {/* FINISHED */}

        {finishedGames.length > 0 && (
          <section className="mt-10">
            <h2 className="text-3xl font-black">
              Recent Finished Games
            </h2>

            <div className="mt-5 grid gap-3">
              {finishedGames.map(
                (game) => (
                  <div
                    key={game.id}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:flex-row md:items-center"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-500">
                        {game.game_code} ·{" "}
                        {game.game_date}
                      </p>

                      <p className="mt-2 text-xl font-black">
                        {getTeamName(
                          game.home_team_id
                        )}{" "}
                        {game.home_score}
                        {" — "}
                        {game.away_score}{" "}
                        {getTeamName(
                          game.away_team_id
                        )}
                      </p>
                    </div>

                    <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black text-gray-300">
                      FINAL
                    </span>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {/* FULL MANAGEMENT */}

        <section className="mt-12 border-t border-white/10 pt-10">
          <h2 className="text-3xl font-black">
            Full Management
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AdminCard
              title="Tournaments"
              href="/admin/tournaments"
              enabled={isSuperAdmin}
            />

            <AdminCard
              title="Games"
              href="/admin/games"
              enabled={true}
            />

            <AdminCard
              title="Teams"
              href="/admin/teams"
              enabled={isSuperAdmin}
            />

            <AdminCard
              title="Players"
              href="/admin/players"
              enabled={true}
            />

            <AdminCard
              title="News"
              href="/admin/news"
              enabled={isSuperAdmin}
            />

            <AdminCard
              title="Live Scorer"
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
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
      <p className="text-4xl font-black text-orange-400">
        {number}
      </p>

      <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-400">
        {label}
      </p>
    </div>
  );
}

function QuickAction({
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
      <div className="rounded-3xl border border-white/5 bg-white/5 p-5 opacity-40">
        <h3 className="text-xl font-black">
          {title}
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          No access
        </p>
      </div>
    );
  }

  return (
    <a
      href={href}
      className="rounded-3xl border border-white/10 bg-white/10 p-5 transition hover:-translate-y-1 hover:border-orange-400/50 hover:bg-orange-500/10"
    >
      <h3 className="text-xl font-black text-orange-400">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-gray-400">
        {description}
      </p>
    </a>
  );
}

function AdminCard({
  title,
  href,
  enabled,
}: {
  title: string;
  href: string;
  enabled: boolean;
}) {
  if (!enabled) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/5 p-5 opacity-40">
        <p className="font-black">
          {title}
        </p>

        <p className="mt-2 text-xs text-gray-500">
          No access
        </p>
      </div>
    );
  }

  return (
    <a
      href={href}
      className="rounded-2xl border border-white/10 bg-white/5 p-5 font-black transition hover:border-orange-400/50 hover:bg-orange-500/10"
    >
      {title} →
    </a>
  );
}

function GameControlCard({
  game,
  homeName,
  awayName,
  tournamentName,
  saving,
  onStart,
  onSaveYoutube,
  live = false,
}: {
  game: GameRow;
  homeName: string;
  awayName: string;
  tournamentName: string;
  saving: boolean;
  onStart: () => void;
  onSaveYoutube: (
    gameId: string,
    youtubeUrl: string
  ) => Promise<void>;
  live?: boolean;
}) {
  const [youtubeUrl, setYoutubeUrl] =
    useState(game.youtube_url ?? "");

  useEffect(() => {
    setYoutubeUrl(game.youtube_url ?? "");
  }, [game.youtube_url]);

  return (
    <div
      className={`rounded-3xl border p-5 ${
        live
          ? "border-red-500/30 bg-red-500/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="grid gap-5 xl:grid-cols-[1fr_auto] xl:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-black text-orange-300">
              {game.game_code}
            </span>

            <span className="text-xs font-bold text-gray-500">
              {tournamentName}
            </span>

            {live && (
              <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-black">
                LIVE
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h3 className="text-2xl font-black">
              {homeName}
            </h3>

            {live ? (
              <span className="text-3xl font-black text-orange-400">
                {game.home_score} —{" "}
                {game.away_score}
              </span>
            ) : (
              <span className="font-black text-gray-500">
                VS
              </span>
            )}

            <h3 className="text-2xl font-black">
              {awayName}
            </h3>
          </div>

          <p className="mt-3 text-sm text-gray-400">
            📅 {game.game_date || "No date"}
            {" · "}
            🕒{" "}
            {game.game_time
              ? game.game_time.slice(0, 5)
              : "No time"}
            {" · "}
            🏟️ {game.court || "Court TBA"}

            {live && (
              <>
                {" · "}
                {game.current_period}{" "}
                {game.game_clock}
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={`/admin/games`}
            className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black"
          >
            EDIT
          </a>

          {live ? (
            <a
              href={`/scorer?game=${game.id}`}
              className="rounded-xl bg-red-500 px-5 py-3 text-sm font-black"
            >
              OPEN LIVE SCORER →
            </a>
          ) : (
            <button
              disabled={saving}
              onClick={onStart}
              className="rounded-xl bg-green-500 px-5 py-3 text-sm font-black text-black disabled:opacity-40"
            >
              {saving
                ? "STARTING..."
                : "START GAME →"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 border-t border-white/10 pt-4">
        <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-gray-500">
          YouTube Live Stream
        </p>

        <div className="flex flex-col gap-2 md:flex-row">
          <input
            value={youtubeUrl}
            onChange={(event) =>
              setYoutubeUrl(
                event.target.value
              )
            }
            placeholder="Paste YouTube Live link here..."
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#081321] px-4 py-3 text-sm outline-none focus:border-orange-400"
          />

          <button
            disabled={saving}
            onClick={() =>
              void onSaveYoutube(
                game.id,
                youtubeUrl
              )
            }
            className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black disabled:opacity-40"
          >
            SAVE STREAM
          </button>
        </div>

        {game.youtube_url && (
          <p className="mt-2 text-xs font-bold text-green-400">
            ✓ Live stream link added
          </p>
        )}
      </div>
    </div>
  );
}