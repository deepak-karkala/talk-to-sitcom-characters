// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Talk to TV Show/Movie Characters",
  description: "Chat with AI versions of your favorite characters.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      {/* Restored intended page background classes */}
      <body className={`${poppins.className} bg-slate-100 dark:bg-slate-900`}>
        {children}
      </body>
    </html>
  );
}
