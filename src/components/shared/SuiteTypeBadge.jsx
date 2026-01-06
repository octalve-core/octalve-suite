import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Rocket, Zap, TrendingUp, Handshake } from "lucide-react";

const suiteConfig = {
  launch: {
    label: "Launch",
    icon: Rocket,
    className: "bg-violet-50 text-violet-700 border-violet-200",
  },
  impact: {
    label: "Impact",
    icon: Zap,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  growth: {
    label: "Growth",
    icon: TrendingUp,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  partner: {
    label: "Partner",
    icon: Handshake,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

export default function SuiteTypeBadge({ type, showIcon = true, className }) {
  const config = suiteConfig[type] || {
    label: type,
    className: "bg-slate-100 text-slate-600",
    icon: null,
  };
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn("font-medium border gap-1.5", config.className, className)}
    >
      {showIcon && Icon && <Icon className="w-3 h-3" />}
      {config.label}
    </Badge>
  );
}
