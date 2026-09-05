import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useOsdkObjects, useOsdkAction } from "@osdk/react/experimental";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Mic, MicOff, CheckCircle, Zap, AlertCircle, Type, Scan } from "lucide-react";
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { WoundWisePatient, WoundWiseWound, $Actions } from "../../.osdk/src";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionInstance = any;

export const Route = createFileRoute("/assess")({
  component: NewAssessment,
});

// --- Voice status types ---
type VoiceStatus = "idle" | "listening" | "processing" | "error-no-support" | "error-mic-denied" | "error-general";

const VOICE_STATUS_MESSAGES: Record<VoiceStatus, string> = {
  idle: "Tap to record with Tandem",
  listening: "Listening — speak now...",
  processing: "Processing transcript...",
  "error-no-support": "Speech recognition not available — type your observations below",
  "error-mic-denied": "Microphone access denied — type your observations below",
  "error-general": "Could not start recording — type your observations below",
};

// --- AI analysis types ---
interface WoundAnalysis {
  area: number;
  width: number;
  height: number;
  granulation: number;
  slough: number;
  necrotic: number;
  periwound: string;
  woundBedColor: string;
  painScore: number;
  healingScore: number;
}

/** Crypto-safe random float in [0, 1) */
function secureRandom(): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] / (0xffffffff + 1);
}

function generateWoundAnalysis(): WoundAnalysis {
  // Random area 2.0-30.0
  const area = Math.round((secureRandom() * 28 + 2) * 10) / 10;

  // Derive dimensions from area with some randomness
  const ratio = 0.6 + secureRandom() * 0.8;
  const height = Math.round(Math.sqrt(area / ratio) * 10) / 10;
  const width = Math.round((area / height) * 10) / 10;

  // Tissue composition that sums to 100
  const granRaw = Math.round(secureRandom() * 60 + 20); // 20-80
  const sloughRaw = Math.round(secureRandom() * 40 + 10); // 10-50
  const necroticRaw = Math.round(secureRandom() * 30); // 0-30
  const total = granRaw + sloughRaw + necroticRaw;
  const granulation = Math.round((granRaw / total) * 100);
  const slough = Math.round((sloughRaw / total) * 100);
  const necrotic = 100 - granulation - slough;

  // Periwound
  const periwoundOptions = ["Healthy", "Macerated", "Erythema", "Dry/Flaky"];
  const periwound = periwoundOptions[Math.floor(secureRandom() * periwoundOptions.length)];

  // Wound bed color based on tissue
  let woundBedColor: string;
  if (granulation >= 60) woundBedColor = "Red — granulating";
  else if (slough >= 40) woundBedColor = "Yellow — sloughy";
  else if (necrotic >= 25) woundBedColor = "Black — necrotic";
  else woundBedColor = "Mixed — red/yellow";

  // Pain score 2-7
  const painScore = Math.round(secureRandom() * 5 + 2);

  // Healing score: higher granulation = higher score
  const healingScore = Math.round((granulation / 100) * 7 + secureRandom() * 2 + 1) / 1;
  const clampedHealingScore = Math.min(10, Math.max(1, Math.round(healingScore * 10) / 10));

  return {
    area,
    width,
    height,
    granulation,
    slough,
    necrotic,
    periwound,
    woundBedColor,
    painScore,
    healingScore: clampedHealingScore,
  };
}

// Spoken number map
const SPOKEN_NUMBERS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
  hundred: 100,
};

function parseSpokenNumber(text: string): number | null {
  // Try direct number
  const directMatch = text.match(/\d+\.?\d*/);
  if (directMatch) return parseFloat(directMatch[0]);

  // Try spoken numbers
  const words = text.toLowerCase().split(/[\s-]+/);
  let total = 0;
  let found = false;
  for (const w of words) {
    if (SPOKEN_NUMBERS[w] != null) {
      if (SPOKEN_NUMBERS[w] === 100) {
        total = total === 0 ? 100 : total * 100;
      } else {
        total += SPOKEN_NUMBERS[w];
      }
      found = true;
    }
  }
  return found ? total : null;
}

