import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Mac and CJ Wedding RSVP",
  description: "RSVP portal for the wedding celebration of Mac and CJ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
