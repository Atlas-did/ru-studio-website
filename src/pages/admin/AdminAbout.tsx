import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/admin-api';

interface AboutSection {
  id: string;
  title: string;
  content: string;
  sort_order: number;
}

export default function AdminAbout() {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [editing, setEditing] = useState<AboutSection | null>(null);
  const [form, setForm] = useState<AboutSection>({ id: '', title: '', content: '', sort_order: 0 });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const fetchData = () => {
    adminApi.getConcepts(); // no-op warmup
    fetch('/api/admin/about', {
      headers: { 'Authorization': `Bearer ${sessionStorage.getItem('ru_admin_token')}` }
    })
      .then(r => r.json())
      .then(setSections)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, []);

  const openEdit = (s: AboutSection) => {
    setForm({ ...s });
    setEditing(s);
  };

  const handleSave = async () => {
    setMsg('');
    try {
      const res = await fetch(`/api/admin/about/${form.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('ru_admin_token')}`
        },
        body: JSON.stringify({ title: form.title, content: form.content })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('章节已更新');
        setEditing(null);
        fetchData();
      } else {
        setMsg(data.error || '保存失败');
      }
    } catch {
      setMsg('保存失败');
    }
  };

  const sectionLabels: Record<string, string> = {
    mission: '品牌使命',
    vision: '品牌愿景',
    business: '核心业务板块',
    roadmap: '发展规划',
  };

  if (loading) {
    return <p className="font-serif text-sm text-text-secondary">Loading...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl text-mist tracking-wide">About Page</h1>
          <p className="mt-1 font-sans text-[11px] tracking-[0.15em] text-text-secondary uppercase">
            关于页面内容管理
          </p>
        </div>
      </div>

      <p className="font-serif text-sm text-text-secondary/60 mb-8 leading-relaxed">
        编辑关于页面的各个章节。换行即分段，保存后实时生效。
      </p>

      {msg && (
        <p className={`font-sans text-xs mb-4 ${msg.includes('失败') ? 'text-cinnabar' : 'text-mist'}`}>{msg}</p>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="mb-8 p-6 bg-[rgba(168,164,154,0.04)] border border-[rgba(168,164,154,0.15)]">
          <h2 className="font-serif text-sm font-medium text-mist mb-6">
            编辑：{sectionLabels[form.id] || form.title}
          </h2>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase mb-1">标题</label>
              <input type="text" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-[rgba(168,164,154,0.06)] border border-[rgba(168,164,154,0.15)] px-3 py-2 font-serif text-sm text-mist focus:outline-none focus:border-cinnabar" />
            </div>
            <div>
              <label className="block font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase mb-1">
                正文（换行分段）
              </label>
              <textarea value={form.content} rows={10}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full bg-[rgba(168,164,154,0.06)] border border-[rgba(168,164,154,0.15)] px-3 py-2 font-serif text-sm text-mist focus:outline-none focus:border-cinnabar resize-y leading-relaxed" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave}
              className="font-sans text-[10px] tracking-[0.15em] text-mist bg-cinnabar px-5 py-2 hover:opacity-80 transition-opacity uppercase">Save</button>
            <button onClick={() => setEditing(null)}
              className="font-sans text-[10px] tracking-[0.15em] text-text-secondary border border-[rgba(168,164,154,0.3)] px-5 py-2 hover:text-mist transition-colors uppercase">Cancel</button>
          </div>
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-4">
        {sections.map((s) => (
          <div key={s.id} className="bg-[rgba(168,164,154,0.03)] border border-[rgba(168,164,154,0.1)] p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-sans text-[10px] text-text-secondary uppercase bg-[rgba(168,164,154,0.08)] px-2 py-0.5">
                    {s.id}
                  </span>
                  <h3 className="font-serif text-sm font-medium text-mist">{s.title}</h3>
                </div>
                <p className="font-serif text-xs text-text-secondary/70 leading-relaxed whitespace-pre-line line-clamp-2">
                  {s.content}
                </p>
              </div>
              <button onClick={() => openEdit(s)}
                className="font-sans text-[10px] text-text-secondary hover:text-mist transition-colors shrink-0 ml-4">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
