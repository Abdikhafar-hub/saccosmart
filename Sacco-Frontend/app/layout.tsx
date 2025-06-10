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
  icons: {
    icon: [
      { url: 'https://res.cloudinary.com/ddkkfumkl/image/upload/v1749500926/istockphoto-1423550966-612x612_mg4el6.jpg', sizes: 'any' },
      { url: 'https://res.cloudinary.com/ddkkfumkl/image/upload/v1749500926/istockphoto-1423550966-612x612_mg4el6.jpg', type: 'image/jpeg' }
    ],
    shortcut: 'https://res.cloudinary.com/ddkkfumkl/image/upload/v1749500926/istockphoto-1423550966-612x612_mg4el6.jpg',
    apple: 'https://res.cloudinary.com/ddkkfumkl/image/upload/v1749500926/istockphoto-1423550966-612x612_mg4el6.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="https://res.cloudinary.com/ddkkfumkl/image/upload/v1749500926/istockphoto-1423550966-612x612_mg4el6.jpg" sizes="any" />
        <link rel="icon" href="https://res.cloudinary.com/ddkkfumkl/image/upload/v1749500926/istockphoto-1423550966-612x612_mg4el6.jpg" type="image/jpeg" />
        <link rel="shortcut icon" href="https://res.cloudinary.com/ddkkfumkl/image/upload/v1749500926/istockphoto-1423550966-612x612_mg4el6.jpg" />
        <link rel="apple-touch-icon" href="https://res.cloudinary.com/ddkkfumkl/image/upload/v1749500926/istockphoto-1423550966-612x612_mg4el6.jpg" />
      </head>
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
