import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Edit2,
  MoreVertical,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  Users,
  FileText,
  Figma,
  Folder,
  Globe,
  Loader2,
  Mail,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import StatusBadge from "../components/shared/StatusBadge";
import SuiteTypeBadge from "../components/shared/SuiteTypeBadge";
import ProgressRing from "../components/shared/ProgressRing";

const linkTypeIcons = {
  figma: Figma,
  drive: Folder,
  web: Globe,
  other: FileText,
};

export default function ProjectDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showDeliverableDialog, setShowDeliverableDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [deliverableForm, setDeliverableForm] = useState({
    name: "",
    link: "",
    link_type: "other",
    description: "",
  });
  const [selectedAssignee, setSelectedAssignee] = useState("");

  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("id");

  useEffect(() => {
    base44.auth
      .me()
      .then(setUser)
      .catch(() => {});
  }, []);

  const isAdmin = user?.role === "admin";

  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const projects = await base44.entities.Project.filter({ id: projectId });
      return projects[0];
    },
    enabled: !!projectId,
  });

  const { data: phases = [] } = useQuery({
    queryKey: ["project-phases", projectId],
    queryFn: () => base44.entities.Phase.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: deliverables = [] } = useQuery({
    queryKey: ["project-deliverables", projectId],
    queryFn: () =>
      base44.entities.Deliverable.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: approvals = [] } = useQuery({
    queryKey: ["project-approvals", projectId],
    queryFn: () => base44.entities.Approval.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => base44.entities.TeamMember.list(),
  });

  const sortedPhases = [...phases].sort((a, b) => a.order - b.order);
  const completedPhases = sortedPhases.filter(
    (p) => p.status === "approved"
  ).length;

  const requestApprovalMutation = useMutation({
    mutationFn: async (phaseId) => {
      await base44.entities.Approval.create({
        phase_id: phaseId,
        project_id: projectId,
        requested_at: new Date().toISOString(),
        requested_by: user?.email,
        status: "pending",
      });
      await base44.entities.Phase.update(phaseId, {
        status: "awaiting_approval",
      });
      await base44.entities.Message.create({
        phase_id: phaseId,
        project_id: projectId,
        content: "Approval requested for this phase",
        message_type: "system",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["project-phases", projectId]);
      queryClient.invalidateQueries(["project-approvals", projectId]);
    },
  });

  const addDeliverableMutation = useMutation({
    mutationFn: async () => {
      const phaseDeliverables = deliverables.filter(
        (d) => d.phase_id === selectedPhase.id
      );
      await base44.entities.Deliverable.create({
        ...deliverableForm,
        phase_id: selectedPhase.id,
        project_id: projectId,
        order: phaseDeliverables.length + 1,
        status: deliverableForm.link ? "ready_for_review" : "draft",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["project-deliverables", projectId]);
      setShowDeliverableDialog(false);
      setDeliverableForm({
        name: "",
        link: "",
        link_type: "other",
        description: "",
      });
      setSelectedPhase(null);
    },
  });

  const updateDeliverableMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await base44.entities.Deliverable.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["project-deliverables", projectId]);
    },
  });

  const assignPhaseMutation = useMutation({
    mutationFn: async () => {
      const member = teamMembers.find((m) => m.email === selectedAssignee);
      await base44.entities.Phase.update(selectedPhase.id, {
        assigned_to: selectedAssignee,
        assigned_to_name: member?.name || selectedAssignee,
      });
      await base44.entities.Message.create({
        phase_id: selectedPhase.id,
        project_id: projectId,
        content: `Phase assigned to ${member?.name || selectedAssignee}`,
        message_type: "system",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["project-phases", projectId]);
      setShowAssignDialog(false);
      setSelectedPhase(null);
      setSelectedAssignee("");
    },
  });

  const sendClientMessageMutation = useMutation({
    mutationFn: async () => {
      // Send email to client
      await base44.integrations.Core.SendEmail({
        to: project.client_email,
        subject: `Update on your project: ${project.name}`,
        body: `Hi,\n\nWe have an update on your project "${project.name}". Please log in to your client portal to review the latest deliverables and provide feedback.\n\nBest regards,\nOctalve Team`,
      });
    },
    onSuccess: () => {
      alert("Message sent to client!");
    },
  });

  const getPhaseDeliverables = (phaseId) => {
    return deliverables
      .filter((d) => d.phase_id === phaseId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const hasPendingApproval = (phaseId) => {
    return approvals.some(
      (a) => a.phase_id === phaseId && a.status === "pending"
    );
  };

  // Calculate and update progress
  const updateProjectProgress = async () => {
    const approvedCount = sortedPhases.filter(
      (p) => p.status === "approved"
    ).length;
    const progress =
      sortedPhases.length > 0
        ? Math.round((approvedCount / sortedPhases.length) * 100)
        : 0;

    if (project && project.progress_percentage !== progress) {
      await base44.entities.Project.update(projectId, {
        progress_percentage: progress,
        status: progress === 100 ? "completed" : "active",
      });
      queryClient.invalidateQueries(["project", projectId]);
    }
  };

  useEffect(() => {
    if (project && phases.length > 0) {
      updateProjectProgress();
    }
  }, [phases]);

  if (loadingProject) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48" />
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Project Not Found
            </h3>
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </button>
      </div>

      {/* Project Header Card */}
      <Card className="overflow-hidden mb-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <SuiteTypeBadge
                  type={project.suite_type}
                  className="bg-white/20 border-white/30 text-white"
                />
                <StatusBadge status={project.status} />
              </div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <p className="text-white/70 mt-1">
                {project.client_name} • {project.client_email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ProgressRing
                progress={project.progress_percentage || 0}
                size={80}
                strokeWidth={6}
                className="[&_span]:text-white [&_.text-slate-900]:text-white [&_.text-slate-500]:text-white/70"
              />
              {isAdmin && (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => sendClientMessageMutation.mutate()}
                    disabled={sendClientMessageMutation.isPending}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Client
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit Project</DropdownMenuItem>
                      <DropdownMenuItem>Manage Team</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-rose-600">
                        Archive Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-slate-500">Phases</span>
              <p className="font-semibold text-slate-900">
                {completedPhases} / {sortedPhases.length} complete
              </p>
            </div>
            <div>
              <span className="text-slate-500">Target Date</span>
              <p className="font-semibold text-slate-900">
                {project.target_completion_date
                  ? format(
                      new Date(project.target_completion_date),
                      "MMM d, yyyy"
                    )
                  : "Not set"}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Project Code</span>
              <p className="font-mono font-semibold text-slate-900">
                {project.project_code || "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="phases" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="phases">Phases</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="phases" className="space-y-4">
          {sortedPhases.map((phase, index) => {
            const phaseDeliverables = getPhaseDeliverables(phase.id);
            const isPending = hasPendingApproval(phase.id);
            const previousPhase = index > 0 ? sortedPhases[index - 1] : null;
            const canRequestApproval =
              !previousPhase || previousPhase.status === "approved";

            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold
                          ${
                            phase.status === "approved"
                              ? "bg-emerald-100 text-emerald-700"
                              : phase.status === "in_progress" ||
                                phase.status === "awaiting_approval"
                              ? "bg-violet-100 text-violet-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {phase.status === "approved" ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {phase.name}
                          </CardTitle>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <StatusBadge status={phase.status} />
                            {phase.due_date && (
                              <span className="text-sm text-slate-500">
                                Due {format(new Date(phase.due_date), "MMM d")}
                              </span>
                            )}
                            {phase.assigned_to_name && (
                              <span className="text-sm text-slate-500 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {phase.assigned_to_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPhase(phase);
                              setSelectedAssignee(phase.assigned_to || "");
                              setShowAssignDialog(true);
                            }}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Assign
                          </Button>
                        )}
                        {isAdmin &&
                          phase.status === "in_progress" &&
                          phaseDeliverables.length > 0 &&
                          !isPending &&
                          canRequestApproval && (
                            <Button
                              size="sm"
                              onClick={() =>
                                requestApprovalMutation.mutate(phase.id)
                              }
                              disabled={requestApprovalMutation.isPending}
                              className="bg-violet-600 hover:bg-violet-700"
                            >
                              {requestApprovalMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Send className="w-4 h-4 mr-2" />
                                  Request Approval
                                </>
                              )}
                            </Button>
                          )}
                        {isAdmin &&
                          phase.status === "in_progress" &&
                          !canRequestApproval && (
                            <span className="text-sm text-amber-600">
                              Approve previous phase first
                            </span>
                          )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(
                              createPageUrl("PhaseDetail") + `?id=${phase.id}`
                            )
                          }
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* Deliverables */}
                    <div className="space-y-2">
                      {phaseDeliverables.map((deliverable) => {
                        const Icon =
                          linkTypeIcons[deliverable.link_type] || FileText;

                        return (
                          <div
                            key={deliverable.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                                <Icon className="w-4 h-4 text-slate-500" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 text-sm">
                                  {deliverable.name}
                                </p>
                                {deliverable.link && (
                                  <a
                                    href={deliverable.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-violet-600 hover:underline truncate max-w-xs block"
                                  >
                                    {deliverable.link}
                                  </a>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={deliverable.status} />
                              {deliverable.link && (
                                <a
                                  href={deliverable.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded hover:bg-white"
                                >
                                  <ExternalLink className="w-4 h-4 text-slate-400" />
                                </a>
                              )}
                              {isAdmin && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        updateDeliverableMutation.mutate({
                                          id: deliverable.id,
                                          data: { status: "ready_for_review" },
                                        })
                                      }
                                    >
                                      Mark Ready
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-rose-600">
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Deliverable Button */}
                    {isAdmin &&
                      (phase.status === "in_progress" ||
                        phase.status === "changes_requested") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-3 text-slate-500"
                          onClick={() => {
                            setSelectedPhase(phase);
                            setShowDeliverableDialog(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Deliverable
                        </Button>
                      )}

                    {phaseDeliverables.length === 0 && (
                      <p className="text-sm text-slate-400 py-4 text-center">
                        No deliverables yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardContent className="p-6">
              {project.assigned_team?.length > 0 ? (
                <div className="space-y-4">
                  {project.assigned_team.map((member, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                        <span className="text-violet-700 font-medium">
                          {member.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {member.email}
                        </p>
                        <p className="text-sm text-slate-500 capitalize">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500">No team members assigned</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardContent className="p-6">
              {project.internal_notes ? (
                <p className="text-slate-700 whitespace-pre-wrap">
                  {project.internal_notes}
                </p>
              ) : (
                <p className="text-slate-400 text-center py-8">
                  No internal notes
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Deliverable Dialog */}
      <Dialog
        open={showDeliverableDialog}
        onOpenChange={setShowDeliverableDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Deliverable to {selectedPhase?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={deliverableForm.name}
                onChange={(e) =>
                  setDeliverableForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="e.g., Logo Concepts v1"
              />
            </div>
            <div className="space-y-2">
              <Label>Link</Label>
              <Input
                value={deliverableForm.link}
                onChange={(e) =>
                  setDeliverableForm((prev) => ({
                    ...prev,
                    link: e.target.value,
                  }))
                }
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Link Type</Label>
              <Select
                value={deliverableForm.link_type}
                onValueChange={(value) =>
                  setDeliverableForm((prev) => ({ ...prev, link_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="figma">Figma</SelectItem>
                  <SelectItem value="drive">Google Drive</SelectItem>
                  <SelectItem value="web">Web Preview</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={deliverableForm.description}
                onChange={(e) =>
                  setDeliverableForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Optional description..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeliverableDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => addDeliverableMutation.mutate()}
              disabled={
                !deliverableForm.name || addDeliverableMutation.isPending
              }
              className="bg-violet-600 hover:bg-violet-700"
            >
              {addDeliverableMutation.isPending
                ? "Adding..."
                : "Add Deliverable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Phase Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign {selectedPhase?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Team Member</Label>
              <Select
                value={selectedAssignee}
                onValueChange={setSelectedAssignee}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team member..." />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.email}>
                      {member.name} - {member.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAssignDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => assignPhaseMutation.mutate()}
              disabled={!selectedAssignee || assignPhaseMutation.isPending}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {assignPhaseMutation.isPending ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
