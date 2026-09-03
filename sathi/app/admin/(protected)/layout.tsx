import type { Metadata } from "next";
import {  Poppins } from "next/font/google";
import "../globals.css";
import AdminRoute from "../../auth/AdminRoute";


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Saathi",
  description: "Your premium companion app",
};


export default function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={poppins.variable}
    >
      <body >
  
      <AdminRoute>
          {children}
          </AdminRoute>

 
      </body>
    </html>
  );
}
