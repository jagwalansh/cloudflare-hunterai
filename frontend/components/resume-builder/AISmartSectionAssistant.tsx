import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Sparkles, Loader2, ChevronDown, ChevronUp, Check, AlertCircle } from 'lucide-react';

interface AISmartSectionAssistantProps {
  sectionType: 'personal' | 'summary' | 'experience' | 'education' | 'projects' | 'skills';
  sectionTitle: string;
  placeholderHint: string;
  onApplyData: (parsedData: any) => void;
}

export function AISmartSectionAssistant({
  sectionType,
  sectionTitle,
  placeholderHint,
  onApplyData,
}: AISmartSectionAssistantProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [userPrompt, setUserPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleParse = async () => {
    if (!userPrompt.trim()) {
      setError('Please type a brief description first.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const parsed = await api.parseSectionWithAI(sectionType, userPrompt);
      onApplyData(parsed);
      setSuccessMsg(`✨ Successfully auto-filled ${sectionTitle}!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Failed to parse section:', err);
      setError(err.message || 'Failed to process text with AI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-white shadow-sm overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-indigo-50/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              AI Smart Fill – Describe your {sectionTitle} in plain words
            </span>
            <p className="text-xs text-gray-500">
              Type informally and let AI organize & format it into the form fields below.
            </p>
          </div>
        </div>
        <div className="text-gray-400 hover:text-gray-600 p-1">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-1 flex flex-col gap-3">
          <textarea
            rows={3}
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            disabled={loading}
            placeholder={placeholderHint}
            className="w-full text-sm rounded-lg border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-inner resize-none text-gray-800 placeholder-gray-400"
          />

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-md border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-md border border-emerald-100 font-medium">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex justify-end gap-2">
            {userPrompt && (
              <button
                type="button"
                onClick={() => setUserPrompt('')}
                disabled={loading}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={handleParse}
              disabled={loading || !userPrompt.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Understanding & Filling...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-Fill {sectionTitle}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
