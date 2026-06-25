"use client";

import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { useGsapContext } from "@/hooks/use-gsap-context";

const rows = [
  ["Government contracts", "Create procurement processes that can stand up to regulator, auditor, supplier, and public scrutiny."],
  ["Infrastructure sourcing", "Keep high-value materials, delivery, and capability decisions aligned with locked criteria."],
  ["Development programs", "Give funders a defensible record without exposing sensitive commercial data."],
  ["Emergency response", "Move quickly without turning urgency into an excuse for unverifiable awards."],
  ["Global supplier selection", "Compare suppliers across markets while preserving confidentiality and procedural integrity."],
  ["Enterprise purchasing", "Make internal sourcing decisions easier to defend across finance, legal, and compliance teams."]
];

export function UseCases() {
  const sectionRef = useRef<HTMLElement>(null);
  const [openRow, setOpenRow] = useState<string | null>(rows[0][0]);

  useGsapContext(sectionRef, (_, reducedMotion) => {
    if (reducedMotion) return;

    gsap.from(".use-row", {
      y: 28,
      autoAlpha: 0,
      duration: 0.65,
      stagger: 0.08,
      ease: "power3.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 72%",
        once: true
      }
    });

    gsap.from(".use-divider", {
      scaleX: 0,
      transformOrigin: "left center",
      duration: 0.5,
      stagger: 0.06,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 72%",
        once: true
      }
    });
  });

  return (
    <section ref={sectionRef} className="bg-white px-5 py-20 lg:px-8 lg:py-28" id="solutions">
      <div className="mx-auto max-w-7xl">
        <h2 className="max-w-4xl text-[clamp(3.2rem,7vw,8rem)] font-black leading-[0.86] tracking-[-0.075em] text-ofora-deep">
          BUILT FOR
          <br />
          HIGH-STAKES PROCUREMENT.
        </h2>
        <div className="mt-14 border-t border-ofora-deep/15">
          {rows.map(([title, copy]) => (
            <article
              key={title}
              className={`use-row group relative grid gap-3 overflow-hidden border-b border-ofora-deep/15 py-7 transition duration-300 hover:bg-[#E7F5B8] hover:px-5 sm:grid-cols-[0.75fr_1fr_auto] sm:items-center ${openRow && openRow !== title ? "lg:opacity-55" : ""}`}
            >
              <span className="use-divider absolute bottom-0 left-0 h-px w-full bg-ofora-deep/20" />
              <button
                type="button"
                onClick={() => setOpenRow(openRow === title ? null : title)}
                className="ofora-focus text-left text-3xl font-black tracking-[-0.055em] text-ofora-deep sm:text-5xl"
                aria-expanded={openRow === title}
              >
                {title}
              </button>
              <p className={`overflow-hidden text-base leading-7 text-ofora-ink/78 transition-all duration-300 group-hover:max-h-32 group-hover:translate-x-0 group-hover:opacity-100 sm:max-h-none sm:opacity-100 ${openRow === title ? "max-h-40 opacity-100" : "max-h-0 opacity-0 sm:max-h-none"}`}>
                {copy}
              </p>
              <ArrowRight className={`h-6 w-6 text-ofora-green transition duration-300 group-hover:translate-x-1 ${openRow === title ? "rotate-90 sm:rotate-0" : ""}`} aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
