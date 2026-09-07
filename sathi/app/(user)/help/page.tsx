"use client";
import { useState } from "react";
import { getUser, setAccessToken, setUser } from "@/app/auth/store";
import { useRouter } from "next/navigation";
import HeaderWithProfile from "../component/headerProfile";
import { deactivateUser, deleteUser } from "@/app/api/user";
import { stopSubscriptionMail, stopSubscriptionOutMail } from "@/app/api/subscription";
// TODO: Create these API functions
// import { deactivateAccount, deleteAccount } from "@/app/api/user";

// ─── FAQ Data ───
const faqSections = [
  {
    title: "General",
    icon: InfoIcon,
    faqs: [
      {
        q: "What is this product?",
        a: "Our platform is a smart email management tool that connects to your Gmail or Outlook/Hotmail account, automatically identifies and extracts your important business emails, and presents them in a clean, organized dashboard — so you never have to dig through your cluttered inbox again.",
      },
      {
        q: "Who is this product for?",
        a: "It is built for professionals, freelancers, small business owners, and anyone who receives a mix of personal and business emails and wants to save time by instantly surfacing only the ones that matter.",
      },
      {
        q: "How does it work?",
        a: 'Once you sign up using your Gmail or Outlook/Hotmail account, our system scans your inbox, identifies business-relevant emails, and tags them as "Processed". All remaining emails (promotions, personal, spam, etc.) are tagged as "Blocked" so the system skips them in future scans. You get a focused view of only your business communications.',
      },
    ],
  },
  {
    title: "Account & Registration",
    icon: UserIcon,
    faqs: [
      {
        q: "How do I create an account?",
        a: 'Simply click "Sign Up", choose your email provider (Gmail or Outlook/Hotmail), and authorize the required permissions. No separate password is needed — your email account is your login.',
      },
      {
        q: "Can I use any email provider?",
        a: "Currently, we support Gmail (Google) and Outlook/Hotmail (Microsoft) accounts only.",
      },
      {
        q: "Can I connect multiple email accounts?",
        a: "At this time, each user account supports one connected email. If you need to manage multiple inboxes, you can create separate accounts for each.",
      },
    ],
  },
  {
    title: "Privacy, Permissions & Security",
    icon: ShieldIcon,
    faqs: [
      {
        q: "What permissions does the app request for Gmail?",
        a: "We request: Read your emails (to scan and identify business emails), Modify emails (to apply Processed/Blocked labels only — we never edit, delete, or send emails), View your profile and email address (to manage your account), and Manage labels (to create and assign custom tags).",
      },
      {
        q: "What permissions does the app request for Outlook/Hotmail?",
        a: "We request: Read your emails (to scan and identify business emails), Read & Write mail (to apply categorization tags only — we never delete, edit, or send emails), View your profile (to manage your account), and Offline access (to keep your session active for background sync).",
      },
      {
        q: "Does the app read all my emails?",
        a: "Our system accesses your inbox only to identify and categorize emails. We scan email metadata and content solely to determine whether an email is business-related. We do not store the full content of your personal emails. Only business emails marked as Processed are extracted and displayed in your dashboard.",
      },
      {
        q: "Will you ever send emails from my account?",
        a: 'No. We never compose, send, reply to, forward, or delete any email from your account. The "modify" or "write" permission is used exclusively to apply organizational tags/labels.',
      },
      {
        q: 'What does "Modify" permission mean? Will you change my emails?',
        a: "The modify permission (Gmail) and Mail.ReadWrite permission (Outlook) are required solely to add labels or categories — specifically the Processed and Blocked tags. We never alter the content of any email, move emails between folders, or delete anything.",
      },
      {
        q: "Is my data safe?",
        a: "Yes. Your email credentials are never stored on our servers — authentication is handled securely through Google and Microsoft's official OAuth 2.0 protocols. Your data is encrypted in transit and at rest.",
      },
      {
        q: "Can I revoke access at any time?",
        a: "Absolutely. You can disconnect your email account from our platform at any time. You can also revoke our app's access directly from your Google Account Security settings or Microsoft Account Privacy settings. All tags applied by our system will remain in your inbox, but no further scanning will occur.",
      },
    ],
  },
  {
    title: "How Processing Works",
    icon: ProcessIcon,
    faqs: [
      {
        q: 'What does "Processed" mean?',
        a: "When our system identifies an email as business-relevant, it marks it as Processed. This email is then extracted and displayed on your dashboard for easy access. Each processed email uses 1 credit from your account.",
      },
      {
        q: 'What does "Blocked" mean?',
        a: "Emails identified as non-business (newsletters, promotions, personal messages, spam, etc.) are tagged as Blocked. This tells our system to skip them in all future scans, saving processing time and credits.",
      },
      {
        q: "What if a personal email is incorrectly marked as Processed?",
        a: "If our system mistakenly processes an email that should not have been flagged, simply contact us via WhatsApp or email. We will remove the incorrectly processed email from your dashboard immediately and your credit will not be deducted.",
      },
      {
        q: "What if a business email is incorrectly tagged as Blocked?",
        a: "Contact our support team and we will review and reclassify the email for you.",
      },
      {
        q: "Does processing affect my original emails?",
        a: "No. Your original emails remain untouched in your inbox. We only add a tag/label for organizational purposes. The content, attachments, read/unread status, and folder location of your emails are never changed.",
      },
    ],
  },
  {
    title: "Subscription & Pricing",
    icon: CreditCardIcon,
    faqs: [
      {
        q: "Do I get free credits?",
        a: "Yes! Every new user receives 100 free processing credits upon signup — no payment required. This is an introductory offer to help you experience the platform, and it may be reduced or modified in the future.",
      },
      {
        q: "What are the subscription plans available?",
        a: "We currently offer two plans:\n\n• Free Plan — ₹0: 100 free processing credits to get started. No payment required.\n\n• Basic Plan — ₹50 (activation charge): Continued access to the platform after your free credits are used. The activation charge covers server, database, dashboard, and ongoing system maintenance.",
      },
      {
        q: "What is the Activation Charge?",
        a: "The ₹50 activation charge is a one-time maintenance fee that covers the cost of running the platform infrastructure — servers, database, user dashboard, and ongoing system maintenance. It is required only when you move to the Basic Plan after your free credits are consumed.",
      },
      {
        q: "What are credits?",
        a: "Credits are the units used to process your emails. 1 credit = 1 business email processed. When our system identifies and extracts a business email from your inbox, it consumes 1 credit from your balance.",
      },
      {
        q: "What happens when I run out of credits?",
        a: "Once your credits are exhausted, the system will stop processing new emails. You can activate the Basic Plan or purchase additional credits to continue. Your previously processed emails will remain accessible on your dashboard.",
      },
      {
        q: "Are refunds available?",
        a: "Since credits are consumed in real-time as emails are processed, we do not offer refunds on used credits. Free credits are non-transferable and non-refundable. If you believe there has been a billing error, please contact our support team.",
      },
    ],
  },
  {
    title: "Account Management",
    icon: SettingsIcon,
    faqs: [
      {
        q: "How do I cancel my subscription?",
        a: "You can cancel your subscription at any time by contacting us via WhatsApp at 7580946569 or email at amit200698@hotmail.com. Upon cancellation, no further charges will be applied.",
      },
      {
        q: "How do I delete my account?",
        a: "You can delete your account directly from the \"Manage Your Account\" section at the bottom of this page. Once deleted, all processing will stop and your data will be scheduled for permanent removal.\n\n⚠️ Important: If you change your mind, you have 15 days from the date of deletion to contact us and request account recovery. After 15 days, your data will be permanently deleted and cannot be restored. Contact us via WhatsApp (7580946569) or email (amit200698@hotmail.com) to recover a deleted account within the 15-day window.",
      },
      {
        q: "Can I deactivate my account temporarily?",
        a: "Yes. You can deactivate your account from the \"Manage Your Account\" section at the bottom of this page. Deactivation pauses all email processing and hides your dashboard data, but nothing is deleted. To reactivate your account, contact us via WhatsApp (7580946569) or email (amit200698@hotmail.com) and we will restore your access with all your data intact.",
      },
      {
        q: "What is the difference between deleting and deactivating?",
        a: "Deactivation is temporary — your data is preserved and processing is paused. You can reactivate anytime by contacting support.\n\nDeletion is permanent — your account and all data will be permanently removed after 15 days. You can only recover it within those 15 days by contacting support.",
      },
    ],
  },
  {
    title: "Technical",
    icon: MonitorIcon,
    faqs: [
      {
        q: "Which browsers are supported?",
        a: "Our platform works on all modern browsers including Google Chrome, Mozilla Firefox, Microsoft Edge, and Safari.",
      },
      {
        q: "Is there a mobile app?",
        a: "Currently, our platform is accessible via web browser on both desktop and mobile devices. A dedicated mobile app may be available in the future.",
      },
      {
        q: "Why do I need to grant permissions during signup?",
        a: "The permissions we request are the minimum required to deliver the core functionality — scanning your inbox, identifying business emails, and tagging them. Without these permissions, the platform cannot function. You can review and revoke these permissions at any time from your Google or Microsoft account settings.",
      },
    ],
  },
];

