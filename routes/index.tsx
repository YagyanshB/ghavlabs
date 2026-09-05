import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

/* ── Ghav Labs Logo (inline SVG + text) ── */
function GhavLogo({ size = "default" }: { size?: "default" | "small" }) {
  const textClass = size === "small" ? "text-base" : "text-lg";
  return (
    <span className="inline-flex items-center gap-2">
      {/* Abstract G mark — three dots arranged in an arc */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="6" cy="16" r="3" fill="#1A1A1A" />
        <circle cx="12" cy="7" r="3" fill="#1A1A1A" />
        <circle cx="18" cy="16" r="3" fill="#1A1A1A" />
        <path d="M18 16 C18 16, 18 20, 12 20" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
      <span
        className={`${textClass} font-medium tracking-tight text-[#1A1A1A]`}
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        ghav labs
      </span>
    </span>
  );
}

/* ── Phone Mockup — Clinician variant ── */
function ClinicianPhoneMockup() {
  return (
    <div className="relative">
      <div className="absolute inset-0 -m-8 rounded-3xl bg-gradient-to-br from-[#F5F5F5] to-[#EBEBEB] blur-2xl opacity-80" />
      <div className="relative w-[260px] sm:w-[280px] rounded-[2.5rem] border-[6px] border-[#1A1A1A] bg-white shadow-2xl overflow-hidden">
        <div className="mx-auto mt-2 h-5 w-24 rounded-full bg-[#1A1A1A]" />
        <div className="px-5 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-medium text-[#999]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              ghav labs
            </span>
            <span className="text-[10px] text-[#999]">Today</span>
          </div>

          <div className="flex flex-col items-center py-3">
            <div className="relative h-28 w-28">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" stroke="#F0F0F0" strokeWidth="8" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#1A1A1A"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(77 / 100) * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-2xl font-bold text-[#1A1A1A]"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  77
                </span>
                <span className="text-[9px] text-[#999]">out of 100</span>
              </div>
            </div>
            <span className="text-xs font-medium text-[#4CAF50] mt-2">+5 from last week</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-[#F8F8F8] p-3">
              <p className="text-[10px] text-[#999] uppercase tracking-wide">Next scan</p>
              <p className="text-sm font-bold text-[#1A1A1A]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                6 days
              </p>
            </div>
            <div className="rounded-xl bg-[#F8F8F8] p-3">
              <p className="text-[10px] text-[#999] uppercase tracking-wide">Assessments</p>
              <p className="text-sm font-bold text-[#1A1A1A]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                12
              </p>
            </div>
          </div>

          <div className="space-y-2 pb-4">
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-[#999]">Granulation</span>
                <span className="font-medium text-[#1A1A1A]">72%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#F0F0F0]">
                <div className="h-full w-[72%] rounded-full bg-[#1A1A1A]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-[#999]">Pain level</span>
                <span className="font-medium text-[#1A1A1A]">3/10</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#F0F0F0]">
                <div className="h-full w-[30%] rounded-full bg-[#1A1A1A]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Phone Mockup — Patient variant ── */
function PatientPhoneMockup() {
  return (
    <div className="relative">
      <div className="absolute inset-0 -m-8 rounded-3xl bg-gradient-to-br from-[#F0F8F7] to-[#E8F4F2] blur-2xl opacity-80" />
      <div className="relative w-[260px] sm:w-[280px] rounded-[2.5rem] border-[6px] border-[#1A1A1A] bg-white shadow-2xl overflow-hidden">
        <div className="mx-auto mt-2 h-5 w-24 rounded-full bg-[#1A1A1A]" />
        <div className="px-5 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-medium text-[#999]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              ghav labs
            </span>
            <span className="text-[10px] text-[#999]">My Wound</span>
          </div>

          {/* Healing score circle — calming teal */}
          <div className="flex flex-col items-center py-3">
            <div className="relative h-28 w-28">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" stroke="#F0F0F0" strokeWidth="8" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#00A89D"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(72 / 100) * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-lg font-bold text-[#1A1A1A]"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Your healing
                </span>
                <span className="text-[9px] text-[#999]">score</span>
              </div>
            </div>
            <span className="text-xs font-medium text-[#00A89D] mt-2">Next check-in: 3 days</span>
          </div>

          {/* Progress bar */}
          <div className="space-y-2 pb-2">
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-[#999]">72% healed</span>
                <span className="font-medium text-[#00A89D]">On track</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#F0F0F0]">
                <div className="h-full w-[72%] rounded-full bg-[#00A89D] transition-all" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pb-4">
            <div className="rounded-xl bg-[#F0F8F7] p-3">
              <p className="text-[10px] text-[#999] uppercase tracking-wide">Photos sent</p>
              <p className="text-sm font-bold text-[#1A1A1A]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                7
              </p>
            </div>
            <div className="rounded-xl bg-[#F0F8F7] p-3">
              <p className="text-[10px] text-[#999] uppercase tracking-wide">Nurse reviewed</p>
              <p className="text-sm font-bold text-[#1A1A1A]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                All
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Clinician landing content ── */
const CLINICIAN_STATS = [
  {
    value: "30s",
    label: "Assessment time",
    desc: "Complete wound analysis from a photo and voice note",
  },
  {
    value: "6",
    label: "Metrics tracked",
    desc: "Area, granulation, slough, necrotic, pain, healing score",
  },
  {
    value: "256-bit",
    label: "Encryption",
    desc: "End-to-end encrypted analysis. Your data stays protected",
  },
];

const CLINICIAN_STEPS = [
  {
    title: "Capture",
    desc: "Take a photo of the wound. Speak your clinical observations. Ghav's AI documents everything.",
  },
  {
    title: "Track",
    desc: "Every assessment builds a healing trajectory. See progress clearly over weeks and months.",
  },
  {
    title: "Act",
    desc: "Wounds that aren't healing as expected surface to the top. Clinicians decide what to do next.",
  },
];

/* ── Patient landing content ── */
const PATIENT_STATS = [
  {
    value: "30s",
    label: "Photo capture",
    desc: "Take a wound photo on your phone. Your nurse sees it without a visit.",
  },
  {
    value: "24h",
    label: "Review time",
    desc: "Your nurse reviews every photo and updates your care plan.",
  },
  {
    value: "NHS",
    label: "Compliant",
    desc: "Your data stays encrypted and is only shared with your care team.",
  },
];

const PATIENT_STEPS = [
  {
    title: "Photo",
    desc: "Open the app and take a photo of your wound. That's it — no forms to fill in.",
  },
  {
    title: "Note",
    desc: "Add a quick note if something's changed. Your nurse sees the photo and your message together.",
  },
  {
    title: "Progress",
    desc: "See how your wound is doing over time. Your nurse tracks it alongside you.",
  },
];

function LandingPage() {
  const [mode, setMode] = useState<"clinician" | "patient">("clinician");

  const isClinician = mode === "clinician";
  const stats = isClinician ? CLINICIAN_STATS : PATIENT_STATS;
  const steps = isClinician ? CLINICIAN_STEPS : PATIENT_STEPS;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ─── Header / Nav ─── */}
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/">
          <GhavLogo />
        </Link>

        {/* Center pill toggle */}
        <div className="hidden sm:flex items-center border border-[#E5E5E5] rounded-full overflow-hidden text-sm">
          <button
            onClick={() => setMode("clinician")}
            className={`px-5 py-1.5 font-medium transition-colors ${
              isClinician ? "bg-[#1A1A1A] text-white" : "text-[#666] hover:text-[#1A1A1A]"
            }`}
          >
            Clinicians
          </button>
          <button
            onClick={() => setMode("patient")}
            className={`px-5 py-1.5 font-medium transition-colors ${
              !isClinician ? "bg-[#1A1A1A] text-white" : "text-[#666] hover:text-[#1A1A1A]"
            }`}
          >
            Patients
          </button>
        </div>

        {/* Right links */}
        <div className="flex items-center gap-6 text-sm">
          <Link to="/pricing" className="text-[#666] hover:text-[#1A1A1A] transition-colors hidden sm:inline">
            Pricing
          </Link>
          <Link to="/login" className="text-[#1A1A1A] font-medium hover:opacity-70 transition-opacity">
            Log in
          </Link>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left text */}
          <div className="flex-1 max-w-xl">
            {isClinician ? (
              <>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] text-[#1A1A1A] tracking-tight">
                  Track wounds.
                  <br />
                  Act earlier.
                </h1>
                <p className="mt-6 text-lg text-[#666] leading-relaxed max-w-md">
                  Know which wounds are healing — and which need attention.
                </p>
                <div className="mt-10">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-[#1A1A1A] text-white text-sm font-semibold rounded-full hover:bg-[#333] transition-colors"
                  >
                    Get started &rarr;
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] text-[#1A1A1A] tracking-tight">
                  See how
                  <br />
                  you&apos;re healing.
                </h1>
                <p className="mt-6 text-lg text-[#666] leading-relaxed max-w-md">
                  Check your wound progress and share updates with your nurse — no appointment needed.
                </p>
                <div className="mt-10">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-[#1A1A1A] text-white text-sm font-semibold rounded-full hover:bg-[#333] transition-colors"
                  >
                    Log in &rarr;
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Right phone mockup */}
          <div className="flex-shrink-0">{isClinician ? <ClinicianPhoneMockup /> : <PatientPhoneMockup />}</div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="bg-[#F5F5F5]">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {stats.map(stat => (
              <div key={stat.label}>
                <p className="text-6xl md:text-7xl font-bold text-[#1A1A1A] tracking-tight">{stat.value}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-[#999]">{stat.label}</p>
                <p className="mt-2 text-[#666] leading-relaxed text-sm">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6B8FAD] mb-4">How it works</p>
        <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] tracking-tight mb-16">
          {isClinician ? "Three steps to clarity" : "How it works for you"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {steps.map((step, i) => (
            <div key={step.title}>
              <p className="text-6xl font-bold text-[#E5E5E5] mb-4">{i + 1}</p>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">{step.title}</h3>
              <p className="text-[#666] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] tracking-tight mb-8">
          {isClinician ? "Ready to see it in action?" : "Check in on your wound"}
        </h2>
        <Link
          to="/login"
          className="inline-flex items-center justify-center px-8 py-3.5 bg-[#1A1A1A] text-white text-sm font-semibold rounded-full hover:bg-[#333] transition-colors"
        >
          {isClinician ? "Sign in" : "Get started"}
        </Link>
      </section>

      {/* ─── Footer ─── */}
      <footer className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
        <p className="text-sm text-[#999]">&copy; 2026 Ghav Labs. All rights reserved.</p>
        <Link to="/slides" className="text-sm text-[#999] hover:text-[#1A1A1A] transition-colors">
          Slides
        </Link>
      </footer>
    </div>
  );
}
