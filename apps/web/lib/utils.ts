import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates if a string is a valid Convex ID and not a placeholder.
 * Convex "Dummy Reference Placeholders" start with %%drp:
 */
export function isValidConvexId(id: string | null | undefined): boolean {
  if (!id) return false;
  return !id.startsWith("%%drp:");
}
