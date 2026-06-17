import { useState, useEffect } from 'react';
import { setAuth, isAuthenticated } from '@/lib/admin-api';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check for GitHub OAuth callback token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const token = params.get('token');
    const username = params.get('username');
    if (token && username) {
      setAuth(token, username);
      window.location.href = '/#/admin';
    }
    // Also check if already logged in
    if (isAuthenticated()) {
      window.location.href = '/#/admin';
    }
  }, []);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuth(data.token, data.username);
        window.location.href = '/#/admin';
      } else {
        setError(data.error || '登录失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = () => {
    window.location.href = '/api/admin/github/login';
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl text-mist mb-2">儒</h1>
          <p className="font-sans text-[11px] tracking-[0.2em] text-text-secondary uppercase">
            Admin Panel
          </p>
        </div>

        {/* GitHub OAuth login */}
        <button
          onClick={handleGitHubLogin}
          className="w-full flex items-center justify-center gap-3 py-3 mb-6 border border-[rgba(245,242,235,0.2)] hover:border-mist/50 hover:bg-mist/5 transition-all duration-300"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span className="font-sans text-sm text-mist">Login with GitHub</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-[rgba(245,242,235,0.1)]" />
          <span className="font-sans text-[10px] text-text-secondary/40 uppercase">or</span>
          <div className="flex-1 h-px bg-[rgba(245,242,235,0.1)]" />
        </div>

        {/* Password login (fallback) */}
        <form onSubmit={handlePasswordLogin} className="space-y-6">
          <div>
            <label className="block font-sans text-[11px] tracking-[0.15em] text-text-secondary uppercase mb-3">
              管理员密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-[rgba(168,164,154,0.3)] py-3 font-serif text-mist placeholder:text-text-secondary/40 focus:outline-none focus:border-cinnabar transition-colors duration-300"
              placeholder="输入管理员密码"
              autoFocus
            />
          </div>

          {error && <p className="font-sans text-xs text-cinnabar">{error}</p>}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full font-sans text-[11px] tracking-[0.2em] text-mist/50 border border-mist/30 py-2.5 hover:text-mist hover:border-mist/60 transition-all duration-300 uppercase disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Password Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
