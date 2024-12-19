'use client';

import { useSearchParams, useRouter } from 'next/navigation';

interface PaginationProps {
  total: number;
  perPage: number;
}

export function Pagination({ total, perPage }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  const sort = searchParams.get('sort') || 'new';
  const type = searchParams.get('type') || 'all';
  const totalPages = Math.ceil(total / perPage);

  if (totalPages <= 1) return null;

  return (
    <span className="flex items-center gap-1 text-sm">
      <button
        onClick={() => {
          router.push(`/?sort=${sort}&type=${type}&page=${Math.max(1, currentPage - 1)}`);
        }}
        disabled={currentPage === 1}
        className={`px-2 py-1 rounded ${
          currentPage === 1 
            ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' 
            : 'text-slate-600 dark:text-slate-300 active:bg-slate-100 dark:active:bg-gray-700 hover:text-slate-900 dark:hover:text-white'
        }`}
        aria-label="Previous page"
      >
        ‹
      </button>
      <span className="whitespace-nowrap">
        {currentPage}/{totalPages}
      </span>
      <button
        onClick={() => {
          router.push(`/?sort=${sort}&type=${type}&page=${Math.min(totalPages, currentPage + 1)}`);
        }}
        disabled={currentPage === totalPages}
        className={`px-2 py-1 rounded ${
          currentPage === totalPages 
            ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' 
            : 'text-slate-600 dark:text-slate-300 active:bg-slate-100 dark:active:bg-gray-700 hover:text-slate-900 dark:hover:text-white'
        }`}
        aria-label="Next page"
      >
        ›
      </button>
    </span>
  );
}