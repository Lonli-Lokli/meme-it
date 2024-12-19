import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
  writeBatch,
  increment,
  where,
  QueryConstraint,
  serverTimestamp,
  setDoc,
  startAfter,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Meme, ValidSort, ValidType, Vote, VoteType } from "@/types";
import { auth } from "./firebase";

interface BaseChunkInfo {
  count: number;
  isFull: boolean;
  startTimestamp: Date;
  endTimestamp: Date | null;
}

interface ChunkInfo extends BaseChunkInfo {
  id: string; // Required for existing chunks
}

const MEMES_PER_PAGE = 12;
const CHUNK_SIZE = 1000; // Number of memes per chunk

export async function getMemesByPage(
  page: number = 1,
  sort: string = "new",
  type: "all" | "image" | "video" = "all"
): Promise<{ memes: Meme[]; total: number; hasMore: boolean }> {
  try {

    const memesRef = collection(db, "memes").withConverter<Meme>({
      fromFirestore: (snap) => ({ id: snap.id, ...snap.data() } as Meme),
      toFirestore: (meme) => ({ ...meme }),
    });

    const chunksRef = collection(db, "chunks").withConverter<ChunkInfo>({
      fromFirestore: (snap) => ({ id: snap.id, ...snap.data() } as ChunkInfo),
      toFirestore: (chunk) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = chunk;
        return rest;
      },
    });

    const chunksQuery = query(chunksRef, orderBy("startTimestamp", "desc"));
    const chunksSnapshot = await getDocs(chunksQuery);
    const chunks = chunksSnapshot.docs.map((doc) => doc.data());

    let baseQuery = query(
      memesRef,
      where("chunkId", "==", "1"),
      orderBy("position", "desc")
    );

    if (type !== "all") {
      baseQuery = query(baseQuery, where("type", "==", type));
    }

    // Apply limit after all filters
    baseQuery = query(baseQuery, limit(MEMES_PER_PAGE));

    if (sort === "top") {
      baseQuery = query(
        memesRef,
        where("chunkId", "==", "1"),
        orderBy("upvotes", "desc"),
        limit(MEMES_PER_PAGE)
      );
    }

    // Add offset based on page number
    if (page > 1) {
      const prevPageSnapshot = await getDocs(
        query(
          memesRef,
          where("chunkId", "==", "1"),
          orderBy("position", "desc"),
          limit((page - 1) * MEMES_PER_PAGE)
        )
      );
      const lastVisible = prevPageSnapshot.docs[prevPageSnapshot.docs.length - 1];
      baseQuery = query(baseQuery, startAfter(lastVisible));
    }

    const querySnapshot = await getDocs(baseQuery);
    const memes = querySnapshot.docs.map((doc) => doc.data());

    const total = chunks.reduce((acc, chunk) => acc + chunk.count, 0);

    return {
      memes,
      total,
      hasMore: page * MEMES_PER_PAGE < total,
    };
  } catch (error) {
    console.error("Error fetching memes:", error);
    return { memes: [], total: 0, hasMore: false };
  }
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
  const extension = fileUrl.split(".").pop()?.toLowerCase() || "";
  return ["mp4", "webm", "ogg"].includes(extension) ? "video" : "image";
}

// Migration function
export async function updateMemeTypes() {
  const memesRef = collection(db, "memes");
  const snapshot = await getDocs(memesRef);

  const batch = writeBatch(db);

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (!data.type) {
      batch.update(doc.ref, {
        type: getMemeType(data.fileUrl),
      });
    }
  });

  await batch.commit();
  console.log("Migration completed");
}

export async function fixMemeTypes() {
  const memesRef = collection(db, "memes");
  const snapshot = await getDocs(memesRef);

  const batch = writeBatch(db);
  let updateCount = 0;

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const correctType = getMemeType(data.fileUrl);

    if (data.type !== correctType) {
      batch.update(doc.ref, {
        type: correctType,
      });
      updateCount++;
    }
  });

  if (updateCount > 0) {
    await batch.commit();
    console.log(`Updated ${updateCount} documents`);
  } else {
    console.log("No documents needed updating");
  }
}

export async function getMemeById(id: string): Promise<Meme | null> {
  try {
    const memeRef = doc(db, "memes", id).withConverter<Meme>({
      fromFirestore: (snap) => ({ id: snap.id, ...snap.data() } as Meme),
      toFirestore: (meme) => ({ ...meme }),
    });

    const memeSnap = await getDoc(memeRef);

    if (!memeSnap.exists()) {
      return null;
    }

    return memeSnap.data();
  } catch (error) {
    console.error("Error fetching meme:", error);
    return null;
  }
}

