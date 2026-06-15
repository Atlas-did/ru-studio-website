import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useSiteData } from '@/hooks/useSiteData';
import { api } from '@/lib/api';
import { getCollectionItems } from '@/lib/data';
import TiltCard from '@/components/ui/animated/TiltCard';
import { Link } from 'react-router-dom';

export default function WorksSection() {
  const { data: allItems } = useSiteData(
    () => api.getCollectionItems(),
    { initialData: getCollectionItems() }
  );
  const items = (allItems || []).slice(0, 6);
  const ref = useScrollReveal<HTMLElement>({ stagger: 0.15, childSelector: '.work-card' });

  return (
    <section ref={ref} className="bg-stone py-24 md:py-40 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto">
        {/* Section Title */}
        <h2 className="font-display text-[clamp(28px,3.5vw,42px)] font-normal text-mist tracking-wide mb-16 md:mb-24">
          精选作品
          <span className="ml-4 font-sans text-[11px] tracking-[0.2em] text-text-secondary uppercase align-middle">
            (SELECTED WORKS)
          </span>
        </h2>

        {/* Works Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <TiltCard key={item.slug} maxTilt={4} scale={1.01} className="work-card">
              <Link
                to={`/collection`}
                className="group relative block"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={item.cover.url}
                    alt={item.cover.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                  />

                  {/* Hover stroke border */}
                  <div className="absolute inset-0 border border-mist/0 group-hover:border-mist/60 transition-all duration-500 pointer-events-none" />

                  {/* Hover overlay with VIEW button */}
                  <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-all duration-500 flex items-center justify-center">
                    <span className="font-sans text-[11px] tracking-[0.2em] text-mist border border-mist/60 px-4 py-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                      VIEW
                    </span>
                  </div>
                </div>

                {/* Card info */}
                <div className="mt-4 flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-base font-medium text-mist group-hover:text-cinnabar transition-colors duration-300">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="mt-1 font-sans text-[11px] text-text-secondary tracking-wide">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                  <span className="font-sans text-[10px] tracking-[0.1em] text-text-secondary">
                    {item.year}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-sans text-[10px] tracking-wide text-text-secondary/60 border border-[rgba(168,164,154,0.18)] px-2 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
