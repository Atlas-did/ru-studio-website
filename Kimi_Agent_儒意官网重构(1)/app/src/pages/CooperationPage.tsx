import { useState } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useSiteData } from '@/hooks/useSiteData';
import { api } from '@/lib/api';
import { getSiteConfig } from '@/lib/data';

export default function CooperationPage() {
  const { data: config } = useSiteData(
    () => api.getSiteConfig(),
    { initialData: getSiteConfig() }
  );
  const titleRef = useScrollReveal<HTMLDivElement>();
  const formRef = useScrollReveal<HTMLDivElement>();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = {
      name: formData.get('name') as string,
      organization: formData.get('organization') as string,
      purpose: formData.get('purpose') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
    };

    const result = await api.submitContact(data);
    if (result.success) {
      setSubmitted(true);
    } else {
      setSubmitError(result.message || '提交失败');
    }
  };

  return (
    <div className="bg-ink min-h-screen pt-20 md:pt-28">
      {/* Hero */}
      <div ref={titleRef} className="px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-[1440px] mx-auto">
          <p className="font-sans text-[11px] tracking-[0.2em] text-text-secondary uppercase mb-6">
            COOPERATION
          </p>
          <h1 className="font-display text-[clamp(36px,5vw,64px)] font-light text-mist tracking-wide">
            合作联系
          </h1>
          <p className="mt-6 font-serif text-[15px] text-text-secondary leading-[1.8] max-w-xl">
            如果您对儒家文化文创有兴趣，或希望探讨合作机会，请通过以下表单与我们取得联系。
          </p>
        </div>
      </div>

      {/* Form */}
      <div ref={formRef} className="px-6 md:px-12 pb-24 md:pb-40">
        <div className="max-w-[720px] mx-auto">
          {submitted ? (
            <div className="text-center py-16">
              <p className="font-serif text-xl text-mist mb-4">感谢您的来信</p>
              <p className="font-serif text-sm text-text-secondary">
                我们会尽快与您取得联系。
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block font-sans text-[11px] tracking-[0.15em] text-text-secondary uppercase mb-3">
                    姓名 / NAME
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full bg-transparent border-b border-[rgba(168,164,154,0.3)] py-3 font-serif text-mist placeholder:text-text-secondary/40 focus:outline-none focus:border-mist transition-colors duration-300"
                    placeholder="您的姓名"
                  />
                </div>
                <div>
                  <label className="block font-sans text-[11px] tracking-[0.15em] text-text-secondary uppercase mb-3">
                    机构 / ORGANIZATION
                  </label>
                  <input
                    type="text"
                    name="organization"
                    className="w-full bg-transparent border-b border-[rgba(168,164,154,0.3)] py-3 font-serif text-mist placeholder:text-text-secondary/40 focus:outline-none focus:border-mist transition-colors duration-300"
                    placeholder="您的机构名称（选填）"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-[11px] tracking-[0.15em] text-text-secondary uppercase mb-3">
                  合作意向 / PURPOSE
                </label>
                <input
                  type="text"
                  name="purpose"
                  required
                  className="w-full bg-transparent border-b border-[rgba(168,164,154,0.3)] py-3 font-serif text-mist placeholder:text-text-secondary/40 focus:outline-none focus:border-mist transition-colors duration-300"
                  placeholder="简述您的合作意向"
                />
              </div>

              <div>
                <label className="block font-sans text-[11px] tracking-[0.15em] text-text-secondary uppercase mb-3">
                  邮箱 / EMAIL
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full bg-transparent border-b border-[rgba(168,164,154,0.3)] py-3 font-serif text-mist placeholder:text-text-secondary/40 focus:outline-none focus:border-mist transition-colors duration-300"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block font-sans text-[11px] tracking-[0.15em] text-text-secondary uppercase mb-3">
                  备注 / MESSAGE
                </label>
                <textarea
                  name="message"
                  rows={4}
                  className="w-full bg-transparent border-b border-[rgba(168,164,154,0.3)] py-3 font-serif text-mist placeholder:text-text-secondary/40 focus:outline-none focus:border-mist transition-colors duration-300 resize-none"
                  placeholder="其他需要说明的事项（选填）"
                />
              </div>

              {submitError && (
                <p className="font-sans text-xs text-cinnabar">{submitError}</p>
              )}

              <div className="pt-8">
                <button
                  type="submit"
                  className="font-sans text-[11px] tracking-[0.2em] text-mist border border-mist px-8 py-4 hover:bg-cinnabar hover:border-cinnabar transition-all duration-500 uppercase"
                >
                  SUBMIT
                </button>
              </div>
            </form>
          )}

          <div className="mt-16 pt-8 border-t border-[rgba(168,164,154,0.18)]">
            <p className="font-sans text-[11px] tracking-[0.1em] text-text-secondary">
              或直接发送邮件至：{config?.contactEmail}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
