import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, minimumFractionDigits = 0) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits,
    maximumFractionDigits: 2,
  }).format(amount);
}
