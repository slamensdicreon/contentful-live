// Mock Listings Data for Rental Platform Demo

export interface Listing {
  id: string;
  title: string;
  city: string;
  state: string;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  price: number;
  images: string[];
  amenities: string[];
  description: string;
  availableDate: string;
  petFriendly: boolean;
  parking: boolean;
  featured: boolean;
}

// High-quality placeholder images from Unsplash
const houseImages = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80',
  'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
  'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&q=80',
  'https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?w=800&q=80',
];

const apartmentImages = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
];

const cities = [
  { city: 'Austin', state: 'TX' },
  { city: 'Denver', state: 'CO' },
  { city: 'Miami', state: 'FL' },
  { city: 'Seattle', state: 'WA' },
  { city: 'Nashville', state: 'TN' },
  { city: 'Portland', state: 'OR' },
  { city: 'Charlotte', state: 'NC' },
  { city: 'San Diego', state: 'CA' },
];

const streetNames = [
  'Oak Street', 'Maple Avenue', 'Cedar Lane', 'Pine Road', 'Elm Drive',
  'Willow Way', 'Birch Boulevard', 'Cherry Circle', 'Aspen Court', 'Spruce Street',
  'Highland Park', 'Riverside Drive', 'Mountain View', 'Sunset Boulevard', 'Ocean Avenue',
];

const amenitiesList = [
  'Central AC', 'In-unit Washer/Dryer', 'Hardwood Floors', 'Stainless Steel Appliances',
  'Granite Countertops', 'Walk-in Closet', 'Balcony', 'Fitness Center', 'Pool',
  'Rooftop Deck', 'Concierge', 'EV Charging', 'Smart Home Features', 'High Ceilings',
];

function getRandomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getRandomImages(count: number): string[] {
  const allImages = [...houseImages, ...apartmentImages];
  return getRandomItems(allImages, count);
}

function generateListing(index: number): Listing {
  const location = cities[index % cities.length];
  const beds = Math.floor(Math.random() * 4) + 1;
  const baths = Math.max(1, beds - Math.floor(Math.random() * 2));
  const sqft = 600 + beds * 350 + Math.floor(Math.random() * 400);
  const basePrice = location.city === 'San Diego' || location.city === 'Miami' ? 2500 : 1800;
  const price = basePrice + beds * 400 + Math.floor(Math.random() * 600);
  
  const streetNumber = Math.floor(Math.random() * 9000) + 100;
  const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];

  return {
    id: `listing-${index + 1}`,
    title: `${beds}BR ${beds > 2 ? 'House' : 'Apartment'} in ${location.city}`,
    city: location.city,
    state: location.state,
    address: `${streetNumber} ${streetName}`,
    beds,
    baths,
    sqft,
    price,
    images: getRandomImages(4),
    amenities: getRandomItems(amenitiesList, 4 + Math.floor(Math.random() * 4)),
    description: `Beautiful ${beds}-bedroom ${beds > 2 ? 'home' : 'apartment'} in the heart of ${location.city}. This stunning property features modern finishes, an open floor plan, and is located in one of the most desirable neighborhoods. Perfect for those seeking comfort and convenience.`,
    availableDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    petFriendly: Math.random() > 0.4,
    parking: Math.random() > 0.3,
    featured: index < 6,
  };
}

// Generate 25 mock listings
export const mockListings: Listing[] = Array.from({ length: 25 }, (_, i) => generateListing(i));

// Filter functions
export interface ListingFilters {
  city?: string;
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  maxBaths?: number;
  minPrice?: number;
  maxPrice?: number;
  petFriendly?: boolean;
  parking?: boolean;
}

export function filterListings(filters: ListingFilters): Listing[] {
  return mockListings.filter((listing) => {
    if (filters.city && listing.city !== filters.city) return false;
    if (filters.minBeds && listing.beds < filters.minBeds) return false;
    if (filters.maxBeds && listing.beds > filters.maxBeds) return false;
    if (filters.minBaths && listing.baths < filters.minBaths) return false;
    if (filters.maxBaths && listing.baths > filters.maxBaths) return false;
    if (filters.minPrice && listing.price < filters.minPrice) return false;
    if (filters.maxPrice && listing.price > filters.maxPrice) return false;
    if (filters.petFriendly && !listing.petFriendly) return false;
    if (filters.parking && !listing.parking) return false;
    return true;
  });
}

export function getListingById(id: string): Listing | undefined {
  return mockListings.find((listing) => listing.id === id);
}

export function getFeaturedListings(): Listing[] {
  return mockListings.filter((listing) => listing.featured);
}

export function getListingsByCity(city: string): Listing[] {
  return mockListings.filter((listing) => listing.city === city);
}

export function getUniqueCities(): string[] {
  return [...new Set(mockListings.map((listing) => listing.city))].sort();
}