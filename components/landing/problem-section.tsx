"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGsapContext } from "@/hooks/use-gsap-context";

export function ProblemSection() {
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
      .from(sectionRef.current, { clipPath: "inset(18% 0 0 0)", duration: 0.85, ease: "power3.out" })
      .from(".problem-line-inner", { yPercent: 110, autoAlpha: 0, duration: 0.78, stagger: 0.1, ease: "power3.out" }, "-=0.42")
      .from(".problem-copy", { y: 24, autoAlpha: 0, duration: 0.55, ease: "power2.out" }, "-=0.24")
      .from(".dossier-stack", { x: 80, autoAlpha: 0, duration: 0.75, ease: "power3.out" }, "-=0.5")
      .from(".privacy-block", { scaleX: 0, transformOrigin: "left center", duration: 0.42, stagger: 0.07, ease: "power2.out" }, "-=0.2")
      .fromTo(".scan-line", { xPercent: -120, autoAlpha: 0 }, { xPercent: 150, autoAlpha: 1, duration: 1.2, ease: "power1.inOut" }, "-=0.1")
      .to(".scan-line", { autoAlpha: 0, duration: 0.2 });
  });

  return (
    <section ref={sectionRef} className="bg-ofora-deep px-5 py-20 text-[#E7F5B8] lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <h2 className="text-[clamp(3.2rem,7.8vw,8rem)] font-black leading-[0.86] tracking-[-0.075em]">
            {["PUBLIC OVERSIGHT", "SHOULD NOT REQUIRE", "PUBLIC BIDS."].map((line) => (
              <span key={line} className="block overflow-hidden pb-2">
                <span className="problem-line-inner block">{line}</span>
              </span>
            ))}
          </h2>
          <p className="problem-copy mt-8 max-w-2xl text-lg leading-8 text-white/72">
            Traditional procurement forces an unfair choice: expose sensitive supplier information or ask everyone to trust the decision. Ofora removes that trade-off.
          </p>
        </div>
        <div className="dossier-stack relative min-h-[420px]">
          <span className="scan-line pointer-events-none absolute left-0 top-40 z-20 h-px w-72 bg-[#E7F5B8]/70 opacity-0" />
          <div className="absolute left-10 top-8 h-80 w-64 rotate-[-10deg] border border-[#E7F5B8]/20 bg-white p-5 shadow-[0_28px_80px_rgba(0,0,0,0.22)]" />
          <div className="absolute left-24 top-20 h-80 w-64 rotate-[5deg] border border-[#E7F5B8]/20 bg-ofora-mist p-5 shadow-[0_28px_80px_rgba(0,0,0,0.22)]">
            <div className="h-3 w-28 bg-ofora-deep" />
            <div className="mt-8 space-y-4">
              <HiddenRow width="w-44" />
              <HiddenRow width="w-32" />
              <HiddenRow width="w-48" />
              <HiddenRow width="w-36" />
            </div>
          </div>
          <div className="absolute left-0 top-40 h-80 w-64 rotate-[-2deg] border border-[#E7F5B8]/20 bg-white p-5 shadow-[0_28px_80px_rgba(0,0,0,0.22)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-ofora-green">Bid dossier</p>
            <div className="mt-8 space-y-5">
              <HiddenRow width="w-48" />
              <HiddenRow width="w-40" />
              <HiddenRow width="w-52" />
              <HiddenRow width="w-28" />
            </div>
            <div className="mt-9 h-24 border border-ofora-deep/10 [background:repeating-linear-gradient(135deg,#063524_0_1px,transparent_1px_10px)] opacity-25" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HiddenRow({ width }: { width: string }) {
  return (
    <div className="space-y-2">
      <div className="h-2 w-20 bg-ofora-deep/25" />
      <div className={`privacy-block h-5 ${width} bg-ofora-green`} />
    </div>
  );
}
