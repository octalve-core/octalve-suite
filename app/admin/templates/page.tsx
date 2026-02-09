"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { motion } from "framer-motion";
import {
  FileText,
  Search,
  Plus,
  MoreHorizontal,
  Layers,
  Edit,
  Trash2,
  Copy,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import SuiteTypeBadge from "@/components/shared/SuiteTypeBadge";

interface PhaseTemplate {
  name: string;
  order: number;
}

interface Template {
  id: string;
  name: string;
  suite_type: string;
  description?: string;
  phases: PhaseTemplate[];
  is_active: boolean;
}

const suiteTypes = [
  { value: "growth_starter", label: "Growth Starter" },
  { value: "full_house", label: "Full House" },
  { value: "custom", label: "Custom" },
];

export default function TemplatesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    suite_type: "",
    description: "",
  });
  const [phases, setPhases] = useState<PhaseTemplate[]>([]);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: () => api.templates.list(),
  });

  const createTemplate = useMutation({
    mutationFn: (data: {
      name: string;
      suite_type: string;
      description: string;
      phases: PhaseTemplate[];
    }) =>
      api.templates.create({
        name: data.name,
        suite_type: data.suite_type,
        description: data.description,
        phases: data.phases,
        is_active: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      closeDialog();
    },
  });

  const updateTemplate = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Template> }) =>
      api.templates.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      closeDialog();
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: (id: string) => api.templates.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });

  const closeDialog = () => {
    setShowDialog(false);
    setEditingTemplate(null);
    setFormData({ name: "", suite_type: "", description: "" });
    setPhases([]);
  };

  const openEditDialog = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      suite_type: template.suite_type,
      description: template.description || "",
    });
    setPhases(template.phases || []);
    setShowDialog(true);
  };

  const duplicateTemplate = (template: Template) => {
    setFormData({
      name: `${template.name} (Copy)`,
      suite_type: template.suite_type,
      description: template.description || "",
    });
    setPhases(template.phases || []);
    setShowDialog(true);
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

  const handleSave = () => {
    if (!formData.name || !formData.suite_type) {
      alert("Please fill in name and suite type");
      return;
    }
    if (editingTemplate) {
      updateTemplate.mutate({
        id: editingTemplate.id,
        data: { ...formData, phases },
      });
    } else {
      createTemplate.mutate({ ...formData, phases });
    }
  };

  const filteredTemplates = templates.filter(
    (t: Template) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.suite_type.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Templates</h1>
          <p className="text-slate-500 mt-1">
            Manage project templates and phase structures
          </p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-violet-600 hover:bg-violet-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Template Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Templates ({filteredTemplates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                {searchQuery ? "No templates found" : "No templates yet"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template: Template, index: number) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-xl border bg-white border-slate-200 hover:border-violet-200 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-violet-600" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => openEditDialog(template)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => duplicateTemplate(template)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteTemplate.mutate(template.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h3 className="font-semibold text-slate-900">
                    {template.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <SuiteTypeBadge type={template.suite_type} />
                    <Badge variant="outline" className="text-xs">
                      <Layers className="w-3 h-3 mr-1" />
                      {template.phases?.length || 0} phases
                    </Badge>
                  </div>
                  {template.description && (
                    <p className="text-sm text-slate-500 mt-3 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={closeDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Create Template"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Full House Package"
                />
              </div>
              <div className="space-y-2">
                <Label>Suite Type *</Label>
                <Select
                  value={formData.suite_type}
                  onValueChange={(v) =>
                    setFormData({ ...formData, suite_type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {suiteTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Template description..."
                rows={2}
              />
            </div>

            {/* Phases */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Phases</Label>
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
              {phases.length === 0 ? (
                <p className="text-center text-slate-500 py-4 text-sm">
                  No phases yet. Add phases to define the project structure.
                </p>
              ) : (
                <div className="space-y-2">
                  {phases.map((phase, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-medium text-xs">
                        {phase.order}
                      </div>
                      <Input
                        value={phase.name}
                        onChange={(e) => updatePhase(index, e.target.value)}
                        placeholder={`Phase ${phase.order}`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePhase(index)}
                        className="h-8 w-8 text-slate-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={createTemplate.isPending || updateTemplate.isPending}
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
