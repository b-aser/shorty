import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatApiError(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const messages = Object.values(error as Record<string, unknown>)
      .flatMap((value) =>
        Array.isArray(value)
          ? value
          : typeof value === "string"
            ? [value]
            : []
      )
      .filter((message): message is string => typeof message === "string");
    if (messages.length > 0) return messages.join(" ");
  }
  return "Something went wrong";
}
