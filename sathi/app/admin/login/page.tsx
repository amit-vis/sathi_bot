"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminloggedin } from "@/app/api/admin";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await adminloggedin({email, password})
      if (res.status === 200) {
        setEmail("")
        setPassword("")
        if(res.data.user.isAdmin){
          router.push("/admin/dashboard");
        }else{
          router.push("/dashboard")
        }
      
      }
      setError(res.data.error || "Login failed");
        return;

      
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        <div style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            style={{
              ...styles.button,
              opacity: loading || !email || !password ? 0.5 : 1,
              cursor: loading || !email || !password ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0a0a0a",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    background: "#141414",
    borderRadius: 12,
    border: "1px solid #262626",
    padding: "40px 32px",
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 600,
    color: "#f5f5f5",
    margin: 0,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  subtitle: {
    fontSize: 14,
    color: "#737373",
    marginTop: 6,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "#a3a3a3",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  input: {
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #262626",
    background: "#0a0a0a",
    color: "#f5f5f5",
    fontSize: 14,
    outline: "none",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  error: {
    fontSize: 13,
    color: "#ef4444",
    margin: 0,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  button: {
    padding: "12px 0",
    borderRadius: 8,
    border: "none",
    background: "#f5f5f5",
    color: "#0a0a0a",
    fontSize: 14,
    fontWeight: 600,
    marginTop: 4,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
};