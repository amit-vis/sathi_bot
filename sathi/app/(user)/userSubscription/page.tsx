"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HeaderWithProfile from '../component/headerProfile';
import { userSubscriptiondetails } from '@/app/api/subscription';
import { getUser } from '@/app/auth/store';

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
  const user = getUser()

  // Pagination States
  const [paymentPage, setPaymentPage] = useState(1);
  const [creditPage, setCreditPage] = useState(1);
  const ITEMS_PER_PAGE = 4; // Adjust items per page as needed
  const [userSubsdata, setUserSubsData] = useState<any>()

  const fetuserSubscription = async ()=>{
    try {
      const getData = await userSubscriptiondetails(paymentPage, creditPage, ITEMS_PER_PAGE);
      if(getData.status === 200){
        setUserSubsData(getData.data.data);
  
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(()=>{
    fetuserSubscription()
  },[paymentPage, creditPage]);


  return (
    <div className="min-h-screen bg-base text-ink font-sans flex flex-col">
      
      {/* --- Top Header Navigation (Matched Theme) --- */}
       <HeaderWithProfile
        activePage="subscription_details"
        userName={user?.userName}
        userEmail={user?.userEmail}
        isSubscriptionActive={userSubsdata?.subscriptionStatus}
        subscriptionPlan={userSubsdata?.plan}
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
                userSubsdata?.subscriptionStatus 
                  ? 'bg-whatsapp/10 text-whatsapp border-whatsapp/20' 
                  : 'bg-[#ea4335]/10 text-[#ea4335] border-[#ea4335]/20'
              }`}>
                {userSubsdata?.subscriptionStatus ? 'Active Subscription' : 'Inactive Subscription'}
              </span>
            </div>
          </div>

          {/* Overview Cards (Theme Matched) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Plan Card */}
            <div className="bg-surface border border-line rounded-3xl p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]">
              <p className="text-sm font-medium text-muted uppercase tracking-wider">Current Plan</p>
              <p className="text-xl font-bold text-ink mt-2">{userSubsdata?.plan}</p>
            </div>
            
            {/* Validity Card */}
            <div className="bg-surface border border-line rounded-3xl p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]">
              <p className="text-sm font-medium text-muted uppercase tracking-wider">Validity</p>
              <div className="mt-2 text-sm text-ink font-medium space-y-1">
                <p><span className="text-primary">Start:</span> {formatDate(userSubsdata?.startDate)}</p>
                <p><span className="text-primary">End:</span> {formatDate(userSubsdata?.endDate)}</p>
              </div>
            </div>

            {/* Credits Summary Card */}
            <div className="bg-surface border border-line rounded-3xl p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)] lg:col-span-2 flex flex-col justify-center">
              <p className="text-sm font-medium text-muted uppercase tracking-wider mb-4">Credit Balance</p>
              <div className="flex items-center justify-between px-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{userSubsdata?.remainingCredits}</p>
                  <p className="text-xs text-muted mt-1 uppercase font-semibold">Remaining</p>
                </div>
                <div className="w-px h-12 bg-line"></div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-muted">{userSubsdata?.usedCredits}</p>
                  <p className="text-xs text-muted mt-1 uppercase font-semibold">Used</p>
                </div>
                <div className="w-px h-12 bg-line"></div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-ink">{userSubsdata?.totalCredits}</p>
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
                    {userSubsdata?.paymentLogs?.map((log: any) => (
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
                    {!userSubsdata?.paymentLogs?.length && (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-center text-muted">No records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Payment Pagination Controls */}
              {userSubsdata?.pagination?.paymentLogs.totalPages > 1 && (
                <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
                  <span className="text-xs text-muted">Page {paymentPage} of {userSubsdata?.pagination?.paymentLogs?.totalPages}</span>
                  <div className="flex gap-2">
                    <button 
                      disabled={paymentPage === 1} 
                      onClick={() => setPaymentPage(p => p - 1)}
                      className="px-3 py-1.5 rounded-lg border border-line text-xs font-medium text-ink disabled:opacity-50 hover:bg-base transition-colors"
                    >
                      Prev
                    </button>
                    <button 
                      disabled={paymentPage >= (userSubsdata?.pagination?.paymentLogs?.totalPages || 1)}
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
                    {userSubsdata?.creditLogs?.map((log: any) => (
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
                    {!userSubsdata?.creditLogs?.length && (
                      <tr>
                        <td colSpan={3} className="px-4 py-6 text-center text-muted">No records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Credit Pagination Controls */}
              {userSubsdata?.pagination?.creditLogs.totalPages > 1 && (
                <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
                  <span className="text-xs text-muted">Page {creditPage} of {userSubsdata?.pagination?.creditLogs.totalPages}</span>
                  <div className="flex gap-2">
                    <button 
                      disabled={creditPage === 1} 
                      onClick={() => setCreditPage(p => p - 1)}
                      className="px-3 py-1.5 rounded-lg border border-line text-xs font-medium text-ink disabled:opacity-50 hover:bg-base transition-colors"
                    >
                      Prev
                    </button>
                    <button 
                      disabled={creditPage >= (userSubsdata?.pagination?.creditLogs?.totalPages || 1)}
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