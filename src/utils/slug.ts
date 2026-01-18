/**
 * Generates a URL-friendly slug from a movie title and ID
 * Format: movie-title-slug-{id}
 */
export function generateMovieSlug(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .substring(0, 50); // Limit length
  
  // Append a short ID for uniqueness (last 8 chars of UUID)
  const shortId = id.slice(-8);
  return `${slug}-${shortId}`;
}

/**
 * Extracts the movie ID from a slug
 * The ID is the last 8 characters after the final hyphen
 */
export function extractIdFromSlug(slug: string): string {
  // The short ID is the last 8 characters
  const shortId = slug.slice(-8);
  return shortId;
}
