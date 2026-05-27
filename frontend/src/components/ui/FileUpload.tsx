'use client';

import { useState, useCallback, DragEvent } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSize?: number; // in bytes
  error?: string;
  value?: File | null;
  onChange: (file: File | null) => void;
}

export function FileUpload({ label, accept = '.pdf,.txt,.doc,.docx', maxSize = 5 * 1024 * 1024, error, value, onChange }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent<HTMLElement>, over: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(over);
  }, []);

  const validateAndSet = useCallback((file: File) => {
    setDragError(null);
    if (maxSize && file.size > maxSize) {
      setDragError(`File too large. Max size: ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }
    onChange(file);
  }, [maxSize, onChange]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSet(file);
  }, [validateAndSet]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      {label && <label className="label-base">{label}</label>}
      
      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 px-4 py-3 bg-brand-orange-light border border-brand-orange/30 rounded-input"
          >
            <div className="w-9 h-9 rounded-lg bg-brand-orange/20 flex items-center justify-center flex-shrink-0">
              <FileText size={18} className="text-brand-orange" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{value.name}</p>
              <p className="text-xs text-ink-muted">{formatFileSize(value.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="p-1 hover:bg-red-50 rounded-full transition-colors"
            >
              <X size={16} className="text-ink-muted hover:text-red-500" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <label
              className={cn(
                'flex flex-col items-center justify-center gap-3 px-6 py-8 cursor-pointer',
                'border-2 border-dashed rounded-input transition-all duration-200',
                isDragging
                  ? 'border-brand-orange bg-brand-orange-light scale-[1.01]'
                  : 'border-border hover:border-brand-orange/50 hover:bg-surface-hover',
                (error || dragError) && 'border-red-300 bg-red-50'
              )}
              onDragOver={(e) => handleDrag(e, true)}
              onDragLeave={(e) => handleDrag(e, false)}
              onDrop={handleDrop}
            >
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                isDragging ? 'bg-brand-orange text-white' : 'bg-surface text-ink-muted'
              )}>
                <UploadCloud size={22} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-ink">
                  {isDragging ? 'Drop it here!' : (
                    <><span className="text-brand-orange">Click to upload</span> or drag & drop</>
                  )}
                </p>
                <p className="text-xs text-ink-muted mt-1">PDF, TXT, DOC up to {Math.round(maxSize / 1024 / 1024)}MB</p>
              </div>
              <input type="file" className="sr-only" accept={accept} onChange={handleChange} />
            </label>
          </motion.div>
        )}
      </AnimatePresence>

      {(error || dragError) && (
        <p className="mt-1 text-xs text-red-500 font-medium">{error || dragError}</p>
      )}
    </div>
  );
}
