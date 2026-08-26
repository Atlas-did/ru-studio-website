import { useEffect, useState } from 'react';
import { adminApi, authFetch } from '@/lib/admin-api';

interface Subscriber {
  id: number;
  email: string;
  confirmed: number;
  created_at: string;
}

export default function AdminSubscribers() {
  const [subs, setSubs] = useState<Subscriber[]>([]);

  useEffect(() => {
    adminApi.getSubscribers().then(setSubs).catch(() => {});
  }, []);

  const onDelete = async (id: number) => {
    if (!window.confirm('确认删除该订阅者？')) return;
    await adminApi.deleteSubscriber(id);
    setSubs((s) => s.filter((x) => x.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-2xl text-mist">订阅者管理</h1>
        <a
          href="/api/admin/subscribers/export.csv"
          onClick={async (e) => {
            e.preventDefault();
            const res = await authFetch('/api/admin/subscribers/export.csv');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'subscribers.csv';
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="border border-[rgba(168,164,154,0.3)] hover:border-cinnabar font-sans text-[10px] tracking-wider uppercase px-4 py-2 text-mist transition-colors"
        >
          导出 CSV ↓
        </a>
      </div>
      <p className="font-sans text-xs text-fg-secondary mb-8">
        共 {subs.length} 位订阅者。推送功能将在 SMTP 配置后开放。
      </p>

      <div className="border border-[rgba(168,164,154,0.12)] divide-y divide-[rgba(168,164,154,0.08)]">
        {subs.map((s) => (
          <div key={s.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <span className="font-sans text-sm text-mist">{s.email}</span>
              <span className="font-sans text-[10px] text-fg-secondary ml-4">{s.created_at}</span>
            </div>
            <button
              onClick={() => onDelete(s.id)}
              className="font-sans text-[10px] text-fg-secondary hover:text-cinnabar uppercase tracking-wider"
            >
              Delete
            </button>
          </div>
        ))}
        {subs.length === 0 && (
          <p className="font-sans text-xs text-fg-secondary px-4 py-6">
            暂无订阅者 —— 前台页脚的订阅表单收集的邮箱会出现在这里。
          </p>
        )}
      </div>
    </div>
  );
}
