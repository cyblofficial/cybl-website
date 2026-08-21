"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

type Profile = {
  id: string;
  email: string | null;
  role: "SUPER_ADMIN" | "SCORER";
  is_active: boolean;
};

type TeamRow = {
  id: string;
  name: string;
  short_name: string | null;
};

type TournamentRow = {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  is_published: boolean | null;
};

type GameRow = {
  id: string;
  tournament_id: string | null;
  game_code: string;
  stage: string | null;
  group_name: string | null;
  home_team_id: string | null;
  away_team_id: string | null;
  game_date: string | null;
  game_time: string | null;
  court: string | null;
  category: string | null;
  status: string | null;
  current_period: string | null;
  game_clock: string | null;
  home_score: number;
  away_score: number;
  home_fouls: number;
  away_fouls: number;
  home_timeouts: number;
  away_timeouts: number;
  youtube_url: string | null;
  started_at: string | null;
  finished_at: string | null;
};

type PlayerRow = {
  id: string;
  cybl_id: string;
  team_id: string | null;
  first_name: string;
  last_name: string;
  jersey_number: number | null;
  position: string | null;
  height_cm: number | null;
  is_active: boolean | null;
};

type GameRosterRow = {
  id?: string;
  game_id: string;
  team_id: string;
  player_id: string;
  is_selected: boolean;
  is_starter: boolean;
  is_on_court: boolean;
};

type GameForm = {
  tournament_id: string;
  game_code: string;
  stage: string;
  group_name: string;
  home_team_id: string;
  away_team_id: string;
  game_date: string;
  game_time: string;
  court: string;
  category: string;
  status: string;
  current_period: string;
  game_clock: string;
  home_score: number;
  away_score: number;
  home_fouls: number;
  away_fouls: number;
  home_timeouts: number;
  away_timeouts: number;
  youtube_url: string;
};

const emptyForm: GameForm = {
  tournament_id: "",
  game_code: "",
  stage: "GROUP",
  group_name: "",
  home_team_id: "",
  away_team_id: "",
  game_date: "",
  game_time: "",
  court: "Court A",
  category: "U16",
  status: "UPCOMING",
  current_period: "Q1",
  game_clock: "10:00",
  home_score: 0,
  away_score: 0,
  home_fouls: 0,
  away_fouls: 0,
  home_timeouts: 0,
  away_timeouts: 0,
  youtube_url: "",
};

