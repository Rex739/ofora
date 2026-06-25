"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGsapContext } from "@/hooks/use-gsap-context";

const trustItems = [
  "PUBLIC PROCUREMENT",
  "INFRASTRUCTURE",
  "DEVELOPMENT PROGRAMS",
  "EMERGENCY RESPONSE",
  "ENTERPRISE SOURCING"
];

export function TrustStrip() {
  const sectionRef = useRef<HTMLElement>(null);

  useGsapContext(sectionRef, (_, reducedMotion) => {
    if (reducedMotion) return;

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
        once: true
      }
    });

    timeline
      .from(".trust-line", { scaleX: 0, transformOrigin: "left center", duration: 0.75, ease: "power2.out" })
      .from(".trust-label", { y: 16, autoAlpha: 0, duration: 0.45, stagger: 0.08, ease: "power2.out" }, "-=0.35");
  });

  return (
    <section ref={sectionRef} className="bg-white px-5 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="max-w-5xl text-3xl font-black leading-[1.02] tracking-[-0.06em] text-ofora-deep sm:text-5xl">
          Built for procurement teams where fairness, confidentiality, and accountability cannot be optional.
        </p>
        <div className="trust-line mt-10 grid border-y border-ofora-deep/15 text-xs font-black uppercase tracking-[0.16em] text-ofora-muted sm:grid-cols-5">
          {trustItems.map((item) => (
            <div key={item} className="trust-label border-ofora-deep/15 py-5 transition-transform duration-200 hover:translate-x-0.5 sm:border-r sm:px-4 sm:last:border-r-0">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
