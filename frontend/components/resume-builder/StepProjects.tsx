import React from 'react';
import { ResumeData, ProjectEntry } from '@/types/resume';

interface Props {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}
import { AIImproveButton } from './AIImproveButton';

export function StepProjects({ data, onChange }: Props) {
  const handleAdd = () => {
    const newEntry: ProjectEntry = {
      id: `proj_${Date.now()}`,
      name: '',
      description: '',
      techStack: []
    };
    onChange({ ...data, projects: [...data.projects, newEntry] });
  };

  const handleUpdate = (index: number, field: keyof ProjectEntry, value: any) => {
    const updated = [...data.projects];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, projects: updated });
  };

  const handleImproveAccept = (index: number, newText: string) => {
    handleUpdate(index, 'description', newText);
  };

  const handleRemove = (index: number) => {
    const updated = data.projects.filter((_, i) => i !== index);
    onChange({ ...data, projects: updated });
  };

  const handleTechStackChange = (index: number, value: string) => {
    const techArray = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    handleUpdate(index, 'techStack', techArray);
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
        <h2 style={{ margin: 0 }}>Projects</h2>
        <button onClick={handleAdd} style={{ padding: '8px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-primary)' }}>
          + Add Project
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {data.projects.map((proj, index) => (
          <div key={proj.id} style={{ border: '1px solid var(--border)', padding: '20px', borderRadius: '8px', background: 'var(--bg-base)', position: 'relative' }}>
            <button 
              onClick={() => handleRemove(index)}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'var(--rose, #E63946)', cursor: 'pointer' }}
              title="Remove entry"
            >
              Remove
            </button>
            
            <div style={{ marginTop: '10px' }}>
              <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Project Name</label>
              <input value={proj.name} onChange={(e) => handleUpdate(index, 'name', e.target.value)} style={inputStyle} placeholder="E-commerce Application" />
            </div>
            
            <div>
              <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Tech Stack (comma separated)</label>
              <input 
                value={(proj.techStack || []).join(', ')} 
                onChange={(e) => handleTechStackChange(index, e.target.value)} 
                style={inputStyle} 
                placeholder="React, Node.js, MongoDB" 
              />
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={labelStyle}>Description / Key Features</label>
                <AIImproveButton 
                  sectionType="project" 
                  currentText={proj.description || ''} 
                  context={{ name: proj.name }}
                  onAccept={(text) => handleImproveAccept(index, text)} 
                />
              </div>
              <textarea value={proj.description} onChange={(e) => handleUpdate(index, 'description', e.target.value)} style={textareaStyle} placeholder="Describe what you built and the impact..." />
            </div>
          </div>
        ))}
        {data.projects.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic' }}>No projects added yet.</p>
        )}
      </div>
    </div>
  );
}
