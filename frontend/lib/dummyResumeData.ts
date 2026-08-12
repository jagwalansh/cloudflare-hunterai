import { ResumeData } from '@/types/resume';

export const dummyResumeData: ResumeData = {
  firstName: "Alex",
  lastName: "Morgan",
  headline: "Senior Frontend Engineer",
  email: "alex.morgan@example.com",
  phone: "(555) 123-4567",
  city: "San Francisco",
  country: "USA",
  linkedin: "linkedin.com/in/alexmorgan",
  github: "github.com/alexmorgan",
  portfolio: "alexmorgan.dev",
  summary: "Experienced Frontend Engineer with a strong focus on building scalable, accessible, and performant web applications. Passionate about React ecosystem and modern web standards. Proven track record of leading UI architecture for high-traffic platforms.",
  experience: [
    {
      id: "exp_1",
      company: "TechNova Solutions",
      role: "Senior Frontend Engineer",
      duration: "2021 - Present",
      description: "Led the migration of a legacy dashboard to a modern Next.js stack, improving performance by 40%. Mentored junior engineers and established robust CI/CD practices."
    },
    {
      id: "exp_2",
      company: "Creative Web Studio",
      role: "Frontend Developer",
      duration: "2018 - 2021",
      description: "Developed interactive data visualization tools using React and D3.js. Collaborated closely with designers to implement pixel-perfect, responsive UI components."
    }
  ],
  education: [
    {
      id: "edu_1",
      institution: "University of California, Berkeley",
      degree: "B.S. Computer Science",
      year: "2018",
      gpa: "3.8"
    }
  ],
  skills: [
    "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Tailwind CSS", "GraphQL", "Jest"
  ],
  projects: [
    {
      id: "proj_1",
      name: "E-Commerce Storefront",
      description: "Built a high-performance headless e-commerce storefront supporting 10k+ daily active users.",
      techStack: ["Next.js", "Stripe", "Tailwind CSS"]
    }
  ],
  certifications: ["AWS Certified Developer"],
  achievements: ["Hackathon Winner 2022"]
};
