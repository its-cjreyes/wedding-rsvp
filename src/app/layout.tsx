import type { Metadata } from "next";
import { Inter, Kalnia } from "next/font/google";

import { getSiteUrl } from "@/lib/site-url";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const kalnia = Kalnia({
  subsets: ["latin"],
  variable: "--font-kalnia",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Mac and CJ",
  description: "RSVP portal for the wedding of Mac and CJ.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/favicon.png", sizes: "512x512", type: "image/png" }],
  },
  openGraph: {
    title: "Mac and CJ",
    description: "RSVP portal for the wedding of Mac and CJ.",
    images: [
      {
        url: "/featured-image.png",
        width: 1200,
        height: 630,
        alt: "Mac and CJ wedding RSVP featured image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mac and CJ",
    description: "RSVP portal for the wedding of Mac and CJ.",
    images: ["/featured-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${kalnia.variable}`}>
      <body>{children}</body>
    </html>
  );
}
