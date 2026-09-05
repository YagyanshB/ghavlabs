import { useOsdkObjects } from "@osdk/react/experimental";
import { useMemo } from "react";
import { WoundWisePatient, WoundWiseWound, WoundWiseAssessment } from "../../.osdk/src";

export type SeverityLevel = "RED" | "AMBER" | "GREEN";
export type WoundStatus = "Deteriorating" | "Static" | "Healing" | "Under Assessment";

export interface PatientWoundSummary {
  patientId: string;
  givenName: string;
  familyName: string;
  woundId: string;
  woundType: string;
  location: string;
  currentStatus: WoundStatus;
  severityLevel: SeverityLevel;
  healingScore: number;
  daysSinceLastAssessment: number;
  latestNotes: string;
  dateIdentified: string;
}

const SEVERITY_ORDER: Record<string, number> = { RED: 0, AMBER: 1, GREEN: 2 };

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "RED":
      return "#C4262E";
    case "AMBER":
      return "#D4790A";
    case "GREEN":
      return "#008847";
    default:
      return "#6B6560";
  }
}

export function getTrendArrow(status: string): string {
  switch (status) {
    case "Deteriorating":
      return "\u2193";
    case "Static":
    case "Under Assessment":
      return "\u2192";
    case "Healing":
      return "\u2191";
    default:
      return "\u2192";
  }
}

export function useAllData() {
  const { data: patients, isLoading: patientsLoading } = useOsdkObjects(WoundWisePatient, { pageSize: 100 });
  const { data: wounds, isLoading: woundsLoading } = useOsdkObjects(WoundWiseWound, { pageSize: 100 });
  const { data: assessments, isLoading: assessmentsLoading } = useOsdkObjects(WoundWiseAssessment, { pageSize: 200 });

  const isLoading = patientsLoading || woundsLoading || assessmentsLoading;

  const enrichedData = useMemo(() => {
    if (!patients || !wounds || !assessments) return null;

    // Group assessments by woundId
    const assessmentsByWound = new Map<string, typeof assessments>();
    for (const a of assessments) {
      const wId = a.woundId ?? "";
      if (!assessmentsByWound.has(wId)) {
        assessmentsByWound.set(wId, []);
      }
      assessmentsByWound.get(wId)!.push(a);
    }

    // Sort each wound's assessments by date (newest first)
    for (const [, woundAssessments] of assessmentsByWound) {
      woundAssessments.sort((a, b) => (b.assessmentDate ?? "").localeCompare(a.assessmentDate ?? ""));
    }

    // Group wounds by patient
    const woundsByPatient = new Map<string, typeof wounds>();
    for (const w of wounds) {
      const pId = w.patientId ?? "";
      if (!woundsByPatient.has(pId)) {
        woundsByPatient.set(pId, []);
      }
      woundsByPatient.get(pId)!.push(w);
    }

    // Build patient summaries
    const summaries: PatientWoundSummary[] = [];

    for (const w of wounds) {
      const patient = patients.find(p => p.patientId === w.patientId);
      if (!patient) continue;

      const woundAssessments = assessmentsByWound.get(w.woundId) ?? [];
      const latestAssessment = woundAssessments[0];

      const now = new Date();
      const lastDate = latestAssessment?.assessmentDate ? new Date(latestAssessment.assessmentDate) : now;
      const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      summaries.push({
        patientId: patient.patientId,
        givenName: patient.givenName ?? "",
        familyName: patient.familyName ?? "",
        woundId: w.woundId,
        woundType: w.woundType ?? "",
        location: w.location ?? "",
        currentStatus: (w.currentStatus ?? "Under Assessment") as WoundStatus,
        severityLevel: (w.severityLevel ?? "GREEN") as SeverityLevel,
        healingScore: latestAssessment?.healingScore ?? 0,
        daysSinceLastAssessment: daysSince,
        latestNotes: latestAssessment?.clinicianNotes ?? "",
        dateIdentified: w.dateIdentified ?? "",
      });
    }

    // Sort by severity: RED first, then AMBER, then GREEN
    summaries.sort((a, b) => (SEVERITY_ORDER[a.severityLevel] ?? 3) - (SEVERITY_ORDER[b.severityLevel] ?? 3));

    const redCount = wounds.filter(w => w.severityLevel === "RED").length;
    const amberCount = wounds.filter(w => w.severityLevel === "AMBER").length;
    const greenCount = wounds.filter(w => w.severityLevel === "GREEN").length;
    const activeWounds = wounds.length;
    const totalPatients = patients.length;

    return {
      patients,
      wounds,
      assessments,
      summaries,
      assessmentsByWound,
      woundsByPatient,
      redCount,
      amberCount,
      greenCount,
      activeWounds,
      totalPatients,
    };
  }, [patients, wounds, assessments]);

  return { data: enrichedData, isLoading };
}
