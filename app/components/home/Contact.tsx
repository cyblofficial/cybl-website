export default function Contact() {
  return (
    <section
      id="contact"
      className="bg-[#081B33] px-8 py-24 text-white"
    >
      <div className="mx-auto max-w-7xl">
        <p className="font-bold uppercase tracking-[6px] text-yellow-500">
          CONTACT US
        </p>

        <h2 className="mt-4 text-5xl font-black uppercase">
          Get in Touch with CYBL
        </h2>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-300">
          Whether you are interested in tournament registration, international
          cooperation, partnerships or general information, our team is ready to
          assist you.
        </p>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h3 className="text-2xl font-bold text-yellow-500">
              General Inquiries
            </h3>
            <p className="mt-4 text-gray-300">Email</p>
            <a
              href="mailto:telavicybl@gmail.com"
              className="mt-2 block text-xl font-bold text-white hover:text-yellow-400"
            >
              telavicybl@gmail.com
            </a>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h3 className="text-2xl font-bold text-yellow-500">
              Tournament Registration
            </h3>
            <p className="mt-4 text-gray-300">
              David Khanjaliashvili
              <br />
              President – Caucasus Youth Basketball League
            </p>
            <a
              href="https://wa.me/995597970306"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-xl font-bold text-white hover:text-yellow-400"
            >
              WhatsApp: +995 597 970 306
            </a>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h3 className="text-2xl font-bold text-yellow-500">
              Tournament Operations
            </h3>
            <p className="mt-4 text-gray-300">
              Vano
              <br />
              Tournament Coordinator
            </p>
            <a
              href="https://wa.me/995558933166"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-xl font-bold text-white hover:text-yellow-400"
            >
              WhatsApp: +995 558 933 166
            </a>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h3 className="text-2xl font-bold text-yellow-500">
              Headquarters
            </h3>
            <p className="mt-4 text-xl font-bold text-white">
              Telavi, Georgia
            </p>

            <h3 className="mt-8 text-2xl font-bold text-yellow-500">
              Follow CYBL
            </h3>
            <p className="mt-4 text-gray-300">Facebook</p>
            <p className="mt-2 text-xl font-bold text-white">
              Caucasus Youth Basketball League
            </p>
          </div>
        </div>

        <div className="mt-14 rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-10">
          <h3 className="text-3xl font-black">Join the CYBL Community</h3>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-300">
            We look forward to welcoming clubs, coaches and young athletes from
            around the world to our international basketball events.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/tournaments/summer-league"
              className="rounded-full bg-yellow-500 px-8 py-4 font-bold text-black hover:bg-yellow-400"
            >
              Register Your Team
            </a>

            <a
              href="/documents/CYBL_Summer_League_2026_Official_Regulations.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/30 px-8 py-4 font-bold hover:bg-white/10"
            >
              Download Regulations
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
