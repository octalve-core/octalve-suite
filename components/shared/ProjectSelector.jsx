"use client";
import React from "react";
import { ChevronDown, FolderKanban } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import SuiteTypeBadge from "./SuiteTypeBadge";

export default function ProjectSelector({
  projects,
  selectedProject,
  onSelect,
}) {
  if (!projects || projects.length <= 1) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FolderKanban className="w-4 h-4" />
          <span className="max-w-[200px] truncate">
            {selectedProject?.name || "Select Project"}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onClick={() => onSelect(project)}
            className={`flex items-center justify-between py-3 ${
              selectedProject?.id === project.id ? "bg-violet-50" : ""
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">
                {project.name}
              </p>
              <p className="text-xs text-slate-500">
                {project.progress_percentage || 0}% complete
              </p>
            </div>
            <SuiteTypeBadge type={project.suite_type} showIcon={false} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
