import { DynamicHomepage } from '@/components/homepage/DynamicHomepage';
import LandingPageView from './LandingPageView';
import { useLandingPages } from '@/hooks/useLandingPages';

const Index = () => {
  const { data: pages = [], isLoading } = useLandingPages();
  const activePage = pages.find(p => p.is_active);

  if (isLoading) return null;

  if (activePage) {
    return <LandingPageView slug={activePage.slug} />;
  }

  return <DynamicHomepage />;
};

export default Index;
