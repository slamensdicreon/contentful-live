// Contentful API Client
// Uses Delivery API for published content, Preview API for drafts

import type {
  ContentfulResponse,
  ContentfulEntry,
  PageFields,
  MarketPageFields,
  NavigationFields,
} from '@/types/contentful';

// Configuration - these should be set via environment or secrets
const SPACE_ID = import.meta.env.VITE_CONTENTFUL_SPACE_ID || '';
const ENVIRONMENT = import.meta.env.VITE_CONTENTFUL_ENVIRONMENT || 'master';
const DELIVERY_TOKEN = import.meta.env.VITE_CONTENTFUL_DELIVERY_TOKEN || '';
const PREVIEW_TOKEN = import.meta.env.VITE_CONTENTFUL_PREVIEW_TOKEN || '';

const DELIVERY_BASE_URL = `https://cdn.contentful.com/spaces/${SPACE_ID}/environments/${ENVIRONMENT}`;
const PREVIEW_BASE_URL = `https://preview.contentful.com/spaces/${SPACE_ID}/environments/${ENVIRONMENT}`;

export interface ContentfulConfig {
  preview?: boolean;
}

// Check if Contentful is configured
export function isContentfulConfigured(): boolean {
  return !!(SPACE_ID && DELIVERY_TOKEN);
}

// Get the appropriate base URL and token
function getApiConfig(preview = false) {
  if (preview && PREVIEW_TOKEN) {
    return {
      baseUrl: PREVIEW_BASE_URL,
      token: PREVIEW_TOKEN,
    };
  }
  return {
    baseUrl: DELIVERY_BASE_URL,
    token: DELIVERY_TOKEN,
  };
}

// Generic fetch function for Contentful
async function contentfulFetch<T>(
  endpoint: string,
  params: Record<string, string> = {},
  config: ContentfulConfig = {}
): Promise<ContentfulResponse<T> | null> {
  if (!isContentfulConfigured()) {
    console.warn('Contentful is not configured. Using fallback content.');
    return null;
  }

  const { baseUrl, token } = getApiConfig(config.preview);
  
  const searchParams = new URLSearchParams({
    ...params,
    include: '10', // Include linked entries up to 10 levels deep
  });

  const url = `${baseUrl}${endpoint}?${searchParams}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Contentful API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Contentful fetch error:', error);
    return null;
  }
}

// Fetch a page by slug
export async function getPage(
  slug: string,
  config: ContentfulConfig = {}
): Promise<ContentfulEntry<PageFields> | null> {
  const response = await contentfulFetch<PageFields>(
    '/entries',
    {
      content_type: 'page',
      'fields.slug': slug,
      limit: '1',
    },
    config
  );

  return response?.items?.[0] || null;
}

// Fetch a market page by slug
export async function getMarketPage(
  slug: string,
  config: ContentfulConfig = {}
): Promise<ContentfulEntry<MarketPageFields> | null> {
  const response = await contentfulFetch<MarketPageFields>(
    '/entries',
    {
      content_type: 'marketPage',
      'fields.slug': slug,
      limit: '1',
    },
    config
  );

  return response?.items?.[0] || null;
}

// Fetch all market pages
export async function getAllMarketPages(
  config: ContentfulConfig = {}
): Promise<ContentfulEntry<MarketPageFields>[]> {
  const response = await contentfulFetch<MarketPageFields>(
    '/entries',
    {
      content_type: 'marketPage',
      order: 'fields.marketName',
    },
    config
  );

  return response?.items || [];
}

// Fetch navigation
export async function getNavigation(
  config: ContentfulConfig = {}
): Promise<ContentfulEntry<NavigationFields> | null> {
  const response = await contentfulFetch<NavigationFields>(
    '/entries',
    {
      content_type: 'navigation',
      limit: '1',
    },
    config
  );

  return response?.items?.[0] || null;
}

// Check if we're in preview mode (via URL param)
export function isPreviewMode(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('preview') === 'true';
}