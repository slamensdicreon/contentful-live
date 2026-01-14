import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Sample content data
const sampleData = {
  navigation: {
    internalName: 'Main Navigation',
    headerLinks: [
      { label: 'Homes', href: '/homes' },
      { label: 'Austin', href: '/markets/austin' },
      { label: 'Denver', href: '/markets/denver' },
      { label: 'Miami', href: '/markets/miami' },
      { label: 'Seattle', href: '/markets/seattle' },
    ],
    footerLinks: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  heroModule: {
    headline: 'Find Your Perfect Home',
    subheadline: 'Discover beautiful rental properties in top cities across America. Your dream home is just a search away.',
    ctaLabel: 'Browse Homes',
    ctaLink: '/homes',
  },
  promoStripModule: {
    internalName: 'Home Page Promo Strip',
    items: [
      { title: 'Verified Listings', description: 'Every property is verified by our team for accuracy and quality.' },
      { title: 'Secure Payments', description: 'Safe and secure payment processing for all transactions.' },
      { title: '24/7 Support', description: 'Our support team is available around the clock to help you.' },
      { title: 'Love Guarantee', description: "Not happy? We'll help you find a better match, guaranteed." },
    ],
  },
  cardGridModule: {
    eyebrow: 'Popular Destinations',
    headline: 'Explore Our Markets',
    cards: [
      { title: 'Austin', description: 'Live music capital with a booming tech scene.', href: '/markets/austin' },
      { title: 'Denver', description: 'Mountain views and outdoor adventures.', href: '/markets/denver' },
      { title: 'Miami', description: 'Beaches, nightlife, and year-round sunshine.', href: '/markets/miami' },
      { title: 'Seattle', description: 'Coffee culture and Pacific Northwest beauty.', href: '/markets/seattle' },
    ],
  },
  marketPages: [
    {
      marketName: 'Austin',
      slug: 'austin',
      heroHeadline: 'Homes in Austin',
      heroSubheadline: 'Live music capital with a booming tech scene and vibrant culture. Find your perfect Austin rental.',
    },
    {
      marketName: 'Denver',
      slug: 'denver',
      heroHeadline: 'Homes in Denver',
      heroSubheadline: 'Mountain views, outdoor adventures, and craft beer paradise. Discover Denver rentals.',
    },
    {
      marketName: 'Miami',
      slug: 'miami',
      heroHeadline: 'Homes in Miami',
      heroSubheadline: 'Beaches, nightlife, and year-round sunshine await you. Browse Miami properties.',
    },
    {
      marketName: 'Seattle',
      slug: 'seattle',
      heroHeadline: 'Homes in Seattle',
      heroSubheadline: 'Coffee culture, tech innovation, and stunning Pacific Northwest views. Explore Seattle homes.',
    },
  ],
};

async function createEntry(
  spaceId: string,
  environment: string,
  token: string,
  contentTypeId: string,
  fields: Record<string, unknown>
): Promise<{ success: boolean; entryId?: string; error?: string }> {
  const url = `https://api.contentful.com/spaces/${spaceId}/environments/${environment}/entries`;
  
  // Wrap fields in locale structure
  const localizedFields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    localizedFields[key] = { 'en-US': value };
  }

  const cleanToken = token.trim().replace(/[^\x00-\x7F]/g, '');
  
  const headers = new Headers();
  headers.append('Authorization', 'Bearer ' + cleanToken);
  headers.append('Content-Type', 'application/vnd.contentful.management.v1+json');
  headers.append('X-Contentful-Content-Type', contentTypeId);

  console.log(`Creating entry for content type: ${contentTypeId}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ fields: localizedFields }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to create ${contentTypeId}:`, errorText);
      return { success: false, error: errorText };
    }

    const result = await response.json();
    console.log(`Created ${contentTypeId} with ID: ${result.sys.id}`);

    // Publish the entry
    const publishUrl = `${url}/${result.sys.id}/published`;
    const publishHeaders = new Headers();
    publishHeaders.append('Authorization', 'Bearer ' + cleanToken);
    publishHeaders.append('X-Contentful-Version', result.sys.version.toString());

    const publishResponse = await fetch(publishUrl, {
      method: 'PUT',
      headers: publishHeaders,
    });

    if (!publishResponse.ok) {
      console.warn(`Entry created but failed to publish: ${result.sys.id}`);
    } else {
      console.log(`Published entry: ${result.sys.id}`);
    }

    return { success: true, entryId: result.sys.id };
  } catch (error) {
    console.error(`Error creating ${contentTypeId}:`, error);
    return { success: false, error: String(error) };
  }
}

