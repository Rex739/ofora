"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { useGsapContext } from "@/hooks/use-gsap-context";

const suppliers = [
  {
    id: "atlas",
    name: "Atlas Supply Group",
    label: "AWARD BLOCKED",
    tone: "blocked",
    copy: "This supplier is eligible, but does not have the highest valid score under the locked evaluation policy.",
    details: [
      ["Status", "Not validated"],
      ["Policy integrity", "Preserved"],
      ["Recommended supplier", "Nova Relief Systems"]
    ]
  },
  {
    id: "nova",
    name: "Nova Relief Systems",
    label: "AWARD VALIDATED",
    tone: "valid",
    copy: "Nova Relief Systems has been independently confirmed as the highest-scoring eligible supplier.",
    details: [
      ["Fair Award Receipt", "Issued"],
      ["Policy integrity", "Confirmed"],
      ["Payment status", "Ready for controlled release"],
      ["Receipt ID", "FAR-OFR-2026-041-001"]
    ]
  },
  {
    id: "meridian",
    name: "Meridian Industrial Ltd.",
    label: "NOT ELIGIBLE",
    tone: "blocked",
    copy: "Delivery time exceeds the maximum 14-day requirement set in the locked policy.",
    details: [
      ["Status", "Not eligible"],
      ["Policy integrity", "Preserved"],
      ["Requirement", "Maximum 14-day delivery"]
    ]
  }
];

export function AwardValidationShowcase() {
  const [selectedId, setSelectedId] = useState("atlas");
  const [previousIndex, setPreviousIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const selected = suppliers.find((supplier) => supplier.id === selectedId) ?? suppliers[0];
  const selectedIndex = suppliers.findIndex((supplier) => supplier.id === selectedId);
  const isValid = selected.tone === "valid";
  const direction = selectedIndex >= previousIndex ? 1 : -1;

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
      .from(".award-heading-line", { yPercent: 105, autoAlpha: 0, duration: 0.72, stagger: 0.1, ease: "power3.out" })
      .from(".award-left", { x: -38, autoAlpha: 0, duration: 0.65, ease: "power3.out" }, "-=0.28")
      .from(".award-divider", { scaleY: 0, transformOrigin: "top center", duration: 0.65, ease: "power2.out" }, "-=0.4")
      .from(".award-right", { x: 38, autoAlpha: 0, duration: 0.65, ease: "power3.out" }, "-=0.58");
  });

  return (
    <section ref={sectionRef} className="bg-ofora-canvas px-5 py-20 lg:px-8 lg:py-28" id="award-validation">
      <div className="mx-auto max-w-7xl">
        <h2 className="max-w-5xl text-[clamp(3.2rem,7.2vw,8rem)] font-black leading-[0.86] tracking-[-0.075em] text-ofora-deep">
          <span className="block overflow-hidden pb-2">
            <span className="award-heading-line block">THE AWARD IS NOT JUST A DECISION.</span>
          </span>
          <span className="block overflow-hidden pb-2">
            <span className="award-heading-line block">IT IS A RECORD.</span>
          </span>
        </h2>
        <div className="relative mt-12 grid overflow-hidden border border-ofora-deep/15 bg-white lg:grid-cols-[0.9fr_1.1fr]">
          <span className="award-divider absolute bottom-0 left-[45%] top-0 z-20 hidden w-px bg-ofora-deep/15 lg:block" />
          <div className="award-left border-b border-ofora-deep/15 bg-ofora-deep p-5 text-white lg:border-b-0 lg:border-r lg:p-8">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#E7F5B8]">Supplier selection</p>
            <div className="mt-8 grid gap-3">
              {suppliers.map((supplier) => (
                <button
                  key={supplier.id}
                  type="button"
                  onClick={() => {
                    setPreviousIndex(selectedIndex);
                    setSelectedId(supplier.id);
                  }}
                  className={`ofora-focus group flex items-center justify-between border px-5 py-5 text-left transition ${
                    selectedId === supplier.id
                      ? "border-[#E7F5B8] bg-[#E7F5B8] text-ofora-deep"
                      : "border-white/15 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  <span className="text-xl font-black tracking-[-0.04em]">{supplier.name}</span>
                  <span className="h-3 w-3 rounded-full border border-current" />
                </button>
              ))}
            </div>
          </div>
          <div className="award-right relative min-h-[520px] p-6 sm:p-8 lg:p-12">
            <div className="absolute right-0 top-0 h-48 w-48 bg-[#E7F5B8]" />
            <AnimatePresence mode="wait">
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 22 * direction }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 * direction }}
                transition={{ duration: 0.24 }}
                className="relative z-10"
              >
                <motion.p
                  initial={{ clipPath: "inset(0 0 100% 0)" }}
                  animate={{ clipPath: "inset(0 0 0% 0)" }}
                  className={`text-sm font-black uppercase tracking-[0.22em] ${isValid ? "text-ofora-green" : "text-amber-800"}`}
                >
                  {selected.label}
                </motion.p>
                <h3 className="mt-5 max-w-2xl text-[clamp(2.8rem,6vw,6.6rem)] font-black leading-[0.86] tracking-[-0.075em] text-ofora-deep">
                  {selected.name}
                </h3>
                <p className="mt-7 max-w-xl text-lg leading-8 text-ofora-muted">{selected.copy}</p>
                <dl className="mt-10 grid gap-1">
                  {selected.details.map(([label, value]) => (
                    <motion.div
                      key={label}
                      className="relative grid gap-2 border-b border-ofora-deep/12 py-4 sm:grid-cols-[0.55fr_1fr]"
                    >
                      <dt className="text-xs font-black uppercase tracking-[0.18em] text-ofora-muted">{label}</dt>
                      <dd className="text-lg font-black tracking-[-0.03em] text-ofora-deep">{value}</dd>
                      <motion.span
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="absolute bottom-[-1px] left-0 h-px w-full origin-left bg-ofora-green"
                      />
                    </motion.div>
                  ))}
                </dl>
                {isValid ? (
                  <motion.div
                    initial={{ opacity: 0, y: 18, boxShadow: "0 0 0 rgba(32,166,106,0)" }}
                    animate={{ opacity: 1, y: 0, boxShadow: "0 0 42px rgba(32,166,106,0.18)" }}
                    transition={{ duration: 0.45, delay: 0.12 }}
                    className="mt-10 max-w-sm bg-ofora-deep p-5 text-[#E7F5B8]"
                  >
                    <p className="text-xs font-black uppercase tracking-[0.2em]">Fair Award Receipt</p>
                    <p className="mt-5 text-4xl font-black leading-none tracking-[-0.06em]">POLICY INTEGRITY CONFIRMED</p>
                    <motion.span
                      initial={{ rotate: -90, scale: 0.86 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ duration: 0.42, delay: 0.18 }}
                      className="mt-5 block h-14 w-14 rounded-full border-[10px] border-ofora-verify"
                    />
                  </motion.div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
