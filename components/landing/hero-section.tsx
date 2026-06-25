"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { FairAwardReceiptObject } from "@/components/landing/fair-award-receipt-object";
import { useGsapContext } from "@/hooks/use-gsap-context";

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  useGsapContext(heroRef, (_, reducedMotion) => {
    if (reducedMotion) return;

    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    timeline
      .from(".hero-line-inner", { yPercent: 110, autoAlpha: 0, duration: 0.9, stagger: 0.12 }, 0.05)
      .from(".hero-copy", { y: 24, autoAlpha: 0, duration: 0.65 }, 0.68)
      .from(".hero-cta", { y: 18, autoAlpha: 0, duration: 0.55, stagger: 0.08 }, 0.85)
      .from(".hero-shape", { scale: 0.86, autoAlpha: 0, duration: 0.9, transformOrigin: "50% 50%" }, 0.24)
      .from(".hero-receipt", { x: 80, rotate: 4, scale: 0.94, autoAlpha: 0, duration: 0.9 }, 0.32)
      .from(".hero-label", { autoAlpha: 0, y: 16, duration: 0.45 }, 1.05);

    gsap.to(".hero-headline", {
      yPercent: -12,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    gsap.to(".hero-receipt", {
      yPercent: -10,
      rotate: 2,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    gsap.to(".hero-shape", {
      yPercent: -18,
      scale: 1.04,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    gsap.to(".hero-accent", {
      yPercent: -6,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  });

  return (
    <section ref={heroRef} className="relative min-h-[calc(100vh-5rem)] bg-[#E7F5B8]" id="product">
      <div className="hero-shape absolute right-[-18vw] top-20 h-[56vw] max-h-[760px] w-[56vw] max-w-[760px] rotate-12 bg-ofora-deep will-change-transform" />
      <div className="hero-accent absolute right-[4vw] top-28 h-40 w-40 rounded-full border border-ofora-green/25 will-change-transform sm:h-64 sm:w-64" />
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[0.96fr_1.04fr] lg:px-8">
        <div className="relative z-10">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-ofora-green">Confidential bids. Defensible awards.</p>
          <h1 className="hero-headline mt-6 max-w-4xl text-[clamp(4rem,10vw,9.4rem)] font-black leading-[0.82] tracking-[-0.08em] text-ofora-deep will-change-transform">
            <span className="block overflow-hidden pb-2">
              <span className="hero-line-inner block">FAIR AWARDS.</span>
            </span>
            <span className="block overflow-hidden pb-2">
              <span className="hero-line-inner block">WITHOUT EXPOSED BIDS.</span>
            </span>
          </h1>
          <p className="hero-copy mt-8 max-w-2xl text-lg leading-8 text-ofora-ink/78">
            Ofora helps organizations protect supplier confidentiality while independently validating that every contract award followed the rules set before bidding began.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#award-validation"
              className="hero-cta ofora-focus inline-flex items-center justify-center gap-2 rounded-full bg-ofora-deep px-6 py-3 text-sm font-black text-white transition duration-200 hover:-translate-y-0.5 hover:bg-ofora-green"
            >
              Explore Ofora
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/audit/audit-ofr-2026-041"
              className="hero-cta ofora-focus inline-flex items-center justify-center rounded-full border border-ofora-deep/20 bg-[#E7F5B8] px-6 py-3 text-sm font-black text-ofora-deep transition duration-200 hover:-translate-y-0.5 hover:bg-white"
            >
              View a validated award
            </Link>
          </div>
        </div>
        <div className="hero-receipt relative z-10 px-8 py-10 will-change-transform">
          <p className="hero-label absolute -right-2 top-12 hidden rotate-90 text-xs font-black uppercase tracking-[0.32em] text-[#E7F5B8] lg:block">
            Independent award validation
          </p>
          <FairAwardReceiptObject />
        </div>
      </div>
    </section>
  );
}
