"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  UploadCloud,
  User,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/dashboard",       label: "Dashboard",       icon: LayoutDashboard },
  { href: "/upload",          label: "Upload Resume",   icon: UploadCloud },
  { href: "/recommendations", label: "Recommendations", icon: Sparkles },
];

// Inline styles typed as React.CSSProperties objects
const styles = {
  aside: (collapsed: boolean): React.CSSProperties => ({
    width: collapsed ? "64px" : "220px",
    minHeight: "100vh",
    background: "var(--cream, #f7f6f3)",
    borderRight: "0.5px solid #e8e6df",
    display: "flex",
    flexDirection: "column",
    transition: "width 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
    flexShrink: 0,
    position: "relative",
    zIndex: 10,
    overflowX: "hidden",
  }),

  logoArea: (collapsed: boolean): React.CSSProperties => ({
    padding: collapsed ? "0 18px" : "0 20px",
    borderBottom: "0.5px solid #e8e6df",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    height: "56px",
    overflow: "hidden",
    textDecoration: "none",
    flexShrink: 0,
    justifyContent: collapsed ? "center" : "flex-start",
  }),

  logoMark: (): React.CSSProperties => ({
    width: "26px",
    height: "26px",
    background: "#6c4fe0",
    borderRadius: "7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }),

  logoText: (): React.CSSProperties => ({
    fontFamily: "'Instrument Serif', Georgia, serif",
    fontWeight: 400,
    fontSize: "16px",
    color: "#18181a",
    whiteSpace: "nowrap",
    overflow: "hidden",
    letterSpacing: "-0.01em",
  }),

  nav: (): React.CSSProperties => ({
    flex: 1,
    padding: "16px 10px",
    display: "flex",
    flexDirection: "column",
    gap: "1px",
  }),

  navLink: (isActive: boolean, collapsed: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: collapsed ? "9px 0" : "8px 10px",
    borderRadius: "6px",
    textDecoration: "none",
    transition: "all 0.15s cubic-bezier(0.22, 1, 0.36, 1)",
    overflow: "hidden",
    justifyContent: collapsed ? "center" : "flex-start",
    position: "relative",
    // Active: left border accent, no background fill — just text color shift
    borderLeft: isActive ? "3px solid #6c4fe0" : "3px solid transparent",
    paddingLeft: isActive ? (collapsed ? undefined : "7px") : (collapsed ? undefined : "10px"),
    color: isActive ? "#18181a" : "#9a9a9a",
    background: "transparent",
  }),

  navIcon: (isActive: boolean): React.CSSProperties => ({
    color: isActive ? "#6c4fe0" : "#9a9a9a",
    flexShrink: 0,
    transition: "color 0.15s",
  }),

  navLabel: (isActive: boolean): React.CSSProperties => ({
    fontSize: "13.5px",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: isActive ? 500 : 400,
    color: isActive ? "#18181a" : "#9a9a9a",
    whiteSpace: "nowrap",
    transition: "color 0.15s",
  }),

  bottom: (): React.CSSProperties => ({
    padding: "12px 10px",
    borderTop: "0.5px solid #e8e6df",
    display: "flex",
    flexDirection: "column",
    gap: "1px",
  }),

  avatarRow: (collapsed: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: collapsed ? "8px 0" : "8px 10px",
    borderRadius: "6px",
    overflow: "hidden",
    justifyContent: collapsed ? "center" : "flex-start",
    cursor: "default",
  }),

  avatar: (): React.CSSProperties => ({
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6c4fe0 0%, #0d9488 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }),

  avatarInitials: (): React.CSSProperties => ({
    fontFamily: "'Instrument Serif', Georgia, serif",
    fontSize: "10px",
    color: "#fff",
    letterSpacing: "0.03em",
  }),

  avatarName: (): React.CSSProperties => ({
    fontSize: "12.5px",
    fontFamily: "'DM Sans', sans-serif",
    color: "#6b6b6b",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),

  collapseBtn: (collapsed: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: collapsed ? "8px 0" : "8px 10px",
    borderRadius: "6px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#b0b0b0",
    transition: "color 0.15s",
    width: "100%",
    justifyContent: collapsed ? "center" : "flex-start",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "12.5px",
  }),
};

// Small HunterAI logomark SVG — clean geometric H
function LogoMark() {
  return (
    <div style={styles.logoMark()}>
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M2 2v9M11 2v9M2 6.5h9" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  return (
    <aside style={styles.aside(collapsed)}>
      {/* Logo */}
      <Link href="/" style={styles.logoArea(collapsed)}>
        <LogoMark />
        {!collapsed && (
          <span style={styles.logoText()}>Hunter<em>AI</em></span>
        )}
      </Link>

      {/* Nav items */}
      <nav style={styles.nav()}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== "/" && pathname.startsWith(href));
          const isHovered = hoveredHref === href;

          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              style={{
                ...styles.navLink(isActive, collapsed),
                background: isHovered && !isActive ? "#efefeb" : "transparent",
              }}
              onMouseEnter={() => setHoveredHref(href)}
              onMouseLeave={() => setHoveredHref(null)}
            >
              <Icon
                size={15}
                style={styles.navIcon(isActive)}
              />
              {!collapsed && (
                <span style={styles.navLabel(isActive)}>{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: avatar + collapse */}
      <div style={styles.bottom()}>
        {/* Avatar row */}
        <div style={styles.avatarRow(collapsed)}>
          <div style={styles.avatar()}>
            <span style={styles.avatarInitials()}>SS</span>
          </div>
          {!collapsed && (
            <span style={styles.avatarName()}>Shaurya S.</span>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={styles.collapseBtn(collapsed)}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "#6b6b6b";
            (e.currentTarget as HTMLElement).style.background = "#efefeb";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "#b0b0b0";
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
