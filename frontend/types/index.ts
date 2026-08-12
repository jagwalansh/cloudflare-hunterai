export interface Profile {
  user_id?: string;
  name?: string;
  username?: string;
  email: string;
  phone?: string;
  skills?: string[];
  education?: Education[];
  experience?: Experience[];
  projects?: Project[];
  saved_internships?: number[];
  urls?: Record<string, string>;
  created_at?: string;
}

export interface Education {
  degree: string;
  institution: string;
  year?: string;
}

export interface Experience {
  role: string;
  company: string;
  duration?: string;
  description?: string;
  summary?: string;
}

export interface Project {
  title: string;
  description?: string;
  technologies?: string[];
}

export interface JobMatch {
  id?: number;
  job_title: string;
  company: string;
  score: number;
  location?: string;
  stipend?: string;
  duration?: string;
  url?: string;
  matched_skills: string[];
  missing_skills: string[];
  source?: string;
  matched_projects?: string[];
  suitability_assessment?: string;
  suitability_level?: string;
}
