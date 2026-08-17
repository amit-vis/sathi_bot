// components/HeaderWithProfile.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoutUser } from "@/app/api/user";
import { NavItem } from "./navItem";
import { BackIcon, ChevronDownIcon, CreditCardIcon, HelpIcon, LogoutIcon, UserIcon } from "./icon";

interface HeaderProps {
  activePage?: "personal_details" | "subscription_details" | "help_faq";
  userName: string;
  userEmail: string;
}

export default function HeaderWithProfile({ activePage, userName, userEmail }: HeaderProps) {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  console.log("here is the user Name", userName)

  return (
    <header className="h-20 flex items-center justify-between px-6 md:px-10 border-b border-line bg-surface/80 backdrop-blur-md sticky top-0 z-40">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <BackIcon />
        Back
      </button>

      <div className="relative">
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center gap-3 p-2 pr-4 rounded-full border border-line bg-surface hover:border-primary/50 transition-all shadow-sm"
        >
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/30">
            {userName?.charAt(0)}
          </div>
          <span className="text-sm font-medium hidden md:block">User Account</span>
          <ChevronDownIcon className={`w-4 h-4 text-muted transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
        </button>

        {isProfileOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
            <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-line bg-surface shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-line">
                <p className="text-sm font-medium text-ink">{userName}</p>
                <p className="text-xs text-muted truncate">{userEmail}</p>
              </div>

              <div className="p-2 space-y-1">
                <NavItem
                  label="Personal Details"
                  icon={<UserIcon />}
                  active={activePage === "personal_details"}
                  onClick={() => { setIsProfileOpen(false); router.push("/personaldetails"); }}
                />
                <NavItem
                  label="Subscription Details"
                  icon={<CreditCardIcon />}
                  active={activePage === "subscription_details"}
                  onClick={() => { setIsProfileOpen(false); router.push("/userSubscription"); }}
                />
                <NavItem
                  label="Help & FAQ"
                  icon={<HelpIcon />}
                  active={activePage === "help_faq"}
                  onClick={() => { setIsProfileOpen(false); router.push("/help"); }}
                />
              </div>

              <div className="p-2 border-t border-line">
                <button
                  onClick={LogoutUser}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#ea4335] hover:bg-[#ea4335]/10 transition-colors font-medium"
                >
                  <LogoutIcon /> Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}



// --- Icons (sab yahan rakh do) ---
