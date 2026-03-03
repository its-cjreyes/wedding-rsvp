import type { Metadata } from "next";
import { Inter, Kalnia } from "next/font/google";

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
  title: "Mac and CJ",
  description: "RSVP portal for the wedding of Mac and CJ.",
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
