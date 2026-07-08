export default function Hero() {
  return (
    <section className="bg-[#081B33] text-white py-20">
      <div className="max-w-7xl mx-auto px-8">

        <p className="text-yellow-500 font-bold tracking-[6px] uppercase">
          Caucasus Youth Basketball League
        </p>

        <h1 className="mt-6 max-w-5xl text-5xl font-black leading-tight md:text-7xl">
          THE FUTURE OF
          <br />
          BASKETBALL
          <br />
          STARTS HERE
        </h1>

        <p className="mt-8 max-w-3xl text-xl leading-9 text-gray-300">
          CYBL connects young athletes, clubs and national federations through
          international youth basketball tournaments, education and long-term
          player development.
        </p>

        <div className="mt-12 flex flex-wrap gap-5">
          <a
            href="#tournament"
            className="rounded-full bg-yellow-500 px-8 py-4 font-bold text-black transition hover:bg-yellow-400"
          >
            Register Free
          </a>

          <a
            href="#about"
            className="rounded-full border border-white/30 px-8 py-4 font-bold text-white transition hover:bg-white/10"
          >
            Learn More
          </a>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-4">
          {[
            "Develop",
            "Compete",
            "Inspire",
            "Connect",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-white/5 py-6 text-center font-bold uppercase tracking-widest"
            >
              {item}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}