"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabase";

type TeamRow = {
  id: string;
  name: string;
  slug: string;
};

type PlayerRow = {
  id: string;
  team_id: string | null;
  first_name: string;
  last_name: string;
  jersey_number: number | null;
};

type GameRow = {
  id: string;
  game_code: string;

  home_team_id: string | null;
  away_team_id: string | null;

  status: "UPCOMING" | "LIVE" | "PAUSED" | "FINISHED";

  current_period: string;
  game_clock: string;

  home_score: number;
  away_score: number;

  court: string | null;
  category: string | null;

  game_date: string;
  game_time: string;

  youtube_url: string | null;
};

type GameEventRow = {
  id: string;
  game_id: string;

  team_id: string | null;
  player_id: string | null;

  event_type: string;

  period: string;
  game_clock: string;

  created_at: string;
};

function getPoints(type: string) {
  if (type === "FREE_THROW_MADE") return 1;
  if (type === "TWO_POINT_MADE") return 2;
  if (type === "THREE_POINT_MADE") return 3;

  return 0;
}

function formatEventName(type: string) {
  const labels: Record<string, string> = {
    FREE_THROW_MADE: "Free Throw Made",
    FREE_THROW_MISSED: "Free Throw Missed",

    TWO_POINT_MADE: "2PT Made",
    TWO_POINT_MISSED: "2PT Missed",

    THREE_POINT_MADE: "3PT Made",
    THREE_POINT_MISSED: "3PT Missed",

    OFFENSIVE_REBOUND: "Offensive Rebound",
    DEFENSIVE_REBOUND: "Defensive Rebound",

    ASSIST: "Assist",
    STEAL: "Steal",
    BLOCK: "Block",
    TURNOVER: "Turnover",
    FOUL: "Foul",

    TIMEOUT: "Timeout",

    SUBSTITUTION_IN: "Substitution In",
    SUBSTITUTION_OUT: "Substitution Out",

    PERIOD_START: "Period Started",
    PERIOD_END: "Period Ended",
  };

  return labels[type] ?? type.replaceAll("_", " ");
}

function calculatePlayerStats(
  playerId: string,
  events: GameEventRow[]
) {
  const stats = {
    points: 0,
    rebounds: 0,
    assists: 0,
    steals: 0,
    blocks: 0,
    turnovers: 0,
  };

  events
    .filter((event) => event.player_id === playerId)
    .forEach((event) => {
      stats.points += getPoints(event.event_type);

      if (
        event.event_type === "OFFENSIVE_REBOUND" ||
        event.event_type === "DEFENSIVE_REBOUND"
      ) {
        stats.rebounds += 1;
      }

      if (event.event_type === "ASSIST") {
        stats.assists += 1;
      }

      if (event.event_type === "STEAL") {
        stats.steals += 1;
      }

      if (event.event_type === "BLOCK") {
        stats.blocks += 1;
      }

      if (event.event_type === "TURNOVER") {
        stats.turnovers += 1;
      }
    });

  return stats;
}

function normalizeYoutubeEmbedUrl(url: string | null) {
  if (!url) return null;

  if (url.includes("youtube.com/embed/")) {
    return url;
  }

  if (url.includes("youtube.com/watch?v=")) {
    const videoId = url.split("v=")[1]?.split("&")[0];

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }

  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0];

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }

  return url;
}

