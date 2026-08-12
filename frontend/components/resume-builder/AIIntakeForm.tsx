import React, { useState } from 'react';
import { api } from '@/lib/api';
import { ResumeData, GenerateResumeRequest } from '@/types/resume';
import { Loader2, Sparkles, X } from 'lucide-react';

interface AIIntakeFormProps {
  onComplete: (data: ResumeData) => void;
  onCancel: () => void;
}

export function AIIntakeForm({ onComplete, onCancel }: AIIntakeFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [targetRole, setTargetRole] = useState('');
  const [rawExperience, setRawExperience] = useState('');
  const [rawProjects, setRawProjects] = useState('');
  const [rawEducation, setRawEducation] = useState('');
  const [skillsInput, setSkillsInput] = useState('');

  const handleGenerate = async () => {
    if (!rawExperience && !rawProjects && !rawEducation) {
      setError("Please provide at least some experience, projects, or education notes.");
      return;
    }

    setLoading(true);
    setError(null);

    const knownSkills = skillsInput.split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const payload: GenerateResumeRequest = {
      targetRole: targetRole || undefined,
      rawExperience,
      rawProjects,
      rawEducation,
      knownSkills
    };

    try {
      const generatedData = await api.generateResumeWithAI(payload);
      onComplete(generatedData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full max-w-2xl mx-auto flex flex-col">
      <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            AI Resume Generator
          </h2>
          <p className="text-sm text-gray-500 mt-1">Paste your rough notes, and we'll draft a professional resume.</p>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-700 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col gap-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Role (Optional)</label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g. Frontend Engineer, Product Manager"
            value={targetRole}
            onChange={e => setTargetRole(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Experience Notes</label>
          <textarea
            rows={4}
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g. Worked at Acme Corp from 2020-2022 as a dev. Built the checkout flow..."
            value={rawExperience}
            onChange={e => setRawExperience(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Notes</label>
          <textarea
            rows={3}
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g. Created a weather app using React and Node.js..."
            value={rawProjects}
            onChange={e => setRawProjects(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Education Notes</label>
          <textarea
            rows={2}
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g. BS in CS from State University, 2023"
            value={rawEducation}
            onChange={e => setRawEducation(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Known Skills (comma separated)</label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="e.g. Python, React, AWS"
            value={skillsInput}
            onChange={e => setSkillsInput(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Cancel
        </button>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating... (This takes a few seconds)
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Resume
            </>
          )}
        </button>
      </div>
    </div>
  );
}
