import { Profile } from "@/types";
import { ResumeData, ExperienceEntry, EducationEntry, ProjectEntry } from "@/types/resume";

export function getEmptyResumeData(): ResumeData {
  return {
    firstName: "",
    lastName: "",
    headline: "",
    email: "",
    phone: "",
    city: "",
    country: "",
    linkedin: "",
    github: "",
    portfolio: "",
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    achievements: [],
  };
}

export function mapProfileToResumeData(profile: Profile | null): ResumeData {
  if (!profile) {
    return getEmptyResumeData();
  }

  // Name splitting
  const nameParts = (profile.name || "").trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Education mapping
  const education: EducationEntry[] = (profile.education || []).map((edu, idx) => ({
    id: `edu_${idx}_${idx}`,
    institution: edu.institution || "",
    degree: edu.degree || "",
    year: edu.year || "",
    gpa: "",
  }));

  // Experience mapping
  const experience: ExperienceEntry[] = (profile.experience || []).map((exp, idx) => ({
    id: `exp_${idx}_${idx}`,
    company: exp.company || "",
    role: exp.role || "",
    duration: exp.duration || "",
    description: exp.description || exp.summary || "",
  }));

  // Projects mapping
  const projects: ProjectEntry[] = (profile.projects || []).map((proj, idx) => ({
    id: `proj_${idx}_${idx}`,
    name: proj.title || "",
    description: proj.description || "",
    techStack: proj.technologies || [],
  }));

  return {
    firstName,
    lastName,
    headline: "",
    email: profile.email || "",
    phone: profile.phone || "",
    city: "",
    country: "",
    linkedin: "",
    github: "",
    portfolio: "",
    summary: "",
    experience,
    education,
    skills: profile.skills || [],
    projects,
    certifications: [],
    achievements: [],
  };
}
