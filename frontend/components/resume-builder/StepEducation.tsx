import React from 'react';
import { ResumeData, EducationEntry } from '@/types/resume';

interface Props {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

export function StepEducation({ data, onChange }: Props) {
  const handleAdd = () => {
    const newEntry: EducationEntry = {
      id: `edu_${Date.now()}`,
      institution: '',
      degree: '',
      year: '',
      gpa: ''
    };
    onChange({ ...data, education: [...data.education, newEntry] });
  };

  const handleUpdate = (index: number, field: keyof EducationEntry, value: string) => {
    const updated = [...data.education];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, education: updated });
  };

  const handleRemove = (index: number) => {
    const updated = data.education.filter((_, i) => i !== index);
    onChange({ ...data, education: updated });
  };

  const inputStyle = {
    fontSize: '1rem',
    padding: '0.75rem',
    minHeight: '48px',
    boxSizing: 'border-box' as const,
    width: '100%',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg-base)',
    color: 'var(--text-primary)',
    marginBottom: '1rem'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    fontSize: '0.9rem'
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Education</h2>
        <button onClick={handleAdd} style={{ padding: '8px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-primary)' }}>
          + Add Education
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {data.education.map((edu, index) => (
          <div key={edu.id} style={{ border: '1px solid var(--border)', padding: '20px', borderRadius: '8px', background: 'var(--bg-base)', position: 'relative' }}>
            <button 
              onClick={() => handleRemove(index)}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'var(--rose, #E63946)', cursor: 'pointer' }}
              title="Remove entry"
            >
              Remove
            </button>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginTop: '10px' }}>
              <div>
                <label style={labelStyle}>Institution</label>
                <input value={edu.institution} onChange={(e) => handleUpdate(index, 'institution', e.target.value)} style={inputStyle} placeholder="University or School Name" />
              </div>
              <div>
                <label style={labelStyle}>Degree / Field of Study</label>
                <input value={edu.degree} onChange={(e) => handleUpdate(index, 'degree', e.target.value)} style={inputStyle} placeholder="B.S. in Computer Science" />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Graduation Year</label>
                <input value={edu.year || ''} onChange={(e) => handleUpdate(index, 'year', e.target.value)} style={inputStyle} placeholder="e.g. 2025" />
              </div>
              <div>
                <label style={labelStyle}>GPA (Optional)</label>
                <input value={edu.gpa || ''} onChange={(e) => handleUpdate(index, 'gpa', e.target.value)} style={inputStyle} placeholder="e.g. 3.8 / 4.0" />
              </div>
            </div>
          </div>
        ))}
        {data.education.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic' }}>No education added yet.</p>
        )}
      </div>
    </div>
  );
}
