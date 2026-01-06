import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Plus,
  FileText,
  Rocket,
  Zap,
  TrendingUp,
  Handshake,
  Edit2,
  Trash2,
  MoreVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import SuiteTypeBadge from "../components/shared/SuiteTypeBadge";

const suiteIcons = {
  launch: Rocket,
  impact: Zap,
  growth: TrendingUp,
  partner: Handshake,
};

export default function OctalveTemplates() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [expandedTemplate, setExpandedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    suite_type: "launch",
    description: "",
    phases: [{ name: "", order: 1, description: "", deliverables: [] }],
  });

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: () => base44.entities.Template.list(),
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data) => base44.entities.Template.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["templates"]);
      resetForm();
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Template.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["templates"]);
      resetForm();
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => base44.entities.Template.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["templates"]);
    },
  });

  const resetForm = () => {
    setShowDialog(false);
    setEditingTemplate(null);
    setFormData({
      name: "",
      suite_type: "launch",
      description: "",
      phases: [{ name: "", order: 1, description: "", deliverables: [] }],
    });
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      suite_type: template.suite_type,
      description: template.description || "",
      phases: template.phases || [
        { name: "", order: 1, description: "", deliverables: [] },
      ],
    });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    const cleanedPhases = formData.phases
      .filter((p) => p.name)
      .map((p, i) => ({ ...p, order: i + 1 }));

    const data = { ...formData, phases: cleanedPhases };

    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, data });
    } else {
      createTemplateMutation.mutate(data);
    }
  };

  const addPhase = () => {
    setFormData((prev) => ({
      ...prev,
      phases: [
        ...prev.phases,
        {
          name: "",
          order: prev.phases.length + 1,
          description: "",
          deliverables: [],
        },
      ],
    }));
  };

  const updatePhase = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      phases: prev.phases.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      ),
    }));
  };

  const removePhase = (index) => {
    setFormData((prev) => ({
      ...prev,
      phases: prev.phases.filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Templates</h1>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-violet-600 hover:bg-violet-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Templates Grid */}
      {templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template, index) => {
            const Icon = suiteIcons[template.suite_type] || FileText;
            const isExpanded = expandedTemplate === template.id;

            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-violet-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {template.name}
                          </h3>
                          <SuiteTypeBadge
                            type={template.suite_type}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEdit(template)}
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              deleteTemplateMutation.mutate(template.id)
                            }
                            className="text-rose-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {template.description && (
                      <p className="text-sm text-slate-500 mb-4">
                        {template.description}
                      </p>
                    )}

                    <Collapsible
                      open={isExpanded}
                      onOpenChange={() =>
                        setExpandedTemplate(isExpanded ? null : template.id)
                      }
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-between"
                        >
                          <span>{template.phases?.length || 0} Phases</span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-3">
                        <div className="space-y-2">
                          {template.phases?.map((phase, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 text-sm p-2 rounded bg-slate-50"
                            >
                              <span className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs text-slate-500">
                                {i + 1}
                              </span>
                              <span className="text-slate-700">
                                {phase.name}
                              </span>
                              {phase.deliverables?.length > 0 && (
                                <span className="text-slate-400 text-xs ml-auto">
                                  {phase.deliverables.length} deliverables
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Templates Yet
            </h3>
            <p className="text-slate-500 mb-6">
              Create templates to streamline project creation
            </p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={resetForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Create Template"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Standard Launch"
                />
              </div>
              <div className="space-y-2">
                <Label>Suite Type *</Label>
                <Select
                  value={formData.suite_type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, suite_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="launch">Launch</SelectItem>
                    <SelectItem value="impact">Impact</SelectItem>
                    <SelectItem value="growth">Growth</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description of this template"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Phases</Label>
                <Button variant="outline" size="sm" onClick={addPhase}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Phase
                </Button>
              </div>

              {formData.phases.map((phase, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50"
                >
                  <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-medium mt-1">
                    {index + 1}
                  </span>
                  <div className="flex-1 space-y-2">
                    <Input
                      value={phase.name}
                      onChange={(e) =>
                        updatePhase(index, "name", e.target.value)
                      }
                      placeholder="Phase name"
                    />
                    <Input
                      value={phase.description}
                      onChange={(e) =>
                        updatePhase(index, "description", e.target.value)
                      }
                      placeholder="Phase description (optional)"
                      className="text-sm"
                    />
                  </div>
                  {formData.phases.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-rose-600"
                      onClick={() => removePhase(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.name ||
                createTemplateMutation.isPending ||
                updateTemplateMutation.isPending
              }
              className="bg-violet-600 hover:bg-violet-700"
            >
              {editingTemplate ? "Save Changes" : "Create Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
