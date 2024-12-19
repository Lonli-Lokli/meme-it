import { redirect } from "next/navigation";
import { getMemesByPage } from "@/lib/firebase-utils";
import { NavigationTabs } from "@/components/navigation/NavigationTabs";
import { MemeGrid } from "@/components/meme/MemeGrid";
import { VALID_SORTS, VALID_TYPES, ValidSort, ValidType } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    type?: string;
  }>;
}

export default async function Page({ searchParams: args }: PageProps) {
  const { page, sort, type } = await args;

  if (
    !sort ||
    !VALID_SORTS.includes(sort as ValidSort) ||
    !type ||
    !VALID_TYPES.includes(type as ValidType)
  ) {
    redirect("/?sort=new&type=all");
  }

  const pageNumber = Number(page) || 1;
  const sortType = sort as ValidSort;
  const typeFilter = type as ValidType;

  const { total } = await getMemesByPage(1, sortType, typeFilter);
  const totalPages = Math.ceil(total / 12);

  if (pageNumber < 1 || pageNumber > totalPages || !Number.isInteger(pageNumber)) {
    redirect(`/?sort=${sortType}&type=${typeFilter}&page=1`);
  }

  const { memes, hasMore } = await getMemesByPage(
    pageNumber,
    sortType,
    typeFilter
  );

  return (
    <main className="container py-6 max-w-[2000px] mx-auto">
      <NavigationTabs
        totalMemes={total}
        perPage={12}
        currentSort={sortType}
        currentType={typeFilter}
      />
      <MemeGrid memes={memes} currentSort={sortType} currentType={typeFilter} />
      {hasMore && (
        <div className="text-center py-8">
          <Link
            href={`/?sort=${sortType}&type=${typeFilter}&page=${
              pageNumber + 1
            }`}
          >
            <Button variant="outline">Load More</Button>
          </Link>
        </div>
      )}
    </main>
  );
}
