import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db, auth } from "./firebase";
import { getMemeType } from "./firebase-utils";

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB in bytes
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "video/mp4"];

export function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`;
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Unsupported file type: ${file.type}`;
  }
  return null;
}

async function getVideoMetadata(
  file: File
): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      });
      window.URL.revokeObjectURL(video.src);
    };
    video.onerror = reject;
    video.src = URL.createObjectURL(file);
  });
}

export async function uploadMeme(file: File): Promise<string> {
  if (!file) {
    throw new Error("No file provided");
  }

  const error = validateFile(file);
  if (error) {
    throw new Error(error);
  }

  try {
    const fileExtension = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExtension}`;
    const storageRef = ref(storage, `memes/${fileName}`);

    await uploadBytes(storageRef, file);
    const fileUrl = await getDownloadURL(storageRef);
    const type = getMemeType(file.name);

    let videoMetadata = undefined;
    if (type === "video") {
      try {
        videoMetadata = await getVideoMetadata(file);
      } catch (error) {
        console.error("Failed to get video metadata:", error);
      }
    }

    const memeData = {
      fileUrl,
      type: getMemeType(file.name),
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser?.uid || null,
      ...(videoMetadata && {
        duration: videoMetadata.duration,
        width: videoMetadata.width,
        height: videoMetadata.height,
      }),
    };

    const docRef = await addDoc(collection(db, "memes"), memeData);
    return docRef.id;
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error("Failed to upload file. Please try again.");
  }
}
