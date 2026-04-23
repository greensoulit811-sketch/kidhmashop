import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLandingPage } from '@/hooks/useLandingPages';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useAuth } from '@/hooks/useAuth';
import { useCreateOrder } from '@/hooks/useOrders';
import { useShippingMethods } from '@/hooks/useShippingMethods';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useReviews, Product } from '@/hooks/useShopData';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, ShoppingBag, ChevronDown, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const getVideoEmbedUrl = (url: string) => {
  const value = url.trim();
  if (!value) return '';

  // YouTube
  if (value.includes('youtube.com/embed/')) return value;
  if (value.includes('youtube.com/watch') || value.includes('youtu.be/')) {
    const match = value.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}`;
  }

  // Vimeo
  if (value.includes('vimeo.com/')) {
    const match = value.match(/vimeo\.com\/(\d+)/);
    if (match?.[1]) return `https://player.vimeo.com/video/${match[1]}`;
  }

  // Google Drive
  if (value.includes('drive.google.com')) {
    const match = value.match(/\/d\/(.+?)\/(view|edit|preview)?/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  }

  return value;
};

const isDirectVideo = (url: string) => {
  const value = url.trim().toLowerCase();
  // Don't treat drive links as direct video (requires iframe)
  if (value.includes('drive.google.com')) return false;
  return value.endsWith('.mp4') || value.endsWith('.webm') || value.endsWith('.ogg') || value.includes('supabase.co/storage/v1/object/public/');
};

const parseFormattedText = (text: string) => {
  if (!text) return null;
  return text.split(/(\[\[.*?\]\]|\{\{.*?\}\})/).map((part, i) => {
    if (part.startsWith('[[') && part.endsWith(']]')) {
      return (
        <span key={i} className="text-[#065f46]">
          {part.substring(2, part.length - 2)}
        </span>
      );
    }
    if (part.startsWith('{{') && part.endsWith('}}')) {
      return (
        <span key={i} className="text-[#ff0000]">
          {part.substring(2, part.length - 2)}
        </span>
      );
    }
    return part;
  });
};

// Fetch products by IDs
const useLandingProducts = (ids: string[]) => {
  return useQuery({
    queryKey: ['landing_products', ids],
    queryFn: async () => {
      if (!ids.length) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', ids);
      if (error) throw error;
      // Maintain order
      const map = new Map((data || []).map(p => [p.id, p]));
      return ids.map(id => map.get(id)).filter(Boolean) as Product[];
    },
    enabled: ids.length > 0,
  });
};

const PricingBanner = ({ oldPrice, newPrice }: { oldPrice: string; newPrice: string }) => (
  <div className="w-full mt-6 md:mt-10 px-2">
    <div className="relative bg-[#14532d] py-8 md:py-20 overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
      {/* Decorative shimmering background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <svg className="w-full h-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="leaf-pattern-v2" width="15" height="15" patternUnits="userSpaceOnUse">
            <path d="M7.5 0 Q 10 7.5 7.5 15 Q 5 7.5 7.5 0 Z" fill="white" />
          </pattern>
          <rect width="100" height="100" fill="url(#leaf-pattern-v2)" />
        </svg>
      </div>

      {/* Outer Glow */}
      <div className="absolute -inset-24 bg-[#bef264]/10 blur-[100px] animate-pulse pointer-events-none" />

      {/* Frame */}
      <div className="absolute inset-4 md:inset-6 border-[2px] border-dashed border-[#bef264]/40 rounded-xl" />

      <div className="relative z-10 text-center flex flex-col items-center justify-center space-y-8 px-6 w-full">
        {/* Old Price */}
        <div className="text-xl md:text-3xl font-bold text-white/80 tracking-widest flex items-center justify-center gap-3">
          <span className="relative inline-block px-4 py-2">
            {oldPrice}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] md:h-[5px] bg-red-600 -rotate-12 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.7)]" />
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] md:h-[5px] bg-red-600 rotate-12 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.7)]" />
          </span>
        </div>

        {/* New Price with Animation */}
        <div className="flex flex-col items-center group cursor-default">
          <div className="text-4xl md:text-8xl font-black flex flex-wrap items-center justify-center gap-x-4 md:gap-x-6 tracking-tighter leading-none animate-bounce-subtle">
            <span className="text-[#bef264] drop-shadow-[0_0_20px_rgba(190,242,100,0.5)] filter brightness-110">
              {newPrice}
            </span>
          </div>

          {/* Animated Highlight Underline */}
          <div className="relative w-full max-w-[400px] h-2 md:h-4 mt-6">
            <div className="absolute inset-0 bg-[#facc15] rounded-full shadow-[0_0_30px_rgba(250,204,21,0.8)] animate-pulse" />
            <div className="absolute inset-x-8 md:inset-x-12 -bottom-2 h-2 bg-[#facc15] rounded-full opacity-40 blur-[1px]" />
          </div>
        </div>
      </div>
    </div>

    <style>{`
      @keyframes bounce-subtle {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      .animate-bounce-subtle {
        animation: bounce-subtle 3s ease-in-out infinite;
      }
    `}</style>
  </div>
);

