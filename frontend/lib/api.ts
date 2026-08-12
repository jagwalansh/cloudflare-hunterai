const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

let authToken: string | null = null;

const getHeaders = async (customHeaders: Record<string, string> = {}) => {
  const headers: Record<string, string> = { ...customHeaders };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  } else {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
    } catch {
      // Ignored if client is not configured
    }
  }
  return headers;
};

export const api = {
  setToken: (token: string | null) => {
    authToken = token;
  },

  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/file/upload/resume`, {
      method: "POST",
      headers: await getHeaders(),
      body: formData,
    });
    if (!res.ok) {
      let errDetail = `HTTP error! status: ${res.status}`;
      try {
        const errJson = await res.json();
        errDetail = errJson.detail || errDetail;
      } catch (e) {}
      throw new Error(errDetail);
    }
    const data = await res.json();
    return data;
  },

  getProfile: async () => {
    const res = await fetch(`${BASE_URL}/profile`, {
      headers: await getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load profile");
    return res.json();
  },

  getProfiles: async () => {
    const res = await fetch(`${BASE_URL}/profiles`, {
      headers: await getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load profiles");
    return res.json();
  },

  getMatches: async (
    email?: string, 
    keyword?: string, 
    location?: string, 
    remoteOnly?: boolean, 
    stipendMin?: number, 
    durationMax?: number,
    sources?: string,
    jobTypes?: string
  ) => {
    let url = `${BASE_URL}/matches`;
    const params = new URLSearchParams();
    if (email) params.append("email", email);
    if (keyword) params.append("keyword", keyword);
    if (location) params.append("location", location);
    if (remoteOnly) params.append("remote_only", "true");
    if (stipendMin) params.append("stipend_min", stipendMin.toString());
    if (durationMax) params.append("duration_max", durationMax.toString());
    if (sources) params.append("sources", sources);
    if (jobTypes) params.append("job_types", jobTypes);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    const res = await fetch(url, {
      headers: await getHeaders(),
    });
    if (res.status === 400) return [];
    if (!res.ok) throw new Error("Failed to load matches");
    const data = await res.json();
    return data;
  },

  saveProfile: async (payload: any) => {
    const res = await fetch(`${BASE_URL}/profile`, {
      method: "POST",
      headers: await getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to save profile");
    return res.json();
  },

  migrateProfile: async (guestUserId: string) => {
    const res = await fetch(`${BASE_URL}/profile/migrate`, {
      method: "POST",
      headers: await getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ guest_user_id: guestUserId }),
    });
    if (!res.ok) throw new Error("Failed to migrate profile");
    return res.json();
  },

  getSavedInternships: async () => {
    const res = await fetch(`${BASE_URL}/profile/saved`, {
      headers: await getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load saved internships");
    return res.json();
  },

  saveInternship: async (jobId: number) => {
    const res = await fetch(`${BASE_URL}/profile/saved`, {
      method: "POST",
      headers: await getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ job_id: jobId }),
    });
    if (!res.ok) throw new Error("Failed to save internship");
    return res.json();
  },

  unsaveInternship: async (jobId: number) => {
    const res = await fetch(`${BASE_URL}/profile/saved/${jobId}`, {
      method: "DELETE",
      headers: await getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to unsave internship");
    return res.json();
  },

  getJob: async (jobId: number) => {
    const res = await fetch(`${BASE_URL}/jobs/${jobId}`, {
      headers: await getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load job details");
    return res.json();
  },

  generateTailorPlan: async (jobId: number, feedback?: string) => {
    const res = await fetch(`${BASE_URL}/api/tailor-resume/plan`, {
      method: "POST",
      headers: { ...await getHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ job_id: jobId, feedback })
    });
    if (!res.ok) {
      let errDetail = "Failed to generate tailor plan";
      try {
        const errJson = await res.json();
        errDetail = errJson.detail || errDetail;
      } catch (e) {}
      throw new Error(errDetail);
    }
    return res.json();
  },

  tailorResume: async (jobId: number, approvedPlan?: string) => {
    const res = await fetch(`${BASE_URL}/api/tailor-resume`, {
      method: "POST",
      headers: { ...await getHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ job_id: jobId, approved_plan: approvedPlan })
    });
    if (!res.ok) {
      let errDetail = "Failed to tailor resume";
      try {
        const errJson = await res.json();
        errDetail = errJson.detail || errDetail;
      } catch (e) {}
      throw new Error(errDetail);
    }
    const data = await res.json();
    return data;
  },

  chat: async (message: string) => {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: await getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error("Failed to chat");
    return res.json();
  },

  generateResumeWithAI: async (payload: import('@/types/resume').GenerateResumeRequest): Promise<import('@/types/resume').ResumeData> => {
    const res = await fetch(`${BASE_URL}/resume-ai/generate`, {
      method: 'POST',
      headers: await getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      let errDetail = 'AI generation failed';
      try {
        const errJson = await res.json();
        errDetail = errJson.detail || errDetail;
      } catch (e) {}
      throw new Error(errDetail);
    }
    return res.json();
  },

  improveSectionWithAI: async (payload: import('@/types/resume').ImproveSectionRequest): Promise<string[]> => {
    const res = await fetch(`${BASE_URL}/resume-ai/improve-section`, {
      method: 'POST',
      headers: await getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      let errDetail = 'AI improve failed';
      try {
        const errJson = await res.json();
        errDetail = errJson.detail || errDetail;
      } catch (e) {}
      throw new Error(errDetail);
    }
    const data = await res.json();
    return data.suggestions;
  },

  parseSectionWithAI: async (sectionType: string, userPrompt: string) => {
    const res = await fetch(`${BASE_URL}/resume-ai/parse-section`, {
      method: 'POST',
      headers: await getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ section_type: sectionType, user_prompt: userPrompt }),
    });
    if (!res.ok) {
      let errDetail = 'AI parse failed';
      try {
        const errJson = await res.json();
        errDetail = errJson.detail || errDetail;
      } catch (e) {}
      throw new Error(errDetail);
    }
    return res.json();
  },

  // ── Recruiter API ─────────────────────────────────────────────────────

  getRecruiterDashboard: async () => {
    const res = await fetch(`${BASE_URL}/recruiter/dashboard`, {
      headers: await getHeaders(),
    });
    if (!res.ok) {
      let errDetail = "Failed to load recruiter dashboard";
      try { const errJson = await res.json(); errDetail = errJson.detail || errDetail; } catch (e) {}
      throw new Error(errDetail);
    }
    return res.json();
  },

  createJobPosting: async (data: {
    title: string;
    company: string;
    description: string;
    skills_required?: string[];
    location?: string;
    salary_range?: string;
    job_type?: string;
    is_remote?: boolean;
  }) => {
    const res = await fetch(`${BASE_URL}/recruiter/jobs`, {
      method: "POST",
      headers: await getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      let errDetail = "Failed to create job posting";
      try { const errJson = await res.json(); errDetail = errJson.detail || errDetail; } catch (e) {}
      throw new Error(errDetail);
    }
    return res.json();
  },

  getRecruiterJobs: async () => {
    const res = await fetch(`${BASE_URL}/recruiter/jobs`, {
      headers: await getHeaders(),
    });
    if (!res.ok) {
      let errDetail = "Failed to load job postings";
      try { const errJson = await res.json(); errDetail = errJson.detail || errDetail; } catch (e) {}
      throw new Error(errDetail);
    }
    return res.json();
  },

  getRecruiterJob: async (id: number) => {
    const res = await fetch(`${BASE_URL}/recruiter/jobs/${id}`, {
      headers: await getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load job posting");
    return res.json();
  },

  updateJobPosting: async (id: number, data: Record<string, unknown>) => {
    const res = await fetch(`${BASE_URL}/recruiter/jobs/${id}`, {
      method: "PUT",
      headers: await getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update job posting");
    return res.json();
  },

  deleteJobPosting: async (id: number) => {
    const res = await fetch(`${BASE_URL}/recruiter/jobs/${id}`, {
      method: "DELETE",
      headers: await getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete job posting");
    return res.json();
  },

  getJobCandidates: async (jobId: number) => {
    const res = await fetch(`${BASE_URL}/recruiter/jobs/${jobId}/candidates`, {
      headers: await getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load candidates");
    return res.json();
  },

  updateApplicationStatus: async (applicationId: number, status: string) => {
    const res = await fetch(`${BASE_URL}/recruiter/applications/${applicationId}/status`, {
      method: "PUT",
      headers: await getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update application status");
    return res.json();
  },

  browseJobPostings: async (params?: { keyword?: string; location?: string; remote_only?: boolean; job_type?: string }) => {
    const url = new URL(`${BASE_URL}/recruiter/browse-jobs`);
    if (params?.keyword) url.searchParams.set("keyword", params.keyword);
    if (params?.location) url.searchParams.set("location", params.location);
    if (params?.remote_only) url.searchParams.set("remote_only", "true");
    if (params?.job_type) url.searchParams.set("job_type", params.job_type);
    const res = await fetch(url.toString(), {
      headers: await getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to browse job postings");
    return res.json();
  },

  applyToJob: async (jobPostingId: number) => {
    const res = await fetch(`${BASE_URL}/recruiter/apply/${jobPostingId}`, {
      method: "POST",
      headers: await getHeaders(),
    });
    if (!res.ok) {
      let errDetail = "Failed to apply";
      try { const errJson = await res.json(); errDetail = errJson.detail || errDetail; } catch (e) {}
      throw new Error(errDetail);
    }
    return res.json();
  },

  getMyApplications: async () => {
    const res = await fetch(`${BASE_URL}/recruiter/my-applications`, {
      headers: await getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to load my applications");
    return res.json();
  },

  getCandidateResumeUrl: (applicationId: number) => {
    return `${BASE_URL}/recruiter/applications/${applicationId}/resume`;
  },
};

export default api;
