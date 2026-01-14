import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isContentfulConfigured } from '@/lib/contentful';

interface PreviewModeContextType {
  isPreview: boolean;
  togglePreview: () => void;
  isConfigured: boolean;
}

const PreviewModeContext = createContext<PreviewModeContextType>({
  isPreview: false,
  togglePreview: () => {},
  isConfigured: false,
});

export function PreviewModeProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPreview, setIsPreview] = useState(searchParams.get('preview') === 'true');
  const isConfigured = isContentfulConfigured();

  useEffect(() => {
    setIsPreview(searchParams.get('preview') === 'true');
  }, [searchParams]);

  const togglePreview = () => {
    const newPreview = !isPreview;
    setIsPreview(newPreview);
    
    const newParams = new URLSearchParams(searchParams);
    if (newPreview) {
      newParams.set('preview', 'true');
    } else {
      newParams.delete('preview');
    }
    setSearchParams(newParams);
    
    // Reload to fetch fresh content
    window.location.reload();
  };

  return (
    <PreviewModeContext.Provider value={{ isPreview, togglePreview, isConfigured }}>
      {children}
    </PreviewModeContext.Provider>
  );
}

export function usePreviewMode() {
  return useContext(PreviewModeContext);
}
