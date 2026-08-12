"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, Sparkles, Upload, LogOut, Bookmark, Bot, FileEdit, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";

const NAV = [
  { href: "/dashboard", label: "Dashboard",       icon: LayoutDashboard },
  { href: "/upload",    label: "Upload",          icon: Upload },
  { href: "/recommendations", label: "Matches", icon: Sparkles },
  { href: "/bookmarks", label: "Saved",           icon: Bookmark },
  { href: "/chat",      label: "AI Chat",         icon: Bot },
  { href: "/resume-builder", label: "Resume Builder", icon: FileEdit },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut, updateProfile, setUserRole } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);

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
    if (user?.username) {
      setNameInput(user.username);
    }
  }, [user]);

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

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setSaveStatus("saving");
    const success = await updateProfile(nameInput.trim());
    if (success) {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1500);
    } else {
      setSaveStatus("idle");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const initials = user?.username
    ? user.username.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "??";

  return (
    <div className="app-shell">
      {/* Collapsible Text/Icon Sidebar */}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <Link href="/" className="sidebar-brand" style={{ textDecoration: "none" }}>
            <div className="logo-badge">H</div>
            {!collapsed && (
              <div className="brand-text">
                <p className="brand-name">Hunter AI</p>
                <p className="brand-sub">skill assets</p>
              </div>
            )}
          </Link>
          <button onClick={toggleCollapse} className="collapse-btn" title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} className={`nav-item ${active ? "active" : ""}`} title={collapsed ? label : undefined}>
                <Icon size={18} style={{ opacity: active ? 1 : 0.65, flexShrink: 0 }} />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Account Option shifted to Sidebar Footer */}
        <div className="sidebar-footer" ref={dropdownRef} style={{ position: "relative", marginTop: "auto", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.08)", zIndex: 60 }}>
          {user && !user.isGuest ? (
            <>
              {/* Dropdown Menu */}
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
                  gap: "14px"
                }}>
                  {/* Name Editing Section */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        style={{
                          flex: 1,
                          height: "32px",
                          borderRadius: "8px",
                          border: "1px solid var(--border)",
                          background: "var(--bg-base)",
                          color: "var(--text-primary)",
                          padding: "0 8px",
                          fontSize: "12.5px",
                          outline: "none"
                        }}
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={saveStatus === "saving"}
                        className="dashboard-btn-primary"
                        style={{
                          padding: "0 10px",
                          borderRadius: "8px",
                          fontSize: "11px",
                          fontWeight: 600,
                          height: "32px"
                        }}
                      >
                        {saveStatus === "saving" ? "..." : saveStatus === "saved" ? "✓" : "Save"}
                      </button>
                    </div>
                  </div>

                  {/* User ID Section */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>User ID</span>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "var(--bg-elevated)",
                      borderRadius: "8px",
                      padding: "6px 8px",
                      border: "1px solid var(--border)"
                    }}>
                      <span style={{
                        fontSize: "11px",
                        fontFamily: "monospace",
                        color: "var(--text-secondary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "130px"
                      }}>
                        {user.id}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(user.id);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "10px",
                          color: copied ? "var(--accent)" : "var(--text-muted)",
                          padding: 0
                        }}
                      >
                        {copied ? "copied" : "copy"}
                      </button>
                    </div>
                  </div>

                  <div style={{ height: "1px", background: "var(--border)" }} />

                  {/* Sign Out Button */}
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
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--rose)";
                      (e.currentTarget as HTMLElement).style.color = "white";
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--rose)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--rose-soft, #FFF0F2)";
                      (e.currentTarget as HTMLElement).style.color = "var(--rose, #E63946)";
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--rose-border, #FFD2D7)";
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}

              {/* Profile Card / Trigger */}
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
                onMouseEnter={(e) => {
                  if (!menuOpen) (e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.08)";
                }}
                onMouseLeave={(e) => {
                  if (!menuOpen) (e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.05)";
                }}
              >
                <div style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--text-primary), var(--text-muted))",
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
                    <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>
                      {user.username || "User"}
                    </span>
                    <span style={{ fontSize: "10.5px", color: "rgba(255, 255, 255, 0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "2px" }}>
                      {user.email}
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
                transition: "all 0.2s",
                justifyContent: "center",
                width: collapsed ? "40px" : "100%",
                height: "40px",
                margin: collapsed ? "0 auto" : "0"
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.15)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255, 255, 255, 0.08)";
              }}
              title={collapsed ? "Sign In" : undefined}
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
        {/* Scrollable Page Content */}
        <main className="page-content">
          <div style={{ maxWidth: "1000px", width: "100%", margin: "0 auto" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
