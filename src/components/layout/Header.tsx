"use client";

import Link from "next/link";
import { Plus, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { signOut } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignInDialog } from "@/components/auth/SignInDialog";
import { Avatar } from "@/components/ui/avatar";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function Header() {
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

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="flex h-12 items-center px-4">
          <Link href="/" className="flex items-center gap-2 mr-4">
            <Logo />
            <span className="text-lg font-medium hidden md:inline text-foreground">
              Meme It!
            </span>
          </Link>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href="https://www.buymeacoffee.com/LonliLokliV"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex"
            >
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hover:text-foreground"
              >
                <Coffee className="h-4 w-4" />
                <span className="text-muted-foreground">Buy me a coffee</span>
              </Button>
            </a>

            {!loading &&
              (user ? (
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger>
                      <Avatar 
                        src={user.photoURL} 
                        size="sm"
                        className="cursor-pointer md:hover:ring-2 ring-offset-2 ring-offset-background transition-all"
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2">
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
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSignInDialog(true)}
                  className="gap-2 hover:text-foreground"
                >
                  <span>Sign In</span>
                </Button>
              ))}

            {/* Upload button for desktop */}
            <Link href="/upload" className="hidden md:inline-flex">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Upload Meme</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile upload button */}
        <Link href="/upload" className="md:hidden fixed bottom-4 right-4 z-50">
          <Button 
            variant="outline"
            size="icon" 
            className="h-12 w-12 rounded-full shadow-lg bg-background hover:bg-primary hover:text-primary-foreground"
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">Upload Meme</span>
          </Button>
        </Link>
      </header>

      <SignInDialog
        open={showSignInDialog}
        onOpenChange={setShowSignInDialog}
      />
    </>
  );
}
