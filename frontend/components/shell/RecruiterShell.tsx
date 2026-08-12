"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, Briefcase, Users, LogOut, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";

const RECRUITER_NAV = [
  { href: "/recruiter/dashboard", label: "Dashboard",   icon: LayoutDashboard },
  { href: "/recruiter/post-job",  label: "Post Job",    icon: PlusCircle },
  { href: "/recruiter/listings",  label: "My Listings", icon: Briefcase },
  { href: "/recruiter/candidates", label: "Candidates", icon: Users },
];

export function RecruiterShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut, setUserRole } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [menuOpen]);

  const initials = user?.username
    ? user.username.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "??";

  return (
    <div className="app-shell">
      {/* Collapsible Recruiter Sidebar */}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`} style={{ background: "rgba(20, 25, 35, 0.95)" }}>
        <div className="sidebar-header">
          <Link href="/recruiter/dashboard" className="sidebar-brand" style={{ textDecoration: "none" }}>
            <div className="logo-badge" style={{ background: "linear-gradient(135deg, #10B981, #0D9488)" }}>R</div>
            {!collapsed && (
              <div className="brand-text">
                <p className="brand-name">Hunter AI</p>
                <p className="brand-sub" style={{ color: "#10B981", fontWeight: 600 }}>Recruiter Portal</p>
              </div>
            )}
          </Link>
          <button onClick={toggleCollapse} className="collapse-btn" title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {RECRUITER_NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/recruiter/dashboard" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} className={`nav-item ${active ? "active" : ""}`} title={collapsed ? label : undefined}>
                <Icon size={18} style={{ opacity: active ? 1 : 0.65, flexShrink: 0 }} />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer" ref={dropdownRef} style={{ position: "relative", marginTop: "auto", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.08)", zIndex: 60 }}>
          {user && !user.isGuest ? (
            <>
              {menuOpen && (
                <div style={{
                  position: "absolute",
                  bottom: collapsed ? "0" : "120%",
                  left: collapsed ? "110%" : "0",
                  width: "220px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "16px",
                  padding: "16px",
                  boxShadow: "0 16px 36px rgba(12, 22, 24, 0.2)",
                  zIndex: 100,
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}>
                  {/* Sign Out */}
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      signOut();
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "10px",
                      background: "var(--rose-soft, #FFF0F2)",
                      color: "var(--rose, #E63946)",
                      border: "1px solid var(--rose-border, #FFD2D7)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      width: "100%",
                      transition: "all 0.2s"
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}

              {/* Profile Card */}
              <div
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: collapsed ? "0" : "8px 12px",
                  borderRadius: "16px",
                  background: menuOpen ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "all 0.2s ease",
                  justifyContent: collapsed ? "center" : "flex-start",
                  width: collapsed ? "40px" : "100%",
                  height: "40px",
                  margin: collapsed ? "0 auto" : "0"
                }}
              >
                <div style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #10B981, #0D9488)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {initials}
                </div>
                {!collapsed && (
                  <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", flex: 1 }}>
                    <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.username || "Recruiter"}
                    </span>
                    <span style={{ fontSize: "10.5px", color: "#10B981", fontWeight: 500 }}>
                      Recruiter
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: collapsed ? "0" : "10px 16px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                justifyContent: "center",
                width: collapsed ? "40px" : "100%",
                height: "40px"
              }}
            >
              <LogOut size={16} style={{ transform: "rotate(180deg)", flexShrink: 0 }} />
              {!collapsed && <span>Sign In</span>}
            </button>
          )}
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        <main className="page-content">
          <div style={{ maxWidth: "1000px", width: "100%", margin: "0 auto" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
