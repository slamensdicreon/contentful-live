import { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/modules/Hero';
import { PromoStrip } from '@/components/modules/PromoStrip';
import { CardGrid } from '@/components/modules/CardGrid';
import { ModuleRenderer } from '@/components/modules/ModuleRenderer';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { getFeaturedListings } from '@/lib/mock-listings';
import { usePage } from '@/hooks/useContentful';
import type { PageModule } from '@/types/contentful';
import { getAssetUrl } from '@/types/contentful';

const Index = () => {
  const { data: page, loading, isConfigured } = usePage('home');
  const featuredListings = getFeaturedListings();

  // Update document metadata from Contentful or use defaults
  useEffect(() => {
    const title = page?.fields?.seoTitle || page?.fields?.title || 'FirstKey Homes | Quality Rental Homes';
    document.title = title;

    // Update favicon if provided from CMS
    const faviconUrl = getAssetUrl(page?.fields?.favicon);
    if (faviconUrl) {
      let faviconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = faviconUrl;
    }

    // Update OG image if provided from CMS
    const ogImageUrl = getAssetUrl(page?.fields?.ogImage);
    if (ogImageUrl) {
      let ogImageMeta = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
      if (!ogImageMeta) {
        ogImageMeta = document.createElement('meta');
        ogImageMeta.setAttribute('property', 'og:image');
        document.head.appendChild(ogImageMeta);
      }
      ogImageMeta.content = ogImageUrl;
    }
  }, [page]);
  
  // Check if we have Contentful modules to render
  const hasModules = page?.fields?.modules && page.fields.modules.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Render from Contentful if available, otherwise use fallback components */}
        {hasModules ? (
          <ModuleRenderer modules={page.fields.modules as PageModule[]} />
        ) : (
          <>
            <Hero />
            <PromoStrip />
            <CardGrid />
          </>
        )}
        
        {/* Featured Listings - always shown */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
                Just Listed
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Featured Homes
              </h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Hand-picked properties that match what renters are looking for most
              </p>
            </div>
            <ListingGrid listings={featuredListings} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;