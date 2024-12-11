import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { sendLoginLink, signInWithGoogle } from "@/lib/auth-utils";

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignInDialog({ open, onOpenChange }: SignInDialogProps) {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const { toast } = useToast();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendLoginLink(email);
      setIsSent(true);
      toast({
        title: "Check your email",
        description: "We've sent you a login link!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Sign in to Meme It!</DialogTitle>
          <DialogDescription>
            Choose your preferred sign-in method
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isSent ? (
            <form onSubmit={handleEmailSignIn} className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">
                Send Login Link
              </Button>
            </form>
          ) : (
            <div className="text-center">
              <p>Check your email for the login link!</p>
              <p className="text-sm text-muted-foreground">
                Didn&apos;t receive it? Check your spam folder or try again.
              </p>
              <Button
                variant="ghost"
                className="mt-2"
                onClick={() => {
                  setIsSent(false);
                  setEmail("");
                }}
              >
                Try again
              </Button>
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => signInWithGoogle()}
          >
            Continue with Google
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
