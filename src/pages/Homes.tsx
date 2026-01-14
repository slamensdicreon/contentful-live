import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { FilterPanel } from '@/components/listings/FilterPanel';
import { filterListings, getUniqueCities, type ListingFilters } from '@/lib/mock-listings';

const Homes = () => {
  const [filters, setFilters] = useState<ListingFilters>({});
  const cities = getUniqueCities();
  
  const filteredListings = useMemo(() => {
    return filterListings(filters);
  }, [filters]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="gradient-hero py-16 md:py-20">
          <div className="container text-center">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Browse All Homes
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Explore our curated selection of rental properties across top cities
            </p>
          </div>
        </section>

        {/* Filters & Listings */}
        <section className="py-8 md:py-12">
          <div className="container">
            <FilterPanel 
              filters={filters} 
              onFiltersChange={setFilters} 
              cities={cities} 
            />
            
            <div className="mt-6 flex items-center justify-between">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">{filteredListings.length}</span> homes available
              </p>
            </div>

            <ListingGrid 
              listings={filteredListings}
              emptyMessage="Try adjusting your filters to see more results."
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Homes;