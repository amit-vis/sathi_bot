"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Screen, Wordmark } from "../signup/component"; // Tumhare existing imports
import { PaymentModal } from "./PaymentModal/paymentmodal";
import { BackIcon, CheckIcon } from "./PaymentModal/configbutton";

// Dummy Data for Subscriptions
// Subscription Plans Data
const subscriptionPlans = [
  {
    id: "free",
    plan: "FREE",
    name: "Free Plan",
    description: "Get started with 100 free credits — no payment required. Experience the platform before committing.",
    price: 0,
    breakdown: null,
    duration: "One-time",
    creditInfo: "100 credits (lifetime until used)",
    benefits: [
      "100 free processing credits on signup",
      "Credits never expire — valid until fully used",
      "Full dashboard access",
      "Business email extraction & tagging",
      "No payment or card required",
    ],
    buttonText: "Current Plan",
    isDisabled: true, // already applied on signup
  },
  {
    id: "activation",
    plan: "SUBSCRIPTION_ACTIVATION",
    name: "Activation Plan",
    description: "One-time activation charge to keep your account running after free credits are used.",
    price: 50,
    breakdown: {
      activationCharge: 50,
    },
    duration: "One-time",
    creditInfo: "No extra credits included",
    isPopular: true,
    benefits: [
      "₹50 one-time activation fee",
      "Keeps your account & dashboard active",
      "Use any remaining credits from other plans",
      "Covers server, database & system maintenance",
      "No recurring charges",
    ],
    buttonText: "Activate Now",
    isDisabled: false,
  },
  {
    id: "basic",
    plan: "BASIC",
    name: "Basic Plan",
    description: "Monthly subscription with 100 credits — best value for regular business email users.",
    price: 300,
    breakdown: {
      creditCharge: 250,
      activationCharge: 50,
      totalCredits: 100,
    },
    duration: "1 Month",
    creditInfo: "100 credits (lifetime until used)",
    benefits: [
      "100 processing credits included",
      "Credits are lifetime — never expire until used",
      "₹250 credit charge + ₹50 activation charge",
      "Credits usable only while subscription is active",
      "1 month of active subscription access",
      "Full dashboard & business email features",
    ],
    buttonText: "Subscribe — ₹300",
    isDisabled: false,
  },
];

// --- Main Page Component ---
export default function SubscriptionsPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const openModal = (plan: any) => setSelectedPlan(plan);
  const closeModal = () => setSelectedPlan(null);

  return (
    <div className="min-h-screen bg-base pb-20 relative">
      
      <button 
        onClick={() => router.back()}
        className="absolute top-8 left-8 z-10 flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <BackIcon />
        Back
      </button>

      <div className="pt-10 text-center">
        <div className="flex justify-center mb-10">
           <Wordmark size="lg" />
        </div>
        
        <h1 className="text-[clamp(28px,8vw,40px)] font-semibold text-ink">
          Choose Your Plan
        </h1>
        <p className="mt-2 text-base text-muted max-w-md mx-auto px-4">
          Pick the plan that fits your needs. Credits never expire — they stay until you use them.
        </p>
      </div>

      <div className="max-w-6xl mx-auto mt-16 px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {subscriptionPlans.map((plan) => (
          <div 
            key={plan.id} 
            className="flex flex-col rounded-3xl border border-line bg-surface p-6 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] relative transition-all duration-300 ease-in-out hover:-translate-y-2 hover:border-primary/50 hover:shadow-glow-violet"
          >
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full shadow-glow-violet">
                RECOMMENDED
              </div>
            )}

            {/* Plan badge */}
            <div className="mb-3">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                plan.id === "free" 
                  ? "bg-green-500/10 text-green-500 border border-green-500/20"
                  : plan.id === "activation"
                  ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                  : "bg-primary/10 text-primary border border-primary/20"
              }`}>
                {plan.duration}
              </span>
            </div>
            
            <h3 className="text-2xl font-semibold text-ink">{plan.name}</h3>
            <p className="text-sm text-muted mt-2 min-h-[40px]">{plan.description}</p>
            
            {/* Price */}
            <div className="mt-6 mb-2">
              {plan.price === 0 ? (
                <span className="text-4xl font-bold text-green-500">FREE</span>
              ) : (
                <>
                  <span className="text-4xl font-bold text-ink">₹{plan.price}</span>
                  {plan.id === "basic" && (
                    <span className="text-sm text-muted"> /month</span>
                  )}
                </>
              )}
            </div>

            {/* Price breakdown for paid plans */}
            {plan.breakdown && (
              <div className="text-xs text-muted space-y-1 mb-4 p-3 rounded-xl bg-base border border-line">
                {plan.breakdown.creditCharge && (
                  <div className="flex justify-between">
                    <span>Credit charge ({plan.breakdown.totalCredits} credits)</span>
                    <span className="text-ink font-medium">₹{plan.breakdown.creditCharge}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Activation charge</span>
                  <span className="text-ink font-medium">₹{plan.breakdown.activationCharge}</span>
                </div>
                {plan.breakdown.creditCharge && (
                  <>
                    <div className="border-t border-line my-1" />
                    <div className="flex justify-between font-semibold text-ink">
                      <span>Total</span>
                      <span>₹{plan.price}</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Credit info highlight */}
            <div className={`text-xs font-medium px-3 py-2 rounded-lg mb-4 ${
              plan.price === 0 
                ? "bg-green-500/5 text-green-500 border border-green-500/15"
                : "bg-primary/5 text-primary border border-primary/15"
            }`}>
              {plan.creditInfo}
            </div>

            {/* Benefits */}
            <ul className="mt-2 mb-8 space-y-3 flex-1">
              {plan.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-ink/90">
                  <CheckIcon />
                  {benefit}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => !plan.isDisabled && openModal(plan)}
              disabled={plan.isDisabled}
              className={`flex h-14 w-full mt-auto items-center justify-center gap-3 rounded-full text-base font-semibold transition-all ${
                plan.isDisabled
                  ? "bg-line text-muted cursor-not-allowed"
                  : "bg-primary text-white shadow-glow-violet active:scale-[0.98] cursor-pointer"
              }`}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      {/* Important note */}
      <div className="max-w-2xl mx-auto mt-12 px-6">
        <div className="p-4 rounded-2xl bg-surface border border-line text-center">
          <p className="text-xs text-muted leading-relaxed">
            <span className="font-semibold text-ink">Note:</span> Credits are lifetime and never expire — they remain in your account until fully used. However, credits can only be consumed while your subscription is active. If your subscription expires, your credits are preserved but paused until you reactivate.
          </p>
        </div>
      </div>

      {selectedPlan && (
        <PaymentModal plan={selectedPlan} onClose={closeModal} />
      )}
    </div>
  );
}