"use client";

import { useAuth } from "@/context/auth-context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SignInDialog } from "@/components/auth/SignInDialog";

export function UserMenu() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [showSignInDialog, setShowSignInDialog] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      toast({
        title: "Sign Out Error",
        description: error.message,
      });
    }
  };

  if (loading) return null;

  if (!user) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSignInDialog(true)}
        >
          Sign In
        </Button>
        <SignInDialog
          open={showSignInDialog}
          onOpenChange={setShowSignInDialog}
        />
      </>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar
            src={user.photoURL}
            size="sm"
            className="cursor-pointer md:hover:ring-2 ring-offset-2 ring-offset-background transition-all"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48" align="end">
        <div className="flex flex-col gap-2">
          <div className="border-b pb-2">
            <p className="text-sm font-medium">{user.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start text-sm font-normal"
          >
            Sign Out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
