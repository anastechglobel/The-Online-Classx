import React from 'react';
import './globals.css';

export const metadata = {
  title: 'The Online Classes | Premier EdTech Learning Portal',
  description:
    'The Online Classes is a full-featured EdTech platform for live classes, structured courses, study notes, and test series.',
  openGraph: {
    title: 'The Online Classes | Premier EdTech Learning Portal',
    description:
      'The Online Classes is a full-featured EdTech platform for live classes, structured courses, study notes, and test series.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen antialiased selection:bg-indigo-500 selection:text-white">
      {children}
    </div>
  );
}
