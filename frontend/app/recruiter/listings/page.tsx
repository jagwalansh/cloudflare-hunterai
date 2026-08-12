"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Briefcase, PlusCircle, Trash2, Eye, MapPin, DollarSign, Tag } from "lucide-react";

export default function RecruiterListings() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadJobs = async () => {
    try {
      const data = await api.getRecruiterJobs();
      setJobs(data);
    } catch (e) {
      console.error("Failed to load recruiter job listings", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to deactivate this job listing?")) return;
    try {
      await api.deleteJobPosting(id);
      loadJobs();
    } catch (e) {
      alert("Failed to delete job posting");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
            My Job Listings 📋
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            View and manage all your active and inactive job openings.
          </p>
        </div>
        <Link
          href="/recruiter/post-job"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            borderRadius: "12px",
            background: "#10B981",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: "13.5px",
            textDecoration: "none"
          }}
        >
          <PlusCircle size={16} />
          <span>Post New Job</span>
        </Link>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Loading listings...</p>
      ) : !jobs.length ? (
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)", borderRadius: "20px", padding: "48px 24px", textAlign: "center" }}>
          <Briefcase size={40} color="var(--text-muted)" style={{ margin: "0 auto 12px auto", opacity: 0.5 }} />
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>No listings found</h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
            You haven't posted any jobs yet. Click below to create your first opening.
          </p>
          <Link
            href="/recruiter/post-job"
            style={{
              display: "inline-block",
              marginTop: "16px",
              padding: "10px 18px",
              borderRadius: "10px",
              background: "#10B981",
              color: "#ffffff",
              fontSize: "13.5px",
              fontWeight: 600,
              textDecoration: "none"
            }}
          >
            Post a Job
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {jobs.map((job) => (
            <div
              key={job.id}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-strong)",
                borderRadius: "16px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                opacity: job.is_active ? 1 : 0.6
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>{job.title}</h2>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: job.is_active ? "rgba(16, 185, 129, 0.15)" : "var(--bg-hover)",
                        color: job.is_active ? "#10B981" : "var(--text-muted)"
                      }}
                    >
                      {job.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>{job.company}</p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Link
                    href={`/recruiter/candidates?jobId=${job.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                      fontSize: "12px",
                      fontWeight: 600,
                      textDecoration: "none"
                    }}
                  >
                    <Eye size={14} /> Applicants ({job.applicant_count})
                  </Link>

                  {job.is_active && (
                    <button
                      onClick={() => handleDelete(job.id)}
                      style={{
                        padding: "8px",
                        borderRadius: "8px",
                        background: "var(--rose-soft, #FFF0F2)",
                        border: "1px solid var(--rose-border, #FFD2D7)",
                        color: "var(--rose, #E63946)",
                        cursor: "pointer"
                      }}
                      title="Deactivate listing"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Meta details */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "12.5px", color: "var(--text-muted)" }}>
                {job.location && (
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <MapPin size={13} /> {job.location}
                  </span>
                )}
                {job.salary_range && (
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <DollarSign size={13} /> {job.salary_range}
                  </span>
                )}
                <span style={{ textTransform: "capitalize" }}>Type: {job.job_type}</span>
                {job.is_remote && <span>🌐 Remote</span>}
              </div>

              {/* Skills Tags */}
              {job.skills_required?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                  {job.skills_required.map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: "11.5px",
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
