'use client';

import React, { useEffect } from 'react';
import { initStudentAppController } from '../lib/studentAppController';
import { SplashAndOffline } from '../components/SplashAndOffline';
import { SidebarDrawer } from '../components/SidebarDrawer';
import { HeaderBar } from '../components/HeaderBar';
import { HomeDashboard } from '../components/HomeDashboard';
import { BatchesSection } from '../components/BatchesSection';
import { LiveClassroomSection } from '../components/LiveClassroomSection';
import { TestSeriesSection } from '../components/TestSeriesSection';
import { StudyNotesSection } from '../components/StudyNotesSection';
import { BooksSection } from '../components/BooksSection';
import { TimetableAndProfileSection } from '../components/TimetableAndProfileSection';
import { AuthAndProfileModals } from '../components/AuthAndProfileModals';
import { LearningOverlays } from '../components/LearningOverlays';

export default function StudentPortalPage() {
  useEffect(() => {
    initStudentAppController();
  }, []);

  return (
    <>
      <SplashAndOffline />
      <SidebarDrawer />

      {/* MAIN CONTENT CONTAINER */}
      <main
        id="mainContent"
        className="min-h-screen max-w-6xl mx-auto relative pb-28"
      >
        <HeaderBar />
        <HomeDashboard />
        <BatchesSection />
        <LiveClassroomSection />
        <TestSeriesSection />
        <StudyNotesSection />
        <BooksSection />
        <TimetableAndProfileSection />
      </main>

      <AuthAndProfileModals />
      <LearningOverlays />
    </>
  );
}
