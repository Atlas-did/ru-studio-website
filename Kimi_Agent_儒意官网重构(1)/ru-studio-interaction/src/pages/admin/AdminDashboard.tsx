import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/admin-api';

interface Stats {
  concepts: number;
  collection: number;
  journal: number;
  contacts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: '核心概念', value: stats?.concepts ?? '-', color: 'border-gold' },
    { label: '作品收藏', value: stats?.collection ?? '-', color: 'border-cinnabar' },
    { label: '宣发日志', value: stats?.journal ?? '-', color: 'border-indigo' },
    { label: '联系表单', value: stats?.contacts ?? '-', color: 'border-mist' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl text-mist tracking-wide mb-8">Dashboard</h1>
      <p className="font-sans text-[11px] tracking-[0.15em] text-text-secondary uppercase mb-8">
        Overview
      </p>

      {loading ? (
        <p className="font-serif text-sm text-text-secondary">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className={`bg-[rgba(168,164,154,0.04)] border-l-2 ${card.color} p-5`}
            >
              <p className="font-display text-3xl text-mist mb-1">{card.value}</p>
              <p className="font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase">
                {card.label}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 p-6 bg-[rgba(168,164,154,0.04)] border border-[rgba(168,164,154,0.1)]">
        <h2 className="font-serif text-sm font-medium text-mist mb-2">快速开始</h2>
        <p className="font-serif text-sm text-text-secondary leading-relaxed">
          使用左侧菜单管理网站内容：修改品牌配置、编辑核心概念、管理作品收藏、发布宣发日志。
          所有修改将即时生效。
        </p>
        <p className="mt-3 font-sans text-[10px] text-text-secondary/50">
          默认管理员密码: admin123 — 请通过直接修改数据库来更改密码。
        </p>
      </div>
    </div>
  );
}
