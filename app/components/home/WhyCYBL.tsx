export default function WhyCYBL() {
  return (
    <section className="bg-[#050B16] px-8 py-24 text-white">
      <div className="mx-auto max-w-7xl">

        <p className="font-bold uppercase tracking-[6px] text-yellow-500">
          WHY CHOOSE CYBL
        </p>

        <h2 className="mt-4 text-5xl font-black uppercase">
          Building the Future of International Youth Basketball
        </h2>

        <p className="mt-8 max-w-4xl text-xl leading-9 text-gray-300">
          The <strong className="text-white">Caucasus Youth Basketball League (CYBL)</strong> is an
          international youth basketball organization founded in Georgia,
          creating professional basketball opportunities for clubs across the
          Caucasus, Europe and Asia.
        </p>

        <div className="mt-16 grid gap-8 md:grid-cols-3">

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="text-5xl">🌍</div>

            <h3 className="mt-6 text-2xl font-bold">
              International Platform
            </h3>

            <p className="mt-4 leading-8 text-gray-300">
              Connecting clubs, academies and youth national teams through
              professionally organized international competitions.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="text-5xl">🏀</div>

            <h3 className="mt-6 text-2xl font-bold">
              Professional Tournaments
            </h3>

            <p className="mt-4 leading-8 text-gray-300">
              International tournaments for U12–U18 age categories with
              high-level competition, player development and unforgettable
              experiences.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="text-5xl">🤝</div>

            <h3 className="mt-6 text-2xl font-bold">
              International Cooperation
            </h3>

            <p className="mt-4 leading-8 text-gray-300">
              CYBL maintains a strong and friendly relationship with the
              European Youth Basketball League (EYBL) while continuously
              expanding partnerships with clubs and basketball organizations.
            </p>
          </div>

        </div>

        <div className="mt-20 rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-10">

          <h3 className="text-4xl font-black">
            Ready to Join CYBL?
          </h3>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-300">
            Become part of an international basketball community where
            competition, development and friendship come together.
          </p>

          <a
            href="/tournaments/summer-league"
            className="mt-8 inline-block rounded-full bg-yellow-500 px-8 py-4 font-bold text-black hover:bg-yellow-400"
          >
            Explore Our Tournament
          </a>

        </div>

      </div>
    </section>
  );
}