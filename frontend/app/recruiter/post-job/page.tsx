"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { PlusCircle, ArrowLeft, Check, Sparkles } from "lucide-react";

export default function PostJobPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [skillsRequired, setSkillsRequired] = useState("");
  const [location, setLocation] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [jobType, setJobType] = useState("internship");
  const [isRemote, setIsRemote] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !description.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const skillsList = skillsRequired
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await api.createJobPosting({
        title: title.trim(),
        company: company.trim(),
        description: description.trim(),
        skills_required: skillsList,
        location: location.trim() || undefined,
        salary_range: salaryRange.trim() || undefined,
        job_type: jobType,
        is_remote: isRemote,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/recruiter/listings");
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "700px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", marginBottom: "12px", padding: 0 }}
        >
          <ArrowLeft size={14} /> Back to dashboard
        </button>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
          Post a Job Opening 📝
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Fill in the job details to publish your listing and receive candidate matches.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-strong)",
          borderRadius: "20px",
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "18px"
        }}
      >
        {/* Job Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Job Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Frontend Developer Intern"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid var(--border-strong)",
              background: "var(--bg-base)",
              color: "var(--text-primary)",
              fontSize: "14px",
              outline: "none"
            }}
          />
        </div>

        {/* Company Name */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Company Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Acme Corp"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid var(--border-strong)",
              background: "var(--bg-base)",
              color: "var(--text-primary)",
              fontSize: "14px",
              outline: "none"
            }}
          />
        </div>

        {/* Job Type & Remote Toggle */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Job Type
            </label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid var(--border-strong)",
                background: "var(--bg-base)",
                color: "var(--text-primary)",
                fontSize: "14px",
                outline: "none"
              }}
            >
              <option value="internship">Internship</option>
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Workplace Mode
            </label>
            <button
              type="button"
              onClick={() => setIsRemote(!isRemote)}
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid var(--border-strong)",
                background: isRemote ? "rgba(16, 185, 129, 0.15)" : "var(--bg-base)",
                color: isRemote ? "#10B981" : "var(--text-primary)",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "left"
              }}
            >
              {isRemote ? "🌐 Remote Work" : "🏢 On-Site / Hybrid"}
            </button>
          </div>
        </div>

        {/* Location & Salary */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Location
            </label>
            <input
              type="text"
              placeholder="e.g. San Francisco, CA or Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid var(--border-strong)",
                background: "var(--bg-base)",
                color: "var(--text-primary)",
                fontSize: "14px",
                outline: "none"
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Stipend / Salary
            </label>
            <input
              type="text"
              placeholder="e.g. $30/hr or $2,000/mo"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid var(--border-strong)",
                background: "var(--bg-base)",
                color: "var(--text-primary)",
                fontSize: "14px",
                outline: "none"
              }}
            />
          </div>
        </div>

        {/* Required Skills */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Required Skills (comma-separated)
          </label>
          <input
            type="text"
            placeholder="e.g. React, TypeScript, Node.js, TailwindCSS"
            value={skillsRequired}
            onChange={(e) => setSkillsRequired(e.target.value)}
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid var(--border-strong)",
              background: "var(--bg-base)",
              color: "var(--text-primary)",
              fontSize: "14px",
              outline: "none"
            }}
          />
        </div>

        {/* Description */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Job Description *
          </label>
          <textarea
            required
            rows={6}
            placeholder="Describe role responsibilities, team environment, and application requirements..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid var(--border-strong)",
              background: "var(--bg-base)",
              color: "var(--text-primary)",
              fontSize: "14px",
              outline: "none",
              resize: "vertical"
            }}
          />
        </div>

        {error && (
          <p style={{ color: "var(--rose)", fontSize: "13px", margin: 0 }}>{error}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || success}
          style={{
            padding: "14px",
            borderRadius: "12px",
            background: success ? "#10B981" : "var(--text-primary)",
            color: "var(--bg-surface)",
            fontWeight: 600,
            fontSize: "15px",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginTop: "8px",
            transition: "all 0.2s"
          }}
        >
          {success ? (
            <>
              <Check size={18} /> Published Successfully!
            </>
          ) : loading ? (
            "Publishing Job..."
          ) : (
            <>
              <PlusCircle size={18} /> Publish Job Opening
            </>
          )}
        </button>
      </form>
    </div>
  );
}
