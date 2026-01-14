import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PreviewModeProvider } from "@/hooks/usePreviewMode";
import { PreviewToggle } from "@/components/cms/PreviewToggle";
import Index from "./pages/Index";
import Homes from "./pages/Homes";
import Market from "./pages/Market";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PreviewModeProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/homes" element={<Homes />} />
            <Route path="/market/:slug" element={<Market />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <PreviewToggle />
        </PreviewModeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;