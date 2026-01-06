import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Rocket,
  Zap,
  TrendingUp,
  Handshake,
  Calendar,
  Users,
  FileText,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const suiteOptions = [
  {
    type: "launch",
    name: "Launch",
    description: "Perfect for startups and new product launches",
    icon: Rocket,
    color: "violet",
  },
  {
    type: "impact",
    name: "Impact",
    description: "Comprehensive branding and marketing package",
    icon: Zap,
    color: "amber",
  },
  {
    type: "growth",
    name: "Growth",
    description: "Scale your business with advanced features",
    icon: TrendingUp,
    color: "emerald",
  },
  {
    type: "partner",
    name: "Partner",
    description: "Full partnership with ongoing support",
    icon: Handshake,
    color: "blue",
  },
];

export default function CreateProject() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    client_name: "",
    client_email: "",
    suite_type: "",
    target_completion_date: "",
    internal_notes: "",
    assigned_pm: "",
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const { data: templates = [] } = useQuery({
    queryKey: ["templates"],
    queryFn: () => base44.entities.Template.list(),
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => base44.entities.TeamMember.filter({ role: "pm" }),
  });

  const createProjectMutation = useMutation({
    mutationFn: async () => {
      // Generate project code
      const projectCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      // Create project
      const project = await base44.entities.Project.create({
        ...formData,
        project_code: projectCode,
        status: "active",
        progress_percentage: 0,
      });

      // Create phases from template if selected
      if (selectedTemplate?.phases) {
        for (const phase of selectedTemplate.phases) {
          const newPhase = await base44.entities.Phase.create({
            project_id: project.id,
            name: phase.name,
            order: phase.order,
            description: phase.description,
            status: phase.order === 1 ? "in_progress" : "not_started",
          });

          // Create deliverables for each phase
          if (phase.deliverables) {
            for (const deliverable of phase.deliverables) {
              await base44.entities.Deliverable.create({
                phase_id: newPhase.id,
                project_id: project.id,
                name: deliverable.name,
                order: deliverable.order,
                status: "draft",
              });
            }
          }
        }
      }

      return project;
    },
    onSuccess: (project) => {
      navigate(createPageUrl("ProjectDetail") + `?id=${project.id}`);
    },
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSuiteSelect = (type) => {
    setFormData((prev) => ({ ...prev, suite_type: type }));
    const template = templates.find((t) => t.suite_type === type);
    setSelectedTemplate(template);
  };

  const canProceed = () => {
    if (step === 1) return formData.suite_type;
    if (step === 2)
      return formData.name && formData.client_name && formData.client_email;
    return true;
  };

  const getColorClasses = (color, selected) => {
    const base = {
      violet: {
        bg: "bg-violet-50",
        border: "border-violet-200",
        text: "text-violet-700",
        ring: "ring-violet-500",
      },
      amber: {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        ring: "ring-amber-500",
      },
      emerald: {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        text: "text-emerald-700",
        ring: "ring-emerald-500",
      },
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        ring: "ring-blue-500",
      },
    };
    return base[color] || base.violet;
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {step > 1 ? "Back" : "Cancel"}
        </button>
        <h1 className="text-2xl font-bold text-slate-900">
          Create New Project
        </h1>
        <p className="text-slate-500 mt-1">Step {step} of 3</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "flex-1 h-1.5 rounded-full transition-colors",
              s <= step ? "bg-violet-600" : "bg-slate-200"
            )}
          />
        ))}
      </div>

      {/* Step 1: Select Suite */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Select Package Type
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suiteOptions.map((suite) => {
              const colors = getColorClasses(
                suite.color,
                formData.suite_type === suite.type
              );
              const isSelected = formData.suite_type === suite.type;

              return (
                <Card
                  key={suite.type}
                  className={cn(
                    "cursor-pointer transition-all",
                    isSelected
                      ? `border-2 ${colors.border} ${colors.bg} ring-2 ${colors.ring}`
                      : "hover:border-slate-300"
                  )}
                  onClick={() => handleSuiteSelect(suite.type)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          colors.bg
                        )}
                      >
                        <suite.icon className={cn("w-6 h-6", colors.text)} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">
                          {suite.name}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {suite.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center",
                            colors.bg
                          )}
                        >
                          <Check className={cn("w-4 h-4", colors.text)} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedTemplate && (
            <Card className="mt-6 bg-slate-50">
              <CardContent className="p-5">
                <h4 className="font-medium text-slate-900 mb-3">
                  Template Preview
                </h4>
                <div className="space-y-2">
                  {selectedTemplate.phases?.map((phase, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                        {i + 1}
                      </span>
                      <span className="text-slate-700">{phase.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Step 2: Project Details */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Project Details
          </h2>
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Brand Redesign Q1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_name">Client Name *</Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) =>
                      handleInputChange("client_name", e.target.value)
                    }
                    placeholder="Company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_email">Client Email *</Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={formData.client_email}
                    onChange={(e) =>
                      handleInputChange("client_email", e.target.value)
                    }
                    placeholder="client@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_date">Target Completion Date</Label>
                <Input
                  id="target_date"
                  type="date"
                  value={formData.target_completion_date}
                  onChange={(e) =>
                    handleInputChange("target_completion_date", e.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 3: Team & Notes */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Team & Notes
          </h2>
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="pm">Assign Project Manager</Label>
                <select
                  id="pm"
                  value={formData.assigned_pm}
                  onChange={(e) =>
                    handleInputChange("assigned_pm", e.target.value)
                  }
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Select PM...</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.email}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.internal_notes}
                  onChange={(e) =>
                    handleInputChange("internal_notes", e.target.value)
                  }
                  placeholder="Any internal notes about this project..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="mt-6 bg-slate-50">
            <CardContent className="p-5">
              <h4 className="font-medium text-slate-900 mb-3">Summary</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Package</dt>
                  <dd className="font-medium text-slate-900 capitalize">
                    {formData.suite_type}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Project</dt>
                  <dd className="font-medium text-slate-900">
                    {formData.name}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Client</dt>
                  <dd className="font-medium text-slate-900">
                    {formData.client_name}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Phases</dt>
                  <dd className="font-medium text-slate-900">
                    {selectedTemplate?.phases?.length || 0}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
        >
          {step > 1 ? "Back" : "Cancel"}
        </Button>

        {step < 3 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="bg-violet-600 hover:bg-violet-700"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={() => createProjectMutation.mutate()}
            disabled={createProjectMutation.isPending}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {createProjectMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create Project
                <Check className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
