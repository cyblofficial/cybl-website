import { tournament } from "@/app/data/summerLeague/tournament";
import { teams } from "@/app/data/summerLeague/teams";
import { games } from "@/app/data/summerLeague/games";
import { calculateStandings } from "@/app/lib/calculateStandings";

function getTeam(teamId: string) {
  return teams.find((team) => team.id === teamId);
}

export default function LiveCenter() {
  const standings = calculateStandings();

  const liveGame = games.find((game) => game.status === "LIVE");
  const upcomingGames = games.filter((game) => game.status === "UPCOMING");
  const finishedGames = games.filter((game) => game.status === "FINISHED");

  return (
    <section id="live-center" className="bg-[#050816] px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-3xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.35em] text-red-400">
            🔴 Live Center
          </p>

          <h2 className="text-4xl font-black md:text-6xl">
            Games, scores, streams and standings
          </h2>

          <p className="mt-5 text-lg leading-relaxed text-gray-300">
            {tournament.name} · 1–5 September 2026 · {tournament.city},{" "}
            {tournament.country}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-orange-500/20 bg-white/10 p-6 backdrop-blur-xl lg:col-span-2">
            {liveGame ? (
              <>
                <div className="mb-5 flex items-center justify-between">
                  <span className="rounded-full bg-red-500 px-4 py-2 text-xs font-black uppercase tracking-widest">
                    LIVE NOW
                  </span>
                  <span className="text-sm text-gray-400">{liveGame.court}</span>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <div className="mb-6 rounded-3xl border border-white/10 bg-[#050816]/70 p-6">
                      <div className="mb-5 flex items-center justify-between text-sm text-gray-400">
                        <span>{liveGame.category}</span>
                        <span>{liveGame.time}</span>
                      </div>

                      <div className="space-y-5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-2xl font-black">
                            {getTeam(liveGame.home)?.flag}{" "}
                            {getTeam(liveGame.home)?.name}
                          </span>
                          <span className="text-4xl font-black text-orange-400">
                            {liveGame.homeScore}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <span className="text-2xl font-black">
                            {getTeam(liveGame.away)?.flag}{" "}
                            {getTeam(liveGame.away)?.name}
                          </span>
                          <span className="text-4xl font-black text-orange-400">
                            {liveGame.awayScore}
                          </span>
                        </div>
                      </div>
                    </div>

                    <a
                      href="/live"
                      className="inline-flex rounded-full bg-orange-500 px-7 py-4 font-bold text-white transition hover:bg-orange-600"
                    >
                      Open Full Game Center →
                    </a>
                  </div>

                  <div className="overflow-hidden rounded-3xl border border-white/10 bg-black">
                    <iframe
                      className="aspect-video w-full"
                      src={liveGame.youtube || ""}
                      title="CYBL Live Stream"
                      allowFullScreen
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex min-h-[300px] flex-col justify-center rounded-3xl border border-white/10 bg-[#050816]/70 p-8">
                <span className="mb-4 w-fit rounded-full bg-orange-500/20 px-4 py-2 text-xs font-black uppercase tracking-widest text-orange-300">
                  Tournament starts soon
                </span>

                <h3 className="text-3xl font-black">
                  CYBL Summer League begins on September 1, 2026
                </h3>

                <p className="mt-4 max-w-xl text-gray-300">
                  Live scores and YouTube streams will appear here during the
                  tournament. Participating teams and full schedule will be
                  announced soon.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
            <h3 className="mb-5 text-2xl font-black">Latest Results</h3>

            {finishedGames.length === 0 ? (
              <div className="rounded-2xl bg-white/10 p-5 text-gray-300">
                Results will appear here after games are completed.
              </div>
            ) : (
              <div className="space-y-4">
                {finishedGames.slice(0, 5).map((game) => (
                  <div key={game.id} className="rounded-2xl bg-white/10 p-4">
                    <p className="text-sm text-gray-400">
                      {game.date} · {game.time}
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="font-bold">
                        {getTeam(game.home)?.flag} {getTeam(game.home)?.name}
                      </span>
                      <span className="font-black text-orange-400">
                        {game.homeScore}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="font-bold">
                        {getTeam(game.away)?.flag} {getTeam(game.away)?.name}
                      </span>
                      <span className="font-black text-orange-400">
                        {game.awayScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-2xl font-black">Upcoming Matches</h3>
              <span className="text-sm text-gray-400">
                {upcomingGames.length} scheduled
              </span>
            </div>

            <div className="max-h-[430px] space-y-4 overflow-y-auto pr-2">
              {upcomingGames.map((game) => (
                <div
                  key={game.id}
                  className="grid gap-4 rounded-2xl border border-white/10 bg-[#050816]/70 p-4 md:grid-cols-[120px_1fr_150px]"
                >
                  <div>
                    <p className="font-black text-orange-400">{game.time}</p>
                    <p className="text-sm text-gray-400">{game.date}</p>
                  </div>

                  <div>
                    <p className="text-lg font-black">Teams to be announced</p>
                    <p className="text-sm text-gray-400">
                      {game.court} · {game.category}
                    </p>
                  </div>

                  <div className="md:text-right">
                    <span className="inline-flex items-center rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-yellow-300">
                      📅 Coming Soon
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
            <h3 className="mb-5 text-2xl font-black">Standings</h3>

            {standings.every((team) => team.played === 0) ? (
              <div className="rounded-2xl bg-white/10 p-5 text-gray-300">
                Standings will be available after participating teams are
                confirmed and games begin.
              </div>
            ) : (
              <div className="space-y-3">
                {standings.map((team, index) => (
                  <div
                    key={team.team}
                    className="grid grid-cols-[35px_1fr_50px] items-center rounded-2xl bg-white/10 p-3"
                  >
                    <span className="font-black text-orange-400">
                      #{index + 1}
                    </span>

                    <div>
                      <p className="font-bold">{team.team}</p>
                      <p className="text-xs text-gray-400">
                        {team.wins}W - {team.losses}L · {team.played} GP
                      </p>
                    </div>

                    <span className="text-right font-black">{team.points}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}