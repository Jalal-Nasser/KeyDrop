import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getImagePath(path: string | null) {
    if (!path) return "/placeholder-image.png";
    if (path.startsWith("http")) return path;
    return path;
}
