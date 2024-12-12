"use client";

import { DeleteDialogProvider } from '@/context/delete-dialog-context';
import { DeleteMemeDialog } from '@/components/meme/DeleteMemeDialog';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DeleteDialogProvider>
      {children}
      <DeleteMemeDialog />
    </DeleteDialogProvider>
  );
} 