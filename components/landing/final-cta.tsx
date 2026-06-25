"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { OforaMark } from "@/components/landing/ofora-mark";
import { useGsapContext } from "@/hooks/use-gsap-context";

export function FinalCta() {
  const sectionRef = useRef<HTMLElement>(null);

  useGsapContext(sectionRef, (_, reducedMotion) => {
    if (reducedMotion) return;

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 72%",
        once: true
      }
    });

    timeline
      .from(".cta-line-inner", { yPercent: 105, autoAlpha: 0, duration: 0.75, stagger: 0.1, ease: "power3.out" })
      .from(".cta-copy", { autoAlpha: 0, y: 18, duration: 0.5, ease: "power2.out" }, "-=0.25")
      .from(".cta-button", { scale: 0.96, autoAlpha: 0, duration: 0.38, ease: "power2.out" }, "-=0.1");

    gsap.to(".cta-seal", {
      rotate: 5,
      yPercent: -4,
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom bottom",
        scrub: true
      }
    });

    gsap.from(".cta-circle", {
      yPercent: 25,
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom bottom",
        scrub: true
      }
    });
  });

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-ofora-deep px-5 py-20 text-[#E7F5B8] lg:px-8 lg:py-28">
      <div className="absolute right-[-120px] top-10 h-96 w-96 rotate-12 border-[48px] border-[#E7F5B8]/10" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_0.45fr]">
        <div>
          <h2 className="text-[clamp(3.6rem,8vw,9rem)] font-black leading-[0.84] tracking-[-0.08em]">
            <span className="block overflow-hidden pb-2">
              <span className="cta-line-inner block">MAKE EVERY AWARD</span>
            </span>
            <span className="block overflow-hidden pb-2">
              <span className="cta-line-inner block">DEFENSIBLE.</span>
            </span>
          </h2>
          <p className="cta-copy mt-7 text-xl leading-8 text-white/72">Protect supplier confidentiality. Lock the rules. Validate the decision.</p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link href="/supplier" className="cta-button ofora-focus inline-flex justify-center rounded-full bg-[#E7F5B8] px-7 py-3 text-sm font-black text-ofora-deep transition duration-200 hover:-translate-y-0.5">
              Request early access
            </Link>
            <Link href="/audit/audit-ofr-2026-041" className="font-black text-white underline-offset-4 hover:underline">
              Explore a Fair Award Receipt
            </Link>
          </div>
        </div>
        <div className="relative flex min-h-72 items-center justify-center">
          <div className="cta-circle absolute h-64 w-64 rounded-full border-[34px] border-[#E7F5B8]/15" />
          <div className="absolute h-44 w-44 rotate-[-18deg] bg-[#E7F5B8]" />
          <OforaMark className="cta-seal relative h-32 w-32 border-[#E7F5B8] bg-ofora-deep" />
        </div>
      </div>
    </section>
  );
}
