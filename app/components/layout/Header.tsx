"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    ["Home", "/"],
    ["About", "#about"],
    ["Tournaments", "/tournaments/summer-league"],
    ["Teams", "#teams"],
    ["News", "#news"],
    ["Contact", "#contact"],
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="h-[3px] w-full bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500" />

      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-300 ${
          scrolled ? "py-2" : "py-3"
        }`}
      >
        <a href="/" className="z-50">
          <Image
            src="/logo/CYBL_logo.svg"
            alt="CYBL Logo"
            width={scrolled ? 70 : 82}
            height={scrolled ? 70 : 82}
            className="transition-all duration-300"
          />
        </a>

        <nav className="hidden items-center gap-8 text-sm font-bold text-[#4B0F1F] md:flex">
          {links.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="relative transition hover:text-orange-500 after:absolute after:-bottom-2 after:left-0 after:h-[2px] after:w-0 after:bg-orange-500 after:transition-all hover:after:w-full"
            >
              {label}
            </a>
          ))}
        </nav>

        <a
          href="/tournaments/summer-league"
          className="hidden rounded-full bg-orange-500 px-7 py-3 font-bold text-white transition hover:bg-orange-600 md:inline-flex"
        >
          Register
        </a>

        <button
          onClick={() => setOpen(!open)}
          className="z-50 flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-white md:hidden"
          aria-label="Open menu"
        >
          <span className={`h-0.5 w-5 bg-[#4B0F1F] transition ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-5 bg-[#4B0F1F] transition ${open ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-5 bg-[#4B0F1F] transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-white/95 backdrop-blur-xl transition md:hidden ${
          open ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        <div className="flex min-h-screen flex-col items-center justify-center gap-8 text-xl font-bold text-[#4B0F1F]">
          {links.map(([label, href]) => (
            <a key={label} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}

          <a
            href="/tournaments/summer-league"
            onClick={() => setOpen(false)}
            className="rounded-full bg-orange-500 px-8 py-4 text-base text-white"
          >
            Register Now
          </a>
        </div>
      </div>
    </header>
  );
}