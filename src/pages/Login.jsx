import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@octalve.local");
  const [name, setName] = useState("Octalve Admin");
  const [role, setRole] = useState("admin");
  const [loading, setLoading] = useState(false);

  const quickFill = (r) => {
    setRole(r);
    if (r === "admin") {
      setEmail("admin@octalve.local");
      setName("Octalve Admin");
    } else {
      setEmail("client@octalve.local");
      setName("Demo Client");
    }
  };

  const onLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.auth.login({ email, full_name: name, role });
      navigate(role === "admin" ? "/OctalveDashboard" : "/ClientDashboard", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Octalve Suite</CardTitle>
          <CardDescription>
            Local login (dev scaffold). Choose Admin (Octalve) or Client.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button type="button" variant={role === "admin" ? "default" : "outline"} className="flex-1" onClick={() => quickFill("admin")}
            >
              Admin
            </Button>
            <Button type="button" variant={role === "client" ? "default" : "outline"} className="flex-1" onClick={() => quickFill("client")}
            >
              Client
            </Button>
          </div>

          <form className="space-y-4" onSubmit={onLogin}>
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-xs text-slate-500 mt-4">
            Note: In production, this will be replaced with your real invite + OTP flow.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
