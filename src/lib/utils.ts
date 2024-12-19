import { Meme, ValidSort, ValidType } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createRelativeMemeUrl = (
  meme: Meme,
  sort: ValidSort = "new",
  type: ValidType = "all"
) => {
  return `/meme/${meme.chunkId}/${meme.position
    .toString()
    .padStart(3, "0")}?sort=${sort}&type=${type}`;
};

export const createAbsoluteMemeUrl = (
  meme: Meme,
  sort: ValidSort = "new",
  type: ValidType = "all"
) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || '';

  return `${baseUrl}${createRelativeMemeUrl(meme, sort, type)}`;
};
