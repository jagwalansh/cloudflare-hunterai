import React from "react";

/**
 * PageHeader — the barely-there top bar described in the design spec.
 *
 * Rules from spec:
 * - Height: 56px
 * - Background: transparent (cream bleeds through from AppLayout)
 * - 0.5px bottom border in #e8e6df
 * - Left: page title in Instrument Serif (NOT DM Sans)
 * - Right: one optional subtle action button (passed via actionSlot prop)
 * - No breadcrumbs, no tabs, no cluttered toolbar
 *
 * Animates in on mount: fades down from -4px, 400ms, 0ms delay.
 */

interface PageHeaderProps {
  title: string;
  /** Optional single action element rendered on the right */
  actionSlot?: React.ReactNode;
  mobile?: boolean;
}

const styles = {
  header: (mobile?: boolean): React.CSSProperties => ({
    height: "56px",
    minHeight: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: mobile ? "0 16px" : "0 48px",
    borderBottom: "0.5px solid #e8e6df",
    background: "transparent",
    // Sticky so it stays visible while scrolling content
    position: "sticky",
    top: mobile ? "56px" : 0,
    zIndex: 20,
    // Cream background with very slight blur for legibility when content scrolls under
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    backgroundColor: "rgba(247, 246, 243, 0.88)",
    // Fade-in animation
    animation: "pageHeaderReveal 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
  }),

  title: (): React.CSSProperties => ({
    fontFamily: "'Instrument Serif', Georgia, serif",
    fontSize: "17px",
    fontWeight: 400,
    color: "#18181a",
    letterSpacing: "-0.01em",
    margin: 0,
    padding: 0,
    lineHeight: 1,
  }),

  actionWrapper: (): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
  }),
};

// Keyframe injected once into the document head
const KEYFRAME_ID = "hunter-page-header-kf";

function injectKeyframe() {
  if (typeof document === "undefined") return;
  if (document.getElementById(KEYFRAME_ID)) return;
  const style = document.createElement("style");
  style.id = KEYFRAME_ID;
  style.textContent = `
    @keyframes pageHeaderReveal {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

if (typeof window !== "undefined") {
  injectKeyframe();
}

/**
 * Standalone ghost-pill action button that matches the design system.
 * Use this inside actionSlot when you need the single top-right CTA.
 */
export function PageHeaderAction({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: "20px",
        border: "0.5px solid #e8e6df",
        background: "#ffffff",
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "12.5px",
        fontWeight: 500,
        color: "#18181a",
        letterSpacing: "0.01em",
        transition: "all 0.15s cubic-bezier(0.22, 1, 0.36, 1)",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = "#18181a";
        el.style.color = "#ffffff";
        el.style.borderColor = "#18181a";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.background = "#ffffff";
        el.style.color = "#18181a";
        el.style.borderColor = "#e8e6df";
      }}
    >
      {children}
    </button>
  );
}

export function PageHeader({ title, actionSlot, mobile }: PageHeaderProps) {
  return (
    <header style={styles.header(mobile)}>
      <h1 style={styles.title()}>{title}</h1>
      {actionSlot && (
        <div style={styles.actionWrapper()}>{actionSlot}</div>
      )}
    </header>
  );
}
