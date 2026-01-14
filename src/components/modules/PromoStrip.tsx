import { Sparkles, Shield, Clock, Heart } from 'lucide-react';
import type { PromoStripModuleFields, ContentfulEntry, PromoItem } from '@/types/contentful';

interface PromoStripProps {
  data?: ContentfulEntry<PromoStripModuleFields> | null;
  fallback?: PromoItem[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  shield: Shield,
  clock: Clock,
  heart: Heart,
};

const defaultFallback: PromoItem[] = [
  {
    title: 'Verified Listings',
    description: 'Every property is verified by our team for accuracy and quality.',
  },
  {
    title: 'Secure Payments',
    description: 'Safe and secure payment processing for all transactions.',
  },
  {
    title: '24/7 Support',
    description: 'Our support team is available around the clock to help you.',
  },
  {
    title: 'Love Guarantee',
    description: "Not happy? We'll help you find a better match, guaranteed.",
  },
];

const defaultIcons = [Sparkles, Shield, Clock, Heart];

export function PromoStrip({ data, fallback = defaultFallback }: PromoStripProps) {
  const items = data?.fields?.items || fallback;

  return (
    <section className="py-12 md:py-16 bg-secondary/5 border-y border-border">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {items.map((item, index) => {
            const Icon = defaultIcons[index % defaultIcons.length];
            return (
              <div 
                key={index} 
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-background transition-colors"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}