import { useState, useEffect, useRef } from 'react';
import { adminApi } from '@/lib/admin-api';

interface CollectionItem {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  cover_url: string;
  cover_alt: string;
  cover_width: number;
  cover_height: number;
  year: number;
  tags: string[];
  content: string;
  video_url: string;
  model_url: string;
  sort_order: number;
}

const emptyItem: CollectionItem = {
  slug: '', title: '', subtitle: '', category: '摄影',
  cover_url: '', cover_alt: '', cover_width: 800, cover_height: 1067,
  year: new Date().getFullYear(), tags: [], content: '', video_url: '', model_url: '', sort_order: 0,
};

const categories = ['影像', '摄影', '装置', '纪录'];

export default function AdminCollection() {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [editing, setEditing] = useState<CollectionItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CollectionItem>(emptyItem);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchData = () => {
    adminApi
      .getCollection()
      .then((data) => setItems(data.map((item: any) => ({
        ...item,
        tags: Array.isArray(item.tags) ? item.tags : [],
        content: item.content || '',
        cover_url: item.cover?.url || item.cover_url || '',
        cover_alt: item.cover?.alt || item.cover_alt || '',
      }))))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await adminApi.uploadImage(file);
      setForm((prev) => ({ ...prev, cover_url: result.url }));
      setMsg('图片已上传');
    } catch {
      setMsg('上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setMsg('');
    try {
      if (creating) {
        await adminApi.createCollectionItem(form);
      } else {
        await adminApi.updateCollectionItem(form.slug, form);
      }
      setMsg(creating ? '作品已创建' : '作品已更新');
      setCreating(false);
      setEditing(null);
      fetchData();
    } catch {
      setMsg('操作失败');
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('确定删除此作品？')) return;
    try {
      await adminApi.deleteCollectionItem(slug);
      setMsg('作品已删除');
      fetchData();
    } catch {
      setMsg('删除失败');
    }
  };

  const openCreate = () => {
    setForm(emptyItem);
    setCreating(true);
    setEditing(emptyItem);
  };

  const openEdit = (item: CollectionItem) => {
    setForm({ ...item });
    setCreating(false);
    setEditing(item);
  };

  if (loading) {
    return <p className="font-serif text-sm text-text-secondary">Loading...</p>;
  }

  const FormFields = () => (
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
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="block font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase mb-1">作品名称</label>
        <input type="text" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full bg-[rgba(168,164,154,0.06)] border border-[rgba(168,164,154,0.15)] px-3 py-2 font-serif text-sm text-mist focus:outline-none focus:border-cinnabar" />
      </div>
      <div>
        <label className="block font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase mb-1">副标题（英文）</label>
        <input type="text" value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          className="w-full bg-[rgba(168,164,154,0.06)] border border-[rgba(168,164,154,0.15)] px-3 py-2 font-sans text-sm text-mist focus:outline-none focus:border-cinnabar" />
      </div>
      <div>
        <label className="block font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase mb-1">年份</label>
        <input type="number" value={form.year}
          onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || 2024 })}
          className="w-full bg-[rgba(168,164,154,0.06)] border border-[rgba(168,164,154,0.15)] px-3 py-2 font-mono text-sm text-mist focus:outline-none focus:border-cinnabar" />
      </div>
      <div>
        <label className="block font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase mb-1">标签（逗号分隔）</label>
        <input type="text" value={form.tags.join(', ')}
          onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
          className="w-full bg-[rgba(168,164,154,0.06)] border border-[rgba(168,164,154,0.15)] px-3 py-2 font-serif text-sm text-mist focus:outline-none focus:border-cinnabar" />
      </div>
      <div className="md:col-span-2">
        <label className="block font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase mb-1">封面图片</label>
        <div className="flex gap-3 items-start">
          <input type="text" value={form.cover_url}
            onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
            placeholder="图片URL"
            className="flex-1 bg-[rgba(168,164,154,0.06)] border border-[rgba(168,164,154,0.15)] px-3 py-2 font-mono text-xs text-mist focus:outline-none focus:border-cinnabar" />
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="font-sans text-[10px] tracking-[0.1em] text-mist border border-[rgba(168,164,154,0.3)] px-3 py-2 hover:bg-cinnabar hover:border-cinnabar transition-all uppercase whitespace-nowrap disabled:opacity-50">
            {uploading ? '...' : 'Upload'}
          </button>
          <button onClick={() => setForm({ ...form, cover_url: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&q=80' })}
            className="font-sans text-[9px] text-text-secondary/40 hover:text-mist px-2 py-2 transition-colors">
            填Unsplash
          </button>
        </div>
        {form.cover_url && (
          <img src={form.cover_url} alt="preview" className="mt-2 w-32 h-auto object-cover border border-[rgba(168,164,154,0.15)]" />
        )}
      </div>
      <div className="md:col-span-2">
        <label className="block font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase mb-1">Alt 文本</label>
        <input type="text" value={form.cover_alt}
          onChange={(e) => setForm({ ...form, cover_alt: e.target.value })}
          className="w-full bg-[rgba(168,164,154,0.06)] border border-[rgba(168,164,154,0.15)] px-3 py-2 font-serif text-sm text-mist focus:outline-none focus:border-cinnabar" />
      </div>
      <div className="md:col-span-2">
        <label className="block font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase mb-1">
          作品详情（换行分段，用于详情页展示）
        </label>
        <textarea value={form.content} rows={8}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="w-full bg-[rgba(168,164,154,0.06)] border border-[rgba(168,164,154,0.15)] px-3 py-2 font-serif text-sm text-mist focus:outline-none focus:border-cinnabar resize-y leading-relaxed"
          placeholder="输入作品详细介绍，换行即分段..." />
      </div>
      <div>
        <label className="block font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase mb-1">
          视频链接（可选）
        </label>
        <input type="text" value={(form as any).video_url || ''}
          onChange={(e) => setForm({ ...form, video_url: e.target.value })}
          placeholder="粘贴视频 URL，如 https://res.cloudinary.com/..."
          className="w-full bg-[rgba(168,164,154,0.06)] border border-[rgba(168,164,154,0.15)] px-3 py-2 font-mono text-xs text-mist focus:outline-none focus:border-cinnabar" />
      </div>
      <div>
        <label className="block font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase mb-1">
          3D 模型链接（可选，.glb / .gltf）
        </label>
        <input type="text" value={(form as any).model_url || ''}
          onChange={(e) => setForm({ ...form, model_url: e.target.value })}
          placeholder="粘贴 3D 模型 URL，如 https://res.cloudinary.com/..."
          className="w-full bg-[rgba(168,164,154,0.06)] border border-[rgba(168,164,154,0.15)] px-3 py-2 font-mono text-xs text-mist focus:outline-none focus:border-cinnabar" />
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl text-mist tracking-wide">Collection</h1>
          <p className="mt-1 font-sans text-[11px] tracking-[0.15em] text-text-secondary uppercase">作品收藏管理</p>
        </div>
        <button onClick={openCreate}
          className="font-sans text-[11px] tracking-[0.15em] text-mist border border-mist/60 px-4 py-2 hover:bg-cinnabar hover:border-cinnabar transition-all uppercase">
          + New
        </button>
      </div>

      {msg && (
        <p className={`font-sans text-xs mb-4 ${msg.includes('失败') ? 'text-cinnabar' : 'text-mist'}`}>{msg}</p>
      )}

      {editing && (
        <div className="mb-8 p-6 bg-[rgba(168,164,154,0.04)] border border-[rgba(168,164,154,0.15)]">
          <h2 className="font-serif text-sm font-medium text-mist mb-6">{creating ? '新建作品' : '编辑作品'}</h2>
          <FormFields />
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
              <th className="text-left py-3 font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase">Slug</th>
              <th className="text-left py-3 font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase">封面</th>
              <th className="text-left py-3 font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase">名称</th>
              <th className="text-left py-3 font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase">分类</th>
              <th className="text-left py-3 font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase">年份</th>
              <th className="text-right py-3 font-sans text-[10px] tracking-[0.1em] text-text-secondary uppercase w-24">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.slug} className="border-b border-[rgba(168,164,154,0.06)] hover:bg-[rgba(168,164,154,0.03)]">
                <td className="py-3 font-mono text-xs text-text-secondary/60">{item.slug}</td>
                <td className="py-3">
                  {item.cover_url && (
                    <img src={item.cover_url} alt="" className="w-12 h-12 object-cover border border-[rgba(168,164,154,0.12)]" />
                  )}
                </td>
                <td className="py-3 font-serif text-sm text-mist">{item.title}</td>
                <td className="py-3">
                  <span className="font-sans text-[10px] text-text-secondary border border-[rgba(168,164,154,0.2)] px-2 py-0.5">{item.category}</span>
                </td>
                <td className="py-3 font-sans text-xs text-text-secondary">{item.year}</td>
                <td className="py-3 text-right">
                  <button onClick={() => openEdit(item)}
                    className="font-sans text-[10px] text-text-secondary hover:text-mist transition-colors mr-3">Edit</button>
                  <button onClick={() => handleDelete(item.slug)}
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
