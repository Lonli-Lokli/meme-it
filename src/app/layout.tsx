// src/app/layout.tsx
import type { Metadata } from "next";

import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { initializeServer } from '@/lib/init-server';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ["latin"] });

if (process.env.NODE_ENV === 'production') {
  // Only run in production to avoid running during development hot reloads
  initializeServer();
}

export const metadata: Metadata = {
  title: {
    default: "Meme It! - Discover and Share Memes",
    template: "%s | Meme It!"
  },
  icons: {
    icon: "/favicon.svg",
  },
  description: "Explore the latest memes on Meme It! Share and enjoy the best memes with your friends.",
  openGraph: {
    title: {
      default: "Meme It! - Discover and Share Memes",
      template: "%s | Meme It!"
    },
    description: "Explore the latest memes on Meme It! Share and enjoy the best memes with your friends.",
    url: process.env.NEXT_PUBLIC_BASE_URL,
    siteName: "Meme It!",
    locale: "en_US",
    type: "website",
    images: [{
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/default-thumbnail.png`,
      width: 1200,
      height: 630,
      alt: "Meme It! - Your Daily Dose of Memes",
      type: "image/png",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: "Meme It! - Discover and Share Memes",
      template: "%s | Meme It!"
    },
    description: "Your daily source for the best memes. Join our community!",
    images: [`${process.env.NEXT_PUBLIC_BASE_URL}/default-thumbnail.png`],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
    (function() {
      const theme = localStorage.getItem('theme') || 'system';
      if (theme === 'system') {
        document.documentElement.classList.add(
          window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        );
      } else {
        document.documentElement.classList.add(theme);
      }
    })();
  `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system">
          <AuthProvider>
            <Providers>
              <div className="flex flex-col bg-background text-foreground">
                <Header />
                <main className="relative">
                  {children}
                  <Analytics />
                </main>
              </div>
            </Providers>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
