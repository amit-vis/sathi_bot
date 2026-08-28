"use client";
import { useState } from "react";
import HeaderWithProfile from "../component/headerProfile";
import { getUser } from "@/app/auth/store";
// Agar tumhara Wordmark component available hai toh use import kar lena, varna main text logo laga raha hu
// import { Wordmark } from "./component"; 

export default function DashboardLayout() {
const user = getUser()

  // Sidebar links array - Naye links add karne ke liye bas yahan object add kar dena
  const sidebarLinks = [
    { id: "dashboard", name: "Dashboard", icon: <HomeIcon /> },
    { id: "purchase", name: "Purchase", icon: <CartIcon /> },
    { id: "sales", name: "Sales", icon: <ChartIcon /> },
    { id: "quote", name: "Quote", icon: <FileIcon /> },
  ];

  return (
    <div className="flex h-screen w-full bg-base text-ink overflow-hidden font-sans">
      
      {/* --- Left Sidebar --- */}
      <aside className="w-64 h-full border-r border-line bg-surface flex flex-col transition-all">
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 border-b border-line">
          {/* <Wordmark size="sm" /> */}
          <h1 className="text-2xl font-bold text-ink tracking-wide">Saathi<span className="text-primary">.</span></h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {sidebarLinks.map((link) => (
            <button 
              key={link.id}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-muted hover:text-primary hover:bg-primary/10 transition-colors group"
            >
              <div className="text-muted group-hover:text-primary transition-colors">
                {link.icon}
              </div>
              <span className="text-[15px] font-medium">{link.name}</span>
            </button>
          ))}
        </nav>

        {/* Bottom Sidebar Area (Optional, for settings/logout) */}
        {/* <div className="p-4 border-t border-line">
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-muted hover:text-ink transition-colors">
            <SettingsIcon />
            <span className="text-[15px] font-medium">Settings</span>
          </button>
        </div> */}
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Navbar */}
       <HeaderWithProfile

       userName={user?.userName}
       userEmail={user?.userEmail}

       
       />

        {/* Dashboard Content Page */}
        <div className="flex-1 overflow-y-auto p-8 bg-base">
          <h2 className="text-2xl font-semibold text-ink mb-6">Overview</h2>
          
          {/* Dummy Content Cards (Jahan tumhara actual data aayega) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 rounded-2xl border border-line bg-surface p-6 shadow-sm">
              <p className="text-sm text-muted">Total Sales</p>
              <h3 className="text-3xl font-bold text-ink mt-2">₹12,450</h3>
            </div>
            <div className="h-32 rounded-2xl border border-line bg-surface p-6 shadow-sm">
              <p className="text-sm text-muted">Active Subscriptions</p>
              <h3 className="text-3xl font-bold text-ink mt-2">48</h3>
            </div>
            <div className="h-32 rounded-2xl border border-line bg-surface p-6 shadow-sm">
              <p className="text-sm text-muted">Pending Quotes</p>
              <h3 className="text-3xl font-bold text-ink mt-2">7</h3>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

// --- Icons Components ---

export function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
      <line x1="1" y1="10" x2="23" y2="10"></line>
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
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