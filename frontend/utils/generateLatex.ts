export function generateLatex(data: any): string {
  // Escape latex special characters
  const escapeLatex = (str: string) => {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "\\&")
      .replace(/%/g, "\\%")
      .replace(/\$/g, "\\$")
      .replace(/#/g, "\\#")
      .replace(/_/g, "\\_")
      .replace(/\{/g, "\\{")
      .replace(/\}/g, "\\}")
      .replace(/~/g, "\\textasciitilde{}")
      .replace(/\^/g, "\\textasciicircum{}")
      .replace(/\\/g, "\\textbackslash{}");
  };

  const name = escapeLatex(data.name || "YOUR NAME").toUpperCase();
  
  const location = escapeLatex(data.city ? `${data.city}${data.country ? `, ${data.country}` : ''}` : '');
  const phone = escapeLatex(data.phone || '');
  const email = escapeLatex(data.email || '');
  
  const contactItems = [];
  if (location) contactItems.push(location);
  if (phone) contactItems.push(`\\faPhone\\ ${phone}`);
  if (email) contactItems.push(`\\faEnvelope\\ \\href{mailto:${data.email}}{${email}}`);
  if (data.linkedin) contactItems.push(`\\faLinkedin\\ \\href{${data.linkedin}}{LinkedIn}`);
  if (data.github) contactItems.push(`\\faGithub\\ \\href{${data.github}}{GitHub}`);
  if (data.portfolio) contactItems.push(`\\faGlobe\\ \\href{${data.portfolio}}{Portfolio}`);

  const contactStr = contactItems.join(' \\;|\\; ');

  // Format Summary
  let summarySection = "";
  if (data.summary) {
    summarySection = `\\section*{Profile}\n\\small ${escapeLatex(data.summary)}\n`;
  }

  // Format Skills
  const skillsStr = data.skills ? escapeLatex(data.skills.join(", ")) : "";
  const skillsSection = skillsStr ? `\\section*{Skills}\n\\textbf{Technical Skills:} ${skillsStr}\\\\\\vspace{0.15cm}\n\n` : "";

  // Format Experience
  let experienceSection = "";
  if (data.experience && data.experience.length > 0) {
    experienceSection = "\\section*{Experience}\n\n";
    data.experience.forEach((exp: any) => {
      experienceSection += `\\textbf{${escapeLatex(exp.role)}} \\hfill ${escapeLatex(exp.company)}\\\\\n`;
      if (exp.duration) {
        experienceSection += `\\textit{${escapeLatex(exp.duration)}}\\\\\n`;
      }
      if (exp.description) {
        experienceSection += `\\begin{itemize}\n`;
        experienceSection += `    \\item ${escapeLatex(exp.description)}\n`;
        experienceSection += `\\end{itemize}\n\n`;
      }
      experienceSection += `\\vspace{0.15cm}\n\n`;
    });
  }

  // Format Projects
  let projectsSection = "";
  if (data.projects && data.projects.length > 0) {
    projectsSection = "\\section*{Projects}\n\n";
    data.projects.forEach((proj: any) => {
      projectsSection += `\\textbf{${escapeLatex(proj.title || proj.name)}}\\\\\n`;
      if (proj.technologies) {
        const techStr = Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies;
        projectsSection += `\\textit{Tech Stack: ${escapeLatex(techStr)}}\\\\\n`;
      } else if (proj.techStack) {
        const techStr = Array.isArray(proj.techStack) ? proj.techStack.join(", ") : proj.techStack;
        projectsSection += `\\textit{Tech Stack: ${escapeLatex(techStr)}}\\\\\n`;
      }
      if (proj.description) {
        projectsSection += `\\begin{itemize}\n`;
        projectsSection += `    \\item ${escapeLatex(proj.description)}\n`;
        projectsSection += `\\end{itemize}\n\n`;
      }
      projectsSection += `\\vspace{0.15cm}\n\n`;
    });
  }

  // Format Education
  let educationSection = "";
  if (data.education && data.education.length > 0) {
    educationSection = "\\section*{Education}\n\n";
    data.education.forEach((edu: any) => {
      educationSection += `\\textbf{${escapeLatex(edu.degree)}} \\hfill ${escapeLatex(edu.year || "")}\\\\\n`;
      educationSection += `${escapeLatex(edu.institution)}\\\\\n\n\\vspace{0.1cm}\n\n`;
    });
  }

  // Format Achievements
  let achievementsSection = "";
  if (data.achievements && data.achievements.length > 0) {
    achievementsSection = "\\section*{Achievements}\n\\begin{itemize}\n";
    data.achievements.forEach((ach: string) => {
      achievementsSection += `    \\item ${escapeLatex(ach)}\n`;
    });
    achievementsSection += "\\end{itemize}\n\\vspace{0.15cm}\n\n";
  }

  // Format Certifications
  let certificationsSection = "";
  if (data.certifications && data.certifications.length > 0) {
    certificationsSection = "\\section*{Certifications}\n\\begin{itemize}\n";
    data.certifications.forEach((cert: string) => {
      certificationsSection += `    \\item ${escapeLatex(cert)}\n`;
    });
    certificationsSection += "\\end{itemize}\n\\vspace{0.15cm}\n\n";
  }

  return `\\documentclass[11pt,a4paper]{article}

%==================== PACKAGES ====================%
\\usepackage[left=1.0cm, right=1.0cm, top=1.0cm, bottom=1.0cm]{geometry}
\\usepackage{enumitem}
\\usepackage[colorlinks=true, linkcolor=blue, urlcolor=blue]{hyperref}
\\usepackage{titlesec}
\\usepackage{fontawesome5}
\\usepackage{mathptmx} % Times New Roman font

%==================== FORMATTING ====================%
\\setlength{\\parindent}{0pt}
\\setlist[itemize]{noitemsep, topsep=1pt, parsep=1.5pt, partopsep=0pt, leftmargin=15pt}

% Section heading format
\\titleformat{\\section}
  {\\fontsize{12}{14}\\selectfont\\bfseries}
  {}
  {0em}
  {}
  [\\titlerule]

\\titlespacing*{\\section}{0pt}{1.2ex}{0.8ex}

\\begin{document}

%==================== HEADER ====================%
\\begin{center}
    {\\fontsize{18}{20}\\selectfont \\textbf{${name}}}\\\\[4pt]
    \\small ${contactStr}
\\end{center}

\\vspace{-0.1cm}

${summarySection}
${educationSection}
${projectsSection}
${skillsSection}
${experienceSection}
${achievementsSection}
${certificationsSection}

\\end{document}
`;
}
