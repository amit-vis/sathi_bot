"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { axiosInstance } from "@/app/api/axios";

interface PaymentLog {
  id: string;
  amount: number;
  paymentFlow: string;
  paymentType: string;
  paymentStatus: string;
  paymentMedium: string;
  transactionId?: string;
  remarks?: string;
  createdAt: string;
}

interface CreditLog {
  id: string;
  creditCount: number;
  creditFlow: string;
  creditType: string;
  balanceBefore: number;
  balanceAfter: number;
  remarks?: string;
  createdAt: string;
}

interface SubscriptionDetail {
  user: {
    id: string;
    userName: string;
    userEmail: string;
    userPhone?: string;
  };
  subscription: {
    id: string;
    plan: string;
    subscriptionStatus: boolean;
    startDate: string | null;
    endDate: string | null;
    totalCredits: number;
    usedCredits: number;
    remainingCredits: number;
    totalAmount: number;
    paymentLogs: PaymentLog[];
    creditLogs: CreditLog[];
  };
}

export default function SubscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId as string;

  const [data, setData] = useState<SubscriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"payments" | "credits">("payments");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axiosInstance.get(`/admin/users/${userId}/subscription`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch subscription", err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetch();
  }, [userId]);

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (d: string) => {
    return new Date(d).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-emerald-500/15 text-emerald-400";
      case "PENDING":
        return "bg-amber-500/15 text-amber-400";
      case "FAILED":
        return "bg-red-500/15 text-red-400";
      default:
        return "bg-zinc-500/15 text-zinc-400";
    }
  };

  const getFlowBadge = (flow: string) => {
    return flow === "IN"
      ? "bg-emerald-500/15 text-emerald-400"
      : "bg-red-500/15 text-red-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-500">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading…
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Subscription data not found</p>
      </div>
    );
  }

  const { user, subscription: sub } = data;
  const creditPercent =
    sub.totalCredits > 0
      ? Math.round((sub.remainingCredits / sub.totalCredits) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 px-4 py-8 sm:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to users
        </button>

        {/* User Info + Sub Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* User Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-lg font-semibold text-zinc-300">
                {user.userName?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold text-zinc-100 truncate">
                  {user.userName}
                </p>
                <p className="text-sm text-zinc-500 truncate">{user.userEmail}</p>
              </div>
            </div>
            {user.userPhone && (
              <div className="text-sm text-zinc-500">
                Phone: <span className="text-zinc-300">{user.userPhone}</span>
              </div>
            )}
          </div>

          {/* Subscription Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-xs font-medium text-zinc-500 mb-4">Subscription</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Plan</span>
                <span className="text-sm font-medium text-zinc-200">{sub.plan}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Status</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      sub.subscriptionStatus ? "bg-emerald-500" : "bg-zinc-600"
                    }`}
                  />
                  <span className="text-sm text-zinc-200">
                    {sub.subscriptionStatus ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Period</span>
                <span className="text-sm text-zinc-200">
                  {formatDate(sub.startDate)} — {formatDate(sub.endDate)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Total Paid</span>
                <span className="text-sm font-medium text-zinc-200">
                  ₹{Number(sub.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Credits Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <p className="text-xs font-medium text-zinc-500 mb-4">Credits</p>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Remaining</span>
                <span className="tabular-nums text-zinc-200">
                  {sub.remainingCredits}
                  <span className="text-zinc-600"> / {sub.totalCredits}</span>
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${creditPercent}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Used</span>
              <span className="tabular-nums text-zinc-200">{sub.usedCredits}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "payments"
                ? "text-zinc-100 border-b-2 border-zinc-100 -mb-px"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Payment Logs ({sub.paymentLogs?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("credits")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "credits"
                ? "text-zinc-100 border-b-2 border-zinc-100 -mb-px"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Credit Logs ({sub.creditLogs?.length || 0})
          </button>
        </div>

        {/* Payment Logs Table */}
        {activeTab === "payments" && (
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1.2fr] gap-4 px-5 py-3 bg-zinc-900/60 border-b border-zinc-800 text-xs font-medium text-zinc-500 uppercase tracking-wider">
              <span>Amount</span>
              <span>Type</span>
              <span>Flow</span>
              <span>Medium</span>
              <span>Status</span>
              <span>Date</span>
            </div>

            {sub.paymentLogs?.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-zinc-600">
                No payment logs yet
              </div>
            ) : (
              sub.paymentLogs?.map((log) => (
                <div
                  key={log.id}
                  className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_1fr_1fr_1.2fr] gap-2 sm:gap-4 px-5 py-3.5 border-b border-zinc-800/60"
                >
                  <span className="text-sm font-medium tabular-nums text-zinc-200">
                    ₹{Number(log.amount).toFixed(2)}
                  </span>
                  <span className="text-sm text-zinc-400">{log.paymentType}</span>
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getFlowBadge(
                        log.paymentFlow
                      )}`}
                    >
                      {log.paymentFlow}
                    </span>
                  </div>
                  <span className="text-sm text-zinc-400">{log.paymentMedium}</span>
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(
                        log.paymentStatus
                      )}`}
                    >
                      {log.paymentStatus}
                    </span>
                  </div>
                  <span className="text-sm text-zinc-500">
                    {formatDateTime(log.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Credit Logs Table */}
        {activeTab === "credits" && (
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1.2fr] gap-4 px-5 py-3 bg-zinc-900/60 border-b border-zinc-800 text-xs font-medium text-zinc-500 uppercase tracking-wider">
              <span>Credits</span>
              <span>Type</span>
              <span>Flow</span>
              <span>Before</span>
              <span>After</span>
              <span>Date</span>
            </div>

            {sub.creditLogs?.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-zinc-600">
                No credit logs yet
              </div>
            ) : (
              sub.creditLogs?.map((log) => (
                <div
                  key={log.id}
                  className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_1fr_1fr_1.2fr] gap-2 sm:gap-4 px-5 py-3.5 border-b border-zinc-800/60"
                >
                  <span className="text-sm font-medium tabular-nums text-zinc-200">
                    {log.creditCount}
                  </span>
                  <span className="text-sm text-zinc-400">{log.creditType}</span>
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getFlowBadge(
                        log.creditFlow
                      )}`}
                    >
                      {log.creditFlow}
                    </span>
                  </div>
                  <span className="text-sm tabular-nums text-zinc-400">
                    {log.balanceBefore}
                  </span>
                  <span className="text-sm tabular-nums text-zinc-400">
                    {log.balanceAfter}
                  </span>
                  <span className="text-sm text-zinc-500">
                    {formatDateTime(log.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}