import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#081B33] border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-3">

        <Image
          src="/logo/CYBL_logo.svg"
          alt="CYBL Logo"
          width={110}
height={110}
        />

        <nav className="hidden md:flex gap-8 text-white font-semibold">
          <a href="#">Home</a>
          <a href="#">About</a>
          <a href="#">Tournaments</a>
          <a href="#">Teams</a>
          <a href="#">News</a>
          <a href="#">Contact</a>
        </nav>

        <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-full">
          Register
        </button>

      </div>
    </header>
  );
}