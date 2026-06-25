"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsapContext } from "@/hooks/use-gsap-context";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  ["01", "SET THE RULES", "Define the evaluation criteria before suppliers submit.", "Criteria lines assemble into a locked policy card."],
  ["02", "LOCK THE POLICY", "Once bidding begins, criteria cannot be quietly changed.", "A clean seal marks the policy as locked."],
  ["03", "RECEIVE CONFIDENTIAL BIDS", "Suppliers share sensitive commercial details without exposing them publicly.", "Confidential dossiers move behind privacy masks."],
  ["04", "VALIDATE THE AWARD", "Ofora confirms that the selected supplier was the highest-scoring eligible submission.", "A validation seal lands on the Fair Award Receipt."],
  ["05", "CREATE A DEFENSIBLE RECORD", "Publish an audit record that proves compliance without revealing protected data.", "An audit timeline forms into a structured record."]
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useGsapContext(sectionRef, (_, reducedMotion) => {
    if (reducedMotion) return undefined;

    const media = gsap.matchMedia();
    media.add("(min-width: 1024px)", () => {
      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${steps.length * 78}%`,
        pin: ".how-pin",
        scrub: 0.5,
        anticipatePin: 1,
        onUpdate: (self) => {
          const next = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
          setActiveStep(next);
          gsap.to(".how-progress-fill", { scaleY: self.progress, duration: 0.15, ease: "none" });
        }
      });

      return () => trigger.kill();
    });

    gsap.from(".mobile-step", {
      y: 28,
      autoAlpha: 0,
      duration: 0.7,
      stagger: 0.08,
      ease: "power3.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 72%",
        once: true
      }
    });

    return () => media.revert();
  });

  const active = steps[activeStep];

  return (
    <section ref={sectionRef} className="bg-white" id="how-it-works">
      <div className="how-pin hidden min-h-screen items-center bg-white px-5 py-20 lg:flex lg:px-8">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-[0.26fr_1fr_0.72fr] items-center gap-12">
          <div className="relative flex min-h-[520px] flex-col justify-between border-l border-ofora-deep/15 pl-6">
            <span className="how-progress-fill absolute -left-px top-0 h-full w-px origin-top scale-y-0 bg-ofora-green" />
            {steps.map(([number, title], index) => (
              <button
                key={number}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`text-left transition duration-300 ${activeStep === index ? "text-ofora-deep" : "text-ofora-muted/50"}`}
              >
                <span className="block text-5xl font-black tracking-[-0.08em]">{number}</span>
                <span className="mt-2 block text-xs font-black uppercase tracking-[0.18em]">{title}</span>
              </button>
            ))}
          </div>
          <div className="min-h-[540px]">
            <p className="text-[clamp(8rem,16vw,15rem)] font-black leading-none tracking-[-0.09em] text-ofora-deep/10">{active[0]}</p>
            <h2 className="mt-[-2rem] max-w-4xl text-[clamp(4rem,7vw,8.2rem)] font-black leading-[0.84] tracking-[-0.08em] text-ofora-deep">
              {active[1]}
            </h2>
            <p className="mt-7 max-w-xl text-xl leading-8 text-ofora-muted">{active[2]}</p>
            <p className="mt-8 max-w-sm text-sm font-black uppercase tracking-[0.18em] text-ofora-green">{active[3]}</p>
          </div>
          <StepVisual activeStep={activeStep} />
        </div>
      </div>
      <div className="lg:hidden">
        {steps.map(([number, title, copy, detail], index) => (
          <article key={number} className={`${index === 1 ? "bg-[#E7F5B8]" : index === 3 ? "bg-ofora-deep text-[#E7F5B8]" : "bg-white text-ofora-deep"} mobile-step border-b border-ofora-deep/10 px-5 py-16`}>
            <p className="text-7xl font-black leading-none tracking-[-0.08em] opacity-25">{number}</p>
            <h2 className="mt-4 text-5xl font-black leading-[0.86] tracking-[-0.075em]">{title}</h2>
            <p className="mt-6 text-lg leading-8 opacity-75">{copy}</p>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] opacity-70">{detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function StepVisual({ activeStep }: { activeStep: number }) {
  return (
    <div className="relative min-h-[520px] overflow-hidden border border-ofora-deep/15 bg-ofora-canvas p-8">
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(#063524_1px,transparent_1px),linear-gradient(90deg,#063524_1px,transparent_1px)] [background-size:26px_26px]" />
      {activeStep === 0 ? (
        <div className="relative mt-16 space-y-5">
          {["Price efficiency", "Delivery reliability", "Stock availability", "Quality certification"].map((item, index) => (
            <div key={item} className="flex items-center justify-between border-b border-ofora-deep/15 pb-4">
              <span className="font-black text-ofora-deep">{item}</span>
              <span className="h-2 bg-ofora-green" style={{ width: `${42 + index * 24}px` }} />
            </div>
          ))}
        </div>
      ) : null}
      {activeStep === 1 ? (
        <div className="relative mx-auto mt-16 max-w-xs border border-ofora-deep/20 bg-white p-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-ofora-muted">Policy locked</p>
          <div className="mt-8 flex h-28 w-28 items-center justify-center rounded-full border-[14px] border-ofora-green/20 bg-[#E7F5B8]">
            <span className="h-12 w-12 rounded-full border-[10px] border-ofora-green" />
          </div>
        </div>
      ) : null}
      {activeStep === 2 ? (
        <div className="relative mt-12 h-80">
          {[0, 1, 2].map((item) => (
            <div key={item} className="absolute h-60 w-44 border border-ofora-deep/15 bg-white p-4 shadow-sm" style={{ left: `${item * 74}px`, top: `${item * 36}px`, transform: `rotate(${item * 5 - 6}deg)` }}>
              <span className="block h-3 w-24 bg-ofora-deep/20" />
              <span className="mt-8 block h-5 w-32 bg-ofora-green" />
              <span className="mt-4 block h-5 w-24 bg-ofora-green" />
            </div>
          ))}
        </div>
      ) : null}
      {activeStep === 3 ? (
        <div className="relative mx-auto mt-12 max-w-xs bg-white p-6 shadow-panel">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-ofora-green">Fair Award Receipt</p>
          <p className="mt-6 text-5xl font-black leading-none tracking-[-0.07em] text-ofora-deep">VALIDATED</p>
          <div className="mt-10 flex h-28 w-28 items-center justify-center rounded-full bg-ofora-mist">
            <span className="h-16 w-16 rotate-45 border-[12px] border-ofora-green" />
          </div>
        </div>
      ) : null}
      {activeStep === 4 ? (
        <div className="relative mt-16 space-y-5">
          {["Tender created", "Policy locked", "Evaluation completed", "Award validated"].map((item) => (
            <div key={item} className="grid grid-cols-[1rem_1fr] items-center gap-4">
              <span className="h-3 w-3 rounded-full bg-ofora-green" />
              <span className="border-b border-ofora-deep/15 pb-3 font-black text-ofora-deep">{item}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
