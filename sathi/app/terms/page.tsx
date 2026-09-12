"use client";

import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-base text-ink font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-line bg-base/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-bold text-primary">
            BizNest
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-muted hover:text-primary transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-ink">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted">
            Last updated: September 12, 2026
          </p>
        </div>

        <div className="space-y-10 text-[15px] leading-relaxed text-muted">
          {/* Intro */}
          <section>
            <p>
              Welcome to BizNest. By creating an account or using our service,
              you agree to these Terms of Service. Please read them carefully.
              If you do not agree, do not use the service.
            </p>
          </section>

          {/* 1 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">
              1. Service Description
            </h2>
            <p>
              BizNest is an email management platform that connects to your
              Gmail or Outlook/Hotmail account, scans your inbox using AI, and
              identifies business-relevant emails. These emails are extracted and
              displayed in a dedicated dashboard. Non-business emails are tagged
              as &quot;Blocked&quot; and skipped in future scans. Each business
              email processed consumes one credit from your account.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">
              2. Account Registration
            </h2>
            <p>
              You register using your Google or Microsoft account via OAuth 2.0.
              You must be at least 18 years old to use this service. You are
              responsible for all activity that occurs under your account. Each
              user account supports one connected email at a time.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">
              3. Email Access and Permissions
            </h2>
            <p>
              By connecting your email, you grant BizNest permission to read
              your inbox, apply organizational labels or categories, and access
              your profile information — strictly for the purpose of providing
              the service. We will never compose, send, reply to, forward, or
              delete any email from your account. You can revoke access at any
              time from your Google or Microsoft account settings.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">
              4. Credits and Pricing
            </h2>
            <p className="mb-3">
              New users receive 100 free processing credits upon signup. This is
              an introductory offer and may be modified in the future. After
              free credits are consumed, you can activate the Basic Plan for a
              one-time activation charge of ₹50, which covers server, database,
              and ongoing infrastructure costs.
            </p>
            <p>
              One credit equals one business email processed. When credits run
              out, processing stops. Previously processed emails remain
              accessible in your dashboard.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">
              5. Payments and Refunds
            </h2>
            <p>
              Payments are processed securely through Razorpay. We do not store
              your payment card details. Since credits are consumed in real-time
              as emails are processed, refunds on used credits are not
              available. Free credits are non-transferable and non-refundable.
              If you believe there is a billing error, contact our support team.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">
              6. Accuracy and Limitations
            </h2>
            <p>
              Our AI-based classification aims to be accurate but is not
              perfect. A personal email may occasionally be marked as Processed,
              or a business email may be tagged as Blocked. If this happens,
              contact our support team — we will correct the classification and
              adjust your credits accordingly. BizNest is not a substitute for
              manually reviewing your inbox for critical communications.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">
              7. Account Deactivation
            </h2>
            <p>
              You can deactivate your account from the Help &amp; FAQ page in
              the app. Deactivation pauses all email processing and hides your
              dashboard data, but nothing is deleted. To reactivate, contact
              support via WhatsApp or email.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">
              8. Account Deletion
            </h2>
            <p>
              You can delete your account from the Help &amp; FAQ page. Upon
              deletion, all processing stops and your data is scheduled for
              permanent removal. You have 15 days to contact support and request
              recovery. After 15 days, your data is permanently deleted and
              cannot be restored. Unused credits are forfeited upon deletion.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">
              9. Acceptable Use
            </h2>
            <p>
              You agree not to misuse the service, attempt to reverse-engineer
              or exploit our systems, use the service for illegal purposes, or
              share your account access with others. We reserve the right to
              suspend or terminate accounts that violate these terms.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">
              10. Limitation of Liability
            </h2>
            <p>
              BizNest is provided &quot;as is&quot; without warranties of any
              kind. We are not liable for missed or incorrectly classified
              emails, loss of data due to account deletion after the 15-day
              recovery window, service interruptions or downtime, or any
              indirect, incidental, or consequential damages. Our total
              liability is limited to the amount you have paid us in the 12
              months preceding the claim.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">
              11. Changes to These Terms
            </h2>
            <p>
              We may update these Terms from time to time. Significant changes
              will be communicated through the app or via email. Continued use
              of the service after changes constitutes acceptance of the updated
              terms.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">
              12. Governing Law
            </h2>
            <p>
              These Terms are governed by the laws of India. Any disputes
              arising from these Terms will be subject to the exclusive
              jurisdiction of the courts in India.
            </p>
          </section>

          {/* Contact */}
          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="mb-3 text-lg font-semibold text-ink">Contact Us</h2>
            <p>
              If you have questions about these Terms of Service, reach out to
              us:
            </p>
            <p className="mt-3">
              Email:{" "}
              <a
                href="mailto:amit200698@hotmail.com"
                className="text-primary underline"
              >
                amit200698@hotmail.com
              </a>
            </p>
            <p className="mt-1">
              WhatsApp:{" "}
              <a
                href="https://wa.me/917580946569"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                7580946569
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}