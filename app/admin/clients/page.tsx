"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Mail,
  FolderKanban,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";

interface ClientProject {
  id: string;
  name: string;
  status: string;
}

interface Client {
  email: string;
  name: string;
  projects: ClientProject[];
  totalProjects: number;
  activeProjects: number;
}

interface Project {
  id: string;
  name: string;
  client_email: string;
  client_name: string;
  status: string;
}

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "" });

  const { data: allProjects = [], isLoading } = useQuery({
    queryKey: ["all-projects"],
    queryFn: () => api.projects.list(),
  });

  // Group projects by client
  const clients = allProjects.reduce((acc: Client[], project: Project) => {
    const existing = acc.find((c) => c.email === project.client_email);
    if (existing) {
      existing.projects.push({
        id: project.id,
        name: project.name,
        status: project.status,
      });
      existing.totalProjects++;
      if (project.status === "active" || project.status === "in_progress") {
        existing.activeProjects++;
      }
    } else {
      acc.push({
        email: project.client_email,
        name: project.client_name,
        projects: [
          {
            id: project.id,
            name: project.name,
            status: project.status,
          },
        ],
        totalProjects: 1,
        activeProjects:
          project.status === "active" || project.status === "in_progress"
            ? 1
            : 0,
      });
    }
    return acc;
  }, []);

  const filteredClients = clients.filter(
    (c: Client) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSave = async () => {
    // In a real app, you'd create/update a User record
    // For now, we just close the dialog
    setShowNewDialog(false);
    setEditingClient(null);
    setFormData({ name: "", email: "" });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-500 mt-1">
            Manage your client relationships
          </p>
        </div>
        <Button
          onClick={() => setShowNewDialog(true)}
          className="bg-violet-600 hover:bg-violet-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search clients by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-100">
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-violet-900">
              {clients.length}
            </p>
            <p className="text-sm text-violet-700">Total Clients</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100">
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-emerald-900">
              {clients.filter((c: Client) => c.activeProjects > 0).length}
            </p>
            <p className="text-sm text-emerald-700">Active Clients</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-blue-900">
              {allProjects.length}
            </p>
            <p className="text-sm text-blue-700">Total Projects</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
          <CardContent className="p-4">
            <p className="text-3xl font-bold text-amber-900">
              {allProjects.filter((p: Project) => p.status === "active").length}
            </p>
            <p className="text-sm text-amber-700">Active Projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Client List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Client Directory ({filteredClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                {searchQuery
                  ? "No clients found matching your search"
                  : "No clients yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredClients.map((client: Client, index: number) => (
                <motion.div
                  key={client.email}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-lg">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {client.name}
                    </h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {client.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-slate-900 flex items-center gap-1">
                        <FolderKanban className="w-4 h-4 text-violet-500" />
                        {client.totalProjects}
                      </p>
                      <p className="text-xs text-slate-500">
                        {client.activeProjects} active
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingClient(client);
                            setFormData({
                              name: client.name,
                              email: client.email,
                            });
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New/Edit Client Dialog */}
      <Dialog
        open={showNewDialog || !!editingClient}
        onOpenChange={() => {
          setShowNewDialog(false);
          setEditingClient(null);
          setFormData({ name: "", email: "" });
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingClient ? "Edit Client" : "Add New Client"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Client Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="client@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewDialog(false);
                setEditingClient(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {editingClient ? "Save Changes" : "Add Client"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
