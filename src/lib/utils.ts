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
    return path
  }

  // For local paths, ensure it starts with /images/
  if (!path.startsWith('/images/')) {
    path = `/images/${path}`
  }

  // If it's a local path and doesn't have a file extension, assume .webp
  // This handles cases where the DB might store "Office365" instead of "Office365.webp"
  if (path.startsWith('/images/') && !path.includes('.')) {
    return `${path}.webp`
  }

  return path
}