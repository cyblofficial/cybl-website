import type { GameEvent } from "@/app/types/gameEvent";

const LIVE_GAME_EVENTS_KEY = "cybl-live-game-events";
const LIVE_GAME_ID_KEY = "cybl-live-game-id";

export function saveLiveGameId(gameId: string) {
  if (typeof window === "undefined") return;

  localStorage.setItem(LIVE_GAME_ID_KEY, gameId);
}

export function loadLiveGameId(): string {
  if (typeof window === "undefined") return "";

  return localStorage.getItem(LIVE_GAME_ID_KEY) ?? "";
}

export function saveLiveGameEvents(events: GameEvent[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    LIVE_GAME_EVENTS_KEY,
    JSON.stringify(events)
  );
}

export function loadLiveGameEvents(): GameEvent[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(LIVE_GAME_EVENTS_KEY);

    if (!raw) return [];

    return JSON.parse(raw) as GameEvent[];
  } catch {
    return [];
  }
}

export function clearLiveGameData() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(LIVE_GAME_EVENTS_KEY);
  localStorage.removeItem(LIVE_GAME_ID_KEY);
}