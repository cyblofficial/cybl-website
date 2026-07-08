import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#081B33] border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-3">

        <a href="/">
          <Image
            src="/logo/CYBL_logo.svg"
            alt="CYBL Logo"
            width={110}
            height={110}
          />
        </a>

        <nav className="hidden md:flex gap-8 text-white font-semibold">

          <a href="/" className="hover:text-yellow-400">
            Home
          </a>

          <a href="#about" className="hover:text-yellow-400">
            About
          </a>

          <a
            href="/tournaments/summer-league"
            className="hover:text-yellow-400"
          >
            Tournaments
          </a>

          <a href="#teams" className="hover:text-yellow-400">
            Teams
          </a>

          <a href="#news" className="hover:text-yellow-400">
            News
          </a>

          <a href="#contact" className="hover:text-yellow-400">
            Contact
          </a>

        </nav>

        <a
          href="/tournaments/summer-league"
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-full"
        >
          Register
        </a>

      </div>
    </header>
  );
}