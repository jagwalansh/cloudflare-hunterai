import React, { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { Sparkles, Loader2, Check, X } from 'lucide-react';

interface AIImproveButtonProps {
  sectionType: 'summary' | 'experience' | 'project' | 'headline';
  currentText: string;
  context?: Record<string, string>;
  onAccept: (newText: string) => void;
}

export function AIImproveButton({ sectionType, currentText, context, onAccept }: AIImproveButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleImprove = async () => {
    if (!currentText || currentText.trim().length === 0) return;
    
    setIsOpen(true);
    setLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const results = await api.improveSectionWithAI({
        sectionType,
        currentText,
        context
      });
      setSuggestions(results);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate suggestions.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (text: string) => {
    onAccept(text);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        type="button"
        onClick={handleImprove}
        disabled={loading || !currentText.trim()}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
        Improve
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-[450px] max-w-[90vw] right-0 sm:left-0 sm:right-auto bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden text-sm">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="font-semibold text-gray-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              AI Suggestions
            </span>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-4 flex flex-col gap-4">
            {loading && (
              <div className="flex flex-col items-center justify-center py-6 text-gray-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <p>Generating professional rewrites...</p>
              </div>
            )}

            {error && (
              <div className="text-red-600 bg-red-50 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {!loading && suggestions.length > 0 && suggestions.map((suggestion, idx) => (
              <div key={idx} className="group relative border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                <p className="text-gray-700 whitespace-pre-wrap pr-24">{suggestion}</p>
                <button
                  onClick={() => handleAccept(suggestion)}
                  className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-700 focus:opacity-100"
                >
                  <Check className="w-3.5 h-3.5" />
                  Use this
                </button>
              </div>
            ))}

            {!loading && !error && suggestions.length === 0 && (
              <div className="text-gray-500 text-center py-4">
                No suggestions generated.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
