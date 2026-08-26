import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin-api';

interface PressItem {
  id: string;
  type: string;
  title: string;
  url?: string;
  file_url?: string;
  source?: string;
  date?: string;
  sort_order?: number;
}

const emptyForm = { id: '', type: 'coverage', title: '', url: '', file_url: '', source: '', date: '' };

export default function AdminPress() {
  const [items, setItems] = useState<PressItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const load = () => adminApi.getPress().then(setItems).catch(() => setMsg('加载失败'));
  useEffect(() => { load(); }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    try {
      if (editing) {
        await adminApi.updatePressItem(editing, form);
      } else {
        await adminApi.createPressItem(form);
      }
      setForm(emptyForm);
      setEditing(null);
      setMsg('已保存');
      load();
    } catch (err: any) {
      setMsg(err.message || '保存失败');
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm('确认删除该条目？')) return;
    await adminApi.deletePressItem(id);
    load();
  };

  const startEdit = (item: PressItem) => {
    setEditing(item.id);
    setForm({
      id: item.id,
      type: item.type,
      title: item.title,
      url: item.url || '',
      file_url: item.file_url || '',
      source: item.source || '',
      date: item.date || '',
    });
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-mist mb-2">媒体中心管理</h1>
      <p className="font-sans text-xs text-text-secondary mb-8">
        管理媒体报道（coverage）、新闻稿（release）与资料包下载（kit）。
      </p>

      {/* Form */}
      <form onSubmit={onSave} className="border border-[rgba(168,164,154,0.15)] p-6 mb-10 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-sans text-[10px] tracking-[0.12em] text-text-secondary uppercase mb-2">ID *</label>
            <input
              value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              disabled={!!editing}
              required
              className="w-full bg-transparent border border-[rgba(168,164,154,0.25)] px-3 py-2 font-sans text-sm text-mist focus:border-cinnabar focus:outline-none disabled:opacity-40"
            />
          </div>
          <div>
            <label className="block font-sans text-[10px] tracking-[0.12em] text-text-secondary uppercase mb-2">类型</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full bg-ink border border-[rgba(168,164,154,0.25)] px-3 py-2 font-sans text-sm text-mist focus:border-cinnabar focus:outline-none"
            >
              <option value="coverage">媒体报道 coverage</option>
              <option value="release">新闻稿 release</option>
              <option value="kit">资料包 kit</option>
            </select>
          </div>
          <div>
            <label className="block font-sans text-[10px] tracking-[0.12em] text-text-secondary uppercase mb-2">日期</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full bg-transparent border border-[rgba(168,164,154,0.25)] px-3 py-2 font-sans text-sm text-mist focus:border-cinnabar focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-sans text-[10px] tracking-[0.12em] text-text-secondary uppercase mb-2">标题 *</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full bg-transparent border border-[rgba(168,164,154,0.25)] px-3 py-2 font-sans text-sm text-mist focus:border-cinnabar focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-sans text-[10px] tracking-[0.12em] text-text-secondary uppercase mb-2">链接 URL</label>
            <input
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://…"
              className="w-full bg-transparent border border-[rgba(168,164,154,0.25)] px-3 py-2 font-sans text-sm text-mist focus:border-cinnabar focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-sans text-[10px] tracking-[0.12em] text-text-secondary uppercase mb-2">文件 URL（kit 用）</label>
            <input
              value={form.file_url}
              onChange={(e) => setForm({ ...form, file_url: e.target.value })}
              placeholder="/uploads/press-kit.zip"
              className="w-full bg-transparent border border-[rgba(168,164,154,0.25)] px-3 py-2 font-sans text-sm text-mist focus:border-cinnabar focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-sans text-[10px] tracking-[0.12em] text-text-secondary uppercase mb-2">来源 / 媒体名</label>
            <input
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              className="w-full bg-transparent border border-[rgba(168,164,154,0.25)] px-3 py-2 font-sans text-sm text-mist focus:border-cinnabar focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button type="submit" className="bg-cinnabar hover:bg-cinnabar-light text-paper font-sans text-xs tracking-wider px-6 py-2.5 transition-colors">
            {editing ? '更新' : '创建'}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => { setEditing(null); setForm(emptyForm); }}
              className="font-sans text-xs text-text-secondary hover:text-mist transition-colors"
            >
              取消编辑
            </button>
          )}
          {msg && <span className="font-sans text-xs text-gold">{msg}</span>}
        </div>
      </form>

      {/* List */}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between border border-[rgba(168,164,154,0.12)] px-4 py-3">
            <div className="min-w-0">
              <span className="font-sans text-[9px] tracking-wider text-cinnabar uppercase mr-3">{item.type}</span>
              <span className="font-serif text-sm text-mist">{item.title}</span>
              <span className="font-sans text-[10px] text-text-secondary ml-3">{item.date}</span>
            </div>
            <div className="flex gap-4 shrink-0">
              <button onClick={() => startEdit(item)} className="font-sans text-[10px] text-text-secondary hover:text-mist uppercase tracking-wider">
                Edit
              </button>
              <button onClick={() => onDelete(item.id)} className="font-sans text-[10px] text-text-secondary hover:text-cinnabar uppercase tracking-wider">
                Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="font-sans text-xs text-text-secondary">暂无条目，使用上方表单创建。</p>
        )}
      </div>
    </div>
  );
}
