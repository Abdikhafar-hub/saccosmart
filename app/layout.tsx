import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import SmartsuppChat from "@/components/SmartsuppChat";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SaccoSmart",
  description: "Complete SACCO management solution for members, treasurers, and administrators",
  generator: 'Abdikhafar',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
          <SmartsuppChat />
        </ThemeProvider>
      </body>
    </html>
  );
}
