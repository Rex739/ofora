"use client";

import { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsapContext } from "@/hooks/use-gsap-context";
import { revealConfig } from "@/lib/animation-config";

gsap.registerPlugin(ScrollTrigger);

export function useGsapReveal<T extends HTMLElement>(scope: RefObject<T | null>, selector = "[data-reveal]") {
  useGsapContext(scope, (_, reducedMotion) => {
    if (reducedMotion) return;

    gsap.from(selector, {
      ...revealConfig,
      scrollTrigger: {
        trigger: scope.current,
        start: "top 78%",
        once: true
      }
    });
  });
}