export async function getAdjacentMemes(
  memeId: string,
  sort: ValidSort = "new",
  type: ValidType = "all"
): Promise<{ prev: Meme | null; next: Meme | null }> {
  try {
    const currentMeme = await getMemeById(memeId);
    if (!currentMeme) return { prev: null, next: null };

    const memesRef = collection(db, "memes").withConverter<Meme>({
      fromFirestore: (snap) => ({ id: snap.id, ...snap.data() } as Meme),
      toFirestore: (meme) => ({ ...meme }),
    });

    if (sort === "new") {
      // Get adjacent memes within the same chunk
      const [prevQuery, nextQuery] = [
        query(
          memesRef,
          where("chunkId", "==", currentMeme.chunkId),
          where("position", ">", currentMeme.position),
          orderBy("position"),
          limit(1)
        ),
        query(
          memesRef,
          where("chunkId", "==", currentMeme.chunkId),
          where("position", "<", currentMeme.position),
          orderBy("position", "desc"),
          limit(1)
        ),
      ];

      const [prevDocs, nextDocs] = await Promise.all([
        getDocs(prevQuery),
        getDocs(nextQuery),
      ]);

      let prev = prevDocs.docs[0]?.data() || null;
      let next = nextDocs.docs[0]?.data() || null;

      // If no prev/next in current chunk, check adjacent chunks
      if (!prev || !next) {
        const chunksRef = collection(db, "chunks");
        const chunksQuery = query(
          chunksRef,
          orderBy("startTimestamp", "desc")
        );
        const chunksSnapshot = await getDocs(chunksQuery);
        const chunks = chunksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const currentChunkIndex = chunks.findIndex(
          (chunk) => chunk.id === currentMeme.chunkId
        );

        if (!prev && currentChunkIndex > 0) {
          const prevChunkQuery = query(
            memesRef,
            where("chunkId", "==", chunks[currentChunkIndex - 1].id),
            orderBy("position", "asc"),
            limit(1)
          );
          const prevChunkDocs = await getDocs(prevChunkQuery);
          prev = prevChunkDocs.docs[0]?.data() || null;
        }

        if (!next && currentChunkIndex < chunks.length - 1) {
          const nextChunkQuery = query(
            memesRef,
            where("chunkId", "==", chunks[currentChunkIndex + 1].id),
            orderBy("position", "desc"),
            limit(1)
          );
          const nextChunkDocs = await getDocs(nextChunkQuery);
          next = nextChunkDocs.docs[0]?.data() || null;
        }
      }

      return { prev, next };
    } else {
      // For vote-based sorting, use the existing implementation
      const sortField = "upvotes";
      const sortValue = currentMeme[sortField];

      const constraints: QueryConstraint[] = [orderBy(sortField, "desc")];
      if (type !== "all") {
        constraints.push(where("type", "==", type));
      }

      const [prevQuery, nextQuery] = [
        query(
          memesRef,
          ...constraints,
          where(sortField, ">", sortValue),
          limit(1)
        ),
        query(
          memesRef,
          ...constraints,
          where(sortField, "<", sortValue),
          limit(1)
        ),
      ];

      const [prevDocs, nextDocs] = await Promise.all([
        getDocs(prevQuery),
        getDocs(nextQuery),
      ]);

      return {
        prev: prevDocs.docs[0]?.data() || null,
        next: nextDocs.docs[0]?.data() || null,
      };
    }
  } catch (error) {
    console.error("Error fetching adjacent memes:", error);
    return { prev: null, next: null };
  }
}

export async function getActiveChunk(type: "all" | "image" | "video"): Promise<ChunkInfo> {
  const chunksRef = collection(db, "chunks");
  const activeChunkQuery = query(
    chunksRef,
    where("type", "==", type),
    where("isFull", "==", false),
    orderBy("startTimestamp", "desc"),
    limit(1)
  );

  const activeChunkDocs = await getDocs(activeChunkQuery);
  const activeChunk = activeChunkDocs.docs[0];
  
  if (!activeChunk) {
    // Create a new chunk if none exists
    const newChunkRef = doc(chunksRef);
    const newChunk: BaseChunkInfo = {
      count: 0,
      isFull: false,
      startTimestamp: new Date(),
      endTimestamp: null,
    };
    
    await writeBatch(db).set(newChunkRef, newChunk).commit();
    return { id: newChunkRef.id, ...newChunk };
  }

  return { id: activeChunk.id, ...activeChunk.data() } as ChunkInfo;
}

export async function updateChunkCount(
  chunkId: string,
  increment: number
): Promise<void> {
  const chunkRef = doc(db, "chunks", chunkId);
  const chunkDoc = await getDoc(chunkRef);
  const currentCount = chunkDoc.data()?.count || 0;
  const newCount = currentCount + increment;

  const batch = writeBatch(db);
  batch.update(chunkRef, {
    count: newCount,
    isFull: newCount >= CHUNK_SIZE,
    endTimestamp: newCount >= CHUNK_SIZE ? new Date() : null,
  });

  await batch.commit();
}

