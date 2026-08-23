import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DEFAULT_TIMEZONE = process.env.NEXT_PUBLIC_APP_TIMEZONE || "Asia/Ho_Chi_Minh";

export function formatZonedDate(
  date: Date | string | number,
  formatStr: string = "yyyy-MM-dd",
  timeZone: string = DEFAULT_TIMEZONE
): string {
  const d = typeof date === "string" ? parseISO(date) : new Date(date);
  const zoned = toZonedTime(d, timeZone);
  return format(zoned, formatStr);
}

export function formatCurrencyVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(val: number, decimals: number = 1): string {
  return Number.isInteger(val) ? val.toString() : val.toFixed(decimals);
}
