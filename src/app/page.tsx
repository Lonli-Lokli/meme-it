import { Suspense } from 'react';
import { getMemesByPage } from '@/lib/firebase-utils';
import { MemeClientWrapper } from '@/components/meme/MemeClientWrapper';
import { NavigationTabs } from '@/components/navigation/NavigationTabs';

const MEMES_PER_PAGE = 12;

export default async function HomePage({
  searchParams: args,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await args;
  const currentPage = Number(searchParams.page) || 1;
  const sort = (searchParams.sort as string) || 'new';
  const type = (searchParams.type as "all" | "image" | "video") || "all";

  const { memes, total } = await getMemesByPage(currentPage, sort, type);

  return (
    <main>
      <NavigationTabs totalMemes={total} perPage={MEMES_PER_PAGE} />
      <Suspense fallback={<div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
      </div>}>
        <MemeClientWrapper 
          initialMemes={memes} 
          initialTotal={total} 
          sort={sort} 
          type={type} 
        />
      </Suspense>
    </main>
  );
}