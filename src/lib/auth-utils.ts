'use client';

import { 
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from './firebase';
import { captureException } from '@sentry/nextjs';

// Google Sign In
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    handleAuthError(error);
  }
}

// Email Link (Passwordless) Sign In
export async function sendLoginLink(email: string) {
  const actionCodeSettings = {
    url: window.location.origin + '/verify-email',
    handleCodeInApp: true
  };

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    // Save the email for later use
    window.localStorage.setItem('emailForSignIn', email);
  } catch (error: any) {
    handleAuthError(error);
  }
}

// Verify Email Link
export async function verifyEmailLink() {
  if (!isSignInWithEmailLink(auth, window.location.href)) {
    return null;
  }

  let email = window.localStorage.getItem('emailForSignIn');
  if (!email) {
    // If email is not saved, prompt user to enter it again
    email = window.prompt('Please provide your email for confirmation');
  }

  if (!email) throw new Error('Email is required');

  try {
    const result = await signInWithEmailLink(auth, email, window.location.href);
    window.localStorage.removeItem('emailForSignIn');
    return result.user;
  } catch (error: any) {
    handleAuthError(error);
  }
}

// Error Handler
function handleAuthError(error: any) {
  captureException(error, {
    tags: {
      hint: 'Auth error'
    }
  })
  
  if (error.code === 'auth/configuration-not-found') {
    throw new Error('Authentication not properly configured. Please try again later.');
  } else if (error.code === 'auth/invalid-email') {
    throw new Error('Invalid email address.');
  } else {
    throw new Error('Authentication failed. Please try again.');
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    captureException(error, {
      tags: {
        hint: 'Sign out error'
      }
    })
    
    throw new Error('Failed to sign out. Please try again.');
  }
}