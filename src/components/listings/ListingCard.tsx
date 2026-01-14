import { Link } from 'react-router-dom';
import { Bed, Bath, Square, MapPin, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Listing } from '@/lib/mock-listings';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatSqft = (sqft: number) => {
    return new Intl.NumberFormat('en-US').format(sqft);
  };

  return (
    <Link to={`/homes/${listing.id}`} className="group block">
      <Card className="overflow-hidden border border-border/50 shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {listing.featured && (
              <Badge className="bg-primary text-primary-foreground border-0 shadow-lg">
                Featured
              </Badge>
            )}
            {listing.petFriendly && (
              <Badge variant="secondary" className="bg-white/90 text-foreground border-0 shadow-lg">
                🐕 Pet Friendly
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 hover:bg-white text-muted-foreground hover:text-primary shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              // Handle favorite
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>

          {/* Price */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
              <span className="font-display text-xl font-bold text-foreground">
                {formatPrice(listing.price)}
              </span>
              <span className="text-muted-foreground text-sm">/mo</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-display font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-4">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">
              {listing.address}, {listing.city}, {listing.state}
            </span>
          </div>

          {/* Specs */}
          <div className="flex items-center gap-4 pt-3 border-t border-border">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Bed className="h-4 w-4" />
              <span className="text-sm font-medium">{listing.beds} bed</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Bath className="h-4 w-4" />
              <span className="text-sm font-medium">{listing.baths} bath</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Square className="h-4 w-4" />
              <span className="text-sm font-medium">{formatSqft(listing.sqft)} sqft</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}