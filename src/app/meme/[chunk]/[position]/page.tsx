import { notFound } from "next/navigation";
import { getMemeByChunkAndPosition } from "@/lib/firebase-utils";
import { MemeCard } from "@/components/meme/MemeCard";
import { DeleteMemeDialog } from "@/components/meme/DeleteMemeDialog";
import { Metadata } from "next";
import { VALID_SORTS, VALID_TYPES, ValidSort, ValidType } from "@/types";
import { NavigationLoadingOverlay } from "@/components/navigation/NavigationLoadingOverlay";

interface MemePageProps {
  params: Promise<{
    chunk: string;
    position: string;
  }>;
  searchParams: Promise<{
    type?: "all" | "image" | "video";
    sort?: "new" | "top" | "random";
  }>;
}

export async function generateMetadata({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: MemePageProps): Promise<Metadata> {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;

  const meme = await getMemeByChunkAndPosition(
    params.chunk,
    parseInt(params.position)
  );

  if (!meme) {
    return {
      title: "Meme not found",
    };
  }

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/${params.chunk}/${
    params.position
  }?type=${searchParams.type || "all"}&sort=${searchParams.sort || "new"}`;
  const title = meme.title || `Meme #${params.chunk}-${params.position}`;
  const description = `Check out this amazing ${meme.fileType} meme on Meme It!`;

  const imageUrl =
    meme.fileType === "video"
      ? meme.thumbnailUrl || meme.fileUrl
      : meme.fileUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: meme.fileType === "video" ? "video.other" : "article",
      images: [
        {
          url: imageUrl,
          width: meme.width || 1200,
          height: meme.height || 630,
          alt: title,
        },
      ],
      videos:
        meme.fileType === "video"
          ? [
              {
                url: meme.fileUrl,
                width: meme.width || 1280,
                height: meme.height || 720,
                type: "video/mp4",
              },
            ]
          : undefined,
    },
    twitter: {
      card: meme.fileType === "video" ? "player" : "summary_large_image",
      images: [imageUrl],
    },
  };
}

export default async function MemePage({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: MemePageProps) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;

  const meme = await getMemeByChunkAndPosition(
    params.chunk,
    parseInt(params.position)
  );

  if (!meme) {
    notFound();
  }

  const sort = VALID_SORTS.includes(searchParams.sort as ValidSort) 
    ? searchParams.sort ?? 'new' 
    : "new";
  const type = VALID_TYPES.includes(searchParams.type as ValidType)
    ? searchParams.type ?? 'all'
    : "all";

  return (
    <div className="fixed inset-0">
      <NavigationLoadingOverlay />
      <MemeCard
        meme={meme}
        isDetailView
        currentSort={sort}
        currentType={type}
      />
      <DeleteMemeDialog />
    </div>
  );
}
