import React from 'react';
import { ResumeData } from '@/types/resume';

interface Props {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

export function StepPersonal({ data, onChange }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, [e.target.name]: e.target.value });
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
      <h2 style={{ marginBottom: '20px' }}>Personal Information</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label htmlFor="firstName" style={labelStyle}>First Name</label>
          <input id="firstName" name="firstName" value={data.firstName} onChange={handleChange} style={inputStyle} autoComplete="given-name" />
        </div>
        <div>
          <label htmlFor="lastName" style={labelStyle}>Last Name</label>
          <input id="lastName" name="lastName" value={data.lastName} onChange={handleChange} style={inputStyle} autoComplete="family-name" />
        </div>
      </div>
      
      <div>
        <label htmlFor="headline" style={labelStyle}>Professional Headline</label>
        <input id="headline" name="headline" value={data.headline} onChange={handleChange} style={inputStyle} placeholder="e.g. Software Engineer" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label htmlFor="email" style={labelStyle}>Email</label>
          <input id="email" type="email" name="email" value={data.email} onChange={handleChange} style={inputStyle} autoComplete="email" />
        </div>
        <div>
          <label htmlFor="phone" style={labelStyle}>Phone</label>
          <input id="phone" type="tel" name="phone" value={data.phone} onChange={handleChange} style={inputStyle} autoComplete="tel" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label htmlFor="city" style={labelStyle}>City</label>
          <input id="city" name="city" value={data.city} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="country" style={labelStyle}>Country</label>
          <input id="country" name="country" value={data.country} onChange={handleChange} style={inputStyle} />
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <div>
          <label htmlFor="linkedin" style={labelStyle}>LinkedIn URL</label>
          <input id="linkedin" name="linkedin" value={data.linkedin} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="github" style={labelStyle}>GitHub URL</label>
          <input id="github" name="github" value={data.github} onChange={handleChange} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="portfolio" style={labelStyle}>Portfolio URL</label>
          <input id="portfolio" name="portfolio" value={data.portfolio} onChange={handleChange} style={inputStyle} />
        </div>
      </div>
    </div>
  );
}
