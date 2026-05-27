'use client';

import { cn } from '@/lib/utils';
import { Difficulty } from '@/types';

interface BadgeProps {
  difficulty: Difficulty;
  size?: 'sm' | 'md';
}

const config = {
  easy: {
    label: 'Easy',
    classes: 'bg-status-easy-bg text-status-easy-text',
    dot: 'bg-status-easy-text',
  },
  medium: {
    label: 'Medium',
    classes: 'bg-status-medium-bg text-status-medium-text',
    dot: 'bg-status-medium-text',
  },
  hard: {
    label: 'Hard',
    classes: 'bg-status-hard-bg text-status-hard-text',
    dot: 'bg-status-hard-text',
  },
};

export function DifficultyBadge({ difficulty, size = 'md' }: BadgeProps) {
  const cfg = config[difficulty] || config.easy;
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-semibold rounded-badge',
      cfg.classes,
      size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  );
}

// Status badge for assignment status
interface StatusBadgeProps {
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

const statusConfig = {
  pending: { label: 'Pending', classes: 'bg-gray-100 text-gray-600' },
  processing: { label: 'Processing...', classes: 'bg-blue-50 text-blue-600 animate-pulse' },
  completed: { label: 'Completed', classes: 'bg-status-easy-bg text-status-easy-text' },
  failed: { label: 'Failed', classes: 'bg-status-hard-bg text-status-hard-text' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = statusConfig[status];
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-badge', cfg.classes)}>
      {cfg.label}
    </span>
  );
}
