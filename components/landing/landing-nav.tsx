"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { OforaMark } from "@/components/landing/ofora-mark";
import { useGsapContext } from "@/hooks/use-gsap-context";

const navItems = [
  ["Product", "#product"],
  ["Solutions", "#solutions"],
  ["How it works", "#how-it-works"],
  ["Audit records", "#audit-records"]
];

export function LandingNav() {
  const navRef = useRef<HTMLElement>(null);

  useGsapContext(navRef, () => {
    gsap.from(navRef.current, {
      autoAlpha: 0,
      y: -12,
      duration: 0.65,
      ease: "power2.out"
    });
  });

  return (
    <header ref={navRef} className="sticky top-0 z-50 border-b border-ofora-deep/10 bg-white/94 backdrop-blur">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8" aria-label="Landing navigation">
        <Link href="/" className="flex items-center gap-3" aria-label="Ofora home">
          <OforaMark />
          <span className="text-xl font-black tracking-[-0.03em] text-ofora-deep">Ofora</span>
        </Link>
        <div className="hidden items-center gap-8 text-sm font-semibold text-ofora-muted lg:flex">
          {navItems.map(([label, href]) => (
            <a key={href} href={href} className="group relative transition hover:text-ofora-deep">
              {label}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-ofora-green transition-transform duration-200 group-hover:scale-x-100" />
            </a>
          ))}
          <Link href="/dashboard" className="text-ofora-deep transition hover:text-ofora-green">
            Sign in
          </Link>
          <Link
            href="/supplier"
            className="ofora-focus rounded-full bg-ofora-deep px-5 py-2.5 text-white transition hover:bg-ofora-green"
          >
            Request access
          </Link>
        </div>
        <Link
          href="/supplier"
          className="ofora-focus rounded-full bg-ofora-deep px-4 py-2 text-sm font-semibold text-white lg:hidden"
        >
          Request access
        </Link>
      </nav>
    </header>
  );
}
