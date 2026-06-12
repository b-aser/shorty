import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatApiError(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const messages: string[] = [];
    for (const value of Object.values(error as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === "string") messages.push(item);
        }
      } else if (typeof value === "string") {
        messages.push(value);
      }
    }
    if (messages.length > 0) return messages.join(" ");
  }
  return "Something went wrong";
}
