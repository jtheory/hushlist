import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import "./components/fun.css";
import Snowflakes from "./components/Snowflakes";
import BackgroundParallax from "./components/BackgroundParallax";
import { ViewTransitions } from 'next-view-transitions';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "hushlist",
  description: "Family wishlist sharing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <BackgroundParallax />
          <Snowflakes />
          <AuthProvider>{children}</AuthProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