export default function LandingPageView({ slug: slugProp }: { slug?: string }) {
  const { slug: slugParam } = useParams<{ slug: string }>();
  const slug = slugProp || slugParam;
  const navigate = useNavigate();
  const { data: page, isLoading } = useLandingPage(slug || '');
  const { t, formatCurrency, settings } = useSiteSettings();
  const { user } = useAuth();
  const createOrder = useCreateOrder();
  const { data: shippingMethods = [] } = useShippingMethods(true);
  const { data: paymentMethods = [] } = usePaymentMethods(true);
  const { data: reviews = [] } = useReviews(true);
  const { data: products = [] } = useLandingProducts(page?.product_ids || []);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    country: settings.default_country_name,
    shippingMethodId: '',
    paymentMethodId: '',
  });
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    if (products.length > 0 && !selectedProduct) {
      setSelectedProduct(products[0]);
    }
  }, [products]);

  useEffect(() => {
    if (shippingMethods.length > 0 && !formData.shippingMethodId) {
      setFormData(prev => ({ ...prev, shippingMethodId: shippingMethods[0].id }));
    }
  }, [shippingMethods]);

  useEffect(() => {
    if (paymentMethods.length > 0 && !formData.paymentMethodId) {
      setFormData(prev => ({ ...prev, paymentMethodId: paymentMethods[0].id }));
    }
  }, [paymentMethods]);

  const selectedShipping = shippingMethods.find(m => m.id === formData.shippingMethodId);
  const shippingCost = selectedShipping?.base_rate || 0;
  const effectivePrice = selectedProduct ? (selectedProduct.sale_price ?? selectedProduct.price) : 0;
  const subtotal = effectivePrice * quantity;
  const total = subtotal + shippingCost;

  const selectedPayment = paymentMethods.find(m => m.id === formData.paymentMethodId);
  const hasPartial = selectedPayment?.allow_partial_delivery_payment || false;
  let advanceAmount = 0;
  let dueOnDelivery = total;
  if (hasPartial && selectedPayment) {
    if (selectedPayment.partial_type === 'delivery_charge') advanceAmount = shippingCost;
    else if (selectedPayment.partial_type === 'fixed_amount') advanceAmount = Math.min(selectedPayment.fixed_partial_amount || 0, total);
    dueOnDelivery = total - advanceAmount;
  }
  const requiresTrxId = selectedPayment?.require_transaction_id || false;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const copyUrl = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/lp/${slug}`);
    toast.success('URL copied');
  };

  const scrollToCheckout = () => {
    document.getElementById('lp-checkout')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city) {
      toast.error(t('validation.fillRequired') || 'Please fill all required fields');
      return;
    }
    if (requiresTrxId && !transactionId.trim()) {
      toast.error('Transaction ID is required');
      return;
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;
    const partialSnapshot = hasPartial && selectedPayment ? {
      partial_type: selectedPayment.partial_type,
      fixed_partial_amount: selectedPayment.fixed_partial_amount,
      advance_amount: advanceAmount,
      due_on_delivery: dueOnDelivery,
    } : null;

    try {
      await createOrder.mutateAsync({
        order: {
          order_number: orderNumber,
          user_id: user?.id || null,
          customer_name: formData.fullName,
          customer_phone: formData.phone,
          shipping_address: formData.address,
          shipping_city: formData.city,
          shipping_method: selectedShipping?.name || 'Standard',
          shipping_cost: shippingCost,
          payment_method: selectedPayment?.code || 'cod',
          subtotal,
          total,
          status: 'pending',
          payment_method_id: selectedPayment?.id || null,
          payment_method_name: selectedPayment?.name || 'Cash on Delivery',
          payment_status: hasPartial ? 'partial_paid' : 'unpaid',
          paid_amount: advanceAmount,
          due_amount: dueOnDelivery,
          transaction_id: transactionId.trim() || null,
          partial_rule_snapshot: partialSnapshot,
        },
        items: [{
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          product_image: selectedProduct.images?.[0] || '',
          quantity,
          price: effectivePrice,
          variant_id: null,
          variant_info: null,
        }],
      });
      navigate(`/order-success?orderId=${orderNumber}`);
    } catch (error) {
      // handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-16 w-64" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-16 w-64" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">{t('common.pageNotFound') || 'Page Not Found'}</h1>
          <Button onClick={() => navigate('/')}>{t('common.goHome') || 'Go Home'}</Button>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background overflow-x-hidden">
        {/* Hero Section */}
        <section
          className="relative min-h-[45vh] md:min-h-[60vh] flex flex-col items-center justify-center text-center py-12 md:py-24 px-4 bg-gradient-to-br from-[#065f46] via-[#064e3b] to-[#042f2e] overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 bg-accent/10 blur-[100px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 blur-[120px] translate-x-1/3 translate-y-1/3 rounded-full" />
          </div>
          {(page.hero_avatar || settings.site_logo) && (
            <div className="mb-6 md:mb-8">
              <div className="w-24 h-24 md:w-36 md:h-36 rounded-full border-4 border-white overflow-hidden shadow-2xl bg-white relative mx-auto">
                <img 
                  src={page.hero_avatar || settings.site_logo} 
                  alt="Logo" 
                  className="w-full h-full object-cover shrink-0" 
                />
              </div>
            </div>
          )}

          <div className="w-full max-w-6xl px-2 md:px-0 mx-auto space-y-6 md:space-y-8">
            <div className="bg-white/95 backdrop-blur-sm py-5 md:py-4 px-4 md:px-12 rounded-lg md:rounded-lg shadow-2xl border-b-4 border-gray-200/50">
              <h1 className="text-2xl md:text-4xl lg:text-3xl font-black leading-tight text-gray-900 tracking-tight">
                {parseFormattedText(page.hero_title)}
              </h1>
            </div>

            {page.hero_subtitle && (
              <p className="text-sm md:text-2xl font-demebold text-white drop-shadow-lg max-w-5xl mx-auto leading-relaxed px-4">
                {parseFormattedText(page.hero_subtitle)}
              </p>
            )}

            <div className="pt-1 md:pt-4">
              <Button size="lg" className="btn-accent text-sm md:text-xl px-6 lg:px-20 py-7 lg:py-8 rounded-lg shadow-lg hover:shadow-accent/40 transition-all font-bold" onClick={scrollToCheckout}>
                <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 mr-4" />
                {page.hero_cta_text}
              </Button>
            </div>
          </div>
        </section>

        {/* video and banner section */}

        {page.video_url && (
          <section className="py-1 md:py-16 lg:py-20 bg-secondary/10 overflow-hidden">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-5xl font-bold text-center mb-10 leading-tight">
                {page.video_section_title || t('') || ''}
              </h2>
              <div className="rounded-2xl overflow-hidden border-[2px] border-[#22C55E]">
                <div className="aspect-video bg-black">
                  {isDirectVideo(page.video_url) ? (
                    <video
                      src={page.video_url}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <iframe
                      src={getVideoEmbedUrl(page.video_url)}
                      title={page.hero_title + ' video'}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              </div>

              {page.video_bottom_title && (
                <div className="mt-8 text-center">
                  <p className="text-md md:text-4xl font-extrabold text-foreground leading-snug px-1">
                    {page.video_bottom_title.split(/(\[\[.*?\]\])/).map((part, i) => {
                      if (part.startsWith('[[') && part.endsWith(']]')) {
                        return (
                          <span key={i} className="text-[#22C55E]">
                            {part.substring(2, part.length - 2)}
                          </span>
                        );
                      }
                      return part;
                    })}
                  </p>
                </div>
              )}

              <div className="text-center mt-8 px-2">
                <Button size="lg" className="btn-accent text-md md:text-xl px-8 md:px-16 py-6 md:py-8 rounded-lg shadow-lg hover:shadow-accent/40 transition-all font-bold w-full md:w-auto" onClick={scrollToCheckout}>
                <ShoppingCart className="inline h-6 w-6 md:h-8 md:w-8 mr-2 md:mr-3" />
                  {page.hero_cta_text}
                </Button>
              </div>

              {/* banner */}

              <div className="mt-12 mx-auto">
                {page.show_banner && page.banner_old_price && page.banner_new_price && (
                  <PricingBanner oldPrice={page.banner_old_price} newPrice={page.banner_new_price} />
                )}
              </div>
            </div>
          </section>
        )}

        {/* Products Section */}
        <section className="py-6 md:py-16 overflow-hidden">
          <div className="container px-4 mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">{t('common.ourProducts') || 'Our Products'}</h2>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full relative group"
            >
              <CarouselContent className="-ml-4">
                {products.map(product => {
                  const price = product.sale_price ?? product.price;
                  const isSelected = selectedProduct?.id === product.id;
                  return (
                    <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                      <div
                        onClick={() => { setSelectedProduct(product); setQuantity(1); }}
                        className={`cursor-pointer bg-card border rounded-xl overflow-hidden transition-all hover:shadow-lg h-full flex flex-col ${isSelected ? 'border-accent ring-2 ring-accent/30' : 'border-border'
                          }`}
                      >
                        <div className="aspect-square overflow-hidden shrink-0">
                          <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <h3 className="font-semibold mb-1 line-clamp-2">{product.name}</h3>
                          {product.short_description && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.short_description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-auto">
                            <span className="text-lg font-bold text-accent">{formatCurrency(price)}</span>
                            {product.sale_price && (
                              <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.price)}</span>
                            )}
                          </div>
                          <Button className="btn-accent w-full mt-3 py-4 md:py-4 text-md h-auto whitespace-normal leading-tight !rounded-lg" onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setQuantity(1); scrollToCheckout(); }}>
                            <ShoppingCart className="inline h-12 w-12 mr-3" />
                            {page.hero_cta_text}
                          </Button>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
          </div>
        </section>

        {/* Divider upadan*/}

        {page.how_to_use_cards.length > 0 && (
          <section className="py-6 md:py-16 px-4 bg-secondary/30">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">{t('উপাদান') || 'How to Use'}</h2>
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full relative group"
              >
                <CarouselContent className="-ml-4">
                  {page.how_to_use_cards.map((card, i) => (
                    <CarouselItem key={i} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                      <div className="bg-card border border-border rounded-xl overflow-hidden h-full shadow-sm hover:shadow-md transition-shadow">
                        {card.image && (
                          <div className="aspect-video overflow-hidden">
                            <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-7 h-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</span>
                            <h3 className="font-semibold line-clamp-1">{card.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-3">{card.description}</p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-center md:block">
                  <CarouselPrevious className="static md:absolute -translate-y-0 md:top-1/2 md:-translate-y-1/2 md:-left-12 mt-6 md:mt-0 mr-4 md:mr-0 h-10 w-10 border-accent text-accent hover:bg-accent hover:text-white" />
                  <CarouselNext className="static md:absolute -translate-y-0 md:top-1/2 md:-translate-y-1/2 md:-right-12 mt-6 md:mt-0 h-10 w-10 border-accent text-accent hover:bg-accent hover:text-white" />
                </div>
              </Carousel>
              <div className="text-center mt-8">
                <Button size="lg" className="btn-accent text-xl px-10 lg:px-16 py-7 lg:py-8 rounded-full shadow-lg hover:shadow-accent/40 transition-all font-bold" onClick={scrollToCheckout}>
                <ShoppingCart className="inline h-8 w-8 mr-3" />
                  {page.hero_cta_text}
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* reviews section */}
        {((page.testimonial_cards && page.testimonial_cards.length > 0) || (page.show_reviews && reviews.length > 0)) && (
          <section className="py-4 md:py-16 overflow-hidden">
            <div className="container px-4 mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">
                {t('common.customerReviews') || 'ক্রেতারা যা বলছেন'}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {page.testimonial_cards && page.testimonial_cards.length > 0 ? (
                  page.testimonial_cards.map((testimonial, i) => (
                    <div key={i} className="bg-white border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: 5 }).map((_, starI) => (
                          <Star 
                            key={starI} 
                            className={`h-5 w-5 ${starI < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} 
                          />
                        ))}
                      </div>
                      <p className="text-gray-600 mb-6 flex-grow leading-relaxed italic">
                        "{testimonial.text}"
                      </p>
                      <div className="flex items-center gap-3 border-t pt-4">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                          {testimonial.name.charAt(0)}
                        </div>
                        <p className="font-bold text-gray-900">{testimonial.name}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  reviews.slice(0, 6).map(review => (
                    <div key={review.id} className="bg-white border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <p className="text-gray-600 mb-6 flex-grow leading-relaxed italic">"{review.text}"</p>
                      <div className="flex items-center gap-3 border-t pt-4">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                          {review.name.charAt(0)}
                        </div>
                        <p className="font-bold text-gray-900">{review.name}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="text-center mt-10 px-4">
                <Button size="lg" className="btn-accent text-smm md:text-xl px-8 md:px-16 py-6 md:py-8 rounded-lg shadow-lg hover:shadow-accent/40 transition-all font-bold w-full md:w-auto" onClick={scrollToCheckout}>
                <ShoppingCart className="inline h-6 w-6 md:h-8 md:w-8 mr-2 md:mr-3" />
                  {page.hero_cta_text}
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* videos grid section */}
        {page.video_cards && page.video_cards.length > 0 && (
          <section className="py-4 md:py-16 bg-secondary/10 overflow-hidden">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-5xl font-bold text-center mb-12">
                {t('landingPage.videoReviews')}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {page.video_cards.map((video, i) => (
                  <div key={i} className="flex flex-col h-full bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-black relative">
                      {isDirectVideo(video.video_url) ? (
                        <video
                          src={video.video_url}
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <iframe
                          src={getVideoEmbedUrl(video.video_url)}
                          title={video.title || `Video review ${i + 1}`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                    </div>
                    {/* {video.title && (
                      <div className="p-4 text-center">
                        <p className="font-semibold text-lg">{video.title}</p>
                      </div>
                    )} */}
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-10 px-2">
                <Button size="lg" className="btn-accent text-lg md:text-xl px-8 md:px-16 py-6 md:py-8 rounded-lg font-bold w-full md:w-auto" onClick={scrollToCheckout}>
                  <ShoppingCart className="inline h-6 w-6 md:h-8 md:w-8 mr-2 md:mr-3" />
                  {page.hero_cta_text}
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* checkout */}
        <section id="lp-checkout" className="py-4 md:py-16 bg-secondary/30 overflow-hidden">
          <div className="max-w-5xl mx-autopx-4 lg:px-0 mx-auto">
            <h2 className="text-2xl md:text-5xl font-bold text-center mb-4">
              <ShoppingBag className="inline h-10 w-10 mr-4 mb-2" />
              {t('checkout.title') || 'Checkout'}
            </h2>
            {selectedProduct && (
              <p className="text-center text-sm lg:text-xl text-muted-foreground mb-12">
                {t('common.ordering') || 'Ordering'}: <span className="font-semibold text-foreground underline decoration-[#22C55E] decoration-4 underline-offset-8">{selectedProduct.name}</span>
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {selectedProduct && (
                <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-4">
                  <img src={selectedProduct.images?.[0]} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm lg:text-xl truncate">{selectedProduct.name}</p>
                    <p className="text-accent font-bold text-sm">{formatCurrency(effectivePrice)}</p>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button className='w-8 h-8 md:w-10 md:h-10' type="button" variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                    <span className="w-8 text-center font-bold text-sm md:text-base">{quantity}</span>
                    <Button className='w-8 h-8 md:w-10 md:h-10' type="button" variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>+</Button>
                  </div>
                </div>
              )}

              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <h3 className="font-semibold">{t('checkout.contactInfo') || 'Contact Information'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1">{t('checkout.fullName') || 'Full Name'} *</label>
                    <Input name="fullName" value={formData.fullName} onChange={handleChange} required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1">{t('checkout.phone') || 'Phone'} *</label>
                    <Input name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <h3 className="font-semibold">{t('checkout.shippingAddress') || 'Shipping Address'}</h3>
                <Input name="country" value={formData.country} readOnly className="bg-muted cursor-not-allowed" />
                <div>
                  <label className="block text-sm font-medium mb-1">{t('checkout.address') || 'Address'} *</label>
                  <Input name="address" value={formData.address} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('checkout.city') || 'City'} *</label>
                  <Input name="city" value={formData.city} onChange={handleChange} required />
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5 space-y-3">
                <h3 className="font-semibold">{t('checkout.shippingMethod') || 'Shipping Method'}</h3>
                {shippingMethods.map(m => (
                  <label key={m.id} className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:border-accent transition-colors">
                    <input type="radio" name="shippingMethodId" value={m.id} checked={formData.shippingMethodId === m.id} onChange={handleChange} className="w-4 h-4" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{m.name}</p>
                      {m.estimated_days && <p className="text-xs text-muted-foreground">{m.estimated_days}</p>}
                    </div>
                    <span className="font-semibold text-sm">{formatCurrency(m.base_rate)}</span>
                  </label>
                ))}
              </div>

              <div className="bg-card border border-border rounded-xl p-5 space-y-3">
                <h3 className="font-semibold">{t('checkout.paymentMethod') || 'Payment Method'}</h3>
                {paymentMethods.map(pm => (
                  <label
                    key={pm.id}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${formData.paymentMethodId === pm.id ? 'border-accent bg-accent/5' : 'border-border hover:border-accent'
                      }`}
                  >
                    <input type="radio" name="paymentMethodId" value={pm.id} checked={formData.paymentMethodId === pm.id} onChange={handleChange} className="w-4 h-4 mt-1" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{pm.name}</p>
                      {pm.description && <p className="text-xs text-muted-foreground">{pm.description}</p>}
                      {pm.instructions && formData.paymentMethodId === pm.id && (
                        <div className="mt-2 p-2 bg-secondary/50 rounded text-xs text-muted-foreground">{pm.instructions}</div>
                      )}
                    </div>
                  </label>
                ))}

                {requiresTrxId && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-1">Transaction ID *</label>
                    <Input value={transactionId} onChange={e => setTransactionId(e.target.value)} placeholder="Enter transaction/reference ID" required />
                  </div>
                )}

                {hasPartial && (
                  <div className="mt-3 p-3 border border-accent/30 bg-accent/5 rounded-lg text-sm space-y-1">
                    <div className="flex justify-between"><span>Pay now:</span><span className="font-semibold">{formatCurrency(advanceAmount)}</span></div>
                    <div className="flex justify-between"><span>Pay on delivery:</span><span className="font-semibold">{formatCurrency(dueOnDelivery)}</span></div>
                  </div>
                )}
              </div>

              <div className="bg-card border border-border rounded-xl p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('cart.subtotal') || 'Subtotal'}</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('cart.shipping') || 'Shipping'}</span>
                  <span className="font-medium">{formatCurrency(shippingCost)}</span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between">
                  <span className="font-semibold">{t('cart.total') || 'Total'}</span>
                  <span className="text-xl font-bold text-accent">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  size="lg"
                  type="submit"
                  disabled={createOrder.isPending || !selectedProduct}
                  className="w-full btn-accent text-xl py-6 md:py-8 font-bold rounded-lg"
                >
                  <ShoppingCart className="inline h-8 w-8 mr-3" />
                  {createOrder.isPending ? (t('checkout.processing') || 'Processing...') : (page.hero_cta_text || t('checkout.placeOrder') || 'Place Order')}
                </Button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </Layout>
  );
}
