export interface Team {
  id: string;
  name: string;
  country: string;
  flag: string;
  logo: string;
}

export type GameStatus = "UPCOMING" | "LIVE" | "FINISHED";

export interface Game {
  id: string;
  date: string;
  time: string;
  court: string;
  category: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  status: GameStatus;
  youtube?: string;
}

export interface Standing {
  team: string;
  played: number;
  wins: number;
  losses: number;
  points: number;
}

export interface Player {
  id: string;
  name: string;
  team: string;
  position: string;
  number: number;
  photo: string;
  points: number;
  rebounds: number;
  assists: number;
}

export interface Tournament {
  id: string;
  name: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
}