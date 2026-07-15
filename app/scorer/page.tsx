"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/app/lib/supabase";

type Quarter = "Q1" | "Q2" | "Q3" | "Q4" | "OT";
type ReportMode = "FULL" | Quarter;
type GameStatus = "UPCOMING" | "LIVE" | "PAUSED" | "FINISHED";

type TeamRow = {
  id: string;
  slug: string;
  name: string;
  short_name: string | null;
};

type PlayerRow = {
  id: string;
  cybl_id: string;
  team_id: string | null;
  first_name: string;
  last_name: string;
  jersey_number: number | null;
};

type GameRow = {
  id: string;
  game_code: string;
  stage: string;
  group_name: string | null;
  home_team_id: string | null;
  away_team_id: string | null;
  game_date: string;
  game_time: string;
  court: string | null;
  category: string | null;
  status: GameStatus;
  current_period: string;
  game_clock: string;
  home_score: number;
  away_score: number;
  home_fouls: number;
  away_fouls: number;
  home_timeouts: number;
  away_timeouts: number;
  started_at?: string | null;
  finished_at?: string | null;
};

type GameEventType =
  | "FREE_THROW_MADE"
  | "FREE_THROW_MISSED"
  | "TWO_POINT_MADE"
  | "TWO_POINT_MISSED"
  | "THREE_POINT_MADE"
  | "THREE_POINT_MISSED"
  | "OFFENSIVE_REBOUND"
  | "DEFENSIVE_REBOUND"
  | "ASSIST"
  | "STEAL"
  | "BLOCK"
  | "TURNOVER"
  | "FOUL"
  | "TIMEOUT"
  | "SUBSTITUTION_IN"
  | "SUBSTITUTION_OUT"
  | "PERIOD_START"
  | "PERIOD_END";

type GameEventRow = {
  id: string;
  game_id: string;
  team_id: string | null;
  player_id: string | null;
  event_type: GameEventType;
  period: string;
  game_clock: string;
  created_at: string;
};

type GameRosterRow = {
  id: string;
  game_id: string;
  team_id: string;
  player_id: string;
  jersey_number: number | null;
  is_selected: boolean;
  is_starter: boolean;
  is_on_court: boolean;
};

type FeedbackState = {
  type: "saving" | "success" | "error";
  message: string;
} | null;

type EditEventState = {
  id: string;
  teamId: string;
  playerId: string;
  eventType: GameEventType;
  period: Quarter;
  gameClock: string;
};

type PlayerStats = {
  playerId: string;
  number: number | null;
  name: string;
  points: number;
  rebounds: number;
  offensiveRebounds: number;
  defensiveRebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  ftMade: number;
  ftMissed: number;
  twoMade: number;
  twoMissed: number;
  threeMade: number;
  threeMissed: number;
};

const PLAYER_EVENT_TYPES: GameEventType[] = [
  "FREE_THROW_MADE",
  "FREE_THROW_MISSED",
  "TWO_POINT_MADE",
  "TWO_POINT_MISSED",
  "THREE_POINT_MADE",
  "THREE_POINT_MISSED",
  "OFFENSIVE_REBOUND",
  "DEFENSIVE_REBOUND",
  "ASSIST",
  "STEAL",
  "BLOCK",
  "TURNOVER",
  "FOUL",
  "SUBSTITUTION_IN",
  "SUBSTITUTION_OUT",
];

const EDITABLE_EVENT_TYPES: GameEventType[] = [
  "FREE_THROW_MADE",
  "FREE_THROW_MISSED",
  "TWO_POINT_MADE",
  "TWO_POINT_MISSED",
  "THREE_POINT_MADE",
  "THREE_POINT_MISSED",
  "OFFENSIVE_REBOUND",
  "DEFENSIVE_REBOUND",
  "ASSIST",
  "STEAL",
  "BLOCK",
  "TURNOVER",
  "FOUL",
  "TIMEOUT",
  "SUBSTITUTION_IN",
  "SUBSTITUTION_OUT",
];

function normalizeQuarter(value?: string): Quarter {
  if (
    value === "Q2" ||
    value === "Q3" ||
    value === "Q4" ||
    value === "OT"
  ) {
    return value;
  }

  return "Q1";
}

function clockToSeconds(clock: string) {
  const parts = clock.split(":");

  if (parts.length !== 2) return 600;

  const minutes = Number(parts[0]);
  const seconds = Number(parts[1]);

  if (
    Number.isNaN(minutes) ||
    Number.isNaN(seconds) ||
    minutes < 0 ||
    seconds < 0 ||
    seconds > 59
  ) {
    return 600;
  }

  return Math.max(0, minutes * 60 + seconds);
}

function isValidClock(clock: string) {
  return /^\d{1,2}:[0-5]\d$/.test(clock);
}

