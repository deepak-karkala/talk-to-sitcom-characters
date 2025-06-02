// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chatterbox",
  description: "Chat with your favorite characters",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Changed to slate, commented out theme-chandler */}
      <body className={`${inter.className} bg-slate-100 dark:bg-slate-900 /* theme-chandler */`}>
        {children}
      </body>
    </html>
  );
}
