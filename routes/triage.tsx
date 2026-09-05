import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllData, getSeverityColor, getTrendArrow } from "@/lib/use-wound-data";
import type { PatientWoundSummary } from "@/lib/use-wound-data";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle, Stethoscope } from "lucide-react";

export const Route = createFileRoute("/triage")({
  component: TriageView,
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

function TriageCard({ summary }: { summary: PatientWoundSummary }) {
  const color = getSeverityColor(summary.severityLevel);
  const arrow = getTrendArrow(summary.currentStatus);

  const recommendation =
    summary.severityLevel === "RED"
      ? "Urgent clinical review required. Consider specialist referral."
      : "Schedule follow-up assessment. Review treatment plan.";

  return (
    <Card className="border border-[#e5e5e5]">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to="/patient/$patientId"
              params={{ patientId: summary.patientId }}
              className="font-display text-base font-bold text-[#0a0a0a] hover:text-[#525252] transition-colors"
            >
              {summary.givenName} {summary.familyName}
            </Link>
            <p className="text-sm text-[#737373]">
              {summary.woundType} &middot; {summary.location}
            </p>
          </div>
          <Badge
            variant="outline"
            className={`shrink-0 text-xs font-semibold ${severityBadgeClasses(summary.severityLevel)}`}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: color }} />
            {summary.severityLevel}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="font-display text-xl font-extrabold text-[#0a0a0a]">
              {summary.healingScore.toFixed(1)}
            </span>
            <span className="text-xs text-[#737373]">/10</span>
            <span className="text-lg ml-1 text-[#737373]">{arrow}</span>
          </div>
          <span className="text-xs text-[#a3a3a3]">
            {summary.daysSinceLastAssessment === 0
              ? "Assessed today"
              : `${summary.daysSinceLastAssessment}d since last assessment`}
          </span>
        </div>

        {summary.latestNotes && (
          <p className="text-sm text-[#525252] leading-relaxed line-clamp-2">{summary.latestNotes}</p>
        )}

        <div className="flex items-start gap-2 rounded-md p-3 text-sm bg-[#f5f5f5] border border-[#e5e5e5]">
          <Stethoscope className="h-4 w-4 mt-0.5 shrink-0 text-[#737373]" />
          <span className="text-[#525252]">{recommendation}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function TriageView() {
  const { data, isLoading } = useAllData();

  if (isLoading || !data) {
    return (
      <div className="px-8 py-10 max-w-4xl mx-auto space-y-8">
        <Skeleton className="h-16 w-full rounded-lg" />
        <div className="flex gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 flex-1 rounded" />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const needsAttention = data.redCount + data.amberCount;

  const triageSummaries = data.summaries.filter(s => s.severityLevel === "RED" || s.severityLevel === "AMBER");

  return (
    <div className="px-8 py-10 max-w-4xl mx-auto space-y-10">
      {/* Hero */}
      <div>
        <h1 className="font-display text-3xl font-extrabold text-[#0a0a0a]">
          {needsAttention} {needsAttention === 1 ? "patient needs" : "patients need"} attention this week
        </h1>
        <p className="text-[#737373] mt-2 text-sm">Prioritised by urgency to support clinical decision-making</p>
      </div>

      {/* Urgency breakdown */}
      <div className="flex gap-8 flex-wrap border-b border-[#e5e5e5] pb-8">
        <div className="flex-1 min-w-[100px]">
          <p className="font-display text-3xl font-extrabold text-[#0a0a0a]">{data.redCount}</p>
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373] mt-1">Critical</p>
        </div>
        <div className="flex-1 min-w-[100px]">
          <p className="font-display text-3xl font-extrabold text-[#0a0a0a]">{data.amberCount}</p>
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373] mt-1">Watch</p>
        </div>
        <div className="flex-1 min-w-[100px]">
          <p className="font-display text-3xl font-extrabold text-[#0a0a0a]">{data.greenCount}</p>
          <p className="text-xs font-medium uppercase tracking-wider text-[#737373] mt-1">On Track</p>
        </div>
      </div>

      {/* Triage cards */}
      {triageSummaries.length > 0 ? (
        <div className="space-y-4">
          {triageSummaries.map(s => (
            <TriageCard key={s.woundId} summary={s} />
          ))}
        </div>
      ) : (
        <Card className="border border-[#e5e5e5]">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-[#008847] mx-auto mb-3" />
            <p className="font-display text-lg font-bold text-[#0a0a0a]">All wounds on track</p>
            <p className="text-sm text-[#737373]">No patients need urgent attention</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
