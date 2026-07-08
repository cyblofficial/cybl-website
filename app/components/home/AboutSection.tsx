export default function About() {
  return (
    <section
      id="about"
      className="bg-[#081B33] px-8 py-24 text-white"
    >
      <div className="mx-auto max-w-7xl">

        <p className="font-bold uppercase tracking-[6px] text-yellow-500">
          ABOUT CYBL
        </p>

        <h2 className="mt-4 text-5xl font-black uppercase">
          Caucasus Youth Basketball League
        </h2>

        <div className="mt-12 grid gap-12 lg:grid-cols-2">

          <div className="space-y-6 text-lg leading-9 text-gray-300">

            <p>
              <strong className="text-white">
                Caucasus Youth Basketball League (CYBL)
              </strong>{" "}
              is an international youth basketball organization founded in
              Georgia with the mission of creating high-quality competitive
              opportunities for young athletes across the Caucasus and
              neighboring regions.
            </p>

            <p>
              CYBL maintains a strong and friendly relationship with the
              European Youth Basketball League (EYBL) and is committed to
              expanding international basketball opportunities throughout the
              region.
            </p>

            <p>
              Our primary focus is on clubs and youth national teams from the
              Caucasus, Central Asia and neighboring countries, while also
              welcoming European clubs seeking high-level international
              competition.
            </p>

            <p>
              More than simply organizing tournaments, CYBL is dedicated to
              developing young athletes through competition, education and
              international cooperation.
            </p>

          </div>

          <div className="grid gap-6">

            <div className="rounded-3xl bg-white/5 border border-white/10 p-8">
              <h3 className="text-2xl font-bold text-yellow-500">
                Our Mission
              </h3>

              <p className="mt-4 leading-8 text-gray-300">
                To inspire and develop the next generation of basketball
                players by providing professional international competitions
                and educational opportunities.
              </p>
            </div>

            <div className="rounded-3xl bg-white/5 border border-white/10 p-8">
              <h3 className="text-2xl font-bold text-yellow-500">
                Our Vision
              </h3>

              <p className="mt-4 leading-8 text-gray-300">
                To become the leading international youth basketball platform
                in the Caucasus region.
              </p>
            </div>

            <div className="rounded-3xl bg-white/5 border border-white/10 p-8">
              <h3 className="text-2xl font-bold text-yellow-500">
                Core Values
              </h3>

              <ul className="mt-4 space-y-3 text-gray-300">
                <li>🏀 Development</li>
                <li>🤝 Respect</li>
                <li>🌍 International Friendship</li>
                <li>🏆 Excellence</li>
                <li>❤️ Passion</li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}