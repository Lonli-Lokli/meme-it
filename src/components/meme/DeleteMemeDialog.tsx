"use client";

import { useDeleteDialog } from '@/context/delete-dialog-context';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteMeme } from '@/lib/firebase-utils';
import { createRelativeMemeUrl } from '@/lib/utils';

export function DeleteMemeDialog() {
  const { memeToDelete, setMemeToDelete } = useDeleteDialog();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!memeToDelete) return;
    
    try {
      await deleteMeme(memeToDelete.id);
      toast({
        description: "Meme deleted successfully",
      });
      setMemeToDelete(null);
      // Redirect if we're on the detail page
      if (window.location.pathname === createRelativeMemeUrl(memeToDelete)) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        description: "Failed to delete meme",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog 
      open={!!memeToDelete} 
      onOpenChange={(open) => !open && setMemeToDelete(null)}
    >
      <DialogContent onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Delete Meme</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this meme? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setMemeToDelete(null)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 