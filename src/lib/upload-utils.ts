import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db, auth } from "./firebase";
import { getMemeType } from "./firebase-utils";

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB in bytes
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "video/mp4"];

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

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File size exceeds 30MB limit");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      "Invalid file type. Only JPEG, PNG, GIF, and MP4 are allowed"
    );
  }

  try {
    const fileExtension = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExtension}`;
    const storageRef = ref(storage, `memes/${fileName}`);

    // Upload file
    await uploadBytes(storageRef, file);
    const fileUrl = await getDownloadURL(storageRef);

    let videoMetadata = undefined;
    if (getMemeType(file.name) === "video") {
      try {
        videoMetadata = await getVideoMetadata(file);
      } catch (error) {
        console.error("Failed to get video duration:", error);
      }
    }

    // Create Firestore record
    const memeData = {
      fileUrl,
      fileType: getMemeType(file.name),
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser?.uid || null,
      type: getMemeType(file.name),
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
