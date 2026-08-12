"use client";

import { useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Bot, Send, Loader2, Target, Lightbulb, AlertTriangle } from "lucide-react";
import api from "@/lib/api";

interface ActionItem {
  category: string;
  suggestion: string;
}

interface ResumeInsights {
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  action_items: ActionItem[];
  response_message: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<ResumeInsights | null>(null);

  const handleAsk = async () => {
    if (!query.trim() || !user) return;
    setLoading(true);
    setInsights(null);

    try {
      const data = await api.chat(query);
      setInsights(data);
    } catch (e) {
      console.error(e);
      alert("Error talking to AI. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="card" style={{ padding: 48, textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)" }}>Please sign in to chat with Gemini.</p>
      </div>
    );
  }

  return (
    <>
      <div className="fade-up">
        <h1 className="section-heading">AI Career Coach</h1>
        <p className="section-eyebrow">Powered by Groq (Llama 3)</p>
      </div>

      <div className="card fade-up fade-up-delay-1" style={{ padding: 24, marginTop: 32, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ 
            width: 40, height: 40, borderRadius: 20, background: "var(--accent-light)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Bot size={20} className="text-primary" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 2 }}>Llama 3 Insight Engine</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Ask me about your resume, missing skills, or what you should improve.</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <input 
            type="text" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAsk()}
            placeholder="e.g. How does my resume look? What should I change?"
            style={{
              flex: 1, padding: "16px 20px", borderRadius: 12, border: "1px solid var(--border)",
              background: "var(--bg-base)", color: "var(--text-primary)", fontSize: 15,
              outline: "none"
            }}
          />
          <button 
            onClick={handleAsk}
            disabled={loading || !query.trim()}
            className="btn-primary"
            style={{ padding: "0 24px", display: "flex", alignItems: "center", gap: 8, height: 52 }}
          >
            {loading ? <Loader2 size={18} className="spin" /> : <><Send size={18} /> Ask AI</>}
          </button>
        </div>
      </div>

      {insights && (
        <div className="fade-up fade-up-delay-2" style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Response Message */}
          <div className="card" style={{ padding: 24, background: "var(--bg-elevated)", border: "1px solid var(--accent-light)" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <Bot size={24} color="var(--accent)" style={{ marginTop: 2 }} />
              <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--text-primary)" }}>
                {insights.response_message}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 24 }}>
            {/* Score Card */}
            <div className="card" style={{ flex: "0 0 240px", padding: 32, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: 24, textTransform: "uppercase" }}>
                POWERED BY GROQ
              </div>
              <div style={{ fontSize: 64, fontFamily: "var(--font-display)", color: "var(--accent)", lineHeight: 1 }}>
                {insights.overall_score}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8 }}>out of 100</div>
            </div>

            {/* Strengths & Weaknesses */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <Target size={18} color="#10B981" />
                  <h3 style={{ fontSize: 16, fontFamily: "var(--font-display)" }}>Key Strengths</h3>
                </div>
                <ul style={{ margin: 0, paddingLeft: 24, color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
                  {insights.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>

              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <AlertTriangle size={18} color="#F59E0B" />
                  <h3 style={{ fontSize: 16, fontFamily: "var(--font-display)" }}>Areas for Improvement</h3>
                </div>
                <ul style={{ margin: 0, paddingLeft: 24, color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
                  {insights.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Items */}
          <div className="card" style={{ padding: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <Lightbulb size={20} color="var(--accent)" />
              <h3 style={{ fontSize: 20, fontFamily: "var(--font-display)" }}>Recommended Action Items</h3>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {insights.action_items.map((action, i) => (
                <div key={i} style={{ display: "flex", gap: 16, padding: "16px 0", borderBottom: i < insights.action_items.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ flex: "0 0 120px" }}>
                    <span className="skill-pill skill-pill-neutral" style={{ background: "var(--bg-base)" }}>
                      {action.category}
                    </span>
                  </div>
                  <div style={{ flex: 1, fontSize: 15, color: "var(--text-primary)", lineHeight: 1.5 }}>
                    {action.suggestion}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
