import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#030611] px-6 py-14 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Image
            src="/logo/CYBL_logo.svg"
            alt="CYBL Logo"
            width={90}
            height={90}
          />

          <p className="mt-5 max-w-md leading-relaxed text-gray-400">
            Caucasus Youth Basketball League is building an international youth
            basketball platform connecting players, clubs and countries through
            premium competition and development.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-black text-orange-400">Navigation</h4>
          <div className="flex flex-col gap-3 text-gray-400">
            <a href="/" className="hover:text-white">Home</a>
            <a href="#about" className="hover:text-white">About</a>
            <a href="/tournaments/summer-league" className="hover:text-white">
              Tournaments
            </a>
            <a href="#news" className="hover:text-white">News</a>
            <a href="#contact" className="hover:text-white">Contact</a>
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-black text-orange-400">Contact</h4>
          <div className="flex flex-col gap-3 text-gray-400">
            <a href="mailto:telavicybl@gmail.com" className="hover:text-white">
  telavicybl@gmail.com
</a>
            <a href="#contact" className="hover:text-white">
              Registration & inquiries
            </a>
            <span>Telavi, Georgia</span>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col justify-between gap-4 border-t border-white/10 pt-6 text-sm text-gray-500 md:flex-row">
        <p>© 2026 CYBL. All rights reserved.</p>
        <p>Official youth basketball platform.</p>
      </div>
    </footer>
  );
}