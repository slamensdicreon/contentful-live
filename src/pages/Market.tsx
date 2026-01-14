import { useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/modules/Hero';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { getListingsByCity } from '@/lib/mock-listings';

const marketData: Record<string, { name: string; image: string; description: string }> = {
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
  const market = slug ? marketData[slug] : null;
  const cityName = market?.name || slug?.charAt(0).toUpperCase() + (slug?.slice(1) || '');
  const listings = getListingsByCity(cityName);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <Hero
          fallback={{
            headline: `Homes in ${cityName}`,
            subheadline: market?.description || `Discover amazing rental properties in ${cityName}.`,
            backgroundImage: market?.image,
            ctaLabel: 'View All Homes',
            ctaLink: '/homes',
          }}
        />

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