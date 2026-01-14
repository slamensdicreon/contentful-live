import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Content type definitions for the CMS
const contentTypes = [
  {
    sys: { id: 'heroModule' },
    name: 'Hero Module',
    description: 'Full-width hero section with background image and CTA',
    displayField: 'headline',
    fields: [
      { id: 'headline', name: 'Headline', type: 'Symbol', required: true },
      { id: 'subheadline', name: 'Subheadline', type: 'Text', required: false },
      { id: 'backgroundImage', name: 'Background Image', type: 'Link', linkType: 'Asset', required: false },
      { id: 'ctaLabel', name: 'CTA Label', type: 'Symbol', required: false },
      { id: 'ctaLink', name: 'CTA Link', type: 'Symbol', required: false },
    ]
  },
  {
    sys: { id: 'promoStripModule' },
    name: 'Promo Strip Module',
    description: 'Horizontal strip with promotional items',
    displayField: 'internalName',
    fields: [
      { id: 'internalName', name: 'Internal Name', type: 'Symbol', required: true },
      { id: 'items', name: 'Items', type: 'Object', required: true },
    ]
  },
  {
    sys: { id: 'cardGridModule' },
    name: 'Card Grid Module',
    description: 'Grid of cards with images and links',
    displayField: 'headline',
    fields: [
      { id: 'eyebrow', name: 'Eyebrow', type: 'Symbol', required: false },
      { id: 'headline', name: 'Headline', type: 'Symbol', required: true },
      { id: 'cards', name: 'Cards', type: 'Object', required: true },
    ]
  },
  {
    sys: { id: 'richTextModule' },
    name: 'Rich Text Module',
    description: 'Rich text content block',
    displayField: 'internalName',
    fields: [
      { id: 'internalName', name: 'Internal Name', type: 'Symbol', required: true },
      { id: 'body', name: 'Body', type: 'RichText', required: true },
    ]
  },
  {
    sys: { id: 'navigation' },
    name: 'Navigation',
    description: 'Site navigation configuration',
    displayField: 'internalName',
    fields: [
      { id: 'internalName', name: 'Internal Name', type: 'Symbol', required: true },
      { id: 'headerLinks', name: 'Header Links', type: 'Object', required: true },
      { id: 'footerLinks', name: 'Footer Links', type: 'Object', required: true },
    ]
  },
  {
    sys: { id: 'page' },
    name: 'Page',
    description: 'Generic page with modular content',
    displayField: 'title',
    fields: [
      { id: 'title', name: 'Title', type: 'Symbol', required: true },
      { id: 'slug', name: 'Slug', type: 'Symbol', required: true, validations: [{ unique: true }] },
      { id: 'seoTitle', name: 'SEO Title', type: 'Symbol', required: false },
      { id: 'seoDescription', name: 'SEO Description', type: 'Text', required: false },
      { 
        id: 'modules', 
        name: 'Modules', 
        type: 'Array', 
        required: false,
        items: {
          type: 'Link',
          linkType: 'Entry',
          validations: [{ linkContentType: ['heroModule', 'promoStripModule', 'cardGridModule', 'richTextModule'] }]
        }
      },
    ]
  },
  {
    sys: { id: 'marketPage' },
    name: 'Market Page',
    description: 'Market-specific landing page',
    displayField: 'marketName',
    fields: [
      { id: 'marketName', name: 'Market Name', type: 'Symbol', required: true },
      { id: 'slug', name: 'Slug', type: 'Symbol', required: true, validations: [{ unique: true }] },
      { 
        id: 'heroModule', 
        name: 'Hero Module', 
        type: 'Link', 
        linkType: 'Entry',
        required: false,
        validations: [{ linkContentType: ['heroModule'] }]
      },
      { id: 'introRichText', name: 'Intro Rich Text', type: 'RichText', required: false },
      { id: 'defaultSearchConfig', name: 'Default Search Config', type: 'Object', required: false },
    ]
  },
];

// Build Contentful field definition
function buildField(field: any) {
  const fieldDef: any = {
    id: field.id,
    name: field.name,
    type: field.type,
    required: field.required || false,
    localized: false,
  };

  if (field.type === 'Link') {
    fieldDef.linkType = field.linkType;
    if (field.validations) {
      fieldDef.validations = field.validations;
    }
  }

  if (field.type === 'Array' && field.items) {
    fieldDef.items = field.items;
  }

  if (field.validations) {
    fieldDef.validations = field.validations;
  }

  return fieldDef;
}

// Create a content type in Contentful
async function createContentType(
  spaceId: string,
  environmentId: string,
  token: string,
  contentType: any
): Promise<{ success: boolean; id: string; error?: string; alreadyExists?: boolean }> {
  const url = `https://api.contentful.com/spaces/${spaceId}/environments/${environmentId}/content_types/${contentType.sys.id}`;
  
  const body = {
    name: contentType.name,
    description: contentType.description,
    displayField: contentType.displayField,
    fields: contentType.fields.map(buildField),
  };

  console.log(`Creating content type: ${contentType.sys.id}`);
  
  // Trim token to ensure no whitespace issues
  const cleanToken = token.trim();

  try {
    // First try to get existing content type
    const getResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + cleanToken,
        'Content-Type': 'application/vnd.contentful.management.v1+json',
      },
    });

    let version = 1;
    if (getResponse.ok) {
      const existing = await getResponse.json();
      version = existing.sys.version;
      console.log(`Content type ${contentType.sys.id} exists, updating (version ${version})`);
    }

    // Create or update
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + cleanToken,
        'Content-Type': 'application/vnd.contentful.management.v1+json',
        'X-Contentful-Version': version.toString(),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Error creating ${contentType.sys.id}:`, errorData);
      return { 
        success: false, 
        id: contentType.sys.id, 
        error: errorData.message || JSON.stringify(errorData) 
      };
    }

    const result = await response.json();
    console.log(`Successfully created/updated: ${contentType.sys.id}`);
    
    // Activate/publish the content type
    const activateUrl = `${url}/published`;
    const activateResponse = await fetch(activateUrl, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + cleanToken,
        'X-Contentful-Version': result.sys.version.toString(),
      },
    });

    if (!activateResponse.ok) {
      console.warn(`Warning: Could not activate ${contentType.sys.id}`);
    } else {
      console.log(`Activated: ${contentType.sys.id}`);
    }

    return { success: true, id: contentType.sys.id };
  } catch (error) {
    console.error(`Exception creating ${contentType.sys.id}:`, error);
    return { success: false, id: contentType.sys.id, error: String(error) };
  }
}

serve(async (req) => {
  // Handle CORS preflight
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

    console.log(`Setting up Contentful content types in space: ${spaceId}, environment: ${environment}`);

    const results = [];
    
    // Create content types in order (dependencies first)
    const orderedTypes = [
      'heroModule',
      'promoStripModule', 
      'cardGridModule',
      'richTextModule',
      'navigation',
      'page',
      'marketPage',
    ];

    for (const typeId of orderedTypes) {
      const contentType = contentTypes.find(ct => ct.sys.id === typeId);
      if (contentType) {
        const result = await createContentType(spaceId, environment, managementToken, contentType);
        results.push(result);
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`Setup complete: ${successful.length} succeeded, ${failed.length} failed`);

    return new Response(
      JSON.stringify({
        message: 'Contentful setup complete',
        successful: successful.map(r => r.id),
        failed: failed.map(r => ({ id: r.id, error: r.error })),
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: failed.length > 0 ? 207 : 200,
      }
    );
  } catch (error) {
    console.error('Setup error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
