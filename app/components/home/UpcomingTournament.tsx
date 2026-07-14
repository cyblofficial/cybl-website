export default function UpcomingTournament() {
  return (
    <section
      id="tournament"
      className="bg-[#061426] px-8 py-20 text-white"
    >
      <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl">

        <p className="text-sm font-bold uppercase tracking-[6px] text-yellow-500">
          Featured Tournament
        </p>

        <h2 className="mt-4 text-4xl font-black uppercase md:text-6xl">
          CYBL Summer League 2026
        </h2>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-300">
          Join one of the premier international youth basketball events in the
          Caucasus. The CYBL Summer League brings together ambitious clubs,
          talented players and experienced coaches for five days of high-level
          competition, development and international friendship.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-[#081B33] p-6">
            <p className="text-sm uppercase tracking-widest text-yellow-500">
              Location
            </p>

            <h3 className="mt-3 text-2xl font-bold">
              Telavi, Georgia 🇬🇪
            </h3>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#081B33] p-6">
            <p className="text-sm uppercase tracking-widest text-yellow-500">
              Dates
            </p>

            <h3 className="mt-3 text-2xl font-bold">
              September 1–5, 2026
            </h3>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#081B33] p-6">
            <p className="text-sm uppercase tracking-widest text-yellow-500">
              Registration
            </p>

            <h3 className="mt-3 text-2xl font-bold text-green-400">
              FREE
            </h3>
          </div>

        </div>

        <div className="mt-10 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6">

          <h3 className="text-2xl font-bold text-yellow-400">
            Registration is Open
          </h3>

          <p className="mt-4 leading-8 text-gray-300">
            Teams interested in participating in the CYBL Summer League 2026
            can contact us via Email or WhatsApp to receive tournament
            regulations, accommodation details and registration information.
          </p>

        </div>

        <div className="mt-10 flex flex-wrap gap-5">

          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=telavicybl@gmail.com&su=CYBL%20Summer%20League%202026%20Registration&body=Hello%20CYBL,%0A%0AWe%20are%20interested%20in%20the%20CYBL%20Summer%20League%202026.%0A%0ATeam%20Name:%0ACountry:%0AAge%20Group:%0ANumber%20of%20Players:%0ANumber%20of%20Coaches:%0AContact%20Person:%0APhone:%0A"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-yellow-500 px-8 py-4 font-bold text-black transition hover:bg-yellow-400"
          >
            Register by Email
          </a>

          <a
            href="https://wa.me/995597970306?text=Hello%20CYBL,%20we%20would%20like%20to%20register%20for%20the%20CYBL%20Summer%20League%202026."
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/30 px-8 py-4 font-bold text-white transition hover:bg-white/10"
          >
            Contact via WhatsApp
          </a>

        </div>

      </div>
    </section>
  );
}