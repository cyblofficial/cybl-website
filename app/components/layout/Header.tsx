"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { label: "Home", href: "/" },
    { label: "About", href: "/#about" },
    { label: "Tournaments", href: "/tournaments/summer-league" },
    { label: "Teams", href: "/#teams" },
    { label: "News", href: "/#news" },
    { label: "Contact", href: "/#contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-orange-200 bg-[#FFF8F0]/95 shadow-sm backdrop-blur-xl">
      {/* Top Gold Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500" />

      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-300 ${
          scrolled ? "py-1" : "py-1.5"
        }`}
      >
        {/* Logo */}
        <div className="relative flex items-center">
          <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-400/15 blur-2xl" />

          <a
            href="/"
            className="relative z-50 flex items-center transition duration-300 hover:scale-105"
          >
            <Image
              src="/logo/CYBL_logo.svg"
              alt="CYBL Logo"
              width={72}
              height={72}
              priority
              className={`object-contain transition-all duration-300 ${
                scrolled ? "h-[58px] w-[58px]" : "h-[68px] w-[68px]"
              }`}
            />
          </a>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden items-center gap-9 text-[14px] font-bold text-[#4B0F1F] md:flex">
          {links.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="group relative transition duration-300 hover:text-orange-500"
            >
              {item.label}

              <span className="absolute -bottom-2 left-0 h-[2px] w-0 bg-orange-500 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Register Button */}
        <a
          href="/tournaments/summer-league"
          className="hidden rounded-full bg-orange-500 px-6 py-2.5 font-bold text-white shadow-lg shadow-orange-500/25 transition duration-300 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-orange-500/50 md:inline-flex"
        >
          Register →
        </a>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          aria-label="Menu"
          className="z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-orange-200 bg-white md:hidden"
        >
          <span
            className={`h-0.5 w-5 bg-[#4B0F1F] transition ${
              open ? "translate-y-2 rotate-45" : ""
            }`}
          />

          <span
            className={`h-0.5 w-5 bg-[#4B0F1F] transition ${
              open ? "opacity-0" : ""
            }`}
          />

          <span
            className={`h-0.5 w-5 bg-[#4B0F1F] transition ${
              open ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-[#FFF8F0]/95 backdrop-blur-xl transition-all duration-300 md:hidden ${
          open ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        <div className="flex min-h-screen flex-col items-center justify-center gap-8 text-2xl font-bold text-[#4B0F1F]">
          {links.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="transition hover:text-orange-500"
            >
              {item.label}
            </a>
          ))}

          <a
            href="/tournaments/summer-league"
            onClick={() => setOpen(false)}
            className="mt-4 rounded-full bg-orange-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600"
          >
            Register Now
          </a>
        </div>
      </div>
    </header>
  );
}