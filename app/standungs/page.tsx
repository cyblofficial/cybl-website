import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import { calculateStandings } from "@/app/lib/calculateStandings";

export default function StandingsPage() {
  const standings = calculateStandings();
  const tournamentStarted = standings.some((team) => team.played > 0);

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#050816] px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 max-w-3xl">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.35em] text-orange-400">
              Tournament Standings
            </p>

            <h1 className="text-4xl font-black leading-tight md:text-6xl">
              CYBL Summer League 2026
            </h1>

            <p className="mt-5 text-lg leading-relaxed text-gray-300">
              Official standings for the CYBL Summer League 2026 in Telavi,
              Georgia.
            </p>
          </div>

          {!tournamentStarted ? (
            <div className="rounded-3xl border border-orange-500/20 bg-white/10 p-8 backdrop-blur-xl">
              <span className="inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-yellow-300">
                Coming Soon
              </span>

              <h2 className="mt-6 text-3xl font-black">
                Standings will be available when the tournament begins
              </h2>

              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-gray-300">
                Participating teams will be added after registration is
                completed. The standings table will update automatically from
                official game results.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="bg-white/10">
                    <tr className="text-left text-xs font-black uppercase tracking-widest text-gray-400">
                      <th className="px-6 py-5">#</th>
                      <th className="px-6 py-5">Team</th>
                      <th className="px-6 py-5 text-center">GP</th>
                      <th className="px-6 py-5 text-center">W</th>
                      <th className="px-6 py-5 text-center">L</th>
                      <th className="px-6 py-5 text-center">PF</th>
                      <th className="px-6 py-5 text-center">PA</th>
                      <th className="px-6 py-5 text-center">PTS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {standings.map((team, index) => (
                      <tr
                        key={team.id}
                        className="border-t border-white/10 transition hover:bg-white/5"
                      >
                        <td className="px-6 py-5 text-xl font-black text-orange-400">
                          {index + 1}
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-black">{team.team}</p>
                        </td>

                        <td className="px-6 py-5 text-center font-bold">
                          {team.played}
                        </td>

                        <td className="px-6 py-5 text-center font-bold text-green-400">
                          {team.wins}
                        </td>

                        <td className="px-6 py-5 text-center font-bold text-red-400">
                          {team.losses}
                        </td>

                        <td className="px-6 py-5 text-center font-bold">
                          {team.scored}
                        </td>

                        <td className="px-6 py-5 text-center font-bold">
                          {team.conceded}
                        </td>

                        <td className="px-6 py-5 text-center text-xl font-black text-orange-400">
                          {team.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm leading-relaxed text-gray-400">
              Standings are calculated automatically from finished games in the
              tournament database.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}