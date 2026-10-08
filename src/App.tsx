import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Auth Provider & Guard
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Layouts
import { CitizenLayout } from './layouts/CitizenLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { InstituteLayout } from './layouts/InstituteLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';

// Public & Verification Pages
import { LandingPage } from './pages/LandingPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { VerifyCertificatePage } from './pages/VerifyCertificatePage';
import { ProfilePage } from './pages/ProfilePage';

// Citizen Pages
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { CitizenProblemDetail } from './pages/citizen/CitizenProblemDetail';
import { SubmitReportPage } from './pages/citizen/SubmitReportPage';
import { MyReportsPage } from './pages/citizen/MyReportsPage';
import { SupportedPage } from './pages/citizen/SupportedPage';
import { NotificationsPage } from './pages/citizen/NotificationsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ProblemVerificationPage } from './pages/admin/ProblemVerificationPage';
import { PriorityQueuePage } from './pages/admin/PriorityQueuePage';
import { InstituteMatchingPage } from './pages/admin/InstituteMatchingPage';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Institute Pages
import { InstituteDashboard } from './pages/institute/InstituteDashboard';
import { AvailableChallengesPage } from './pages/institute/AvailableChallengesPage';
import { ProjectPage } from './pages/institute/ProjectPage';
import { ImpactPage } from './pages/institute/ImpactPage';
import { CertificatesListPage } from './pages/institute/CertificatesListPage';
import { MyProjectsPage } from './pages/institute/MyProjectsPage';
import { MyTeamPage } from './pages/institute/MyTeamPage';
import { MentorsPage } from './pages/institute/MentorsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Portal Switcher */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/verify/certificate/:certificateNumber" element={<VerifyCertificatePage />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Citizen Role Routes */}
          <Route
            path="/citizen"
            element={
              <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
                <CitizenLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CitizenDashboard />} />
            <Route path="problem/:id" element={<CitizenProblemDetail />} />
            <Route path="report/new" element={<SubmitReportPage />} />
            {/* Route-aware feed: each path preselects its own dataset/tab */}
            <Route
              path="nearby"
              element={
                <CitizenDashboard
                  initialTab="Nearby"
                  sectionTitle="Nearby Problems"
                  sectionSubtitle="Civic issues closest to your location, sorted by distance."
                />
              }
            />
            <Route
              path="trending"
              element={
                <CitizenDashboard
                  initialTab="Trending"
                  sectionTitle="Trending Problems"
                  sectionSubtitle="The most supported civic issues across the community right now."
                />
              }
            />
            <Route path="reports" element={<MyReportsPage />} />
            <Route path="supported" element={<SupportedPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Protected Admin Role Routes (Strictly ADMIN only) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="verification" element={<ProblemVerificationPage />} />
            <Route path="queue" element={<PriorityQueuePage />} />
            <Route path="matching" element={<InstituteMatchingPage />} />
            <Route path="projects" element={<AdminProjectsPage />} />
            <Route path="project/:id" element={<ProjectPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Protected Institute Role Routes */}
          <Route
            path="/institute"
            element={
              <ProtectedRoute allowedRoles={['INSTITUTE', 'ADMIN']}>
                <InstituteLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<InstituteDashboard />} />
            <Route path="challenges" element={<AvailableChallengesPage />} />
            <Route path="projects" element={<MyProjectsPage />} />
            <Route path="project/:id" element={<ProjectPage />} />
            <Route path="team" element={<MyTeamPage />} />
            <Route path="mentors" element={<MentorsPage />} />
            <Route path="impact" element={<ImpactPage />} />
            <Route path="certificates" element={<CertificatesListPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
