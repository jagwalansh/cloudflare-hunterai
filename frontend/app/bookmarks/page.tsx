"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { MapPin, Banknote, Bookmark as BookmarkIcon, CalendarDays, ExternalLink } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Job {
  id: number;
  job_title: string;
  company: string;
  location: string;
  stipend: string;
  duration: string;
  url: string;
  source: string;
  required_skills: string[];
}

export default function BookmarksPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    api.getSavedInternships()
      .then(data => {
        setJobs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching bookmarks:", err);
        setLoading(false);
      });
  }, [user]);

  const removeBookmark = async (id: number) => {
    if (!user) return;
    setJobs(prev => prev.filter(j => j.id !== id));
    
    try {
      await api.unsaveInternship(id);
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <div className="card" style={{ padding: 48, textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)" }}>Please sign in to view saved jobs.</p>
      </div>
    );
  }

  return (
    <>
      <div className="fade-up">
        <h1 className="section-heading">Saved Internships</h1>
        <p className="section-eyebrow">Your bookmarked opportunities</p>
      </div>

      <div style={{ marginTop: 32 }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card skeleton" style={{ height: 160 }} />
            <div className="card skeleton" style={{ height: 160 }} />
          </div>
        ) : jobs.length === 0 ? (
          <div className="card fade-up fade-up-delay-1" style={{ padding: 48, textAlign: "center" }}>
            <div style={{ 
              width: 64, height: 64, borderRadius: 32, background: "var(--bg-elevated)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px"
            }}>
              <BookmarkIcon size={24} color="var(--text-muted)" />
            </div>
            <h3 style={{ fontSize: 18, fontFamily: "var(--font-display)", marginBottom: 8 }}>No Saved Jobs</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              When you bookmark internships from your recommendations, they will appear here.
            </p>
            <Link href="/recommendations" style={{ 
              display: "inline-block", marginTop: 24, padding: "10px 20px", 
              background: "var(--accent)", color: "white", borderRadius: 24, 
              fontSize: 14, fontWeight: 600, textDecoration: "none"
            }}>
              Browse Matches
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {jobs.map((job, i) => (
              <div 
                key={job.id} 
                className={`card fade-up fade-up-delay-${Math.min(i + 1, 5)}`} 
                style={{ padding: 24, display: "flex", gap: 24 }}
              >
                {/* Left side */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 20, fontFamily: "var(--font-display)", color: "var(--text-primary)", marginBottom: 4 }}>
                        {job.job_title}
                      </h3>
                      <div style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>
                        {job.company}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => removeBookmark(job.id)}
                      style={{ 
                        background: "var(--accent-light)", border: "none", width: 40, height: 40, 
                        borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", transition: "transform 0.2s"
                      }}
                      onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
                      onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                      title="Remove bookmark"
                    >
                      <BookmarkIcon size={18} fill="var(--accent)" color="var(--accent)" />
                    </button>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
                      <MapPin size={14} color="var(--accent)" />
                      {job.location || "Not specified"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
                      <Banknote size={14} color="var(--accent)" />
                      {job.stipend || "Unpaid"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
                      <CalendarDays size={14} color="var(--accent)" />
                      {job.duration || "N/A"}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: 8 }}>
                      Required Skills
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {(job.required_skills || []).slice(0, 8).map(skill => (
                        <div key={skill} className="skill-pill skill-pill-neutral">
                          {skill}
                        </div>
                      ))}
                      {job.required_skills?.length > 8 && (
                        <div className="skill-pill skill-pill-neutral">
                          +{job.required_skills.length - 8} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side Actions */}
                {job.url && (
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", borderLeft: "1px dashed var(--border)", paddingLeft: 24, minWidth: 160 }}>
                    <a 
                      href={job.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%" }}
                    >
                      Apply Now <ExternalLink size={16} />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
