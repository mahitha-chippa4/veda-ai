'use client';

import { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopicPillsProps {
  value: string[];
  onChange: (topics: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  error?: string;
  label?: string;
}

export function TopicPills({ value, onChange, placeholder = 'Type and press Enter...', suggestions = [], error, label }: TopicPillsProps) {
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);

  const add = (topic: string) => {
    const trimmed = topic.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
  };

  const remove = (topic: string) => {
    onChange(value.filter((t) => t !== topic));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(input);
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      remove(value[value.length - 1]);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
  );

  return (
    <div className="w-full">
      {label && <label className="label-base">{label}</label>}
      
      <div
        className={cn(
          'w-full min-h-[44px] px-3 py-2 flex flex-wrap gap-1.5 bg-white border rounded-input',
          'transition-all duration-150 cursor-text',
          focused
            ? 'border-brand-orange shadow-input-focus'
            : 'border-border hover:border-ink-placeholder',
          error && 'border-red-400'
        )}
        onClick={() => document.getElementById('topic-input')?.focus()}
      >
        {value.map((topic) => (
          <span
            key={topic}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-orange-light text-brand-orange text-xs font-medium rounded-md"
          >
            {topic}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); remove(topic); }}
              className="hover:bg-brand-orange/20 rounded-sm p-0.5 transition-colors"
            >
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          id="topic-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); if (input.trim()) add(input); }}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none text-sm text-ink placeholder:text-ink-placeholder bg-transparent"
        />
      </div>

      {/* Suggestions */}
      {focused && input && filteredSuggestions.length > 0 && (
        <div className="mt-1 p-2 bg-white border border-border rounded-xl shadow-dropdown">
          <div className="flex flex-wrap gap-1.5">
            {filteredSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); add(s); }}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface text-ink-secondary text-xs font-medium rounded-md hover:bg-brand-orange-light hover:text-brand-orange transition-colors border border-border"
              >
                <Plus size={10} />
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Common suggestions when no input */}
      {focused && !input && suggestions.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1.5 p-2 bg-surface rounded-lg border border-border">
          <span className="text-[10px] text-ink-faint w-full mb-0.5">Suggestions:</span>
          {suggestions.filter(s => !value.includes(s)).slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); add(s); }}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-white text-ink-secondary text-[11px] rounded border border-border hover:border-brand-orange hover:text-brand-orange transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
      {!error && <p className="mt-1 text-[11px] text-ink-faint">Press Enter or comma to add topics</p>}
    </div>
  );
}
