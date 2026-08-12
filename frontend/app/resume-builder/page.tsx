"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

import { TEMPLATES } from '@/components/resume-templates';
import { dummyResumeData } from '@/lib/dummyResumeData';

export default function ResumeTemplateGalleryPage() {
  const router = useRouter();

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose a Template</h1>
        <p className="text-gray-500 mb-8">Select a design to start. You can change this anytime.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map((template) => {
            const Preview = template.previewComponent;
            return (
              <button
                key={template.id}
                onClick={() => router.push(`/resume-builder/${template.id}`)}
                className="group text-left rounded-xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.03] hover:shadow-2xl hover:border-blue-300 hover:z-10 relative outline-none"
                style={{ transformOrigin: 'center bottom' }}
              >
                {/* THUMBNAIL — fixed aspect-ratio box, overflow-hidden stops neighbor bleed */}
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-50 border-b border-gray-100 flex items-start justify-center pt-8">
                  {template.badge && (
                    <span
                      className={`absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-transform duration-300 group-hover:scale-110
                        ${template.badge === 'recommended' ? 'bg-gray-900' : 'bg-blue-600'}`}
                    >
                      {template.badge}
                    </span>
                  )}
                  {/* Scaled-down HTML preview */}
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[800px] h-[1130px] shrink-0 origin-top scale-[0.35] bg-white shadow-sm pointer-events-none transition-transform duration-300 ease-out group-hover:scale-[0.37]">
                    <Preview data={dummyResumeData} />
                  </div>
                </div>

                <div className="p-5 flex items-center justify-between bg-white">
                  <div>
                    <p className="font-bold text-gray-900 text-lg mb-1">{template.name}</p>
                    <p className="text-sm text-gray-500">{template.description}</p>
                  </div>
                  <span className="text-sm font-bold text-blue-600 flex items-center gap-1 transition-transform duration-300 group-hover:translate-x-1">
                    Use <span>→</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
  );
}
