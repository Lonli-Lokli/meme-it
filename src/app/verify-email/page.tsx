'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyEmailLink } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';

export default function VerifyEmail() {
  const router = useRouter();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    async function verify() {
      try {
        const user = await verifyEmailLink();
        if (user) {
          toast({
            title: "Success!",
            description: "You've been successfully signed in.",
          });
          router.push('/'); // Redirect to home page after successful verification
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setVerifying(false);
      }
    }
    verify();
  }, [router, toast]);

  if (verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Verifying your email...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>If you&apos;re not automatically redirected, please click <button onClick={() => router.push('/')} className="text-blue-500 hover:underline">here</button> to go home.</p>
    </div>
  );
} 