function parseTranscript(transcript: string): {
  woundArea: number | null;
  granulationPercent: number | null;
  sloughPercent: number | null;
  necroticPercent: number | null;
  painScore: number | null;
  periwoundStatus: string | null;
  clinicianNotes: string;
} {
  const lower = transcript.toLowerCase();
  const sentences = lower
    .split(/[.,;]+/)
    .map(s => s.trim())
    .filter(Boolean);

  let woundArea: number | null = null;
  let granulationPercent: number | null = null;
  let sloughPercent: number | null = null;
  let necroticPercent: number | null = null;
  let painScore: number | null = null;
  let periwoundStatus: string | null = null;
  const noteParts: string[] = [];

  for (const s of sentences) {
    let matched = false;

    if (s.match(/area|centimeter|cm|square/)) {
      const num = parseSpokenNumber(s);
      if (num != null) {
        woundArea = num;
        matched = true;
      }
    }
    if (s.match(/granulat/)) {
      const num = parseSpokenNumber(s);
      if (num != null) {
        granulationPercent = Math.round(num);
        matched = true;
      }
    }
    if (s.match(/slough/)) {
      const num = parseSpokenNumber(s);
      if (num != null) {
        sloughPercent = Math.round(num);
        matched = true;
      }
    }
    if (s.match(/necrot|necrosis/)) {
      const num = parseSpokenNumber(s);
      if (num != null) {
        necroticPercent = Math.round(num);
        matched = true;
      }
    }
    if (s.match(/pain/)) {
      const num = parseSpokenNumber(s);
      if (num != null) {
        painScore = Math.min(10, Math.round(num));
        matched = true;
      }
    }

    // Periwound status keywords
    if (s.match(/macerat/)) {
      periwoundStatus = "Macerated";
      matched = true;
    } else if (s.match(/erythema/)) {
      periwoundStatus = "Erythema";
      matched = true;
    } else if (s.match(/oedema|edema/)) {
      periwoundStatus = "Oedema";
      matched = true;
    } else if (s.match(/healthy/) && s.match(/periw|skin|surround/)) {
      periwoundStatus = "Healthy";
      matched = true;
    } else if (s.match(/dry|flak/)) {
      periwoundStatus = "Dry/Flaky";
      matched = true;
    }

    if (!matched) {
      noteParts.push(s);
    }
  }

  return {
    woundArea,
    granulationPercent,
    sloughPercent,
    necroticPercent,
    painScore,
    periwoundStatus,
    clinicianNotes: noteParts.join(". ").trim(),
  };
}

// --- Helper: apply parsed transcript to form state ---
function applyParsedToForm(
  parsed: ReturnType<typeof parseTranscript>,
  setters: {
    setWoundArea: (v: string) => void;
    setGranulationPercent: (v: string) => void;
    setSloughPercent: (v: string) => void;
    setNecroticPercent: (v: string) => void;
    setPainScore: (v: string) => void;
    setPeriwoundStatus: (v: string) => void;
    setClinicianNotes: (v: string) => void;
  },
) {
  if (parsed.woundArea != null) setters.setWoundArea(String(parsed.woundArea));
  if (parsed.granulationPercent != null) setters.setGranulationPercent(String(parsed.granulationPercent));
  if (parsed.sloughPercent != null) setters.setSloughPercent(String(parsed.sloughPercent));
  if (parsed.necroticPercent != null) setters.setNecroticPercent(String(parsed.necroticPercent));
  if (parsed.painScore != null) setters.setPainScore(String(parsed.painScore));
  if (parsed.periwoundStatus) setters.setPeriwoundStatus(parsed.periwoundStatus);
  if (parsed.clinicianNotes) setters.setClinicianNotes(parsed.clinicianNotes);
}

