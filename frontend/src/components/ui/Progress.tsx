'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  className?: string;
  size?: 'sm' | 'md';
  color?: 'orange' | 'purple' | 'green';
}

export function ProgressBar({ value, label, showPercentage = true, className, size = 'md', color = 'orange' }: ProgressBarProps) {
  const colors = {
    orange: 'bg-brand-orange',
    purple: 'bg-brand-purple',
    green: 'bg-status-easy-text',
  };

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs font-medium text-ink-secondary">{label}</span>}
          {showPercentage && <span className="text-xs font-semibold text-ink-muted">{Math.round(value)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-border rounded-full overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2')}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', colors[color])}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

// Skeleton loader
interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className, lines = 1 }: SkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'skeleton rounded-md',
            i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full',
            className || 'h-4'
          )}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-6 w-20 rounded-badge" />
      </div>
      <Skeleton lines={2} className="h-3.5" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-20" />
      </div>
    </div>
  );
}
