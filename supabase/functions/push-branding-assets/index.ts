import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to decode base64
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  // Remove data URL prefix if present
  const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
  const binaryString = atob(cleanBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Upload an asset to Contentful
async function uploadAsset(
  spaceId: string,
  environment: string,
  token: string,
  title: string,
  fileName: string,
  imageData: string | ArrayBuffer,
  contentType: string
): Promise<{ success: boolean; assetId?: string; error?: string }> {
  console.log(`Uploading asset: ${title}`);
  
  try {
    // Convert base64 to ArrayBuffer if needed
    let imageBuffer: ArrayBuffer;
    if (typeof imageData === 'string') {
      if (imageData.startsWith('http')) {
        // It's a URL, fetch it
        console.log(`Fetching image from: ${imageData}`);
        const imageResponse = await fetch(imageData);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }
        const imageBlob = await imageResponse.blob();
        imageBuffer = await imageBlob.arrayBuffer();
      } else {
        // It's base64 data
        console.log('Decoding base64 image data');
        imageBuffer = base64ToArrayBuffer(imageData);
      }
    } else {
      imageBuffer = imageData;
    }
    console.log(`Image size: ${imageBuffer.byteLength} bytes`);

    // Create upload
    const uploadUrl = `https://upload.contentful.com/spaces/${spaceId}/uploads`;
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
      },
      body: imageBuffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
    }

    const uploadData = await uploadResponse.json();
    const uploadId = uploadData.sys.id;
    console.log(`Upload created: ${uploadId}`);

    // Step 3: Create asset with link to upload
    const createAssetUrl = `https://api.contentful.com/spaces/${spaceId}/environments/${environment}/assets`;
    const assetBody = {
      fields: {
        title: { 'en-US': title },
        file: {
          'en-US': {
            fileName: fileName,
            contentType: contentType,
            uploadFrom: {
              sys: {
                type: 'Link',
                linkType: 'Upload',
                id: uploadId,
              },
            },
          },
        },
      },
    };

    const createAssetResponse = await fetch(createAssetUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/vnd.contentful.management.v1+json',
      },
      body: JSON.stringify(assetBody),
    });

    if (!createAssetResponse.ok) {
      const errorText = await createAssetResponse.text();
      throw new Error(`Asset creation failed: ${createAssetResponse.status} - ${errorText}`);
    }

    const assetData = await createAssetResponse.json();
    const assetId = assetData.sys.id;
    const assetVersion = assetData.sys.version;
    console.log(`Asset created: ${assetId} (version ${assetVersion})`);

    // Step 4: Process the asset
    const processUrl = `https://api.contentful.com/spaces/${spaceId}/environments/${environment}/assets/${assetId}/files/en-US/process`;
    const processResponse = await fetch(processUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Contentful-Version': assetVersion.toString(),
      },
    });

    if (!processResponse.ok) {
      console.warn(`Asset processing returned: ${processResponse.status}`);
    }

    // Wait for processing
    console.log('Waiting for asset processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 5: Get latest version and publish
    const getAssetUrl = `https://api.contentful.com/spaces/${spaceId}/environments/${environment}/assets/${assetId}`;
    const getResponse = await fetch(getAssetUrl, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!getResponse.ok) {
      throw new Error(`Failed to get asset: ${getResponse.status}`);
    }
    
    const latestAsset = await getResponse.json();
    const latestVersion = latestAsset.sys.version;

    const publishUrl = `https://api.contentful.com/spaces/${spaceId}/environments/${environment}/assets/${assetId}/published`;
    const publishResponse = await fetch(publishUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Contentful-Version': latestVersion.toString(),
      },
    });

    if (!publishResponse.ok) {
      console.warn(`Asset publishing returned: ${publishResponse.status}`);
    } else {
      console.log(`Asset published: ${assetId}`);
    }

    return { success: true, assetId };
  } catch (error) {
    console.error(`Error uploading asset ${title}:`, error);
    return { success: false, error: String(error) };
  }
}

