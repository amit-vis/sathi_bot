"use client";
import { getUser } from "@/app/auth/store"
import HeaderWithProfile from "../component/headerProfile"

export default function HelpAndFAQ (){
    const user = getUser();

    console.log("from help and faq user", user)
    return (
        <div className="min-h-screen bg-base text-ink font-sans flex flex-col">
              
              {/* --- Top Header Navigation (Matched Theme) --- */}
               <HeaderWithProfile
                activePage="help_faq"
                userName={user?.userName}
                userEmail={user?.userEmail}
              />
              <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                <div>under contruction</div>
              </main>
              </div>
    )
}