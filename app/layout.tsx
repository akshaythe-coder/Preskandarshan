import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { content } from "@/data/content";

export const metadata: Metadata = {
  title: content.title,
  description: "A little note, a love story, and two days of celebration. Join Preksha and Darshan for their wedding.",
  openGraph: {
    title: content.title,
    description: "Save the date for Preksha and Darshan.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Preksha and Darshan's wedding invitation" }],
  },
  twitter: { card: "summary_large_image", title: content.title, images: ["/og.png"] },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#7d0a0f" };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Pinyon+Script&family=Special+Elite&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
