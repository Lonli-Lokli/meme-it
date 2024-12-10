'use client';

import Link from 'next/link';
import { Plus, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { signInWithGoogle, signOut } from '@/lib/auth-utils';
import { useToast } from '@/components/ui/use-toast';
import { Logo } from '@/components/ui/logo';

export function Header() {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      toast({
        title: "Sign Out Error",
        description: error.message
      });
    }
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-75 transition-opacity">
          <Logo />
          <span className="text-lg font-medium">Meme It!</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <a 
            href="https://www.buymeacoffee.com/lonlilokliV" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-2">
              <Coffee className="h-4 w-4" />
              <span>Buy me a coffee</span>
            </Button>
          </a>
          {!loading && (
            user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">
                  {user.email}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
            )
          )}
          
          <Link href="/upload" className="shrink-0">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Plus className="h-4 w-4" />
              <span className="sr-only">Upload Meme</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}