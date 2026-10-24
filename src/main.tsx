import React from 'react';
import { createRoot } from 'react-dom/client';
import RootLayout from '../app/layout';
import StudentPortalPage from '../app/page';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <RootLayout>
        <StudentPortalPage />
      </RootLayout>
    </React.StrictMode>
  );
}
