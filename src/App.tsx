import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import PageTransition from '@/components/PageTransition';
import HomePage from '@/pages/HomePage';

// Route-level code splitting: below-the-fold & admin pages load on demand
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const CollectionPage = lazy(() => import('@/pages/CollectionPage'));
const CollectionDetailPage = lazy(() => import('@/pages/CollectionDetailPage'));
const JournalPage = lazy(() => import('@/pages/JournalPage'));
const JournalDetailPage = lazy(() => import('@/pages/JournalDetailPage'));
const CooperationPage = lazy(() => import('@/pages/CooperationPage'));
const PressPage = lazy(() => import('@/pages/PressPage'));

const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminSiteConfig = lazy(() => import('@/pages/admin/AdminSiteConfig'));
const AdminAbout = lazy(() => import('@/pages/admin/AdminAbout'));
const AdminConcepts = lazy(() => import('@/pages/admin/AdminConcepts'));
const AdminCollection = lazy(() => import('@/pages/admin/AdminCollection'));
const AdminJournal = lazy(() => import('@/pages/admin/AdminJournal'));
const AdminPress = lazy(() => import('@/pages/admin/AdminPress'));
const AdminSubscribers = lazy(() => import('@/pages/admin/AdminSubscribers'));
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'));

function LazyFallback() {
  return (
    <div className="min-h-[60dvh] bg-base flex items-center justify-center" data-theme="ink">
      <span className="font-serif text-fg-muted text-body animate-pulse">儒 · 加载中</span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — PageTransition wraps Layout for ink-bloom cross-page animation */}
        <Route element={<PageTransition />}>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/about"
              element={
                <Suspense fallback={<LazyFallback />}>
                  <AboutPage />
                </Suspense>
              }
            />
            <Route
              path="/collection"
              element={
                <Suspense fallback={<LazyFallback />}>
                  <CollectionPage />
                </Suspense>
              }
            />
            <Route
              path="/collection/:slug"
              element={
                <Suspense fallback={<LazyFallback />}>
                  <CollectionDetailPage />
                </Suspense>
              }
            />
            <Route
              path="/journal"
              element={
                <Suspense fallback={<LazyFallback />}>
                  <JournalPage />
                </Suspense>
              }
            />
            <Route
              path="/journal/:slug"
              element={
                <Suspense fallback={<LazyFallback />}>
                  <JournalDetailPage />
                </Suspense>
              }
            />
            <Route
              path="/press"
              element={
                <Suspense fallback={<LazyFallback />}>
                  <PressPage />
                </Suspense>
              }
            />
            <Route
              path="/cooperation"
              element={
                <Suspense fallback={<LazyFallback />}>
                  <CooperationPage />
                </Suspense>
              }
            />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={null}>
              <AdminLogin />
            </Suspense>
          }
        />
        <Route
          path="/admin"
          element={
            <Suspense fallback={null}>
              <AdminLayout />
            </Suspense>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="config" element={<AdminSiteConfig />} />
          <Route path="about" element={<AdminAbout />} />
          <Route path="concepts" element={<AdminConcepts />} />
          <Route path="collection" element={<AdminCollection />} />
          <Route path="journal" element={<AdminJournal />} />
          <Route path="press" element={<AdminPress />} />
          <Route path="subscribers" element={<AdminSubscribers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
