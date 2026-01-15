// Contentful Content Model Types

export interface ContentfulAsset {
  sys: {
    id: string;
  };
  fields: {
    title?: string;
    description?: string;
    file: {
      url: string;
      details: {
        size: number;
        image?: {
          width: number;
          height: number;
        };
      };
      fileName: string;
      contentType: string;
    };
  };
}

export interface ContentfulEntry<T = unknown> {
  sys: {
    id: string;
    type: string;
    contentType: {
      sys: {
        id: string;
      };
    };
    createdAt: string;
    updatedAt: string;
  };
  fields: T;
}

// Module Types
export interface HeroModuleFields {
  headline: string;
  subheadline?: string;
  backgroundImage?: ContentfulAsset;
  ctaLabel?: string;
  ctaLink?: string;
}

export interface PromoItem {
  title: string;
  description: string;
  linkLabel?: string;
  linkUrl?: string;
}

export interface PromoStripModuleFields {
  internalName: string;
  items: PromoItem[];
}

export interface CardItem {
  title: string;
  description?: string;
  image?: ContentfulAsset;
  href?: string;
}

export interface CardGridModuleFields {
  eyebrow?: string;
  headline: string;
  cards: CardItem[];
}

export interface RichTextModuleFields {
  internalName: string;
  body: unknown; // Contentful Rich Text Document
}

// Page Types
export type PageModule = 
  | ContentfulEntry<HeroModuleFields>
  | ContentfulEntry<PromoStripModuleFields>
  | ContentfulEntry<CardGridModuleFields>
  | ContentfulEntry<RichTextModuleFields>;

export interface PageFields {
  title: string;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  favicon?: ContentfulAsset;
  ogImage?: ContentfulAsset;
  modules?: PageModule[];
}

export interface MarketPageFields {
  marketName: string;
  slug: string;
  heroModule?: ContentfulEntry<HeroModuleFields>;
  introRichText?: unknown; // Contentful Rich Text Document
  defaultSearchConfig?: {
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    minBeds?: number;
  };
}

export interface NavigationLink {
  label: string;
  href: string;
}

export interface NavigationFields {
  internalName: string;
  headerLinks: NavigationLink[];
  footerLinks: NavigationLink[];
}

// API Response Types
export interface ContentfulResponse<T> {
  items: ContentfulEntry<T>[];
  total: number;
  skip: number;
  limit: number;
  includes?: {
    Asset?: ContentfulAsset[];
    Entry?: ContentfulEntry[];
  };
}

// Helper to extract asset URL
export function getAssetUrl(asset?: ContentfulAsset): string | undefined {
  if (!asset?.fields?.file?.url) return undefined;
  // Contentful returns protocol-relative URLs
  const url = asset.fields.file.url;
  return url.startsWith('//') ? `https:${url}` : url;
}

// Helper to get content type ID
export function getContentTypeId(entry: ContentfulEntry): string {
  return entry.sys.contentType.sys.id;
}