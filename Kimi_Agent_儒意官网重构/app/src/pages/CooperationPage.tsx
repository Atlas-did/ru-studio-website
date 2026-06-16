import { useState } from 'react';

export function CooperationPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    org: '',
    type: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const types = ['高校文创定制', '品牌文化升级', '展览策划合作', '文化产品开发', '其他'];

  return (
    <section className="min-h-[100dvh] bg-ink pt-32 md:pt-40 pb-24">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          {/* Left: Info */}
          <div className="md:col-span-5">
            <span className="block text-overline text-stone mb-4">COOPERATION</span>
            <h1 className="font-serif text-display-l text-mist mb-8" style={{ textWrap: 'balance' }}>
              文化合作
            </h1>
            <p className="text-body text-stone leading-relaxed mb-12">
              我们欢迎各类文化合作，包括高校文创定制、品牌文化升级、展览策划、文化产品开发等。请填写右侧表单，我们将尽快与您联系。
            </p>

            <div className="space-y-8">
              <div>
                <h3 className="text-overline text-stone mb-2">合作邮箱</h3>
                <p className="text-body text-mist">wu27@qfnu.edu.cn</p>
              </div>
              <div>
                <h3 className="text-overline text-stone mb-2">工作室地址</h3>
                <p className="text-body text-mist">山东省曲阜市曲阜师范大学</p>
              </div>
              <div>
                <h3 className="text-overline text-stone mb-2">合作类型</h3>
                <div className="flex flex-wrap gap-2 mt-3">
                  {types.map((t) => (
                    <span key={t} className="px-3 py-1.5 border border-border-subtle text-caption-s text-stone">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="md:col-span-6 md:col-start-7">
            <div className="border border-border-subtle p-8 md:p-12">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-cinnabar/40 flex items-center justify-center">
                    <svg className="w-8 h-8 text-cinnabar" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-h1 text-mist mb-2">提交成功</h3>
                  <p className="text-body text-stone">我们会尽快与您联系</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-overline text-stone mb-2">姓名</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-transparent border border-border-subtle px-4 py-3 text-body text-mist focus:border-mist/40 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-overline text-stone mb-2">邮箱</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-transparent border border-border-subtle px-4 py-3 text-body text-mist focus:border-mist/40 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-overline text-stone mb-2">机构/公司</label>
                    <input
                      type="text"
                      name="org"
                      value={formData.org}
                      onChange={handleChange}
                      className="w-full bg-transparent border border-border-subtle px-4 py-3 text-body text-mist focus:border-mist/40 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-overline text-stone mb-2">合作类型</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="w-full bg-ink border border-border-subtle px-4 py-3 text-body text-mist focus:border-mist/40 focus:outline-none transition-colors"
                    >
                      <option value="">请选择</option>
                      {types.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-overline text-stone mb-2">合作详情</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      required
                      className="w-full bg-transparent border border-border-subtle px-4 py-3 text-body text-mist focus:border-mist/40 focus:outline-none transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="group relative w-full px-8 py-4 border border-mist/60 text-mist text-overline tracking-overline overflow-hidden transition-colors duration-500 hover:border-cinnabar"
                  >
                    <span className="absolute inset-0 bg-cinnabar transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                    <span className="relative z-10">提交合作意向</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
