import { useState, useRef } from 'react';

export default function AdminMedia() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ url: string; type: string } | null>(null);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('ru_admin_token')}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        const ext = file.name.split('.').pop()?.toLowerCase();
        let type = 'image';
        if (['mp4', 'webm', 'mov'].includes(ext || '')) type = 'video';
        else if (['glb', 'gltf'].includes(ext || '')) type = '3d-model';
        setResult({ url: data.url, type });
        setMsg('上传成功！复制下方 URL 使用');
      } else {
        setMsg(data.error || '上传失败');
      }
    } catch {
      setMsg('网络错误');
    } finally {
      setUploading(false);
    }
  };

  const typeLabels: Record<string, string> = { image: '图片', video: '视频', '3d-model': '3D 模型' };
  const typeIcons: Record<string, string> = { image: '🖼️', video: '🎬', '3d-model': '🧊' };

  return (
    <div>
      <h1 className="font-display text-2xl text-mist tracking-wide mb-2">Media Library</h1>
      <p className="font-sans text-[11px] tracking-[0.15em] text-text-secondary uppercase mb-8">
        上传图片 / 视频 / 3D 模型
      </p>

      {/* Upload zone */}
      <div className="border-2 border-dashed border-[rgba(245,242,235,0.12)] rounded p-10 text-center mb-8 hover:border-mist/30 transition-colors">
        <input ref={fileRef} type="file" onChange={handleUpload}
          accept="image/*,video/*,.glb,.gltf"
          className="hidden" />
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="font-sans text-sm text-mist/70 hover:text-mist transition-colors">
          {uploading ? '上传中...' : '点击上传 或拖拽文件到此处'}
        </button>
        <p className="mt-2 font-sans text-[10px] text-text-secondary/40">
          支持 JPG/PNG/WebP/GIF/SVG/MP4/WebM/MOV/GLB/GLTF · 最大 50MB
        </p>
      </div>

      {msg && (
        <p className={`font-sans text-xs mb-4 ${msg.includes('失败') ? 'text-cinnabar' : 'text-mist'}`}>{msg}</p>
      )}

      {result && (
        <div className="bg-[rgba(168,164,154,0.04)] border border-[rgba(245,242,235,0.1)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{typeIcons[result.type]}</span>
            <div>
              <p className="font-sans text-xs text-mist">{typeLabels[result.type]} 上传成功</p>
              <p className="font-sans text-[10px] text-text-secondary/60 mt-1">请复制以下 URL 粘贴到作品或日志的对应字段中</p>
            </div>
          </div>

          {/* URL display */}
          <div className="flex items-center gap-2">
            <input type="text" readOnly value={result.url}
              className="flex-1 bg-ink border border-[rgba(245,242,235,0.1)] px-3 py-2 font-mono text-xs text-mist/80"
              onClick={(e) => (e.target as HTMLInputElement).select()} />
            <button onClick={() => { navigator.clipboard.writeText(result.url); setMsg('已复制！'); }}
              className="font-sans text-[10px] text-mist border border-mist/30 px-3 py-2 hover:bg-cinnabar hover:border-cinnabar transition-all uppercase shrink-0">
              复制
            </button>
          </div>

          {/* Preview */}
          {result.type === 'image' && (
            <img src={result.url} alt="preview" className="mt-4 max-w-xs max-h-48 object-contain border border-[rgba(245,242,235,0.08)]" />
          )}
          {result.type === 'video' && (
            <video src={result.url} controls className="mt-4 max-w-md max-h-64 border border-[rgba(245,242,235,0.08)]" />
          )}
        </div>
      )}

      {/* Usage guide */}
      <div className="mt-12 p-6 bg-[rgba(168,164,154,0.03)] border border-[rgba(245,242,235,0.06)]">
        <h2 className="font-serif text-sm font-medium text-mist mb-4">使用说明</h2>
        <div className="space-y-3 text-caption text-stone leading-relaxed">
          <p>1. 在此页面上传图片/视频/3D 模型文件</p>
          <p>2. 复制生成的 URL</p>
          <p>3. 前往 Collection / Journal 编辑页面</p>
          <p>4. 粘贴 URL 到对应字段：封面图片 / 视频链接 / 3D 模型链接</p>
          <p>5. 保存后在网站前端即可看到</p>
        </div>
      </div>
    </div>
  );
}
