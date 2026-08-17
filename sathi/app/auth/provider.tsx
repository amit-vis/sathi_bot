// app/providers.tsx
"use client";
import { useEffect, useState } from "react";
import { initAuth } from "@/app/api/axios";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initAuth()
      .catch(() => {}) // logged out hai toh ignore
      .finally(() => setIsReady(true));
  }, []);

  if (!isReady) {
    return <div className="min-h-screen bg-base flex items-center justify-center">
      <p className="text-muted">Loading...</p>
    </div>;
  }

  return <>{children}</>;
}