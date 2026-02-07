"use client";
import React from "react";
import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PhaseAccessGate({ phase, previousPhase, children }) {
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
            <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
              <Lock className="w-5 h-5 text-slate-400" />
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
