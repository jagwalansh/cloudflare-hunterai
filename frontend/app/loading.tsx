"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Zap } from "lucide-react";
import { useEffect, useState } from "react";

const MESSAGES = [
  "RESOLVING MATCH VECTORS...",
  "ANALYZING CANDIDATE PROFILE...",
  "CALIBRATING RELEVANCE SCORE...",
  "LOADING RESULTS...",
];

export default function Loading() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const progress = useMotionValue(0);
  const width = useTransform(progress, [0, 100], ["0%", "100%"]);

  useEffect(() => {
    // Animate progress bar from 0 → 100 over 4s, then restart
    const runProgress = () => {
      progress.set(0);
      animate(progress, 100, {
        duration: 4,
        ease: "easeInOut",
        onComplete: runProgress,
      });
    };
    runProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cycle status messages with a fade
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, 300);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#0B0B0F",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {/* ── Ambient radial glow (purple) ── */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(134,74,249,0.18) 0%, transparent 70%)",
          filter: "blur(64px)",
          pointerEvents: "none",
        }}
      />

      {/* ── Subtle cyan accent glow ── */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.55, 0.3] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
        style={{
          position: "absolute",
          top: "55%",
          left: "54%",
          transform: "translate(-50%, -50%)",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,229,255,0.1) 0%, transparent 70%)",
          filter: "blur(48px)",
          pointerEvents: "none",
        }}
      />

      {/* ── Orbiting ring ── */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          width: 130,
          height: 130,
          borderRadius: "50%",
          border: "1px dashed rgba(134,74,249,0.2)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          width: 172,
          height: 172,
          borderRadius: "50%",
          border: "1px dashed rgba(0,229,255,0.1)",
          pointerEvents: "none",
        }}
      />

      {/* ── Main content ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo icon */}
        <motion.div
          animate={{
            scale: [1, 1.07, 1],
            rotate: [0, 4, -4, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: [0.45, 0, 0.55, 1], // custom cubic — very smooth
          }}
          style={{
            width: 68,
            height: 68,
            borderRadius: 20,
            background: "linear-gradient(140deg, #864AF9 0%, #00E5FF 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.08), 0 0 28px rgba(134,74,249,0.35), 0 0 64px rgba(134,74,249,0.12)",
          }}
        >
          {/* Inner shimmer ring */}
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              width: 68,
              height: 68,
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.15)",
              pointerEvents: "none",
            }}
          />
          <Zap size={28} color="white" strokeWidth={2.5} />
        </motion.div>

        {/* Brand + status text */}
        <div style={{ textAlign: "center" }}>
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontSize: 20,
              fontWeight: 700,
              color: "#F5F5F7",
              letterSpacing: "-0.03em",
              margin: 0,
              marginBottom: 8,
            }}
          >
            Hunter<span style={{ color: "#864AF9" }}>AI</span>
          </motion.h2>

          {/* Animated cycling message */}
          <motion.p
            animate={{ opacity: visible ? 0.55 : 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            style={{
              fontFamily: "ui-monospace, 'Fira Code', monospace",
              fontSize: 10.5,
              color: "#86868B",
              letterSpacing: "0.1em",
              margin: 0,
              height: 16,
            }}
          >
            {MESSAGES[msgIndex]}
          </motion.p>
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
          <div
            style={{
              width: 148,
              height: 3,
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 999,
              overflow: "hidden",
              border: "0.5px solid rgba(255,255,255,0.04)",
            }}
          >
            <motion.div
              style={{
                width,
                height: "100%",
                background: "linear-gradient(90deg, #864AF9, #00E5FF)",
                borderRadius: 999,
                transformOrigin: "left",
              }}
            />
          </div>

          {/* Percentage counter */}
          <ProgressPercent progress={progress} />
        </div>
      </div>
    </div>
  );
}

/** Reads the shared motion value and renders a percentage string */
function ProgressPercent({ progress }: { progress: ReturnType<typeof useMotionValue<number>> }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    return progress.on("change", (v) => setPct(Math.round(v)));
  }, [progress]);

  return (
    <span
      style={{
        fontFamily: "ui-monospace, 'Fira Code', monospace",
        fontSize: 10,
        color: "rgba(134,74,249,0.6)",
        letterSpacing: "0.08em",
      }}
    >
      {pct}%
    </span>
  );
}
