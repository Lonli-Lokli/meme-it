import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Meme, MemeUser, UserRole } from "@/types";

const MEMES_PER_PAGE = 12;

// Store cursors for each page
const PAGE_CURSORS = new Map<number, any>();

export async function getMemesByPage(
  page: number = 1,
  sort: string = "new"
): Promise<{ memes: Meme[]; total: number; hasMore: boolean }> {
  try {
    const memesRef = collection(db, "memes");
    const sortField = sort === "new" ? "createdAt" : "upvotes";

    let querySnapshot;

    if (page === 1) {
      // First page - simple query
      const q = query(
        memesRef,
        orderBy(sortField, "desc"),
        limit(MEMES_PER_PAGE)
      );
      querySnapshot = await getDocs(q);

      // Store cursor for page 2
      if (querySnapshot.docs.length > 0) {
        PAGE_CURSORS.set(2, querySnapshot.docs[querySnapshot.docs.length - 1]);
      }
    } else {
      // Get the cursor for this page
      let cursor = PAGE_CURSORS.get(page);

      if (!cursor) {
        // If we don't have a cursor, get the previous page's cursor
        const prevQ = query(
          memesRef,
          orderBy(sortField, "desc"),
          limit((page - 1) * MEMES_PER_PAGE)
        );
        const prevSnapshot = await getDocs(prevQ);
        cursor = prevSnapshot.docs[prevSnapshot.docs.length - 1];
      }

      const q = query(
        memesRef,
        orderBy(sortField, "desc"),
        startAfter(cursor),
        limit(MEMES_PER_PAGE)
      );
      querySnapshot = await getDocs(q);

      // Store cursor for next page
      if (querySnapshot.docs.length > 0) {
        PAGE_CURSORS.set(
          page + 1,
          querySnapshot.docs[querySnapshot.docs.length - 1]
        );
      }
    }

    const memes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Meme[];

    // Get total count from a separate collection or cached value
    const statsDoc = await getDocs(collection(db, "stats"));
    const total = statsDoc.docs[0]?.data()?.totalMemes || 0;

    return {
      memes,
      total,
      hasMore: total > page * MEMES_PER_PAGE,
    };
  } catch (error) {
    console.error("Error fetching memes:", error);
    return { memes: [], total: 0, hasMore: false };
  }
}

export function isAdmin(user: MemeUser | null): boolean {
  return user?.role === 'admin' || user?.role === 'owner';
}

