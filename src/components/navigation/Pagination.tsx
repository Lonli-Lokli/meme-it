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
    <span className="flex items-center gap-2">
      <Link
        href={`/?sort=${sort}&page=${Math.max(1, currentPage - 1)}`}
        className={currentPage === 1 ? 'text-slate-300' : 'hover:text-slate-900'}
      >
        ‹
      </Link>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <Link
        href={`/?sort=${sort}&page=${Math.min(totalPages, currentPage + 1)}`}
        className={currentPage === totalPages ? 'text-slate-300' : 'hover:text-slate-900'}
      >
        ›
      </Link>
    </span>
  );
}