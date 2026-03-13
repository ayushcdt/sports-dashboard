import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sports Tracker",
  description: "Track live sports events, upcoming matches, and results",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main id="main-content" className="container flex-1 py-6">
              {children}
            </main>
            <footer className="border-t py-6 md:py-0">
              <div className="container flex h-14 items-center justify-center text-sm text-muted-foreground">
                <p>Sports data provided by TheSportsDB</p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
