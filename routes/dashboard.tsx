import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllData, getSeverityColor, getTrendArrow } from "@/lib/use-wound-data";
import type { PatientWoundSummary } from "@/lib/use-wound-data";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex-1 min-w-[120px]">
      <p className="font-display text-3xl font-extrabold text-[#0a0a0a]">{value}</p>
      <p className="text-xs font-medium uppercase tracking-wider text-[#737373] mt-1">{label}</p>
    </div>
  );
}

function severityBadgeClasses(severity: string): string {
  switch (severity) {
    case "Deteriorating":
      return "bg-red-50 text-[#c4262e] border-transparent";
    case "Static":
    case "Under Assessment":
      return "bg-amber-50 text-[#d4790a] border-transparent";
    case "Healing":
      return "bg-green-50 text-[#008847] border-transparent";
    default:
      return "bg-gray-50 text-[#737373] border-transparent";
  }
}

function WoundCard({ summary }: { summary: PatientWoundSummary }) {
  const color = getSeverityColor(summary.severityLevel);
  const arrow = getTrendArrow(summary.currentStatus);

  return (
    <Link to="/patient/$patientId" params={{ patientId: summary.patientId }} className="block">
      <Card className="transition-all hover:shadow-md cursor-pointer border border-[#e5e5e5]">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0">
              <h3 className="font-display text-base font-bold text-[#0a0a0a] truncate">
                {summary.givenName} {summary.familyName}
              </h3>
              <p className="text-sm text-[#737373]">
                {summary.woundType} &middot; {summary.location}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`shrink-0 text-xs font-semibold ${severityBadgeClasses(summary.currentStatus)}`}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: color }} />
              {summary.currentStatus}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="font-display text-2xl font-extrabold text-[#0a0a0a]">
                {summary.healingScore.toFixed(1)}
              </span>
              <span className="text-xs text-[#737373]">/10</span>
            </div>
            <span className="text-lg text-[#737373]" aria-label={summary.currentStatus}>
              {arrow}
            </span>
            <div className="ml-auto text-right">
              <p className="text-xs text-[#a3a3a3]">
                {summary.daysSinceLastAssessment === 0 ? "Today" : `${summary.daysSinceLastAssessment}d ago`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function Dashboard() {
  const { data, isLoading } = useAllData();

  if (isLoading || !data) {
    return (
      <div className="px-8 py-10 max-w-7xl mx-auto space-y-10">
        <Skeleton className="h-8 w-40 rounded" />
        <div className="flex gap-8 flex-wrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 flex-1 min-w-[120px] rounded" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const savings = data.activeWounds * 2 * 60;

  return (
    <div className="px-8 py-10 max-w-7xl mx-auto space-y-10">
      <h1 className="font-display text-3xl font-extrabold text-[#0a0a0a]">Dashboard</h1>

      {/* Stat row */}
      <div className="flex gap-8 flex-wrap border-b border-[#e5e5e5] pb-8">
        <StatItem label="Total Patients" value={data.totalPatients} />
        <StatItem label="Active Wounds" value={data.activeWounds} />
        <StatItem label="Deteriorating" value={data.redCount} />
        <StatItem label="Est. Savings" value={`\u00A3${savings.toLocaleString()}`} />
      </div>

      {/* Wound cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.summaries.map(s => (
          <WoundCard key={s.woundId} summary={s} />
        ))}
      </div>
    </div>
  );
}
