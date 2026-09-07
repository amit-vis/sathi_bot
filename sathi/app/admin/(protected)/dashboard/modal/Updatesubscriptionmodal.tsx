"use client";

import { useState, useEffect, useRef } from "react";
import { axiosInstance } from "@/app/api/axios";

interface Props {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const PLANS = [
  {
    value: "SUBSCRIPTION_ACTIVATION",
    label: "Subscription Activation",
    description: "Activate subscription — ₹50 activation charge only",
    price: "₹50",
  },
  {
    value: "BASIC",
    label: "Basic",
    description: "₹50 activation + ₹250 recharge — 150 credits",
    price: "₹300",
  },
  {
    value: "PRO",
    label: "Pro",
    description: "Premium plan with extended credits",
    price: "₹999",
  },
];

const PAYMENT_MEDIUMS = [
  { value: "UPI", label: "UPI" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "DEBIT_CARD", label: "Debit Card" },
  { value: "SYSTEM", label: "System" },
];

export default function UpdateSubscriptionModal({
  userId,
  onClose,
  onSuccess,
}: Props) {
  const [plan, setPlan] = useState("");
  const [paymentMedium, setPaymentMedium] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const selectedPlan = PLANS.find((p) => p.value === plan);

  const handleSubmit = async () => {
    if (!plan || !paymentMedium) {
      setError("Please select both plan and payment medium");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axiosInstance.post("/subscription/handleSubscription", {
        userId,
        plan,
        paymentMedium,
      });
      onSuccess();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to update subscription"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
    >
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-[#111113] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-100">
            Update Subscription
          </h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Plan Dropdown */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Select Plan
            </label>
            <select
              value={plan}
              onChange={(e) => {
                setPlan(e.target.value);
                setError("");
              }}
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 outline-none focus:border-zinc-600 transition-colors appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
              }}
            >
              <option value="" disabled>
                Choose a plan…
              </option>
              {PLANS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>

            {/* Plan info */}
            {selectedPlan && (
              <div className="mt-3 px-4 py-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-zinc-200">
                    {selectedPlan.label}
                  </span>
                  <span className="text-sm font-semibold text-emerald-400">
                    {selectedPlan.price}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  {selectedPlan.description}
                </p>
              </div>
            )}
          </div>

          {/* Payment Medium Dropdown */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Payment Medium
            </label>
            <select
              value={paymentMedium}
              onChange={(e) => {
                setPaymentMedium(e.target.value);
                setError("");
              }}
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 outline-none focus:border-zinc-600 transition-colors appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
              }}
            >
              <option value="" disabled>
                Choose payment method…
              </option>
              {PAYMENT_MEDIUMS.map((pm) => (
                <option key={pm.value} value={pm.value}>
                  {pm.label}
                </option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !plan || !paymentMedium}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              loading || !plan || !paymentMedium
                ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                : "bg-zinc-100 text-zinc-900 hover:bg-white"
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Updating…
              </span>
            ) : (
              "Update Subscription"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}