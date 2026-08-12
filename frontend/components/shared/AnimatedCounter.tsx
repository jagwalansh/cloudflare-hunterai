"use client";
import { useEffect, useRef, useState } from "react";

export function AnimatedCounter({
  target,
  suffix = "",
  duration = 800,
  delay = 0,
  color,
}: {
  target: number;
  suffix?: string;
  duration?: number;
  delay?: number;
  color?: string;
}) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          setTimeout(() => {
            const start = performance.now();
            const tick = (now: number) => {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              // ease-out
              const eased = 1 - Math.pow(1 - progress, 3);
              setValue(Math.round(eased * target));
              if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }, delay);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration, delay]);

  return (
    <span ref={ref} style={{ color }}>
      {value}{suffix}
    </span>
  );
}
