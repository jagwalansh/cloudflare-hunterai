import React from 'react';
import { ResumeData } from '@/types/resume';
import { ResumeTheme } from '@/types/resumeTheme';

interface Props {
  data: ResumeData;
  theme: ResumeTheme;
}

export function SingleColumnHtmlEngine({ data, theme }: Props) {
  const name = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'YOUR NAME';
  const email = data.email || '';
  const phone = data.phone || '';
  const location = data.city ? `${data.city}${data.country ? `, ${data.country}` : ''}` : '';
  const links = [data.linkedin, data.github, data.portfolio].filter(Boolean).join(' | ');

  // Mapping PDF fonts to web safe approximations for HTML preview
  const headingFontFamily = theme.fontHeading.toLowerCase().includes('times') ? 'Times New Roman, Times, serif' : 'Helvetica, Arial, sans-serif';
  const bodyFontFamily = theme.fontBody.toLowerCase().includes('times') ? 'Times New Roman, Times, serif' : 'Helvetica, Arial, sans-serif';

  const isBanner = theme.headerStyle === 'dark-banner' || theme.headerStyle === 'color-banner';

  const getSectionTitleStyle = () => {
    const base: React.CSSProperties = {
      fontSize: '16px',
      fontFamily: headingFontFamily,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      marginBottom: '12px',
      marginTop: '20px',
    };
    
    if (theme.headingStyle === 'underline') {
      return { ...base, borderBottom: `1px solid ${theme.accentColor}`, paddingBottom: '4px', color: theme.accentColor };
    } else if (theme.headingStyle === 'bar') {
      return { ...base, borderBottom: `2px solid ${theme.accentColor}`, paddingBottom: '4px', color: '#000000' };
    } else if (theme.headingStyle === 'boxed-label') {
      return { ...base, backgroundColor: theme.accentColor, color: '#ffffff', padding: '6px 12px', display: 'inline-block' };
    } else if (theme.headingStyle === 'caps-plain') {
      return { ...base, color: theme.accentColor };
    }
    return base;
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100%',
      backgroundColor: '#ffffff',
      fontFamily: bodyFontFamily,
      fontSize: '14px',
      lineHeight: 1.5,
      color: '#333333'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: isBanner ? theme.accentColor : 'transparent',
        color: isBanner ? '#ffffff' : '#333333',
        padding: '40px 50px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '28px',
          fontFamily: headingFontFamily,
          textTransform: 'uppercase',
          fontWeight: 'bold',
          color: isBanner ? '#ffffff' : theme.accentColor,
          margin: '0 0 8px 0',
        }}>
          {name}
        </h1>
        
        {(location || phone || email) && (
          <div style={{ fontSize: '13px', color: isBanner ? '#eeeeee' : '#555555', marginBottom: '4px' }}>
            {[location, phone, email].filter(Boolean).join(' | ')}
          </div>
        )}
        
        {links && (
          <div style={{ fontSize: '13px', color: isBanner ? '#eeeeee' : '#555555' }}>
            {links}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ padding: '0 50px 40px 50px' }}>
        
        {/* Career Objective */}
        {data.summary && (
          <div>
            <div style={getSectionTitleStyle()}>Career Objective</div>
            <p style={{ margin: 0 }}>{data.summary}</p>
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div>
            <div style={getSectionTitleStyle()}>Education</div>
            {data.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: headingFontFamily, fontWeight: 'bold' }}>{edu.degree || edu.institution}</span>
                  <span>{edu.year}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{edu.degree ? edu.institution : ''}</span>
                  <span>{edu.gpa ? `GPA: ${edu.gpa}` : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <div>
            <div style={getSectionTitleStyle()}>Experience</div>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: headingFontFamily, fontWeight: 'bold' }}>{exp.role}</span>
                  <span>{exp.duration}</span>
                </div>
                <div style={{ color: theme.accentColor, fontWeight: '500', marginBottom: '4px' }}>{exp.company}</div>
                {exp.description && (
                  <div style={{ display: 'flex', marginTop: '4px' }}>
                    <span style={{ width: '20px', color: theme.accentColor }}>•</span>
                    <span style={{ flex: 1 }}>{exp.description}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <div>
            <div style={getSectionTitleStyle()}>Projects</div>
            {data.projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: '16px' }}>
                <div style={{ fontFamily: headingFontFamily, fontWeight: 'bold' }}>{proj.name}</div>
                {proj.techStack && proj.techStack.length > 0 && (
                  <div style={{ fontStyle: 'italic', fontSize: '13px', margin: '2px 0 4px 0' }}>
                    Tech Stack: {proj.techStack.join(', ')}
                  </div>
                )}
                {proj.description && (
                  <div style={{ display: 'flex' }}>
                    <span style={{ width: '20px', color: theme.accentColor }}>•</span>
                    <span style={{ flex: 1 }}>{proj.description}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div>
            <div style={getSectionTitleStyle()}>Skills</div>
            <div style={{ margin: 0 }}>
              <span style={{ fontFamily: headingFontFamily, fontWeight: 'bold' }}>Technical Skills: </span>
              {data.skills.join(', ')}
            </div>
          </div>
        )}

        {/* Achievements */}
        {data.achievements && data.achievements.length > 0 && (
          <div>
            <div style={getSectionTitleStyle()}>Achievements</div>
            {data.achievements.map((ach, i) => (
              <div key={i} style={{ display: 'flex', marginBottom: '4px' }}>
                <span style={{ width: '20px', color: theme.accentColor }}>•</span>
                <span style={{ flex: 1 }}>{ach}</span>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <div>
            <div style={getSectionTitleStyle()}>Certifications</div>
            {data.certifications.map((cert, i) => (
              <div key={i} style={{ display: 'flex', marginBottom: '4px' }}>
                <span style={{ width: '20px', color: theme.accentColor }}>•</span>
                <span style={{ flex: 1 }}>{cert}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
