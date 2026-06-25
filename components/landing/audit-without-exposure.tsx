"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGsapContext } from "@/hooks/use-gsap-context";

const auditable = [
  "Tender ID",
  "Awarded supplier",
  "Award value",
  "Policy lock status",
  "Validation timestamp",
  "Receipt ID",
  "Award status"
];

const protectedData = [
  "Losing bid prices",
  "Supplier commercial terms",
  "Private capability data",
  "Internal evaluation details",
  "Confidential documents"
];

export function AuditWithoutExposure() {
  const sectionRef = useRef<HTMLElement>(null);

  useGsapContext(sectionRef, (_, reducedMotion) => {
    if (reducedMotion) return;

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 70%",
        once: true
      }
    });

    timeline
      .from(".audit-heading-line", { yPercent: 105, autoAlpha: 0, duration: 0.72, stagger: 0.1, ease: "power3.out" })
      .from(".audit-divider", { scaleY: 0, transformOrigin: "top center", duration: 0.72, ease: "power2.out" }, "-=0.25")
      .from(".audit-left", { x: -32, autoAlpha: 0, duration: 0.65, ease: "power3.out" }, "-=0.55")
      .from(".audit-row-left", { y: 16, autoAlpha: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" }, "-=0.35")
      .from(".audit-right", { x: 32, autoAlpha: 0, filter: "blur(5px)", duration: 0.65, ease: "power3.out" }, "-=0.5")
      .from(".privacy-mask", { scaleX: 0, transformOrigin: "left center", duration: 0.38, stagger: 0.05, ease: "power2.out" }, "-=0.25")
      .to(".audit-right", { filter: "blur(0px)", duration: 0.18 }, "-=0.1");
  });

  return (
    <section ref={sectionRef} className="bg-ofora-deep px-5 py-20 text-white lg:px-8 lg:py-28" id="audit-records">
      <div className="mx-auto max-w-7xl">
        <h2 className="max-w-5xl text-[clamp(3.1rem,7vw,8rem)] font-black leading-[0.86] tracking-[-0.075em] text-[#E7F5B8]">
          <span className="block overflow-hidden pb-2">
            <span className="audit-heading-line block">WHAT AUDITORS SEE.</span>
          </span>
          <span className="block overflow-hidden pb-2">
            <span className="audit-heading-line block">WHAT COMPETITORS NEVER DO.</span>
          </span>
        </h2>
        <div className="relative mt-14 grid gap-px bg-white/15 lg:grid-cols-2">
          <span className="audit-divider absolute bottom-0 left-1/2 top-0 z-20 hidden w-px bg-[#E7F5B8]/40 lg:block" />
          <ComparisonColumn title="Auditable" items={auditable} variant="left" />
          <ComparisonColumn title="Protected" items={protectedData} variant="right" />
        </div>
      </div>
    </section>
  );
}

function ComparisonColumn({ title, items, variant }: { title: string; items: string[]; variant: "left" | "right" }) {
  return (
    <div className={`${variant === "left" ? "audit-left" : "audit-right"} bg-ofora-deep p-6 sm:p-8 lg:p-10`}>
      <h3 className="text-4xl font-black tracking-[-0.06em] text-white">{title}</h3>
      <ul className="mt-8 grid gap-4">
        {items.map((item) => (
          <li key={item} className={`${variant === "left" ? "audit-row-left" : ""} relative flex items-center gap-4 overflow-hidden border-b border-white/12 pb-4 text-lg font-semibold text-white/76`}>
            <span className="h-2 w-2 rounded-full bg-[#E7F5B8]" />
            {variant === "right" ? <span className="privacy-mask absolute left-8 top-1 h-7 w-4/5 bg-ofora-green/45" /> : null}
            <span className="relative z-10">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
