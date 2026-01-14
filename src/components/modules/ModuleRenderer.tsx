import { Hero } from './Hero';
import { PromoStrip } from './PromoStrip';
import { CardGrid } from './CardGrid';
import { RichText } from './RichText';
import type { 
  ContentfulEntry, 
  HeroModuleFields, 
  PromoStripModuleFields, 
  CardGridModuleFields,
  RichTextModuleFields,
  getContentTypeId 
} from '@/types/contentful';

type ModuleEntry = 
  | ContentfulEntry<HeroModuleFields>
  | ContentfulEntry<PromoStripModuleFields>
  | ContentfulEntry<CardGridModuleFields>
  | ContentfulEntry<RichTextModuleFields>;

interface ModuleRendererProps {
  modules: ModuleEntry[];
}

function getModuleContentType(module: ModuleEntry): string {
  return module.sys?.contentType?.sys?.id || '';
}

export function ModuleRenderer({ modules }: ModuleRendererProps) {
  if (!modules || modules.length === 0) return null;

  return (
    <>
      {modules.map((module, index) => {
        const contentType = getModuleContentType(module);
        
        switch (contentType) {
          case 'heroModule':
            return (
              <Hero 
                key={module.sys.id || index} 
                data={module as ContentfulEntry<HeroModuleFields>} 
              />
            );
          
          case 'promoStripModule':
            return (
              <PromoStrip 
                key={module.sys.id || index} 
                data={module as ContentfulEntry<PromoStripModuleFields>} 
              />
            );
          
          case 'cardGridModule':
            return (
              <CardGrid 
                key={module.sys.id || index} 
                data={module as ContentfulEntry<CardGridModuleFields>} 
              />
            );
          
          case 'richTextModule':
            const richTextModule = module as ContentfulEntry<RichTextModuleFields>;
            return (
              <section key={module.sys.id || index} className="py-12 md:py-16">
                <div className="container">
                  <RichText content={richTextModule.fields.body} />
                </div>
              </section>
            );
          
          default:
            console.warn(`Unknown module type: ${contentType}`);
            return null;
        }
      })}
    </>
  );
}
