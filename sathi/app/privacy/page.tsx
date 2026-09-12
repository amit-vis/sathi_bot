"use client";

import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-base text-ink font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-line bg-base/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-bold text-primary">
            BizNest
          </Link>
          <Link
            href="/terms"
            className="text-sm text-muted hover:text-primary transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-ink">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted">
            Last updated: September 12, 2026
          </p>
        </div>

        <div className="space-y-10 text-[15px] leading-relaxed text-muted">
          {/* Intro */}
          <section>
            <p>
              BizNest (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is an
              email management platform that connects to your Gmail or
              Outlook/Hotmail account, identifies business-relevant emails, and
              presents them in an organized dashboard. This Privacy Policy
              explains how we collect, use, store, and protect your information
              when you use our service.
            </p>
          </section>

          {/* 1 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">
              1. Information We Collect
            </h2>
            <p className="mb-3">
              <span className="font-medium text-ink">
                Account information:
              </span>{" "}
              When you sign up, we receive your name, email address, and profile
              picture from your Google or Microsoft account through OAuth 2.0.
              We do not receive or store your password.
            </p>
            <p className="mb-3">
              <span className="font-medium text-ink">Email data:</span> We
              access your inbox to scan email metadata and content solely to
              determine whether an email is business-related. Emails identified
              as business-relevant (&quot;Processed&quot;) are extracted and
              stored on our servers so they can be displayed in your dashboard.
              Non-business emails (&quot;Blocked&quot;) are tagged in your inbox
              but their content is not stored on our servers.
            </p>
            <p>
              <span className="font-medium text-ink">Usage data:</span> We
              collect basic analytics such as login timestamps, feature usage,
              and session information to improve our service.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">
              2. How We Use Your Information
            </h2>
            <p>
              We use your information to provide the core service: scanning your
              inbox, identifying business emails, applying Processed/Blocked
              labels, and displaying business emails in your dashboard. We also
              use it to manage your account, subscription, and credits, to send
              service-related notifications, and to improve our email
              classification accuracy. We never use your data for advertising,
              and we never sell your data to third parties.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">
              3. Email Permissions
            </h2>
            <p className="mb-3">
              <span className="font-medium text-ink">Gmail users:</span> We
              request permission to read your emails (to scan and identify
              business emails), modify emails (to apply Processed/Blocked labels
              only), view your profile and email address, and manage labels. We
              never compose, send, reply to, forward, or delete any email.
            </p>
            <p>
              <span className="font-medium text-ink">
                Outlook/Hotmail users:
              </span>{" "}
              We request permission to read your emails, read and write mail (to
              apply categorization tags only), view your profile, and maintain
              offline access for background sync. We never delete, edit, or send
              emails from your account.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">
              4. Data Storage and Security
            </h2>
            <p>
              Your email credentials are never stored on our servers —
              authentication is handled through Google and Microsoft&apos;s
              official OAuth 2.0 protocols. All data is encrypted in transit
              using TLS and at rest. We use secure cloud infrastructure to host
              our services. Access to production data is restricted to
              authorized personnel only.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">
              5. Third-Party Services
            </h2>
            <p>
              We use Google and Microsoft APIs to access your email. We use
              Google Cloud services (Pub/Sub, Vertex AI) for email processing
              and classification. We use Razorpay for payment processing — we do
              not store your payment card details. We do not share your personal
              data with any third party for marketing or advertising purposes.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">
              6. Data Retention and Deletion
            </h2>
            <p>
              Your processed email data is retained as long as your account is
              active. If you deactivate your account, your data is preserved but
              processing stops — you can reactivate by contacting support. If
              you delete your account, you have a 15-day recovery window. After
              15 days, all your data is permanently and irreversibly deleted from
              our servers.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">
              7. Your Rights
            </h2>
            <p>
              You can revoke our access to your email at any time from your
              Google Account Security settings or Microsoft Account Privacy
              settings. You can deactivate or delete your account from the Help
              &amp; FAQ page within the app. You can request a copy of your data
              or ask questions about how it is used by contacting us.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">
              8. Cookies
            </h2>
            <p>
              We use essential cookies to manage your authentication session
              (refresh token). We use Google Analytics to understand general
              usage patterns. We do not use advertising or tracking cookies.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">
              9. Children&apos;s Privacy
            </h2>
            <p>
              Our service is not intended for anyone under the age of 18. We do
              not knowingly collect personal information from minors.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-ink">
              10. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. If we make
              significant changes, we will notify you through the app or via
              email. Continued use of the service after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="mb-3 text-lg font-semibold text-ink">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or how your data
              is handled, reach out to us:
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