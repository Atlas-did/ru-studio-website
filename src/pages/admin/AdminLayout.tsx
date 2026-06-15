import { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { isAuthenticated, clearAuth, getUsername } from '@/lib/admin-api';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: '◇' },
  { label: 'Site Config', path: '/admin/config', icon: '⚙' },
  { label: 'About Page', path: '/admin/about', icon: '▤' },
  { label: 'Concepts', path: '/admin/concepts', icon: '◈' },
  { label: 'Collection', path: '/admin/collection', icon: '◆' },
  { label: 'Journal', path: '/admin/journal', icon: '◇' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    clearAuth();
    navigate('/admin/login', { replace: true });
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-ink flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-[rgba(168,164,154,0.12)] flex flex-col">
        <div className="px-6 py-6">
          <Link to="/" className="font-display text-2xl text-mist hover:text-cinnabar transition-colors">
            儒
          </Link>
          <p className="mt-1 font-sans text-[10px] tracking-[0.15em] text-text-secondary uppercase">
            Admin Panel
          </p>
        </div>

        <nav className="flex-1 px-4 py-2">
          {navItems.map((item) => {
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 mb-1 font-sans text-xs tracking-[0.1em] transition-all duration-200 ${
                  isActive
                    ? 'text-mist bg-[rgba(168,164,154,0.08)] border-l border-cinnabar'
                    : 'text-text-secondary hover:text-mist hover:bg-[rgba(168,164,154,0.04)]'
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-[rgba(168,164,154,0.12)]">
          <p className="px-3 font-sans text-[10px] text-text-secondary/50 mb-2">
            {getUsername()}
          </p>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 font-sans text-[10px] tracking-[0.1em] text-text-secondary hover:text-cinnabar transition-colors uppercase"
          >
            Logout →
          </button>
          <Link
            to="/"
            className="block px-3 py-1.5 font-sans text-[10px] tracking-[0.1em] text-text-secondary/50 hover:text-mist transition-colors uppercase"
          >
            View Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
