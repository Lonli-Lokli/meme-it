"use client";

import { createContext, useContext, useState } from 'react';
import type { Meme } from '@/types';

interface DeleteDialogContextType {
  memeToDelete: Meme | null;
  setMemeToDelete: (meme: Meme | null) => void;
}

const DeleteDialogContext = createContext<DeleteDialogContextType | null>(null);

export function DeleteDialogProvider({ children }: { children: React.ReactNode }) {
  const [memeToDelete, setMemeToDelete] = useState<Meme | null>(null);

  return (
    <DeleteDialogContext.Provider value={{ memeToDelete, setMemeToDelete }}>
      {children}
    </DeleteDialogContext.Provider>
  );
}

export function useDeleteDialog() {
  const context = useContext(DeleteDialogContext);
  if (!context) {
    throw new Error('useDeleteDialog must be used within a DeleteDialogProvider');
  }
  return context;
} 