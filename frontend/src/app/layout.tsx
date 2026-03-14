import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "SaaS Starter Kit",
  description: "Production-ready SaaS starter kit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <AuthProvider>
          <ToastProvider>
            <div id="main-content">{children}</div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
