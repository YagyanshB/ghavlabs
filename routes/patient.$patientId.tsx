import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getSeverityColor } from "@/lib/use-wound-data";
import type { Osdk } from "@osdk/client";
import { useOsdkObject, useLinks } from "@osdk/react/experimental";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, User, ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState, useCallback } from "react";
import { WoundWisePatient, WoundWiseWound } from "../../.osdk/src";

export const Route = createFileRoute("/patient/$patientId")({
  component: PatientDetail,
});

function severityBadgeClasses(severity: string): string {
  switch (severity) {
    case "RED":
      return "bg-red-50 text-[#c4262e] border-transparent";
    case "AMBER":
      return "bg-amber-50 text-[#d4790a] border-transparent";
    case "GREEN":
      return "bg-green-50 text-[#008847] border-transparent";
    default:
      return "bg-gray-50 text-[#737373] border-transparent";
  }
}

function HealingChart({
  assessments,
  severityColor,
}: {
  assessments: Array<{ date: string; score: number }>;
  severityColor: string;
}) {
  if (assessments.length < 2) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-[#737373]">
        Not enough data points for trajectory
      </div>
    );
  }

  const sorted = [...assessments].sort((a, b) => a.date.localeCompare(b.date));
  const width = 500;
  const height = 180;
  const padX = 48;
  const padY = 24;
  const padBottom = 40;
  const chartW = width - padX * 2;
  const chartH = height - padY - padBottom;

  const points = sorted.map((a, i) => ({
    x: padX + (i / (sorted.length - 1)) * chartW,
    y: padY + chartH - (a.score / 10) * chartH,
    ...a,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-lg" aria-hidden="true">
      {/* Y axis labels */}
      {[0, 2, 4, 6, 8, 10].map(v => {
        const y = padY + chartH - (v / 10) * chartH;
        return (
          <g key={v}>
            <line x1={padX} y1={y} x2={padX + chartW} y2={y} stroke="#e5e5e5" strokeWidth={1} />
            <text x={padX - 8} y={y + 4} textAnchor="end" fontSize={10} fill="#737373" fontFamily="IBM Plex Sans">
              {v}
            </text>
          </g>
        );
      })}
      {/* Data line */}
      <path
        d={pathD}
        fill="none"
        stroke={severityColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Data points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill={severityColor} />
          <circle cx={p.x} cy={p.y} r={6} fill={severityColor} fillOpacity={0.15} />
          <text x={p.x} y={height - 8} textAnchor="middle" fontSize={9} fill="#737373" fontFamily="IBM Plex Sans">
            {p.date.slice(5)}
          </text>
        </g>
      ))}
    </svg>
  );
}

function TissueBar({ granulation, slough, necrotic }: { granulation: number; slough: number; necrotic: number }) {
  return (
    <div
      className="flex h-3 w-full rounded-sm overflow-hidden"
      aria-label={`Tissue: ${granulation}% granulation, ${slough}% slough, ${necrotic}% necrotic`}
    >
      {granulation > 0 && (
        <div
          className="h-full"
          style={{ width: `${granulation}%`, backgroundColor: "#008847" }}
          title={`Granulation ${granulation}%`}
        />
      )}
      {slough > 0 && (
        <div
          className="h-full"
          style={{ width: `${slough}%`, backgroundColor: "#D4790A" }}
          title={`Slough ${slough}%`}
        />
      )}
      {necrotic > 0 && (
        <div
          className="h-full"
          style={{ width: `${necrotic}%`, backgroundColor: "#3A3A3A" }}
          title={`Necrotic ${necrotic}%`}
        />
      )}
    </div>
  );
}

