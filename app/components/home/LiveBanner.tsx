export default function LiveBanner() {
  return (
    <section className="bg-[#050816] px-6 pb-10 text-white">
      <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-xl md:flex md:items-center md:justify-between">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-red-400">
            🔴 Next Event
          </p>

          <h2 className="text-2xl font-black md:text-4xl">
            CYBL Summer League 2026
          </h2>

          <p className="mt-2 text-gray-300">
            20–24 August | Telavi, Georgia
          </p>
        </div>

        <a
          href="/tournaments/summer-league"
          className="mt-6 inline-flex rounded-full bg-orange-500 px-7 py-4 font-bold text-white transition hover:bg-orange-600 md:mt-0"
        >
          View Tournament
        </a>
      </div>
    </section>
  );
}