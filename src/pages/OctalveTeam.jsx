import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Plus,
  Users,
  Mail,
  Briefcase,
  MoreVertical,
  Edit2,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

const roleConfig = {
  pm: { label: "Project Manager", color: "bg-violet-100 text-violet-700" },
  designer: { label: "Designer", color: "bg-pink-100 text-pink-700" },
  developer: { label: "Developer", color: "bg-blue-100 text-blue-700" },
  strategist: { label: "Strategist", color: "bg-amber-100 text-amber-700" },
  copywriter: { label: "Copywriter", color: "bg-emerald-100 text-emerald-700" },
};

export default function OctalveTeam() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "designer",
  });

  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => base44.entities.TeamMember.list(),
  });

  const { data: phases = [] } = useQuery({
    queryKey: ["all-phases"],
    queryFn: () => base44.entities.Phase.list(),
  });

  const createMemberMutation = useMutation({
    mutationFn: (data) => base44.entities.TeamMember.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["team-members"]);
      resetForm();
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TeamMember.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["team-members"]);
      resetForm();
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id) => base44.entities.TeamMember.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["team-members"]);
    },
  });

  const resetForm = () => {
    setShowDialog(false);
    setEditingMember(null);
    setFormData({ name: "", email: "", role: "designer" });
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role,
    });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (editingMember) {
      updateMemberMutation.mutate({ id: editingMember.id, data: formData });
    } else {
      createMemberMutation.mutate({ ...formData, active_phases_count: 0 });
    }
  };

  // Group members by role
  const membersByRole = teamMembers.reduce((acc, member) => {
    if (!acc[member.role]) acc[member.role] = [];
    acc[member.role].push(member);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team</h1>
          <p className="text-slate-500 mt-1">
            {teamMembers.length} team members
          </p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-violet-600 hover:bg-violet-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {/* Team Grid by Role */}
      {teamMembers.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(membersByRole).map(([role, members]) => {
            const config = roleConfig[role] || {
              label: role,
              color: "bg-slate-100 text-slate-700",
            };

            return (
              <div key={role}>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Badge className={config.color}>{config.label}</Badge>
                  <span className="text-sm font-normal text-slate-500">
                    ({members.length})
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map((member, index) => {
                    const isOverloaded = (member.active_phases_count || 0) > 5;

                    return (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                                  <span className="text-violet-700 font-semibold text-lg">
                                    {member.name?.charAt(0) || "T"}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-900">
                                    {member.name}
                                  </h3>
                                  <p className="text-sm text-slate-500 flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {member.email}
                                  </p>
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
                                    onClick={() => handleEdit(member)}
                                  >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      deleteMemberMutation.mutate(member.id)
                                    }
                                    className="text-rose-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-600">
                                  {member.active_phases_count || 0} active
                                  phases
                                </span>
                              </div>
                              {isOverloaded && (
                                <Badge
                                  variant="outline"
                                  className="bg-rose-50 text-rose-700 border-rose-200"
                                >
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  High load
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Team Members Yet
            </h3>
            <p className="text-slate-500 mb-6">
              Add team members to assign them to projects
            </p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Member
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={resetForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Edit Team Member" : "Add Team Member"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="email@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pm">Project Manager</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="strategist">Strategist</SelectItem>
                  <SelectItem value="copywriter">Copywriter</SelectItem>
                </SelectContent>
              </Select>
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
                !formData.email ||
                createMemberMutation.isPending ||
                updateMemberMutation.isPending
              }
              className="bg-violet-600 hover:bg-violet-700"
            >
              {editingMember ? "Save Changes" : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
