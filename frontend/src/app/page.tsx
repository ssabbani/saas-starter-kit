"use client";

import { Navbar } from "@/components/layout/navbar";
import { plans } from "@/lib/pricing";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Code2,
  CreditCard,
  Key,
  Layers,
  Rocket,
  Shield,
  Sparkles,
  Terminal,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Intersection Observer hook for scroll reveals                      */
/* ------------------------------------------------------------------ */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.querySelectorAll(".reveal").forEach((child) =>
            child.classList.add("visible"),
          );
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ================================================================== */
/*  PAGE                                                               */
/* ================================================================== */
export default function LandingPage() {
  return (
    <div className="bg-slate-950 text-white">
      <Navbar />
      <Hero />
      <TrustBar />
      <Features />
      <HowItWorks />
      <Pricing />
      <Faq />
      <CtaBanner />
      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  HERO                                                               */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Gradient mesh */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,.25) 0%, transparent 60%), radial-gradient(ellipse 50% 80% at 80% 50%, rgba(99,102,241,.12) 0%, transparent 50%)",
        }}
      />

      <div className="mx-auto flex max-w-6xl flex-col items-center gap-16 px-4 sm:px-6 lg:flex-row lg:px-8">
        {/* Copy */}
        <div className="max-w-xl text-center lg:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Ship Your SaaS in{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Days, Not Months
            </span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-400">
            Authentication, billing, admin, and user management — all wired up
            and ready to customize. Stop rebuilding infrastructure and start
            building your product.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-slate-300 transition-colors hover:border-white/30 hover:text-white"
            >
              View Demo
            </Link>
          </div>
        </div>

        {/* Mockup dashboard illustration */}
        <div className="relative w-full max-w-lg shrink-0">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-sm">
            {/* Title bar */}
            <div className="flex items-center gap-2 pb-3">
              <span className="h-3 w-3 rounded-full bg-red-400/70" />
              <span className="h-3 w-3 rounded-full bg-amber-400/70" />
              <span className="h-3 w-3 rounded-full bg-green-400/70" />
              <span className="ml-3 h-2.5 w-32 rounded bg-white/10" />
            </div>
            {/* Fake cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Users", value: "2,481", color: "from-indigo-500/20" },
                { label: "MRR", value: "$12.4k", color: "from-violet-500/20" },
                { label: "API Calls", value: "1.2M", color: "from-blue-500/20" },
              ].map((c) => (
                <div
                  key={c.label}
                  className={`rounded-lg bg-gradient-to-b ${c.color} to-transparent border border-white/10 p-3`}
                >
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    {c.label}
                  </p>
                  <p className="mt-1 text-base font-bold text-white">
                    {c.value}
                  </p>
                </div>
              ))}
            </div>
            {/* Fake chart */}
            <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex items-end gap-1 h-16">
                {[35, 50, 40, 65, 55, 80, 70, 90, 75, 95, 85, 100].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-gradient-to-t from-indigo-500 to-indigo-400"
                      style={{ height: `${h}%`, opacity: 0.4 + (h / 100) * 0.6 }}
                    />
                  ),
                )}
              </div>
            </div>
            {/* Fake table rows */}
            <div className="mt-3 space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
                >
                  <div className="h-6 w-6 rounded-full bg-white/10" />
                  <div className="flex-1 space-y-1">
                    <div className="h-2 w-24 rounded bg-white/10" />
                    <div className="h-1.5 w-16 rounded bg-white/5" />
                  </div>
                  <div className="h-5 w-12 rounded-full bg-indigo-500/20" />
                </div>
              ))}
            </div>
          </div>
          {/* Glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl opacity-30 blur-3xl"
            style={{
              background:
                "radial-gradient(circle at 60% 40%, rgba(99,102,241,.4), transparent 70%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  TRUST BAR                                                          */
/* ------------------------------------------------------------------ */
function TrustBar() {
  const ref = useReveal();
  const items = ["Next.js", "FastAPI", "PostgreSQL", "Stripe", "Tailwind CSS"];
  return (
    <section ref={ref} className="border-y border-white/5 bg-slate-950 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="reveal text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
          Built with
        </p>
        <div className="reveal reveal-delay-1 mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {items.map((name) => (
            <span
              key={name}
              className="text-sm font-semibold text-slate-400 transition-colors hover:text-white"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FEATURES                                                           */
/* ------------------------------------------------------------------ */
const features = [
  {
    icon: Shield,
    title: "Auth & Security",
    description:
      "JWT auth, email verification, password reset — production-ready from day one.",
  },
  {
    icon: CreditCard,
    title: "Stripe Billing",
    description:
      "Subscriptions, trials, upgrades, and a customer portal — all wired to Stripe.",
  },
  {
    icon: Users,
    title: "Admin Panel",
    description:
      "User management, analytics, and activity logs for full visibility.",
  },
  {
    icon: Key,
    title: "Role-Based Access",
    description:
      "User, admin, and super_admin roles with granular permissions.",
  },
  {
    icon: Zap,
    title: "API-First",
    description:
      "RESTful API with auto-generated docs, rate limiting, and API key management.",
  },
  {
    icon: Terminal,
    title: "Developer Experience",
    description:
      "Docker Compose, hot reload, Alembic migrations, typed schemas.",
  },
];

function Features() {
  const ref = useReveal();
  return (
    <section id="features" ref={ref} className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
            Everything you need
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Built for developers, ready for production
          </h2>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`reveal reveal-delay-${(i % 3) + 1} group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-indigo-500/30 hover:bg-white/[0.05]`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 transition-colors group-hover:bg-indigo-500/20">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  HOW IT WORKS                                                       */
/* ------------------------------------------------------------------ */
const steps = [
  {
    num: "1",
    icon: Code2,
    title: "Clone & Configure",
    description: "Clone the repo, add your env vars, docker compose up.",
  },
  {
    num: "2",
    icon: Layers,
    title: "Customize",
    description: "Add your domain logic on top of the foundation.",
  },
  {
    num: "3",
    icon: Rocket,
    title: "Ship",
    description: "Deploy to any cloud. Your SaaS is live.",
  },
];

function HowItWorks() {
  const ref = useReveal();
  return (
    <section ref={ref} className="border-y border-white/5 py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="reveal text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
            Three steps
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            From zero to production
          </h2>
        </div>

        <div className="relative mt-16">
          {/* Connecting line */}
          <div
            aria-hidden
            className="absolute left-8 top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-indigo-500/40 via-indigo-500/20 to-transparent sm:block"
          />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className={`reveal reveal-delay-${i + 1} flex items-start gap-6`}
              >
                <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10">
                  <span className="text-lg font-bold text-indigo-400">
                    {step.num}
                  </span>
                </div>
                <div className="pt-2">
                  <h3 className="text-lg font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  PRICING                                                            */
/* ------------------------------------------------------------------ */
function Pricing() {
  const ref = useReveal();
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" ref={ref} className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-3 text-slate-400">
            Start free. Upgrade when you need more.
          </p>
        </div>

        {/* Toggle */}
        <div className="reveal reveal-delay-1 mt-10 flex items-center justify-center gap-3">
          <span
            className={`text-sm font-medium ${!annual ? "text-white" : "text-slate-500"}`}
          >
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              annual ? "bg-indigo-600" : "bg-slate-700"
            }`}
            role="switch"
            aria-checked={annual}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                annual ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium ${annual ? "text-white" : "text-slate-500"}`}
          >
            Annual
          </span>
          {annual && (
            <span className="rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-semibold text-green-400">
              Save 20%
            </span>
          )}
        </div>

        {/* Cards */}
        <div className="reveal reveal-delay-2 mt-12 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => {
            const price = annual ? plan.annual_price : plan.monthly_price;
            return (
              <div
                key={plan.key}
                className={`relative flex flex-col rounded-2xl border p-8 transition-shadow hover:shadow-xl hover:shadow-indigo-500/5 ${
                  plan.popular
                    ? "scale-[1.02] border-indigo-500 bg-white/[0.06] shadow-lg shadow-indigo-500/10 lg:scale-105"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white shadow-sm">
                      <Sparkles className="h-3.5 w-3.5" />
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {plan.description}
                </p>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-white">
                    ${price}
                  </span>
                  <span className="text-sm text-slate-400">
                    /{annual ? "yr" : "mo"}
                  </span>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-slate-300"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-8 block rounded-xl py-2.5 text-center text-sm font-semibold transition-colors ${
                    plan.popular
                      ? "bg-indigo-600 text-white hover:bg-indigo-500"
                      : "border border-white/15 text-slate-300 hover:border-white/30 hover:text-white"
                  }`}
                >
                  Start Free Trial
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/pricing"
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
          >
            Compare all plan details &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ                                                                */
/* ------------------------------------------------------------------ */
const faqs = [
  {
    q: "Is this a template or a framework?",
    a: "It's a fully functional starter kit — a production-ready codebase you clone and customize. It's not a library you install; it's your codebase from day one.",
  },
  {
    q: "Can I use this for commercial projects?",
    a: "Absolutely. The starter kit is licensed for commercial use. Build your product, ship it, and keep 100% of the revenue.",
  },
  {
    q: "What databases are supported?",
    a: "PostgreSQL is the default and recommended database. The ORM layer (SQLAlchemy) makes it straightforward to adapt if needed.",
  },
  {
    q: "Do I need Stripe set up to start?",
    a: "No. The app runs fully without Stripe configured — billing features gracefully degrade. Add your Stripe keys when you're ready to accept payments.",
  },
  {
    q: "How do I deploy this?",
    a: "The included Docker setup works with any cloud provider — AWS, GCP, Railway, Fly.io, or your own server. The frontend deploys to Vercel with zero config.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-sm font-semibold text-white">{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-5 text-sm leading-relaxed text-slate-400">{a}</p>
      )}
    </div>
  );
}

function Faq() {
  const ref = useReveal();
  return (
    <section id="faq" ref={ref} className="border-t border-white/5 py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="reveal text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Common questions
          </h2>
        </div>
        <div className="reveal reveal-delay-1 mt-12">
          {faqs.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  CTA BANNER                                                         */
/* ------------------------------------------------------------------ */
function CtaBanner() {
  const ref = useReveal();
  return (
    <section ref={ref} className="py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="reveal relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 px-8 py-16 text-center shadow-2xl shadow-indigo-500/25 sm:px-16">
          {/* Decorative circles */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-2xl"
          />

          <h2 className="relative text-3xl font-bold text-white sm:text-4xl">
            Ready to build?
          </h2>
          <p className="relative mt-3 text-base text-indigo-100">
            Get your SaaS off the ground today. No credit card required.
          </p>
          <Link
            href="/signup"
            className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition-transform hover:scale-105"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FOOTER                                                             */
/* ------------------------------------------------------------------ */
function Footer() {
  return (
    <footer className="border-t border-white/10 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-bold text-white">
              SaaS Kit
            </Link>
            <nav className="flex flex-wrap gap-x-5 gap-y-2">
              {[
                { href: "/pricing", label: "Pricing" },
                { href: "#features", label: "Features" },
                { href: "/terms", label: "Terms" },
                { href: "/privacy", label: "Privacy" },
              ].map((link) =>
                link.href.startsWith("#") ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-xs text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-xs text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </nav>
          </div>
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} SaaS Kit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
