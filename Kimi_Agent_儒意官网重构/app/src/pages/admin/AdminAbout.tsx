import { useState } from 'react';
import { Link } from 'react-router-dom';

export function AdminAbout() {
  const [content, setContent] = useState({
    brandName: '儒意',
    brandNameEn: 'RU STUDIO',
    tagline: '向历史借灵感，为当代造美物。',
    contactEmail: 'wu27@qfnu.edu.cn',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-[100dvh] bg-ink pt-24 pb-24">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="font-serif text-display-m text-mist">内容编辑</h1>
            <p className="text-overline text-stone mt-2">CONTENT EDITOR</p>
          </div>
          <Link
            to="/admin/dashboard"
            className="text-overline text-stone hover:text-mist transition-colors"
          >
            返回后台
          </Link>
        </div>

        {/* Form */}
        <div className="border border-border-subtle p-8 md:p-12">
          {saved && (
            <div className="mb-6 px-4 py-3 border border-cinnabar/40 text-cinnabar text-caption">
              保存成功
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-overline text-stone mb-2">品牌名称</label>
              <input
                type="text"
                value={content.brandName}
                onChange={(e) => setContent({ ...content, brandName: e.target.value })}
                className="w-full bg-transparent border border-border-subtle px-4 py-3 text-body text-mist focus:border-mist/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-overline text-stone mb-2">品牌英文</label>
              <input
                type="text"
                value={content.brandNameEn}
                onChange={(e) => setContent({ ...content, brandNameEn: e.target.value })}
                className="w-full bg-transparent border border-border-subtle px-4 py-3 text-body text-mist focus:border-mist/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-overline text-stone mb-2">标语</label>
              <input
                type="text"
                value={content.tagline}
                onChange={(e) => setContent({ ...content, tagline: e.target.value })}
                className="w-full bg-transparent border border-border-subtle px-4 py-3 text-body text-mist focus:border-mist/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-overline text-stone mb-2">联系邮箱</label>
              <input
                type="email"
                value={content.contactEmail}
                onChange={(e) => setContent({ ...content, contactEmail: e.target.value })}
                className="w-full bg-transparent border border-border-subtle px-4 py-3 text-body text-mist focus:border-mist/40 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="mt-8 w-full px-8 py-4 bg-cinnabar text-mist text-overline tracking-overline hover:bg-cinnabar-light transition-colors"
          >
            保存更改
          </button>
        </div>
      </div>
    </div>
  );
}
