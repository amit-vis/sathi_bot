"use client";
import { useEffect, useState } from "react";
import HeaderWithProfile from "../component/headerProfile";
import { getUser, setAccessToken, setUser } from "@/app/auth/store";
import { deleteSession, getAllSession, updateUserPersonalDetails } from "@/app/api/user";
import { useRouter } from "next/navigation";

export default function PersonalDetails() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false);
  const user = getUser();
  
  const [formData, setFormData] = useState({
    name: user?.userName,
    mobile: user?.userMobileNumber,
    organization: user?.organizationName,
  });



  const [sessions, setSessions] = useState<any>([]);

  // Yeh variable batayega ki konsa page abhi active hai (menu highlight karne ke liye)

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSave = async () => {
  const UserData = await updateUserPersonalDetails({
    userName: formData.name,
    userMobileNumber: formData.mobile,
    organizationName: formData.organization,
  });

  if (UserData?.success) {
    setIsEditing(false);
    // 👇 updated data set karo, blank nahi
    setFormData({
      name: formData.name,
      mobile: formData.mobile,
      organization: formData.organization,
    });
    setUser({
      ...user,
      userName: formData.name,
      userMobileNumber: formData.mobile,
      organizationName: formData.organization,
    });
  }
};

  const handleLogoutSession = async (familyId: string) => {
    const session = sessions.find((s:any)=>s.familyId === familyId)
     await deleteSession(familyId)
     
    if(session?.isCurrentDevice){
      setAccessToken(null);
      setUser(null);
      router.push("/signin")
    }else{
      fetchSession();
    }
     return
  };

  const fetchSession = async ()=>{
    const sessionRes = await getAllSession();
    setSessions(sessionRes.sessions)
  }

  useEffect(()=>{
    if(user){
      fetchSession()
    }
  },[user])

  // Relative time (e.g., "2 days ago")
function formatSessionTime(dateString: string) {
  const now: any = new Date();
  const date: any = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Abhi abhi
  if (diffMins < 1) return "Just now";

  // Minutes ago
  if (diffMins < 60) return `${diffMins} min ago`;

  // Hours ago
  if (diffHours < 24) return `${diffHours} hours ago`;

  // Yesterday
  if (diffDays === 1) {
    return "Yesterday at " + date.toLocaleString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  }

  // 2-6 days ago
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  // Purane sessions — full date dikhao
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}



  return (
    <div className="min-h-screen bg-base text-ink font-sans flex flex-col">
      
      {/* --- Top Header Navigation --- */}
      <HeaderWithProfile
        activePage="personal_details"
        userName={user?.userName}
        userEmail={user?.userEmail}
      />

      {/* --- Main Content --- */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div>
            <h1 className="text-3xl font-bold text-ink">Personal Details</h1>
            <p className="text-muted mt-2">Manage your profile information and account security.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Account Status Card */}
              <div className="bg-surface border border-line rounded-3xl p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <ShieldIcon /> Account Status
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted mb-1">Registered Email</p>
                    <p className="font-medium">{user?.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-1">Email Verification</p>
                    <div className="flex items-center gap-2">
                      {user?.isEmailVerified ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-whatsapp/10 text-whatsapp text-sm font-medium border border-whatsapp/20">
                          <CheckCircleIcon /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ea4335]/10 text-[#ea4335] text-sm font-medium border border-[#ea4335]/20">
                          <AlertIcon /> Unverified
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted mb-1">Account Status</p>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-whatsapp/10 text-whatsapp text-sm font-medium border border-whatsapp/20">
                       {user?.isBlocked?"Inactive": "Active"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Editable Details Card */}
              <div className="bg-surface border border-line rounded-3xl p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)] transition-all">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <UserIcon /> Basic Information
                  </h2>
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="text-sm font-medium text-primary hover:underline flex items-center gap-2">
                      <EditIcon /> Edit Details
                    </button>
                  ) : (
                    <button onClick={() => setIsEditing(false)} className="text-sm font-medium text-muted hover:text-ink flex items-center gap-2">
                      <CloseIcon /> Cancel
                    </button>
                  )}
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm text-muted mb-1.5">Full Name</label>
                    {isEditing ? (
                      <input type="text" name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} className="w-full h-12 bg-base border border-line rounded-xl px-4 text-ink outline-none focus:border-primary focus:shadow-glow-violet transition-all" />
                    ) : (
                      <p className="h-12 flex items-center px-4 bg-base/50 border border-transparent rounded-xl text-ink">{user?.userName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-muted mb-1.5">Mobile Number</label>
                    {isEditing ? (
                      <input type="text" name="mobile" value={formData.mobile} onChange={handleInputChange} className="w-full h-12 bg-base border border-line rounded-xl px-4 text-ink outline-none focus:border-primary focus:shadow-glow-violet transition-all" />
                    ) : (
                      <p className="h-12 flex items-center px-4 bg-base/50 border border-transparent rounded-xl text-ink">{user?.userMobileNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-muted mb-1.5">Organization Name</label>
                    {isEditing ? (
                      <input type="text" name="organization" value={formData.organization} onChange={handleInputChange} className="w-full h-12 bg-base border border-line rounded-xl px-4 text-ink outline-none focus:border-primary focus:shadow-glow-violet transition-all" />
                    ) : (
                      <p className="h-12 flex items-center px-4 bg-base/50 border border-transparent rounded-xl text-ink">{user?.organizationName}</p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6 flex justify-end">
                    <button onClick={handleSave} className="shine-edges bg-primary text-white px-6 py-2.5 rounded-full font-medium shadow-glow-violet hover:scale-[0.98] transition-transform active:scale-95">
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Active Sessions */}
            <div className="lg:col-span-1">
              <div className="bg-surface border border-line rounded-3xl p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]">
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <MonitorIcon /> Active Sessions
                </h2>
                <p className="text-xs text-muted mb-6">Log out of devices you don't recognize.</p>

                <div className="space-y-4">
                  {sessions?.map((session: any) => (
                    <div key={session?.familyId} className="p-4 rounded-2xl bg-base border border-line flex flex-col gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-ink text-sm">{session.user_agent}</p>
                          {session.isCurrentDevice && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/20 text-primary border border-primary/30">
                              THIS DEVICE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted mt-1">IP: {session?.ip}</p>
                        <p className="text-xs text-muted">Location: {"India"}</p>
                        <p className="text-xs text-muted">Time: {formatSessionTime(session?.createdAt)}</p>
                      </div>

                      {!session.isCurrent && (
                        <button 
                          onClick={() => handleLogoutSession(session?.familyId)}
                          className="self-start text-xs font-medium text-[#ea4335] hover:bg-[#ea4335]/10 px-3 py-1.5 rounded-lg border border-transparent hover:border-[#ea4335]/30 transition-colors"
                        >
                          Log out
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
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