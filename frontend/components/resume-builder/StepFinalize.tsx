import React from 'react';
import { ResumeData } from '@/types/resume';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { TEMPLATES } from '../resume-templates';
import { generateLatex } from '@/utils/generateLatex';

interface Props {
  data: ResumeData;
  selectedTemplateId: string;
}

export function StepFinalize({ data, selectedTemplateId }: Props) {
  const template = TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0];
  const TemplateComponent = template.component;

  const handleOverleafExport = () => {
    // Map data to expected format for generateLatex
    const mappedData = {
      name: `${data.firstName} ${data.lastName}`.trim(),
      email: data.email,
      phone: data.phone,
      city: data.city,
      country: data.country,
      linkedin: data.linkedin,
      github: data.github,
      portfolio: data.portfolio,
      summary: data.summary,
      education: data.education,
      experience: data.experience,
      skills: data.skills,
      projects: data.projects.map(p => ({
        title: p.name,
        description: p.description,
        technologies: p.techStack
      })),
      certifications: data.certifications,
      achievements: data.achievements,
    };

    const latexCode = generateLatex(mappedData);
    
    // Create form to submit to Overleaf
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://www.overleaf.com/docs';
    form.target = '_blank';
    
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'snip';
    input.value = latexCode;
    form.appendChild(input);
    
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Finalize & Download</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
        Review your resume in the live preview panel. When you're ready, download it as a PDF or open it in Overleaf to edit the LaTeX source code.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '300px' }}>
        <PDFDownloadLink
          document={<TemplateComponent data={data} />}
          fileName={`${data.firstName || 'My'}_${data.lastName || 'Resume'}.pdf`}
          style={{
            textDecoration: 'none',
            padding: '12px 24px',
            backgroundColor: 'var(--accent)',
            color: 'white',
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: 'bold',
            display: 'block'
          }}
        >
          {({ loading }) => (loading ? 'Preparing document...' : 'Download PDF')}
        </PDFDownloadLink>

        <button
          onClick={handleOverleafExport}
          style={{
            padding: '12px 24px',
            backgroundColor: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Open in Overleaf
        </button>
      </div>
    </div>
  );
}
