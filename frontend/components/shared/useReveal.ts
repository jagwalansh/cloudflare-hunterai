"use client";
import { useState, useCallback } from "react";

export function useReveal(delay = 0) {
  const [visible, setVisible] = useState(false);

  const ref = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisible(true);
            }, delay);
            obs.disconnect();
          }
        },
        { threshold: 0.05 } // Low threshold for reliability
      );
      obs.observe(node);
    }
  }, [delay]);

  return { ref, visible };
}
