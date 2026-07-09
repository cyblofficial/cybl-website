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
            priority
          />
        </a>

        <nav className="hidden items-center gap-8 text-sm font-bold text-[#4B0F1F] md:flex">
          {links.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="relative transition hover:text-orange-500 after:absolute after:-bottom-2 after:left-0 after:h-[2px] after:w-0 after:bg-orange-500 after:transition-all hover:after:w-full"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="/tournaments/summer-league"
          className="hidden rounded-full bg-orange-500 px-7 py-3 font-bold text-white transition hover:scale-105 hover:bg-orange-600 md:inline-flex"
        >
          Register
        </a>

        <button
          onClick={() => setOpen(!open)}
          className="z-50 flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-gray-300 bg-white md:hidden"
          aria-label="Menu"
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

      <div
        className={`fixed inset-0 z-40 bg-white/95 backdrop-blur-xl transition-all duration-300 md:hidden ${
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
            className="rounded-full bg-orange-500 px-8 py-4 text-base text-white transition hover:bg-orange-600"
          >
            Register Now
          </a>
        </div>
      </div>
    </header>
  );
}