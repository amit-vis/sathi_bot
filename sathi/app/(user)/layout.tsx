import type { Metadata } from "next";
import "../globals.css";
import ProtectedRoute from "../auth/ProtectedRoute";


export const metadata: Metadata = {
  title: "BizNest",
  description: "Your premium companion app",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    

          <ProtectedRoute>
          {children}
          </ProtectedRoute>

   
  );
}
