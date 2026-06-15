import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import CollectionPage from '@/pages/CollectionPage';
import CollectionDetailPage from '@/pages/CollectionDetailPage';
import JournalPage from '@/pages/JournalPage';
import JournalDetailPage from '@/pages/JournalDetailPage';
import CooperationPage from '@/pages/CooperationPage';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminSiteConfig from '@/pages/admin/AdminSiteConfig';
import AdminConcepts from '@/pages/admin/AdminConcepts';
import AdminCollection from '@/pages/admin/AdminCollection';
import AdminJournal from '@/pages/admin/AdminJournal';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/collection/:slug" element={<CollectionDetailPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/journal/:slug" element={<JournalDetailPage />} />
          <Route path="/cooperation" element={<CooperationPage />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="config" element={<AdminSiteConfig />} />
          <Route path="concepts" element={<AdminConcepts />} />
          <Route path="collection" element={<AdminCollection />} />
          <Route path="journal" element={<AdminJournal />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
