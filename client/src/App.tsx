import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConsoleLoginPage } from './console/ConsoleLoginPage';
import { LandingConsolePage } from './console/LandingConsolePage';
import { ProjectsListPage } from './console/ProjectsListPage';
import { CreateProjectWizardPage } from './console/CreateProjectWizardPage';
import { ConsoleLayout } from './console/ConsoleLayout';

function RouteAndWidgetController() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
    const isLandingPage = pathname === '/';
    document.body.classList.toggle('hide-floating-widgets', !isLandingPage);
  }, [pathname]);

  return (
    <style>{`
      html, body {
        background-color: #0b0f19 !important;
        color: #f1f5f9 !important;
      }
      body.hide-floating-widgets > *:not(#root):not(script):not(style):not(link) {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `}</style>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-400 flex items-center justify-center text-sm">
        กำลังโหลดข้อมูลผู้ใช้งาน...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RouteAndWidgetController />
        <Routes>
          <Route path="/" element={<LandingConsolePage />} />
          <Route path="/login" element={<ConsoleLoginPage />} />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/new"
            element={
              <ProtectedRoute>
                <CreateProjectWizardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute>
                <ConsoleLayout />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
