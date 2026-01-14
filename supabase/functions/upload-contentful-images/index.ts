import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Hero images to upload - using high-quality Unsplash images
const heroImages = {
  home: {
    title: 'Home Hero Background',
    description: 'Beautiful modern home interior',
    url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
  },
  austin: {
    title: 'Austin Hero Background',
    description: 'Austin Texas skyline',
    url: 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=1920&q=80',
  },
  denver: {
    title: 'Denver Hero Background',
    description: 'Denver Colorado mountains',
    url: 'https://images.unsplash.com/photo-1619856699906-09e1f58c98b1?w=1920&q=80',
  },
  miami: {
    title: 'Miami Hero Background',
    description: 'Miami Beach skyline',
    url: 'https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=1920&q=80',
  },
  seattle: {
    title: 'Seattle Hero Background',
    description: 'Seattle skyline with Space Needle',
    url: 'https://images.unsplash.com/photo-1502175353174-a7a70e73b362?w=1920&q=80',
  },
};

async function createAsset(
  spaceId: string,
  environment: string,
  token: string,
  imageData: { title: string; description: string; url: string }
): Promise<{ success: boolean; assetId?: string; error?: string }> {
  const cleanToken = token.trim().replace(/[^\x00-\x7F]/g, '');
  const url = `https://api.contentful.com/spaces/${spaceId}/environments/${environment}/assets`;

  console.log(`Creating asset: ${imageData.title}`);

  // Step 1: Create the asset with external URL
  const headers = new Headers();
  headers.append('Authorization', 'Bearer ' + cleanToken);
  headers.append('Content-Type', 'application/vnd.contentful.management.v1+json');

  const assetData = {
    fields: {
      title: { 'en-US': imageData.title },
      description: { 'en-US': imageData.description },
      file: {
        'en-US': {
          contentType: 'image/jpeg',
          fileName: `${imageData.title.toLowerCase().replace(/\s+/g, '-')}.jpg`,
          upload: imageData.url,
        },
      },
    },
  };

  try {
    const createResponse = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(assetData),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Failed to create asset:', errorText);
      return { success: false, error: errorText };
    }

    const asset = await createResponse.json();
    console.log(`Created asset: ${asset.sys.id}`);

    // Step 2: Process the asset (download from URL and store in Contentful)
    const processUrl = `${url}/${asset.sys.id}/files/en-US/process`;
    const processHeaders = new Headers();
    processHeaders.append('Authorization', 'Bearer ' + cleanToken);
    processHeaders.append('X-Contentful-Version', asset.sys.version.toString());

    const processResponse = await fetch(processUrl, {
      method: 'PUT',
      headers: processHeaders,
    });

    if (!processResponse.ok) {
      console.warn('Asset processing may have failed, but continuing...');
    }

    // Wait for processing to complete
    console.log('Waiting for asset processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Get updated asset version
    const getHeaders = new Headers();
    getHeaders.append('Authorization', 'Bearer ' + cleanToken);

    const getResponse = await fetch(`${url}/${asset.sys.id}`, {
      method: 'GET',
      headers: getHeaders,
    });

    if (!getResponse.ok) {
      console.error('Failed to get updated asset');
      return { success: false, error: 'Failed to get updated asset' };
    }

    const updatedAsset = await getResponse.json();

    // Step 4: Publish the asset
    const publishUrl = `${url}/${asset.sys.id}/published`;
    const publishHeaders = new Headers();
    publishHeaders.append('Authorization', 'Bearer ' + cleanToken);
    publishHeaders.append('X-Contentful-Version', updatedAsset.sys.version.toString());

    const publishResponse = await fetch(publishUrl, {
      method: 'PUT',
      headers: publishHeaders,
    });

    if (!publishResponse.ok) {
      const publishError = await publishResponse.text();
      console.warn('Failed to publish asset:', publishError);
      // Still return success as asset is created
    } else {
      console.log(`Published asset: ${asset.sys.id}`);
    }

    return { success: true, assetId: asset.sys.id };
  } catch (error) {
    console.error('Error creating asset:', error);
    return { success: false, error: String(error) };
  }
}

async function getEntriesByContentType(
  spaceId: string,
  environment: string,
  token: string,
  contentTypeId: string
): Promise<unknown[]> {
  const cleanToken = token.trim().replace(/[^\x00-\x7F]/g, '');
  const url = `https://api.contentful.com/spaces/${spaceId}/environments/${environment}/entries?content_type=${contentTypeId}`;

  const headers = new Headers();
  headers.append('Authorization', 'Bearer ' + cleanToken);

  const response = await fetch(url, { method: 'GET', headers });
  
  if (!response.ok) {
    console.error('Failed to get entries');
    return [];
  }

  const data = await response.json();
  return data.items || [];
}

