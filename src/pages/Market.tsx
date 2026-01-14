import { useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/modules/Hero';
import { RichText } from '@/components/modules/RichText';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { getListingsByCity } from '@/lib/mock-listings';
import { useMarketPage } from '@/hooks/useContentful';
import { getAssetUrl } from '@/types/contentful';

// Fallback data for when Contentful isn't configured
const fallbackMarketData: Record<string, { name: string; image: string; description: string }> = {
  austin: {
    name: 'Austin',
    image: 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=1920&q=80',
    description: 'Live music capital with a booming tech scene and vibrant culture.',
  },
  denver: {
    name: 'Denver',
    image: 'https://images.unsplash.com/photo-1619856699906-09e1f58c98b1?w=1920&q=80',
    description: 'Mountain views, outdoor adventures, and craft beer paradise.',
  },
  miami: {
    name: 'Miami',
    image: 'https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=1920&q=80',
    description: 'Beaches, nightlife, and year-round sunshine await you.',
  },
  seattle: {
    name: 'Seattle',
    image: 'https://images.unsplash.com/photo-1502175353174-a7a70e73b362?w=1920&q=80',
    description: 'Coffee culture, tech innovation, and stunning Pacific Northwest views.',
  },
};

const Market = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: marketPage, loading, isConfigured } = useMarketPage(slug || '');
  
  // Use Contentful data if available, otherwise fall back to hardcoded data
  const fallback = slug ? fallbackMarketData[slug] : null;
  const cityName = marketPage?.fields?.marketName || fallback?.name || slug?.charAt(0).toUpperCase() + (slug?.slice(1) || '');
  const listings = getListingsByCity(cityName);

  // Build hero data from Contentful or fallback
  const heroData = marketPage?.fields?.heroModule;
  const heroFallback = {
    headline: `Homes in ${cityName}`,
    subheadline: fallback?.description || `Discover amazing rental properties in ${cityName}.`,
    backgroundImage: fallback?.image,
    ctaLabel: 'View All Homes',
    ctaLink: '/homes',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <Hero
          data={heroData}
          fallback={heroFallback}
        />

        {/* Rich text intro if available from Contentful */}
        {marketPage?.fields?.introRichText && (
          <section className="py-12 md:py-16 bg-muted/30">
            <div className="container max-w-4xl">
              <RichText content={marketPage.fields.introRichText} />
            </div>
          </section>
        )}

        <section className="py-16 md:py-24">
          <div className="container">
            <ListingGrid
              listings={listings}
              title={`Available in ${cityName}`}
              subtitle={`${listings.length} homes currently available for rent`}
              emptyMessage={`No listings currently available in ${cityName}. Check back soon!`}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Market;