export default function LiveCenter() {
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [games, setGames] = useState<GameRow[]>([]);
  const [events, setEvents] = useState<GameEventRow[]>([]);

  const [loading, setLoading] = useState(true);

  /*
  ============================================================
  INITIAL LOAD
  ============================================================
  */

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const [
      teamsResponse,
      playersResponse,
      gamesResponse,
    ] = await Promise.all([
      supabase
        .from("teams")
        .select("id, name, slug"),

      supabase
        .from("players")
        .select(
          `
          id,
          team_id,
          first_name,
          last_name,
          jersey_number
          `
        ),

      supabase
        .from("games")
        .select(
          `
          id,
          game_code,
          home_team_id,
          away_team_id,
          status,
          current_period,
          game_clock,
          home_score,
          away_score,
          court,
          category,
          game_date,
          game_time,
          youtube_url
          `
        )
        .order("game_date")
        .order("game_time"),
    ]);

    setTeams(
      (teamsResponse.data ?? []) as TeamRow[]
    );

    setPlayers(
      (playersResponse.data ?? []) as PlayerRow[]
    );

    const loadedGames =
      (gamesResponse.data ?? []) as GameRow[];

    setGames(loadedGames);

    const currentGame =
      loadedGames.find(
        (game) =>
          game.status === "LIVE" ||
          game.status === "PAUSED"
      ) ?? null;

    if (currentGame) {
      await loadEvents(currentGame.id);
    }

    setLoading(false);
  }

  /*
  ============================================================
  CURRENT LIVE GAME
  ============================================================
  */

  const liveGame = useMemo(
    () =>
      games.find(
        (game) =>
          game.status === "LIVE" ||
          game.status === "PAUSED"
      ),
    [games]
  );

  const homeTeam = teams.find(
    (team) =>
      team.id === liveGame?.home_team_id
  );

  const awayTeam = teams.find(
    (team) =>
      team.id === liveGame?.away_team_id
  );

  const youtubeEmbedUrl =
    normalizeYoutubeEmbedUrl(
      liveGame?.youtube_url ?? null
    );

  /*
  ============================================================
  EVENTS
  ============================================================
  */

  async function loadEvents(gameId: string) {
    const { data } = await supabase
      .from("game_events")
      .select("*")
      .eq("game_id", gameId)
      .order("created_at", {
        ascending: false,
      });

    setEvents(
      (data ?? []) as GameEventRow[]
    );
  }

  /*
  ============================================================
  REALTIME
  ============================================================
  */

  useEffect(() => {
    if (!liveGame) return;

    void loadEvents(liveGame.id);

    const channel = supabase
      .channel(
        `live-center-${liveGame.id}`
      )

      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `id=eq.${liveGame.id}`,
        },
        (payload) => {
          const updatedGame =
            payload.new as GameRow;

          setGames((current) =>
            current.map((game) =>
              game.id === updatedGame.id
                ? updatedGame
                : game
            )
          );
        }
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_events",
          filter: `game_id=eq.${liveGame.id}`,
        },
        () => {
          void loadEvents(liveGame.id);
        }
      )

      .subscribe();

    return () => {
      void supabase.removeChannel(
        channel
      );
    };
  }, [liveGame?.id]);

  /*
  ============================================================
  PERIOD SCORES
  ============================================================
  */

  const periodScores = useMemo(() => {
    const result = {
      Q1: {
        home: 0,
        away: 0,
      },

      Q2: {
        home: 0,
        away: 0,
      },

      Q3: {
        home: 0,
        away: 0,
      },

      Q4: {
        home: 0,
        away: 0,
      },

      OT: {
        home: 0,
        away: 0,
      },
    };

    if (!liveGame) {
      return result;
    }

    events.forEach((event) => {
      const points =
        getPoints(event.event_type);

      if (points === 0) return;

      const period =
        event.period as keyof typeof result;

      if (!result[period]) return;

      if (
        event.team_id ===
        liveGame.home_team_id
      ) {
        result[period].home += points;
      }

      if (
        event.team_id ===
        liveGame.away_team_id
      ) {
        result[period].away += points;
      }
    });

    return result;
  }, [events, liveGame]);

  /*
  ============================================================
  GAME LEADERS
  ============================================================
  */

  const leaders = useMemo(() => {
    return players
      .filter(
        (player) =>
          player.team_id ===
            liveGame?.home_team_id ||
          player.team_id ===
            liveGame?.away_team_id
      )

      .map((player) => {
        const stats =
          calculatePlayerStats(
            player.id,
            events
          );

        return {
          ...player,
          ...stats,
        };
      })

      .filter(
        (player) =>
          player.points > 0 ||
          player.rebounds > 0 ||
          player.assists > 0 ||
          player.steals > 0 ||
          player.blocks > 0
      )

      .sort(
        (a, b) =>
          b.points - a.points ||
          b.rebounds - a.rebounds ||
          b.assists - a.assists ||
          b.steals - a.steals
      )

      .slice(0, 5);
  }, [
    players,
    events,
    liveGame,
  ]);

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loading) {
    return (
      <section className="bg-[#050816] px-6 py-24 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-gray-400">
            Loading Live Center...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="live-center"
      className="bg-[#050816] px-6 py-24 text-white"
    >
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-12">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.35em] text-red-400">
            🔴 Live Center
          </p>

          <h2 className="text-4xl font-black md:text-6xl">
            Games, scores, statistics and streams
          </h2>

          <p className="mt-5 text-lg text-gray-300">
            CYBL Summer League 2026 · 1–5 September 2026 · Telavi, Georgia
          </p>
        </div>

        {liveGame ? (
          <>
            {/* MAIN GRID */}

            <div className="grid gap-6 xl:grid-cols-[1fr_380px]">

              {/* SCOREBOARD */}

              <div className="overflow-hidden rounded-3xl border border-red-500/30 bg-white/10">

                {/* LIVE HEADER */}

                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-red-500/10 px-6 py-5">

                  <div className="flex items-center gap-3">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        liveGame.status === "LIVE"
                          ? "animate-pulse bg-red-500"
                          : "bg-yellow-400"
                      }`}
                    />

                    <span
                      className={`font-black uppercase tracking-[0.2em] ${
                        liveGame.status === "LIVE"
                          ? "text-red-400"
                          : "text-yellow-300"
                      }`}
                    >
                      {liveGame.status === "PAUSED"
                        ? "Paused"
                        : "Live Now"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">

                    <span className="font-black">
                      {liveGame.current_period}
                    </span>

                    <span className="font-mono text-3xl font-black">
                      {liveGame.game_clock}
                    </span>

                    <span className="text-gray-400">
                      {liveGame.court}
                    </span>

                  </div>

                </div>

                {/* SCORE */}

                <div className="grid gap-6 p-8 md:grid-cols-[1fr_auto_1fr] md:items-center">

                  {/* HOME */}

                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                      Home
                    </p>

                    <h3 className="mt-3 text-4xl font-black">
                      {homeTeam?.name ??
                        "TBA"}
                    </h3>

                    <p className="mt-6 text-8xl font-black text-orange-400">
                      {liveGame.home_score}
                    </p>
                  </div>

                  <div className="text-xl font-black text-gray-600">
                    VS
                  </div>

                  {/* AWAY */}

                  <div className="md:text-right">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                      Away
                    </p>

                    <h3 className="mt-3 text-4xl font-black">
                      {awayTeam?.name ??
                        "TBA"}
                    </h3>

                    <p className="mt-6 text-8xl font-black text-orange-400">
                      {liveGame.away_score}
                    </p>
                  </div>

                </div>

                {/* PERIOD SCORES */}

                <div className="border-t border-white/10 p-6">

                  <h4 className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-gray-400">
                    Period Scores
                  </h4>

                  <div className="overflow-x-auto">

                    <table className="w-full min-w-[600px]">

                      <thead>

                        <tr className="text-xs uppercase text-gray-500">

                          <th className="px-3 py-2 text-left">
                            Team
                          </th>

                          <th className="px-3 py-2">
                            Q1
                          </th>

                          <th className="px-3 py-2">
                            Q2
                          </th>

                          <th className="px-3 py-2">
                            Q3
                          </th>

                          <th className="px-3 py-2">
                            Q4
                          </th>

                          <th className="px-3 py-2">
                            OT
                          </th>

                          <th className="px-3 py-2">
                            Total
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        <tr className="border-t border-white/10">

                          <td className="px-3 py-3 font-bold">
                            {homeTeam?.name}
                          </td>

                          <td className="text-center">
                            {periodScores.Q1.home}
                          </td>

                          <td className="text-center">
                            {periodScores.Q2.home}
                          </td>

                          <td className="text-center">
                            {periodScores.Q3.home}
                          </td>

                          <td className="text-center">
                            {periodScores.Q4.home}
                          </td>

                          <td className="text-center">
                            {periodScores.OT.home}
                          </td>

                          <td className="text-center text-xl font-black text-orange-400">
                            {liveGame.home_score}
                          </td>

                        </tr>

                        <tr className="border-t border-white/10">

                          <td className="px-3 py-3 font-bold">
                            {awayTeam?.name}
                          </td>

                          <td className="text-center">
                            {periodScores.Q1.away}
                          </td>

                          <td className="text-center">
                            {periodScores.Q2.away}
                          </td>

                          <td className="text-center">
                            {periodScores.Q3.away}
                          </td>

                          <td className="text-center">
                            {periodScores.Q4.away}
                          </td>

                          <td className="text-center">
                            {periodScores.OT.away}
                          </td>

                          <td className="text-center text-xl font-black text-orange-400">
                            {liveGame.away_score}
                          </td>

                        </tr>

                      </tbody>

                    </table>

                  </div>

                </div>

              </div>

              {/* GAME LEADERS */}

              <div className="rounded-3xl border border-white/10 bg-white/10 p-6">

                <h3 className="text-2xl font-black">
                  Game Leaders
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                  Live player statistics
                </p>

                <div className="mt-6 space-y-3">

                  {leaders.length === 0 ? (
                    <p className="text-gray-400">
                      Player statistics will appear here.
                    </p>
                  ) : (
                    leaders.map(
                      (player, index) => {
                        const team =
                          teams.find(
                            (item) =>
                              item.id ===
                              player.team_id
                          );

                        return (
                          <div
                            key={player.id}
                            className="rounded-2xl border border-white/10 bg-[#081321] p-4"
                          >

                            <p className="text-xs font-black uppercase text-orange-400">
                              #{index + 1}
                              {" · "}
                              {team?.name}
                            </p>

                            <div className="mt-2 flex items-start justify-between gap-4">

                              <p className="font-black">
                                #{player.jersey_number}
                                {" "}
                                {player.first_name}
                                {" "}
                                {player.last_name}
                              </p>

                              <span className="text-2xl font-black text-orange-400">
                                {player.points}
                              </span>

                            </div>

                            <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400">

                              <span>
                                {player.rebounds} REB
                              </span>

                              <span>
                                {player.assists} AST
                              </span>

                              <span>
                                {player.steals} STL
                              </span>

                              <span>
                                {player.blocks} BLK
                              </span>

                            </div>

                          </div>
                        );
                      }
                    )
                  )}

                </div>

              </div>

            </div>

            {/* YOUTUBE LIVE */}

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/10 p-6">

              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">

                <div>
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-red-400">
                    Live Stream
                  </p>

                  <h3 className="mt-2 text-3xl font-black">
                    Watch the Game Live
                  </h3>
                </div>

                {youtubeEmbedUrl && (
                  <span className="rounded-full bg-red-500/15 px-4 py-2 text-xs font-black uppercase tracking-wider text-red-400">
                    YouTube Live
                  </span>
                )}

              </div>

              {youtubeEmbedUrl ? (
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-black">

                  <iframe
                    className="aspect-video w-full"
                    src={youtubeEmbedUrl}
                    title="CYBL Live Stream"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />

                </div>
              ) : (
                <div className="flex min-h-[260px] items-center justify-center rounded-3xl border border-dashed border-white/15 bg-[#081321] p-8 text-center">

                  <div>
                    <p className="text-2xl font-black">
                      Live stream not added yet
                    </p>

                    <p className="mt-3 text-gray-400">
                      The YouTube live stream will appear here automatically when the game stream link is added.
                    </p>
                  </div>

                </div>
              )}

            </div>

            {/* PLAY BY PLAY */}

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/10 p-6">

              <div className="flex flex-wrap items-center justify-between gap-4">

                <div>
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-orange-400">
                    Live Updates
                  </p>

                  <h3 className="mt-2 text-3xl font-black">
                    Play-by-Play
                  </h3>
                </div>

                <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-black uppercase text-red-400">
                  Live
                </span>

              </div>

              <div className="mt-6 max-h-[500px] space-y-3 overflow-y-auto pr-2">

                {events.length === 0 ? (
                  <p className="text-gray-400">
                    Game events will appear here.
                  </p>
                ) : (
                  events
                    .slice(0, 30)
                    .map((event) => {
                      const team =
                        teams.find(
                          (item) =>
                            item.id ===
                            event.team_id
                        );

                      const player =
                        players.find(
                          (item) =>
                            item.id ===
                            event.player_id
                        );

                      return (
                        <div
                          key={event.id}
                          className="rounded-2xl border border-white/10 bg-[#081321] p-4"
                        >

                          <p className="text-xs font-black uppercase text-orange-400">
                            {event.period}
                            {" · "}
                            {event.game_clock}
                          </p>

                          <p className="mt-2 font-black">
                            {team?.name ??
                              "Game"}

                            {player
                              ? ` · #${player.jersey_number} ${player.first_name} ${player.last_name}`
                              : ""}
                          </p>

                          <p className="mt-1 text-sm text-gray-300">
                            {formatEventName(
                              event.event_type
                            )}
                          </p>

                        </div>
                      );
                    })
                )}

              </div>

            </div>

          </>
        ) : (
          /* NO LIVE GAME */

          <div className="rounded-3xl border border-orange-500/20 bg-white/10 p-8">

            <p className="text-sm font-black uppercase tracking-widest text-orange-300">
              Tournament starts soon
            </p>

            <h3 className="mt-4 text-3xl font-black">
              No live game right now
            </h3>

            <p className="mt-4 text-gray-300">
              Live scores, player statistics, play-by-play updates and YouTube streams will appear here when a game starts.
            </p>

          </div>
        )}

      </div>
    </section>
  );
}