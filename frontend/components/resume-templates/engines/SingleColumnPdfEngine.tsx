import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ResumeData } from '@/types/resume';
import { ResumeTheme } from '@/types/resumeTheme';

interface Props {
  data: ResumeData;
  theme: ResumeTheme;
}

export function SingleColumnPdfEngine({ data, theme }: Props) {
  // Map our strict ResumeData to the shape we render
  const name = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'YOUR NAME';
  const email = data.email || '';
  const phone = data.phone || '';
  const location = data.city ? `${data.city}${data.country ? `, ${data.country}` : ''}` : '';
  const links = [data.linkedin, data.github, data.portfolio].filter(Boolean).join(' | ');

  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      fontFamily: theme.fontBody,
      fontSize: 11,
      lineHeight: 1.3,
    },
    pagePadding: {
      padding: '30pt 40pt',
    },
    headerPlain: {
      textAlign: 'center',
      marginBottom: 15,
    },
    headerBanner: {
      backgroundColor: theme.accentColor,
      color: '#ffffff',
      padding: '30pt 40pt',
      textAlign: 'center',
      marginBottom: 15,
    },
    namePlain: {
      fontSize: 20,
      fontFamily: theme.fontHeading,
      textTransform: 'uppercase',
      color: theme.accentColor,
      marginBottom: 4,
    },
    nameBanner: {
      fontSize: 20,
      fontFamily: theme.fontHeading,
      textTransform: 'uppercase',
      color: '#ffffff',
      marginBottom: 4,
    },
    contactPlain: {
      fontSize: 10,
      color: '#333333',
    },
    contactBanner: {
      fontSize: 10,
      color: '#eeeeee',
    },
    section: {
      marginTop: 10,
      marginBottom: 6,
      paddingHorizontal: theme.headerStyle === 'plain' ? 0 : '40pt',
    },
    sectionTitleBase: {
      fontSize: 12,
      fontFamily: theme.fontHeading,
      textTransform: 'uppercase',
      marginBottom: 6,
    },
    sectionTitleUnderline: {
      borderBottom: `1px solid ${theme.accentColor}`,
      paddingBottom: 2,
      color: theme.accentColor,
    },
    sectionTitleBar: {
      borderBottom: `2px solid ${theme.accentColor}`,
      paddingBottom: 2,
      color: '#000000',
    },
    sectionTitleBoxed: {
      backgroundColor: theme.accentColor,
      color: '#ffffff',
      padding: '4pt 8pt',
      alignSelf: 'flex-start',
    },
    sectionTitleCaps: {
      color: theme.accentColor,
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
    },
    bulletPoint: {
      flexDirection: 'row',
      marginBottom: 2,
    },
    bullet: {
      width: 15,
      fontSize: 11,
      color: theme.accentColor,
    },
    bulletText: {
      flex: 1,
    }
  });

  const isBanner = theme.headerStyle === 'dark-banner' || theme.headerStyle === 'color-banner';
  
  let sectionTitleStyle = { ...styles.sectionTitleBase };
  if (theme.headingStyle === 'underline') sectionTitleStyle = { ...sectionTitleStyle, ...styles.sectionTitleUnderline };
  else if (theme.headingStyle === 'bar') sectionTitleStyle = { ...sectionTitleStyle, ...styles.sectionTitleBar };
  else if (theme.headingStyle === 'boxed-label') sectionTitleStyle = { ...sectionTitleStyle, ...styles.sectionTitleBoxed };
  else if (theme.headingStyle === 'caps-plain') sectionTitleStyle = { ...sectionTitleStyle, ...styles.sectionTitleCaps };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={!isBanner ? styles.pagePadding : undefined}>
          
          {/* Header */}
          <View style={isBanner ? styles.headerBanner : styles.headerPlain}>
            <Text style={isBanner ? styles.nameBanner : styles.namePlain}>{name}</Text>
            {(location || phone || email) && (
              <Text style={isBanner ? styles.contactBanner : styles.contactPlain}>
                {[location, phone, email].filter(Boolean).join(' | ')}
              </Text>
            )}
            {links && (
              <Text style={isBanner ? styles.contactBanner : styles.contactPlain}>
                {links}
              </Text>
            )}
          </View>

          {/* Wrapper for content padding if banner is used */}
          <View style={isBanner ? { paddingHorizontal: '40pt', paddingBottom: '30pt' } : undefined}>
            
            {/* Career Objective */}
            {data.summary && (
              <View style={styles.section}>
                <Text style={sectionTitleStyle}>Career Objective</Text>
                <Text>{data.summary}</Text>
              </View>
            )}

            {/* Education */}
            {data.education && data.education.length > 0 && (
              <View style={styles.section}>
                <Text style={sectionTitleStyle}>Education</Text>
                {data.education.map((edu, i) => (
                  <View key={i} style={{ marginBottom: 4 }}>
                    <View style={styles.row}>
                      <Text style={styles.bold}>{edu.degree || edu.institution}</Text>
                      <Text>{edu.year}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text>{edu.degree ? edu.institution : ''}</Text>
                      <Text>{edu.gpa ? `GPA: ${edu.gpa}` : ''}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Experience */}
            {data.experience && data.experience.length > 0 && (
              <View style={styles.section}>
                <Text style={sectionTitleStyle}>Experience</Text>
                {data.experience.map((exp, i) => (
                  <View key={i} style={{ marginBottom: 6 }}>
                    <View style={styles.row}>
                      <Text style={styles.bold}>{exp.role}</Text>
                      <Text>{exp.duration}</Text>
                    </View>
                    <Text style={{ color: theme.accentColor, marginBottom: 2 }}>{exp.company}</Text>
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

            {/* Projects */}
            {data.projects && data.projects.length > 0 && (
              <View style={styles.section}>
                <Text style={sectionTitleStyle}>Projects</Text>
                {data.projects.map((proj, i) => (
                  <View key={i} style={{ marginBottom: 6 }}>
                    <View style={styles.row}>
                      <Text style={styles.bold}>{proj.name}</Text>
                    </View>
                    {proj.techStack && proj.techStack.length > 0 && (
                      <Text style={styles.italic}>Tech Stack: {proj.techStack.join(', ')}</Text>
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

            {/* Skills */}
            {data.skills && data.skills.length > 0 && (
              <View style={styles.section}>
                <Text style={sectionTitleStyle}>Skills</Text>
                <Text><Text style={styles.bold}>Technical Skills: </Text>{data.skills.join(', ')}</Text>
              </View>
            )}
            
            {/* Achievements */}
            {data.achievements && data.achievements.length > 0 && (
              <View style={styles.section}>
                <Text style={sectionTitleStyle}>Achievements</Text>
                {data.achievements.map((ach, i) => (
                  <View key={i} style={styles.bulletPoint}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{ach}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Certifications */}
            {data.certifications && data.certifications.length > 0 && (
              <View style={styles.section}>
                <Text style={sectionTitleStyle}>Certifications</Text>
                {data.certifications.map((cert, i) => (
                  <View key={i} style={styles.bulletPoint}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{cert}</Text>
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
