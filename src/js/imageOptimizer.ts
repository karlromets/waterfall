const PRODUCTION_BASE = 'https://waterfall.somelar.dev';
const IS_PRODUCTION = import.meta.env.PROD;

/**
 * Wraps image URLs with wsrv.nl for optimized webp delivery in production
 * Uses lossless webp compression with quality 20
 */
export function optimizeImageUrl(url: string): string {
  if (!IS_PRODUCTION) return url;
  
  // Vite production URLs are already absolute paths like /assets/xxx.png
  const absoluteUrl = url.startsWith('http') 
    ? url 
    : `${PRODUCTION_BASE}${url}`;
  
  return `https://wsrv.nl/?url=${encodeURIComponent(absoluteUrl)}&output=webp&ll&q=20`;
}

/**
 * Optimizes all image URLs in a record (for card images)
 */
export function optimizeImageRecord(images: Record<string, string>): Record<string, string> {
  const optimized: Record<string, string> = {};
  for (const [key, url] of Object.entries(images)) {
    optimized[key] = optimizeImageUrl(url);
  }
  return optimized;
}

