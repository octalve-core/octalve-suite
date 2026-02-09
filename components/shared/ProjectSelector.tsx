"use client";

import React from "react";
import { ChevronDown, FolderKanban } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import SuiteTypeBadge from "./SuiteTypeBadge";

interface Project {
  id: string;
  name: string;
  progress_percentage?: number;
  suite_type: string;
}

interface ProjectSelectorProps {
  projects: Project[];
  selectedProject?: Project | null;
  onSelect: (project: Project) => void;
}

export default function ProjectSelector({
  projects,
  selectedProject,
  onSelect,
}: ProjectSelectorProps) {
  if (!projects || projects.length <= 1) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FolderKanban className="h-4 w-4" />
          <span className="max-w-[200px] truncate">
            {selectedProject?.name || "Select Project"}
          </span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
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
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-slate-900">
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