async function createLinkedEntry(
  spaceId: string,
  environment: string,
  token: string,
  contentTypeId: string,
  fields: Record<string, unknown>,
  linkedEntries: Record<string, string[]>
): Promise<{ success: boolean; entryId?: string; error?: string }> {
  const url = `https://api.contentful.com/spaces/${spaceId}/environments/${environment}/entries`;
  
  // Wrap fields in locale structure and add linked entries
  const localizedFields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    localizedFields[key] = { 'en-US': value };
  }
  
  // Add linked entry references
  for (const [key, entryIds] of Object.entries(linkedEntries)) {
    localizedFields[key] = {
      'en-US': entryIds.map(id => ({
        sys: { type: 'Link', linkType: 'Entry', id }
      }))
    };
  }

  const cleanToken = token.trim().replace(/[^\x00-\x7F]/g, '');
  
  const headers = new Headers();
  headers.append('Authorization', 'Bearer ' + cleanToken);
  headers.append('Content-Type', 'application/vnd.contentful.management.v1+json');
  headers.append('X-Contentful-Content-Type', contentTypeId);

  console.log(`Creating linked entry for content type: ${contentTypeId}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ fields: localizedFields }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to create ${contentTypeId}:`, errorText);
      return { success: false, error: errorText };
    }

    const result = await response.json();
    console.log(`Created ${contentTypeId} with ID: ${result.sys.id}`);

    // Publish the entry
    const publishUrl = `${url}/${result.sys.id}/published`;
    const publishHeaders = new Headers();
    publishHeaders.append('Authorization', 'Bearer ' + cleanToken);
    publishHeaders.append('X-Contentful-Version', result.sys.version.toString());

    const publishResponse = await fetch(publishUrl, {
      method: 'PUT',
      headers: publishHeaders,
    });

    if (!publishResponse.ok) {
      console.warn(`Entry created but failed to publish: ${result.sys.id}`);
    } else {
      console.log(`Published entry: ${result.sys.id}`);
    }

    return { success: true, entryId: result.sys.id };
  } catch (error) {
    console.error(`Error creating ${contentTypeId}:`, error);
    return { success: false, error: String(error) };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const spaceId = Deno.env.get('VITE_CONTENTFUL_SPACE_ID');
    const token = Deno.env.get('CONTENTFUL_MANAGEMENT_TOKEN');
    const environment = 'master';

    if (!spaceId || !token) {
      console.error('Missing Contentful credentials');
      return new Response(
        JSON.stringify({ error: 'Missing Contentful credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting Contentful content population...');
    const results: Record<string, unknown> = {};

    // 1. Create Navigation
    console.log('Creating Navigation entry...');
    const navResult = await createEntry(spaceId, environment, token, 'navigation', sampleData.navigation);
    results.navigation = navResult;

    // 2. Create Hero Module
    console.log('Creating Hero Module entry...');
    const heroResult = await createEntry(spaceId, environment, token, 'heroModule', sampleData.heroModule);
    results.heroModule = heroResult;

    // 3. Create Promo Strip Module
    console.log('Creating Promo Strip Module entry...');
    const promoResult = await createEntry(spaceId, environment, token, 'promoStripModule', sampleData.promoStripModule);
    results.promoStripModule = promoResult;

    // 4. Create Card Grid Module
    console.log('Creating Card Grid Module entry...');
    const cardGridResult = await createEntry(spaceId, environment, token, 'cardGridModule', sampleData.cardGridModule);
    results.cardGridModule = cardGridResult;

    // 5. Create Home Page with module references
    console.log('Creating Home Page entry...');
    const moduleIds: string[] = [];
    if (heroResult.entryId) moduleIds.push(heroResult.entryId);
    if (promoResult.entryId) moduleIds.push(promoResult.entryId);
    if (cardGridResult.entryId) moduleIds.push(cardGridResult.entryId);

    const homePageResult = await createLinkedEntry(
      spaceId,
      environment,
      token,
      'page',
      {
        title: 'Home',
        slug: 'home',
        seoTitle: 'Find Your Perfect Home | Rental Properties',
        seoDescription: 'Discover beautiful rental properties in top cities across America.',
      },
      { modules: moduleIds }
    );
    results.homePage = homePageResult;

    // 6. Create Market Pages with their Hero Modules
    console.log('Creating Market Pages...');
    results.marketPages = [];

    for (const market of sampleData.marketPages) {
      // Create hero for this market
      const marketHeroResult = await createEntry(spaceId, environment, token, 'heroModule', {
        headline: market.heroHeadline,
        subheadline: market.heroSubheadline,
        ctaLabel: 'View All Homes',
        ctaLink: '/homes',
      });

      // Create the market page with hero reference
      if (marketHeroResult.entryId) {
        const marketPageUrl = `https://api.contentful.com/spaces/${spaceId}/environments/${environment}/entries`;
        const cleanToken = token.trim().replace(/[^\x00-\x7F]/g, '');
        
        const headers = new Headers();
        headers.append('Authorization', 'Bearer ' + cleanToken);
        headers.append('Content-Type', 'application/vnd.contentful.management.v1+json');
        headers.append('X-Contentful-Content-Type', 'marketPage');

        const marketPageFields = {
          marketName: { 'en-US': market.marketName },
          slug: { 'en-US': market.slug },
          heroModule: {
            'en-US': {
              sys: { type: 'Link', linkType: 'Entry', id: marketHeroResult.entryId }
            }
          },
        };

        const response = await fetch(marketPageUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ fields: marketPageFields }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`Created market page for ${market.marketName}: ${result.sys.id}`);

          // Publish
          const publishHeaders = new Headers();
          publishHeaders.append('Authorization', 'Bearer ' + cleanToken);
          publishHeaders.append('X-Contentful-Version', result.sys.version.toString());
          
          await fetch(`${marketPageUrl}/${result.sys.id}/published`, {
            method: 'PUT',
            headers: publishHeaders,
          });

          (results.marketPages as unknown[]).push({
            market: market.marketName,
            success: true,
            entryId: result.sys.id,
          });
        } else {
          const errorText = await response.text();
          console.error(`Failed to create market page for ${market.marketName}:`, errorText);
          (results.marketPages as unknown[]).push({
            market: market.marketName,
            success: false,
            error: errorText,
          });
        }
      }
    }

    console.log('Content population complete!');

    return new Response(
      JSON.stringify({
        message: 'Content populated successfully',
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error populating content:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
