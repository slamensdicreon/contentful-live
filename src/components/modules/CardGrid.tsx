import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { CardGridModuleFields, ContentfulEntry, CardItem } from '@/types/contentful';
import { getAssetUrl } from '@/types/contentful';

interface CardGridProps {
  data?: ContentfulEntry<CardGridModuleFields> | null;
  fallback?: {
    eyebrow?: string;
    headline: string;
    cards: CardItem[];
  };
}

const defaultFallback = {
  eyebrow: 'Explore Markets',
  headline: 'Find Homes in Top Cities',
  cards: [
    {
      title: 'Austin, TX',
      description: 'Live music capital with a booming tech scene and vibrant culture.',
      image: { fields: { file: { url: 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=600&q=80' } } } as any,
      href: '/market/austin',
    },
    {
      title: 'Denver, CO',
      description: 'Mountain views, outdoor adventures, and craft beer paradise.',
      image: { fields: { file: { url: 'https://images.unsplash.com/photo-1619856699906-09e1f58c98b1?w=600&q=80' } } } as any,
      href: '/market/denver',
    },
    {
      title: 'Miami, FL',
      description: 'Beaches, nightlife, and year-round sunshine await you.',
      image: { fields: { file: { url: 'https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=600&q=80' } } } as any,
      href: '/market/miami',
    },
    {
      title: 'Seattle, WA',
      description: 'Coffee culture, tech innovation, and stunning Pacific Northwest views.',
      image: { fields: { file: { url: 'https://images.unsplash.com/photo-1502175353174-a7a70e73b362?w=600&q=80' } } } as any,
      href: '/market/seattle',
    },
  ],
};

export function CardGrid({ data, fallback = defaultFallback }: CardGridProps) {
  const content = data?.fields || fallback;
  const cards = content.cards || [];

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          {content.eyebrow && (
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              {content.eyebrow}
            </span>
          )}
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            {content.headline}
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => {
            const imageUrl = card.image 
              ? getAssetUrl(card.image) 
              : `https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&q=80`;

            const cardContent = (
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={card.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-display text-xl font-bold text-white">
                        {card.title}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <CardContent className="p-4">
                    {card.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {card.description}
                      </p>
                    )}
                    {card.href && (
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                        Explore homes
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </CardContent>
                </Card>
            );

            return card.href ? (
              <Link key={index} to={card.href} className="group block">
                {cardContent}
              </Link>
            ) : (
              <div key={index} className="group block">
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}