"use client";

import React from 'react';
import { ResumeData } from '@/types/resume';
import { TEMPLATES } from '../resume-templates';
import { ExpandablePreview } from './ResumePageFrame';

interface Props {
  data: ResumeData;
  selectedTemplateId: string;
}

export function LivePreviewPanel({ data, selectedTemplateId }: Props) {
  const template = TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0];
  if (!template) return null;
  
  const PreviewComponent = template.previewComponent;

  return (
    <div className="lg:sticky lg:top-6">
      <ExpandablePreview>
        <PreviewComponent data={data} />
      </ExpandablePreview>
    </div>
  );
}
