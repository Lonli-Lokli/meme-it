import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";

let isInitialized = false;

export async function initializeServer() {
  if (isInitialized) return;
  
  try {
    // Initialize Firebase Admin if not already initialized
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.NEXT_FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.NEXT_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }

    const adminDb = getFirestore();
    
    // First check if stats exist
    const statsDoc = await adminDb.doc('stats/memes').get();
    
    if (!statsDoc.exists) {
      // Only count if stats don't exist
      const memesRef = adminDb.collection('memes');
      const snapshot = await memesRef.get();
      const totalMemes = snapshot.size;

      await adminDb.doc('stats/memes').set({
        totalMemes,
        lastUpdated: new Date()
      });

      console.log(`Stats initialized with ${totalMemes} memes`);
    }

    isInitialized = true;
  } catch (error) {
    console.error('Error initializing server:', error);
  }
} 