import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/admin-api';
import { api } from '@/lib/api';

export default function AdminSiteConfig() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.getSiteConfig().then((data) => {
      // Convert SiteConfig interface to Record<string, string>
      const record: Record<string, string> = {};
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') record[key] = value;
      }
      setConfig(record);
    }).catch(console.error);
  }, []);

  const handleChange = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      await adminApi.updateSiteConfig(config);
      setMsg('站点配置已更新');
    } catch {
      setMsg('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: 'brandName', label: '品牌名称（中文）' },
    { key: 'brandNameEn', label: '品牌名称（英文）' },
    { key: 'tagline', label: '品牌标语' },
    { key: 'contactEmail', label: '联系邮箱' },
    { type: 'divider' },
    { key: 'quoteText', label: 'Quote 引言文字' },
    { key: 'quoteAttribution', label: 'Quote 署名' },
    { type: 'divider' },
    { key: 'ctaTitle', label: 'CTA 标题' },
    { key: 'ctaSubtitle', label: 'CTA 描述' },
    { key: 'ctaButtonText', label: 'CTA 按钮文字' },
    { type: 'divider' },
    { key: 'homepageVideoUrl', label: '首页视频 URL' },
    { key: 'homepageVideoTitle', label: '首页视频标题' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl text-mist tracking-wide mb-8">Site Config</h1>
      <p className="font-sans text-[11px] tracking-[0.15em] text-text-secondary uppercase mb-8">
        品牌配置
      </p>

      <div className="space-y-6">
        {fields.map((field, idx) => {
          if ((field as any).type === 'divider') {
            return <div key={`div-${idx}`} className="border-t border-[rgba(245,242,235,0.08)] pt-6 mt-6" />;
          }
          const key = field.key!;
          return (
            <div key={key}>
              <label className="block font-sans text-[11px] tracking-[0.1em] text-text-secondary uppercase mb-2">
                {field.label}
              </label>
              <input
                type="text"
                value={config[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full bg-[rgba(168,164,154,0.06)] border border-[rgba(168,164,154,0.15)] px-4 py-2.5 font-serif text-sm text-mist focus:outline-none focus:border-cinnabar transition-colors"
              />
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="font-sans text-[11px] tracking-[0.2em] text-mist bg-cinnabar px-6 py-2.5 hover:opacity-80 transition-opacity uppercase disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {msg && (
          <span className={`font-sans text-xs ${msg.includes('失败') ? 'text-cinnabar' : 'text-mist'}`}>
            {msg}
          </span>
        )}
      </div>
    </div>
  );
}
