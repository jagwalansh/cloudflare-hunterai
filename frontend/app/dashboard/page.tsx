"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { Profile, JobMatch } from "@/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell } from "recharts";
import {
  Filter,
  RefreshCw,
  ArrowRight,
  Bookmark,
  ExternalLink,
  AlertCircle,
  UploadCloud,
  X,
  Sparkles,
  CheckCircle2
} from "lucide-react";

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function maybeSetGuestToken(authUser?: { id: string; email: string; username: string; isGuest?: boolean } | null) {
  // P0-3 Fix: Only use mock token for guest workflow, do not override real session token
  if (authUser?.isGuest) {
    const id = typeof window !== "undefined" ? localStorage.getItem("guest_user_id") || "guest_123" : "guest_123";
    api.setToken(`mock_token:${id}:${id}@hunterai.local:Guest User`);
  }
}

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<JobMatch | null>(null);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDashboard = async (filters?: { keyword?: string; location?: string; remoteOnly?: boolean }) => {
    setError("");
    const isRefresh = Boolean(filters);
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      maybeSetGuestToken(user);
      const profiles = await api.getProfiles().catch(() => []);
      const selectedEmail = typeof window !== "undefined" ? localStorage.getItem("selectedProfileEmail") : null;
      const selectedProfile = profiles.find((item: Profile) => item.email === selectedEmail) || profiles.at(-1) || null;
      setProfile(selectedProfile);

      const emailToUse = selectedProfile?.email || user?.email || undefined;
      const [nextMatches, saved] = await Promise.all([
        api.getMatches(
          emailToUse,
          filters?.keyword?.trim() || undefined,
          filters?.location?.trim() || undefined,
          filters?.remoteOnly
        ).catch(() => []),
        api.getSavedInternships().catch(() => []),
      ]);

      setMatches(nextMatches || []);
      setSavedIds(new Set(saved.map((job: any) => job.id).filter((id: any): id is number => typeof id === "number")));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load dashboard";
      setError(`${message}. Make sure the HunterAI backend is running at http://127.0.0.1:8000.`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Invalid file format. Only PDF files (.pdf) are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    setError("");
    try {
      maybeSetGuestToken(user);
      const data = await api.uploadResume(file);
      if (data.profile?.email) {
        localStorage.setItem("selectedProfileEmail", data.profile.email);
      }
      await loadDashboard();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(`${message}. The backend parser must be running for resume upload.`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const toggleSave = async (match: JobMatch) => {
    if (!match.id) return;
    const next = new Set(savedIds);
    try {
      if (next.has(match.id)) {
        next.delete(match.id);
        setSavedIds(next);
        await api.unsaveInternship(match.id);
      } else {
        next.add(match.id);
        setSavedIds(next);
        await api.saveInternship(match.id);
      }
    } catch (err) {
      console.error("Failed to update saved status:", err);
      loadDashboard();
    }
  };

  // Calculations
  const displayName = user?.username || profile?.name || profile?.username || "Guest";
  const firstName = displayName === "Guest User" ? "Guest" : displayName.split(" ")[0];
  const skillsCount = profile?.skills?.length || 0;
  const projectsCount = profile?.projects?.length || 0;
  const expCount = profile?.experience?.length || 0;
  
  // Profile strength completion
  const completion = Math.min(
    100,
    Math.round(
      (skillsCount ? 35 : 0) +
      (projectsCount ? 30 : 0) +
      (expCount ? 25 : 0) +
      (profile?.email ? 10 : 0)
    )
  );

  const bestScore = matches.length ? Math.round(Math.max(...matches.map((m) => m.score || 0))) : 0;
  const avgScore = matches.length
    ? Math.round(matches.reduce((acc, m) => acc + (m.score || 0), 0) / matches.length)
    : 0;

  // Dynamic skill gaps aggregated from returned matches
  const missingSkillsMap = new Map<string, number>();
  matches.forEach((m) => {
    m.missing_skills?.forEach((sk) => {
      if (sk) {
        missingSkillsMap.set(sk, (missingSkillsMap.get(sk) || 0) + 1);
      }
    });
  });
  const aggregatedMissing = Array.from(missingSkillsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const hasUploadedProfile = Boolean(
    profile && (
      profile.email ||
      profile.name ||
      profile.username ||
      (profile.skills && profile.skills.length > 0) ||
      (profile.projects && profile.projects.length > 0) ||
      (profile.experience && profile.experience.length > 0)
    )
  );

  const missingSkills: [string, number][] = hasUploadedProfile
    ? (aggregatedMissing.length > 0 ? aggregatedMissing : [])
    : [];

  return (
    <div style={{ minHeight: "100vh", padding: "24px 0 60px" }}>
      {/* Hidden File Input for Resume Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />

      {/* Job Details Modal Overlay */}
      {selectedMatch && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
          onClick={() => setSelectedMatch(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "28px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    background: "var(--bg-base)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {selectedMatch.source || "Opportunity"}
                </span>
                <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", margin: "8px 0 4px" }}>
                  {selectedMatch.job_title}
                </h2>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}>
                  {[selectedMatch.company, selectedMatch.location, selectedMatch.duration].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMatch(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Score Banner */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(5,5,5,0.04) 0%, rgba(5,5,5,0.08) 100%)",
                borderRadius: "14px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0, fontWeight: 600 }}>
                  ATS Match Score
                </p>
                <p style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                  {Math.round(selectedMatch.score || 0)}%
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0, fontWeight: 600 }}>Stipend</p>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  {selectedMatch.stipend || "Negotiable"}
                </p>
              </div>
            </div>

            {/* Matched Skills */}
            {selectedMatch.matched_skills && selectedMatch.matched_skills.length > 0 && (
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: 700, margin: "0 0 8px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle2 size={15} style={{ color: "#16a34a" }} /> Matched Skills ({selectedMatch.matched_skills.length})
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {selectedMatch.matched_skills.map((sk) => (
                    <span
                      key={sk}
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        padding: "4px 10px",
                        borderRadius: "8px",
                        background: "#f0fdf4",
                        color: "#166534",
                        border: "1px solid #bbf7d0",
                      }}
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {selectedMatch.missing_skills && selectedMatch.missing_skills.length > 0 && (
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: 700, margin: "0 0 8px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <AlertCircle size={15} style={{ color: "#d97706" }} /> Missing Skills ({selectedMatch.missing_skills.length})
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {selectedMatch.missing_skills.map((sk) => (
                    <span
                      key={sk}
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        padding: "4px 10px",
                        borderRadius: "8px",
                        background: "#fffbeb",
                        color: "#92400e",
                        border: "1px solid #fde68a",
                      }}
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Assessment */}
            {selectedMatch.suitability_assessment && (
              <div style={{ background: "rgba(0,0,0,0.02)", padding: "14px", borderRadius: "12px", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                <p style={{ fontWeight: 700, margin: "0 0 4px", color: "var(--text-primary)" }}>Suitability Insight</p>
                {selectedMatch.suitability_assessment}
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              {selectedMatch.url && (
                <a
                  href={selectedMatch.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "12px",
                    background: "var(--text-primary)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "14px",
                    textAlign: "center",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  Apply Now <ExternalLink size={15} />
                </a>
              )}
              <a
                href={`/resume-builder`}
                style={{
                  padding: "12px 18px",
                  borderRadius: "12px",
                  background: "var(--bg-base)",
                  color: "var(--text-primary)",
                  fontWeight: 700,
                  fontSize: "14px",
                  textAlign: "center",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  border: "1px solid var(--border)",
                }}
              >
                <Sparkles size={15} /> Resume Builder
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Main Role Match Control Banner */}
        <div
          className="dashboard-panel"
          style={{
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "28px",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "var(--text-muted)",
                  marginBottom: "10px",
                }}
              >
                Role Match Control
              </p>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(28px, 4vw, 44px)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.05,
                  color: "var(--text-primary)",
                  margin: 0,
                  maxWidth: "650px",
                }}
              >
                {getTimeOfDay()}, {firstName}.
              </h1>
            </div>
          </div>

          {/* Error state if any */}
          {error && (
            <div className="dashboard-error" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Metric Stat Cards Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
            {[
              { label: "Jobs matched", value: String(matches.length), badge: "live" },
              { label: "Best fit", value: `${bestScore}%`, badge: "top" },
              { label: "Match strength", value: `${avgScore}%`, badge: "avg" },
              { label: "Skills parsed", value: String(skillsCount), badge: `${completion}%` },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "rgba(255, 255, 255, 0.65)",
                  border: "1px solid rgba(255, 255, 255, 0.8)",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.9)",
                }}
              >
                <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: 0, fontWeight: 500 }}>
                  {stat.label}
                </p>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: "12px" }}>
                  <span style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
                    {stat.value}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: "6px",
                      background: "var(--bg-base)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {stat.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lower Two-Column Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px", alignItems: "start" }}>
          {/* Left Column: Ranked Matches */}
          <div className="dashboard-panel" style={{ overflow: "hidden", height: "648px", minHeight: "648px", maxHeight: "648px", display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 24px",
                borderBottom: "1px solid var(--border)",
                flexShrink: 0,
              }}
            >
              <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                Ranked matches
              </h2>
              <button
                type="button"
                onClick={() => loadDashboard({ keyword, location, remoteOnly })}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                Re-score <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ overflowY: "auto", flex: "1 1 0%", minHeight: 0, paddingRight: "4px", paddingBottom: "12px" }}>
              {loading ? (
                <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
                  Evaluating opportunities...
                </div>
              ) : matches.length > 0 ? (
                matches.map((match, idx) => {
                  const isSaved = match.id ? savedIds.has(match.id) : false;
                  return (
                    <div
                      key={match.id || idx}
                      onClick={() => setSelectedMatch(match)}
                      style={{
                        padding: "20px 24px",
                        borderBottom: "1px solid var(--border)",
                        display: "grid",
                        gridTemplateColumns: "minmax(200px, 1.5fr) 70px 120px 80px",
                        alignItems: "center",
                        gap: "16px",
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: "14.5px", color: "var(--text-primary)", margin: 0 }}>
                          {match.job_title}
                        </p>
                        {match.source && (
                          <div style={{ alignSelf: "flex-start" }}>
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 800,
                                textTransform: "uppercase",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                background: "#ffffff",
                                color: "var(--text-secondary)",
                              }}
                            >
                              {match.source}
                            </span>
                          </div>
                        )}
                        <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                          {[match.company, match.location, match.duration].filter(Boolean).join(" · ") || "Details on application"}
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {match.matched_skills?.slice(0, 4).map((sk) => (
                            <span
                              key={sk}
                              style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                padding: "2px 8px",
                                borderRadius: "6px",
                                background: "rgba(255,255,255,0.8)",
                                color: "var(--text-primary)",
                              }}
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Match Score */}
                      <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
                        {Math.round(match.score || 0)}%
                      </div>

                      {/* Stipend */}
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                        {match.stipend || "Negotiable"}
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }} onClick={(e) => e.stopPropagation()}>
                        {match.id && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSave(match);
                            }}
                            className="dashboard-icon-button"
                            style={{
                              background: isSaved ? "#ffffff" : "rgba(251, 251, 250, 0.66)",
                              color: isSaved ? "var(--text-primary)" : "var(--text-secondary)",
                            }}
                          >
                            <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
                          </button>
                        )}
                        {match.url && (
                          <a
                            href={match.url}
                            target="_blank"
                            rel="noreferrer"
                            className="dashboard-icon-button"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: "40px 24px", color: "var(--text-muted)", fontSize: "13.5px", lineHeight: 1.6 }}>
                  No matches returned yet. Try a broader keyword, remove filters, or upload a stronger resume profile.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Skill Gaps & Profile Signals */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Skill Gaps Card */}
            {hasUploadedProfile ? (
              <div className="dashboard-panel" style={{ padding: "20px 24px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, marginBottom: "16px", color: "var(--text-primary)" }}>
                  Skill gaps
                </h2>
                {missingSkills.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {missingSkills.map(([skill, count]) => (
                      <div
                        key={skill}
                        style={{
                          background: "rgba(255, 255, 255, 0.6)",
                          border: "1px solid rgba(255, 255, 255, 0.8)",
                          borderRadius: "12px",
                          padding: "14px 16px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <p style={{ fontWeight: 700, fontSize: "13.5px", margin: 0, color: "var(--text-primary)" }}>
                            {skill}
                          </p>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            {count} role{count === 1 ? "" : "s"}
                          </span>
                        </div>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0" }}>
                          Add stronger evidence to improve ATS scoring.
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "13px", lineHeight: 1.6 }}>
                    Upload a resume to identify the biggest skill gaps against your matches.
                  </p>
                )}
              </div>
            ) : (
              <div className="dashboard-panel" style={{ padding: "20px 24px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, marginBottom: "8px", color: "var(--text-primary)" }}>
                  Skill gaps
                </h2>
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "13px", lineHeight: 1.6 }}>
                  Upload a resume to see your skill gaps and profile signals.
                </p>
              </div>
            )}

            {/* Profile Signals Card */}
            {hasUploadedProfile && (
              <div className="dashboard-panel" style={{ padding: "20px 24px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, marginBottom: "16px", color: "var(--text-primary)" }}>
                  Profile signals
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {[
                    { label: "Skills", val: skillsCount, max: 20 },
                    { label: "Projects", val: projectsCount, max: 10 },
                    { label: "Experience", val: expCount, max: 5 },
                    { label: "Saved", val: savedIds.size, max: 10 },
                  ].map((sig) => {
                    const pct = Math.min(100, Math.round((sig.val / sig.max) * 100));
                    return (
                      <div key={sig.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                          <span style={{ fontWeight: 500, color: "var(--text-secondary)" }}>{sig.label}</span>
                          <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{sig.val}</span>
                        </div>
                        <div
                          style={{
                            height: "6px",
                            borderRadius: "999px",
                            background: "rgba(0,0,0,0.06)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              background: "var(--text-primary)",
                              borderRadius: "999px",
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
