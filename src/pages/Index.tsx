import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/modules/Hero';
import { PromoStrip } from '@/components/modules/PromoStrip';
import { CardGrid } from '@/components/modules/CardGrid';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { getFeaturedListings } from '@/lib/mock-listings';
import { usePage } from '@/hooks/useContentful';

const Index = () => {
  const { data: page, loading } = usePage('home');
  const featuredListings = getFeaturedListings();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <Hero />
        <PromoStrip />
        <CardGrid />
        
        {/* Featured Listings */}
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