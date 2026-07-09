export default function LiveBanner() {
  return (
    <section className="bg-[#050816] px-6 pb-10 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl border border-orange-500/20 bg-white/10 p-7 backdrop-blur-xl md:flex-row md:items-center">
        <div>
          <span className="inline-flex items-center rounded-full bg-red-500/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-red-400">
            🔴 Next Event
          </span>

          <h2 className="mt-4 text-3xl font-black md:text-4xl">
            CYBL Summer League 2026
          </h2>

          <p className="mt-3 text-lg text-gray-300">
            📅 <span className="font-semibold text-white">1–5 September 2026</span>
            {" • "}
            📍 Telavi, Georgia
          </p>
        </div>

        <a
          href="/tournaments/summer-league"
          className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-8 py-4 font-bold text-white shadow-lg shadow-orange-500/20 transition duration-300 hover:-translate-y-1 hover:bg-orange-600 hover:shadow-orange-500/40"
        >
          View Tournament
          <span>→</span>
        </a>
      </div>
    </section>
  );
}
