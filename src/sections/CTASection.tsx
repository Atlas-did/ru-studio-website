import { Link } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function CTASection() {
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className="bg-ink py-32 md:py-48 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto text-center">
        <p className="font-serif text-[clamp(20px,3vw,32px)] font-light text-mist leading-[1.8] max-w-2xl mx-auto">
          致力于构建儒家文化阐释第一品牌。
        </p>
        <div className="mt-12">
          <Link
            to="/cooperation"
            className="inline-block font-sans text-[11px] tracking-[0.2em] text-mist border border-mist px-8 py-4 hover:bg-cinnabar hover:border-cinnabar active:scale-95 transition-all duration-500 uppercase"
          >
            INITIATE COOPERATION
          </Link>
        </div>
      </div>
    </section>
  );
}
