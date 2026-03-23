import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { PROJECT_CONFIG } from "@/config/project-config";
import { Providers } from "@/components/providers";
import { Preloader } from "@/components/layout/preloader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: PROJECT_CONFIG.name,
  description: PROJECT_CONFIG.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextTopLoader showSpinner={false} />
        <Providers>
          <Preloader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
