"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Users, CheckCircle, XCircle, Mail, UserCheck, Briefcase, FileText, Download, ExternalLink } from "lucide-react";

export default function RecruiterCandidates() {
  const searchParams = useSearchParams();
  const selectedJobId = searchParams.get("jobId");
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [activeJobId, setActiveJobId] = useState<number | null>(selectedJobId ? Number(selectedJobId) : null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const jobList = await api.getRecruiterJobs();
        setJobs(jobList);
        if (jobList.length > 0) {
          const targetId = activeJobId || jobList[0].id;
          setActiveJobId(targetId);
          const candidateList = await api.getJobCandidates(targetId);
          setCandidates(candidateList);
        }
      } catch (e) {
        console.error("Failed to load candidates", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeJobId]);

  const handleStatusUpdate = async (applicationId: number, newStatus: string) => {
    try {
      await api.updateApplicationStatus(applicationId, newStatus);
      if (activeJobId) {
        const updated = await api.getJobCandidates(activeJobId);
        setCandidates(updated);
      }
    } catch (e) {
      alert("Failed to update candidate status");
    }
  };

  const handleViewResume = async (applicationId: number) => {
    try {
      const url = api.getCandidateResumeUrl(applicationId);
      const headers: Record<string, string> = {};
      const mockAuth = typeof window !== "undefined" ? localStorage.getItem("mock_auth_user") : null;
      if (mockAuth) {
        try {
          const u = JSON.parse(mockAuth);
          headers["Authorization"] = `Bearer mock_token:${u.id}:${u.email}:${u.username}`;
        } catch (e) {}
      }
      const res = await fetch(url, { headers });
      if (!res.ok) {
        alert("Resume PDF not found for this candidate.");
        return;
      }
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch (e) {
      alert("Failed to open candidate resume PDF.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "40px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
          Candidate Applications 👥
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Review candidate profiles, download PDF resumes, analyze skill fit, and manage decision statuses.
        </p>
      </div>

      {/* Filter by Job Listing */}
      {jobs.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>Select Listing:</span>
          {jobs.map((j) => (
            <button
              key={j.id}
              onClick={async () => {
                setActiveJobId(j.id);
                setLoading(true);
                const list = await api.getJobCandidates(j.id);
                setCandidates(list);
                setLoading(false);
              }}
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                border: activeJobId === j.id ? "2px solid #10B981" : "1px solid var(--border-strong)",
                background: activeJobId === j.id ? "rgba(16, 185, 129, 0.1)" : "var(--bg-surface)",
                color: activeJobId === j.id ? "#10B981" : "var(--text-primary)",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer"
              }}
            >
              {j.title} ({j.applicant_count})
            </button>
          ))}
        </div>
      )}

      {/* Candidate List */}
      {loading ? (
        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Loading candidates...</p>
      ) : !candidates.length ? (
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)", borderRadius: "20px", padding: "48px 24px", textAlign: "center" }}>
          <Users size={40} color="var(--text-muted)" style={{ margin: "0 auto 12px auto", opacity: 0.5 }} />
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>No candidates found</h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
            No applications have been submitted for this position yet.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {candidates.map((cand) => (
            <div
              key={cand.id}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-strong)",
                borderRadius: "18px",
                padding: "22px",
                display: "flex",
                flexDirection: "column",
                gap: "14px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{cand.candidate_name}</h2>
                    {cand.match_score !== undefined && (
                      <span style={{ fontSize: "12px", fontWeight: 800, padding: "3px 9px", borderRadius: "6px", background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
                        {cand.match_score}% Skill Match
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                    <Mail size={13} /> {cand.candidate_email}
                  </span>
                </div>

                {/* Status Badges & Accept / Reject Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {cand.status === "shortlisted" || cand.status === "rejected" ? (
                    <span
                      style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        background: cand.status === "shortlisted" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        border: cand.status === "shortlisted" ? "1px solid #10B981" : "1px solid #EF4444",
                        color: cand.status === "shortlisted" ? "#10B981" : "#EF4444",
                        fontSize: "12.5px",
                        fontWeight: 800,
                        textTransform: "uppercase"
                      }}
                    >
                      {cand.status === "shortlisted" ? "✓ Accepted (Final)" : "✕ Rejected (Final)"}
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(cand.id, "shortlisted")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          background: "rgba(16, 185, 129, 0.12)",
                          border: "1px solid #10B981",
                          color: "#10B981",
                          fontSize: "12.5px",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        <CheckCircle size={14} /> Accept Candidate
                      </button>

                      <button
                        onClick={() => handleStatusUpdate(cand.id, "rejected")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          background: "rgba(239, 68, 68, 0.12)",
                          border: "1px solid #EF4444",
                          color: "#EF4444",
                          fontSize: "12.5px",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        <XCircle size={14} /> Reject Candidate
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* PDF Resume Download Button */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => handleViewResume(cand.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 16px",
                    borderRadius: "10px",
                    background: "var(--text-primary)",
                    color: "var(--bg-surface)",
                    fontSize: "13px",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <FileText size={16} /> View / Download Candidate Resume PDF <ExternalLink size={13} />
                </button>
              </div>

              {/* Candidate Skills */}
              {cand.candidate_skills?.length > 0 && (
                <div style={{ marginTop: "2px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Candidate Skills:</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                    {cand.candidate_skills.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: "11.5px",
                          fontWeight: 600,
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border)",
                          color: "var(--text-secondary)"
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
