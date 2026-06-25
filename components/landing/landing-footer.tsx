"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGsapContext } from "@/hooks/use-gsap-context";

const columns = [
  ["Product", ["Overview", "Tenders", "Award validation", "Audit records"]],
  ["Solutions", ["Governments", "Enterprises", "Development organizations", "Infrastructure"]],
  ["Company", ["About", "Contact", "Privacy", "Terms"]]
];

export function LandingFooter() {
  const footerRef = useRef<HTMLElement>(null);

  useGsapContext(footerRef, (_, reducedMotion) => {
    if (reducedMotion) return;

    gsap.timeline({
      scrollTrigger: {
        trigger: footerRef.current,
        start: "top 88%",
        once: true
      }
    })
      .from(".footer-line", { scaleX: 0, transformOrigin: "left center", duration: 0.55, ease: "power2.out" })
      .from(".footer-column", { autoAlpha: 0, y: 12, duration: 0.35, stagger: 0.08, ease: "power2.out" }, "-=0.2");
  });

  return (
    <footer ref={footerRef} className="bg-white px-5 py-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-3">
          {columns.map(([title, items]) => (
            <div key={title as string} className="footer-column">
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-ofora-deep">{title as string}</h2>
              <ul className="mt-5 grid gap-3 text-sm font-medium text-ofora-muted">
                {(items as string[]).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-line mt-14 border-t border-ofora-deep/15 pt-6 text-sm text-ofora-muted">
          © 2026 Ofora. Procurement decisions built to withstand scrutiny.
        </div>
      </div>
    </footer>
  );
}
