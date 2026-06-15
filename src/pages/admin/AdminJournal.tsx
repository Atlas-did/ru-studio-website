import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/admin-api';

interface JournalPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  sort_order: number;
}

const emptyPost: JournalPost = {
  slug: '', title: '', excerpt: '', date: new Date().toISOString().split('T')[0],
  category: '展览', sort_order: 0,
};

export default function AdminJournal() {
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [editing, setEditing] = useState<JournalPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<JournalPost>(emptyPost);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const fetchData = () => {
    adminApi
      .getJournal()
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, []);

  const handleSave = async () => {
    setMsg('');
    try {
      if (creating) {
        await adminApi.createJournalPost(form);
      } else {
        await adminApi.updateJournalPost(form.slug, form);
      }
      setMsg(creating ? '日志已发布' : '日志已更新');
      setCreating(false);
      setEditing(null);
      fetchData();
    } catch {
      setMsg('操作失败');
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('确定删除此日志？')) return;
    try {
      await adminApi.deleteJournalPost(slug);
      setMsg('日志已删除');
      fetchData();
    } catch {
      setMsg('删除失败');
    }
  };

  const openCreate = () => {
    setForm(emptyPost);
    setCreating(true);
    setEditing(emptyPost);
  };

  const openEdit = (p: JournalPost) => {
    setForm({ ...p });
    setCreating(false);
    setEditing(p);
  };

  if (loading) {
    return <p className="font-serif text-sm text-text-secondary">Loading...</p>;
  }

  const categoryOptions = ['展览', '新品', '合作', '荣誉', '资讯'];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl text-mist tracking-wide">Journal</h1>
          <p className="mt-1 font-sans text-[11px] tracking-[0.15em] text-text-secondary uppercase">
            宣发日志管理
          </p>
        </div>
        <button
          onClick={openCreate}
          className="font-sans text-[11px] tracking-[0.15em] text-mist border border-mist/60 px-4 py-2 hover:bg-cinnabar hover:border-cinnabar transition-all uppercase"
        >
          + New Post
        </button>
      </div>

      {msg && (
        <p className={`font-sans text-xs mb-4 ${msg.includes('失败') ? 'text-cinnabar' : 'text-mist'}`}>{msg}</p>
      )}

      {editing && (
        <div className="mb-8 p-6 bg-[rgba(168,164,154,0.04)] border border-[rgba(168,164,154,0.15)]">
          <h2 className="font-serif text-sm font-medium text-mist mb-6">
            {creating ? '新建日志' : '编辑日志'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase mb-1">Slug</label>
              <input type="text" value={form.slug} disabled={!creating}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full bg-[rgba(168,164,154,0.06)] border border-[rgba(168,164,154,0.15)] px-3 py-2 font-mono text-xs text-mist focus:outline-none focus:border-cinnabar disabled:opacity-40" />
            </div>
            <div>
              <label className="block font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase mb-1">分类</label>
              <select value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-[rgba(168,164,154,0.06)] border border-[rgba(168,164,154,0.15)] px-3 py-2 font-serif text-sm text-mist focus:outline-none focus:border-cinnabar">
                {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase mb-1">日期</label>
              <input type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-[rgba(168,164,154,0.06)] border border-[rgba(168,164,154,0.15)] px-3 py-2 font-mono text-sm text-mist focus:outline-none focus:border-cinnabar" />
            </div>
            <div className="md:col-span-2">
              <label className="block font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase mb-1">标题</label>
              <input type="text" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-[rgba(168,164,154,0.06)] border border-[rgba(168,164,154,0.15)] px-3 py-2 font-serif text-sm text-mist focus:outline-none focus:border-cinnabar" />
            </div>
            <div className="md:col-span-2">
              <label className="block font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase mb-1">摘要</label>
              <textarea value={form.excerpt} rows={3}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className="w-full bg-[rgba(168,164,154,0.06)] border border-[rgba(168,164,154,0.15)] px-3 py-2 font-serif text-sm text-mist focus:outline-none focus:border-cinnabar resize-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave}
              className="font-sans text-[10px] tracking-[0.15em] text-mist bg-cinnabar px-5 py-2 hover:opacity-80 transition-opacity uppercase">Save</button>
            <button onClick={() => { setEditing(null); setCreating(false); }}
              className="font-sans text-[10px] tracking-[0.15em] text-text-secondary border border-[rgba(168,164,154,0.3)] px-5 py-2 hover:text-mist transition-colors uppercase">Cancel</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(168,164,154,0.12)]">
              <th className="text-left py-3 font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase">日期</th>
              <th className="text-left py-3 font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase">分类</th>
              <th className="text-left py-3 font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase">标题</th>
              <th className="text-left py-3 font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase">摘要</th>
              <th className="text-right py-3 font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase w-24">操作</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.slug} className="border-b border-[rgba(168,164,154,0.06)] hover:bg-[rgba(168,164,154,0.03)]">
                <td className="py-3 font-mono text-xs text-text-secondary/60">{p.date}</td>
                <td className="py-3">
                  <span className="font-sans text-[10px] text-indigo border border-indigo/30 px-2 py-0.5">{p.category}</span>
                </td>
                <td className="py-3 font-serif text-sm text-mist">{p.title}</td>
                <td className="py-3 font-serif text-xs text-text-secondary/70 max-w-xs truncate">{p.excerpt}</td>
                <td className="py-3 text-right">
                  <button onClick={() => openEdit(p)}
                    className="font-sans text-[10px] text-text-secondary hover:text-mist transition-colors mr-3">Edit</button>
                  <button onClick={() => handleDelete(p.slug)}
                    className="font-sans text-[10px] text-text-secondary/50 hover:text-cinnabar transition-colors">Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
