import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// New getImagePath utility function
export const getImagePath = (image: string | string[] | undefined): string => {
  if (!image) return "/placeholder.jpg";
  let path = Array.isArray(image) ? image[0] : image;
  // Ensure the path starts with /images/ if it's a local image and doesn't already have a leading slash or is an external URL
  if (!path.startsWith('/') && !path.startsWith('http')) {
    return `/images/${path}`;
  }
  return path;
}