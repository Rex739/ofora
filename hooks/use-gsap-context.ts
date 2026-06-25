"use client";

import { RefObject, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

export function useGsapContext<T extends HTMLElement>(
  scope: RefObject<T | null>,
  setup: (context: gsap.Context, reducedMotion: boolean) => void | (() => void),
  dependencies: React.DependencyList = []
) {
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (!scope.current) return undefined;

    let cleanup: void | (() => void);
    const context = gsap.context((self) => {
      cleanup = setup(self, reducedMotion);
    }, scope);

    return () => {
      cleanup?.();
      context.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, reducedMotion, ...dependencies]);
}
