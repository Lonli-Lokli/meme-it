import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { notFound, redirect } from "next/navigation";
import { type Meme } from "@/types";
import { createRelativeMemeUrl } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MemePage({ params }: Props) {
  const searchParams = await params;
  const memeRef = doc(db, "memes", searchParams.id);
  const memeSnap = await getDoc(memeRef);

  if (!memeSnap.exists()) {
    notFound();
  }

  const meme = {
    id: memeSnap.id,
    ...memeSnap.data(),
  } as Meme;

  redirect(createRelativeMemeUrl(meme));
}
