import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'ruyi123') {
      navigate('/admin/dashboard');
    } else {
      setError('用户名或密码错误');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-ink flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl text-mist mb-2">儒意</h1>
          <p className="text-overline text-stone">ADMIN PANEL</p>
        </div>

        <div className="border border-border-subtle p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="px-4 py-3 border border-cinnabar/40 text-cinnabar text-caption">
                {error}
              </div>
            )}
            <div>
              <label className="block text-overline text-stone mb-2">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent border border-border-subtle px-4 py-3 text-body text-mist focus:border-mist/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-overline text-stone mb-2">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border border-border-subtle px-4 py-3 text-body text-mist focus:border-mist/40 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full px-8 py-4 bg-cinnabar text-mist text-overline tracking-overline hover:bg-cinnabar-light transition-colors"
            >
              登录
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
