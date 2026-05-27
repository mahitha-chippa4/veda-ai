'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Library, Sparkles, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: BookOpen, label: 'Assignments', href: '/assignments' },
  { icon: Library, label: 'Library', href: '/library' },
  { icon: Sparkles, label: 'AI Tools', href: '/ai-toolkit' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <>
      {/* FAB */}
      <Link
        href="/assignments/create"
        className="lg:hidden fixed bottom-20 right-4 z-50 w-14 h-14 bg-brand-orange text-white rounded-full shadow-btn flex items-center justify-center hover:bg-brand-orange-dark transition-colors active:scale-95"
        aria-label="Create Assignment"
      >
        <Plus size={22} />
      </Link>

      {/* Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border px-2 pb-safe">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.href === '/'
              ? pathname === '/'
              : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex flex-col items-center gap-1 flex-1 h-full justify-center text-[10px] font-medium transition-colors',
                  isActive ? 'text-brand-orange' : 'text-ink-faint'
                )}
              >
                <Icon size={20} className={isActive ? 'text-brand-orange' : 'text-ink-faint'} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
