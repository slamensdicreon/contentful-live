import { ListingCard } from './ListingCard';
import type { Listing } from '@/lib/mock-listings';

interface ListingGridProps {
  listings: Listing[];
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
}

export function ListingGrid({ 
  listings, 
  title, 
  subtitle,
  emptyMessage = 'No listings found matching your criteria.' 
}: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <span className="text-2xl">🏠</span>
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">
            No listings found
          </h3>
          <p className="text-muted-foreground text-sm">
            {emptyMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-8">
      {(title || subtitle) && (
        <div className="mb-8">
          {title && (
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-muted-foreground mt-2">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}