function WoundSection({ wound }: { wound: Osdk.Instance<WoundWiseWound> }) {
  const { links: assessments, isLoading: assessmentsLoading } = useLinks(wound, "woundToAssessmentsAssessments", {
    pageSize: 50,
  });

  const sortedAssessments = useMemo(() => {
    if (!assessments) return [];
    return [...assessments].sort((a, b) => (b.assessmentDate ?? "").localeCompare(a.assessmentDate ?? ""));
  }, [assessments]);

  const chartData = useMemo(
    () =>
      sortedAssessments.map(a => ({
        date: a.assessmentDate ?? "",
        score: a.healingScore ?? 0,
      })),
    [sortedAssessments],
  );

  const severityColor = getSeverityColor(wound.severityLevel ?? "GREEN");

  return (
    <Card className="border border-[#e5e5e5]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <h3 className="font-display text-lg font-bold text-[#0a0a0a]">{wound.woundType}</h3>
            <p className="text-sm text-[#737373]">
              {wound.location} &middot; Identified {wound.dateIdentified}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className={`text-xs font-semibold ${severityBadgeClasses(wound.severityLevel ?? "GREEN")}`}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
                style={{ backgroundColor: severityColor }}
              />
              {wound.severityLevel}
            </Badge>
            <Badge variant="outline" className="text-xs text-[#737373] border-[#e5e5e5]">
              {wound.currentStatus}
            </Badge>
          </div>
        </div>

        {/* Healing Trajectory Chart */}
        <div className="mb-4">
          <h4 className="text-xs font-medium uppercase tracking-wider text-[#737373] mb-2">Healing Trajectory</h4>
          {assessmentsLoading ? (
            <Skeleton className="h-48 w-full rounded" />
          ) : (
            <HealingChart assessments={chartData} severityColor={severityColor} />
          )}
        </div>

        <Separator className="my-4" />

        {/* Assessment Timeline */}
        <h4 className="text-xs font-medium uppercase tracking-wider text-[#737373] mb-3">Assessment Timeline</h4>
        {assessmentsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded" />
            ))}
          </div>
        ) : (
          <div className="relative pl-6">
            {/* Vertical line */}
            <div className="absolute left-2 top-0 bottom-0 w-px bg-[#e5e5e5]" />
            {sortedAssessments.map(a => (
              <AssessmentEntry key={a.assessmentId} assessment={a} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AssessmentEntry({ assessment }: { assessment: Osdk.Instance<import("../../.osdk/src").WoundWiseAssessment> }) {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = useCallback(() => setExpanded(prev => !prev), []);
  const isTandem = assessment.documentationMethod === "Tandem";

  return (
    <div className="relative mb-4 last:mb-0">
      {/* Timeline dot */}
      <div className="absolute -left-[16px] top-1 h-3 w-3 rounded-full bg-[#0a0a0a] border-2 border-white" />
      <div className="bg-[#f9f9f9] rounded-lg p-4 border border-[#e5e5e5]">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#737373]" />
            <span className="text-sm font-semibold text-[#0a0a0a]">{assessment.assessmentDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-[#737373]" />
            <span className="text-sm text-[#737373]">{assessment.clinicianName}</span>
          </div>
          {isTandem && <Badge className="bg-[#0a0a0a] text-white text-[10px] px-1.5 py-0">Tandem</Badge>}
        </div>

        {/* Clinical values */}
        <div className="flex gap-4 text-sm mb-2 flex-wrap">
          <div>
            <span className="text-[#737373] text-xs">Healing</span>
            <p className="font-display font-bold text-[#0a0a0a]">{assessment.healingScore?.toFixed(1)}</p>
          </div>
          <div>
            <span className="text-[#737373] text-xs">Area</span>
            <p className="font-display font-bold text-[#0a0a0a]">{assessment.woundArea} cm&sup2;</p>
          </div>
          <div>
            <span className="text-[#737373] text-xs">Pain</span>
            <p className="font-display font-bold text-[#0a0a0a]">{assessment.painScore}/10</p>
          </div>
          <div>
            <Badge variant="outline" className="text-xs mt-2 text-[#737373] border-[#e5e5e5]">
              {assessment.periwoundStatus}
            </Badge>
          </div>
        </div>

        {/* Tissue composition */}
        <div className="mb-2">
          <div className="flex gap-3 text-[10px] text-[#737373] mb-1">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm bg-[#008847]" />
              Gran {assessment.granulationPercent}%
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm bg-[#D4790A]" />
              Slough {assessment.sloughPercent}%
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm bg-[#3A3A3A]" />
              Necrotic {assessment.necroticPercent}%
            </span>
          </div>
          <TissueBar
            granulation={assessment.granulationPercent ?? 0}
            slough={assessment.sloughPercent ?? 0}
            necrotic={assessment.necroticPercent ?? 0}
          />
        </div>

        {/* Notes */}
        {assessment.clinicianNotes && (
          <div>
            <button
              onClick={toggleExpanded}
              className="flex items-center gap-1 text-xs text-[#0a0a0a] font-medium hover:underline"
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? "Collapse notes" : "View notes"}
            </button>
            {expanded && <p className="text-sm text-[#525252] mt-1 leading-relaxed">{assessment.clinicianNotes}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function PatientDetail() {
  const { patientId } = Route.useParams();
  const { object: patient, isLoading: patientLoading } = useOsdkObject(WoundWisePatient, patientId);
  const { links: wounds, isLoading: woundsLoading } = useLinks(patient, "patientToWoundsWounds", {
    pageSize: 20,
  });

  const isLoading = patientLoading || (!patient && !patientLoading);

  if (isLoading) {
    return (
      <div className="px-8 py-10 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="px-8 py-10 max-w-4xl mx-auto">
        <p className="text-[#737373]">Patient not found</p>
        <Link to="/dashboard" className="text-[#0a0a0a] hover:underline text-sm mt-2 inline-block font-medium">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="px-8 py-10 max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-[#737373] hover:text-[#0a0a0a] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      {/* Patient header */}
      <Card className="border border-[#e5e5e5]">
        <CardContent className="p-5">
          <h1 className="font-display text-2xl font-extrabold text-[#0a0a0a] mb-1">
            {patient.givenName} {patient.familyName}
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#737373]">
            <span>DOB: {patient.dateOfBirth}</span>
            <span>NHS: {patient.nhsNumber}</span>
            {patient.contactPhone && <span>Tel: {patient.contactPhone}</span>}
            {patient.address && <span>{patient.address}</span>}
          </div>
        </CardContent>
      </Card>

      {/* Wounds */}
      {woundsLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      ) : wounds && wounds.length > 0 ? (
        <div className="space-y-6">
          {wounds.map(wound => (
            <WoundSection key={wound.woundId} wound={wound} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#737373]">No wounds recorded</p>
      )}
    </div>
  );
}
