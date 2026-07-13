import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import { games } from "@/app/data/summerLeague/games";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export default function SchedulePage() {
  const groupedGames = games.reduce<Record<string, typeof games>>(
    (groups, game) => {
      if (!groups[game.date]) {
        groups[game.date] = [];
      }

      groups[game.date].push(game);
      return groups;
    },
    {}
  );

  const sortedDates = Object.keys(groupedGames).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#050816] px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 max-w-3xl">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.35em] text-orange-400">
              Tournament Schedule
            </p>

            <h1 className="text-4xl font-black leading-tight md:text-6xl">
              CYBL Summer League 2026
            </h1>

            <p className="mt-5 text-lg leading-relaxed text-gray-300">
              Full tournament schedule for September 1–5, 2026 in Telavi,
              Georgia.
            </p>
          </div>

          <div className="space-y-10">
            {sortedDates.map((date, dayIndex) => (
              <section
                key={date}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8"
              >
                <div className="mb-6 flex flex-col gap-3 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-400">
                      Day {dayIndex + 1}
                    </p>

                    <h2 className="mt-2 text-3xl font-black">
                      {formatDate(date)}
                    </h2>
                  </div>

                  <span className="text-sm text-gray-400">
                    {groupedGames[date].length} games
                  </span>
                </div>

                <div className="space-y-4">
                  {groupedGames[date]
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((game) => (
                      <div
                        key={game.id}
                        className="grid gap-4 rounded-2xl border border-white/10 bg-[#081321] p-5 transition duration-300 hover:-translate-y-1 hover:border-orange-400/40 hover:bg-[#0B1A2B] md:grid-cols-[110px_1fr_160px]"
                      >
                        <div>
                          <p className="text-xl font-black text-orange-400">
                            {game.time}
                          </p>

                          <p className="mt-1 text-sm text-gray-400">
                            {game.court}
                          </p>
                        </div>

                        <div>
                          <p className="text-xl font-black">
                            Teams to be announced
                          </p>

                          <p className="mt-1 text-sm text-gray-400">
                            {game.category}
                          </p>
                        </div>

                        <div className="md:text-right">
                          <span className="inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-yellow-300">
                            Coming Soon
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-orange-500/20 bg-orange-500/10 p-8">
            <h3 className="text-2xl font-black">Schedule Updates</h3>

            <p className="mt-4 max-w-3xl leading-relaxed text-gray-300">
              Participating teams and exact matchups will be announced as soon
              as registration is completed. The schedule on this page will
              update automatically from the tournament data.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}