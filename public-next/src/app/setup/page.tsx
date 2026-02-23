'use client';

import dynamic from 'next/dynamic';

const OnboardingEpic = dynamic(
  () => import('./OnboardingEpic'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#0b0c15] text-white font-sans flex items-center justify-center p-4">
        <div className="animate-pulse text-gray-500 text-sm">Cargando configuración…</div>
      </div>
    ),
  }
);

export default function SetupPage() {
  return <OnboardingEpic />;
}
