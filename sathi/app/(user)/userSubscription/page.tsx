"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import HeaderWithProfile from '../component/headerProfile';

// --- Type Definitions ---
export interface PaymentLog {
  id: string;
  amount: number | string;
  paymentFlow: string;
  paymentType: string;
  paymentStatus: string;
  transactionId?: string | null;
  createdAt: string;
}

export interface CreditLog {
  id: string;
  creditCount: number;
  creditFlow: string;
  creditType: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

export interface SubscriptionDetailsProps {
  subscriptionStatus: boolean;
  plan: string;
  startDate: string;
  endDate: string;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  paymentLogs: PaymentLog[];
  creditLogs: CreditLog[];
}

// --- Dummy Data (Added extra items to show pagination) ---
const mockData: SubscriptionDetailsProps = {
  subscriptionStatus: true,
  plan: "PRO_MONTHLY",
  startDate: "2026-08-01T00:00:00Z",
  endDate: "2026-09-01T00:00:00Z",
  totalCredits: 500,
  usedCredits: 120,
  remainingCredits: 380,
  paymentLogs: [
    { id: "pay_1", amount: "300.00", paymentFlow: "IN", paymentType: "UPI", paymentStatus: "SUCCESS", transactionId: "txn_987654321", createdAt: "2026-08-01T10:30:00Z" },
    { id: "pay_2", amount: "50.00", paymentFlow: "IN", paymentType: "CARD", paymentStatus: "SUCCESS", transactionId: "txn_987654322", createdAt: "2026-07-01T10:30:00Z" },
    { id: "pay_3", amount: "300.00", paymentFlow: "IN", paymentType: "UPI", paymentStatus: "FAILED", transactionId: "txn_987654323", createdAt: "2026-06-01T10:30:00Z" },
    { id: "pay_4", amount: "300.00", paymentFlow: "IN", paymentType: "UPI", paymentStatus: "SUCCESS", transactionId: "txn_987654324", createdAt: "2026-05-01T10:30:00Z" },
    { id: "pay_5", amount: "300.00", paymentFlow: "IN", paymentType: "UPI", paymentStatus: "SUCCESS", transactionId: "txn_987654325", createdAt: "2026-04-01T10:30:00Z" },
    { id: "pay_6", amount: "300.00", paymentFlow: "IN", paymentType: "UPI", paymentStatus: "SUCCESS", transactionId: "txn_987654326", createdAt: "2026-03-01T10:30:00Z" },
  ],
  creditLogs: [
    { id: "cred_1", creditCount: 500, creditFlow: "IN", creditType: "RECHARGE", balanceBefore: 0, balanceAfter: 500, createdAt: "2026-08-01T10:30:05Z" },
    { id: "cred_2", creditCount: -1, creditFlow: "OUT", creditType: "EXTRACTION", balanceBefore: 500, balanceAfter: 499, createdAt: "2026-08-02T14:20:00Z" },
    { id: "cred_3", creditCount: -10, creditFlow: "OUT", creditType: "EXTRACTION", balanceBefore: 499, balanceAfter: 489, createdAt: "2026-08-03T11:00:00Z" },
    { id: "cred_4", creditCount: -5, creditFlow: "OUT", creditType: "EXTRACTION", balanceBefore: 489, balanceAfter: 484, createdAt: "2026-08-04T09:15:00Z" },
    { id: "cred_5", creditCount: 100, creditFlow: "IN", creditType: "BONUS", balanceBefore: 484, balanceAfter: 584, createdAt: "2026-08-05T10:00:00Z" },
    { id: "cred_6", creditCount: -4, creditFlow: "OUT", creditType: "EXTRACTION", balanceBefore: 584, balanceAfter: 580, createdAt: "2026-08-06T12:00:00Z" },
  ]
};

// --- Helper Functions ---
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export default function SubscriptionDetailsPage() {
  const data = mockData; 

  // Pagination States
  const [paymentPage, setPaymentPage] = useState(1);
  const [creditPage, setCreditPage] = useState(1);
  const ITEMS_PER_PAGE = 4; // Adjust items per page as needed

  // Payment Logs Pagination Logic
  const totalPaymentPages = Math.ceil(data.paymentLogs.length / ITEMS_PER_PAGE);
  const currentPaymentLogs = data.paymentLogs.slice(
    (paymentPage - 1) * ITEMS_PER_PAGE,
    paymentPage * ITEMS_PER_PAGE
  );

  // Credit Logs Pagination Logic
  const totalCreditPages = Math.ceil(data.creditLogs.length / ITEMS_PER_PAGE);
  const currentCreditLogs = data.creditLogs.slice(
    (creditPage - 1) * ITEMS_PER_PAGE,
    creditPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-base text-ink font-sans flex flex-col">
      
      {/* --- Top Header Navigation (Matched Theme) --- */}
       <HeaderWithProfile
        activePage="subscription_details"
        userName="Amit Vishwakarma"
        userEmail="amit@example.com"
      />

      {/* --- Main Content --- */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Page Title & Status */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-ink">Subscription Details</h1>
              <p className="text-muted mt-2">Manage your billing, plans, and credit usage.</p>
            </div>
            <div>
              <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border ${
                data.subscriptionStatus 
                  ? 'bg-whatsapp/10 text-whatsapp border-whatsapp/20' 
                  : 'bg-[#ea4335]/10 text-[#ea4335] border-[#ea4335]/20'
              }`}>
                {data.subscriptionStatus ? 'Active Subscription' : 'Inactive Subscription'}
              </span>
            </div>
          </div>

          {/* Overview Cards (Theme Matched) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Plan Card */}
            <div className="bg-surface border border-line rounded-3xl p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]">
              <p className="text-sm font-medium text-muted uppercase tracking-wider">Current Plan</p>
              <p className="text-xl font-bold text-ink mt-2">{data.plan}</p>
            </div>
            
            {/* Validity Card */}
            <div className="bg-surface border border-line rounded-3xl p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]">
              <p className="text-sm font-medium text-muted uppercase tracking-wider">Validity</p>
              <div className="mt-2 text-sm text-ink font-medium space-y-1">
                <p><span className="text-primary">Start:</span> {formatDate(data.startDate)}</p>
                <p><span className="text-primary">End:</span> {formatDate(data.endDate)}</p>
              </div>
            </div>

            {/* Credits Summary Card */}
            <div className="bg-surface border border-line rounded-3xl p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)] lg:col-span-2 flex flex-col justify-center">
              <p className="text-sm font-medium text-muted uppercase tracking-wider mb-4">Credit Balance</p>
              <div className="flex items-center justify-between px-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{data.remainingCredits}</p>
                  <p className="text-xs text-muted mt-1 uppercase font-semibold">Remaining</p>
                </div>
                <div className="w-px h-12 bg-line"></div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-muted">{data.usedCredits}</p>
                  <p className="text-xs text-muted mt-1 uppercase font-semibold">Used</p>
                </div>
                <div className="w-px h-12 bg-line"></div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-ink">{data.totalCredits}</p>
                  <p className="text-xs text-muted mt-1 uppercase font-semibold">Total</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* --- Payment Logs Section --- */}
            <div className="bg-surface border border-line rounded-3xl p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)] flex flex-col">
              <h2 className="text-xl font-semibold mb-6 text-ink">Payment History</h2>
              
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left">
                  <thead className="bg-base text-muted uppercase text-xs font-semibold border-y border-line">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {currentPaymentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-base/50 transition-colors">
                        <td className="px-4 py-3 text-ink font-medium">
                          {formatDate(log.createdAt)}
                          <span className="block text-xs text-muted mt-0.5">{log.paymentType}</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-ink">₹{log.amount}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                            log.paymentStatus === 'SUCCESS' ? 'bg-whatsapp/10 text-whatsapp' : 'bg-[#fbbc05]/10 text-[#fbbc05]'
                          }`}>
                            {log.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {currentPaymentLogs.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-center text-muted">No records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Payment Pagination Controls */}
              {totalPaymentPages > 1 && (
                <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
                  <span className="text-xs text-muted">Page {paymentPage} of {totalPaymentPages}</span>
                  <div className="flex gap-2">
                    <button 
                      disabled={paymentPage === 1} 
                      onClick={() => setPaymentPage(p => p - 1)}
                      className="px-3 py-1.5 rounded-lg border border-line text-xs font-medium text-ink disabled:opacity-50 hover:bg-base transition-colors"
                    >
                      Prev
                    </button>
                    <button 
                      disabled={paymentPage === 4} 
                      onClick={() => setPaymentPage(p => p + 1)}
                      className="px-3 py-1.5 rounded-lg border border-line text-xs font-medium text-ink disabled:opacity-50 hover:bg-base transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* --- Credit Logs Section --- */}
            <div className="bg-surface border border-line rounded-3xl p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)] flex flex-col">
              <h2 className="text-xl font-semibold mb-6 text-ink">Credit Logs</h2>
              
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left">
                  <thead className="bg-base text-muted uppercase text-xs font-semibold border-y border-line">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-center">Amount</th>
                      <th className="px-4 py-3 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {currentCreditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-base/50 transition-colors">
                        <td className="px-4 py-3 text-ink font-medium">
                          {formatDate(log.createdAt)}
                          <span className="block text-xs text-muted mt-0.5">{log.creditType}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                           <span className={`font-bold px-2 py-1 rounded-md text-xs ${log.creditFlow === 'IN' ? 'bg-whatsapp/10 text-whatsapp' : 'bg-[#ea4335]/10 text-[#ea4335]'}`}>
                            {log.creditFlow === 'IN' ? '+' : ''}{log.creditCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-ink">
                          {log.balanceAfter}
                        </td>
                      </tr>
                    ))}
                    {currentCreditLogs.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-center text-muted">No records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Credit Pagination Controls */}
              {totalCreditPages > 1 && (
                <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
                  <span className="text-xs text-muted">Page {creditPage} of {totalCreditPages}</span>
                  <div className="flex gap-2">
                    <button 
                      disabled={creditPage === 1} 
                      onClick={() => setCreditPage(p => p - 1)}
                      className="px-3 py-1.5 rounded-lg border border-line text-xs font-medium text-ink disabled:opacity-50 hover:bg-base transition-colors"
                    >
                      Prev
                    </button>
                    <button 
                      disabled={creditPage === totalCreditPages} 
                      onClick={() => setCreditPage(p => p + 1)}
                      className="px-3 py-1.5 rounded-lg border border-line text-xs font-medium text-ink disabled:opacity-50 hover:bg-base transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// --- Icons Components ---
function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
      <line x1="1" y1="10" x2="23" y2="10"></line>
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  );
}