async function updateEntryWithAsset(
  spaceId: string,
  environment: string,
  token: string,
  entryId: string,
  assetId: string,
  fieldName: string
): Promise<boolean> {
  const cleanToken = token.trim().replace(/[^\x00-\x7F]/g, '');
  const url = `https://api.contentful.com/spaces/${spaceId}/environments/${environment}/entries/${entryId}`;

  // Get current entry
  const getHeaders = new Headers();
  getHeaders.append('Authorization', 'Bearer ' + cleanToken);

  const getResponse = await fetch(url, { method: 'GET', headers: getHeaders });
  if (!getResponse.ok) {
    console.error('Failed to get entry');
    return false;
  }

  const entry = await getResponse.json();

  // Unpublish first if published
  if (entry.sys.publishedVersion) {
    const unpublishHeaders = new Headers();
    unpublishHeaders.append('Authorization', 'Bearer ' + cleanToken);
    
    await fetch(`${url}/published`, { method: 'DELETE', headers: unpublishHeaders });
    
    // Get fresh version
    const refreshResponse = await fetch(url, { method: 'GET', headers: getHeaders });
    const refreshedEntry = await refreshResponse.json();
    entry.sys.version = refreshedEntry.sys.version;
    entry.fields = refreshedEntry.fields;
  }

  // Update the entry with the asset link
  entry.fields[fieldName] = {
    'en-US': {
      sys: { type: 'Link', linkType: 'Asset', id: assetId },
    },
  };

  const updateHeaders = new Headers();
  updateHeaders.append('Authorization', 'Bearer ' + cleanToken);
  updateHeaders.append('Content-Type', 'application/vnd.contentful.management.v1+json');
  updateHeaders.append('X-Contentful-Version', entry.sys.version.toString());

  const updateResponse = await fetch(url, {
    method: 'PUT',
    headers: updateHeaders,
    body: JSON.stringify({ fields: entry.fields }),
  });

  if (!updateResponse.ok) {
    const errorText = await updateResponse.text();
    console.error('Failed to update entry:', errorText);
    return false;
  }

  const updatedEntry = await updateResponse.json();

  // Republish
  const publishHeaders = new Headers();
  publishHeaders.append('Authorization', 'Bearer ' + cleanToken);
  publishHeaders.append('X-Contentful-Version', updatedEntry.sys.version.toString());

  const publishResponse = await fetch(`${url}/published`, {
    method: 'PUT',
    headers: publishHeaders,
  });

  if (!publishResponse.ok) {
    console.warn('Failed to republish entry');
  }

  console.log(`Updated entry ${entryId} with asset ${assetId}`);
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const spaceId = Deno.env.get('VITE_CONTENTFUL_SPACE_ID');
    const token = Deno.env.get('CONTENTFUL_MANAGEMENT_TOKEN');
    const environment = 'master';

    if (!spaceId || !token) {
      return new Response(
        JSON.stringify({ error: 'Missing Contentful credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting hero image upload...');
    const results: { assets: Record<string, unknown>; updates: Record<string, unknown> } = { 
      assets: {}, 
      updates: {} 
    };

    // Step 1: Create all assets
    const assetMap: Record<string, string> = {};
    
    for (const [key, imageData] of Object.entries(heroImages)) {
      const result = await createAsset(spaceId, environment, token, imageData);
      results.assets[key] = result;
      if (result.assetId) {
        assetMap[key] = result.assetId;
      }
    }

    // Step 2: Get all hero modules and pages
    const heroModules = await getEntriesByContentType(spaceId, environment, token, 'heroModule') as Array<{
      sys: { id: string };
      fields: { headline?: { 'en-US': string } };
    }>;
    const pages = await getEntriesByContentType(spaceId, environment, token, 'page') as Array<{
      sys: { id: string };
      fields: { slug?: { 'en-US': string } };
    }>;
    const marketPages = await getEntriesByContentType(spaceId, environment, token, 'marketPage') as Array<{
      sys: { id: string };
      fields: { slug?: { 'en-US': string }; heroModule?: { 'en-US': { sys: { id: string } } } };
    }>;

    console.log(`Found ${heroModules.length} hero modules, ${pages.length} pages, ${marketPages.length} market pages`);

    // Step 3: Link assets to hero modules
    // Find home hero and link home image
    const homeHero = heroModules.find(h => 
      h.fields?.headline?.['en-US']?.includes('Perfect Home')
    );
    
    if (homeHero && assetMap.home) {
      const updated = await updateEntryWithAsset(
        spaceId, environment, token,
        homeHero.sys.id,
        assetMap.home,
        'backgroundImage'
      );
      results.updates['homeHero'] = { entryId: homeHero.sys.id, updated };
    }

    // Link market hero images
    for (const marketPage of marketPages) {
      const slug = marketPage.fields?.slug?.['en-US'];
      const heroRef = marketPage.fields?.heroModule?.['en-US']?.sys?.id;
      
      if (slug && heroRef && assetMap[slug]) {
        const updated = await updateEntryWithAsset(
          spaceId, environment, token,
          heroRef,
          assetMap[slug],
          'backgroundImage'
        );
        results.updates[`${slug}Hero`] = { entryId: heroRef, updated };
      }
    }

    console.log('Hero image upload complete!');

    return new Response(
      JSON.stringify({ message: 'Hero images uploaded and linked', results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
