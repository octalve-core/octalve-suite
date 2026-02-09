"use client";

import React from "react";
import { Lock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface Phase {
  id: string;
  name: string;
  order: number;
  status: string;
}

interface PhaseAccessGateProps {
  phase: Phase;
  previousPhase?: Phase;
  children: React.ReactNode;
}

export default function PhaseAccessGate({
  phase,
  previousPhase,
  children,
}: PhaseAccessGateProps) {
  // First phase is always accessible
  if (phase.order === 1) {
    return children;
  }

  // Check if previous phase is approved
  const isPreviousApproved = previousPhase?.status === "approved";

  if (!isPreviousApproved) {
    return (
      <Card className="border-slate-200 bg-slate-50 opacity-60">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-600">{phase.name}</h3>
              <p className="text-sm text-slate-400">
                Complete "{previousPhase?.name}" first to unlock this phase
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return children;
}
