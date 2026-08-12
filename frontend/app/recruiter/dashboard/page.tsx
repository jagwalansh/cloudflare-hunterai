"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthProvider";
import { PlusCircle, Briefcase, Users, CheckCircle, Clock, ArrowRight, Building } from "lucide-react";

interface DashboardStats {
  total_postings: number;
  active_postings: number;
  total_applications: number;
  shortlisted: number;
  recent_applications: any[];
}

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.getRecruiterDashboard();
        setStats(data);
      } catch (e) {
        console.error("Failed to load recruiter stats", e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
            Recruiter Dashboard 💼
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Welcome back, {user?.username || "Recruiter"}. Manage your job postings and applicants.
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
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
            transition: "transform 0.2s"
          }}
        >
          <PlusCircle size={16} />
          <span>Post New Job</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)", borderRadius: "16px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Total Listings</span>
            <Briefcase size={18} color="#10B981" />
          </div>
          <p style={{ fontSize: "32px", fontWeight: 700, fontFamily: "var(--font-display)", marginTop: "8px", color: "var(--text-primary)" }}>
            {loading ? "..." : stats?.total_postings ?? 0}
          </p>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{stats?.active_postings ?? 0} active</span>
        </div>

        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)", borderRadius: "16px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Total Applicants</span>
            <Users size={18} color="#3B82F6" />
          </div>
          <p style={{ fontSize: "32px", fontWeight: 700, fontFamily: "var(--font-display)", marginTop: "8px", color: "var(--text-primary)" }}>
            {loading ? "..." : stats?.total_applications ?? 0}
          </p>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>candidates applied</span>
        </div>

        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)", borderRadius: "16px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Shortlisted</span>
            <CheckCircle size={18} color="#10B981" />
          </div>
          <p style={{ fontSize: "32px", fontWeight: 700, fontFamily: "var(--font-display)", marginTop: "8px", color: "var(--text-primary)" }}>
            {loading ? "..." : stats?.shortlisted ?? 0}
          </p>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>top candidates</span>
        </div>
      </div>

      {/* Quick Actions & Recent Applicants */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
        {/* Recent Applications Table */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)", borderRadius: "20px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
              Recent Applicants
            </h2>
            <Link href="/recruiter/candidates" style={{ fontSize: "13px", color: "#10B981", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Loading applications...</p>
          ) : !stats?.recent_applications?.length ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <Building size={36} color="var(--text-muted)" style={{ margin: "0 auto 12px auto", opacity: 0.5 }} />
              <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>No applications yet</p>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                Post a new job opening to start receiving candidates.
              </p>
              <Link
                href="/recruiter/post-job"
                style={{
                  display: "inline-block",
                  marginTop: "16px",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  background: "#10B981",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none"
                }}
              >
                Post a Job
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {stats.recent_applications.map((app) => (
                <div
                  key={app.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)"
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>{app.candidate_name}</span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "10px" }}>applied for <strong>{app.job_title}</strong></span>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      background: app.status === "shortlisted" ? "rgba(16, 185, 129, 0.15)" : "var(--bg-hover)",
                      color: app.status === "shortlisted" ? "#10B981" : "var(--text-secondary)"
                    }}
                  >
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
