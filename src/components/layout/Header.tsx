'use client';

import Link from 'next/link';
import { Plus, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { signInWithGoogle, signOut } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
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
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="flex h-12 items-center px-4">
        <Link href="/" className="flex items-center gap-2 mr-4">
          <Logo />
          <span className="text-lg font-medium hidden md:inline">Meme It!</span>
        </Link>
        
        <div className="flex-1" />
        
        <div className="flex items-center gap-2">
          <a 
            href="https://www.buymeacoffee.com/yourusername" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden md:inline-flex"
          >
            <Button variant="outline" size="sm" className="gap-2">
              <Coffee className="h-4 w-4" />
              <span>Buy me a coffee</span>
            </Button>
          </a>
          
          {!loading && (
            user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 hidden md:inline">
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
          
          {/* Upload button for desktop */}
          <Link href="/upload" className="hidden md:inline-flex">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Plus className="h-4 w-4" />
              <span className="sr-only">Upload Meme</span>
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Mobile upload button */}
      <Link 
        href="/upload" 
        className="md:hidden fixed bottom-4 right-4 z-50"
      >
        <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
          <Plus className="h-6 w-6" />
          <span className="sr-only">Upload Meme</span>
        </Button>
      </Link>
    </header>
  );
}