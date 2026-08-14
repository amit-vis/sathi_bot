"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Screen, Wordmark } from "../signup/component"; // Tumhare existing imports
import { PaymentModal } from "./PaymentModal/paymentmodal";
import { BackIcon, CheckIcon } from "./PaymentModal/configbutton";

// Dummy Data for Subscriptions
const subscriptionPlans = [
  {
    id: "sub_1",
    name: "Normal Egg Monthly",
    description: "Daily fresh eggs delivered to your doorstep.",
    price: 300,
    sub_price: 30, // Delivery/Tax
    total: 330,
    benefits: [
      "Farm fresh normal eggs",
      "Free morning delivery before 7 AM",
      "Zero breakage guarantee",
      "Pause subscription anytime"
    ]
  },
  {
    id: "sub_2",
    name: "Desi & Orange Egg Combo",
    description: "Premium quality nutrient-rich eggs for your family.",
    price: 600,
    sub_price: 50, // Delivery/Tax
    total: 650,
    isPopular: true,
    benefits: [
      "Mix of Desi and Orange eggs",
      "High protein & Omega-3",
      "Priority delivery",
      "Weekly recipe tips included"
    ]
  },
  {
    id: "sub_3",
    name: "Eggshell Calcium Powder",
    description: "100% natural calcium derived strictly from eggshells.",
    price: 450,
    sub_price: 45, // Delivery/Tax
    total: 495,
    benefits: [
      "Pure eggshell calcium (No limestone)",
      "Highly bioavailable for bone health",
      "Monthly refill pack",
      "Lab tested for purity"
    ]
  }
];

// --- Main Page Component ---
export default function SubscriptionsPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const openModal = (plan: any) => setSelectedPlan(plan);
  const closeModal = () => setSelectedPlan(null);

  return (
    <div className="min-h-screen bg-base pb-20 relative">
      
      {/* Top Left Back Button */}
      <button 
        onClick={() => router.back()}
        className="absolute top-8 left-8 z-10 flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <BackIcon />
        Back
      </button>

      {/* Header Section */}
      <div className="pt-10 text-center">
        <div className="flex justify-center mb-10">
           <Wordmark size="lg" />
        </div>
        
        <h1 className="text-[clamp(28px,8vw,40px)] font-semibold text-ink">
          Choose Your Plan
        </h1>
        <p className="mt-2 text-base text-muted max-w-md mx-auto px-4">
          Select the best subscription for your daily needs. Cancel or modify anytime.
        </p>
      </div>

      {/* Subscription Cards Grid */}
<div className="max-w-6xl mx-auto mt-16 px-6 grid grid-cols-1 md:grid-cols-3 gap-8">        
    {subscriptionPlans.map((plan) => (
          <div 
            key={plan.id} 
className="flex flex-col rounded-3xl border border-line bg-surface p-6 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] relative transition-all duration-300 ease-in-out hover:-translate-y-2 hover:border-primary/50 hover:shadow-glow-violet"         
            
            >
            {plan.isPopular && (
<div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full shadow-glow-violet">
MOST POPULAR
              </div>
            )}
            
            <h3 className="text-2xl font-semibold text-ink mt-2">{plan.name}</h3>
            <p className="text-sm text-muted mt-2 min-h-[40px]">{plan.description}</p>
            
            <div className="mt-6 mb-6">
              <span className="text-4xl font-bold text-ink">₹{plan.total}</span>
              <span className="text-sm text-muted"> /month</span>
            </div>

            {/* Benefits List */}
            <ul className="mt-4 mb-8 space-y-3 flex-1">
              {plan.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-ink/90">
                  <CheckIcon />
                  {benefit}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => openModal(plan)}
className="shine-edges flex h-14 w-full mt-auto items-center justify-center gap-3 rounded-full bg-primary text-base font-semibold text-white shadow-glow-violet transition-transform active:scale-[0.98]"            
>
              Subscribe Now
            </button>
          </div>
        ))}
      </div>

      {/* Separated Payment Modal */}
      {selectedPlan && (
        <PaymentModal plan={selectedPlan} onClose={closeModal} />
      )}
    </div>
  );
}