import React from 'react';
import { ResumeData } from '@/types/resume';
import { ResumeTheme } from '@/types/resumeTheme';

interface Props {
  data: ResumeData;
  theme: ResumeTheme;
}

export function TwoColumnHtmlEngine({ data, theme }: Props) {
  const name = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'YOUR NAME';
  const email = data.email || '';
  const phone = data.phone || '';
  const location = data.city ? `${data.city}${data.country ? `, ${data.country}` : ''}` : '';
  const links = [data.linkedin, data.github, data.portfolio].filter(Boolean).join(' | ');
  const contactItems = [location, phone, email, links].filter(Boolean);

  const headingFontFamily = theme.fontHeading.toLowerCase().includes('times') ? 'Times New Roman, Times, serif' : 'Helvetica, Arial, sans-serif';
  const bodyFontFamily = theme.fontBody.toLowerCase().includes('times') ? 'Times New Roman, Times, serif' : 'Helvetica, Arial, sans-serif';

  const isBanner = theme.headerStyle === 'dark-banner' || theme.headerStyle === 'color-banner';
  const isSidebarDark = theme.headerStyle === 'sidebar-dark';
  const sidebarPos = theme.sidebarPosition || 'left';

  const getSectionTitleStyle = (inSidebar: boolean = false) => {
    const base: React.CSSProperties = {
      fontSize: '15px',
      fontFamily: headingFontFamily,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      marginBottom: '10px',
      marginTop: '20px',
      color: (inSidebar && isSidebarDark) ? '#ffffff' : theme.accentColor,
    };
    
    if (theme.headingStyle === 'underline') {
      return { ...base, borderBottom: `1px solid ${(inSidebar && isSidebarDark) ? 'rgba(255,255,255,0.3)' : theme.accentColor}`, paddingBottom: '4px' };
    } else if (theme.headingStyle === 'bar') {
      return { ...base, borderBottom: `2px solid ${(inSidebar && isSidebarDark) ? '#ffffff' : '#000000'}`, paddingBottom: '4px', color: (inSidebar && isSidebarDark) ? '#ffffff' : '#000000' };
    } else if (theme.headingStyle === 'boxed-label') {
      return { ...base, backgroundColor: (inSidebar && isSidebarDark) ? '#ffffff' : theme.accentColor, color: (inSidebar && isSidebarDark) ? theme.accentColor : '#ffffff', padding: '4px 10px', display: 'inline-block' };
    } else if (theme.headingStyle === 'caps-plain') {
      return base;
    }
    return base;
  };

  const renderContactInfo = (color: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color }}>
      {contactItems.map((item, i) => (
        <div key={i}>{item}</div>
      ))}
    </div>
  );

  const renderSidebarContent = () => (
    <>
      {isSidebarDark && (
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', fontFamily: headingFontFamily, textTransform: 'uppercase', fontWeight: 'bold', color: '#ffffff', margin: '0 0 10px 0', lineHeight: 1.1 }}>
            {name}
          </h1>
          {data.headline && (
            <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', marginBottom: '15px' }}>
              {data.headline}
            </div>
          )}
          {renderContactInfo('rgba(255,255,255,0.8)')}
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={getSectionTitleStyle(true)}>Skills</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {data.skills.map((skill, i) => (
              <span key={i} style={{
                backgroundColor: isSidebarDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
                padding: '4px 8px',
                borderRadius: '4px',
                color: isSidebarDark ? '#ffffff' : '#334155',
                fontSize: '12px'
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={getSectionTitleStyle(true)}>Education</div>
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: isSidebarDark ? '#ffffff' : '#1e293b' }}>{edu.degree || edu.institution}</div>
              <div style={{ color: isSidebarDark ? 'rgba(255,255,255,0.8)' : '#475569', fontSize: '13px' }}>{edu.degree ? edu.institution : ''}</div>
              <div style={{ fontSize: '12px', color: isSidebarDark ? 'rgba(255,255,255,0.6)' : '#64748b' }}>{edu.year}</div>
            </div>
          ))}
        </div>
      )}
      
      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={getSectionTitleStyle(true)}>Certifications</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {data.certifications.map((cert, i) => (
              <div key={i} style={{ fontSize: '13px', color: isSidebarDark ? 'rgba(255,255,255,0.8)' : '#475569' }}>
                • {cert}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  const renderMainContent = () => (
    <>
      {!isBanner && !isSidebarDark && (
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontFamily: headingFontFamily, textTransform: 'uppercase', fontWeight: 'bold', color: theme.accentColor, margin: '0 0 10px 0', lineHeight: 1.1 }}>
            {name}
          </h1>
          {data.headline && (
            <div style={{ fontSize: '16px', color: '#475569', marginBottom: '15px' }}>
              {data.headline}
            </div>
          )}
          {renderContactInfo('#475569')}
        </div>
      )}

      {data.summary && (
        <div style={{ marginBottom: '25px' }}>
          <div style={getSectionTitleStyle(false)}>Profile</div>
          <div style={{ color: '#334155' }}>{data.summary}</div>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <div style={getSectionTitleStyle(false)}>Experience</div>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f172a' }}>{exp.role}</span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>{exp.duration}</span>
              </div>
              <div style={{ fontWeight: 'bold', color: theme.accentColor, marginBottom: '6px' }}>{exp.company}</div>
              <div style={{ color: '#334155', whiteSpace: 'pre-wrap', marginTop: '4px' }}>
                {exp.description && (
                  <div style={{ display: 'flex' }}>
                    <span style={{ width: '16px', color: theme.accentColor }}>•</span>
                    <span style={{ flex: 1 }}>{exp.description}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {data.projects && data.projects.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <div style={getSectionTitleStyle(false)}>Projects</div>
          {data.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f172a', marginBottom: '2px' }}>{proj.name}</div>
              {proj.techStack && proj.techStack.length > 0 && (
                <div style={{ fontStyle: 'italic', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
                  Tech Stack: {proj.techStack.join(', ')}
                </div>
              )}
              {proj.description && (
                <div style={{ display: 'flex', color: '#334155' }}>
                  <span style={{ width: '16px', color: theme.accentColor }}>•</span>
                  <span style={{ flex: 1 }}>{proj.description}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {data.achievements && data.achievements.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <div style={getSectionTitleStyle(false)}>Achievements</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {data.achievements.map((ach, i) => (
              <div key={i} style={{ display: 'flex', color: '#334155' }}>
                <span style={{ width: '16px', color: theme.accentColor }}>•</span>
                <span style={{ flex: 1 }}>{ach}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      fontFamily: bodyFontFamily,
      fontSize: '13px',
      lineHeight: 1.5,
      width: '100%',
      minHeight: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Top Banner (if applicable) */}
      {isBanner && (
        <div style={{
          backgroundColor: theme.accentColor,
          color: '#ffffff',
          padding: '40px 50px',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontSize: '32px',
            fontFamily: headingFontFamily,
            textTransform: 'uppercase',
            fontWeight: 'bold',
            color: '#ffffff',
            margin: '0 0 10px 0',
            letterSpacing: '1px'
          }}>
            {name}
          </h1>
          {data.headline && (
            <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', marginBottom: '15px' }}>
              {data.headline}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
            {contactItems.map((item, i) => (
              <span key={i}>{item}</span>
            ))}
          </div>
        </div>
      )}

      {/* 2-Column Layout */}
      <div style={{ display: 'flex', flex: 1, flexDirection: sidebarPos === 'left' ? 'row' : 'row-reverse' }}>
        
        {/* Sidebar */}
        <div style={{
          width: '32%',
          backgroundColor: isSidebarDark ? theme.accentColor : '#f8fafc',
          padding: '40px 30px',
          boxSizing: 'border-box',
          borderRight: sidebarPos === 'left' && !isSidebarDark ? '1px solid #e2e8f0' : 'none',
          borderLeft: sidebarPos === 'right' && !isSidebarDark ? '1px solid #e2e8f0' : 'none',
        }}>
          {renderSidebarContent()}
        </div>

        {/* Main Content */}
        <div style={{
          width: '68%',
          padding: '40px',
          boxSizing: 'border-box',
          backgroundColor: '#ffffff'
        }}>
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
}
