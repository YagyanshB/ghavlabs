import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

/* ── Ghav Labs Logo (reused from landing) ── */
function GhavLogo() {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="6" cy="16" r="3" fill="#1A1A1A" />
        <circle cx="12" cy="7" r="3" fill="#1A1A1A" />
        <circle cx="18" cy="16" r="3" fill="#1A1A1A" />
        <path d="M18 16 C18 16, 18 20, 12 20" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
      <span
        className="text-lg font-medium tracking-tight text-[#1A1A1A]"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        ghav labs
      </span>
    </span>
  );
}

/* ── Tier data ── */
interface Tier {
  name: string;
  audience: string;
  price: string;
  priceNote?: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

const TIERS: Tier[] = [
  {
    name: "Community",
    audience: "Individual district nursing teams or GP practices",
    price: "£4",
    priceNote: "per wound per month — from £200/month for small teams",
    features: [
      "Up to 50 active wounds tracked",
      "Clinician dashboard and triage alerts",
      "Wound assessment capture with Tandem AI documentation",
      "Healing trajectory tracking",
      "Photo capture and timeline",
      "Email support",
    ],
    cta: "Start free pilot",
  },
  {
    name: "Trust",
    audience: "NHS Trusts or large community services",
    price: "Custom",
    priceNote: "based on caseload",
    features: [
      "Everything in Community",
      "Unlimited active wounds",
      "Multi-team dashboards",
      "EHR integration (EMIS, SystmOne, Rio)",
      "Patient-facing portal",
      "Dedicated account manager",
      "Onboarding and training",
      "SNOMED CT coding support",
    ],
    cta: "Book a demo",
    highlighted: true,
  },
  {
    name: "ICB",
    audience: "Integrated Care Boards — population-level wound care",
    price: "£0.80–£1.20",
    priceNote: "per registered patient per year",
    features: [
      "Everything in Trust",
      "Population health analytics",
      "Cross-trust wound care benchmarking",
      "Outcome-based pricing option available",
      "NHS Data Security and Protection Toolkit compliant",
      "DCB0129 clinical safety case",
      "Dedicated implementation team",
      "Quarterly business reviews",
    ],
    cta: "Talk to us",
  },
];

/* ── Procurement steps ── */
const STEPS = [
  {
    number: "1",
    title: "Pilot",
    desc: "Start with a 12-week pilot on one team. No procurement needed for pilots under £10K.",
  },
  {
    number: "2",
    title: "Evaluate",
    desc: "Measure time saved, wound healing outcomes, and clinician satisfaction against baseline.",
  },
  {
    number: "3",
    title: "Scale",
    desc: "Roll out across your Trust or ICB through existing digital health procurement frameworks (G-Cloud, DOS).",
  },
];

/* ── FAQs ── */
const FAQS = [
  {
    q: "Is Ghav Labs on G-Cloud?",
    a: "Yes. Ghav Labs is listed on the G-Cloud 14 framework, making procurement straightforward for NHS organisations.",
  },
  {
    q: "What about DTAC compliance?",
    a: "Ghav Labs meets NHS Digital Technology Assessment Criteria (DTAC) requirements including clinical safety (DCB0129/DCB0160), data protection, and technical security standards.",
  },
  {
    q: "Can we start without formal procurement?",
    a: "Yes. Pilots under £10K can typically be approved at team or service level without a full procurement process.",
  },
  {
    q: "Do you offer outcome-based pricing?",
    a: "For ICB-level contracts, we offer an outcome-based model where pricing is linked to measurable improvements in wound healing times and reduced nursing visits.",
  },
  {
    q: "What's the typical ROI?",
    a: "NHS organisations typically see 2-3x ROI within 6 months through reduced healing times (fewer nurse visits), earlier deterioration detection (preventing complications), and time saved on documentation.",
  },
];

/* ── Pricing Card ── */
function PricingCard({ tier }: { tier: Tier }) {
  return (
    <div
      className={`flex flex-col rounded-xl border bg-white p-8 ${
        tier.highlighted ? "border-[#1A1A1A] ring-1 ring-[#1A1A1A] relative" : "border-[#E5E5E5]"
      }`}
    >
      {tier.highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-[11px] font-semibold uppercase tracking-widest px-4 py-1 rounded-full">
          Recommended
        </span>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-[#1A1A1A] mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {tier.name}
        </h3>
        <p className="text-sm text-[#666]">{tier.audience}</p>
      </div>

      <div className="mb-8">
        <span
          className="text-4xl font-bold text-[#1A1A1A] tracking-tight"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {tier.price}
        </span>
        {tier.priceNote && <p className="text-sm text-[#666] mt-1">{tier.priceNote}</p>}
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {tier.features.map(feature => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-[#444]">
            <Check className="h-4 w-4 text-[#1A1A1A] mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        className={`w-full py-3 px-6 rounded-full text-sm font-semibold transition-colors ${
          tier.highlighted
            ? "bg-[#1A1A1A] text-white hover:bg-[#333]"
            : "bg-white text-[#1A1A1A] border border-[#1A1A1A] hover:bg-[#F5F5F5]"
        }`}
      >
        {tier.cta}
      </button>
    </div>
  );
}

/* ── FAQ Item ── */
function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-b border-[#E5E5E5] py-6">
      <h4 className="text-base font-bold text-[#1A1A1A] mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {q}
      </h4>
      <p className="text-sm text-[#666] leading-relaxed">{a}</p>
    </div>
  );
}

/* ── Main Page ── */
function PricingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ─── Header ─── */}
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/">
          <GhavLogo />
        </Link>
        <Link to="/" className="text-sm text-[#666] hover:text-[#1A1A1A] transition-colors">
          &larr; Back to home
        </Link>
      </header>

      {/* ─── Hero ─── */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-16 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A1A1A] tracking-tight leading-[1.1]">
          Built for NHS teams.
          <br />
          Priced to scale.
        </h1>
      </section>

      {/* ─── Pricing Cards ─── */}
      <section className="max-w-6xl mx-auto px-6 pb-20 md:pb-28">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-5 lg:gap-8 items-start">
          {TIERS.map(tier => (
            <PricingCard key={tier.name} tier={tier} />
          ))}
        </div>
      </section>

      {/* ─── How NHS Organisations Buy ─── */}
      <section className="bg-[#F5F5F5]">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#999] mb-4">Procurement</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] tracking-tight mb-16">
            How NHS organisations buy Ghav Labs
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {STEPS.map(step => (
              <div key={step.title}>
                <p className="text-6xl font-bold text-[#E0E0E0] mb-4">{step.number}</p>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">{step.title}</h3>
                <p className="text-[#666] leading-relaxed text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="max-w-3xl mx-auto px-6 py-20 md:py-28">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] tracking-tight mb-10">
          Frequently asked questions
        </h2>
        <div>
          {FAQS.map(faq => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] tracking-tight mb-4">
          Ready to improve wound care outcomes?
        </h2>
        <p className="text-lg text-[#666] mb-10">Book a 30-minute call with our NHS partnerships team.</p>
        <button className="inline-flex items-center justify-center px-8 py-3.5 bg-[#1A1A1A] text-white text-sm font-semibold rounded-full hover:bg-[#333] transition-colors">
          Book a call
        </button>
      </section>

      {/* ─── Footer ─── */}
      <footer className="max-w-6xl mx-auto px-6 py-8">
        <p className="text-sm text-[#999] text-center">&copy; 2026 Ghav Labs. All rights reserved.</p>
      </footer>
    </div>
  );
}