// Find and update the home page entry
async function updateHomePage(
  spaceId: string,
  environment: string,
  token: string,
  faviconId: string,
  ogImageId: string
): Promise<{ success: boolean; error?: string }> {
  console.log('Updating home page with branding assets...');

  try {
    // Find the home page
    const searchUrl = `https://api.contentful.com/spaces/${spaceId}/environments/${environment}/entries?content_type=page&fields.slug=home`;
    const searchResponse = await fetch(searchUrl, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!searchResponse.ok) {
      throw new Error(`Failed to search for home page: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    if (!searchData.items || searchData.items.length === 0) {
      throw new Error('Home page not found');
    }

    const homePage = searchData.items[0];
    const entryId = homePage.sys.id;
    const version = homePage.sys.version;
    console.log(`Found home page: ${entryId} (version ${version})`);

    // Update the entry with favicon and ogImage links
    const updateUrl = `https://api.contentful.com/spaces/${spaceId}/environments/${environment}/entries/${entryId}`;
    
    // Preserve existing fields and add new ones
    const updatedFields = {
      ...homePage.fields,
      favicon: {
        'en-US': {
          sys: {
            type: 'Link',
            linkType: 'Asset',
            id: faviconId,
          },
        },
      },
      ogImage: {
        'en-US': {
          sys: {
            type: 'Link',
            linkType: 'Asset',
            id: ogImageId,
          },
        },
      },
    };

    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/vnd.contentful.management.v1+json',
        'X-Contentful-Version': version.toString(),
      },
      body: JSON.stringify({ fields: updatedFields }),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Failed to update home page: ${updateResponse.status} - ${errorText}`);
    }

    const updatedEntry = await updateResponse.json();
    console.log(`Home page updated (version ${updatedEntry.sys.version})`);

    // Publish the updated entry
    const publishUrl = `https://api.contentful.com/spaces/${spaceId}/environments/${environment}/entries/${entryId}/published`;
    const publishResponse = await fetch(publishUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Contentful-Version': updatedEntry.sys.version.toString(),
      },
    });

    if (!publishResponse.ok) {
      console.warn(`Entry publishing returned: ${publishResponse.status}`);
    } else {
      console.log('Home page published with new branding assets');
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating home page:', error);
    return { success: false, error: String(error) };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const managementToken = Deno.env.get('CONTENTFUL_MANAGEMENT_TOKEN');
    const spaceId = Deno.env.get('VITE_CONTENTFUL_SPACE_ID');
    const environment = Deno.env.get('VITE_CONTENTFUL_ENVIRONMENT') || 'master';

    if (!managementToken) {
      throw new Error('CONTENTFUL_MANAGEMENT_TOKEN is not configured');
    }
    if (!spaceId) {
      throw new Error('VITE_CONTENTFUL_SPACE_ID is not configured');
    }

    // Parse request body for image data (can be URLs or base64)
    const body = await req.json();
    const { faviconData, ogImageData, faviconUrl, ogImageUrl } = body;

    // Support both base64 data and URLs
    const faviconSource = faviconData || faviconUrl;
    const ogImageSource = ogImageData || ogImageUrl;

    if (!faviconSource || !ogImageSource) {
      throw new Error('Both favicon and ogImage data are required (as faviconData/ogImageData or faviconUrl/ogImageUrl)');
    }

    console.log(`Pushing branding assets to Contentful space: ${spaceId}`);

    // Upload favicon
    const faviconResult = await uploadAsset(
      spaceId,
      environment,
      managementToken,
      'Site Favicon',
      'favicon.png',
      faviconSource,
      'image/png'
    );

    if (!faviconResult.success) {
      throw new Error(`Favicon upload failed: ${faviconResult.error}`);
    }

    // Upload OG image
    const ogImageResult = await uploadAsset(
      spaceId,
      environment,
      managementToken,
      'Open Graph Image',
      'og-image.png',
      ogImageSource,
      'image/png'
    );

    if (!ogImageResult.success) {
      throw new Error(`OG image upload failed: ${ogImageResult.error}`);
    }

    // Update home page with asset links
    const updateResult = await updateHomePage(
      spaceId,
      environment,
      managementToken,
      faviconResult.assetId!,
      ogImageResult.assetId!
    );

    if (!updateResult.success) {
      throw new Error(`Home page update failed: ${updateResult.error}`);
    }

    return new Response(
      JSON.stringify({
        message: 'Branding assets pushed successfully',
        faviconAssetId: faviconResult.assetId,
        ogImageAssetId: ogImageResult.assetId,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Push branding error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
