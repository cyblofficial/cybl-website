"use client";

import { useEffect, useState } from "react";

function Counter({ target, suffix = "+" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const duration = 1200;
    const stepTime = 30;
    const increment = target / (duration / stepTime);

    const timer = setInterval(() => {
      current += increment;

      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <>
      {count}
      {suffix}
    </>
  );
}

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

  const stats = [
    { number: 12, label: "Teams" },
    { number: 9, label: "Countries" },
    { number: 30, label: "Games" },
    { number: 200, label: "Players" },
  ];

  const particles = Array.from({ length: 18 });

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-[url('/hero-basketball.png')] bg-cover bg-center opacity-95" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050816] via-[#050816]/68 to-[#050816]/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/15 to-[#050816]/45" />

      {/* Cinematic light */}
      <div className="absolute left-[-220px] top-44 h-[520px] w-[520px] animate-pulse rounded-full bg-orange-500/20 blur-[180px]" />
      <div className="absolute right-[-140px] bottom-0 h-[620px] w-[620px] animate-pulse rounded-full bg-orange-400/25 blur-[220px]" />
      <div className="absolute left-1/2 top-1/3 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-[140px]" />

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 z-[2] hidden md:block">
        {particles.map((_, index) => (
          <span
            key={index}
            className="absolute h-1.5 w-1.5 animate-pulse rounded-full bg-orange-300/60 shadow-[0_0_20px_rgba(251,146,60,0.9)]"
            style={{
              left: `${8 + index * 5}%`,
              top: `${18 + ((index * 13) % 70)}%`,
              opacity: 0.25 + (index % 5) * 0.12,
              transform: `scale(${0.7 + (index % 4) * 0.25})`,
            }}
          />
        ))}
      </div>

      {/* Player */}
      <div className="absolute bottom-[-45px] right-[-55px] z-[3] hidden h-[92%] w-[56%] xl:block">
        <div className="absolute bottom-20 right-24 h-[450px] w-[450px] rounded-full bg-orange-500/20 blur-[180px]" />

        <img
          src="/hero-player.png"
          alt="CYBL Basketball Player"
          className="absolute bottom-0 right-0 h-full w-full object-contain object-bottom drop-shadow-[0_70px_120px_rgba(249,115,22,0.55)]"
        />
      </div>

      {/* Mobile player background hint */}
      <div className="absolute bottom-0 right-[-90px] z-[1] block h-[55%] w-[75%] opacity-30 md:hidden">
        <img
          src="/hero-player.png"
          alt="CYBL Basketball Player"
          className="h-full w-full object-contain object-bottom"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 py-24">
        <div className="max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-orange-400/30 bg-orange-500/10 px-5 py-2 backdrop-blur-xl">
            <span className="h-2 w-2 animate-pulse rounded-full bg-orange-400 shadow-[0_0_18px_rgba(251,146,60,0.9)]" />
            <span className="text-xs font-black uppercase tracking-[0.28em] text-orange-300 md:text-sm">
              Caucasus Youth Basketball League
            </span>
          </div>

          <h1 className="mb-6 text-5xl font-black leading-[1.03] md:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-orange-400 via-orange-300 to-yellow-200 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(255,150,50,0.35)]">
              The Future of
              <br />
              Basketball Starts Here
            </span>
          </h1>

          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-gray-200 md:text-xl">
            CYBL connects young athletes, clubs and countries through premium
            international youth basketball tournaments, education and long-term
            player development.
          </p>

          <div className="mb-10 flex flex-wrap gap-4">
            <a
              href="/tournaments/summer-league"
              className="rounded-full bg-orange-500 px-8 py-4 font-bold text-white shadow-xl shadow-orange-500/30 transition duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-orange-600 hover:shadow-[0_0_45px_rgba(249,115,22,0.7)]"
            >
              Register Your Team
            </a>

            <a
              href="/documents/CYBL_Summer_League_2026_Official_Regulations.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/25 bg-white/10 px-8 py-4 font-bold text-white backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:bg-white hover:text-[#050816]"
            >
              Official Regulations
            </a>
          </div>

          <div className="grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((item) => (
              <div
                key={item.label}
                className="group rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-orange-400/70 hover:bg-white/15 hover:shadow-[0_0_40px_rgba(249,115,22,0.35)]"
              >
                <h3 className="text-3xl font-black text-orange-400 md:text-4xl">
                  <Counter target={item.number} />
                </h3>

                <p className="mt-2 text-xs uppercase tracking-widest text-gray-200 md:text-sm">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 max-w-4xl rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl transition hover:border-orange-400/40 hover:bg-white/15">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-orange-400">
              International Teams & Partners
            </p>

            <div className="flex flex-wrap gap-3">
              {countries.map((country) => (
                <span
                  key={country.name}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-gray-100 transition hover:-translate-y-1 hover:border-orange-300/60 hover:bg-orange-500/20"
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

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#050816] to-transparent" />
    </section>
  );
}