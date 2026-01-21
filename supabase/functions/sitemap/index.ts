import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Movie {
  id: string;
  title: string;
  description: string | null;
  dj_name: string;
  movie_type: string | null;
  season_number: number | null;
  video_links: { name: string; url: string }[] | null;
  updated_at: string;
}

// Generate URL-friendly slug from movie title and ID
function generateMovieSlug(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
  
  // Remove hyphens from UUID and take last 8 chars for uniqueness
  const cleanId = id.replace(/-/g, '');
  const shortId = cleanId.slice(-8);
  return `${slug}-${shortId}`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all approved movies
    const { data: movies, error } = await supabase
      .from('movies')
      .select('id, title, description, dj_name, movie_type, season_number, video_links, updated_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching movies:', error);
      throw error;
    }

    // Get the base URL from environment - MUST be set for production
    const baseUrl = Deno.env.get('SITE_URL') || 'https://dirajumla-publishers.com';

    // Generate sitemap XML - using full ISO 8601 timestamps for better indexing
    const urlEntries = (movies || []).map((movie: Movie) => {
      const lastmod = new Date(movie.updated_at).toISOString();
      const movieSlug = generateMovieSlug(movie.title, movie.id);

      return `  <url>
    <loc>${baseUrl}/movie/${movieSlug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    }).join('\n');

    // Add static pages
    const today = new Date().toISOString().split('T')[0];
    const staticPages = `  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages}
${urlEntries}
</urlset>`;

    console.log(`Sitemap generated with ${(movies || []).length} movies`);

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`,
      {
        status: 500,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          ...corsHeaders,
        },
      }
    );
  }
});
