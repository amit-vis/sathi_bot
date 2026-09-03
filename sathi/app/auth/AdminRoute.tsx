// components/AdminRoute.tsx — admin ke liye
"use client";
import { useAuth } from "./provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
    else if (!user.isAdmin) router.replace("/admin/login");
  }, [user, router]);

  if (!user?.isAdmin) return null;
  return <>{children}</>;
}