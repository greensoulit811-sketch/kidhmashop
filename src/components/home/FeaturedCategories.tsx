import { useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/useShopData';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import type { HomepageSection } from '@/hooks/useHomepageTemplates';

export function FeaturedCategories({ section }: { section?: HomepageSection }) {
  const { data: categories = [], isLoading } = useCategories();
  const { t } = useSiteSettings();
  const { ref: sectionRef, isVisible } = useScrollReveal();

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: 'start',
      slidesToScroll: 1,
      breakpoints: {
        '(min-width: 640px)': { slidesToScroll: 2 },
        '(min-width: 1024px)': { slidesToScroll: 4 }
      }
    }, 
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (isLoading) {
    return (
      <section className="py-10">
        <div className="container-shop">
          <div className="h-40 bg-muted animate-pulse rounded-xl" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 md:py-12 bg-white" ref={sectionRef}>
      <div className="container-shop">
        {/* Header with line and navigation */}
        <div className={`flex items-center gap-4 mb-6 reveal-left ${isVisible ? 'reveal-visible' : ''}`}>
          <div className="bg-[#f39c12] text-white px-4 py-1.5 font-bold text-sm md:text-lg whitespace-nowrap rounded-sm shadow-sm inline-block">
            {section?.title || t('home.shopByCategory') || "Categories"}
          </div>
          
          <div className="flex-grow h-[2px] bg-[#f39c12]" />
          
          <div className="flex items-center gap-1">
            <button 
              onClick={scrollPrev}
              className="p-1 md:p-1.5 bg-[#f39c12] hover:bg-[#e67e22] text-white rounded-sm transition-colors shadow-sm"
              aria-label="Previous categories"
            >
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <button 
              onClick={scrollNext}
              className="p-1 md:p-1.5 bg-[#f39c12] hover:bg-[#e67e22] text-white rounded-sm transition-colors shadow-sm"
              aria-label="Next categories"
            >
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="embla overflow-hidden" ref={emblaRef}>
          <div className="embla__container flex">
            {categories.map((category, index) => (
              <div key={category.id} className="embla__slide flex-[0_0_50%] sm:flex-[0_0_33.33%] md:flex-[0_0_25%] lg:flex-[0_0_16.666%] px-2">
                <Link
                  to={`/category/${category.slug}`}
                  className={`flex flex-col items-center group transition-transform duration-300 hover:-translate-y-1 ${isVisible ? 'reveal-visible' : ''}`}
                >
                  <div className="w-full aspect-square relative rounded-md overflow-hidden border border-gray-100 bg-gray-50 shadow-sm mb-3">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-contain p-2 mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-[12px] md:text-sm font-bold text-center text-gray-800 line-clamp-1 group-hover:text-[#f39c12] transition-colors">
                    {category.name}
                  </h3>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

