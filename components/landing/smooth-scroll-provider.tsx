"use client";

import { ReactNode, useEffect } from "react";
import { useLenis } from "@/hooks/use-lenis";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useLenis();

  useEffect(() => {
    const scrollToHashTarget = () => {
      const hash = window.location.hash;
      if (!hash) return;

      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;

      const scrollMarginTop = Number.parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - scrollMarginTop;
      window.scrollTo({ top: targetTop, behavior: "auto" });
    };

    const scheduleHashScroll = () => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(scrollToHashTarget);
      });
    };

    scheduleHashScroll();
    window.addEventListener("hashchange", scheduleHashScroll);

    return () => {
      window.removeEventListener("hashchange", scheduleHashScroll);
    };
  }, []);

  return <>{children}</>;
}
