// src/lib/upload-utils.ts
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, db } from './firebase';
import type { CreateMemeInput } from '@/types';

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB in bytes
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];

export async function uploadMeme(file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 30MB limit');
  }
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF, and MP4 are allowed');
  }

  // Create unique filename
  const fileExtension = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExtension}`;
  const storageRef = ref(storage, `memes/${fileName}`);

  // Upload file
  await uploadBytes(storageRef, file);
  const fileUrl = await getDownloadURL(storageRef);

  // Create Firestore record
  const memeData: CreateMemeInput = {
    fileUrl,
    fileType: file.type.startsWith('image/') ? 'image' : 'video',
    createdAt: new Date().toISOString(),
    createdBy: null,
  };

  const docRef = await addDoc(collection(db, 'memes'), memeData);
  return docRef.id;
}