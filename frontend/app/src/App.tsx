import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Spinner from '@components/ui/Spinner'
import { AuthProvider } from '@contexts/AuthContext'
import AdminRoute from '@components/routing/AdminRoute'
import AppLayout from '@components/layout/AppLayout'

// Public pages (eagerly loaded — small)
import LandingPage from '@pages/LandingPage'
import NotFoundPage from '@pages/NotFoundPage'

// Auth pages
const LoginPage           = lazy(() => import('@pages/auth/LoginPage'))
const RegisterPage        = lazy(() => import('@pages/auth/RegisterPage'))
const ForgotPasswordPage  = lazy(() => import('@pages/auth/ForgotPasswordPage'))
const ResetPasswordPage   = lazy(() => import('@pages/auth/ResetPasswordPage'))
const VerifyEmailPage     = lazy(() => import('@pages/auth/VerifyEmailPage'))

// Learner pages (all served inside AppLayout / Outlet)
const DashboardPage          = lazy(() => import('@pages/DashboardPage'))
const OnboardingPage         = lazy(() => import('@pages/OnboardingPage'))
const LibraryPage            = lazy(() => import('@pages/LibraryPage'))
const CurriculumPage         = lazy(() => import('@pages/CurriculumPage'))
const InterviewQuestionsPage = lazy(() => import('@pages/InterviewQuestionsPage'))
const TopicPage              = lazy(() => import('@pages/TopicPage'))
const DeepDiveQuestionPage   = lazy(() => import('@pages/DeepDiveQuestionPage'))
const LearningConceptsPage   = lazy(() => import('@pages/LearningConceptsPage'))
const ConceptDetailPage      = lazy(() => import('@pages/ConceptDetailPage'))
const ProfilePage            = lazy(() => import('@pages/ProfilePage'))
const SettingsPage           = lazy(() => import('@pages/SettingsPage'))
const ChangePasswordPage     = lazy(() => import('@pages/ChangePasswordPage'))
const CommunityPage          = lazy(() => import('@pages/CommunityPage'))

// Admin pages
const AdminDashboardPage     = lazy(() => import('@pages/admin/AdminDashboardPage'))
const UserManagementPage     = lazy(() => import('@pages/admin/UserManagementPage'))
const TopicManagementPage    = lazy(() => import('@pages/admin/TopicManagementPage'))
const ConceptManagementPage  = lazy(() => import('@pages/admin/ConceptManagementPage'))
const ConceptEditorPage      = lazy(() => import('@pages/admin/ConceptEditorPage'))
const QuestionEditorPage     = lazy(() => import('@pages/admin/QuestionEditorPage'))
const QuestionManagementPage = lazy(() => import('@pages/admin/QuestionManagementPage'))
const TopicEditorPage        = lazy(() => import('@pages/admin/TopicEditorPage'))
const AnalyticsDashboardPage = lazy(() => import('@pages/admin/AnalyticsDashboardPage'))
const AdminPanelPage         = lazy(() => import('@pages/admin/AdminPanelPage'))

const PageLoader = () => <Spinner size="page" label="Loading page..." />

