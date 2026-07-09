export default function NewsSection() {
  const news = [
    {
      category: "Event Recap",
      date: "April 2026",
      title: "EYBL Challenge Cup Telavi 2026 successfully hosted in Georgia",
      description:
        "CYBL hosted international youth basketball teams in Telavi, Georgia, creating a strong foundation for future international events.",
      href: "/news/eybl-challenge-cup-telavi-2026",
    },
    {
      category: "Coming Soon",
      date: "August 2026",
      title: "CYBL Summer League 2026 preparations continue",
      description:
        "Teams, schedule, participating clubs and tournament details will be announced soon.",
      href: "/tournaments/summer-league",
    },
  ];

  return (
    <section id="news" className="bg-[#050816] px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-3xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-orange-400">
            Latest News
          </p>

          <h2 className="text-4xl font-black md:text-6xl">
            CYBL Stories, Events & Announcements
          </h2>

          <p className="mt-5 text-lg text-gray-300">
            Stay updated with the latest tournaments, international events,
            league announcements and everything happening around CYBL.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {news.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-orange-400/40 hover:bg-white/15"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="rounded-full bg-orange-500/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-orange-300">
                  {item.category}
                </span>

                <span className="text-sm text-gray-400">
                  {item.date}
                </span>
              </div>

              <h3 className="mb-5 text-3xl font-black leading-tight">
                {item.title}
              </h3>

              <p className="mb-10 leading-8 text-gray-300">
                {item.description}
              </p>

              <a
                href={item.href}
                className="inline-flex items-center gap-2 font-bold text-orange-400 transition hover:gap-4 hover:text-orange-300"
              >
                Read More
                <span>→</span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}