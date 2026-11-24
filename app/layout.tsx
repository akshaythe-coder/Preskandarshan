import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { I18nProvider } from "@/components/I18nProvider";
import { requestLanguage } from "@/lib/metadata";
import "./i18n.css";

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#7d0a0f" };

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const language = await requestLanguage();
  return (
    <html lang={language} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Pinyon+Script&family=Special+Elite&display=swap" rel="stylesheet" />
      </head>
      <body><I18nProvider initialLanguage={language}>{children}</I18nProvider></body>
    </html>
  );
}
