import type { Metadata } from "next";
import {  Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Saathi",
  description: "Your premium companion app",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={poppins.variable}
    >
      <body className="min-h-screen font-sans text-ink antialiased bg-[radial-gradient(120%_80%_at_50%_0%,#141826_0%,#0E1116_60%)]">{children}</body>
    </html>
  );
}
