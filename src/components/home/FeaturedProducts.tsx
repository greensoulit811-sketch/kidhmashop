import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useFeaturedProducts } from '@/hooks/useShopData';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { ProductCard } from '@/components/products/ProductCard';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import type { HomepageSection } from '@/hooks/useHomepageTemplates';

export function FeaturedProducts({ section }: { section?: HomepageSection }) {
  const { data: products = [], isLoading } = useFeaturedProducts();
  const { t } = useSiteSettings();
  const { ref, isVisible } = useScrollReveal();

  const [emblaRef] = useEmblaCarousel(
    { 
      loop: true, 
      align: 'start',
      slidesToScroll: 1,
      breakpoints: {
        '(min-width: 640px)': { slidesToScroll: 2 },
        '(min-width: 768px)': { slidesToScroll: 3 },
        '(min-width: 1024px)': { slidesToScroll: 5 }
      }
    }, 
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  if (isLoading) {
    return (
      <section className="py-6 md:py-8">
        <div className="container-shop">
          <div className="h-64 bg-muted animate-pulse rounded-xl" />
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-6 md:py-10" ref={ref}>
      <div className="container-shop">
        <div className={`flex items-center justify-between mb-6 reveal-left ${isVisible ? 'reveal-visible' : ''}`}>
          <div className="flex items-center gap-2 md:gap-4">
            <div>
              <h2 className="text-lg md:text-2xl font-bold text-gray-900">{section?.title || "Featured Products"}</h2>
            </div>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-1 text-[11px] md:text-sm font-semibold text-gray-500 hover:text-[#e6007e] transition-colors"
          >
            {t('common.viewAll') || "View All"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="embla overflow-hidden" ref={emblaRef}>
          <div className="embla__container flex -ml-2 md:-ml-4">
            {products.map((product, index) => (
              <div key={product.id} className="embla__slide flex-[0_0_50%] sm:flex-[0_0_33.33%] md:flex-[0_0_25%] lg:flex-[0_0_20%] pl-2 md:pl-4">
                <div className={`h-full reveal-base stagger-${(index % 5) + 1} ${isVisible ? 'reveal-visible' : ''}`}>
                  <ProductCard product={product} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

