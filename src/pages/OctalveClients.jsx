import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Search, Building2, Mail, FolderKanban, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import SuiteTypeBadge from "../components/shared/SuiteTypeBadge";

export default function OctalveClients() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["all-projects"],
    queryFn: () => base44.entities.Project.list("-created_date"),
  });

  // Group projects by client
  const clientsMap = projects.reduce((acc, project) => {
    const key = project.client_email;
    if (!acc[key]) {
      acc[key] = {
        email: project.client_email,
        name: project.client_name,
        projects: [],
      };
    }
    acc[key].projects.push(project);
    return acc;
  }, {});

  const clients = Object.values(clientsMap);

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name?.toLowerCase().includes(search.toLowerCase()) ||
      client.email?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Clients Grid */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client, index) => {
            const activeProjects = client.projects.filter(
              (p) => p.status === "active" || p.status === "awaiting_approval"
            ).length;
            const completedProjects = client.projects.filter(
              (p) => p.status === "completed"
            ).length;

            return (
              <motion.div
                key={client.email}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {client.name}
                        </h3>
                        <p className="text-sm text-slate-500 truncate flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {client.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-slate-500">Active</span>
                        <p className="font-semibold text-slate-900">
                          {activeProjects}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Completed</span>
                        <p className="font-semibold text-slate-900">
                          {completedProjects}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Total</span>
                        <p className="font-semibold text-slate-900">
                          {client.projects.length}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {client.projects.slice(0, 3).map((project) => (
                        <SuiteTypeBadge
                          key={project.id}
                          type={project.suite_type}
                          showIcon={false}
                        />
                      ))}
                      {client.projects.length > 3 && (
                        <span className="text-xs text-slate-500 self-center">
                          +{client.projects.length - 3} more
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Clients Found
            </h3>
            <p className="text-slate-500 mb-6">
              {search
                ? "Try adjusting your search"
                : "Clients will appear here when you create projects"}
            </p>
            {!search && (
              <Button onClick={() => navigate(createPageUrl("CreateProject"))}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Project
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
