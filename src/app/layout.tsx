import type { Metadata } from "next";
import { Inter, Kalnia } from "next/font/google";

import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const kalnia = Kalnia({
  subsets: ["latin"],
  variable: "--font-kalnia",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Mac and CJ",
  description: "RSVP portal for the wedding of Mac and CJ.",
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
