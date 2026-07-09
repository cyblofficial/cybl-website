export default function Hero() {
  const countries = [
    { name: "Georgia", flag: "https://flagcdn.com/w40/ge.png" },
    { name: "Armenia", flag: "https://flagcdn.com/w40/am.png" },
    { name: "Azerbaijan", flag: "https://flagcdn.com/w40/az.png" },
    { name: "Türkiye", flag: "https://flagcdn.com/w40/tr.png" },
    { name: "Kazakhstan", flag: "https://flagcdn.com/w40/kz.png" },
    { name: "Latvia", flag: "https://flagcdn.com/w40/lv.png" },
    { name: "Belarus", flag: "https://flagcdn.com/w40/by.png" },
    { name: "Ukraine", flag: "https://flagcdn.com/w40/ua.png" },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="absolute inset-0 bg-[url('/hero-basketball.png')] bg-cover bg-center opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050816] via-[#050816]/85 to-[#050816]/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-[#050816]/70" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 py-24">
        <div className="max-w-4xl">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.35em] text-orange-400">
            Caucasus Youth Basketball League
          </p>

          <h1 className="mb-5 text-4xl font-black leading-tight md:text-6xl lg:text-7xl">
            The Future of
            <span className="block bg-gradient-to-r from-orange-400 to-yellow-200 bg-clip-text text-transparent">
              Basketball Starts Here
            </span>
          </h1>

          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-gray-300 md:text-xl">
            CYBL connects young athletes, clubs and countries through premium
            international youth basketball tournaments, education and long-term
            player development.
          </p>

          <div className="mb-9 flex flex-wrap gap-4">
            <a
              href="#registration"
              className="rounded-full bg-orange-500 px-8 py-4 font-bold text-white transition hover:bg-orange-600"
            >
              Register Now
            </a>

            <a
              href="/documents/CYBL_Summer_League_2026_Official_Regulations.pdf"
              target="_blank"
              className="rounded-full border border-white/25 bg-white/10 px-8 py-4 font-bold text-white backdrop-blur-md transition hover:bg-white hover:text-[#050816]"
            >
              Official Regulations
            </a>
          </div>

          <div className="grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
            {[
              ["12+", "Teams"],
              ["9+", "Countries"],
              ["30+", "Games"],
              ["200+", "Players"],
            ].map(([number, label]) => (
              <div
                key={label}
                className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl"
              >
                <h3 className="text-3xl font-black text-orange-400 md:text-4xl">
                  {number}
                </h3>
                <p className="mt-1 text-xs uppercase tracking-widest text-gray-300 md:text-sm">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-7 max-w-4xl rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-orange-400">
              International Teams & Partners
            </p>

            <div className="flex flex-wrap gap-3">
              {countries.map((country) => (
                <span
                  key={country.name}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-gray-100"
                >
                  <img
                    src={country.flag}
                    alt={country.name}
                    className="h-4 w-6 rounded-sm object-cover"
                  />
                  {country.name}
                </span>
              ))}

              <span className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-2 text-xs font-medium text-gray-500 opacity-50">
                <img
                  src="https://flagcdn.com/w40/ru.png"
                  alt="Russia"
                  className="h-3 w-5 rounded-sm object-cover opacity-60"
                />
                Russia
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}