function secondsToClock(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function getPointsForEvent(type: GameEventType) {
  if (type === "FREE_THROW_MADE") return 1;
  if (type === "TWO_POINT_MADE") return 2;
  if (type === "THREE_POINT_MADE") return 3;

  return 0;
}

function getNextPeriod(period: Quarter): Quarter {
  if (period === "Q1") return "Q2";
  if (period === "Q2") return "Q3";
  if (period === "Q3") return "Q4";

  return "OT";
}

function getActionLabel(type: GameEventType) {
  const labels: Record<GameEventType, string> = {
    FREE_THROW_MADE: "+1",
    FREE_THROW_MISSED: "FT MISS",
    TWO_POINT_MADE: "+2",
    TWO_POINT_MISSED: "2PT MISS",
    THREE_POINT_MADE: "+3",
    THREE_POINT_MISSED: "3PT MISS",
    OFFENSIVE_REBOUND: "OFF REB",
    DEFENSIVE_REBOUND: "DEF REB",
    ASSIST: "AST",
    STEAL: "STL",
    BLOCK: "BLK",
    TURNOVER: "TO",
    FOUL: "FOUL",
    TIMEOUT: "TIMEOUT",
    SUBSTITUTION_IN: "SUB IN",
    SUBSTITUTION_OUT: "SUB OUT",
    PERIOD_START: "PERIOD START",
    PERIOD_END: "PERIOD END",
  };

  return labels[type];
}

function formatEventName(type: GameEventType) {
  const labels: Record<GameEventType, string> = {
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

  return labels[type];
}

function calculateStats(
  teamId: string,
  players: PlayerRow[],
  events: GameEventRow[]
): PlayerStats[] {
  return players
    .filter((player) => player.team_id === teamId)
    .sort(
      (a, b) =>
        (a.jersey_number ?? 999) - (b.jersey_number ?? 999)
    )
    .map((player) => {
      const playerEvents = events.filter(
        (event) => event.player_id === player.id
      );

      const stats: PlayerStats = {
        playerId: player.id,
        number: player.jersey_number,
        name: `${player.first_name} ${player.last_name}`,
        points: 0,
        rebounds: 0,
        offensiveRebounds: 0,
        defensiveRebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        turnovers: 0,
        fouls: 0,
        ftMade: 0,
        ftMissed: 0,
        twoMade: 0,
        twoMissed: 0,
        threeMade: 0,
        threeMissed: 0,
      };

      playerEvents.forEach((event) => {
        switch (event.event_type) {
          case "FREE_THROW_MADE":
            stats.ftMade += 1;
            stats.points += 1;
            break;

          case "FREE_THROW_MISSED":
            stats.ftMissed += 1;
            break;

          case "TWO_POINT_MADE":
            stats.twoMade += 1;
            stats.points += 2;
            break;

          case "TWO_POINT_MISSED":
            stats.twoMissed += 1;
            break;

          case "THREE_POINT_MADE":
            stats.threeMade += 1;
            stats.points += 3;
            break;

          case "THREE_POINT_MISSED":
            stats.threeMissed += 1;
            break;

          case "OFFENSIVE_REBOUND":
            stats.offensiveRebounds += 1;
            stats.rebounds += 1;
            break;

          case "DEFENSIVE_REBOUND":
            stats.defensiveRebounds += 1;
            stats.rebounds += 1;
            break;

          case "ASSIST":
            stats.assists += 1;
            break;

          case "STEAL":
            stats.steals += 1;
            break;

          case "BLOCK":
            stats.blocks += 1;
            break;

          case "TURNOVER":
            stats.turnovers += 1;
            break;

          case "FOUL":
            stats.fouls += 1;
            break;
        }
      });

      return stats;
    });
}

export default function ScorerPage() {
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [games, setGames] = useState<GameRow[]>([]);
  const [events, setEvents] = useState<GameEventRow[]>([]);
  const [gameRosters, setGameRosters] = useState<GameRosterRow[]>([]);
  const [subOutPlayerId, setSubOutPlayerId] = useState("");
  const [substitutionTeamId, setSubstitutionTeamId] = useState("");
  const [substitutionSaving, setSubstitutionSaving] = useState(false);

  const [selectedGameId, setSelectedGameId] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState("");

  const [quarter, setQuarter] = useState<Quarter>("Q1");
  const [gameClock, setGameClock] = useState("10:00");
  const [manualClock, setManualClock] = useState("10:00");
  const [isClockRunning, setIsClockRunning] = useState(false);

  const [manualHomeScore, setManualHomeScore] = useState("0");
  const [manualAwayScore, setManualAwayScore] = useState("0");

  const [editingEvent, setEditingEvent] =
    useState<EditEventState | null>(null);

  const [reportMode, setReportMode] =
    useState<ReportMode>("FULL");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const clockRef = useRef("10:00");
  const syncCounterRef = useRef(0);
  const feedbackTimerRef = useRef<number | null>(null);
  const actionLockRef = useRef(false);

  useEffect(() => {
    clockRef.current = gameClock;
  }, [gameClock]);

  useEffect(() => {
    void loadInitialData();

    return () => {
      if (feedbackTimerRef.current) {
        window.clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const selectedGame = useMemo(
    () => games.find((game) => game.id === selectedGameId),
    [games, selectedGameId]
  );

  const homeTeam = useMemo(
    () => teams.find((team) => team.id === selectedGame?.home_team_id),
    [teams, selectedGame]
  );

  const awayTeam = useMemo(
    () => teams.find((team) => team.id === selectedGame?.away_team_id),
    [teams, selectedGame]
  );

  const selectedPlayer = useMemo(
    () => players.find((player) => player.id === selectedPlayerId),
    [players, selectedPlayerId]
  );

  const selectedGameRosterRows = useMemo(
    () =>
      gameRosters.filter(
        (row) =>
          row.game_id === selectedGameId &&
          row.is_selected
      ),
    [gameRosters, selectedGameId]
  );

  const rosterPlayerIds = useMemo(
    () =>
      new Set(
        selectedGameRosterRows.map((row) => row.player_id)
      ),
    [selectedGameRosterRows]
  );

  const rosterPlayers = useMemo(
    () =>
      players
        .filter((player) => rosterPlayerIds.has(player.id))
        .sort(
          (a, b) =>
            (a.jersey_number ?? 999) -
            (b.jersey_number ?? 999)
        ),
    [players, rosterPlayerIds]
  );

  const selectedTeamPlayers = useMemo(
    () =>
      rosterPlayers.filter(
        (player) => player.team_id === selectedTeamId
      ),
    [rosterPlayers, selectedTeamId]
  );

  const homeRosterPlayers = useMemo(
    () =>
      rosterPlayers.filter(
        (player) =>
          player.team_id === selectedGame?.home_team_id
      ),
    [rosterPlayers, selectedGame]
  );

  const awayRosterPlayers = useMemo(
    () =>
      rosterPlayers.filter(
        (player) =>
          player.team_id === selectedGame?.away_team_id
      ),
    [rosterPlayers, selectedGame]
  );

  function getRosterRow(playerId: string) {
    return gameRosters.find(
      (row) =>
        row.game_id === selectedGameId &&
        row.player_id === playerId
    );
  }

  function isPlayerOnCourt(playerId: string) {
    return getRosterRow(playerId)?.is_on_court ?? false;
  }

  const selectedTeamOnCourtPlayers = useMemo(
    () =>
      selectedTeamPlayers.filter((player) =>
        isPlayerOnCourt(player.id)
      ),
    [selectedTeamPlayers, gameRosters]
  );

  const selectedTeamBenchPlayers = useMemo(
    () =>
      selectedTeamPlayers.filter(
        (player) => !isPlayerOnCourt(player.id)
      ),
    [selectedTeamPlayers, gameRosters]
  );

  const editPlayers = useMemo(() => {
    if (!editingEvent?.teamId) return [];

    return players
      .filter((player) => player.team_id === editingEvent.teamId)
      .sort(
        (a, b) =>
          (a.jersey_number ?? 999) - (b.jersey_number ?? 999)
      );
  }, [players, editingEvent]);

  const reportEvents = useMemo(() => {
    if (reportMode === "FULL") {
      return events;
    }

    return events.filter(
      (event) => event.period === reportMode
    );
  }, [events, reportMode]);

  const homeStats = useMemo(
    () =>
      selectedGame?.home_team_id
        ? calculateStats(
            selectedGame.home_team_id,
            players,
            reportEvents
          )
        : [],
    [selectedGame, players, reportEvents]
  );

  const awayStats = useMemo(
    () =>
      selectedGame?.away_team_id
        ? calculateStats(
            selectedGame.away_team_id,
            players,
            reportEvents
          )
        : [],
    [selectedGame, players, reportEvents]
  );

  const periodScores = useMemo(() => {
    const result = {
      Q1: { home: 0, away: 0 },
      Q2: { home: 0, away: 0 },
      Q3: { home: 0, away: 0 },
      Q4: { home: 0, away: 0 },
      OT: { home: 0, away: 0 },
    };

    if (!selectedGame) return result;

    events.forEach((event) => {
      const points = getPointsForEvent(event.event_type);

      if (points === 0) return;

      const period = event.period as Quarter;

      if (event.team_id === selectedGame.home_team_id) {
        result[period].home += points;
      }

      if (event.team_id === selectedGame.away_team_id) {
        result[period].away += points;
      }
    });

    return result;
  }, [events, selectedGame]);

  function showFeedback(
    type: "saving" | "success" | "error",
    message: string,
    autoHide = true
  ) {
    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current);
    }

    setFeedback({
      type,
      message,
    });

    if (autoHide) {
      feedbackTimerRef.current = window.setTimeout(() => {
        setFeedback(null);
      }, 2200);
    }
  }

  async function loadInitialData() {
    setLoading(true);
    setErrorMessage("");

    const [teamsResponse, playersResponse, gamesResponse] =
      await Promise.all([
        supabase
          .from("teams")
          .select("id, slug, name, short_name")
          .order("name"),

        supabase
          .from("players")
          .select(
            "id, cybl_id, team_id, first_name, last_name, jersey_number"
          )
          .order("jersey_number"),

        supabase
          .from("games")
          .select("*")
          .order("game_date")
          .order("game_time"),
      ]);

    if (teamsResponse.error) {
      setErrorMessage(teamsResponse.error.message);
      setLoading(false);
      return;
    }

    if (playersResponse.error) {
      setErrorMessage(playersResponse.error.message);
      setLoading(false);
      return;
    }

    if (gamesResponse.error) {
      setErrorMessage(gamesResponse.error.message);
      setLoading(false);
      return;
    }

    const loadedTeams = (teamsResponse.data ?? []) as TeamRow[];
    const loadedPlayers = (playersResponse.data ?? []) as PlayerRow[];
    const loadedGames = (gamesResponse.data ?? []) as GameRow[];

    setTeams(loadedTeams);
    setPlayers(loadedPlayers);
    setGames(loadedGames);

    if (loadedGames.length > 0) {
      const firstGame =
        loadedGames.find((game) => game.status === "LIVE") ??
        loadedGames[0];

      setSelectedGameId(firstGame.id);
      applyGameState(firstGame);

      await Promise.all([
        loadGameEvents(firstGame.id),
        loadGameRosters(firstGame.id),
      ]);
    }

    setLoading(false);
  }

  function applyGameState(game: GameRow) {
    const savedQuarter = normalizeQuarter(game.current_period);
    const savedClock = game.game_clock || "10:00";

    setQuarter(savedQuarter);
    setGameClock(savedClock);
    setManualClock(savedClock);
    clockRef.current = savedClock;

    setManualHomeScore(String(game.home_score ?? 0));
    setManualAwayScore(String(game.away_score ?? 0));

    setIsClockRunning(game.status === "LIVE");
  }

  useEffect(() => {
    if (!isClockRunning || !selectedGameId) return;

    const timer = window.setInterval(() => {
      const currentSeconds = clockToSeconds(clockRef.current);

      if (currentSeconds <= 0) {
        setIsClockRunning(false);
        void syncClockToDatabase("00:00");
        return;
      }

      const nextClock = secondsToClock(currentSeconds - 1);

      clockRef.current = nextClock;
      setGameClock(nextClock);
      setManualClock(nextClock);

      syncCounterRef.current += 1;

      if (syncCounterRef.current >= 5) {
        syncCounterRef.current = 0;
        void syncClockToDatabase(nextClock);
      }
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isClockRunning, selectedGameId, quarter]);

  async function syncClockToDatabase(clock: string) {
    if (!selectedGameId) return;

    await supabase
      .from("games")
      .update({
        current_period: quarter,
        game_clock: clock,
      })
      .eq("id", selectedGameId);
  }

  async function loadGameRosters(gameId: string) {
    const { data, error } = await supabase
      .from("game_rosters")
      .select(
        `
        id,
        game_id,
        team_id,
        player_id,
        jersey_number,
        is_selected,
        is_starter,
        is_on_court
        `
      )
      .eq("game_id", gameId)
      .eq("is_selected", true);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setGameRosters((data ?? []) as GameRosterRow[]);
  }

  async function loadGameEvents(gameId: string) {
    const { data, error } = await supabase
      .from("game_events")
      .select("*")
      .eq("game_id", gameId)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setEvents((data ?? []) as GameEventRow[]);
  }

  async function refreshSelectedGame() {
    if (!selectedGameId) return;

    const { data, error } = await supabase
      .from("games")
      .select("*")
      .eq("id", selectedGameId)
      .single();

    if (error || !data) return;

    const updatedGame = data as GameRow;

    setGames((currentGames) =>
      currentGames.map((game) =>
        game.id === selectedGameId ? updatedGame : game
      )
    );

    setManualHomeScore(String(updatedGame.home_score ?? 0));
    setManualAwayScore(String(updatedGame.away_score ?? 0));
  }

  async function handleGameChange(gameId: string) {
    if (selectedGameId) {
      await syncClockToDatabase(clockRef.current);
    }

    setIsClockRunning(false);
    setSelectedGameId(gameId);
    setSelectedTeamId("");
    setSelectedPlayerId("");
    setSubOutPlayerId("");
    setSubstitutionTeamId("");
    setEditingEvent(null);
    setFeedback(null);
    setReportMode("FULL");

    const game = games.find((item) => item.id === gameId);

    if (game) {
      applyGameState(game);
    }

    await Promise.all([
      loadGameEvents(gameId),
      loadGameRosters(gameId),
    ]);
  }

  useEffect(() => {
    if (!selectedGameId) return;

    const channel = supabase
      .channel(`scorer-${selectedGameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_events",
          filter: `game_id=eq.${selectedGameId}`,
        },
        () => {
          void loadGameEvents(selectedGameId);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `id=eq.${selectedGameId}`,
        },
        () => {
          void refreshSelectedGame();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_rosters",
          filter: `game_id=eq.${selectedGameId}`,
        },
        () => {
          void loadGameRosters(selectedGameId);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [selectedGameId]);

  async function saveManualClock() {
    if (!selectedGame || saving) return;

    if (!isValidClock(manualClock)) {
      showFeedback("error", "USE CLOCK FORMAT MM:SS");
      return;
    }

    setSaving(true);
    setIsClockRunning(false);

    const normalizedClock = secondsToClock(
      clockToSeconds(manualClock)
    );

    const { error } = await supabase
      .from("games")
      .update({
        game_clock: normalizedClock,
        current_period: quarter,
        status:
          selectedGame.status === "FINISHED"
            ? "FINISHED"
            : "PAUSED",
      })
      .eq("id", selectedGame.id);

    if (error) {
      setErrorMessage(error.message);
      showFeedback("error", "CLOCK NOT SAVED");
      setSaving(false);
      return;
    }

    setGameClock(normalizedClock);
    setManualClock(normalizedClock);
    clockRef.current = normalizedClock;

    await refreshSelectedGame();

    showFeedback(
      "success",
      `CLOCK CORRECTED TO ${normalizedClock}`
    );

    setSaving(false);
  }

  async function saveManualScore() {
    if (!selectedGame || saving) return;

    const homeScore = Number(manualHomeScore);
    const awayScore = Number(manualAwayScore);

    if (
      !Number.isInteger(homeScore) ||
      !Number.isInteger(awayScore) ||
      homeScore < 0 ||
      awayScore < 0
    ) {
      showFeedback("error", "INVALID SCORE");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("games")
      .update({
        home_score: homeScore,
        away_score: awayScore,
      })
      .eq("id", selectedGame.id);

    if (error) {
      setErrorMessage(error.message);
      showFeedback("error", "SCORE NOT SAVED");
      setSaving(false);
      return;
    }

    await refreshSelectedGame();

    showFeedback(
      "success",
      `SCORE CORRECTED · ${homeScore}-${awayScore}`
    );

    setSaving(false);
  }

  async function startClock() {
    if (!selectedGame || saving) return;

    setSaving(true);

    const { error } = await supabase
      .from("games")
      .update({
        status: "LIVE",
        current_period: quarter,
        game_clock: clockRef.current,
        started_at:
          selectedGame.started_at ?? new Date().toISOString(),
      })
      .eq("id", selectedGame.id);

    if (error) {
      setErrorMessage(error.message);
      showFeedback("error", "START FAILED");
      setSaving(false);
      return;
    }

    setIsClockRunning(true);
    await refreshSelectedGame();

    showFeedback("success", "CLOCK STARTED");
    setSaving(false);
  }

  async function pauseClock() {
    if (!selectedGame || saving) return;

    setIsClockRunning(false);
    setSaving(true);

    const { error } = await supabase
      .from("games")
      .update({
        status: "PAUSED",
        current_period: quarter,
        game_clock: clockRef.current,
      })
      .eq("id", selectedGame.id);

    if (error) {
      setErrorMessage(error.message);
      showFeedback("error", "PAUSE FAILED");
    } else {
      showFeedback(
        "success",
        `PAUSED AT ${clockRef.current}`
      );
    }

    await refreshSelectedGame();
    setSaving(false);
  }

  async function nextPeriod() {
    if (!selectedGame || saving) return;

    setIsClockRunning(false);
    setSaving(true);

    const newPeriod = getNextPeriod(quarter);
    const newClock = newPeriod === "OT" ? "05:00" : "10:00";

    const { error } = await supabase
      .from("games")
      .update({
        status: "PAUSED",
        current_period: newPeriod,
        game_clock: newClock,
      })
      .eq("id", selectedGame.id);

    if (error) {
      setErrorMessage(error.message);
      showFeedback("error", "PERIOD CHANGE FAILED");
      setSaving(false);
      return;
    }

    setQuarter(newPeriod);
    setGameClock(newClock);
    setManualClock(newClock);
    clockRef.current = newClock;

    await refreshSelectedGame();

    showFeedback("success", `${newPeriod} READY`);
    setSaving(false);
  }

  async function endGame() {
    if (!selectedGame || saving) return;

    const confirmed = window.confirm("Finish this game?");

    if (!confirmed) return;

    setIsClockRunning(false);
    setSaving(true);

    const { error } = await supabase
      .from("games")
      .update({
        status: "FINISHED",
        current_period: quarter,
        game_clock: clockRef.current,
        finished_at: new Date().toISOString(),
      })
      .eq("id", selectedGame.id);

    if (error) {
      setErrorMessage(error.message);
      showFeedback("error", "END GAME FAILED");
    } else {
      showFeedback("success", "GAME FINISHED");
    }

    await refreshSelectedGame();
    setSaving(false);
  }

  async function makeSubstitution(subInPlayerId: string) {
    if (
      !selectedGame ||
      !subOutPlayerId ||
      !subInPlayerId ||
      substitutionSaving
    ) {
      return;
    }

    const outRow = getRosterRow(subOutPlayerId);
    const inRow = getRosterRow(subInPlayerId);

    if (!outRow || !inRow) {
      showFeedback("error", "ROSTER PLAYER NOT FOUND");
      return;
    }

    if (outRow.team_id !== inRow.team_id) {
      showFeedback(
        "error",
        "SUBSTITUTION PLAYERS MUST BE FROM THE SAME TEAM"
      );
      return;
    }

    if (!outRow.is_on_court) {
      showFeedback(
        "error",
        "SELECT AN ON-COURT PLAYER TO SUB OUT"
      );
      return;
    }

    if (inRow.is_on_court) {
      showFeedback(
        "error",
        "THIS PLAYER IS ALREADY ON COURT"
      );
      return;
    }

    setSubstitutionSaving(true);
    setSaving(true);
    showFeedback("saving", "SAVING SUBSTITUTION...", false);

    try {
      const { error: outError } = await supabase
        .from("game_rosters")
        .update({
          is_on_court: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", outRow.id);

      if (outError) throw outError;

      const { error: inError } = await supabase
        .from("game_rosters")
        .update({
          is_on_court: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", inRow.id);

      if (inError) {
        await supabase
          .from("game_rosters")
          .update({
            is_on_court: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", outRow.id);

        throw inError;
      }

      const { error: eventsError } = await supabase
        .from("game_events")
        .insert([
          {
            game_id: selectedGame.id,
            team_id: outRow.team_id,
            player_id: subOutPlayerId,
            event_type: "SUBSTITUTION_OUT",
            period: quarter,
            game_clock: clockRef.current,
          },
          {
            game_id: selectedGame.id,
            team_id: inRow.team_id,
            player_id: subInPlayerId,
            event_type: "SUBSTITUTION_IN",
            period: quarter,
            game_clock: clockRef.current,
          },
        ]);

      if (eventsError) throw eventsError;

      const outPlayer = players.find(
        (player) => player.id === subOutPlayerId
      );

      const inPlayer = players.find(
        (player) => player.id === subInPlayerId
      );

      await Promise.all([
        loadGameRosters(selectedGame.id),
        loadGameEvents(selectedGame.id),
      ]);

      setSubOutPlayerId("");
      setSubstitutionTeamId("");

      if (selectedPlayerId === subOutPlayerId) {
        setSelectedPlayerId(subInPlayerId);
      }

      showFeedback(
        "success",
        `SUBSTITUTION · #${
          outPlayer?.jersey_number ?? "-"
        } OUT → #${inPlayer?.jersey_number ?? "-"} IN`
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Substitution failed";

      setErrorMessage(message);
      showFeedback("error", "SUBSTITUTION NOT SAVED");
    } finally {
      setSubstitutionSaving(false);
      setSaving(false);
    }
  }

  async function addEvent(eventType: GameEventType) {
    if (!selectedGame || actionLockRef.current) return;

    const teamRequired = ![
      "PERIOD_START",
      "PERIOD_END",
    ].includes(eventType);

    const playerRequired =
      PLAYER_EVENT_TYPES.includes(eventType);

    if (teamRequired && !selectedTeamId) {
      showFeedback("error", "SELECT A TEAM FIRST");
      return;
    }

    if (playerRequired && !selectedPlayerId) {
      showFeedback("error", "SELECT A PLAYER FIRST");
      return;
    }

    actionLockRef.current = true;
    setSaving(true);

    const points = getPointsForEvent(eventType);
    const actionLabel = getActionLabel(eventType);

    const playerLabel = selectedPlayer
      ? `#${selectedPlayer.jersey_number ?? "-"} ${
          selectedPlayer.first_name
        } ${selectedPlayer.last_name}`
      : "Team";

    try {
      const { error: insertError } = await supabase
        .from("game_events")
        .insert({
          game_id: selectedGame.id,
          team_id: selectedTeamId || null,
          player_id: selectedPlayerId || null,
          event_type: eventType,
          period: quarter,
          game_clock: clockRef.current,
        });

      if (insertError) throw insertError;

      const updateData: Record<string, unknown> = {
        status: "LIVE",
        current_period: quarter,
        game_clock: clockRef.current,
      };

      if (
        points > 0 &&
        selectedTeamId === selectedGame.home_team_id
      ) {
        updateData.home_score =
          selectedGame.home_score + points;
      }

      if (
        points > 0 &&
        selectedTeamId === selectedGame.away_team_id
      ) {
        updateData.away_score =
          selectedGame.away_score + points;
      }

      const { error: gameError } = await supabase
        .from("games")
        .update(updateData)
        .eq("id", selectedGame.id);

      if (gameError) throw gameError;

      await Promise.all([
        loadGameEvents(selectedGame.id),
        refreshSelectedGame(),
      ]);

      showFeedback(
        "success",
        `${playerLabel} · ${actionLabel}`
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown save error";

      setErrorMessage(message);
      showFeedback("error", "NOT SAVED");
    } finally {
      setSaving(false);
      actionLockRef.current = false;
    }
  }

  function openEditEvent(event: GameEventRow) {
    if (
      event.event_type === "PERIOD_START" ||
      event.event_type === "PERIOD_END"
    ) {
      return;
    }

    setEditingEvent({
      id: event.id,
      teamId: event.team_id ?? "",
      playerId: event.player_id ?? "",
      eventType: event.event_type,
      period: normalizeQuarter(event.period),
      gameClock: event.game_clock,
    });
  }

  async function saveEditedEvent() {
    if (!editingEvent || !selectedGame || saving) return;

    const oldEvent = events.find(
      (event) => event.id === editingEvent.id
    );

    if (!oldEvent) return;

    setSaving(true);

    const { error } = await supabase
      .from("game_events")
      .update({
        team_id: editingEvent.teamId,
        player_id: editingEvent.playerId || null,
        event_type: editingEvent.eventType,
        period: editingEvent.period,
        game_clock: editingEvent.gameClock,
      })
      .eq("id", editingEvent.id);

    if (error) {
      setErrorMessage(error.message);
      showFeedback("error", "EVENT UPDATE FAILED");
      setSaving(false);
      return;
    }

    const oldPoints = getPointsForEvent(oldEvent.event_type);
    const newPoints = getPointsForEvent(
      editingEvent.eventType
    );

    let homeScore = selectedGame.home_score;
    let awayScore = selectedGame.away_score;

    if (
      oldPoints > 0 &&
      oldEvent.team_id === selectedGame.home_team_id
    ) {
      homeScore = Math.max(0, homeScore - oldPoints);
    }

    if (
      oldPoints > 0 &&
      oldEvent.team_id === selectedGame.away_team_id
    ) {
      awayScore = Math.max(0, awayScore - oldPoints);
    }

    if (
      newPoints > 0 &&
      editingEvent.teamId === selectedGame.home_team_id
    ) {
      homeScore += newPoints;
    }

    if (
      newPoints > 0 &&
      editingEvent.teamId === selectedGame.away_team_id
    ) {
      awayScore += newPoints;
    }

    await supabase
      .from("games")
      .update({
        home_score: homeScore,
        away_score: awayScore,
      })
      .eq("id", selectedGame.id);

    setEditingEvent(null);

    await Promise.all([
      loadGameEvents(selectedGame.id),
      refreshSelectedGame(),
    ]);

    showFeedback("success", "EVENT CORRECTED");
    setSaving(false);
  }

  async function deleteEvent(event: GameEventRow) {
    if (!selectedGame || saving) return;

    const confirmed = window.confirm(
      `Delete ${formatEventName(event.event_type)}?`
    );

    if (!confirmed) return;

    setSaving(true);

    const points = getPointsForEvent(event.event_type);

    const { error } = await supabase
      .from("game_events")
      .delete()
      .eq("id", event.id);

    if (error) {
      setErrorMessage(error.message);
      showFeedback("error", "DELETE FAILED");
      setSaving(false);
      return;
    }

    if (points > 0) {
      let homeScore = selectedGame.home_score;
      let awayScore = selectedGame.away_score;

      if (
        event.team_id === selectedGame.home_team_id
      ) {
        homeScore = Math.max(0, homeScore - points);
      }

      if (
        event.team_id === selectedGame.away_team_id
      ) {
        awayScore = Math.max(0, awayScore - points);
      }

      await supabase
        .from("games")
        .update({
          home_score: homeScore,
          away_score: awayScore,
        })
        .eq("id", selectedGame.id);
    }

    await Promise.all([
      loadGameEvents(selectedGame.id),
      refreshSelectedGame(),
    ]);

    showFeedback("success", "EVENT DELETED");
    setSaving(false);
  }

  function printFullGame() {
    setReportMode("FULL");

    window.setTimeout(() => {
      window.print();
    }, 150);
  }

  function printPeriod(period: Quarter) {
    setReportMode(period);

    window.setTimeout(() => {
      window.print();
    }, 150);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050816] p-10 text-white">
        Loading CYBL Scorer...
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#050816] px-4 py-8 text-white md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="no-print">
            {feedback && (
              <div className="fixed left-1/2 top-5 z-[100] w-[calc(100%-32px)] max-w-xl -translate-x-1/2">
                <div
                  className={`rounded-2xl px-6 py-4 text-center font-black ${
                    feedback.type === "saving"
                      ? "bg-orange-500"
                      : feedback.type === "success"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                >
                  {feedback.message}
                </div>
              </div>
            )}

            <div className="mb-8">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-400">
                CYBL Scorer Panel
              </p>

              <h1 className="mt-3 text-4xl font-black md:text-6xl">
                Live Game Control
              </h1>
            </div>

            {errorMessage && (
              <div className="mb-6 rounded-2xl bg-red-500/10 p-4 text-red-300">
                {errorMessage}
              </div>
            )}

            <section className="rounded-3xl bg-white/10 p-6">
              <select
                value={selectedGameId}
                onChange={(event) =>
                  void handleGameChange(event.target.value)
                }
                className="w-full rounded-2xl bg-[#081321] p-4 font-bold"
              >
                {games.map((game) => {
                  const home = teams.find(
                    (team) => team.id === game.home_team_id
                  );

                  const away = teams.find(
                    (team) => team.id === game.away_team_id
                  );

                  return (
                    <option key={game.id} value={game.id}>
                      {game.game_code} — {home?.name} vs{" "}
                      {away?.name}
                    </option>
                  );
                })}
              </select>
            </section>

            <section className="mt-4 rounded-3xl border border-white/10 bg-white/10 p-3">
              <div className="grid gap-3 xl:grid-cols-[1fr_330px_1fr]">
                <div className="rounded-2xl bg-[#081321] p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">HOME</p>
                      <h2 className="text-xl font-black">{homeTeam?.short_name || homeTeam?.name || "HOME"}</h2>
                    </div>
                    <div className="text-5xl font-black text-orange-400">{selectedGame?.home_score ?? 0}</div>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {homeRosterPlayers.filter((player) => isPlayerOnCourt(player.id)).map((player) => (
                      <button
                        key={player.id}
                        onClick={() => {
                          setSelectedTeamId(selectedGame?.home_team_id ?? "");
                          setSelectedPlayerId(player.id);
                        }}
                        className={`min-w-0 rounded-xl border px-2 py-3 text-center transition active:scale-95 ${
                          selectedPlayerId === player.id
                            ? "border-orange-400 bg-orange-500/25"
                            : "border-green-500/30 bg-green-500/10"
                        }`}
                      >
                        <div className="text-xl font-black">#{player.jersey_number ?? "-"}</div>
                        <div className="mt-1 truncate text-[11px] font-bold">{player.first_name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-orange-500/30 bg-[#050816] p-3 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <select
                      value={quarter}
                      onChange={(event) => setQuarter(event.target.value as Quarter)}
                      className="rounded-lg bg-white/10 px-3 py-2 text-sm font-black"
                    >
                      <option value="Q1">Q1</option>
                      <option value="Q2">Q2</option>
                      <option value="Q3">Q3</option>
                      <option value="Q4">Q4</option>
                      <option value="OT">OT</option>
                    </select>

                    <span className={`rounded-full px-3 py-1 text-[11px] font-black ${
                      isClockRunning
                        ? "bg-green-500/20 text-green-300"
                        : "bg-yellow-500/20 text-yellow-300"
                    }`}>
                      {isClockRunning ? "RUNNING" : "PAUSED"}
                    </span>
                  </div>

                  <div className="mt-2 font-mono text-6xl font-black text-orange-400">{gameClock}</div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      disabled={saving || isClockRunning}
                      onClick={() => void startClock()}
                      className="rounded-xl bg-green-500 px-3 py-3 text-sm font-black text-black disabled:opacity-40"
                    >
                      START
                    </button>
                    <button
                      disabled={saving || !isClockRunning}
                      onClick={() => void pauseClock()}
                      className="rounded-xl bg-yellow-500 px-3 py-3 text-sm font-black text-black disabled:opacity-40"
                    >
                      PAUSE
                    </button>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      disabled={saving}
                      onClick={() => void nextPeriod()}
                      className="rounded-xl bg-white/10 px-3 py-2 text-xs font-black disabled:opacity-40"
                    >
                      NEXT PERIOD
                    </button>
                    <button
                      disabled={saving}
                      onClick={() => void endGame()}
                      className="rounded-xl bg-red-500/20 px-3 py-2 text-xs font-black text-red-300 disabled:opacity-40"
                    >
                      END GAME
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#081321] p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">AWAY</p>
                      <h2 className="text-xl font-black">{awayTeam?.short_name || awayTeam?.name || "AWAY"}</h2>
                    </div>
                    <div className="text-5xl font-black text-orange-400">{selectedGame?.away_score ?? 0}</div>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {awayRosterPlayers.filter((player) => isPlayerOnCourt(player.id)).map((player) => (
                      <button
                        key={player.id}
                        onClick={() => {
                          setSelectedTeamId(selectedGame?.away_team_id ?? "");
                          setSelectedPlayerId(player.id);
                        }}
                        className={`min-w-0 rounded-xl border px-2 py-3 text-center transition active:scale-95 ${
                          selectedPlayerId === player.id
                            ? "border-orange-400 bg-orange-500/25"
                            : "border-green-500/30 bg-green-500/10"
                        }`}
                      >
                        <div className="text-xl font-black">#{player.jersey_number ?? "-"}</div>
                        <div className="mt-1 truncate text-[11px] font-bold">{player.first_name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid gap-3 xl:grid-cols-[260px_1fr]">
                <div className="rounded-2xl bg-[#081321] p-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Selected Player</p>
                  {selectedPlayer ? (
                    <>
                      <div className="mt-2 text-2xl font-black text-orange-400">#{selectedPlayer.jersey_number ?? "-"}</div>
                      <div className="truncate font-black">{selectedPlayer.first_name} {selectedPlayer.last_name}</div>
                      <div className="mt-1 text-xs text-gray-400">
                        {selectedTeamId === selectedGame?.home_team_id ? homeTeam?.name : awayTeam?.name}
                      </div>
                    </>
                  ) : (
                    <div className="mt-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm font-bold text-yellow-200">
                      Tap an on-court player.
                    </div>
                  )}
                </div>

                <div className="rounded-2xl bg-[#081321] p-3">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ["FREE_THROW_MADE", "+1"],
                      ["TWO_POINT_MADE", "+2"],
                      ["THREE_POINT_MADE", "+3"],
                    ].map(([type, label]) => (
                      <button
                        key={type}
                        disabled={saving || !selectedPlayerId}
                        onClick={() => void addEvent(type as GameEventType)}
                        className="rounded-xl bg-orange-500 px-3 py-4 text-2xl font-black text-black active:scale-95 disabled:opacity-30"
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 grid grid-cols-5 gap-2">
                    {[
                      ["ASSIST", "AST"],
                      ["DEFENSIVE_REBOUND", "DREB"],
                      ["OFFENSIVE_REBOUND", "OREB"],
                      ["STEAL", "STL"],
                      ["BLOCK", "BLK"],
                      ["TURNOVER", "TO"],
                      ["FOUL", "FOUL"],
                      ["TWO_POINT_MISSED", "2 MISS"],
                      ["THREE_POINT_MISSED", "3 MISS"],
                      ["FREE_THROW_MISSED", "FT MISS"],
                    ].map(([type, label]) => (
                      <button
                        key={type}
                        disabled={saving || !selectedPlayerId}
                        onClick={() => void addEvent(type as GameEventType)}
                        className="rounded-xl border border-white/10 bg-white/5 px-2 py-3 text-xs font-black active:scale-95 disabled:opacity-30"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-4 rounded-3xl border border-blue-500/30 bg-blue-500/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Quick Substitution</p>
                  <h2 className="text-xl font-black">{subOutPlayerId ? "SELECT PLAYER IN" : "SELECT PLAYER OUT"}</h2>
                </div>

                {subOutPlayerId && (
                  <button
                    onClick={() => {
                      setSubOutPlayerId("");
                      setSubstitutionTeamId("");
                    }}
                    className="rounded-full border border-white/15 px-4 py-2 text-xs font-black"
                  >
                    CANCEL
                  </button>
                )}
              </div>

              {!subOutPlayerId ? (
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-black text-gray-400">{homeTeam?.short_name || homeTeam?.name}</p>
                    <div className="grid grid-cols-5 gap-2">
                      {homeRosterPlayers.filter((player) => isPlayerOnCourt(player.id)).map((player) => (
                        <button
                          key={player.id}
                          onClick={() => {
                            setSubOutPlayerId(player.id);
                            setSubstitutionTeamId(selectedGame?.home_team_id ?? "");
                          }}
                          className="rounded-xl bg-red-500/15 px-2 py-3 text-center active:scale-95"
                        >
                          <div className="font-black">#{player.jersey_number ?? "-"}</div>
                          <div className="mt-1 truncate text-[10px] font-bold">{player.first_name}</div>
                          <div className="mt-1 text-[9px] font-black text-red-300">OUT</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-black text-gray-400">{awayTeam?.short_name || awayTeam?.name}</p>
                    <div className="grid grid-cols-5 gap-2">
                      {awayRosterPlayers.filter((player) => isPlayerOnCourt(player.id)).map((player) => (
                        <button
                          key={player.id}
                          onClick={() => {
                            setSubOutPlayerId(player.id);
                            setSubstitutionTeamId(selectedGame?.away_team_id ?? "");
                          }}
                          className="rounded-xl bg-red-500/15 px-2 py-3 text-center active:scale-95"
                        >
                          <div className="font-black">#{player.jersey_number ?? "-"}</div>
                          <div className="mt-1 truncate text-[10px] font-bold">{player.first_name}</div>
                          <div className="mt-1 text-[9px] font-black text-red-300">OUT</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
                  {rosterPlayers
                    .filter((player) => player.team_id === substitutionTeamId && !isPlayerOnCourt(player.id))
                    .map((player) => (
                      <button
                        key={player.id}
                        disabled={substitutionSaving}
                        onClick={() => void makeSubstitution(player.id)}
                        className="rounded-xl bg-green-500/15 px-2 py-3 text-center active:scale-95 disabled:opacity-40"
                      >
                        <div className="font-black">#{player.jersey_number ?? "-"}</div>
                        <div className="mt-1 truncate text-[10px] font-bold">{player.first_name}</div>
                        <div className="mt-1 text-[9px] font-black text-green-300">IN</div>
                      </button>
                    ))}
                </div>
              )}
            </section>

            <details className="mt-4 rounded-3xl border border-yellow-500/30 bg-yellow-500/5 p-4">
              <summary className="cursor-pointer font-black text-yellow-300">CORRECTION CENTER</summary>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl bg-[#081321] p-4">
                  <input
                    value={manualClock}
                    onChange={(event) => setManualClock(event.target.value)}
                    className="w-full rounded-xl bg-[#050816] p-3 font-mono text-xl font-black"
                  />
                  <button
                    onClick={() => void saveManualClock()}
                    className="mt-2 w-full rounded-xl bg-yellow-500 p-3 font-black text-black"
                  >
                    SAVE CLOCK
                  </button>
                </div>

                <div className="rounded-2xl bg-[#081321] p-4">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={manualHomeScore}
                      onChange={(event) => setManualHomeScore(event.target.value)}
                      className="rounded-xl bg-[#050816] p-3 text-xl font-black"
                    />
                    <input
                      type="number"
                      value={manualAwayScore}
                      onChange={(event) => setManualAwayScore(event.target.value)}
                      className="rounded-xl bg-[#050816] p-3 text-xl font-black"
                    />
                  </div>
                  <button
                    onClick={() => void saveManualScore()}
                    className="mt-2 w-full rounded-xl bg-yellow-500 p-3 font-black text-black"
                  >
                    SAVE SCORE
                  </button>
                </div>
              </div>
            </details>

            <section className="mt-6 rounded-3xl border border-orange-500/30 bg-orange-500/10 p-6">
              <h2 className="text-3xl font-black">
                Official Match Report
              </h2>

              <p className="mt-3 text-gray-300">
                Print or save the official statistics report as PDF.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={printFullGame}
                  className="rounded-full bg-orange-500 px-6 py-4 font-black"
                >
                  PRINT FULL GAME
                </button>

                {(["Q1", "Q2", "Q3", "Q4", "OT"] as Quarter[]).map(
                  (period) => (
                    <button
                      key={period}
                      onClick={() => printPeriod(period)}
                      className="rounded-full border border-white/20 px-5 py-4 font-black"
                    >
                      PRINT {period}
                    </button>
                  )
                )}
              </div>
            </section>

            <section className="mt-6 rounded-3xl bg-white/10 p-6">
              <h2 className="text-2xl font-black">
                Play-by-Play & Event Correction
              </h2>

              <div className="mt-5 space-y-3">
                {events.map((event) => {
                  const team = teams.find(
                    (item) => item.id === event.team_id
                  );

                  const player = players.find(
                    (item) => item.id === event.player_id
                  );

                  return (
                    <div
                      key={event.id}
                      className="flex justify-between rounded-2xl bg-[#081321] p-4"
                    >
                      <div>
                        <p className="text-orange-400">
                          {event.period} · {event.game_clock}
                        </p>

                        <p className="font-black">
                          {team?.name}{" "}
                          {player
                            ? `· #${player.jersey_number} ${player.first_name} ${player.last_name}`
                            : ""}
                        </p>

                        <p>{formatEventName(event.event_type)}</p>
                      </div>

                      {![
                        "PERIOD_START",
                        "PERIOD_END",
                      ].includes(event.event_type) && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditEvent(event)}
                            className="rounded-xl bg-blue-500/20 px-4 py-2"
                          >
                            EDIT
                          </button>

                          <button
                            onClick={() =>
                              void deleteEvent(event)
                            }
                            className="rounded-xl bg-red-500/20 px-4 py-2"
                          >
                            DELETE
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <section className="print-report hidden">
            <div className="report-header">
              <div>
                <h1>CYBL Summer League 2026</h1>
                <p>Official Game Statistics</p>
              </div>

              <div className="report-meta">
                <strong>
                  {reportMode === "FULL"
                    ? "FULL GAME"
                    : reportMode}
                </strong>

                <p>
                  {selectedGame?.game_date} ·{" "}
                  {selectedGame?.game_time} ·{" "}
                  {selectedGame?.court}
                </p>
              </div>
            </div>

            <div className="report-score">
              <div>
                <h2>{homeTeam?.name}</h2>
                <strong>
                  {reportMode === "FULL"
                    ? selectedGame?.home_score ?? 0
                    : periodScores[reportMode].home}
                </strong>
              </div>

              <span>-</span>

              <div>
                <h2>{awayTeam?.name}</h2>
                <strong>
                  {reportMode === "FULL"
                    ? selectedGame?.away_score ?? 0
                    : periodScores[reportMode].away}
                </strong>
              </div>
            </div>

            {reportMode === "FULL" && (
              <table className="period-table">
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Q1</th>
                    <th>Q2</th>
                    <th>Q3</th>
                    <th>Q4</th>
                    <th>OT</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>{homeTeam?.name}</td>
                    <td>{periodScores.Q1.home}</td>
                    <td>{periodScores.Q2.home}</td>
                    <td>{periodScores.Q3.home}</td>
                    <td>{periodScores.Q4.home}</td>
                    <td>{periodScores.OT.home}</td>
                    <td>{selectedGame?.home_score}</td>
                  </tr>

                  <tr>
                    <td>{awayTeam?.name}</td>
                    <td>{periodScores.Q1.away}</td>
                    <td>{periodScores.Q2.away}</td>
                    <td>{periodScores.Q3.away}</td>
                    <td>{periodScores.Q4.away}</td>
                    <td>{periodScores.OT.away}</td>
                    <td>{selectedGame?.away_score}</td>
                  </tr>
                </tbody>
              </table>
            )}

            <PrintStatsTable
              title={homeTeam?.name ?? "Home"}
              stats={homeStats}
            />

            <PrintStatsTable
              title={awayTeam?.name ?? "Away"}
              stats={awayStats}
            />

            <div className="report-footer">
              <span>
                Caucasus Youth Basketball League
              </span>

              <span>
                Official Statistics Report
              </span>
            </div>
          </section>
        </div>

        {editingEvent && (
          <div className="no-print fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-2xl rounded-3xl bg-[#111827] p-6">
              <h2 className="text-3xl font-black">
                Edit Event
              </h2>

              <select
                value={editingEvent.teamId}
                onChange={(event) =>
                  setEditingEvent({
                    ...editingEvent,
                    teamId: event.target.value,
                    playerId: "",
                  })
                }
                className="mt-5 w-full rounded-xl bg-[#050816] p-4"
              >
                {homeTeam && (
                  <option value={homeTeam.id}>
                    {homeTeam.name}
                  </option>
                )}

                {awayTeam && (
                  <option value={awayTeam.id}>
                    {awayTeam.name}
                  </option>
                )}
              </select>

              <select
                value={editingEvent.playerId}
                onChange={(event) =>
                  setEditingEvent({
                    ...editingEvent,
                    playerId: event.target.value,
                  })
                }
                className="mt-3 w-full rounded-xl bg-[#050816] p-4"
              >
                <option value="">No Player</option>

                {editPlayers.map((player) => (
                  <option key={player.id} value={player.id}>
                    #{player.jersey_number} {player.first_name}{" "}
                    {player.last_name}
                  </option>
                ))}
              </select>

              <select
                value={editingEvent.eventType}
                onChange={(event) =>
                  setEditingEvent({
                    ...editingEvent,
                    eventType:
                      event.target.value as GameEventType,
                  })
                }
                className="mt-3 w-full rounded-xl bg-[#050816] p-4"
              >
                {EDITABLE_EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {formatEventName(type)}
                  </option>
                ))}
              </select>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <select
                  value={editingEvent.period}
                  onChange={(event) =>
                    setEditingEvent({
                      ...editingEvent,
                      period:
                        event.target.value as Quarter,
                    })
                  }
                  className="rounded-xl bg-[#050816] p-4"
                >
                  <option value="Q1">Q1</option>
                  <option value="Q2">Q2</option>
                  <option value="Q3">Q3</option>
                  <option value="Q4">Q4</option>
                  <option value="OT">OT</option>
                </select>

                <input
                  value={editingEvent.gameClock}
                  onChange={(event) =>
                    setEditingEvent({
                      ...editingEvent,
                      gameClock: event.target.value,
                    })
                  }
                  className="rounded-xl bg-[#050816] p-4"
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setEditingEvent(null)}
                  className="rounded-xl bg-white/10 p-4"
                >
                  CANCEL
                </button>

                <button
                  onClick={() => void saveEditedEvent()}
                  className="rounded-xl bg-green-500 p-4 font-black text-black"
                >
                  SAVE CHANGES
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 7mm;
          }

          html,
          body {
            background: white !important;
            color: black !important;
          }

          .no-print {
            display: none !important;
          }

          .print-report {
            display: block !important;
            width: 100%;
            color: black;
            background: white;
            font-family: Arial, sans-serif;
          }

          .report-header {
            display: flex;
            justify-content: space-between;
            border-bottom: 2px solid #111;
            padding-bottom: 5px;
          }

          .report-header h1 {
            margin: 0;
            font-size: 18px;
          }

          .report-header p,
          .report-meta {
            font-size: 9px;
          }

          .report-meta {
            text-align: right;
          }

          .report-score {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 28px;
            margin: 6px 0;
            text-align: center;
          }

          .report-score h2 {
            margin: 0;
            font-size: 14px;
          }

          .report-score strong {
            font-size: 24px;
          }

          .report-score span {
            font-size: 22px;
            font-weight: 900;
          }

          .period-table,
          .print-stats-table {
            width: 100%;
            border-collapse: collapse;
          }

          .period-table {
            margin-bottom: 6px;
            font-size: 8px;
          }

          .period-table th,
          .period-table td,
          .print-stats-table th,
          .print-stats-table td {
            border: 1px solid #444;
            padding: 2px 3px;
            text-align: center;
          }

          .print-team-title {
            margin: 5px 0 2px;
            font-size: 11px;
            font-weight: 900;
          }

          .print-stats-table {
            table-layout: fixed;
            margin-bottom: 5px;
            font-size: 7px;
          }

          .print-stats-table th {
            background: #eee !important;
          }

          .print-stats-table th:nth-child(2),
          .print-stats-table td:nth-child(2) {
            width: 95px;
            text-align: left;
          }

          .report-footer {
            display: flex;
            justify-content: space-between;
            border-top: 1px solid #777;
            padding-top: 3px;
            font-size: 7px;
          }
        }
      `}</style>
    </>
  );
}

function TeamButton({
  label,
  team,
  score,
  selected,
  onClick,
}: {
  label: string;
  team: TeamRow | undefined;
  score: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-3xl border p-6 text-left ${
        selected
          ? "border-orange-400 bg-orange-500/20"
          : "border-white/10 bg-[#081321]"
      }`}
    >
      <p>{label}</p>

      <h2 className="mt-2 text-3xl font-black">
        {team?.name}
      </h2>

      <p className="mt-4 text-6xl font-black text-orange-400">
        {score}
      </p>
    </button>
  );
}

function ActionButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="rounded-2xl border border-white/10 bg-[#081321] p-4 font-black active:scale-90 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function SubstitutionTeamPanel({
  title,
  players,
  selectedPlayerId,
  buttonLabel,
  onSelect,
}: {
  title: string;
  players: PlayerRow[];
  selectedPlayerId: string;
  buttonLabel: string;
  onSelect: (playerId: string) => void;
}) {
  return (
    <div className="rounded-3xl bg-[#081321] p-5">
      <h3 className="text-xl font-black">{title}</h3>

      <div className="mt-4 space-y-3">
        {players.map((player) => (
          <button
            key={player.id}
            onClick={() => onSelect(player.id)}
            className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition active:scale-[0.98] ${
              selectedPlayerId === player.id
                ? "border-red-400 bg-red-500/20"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div>
              <p className="font-black">
                #{player.jersey_number ?? "-"}{" "}
                {player.first_name} {player.last_name}
              </p>

              <p className="mt-1 text-xs font-black text-green-400">
                ON COURT
              </p>
            </div>

            <span className="rounded-xl bg-red-500/20 px-3 py-2 text-xs font-black text-red-300">
              {buttonLabel}
            </span>
          </button>
        ))}

        {players.length === 0 && (
          <p className="rounded-xl bg-white/5 p-4 text-sm text-gray-400">
            No on-court players found.
          </p>
        )}
      </div>
    </div>
  );
}

function PrintStatsTable({
  title,
  stats,
}: {
  title: string;
  stats: PlayerStats[];
}) {
  return (
    <div>
      <h3 className="print-team-title">
        {title}
      </h3>

      <table className="print-stats-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>PTS</th>
            <th>REB</th>
            <th>OREB</th>
            <th>DREB</th>
            <th>AST</th>
            <th>STL</th>
            <th>BLK</th>
            <th>TO</th>
            <th>PF</th>
            <th>2PT</th>
            <th>3PT</th>
            <th>FT</th>
          </tr>
        </thead>

        <tbody>
          {stats.map((player) => (
            <tr key={player.playerId}>
              <td>{player.number}</td>
              <td>{player.name}</td>
              <td>{player.points}</td>
              <td>{player.rebounds}</td>
              <td>{player.offensiveRebounds}</td>
              <td>{player.defensiveRebounds}</td>
              <td>{player.assists}</td>
              <td>{player.steals}</td>
              <td>{player.blocks}</td>
              <td>{player.turnovers}</td>
              <td>{player.fouls}</td>
              <td>
                {player.twoMade}/
                {player.twoMade + player.twoMissed}
              </td>
              <td>
                {player.threeMade}/
                {player.threeMade + player.threeMissed}
              </td>
              <td>
                {player.ftMade}/
                {player.ftMade + player.ftMissed}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}