/** Redirect wrappers that preserve dynamic `:slug` params */
const RedirectTopicSlug = () => {
  const { slug } = useParams<{ slug: string }>()
  return <Navigate to={`/app/learn/topics/${slug}`} replace />
}
const RedirectConceptSlug = () => {
  const { slug } = useParams<{ slug: string }>()
  return <Navigate to={`/app/learn/concepts/${slug}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>

            {/* ── Public ──────────────────────────────────────────────── */}
            <Route path="/"                       element={<LandingPage />} />
            <Route path="/login"                  element={<LoginPage />} />
            <Route path="/register"               element={<RegisterPage />} />
            <Route path="/forgot-password"        element={<ForgotPasswordPage />} />
            <Route path="/reset-password"         element={<ResetPasswordPage />} />
            <Route path="/reset-password/:token"  element={<ResetPasswordPage />} />
            <Route path="/verify-email"         element={<VerifyEmailPage />} />

            {/* Public-browsable library (no auth needed to browse) */}
            <Route path="/library"           element={<LibraryPage />} />
            <Route path="/library/:courseId" element={<CurriculumPage />} />

            {/* ── Public AppLayout Routes (No Auth Required) ───────────── */}
            <Route element={<AppLayout requireAuth={false} />}>
              <Route path="/app/learn/topics/:slug"     element={<TopicPage />} />
              <Route path="/app/learn/concepts"         element={<LearningConceptsPage />} />
              <Route path="/app/learn/concepts/:slug"   element={<ConceptDetailPage />} />
            </Route>

            {/* ── Learner /app/** (auth-gated via AppLayout) ───────────── */}
            <Route path="/app" element={<AppLayout requireAuth={true} />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard"              element={<DashboardPage />} />
              <Route path="onboarding"             element={<OnboardingPage />} />
              <Route path="practice"               element={<InterviewQuestionsPage />} />
              <Route path="practice/deep-dive"     element={<DeepDiveQuestionPage />} />
              <Route path="community"              element={<CommunityPage />} />
              <Route path="profile"                element={<ProfilePage />} />
              <Route path="settings">
                <Route index element={<SettingsPage />} />
                <Route path="change-password" element={<ChangePasswordPage />} />
              </Route>
            </Route>

            {/* ── Backward-compat redirects (old flat URLs → /app/**) ── */}
            <Route path="/dashboard"  element={<Navigate to="/app/dashboard"  replace />} />
            <Route path="/onboarding" element={<Navigate to="/app/onboarding" replace />} />
            <Route path="/topics/:slug"    element={<RedirectTopicSlug />} />
            <Route path="/concepts"        element={<Navigate to="/app/learn/concepts"       replace />} />
            <Route path="/concepts/:slug"  element={<RedirectConceptSlug />} />
            <Route path="/practice"   element={<Navigate to="/app/practice"            replace />} />
            <Route path="/deep-dive"  element={<Navigate to="/app/practice/deep-dive"  replace />} />
            <Route path="/community"  element={<Navigate to="/app/community"           replace />} />
            <Route path="/profile"    element={<Navigate to="/app/profile"             replace />} />
            <Route path="/settings"   element={<Navigate to="/app/settings"            replace />} />

            {/* ── Admin (admin role required) ──────────────────────────── */}
            <Route path="/admin" element={
              <AdminRoute><AdminDashboardPage /></AdminRoute>
            } />
            <Route path="/admin/users" element={
              <AdminRoute><UserManagementPage /></AdminRoute>
            } />
            <Route path="/admin/topics" element={
              <AdminRoute><TopicManagementPage /></AdminRoute>
            } />
            <Route path="/admin/topics/new" element={
              <AdminRoute><TopicEditorPage /></AdminRoute>
            } />
            <Route path="/admin/topics/:id/edit" element={
              <AdminRoute><TopicEditorPage /></AdminRoute>
            } />
            <Route path="/admin/concepts" element={
              <AdminRoute><ConceptManagementPage /></AdminRoute>
            } />
            <Route path="/admin/concepts/new" element={
              <AdminRoute><ConceptEditorPage /></AdminRoute>
            } />
            <Route path="/admin/concepts/:id/edit" element={
              <AdminRoute><ConceptEditorPage /></AdminRoute>
            } />
            <Route path="/admin/questions" element={
              <AdminRoute><QuestionManagementPage /></AdminRoute>
            } />
            <Route path="/admin/questions/new" element={
              <AdminRoute><QuestionEditorPage /></AdminRoute>
            } />
            <Route path="/admin/questions/:id/edit" element={
              <AdminRoute><QuestionEditorPage /></AdminRoute>
            } />
            <Route path="/admin/deep-dive" element={
              <AdminRoute><AdminPanelPage /></AdminRoute>
            } />
            <Route path="/admin/analytics" element={
              <AdminRoute><AnalyticsDashboardPage /></AdminRoute>
            } />

            {/* ── Legacy redirects ─────────────────────────────────────── */}
            <Route path="/analytics"     element={<Navigate to="/admin/analytics" replace />} />
            <Route path="/topics/python" element={<Navigate to="/app/learn/topics/python" replace />} />

            {/* ── 404 ─────────────────────────────────────────────────── */}
            <Route path="*" element={<NotFoundPage />} />

          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
