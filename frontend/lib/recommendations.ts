// frontend/app/lib/recommendations.ts
//
// Types + fetch helper for the natural-language preference recommendation
// feature. Mirrors the Pydantic models in backend/engine/preference_extractor.py
// and backend/engine/matching_engine.py.

export interface PreferenceFilters {
  preferred_locations: string[];
  min_stipend_monthly: number | null;
  role_keywords: string[];
  must_have: string[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  is_remote: boolean;
  stipend_monthly: number | null;
  description: string;
  required_skills: string[];
}

export interface JobMatch {
  job: Job;
  ats_score: number;
  match_score: number;
  matched_preferences: string[];
}

export interface PreferenceResponse {
  preferences: PreferenceFilters;
  jobs: JobMatch[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class RecommendationApiError extends Error {}

/**
 * Sends free-text preferences to the backend, which parses them with an LLM
 * and returns both the structured filters and the re-ranked job list.
 */
export async function fetchPreferenceRecommendations(
  text: string,
  _userId: string,
): Promise<PreferenceResponse> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const { createClient } = await import("@/lib/supabase/client");
  const { data: { session } } = await createClient().auth.getSession();
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

  const res = await fetch(`${API_BASE_URL}/api/recommendations/preferences`, {
    method: "POST",
    headers,
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new RecommendationApiError(
      body?.detail ?? `Request failed with status ${res.status}`,
    );
  }

  return res.json();
}
