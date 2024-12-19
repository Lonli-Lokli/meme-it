import { getMemeById } from "@/lib/firebase-utils";
import { notFound, redirect } from "next/navigation";
import { createRelativeMemeUrl } from "@/lib/utils";

interface Props {
  params: Promise<{ chunk: string }>;
}

export default async function MemePage({ params }: Props) {
  const searchParams = await params;
  const meme = await getMemeById(searchParams.chunk); // we might have old mem urls

  if (!meme) {
    notFound();
  }

  redirect(createRelativeMemeUrl(meme));
}
