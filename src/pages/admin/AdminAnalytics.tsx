import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import { adminApi } from '@/lib/admin-api';

interface Analytics {
  total: number;
  today: number;
  subscribers: number;
  byDay: Array<{ day: string; count: number }>;
  topPaths: Array<{ path: string; count: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
}

export default function AdminAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    adminApi.getAnalytics().then(setData).catch(() => {});
  }, []);

  if (!data) {
    return <p className="font-sans text-xs text-text-secondary">加载统计中…</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-mist mb-2">访问统计</h1>
      <p className="font-sans text-xs text-text-secondary mb-8">
        自托管、无 Cookie 的轻量统计。近 30 天数据。
      </p>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: '总浏览量', value: data.total },
          { label: '今日浏览', value: data.today },
          { label: '订阅人数', value: data.subscribers },
        ].map((c) => (
          <div key={c.label} className="border border-[rgba(168,164,154,0.15)] p-5">
            <span className="block font-sans text-[10px] tracking-wider text-text-secondary uppercase mb-2">{c.label}</span>
            <span className="font-display text-3xl text-mist">{c.value}</span>
          </div>
        ))}
      </div>

      {/* Daily trend */}
      <section className="mb-10">
        <h2 className="font-sans text-xs tracking-wider text-text-secondary uppercase mb-4">每日浏览趋势</h2>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <AreaChart data={data.byDay} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="pv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B1A1A" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#8B1A1A" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#8A8580' }} tickFormatter={(d: string) => d.slice(5)} />
              <YAxis tick={{ fontSize: 9, fill: '#8A8580' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#141414', border: '1px solid rgba(168,164,154,0.25)', fontSize: 12 }}
                labelStyle={{ color: '#F5F2EB' }}
                itemStyle={{ color: '#F5F2EB' }}
              />
              <Area type="monotone" dataKey="count" stroke="#A62D2D" strokeWidth={1.5} fill="url(#pv)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Top pages */}
        <section>
          <h2 className="font-sans text-xs tracking-wider text-text-secondary uppercase mb-4">热门页面 Top 10</h2>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={data.topPaths} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 40 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="path" tick={{ fontSize: 10, fill: '#8A8580' }} width={140} />
                <Tooltip
                  contentStyle={{ background: '#141414', border: '1px solid rgba(168,164,154,0.25)', fontSize: 12 }}
                  cursor={{ fill: 'rgba(168,164,154,0.06)' }}
                />
                <Bar dataKey="count" fill="#8B1A1A" barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Referrers */}
        <section>
          <h2 className="font-sans text-xs tracking-wider text-text-secondary uppercase mb-4">来源分布</h2>
          <ul className="space-y-2">
            {data.topReferrers.map((r) => {
              const max = data.topReferrers[0]?.count || 1;
              return (
                <li key={r.referrer}>
                  <div className="flex justify-between font-sans text-xs text-mist mb-1">
                    <span className="truncate mr-4">{r.referrer}</span>
                    <span className="text-text-secondary shrink-0">{r.count}</span>
                  </div>
                  <div className="h-1 bg-[rgba(168,164,154,0.1)]">
                    <div className="h-full bg-cinnabar/70" style={{ width: `${(r.count / max) * 100}%` }} />
                  </div>
                </li>
              );
            })}
            {data.topReferrers.length === 0 && (
              <li className="font-sans text-xs text-text-secondary">暂无来源数据</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
