import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getImagePath = (image: string | null | undefined): string => {
  let path = image
  
  // If no image or invalid path, return placeholder
  if (!path || typeof path !== 'string') {
    return '/placeholder-product.png'
  }

  // Check if it's already a full URL (e.g., from Supabase Storage)
  if (path.startsWith('http')) {
    // For Supabase Storage URLs, ensure they match the remotePatterns in next.config.mjs
    // Specifically, ensure they have the /product-images/ segment
    const supabaseHostname = 'notncpmpmgostfxesrvk.supabase.co';
    if (path.includes(supabaseHostname) && !path.includes('/product-images/')) {
      // If it's a Supabase URL but missing the product-images segment,
      // assume it's directly in the 'public' bucket and prepend the segment.
      // This is a heuristic and assumes your images are either in 'public/product-images'
      // or directly in 'public' (in which case we'll make it look like it's in 'product-images' for Next.js)
      const parts = path.split('/public/');
      if (parts.length > 1) {
        return `${parts[0]}/public/product-images/${parts[1]}`;
      }
    }
    return path
  }

  // For local paths, ensure it starts with /images/
  if (!path.startsWith('/images/')) {
    path = `/images/${path}`
  }

  // If it's a local path and doesn't have a file extension, assume .webp
  if (path.startsWith('/images/') && !path.includes('.')) {
    return `${path}.webp`
  }

  return path
}