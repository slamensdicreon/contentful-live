import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { HeroModuleFields, ContentfulEntry } from '@/types/contentful';
import { getAssetUrl } from '@/types/contentful';

interface HeroProps {
  data?: ContentfulEntry<HeroModuleFields> | null;
  fallback?: {
    headline: string;
    subheadline?: string;
    backgroundImage?: string;
    ctaLabel?: string;
    ctaLink?: string;
  };
}

// Default fallback content
const defaultFallback = {
  headline: 'Find Your Perfect Home',
  subheadline: 'Discover thousands of rental properties in the most desirable neighborhoods. Your next chapter starts here.',
  backgroundImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
  ctaLabel: 'Start Searching',
  ctaLink: '/homes',
};

export function Hero({ data, fallback = defaultFallback }: HeroProps) {
  const content = data?.fields || fallback;
  const backgroundImage = data?.fields?.backgroundImage 
    ? getAssetUrl(data.fields.backgroundImage) 
    : fallback.backgroundImage;

  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 gradient-hero opacity-90" />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="container relative z-10 py-20">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in">
            {content.headline}
          </h1>
          
          {content.subheadline && (
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {content.subheadline}
            </p>
          )}

          {/* Search Box */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by city, neighborhood, or address..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <Link to={content.ctaLink || '/homes'}>
                <Button size="lg" className="w-full md:w-auto gap-2 shadow-colored text-base">
                  {content.ctaLabel || 'Search'}
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            {/* Quick Links */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Popular:</span>
              {['Austin', 'Denver', 'Miami', 'Seattle'].map((city) => (
                <Link
                  key={city}
                  to={`/market/${city.toLowerCase()}`}
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {[
              { value: '10K+', label: 'Active Listings' },
              { value: '50+', label: 'Cities' },
              { value: '98%', label: 'Happy Renters' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center md:text-left">
                <div className="font-display text-2xl md:text-3xl font-bold text-white">{value}</div>
                <div className="text-sm text-white/70">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}