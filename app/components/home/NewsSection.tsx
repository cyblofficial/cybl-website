export default function NewsSection() {
  const news = [
    {
      category: "Event Recap",
      date: "April 2026",
      title: "EYBL Challenge Cup Telavi 2026 successfully hosted in Georgia",
      description:
        "CYBL hosted international youth basketball teams in Telavi, Georgia, creating a strong foundation for future international events.",
      href: "#",
    },
    {
      category: "Coming Soon",
      date: "August 2026",
      title: "CYBL Summer League 2026 preparations continue",
      description:
        "Teams, schedule and tournament details will be announced as the event approaches.",
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
            CYBL stories, events and announcements
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {news.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="group rounded-3xl border border-white/10 bg-white/10 p-7 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/15"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <span className="rounded-full bg-orange-500/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-orange-300">
                  {item.category}
                </span>
                <span className="text-sm text-gray-400">{item.date}</span>
              </div>

              <h3 className="mb-4 text-2xl font-black text-white md:text-3xl">
                {item.title}
              </h3>

              <p className="mb-8 leading-relaxed text-gray-300">
                {item.description}
              </p>

              <span className="font-bold text-orange-400 transition group-hover:text-orange-300">
                Read More →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}