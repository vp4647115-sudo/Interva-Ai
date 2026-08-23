export type ResumeTemplate = "minimal" | "modern" | "professional";

export type ResumeEntry = {
  id: number;
  title: string;
  company: string;
  dates: string;
  description: string;
};

export type ProjectEntry = {
  id: number;
  name: string;
  technologies: string;
  description: string;
};

export type ResumeDraft = {
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  degree: string;
  school: string;
  skills: string[];
  experience: ResumeEntry[];
  projects: ProjectEntry[];
};
