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
    // If it's an HTTP URL, assume it's already the correct, full path from Supabase Storage.
    // The remotePatterns in next.config.mjs will validate if this URL is allowed for optimization.
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