import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  doc,
  getDoc,
  writeBatch,
  increment,
  where,
  Query,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Meme, MemeUser } from "@/types";

const MEMES_PER_PAGE = 12;

// Store cursors for each page
const PAGE_CURSORS = new Map<number, any>();

export function getMemeQuery(type: "all" | "image" | "video" = "all", limitCount = 20): Query<Meme> {
  const memesRef = collection(db, "memes").withConverter<Meme>({
    fromFirestore: (snap) => ({ id: snap.id, ...snap.data() } as Meme),
    toFirestore: (meme) => ({ ...meme })
  });
  
  const baseQuery = query(
    memesRef,
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  if (type === "all") return baseQuery;
  
  return query(
    baseQuery,
    where("type", "==", type)
  );
}

export async function getMemesByPage(
  page: number = 1,
  sort: string = "new",
  type: "all" | "image" | "video" = "all"
): Promise<{ memes: Meme[]; total: number; hasMore: boolean }> {
  try {
    const memesRef = collection(db, "memes").withConverter<Meme>({
      fromFirestore: (snap) => ({ id: snap.id, ...snap.data() } as Meme),
      toFirestore: (meme) => ({ ...meme })
    });

    let baseQuery = query(
      memesRef,
      orderBy(sort === "new" ? "createdAt" : "upvotes", "desc"),
      limit(MEMES_PER_PAGE)
    );

    // Add type filter if not "all"
    if (type !== "all") {
      baseQuery = query(baseQuery, where("type", "==", type));
    }

    let querySnapshot;
    if (page === 1) {
      querySnapshot = await getDocs(baseQuery);

      PAGE_CURSORS.clear();
    } else {
      const cursor = PAGE_CURSORS.get(page - 1);
      if (!cursor) {
        throw new Error("Invalid page");
      }
      querySnapshot = await getDocs(
        query(baseQuery, startAfter(cursor))
      );
    }

    // Store the last document as cursor for next page
    if (querySnapshot.docs.length > 0) {
      PAGE_CURSORS.set(page, querySnapshot.docs[querySnapshot.docs.length - 1]);
    }

    const memes = querySnapshot.docs.map((doc) => doc.data()) as Meme[];

    // Get total count
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

export async function deleteMeme(memeId: string) {
  try {
    const memeRef = doc(db, "memes", memeId);
    const memeDoc = await getDoc(memeRef);
    
    if (!memeDoc.exists()) {
      throw new Error("Meme not found");
    }

    const batch = writeBatch(db);
    batch.delete(memeRef);
    
    // Update total count
    batch.set(
      doc(db, "stats", "memes"),
      { totalMemes: increment(-1) },
      { merge: true }
    );

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error deleting meme:", error);
    throw new Error("Failed to delete meme");
  }
}

export function getMemeType(fileUrl: string): "image" | "video" {
  // Extract the actual filename from the Firebase Storage URL
  const filename = fileUrl.split('?')[0]  // Remove query parameters
    .split('/').pop()  // Get the last part of the path
    ?.split('%2F').pop()  // Handle URL-encoded forward slashes
    ?? '';
  
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension && ['mp4', 'webm', 'ogg', 'ogv'].includes(extension) ? 'video' : 'image';
}

// Migration function
export async function updateMemeTypes() {
  const memesRef = collection(db, "memes");
  const snapshot = await getDocs(memesRef);
  
  const batch = writeBatch(db);
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (!data.type) {
      batch.update(doc.ref, {
        type: getMemeType(data.fileUrl)
      });
    }
  });
  
  await batch.commit();
  console.log('Migration completed');
}

export async function fixMemeTypes() {
  const memesRef = collection(db, "memes");
  const snapshot = await getDocs(memesRef);
  
  const batch = writeBatch(db);
  let updateCount = 0;
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const correctType = getMemeType(data.fileUrl);
    
    if (data.type !== correctType) {
      batch.update(doc.ref, {
        type: correctType
      });
      updateCount++;
    }
  });
  
  if (updateCount > 0) {
    await batch.commit();
    console.log(`Updated ${updateCount} documents`);
  } else {
    console.log('No documents needed updating');
  }
}