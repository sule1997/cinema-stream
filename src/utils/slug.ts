/**
 * Generates a URL-friendly slug from a movie title and ID
 * Format: movie-title-slug-{shortId}
 */
export function generateMovieSlug(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .substring(0, 50); // Limit length
  
  // Remove hyphens from UUID and take last 8 chars for uniqueness
  const cleanId = id.replace(/-/g, '');
  const shortId = cleanId.slice(-8);
  return `${slug}-${shortId}`;
}

/**
 * Extracts the short ID from a slug (last 8 characters)
 * Used to match against the unhyphenated UUID suffix
 */
export function extractIdFromSlug(slug: string): string {
  // The short ID is the last 8 characters (from unhyphenated UUID)
  return slug.slice(-8);
}