export default function AdminGamesPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [tournaments, setTournaments] = useState<TournamentRow[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [games, setGames] = useState<GameRow[]>([]);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [rosters, setRosters] = useState<GameRosterRow[]>([]);

  const [selectedGameId, setSelectedGameId] = useState("");
  const [form, setForm] = useState<GameForm>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [savingGame, setSavingGame] = useState(false);
  const [savingHome, setSavingHome] = useState(false);
  const [savingAway, setSavingAway] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    void loadPage();
  }, []);

  const selectedGame = useMemo(
    () => games.find((game) => game.id === selectedGameId),
    [games, selectedGameId]
  );

  const homeTeam = useMemo(
    () => teams.find((team) => team.id === form.home_team_id),
    [teams, form.home_team_id]
  );

  const awayTeam = useMemo(
    () => teams.find((team) => team.id === form.away_team_id),
    [teams, form.away_team_id]
  );

  const homePlayers = useMemo(
    () =>
      players
        .filter(
          (player) =>
            player.team_id === form.home_team_id &&
            (player.is_active ?? true)
        )
        .sort(
          (a, b) =>
            (a.jersey_number ?? 999) - (b.jersey_number ?? 999)
        ),
    [players, form.home_team_id]
  );

  const awayPlayers = useMemo(
    () =>
      players
        .filter(
          (player) =>
            player.team_id === form.away_team_id &&
            (player.is_active ?? true)
        )
        .sort(
          (a, b) =>
            (a.jersey_number ?? 999) - (b.jersey_number ?? 999)
        ),
    [players, form.away_team_id]
  );

  const selectedHomeRoster = useMemo(
    () =>
      rosters.filter(
        (row) =>
          row.game_id === selectedGameId &&
          row.team_id === form.home_team_id &&
          row.is_selected
      ),
    [rosters, selectedGameId, form.home_team_id]
  );

  const selectedAwayRoster = useMemo(
    () =>
      rosters.filter(
        (row) =>
          row.game_id === selectedGameId &&
          row.team_id === form.away_team_id &&
          row.is_selected
      ),
    [rosters, selectedGameId, form.away_team_id]
  );

  const homeStarterCount = selectedHomeRoster.filter(
    (row) => row.is_starter
  ).length;

  const awayStarterCount = selectedAwayRoster.filter(
    (row) => row.is_starter
  ).length;

  async function loadPage() {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      router.replace("/admin/login");
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, role, is_active")
      .eq("id", session.user.id)
      .single();

    if (
      profileError ||
      !profileData ||
      !profileData.is_active ||
      !["SUPER_ADMIN", "SCORER"].includes(profileData.role)
    ) {
      router.replace("/admin");
      return;
    }

    setProfile(profileData as Profile);

    const [
      tournamentsResponse,
      teamsResponse,
      gamesResponse,
      playersResponse,
    ] = await Promise.all([
      supabase
        .from("tournaments")
        .select("id, name, start_date, end_date, is_published")
        .order("start_date", { ascending: true }),

      supabase
        .from("teams")
        .select("id, name, short_name")
        .order("name"),

      supabase
        .from("games")
        .select("*")
        .order("game_date", { ascending: true })
        .order("game_time", { ascending: true }),

      supabase
        .from("players")
        .select(
          `
          id,
          cybl_id,
          team_id,
          first_name,
          last_name,
          jersey_number,
          position,
          height_cm,
          is_active
          `
        ),
    ]);

    if (tournamentsResponse.error) {
      setErrorMessage(tournamentsResponse.error.message);
      setLoading(false);
      return;
    }

    if (teamsResponse.error) {
      setErrorMessage(teamsResponse.error.message);
      setLoading(false);
      return;
    }

    if (gamesResponse.error) {
      setErrorMessage(gamesResponse.error.message);
      setLoading(false);
      return;
    }

    if (playersResponse.error) {
      setErrorMessage(playersResponse.error.message);
      setLoading(false);
      return;
    }

    const loadedTournaments =
      (tournamentsResponse.data ?? []) as TournamentRow[];
    const loadedTeams = (teamsResponse.data ?? []) as TeamRow[];
    const loadedGames = (gamesResponse.data ?? []) as GameRow[];
    const loadedPlayers = (playersResponse.data ?? []) as PlayerRow[];

    setTournaments(loadedTournaments);
    setTeams(loadedTeams);
    setGames(loadedGames);
    setPlayers(loadedPlayers);

    if (loadedGames.length > 0) {
      const firstGame = loadedGames[0];

      setSelectedGameId(firstGame.id);
      fillForm(firstGame);
      await loadRosters(firstGame.id);
    }

    setLoading(false);
  }

  function fillForm(game: GameRow) {
    setForm({
      tournament_id: game.tournament_id ?? "",
      game_code: game.game_code ?? "",
      stage: game.stage ?? "GROUP",
      group_name: game.group_name ?? "",
      home_team_id: game.home_team_id ?? "",
      away_team_id: game.away_team_id ?? "",
      game_date: game.game_date ?? "",
      game_time: game.game_time?.slice(0, 5) ?? "",
      court: game.court ?? "",
      category: game.category ?? "",
      status: game.status ?? "UPCOMING",
      current_period: game.current_period ?? "Q1",
      game_clock: game.game_clock ?? "10:00",
      home_score: game.home_score ?? 0,
      away_score: game.away_score ?? 0,
      home_fouls: game.home_fouls ?? 0,
      away_fouls: game.away_fouls ?? 0,
      home_timeouts: game.home_timeouts ?? 0,
      away_timeouts: game.away_timeouts ?? 0,
      youtube_url: game.youtube_url ?? "",
    });
  }

  async function loadRosters(gameId: string) {
    const { data, error } = await supabase
      .from("game_rosters")
      .select("*")
      .eq("game_id", gameId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setRosters((data ?? []) as GameRosterRow[]);
  }

  async function ensureAutomaticRoster(
    gameId: string,
    teamId: string,
    teamPlayers: PlayerRow[]
  ) {
    if (!gameId || !teamId || teamPlayers.length === 0) return;

    const { data: existingRows, error: existingError } = await supabase
      .from("game_rosters")
      .select("*")
      .eq("game_id", gameId)
      .eq("team_id", teamId);

    if (existingError) {
      setErrorMessage(existingError.message);
      return;
    }

    const existing = (existingRows ?? []) as GameRosterRow[];
    const existingByPlayer = new Map(
      existing.map((row) => [row.player_id, row])
    );

    const rowsToUpsert = teamPlayers.map((player) => {
      const old = existingByPlayer.get(player.id);

      return {
        game_id: gameId,
        team_id: teamId,
        player_id: player.id,
        is_selected: true,
        is_starter: old?.is_starter ?? false,
        is_on_court: old?.is_starter ?? false,
      };
    });

    const { error: upsertError } = await supabase
      .from("game_rosters")
      .upsert(rowsToUpsert, {
        onConflict: "game_id,team_id,player_id",
      });

    if (upsertError) {
      setErrorMessage(upsertError.message);
      return;
    }

    await loadRosters(gameId);
  }

  async function prepareGameRosters(
    gameId: string,
    homeTeamId: string,
    awayTeamId: string
  ) {
    const home = players.filter(
      (player) =>
        player.team_id === homeTeamId &&
        (player.is_active ?? true)
    );

    const away = players.filter(
      (player) =>
        player.team_id === awayTeamId &&
        (player.is_active ?? true)
    );

    await ensureAutomaticRoster(gameId, homeTeamId, home);
    await ensureAutomaticRoster(gameId, awayTeamId, away);
    await loadRosters(gameId);
  }

  async function handleGameChange(gameId: string) {
    const game = games.find((item) => item.id === gameId);

    if (!game) return;

    setSelectedGameId(gameId);
    fillForm(game);
    setMessage("");
    setErrorMessage("");

    await prepareGameRosters(
      gameId,
      game.home_team_id ?? "",
      game.away_team_id ?? ""
    );
  }

  function updateForm<K extends keyof GameForm>(
    field: K,
    value: GameForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveGameDetails() {
    if (!form.home_team_id || !form.away_team_id) {
      setErrorMessage("Select both Home and Away teams.");
      return;
    }

    if (form.home_team_id === form.away_team_id) {
      setErrorMessage("Home and Away teams cannot be the same.");
      return;
    }

    if (!form.game_code.trim()) {
      setErrorMessage("Game Code is required.");
      return;
    }

    setSavingGame(true);
    setMessage("");
    setErrorMessage("");

    const updateData = {
      tournament_id: form.tournament_id || null,
      game_code: form.game_code.trim(),
      stage: form.stage || null,
      group_name: form.group_name.trim() || null,
      home_team_id: form.home_team_id,
      away_team_id: form.away_team_id,
      game_date: form.game_date || null,
      game_time: form.game_time || null,
      court: form.court.trim() || null,
      category: form.category.trim() || null,
      status: form.status,
      current_period: form.current_period,
      game_clock: form.game_clock,
      home_score: Number(form.home_score) || 0,
      away_score: Number(form.away_score) || 0,
      home_fouls: Number(form.home_fouls) || 0,
      away_fouls: Number(form.away_fouls) || 0,
      home_timeouts: Number(form.home_timeouts) || 0,
      away_timeouts: Number(form.away_timeouts) || 0,
      youtube_url: form.youtube_url.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (!selectedGameId) {
      const { data, error } = await supabase
        .from("games")
        .insert(updateData)
        .select()
        .single();

      if (error) {
        setErrorMessage(error.message);
        setSavingGame(false);
        return;
      }

      const createdGame = data as GameRow;

      setGames((current) =>
        [...current, createdGame].sort((a, b) =>
          `${a.game_date ?? ""} ${a.game_time ?? ""}`.localeCompare(
            `${b.game_date ?? ""} ${b.game_time ?? ""}`
          )
        )
      );

      setSelectedGameId(createdGame.id);
      fillForm(createdGame);
      setRosters([]);

      await prepareGameRosters(
        createdGame.id,
        createdGame.home_team_id ?? "",
        createdGame.away_team_id ?? ""
      );

      setMessage(
        "✓ New game created. Active players were added automatically — choose only the Starting 5."
      );
      setSavingGame(false);
      return;
    }

    const { data, error } = await supabase
      .from("games")
      .update(updateData)
      .eq("id", selectedGameId)
      .select()
      .single();

    if (error) {
      setErrorMessage(error.message);
      setSavingGame(false);
      return;
    }

    setGames((current) =>
      current.map((game) =>
        game.id === selectedGameId ? (data as GameRow) : game
      )
    );

    await prepareGameRosters(
      selectedGameId,
      form.home_team_id,
      form.away_team_id
    );

    setMessage(
      "✓ Game details saved. Active team players are in the game roster automatically."
    );
    setSavingGame(false);
  }

  function newGame() {
    setSelectedGameId("");
    setForm({
      ...emptyForm,
      tournament_id:
        tournaments.find((tournament) => tournament.is_published)?.id ?? "",
    });
    setRosters([]);
    setMessage("");
    setErrorMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function startSelectedGame(gameId: string) {
    const game = games.find((item) => item.id === gameId);
    if (!game) return;

    const confirmed = window.confirm(
      `Start ${game.game_code} now?`
    );

    if (!confirmed) return;

    setSavingGame(true);
    setMessage("");
    setErrorMessage("");

    const { data, error } = await supabase
      .from("games")
      .update({
        status: "LIVE",
        current_period: game.current_period || "Q1",
        game_clock: game.game_clock || "10:00",
        started_at: game.started_at ?? new Date().toISOString(),
        finished_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", gameId)
      .select()
      .single();

    if (error) {
      setErrorMessage(error.message);
      setSavingGame(false);
      return;
    }

    setGames((current) =>
      current.map((item) =>
        item.id === gameId ? (data as GameRow) : item
      )
    );

    setSavingGame(false);
    router.push(`/scorer?game=${gameId}`);
  }

  async function cancelGame(gameId: string) {
    const game = games.find((item) => item.id === gameId);
    if (!game) return;

    const confirmed = window.confirm(
      `Cancel ${game.game_code}?`
    );

    if (!confirmed) return;

    const { data, error } = await supabase
      .from("games")
      .update({
        status: "CANCELLED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", gameId)
      .select()
      .single();

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setGames((current) =>
      current.map((item) =>
        item.id === gameId ? (data as GameRow) : item
      )
    );

    if (selectedGameId === gameId) {
      fillForm(data as GameRow);
    }

    setMessage("✓ Game cancelled.");
  }

  async function deleteGame(gameId: string) {
    const game = games.find((item) => item.id === gameId);
    if (!game) return;

    const confirmed = window.confirm(
      `Permanently delete ${game.game_code}? This cannot be undone.`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("games")
      .delete()
      .eq("id", gameId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    const remaining = games.filter((item) => item.id !== gameId);
    setGames(remaining);

    if (selectedGameId === gameId) {
      if (remaining.length > 0) {
        setSelectedGameId(remaining[0].id);
        fillForm(remaining[0]);
        await loadRosters(remaining[0].id);
      } else {
        newGame();
      }
    }

    setMessage("✓ Game deleted.");
  }

  function getRosterRow(playerId: string, teamId: string) {
    return rosters.find(
      (row) =>
        row.game_id === selectedGameId &&
        row.team_id === teamId &&
        row.player_id === playerId
    );
  }

  function isPlayerSelected(playerId: string, teamId: string) {
    return getRosterRow(playerId, teamId)?.is_selected ?? false;
  }

  function isPlayerStarter(playerId: string, teamId: string) {
    return getRosterRow(playerId, teamId)?.is_starter ?? false;
  }

  function togglePlayerSelected(player: PlayerRow, teamId: string) {
    setMessage("");
    setErrorMessage("");

    setRosters((current) => {
      const existing = current.find(
        (row) =>
          row.game_id === selectedGameId &&
          row.team_id === teamId &&
          row.player_id === player.id
      );

      if (!existing) {
        return [
          ...current,
          {
            game_id: selectedGameId,
            team_id: teamId,
            player_id: player.id,
            is_selected: true,
            is_starter: false,
            is_on_court: false,
          },
        ];
      }

      return current.map((row) =>
        row.game_id === selectedGameId &&
        row.team_id === teamId &&
        row.player_id === player.id
          ? {
              ...row,
              is_selected: !row.is_selected,
              is_starter: row.is_selected ? false : row.is_starter,
              is_on_court: row.is_selected ? false : row.is_on_court,
            }
          : row
      );
    });
  }

  function toggleStarter(player: PlayerRow, teamId: string) {
    setMessage("");
    setErrorMessage("");

    const existing = getRosterRow(player.id, teamId);
    const currentlyStarter = existing?.is_starter ?? false;

    const currentStarterCount = rosters.filter(
      (row) =>
        row.game_id === selectedGameId &&
        row.team_id === teamId &&
        row.is_selected &&
        row.is_starter
    ).length;

    if (!currentlyStarter && currentStarterCount >= 5) {
      setErrorMessage(
        "Starting 5 is already complete. Remove one starter first."
      );
      return;
    }

    setRosters((current) => {
      const rowExists = current.some(
        (row) =>
          row.game_id === selectedGameId &&
          row.team_id === teamId &&
          row.player_id === player.id
      );

      if (!rowExists) {
        return [
          ...current,
          {
            game_id: selectedGameId,
            team_id: teamId,
            player_id: player.id,
            is_selected: true,
            is_starter: true,
            is_on_court: true,
          },
        ];
      }

      return current.map((row) =>
        row.game_id === selectedGameId &&
        row.team_id === teamId &&
        row.player_id === player.id
          ? {
              ...row,
              is_selected: true,
              is_starter: !currentlyStarter,
              is_on_court: !currentlyStarter,
            }
          : row
      );
    });
  }

  function selectAllPlayers(teamPlayers: PlayerRow[], teamId: string) {
    setRosters((current) => {
      const otherRows = current.filter(
        (row) =>
          !(
            row.game_id === selectedGameId &&
            row.team_id === teamId
          )
      );

      const teamRows = teamPlayers.map((player) => {
        const existing = current.find(
          (row) =>
            row.game_id === selectedGameId &&
            row.team_id === teamId &&
            row.player_id === player.id
        );

        return {
          game_id: selectedGameId,
          team_id: teamId,
          player_id: player.id,
          is_selected: true,
          is_starter: existing?.is_starter ?? false,
          is_on_court: existing?.is_starter ?? false,
        };
      });

      return [...otherRows, ...teamRows];
    });
  }

  function clearTeamRoster(teamId: string) {
    setRosters((current) =>
      current.map((row) =>
        row.game_id === selectedGameId && row.team_id === teamId
          ? {
              ...row,
              is_selected: false,
              is_starter: false,
              is_on_court: false,
            }
          : row
      )
    );
  }

  async function saveTeamRoster(
    teamId: string,
    teamName: string,
    teamPlayers: PlayerRow[]
  ) {
    const teamRosterRows = teamPlayers
      .map((player) => getRosterRow(player.id, teamId))
      .filter(
        (row): row is GameRosterRow =>
          Boolean(row && row.is_selected)
      );

    const starterCount = teamRosterRows.filter(
      (row) => row.is_starter
    ).length;

    if (starterCount !== 5) {
      setErrorMessage(
        `${teamName} must have exactly 5 starting players. Currently: ${starterCount}.`
      );
      return;
    }

    if (teamId === form.home_team_id) setSavingHome(true);
    if (teamId === form.away_team_id) setSavingAway(true);

    setMessage("");
    setErrorMessage("");

    const { error: deleteError } = await supabase
      .from("game_rosters")
      .delete()
      .eq("game_id", selectedGameId)
      .eq("team_id", teamId);

    if (deleteError) {
      setErrorMessage(deleteError.message);
      setSavingHome(false);
      setSavingAway(false);
      return;
    }

    const rowsToInsert = teamRosterRows.map((row) => ({
      game_id: selectedGameId,
      team_id: teamId,
      player_id: row.player_id,
      is_selected: true,
      is_starter: row.is_starter,
      is_on_court: row.is_starter,
    }));

    const { error: insertError } = await supabase
      .from("game_rosters")
      .insert(rowsToInsert);

    if (insertError) {
      setErrorMessage(insertError.message);
      setSavingHome(false);
      setSavingAway(false);
      return;
    }

    await loadRosters(selectedGameId);

    setMessage(`✓ ${teamName} roster and Starting 5 saved.`);

    setSavingHome(false);
    setSavingAway(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
        <p className="text-xl font-black">Loading Games Manager...</p>
      </main>
    );
  }

  if (!profile) return null;

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-8 text-white md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-400">
              CYBL Administration
            </p>

            <h1 className="mt-3 text-4xl font-black md:text-6xl">
              Games Manager
            </h1>

            <p className="mt-4 text-gray-400">
              Manage game details, schedules, streams, rosters and Starting 5.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/admin"
              className="rounded-full border border-white/15 bg-white/10 px-5 py-3 font-black"
            >
              ← Dashboard
            </a>

            <button
              type="button"
              onClick={newGame}
              className="rounded-full bg-green-500 px-5 py-3 font-black text-black"
            >
              + ADD NEW GAME
            </button>

            <a
              href={
                selectedGameId
                  ? `/scorer?game=${selectedGameId}`
                  : "/scorer"
              }
              className="rounded-full bg-orange-500 px-5 py-3 font-black"
            >
              Open Scorer
            </a>
          </div>
        </div>

        {message && (
          <div className="mt-8 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 font-bold text-green-300">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 font-bold text-red-300">
            {errorMessage}
          </div>
        )}

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-400">
                Game Control
              </p>
              <h2 className="mt-2 text-3xl font-black">
                Upcoming & Live Games
              </h2>
            </div>

            <button
              type="button"
              onClick={newGame}
              className="rounded-full bg-green-500 px-5 py-3 font-black text-black"
            >
              + ADD GAME
            </button>
          </div>

          <div className="mt-5 grid gap-4">
            {games
              .filter((game) =>
                ["UPCOMING", "LIVE", "PAUSED"].includes(game.status ?? "")
              )
              .map((game) => {
                const home =
                  teams.find((team) => team.id === game.home_team_id)
                    ?.short_name ||
                  teams.find((team) => team.id === game.home_team_id)?.name ||
                  "TBA";

                const away =
                  teams.find((team) => team.id === game.away_team_id)
                    ?.short_name ||
                  teams.find((team) => team.id === game.away_team_id)?.name ||
                  "TBA";

                return (
                  <div
                    key={game.id}
                    className={`rounded-3xl border p-5 ${
                      game.status === "LIVE"
                        ? "border-red-500/40 bg-red-500/10"
                        : game.status === "PAUSED"
                        ? "border-yellow-500/30 bg-yellow-500/10"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-black text-orange-300">
                            {game.game_code}
                          </span>

                          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">
                            {game.status}
                          </span>
                        </div>

                        <h3 className="mt-3 text-2xl font-black">
                          {home} vs {away}
                        </h3>

                        <p className="mt-2 text-sm text-gray-400">
                          📅 {game.game_date || "No date"} · 🕒{" "}
                          {game.game_time?.slice(0, 5) || "No time"} · 🏟️{" "}
                          {game.court || "TBA"}
                        </p>

                        {game.youtube_url && (
                          <p className="mt-2 text-xs font-bold text-green-400">
                            ✓ YouTube Live link added
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void handleGameChange(game.id)}
                          className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black"
                        >
                          EDIT
                        </button>

                        {game.status === "UPCOMING" ? (
                          <button
                            type="button"
                            disabled={savingGame}
                            onClick={() => void startSelectedGame(game.id)}
                            className="rounded-xl bg-green-500 px-5 py-3 text-sm font-black text-black disabled:opacity-40"
                          >
                            START GAME →
                          </button>
                        ) : (
                          <a
                            href={`/scorer?game=${game.id}`}
                            className="rounded-xl bg-red-500 px-5 py-3 text-sm font-black"
                          >
                            OPEN SCORER →
                          </a>
                        )}

                        {game.status !== "CANCELLED" &&
                          game.status !== "FINISHED" && (
                            <button
                              type="button"
                              onClick={() => void cancelGame(game.id)}
                              className="rounded-xl border border-yellow-500/40 px-4 py-3 text-sm font-black text-yellow-300"
                            >
                              CANCEL
                            </button>
                          )}

                        <button
                          type="button"
                          onClick={() => void deleteGame(game.id)}
                          className="rounded-xl border border-red-500/40 px-4 py-3 text-sm font-black text-red-300"
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

            {games.filter((game) =>
              ["UPCOMING", "LIVE", "PAUSED"].includes(game.status ?? "")
            ).length === 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-7 text-gray-400">
                No upcoming or live games. Use + ADD GAME.
              </div>
            )}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/10 p-6">
          <label className="mb-2 block font-bold text-gray-300">
            Select Game
          </label>

          <select
            value={selectedGameId}
            onChange={(e) => {
              if (!e.target.value) {
                newGame();
                return;
              }

              void handleGameChange(e.target.value);
            }}
            className="w-full rounded-2xl border border-white/10 bg-[#081321] px-4 py-4 font-black"
          >
            <option value="">+ Create New Game</option>

            {games.map((game) => {
              const home =
                teams.find((team) => team.id === game.home_team_id)?.name ??
                "TBA";

              const away =
                teams.find((team) => team.id === game.away_team_id)?.name ??
                "TBA";

              return (
                <option key={game.id} value={game.id}>
                  {game.game_code} — {home} vs {away} —{" "}
                  {game.game_date ?? ""} {game.game_time?.slice(0, 5) ?? ""}
                </option>
              );
            })}
          </select>
        </section>

        {(selectedGame || !selectedGameId) && (
          <>
            <section className="mt-8 rounded-3xl border border-orange-500/20 bg-white/10 p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-orange-400">
                    Game Details
                  </p>

                  <h2 className="mt-2 text-3xl font-black">
                    {selectedGameId
                      ? `Edit ${form.game_code || "Game"}`
                      : "Add New Game"}
                  </h2>
                </div>

                <span className="rounded-full bg-orange-500/15 px-4 py-2 font-black text-orange-300">
                  {form.status}
                </span>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <Field label="Tournament">
                  <select
                    value={form.tournament_id}
                    onChange={(e) =>
                      updateForm("tournament_id", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">No Tournament</option>
                    {tournaments.map((tournament) => (
                      <option key={tournament.id} value={tournament.id}>
                        {tournament.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Game Code">
                  <input
                    value={form.game_code}
                    onChange={(e) =>
                      updateForm("game_code", e.target.value)
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Stage">
                  <select
                    value={form.stage}
                    onChange={(e) => updateForm("stage", e.target.value)}
                    className={inputClass}
                  >
                    <option value="GROUP">GROUP</option>
                    <option value="QUARTERFINAL">QUARTERFINAL</option>
                    <option value="SEMIFINAL">SEMIFINAL</option>
                    <option value="FINAL">FINAL</option>
                    <option value="PLACEMENT">PLACEMENT</option>
                  </select>
                </Field>

                <Field label="Group">
                  <input
                    value={form.group_name}
                    onChange={(e) =>
                      updateForm("group_name", e.target.value)
                    }
                    placeholder="A / B / empty"
                    className={inputClass}
                  />
                </Field>

                <Field label="Home Team">
                  <select
                    value={form.home_team_id}
                    onChange={(e) =>
                      updateForm("home_team_id", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Away Team">
                  <select
                    value={form.away_team_id}
                    onChange={(e) =>
                      updateForm("away_team_id", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Category">
                  <input
                    value={form.category}
                    onChange={(e) =>
                      updateForm("category", e.target.value)
                    }
                    placeholder="U16"
                    className={inputClass}
                  />
                </Field>

                <Field label="Game Date">
                  <input
                    type="date"
                    value={form.game_date}
                    onChange={(e) =>
                      updateForm("game_date", e.target.value)
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Start Time">
                  <input
                    type="time"
                    value={form.game_time}
                    onChange={(e) =>
                      updateForm("game_time", e.target.value)
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Court">
                  <input
                    value={form.court}
                    onChange={(e) => updateForm("court", e.target.value)}
                    placeholder="Court A"
                    className={inputClass}
                  />
                </Field>

                <Field label="Status">
                  <select
                    value={form.status}
                    onChange={(e) => updateForm("status", e.target.value)}
                    className={inputClass}
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="LIVE">LIVE</option>
                    <option value="PAUSED">PAUSED</option>
                    <option value="FINISHED">FINISHED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </Field>

                <Field label="Current Period">
                  <select
                    value={form.current_period}
                    onChange={(e) =>
                      updateForm("current_period", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="Q1">Q1</option>
                    <option value="Q2">Q2</option>
                    <option value="Q3">Q3</option>
                    <option value="Q4">Q4</option>
                    <option value="OT">OT</option>
                  </select>
                </Field>

                <Field label="Game Clock">
                  <input
                    value={form.game_clock}
                    onChange={(e) =>
                      updateForm("game_clock", e.target.value)
                    }
                    placeholder="10:00"
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-[#081321] p-6">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                    Home
                  </p>

                  <h3 className="mt-2 text-2xl font-black">
                    {homeTeam?.name ?? "Select Home Team"}
                  </h3>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <NumberField
                      label="Score"
                      value={form.home_score}
                      onChange={(value) => updateForm("home_score", value)}
                    />

                    <NumberField
                      label="Fouls"
                      value={form.home_fouls}
                      onChange={(value) => updateForm("home_fouls", value)}
                    />

                    <NumberField
                      label="Timeouts"
                      value={form.home_timeouts}
                      onChange={(value) =>
                        updateForm("home_timeouts", value)
                      }
                    />
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-[#081321] p-6">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                    Away
                  </p>

                  <h3 className="mt-2 text-2xl font-black">
                    {awayTeam?.name ?? "Select Away Team"}
                  </h3>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <NumberField
                      label="Score"
                      value={form.away_score}
                      onChange={(value) => updateForm("away_score", value)}
                    />

                    <NumberField
                      label="Fouls"
                      value={form.away_fouls}
                      onChange={(value) => updateForm("away_fouls", value)}
                    />

                    <NumberField
                      label="Timeouts"
                      value={form.away_timeouts}
                      onChange={(value) =>
                        updateForm("away_timeouts", value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Field label="YouTube Live / Video URL">
                  <input
                    value={form.youtube_url}
                    onChange={(e) =>
                      updateForm("youtube_url", e.target.value)
                    }
                    placeholder="https://youtube.com/..."
                    className={inputClass}
                  />
                </Field>
              </div>

              <button
                onClick={() => void saveGameDetails()}
                disabled={savingGame}
                className="mt-8 w-full rounded-2xl bg-orange-500 px-6 py-5 text-lg font-black transition active:scale-[0.99] disabled:opacity-50"
              >
                {savingGame
                  ? "SAVING GAME..."
                  : selectedGameId
                  ? "SAVE GAME DETAILS"
                  : "ADD GAME"}
              </button>
            </section>

            {selectedGameId && (
              <div className="mt-8 grid gap-8 xl:grid-cols-2">
                <TeamRosterPanel
                teamName={homeTeam?.name ?? "Home Team"}
                teamId={form.home_team_id}
                players={homePlayers}
                selectedCount={selectedHomeRoster.length}
                starterCount={homeStarterCount}
                saving={savingHome}
                isPlayerSelected={isPlayerSelected}
                isPlayerStarter={isPlayerStarter}
                onToggleSelected={togglePlayerSelected}
                onToggleStarter={toggleStarter}
                onSelectAll={() =>
                  selectAllPlayers(homePlayers, form.home_team_id)
                }
                onClear={() => clearTeamRoster(form.home_team_id)}
                onSave={() =>
                  void saveTeamRoster(
                    form.home_team_id,
                    homeTeam?.name ?? "Home Team",
                    homePlayers
                  )
                }
              />

              <TeamRosterPanel
                teamName={awayTeam?.name ?? "Away Team"}
                teamId={form.away_team_id}
                players={awayPlayers}
                selectedCount={selectedAwayRoster.length}
                starterCount={awayStarterCount}
                saving={savingAway}
                isPlayerSelected={isPlayerSelected}
                isPlayerStarter={isPlayerStarter}
                onToggleSelected={togglePlayerSelected}
                onToggleStarter={toggleStarter}
                onSelectAll={() =>
                  selectAllPlayers(awayPlayers, form.away_team_id)
                }
                onClear={() => clearTeamRoster(form.away_team_id)}
                onSave={() =>
                  void saveTeamRoster(
                    form.away_team_id,
                    awayTeam?.name ?? "Away Team",
                    awayPlayers
                  )
                }
                />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-[#081321] px-4 py-4 text-white outline-none focus:border-orange-400";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-gray-300">
        {label}
      </span>
      {children}
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      <span className="mb-2 block text-xs font-bold text-gray-400">
        {label}
      </span>

      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 font-black"
      />
    </label>
  );
}

function TeamRosterPanel({
  teamName,
  teamId,
  players,
  selectedCount,
  starterCount,
  saving,
  isPlayerSelected,
  isPlayerStarter,
  onToggleSelected,
  onToggleStarter,
  onSelectAll,
  onClear,
  onSave,
}: {
  teamName: string;
  teamId: string;
  players: PlayerRow[];
  selectedCount: number;
  starterCount: number;
  saving: boolean;
  isPlayerSelected: (playerId: string, teamId: string) => boolean;
  isPlayerStarter: (playerId: string, teamId: string) => boolean;
  onToggleSelected: (player: PlayerRow, teamId: string) => void;
  onToggleStarter: (player: PlayerRow, teamId: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
  onSave: () => void;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/10 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-orange-400">
            Game Roster
          </p>

          <h2 className="mt-2 text-3xl font-black">{teamName}</h2>

          <p className="mt-2 text-gray-400">
            {players.length} active players · {starterCount}/5 starters
          </p>
        </div>

        <div
          className={`rounded-full px-4 py-2 text-sm font-black ${
            starterCount === 5
              ? "bg-green-500/15 text-green-300"
              : "bg-yellow-500/15 text-yellow-300"
          }`}
        >
          STARTING 5: {starterCount}/5
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={onSelectAll}
          className="rounded-2xl border border-white/10 bg-[#081321] px-4 py-3 font-black"
        >
          SELECT ALL PLAYERS
        </button>

        <button
          onClick={onClear}
          className="rounded-2xl border border-white/10 bg-[#081321] px-4 py-3 font-black"
        >
          CLEAR
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {players.map((player) => {
          const selected = isPlayerSelected(player.id, teamId);
          const starter = isPlayerStarter(player.id, teamId);

          return (
            <div
              key={player.id}
              className={`rounded-2xl border p-4 ${
                starter
                  ? "border-orange-400 bg-orange-500/15"
                  : selected
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-white/10 bg-[#081321]"
              }`}
            >
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => onToggleSelected(player, teamId)}
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-black ${
                    selected
                      ? "bg-green-500 text-white"
                      : "bg-white/10 text-gray-400"
                  }`}
                >
                  {selected ? "✓" : "+"}
                </button>

                <div className="min-w-0 flex-1">
                  <p className="text-lg font-black">
                    #{player.jersey_number ?? "-"} {player.first_name}{" "}
                    {player.last_name}
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    Game roster
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleStarter(player, teamId)}
                  className={`rounded-xl px-4 py-3 text-xs font-black ${
                    starter
                      ? "bg-orange-500 text-white"
                      : "bg-white/10 text-gray-300"
                  }`}
                >
                  {starter ? "STARTER ✓" : "STARTER"}
                </button>
              </div>
            </div>
          );
        })}

        {players.length === 0 && (
          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6 text-center text-yellow-200">
            No players found for this team.
          </div>
        )}
      </div>

      <button
        onClick={onSave}
        disabled={
          saving ||
          !teamId ||
          selectedCount === 0 ||
          starterCount !== 5
        }
        className="mt-6 w-full rounded-2xl bg-orange-500 px-6 py-4 text-lg font-black disabled:opacity-40"
      >
        {saving
          ? "SAVING..."
          : `SAVE ${teamName.toUpperCase()} ROSTER`}
      </button>

      {selectedCount > 0 && starterCount !== 5 && (
        <p className="mt-3 text-center text-sm font-bold text-yellow-300">
          Select exactly 5 starting players before saving.
        </p>
      )}
    </section>
  );
}