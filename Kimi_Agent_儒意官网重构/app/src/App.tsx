import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { PageTransition } from '@/components/PageTransition';
import { HomePage } from '@/pages/HomePage';
import { AboutPage } from '@/pages/AboutPage';
import { CollectionPage } from '@/pages/CollectionPage';
import { CollectionDetailPage } from '@/pages/CollectionDetailPage';
import { JournalPage } from '@/pages/JournalPage';
import { JournalDetailPage } from '@/pages/JournalDetailPage';
import { CooperationPage } from '@/pages/CooperationPage';
import { AdminLogin } from '@/pages/admin/AdminLogin';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminAbout } from '@/pages/admin/AdminAbout';

export default function App() {
  return (
    <Layout>
      <PageTransition>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/collection/:slug" element={<CollectionDetailPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/journal/:slug" element={<JournalDetailPage />} />
          <Route path="/cooperation" element={<CooperationPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/about" element={<AdminAbout />} />
        </Routes>
      </PageTransition>
    </Layout>
  );
}
