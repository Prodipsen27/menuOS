import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CURRENCY_SYMBOL = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹";

export function formatPrice(price: number | string, symbol?: string): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  const activeSymbol = symbol || process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹";
  if (isNaN(num)) return `${activeSymbol}0.00`;
  return `${activeSymbol}${num.toFixed(2)}`;
}
