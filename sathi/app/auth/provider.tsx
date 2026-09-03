// providers/AuthProvider.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { initAuth } from "../api/axios";
import { getUser, getAccessToken } from "../auth/store";

const AuthContext = createContext<any>(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAuth().finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  const user = getUser();       // isme isAdmin already hoga
  const token = getAccessToken();

  return (
    <AuthContext.Provider value={{ user, token }}>
      {children}
    </AuthContext.Provider>
  );
}