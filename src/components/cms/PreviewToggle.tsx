import { Eye, EyeOff } from 'lucide-react';
import { usePreviewMode } from '@/hooks/usePreviewMode';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function PreviewToggle() {
  const { isPreview, togglePreview, isConfigured } = usePreviewMode();

  // Only show toggle when Contentful is configured
  if (!isConfigured) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="fixed bottom-4 right-4 z-50">
            <Button
              onClick={togglePreview}
              variant={isPreview ? 'default' : 'outline'}
              size="sm"
              className={`gap-2 shadow-lg ${
                isPreview 
                  ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500' 
                  : 'bg-background'
              }`}
            >
              {isPreview ? (
                <>
                  <Eye className="h-4 w-4" />
                  Preview Mode
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4" />
                  Published
                </>
              )}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>
            {isPreview 
              ? 'Viewing draft content. Click to see published content.' 
              : 'Viewing published content. Click to preview drafts.'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
