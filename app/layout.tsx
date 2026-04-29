import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Koleksi Akun Hardi",
  description: "Manajemen kredensial terpusat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${jetbrainsMono.variable} dark h-full antialiased`}>
      <body className="h-full flex flex-col">
        {children}
        <footer className="mt-auto py-4 text-center text-[10px]">
          <span className="animate-footer-pulse">Made with ❤️ by ediology</span>
        </footer>
      </body>
    </html>
  );
}
