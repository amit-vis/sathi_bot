"use client";

import React, { useEffect, useState } from 'react';
import HeaderWithProfile from '../component/headerProfile';
import { userSubscriptiondetails } from '@/app/api/subscription';
import { getUser } from '@/app/auth/store';
import Link from 'next/link';

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
{userSubsdata?.subscriptionStatus && new Date(userSubsdata?.endDate) > new Date() 
    ? 'Active Subscription' 
    : 'Inactive Subscription'}              
    </span>
            </div>
          </div>

          {/* Overview Cards (Theme Matched) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Plan Card */}
            <div className="bg-surface border border-line rounded-3xl p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]">
              <p className="text-sm font-medium text-muted uppercase tracking-wider">Current Plan</p>
              {userSubsdata?.subscriptionStatus && new Date(userSubsdata?.endDate) > new Date() ?
              <p className="text-xl font-bold text-ink mt-2">{userSubsdata?.plan}</p>:

// Component ke andar:
<Link 
  href="/subscription" 
  className="group inline-flex items-center gap-1 text-sm font-bold text-blue-500 uppercase tracking-wider hover:text-blue-400 transition-all"
>
  View Subscription
  <span className="transition-transform group-hover:translate-x-1">→</span>
</Link>}
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
