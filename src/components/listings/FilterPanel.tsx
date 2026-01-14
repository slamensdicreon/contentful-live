import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import type { ListingFilters } from '@/lib/mock-listings';

interface FilterPanelProps {
  filters: ListingFilters;
  onFiltersChange: (filters: ListingFilters) => void;
  cities: string[];
}

export function FilterPanel({ filters, onFiltersChange, cities }: FilterPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceRange, setPriceRange] = useState([
    filters.minPrice || 1000,
    filters.maxPrice || 5000,
  ]);

  const handleCityChange = (value: string) => {
    onFiltersChange({
      ...filters,
      city: value === 'all' ? undefined : value,
    });
  };

  const handleBedsChange = (value: string) => {
    onFiltersChange({
      ...filters,
      minBeds: value === 'any' ? undefined : parseInt(value),
    });
  };

  const handleBathsChange = (value: string) => {
    onFiltersChange({
      ...filters,
      minBaths: value === 'any' ? undefined : parseInt(value),
    });
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };

  const handlePriceCommit = (value: number[]) => {
    onFiltersChange({
      ...filters,
      minPrice: value[0],
      maxPrice: value[1],
    });
  };

  const handlePetFriendlyChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      petFriendly: checked || undefined,
    });
  };

  const handleParkingChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      parking: checked || undefined,
    });
  };

  const clearFilters = () => {
    setPriceRange([1000, 5000]);
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      {/* Main Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* City */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">City</Label>
          <Select value={filters.city || 'all'} onValueChange={handleCityChange}>
            <SelectTrigger>
              <SelectValue placeholder="All cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Beds */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Bedrooms</Label>
          <Select 
            value={filters.minBeds?.toString() || 'any'} 
            onValueChange={handleBedsChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Baths */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Bathrooms</Label>
          <Select 
            value={filters.minBaths?.toString() || 'any'} 
            onValueChange={handleBathsChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Toggle Advanced */}
        <div className="flex items-end gap-2">
          <Button
            variant={showAdvanced ? 'secondary' : 'outline'}
            className="flex-1 gap-2"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showAdvanced ? 'Less Filters' : 'More Filters'}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-6 pt-6 border-t border-border space-y-6 animate-fade-in">
          {/* Price Range */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Price Range</Label>
              <span className="text-sm text-muted-foreground">
                {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
              </span>
            </div>
            <Slider
              value={priceRange}
              min={500}
              max={8000}
              step={100}
              onValueChange={handlePriceChange}
              onValueCommit={handlePriceCommit}
              className="w-full"
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <Switch
                id="pet-friendly"
                checked={filters.petFriendly || false}
                onCheckedChange={handlePetFriendlyChange}
              />
              <Label htmlFor="pet-friendly" className="text-sm cursor-pointer">
                Pet Friendly
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="parking"
                checked={filters.parking || false}
                onCheckedChange={handleParkingChange}
              />
              <Label htmlFor="parking" className="text-sm cursor-pointer">
                Parking Included
              </Label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}