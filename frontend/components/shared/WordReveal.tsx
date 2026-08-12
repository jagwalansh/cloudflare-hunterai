"use client";
import { useEffect, useRef, useState } from "react";

export function WordReveal({ text, delay = 0 }: { text: string; delay?: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  const words = text.split(" ");

  return (
    <span ref={ref}>
      {words.map((word, i) => (
        <span key={i} style={{ display: "inline-block", marginRight: "0.25em" }}>
          <span
            style={{
              display: "inline-block",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
              transition: `opacity 0.45s cubic-bezier(0.22,1,0.36,1) ${i * 40}ms, transform 0.45s cubic-bezier(0.22,1,0.36,1) ${i * 40}ms`,
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}
