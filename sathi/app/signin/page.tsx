"use client";
import { useRouter } from "next/navigation";
import { Screen, Wordmark } from "../signup/component";
import { useState } from "react";
import { signin } from "@/app/api/user";

const Signin = () => {
     const router = useRouter();
  const [value, setValue] = useState("");
   const [focused, setFocused] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!value.trim()) {
      setError("Please enter your email or phone number");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await signin(value);

      // agar API ne error status return kiya
      if (!res || res.status !== 200) {
        setError(res?.data?.message || "Something went wrong. Please try again.");
        return;
      }

      router.push(`/otp?email=${value}&provider=gmail&success=true`);
    } catch (err: any) {
      // network error ya server error
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };
    return (
         <Screen>
          <a 
        href="/subscription" 
        className="absolute top-8 right-8 z-10 text-sm font-medium text-muted transition-colors hover:text-primary hover:underline"
      >
        View Plans
      </a>
      {/* Logo */}
      <div className="mt-10">
        <Wordmark size="lg" />
      </div>

      {/* Heading */}
      <div className="flex-1" />
      <div className="text-center">
        <h2 className="text-[clamp(30px,9vw,40px)] font-semibold text-ink">
          Welcome back
        </h2>
        <p className="mt-2 text-base text-muted">Sign in to your account</p>
      </div>

      {/* Input field with mail icon */}
      <div className={`mt-7 flex h-[58px] items-center rounded-2xl border-2 bg-surface px-4 transition-all ${
  focused ? "border-primary shadow-glow-violet" : error ? "border-[#ea4335]" : "border-line shadow-none"
}`}>
  <input
    type="text"
    placeholder="Email or phone number"
    value={value}
    onChange={(e) => {
      setValue(e.target.value);
      if (error) setError("");  // typing karte hi error hata do
    }}
    onFocus={() => setFocused(true)}
    onBlur={() => setFocused(false)}
    className="h-full flex-1 border-none bg-transparent text-base text-ink outline-none placeholder:text-muted"
  />
  <MailIcon />
</div>

      {error && (
  <p className="mt-2 text-sm text-[#ea4335]">{error}</p>
)}

      {/* Continue button */}
      <button
  onClick={handleContinue}
  disabled={loading}
  className="mt-4 h-[58px] w-full rounded-2xl bg-primary text-[17px] font-semibold text-white shadow-glow-violet transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
>
  {loading ? "Sending OTP..." : "Continue"}
</button>

      {/* Bottom link */}
      <p className="mt-10 pb-4 text-center text-[15px] text-muted">
        Don&apos;t have an account?{" "}
        <a
          href="/signup"
          className="font-semibold text-primary underline [text-shadow:0_0_24px_rgba(124,92,252,0.55)]"
        >
          Sign up
        </a>
      </p>
    </Screen>
    )
}

export default Signin;

function MailIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#7C5CFC"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}