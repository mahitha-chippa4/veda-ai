'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full pt-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
        className="flex flex-col items-center justify-center text-center max-w-lg w-full mx-auto"
      >
        {/* Illustration */}
        <div className="relative mb-6 flex items-center justify-center">
          <svg width="260" height="260" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background circle */}
            <circle cx="120" cy="120" r="90" fill="#E5E7EB" fillOpacity="0.4"/>
            {/* Document */}
            <rect x="75" y="55" width="70" height="90" rx="8" fill="white" />
            <rect x="90" y="75" width="40" height="6" rx="3" fill="#1A1A1A" />
            <rect x="90" y="90" width="35" height="6" rx="3" fill="#D1D5DB" />
            <rect x="90" y="105" width="45" height="6" rx="3" fill="#D1D5DB" />
            <rect x="90" y="120" width="25" height="6" rx="3" fill="#D1D5DB" />
            
            {/* Floating Top Right Element */}
            <rect x="160" y="60" width="36" height="16" rx="8" fill="white" />
            <circle cx="168" cy="68" r="3" fill="#D1D5DB" />
            <rect x="175" y="66" width="12" height="4" rx="2" fill="#D1D5DB" />

            {/* Magnifying Glass Handle */}
            <path d="M152 152 L178 178" stroke="#D1D5DB" strokeWidth="16" strokeLinecap="round" />
            
            {/* Magnifying Glass Ring */}
            <circle cx="130" cy="130" r="36" fill="white" stroke="#F3F4F6" strokeWidth="8"/>
            <circle cx="130" cy="130" r="36" fill="transparent" stroke="#E5E7EB" strokeWidth="2"/>

            {/* Red X */}
            <path d="M115 115 L145 145 M145 115 L115 145" stroke="#EF4444" strokeWidth="8" strokeLinecap="round"/>

            {/* Decorations */}
            <path d="M30 100 Q 55 60 90 85 Q 70 120 50 110" stroke="#1A1A1A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            
            <path d="M50 150 L54 162 L66 166 L54 170 L50 182 L46 170 L34 166 L46 162 Z" fill="#6B7280" opacity="0.8"/>
            <circle cx="195" cy="135" r="4" fill="#3B82F6"/>
          </svg>
        </div>

        <h2 className="text-[20px] font-bold text-[#1A1A1A] mb-3">No assignments yet</h2>
        <p className="text-[14px] text-[#6B7280] leading-relaxed mb-8 px-4">
          Create your first assignment to start collecting and grading student<br/>
          submissions. You can set up rubrics, define marking criteria, and let AI<br/>
          assist with grading.
        </p>

        <Link
          href="/assignments/create"
          className="inline-flex items-center justify-center gap-3 bg-[#1A1A1A] text-white text-[15px] font-semibold rounded-full hover:bg-[#2D2D2D] transition-all whitespace-nowrap"
          style={{ padding: '14px 28px' }}
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Create Your First Assignment</span>
        </Link>
      </motion.div>
    </div>
  );
}
