"use client";

// frontend/app/components/PreferenceChat.tsx
//
// Free-text preference input for the recommendation engine. Submits the
// user's raw text to /api/recommendations/preferences, then shows:
//   1. a "receipt" of what the AI understood (for user verification), and
//   2. the resulting ranked job list.
//
// Drop into a dashboard page, e.g.:
//   <PreferenceChat userId={session.user.id} />

import { useState, type FormEvent } from "react";
import {
  Loader2,
  MapPin,
  DollarSign,
  Briefcase,
  ListChecks,
  Sparkles,
  SearchX,
} from "lucide-react";
import {
  fetchPreferenceRecommendations,
  RecommendationApiError,
  type PreferenceResponse,
} from "@/lib/recommendations";

interface PreferenceChatProps {
  userId: string;
  className?: string;
}

const EXAMPLE_PROMPT =
  "e.g. \"I want an internship in San Francisco or remote, minimum stipend of $2000, and I'd prefer a software engineering role.\"";

export default function PreferenceChat({ userId, className = "" }: PreferenceChatProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PreferenceResponse | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() || loading) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetchPreferenceRecommendations(text.trim(), userId);
      setResult(response);
    } catch (err) {
      setError(
        err instanceof RecommendationApiError
          ? err.message
          : "Something went wrong reaching the recommendation engine. Please try again.",
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`w-full max-w-3xl ${className}`}>
      {/* --- Input --- */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 transition-colors"
      >
        <label htmlFor="preference-input" className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
          <Sparkles className="h-4 w-4 text-emerald-700" aria-hidden="true" />
          Tell us what you're looking for
        </label>
        <textarea
          id="preference-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={EXAMPLE_PROMPT}
          rows={3}
          disabled={loading}
          className="w-full resize-none border-0 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 text-[15px] leading-relaxed disabled:opacity-60"
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-slate-400">Describe location, pay, and role in your own words.</p>
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Analyzing your preferences...
              </>
            ) : (
              "Find matches"
            )}
          </button>
        </div>
      </form>

      {/* --- Error --- */}
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* --- Receipt: what the AI understood --- */}
      {result && (
        <div className="mt-6">
          <PreferenceReceipt preferences={result.preferences} />
        </div>
      )}

      {/* --- Job results --- */}
      {result && (
        <div className="mt-6 space-y-3">
          {result.jobs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 py-10 text-center">
              <SearchX className="h-6 w-6 text-slate-400" aria-hidden="true" />
              <p className="text-sm text-slate-500">
                No open roles match every filter yet. Try loosening the stipend or location.
              </p>
            </div>
          ) : (
            result.jobs.map((match) => <JobMatchCard key={match.job.id} match={match} />)
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Receipt: a verifiable, ticket-style summary of the parsed preferences.
// Only categories the AI actually found something for are shown.
// ---------------------------------------------------------------------------

function PreferenceReceipt({ preferences }: { preferences: PreferenceResponse["preferences"] }) {
  const rows: { icon: React.ReactNode; label: string; value: string }[] = [];

  if (preferences.preferred_locations.length > 0) {
    rows.push({
      icon: <MapPin className="h-3.5 w-3.5" aria-hidden="true" />,
      label: "Location",
      value: preferences.preferred_locations.join(" / "),
    });
  }
  if (preferences.min_stipend_monthly != null) {
    rows.push({
      icon: <DollarSign className="h-3.5 w-3.5" aria-hidden="true" />,
      label: "Min stipend",
      value: `$${preferences.min_stipend_monthly.toLocaleString()}/mo`,
    });
  }
  if (preferences.role_keywords.length > 0) {
    rows.push({
      icon: <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />,
      label: "Role",
      value: preferences.role_keywords.join(", "),
    });
  }
  if (preferences.must_have.length > 0) {
    rows.push({
      icon: <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />,
      label: "Must have",
      value: preferences.must_have.join(", "),
    });
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        The AI didn't pick up any specific filters from that text — showing your regular matches.
      </p>
    );
  }

  return (
    <div className="relative rounded-xl border border-slate-200 bg-slate-50">
      {/* perforated edge notches, meant to sit against the page's own background */}
      <span className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white border border-slate-200" />
      <span className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white border border-slate-200" />

      <div className="px-5 py-4">
        <p className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 mb-3">
          Filters applied
        </p>
        <dl className="grid gap-2 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start gap-2">
              <span className="mt-0.5 text-emerald-700">{row.icon}</span>
              <div>
                <dt className="text-[11px] font-mono text-slate-400">{row.label}</dt>
                <dd className="text-sm text-slate-800">{row.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
      <div className="border-t border-dashed border-slate-300" />
      <p className="px-5 py-2 text-[11px] text-slate-400">
        Not quite right? Refine your sentence above and search again.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Job result card
// ---------------------------------------------------------------------------

function JobMatchCard({ match }: { match: PreferenceResponse["jobs"][number] }) {
  const { job, match_score, matched_preferences } = match;

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:border-emerald-600 transition-colors">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-slate-900 truncate">{job.title}</h3>
          {matched_preferences.includes("role_keyword") && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              Role match
            </span>
          )}
          {matched_preferences.includes("preferred_location") && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              Location match
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 truncate">{job.company}</p>
        <p className="mt-1 text-xs text-slate-400">
          {job.is_remote ? "Remote" : job.location}
          {job.stipend_monthly != null && ` · $${job.stipend_monthly.toLocaleString()}/mo`}
        </p>
      </div>

      <div className="flex flex-col items-end shrink-0">
        <span className="text-lg font-mono font-semibold text-emerald-700">
          {Math.round(match_score)}%
        </span>
        <span className="text-[10px] text-slate-400">match</span>
      </div>
    </div>
  );
}
