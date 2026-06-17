import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/admin-api';

interface Concept {
  id: string;
  numeral: string;
  title: string;
  title_en: string;
  description: string;
  sort_order: number;
}

const emptyConcept: Concept = {
  id: '',
  numeral: '',
  title: '',
  title_en: '',
  description: '',
  sort_order: 0,
};

export default function AdminConcepts() {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [editing, setEditing] = useState<Concept | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Concept>(emptyConcept);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const fetchData = () => {
    adminApi
      .getConcepts()
      .then(setConcepts)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, []);

  const handleSave = async () => {
    setMsg('');
    try {
      if (creating) {
        await adminApi.createConcept(form);
      } else {
        await adminApi.updateConcept(form.id, form);
      }
      setMsg(creating ? '概念已创建' : '概念已更新');
      setCreating(false);
      setEditing(null);
      fetchData();
    } catch {
      setMsg('操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除此概念？')) return;
    try {
      await adminApi.deleteConcept(id);
      setMsg('概念已删除');
      fetchData();
    } catch {
      setMsg('删除失败');
    }
  };

  const openCreate = () => {
    setForm(emptyConcept);
    setCreating(true);
    setEditing(emptyConcept);
  };

  const openEdit = (c: Concept) => {
    setForm({ ...c });
    setCreating(false);
    setEditing(c);
  };

  if (loading) {
    return <p className="font-serif text-sm text-text-secondary">Loading...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl text-mist tracking-wide">Concepts</h1>
          <p className="mt-1 font-sans text-[11px] tracking-[0.15em] text-text-secondary uppercase">
            核心概念管理
          </p>
        </div>
        <button
          onClick={openCreate}
          className="font-sans text-[11px] tracking-[0.15em] text-mist border border-mist/60 px-4 py-2 hover:bg-cinnabar hover:border-cinnabar transition-all uppercase"
        >
          + New
        </button>
      </div>

      {msg && (
        <p className={`font-sans text-xs mb-4 ${msg.includes('失败') ? 'text-cinnabar' : 'text-mist'}`}>
          {msg}
        </p>
      )}

      {/* Edit/Create Modal */}
      {editing && (
        <div className="mb-8 p-6 bg-[rgba(168,164,154,0.04)] border border-[rgba(168,164,154,0.15)]">
          <h2 className="font-serif text-sm font-medium text-mist mb-6">
            {creating ? '新建概念' : '编辑概念'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase mb-1">ID</label>
              <input
                type="text"
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                disabled={!creating}
                className="w-full bg-[rgba(168,164,154,0.06)] border border-[rgba(168,164,154,0.15)] px-3 py-2 font-mono text-xs text-mist focus:outline-none focus:border-cinnabar disabled:opacity-40"
              />
            </div>
            <div>
              <label className="block font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase mb-1">序号</label>
              <input
                type="text"
                value={form.numeral}
                onChange={(e) => setForm({ ...form, numeral: e.target.value })}
                className="w-full bg-[rgba(168,164,154,0.06)] border border-[rgba(168,164,154,0.15)] px-3 py-2 font-serif text-sm text-mist focus:outline-none focus:border-cinnabar"
              />
            </div>
            <div>
              <label className="block font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase mb-1">标题（中文）</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-[rgba(168,164,154,0.06)] border border-[rgba(168,164,154,0.15)] px-3 py-2 font-serif text-sm text-mist focus:outline-none focus:border-cinnabar"
              />
            </div>
            <div>
              <label className="block font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase mb-1">标题（英文）</label>
              <input
                type="text"
                value={form.title_en}
                onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                className="w-full bg-[rgba(168,164,154,0.06)] border border-[rgba(168,164,154,0.15)] px-3 py-2 font-sans text-sm text-mist focus:outline-none focus:border-cinnabar"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase mb-1">描述</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full bg-[rgba(168,164,154,0.06)] border border-[rgba(168,164,154,0.15)] px-3 py-2 font-serif text-sm text-mist focus:outline-none focus:border-cinnabar resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="font-sans text-[10px] tracking-[0.15em] text-mist bg-cinnabar px-5 py-2 hover:opacity-80 transition-opacity uppercase"
            >
              Save
            </button>
            <button
              onClick={() => { setEditing(null); setCreating(false); }}
              className="font-sans text-[10px] tracking-[0.15em] text-text-secondary border border-[rgba(168,164,154,0.3)] px-5 py-2 hover:text-mist transition-colors uppercase"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(168,164,154,0.12)]">
              <th className="text-left py-3 font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase w-16">ID</th>
              <th className="text-left py-3 font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase w-12">#</th>
              <th className="text-left py-3 font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase">标题</th>
              <th className="text-left py-3 font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase">英文</th>
              <th className="text-left py-3 font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase">描述</th>
              <th className="text-right py-3 font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase w-24">操作</th>
            </tr>
          </thead>
          <tbody>
            {concepts.map((c) => (
              <tr key={c.id} className="border-b border-[rgba(168,164,154,0.06)] hover:bg-[rgba(168,164,154,0.03)] transition-colors">
                <td className="py-3 font-mono text-xs text-text-secondary/60">{c.id}</td>
                <td className="py-3 font-display text-lg text-mist/30">{c.numeral}</td>
                <td className="py-3 font-serif text-sm text-mist">{c.title}</td>
                <td className="py-3 font-sans text-xs text-text-secondary">{c.title_en}</td>
                <td className="py-3 font-serif text-xs text-text-secondary/70 max-w-xs truncate">{c.description}</td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => openEdit(c)}
                    className="font-sans text-[10px] text-text-secondary hover:text-mist transition-colors mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="font-sans text-[10px] text-text-secondary/50 hover:text-cinnabar transition-colors"
                  >
                    Del
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
