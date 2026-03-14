import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <Link
          href="/"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          &larr; Back to Home
        </Link>

        <h1 className="mt-8 text-3xl font-bold text-slate-900">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-amber-600 font-medium">
          This is a template — customize this policy for your specific data
          practices before launching.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Last updated: March 2026
        </p>

        <div className="prose prose-slate mt-10 max-w-none text-sm leading-relaxed text-slate-600 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-800">
          <h2>1. Information We Collect</h2>
          <h3>Account Information</h3>
          <p>
            When you create an account, we collect your name, email address,
            and password (stored securely as a hash). If you subscribe to a
            paid plan, payment processing is handled by Stripe — we do not
            store your credit card details.
          </p>
          <h3>Usage Data</h3>
          <p>
            We collect information about how you use the service, including API
            calls, feature usage, and access timestamps. This helps us improve
            the service and enforce plan limits.
          </p>
          <h3>Log Data</h3>
          <p>
            Our servers automatically log information such as IP addresses,
            browser type, and request timestamps for security and debugging
            purposes.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Provide, maintain, and improve the service</li>
            <li>Process transactions and manage subscriptions</li>
            <li>Send transactional emails (verification, password reset, billing)</li>
            <li>Monitor for security threats and abuse</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>3. Data Sharing</h2>
          <p>
            We do not sell your personal data. We may share data with:
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Stripe — for payment processing</li>
            <li>Email providers — for transactional emails</li>
            <li>Law enforcement — when required by law</li>
          </ul>

          <h2>4. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active. After
            account deletion, we remove personal data within 30 days, except
            where retention is required by law.
          </p>

          <h2>5. Your Rights (GDPR)</h2>
          <p>If you are in the EU/EEA, you have the right to:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data in a portable format</li>
            <li>Object to processing</li>
            <li>Withdraw consent</li>
          </ul>
          <p>
            To exercise these rights, contact us at{" "}
            <span className="text-slate-800">privacy@example.com</span>.
          </p>

          <h2>6. Cookies</h2>
          <p>
            We use essential cookies for authentication (JWT tokens stored in
            localStorage). We do not use tracking cookies or third-party
            analytics by default.
          </p>

          <h2>7. Security</h2>
          <p>
            We implement industry-standard security measures including
            encrypted connections (TLS), hashed passwords (bcrypt), and
            regular security audits. No system is 100% secure, but we take
            reasonable precautions.
          </p>

          <h2>8. Children</h2>
          <p>
            Our service is not directed at children under 16. We do not
            knowingly collect data from children.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. We will notify you of
            significant changes via email or a notice on the service.
          </p>

          <h2>10. Contact</h2>
          <p>
            Questions about this policy? Contact us at{" "}
            <span className="text-slate-800">privacy@example.com</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
