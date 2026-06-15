import { useState } from 'react';
import { adminApi, setAuth } from '@/lib/admin-api';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await adminApi.login(password);
      setAuth(result.token, result.username);
      window.location.href = '/#/admin';
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
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

        <form onSubmit={handleSubmit} className="space-y-6">
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

          {error && (
            <p className="font-sans text-xs text-cinnabar">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full font-sans text-[11px] tracking-[0.2em] text-mist border border-mist/60 py-3 hover:bg-cinnabar hover:border-cinnabar transition-all duration-300 uppercase disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-8 text-center font-sans text-[10px] text-text-secondary/40">
          默认密码: admin123（请尽快修改）
        </p>
      </div>
    </div>
  );
}
