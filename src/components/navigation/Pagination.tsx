'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface PaginationProps {
  total: number;
  perPage: number;
}

export function Pagination({ total, perPage }: PaginationProps) {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  const sort = searchParams.get('sort') || 'new';
  const totalPages = Math.ceil(total / perPage);

  if (totalPages <= 1) return null;

  return (
    <span className="flex items-center gap-1 text-sm">
      <Link
        href={`/?sort=${sort}&page=${Math.max(1, currentPage - 1)}`}
        className={`px-2 py-1 hover:bg-slate-100 rounded ${
          currentPage === 1 ? 'text-slate-300' : 'hover:text-slate-900'
        }`}
      >
        ‹
      </Link>
      <span className="whitespace-nowrap">
        {currentPage}/{totalPages}
      </span>
      <Link
        href={`/?sort=${sort}&page=${Math.min(totalPages, currentPage + 1)}`}
        className={`px-2 py-1 hover:bg-slate-100 rounded ${
          currentPage === totalPages ? 'text-slate-300' : 'hover:text-slate-900'
        }`}
      >
        ›
      </Link>
    </span>
  );
}