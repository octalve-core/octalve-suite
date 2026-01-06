import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Layers,
  MessageSquare,
  HelpCircle,
  Users,
  FileText,
  BarChart3,
  Settings,
  Plus,
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        console.log("User not logged in");
      }
    };
    loadUser();
  }, []);

  const isOctalve = user?.role === "admin";

  const { data: pendingApprovals = [] } = useQuery({
    queryKey: ["pending-approvals", user?.email],
    queryFn: () => base44.entities.Approval.filter({ status: "pending" }),
    enabled: !!user,
  });

  const clientNavItems = [
    { name: "Dashboard", icon: LayoutDashboard, page: "ClientDashboard" },
    { name: "Projects", icon: FolderKanban, page: "ClientProject" },
    { name: "Phases", icon: Layers, page: "ClientPhases" },
    {
      name: "Approvals",
      icon: CheckSquare,
      page: "ClientApprovals",
      badge: pendingApprovals.length,
    },
    { name: "Support", icon: HelpCircle, page: "ClientSupport" },
  ];

  const octalveNavItems = [
    { name: "Overview", icon: LayoutDashboard, page: "OctalveDashboard" },
    { name: "Projects", icon: FolderKanban, page: "OctalveProjects" },
    { name: "Clients", icon: Users, page: "OctalveClients" },
    { name: "Templates", icon: FileText, page: "OctalveTemplates" },
    { name: "Team", icon: Users, page: "OctalveTeam" },
    { name: "Analytics", icon: BarChart3, page: "OctalveAnalytics" },
    { name: "Settings", icon: Settings, page: "OctalveSettings" },
  ];

  const navItems = isOctalve ? octalveNavItems : clientNavItems;

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 px-4 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2">
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          <span className="font-semibold text-slate-900">Octalve</span>
        </div>
        <div className="w-10" />
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <span className="font-semibold text-slate-900 text-lg">
                Octalve
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Quick Actions */}
          {isOctalve && (
            <div className="px-4 py-4">
              <Button
                onClick={() => navigate(createPageUrl("CreateProject"))}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-violet-50 text-violet-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <item.icon
                      className={cn("w-5 h-5", isActive && "text-violet-600")}
                    />
                    <span className="flex-1">{item.name}</span>
                    {item.badge > 0 && (
                      <Badge className="bg-violet-600 hover:bg-violet-600 text-white text-xs px-2 py-0.5">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                    <span className="text-slate-600 font-medium text-sm">
                      {user?.full_name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user?.full_name || "User"}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {isOctalve ? "Octalve Team" : "Client"}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 bg-white border-b border-slate-200 px-8 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search..."
                className="pl-10 w-64 bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isOctalve && pendingApprovals.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(createPageUrl("ClientApprovals"))}
                className="border-violet-200 text-violet-700 hover:bg-violet-50"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                {pendingApprovals.length} Pending Approval
                {pendingApprovals.length > 1 ? "s" : ""}
              </Button>
            )}
            {isOctalve && pendingApprovals.length > 0 && (
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-600 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingApprovals.length}
                </span>
              </Button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
