import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ResumeData } from '@/types/resume';
import { ResumeTheme } from '@/types/resumeTheme';

interface Props {
  data: ResumeData;
  theme: ResumeTheme;
}

export function TwoColumnPdfEngine({ data, theme }: Props) {
  const name = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'YOUR NAME';
  const email = data.email || '';
  const phone = data.phone || '';
  const location = data.city ? `${data.city}${data.country ? `, ${data.country}` : ''}` : '';
  const links = [data.linkedin, data.github, data.portfolio].filter(Boolean).join(' | ');
  const contactItems = [location, phone, email, links].filter(Boolean);

  const isBanner = theme.headerStyle === 'dark-banner' || theme.headerStyle === 'color-banner';
  const isSidebarDark = theme.headerStyle === 'sidebar-dark';
  const sidebarPos = theme.sidebarPosition || 'left';

  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      fontFamily: theme.fontBody,
      fontSize: 10,
      lineHeight: 1.4,
    },
    banner: {
      backgroundColor: theme.accentColor,
      padding: '30pt 40pt',
      textAlign: 'center',
    },
    bannerName: {
      fontSize: 24,
      fontFamily: theme.fontHeading,
      textTransform: 'uppercase',
      color: '#ffffff',
      marginBottom: 6,
    },
    bannerContact: {
      fontSize: 10,
      color: '#eeeeee',
      marginBottom: 2,
    },
    columnsContainer: {
      flexDirection: sidebarPos === 'left' ? 'row' : 'row-reverse',
      flexGrow: 1,
    },
    sidebar: {
      width: '32%',
      backgroundColor: isSidebarDark ? theme.accentColor : '#f8fafc',
      padding: '30pt 20pt',
      borderRight: sidebarPos === 'left' && !isSidebarDark ? '1px solid #e2e8f0' : 'none',
      borderLeft: sidebarPos === 'right' && !isSidebarDark ? '1px solid #e2e8f0' : 'none',
    },
    main: {
      width: '68%',
      padding: '30pt 30pt',
      backgroundColor: '#ffffff',
    },
    sidebarName: {
      fontSize: 22,
      fontFamily: theme.fontHeading,
      textTransform: 'uppercase',
      color: '#ffffff',
      marginBottom: 8,
      lineHeight: 1.1,
    },
    sidebarHeadline: {
      fontSize: 12,
      color: '#eeeeee',
      marginBottom: 15,
    },
    mainName: {
      fontSize: 24,
      fontFamily: theme.fontHeading,
      textTransform: 'uppercase',
      color: theme.accentColor,
      marginBottom: 8,
    },
    mainHeadline: {
      fontSize: 12,
      color: '#475569',
      marginBottom: 12,
    },
    section: {
      marginBottom: 15,
    },
    sectionTitleBase: {
      fontSize: 12,
      fontFamily: theme.fontHeading,
      textTransform: 'uppercase',
      marginBottom: 8,
    },
    sectionTitleUnderline: {
      borderBottom: `1px solid ${theme.accentColor}`,
      paddingBottom: 2,
    },
    sectionTitleBar: {
      borderBottom: `2px solid ${isSidebarDark ? '#ffffff' : '#000000'}`,
      paddingBottom: 2,
    },
    sectionTitleBoxed: {
      backgroundColor: theme.accentColor,
      color: '#ffffff',
      padding: '4pt 8pt',
      alignSelf: 'flex-start',
    },
    bold: {
      fontFamily: theme.fontHeading,
    },
    italic: {
      fontFamily: theme.fontBody === 'Helvetica' ? 'Helvetica-Oblique' : 'Times-Italic',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    },
    bulletPoint: {
      flexDirection: 'row',
      marginTop: 3,
    },
    bullet: {
      width: 12,
      fontSize: 10,
      color: theme.accentColor,
    },
    bulletText: {
      flex: 1,
      color: '#334155',
    },
    skillBadge: {
      backgroundColor: isSidebarDark ? '#ffffff20' : '#e2e8f0',
      padding: '3pt 6pt',
      borderRadius: 2,
      marginBottom: 4,
      marginRight: 4,
      color: isSidebarDark ? '#ffffff' : '#334155',
      fontSize: 9,
    },
    skillsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    }
  });

  const getSectionTitleStyle = (inSidebar: boolean = false) => {
    let titleStyle: any = { ...styles.sectionTitleBase };
    titleStyle.color = (inSidebar && isSidebarDark) ? '#ffffff' : theme.accentColor;

    if (theme.headingStyle === 'underline') {
      titleStyle = { ...titleStyle, ...styles.sectionTitleUnderline };
      if (inSidebar && isSidebarDark) titleStyle.borderBottom = '1px solid #ffffff';
    } else if (theme.headingStyle === 'bar') {
      titleStyle = { ...titleStyle, ...styles.sectionTitleBar };
      titleStyle.color = (inSidebar && isSidebarDark) ? '#ffffff' : '#000000';
    } else if (theme.headingStyle === 'boxed-label') {
      titleStyle = { ...titleStyle, ...styles.sectionTitleBoxed };
      if (inSidebar && isSidebarDark) {
        titleStyle.backgroundColor = '#ffffff';
        titleStyle.color = theme.accentColor;
      }
    }
    return titleStyle;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Banner Header */}
        {isBanner && (
          <View style={styles.banner}>
            <Text style={styles.bannerName}>{name}</Text>
            {data.headline && <Text style={{ ...styles.bannerContact, marginBottom: 8, fontSize: 12 }}>{data.headline}</Text>}
            <Text style={styles.bannerContact}>{contactItems.join(' | ')}</Text>
          </View>
        )}

        <View style={styles.columnsContainer}>
          
          {/* Sidebar */}
          <View style={styles.sidebar}>
            {isSidebarDark && (
              <View style={{ marginBottom: 20 }}>
                <Text style={styles.sidebarName}>{name}</Text>
                {data.headline && <Text style={styles.sidebarHeadline}>{data.headline}</Text>}
                {contactItems.map((item, i) => (
                  <Text key={i} style={{ color: '#eeeeee', marginBottom: 4, fontSize: 9 }}>{item}</Text>
                ))}
              </View>
            )}

            {data.skills && data.skills.length > 0 && (
              <View style={styles.section}>
                <Text style={getSectionTitleStyle(true)}>Skills</Text>
                <View style={styles.skillsContainer}>
                  {data.skills.map((skill, i) => (
                    <Text key={i} style={styles.skillBadge}>{skill}</Text>
                  ))}
                </View>
              </View>
            )}

            {data.education && data.education.length > 0 && (
              <View style={styles.section}>
                <Text style={getSectionTitleStyle(true)}>Education</Text>
                {data.education.map((edu, i) => (
                  <View key={i} style={{ marginBottom: 10 }}>
                    <Text style={{ ...styles.bold, color: isSidebarDark ? '#ffffff' : '#1e293b', fontSize: 11, marginBottom: 2 }}>{edu.degree || edu.institution}</Text>
                    <Text style={{ color: isSidebarDark ? '#eeeeee' : '#475569', fontSize: 9, marginBottom: 2 }}>{edu.degree ? edu.institution : ''}</Text>
                    <Text style={{ color: isSidebarDark ? '#cccccc' : '#64748b', fontSize: 9 }}>{edu.year}</Text>
                  </View>
                ))}
              </View>
            )}

            {data.certifications && data.certifications.length > 0 && (
              <View style={styles.section}>
                <Text style={getSectionTitleStyle(true)}>Certifications</Text>
                {data.certifications.map((cert, i) => (
                  <Text key={i} style={{ color: isSidebarDark ? '#eeeeee' : '#475569', fontSize: 9, marginBottom: 4 }}>• {cert}</Text>
                ))}
              </View>
            )}
          </View>

          {/* Main Column */}
          <View style={styles.main}>
            {!isBanner && !isSidebarDark && (
              <View style={{ marginBottom: 20 }}>
                <Text style={styles.mainName}>{name}</Text>
                {data.headline && <Text style={styles.mainHeadline}>{data.headline}</Text>}
                {contactItems.map((item, i) => (
                  <Text key={i} style={{ color: '#475569', marginBottom: 4, fontSize: 10 }}>{item}</Text>
                ))}
              </View>
            )}

            {data.summary && (
              <View style={styles.section}>
                <Text style={getSectionTitleStyle(false)}>Profile</Text>
                <Text style={{ color: '#334155' }}>{data.summary}</Text>
              </View>
            )}

            {data.experience && data.experience.length > 0 && (
              <View style={styles.section}>
                <Text style={getSectionTitleStyle(false)}>Experience</Text>
                {data.experience.map((exp, i) => (
                  <View key={i} style={{ marginBottom: 12 }}>
                    <View style={styles.row}>
                      <Text style={{ ...styles.bold, fontSize: 11, color: '#0f172a' }}>{exp.role}</Text>
                      <Text style={{ fontSize: 9, color: '#64748b' }}>{exp.duration}</Text>
                    </View>
                    <Text style={{ ...styles.bold, color: theme.accentColor, marginBottom: 4 }}>{exp.company}</Text>
                    {exp.description && (
                      <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{exp.description}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {data.projects && data.projects.length > 0 && (
              <View style={styles.section}>
                <Text style={getSectionTitleStyle(false)}>Projects</Text>
                {data.projects.map((proj, i) => (
                  <View key={i} style={{ marginBottom: 12 }}>
                    <Text style={{ ...styles.bold, fontSize: 11, color: '#0f172a', marginBottom: 2 }}>{proj.name}</Text>
                    {proj.techStack && proj.techStack.length > 0 && (
                      <Text style={{ ...styles.italic, fontSize: 9, color: '#64748b', marginBottom: 4 }}>Tech Stack: {proj.techStack.join(', ')}</Text>
                    )}
                    {proj.description && (
                      <View style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{proj.description}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {data.achievements && data.achievements.length > 0 && (
              <View style={styles.section}>
                <Text style={getSectionTitleStyle(false)}>Achievements</Text>
                {data.achievements.map((ach, i) => (
                  <View key={i} style={styles.bulletPoint}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{ach}</Text>
                  </View>
                ))}
              </View>
            )}

          </View>
        </View>
      </Page>
    </Document>
  );
}
