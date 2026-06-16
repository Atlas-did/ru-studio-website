import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const ctx = gsap.context(() => {
      const items = content.querySelectorAll('.reveal-item');
      gsap.from(items, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-ink py-32 md:py-40 lg:py-48 overflow-hidden"
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139,26,26,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 30% 60%, rgba(156,132,88,0.05) 0%, transparent 70%)
          `,
        }}
      />

      <div
        ref={contentRef}
        className="relative z-10 max-w-3xl mx-auto px-6 text-center"
      >
        <span className="reveal-item block text-overline text-stone mb-6">
          GET IN TOUCH
        </span>

        <h2
          className="reveal-item font-serif text-display-l text-mist mb-8"
          style={{ textWrap: 'balance' }}
        >
          开启文化合作
        </h2>

        <p
          className="reveal-item text-body-l text-mist/60 mb-12 max-w-xl mx-auto leading-relaxed"
          style={{ textWrap: 'pretty' }}
        >
          无论是高校文创定制、文化品牌升级，还是儒家文化主题合作，我们期待与您共同探索传统文化在当代的无限可能。
        </p>

        <div className="reveal-item flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/cooperation"
            className="group relative px-8 py-4 border border-mist/60 text-mist text-overline tracking-overline overflow-hidden transition-colors duration-500 hover:border-cinnabar hover:text-mist"
          >
            {/* Hover fill effect */}
            <span className="absolute inset-0 bg-cinnabar transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
            <span className="relative z-10">发起合作</span>
          </Link>

          <a
            href="mailto:wu27@qfnu.edu.cn"
            className="px-8 py-4 text-stone text-overline tracking-overline hover:text-mist transition-colors duration-300"
          >
            wu27@qfnu.edu.cn
          </a>
        </div>
      </div>
    </section>
  );
}
