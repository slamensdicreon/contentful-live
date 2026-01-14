// Custom hooks for Contentful data fetching

import { useState, useEffect } from 'react';
import {
  getPage,
  getMarketPage,
  getNavigation,
  getAllMarketPages,
  isPreviewMode,
  isContentfulConfigured,
} from '@/lib/contentful';
import type {
  ContentfulEntry,
  PageFields,
  MarketPageFields,
  NavigationFields,
} from '@/types/contentful';

interface UseContentfulResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  isConfigured: boolean;
}

// Hook to fetch a page by slug
export function usePage(slug: string): UseContentfulResult<ContentfulEntry<PageFields>> {
  const [data, setData] = useState<ContentfulEntry<PageFields> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isConfigured = isContentfulConfigured();

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const preview = isPreviewMode();
        const result = await getPage(slug, { preview });
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch page'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, isConfigured]);

  return { data, loading, error, isConfigured };
}

// Hook to fetch a market page by slug
export function useMarketPage(slug: string): UseContentfulResult<ContentfulEntry<MarketPageFields>> {
  const [data, setData] = useState<ContentfulEntry<MarketPageFields> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isConfigured = isContentfulConfigured();

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const preview = isPreviewMode();
        const result = await getMarketPage(slug, { preview });
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch market page'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, isConfigured]);

  return { data, loading, error, isConfigured };
}

// Hook to fetch all market pages
export function useAllMarketPages(): UseContentfulResult<ContentfulEntry<MarketPageFields>[]> {
  const [data, setData] = useState<ContentfulEntry<MarketPageFields>[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isConfigured = isContentfulConfigured();

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const preview = isPreviewMode();
        const result = await getAllMarketPages({ preview });
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch market pages'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isConfigured]);

  return { data, loading, error, isConfigured };
}

// Hook to fetch navigation
export function useNavigation(): UseContentfulResult<ContentfulEntry<NavigationFields>> {
  const [data, setData] = useState<ContentfulEntry<NavigationFields> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isConfigured = isContentfulConfigured();

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const preview = isPreviewMode();
        const result = await getNavigation({ preview });
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch navigation'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isConfigured]);

  return { data, loading, error, isConfigured };
}