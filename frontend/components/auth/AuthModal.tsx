"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthProvider";
import { X, Mail, Lock, User } from "lucide-react";
import dynamic from "next/dynamic";

const Beams = dynamic(() => import("./Beams"), { ssr: false });

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { authError, authLoading, signIn, signUp, setAuthError, signInWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [selectedRole, setSelectedRole] = useState<"candidate" | "recruiter">("candidate");
  const [isClosing, setIsClosing] = useState(false);
  const [isFormTransitioning, setIsFormTransitioning] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      setIsClosing(false);
      if (!dialog.open) {
        dialog.showModal();
      }
      setTimeout(() => {
        setAuthError("");
        setEmail("");
        setPassword("");
        setUsername("");
        setSelectedRole("candidate");
      }, 0);
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen, setAuthError]);

  // Intercept the browser Esc key press to trigger the fade-out exit animation
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      handleClose();
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
    };
  }, [onClose]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 450); // Match slower exit animation duration (450ms)
  };

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (dialog && e.target === dialog) {
      handleClose();
    }
  };

  const handleToggleMode = () => {
    setIsFormTransitioning(true);
    setTimeout(() => {
      setIsSignUp(!isSignUp);
      setAuthError("");
      setIsFormTransitioning(false);
    }, 300); // Slower toggle fade-out delay (300ms)
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success = false;
    if (isSignUp) {
      success = await signUp(email, password, username, selectedRole);
    } else {
      success = await signIn(email, password);
    }
    if (success) {
      handleClose();
    }
  };


  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      className={isClosing ? "closing" : ""}
      style={{
        margin: 0,
        border: "none",
        background: "transparent",
        padding: 0,
        outline: "none",
        zIndex: 100,
        overflow: "visible",
      }}
    >
      <div
        className="auth-modal-content"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-strong)",
          borderRadius: "20px",
          boxShadow: "0 24px 64px rgba(12, 22, 24, 0.16)",
          color: "var(--text-primary)",
          position: "relative",
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          overflow: "hidden",
          width: "100%",
          minHeight: "500px",
        }}
      >
        {/* Left Pane - Form & OAuth */}
        <div
          style={{
            padding: "44px 32px 32px 32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "none",
              border: "none",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-muted)",
              transition: "all 0.2s",
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "none";
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            }}
          >
            <X size={15} />
          </button>

          {/* Animating wrapper for the form tab switch transitions */}
          <div
            style={{
              transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
              opacity: isFormTransitioning ? 0 : 1,
              transform: isFormTransitioning ? "translateY(5px) scale(0.995)" : "translateY(0) scale(1)",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            {/* Header */}
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: "4px" }}>
                {isSignUp ? "Create your account" : "Log into your account"}
              </h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-muted)" }}>
                {isSignUp ? "Sign up to access your career dashboard" : "Enter your credentials to continue"}
              </p>
            </div>

            {/* Form (Manual Inputs + Primary Submit Button) */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {isSignUp && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>I am a...</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <button
                        type="button"
                        onClick={() => setSelectedRole("candidate")}
                        style={{
                          padding: "10px",
                          borderRadius: "10px",
                          border: selectedRole === "candidate" ? "2px solid var(--accent)" : "1px solid var(--border-strong)",
                          background: selectedRole === "candidate" ? "var(--bg-elevated)" : "var(--bg-base)",
                          color: "var(--text-primary)",
                          fontWeight: 600,
                          fontSize: "12.5px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          textAlign: "center"
                        }}
                      >
                        🎯 Candidate
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRole("recruiter")}
                        style={{
                          padding: "10px",
                          borderRadius: "10px",
                          border: selectedRole === "recruiter" ? "2px solid var(--accent)" : "1px solid var(--border-strong)",
                          background: selectedRole === "recruiter" ? "var(--bg-elevated)" : "var(--bg-base)",
                          color: "var(--text-primary)",
                          fontWeight: 600,
                          fontSize: "12.5px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          textAlign: "center"
                        }}
                      >
                        💼 Recruiter
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>Username</label>
                    <div style={{ position: "relative" }}>
                      <User size={15} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", opacity: 0.7 }} />
                      <input
                        type="text"
                        required
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input-base"
                        style={{ paddingLeft: "36px", height: "42px", borderRadius: "10px", border: "1px solid var(--border-strong)" }}
                      />
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>Email Address</label>
                <div style={{ position: "relative" }}>
                  <Mail size={15} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", opacity: 0.7 }} />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-base"
                    style={{ paddingLeft: "36px", height: "42px", borderRadius: "10px", border: "1px solid var(--border-strong)" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={15} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", opacity: 0.7 }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-base"
                    style={{ paddingLeft: "36px", height: "42px", borderRadius: "10px", border: "1px solid var(--border-strong)" }}
                  />
                </div>
              </div>

              {authError && (
                <p style={{ color: "var(--rose)", fontSize: "12px", textAlign: "center", lineHeight: 1.4, margin: "2px 0" }}>
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="btn-primary"
                style={{
                  padding: "12px",
                  marginTop: "4px",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  borderRadius: "10px",
                  background: "var(--text-primary)",
                  color: "var(--bg-surface)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {authLoading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "2px 0" }}>
              <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>or</span>
              <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={async () => {
                await signInWithGoogle();
                handleClose();
              }}
              disabled={authLoading}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "12px",
                borderRadius: "10px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-strong)",
                color: "var(--text-primary)",
                fontSize: "13.5px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span>{isSignUp ? "Sign up with Google" : "Login with Google"}</span>
            </button>

            {/* Toggle Link */}
            <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "2px" }}>
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={handleToggleMode}
                style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 600, cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: "3px" }}
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>

        {/* Right Pane - Dynamic Interactive Three.js Beams Background */}
        <div
          className="auth-modal-right"
          style={{
            background: "#000000", // Solid black background suited for three.js Beams
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            transition: "opacity 0.15s ease-out, transform 0.15s ease-out",
            opacity: isFormTransitioning ? 0.7 : 1,
            transform: isFormTransitioning ? "scale(0.995)" : "scale(1)",
          }}
        >
          {/* Beams animation canvas overlay */}
          <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
            <Beams
              beamWidth={3}
              beamHeight={30}
              beamNumber={20}
              lightColor="#ffffff"
              speed={2}
              noiseIntensity={1.75}
              scale={0.2}
              rotation={30}
            />
          </div>

          {/* Logo overlay on top of the beams */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              padding: "24px",
              pointerEvents: "none", // Allow clicks to pass through to canvas
            }}
          >
            <div style={{ color: "white", fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, letterSpacing: "-0.01em", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              Hunter<span style={{ color: "#6A9E9E" }}>AI</span>
            </div>
            <div style={{ color: "rgba(255, 255, 255, 0.4)", fontFamily: "var(--font-body)", fontSize: "11px", maxWidth: "200px", lineHeight: 1.4 }}>
              Interactive matching engine & real-time career intelligence.
            </div>
          </div>
        </div>
      </div>

      <style>{`
        dialog::backdrop {
          background-color: rgba(12, 22, 24, 0.35);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          opacity: 0;
          animation: backdropFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        dialog.closing::backdrop {
          animation: backdropFadeOut 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
        }

        dialog[open] {
          position: fixed;
          top: 50%;
          left: 50%;
          max-width: 800px;
          width: 90%;
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.96);
          animation: dialogFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        dialog.closing {
          animation: dialogFadeOut 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
        }

        @keyframes dialogFadeIn {
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes dialogFadeOut {
          from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          to {
            opacity: 0;
            transform: translate(-50%, -46%) scale(0.96);
          }
        }

        @keyframes backdropFadeIn {
          to {
            opacity: 1;
          }
        }

        @keyframes backdropFadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @media (max-width: 767px) {
          .auth-modal-content {
            grid-template-columns: 1fr !important;
            min-height: 440px !important;
          }
          .auth-modal-right {
            display: none !important;
          }
          dialog[open] {
            max-width: 400px !important;
          }
        }
      `}</style>
    </dialog>
  );
}