// ─── Deactivation Reasons ───
const DEACTIVATION_REASONS = [
  "Taking a break — will come back later",
  "Too expensive for my current needs",
  "Not finding it useful enough",
  "Switching to another tool",
  "Privacy or security concerns",
  "Too complicated to use",
  "Missing features I need",
  "Not enough business emails detected",
  "Processing accuracy is not satisfactory",
  "I only needed it temporarily",
  "Other",
];

// ─── Main Component ───
export default function HelpAndFAQ() {
  const router = useRouter();
  const user = getUser();
  const [activeSection, setActiveSection] = useState(0);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Account action modals
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deactivateReason, setDeactivateReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const handleDeactivate = async () => {
    if (!deactivateReason) return;
    const reason = deactivateReason === "Other" ? otherReason.trim() : deactivateReason;
    if (!reason) return;

    setActionLoading(true);
    try {
      const resdeact = await deactivateUser(reason)
      if(resdeact.status === 200){
        if(user.mailType === "gmail"){
          await stopSubscriptionMail(user?.id)
        }else{
          await stopSubscriptionOutMail(user?.id)
        }
        setAccessToken(null);
        setUser(null);
        router.push("/signin");
      }
      
    } catch (err) {
      console.error("Deactivation failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setActionLoading(true);
    try {
      const deleteRes = await deleteUser(deleteConfirmText);
      if(deleteRes.status === 200){
        if(user?.mailType === 'gmail'){
          await stopSubscriptionMail(user?.id);
          
        }else{
          await stopSubscriptionOutMail(user?.id);
          
        }
        setAccessToken(null);
        setUser(null);
        router.push("/signin");
        return
      }
      
    } catch (err) {
      console.error("Deletion failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleFaq = (key: string) => {
    setOpenFaq(openFaq === key ? null : key);
  };

  // Filter FAQs based on search
  const getFilteredSections = () => {
    if (!searchQuery.trim()) return faqSections;

    const query = searchQuery.toLowerCase();
    return faqSections
      .map((section) => ({
        ...section,
        faqs: section.faqs.filter(
          (faq) =>
            faq.q.toLowerCase().includes(query) ||
            faq.a.toLowerCase().includes(query)
        ),
      }))
      .filter((section) => section.faqs.length > 0);
  };

  const filteredSections = getFilteredSections();

  return (
    <div className="min-h-screen bg-base text-ink font-sans flex flex-col">
      <HeaderWithProfile
        activePage="help_faq"
        userName={user?.userName}
        userEmail={user?.userEmail}
      />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-ink">Help & FAQ</h1>
            <p className="text-muted mt-2">
              Find answers to common questions or reach out to our support team.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search your question..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOpenFaq(null);
              }}
              className="w-full h-14 bg-surface border border-line rounded-2xl pl-12 pr-4 text-ink placeholder:text-muted/50 outline-none focus:border-primary focus:shadow-glow-violet transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
              >
                <CloseIcon />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar: Section Nav */}
            <div className="lg:col-span-1">
              <div className="bg-surface border border-line rounded-3xl p-4 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)] sticky top-6">
                <h3 className="text-sm font-semibold text-muted px-3 mb-3 uppercase tracking-wider">
                  Topics
                </h3>
                <nav className="space-y-1">
                  {faqSections.map((section, idx) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveSection(idx);
                          setSearchQuery("");
                          setOpenFaq(null);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          activeSection === idx && !searchQuery
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-muted hover:text-ink hover:bg-base border border-transparent"
                        }`}
                      >
                        <Icon />
                        {section.title}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Right Content: FAQ Accordion */}
            <div className="lg:col-span-3 space-y-6">
              {/* FAQ Cards */}
              {(searchQuery ? filteredSections : [faqSections[activeSection]]).map(
                (section, sIdx) => {
                  const Icon = section.icon;
                  return (
                    <div
                      key={sIdx}
                      className="bg-surface border border-line rounded-3xl p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]"
                    >
                      <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
                        <Icon /> {section.title}
                      </h2>

                      <div className="space-y-3">
                        {section.faqs.map((faq, fIdx) => {
                          const key = `${sIdx}-${fIdx}`;
                          const isOpen = openFaq === key;

                          return (
                            <div
                              key={fIdx}
                              className={`rounded-2xl border transition-all ${
                                isOpen
                                  ? "bg-primary/5 border-primary/20"
                                  : "bg-base border-line hover:border-primary/10"
                              }`}
                            >
                              <button
                                onClick={() => toggleFaq(key)}
                                className="w-full flex items-center justify-between p-4 text-left"
                              >
                                <span
                                  className={`text-sm font-medium pr-4 ${
                                    isOpen ? "text-primary" : "text-ink"
                                  }`}
                                >
                                  {faq.q}
                                </span>
                                <span
                                  className={`shrink-0 transition-transform duration-200 ${
                                    isOpen ? "rotate-180 text-primary" : "text-muted"
                                  }`}
                                >
                                  <ChevronDownIcon />
                                </span>
                              </button>

                              <div
                                className={`grid transition-all duration-200 ease-in-out ${
                                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                }`}
                              >
                                <div className="overflow-hidden">
                                  <p className="px-4 pb-4 text-sm text-muted leading-relaxed whitespace-pre-line">
                                    {faq.a}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
              )}

              {/* No Results */}
              {searchQuery && filteredSections.length === 0 && (
                <div className="bg-surface border border-line rounded-3xl p-10 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)] text-center">
                  <div className="text-muted mb-3">
                    <SearchIcon />
                  </div>
                  <p className="text-ink font-medium">No results found</p>
                  <p className="text-sm text-muted mt-1">
                    Try different keywords or contact our support team below.
                  </p>
                </div>
              )}

              {/* Contact Support Card */}
              <div className="bg-surface border border-line rounded-3xl p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]">
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <HeadphonesIcon /> Still need help?
                </h2>
                <p className="text-sm text-muted mb-6">
                  Can't find what you're looking for? Reach out to us directly — we
                  typically respond within 24 hours.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* WhatsApp Card */}
                  <a
                    href="https://wa.me/917580946569"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 p-4 rounded-2xl bg-base border border-line hover:border-whatsapp/30 hover:bg-whatsapp/5 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-whatsapp/10 border border-whatsapp/20 flex items-center justify-center shrink-0">
                      <WhatsAppIcon />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink group-hover:text-whatsapp transition-colors">
                        WhatsApp
                      </p>
                      <p className="text-xs text-muted">7580946569</p>
                      <p className="text-xs text-muted mt-0.5">Tap to chat →</p>
                    </div>
                  </a>

                  {/* Email Card */}
                  <a
                    href="mailto:amit200698@hotmail.com"
                    className="group flex items-center gap-4 p-4 rounded-2xl bg-base border border-line hover:border-primary/30 hover:bg-primary/5 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <MailIcon />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink group-hover:text-primary transition-colors">
                        Email
                      </p>
                      <p className="text-xs text-muted">amit200698@hotmail.com</p>
                      <p className="text-xs text-muted mt-0.5">Tap to mail →</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Manage Your Account (Danger Zone) ─── */}
          <div className="bg-surface border border-[#ea4335]/20 rounded-3xl p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <DangerIcon /> Manage Your Account
            </h2>
            <p className="text-sm text-muted mb-6">
              These actions affect your entire account. Please read carefully
              before proceeding.
            </p>

            <div className="space-y-4">
              {/* Deactivate */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-base border border-line">
                <div>
                  <p className="font-medium text-ink text-sm">
                    Deactivate Account
                  </p>
                  <p className="text-xs text-muted mt-1 max-w-md">
                    Temporarily pause your account. All processing stops but your
                    data is preserved. Contact support anytime to reactivate.
                  </p>
                </div>
                <button
                  onClick={() => setShowDeactivateModal(true)}
                  className="shrink-0 text-sm font-medium px-5 py-2.5 rounded-full border border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 transition-all"
                >
                  Deactivate
                </button>
              </div>

              {/* Delete */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-base border border-[#ea4335]/15">
                <div>
                  <p className="font-medium text-[#ea4335] text-sm">
                    Delete Account
                  </p>
                  <p className="text-xs text-muted mt-1 max-w-md">
                    Permanently delete your account and all data. You have 15 days
                    to contact support to recover it — after that, deletion is
                    irreversible.
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="shrink-0 text-sm font-medium px-5 py-2.5 rounded-full border border-[#ea4335]/30 text-[#ea4335] hover:bg-[#ea4335]/10 transition-all"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ═══ Deactivate Confirmation Modal ═══ */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !actionLoading && setShowDeactivateModal(false)}
          />
          <div className="relative bg-surface border border-line rounded-3xl p-6 w-full max-w-md shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <PauseIcon />
              </div>
              <h3 className="text-lg font-semibold text-ink">
                Deactivate Account
              </h3>
            </div>

            <p className="text-sm text-muted leading-relaxed mb-2">
              Are you sure you want to deactivate your account? Here's what
              will happen:
            </p>
            <ul className="text-sm text-muted space-y-1.5 mb-5 ml-1">
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                All email processing will be paused immediately.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                Your data and processed emails will be safely preserved.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                You can reactivate anytime by contacting support.
              </li>
            </ul>

            {/* Reason Dropdown */}
            <div className="mb-4">
              <label className="block text-sm text-muted mb-2">
                Please tell us why you're leaving — it helps us improve:
              </label>
              <div className="relative">
                <select
                  value={deactivateReason}
                  onChange={(e) => {
                    setDeactivateReason(e.target.value);
                    if (e.target.value !== "Other") setOtherReason("");
                  }}
                  className="w-full h-12 bg-base border border-line rounded-xl px-4 text-ink outline-none focus:border-yellow-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select a reason...</option>
                  {DEACTIVATION_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                  <ChevronDownIcon />
                </div>
              </div>
            </div>

            {/* Other Reason Text Input */}
            {deactivateReason === "Other" && (
              <div className="mb-4">
                <label className="block text-sm text-muted mb-2">
                  Please specify your reason:
                </label>
                <input
                  type="text"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Tell us what went wrong..."
                  className="w-full h-12 bg-base border border-line rounded-xl px-4 text-ink placeholder:text-muted/40 outline-none focus:border-yellow-500/50 transition-all"
                />
              </div>
            )}

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeactivateModal(false);
                  setDeactivateReason("");
                  setOtherReason("");
                }}
                disabled={actionLoading}
                className="text-sm font-medium text-muted hover:text-ink px-4 py-2.5 rounded-full border border-line hover:bg-base transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={
                  !deactivateReason ||
                  (deactivateReason === "Other" && !otherReason.trim()) ||
                  actionLoading
                }
                className="text-sm font-medium px-5 py-2.5 rounded-full bg-yellow-500/15 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {actionLoading ? "Deactivating..." : "Yes, Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Delete Confirmation Modal ═══ */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !actionLoading && setShowDeleteModal(false)}
          />
          <div className="relative bg-surface border border-[#ea4335]/20 rounded-3xl p-6 w-full max-w-md shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#ea4335]/10 border border-[#ea4335]/20 flex items-center justify-center">
                <TrashIcon />
              </div>
              <h3 className="text-lg font-semibold text-[#ea4335]">
                Delete Account
              </h3>
            </div>

            <p className="text-sm text-muted leading-relaxed mb-2">
              This action will permanently delete your account. Please
              understand what this means:
            </p>
            <ul className="text-sm text-muted space-y-1.5 mb-4 ml-1">
              <li className="flex items-start gap-2">
                <span className="text-[#ea4335] mt-0.5">•</span>
                All your data and processed emails will be permanently removed.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ea4335] mt-0.5">•</span>
                Your unused credits will be forfeited.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ea4335] mt-0.5">•</span>
                Labels/tags on your emails will remain, but no further
                processing will occur.
              </li>
            </ul>

            <div className="p-3 rounded-xl bg-[#ea4335]/5 border border-[#ea4335]/15 mb-5">
              <p className="text-xs text-muted leading-relaxed">
                <span className="font-semibold text-ink">Recovery window:</span>{" "}
                You have <span className="text-[#ea4335] font-semibold">15 days</span> from
                today to contact us via WhatsApp (7580946569) or email
                (amit200698@hotmail.com) to recover your account. After 15 days,
                deletion is permanent and irreversible.
              </p>
            </div>

            <div className="mb-5">
              <label className="block text-sm text-muted mb-2">
                Type <span className="font-mono font-semibold text-[#ea4335]">DELETE</span> to
                confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full h-12 bg-base border border-line rounded-xl px-4 text-ink placeholder:text-muted/30 outline-none focus:border-[#ea4335]/50 transition-all font-mono tracking-widest"
              />
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                disabled={actionLoading}
                className="text-sm font-medium text-muted hover:text-ink px-4 py-2.5 rounded-full border border-line hover:bg-base transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText !== "DELETE" || actionLoading}
                className="text-sm font-medium px-5 py-2.5 rounded-full bg-[#ea4335] text-white border border-[#ea4335] hover:bg-[#ea4335]/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {actionLoading
                  ? "Deleting..."
                  : "Permanently Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Icon Components ───

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ProcessIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function HeadphonesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-whatsapp">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function DangerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#ea4335]">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
      <circle cx="12" cy="12" r="10" />
      <line x1="10" y1="15" x2="10" y2="9" />
      <line x1="14" y1="15" x2="14" y2="9" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#ea4335]">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}