export default function SummerLeaguePage() {
  return (
    <main className="min-h-screen bg-[#050B16] text-white">
      <section className="relative overflow-hidden px-8 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#D4AF3730,transparent_35%),linear-gradient(135deg,#071A2E,#020814)]" />

        <div className="relative mx-auto max-w-7xl">
          <p className="font-bold uppercase tracking-[6px] text-yellow-500">
            CYBL Official Tournament
          </p>

          <h1 className="mt-6 max-w-5xl text-5xl font-black uppercase leading-tight md:text-7xl">
            CYBL Summer League 2026
          </h1>

          <p className="mt-8 max-w-3xl text-xl leading-9 text-gray-300">
            Five days of international youth basketball, development,
            competition and friendship in Telavi, Georgia.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=telavicybl@gmail.com&su=CYBL%20Summer%20League%202026%20Registration"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-yellow-500 px-8 py-4 font-bold text-black hover:bg-yellow-400"
            >
              Register Team
            </a>

            <a
              href="#documents"
              className="rounded-full border border-white/30 px-8 py-4 font-bold hover:bg-white/10"
            >
              View Documents
            </a>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm uppercase tracking-widest text-yellow-500">
                Location
              </p>
              <h3 className="mt-3 text-2xl font-bold">Telavi, Georgia 🇬🇪</h3>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm uppercase tracking-widest text-yellow-500">
                Dates
              </p>
              <h3 className="mt-3 text-2xl font-bold">August 20–24, 2026</h3>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm uppercase tracking-widest text-yellow-500">
                Registration
              </p>
              <h3 className="mt-3 text-2xl font-bold text-green-400">FREE</h3>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 py-20">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          {[
            ["Develop", "Player growth through international games."],
            ["Compete", "High-level youth basketball environment."],
            ["Connect", "Clubs, coaches and players across countries."],
          ].map(([title, text]) => (
            <div
              key={title}
              className="rounded-3xl border border-white/10 bg-[#081B33] p-8"
            >
              <h3 className="text-3xl font-black text-yellow-500">{title}</h3>
              <p className="mt-4 leading-8 text-gray-300">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="documents" className="px-8 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-black">Tournament Documents</h2>
          <p className="mt-4 text-gray-300">
            Download the official documents for the CYBL Summer League 2026.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h3 className="text-2xl font-bold">Official Regulations</h3>
              <p className="mt-4 text-gray-300">
                Official tournament regulations and participation rules.
              </p>

              <a
                href="/documents/CYBL_Summer_League_2026_Official_Regulations.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-block rounded-full bg-yellow-500 px-8 py-4 font-bold text-black hover:bg-yellow-400"
              >
                Download Regulations
              </a>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h3 className="text-2xl font-bold">Official Presentation</h3>
              <p className="mt-4 text-gray-300">
                Summer League presentation for clubs and partners.
              </p>

              <a
                href="/documents/CYBL_Summer_League_2026_Official_Presentation.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-block rounded-full border border-white/30 px-8 py-4 font-bold hover:bg-white/10"
              >
                View Presentation
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="px-8 pb-24">
        <div className="mx-auto max-w-7xl rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-10">
          <h2 className="text-4xl font-black">Ready to Join?</h2>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-300">
            Contact CYBL to receive tournament information and complete your
            free team registration.
          </p>

          <div className="mt-10 flex flex-wrap gap-5">
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=telavicybl@gmail.com&su=CYBL%20Summer%20League%202026%20Registration"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-yellow-500 px-8 py-4 font-bold text-black hover:bg-yellow-400"
            >
              Register by Email
            </a>

            <a
              href="https://wa.me/995597970306"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/30 px-8 py-4 font-bold hover:bg-white/10"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}