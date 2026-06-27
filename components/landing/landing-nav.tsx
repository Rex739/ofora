"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { Menu } from "lucide-react";
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
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 min-[380px]:px-5 lg:px-8" aria-label="Landing navigation">
        <Link href="/" className="flex min-w-0 items-center gap-2 min-[380px]:gap-3" aria-label="Ofora home">
          <OforaMark className="h-8 w-8 shrink-0 min-[380px]:h-9 min-[380px]:w-9" />
          <span className="truncate text-lg font-black tracking-[-0.03em] text-ofora-deep min-[380px]:text-xl">Ofora</span>
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
        <div className="flex shrink-0 items-center gap-1.5 min-[380px]:gap-2 lg:hidden">
          <Link href="/dashboard" className="ofora-focus rounded-full border border-ofora-deep/15 bg-white px-3 py-2 text-sm font-black leading-none text-ofora-deep min-[380px]:px-4">
            Sign in
          </Link>
          <Link
            href="/supplier"
            className="ofora-focus hidden rounded-full bg-ofora-deep px-3 py-2 text-sm font-semibold leading-none text-white min-[390px]:inline-flex min-[430px]:px-4"
          >
            <span className="hidden min-[360px]:inline">Request </span>access
          </Link>
          <details className="group relative">
            <summary className="ofora-focus flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-ofora-deep/15 bg-white text-ofora-deep transition hover:bg-[#E7F5B8] [&::-webkit-details-marker]:hidden">
              <Menu className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Open navigation menu</span>
            </summary>
            <div className="absolute right-0 top-11 z-50 grid w-[min(17rem,calc(100vw-2rem))] gap-1 border border-ofora-deep/12 bg-white p-2 text-sm font-black text-ofora-deep shadow-[0_24px_60px_rgba(6,53,36,0.18)]">
              {navItems.map(([label, href]) => (
                <a key={href} href={href} className="ofora-focus px-4 py-3 transition hover:bg-[#E7F5B8]">
                  {label}
                </a>
              ))}
              <Link href="/supplier" className="ofora-focus px-4 py-3 transition hover:bg-[#E7F5B8]">
                Request access
              </Link>
            </div>
          </details>
        </div>
      </nav>
    </header>
  );
}
