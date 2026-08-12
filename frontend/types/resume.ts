export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  duration?: string;
  description: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  year?: string;
  gpa?: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  techStack?: string[];
}

export interface ResumeData {
  firstName: string;
  lastName: string;
  headline: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  linkedin: string;
  github: string;
  portfolio: string;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  projects: ProjectEntry[];
  certifications?: string[];
  achievements?: string[];
}

export interface GenerateResumeRequest {
  targetRole?: string;
  rawExperience: string;
  rawProjects: string;
  rawEducation: string;
  knownSkills: string[];
}

export interface ImproveSectionRequest {
  sectionType: 'summary' | 'experience' | 'project' | 'headline';
  currentText: string;
  context?: Record<string, string>;
}
