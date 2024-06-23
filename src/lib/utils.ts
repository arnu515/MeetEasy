import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function firstOrNull<T=any>(arr: T[]): T | null {
  return arr[0] ?? null
}

export const NEXT_REDIRECT_ERROR_MESSAGE = "NEXT_REDIRECT";
