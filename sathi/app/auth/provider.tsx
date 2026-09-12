"use client";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { initAuth } from "../api/axios";
import { getUser, getAccessToken } from "../auth/store";

const AuthContext = createContext<any>(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const called = useRef(false);              // ← double call rokne ke liye

    useEffect(() => {
        if (called.current) return;            // ← already called toh skip
        called.current = true;
        initAuth().finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading...</div>;

    const user = getUser();
    const token = getAccessToken();

    return (
        <AuthContext.Provider value={{ user, token }}>
            {children}
        </AuthContext.Provider>
    );
}