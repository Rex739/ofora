"use client";

import { MouseEvent, useRef } from "react";
import { OforaMark } from "@/components/landing/ofora-mark";
import { clamp } from "@/lib/motion-utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function FairAwardReceiptObject() {
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const handlePointerMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current || !window.matchMedia("(hover: hover)").matches) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const rotateX = clamp(y * -4, -4, 4);
    const rotateY = clamp(x * 5, -5, 5);

    cardRef.current.style.setProperty("--receipt-tilt-x", `${rotateX}deg`);
    cardRef.current.style.setProperty("--receipt-tilt-y", `${rotateY}deg`);
    cardRef.current.style.setProperty("--receipt-light-x", `${50 + x * 35}%`);
    cardRef.current.style.setProperty("--receipt-light-y", `${50 + y * 35}%`);
  };

  const resetPointer = () => {
    if (!cardRef.current) return;

    cardRef.current.style.setProperty("--receipt-tilt-x", "0deg");
    cardRef.current.style.setProperty("--receipt-tilt-y", "0deg");
    cardRef.current.style.setProperty("--receipt-light-x", "50%");
    cardRef.current.style.setProperty("--receipt-light-y", "50%");
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handlePointerMove}
      onMouseLeave={resetPointer}
      className="group relative mx-auto aspect-[0.74] w-full max-w-[250px] rotate-[-5deg] rounded-[1.35rem] border border-ofora-deep/10 bg-white p-5 shadow-[0_30px_90px_rgba(6,53,36,0.28)] transition duration-500 [transform:rotate(-5deg)_perspective(900px)_rotateX(var(--receipt-tilt-x,0deg))_rotateY(var(--receipt-tilt-y,0deg))] hover:-translate-y-1 hover:shadow-[0_36px_100px_rgba(6,53,36,0.32)] min-[360px]:max-w-[300px] min-[390px]:max-w-[340px] min-[380px]:p-6 md:max-w-[420px] sm:p-8"
    >
      <div className="absolute inset-0 rounded-[1.35rem] opacity-[0.08] [background-image:linear-gradient(#063524_1px,transparent_1px),linear-gradient(90deg,#063524_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="pointer-events-none absolute inset-0 rounded-[1.35rem] opacity-0 transition-opacity duration-300 [background:radial-gradient(circle_at_var(--receipt-light-x,50%)_var(--receipt-light-y,50%),rgba(255,255,255,0.8),transparent_42%)] group-hover:opacity-80" />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <OforaMark className="h-8 w-8" />
          <span className="text-lg font-black tracking-[-0.04em] text-ofora-deep">Ofora</span>
        </div>
        <span className="rounded-full bg-[#E7F5B8] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-ofora-deep">
          Payment ready
        </span>
      </div>
      <div className="relative mt-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-ofora-green">Fair Award Receipt</p>
        <h2 className="award-indicator mt-3 text-5xl font-black leading-[0.9] tracking-[-0.07em] text-ofora-deep sm:text-6xl">
          AWARD
          <br />
          VALIDATED
        </h2>
      </div>
      <div className="relative my-8 h-px bg-ofora-deep/15" />
      <dl className="relative grid gap-3 text-sm">
        <ReceiptRow label="Tender ID" value="OFR-2026-041" />
        <ReceiptRow label="Awarded supplier" value="Nova Relief Systems" />
        <ReceiptRow label="Award status" value="Validated" />
        <ReceiptRow label="Policy integrity" value="Confirmed" />
      </dl>
      <div className="relative mt-9 flex items-end justify-between">
        <div className="grid gap-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-ofora-muted">
          <span>Policy version 1.0</span>
          <span>FAR-OFR-2026-041-001</span>
        </div>
        <div className="receipt-seal relative flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-ofora-green/15 bg-ofora-mist transition-transform duration-300 group-hover:scale-[1.035]">
          <span className="absolute h-[2px] w-20 rotate-[-28deg] bg-ofora-verify" />
          <span className="absolute h-16 w-16 rounded-full border-[12px] border-ofora-green" />
        </div>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-ofora-deep/10 pb-3">
      <dt className="text-ofora-muted">{label}</dt>
      <dd className="font-bold text-ofora-ink">{value}</dd>
    </div>
  );
}
