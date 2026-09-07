"use client";
import { useAuth } from "./provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/signin");
    } else if (user.isAdmin) {
      // admin user pages access nahi kar sakta
      router.replace("/admin/dashboard");
    }
  }, [user, router]);

  if (!user || user.isAdmin) return null;
  return <>{children}</>;
}