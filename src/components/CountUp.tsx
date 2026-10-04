import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

const easeOutCubic = (p: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, p)), 3);

/**
 * Animates from the previously displayed value to `target`.
 * - Starts from 0 on mount, so figures count up on every refresh and page change.
 * - On later changes it eases from the current on-screen value (no jump back to 0).
 * - Always lands exactly on `target`; respects prefers-reduced-motion.
 */
export function useCountUp(target: number, duration = 1100): number {
  const safe = Number.isFinite(target) ? target : 0;
  const reduced = prefersReducedMotion();
  const [value, setValue] = useState(reduced ? safe : 0);
  const current = useRef(reduced ? safe : 0);

  useEffect(() => {
    if (reduced) {
      current.current = safe;
      setValue(safe);
      return;
    }
    const from = current.current;
    if (from === safe) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      // rAF timestamps can precede `start` — clamp so the value never undershoots.
      const p = Math.min(1, Math.max(0, (now - start) / duration));
      const v = p >= 1 ? safe : from + (safe - from) * easeOutCubic(p);
      current.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [safe, duration, reduced]);

  return value;
}

export function CountUp({ value, format, duration, className }: { value: number; format: (v: number) => string; duration?: number; className?: string }) {
  const v = useCountUp(value, duration);
  return <span className={`num ${className ?? ''}`}>{format(v)}</span>;
}
