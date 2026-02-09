"use client";

import React from "react";
import { Rocket, Zap, TrendingUp, Handshake, LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SuiteConfigItem {
  label: string;
  icon: LucideIcon;
  className: string;
}

const suiteConfig: Record<string, SuiteConfigItem> = {
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

interface SuiteTypeBadgeProps {
  type: string;
  showIcon?: boolean;
  className?: string;
}

export default function SuiteTypeBadge({
  type,
  showIcon = true,
  className,
}: SuiteTypeBadgeProps) {
  const config = suiteConfig[type] || {
    label: type,
    className: "bg-slate-100 text-slate-600",
    icon: null,
  };
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 border font-medium", config.className, className)}
    >
      {showIcon && Icon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
