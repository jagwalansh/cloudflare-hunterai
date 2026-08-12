"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

import { ArrowLeft, Download, FileText, CheckCircle, Target, Briefcase, ExternalLink } from "lucide-react";
import { ScoreRing } from "@/components/shared/ScoreRing";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ResumeDocument } from "@/components/ResumeDocument";
import { generateLatex } from "@/utils/generateLatex";

export default function TailorResumePage() {
  const params = useParams();
  const router = useRouter();
  const jobId = parseInt(params.jobId as string, 10);
  
  const [job, setJob] = useState<any>(null);
  const [tailorResult, setTailorResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [plan, setPlan] = useState("");
  const [planLoading, setPlanLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Job Details
        const jobData = await api.getJob(jobId);
        setJob(jobData);
        
        // 2. Trigger Plan Generation instead of full tailoring
        setPlanLoading(true);
        const result = await api.generateTailorPlan(jobId);
        setPlan(result.plan);
      } catch (err: any) {
        setError(err.message || "Failed to generate plan");
      } finally {
        setLoading(false);
        setPlanLoading(false);
      }
    };
    
    if (jobId) fetchData();
  }, [jobId]);

  const handleUpdatePlan = async () => {
    if (!feedback.trim()) return;
    try {
      setPlanLoading(true);
      const result = await api.generateTailorPlan(jobId, feedback);
      setPlan(result.plan);
      setFeedback("");
    } catch (err: any) {
      setError(err.message || "Failed to update plan");
    } finally {
      setPlanLoading(false);
    }
  };

  const handleGenerateResume = async () => {
    try {
      setLoading(true);
      const result = await api.tailorResume(jobId, plan);
      setTailorResult(result);
    } catch (err: any) {
      setError(err.message || "Failed to tailor resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        
        <button 
          onClick={() => router.back()}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            background: "none", 
            border: "none", 
            color: "var(--text-muted)", 
            cursor: "pointer",
            marginBottom: "20px",
            fontSize: "14px"
          }}
        >
          <ArrowLeft size={16} /> Back to Job
        </button>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: "0 0 8px 0" }}>
              AI Resume Tailor <span style={{ color: "var(--accent)" }}>✨</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", margin: 0 }}>
              Your resume is being optimally rewritten for ATS compatibility.
            </p>
          </div>
          
          {tailorResult && (
            <div style={{ display: "flex", alignItems: "center", gap: "20px", background: "var(--bg-elevated)", padding: "12px 20px", borderRadius: "16px", border: "1px solid var(--border)" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 4px 0" }}>Original ATS Score</p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ScoreRing score={tailorResult.ats_score_before} size={32} />
                  <span style={{ fontWeight: "bold" }}>{Math.round(tailorResult.ats_score_before)}</span>
                </div>
              </div>
              <ArrowLeft size={16} style={{ color: "var(--text-muted)", transform: "rotate(180deg)" }} />
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 4px 0" }}>Tailored ATS Score</p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ScoreRing score={tailorResult.ats_score_after} size={32} />
                  <span style={{ fontWeight: "bold", color: "var(--accent)" }}>{Math.round(tailorResult.ats_score_after)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          
          {/* Left Column: Job Details */}
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", height: "fit-content" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <Briefcase size={20} color="var(--accent)" />
              <h2 style={{ fontSize: "18px", margin: 0 }}>Target Internship</h2>
            </div>
            
            {job ? (
              <div>
                <h3 style={{ fontSize: "20px", margin: "0 0 4px 0" }}>{job.job_title}</h3>
                <p style={{ color: "var(--text-secondary)", margin: "0 0 16px 0", fontSize: "14px" }}>{job.company} • {job.location}</p>
                
                <h4 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", marginBottom: "8px" }}>Required Skills</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
                  {job.required_skills?.map((skill: string, i: number) => (
                    <span key={i} style={{ padding: "4px 10px", background: "rgba(0, 214, 143, 0.1)", color: "var(--accent)", borderRadius: "20px", fontSize: "12px" }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                Loading job details...
              </div>
            )}
          </div>

          {/* Right Column: Tailored Resume or Plan */}
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FileText size={20} color="#00b4d8" />
                <h2 style={{ fontSize: "18px", margin: 0 }}>{tailorResult ? "Tailored Resume" : "Proposed Changes"}</h2>
              </div>
              
              {tailorResult && (
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <PDFDownloadLink 
                    document={<ResumeDocument data={tailorResult.tailored_profile} />} 
                    fileName={`Tailored_Resume_${job?.company?.replace(/\s+/g, '_') || 'Job'}.pdf`}
                  >
                  {({ blob, url, loading: pdfLoading, error }) => (
                    <button 
                      disabled={pdfLoading}
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "8px",
                        padding: "8px 16px", 
                        background: pdfLoading ? "var(--border)" : "#00b4d8", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "8px",
                        cursor: pdfLoading ? "not-allowed" : "pointer",
                        fontWeight: "bold",
                        fontSize: "14px",
                        transition: "opacity 0.2s"
                      }}
                    >
                      <Download size={16} />
                      {pdfLoading ? "Preparing PDF..." : "Download PDF"}
                    </button>
                  )}
                </PDFDownloadLink>
                
                <form action="https://www.overleaf.com/docs" method="post" target="_blank" style={{ margin: 0 }}>
                  <input type="hidden" name="snip" value={generateLatex(tailorResult.tailored_profile)} />
                  <button 
                    type="submit"
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "8px",
                      padding: "8px 16px", 
                      background: "#228b22", 
                      color: "white", 
                      border: "none", 
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "14px",
                      transition: "opacity 0.2s"
                    }}
                  >
                    <ExternalLink size={16} />
                    Open in Overleaf
                  </button>
                </form>
                </div>
              )}
            </div>

            {loading || planLoading ? (
              <div style={{ padding: "40px 0", textAlign: "center" }}>
                <div style={{ 
                  width: "40px", 
                  height: "40px", 
                  border: "3px solid var(--border)", 
                  borderTopColor: "var(--accent)", 
                  borderRadius: "50%", 
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 20px"
                }} />
                <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>
                  {planLoading ? "Analyzing job requirements and drafting a tailoring plan..." : "Executing approved plan to rewrite your resume..."}
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>This typically takes 10-15 seconds.</p>
              </div>
            ) : error ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#ff4d6d", background: "rgba(255, 77, 109, 0.1)", borderRadius: "12px" }}>
                {error}
              </div>
            ) : !tailorResult && plan ? (
              <div>
                <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px", border: "1px solid var(--border)", maxHeight: "400px", overflowY: "auto", marginBottom: "20px", fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                  {plan}
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "bold", color: "var(--text-primary)" }}>Suggest Changes (Optional)</label>
                  <textarea 
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="e.g. Focus more on my backend experience rather than frontend."
                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--border)", minHeight: "80px", fontFamily: "inherit" }}
                  />
                  <button 
                    onClick={handleUpdatePlan}
                    disabled={!feedback.trim() || planLoading}
                    style={{ alignSelf: "flex-end", padding: "8px 16px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "8px", cursor: feedback.trim() ? "pointer" : "not-allowed", opacity: feedback.trim() ? 1 : 0.5 }}
                  >
                    Update Plan
                  </button>
                </div>

                <button 
                  onClick={handleGenerateResume}
                  style={{ width: "100%", padding: "12px", background: "var(--accent)", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}
                >
                  Approve & Generate Resume
                </button>
              </div>
            ) : tailorResult ? (
              <div style={{ background: "#ffffff", padding: "20px", borderRadius: "8px", border: "1px solid var(--border)", maxHeight: "600px", overflowY: "auto" }}>
                {/* Visual Preview of the JSON */}
                <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#333" }}>{tailorResult.tailored_profile.name}</h3>
                
                <div style={{ marginBottom: "16px" }}>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#666", textTransform: "uppercase", borderBottom: "1px solid #eee", paddingBottom: "4px" }}>Top Skills</h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "#444" }}>{tailorResult.tailored_profile.skills?.join(", ")}</p>
                </div>
                
                <div style={{ marginBottom: "16px" }}>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#666", textTransform: "uppercase", borderBottom: "1px solid #eee", paddingBottom: "4px" }}>Experience</h4>
                  {tailorResult.tailored_profile.experience?.map((exp: any, i: number) => (
                    <div key={i} style={{ marginBottom: "12px" }}>
                      <p style={{ margin: "0 0 4px 0", fontWeight: "bold", fontSize: "14px", color: "#333" }}>{exp.role} | {exp.company}</p>
                      <p style={{ margin: 0, fontSize: "13px", color: "#555", lineHeight: "1.5" }}>• {exp.description}</p>
                    </div>
                  ))}
                </div>

                {/* Projects */}
                {tailorResult.tailored_profile.projects && tailorResult.tailored_profile.projects.length > 0 && (
                  <div style={{ marginTop: "24px" }}>
                    <h4 style={{ fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "12px" }}>
                      PROJECTS
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {tailorResult.tailored_profile.projects.map((proj: any, idx: number) => (
                        <div key={idx}>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{proj.title}</div>
                          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", lineHeight: 1.5 }}>
                            {proj.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Education */}
                {tailorResult.tailored_profile.education && tailorResult.tailored_profile.education.length > 0 && (
                  <div style={{ marginTop: "24px" }}>
                    <h4 style={{ fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "12px" }}>
                      EDUCATION
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {tailorResult.tailored_profile.education.map((edu: any, idx: number) => (
                        <div key={idx}>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{edu.institution}</div>
                          <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{edu.degree}</div>
                          {edu.year && <div style={{ fontSize: "12px", color: "var(--text-secondary)", opacity: 0.8 }}>{edu.year}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
            
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </>
  );
}
