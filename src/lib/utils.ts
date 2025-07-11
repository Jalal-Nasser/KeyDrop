import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getImagePath = (image: string | null | undefined): string => {
  // First try to get the primary image
  let path = image
  
  // If no image or invalid path, return placeholder
  if (!path || typeof path !== 'string') {
    return '/placeholder-product.png'
  }

  // Check if it's already a full URL
  if (path.startsWith('http')) {
    return path
  }

  // Ensure local paths start with /images/
  if (!path.startsWith('/images/')) {
    path = `/images/${path}`
  }

  return path
}