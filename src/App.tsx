import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import PageTransition from '@/components/PageTransition';
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import CollectionPage from '@/pages/CollectionPage';
import CollectionDetailPage from '@/pages/CollectionDetailPage';
import JournalPage from '@/pages/JournalPage';
import JournalDetailPage from '@/pages/JournalDetailPage';
import CooperationPage from '@/pages/CooperationPage';
import GiftPage from '@/pages/GiftPage';
import FortunePage from '@/pages/FortunePage';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminSiteConfig from '@/pages/admin/AdminSiteConfig';
import AdminAbout from '@/pages/admin/AdminAbout';
import AdminConcepts from '@/pages/admin/AdminConcepts';
import AdminCollection from '@/pages/admin/AdminCollection';
import AdminJournal from '@/pages/admin/AdminJournal';
import AdminMedia from '@/pages/admin/AdminMedia';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public routes — PageTransition wraps Layout for ink-wipe cross-page animation */}
        <Route element={<PageTransition />}>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="/collection/:slug" element={<CollectionDetailPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/journal/:slug" element={<JournalDetailPage />} />
            <Route path="/cooperation" element={<CooperationPage />} />
            <Route path="/gift" element={<GiftPage />} />
            <Route path="/fortune" element={<FortunePage />} />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="config" element={<AdminSiteConfig />} />
          <Route path="about" element={<AdminAbout />} />
          <Route path="concepts" element={<AdminConcepts />} />
          <Route path="collection" element={<AdminCollection />} />
          <Route path="journal" element={<AdminJournal />} />
          <Route path="media" element={<AdminMedia />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