export async function migrateMemesToChunks() {
  try {
    const memesRef = collection(db, "memes");
    const memesSnapshot = await getDocs(query(memesRef, orderBy("createdAt")));
    const memes = memesSnapshot.docs;

    let currentChunk: ChunkInfo | null = null;
    let batch = writeBatch(db);
    let batchCount = 0;
    const MAX_BATCH_SIZE = 500;

    for (const memeDoc of memes) {
      const meme = memeDoc.data();

      // Skip if already has chunk info
      if (meme.chunkId && typeof meme.position === "number") continue;

      // Get or create chunk if needed
      if (!currentChunk || currentChunk.count >= CHUNK_SIZE) {
        if (currentChunk && currentChunk.id) {
          // Update previous chunk as full
          batch.update(doc(db, "chunks", currentChunk.id), {
            isFull: true,
            endTimestamp: new Date(),
          });
        }
        currentChunk = await getActiveChunk(meme.type);
      }

      // Update meme with chunk info
      batch.update(memeDoc.ref, {
        chunkId: currentChunk.id,
        position: currentChunk.count,
      });

      // Update chunk count
      currentChunk.count++;
      batchCount++;

      // Commit batch if it's full
      if (batchCount >= MAX_BATCH_SIZE) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;

        // Update chunk count in database
        await updateChunkCount(currentChunk.id, MAX_BATCH_SIZE);
      }
    }

    // Commit any remaining updates
    if (batchCount > 0) {
      await batch.commit();
      if (currentChunk) {
        await updateChunkCount(currentChunk.id, batchCount);
      }
    }

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}


// Vote-related functions
export async function getVote(memeId: string, userId: string): Promise<Vote | null> {
  if (!userId) return null;

  const votesRef = collection(db, "votes");
  const q = query(
    votesRef,
    where("memeId", "==", memeId),
    where("userId", "==", userId),
    limit(1)
  );

  const snapshot = await getDocs(q);
  const vote = snapshot.docs[0];
  return vote ? { id: vote.id, ...vote.data() } as Vote : null;
}

export async function addVote(memeId: string, type: VoteType): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Must be logged in to vote");

  const votesRef = collection(db, "votes");
  const existingVote = await getVote(memeId, userId);

  const batch = writeBatch(db);
  const memeRef = doc(db, "memes", memeId);

  if (existingVote) {
    if (existingVote.type === type) {
      // Remove vote if clicking same button
      batch.delete(doc(db, "votes", existingVote.id));
      batch.update(memeRef, {
        [`${type}s`]: increment(-1),
        netVotes: type === 'upvote' ? increment(-1) : increment(1),
        totalVotes: increment(-1)
      });
    } else {
      // Change vote type
      batch.update(doc(db, "votes", existingVote.id), {
        type,
        createdAt: serverTimestamp()
      });
      batch.update(memeRef, {
        [`${type}s`]: increment(1),
        [`${existingVote.type}s`]: increment(-1),
        netVotes: type === 'upvote' ? increment(2) : increment(-2), // Swing of 2 when changing vote type
        // totalVotes stays the same when changing vote type
      });
    }
  } else {
    // Add new vote
    const voteRef = doc(votesRef);
    batch.set(voteRef, {
      userId,
      memeId,
      type,
      createdAt: serverTimestamp()
    });
    batch.update(memeRef, {
      [`${type}s`]: increment(1),
      netVotes: type === 'upvote' ? increment(1) : increment(-1),
      totalVotes: increment(1)
    });
  }

  await batch.commit();
}

export async function getMemeByChunkAndPosition(chunk: string, position: number): Promise<Meme | null> {
  const memesRef = collection(db, "memes");
  const q = query(
    memesRef,
    where("chunkId", "==", chunk),
    where("position", "==", position),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  const doc = snapshot.docs[0];
  
  return doc ? { id: doc.id, ...doc.data() } as Meme : null;
}

export async function migrateToNumericChunks() {
  const chunksRef = collection(db, "chunks");
  const memesRef = collection(db, "memes");
  
  // Create new chunk with ID "1"
  await setDoc(doc(chunksRef, "1"), {
    count: 0,
    isFull: false,
    startTimestamp: new Date(),
    endTimestamp: null
  });

  // Get all memes sorted by createdAt
  const memesSnapshot = await getDocs(query(memesRef, orderBy("createdAt")));
  const batch = writeBatch(db);
  let position = 0;
  
  memesSnapshot.docs.forEach(meme => {
    batch.update(meme.ref, { 
      chunkId: "1",
      position: position++
    });
  });

  // Update chunk count
  batch.update(doc(chunksRef, "1"), { count: position });
  
  await batch.commit();
}

export async function migrateVoteFields() {
  const memesRef = collection(db, "memes");
  const snapshot = await getDocs(memesRef);
  
  const batch = writeBatch(db);
  let count = 0;
  
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const upvotes = data.upvotes || 0;
    const downvotes = data.downvotes || 0;
    
    batch.update(doc.ref, {
      netVotes: upvotes - downvotes,
      totalVotes: upvotes + downvotes
    });
    
    count++;
    
    // Firebase has a limit of 500 operations per batch
    if (count >= 500) {
      batch.commit();
      count = 0;
    }
  });
  
  if (count > 0) {
    await batch.commit();
  }
  
  console.log("Vote fields migration completed");
}
