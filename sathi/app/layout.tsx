import type { Metadata } from "next";
import {  Poppins } from "next/font/google";
import "./globals.css";
import {AuthProvider} from "./auth/provider";


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});




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
      <meta name="google-site-verification" content="p-RSY2Cfn9T_GpX4GlHfdouWVLsZ3OdAQq5cSirD4ks" />
      <body >
        <AuthProvider>
    
          {children}

        </AuthProvider>
      </body>
    </html>
  );
}
