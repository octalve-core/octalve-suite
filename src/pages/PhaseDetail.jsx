import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Send,
  Figma,
  FileText,
  Globe,
  Folder,
  Lock,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import StatusBadge from "../components/shared/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const linkTypeIcons = {
  figma: Figma,
  drive: Folder,
  web: Globe,
  other: FileText,
};

export default function PhaseDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showChangesDialog, setShowChangesDialog] = useState(false);
  const [changesFeedback, setChangesFeedback] = useState("");

  const urlParams = new URLSearchParams(window.location.search);
  const phaseId = urlParams.get("id");

  useEffect(() => {
    base44.auth
      .me()
      .then(setUser)
      .catch(() => {});
  }, []);

  const isAdmin = user?.role === "admin";

  const { data: phase, isLoading: loadingPhase } = useQuery({
    queryKey: ["phase", phaseId],
    queryFn: async () => {
      const phases = await base44.entities.Phase.filter({ id: phaseId });
      return phases[0];
    },
    enabled: !!phaseId,
  });

  const { data: project } = useQuery({
    queryKey: ["project", phase?.project_id],
    queryFn: async () => {
      const projects = await base44.entities.Project.filter({
        id: phase?.project_id,
      });
      return projects[0];
    },
    enabled: !!phase?.project_id,
  });

  const { data: allPhases = [] } = useQuery({
    queryKey: ["project-phases", phase?.project_id],
    queryFn: () =>
      base44.entities.Phase.filter({ project_id: phase?.project_id }),
    enabled: !!phase?.project_id,
  });

  const { data: deliverables = [] } = useQuery({
    queryKey: ["phase-deliverables", phaseId],
    queryFn: () => base44.entities.Deliverable.filter({ phase_id: phaseId }),
    enabled: !!phaseId,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["phase-messages", phaseId],
    queryFn: () => base44.entities.Message.filter({ phase_id: phaseId }),
    enabled: !!phaseId,
  });

  const { data: approvals = [] } = useQuery({
    queryKey: ["phase-approvals", phaseId],
    queryFn: () => base44.entities.Approval.filter({ phase_id: phaseId }),
    enabled: !!phaseId,
  });

  // Sort phases and check if this phase can be approved
  const sortedPhases = [...allPhases].sort((a, b) => a.order - b.order);
  const currentPhaseIndex = sortedPhases.findIndex((p) => p.id === phaseId);
  const previousPhase =
    currentPhaseIndex > 0 ? sortedPhases[currentPhaseIndex - 1] : null;
  const canApprove = !previousPhase || previousPhase.status === "approved";

  const pendingApproval = approvals.find((a) => a.status === "pending");
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.created_date) - new Date(b.created_date)
  );

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      await base44.entities.Message.create({
        phase_id: phaseId,
        project_id: phase?.project_id,
        content,
        sender_email: user?.email,
        sender_name: user?.full_name,
        message_type: "user",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["phase-messages", phaseId]);
      setNewMessage("");
    },
  });

  const approvePhase = useMutation({
    mutationFn: async () => {
      if (pendingApproval) {
        await base44.entities.Approval.update(pendingApproval.id, {
          status: "approved",
          responded_at: new Date().toISOString(),
          responded_by: user?.email,
        });
      }
      await base44.entities.Phase.update(phaseId, {
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: user?.email,
      });
      await base44.entities.Message.create({
        phase_id: phaseId,
        project_id: phase?.project_id,
        content: `${user?.full_name || "Client"} approved this phase`,
        message_type: "system",
      });

      // Start next phase if exists
      const nextPhase = sortedPhases[currentPhaseIndex + 1];
      if (nextPhase && nextPhase.status === "not_started") {
        await base44.entities.Phase.update(nextPhase.id, {
          status: "in_progress",
        });
      }

      // Update project progress
      await updateProjectProgress();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["phase", phaseId]);
      queryClient.invalidateQueries(["phase-approvals", phaseId]);
      queryClient.invalidateQueries(["phase-messages", phaseId]);
      queryClient.invalidateQueries(["project-phases", phase?.project_id]);
      setShowApprovalDialog(false);
    },
  });

  const requestChanges = useMutation({
    mutationFn: async (feedback) => {
      if (pendingApproval) {
        await base44.entities.Approval.update(pendingApproval.id, {
          status: "changes_requested",
          responded_at: new Date().toISOString(),
          responded_by: user?.email,
          feedback,
        });
      }
      await base44.entities.Phase.update(phaseId, {
        status: "changes_requested",
      });
      await base44.entities.Message.create({
        phase_id: phaseId,
        project_id: phase?.project_id,
        content: `Changes requested: ${feedback}`,
        sender_email: user?.email,
        sender_name: user?.full_name,
        message_type: "user",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["phase", phaseId]);
      queryClient.invalidateQueries(["phase-approvals", phaseId]);
      queryClient.invalidateQueries(["phase-messages", phaseId]);
      setShowChangesDialog(false);
      setChangesFeedback("");
    },
  });

  const updateProjectProgress = async () => {
    if (!project) return;
    const approvedPhases =
      sortedPhases.filter((p) => p.status === "approved").length + 1; // +1 for current
    const totalPhases = sortedPhases.length;
    const progress = Math.round((approvedPhases / totalPhases) * 100);

    await base44.entities.Project.update(project.id, {
      progress_percentage: progress,
      status: progress === 100 ? "completed" : "active",
    });
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage);
    }
  };

  if (loadingPhase) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!phase) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Phase Not Found
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

  const getDeliverableIcon = (type) => {
    const Icon = linkTypeIcons[type] || FileText;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{phase.name}</h1>
            {phase.description && (
              <p className="text-slate-500 mt-1">{phase.description}</p>
            )}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <StatusBadge status={phase.status} />
              {phase.due_date && (
                <Badge variant="outline" className="text-slate-600">
                  Due {format(new Date(phase.due_date), "MMM d, yyyy")}
                </Badge>
              )}
              {phase.assigned_to_name && (
                <Badge variant="outline" className="text-slate-600">
                  <User className="w-3 h-3 mr-1" />
                  {phase.assigned_to_name}
                </Badge>
              )}
            </div>
          </div>
          {!isAdmin && phase.status === "awaiting_approval" && (
            <div className="flex gap-3">
              {canApprove ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowChangesDialog(true)}
                  >
                    Request Changes
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => setShowApprovalDialog(true)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve Phase
                  </Button>
                </>
              ) : (
                <Button variant="outline" disabled>
                  <Lock className="w-4 h-4 mr-2" />
                  Approve Previous Phase First
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lock Warning */}
      {!canApprove && phase.status === "awaiting_approval" && (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <Lock className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Phase Locked</AlertTitle>
          <AlertDescription className="text-amber-700">
            You need to approve "{previousPhase?.name}" before you can approve
            this phase.
            <Button
              variant="link"
              className="p-0 h-auto ml-2 text-amber-800 underline"
              onClick={() =>
                navigate(
                  createPageUrl("PhaseDetail") + `?id=${previousPhase?.id}`
                )
              }
            >
              Go to {previousPhase?.name}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deliverables */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deliverables</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {deliverables.length > 0 ? (
                <div className="space-y-3">
                  {deliverables
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((deliverable) => (
                      <motion.div
                        key={deliverable.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-violet-200 hover:bg-violet-50/30 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center
                          ${
                            deliverable.link_type === "figma"
                              ? "bg-purple-50 text-purple-600"
                              : deliverable.link_type === "drive"
                              ? "bg-blue-50 text-blue-600"
                              : deliverable.link_type === "web"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-slate-100 text-slate-600"
                          }`}
                          >
                            {getDeliverableIcon(deliverable.link_type)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {deliverable.name}
                            </p>
                            {deliverable.description && (
                              <p className="text-sm text-slate-500 mt-0.5">
                                {deliverable.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={deliverable.status} />
                          {deliverable.link && (
                            <a
                              href={deliverable.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg hover:bg-white transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-violet-600" />
                            </a>
                          )}
                        </div>
                      </motion.div>
                    ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">No deliverables added yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Approval History */}
          {approvals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Approval History</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {approvals.map((approval) => (
                    <div
                      key={approval.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-slate-50"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center
                        ${
                          approval.status === "approved"
                            ? "bg-emerald-100"
                            : approval.status === "pending"
                            ? "bg-amber-100"
                            : "bg-rose-100"
                        }`}
                      >
                        {approval.status === "approved" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : approval.status === "pending" ? (
                          <Clock className="w-4 h-4 text-amber-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 capitalize">
                          {approval.status.replace("_", " ")}
                        </p>
                        <p className="text-sm text-slate-500">
                          {approval.responded_at
                            ? `${approval.responded_by || "Unknown"} • ${format(
                                new Date(approval.responded_at),
                                "MMM d, yyyy"
                              )}`
                            : `Requested ${format(
                                new Date(
                                  approval.requested_at || approval.created_date
                                ),
                                "MMM d, yyyy"
                              )}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Chat Thread */}
        <div className="lg:col-span-1">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-slate-400" />
                Phase Thread
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <AnimatePresence>
                  {sortedMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`${
                        message.message_type === "system"
                          ? "text-center"
                          : message.sender_email === user?.email
                          ? "flex justify-end"
                          : ""
                      }`}
                    >
                      {message.message_type === "system" ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-xs text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                          {message.content}
                        </div>
                      ) : (
                        <div
                          className={`max-w-[85%] ${
                            message.sender_email === user?.email
                              ? "bg-violet-600 text-white"
                              : "bg-slate-100 text-slate-900"
                          } rounded-2xl px-4 py-2.5`}
                        >
                          <p
                            className={`text-xs mb-1 ${
                              message.sender_email === user?.email
                                ? "text-violet-200"
                                : "text-slate-500"
                            }`}
                          >
                            {message.sender_name || "Unknown"}
                          </p>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {sortedMessages.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No messages yet</p>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="min-h-[44px] max-h-32 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="shrink-0 bg-violet-600 hover:bg-violet-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Phase</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve "{phase.name}"? This will unlock
              the next phase.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApprovalDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => approvePhase.mutate()}
              disabled={approvePhase.isPending}
            >
              {approvePhase.isPending ? "Approving..." : "Confirm Approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Changes Dialog */}
      <Dialog open={showChangesDialog} onOpenChange={setShowChangesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Please describe what changes you'd like to see.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={changesFeedback}
            onChange={(e) => setChangesFeedback(e.target.value)}
            placeholder="Describe the changes needed..."
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowChangesDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => requestChanges.mutate(changesFeedback)}
              disabled={!changesFeedback.trim() || requestChanges.isPending}
            >
              {requestChanges.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
