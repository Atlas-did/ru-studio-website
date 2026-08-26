import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/noto-serif-sc/400.css';
import '@fontsource/noto-serif-sc/500.css';
import '@fontsource/noto-serif-sc/600.css';
import '@fontsource/noto-serif-sc/700.css';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/500.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/400-italic.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import './index.css';
import App from './App';
import { I18nProvider } from '@/lib/i18n';

// Legacy HashRouter links (/#/path) → BrowserRouter paths (/path)
if (window.location.hash.startsWith('#/')) {
  const target = window.location.hash.slice(1) + window.location.search;
  window.history.replaceState(null, '', target);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>
);
