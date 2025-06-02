// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Keep Inter if font is desired, or remove for extreme bareness
import "./globals.css";

const inter = Inter({ subsets: ["latin"] }); // Assuming Inter font is still okay

export const metadata: Metadata = { title: "Chatterbox", description: "Chat with your favorite characters" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      {/* Force extreme background, remove font class if it interferes (unlikely for bg) */}
      <body className={`${inter.className} bg-red-500`}>
        {children}
      </body>
    </html>
  );
}
