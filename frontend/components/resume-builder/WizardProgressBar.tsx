import React from 'react';
import { Check } from 'lucide-react';

export interface WizardStep {
  id: number;
  label: string;
}

export function StepSegmentIndicator({ total, currentStep }: { total: number, currentStep: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 font-medium mr-2">Step {currentStep} of {total}</span>
      <div className="flex items-center gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-6 rounded-full transition-colors ${i + 1 <= currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}
          />
        ))}
      </div>
    </div>
  );
}

export function WizardProgressBar({ steps, currentStep, onStepClick }: { steps: WizardStep[], currentStep: number, onStepClick: (id: number) => void }) {
  return (
    <div className="flex items-center overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
      {steps.map((step, index) => {
        const isCompleted = step.id < currentStep;
        const isCurrent = step.id === currentStep;
        const isClickable = step.id <= currentStep; // can jump back to completed steps

        return (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={`flex items-center whitespace-nowrap transition-colors outline-none ${!isClickable ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-80'}`}
            >
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-2 
                ${isCompleted ? 'bg-green-100 text-green-700' : isCurrent ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}
              >
                {isCompleted ? <Check size={14} strokeWidth={3} /> : step.id}
              </div>
              <span className={`text-sm font-medium ${isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>
                {step.label}
              </span>
            </button>
            {index < steps.length - 1 && (
              <div className="w-8 border-t-2 border-gray-200 mx-4" />
            )}
          </div>
        );
      })}
    </div>
  );
}
