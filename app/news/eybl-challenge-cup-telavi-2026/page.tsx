import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";

export default function EYBLChallengeCupArticle() {
  return (
    <>
      <Header />

      <main className="bg-[#050816] min-h-screen text-white">
        <div className="mx-auto max-w-5xl px-6 py-20">

          <p className="mb-4 uppercase tracking-[0.35em] text-orange-400 font-bold">
            EVENT RECAP • APRIL 2026
          </p>

          <h1 className="mb-8 text-5xl font-black leading-tight">
            EYBL Challenge Cup U16 Successfully Hosted in Telavi, Georgia
          </h1>

          <p className="mb-12 text-xl text-gray-300">
            The first official EYBL tournament in the region marked a historic
            milestone for international youth basketball in Georgia.
          </p>

          <div className="space-y-8 text-lg leading-9 text-gray-300">

            <p>
              In April 2026, Telavi proudly hosted the first official
              <strong className="text-white">
                {" "}EYBL Challenge Cup U16{" "}
              </strong>
              ever organized in the region.
            </p>

            <p>
              The tournament was locally organized by
              <strong className="text-white"> CYBL </strong>
              and welcomed youth basketball teams from
              <strong className="text-white">
                {" "}Georgia, Armenia, Latvia and Kazakhstan.
              </strong>
            </p>

            <p>
              Throughout the tournament, players, coaches and guests experienced
              five days of high-level basketball, friendship and international
              cooperation in Telavi.
            </p>

            <p>
              According to EYBL representatives and participating clubs, the
              event received excellent feedback for its organization,
              hospitality, facilities and overall atmosphere.
            </p>

            <p>
              This successful event became an important first step toward CYBL's
              long-term vision of becoming one of the leading international
              youth basketball platforms in the Caucasus region.
            </p>

          </div>

          <a
            href="/"
            className="mt-14 inline-flex rounded-full bg-orange-500 px-8 py-4 font-bold text-white transition hover:bg-orange-600"
          >
            ← Back to Home
          </a>

        </div>
      </main>

      <Footer />
    </>
  );
}