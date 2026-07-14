import type { Player } from "@/app/types/tournament";

export const players: Player[] = [
  // TEAM 1
  ...Array.from({ length: 12 }, (_, index) => ({
    id: `team-1-player-${index + 1}`,
    name: `Player ${index + 1}`,
    team: "team-1",
    position: "TBA",
    number: index + 1,
    photo: "",
    points: 0,
    rebounds: 0,
    assists: 0,
  })),

  // TEAM 2
  ...Array.from({ length: 12 }, (_, index) => ({
    id: `team-2-player-${index + 1}`,
    name: `Player ${index + 1}`,
    team: "team-2",
    position: "TBA",
    number: index + 1,
    photo: "",
    points: 0,
    rebounds: 0,
    assists: 0,
  })),

  // TEAM 3
  ...Array.from({ length: 12 }, (_, index) => ({
    id: `team-3-player-${index + 1}`,
    name: `Player ${index + 1}`,
    team: "team-3",
    position: "TBA",
    number: index + 1,
    photo: "",
    points: 0,
    rebounds: 0,
    assists: 0,
  })),

  // TEAM 4
  ...Array.from({ length: 12 }, (_, index) => ({
    id: `team-4-player-${index + 1}`,
    name: `Player ${index + 1}`,
    team: "team-4",
    position: "TBA",
    number: index + 1,
    photo: "",
    points: 0,
    rebounds: 0,
    assists: 0,
  })),

  // TEAM 5
  ...Array.from({ length: 12 }, (_, index) => ({
    id: `team-5-player-${index + 1}`,
    name: `Player ${index + 1}`,
    team: "team-5",
    position: "TBA",
    number: index + 1,
    photo: "",
    points: 0,
    rebounds: 0,
    assists: 0,
  })),

  // TEAM 6
  ...Array.from({ length: 12 }, (_, index) => ({
    id: `team-6-player-${index + 1}`,
    name: `Player ${index + 1}`,
    team: "team-6",
    position: "TBA",
    number: index + 1,
    photo: "",
    points: 0,
    rebounds: 0,
    assists: 0,
  })),

  // TEAM 7
  ...Array.from({ length: 12 }, (_, index) => ({
    id: `team-7-player-${index + 1}`,
    name: `Player ${index + 1}`,
    team: "team-7",
    position: "TBA",
    number: index + 1,
    photo: "",
    points: 0,
    rebounds: 0,
    assists: 0,
  })),

  // TEAM 8
  ...Array.from({ length: 12 }, (_, index) => ({
    id: `team-8-player-${index + 1}`,
    name: `Player ${index + 1}`,
    team: "team-8",
    position: "TBA",
    number: index + 1,
    photo: "",
    points: 0,
    rebounds: 0,
    assists: 0,
  })),
];