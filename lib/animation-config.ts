import type Lenis from "lenis";

export const ease = {
  editorial: "power3.out",
  calm: "power2.out",
  precise: "power1.inOut"
};

export const durations = {
  quick: 0.22,
  base: 0.55,
  slow: 0.85
};

export const revealConfig = {
  y: 32,
  autoAlpha: 0,
  duration: durations.slow,
  ease: ease.editorial,
  stagger: 0.08
};

export const lenisConfig = {
  duration: 1.05,
  easing: (time: number) => Math.min(1, 1.001 - Math.pow(2, -10 * time)),
  smoothWheel: true,
  wheelMultiplier: 0.9,
  touchMultiplier: 1
} satisfies ConstructorParameters<typeof Lenis>[0];
