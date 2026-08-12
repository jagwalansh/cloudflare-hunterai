"use client";

import { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Upload,
  ExternalLink,
  Calendar,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
  Bookmark,
  Wand2,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Profile, JobMatch } from "@/types";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { CardSkeleton } from "@/components/shared/Skeleton";
import { useAuth } from "@/components/auth/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";

function renderJobTitle(title: string) {
  const highlightWords = ["intern", "internship", "developer", "dev", "engineer", "co-op", "coop", "associate"];
  const words = title.split(" ");
  return words.map((word, i) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9-]/g, "");
    const isHighlight = highlightWords.includes(cleanWord);
    
    if (isHighlight) {
      return (
        <em
          key={i}
          style={{
            fontStyle: "italic",
            color: "var(--accent)",
            fontWeight: 600,
            fontFamily: "var(--font-display)",
            marginRight: "4px",
          }}
        >
          {word}
        </em>
      );
    }
    return (
      <span key={i} style={{ marginRight: "4px" }}>
        {word}
      </span>
    );
  });
}

function JobCard({
  match,
  isSaved,
  onToggleSave,
}: {
  match: JobMatch;
  isSaved: boolean;
  onToggleSave: () => void;
}) {
  return (
    <div
      className="dashboard-panel"
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--text-primary)",
                margin: 0,
                lineHeight: 1.25,
              }}
            >
              {match.job_title}
            </h3>
            {match.source && (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  background: "#ffffff",
                  color: "var(--text-secondary)",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                {match.source}
              </span>
            )}
          </div>
          <p style={{ fontSize: "13.5px", color: "var(--text-muted)", margin: 0, fontWeight: 500 }}>
            {match.company || "Company details available on application"}
          </p>
        </div>

        {/* Action & Score */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
            className="dashboard-icon-button"
            style={{
              background: isSaved ? "#ffffff" : "rgba(251, 251, 250, 0.66)",
              color: isSaved ? "var(--text-primary)" : "var(--text-secondary)",
            }}
            title={isSaved ? "Unsave Internship" : "Save Internship"}
          >
            <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
          </button>
          
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
              {Math.round(match.score || 0)}%
            </span>
            <span style={{ display: "block", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em" }}>
              Match
            </span>
          </div>
        </div>
      </div>

      {/* Meta info chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {[
          { icon: <MapPin size={12} />, text: match.location || "Remote" },
          { icon: <DollarSign size={12} />, text: match.stipend || "Negotiable" },
          ...(match.duration ? [{ icon: <Calendar size={12} />, text: match.duration }] : []),
        ].map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text-secondary)",
              background: "rgba(255, 255, 255, 0.7)",
              padding: "4px 10px",
              borderRadius: "999px",
              border: "1px solid rgba(255, 255, 255, 0.8)",
            }}
          >
            {item.icon}
            <span>{item.text}</span>
          </div>
        ))}
      </div>

      {/* Suitability Assessment */}
      {match.suitability_assessment && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: "12px",
            background: "rgba(0, 0, 0, 0.03)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            fontSize: "12.5px",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}
        >
          <span style={{ fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: "2px" }}>
            Suitability Assessment
          </span>
          {match.suitability_assessment}
        </div>
      )}

      {/* Relevant Projects */}
      {match.matched_projects && match.matched_projects.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "6px" }}>
            <Sparkles size={12} color="var(--text-primary)" />
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Matched Resume Projects ({match.matched_projects.length})
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {match.matched_projects.map((p, i) => (
              <span
                key={i}
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "3px 9px",
                  borderRadius: "6px",
                  background: "#ffffff",
                  color: "var(--text-primary)",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {match.matched_skills?.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "6px" }}>
              <CheckCircle2 size={12} color="#16a34a" />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Matched Skills ({match.matched_skills.length})
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {match.matched_skills.map((s, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "11.5px",
                    fontWeight: 600,
                    padding: "3px 9px",
                    borderRadius: "6px",
                    background: "#f0fdf4",
                    color: "#166534",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        {match.missing_skills?.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "6px" }}>
              <AlertCircle size={12} color="var(--text-muted)" />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Missing Skills ({match.missing_skills.length})
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {match.missing_skills.map((s, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "11.5px",
                    fontWeight: 600,
                    padding: "3px 9px",
                    borderRadius: "6px",
                    background: "rgba(0, 0, 0, 0.04)",
                    color: "var(--text-secondary)",
                    border: "1px solid rgba(0, 0, 0, 0.06)",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Apply and Tailor buttons */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
        {match.url ? (
          <a
            href={match.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "13.5px",
              color: "#ffffff",
              padding: "12px",
              borderRadius: "999px",
              background: "var(--text-primary)",
              boxShadow: "0 4px 14px rgba(5, 5, 5, 0.12)",
              transition: "transform 0.15s ease, opacity 0.15s ease",
            }}
          >
            Apply on {match.source || "Internshala"} <ExternalLink size={14} />
          </a>
        ) : (
          <button
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
              fontWeight: 700,
              fontSize: "13.5px",
              color: "#ffffff",
              padding: "12px",
              borderRadius: "999px",
              background: "var(--text-primary)",
              border: "none",
              cursor: "pointer",
            }}
          >
            Quick Apply <ExternalLink size={14} />
          </button>
        )}
        
        {match.id && (
          <a
            href={`/internships/${match.id}/tailor`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "13.5px",
              color: "var(--text-primary)",
              padding: "11px",
              borderRadius: "999px",
              border: "1px solid rgba(0, 0, 0, 0.12)",
              background: "#ffffff",
              transition: "background-color 0.15s ease",
            }}
          >
            <Wand2 size={14} /> Tailor Resume for this Job
          </a>
        )}
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<number[]>([]);
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  // New backend filters
  const [location, setLocation] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [stipendMin, setStipendMin] = useState<number | "">("");
  const [durationMax, setDurationMax] = useState<number | "">("");
  const [sources, setSources] = useState<string[]>([]);
  const [jobTypes, setJobTypes] = useState<string[]>([]);

  const fetchMatches = async (email: string, keyword?: string) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getMatches(
        email, 
        keyword,
        location || undefined,
        remoteOnly,
        stipendMin === "" ? undefined : stipendMin,
        durationMax === "" ? undefined : durationMax,
        sources.length > 0 ? sources.join(",") : undefined,
        jobTypes.length > 0 ? jobTypes.join(",") : undefined
      );
      setMatches(data || []);
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSaved = async () => {
    try {
      const saved = await api.getSavedInternships().catch(() => []);
      if (Array.isArray(saved)) {
        setSavedJobIds(saved.map((s: { id: number }) => s.id).filter((id) => typeof id === "number"));
      }
    } catch (e) {
      console.error("Failed to load saved jobs:", e);
    }
  };

  const handleToggleSave = async (jobId: number) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const isCurrentlySaved = savedJobIds.includes(jobId);
    try {
      if (isCurrentlySaved) {
        await api.unsaveInternship(jobId);
        setSavedJobIds((prev) => prev.filter((id) => id !== jobId));
      } else {
        await api.saveInternship(jobId);
        setSavedJobIds((prev) => [...prev, jobId]);
      }
    } catch (e) {
      console.error("Error toggling save:", e);
    }
  };

  const init = async () => {
    setLoading(true);
    setError("");
    try {
      const profs = await api.getProfiles();
      setProfiles(profs || []);
      if (profs?.length) {
        const saved = localStorage.getItem("selectedProfileEmail");
        const p = profs.find((x: Profile) => x.email === saved) || profs[profs.length - 1];
        setSelectedEmail(p.email);
        localStorage.setItem("selectedProfileEmail", p.email);
        await Promise.all([
          fetchMatches(p.email),
          fetchSaved()
        ]);
      } else {
        setLoading(false);
      }
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      init();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleProfileChange = async (email: string) => {
    setSelectedEmail(email);
    localStorage.setItem("selectedProfileEmail", email);
    await fetchMatches(email, searchQuery);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMatches(selectedEmail, searchQuery);
  };

  const filtered = matches.filter((m) => {
    return m.score >= minScore;
  });

  if (profiles.length === 0 && !loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "40px" }}>
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "20px", padding: "52px 40px", textAlign: "center", maxWidth: "380px", boxShadow: "0 12px 32px rgba(0,0,0,0.06)" }}>
          <div style={{ width: "52px", height: "52px", background: "var(--accent-light)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Sparkles size={24} color="var(--accent)" />
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "28px", color: "var(--text-primary)", marginBottom: "8px" }}>No Profile Yet</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "28px", lineHeight: 1.6 }}>
            Upload your resume first to calculate personalized job matches.
          </p>
          <Link
            href="/upload"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none", fontWeight: 600, fontSize: "14px", color: "white", padding: "12px 24px", borderRadius: "12px", background: "var(--accent)" }}
          >
            <Upload size={15} /> Upload Resume
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Subheader and profile selector */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "13.5px", fontWeight: 500 }}>
          {loading ? "Searching opportunities..." : `${filtered.length} matches found, evaluated against skills & projects`}
        </p>

        {/* Profile selector */}
        {profiles.length > 1 && (
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              position: "relative",
            }}
          >
            <select
              value={selectedEmail}
              onChange={(e) => handleProfileChange(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                padding: "9px 36px 9px 14px",
                fontSize: "13px",
                color: "var(--text-primary)",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                appearance: "none",
              }}
            >
              {profiles.map((p, i) => (
                <option key={i} value={p.email}>{p.name}</option>
              ))}
            </select>
            <ChevronDown size={14} color="var(--text-muted)" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          </div>
        )}
      </div>

      {/* Search + Filter bar */}
      <div style={{ marginBottom: "28px" }}>
        <form
          onSubmit={handleSearchSubmit}
          className="dashboard-panel"
          style={{
            padding: "16px 24px",
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search ML, python, web dev..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="dashboard-input"
              style={{
                width: "100%",
                paddingLeft: "38px",
                background: "rgba(255, 255, 255, 0.8)",
              }}
            />
          </div>

          <button
            type="submit"
            className="dashboard-filter-button"
            style={{
              background: "var(--text-primary)",
              color: "#ffffff",
              borderColor: "var(--text-primary)",
            }}
          >
            <Search size={13} /> Search
          </button>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="dashboard-filter-button"
            style={{
              background: showFilters ? "#ffffff" : "rgba(251, 251, 250, 0.58)",
              borderColor: showFilters ? "var(--text-primary)" : "rgba(255, 255, 255, 0.7)",
            }}
          >
            <SlidersHorizontal size={13} /> Filters
          </button>

          <button
            type="button"
            onClick={() => { 
              setSearchQuery(""); 
              setLocation("");
              setRemoteOnly(false);
              setStipendMin("");
              setDurationMax("");
              setSources([]);
              setJobTypes([]);
              setMinScore(0);
              api.getMatches(selectedEmail, "", undefined, false, undefined, undefined, undefined, undefined).then(setMatches).catch(e => setError(e.message)); 
            }}
            className="dashboard-filter-button"
            style={{ background: "transparent", border: "none" }}
          >
            Reset
          </button>
        </form>
      </div>

      {/* Min score filter */}
      {showFilters && (
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            padding: "20px",
            marginBottom: "24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            alignItems: "end"
          }}
        >
          {/* Location */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Location</label>
            <input
              type="text"
              placeholder="e.g. Mumbai, Bengaluru..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input-base"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px 12px", fontSize: "13px" }}
            />
          </div>

          {/* Stipend */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Min Stipend (₹/mo)</label>
            <input
              type="number"
              placeholder="e.g. 10000"
              value={stipendMin}
              onChange={(e) => setStipendMin(e.target.value ? Number(e.target.value) : "")}
              className="input-base"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px 12px", fontSize: "13px" }}
            />
          </div>

          {/* Source Filter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Platform</label>
            <select
              value={sources[0] || ""}
              onChange={(e) => setSources(e.target.value ? [e.target.value] : [])}
              className="input-base"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", height: "35px" }}
            >
              <option value="">All</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Naukri">Naukri</option>
              <option value="Internshala">Internshala</option>
            </select>
          </div>

          {/* Job Type */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Job Type</label>
            <select
              value={jobTypes[0] || ""}
              onChange={(e) => setJobTypes(e.target.value ? [e.target.value] : [])}
              className="input-base"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", height: "35px" }}
            >
              <option value="">All</option>
              <option value="Full Time">Full Time</option>
              <option value="Internship">Internship</option>
              <option value="Part Time">Part Time</option>
            </select>
          </div>

          {/* Remote Only */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", height: "35px" }}>
            <input
              type="checkbox"
              id="remote-toggle"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              style={{ accentColor: "var(--accent)", width: "16px", height: "16px" }}
            />
            <label htmlFor="remote-toggle" style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", cursor: "pointer" }}>
              Remote Only
            </label>
          </div>

          {/* Local Score Filter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Min Match Score: {minScore}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--accent)", marginTop: "8px" }}
            />
          </div>
        </div>
      )}

      {/* Loading grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
          {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div
          style={{
            background: "rgba(255,77,109,0.08)",
            border: "1px solid rgba(255,77,109,0.2)",
            borderRadius: "16px",
            padding: "32px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#ff4d6d", fontSize: "13.5px", marginBottom: "16px" }}>{error}</p>
          <button
            onClick={() => fetchMatches(selectedEmail, searchQuery)}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px 16px", color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer", fontFamily: "var(--font-body)" }}
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px dashed var(--border-strong)",
            borderRadius: "20px",
            padding: "80px 40px",
            textAlign: "center",
          }}
        >
          <Sparkles size={28} color="var(--text-muted)" style={{ margin: "0 auto 14px", display: "block" }} />
          <p style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: 500 }}>No jobs match your current filters.</p>
          <p style={{ color: "var(--text-muted)", fontSize: "12.5px", marginTop: "6px" }}>Try lowering the minimum score or clearing the search.</p>
        </div>
      ) : (
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}
        >
          {filtered.map((match, i) => (
            <JobCard
              key={i}
              match={match}
              isSaved={match.id ? savedJobIds.includes(match.id) : false}
              onToggleSave={() => match.id && handleToggleSave(match.id)}
            />
          ))}
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>
      )}
    </>
  );
}
