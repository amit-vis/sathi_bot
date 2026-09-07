"use client";
import { useAuth } from "./provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // admin/login pe guard mat lagao
    if (pathname === "/admin/login") return;

    if (!user) {
      router.replace("/admin/login");
    } else if (!user.isAdmin) {
      router.replace("/dashboard");
    }
  }, [user, router, pathname]);

  // admin/login pe children directly render karo
  if (pathname === "/admin/login") return <>{children}</>;

  if (!user?.isAdmin) return null;
  return <>{children}</>;
}