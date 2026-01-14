import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Home, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/hooks/useContentful';
import type { NavigationLink } from '@/types/contentful';

// Fallback navigation when Contentful is not configured
const fallbackHeaderLinks: NavigationLink[] = [
  { label: 'Browse Homes', href: '/homes' },
  { label: 'Austin', href: '/market/austin' },
  { label: 'Denver', href: '/market/denver' },
  { label: 'Miami', href: '/market/miami' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { data: navigation, isConfigured } = useNavigation();

  const headerLinks = isConfigured && navigation?.fields?.headerLinks
    ? navigation.fields.headerLinks
    : fallbackHeaderLinks;

  const isActiveLink = (href: string) => location.pathname === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 font-display text-xl font-bold"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Home className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-gradient">NestFinder</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {headerLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActiveLink(link.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
          <Button size="sm" className="gap-2 shadow-colored">
            <MapPin className="h-4 w-4" />
            List Your Home
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container py-4 flex flex-col gap-1">
            {headerLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActiveLink(link.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Search className="h-4 w-4" />
                Search Homes
              </Button>
              <Button className="w-full justify-start gap-2">
                <MapPin className="h-4 w-4" />
                List Your Home
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}