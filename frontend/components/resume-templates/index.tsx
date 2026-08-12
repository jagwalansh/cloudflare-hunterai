import React from 'react';
import { ResumeData } from '@/types/resume';
import { RESUME_THEMES } from '@/lib/resumeThemes';
import { SingleColumnPdfEngine } from './engines/SingleColumnPdfEngine';
import { SingleColumnHtmlEngine } from './engines/SingleColumnHtmlEngine';
import { TwoColumnPdfEngine } from './engines/TwoColumnPdfEngine';
import { TwoColumnHtmlEngine } from './engines/TwoColumnHtmlEngine';

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  badge?: 'recommended' | 'new';
  component: React.FC<{ data: ResumeData }>;
  previewComponent: React.FC<{ data: ResumeData }>;
}

export const TEMPLATES: TemplateDefinition[] = RESUME_THEMES.map(theme => {
  return {
    id: theme.id,
    name: theme.name,
    description: theme.description,
    badge: theme.badge,
    component: (props: { data: ResumeData }) => {
      if (theme.layout === 'two-column') {
        return <TwoColumnPdfEngine data={props.data} theme={theme} />;
      }
      return <SingleColumnPdfEngine data={props.data} theme={theme} />; 
    },
    previewComponent: (props: { data: ResumeData }) => {
      if (theme.layout === 'two-column') {
        return <TwoColumnHtmlEngine data={props.data} theme={theme} />;
      }
      return <SingleColumnHtmlEngine data={props.data} theme={theme} />;
    }
  };
});
