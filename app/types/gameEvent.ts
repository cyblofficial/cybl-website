export type GameEventType =
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
  | "SUBSTITUTION_IN"
  | "SUBSTITUTION_OUT"
  | "TIMEOUT"
  | "PERIOD_START"
  | "PERIOD_END";

export interface GameEvent {
  id: string;

  gameId: string;

  teamId: string;

  playerId?: string;

  type: GameEventType;

  quarter: 1 | 2 | 3 | 4 | "OT";

  gameClock: string;

  createdAt: string;

  relatedPlayerId?: string;

  notes?: string;
}