import { teams } from "@/app/data/summerLeague/teams";
import { games } from "@/app/data/summerLeague/games";

export function calculateStandings() {
  const table = teams.map((team) => ({
    id: team.id,
    team: team.name,
    played: 0,
    wins: 0,
    losses: 0,
    points: 0,
    scored: 0,
    conceded: 0,
  }));

  games
    .filter((g) => g.status === "FINISHED")
    .forEach((game) => {
      const home = table.find((t) => t.id === game.home)!;
      const away = table.find((t) => t.id === game.away)!;

      home.played++;
      away.played++;

      home.scored += game.homeScore;
      home.conceded += game.awayScore;

      away.scored += game.awayScore;
      away.conceded += game.homeScore;

      if (game.homeScore > game.awayScore) {
        home.wins++;
        home.points += 2;

        away.losses++;
        away.points += 1;
      } else {
        away.wins++;
        away.points += 2;

        home.losses++;
        home.points += 1;
      }
    });

  return table.sort((a, b) => b.points - a.points);
}
