"use client";

import { Meme } from "@/types";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { deleteMeme } from "@/lib/firebase-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface DeleteMemeButtonProps {
  meme: Meme;
}

export function DeleteMemeButton({ meme }: DeleteMemeButtonProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const canDelete =
    user &&
    (user.role === "admin" ||
      user.role === "owner" ||
      user.uid === meme.authorId);

  const handleDelete = async () => {
    if (!canDelete) return;
    await deleteMeme(meme.id);
    setIsOpen(false);
  };

  if (!canDelete) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Meme</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this meme? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
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
