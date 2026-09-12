"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Screen, Wordmark } from "../signup/component";
import { signin, verifyOTP } from "@/app/api/user";

export default function OtpPage() {
  const router = useRouter();
  const userEmail = useSearchParams();
  const email = userEmail.get("email") as string;
  
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [activeIndex, setActiveIndex] = useState(0);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState<number>(60);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Timer Logic
useEffect(() => {
  if (timeLeft <= 0) return;
  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) return 0;
      return prev - 1;
    });
  }, 1000);
  return () => clearInterval(timer);
}, [timeLeft]);
const canResend = timeLeft <= 0;

  // Type karne pe next box pe focus
  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    
    if (digit && index < 5) {
      const n = index + 1;
      inputsRef.current[n]?.focus();
      setActiveIndex(n);
    }
  };

  // Backspace pe pichle box pe jaao
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const p = index - 1;
      inputsRef.current[p]?.focus();
      setActiveIndex(p);
    }
  };

  const isComplete = otp.every((d) => d !== "");
  
  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const otpnew = otp.join("");
      const result = await verifyOTP(otpnew, email);
      if (result.data.user.isAdmin) {
        window.location.href = "/admin/dashboard"; 
      } else {
        window.location.href = "/dashboard"; 
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "OTP verification failed. Please try again.";
      setError(msg);
      // wrong OTP ya expired ho toh boxes clear karo
      setOtp(Array(6).fill(""));
      inputsRef.current[0]?.focus();
      setActiveIndex(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!canResend) return;
    setError("");
    try {
      await signin(email);
      setTimeLeft(60);
  
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to resend OTP. Please try again.";
      setError(msg);
    }
  };

  // Format time as 00:59, 00:09, etc.
  const formattedTime = `00:${timeLeft.toString().padStart(2, '0')}`;

  return (
    <Screen>
      {/* Chhota logo */}
      <div className="mt-6">
        <Wordmark size="sm" />
      </div>

      {/* Heading */}
      <div className="flex-1" />
      <div className="text-center">
        <h2 className="text-[clamp(28px,8vw,36px)] font-semibold text-ink">
          Verify OTP
        </h2>
        <p className="mt-2 text-base text-muted">
          Enter the 6-digit code we sent you
        </p>
      </div>

      {/* 6 OTP boxes */}
      <div className="mt-7 flex justify-center gap-2.5">
        {otp.map((digit, i) => {
          const active = i === activeIndex;
          return (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
               onChange={(e) => {
                handleChange(i, e.target.value);
                if (error) setError("");  // typing karte hi error hatao
              }}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onFocus={() => setActiveIndex(i)}
              className={`h-[clamp(52px,15vw,64px)] w-[clamp(44px,13vw,56px)] rounded-2xl border-2 bg-surface-2 text-center text-[22px] font-semibold text-ink outline-none transition-all ${
                error
                  ? "border-[#ea4335]"
                  : active
                  ? "border-primary shadow-glow-violet"
                  : "border-line shadow-none"
              }`}
            />
          );
        })}
      </div>

      {error && (
        <p className="mt-3 text-center text-sm text-[#ea4335]">{error}</p>
      )}

      {/* Resend & Timer Section */}
      <div className="mt-6 text-center h-6">
        <button
          onClick={handleSendOtp}
          disabled={!canResend}
          className={`text-[15px] font-medium transition-all ${
            canResend
              ? "text-gold cursor-pointer hover:opacity-80"
              : "text-muted cursor-not-allowed opacity-50"
          }`}
        >
          {canResend ? (
            "Resend code"
          ) : (
            <>
              Resend code in <span className="font-semibold text-amber-500">{formattedTime}</span>
            </>
          )}
        </button>
      </div>

      {/* Verify button bottom pe */}
      <div className="flex-1" />
      <button
        onClick={handleVerify}
        disabled={!isComplete || loading}
        className={`h-[58px] w-full rounded-full bg-primary text-[17px] font-semibold text-white transition-all ${
          isComplete && !loading
            ? "cursor-pointer opacity-100 shadow-glow-violet"
            : "cursor-not-allowed opacity-50 shadow-none"
        }`}
      >
        {loading ? "Verifying..." : "Verify & Continue"}
      </button>
      <div className="h-6" />
    </Screen>
  );
}