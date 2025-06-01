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
      {/* Added 'theme-chandler' class and a base bg color that theme might override */}
      <body className={`${inter.className} theme-chandler bg-gray-100 dark:bg-gray-900`}>
        {children}
      </body>
    </html>
  );
}
