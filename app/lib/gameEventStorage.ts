import type { GameEvent } from "@/app/types/gameEvent";

const STORAGE_KEY = "cybl-game-events";

export function loadGameEvents(): GameEvent[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const savedEvents = localStorage.getItem(STORAGE_KEY);

    if (!savedEvents) {
      return [];
    }

    return JSON.parse(savedEvents) as GameEvent[];
  } catch (error) {
    console.error("Failed to load CYBL game events:", error);
    return [];
  }
}

export function saveGameEvents(events: GameEvent[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(events)
    );
  } catch (error) {
    console.error("Failed to save CYBL game events:", error);
  }
}

export function clearGameEvents(gameId?: string) {
  if (typeof window === "undefined") {
    return;
  }

  if (!gameId) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  const events = loadGameEvents();

  const remainingEvents = events.filter(
    (event) => event.gameId !== gameId
  );

  saveGameEvents(remainingEvents);
}