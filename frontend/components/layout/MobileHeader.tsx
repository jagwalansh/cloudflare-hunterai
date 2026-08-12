"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, LayoutDashboard, UploadCloud, User, Sparkles } from "lucide-react";

const navItems = [
  { href: "/dashboard",       label: "Dashboard",       icon: LayoutDashboard },
  { href: "/upload",          label: "Upload Resume",   icon: UploadCloud },
  { href: "/recommendations", label: "Recommendations", icon: Sparkles },
];

function LogoMark() {
  return (
    <div
      style={{
        width: "26px",
        height: "26px",
        background: "#6c4fe0",
        borderRadius: "7px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M2 2v9M11 2v9M2 6.5h9" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function MobileHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header
      style={{
        background: "rgba(247, 246, 243, 0.92)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderBottom: "0.5px solid #e8e6df",
        position: "sticky",
        top: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        height: "56px",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}
      >
        <LogoMark />
        <span
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontWeight: 400,
            fontSize: "16px",
            color: "#18181a",
            letterSpacing: "-0.01em",
          }}
        >
          Hunter<em>AI</em>
        </span>
      </Link>

      {/* Hamburger */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#6b6b6b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "6px",
          borderRadius: "6px",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "#efefeb";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        {open ? <X size={19} /> : <Menu size={19} />}
      </button>

      {/* Dropdown */}
      {open && (
        <nav
          style={{
            position: "absolute",
            top: "56px",
            left: 0,
            right: 0,
            background: "rgba(247, 246, 243, 0.97)",
            backdropFilter: "blur(12px)",
            borderBottom: "0.5px solid #e8e6df",
            padding: "8px 10px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "1px",
            animation: "mobileMenuReveal 0.2s cubic-bezier(0.22, 1, 0.36, 1) both",
          }}
        >
          <style>{`
            @keyframes mobileMenuReveal {
              from { opacity: 0; transform: translateY(-6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 12px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  background: "transparent",
                  color: isActive ? "#18181a" : "#9a9a9a",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: isActive ? 500 : 400,
                  fontSize: "14px",
                  // Active: left border accent
                  borderLeft: isActive ? "3px solid #6c4fe0" : "3px solid transparent",
                  paddingLeft: isActive ? "9px" : "12px",
                  transition: "all 0.15s",
                }}
              >
                <Icon
                  size={15}
                  style={{ color: isActive ? "#6c4fe0" : "#9a9a9a", flexShrink: 0 }}
                />
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
