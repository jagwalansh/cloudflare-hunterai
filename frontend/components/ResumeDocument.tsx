"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: '30pt 40pt',
    fontFamily: 'Times-Roman',
    fontSize: 11,
    lineHeight: 1.3,
  },
  header: {
    textAlign: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  contact: {
    fontSize: 10,
  },
  section: {
    marginTop: 10,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Times-Bold',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    borderBottom: '1px solid black',
    paddingBottom: 2,
    marginBottom: 6,
  },
  bold: {
    fontFamily: 'Times-Bold',
  },
  italic: {
    fontFamily: 'Times-Italic',
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
  },
  bulletText: {
    flex: 1,
  }
});

interface ResumeDocumentProps {
  data: any; 
}

export const ResumeDocument = ({ data }: ResumeDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{data.name || [data.firstName, data.lastName].filter(Boolean).join(' ')}</Text>
        {(data.city || data.country || data.phone || data.email) && (
          <Text style={styles.contact}>
            {[data.city && `${data.city}${data.country ? `, ${data.country}` : ''}`, data.phone, data.email].filter(Boolean).join(' | ')}
          </Text>
        )}
        {(data.linkedin || data.github || data.portfolio) && (
          <Text style={styles.contact}>
            {[data.linkedin, data.github, data.portfolio].filter(Boolean).join(' | ')}
          </Text>
        )}
      </View>

      {/* Career Objective */}
      {data.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Career Objective</Text>
          <Text>{data.summary}</Text>
        </View>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        {data.education.map((edu: any, i: number) => (
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
      </View>}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {data.projects.map((proj: any, i: number) => {
            const technologies = proj.technologies || proj.techStack;
            return <View key={i} style={{ marginBottom: 6 }}>
              <View style={styles.row}>
                <Text style={styles.bold}>{proj.title || proj.name}</Text>
              </View>
              {technologies && (
                <Text style={styles.italic}>Tech Stack: {Array.isArray(technologies) ? technologies.join(', ') : technologies}</Text>
              )}
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{proj.description}</Text>
              </View>
            </View>;
          })}
        </View>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text><Text style={styles.bold}>Technical Skills: </Text>{data.skills.join(', ')}</Text>
        </View>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {data.experience.map((exp: any, i: number) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <View style={styles.row}>
                <Text style={styles.bold}>{exp.role}</Text>
                <Text>{exp.company}</Text>
              </View>
              {exp.duration && <Text style={styles.italic}>{exp.duration}</Text>}
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{exp.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {data.achievements?.length > 0 && <View style={styles.section}><Text style={styles.sectionTitle}>Achievements</Text>{data.achievements.map((item: string, index: number) => <View key={index} style={styles.bulletPoint}><Text style={styles.bullet}>•</Text><Text style={styles.bulletText}>{item}</Text></View>)}</View>}
      {data.certifications?.length > 0 && <View style={styles.section}><Text style={styles.sectionTitle}>Certifications</Text>{data.certifications.map((item: string, index: number) => <View key={index} style={styles.bulletPoint}><Text style={styles.bullet}>•</Text><Text style={styles.bulletText}>{item}</Text></View>)}</View>}

    </Page>
  </Document>
);
