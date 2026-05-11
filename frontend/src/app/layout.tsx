import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";
import { FloatingBottomNav } from "@/components/layout/bottom-nav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PlacementOS | Placement Command Center",
  description: "Your AI-powered placement preparation engine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <html lang="en">
        <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
          <main className="relative min-h-screen">
            {children}
            <FloatingBottomNav />
          </main>
        </body>
      </html>
    </Providers>
  );
}
