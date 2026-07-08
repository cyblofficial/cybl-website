export default function Home() {
  return (
    <main className="min-h-screen bg-[#071A2E] text-white">
      <header className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-[#071A2E]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="text-2xl font-black tracking-widest">
            CYBL
          </div>

          <nav className="hidden gap-8 text-sm font-semibold uppercase tracking-wider md:flex">
            <a>Home</a>
            <a>About</a>
            <a>Tournaments</a>
            <a>Teams</a>
            <a>Schedule</a>
            <a>Contact</a>
          </nav>

          <button className="rounded-full bg-[#D4AF37] px-5 py-2 text-sm font-bold text-[#071A2E]">
            Register
          </button>
        </div>
      </header>

      <section className="relative flex min-h-screen items-center overflow-hidden px-6 pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#D4AF3730,transparent_35%),linear-gradient(135deg,#071A2E,#020814)]" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.4em] text-[#D4AF37]">
            Caucasus Youth Basketball League
          </p>

          <h1 className="max-w-5xl text-5xl font-black uppercase leading-tight md:text-7xl">
            The Future of Basketball Starts Here
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
            CYBL connects young athletes, clubs and countries through high-level youth basketball tournaments, development programs and international cooperation.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <button className="rounded-full bg-[#D4AF37] px-8 py-4 font-bold text-[#071A2E]">
              Explore Tournaments
            </button>

            <button className="rounded-full border border-white/30 px-8 py-4 font-bold text-white">
              Latest News
            </button>
          </div>

          <div className="mt-16 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
            {["Develop", "Compete", "Inspire", "Connect"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur">
                <p className="text-sm font-bold uppercase tracking-widest text-[#D4AF37]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}