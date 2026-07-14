import type { GameEvent } from "@/app/types/gameEvent";
import { players } from "@/app/data/summerLeague/players";
import { teams } from "@/app/data/summerLeague/teams";

export interface PlayerGameStats {
  playerId: string;
  playerName: string;
  number: number;
  teamId: string;

  points: number;

  freeThrowsMade: number;
  freeThrowsMissed: number;

  twoPointsMade: number;
  twoPointsMissed: number;

  threePointsMade: number;
  threePointsMissed: number;

  offensiveRebounds: number;
  defensiveRebounds: number;
  rebounds: number;

  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
}

export interface TeamGameStats {
  teamId: string;
  teamName: string;

  points: number;

  freeThrowsMade: number;
  freeThrowsAttempted: number;

  twoPointsMade: number;
  twoPointsAttempted: number;

  threePointsMade: number;
  threePointsAttempted: number;

  offensiveRebounds: number;
  defensiveRebounds: number;
  rebounds: number;

  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
}

export interface PeriodScore {
  quarter: 1 | 2 | 3 | 4 | "OT";
  homeScore: number;
  awayScore: number;
}

function emptyPlayerStats(
  playerId: string,
  teamId: string
): PlayerGameStats {
  const player = players.find((item) => item.id === playerId);

  return {
    playerId,
    playerName: player?.name ?? "Unknown Player",
    number: player?.number ?? 0,
    teamId,

    points: 0,

    freeThrowsMade: 0,
    freeThrowsMissed: 0,

    twoPointsMade: 0,
    twoPointsMissed: 0,

    threePointsMade: 0,
    threePointsMissed: 0,

    offensiveRebounds: 0,
    defensiveRebounds: 0,
    rebounds: 0,

    assists: 0,
    steals: 0,
    blocks: 0,
    turnovers: 0,
    fouls: 0,
  };
}

export function calculatePlayerStats(
  events: GameEvent[],
  gameId: string
): PlayerGameStats[] {
  const gameEvents = events.filter(
    (event) => event.gameId === gameId && event.playerId
  );

  const statsMap = new Map<string, PlayerGameStats>();

  gameEvents.forEach((event) => {
    if (!event.playerId) return;

    if (!statsMap.has(event.playerId)) {
      statsMap.set(
        event.playerId,
        emptyPlayerStats(event.playerId, event.teamId)
      );
    }

    const stats = statsMap.get(event.playerId)!;

    switch (event.type) {
      case "FREE_THROW_MADE":
        stats.freeThrowsMade += 1;
        stats.points += 1;
        break;

      case "FREE_THROW_MISSED":
        stats.freeThrowsMissed += 1;
        break;

      case "TWO_POINT_MADE":
        stats.twoPointsMade += 1;
        stats.points += 2;
        break;

      case "TWO_POINT_MISSED":
        stats.twoPointsMissed += 1;
        break;

      case "THREE_POINT_MADE":
        stats.threePointsMade += 1;
        stats.points += 3;
        break;

      case "THREE_POINT_MISSED":
        stats.threePointsMissed += 1;
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

  return Array.from(statsMap.values()).sort(
    (a, b) => a.number - b.number
  );
}

export function calculateTeamStats(
  events: GameEvent[],
  gameId: string,
  teamId: string
): TeamGameStats {
  const team = teams.find((item) => item.id === teamId);

  const playerStats = calculatePlayerStats(events, gameId).filter(
    (player) => player.teamId === teamId
  );

  return playerStats.reduce<TeamGameStats>(
    (total, player) => {
      total.points += player.points;

      total.freeThrowsMade += player.freeThrowsMade;
      total.freeThrowsAttempted +=
        player.freeThrowsMade + player.freeThrowsMissed;

      total.twoPointsMade += player.twoPointsMade;
      total.twoPointsAttempted +=
        player.twoPointsMade + player.twoPointsMissed;

      total.threePointsMade += player.threePointsMade;
      total.threePointsAttempted +=
        player.threePointsMade + player.threePointsMissed;

      total.offensiveRebounds += player.offensiveRebounds;
      total.defensiveRebounds += player.defensiveRebounds;
      total.rebounds += player.rebounds;

      total.assists += player.assists;
      total.steals += player.steals;
      total.blocks += player.blocks;
      total.turnovers += player.turnovers;
      total.fouls += player.fouls;

      return total;
    },
    {
      teamId,
      teamName: team?.name ?? "Unknown Team",

      points: 0,

      freeThrowsMade: 0,
      freeThrowsAttempted: 0,

      twoPointsMade: 0,
      twoPointsAttempted: 0,

      threePointsMade: 0,
      threePointsAttempted: 0,

      offensiveRebounds: 0,
      defensiveRebounds: 0,
      rebounds: 0,

      assists: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      fouls: 0,
    }
  );
}

export function calculatePeriodScores(
  events: GameEvent[],
  gameId: string,
  homeTeamId: string,
  awayTeamId: string
): PeriodScore[] {
  const periods: Array<1 | 2 | 3 | 4 | "OT"> = [
    1,
    2,
    3,
    4,
    "OT",
  ];

  return periods.map((quarter) => {
    const quarterEvents = events.filter(
      (event) =>
        event.gameId === gameId &&
        event.quarter === quarter
    );

    let homeScore = 0;
    let awayScore = 0;

    quarterEvents.forEach((event) => {
      let points = 0;

      if (event.type === "FREE_THROW_MADE") points = 1;
      if (event.type === "TWO_POINT_MADE") points = 2;
      if (event.type === "THREE_POINT_MADE") points = 3;

      if (event.teamId === homeTeamId) {
        homeScore += points;
      }

      if (event.teamId === awayTeamId) {
        awayScore += points;
      }
    });

    return {
      quarter,
      homeScore,
      awayScore,
    };
  });
}

export function calculateScoreFromEvents(
  events: GameEvent[],
  gameId: string,
  teamId: string
) {
  return events
    .filter(
      (event) =>
        event.gameId === gameId &&
        event.teamId === teamId
    )
    .reduce((score, event) => {
      if (event.type === "FREE_THROW_MADE") return score + 1;
      if (event.type === "TWO_POINT_MADE") return score + 2;
      if (event.type === "THREE_POINT_MADE") return score + 3;

      return score;
    }, 0);
}