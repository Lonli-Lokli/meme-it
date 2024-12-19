"use client";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignInDialog } from "@/components/auth/SignInDialog";
import { UploadButton } from "./UploadButton";
import { UserMenu } from "./UserMenu";
import { BuyMeACoffee } from "./BuyMeACoffee";
import { useState } from "react";

export function Header() {
  const [showSignInDialog, setShowSignInDialog] = useState(false);
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
            <BuyMeACoffee />
            <UploadButton />

            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <SignInDialog open={showSignInDialog} onOpenChange={setShowSignInDialog} />
    </>
  );
}
