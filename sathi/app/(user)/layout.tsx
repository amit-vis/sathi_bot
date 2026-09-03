import type { Metadata } from "next";
import {  Poppins } from "next/font/google";
import "../globals.css";
import {AuthProvider} from "../auth/provider";
import ProtectedRoute from "../auth/ProtectedRoute";

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
      <body >
        <AuthProvider>
          <ProtectedRoute>
          {children}
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  );
}
