import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Stethoscope, Heart } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function GhavLogoSmall() {
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

function LoginPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<"clinician" | "patient" | null>(null);
  const [email, setEmail] = useState("sarah.chen@nhs.net");
  const [password] = useState("••••••••••••");

  // Patient form state
  const [patientName, setPatientName] = useState("Margaret Thornton");
  const [nhsNumber, setNhsNumber] = useState("943 476 2810");

  const handleClinicianSignIn = () => {
    localStorage.setItem("woundwise-auth", "true");
    localStorage.setItem("woundwise-user", "Sarah Chen");
    localStorage.setItem("woundwise-role", "clinician");
    void navigate({ to: "/dashboard" });
  };

  const handlePatientSignIn = () => {
    localStorage.setItem("woundwise-auth", "true");
    localStorage.setItem("woundwise-user", patientName);
    localStorage.setItem("woundwise-role", "patient");
    localStorage.setItem("woundwise-nhs", nhsNumber);
    void navigate({ to: "/my-wounds" });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-center px-6 py-6 border-b border-[#E5E7EB]">
        <Link to="/">
          <GhavLogoSmall />
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-light text-[#0D4F5C]">Welcome back</h1>
            <p className="mt-2 text-[#6B6560]">Sign in to your Ghav Labs account</p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {/* Clinician / Nurse */}
            <button
              onClick={() => setSelectedRole("clinician")}
              className={`relative p-5 rounded-md border text-left transition-all ${
                selectedRole === "clinician"
                  ? "border-[#0D4F5C] bg-[#0D4F5C]/[0.03]"
                  : "border-[#E5E7EB] hover:border-[#D1D5DB]"
              }`}
            >
              <Stethoscope
                className={`h-6 w-6 mb-3 ${selectedRole === "clinician" ? "text-[#0D4F5C]" : "text-[#9CA3AF]"}`}
              />
              <p
                className={`font-display text-sm font-semibold ${
                  selectedRole === "clinician" ? "text-[#0D4F5C]" : "text-[#0D1F23]"
                }`}
              >
                Clinician / Nurse
              </p>
              <p className="text-xs text-[#6B6560] mt-0.5">Clinical dashboard access</p>
            </button>

            {/* Patient / Carer */}
            <button
              onClick={() => setSelectedRole("patient")}
              className={`relative p-5 rounded-md border text-left transition-all ${
                selectedRole === "patient"
                  ? "border-[#00A89D] bg-[#00A89D]/[0.03]"
                  : "border-[#E5E7EB] hover:border-[#D1D5DB]"
              }`}
            >
              <Heart className={`h-6 w-6 mb-3 ${selectedRole === "patient" ? "text-[#00A89D]" : "text-[#9CA3AF]"}`} />
              <p
                className={`font-display text-sm font-semibold ${
                  selectedRole === "patient" ? "text-[#00A89D]" : "text-[#0D1F23]"
                }`}
              >
                Patient / Carer
              </p>
              <p className="text-xs text-[#6B6560] mt-0.5">View your wound progress</p>
            </button>
          </div>

          {/* Login Form — shown when clinician is selected */}
          {selectedRole === "clinician" && (
            <Card className="border-[#E5E7EB] shadow-none">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="border-[#E5E7EB] focus-visible:ring-[#00A89D]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    readOnly
                    className="border-[#E5E7EB] focus-visible:ring-[#00A89D]"
                  />
                </div>
                <Button
                  onClick={handleClinicianSignIn}
                  className="w-full bg-[#0D4F5C] hover:bg-[#0A3F4A] text-white mt-2"
                >
                  Sign in
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Patient Login Form */}
          {selectedRole === "patient" && (
            <Card className="border-[#E5E7EB] shadow-none">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-name">Full name</Label>
                  <Input
                    id="patient-name"
                    type="text"
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    className="border-[#E5E7EB] focus-visible:ring-[#00A89D]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nhs-number">NHS Number</Label>
                  <Input
                    id="nhs-number"
                    type="text"
                    value={nhsNumber}
                    onChange={e => setNhsNumber(e.target.value)}
                    className="border-[#E5E7EB] focus-visible:ring-[#00A89D]"
                  />
                </div>
                <Button
                  onClick={handlePatientSignIn}
                  className="w-full bg-[#00A89D] hover:bg-[#008F86] text-white mt-2"
                >
                  View my wounds
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Back to home */}
          <div className="text-center mt-8">
            <Link to="/" className="text-sm text-[#6B6560] hover:text-[#0D4F5C] transition-colors">
              Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
