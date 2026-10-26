import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/ui/Toast';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import PublicAuthRoute from './components/layout/PublicAuthRoute';

import Login from './pages/Login';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FeedPage from './pages/FeedPage';
import AcademicsPage from './pages/AcademicsPage';
import ProjectsPage from './pages/ProjectsPage';
import EventsPage from './pages/EventsPage';
import CampusMapPage from './pages/CampusMapPage';
import ReportIssuePage from './pages/ReportIssuePage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppProvider>
          <Routes>
            {/* Direct Login Page at Root (Student Portal) */}
            <Route path="/" element={<Login initialRole="student" />} />
            <Route path="/landing" element={<Navigate to="/" replace />} />

            {/* Public Auth Routes */}
            <Route element={<PublicAuthRoute />}>
              <Route path="/login" element={<Login initialRole="student" />} />
              <Route path="/login/student" element={<Login initialRole="student" />} />
              <Route path="/login/faculty" element={<Login initialRole="faculty" />} />
              <Route path="/faculty-login" element={<Login initialRole="faculty" />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Authenticated Student Portal & Modules under /app/* */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="feed" element={<FeedPage />} />
              <Route path="academics" element={<AcademicsPage />} />
              <Route path="academics/attendance" element={<AcademicsPage defaultTab="attendance" />} />
              <Route path="academics/fees" element={<AcademicsPage defaultTab="fees" />} />
              <Route path="fees" element={<Navigate to="/app/academics?tab=fees" replace />} />
              <Route path="payments" element={<Navigate to="/app/academics?tab=fees" replace />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="map" element={<CampusMapPage />} />
              <Route path="report" element={<ReportIssuePage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Legacy / Direct URL Redirects to standardized /app/* paths */}
            <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/feed" element={<Navigate to="/app/feed" replace />} />
            <Route path="/notices" element={<Navigate to="/app/feed" replace />} />
            <Route path="/academics" element={<Navigate to="/app/academics" replace />} />
            <Route path="/academics/attendance" element={<Navigate to="/app/academics/attendance" replace />} />
            <Route path="/academics/fees" element={<Navigate to="/app/academics?tab=fees" replace />} />
            <Route path="/attendance" element={<Navigate to="/app/academics/attendance" replace />} />
            <Route path="/fees" element={<Navigate to="/app/academics?tab=fees" replace />} />
            <Route path="/payments" element={<Navigate to="/app/academics?tab=fees" replace />} />
            <Route path="/subjects" element={<Navigate to="/app/academics" replace />} />
            <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
            <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
            <Route path="/settings/connected-accounts" element={<Navigate to="/app/settings?section=connected-accounts" replace />} />
            <Route path="/connected-accounts" element={<Navigate to="/app/settings?section=connected-accounts" replace />} />
            <Route path="/account/profile" element={<Navigate to="/app/profile" replace />} />
            <Route path="/account/settings" element={<Navigate to="/app/settings" replace />} />
            <Route path="/community/feed" element={<Navigate to="/app/feed" replace />} />
            <Route path="/community/academics" element={<Navigate to="/app/academics" replace />} />
            <Route path="/community/projects" element={<Navigate to="/app/projects" replace />} />
            <Route path="/community/events" element={<Navigate to="/app/events" replace />} />
            <Route path="/campus/map" element={<Navigate to="/app/map" replace />} />
            <Route path="/campus/report" element={<Navigate to="/app/report" replace />} />

            {/* Global 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