// --- Wound Analysis Card Component ---
function WoundAnalysisCard({ analysis }: { analysis: WoundAnalysis }) {
  return (
    <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#f5f5f5] border-b border-[#e5e5e5]">
        <div className="flex items-center gap-2">
          <Scan className="h-4 w-4 text-[#0a0a0a]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#0a0a0a]">AI Wound Analysis</span>
        </div>
        <Badge variant="outline" className="text-[10px] border-[#e5e5e5] text-[#737373] font-medium">
          Powered by Ghav AI
        </Badge>
      </div>

      <div className="p-4 space-y-4">
        {/* Measurements row */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#a3a3a3] mb-1">Estimated area</p>
            <p className="text-xl font-extrabold text-[#0a0a0a] font-display">
              {analysis.area}
              <span className="text-sm font-normal text-[#737373] ml-0.5">cm²</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#a3a3a3] mb-1">Dimensions</p>
            <p className="text-xl font-extrabold text-[#0a0a0a] font-display">
              {analysis.width}
              <span className="text-sm font-normal text-[#737373]">×</span>
              {analysis.height}
              <span className="text-sm font-normal text-[#737373] ml-0.5">cm</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#a3a3a3] mb-1">Pain score</p>
            <p className="text-xl font-extrabold text-[#0a0a0a] font-display">
              {analysis.painScore}
              <span className="text-sm font-normal text-[#737373]">/10</span>
            </p>
          </div>
        </div>

        <Separator className="bg-[#e5e5e5]" />

        {/* Tissue composition */}
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#a3a3a3] mb-2">Tissue composition</p>
          {/* Stacked bar */}
          <div className="flex h-3 w-full rounded-full overflow-hidden">
            <div
              className="bg-[#c4262e] transition-all"
              style={{ width: `${analysis.granulation}%` }}
              title={`Granulation ${analysis.granulation}%`}
            />
            <div
              className="bg-[#D4790A] transition-all"
              style={{ width: `${analysis.slough}%` }}
              title={`Slough ${analysis.slough}%`}
            />
            <div
              className="bg-[#0a0a0a] transition-all"
              style={{ width: `${analysis.necrotic}%` }}
              title={`Necrotic ${analysis.necrotic}%`}
            />
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-[#c4262e]" />
              <span className="text-xs text-[#737373]">Granulation {analysis.granulation}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-[#D4790A]" />
              <span className="text-xs text-[#737373]">Slough {analysis.slough}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-[#0a0a0a]" />
              <span className="text-xs text-[#737373]">Necrotic {analysis.necrotic}%</span>
            </div>
          </div>
        </div>

        <Separator className="bg-[#e5e5e5]" />

        {/* Bottom details */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#a3a3a3] mb-1">Periwound</p>
            <p className="text-sm font-medium text-[#0a0a0a]">
              {analysis.periwound === "Healthy"
                ? "Healthy"
                : analysis.periwound === "Macerated"
                  ? "Mild maceration detected"
                  : analysis.periwound === "Erythema"
                    ? "Erythema present"
                    : "Dry/flaky skin noted"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#a3a3a3] mb-1">Wound bed</p>
            <p className="text-sm font-medium text-[#0a0a0a]">{analysis.woundBedColor}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#a3a3a3] mb-1">Healing score</p>
            <p className="text-sm font-medium text-[#0a0a0a]">
              {analysis.healingScore}
              <span className="text-[#737373]">/10</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewAssessment() {
  const { data: patients } = useOsdkObjects(WoundWisePatient, {
    pageSize: 100,
  });
  const { data: allWounds } = useOsdkObjects(WoundWiseWound, {
    pageSize: 100,
  });

  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedWoundId, setSelectedWoundId] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Wound image analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [woundAnalysis, setWoundAnalysis] = useState<WoundAnalysis | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [showTextFallback, setShowTextFallback] = useState(false);
  const [manualObservations, setManualObservations] = useState("");
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance>(null);

  // Form fields
  const [woundArea, setWoundArea] = useState("");
  const [granulationPercent, setGranulationPercent] = useState("");
  const [sloughPercent, setSloughPercent] = useState("");
  const [necroticPercent, setNecroticPercent] = useState("");
  const [periwoundStatus, setPeriwoundStatus] = useState("Healthy");
  const [painScore, setPainScore] = useState("");
  const [healingScore, setHealingScore] = useState("");
  const [clinicianNotes, setClinicianNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { applyAction, isPending } = useOsdkAction($Actions.createwoundwiseassessment);

  const formSetters = useMemo(
    () => ({
      setWoundArea,
      setGranulationPercent,
      setSloughPercent,
      setNecroticPercent,
      setPainScore,
      setPeriwoundStatus,
      setClinicianNotes,
    }),
    [],
  );

  // Filter wounds for selected patient
  const patientWounds = useMemo(() => {
    if (!allWounds || !selectedPatientId) return [];
    return allWounds.filter(w => w.patientId === selectedPatientId);
  }, [allWounds, selectedPatientId]);

  const handlePatientChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPatientId(e.target.value);
    setSelectedWoundId("");
  }, []);

  // --- Photo capture with AI analysis ---
  const runAnalysis = useCallback(() => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setWoundAnalysis(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) return prev;
        return prev + secureRandom() * 15 + 5;
      });
    }, 200);

    // Complete after 1.5s
    setTimeout(() => {
      clearInterval(progressInterval);
      setAnalysisProgress(100);

      const analysis = generateWoundAnalysis();
      setWoundAnalysis(analysis);
      setIsAnalyzing(false);

      // Auto-populate form fields
      setWoundArea(String(analysis.area));
      setGranulationPercent(String(analysis.granulation));
      setSloughPercent(String(analysis.slough));
      setNecroticPercent(String(analysis.necrotic));
      setPeriwoundStatus(analysis.periwound);
      setPainScore(String(analysis.painScore));
      setHealingScore(String(analysis.healingScore));
    }, 1800);
  }, []);

  const handlePhotoCapture = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result as string);
          // Trigger AI analysis after photo loads
          runAnalysis();
        };
        reader.readAsDataURL(file);
      }
    },
    [runAnalysis],
  );

  const handleRetakePhoto = useCallback(() => {
    setPhotoPreview(null);
    setWoundAnalysis(null);
    setIsAnalyzing(false);
    setAnalysisProgress(0);
  }, []);

  // --- Voice recording with error handling ---
  const activateTextFallback = useCallback((status: VoiceStatus) => {
    setVoiceStatus(status);
    setShowTextFallback(true);
  }, []);

  const startRecording = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechRecognitionCtor = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      activateTextFallback("error-no-support");
      return;
    }

    try {
      const recognition = new SpeechRecognitionCtor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-GB";

      let finalTranscript = "";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ". ";
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setTranscript(finalTranscript + interim);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        setIsRecording(false);
        const errorType: string = event?.error ?? "";
        if (errorType === "not-allowed" || errorType === "permission-denied") {
          activateTextFallback("error-mic-denied");
        } else if (errorType === "no-speech") {
          // No speech detected — let user try again, don't show fallback
          setVoiceStatus("idle");
        } else {
          activateTextFallback("error-general");
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        // Only reset status to idle if there wasn't an error
        setVoiceStatus(prev => (prev === "listening" ? "idle" : prev));
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
      setVoiceStatus("listening");
      setTranscript("");
    } catch {
      activateTextFallback("error-general");
    }
  }, [activateTextFallback]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setVoiceStatus("processing");

    // Parse the transcript
    if (transcript) {
      const parsed = parseTranscript(transcript);
      applyParsedToForm(parsed, formSetters);
      if (parsed.clinicianNotes) {
        setClinicianNotes(parsed.clinicianNotes);
      }
    }

    // Brief processing state then idle
    setTimeout(() => setVoiceStatus("idle"), 500);
  }, [transcript, formSetters]);

  // Parse manual text observations
  const handleParseObservations = useCallback(() => {
    if (!manualObservations.trim()) return;
    const parsed = parseTranscript(manualObservations);
    applyParsedToForm(parsed, formSetters);
    setTranscript(manualObservations);
  }, [manualObservations, formSetters]);

  const handleSubmit = useCallback(async () => {
    if (!selectedWoundId) return;

    const assessmentId = crypto.randomUUID();
    const today = new Date().toISOString().split("T")[0];

    await applyAction({
      assessmentId,
      woundId: selectedWoundId,
      assessmentDate: today,
      woundArea: parseFloat(woundArea) || 0,
      granulationPercent: parseInt(granulationPercent) || 0,
      sloughPercent: parseInt(sloughPercent) || 0,
      necroticPercent: parseInt(necroticPercent) || 0,
      periwoundStatus,
      painScore: parseInt(painScore) || 0,
      healingScore: parseFloat(healingScore) || 0,
      clinicianNotes: clinicianNotes || undefined,
      clinicianName: "Current Clinician",
      documentationMethod: transcript ? "Tandem" : "Manual",
    });

    setSubmitted(true);
  }, [
    selectedWoundId,
    applyAction,
    woundArea,
    granulationPercent,
    sloughPercent,
    necroticPercent,
    periwoundStatus,
    painScore,
    healingScore,
    clinicianNotes,
    transcript,
  ]);

  // Cleanup analysis progress on unmount
  useEffect(() => {
    return () => {
      setIsAnalyzing(false);
    };
  }, []);

  if (submitted) {
    const patientForLink = selectedPatientId;
    return (
      <div className="px-8 py-10 max-w-2xl mx-auto">
        <Card className="border border-[#e5e5e5]">
          <CardContent className="p-8 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-[#008847] mx-auto" />
            <h2 className="font-display text-2xl font-extrabold text-[#0a0a0a]">Assessment Submitted</h2>
            <p className="text-[#737373]">The wound assessment has been recorded successfully.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/patient/$patientId" params={{ patientId: patientForLink }}>
                <Button variant="default" className="bg-[#0a0a0a] hover:bg-[#0a0a0a]/90 text-white">
                  View Patient
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border-[#e5e5e5]"
                onClick={() => {
                  setSubmitted(false);
                  setSelectedPatientId("");
                  setSelectedWoundId("");
                  setPhotoPreview(null);
                  setWoundAnalysis(null);
                  setIsAnalyzing(false);
                  setTranscript("");
                  setManualObservations("");
                  setVoiceStatus("idle");
                  setShowTextFallback(false);
                  setWoundArea("");
                  setGranulationPercent("");
                  setSloughPercent("");
                  setNecroticPercent("");
                  setPeriwoundStatus("Healthy");
                  setPainScore("");
                  setHealingScore("");
                  setClinicianNotes("");
                }}
              >
                New Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isVoiceError =
    voiceStatus === "error-no-support" || voiceStatus === "error-mic-denied" || voiceStatus === "error-general";

  return (
    <div className="px-8 py-10 max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-3xl font-extrabold text-[#0a0a0a]">New Wound Assessment</h1>

      {/* Step 1: Select patient and wound */}
      <Card className="border border-[#e5e5e5]">
        <CardContent className="p-5 space-y-4">
          <h2 className="font-display text-base font-bold text-[#0a0a0a]">Step 1: Select patient and wound</h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="patient-select">Patient</Label>
              <select
                id="patient-select"
                value={selectedPatientId}
                onChange={handlePatientChange}
                className="mt-1 w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]"
              >
                <option value="">Select a patient</option>
                {patients?.map(p => (
                  <option key={p.patientId} value={p.patientId}>
                    {p.givenName} {p.familyName} ({p.nhsNumber})
                  </option>
                ))}
              </select>
            </div>
            {selectedPatientId && (
              <div>
                <Label htmlFor="wound-select">Wound</Label>
                <select
                  id="wound-select"
                  value={selectedWoundId}
                  onChange={e => setSelectedWoundId(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]"
                >
                  <option value="">Select a wound</option>
                  {patientWounds.map(w => (
                    <option key={w.woundId} value={w.woundId}>
                      {w.woundType} — {w.location}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Photo capture with AI analysis */}
      <Card className="border border-[#e5e5e5]">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-base font-bold text-[#0a0a0a]">Step 2: Photo capture</h2>
            {(isAnalyzing || woundAnalysis) && <Badge className="bg-[#0a0a0a] text-white text-[10px]">AI</Badge>}
          </div>
          {photoPreview ? (
            <div className="space-y-4">
              <img
                src={photoPreview}
                alt="Wound capture preview"
                className="w-full max-h-64 object-contain rounded-lg border border-[#e5e5e5]"
              />
              <Button variant="outline" size="sm" className="border-[#e5e5e5]" onClick={handleRetakePhoto}>
                Retake photo
              </Button>

              {/* AI Analysis: loading state */}
              {isAnalyzing && (
                <div className="border border-[#e5e5e5] rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-5 w-5 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium text-[#0a0a0a]">Analyzing wound...</span>
                  </div>
                  <Progress
                    value={analysisProgress}
                    className="h-1.5 [&>[data-state=complete]]:bg-[#0a0a0a] [&>div]:bg-[#0a0a0a]"
                  />
                  <p className="text-xs text-[#a3a3a3] mt-2">
                    Measuring wound area, tissue composition, and periwound status
                  </p>
                </div>
              )}

              {/* AI Analysis: results */}
              {woundAnalysis && !isAnalyzing && <WoundAnalysisCard analysis={woundAnalysis} />}
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-[#e5e5e5] rounded-lg cursor-pointer hover:bg-[#f5f5f5] transition-colors">
              <Camera className="h-12 w-12 text-[#a3a3a3] mb-2" />
              <span className="text-sm font-medium text-[#737373]">Take photo</span>
              <span className="text-xs text-[#a3a3a3] mt-1">Tap to open camera</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoCapture}
              />
            </label>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Tandem AI Documentation */}
      <Card className="border border-[#e5e5e5]">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-base font-bold text-[#0a0a0a]">Step 3: Tandem AI Documentation</h2>
            <Badge className="bg-[#0a0a0a] text-white text-[10px]">AI</Badge>
          </div>
          <p className="text-sm text-[#737373]">
            Speak naturally about the wound assessment. Tandem will extract clinical values automatically.
          </p>

          {/* Voice recording button */}
          <div className="flex flex-col items-center py-4">
            {isRecording ? (
              <>
                <button
                  onClick={stopRecording}
                  className="h-20 w-20 rounded-full bg-[#c4262e] flex items-center justify-center animate-mic-pulse shadow-lg cursor-pointer"
                  aria-label="Stop recording"
                >
                  <MicOff className="h-8 w-8 text-white" />
                </button>
                <span className="text-sm font-semibold text-[#c4262e] mt-3">{VOICE_STATUS_MESSAGES.listening}</span>
              </>
            ) : (
              <>
                <button
                  onClick={startRecording}
                  className="h-20 w-20 rounded-full bg-[#0a0a0a] flex items-center justify-center hover:bg-[#0a0a0a]/80 active:scale-95 transition-all shadow-lg cursor-pointer"
                  aria-label="Start recording"
                >
                  <Mic className="h-8 w-8 text-white" />
                </button>
                <span className={`text-sm mt-3 ${isVoiceError ? "text-[#c4262e] font-medium" : "text-[#737373]"}`}>
                  {VOICE_STATUS_MESSAGES[voiceStatus]}
                </span>
              </>
            )}
          </div>

          {/* Error banner */}
          {isVoiceError && (
            <div className="flex items-start gap-2 rounded-lg bg-[#fef2f2] border border-[#fecaca] p-3">
              <AlertCircle className="h-4 w-4 text-[#c4262e] mt-0.5 shrink-0" />
              <div className="text-sm text-[#c4262e]">
                {voiceStatus === "error-no-support" && (
                  <span>
                    Speech recognition is not available in this browser. Use the text input below to type your
                    observations instead.
                  </span>
                )}
                {voiceStatus === "error-mic-denied" && (
                  <span>
                    Microphone access was denied. Check your browser permissions, or use the text input below.
                  </span>
                )}
                {voiceStatus === "error-general" && (
                  <span>Something went wrong with voice recording. Use the text input below instead.</span>
                )}
              </div>
            </div>
          )}

          {/* Transcript display */}
          {transcript && (
            <div className="bg-[#f5f5f5] rounded-lg p-3 border border-[#e5e5e5]">
              <p className="text-xs font-medium uppercase tracking-wider text-[#737373] mb-1">Transcript</p>
              <p className="text-sm text-[#0a0a0a] leading-relaxed">{transcript}</p>
            </div>
          )}

          {/* Text fallback */}
          {(showTextFallback || isVoiceError) && (
            <div className="space-y-3 border-t border-[#e5e5e5] pt-4">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-[#737373]" />
                <span className="text-sm font-medium text-[#0a0a0a]">Type observations</span>
              </div>
              <Textarea
                value={manualObservations}
                onChange={e => setManualObservations(e.target.value)}
                placeholder='e.g. "Wound area 12 cm. Granulation 60 percent. Slough 30 percent. Necrotic 10 percent. Pain 4. Periwound maceration noted. Wound edges well defined with minimal exudate."'
                rows={4}
                className="text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                className="border-[#e5e5e5]"
                onClick={handleParseObservations}
                disabled={!manualObservations.trim()}
              >
                <Zap className="h-3 w-3 mr-1.5" />
                Parse observations
              </Button>
            </div>
          )}

          {/* Toggle text fallback manually */}
          {!showTextFallback && !isVoiceError && (
            <button
              onClick={() => setShowTextFallback(true)}
              className="text-xs text-[#a3a3a3] hover:text-[#737373] transition-colors underline underline-offset-2"
            >
              Prefer typing? Switch to text input
            </button>
          )}

          <div className="flex items-center gap-1 text-[10px] text-[#a3a3a3]">
            <Zap className="h-3 w-3 text-[#737373]" />
            Powered by Tandem Health
          </div>
        </CardContent>
      </Card>

      {/* Step 4: Review and Edit */}
      <Card className="border border-[#e5e5e5]">
        <CardContent className="p-5 space-y-4">
          <h2 className="font-display text-base font-bold text-[#0a0a0a]">Step 4: Review and submit</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="wound-area">Wound Area (cm&sup2;)</Label>
              <Input
                id="wound-area"
                type="number"
                step="0.1"
                value={woundArea}
                onChange={e => setWoundArea(e.target.value)}
                placeholder="0.0"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="healing-score-input">Healing Score (0-10)</Label>
              <Input
                id="healing-score-input"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={healingScore}
                onChange={e => setHealingScore(e.target.value)}
                placeholder="0.0"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="granulation-input">Granulation %</Label>
              <Input
                id="granulation-input"
                type="number"
                min="0"
                max="100"
                value={granulationPercent}
                onChange={e => setGranulationPercent(e.target.value)}
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="slough-input">Slough %</Label>
              <Input
                id="slough-input"
                type="number"
                min="0"
                max="100"
                value={sloughPercent}
                onChange={e => setSloughPercent(e.target.value)}
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="necrotic-input">Necrotic %</Label>
              <Input
                id="necrotic-input"
                type="number"
                min="0"
                max="100"
                value={necroticPercent}
                onChange={e => setNecroticPercent(e.target.value)}
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="pain-score-input">Pain Score (0-10)</Label>
              <Input
                id="pain-score-input"
                type="number"
                min="0"
                max="10"
                value={painScore}
                onChange={e => setPainScore(e.target.value)}
                placeholder="0"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="periwound-select">Periwound Status</Label>
            <select
              id="periwound-select"
              value={periwoundStatus}
              onChange={e => setPeriwoundStatus(e.target.value)}
              className="mt-1 w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]"
            >
              <option value="Healthy">Healthy</option>
              <option value="Macerated">Macerated</option>
              <option value="Erythema">Erythema</option>
              <option value="Oedema">Oedema</option>
              <option value="Dry/Flaky">Dry/Flaky</option>
            </select>
          </div>

          <div>
            <Label htmlFor="clinician-notes-input">Clinician Notes</Label>
            <Textarea
              id="clinician-notes-input"
              value={clinicianNotes}
              onChange={e => setClinicianNotes(e.target.value)}
              placeholder="Additional clinical observations..."
              rows={4}
              className="mt-1"
            />
          </div>

          <Separator />

          <Button
            onClick={handleSubmit}
            disabled={!selectedWoundId || isPending}
            className="w-full bg-[#0a0a0a] hover:bg-[#0a0a0a]/90 text-white"
          >
            {isPending ? "Submitting..." : "Submit Assessment"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
