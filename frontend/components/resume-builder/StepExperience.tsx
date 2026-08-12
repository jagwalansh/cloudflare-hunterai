import React from 'react';
import { ResumeData, ExperienceEntry } from '@/types/resume';

interface Props {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}
import { AIImproveButton } from './AIImproveButton';

export function StepExperience({ data, onChange }: Props) {
  const handleAdd = () => {
    const newEntry: ExperienceEntry = {
      id: `exp_${Date.now()}`,
      company: '',
      role: '',
      duration: '',
      description: ''
    };
    onChange({ ...data, experience: [...data.experience, newEntry] });
  };

  const handleUpdate = (index: number, field: keyof ExperienceEntry, value: string) => {
    const updated = [...data.experience];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, experience: updated });
  };

  const handleImproveAccept = (index: number, newText: string) => {
    handleUpdate(index, 'description', newText);
  };

  const handleRemove = (index: number) => {
    const updated = data.experience.filter((_, i) => i !== index);
    onChange({ ...data, experience: updated });
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

  const textareaStyle = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical' as const
  };

  const labelStyle = {
    display: 'block',
    fontWeight: 'bold',
    fontSize: '0.9rem'
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Experience</h2>
        <button onClick={handleAdd} style={{ padding: '8px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-primary)' }}>
          + Add Experience
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {data.experience.map((exp, index) => (
          <div key={exp.id} style={{ border: '1px solid var(--border)', padding: '20px', borderRadius: '8px', background: 'var(--bg-base)', position: 'relative' }}>
            <button 
              onClick={() => handleRemove(index)}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'var(--rose, #E63946)', cursor: 'pointer' }}
              title="Remove entry"
            >
              Remove
            </button>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' }}>
              <div>
                <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Company</label>
                <input value={exp.company} onChange={(e) => handleUpdate(index, 'company', e.target.value)} style={inputStyle} placeholder="Company Name" />
              </div>
              <div>
                <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Role / Title</label>
                <input value={exp.role} onChange={(e) => handleUpdate(index, 'role', e.target.value)} style={inputStyle} placeholder="Software Engineer" />
              </div>
            </div>
            
            <div>
              <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Duration</label>
              <input value={exp.duration || ''} onChange={(e) => handleUpdate(index, 'duration', e.target.value)} style={inputStyle} placeholder="e.g. Jan 2023 - Present" />
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={labelStyle}>Description / Achievements</label>
                <AIImproveButton 
                  sectionType="experience" 
                  currentText={exp.description || ''} 
                  context={{ role: exp.role, company: exp.company }}
                  onAccept={(text) => handleImproveAccept(index, text)} 
                />
              </div>
              <textarea value={exp.description} onChange={(e) => handleUpdate(index, 'description', e.target.value)} style={textareaStyle} placeholder="Describe your responsibilities and achievements..." />
            </div>
          </div>
        ))}
        {data.experience.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic' }}>No experience added yet.</p>
        )}
      </div>
    </div>
  );
}
