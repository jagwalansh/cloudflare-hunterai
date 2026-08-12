"use client";

import { useState, useRef, DragEvent } from "react";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";


export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPdf = (f: File) => {
    return f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (!isPdf(selectedFile)) {
      setFile(null);
      setStatus("error");
      setErrorMsg("Invalid file format. Only PDF files (.pdf) are allowed.");
      return false;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setFile(null);
      setStatus("error");
      setErrorMsg("File size exceeds 5MB limit. Please upload a smaller PDF file.");
      return false;
    }
    setFile(selectedFile);
    setStatus("idle");
    setErrorMsg("");
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selected = e.target.files[0];
      const valid = validateAndSetFile(selected);
      if (!valid && fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (!dropped) return;
    validateAndSetFile(dropped);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    if (!isPdf(file)) {
      setStatus("error");
      setErrorMsg("Invalid file format. Only PDF files (.pdf) are allowed.");
      return;
    }
    setLoading(true);
    setStatus("idle");
    try {
      const data = await api.uploadResume(file);
      if (data.profile) {
        setStatus("success");
        if (data.profile.email) {
          localStorage.setItem("selectedProfileEmail", data.profile.email);
        }
      } else {
        throw new Error(data.message || "Failed to parse profile.");
      }
    } catch (err: unknown) {
      const error = err as Error;
      setStatus("error");
      const isFetchError = error.message?.includes("Failed to fetch");
      setErrorMsg(
        isFetchError
          ? "Could not connect to backend server (localhost:8000). Please verify the backend is running."
          : error.message || "Upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          position: "relative",
        }}
      >

      <div
        className="fade-up"
        style={{
          width: "100%",
          maxWidth: "480px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "26px",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              marginBottom: "6px",
            }}
          >
            Upload Resume
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Drop your PDF. We&apos;ll parse your skills and match you with top internships.
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel" style={{ padding: "40px" }}>
          {status === "success" ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "rgba(0,214,143,0.1)",
                  border: "1px solid rgba(0,214,143,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <CheckCircle2 size={28} color="#00d68f" />
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "8px",
                }}
              >
                Resume Parsed!
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "13.5px", marginBottom: "28px", lineHeight: 1.6 }}>
                Your profile has been created and skills extracted. Browse your matches now.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link
                  href="/recommendations"
                  className="btn-primary"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    textDecoration: "none",
                    padding: "13px",
                  }}
                >
                  View Recommendations <ArrowRight size={15} />
                </Link>
                <Link
                  href="/dashboard"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    textDecoration: "none",
                    fontWeight: 500,
                    fontSize: "13.5px",
                    color: "var(--text-secondary)",
                    padding: "11px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border)",
                  }}
                >
                  View Profile
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${dragging ? "var(--accent)" : file ? "var(--accent-border)" : "var(--border-strong)"}`,
                  borderRadius: "16px",
                  padding: "64px 24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
                  background: dragging
                    ? "var(--accent-soft)"
                    : file
                    ? "var(--accent-soft)"
                    : "var(--bg-surface)",
                  boxShadow: dragging ? "inset 0 0 0 2px var(--accent)" : "none",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                {file ? (
                  <>
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "14px",
                        background: "var(--accent-soft)",
                        border: "1px solid var(--accent-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "16px",
                      }}
                    >
                      <FileText size={24} color="var(--accent)" />
                    </div>
                    <p
                      style={{
                        fontWeight: 600,
                        fontSize: "14px",
                        color: "var(--text-primary)",
                        maxWidth: "240px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginBottom: "6px",
                      }}
                    >
                      {file.name}
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB · PDF
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setStatus("idle");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid var(--border)",
                        borderRadius: "20px",
                        color: "var(--text-secondary)",
                        fontSize: "11px",
                        cursor: "pointer",
                        padding: "6px 12px",
                        transition: "all 0.15s",
                      }}
                    >
                      <X size={12} /> Remove
                    </button>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "20px",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                      }}
                    >
                      <UploadCloud size={24} color="var(--text-secondary)" />
                    </div>
                    <p style={{ fontSize: "15px", color: "var(--text-secondary)", marginBottom: "6px", fontWeight: 500 }}>
                      <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Click to upload</span> or drag & drop
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>PDF only · max 5MB</p>
                  </>
                )}
              </div>

              {/* Error */}
              {status === "error" && (
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                    background: "rgba(244, 63, 94, 0.08)",
                    border: "1px solid rgba(244, 63, 94, 0.2)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                  }}
                >
                  <AlertCircle size={15} color="var(--rose)" style={{ flexShrink: 0, marginTop: "1px" }} />
                  <p style={{ fontSize: "12.5px", color: "var(--rose)", lineHeight: 1.5 }}>{errorMsg}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!file || loading}
                className="btn-primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "14px",
                  fontSize: "15px",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                    <span>Parsing with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Parse & Extract Profile</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Tips (Collapsible) */}
        {status !== "success" && (
          <details
            className="fade-up fade-up-delay-2"
            style={{
              marginTop: "24px",
              padding: "16px 20px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              cursor: "pointer",
            }}
          >
            <summary
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                outline: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Sparkles size={12} color="var(--accent)" /> Tips for best results
            </summary>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
              {[
                "Use a clean, text-based PDF resume",
                "Include a dedicated skills section",
                "Add explicit technologies to your project descriptions",
              ].map((tip) => (
                <div key={tip} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <CheckCircle2 size={13} color="var(--emerald)" />
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{tip}</span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      </div>
  );
}
