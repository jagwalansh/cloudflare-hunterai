"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { ResumeData } from '@/types/resume';
import { getEmptyResumeData, mapProfileToResumeData } from '@/lib/resumeAutofill';
import { api } from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';
import { StepPersonal } from '@/components/resume-builder/StepPersonal';
import { StepSummary } from '@/components/resume-builder/StepSummary';
import { StepExperience } from '@/components/resume-builder/StepExperience';
import { StepEducation } from '@/components/resume-builder/StepEducation';
import { StepProjects } from '@/components/resume-builder/StepProjects';
import { StepSkills } from '@/components/resume-builder/StepSkills';
import { TEMPLATES } from '@/components/resume-templates';
import dynamic from 'next/dynamic';

const StepFinalize = dynamic(
  () => import('@/components/resume-builder/StepFinalize').then((mod) => mod.StepFinalize),
  { ssr: false }
);

const LivePreviewPanel = dynamic(
  () => import('@/components/resume-builder/LivePreviewPanel').then((mod) => mod.LivePreviewPanel),
  { ssr: false }
);
import { WizardProgressBar, StepSegmentIndicator, WizardStep } from '@/components/resume-builder/WizardProgressBar';
import { AIIntakeForm } from '@/components/resume-builder/AIIntakeForm';
import { Sparkles, PenTool } from 'lucide-react';

const STEPS: WizardStep[] = [
  { id: 1, label: 'Personal' },
  { id: 2, label: 'Summary' },
  { id: 3, label: 'Experience' },
  { id: 4, label: 'Education' },
  { id: 5, label: 'Projects' },
  { id: 6, label: 'Skills' },
  { id: 7, label: 'Finalize' },
];

export default function ResumeBuilderWizardPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeData, setResumeData] = useState<ResumeData>(getEmptyResumeData());
  const [loading, setLoading] = useState(true);

  // New state for AI Intake flow
  const [hasStarted, setHasStarted] = useState(false);
  const [showAIIntake, setShowAIIntake] = useState(false);

  const template = TEMPLATES.find((t) => t.id === templateId);

  // Guard: redirect to gallery if invalid template
  useEffect(() => {
    if (!template) router.replace('/resume-builder');
  }, [template, router]);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return; // Wait for user context
      
      try {
        if (!user.isGuest) {
          const profiles = await api.getProfiles();
          const profile = Array.isArray(profiles) ? profiles[0] : profiles;
          if (profile) {
            setResumeData(mapProfileToResumeData(profile));
            setHasStarted(true); // Skip intake if we autofilled from profile
          }
        }
      } catch (err) {
        console.error("Failed to load profile for autofill", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  if (!template) return null; // Wait for redirect

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--text-secondary)' }}>
        Loading your data...
      </div>
    );
  }

  const handleAIComplete = (data: ResumeData) => {
    setResumeData(data);
    setHasStarted(true);
    setShowAIIntake(false);
  };

  const totalSteps = STEPS.length;

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-4">
        {/* Top row: title + segmented step count */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/resume-builder')}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              ← Templates
            </button>
            <h1 className="text-xl font-bold text-gray-900 border-l border-gray-300 pl-3">
              {template.name}
            </h1>
          </div>
          {hasStarted && <StepSegmentIndicator total={totalSteps} currentStep={currentStep} />}
        </div>

        {/* AI Intake Flow / Choice Screen */}
        {!hasStarted ? (
          <div className="mt-12 flex flex-col items-center">
            {showAIIntake ? (
              <AIIntakeForm 
                onComplete={handleAIComplete} 
                onCancel={() => setShowAIIntake(false)} 
              />
            ) : (
              <div className="max-w-xl text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">How do you want to build this resume?</h2>
                <p className="text-gray-500 mb-8">You can generate a structured draft from your rough notes using AI, or start from a blank slate.</p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={() => setHasStarted(true)}
                    className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                      <PenTool className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <span className="font-bold text-gray-900">Start from Scratch</span>
                    <span className="text-sm text-gray-500 mt-2">Fill in your details manually</span>
                  </button>

                  <button
                    onClick={() => setShowAIIntake(true)}
                    className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-indigo-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                      <Sparkles className="w-6 h-6 text-indigo-600 group-hover:text-indigo-700" />
                    </div>
                    <span className="font-bold text-indigo-900">✨ Generate with AI</span>
                    <span className="text-sm text-indigo-600/70 mt-2">Paste raw notes, get a draft</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Step tabs row */}
            <div className="border-b border-gray-200 pb-4 mb-6">
              <WizardProgressBar
                steps={STEPS}
                currentStep={currentStep}
                onStepClick={(stepId) => setCurrentStep(stepId)}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">
              {/* Left panel: Wizard form */}
              <div className="flex flex-col gap-5">
                <div className="bg-white p-8 rounded-xl border border-gray-200 min-h-[400px] shadow-sm">
                  {currentStep === 1 && <StepPersonal data={resumeData} onChange={setResumeData} />}
                  {currentStep === 2 && <StepSummary data={resumeData} onChange={setResumeData} />}
                  {currentStep === 3 && <StepExperience data={resumeData} onChange={setResumeData} />}
                  {currentStep === 4 && <StepEducation data={resumeData} onChange={setResumeData} />}
                  {currentStep === 5 && <StepProjects data={resumeData} onChange={setResumeData} />}
                  {currentStep === 6 && <StepSkills data={resumeData} onChange={setResumeData} />}
                  {currentStep === 7 && <StepFinalize data={resumeData} selectedTemplateId={template.id} />}
                </div>
                
                <div className="flex justify-between mt-2">
                  <button 
                    onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                    disabled={currentStep === 1}
                    className={`px-6 py-3 rounded-lg border border-gray-200 bg-gray-50 font-bold ${currentStep === 1 ? 'cursor-not-allowed opacity-50 text-gray-400' : 'cursor-pointer text-gray-700 hover:bg-gray-100'}`}
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
                    disabled={currentStep === totalSteps}
                    className={`px-6 py-3 rounded-lg border-none bg-blue-600 text-white font-bold ${currentStep === totalSteps ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-blue-700'}`}
                  >
                    {currentStep === totalSteps - 1 ? 'Finalize' : 'Next'}
                  </button>
                </div>
              </div>
              
              {/* Right panel: Live preview */}
              <div className="sticky top-5 h-[calc(100vh-120px)] min-h-[600px] bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex flex-col">
                <LivePreviewPanel data={resumeData} selectedTemplateId={template.id} />
              </div>
            </div>
          </>
        )}
      </div>
  );
}
