import { 
    collection, 
    getDocs, 
    query, 
    orderBy, 
    limit, 
    startAfter,
    DocumentData,
    QueryDocumentSnapshot
  } from 'firebase/firestore';
  import { db } from './firebase';
  import type { Meme } from '@/types';
  
  const MEMES_PER_PAGE = 12;
  
  export async function getMemes(
    lastMeme?: QueryDocumentSnapshot<DocumentData>
  ): Promise<{
    memes: Meme[];
    lastMeme: QueryDocumentSnapshot<DocumentData> | undefined;
    hasMore: boolean;
  }> {
    try {
      const memesRef = collection(db, 'memes');
      let q = query(
        memesRef,
        orderBy('createdAt', 'desc'),
        limit(MEMES_PER_PAGE + 1)
      );
  
      if (lastMeme) {
        q = query(
          memesRef,
          orderBy('createdAt', 'desc'),
          startAfter(lastMeme),
          limit(MEMES_PER_PAGE + 1)
        );
      }
  
      const snapshot = await getDocs(q);
      const memes = snapshot.docs.slice(0, MEMES_PER_PAGE).map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Meme[];
  
      const hasMore = snapshot.docs.length > MEMES_PER_PAGE;
      const lastVisible = snapshot.docs[MEMES_PER_PAGE - 1];
  
      return {
        memes,
        lastMeme: lastVisible,
        hasMore
      };
    } catch (error) {
      console.error('Error fetching memes:', error);
      return {
        memes: [],
        lastMeme: undefined,
        hasMore: false
      };
    }
  }