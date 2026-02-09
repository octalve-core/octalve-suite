"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { motion } from "framer-motion";
import {
  Send,
  MessageSquare,
  CheckCircle2,
  Clock,
  User,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProjectSelector from "@/components/shared/ProjectSelector";
import { format } from "date-fns";

const dummyUser = {
  email: "roji@octalve.com",
  name: "Roji",
  id: "user-1",
};

interface Phase {
  id: string;
  name: string;
  order: number;
}

interface Message {
  id: string;
  content: string;
  sender_name?: string;
  sender_email?: string;
  message_type: string;
  is_resolved: boolean;
  created_date: string;
  phase_id?: string;
}

interface Project {
  id: string;
  name: string;
}

export default function SupportPage() {
  const queryClient = useQueryClient();
  const [user] = useState(dummyUser);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>("all");
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["client-projects", user?.email],
    queryFn: () => api.projects.filter({ client_email: user?.email }),
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const project =
    projects.find((p: Project) => p.id === selectedProjectId) || projects[0];

  const { data: phases = [] } = useQuery({
    queryKey: ["project-phases", project?.id],
    queryFn: () => api.phases.filter({ project_id: project?.id }),
    enabled: !!project?.id,
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["project-messages", project?.id, selectedPhaseId],
    queryFn: async () => {
      const filter: { project_id: string; phase_id?: string } = {
        project_id: project?.id,
      };
      if (selectedPhaseId !== "all") {
        filter.phase_id = selectedPhaseId;
      }
      return api.messages.filter(filter);
    },
    enabled: !!project?.id,
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      return api.messages.create({
        project_id: project?.id,
        phase_id: selectedPhaseId !== "all" ? selectedPhaseId : undefined,
        sender_id: user.id,
        content,
        message_type: "user",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-messages"] });
      setNewMessage("");
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
  });

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessage.mutate(newMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sortedPhases = [...phases].sort(
    (a: Phase, b: Phase) => a.order - b.order,
  );
  const sortedMessages = [...messages].sort(
    (a: Message, b: Message) =>
      new Date(a.created_date).getTime() - new Date(b.created_date).getTime(),
  );

  if (loadingProjects) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Active Project
            </h3>
            <p className="text-slate-500">
              You don&apos;t have any active projects yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Support & Messages
          </h1>
          <p className="text-slate-500 mt-1">
            Communicate with your project team
          </p>
        </div>
        {projects.length > 1 && (
          <ProjectSelector
            projects={projects}
            selectedProject={project}
            onSelect={(p: Project) => setSelectedProjectId(p.id)}
          />
        )}
      </div>

      {/* Message Thread */}
      <Card className="flex flex-col h-[600px]">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Messages
            </CardTitle>
            <Select value={selectedPhaseId} onValueChange={setSelectedPhaseId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Phases</SelectItem>
                {sortedPhases.map((phase: Phase) => (
                  <SelectItem key={phase.id} value={phase.id}>
                    {phase.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadingMessages ? (
            <div className="space-y-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-16" />
              <Skeleton className="h-24" />
            </div>
          ) : sortedMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No messages yet</p>
                <p className="text-sm text-slate-400 mt-1">
                  Start a conversation with your project team
                </p>
              </div>
            </div>
          ) : (
            <>
              {sortedMessages.map((message: Message, index: number) => {
                const isOwnMessage = message.sender_email === user.email;
                const isSystem = message.message_type === "system";

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        isSystem
                          ? "bg-slate-100 text-slate-600 mx-auto text-center text-sm"
                          : isOwnMessage
                            ? "bg-violet-600 text-white rounded-br-sm"
                            : "bg-slate-100 text-slate-900 rounded-bl-sm"
                      }`}
                    >
                      {!isSystem && !isOwnMessage && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center">
                            <User className="w-3 h-3 text-slate-600" />
                          </div>
                          <span className="text-sm font-medium">
                            {message.sender_name || "Team Member"}
                          </span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <div
                        className={`flex items-center gap-2 mt-2 text-xs ${
                          isOwnMessage ? "text-violet-200" : "text-slate-400"
                        }`}
                      >
                        <span>
                          {format(
                            new Date(message.created_date),
                            "MMM d, h:mm a",
                          )}
                        </span>
                        {message.is_resolved && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Resolved
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </CardContent>

        {/* Message Input */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex gap-3">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              className="resize-none"
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || sendMessage.isPending}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {sendMessage.isPending ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </Card>
    </div>
  );
}
