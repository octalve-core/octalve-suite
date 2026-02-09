"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import {
  ArrowLeft,
  Calendar,
  User,
  Mail,
  FileText,
  Layers,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface Template {
  id: string;
  name: string;
  suite_type: string;
  phases?: { name: string; order: number }[];
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

interface PhaseInput {
  name: string;
  order: number;
}

const suiteTypes = [
  { value: "growth_starter", label: "Growth Starter" },
  { value: "full_house", label: "Full House" },
  { value: "custom", label: "Custom" },
];

export default function NewProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    clientName: "",
    clientEmail: "",
    suiteType: "",
    targetDate: "",
    templateId: "",
    assignedPmId: "",
    internalNotes: "",
  });
  const [phases, setPhases] = useState<PhaseInput[]>([]);

  const { data: templates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ["templates"],
    queryFn: () => api.templates.list(),
  });

  const { data: teamMembers = [], isLoading: loadingTeam } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => api.teamMembers.list(),
  });

  const createProject = useMutation({
    mutationFn: async (data: typeof formData & { phases: PhaseInput[] }) => {
      // Create project
      const project = await api.projects.create({
        name: data.name,
        client_name: data.clientName,
        client_email: data.clientEmail,
        suite_type: data.suiteType,
        target_completion_date: data.targetDate || undefined,
        assigned_pm_id: data.assignedPmId || undefined,
        internal_notes: data.internalNotes || undefined,
        status: "active",
      });

      // Create phases
      for (const phase of data.phases) {
        await api.phases.create({
          project_id: project.id,
          name: phase.name,
          order: phase.order,
          status: phase.order === 1 ? "in_progress" : "not_started",
        });
      }

      return project;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["all-projects"] });
      router.push(`/admin/projects/${project.id}`);
    },
  });

  const handleTemplateSelect = (templateId: string) => {
    setFormData({ ...formData, templateId });
    const template = templates.find((t: Template) => t.id === templateId);
    if (template?.phases) {
      setPhases(
        template.phases.map((p: { name: string; order: number }) => ({
          name: p.name,
          order: p.order,
        })),
      );
      if (template.suite_type) {
        setFormData((prev) => ({
          ...prev,
          templateId,
          suiteType: template.suite_type,
        }));
      }
    }
  };

  const addPhase = () => {
    setPhases([...phases, { name: "", order: phases.length + 1 }]);
  };

  const removePhase = (index: number) => {
    const newPhases = phases.filter((_, i) => i !== index);
    setPhases(newPhases.map((p, i) => ({ ...p, order: i + 1 })));
  };

  const updatePhase = (index: number, name: string) => {
    const newPhases = [...phases];
    newPhases[index].name = name;
    setPhases(newPhases);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.clientName ||
      !formData.clientEmail ||
      !formData.suiteType
    ) {
      alert("Please fill in all required fields");
      return;
    }
    createProject.mutate({ ...formData, phases });
  };

  const isLoading = loadingTemplates || loadingTeam;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Create New Project
          </h1>
          <p className="text-slate-500">Set up a new client project</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Start from Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={formData.templateId}
                onValueChange={handleTemplateSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template: Template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.suite_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {/* Client Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Client Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, clientEmail: e.target.value })
                    }
                    placeholder="client@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Website Redesign"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="suiteType">Suite Type *</Label>
                <Select
                  value={formData.suiteType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, suiteType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {suiteTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Completion Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="targetDate"
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) =>
                      setFormData({ ...formData, targetDate: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedPm">Assigned Project Manager</Label>
              <Select
                value={formData.assignedPmId}
                onValueChange={(value) =>
                  setFormData({ ...formData, assignedPmId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select PM (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member: TeamMember) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                value={formData.internalNotes}
                onChange={(e) =>
                  setFormData({ ...formData, internalNotes: e.target.value })
                }
                placeholder="Any internal notes about this project..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Phases */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Project Phases
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPhase}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Phase
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {phases.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                No phases yet. Add phases manually or select a template.
              </p>
            ) : (
              <div className="space-y-3">
                {phases.map((phase, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-medium text-sm">
                      {phase.order}
                    </div>
                    <Input
                      value={phase.name}
                      onChange={(e) => updatePhase(index, e.target.value)}
                      placeholder={`Phase ${phase.order} name`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePhase(index)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createProject.isPending}
            className="flex-1 bg-violet-600 hover:bg-violet-700"
          >
            {createProject.isPending ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  );
}
