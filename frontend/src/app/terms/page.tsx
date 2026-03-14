import Link from "next/link";

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-amber-600 font-medium">
          This is a template — customize these terms for your specific service
          before launching.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Last updated: March 2026
        </p>

        <div className="prose prose-slate mt-10 max-w-none text-sm leading-relaxed text-slate-600 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-800">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using our service, you agree to be bound by these
            Terms of Service. If you do not agree, you may not use the service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            We provide a software-as-a-service platform that includes API
            access, user management, billing, and related tools. The specific
            features available depend on your subscription plan.
          </p>

          <h2>3. Account Registration</h2>
          <p>
            You must provide accurate information when creating an account. You
            are responsible for maintaining the security of your credentials and
            for all activity under your account.
          </p>

          <h2>4. Billing and Payments</h2>
          <p>
            Paid plans are billed in advance on a monthly or annual basis.
            Refunds are available within 30 days of purchase. Prices may change
            with 30 days notice.
          </p>

          <h2>5. Acceptable Use</h2>
          <p>
            You agree not to misuse the service, including but not limited to:
            violating laws, infringing on intellectual property, distributing
            malware, or attempting to gain unauthorized access.
          </p>

          <h2>6. Data and Privacy</h2>
          <p>
            Your use of the service is also governed by our{" "}
            <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700">
              Privacy Policy
            </Link>
            . We take reasonable measures to protect your data but cannot
            guarantee absolute security.
          </p>

          <h2>7. Intellectual Property</h2>
          <p>
            The service and its original content are owned by us. Your data
            remains yours. You grant us a limited license to process your data
            as needed to provide the service.
          </p>

          <h2>8. Termination</h2>
          <p>
            Either party may terminate at any time. Upon termination, your
            access ceases and we may delete your data after a reasonable
            retention period (typically 30 days).
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, we shall not be liable for
            any indirect, incidental, or consequential damages arising from
            your use of the service.
          </p>

          <h2>10. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the
            service after changes constitutes acceptance of the new terms.
          </p>

          <h2>11. Contact</h2>
          <p>
            Questions about these terms? Contact us at{" "}
            <span className="text-slate-800">legal@example.com</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
